'use client';
import {useEffect,useRef,useState} from 'react';
import {CODING_MISSIONS} from '../lib/coding-missions.mjs';
import './coding-editor.css';

type Api=<T>(path:string,method?:string,data?:unknown)=>Promise<T>;
type Scope={class:string;mission:string;profile?:string};
type Launch={mission:{id:string;title:string;objective:string;steps:string[];criteria:string[]};readonly:boolean;project:{revision:number}|null};
export function CodingEditor({api,scope,onClose}:{api?:Api;scope?:Scope;onClose:()=>void}){
 const frame=useRef<HTMLIFrameElement>(null),dirty=useRef(false),saving=useRef(false),initialized=useRef(false),activity=useRef(0),revision=useRef(0),closeRef=useRef<()=>void>(()=>{});
 const [nonce]=useState(()=>crypto.randomUUID()),[launch,setLaunch]=useState<Launch|null>(null),[error,setError]=useState('');
 const query=scope?new URLSearchParams(scope).toString():'';
 const theme=typeof document!=='undefined'&&document.documentElement.dataset.theme==='dark'?'dark':'light';
 useEffect(()=>{closeRef.current=()=>{if(saving.current){setError('Prit përfundimin e ruajtjes.');return;}if(!dirty.current||confirm('Ke ndryshime të paruajtura. Të mbyllet laboratori?'))onClose();};},[onClose]);
 useEffect(()=>{
  let active=true;
  const load=scope&&api?api<Launch>('/api/coding?'+query):Promise.resolve({mission:CODING_MISSIONS[0] as Launch['mission'],readonly:false,project:null});
  void load.then(result=>{if(active)setLaunch(result);}).catch(e=>{if(active)setError(e instanceof Error?e.message:'Provo përsëri.');});
  return()=>{active=false;};
 },[api,query,scope]);
 useEffect(()=>{
  if(!launch)return;
  const configuration=launch;
  let active=true;
  const send=(message:object)=>frame.current?.contentWindow?.postMessage({...message,nonce},'*');
  const close=()=>closeRef.current();
  async function receive(event:MessageEvent){
   if(event.source!==frame.current?.contentWindow||event.origin!=='null'||!event.data||event.data.nonce!==nonce)return;
   const message=event.data;
   if(message.type==='lab:close'){
    close();
   }else if(message.type==='lab:ready'&&!initialized.current){
    initialized.current=true;
    try{
     const result=scope&&api?await api<{bytes:ArrayBuffer|null;revision:number}>('/api/coding-project?'+query,'PROJECT_LOAD'):{bytes:null,revision:0};
     if(!active)return;
     revision.current=result.revision;
     send({type:'lab:init',mission:configuration.mission,readonly:configuration.readonly,private:!!scope,bytes:result.bytes});
    }catch(e){if(active){setError(e instanceof Error?e.message:'Provo përsëri.');send({type:'lab:error',error:'Projekti nuk u hap. Mbylle laboratorin dhe provo përsëri.'});}}
   }else if(message.type==='lab:changed'&&typeof message.changed==='boolean')dirty.current=message.changed;
   else if(message.type==='lab:activity'&&scope&&api&&Date.now()-activity.current>240000){
    activity.current=Date.now();
    void api('/api/coding?'+query).catch(e=>{if(active){setError(e instanceof Error?e.message:'Hyrja ka ndryshuar.');send({type:'lab:error',error:'Hyrja ose leja ndryshoi. Shkarko punën tënde përpara daljes.'});}});
   }else if(message.type==='lab:save'&&scope&&api&&!configuration.readonly&&!saving.current&&message.bytes instanceof ArrayBuffer&&message.bytes.byteLength>0&&message.bytes.byteLength<=10*1024*1024&&Number.isSafeInteger(message.id)){
    saving.current=true;
    try{
     const result=await api<{revision:number}>('/api/coding-project?'+query+'&revision='+revision.current,'PROJECT_SAVE',message.bytes);
     if(!active)return;
     revision.current=result.revision;send({type:'lab:saved',id:message.id});
    }catch(e){if(active)send({type:'lab:save-error',id:message.id,error:e instanceof Error?e.message:'Projekti nuk u ruajt. Provo përsëri.'});}
    finally{saving.current=false;}
   }
  }
  const warn=(event:BeforeUnloadEvent)=>{if(dirty.current){event.preventDefault();event.returnValue='';}};
  window.addEventListener('message',receive);window.addEventListener('beforeunload',warn);
  return()=>{active=false;window.removeEventListener('message',receive);window.removeEventListener('beforeunload',warn);};
 },[api,launch,nonce,query,scope]);
 return <section className="coding-overlay" role="dialog" aria-modal="true" aria-label="Laboratori i Kodimit"><header><strong>{launch?.mission.title||'Laboratori i Kodimit'}</strong><button className="secondary" onClick={()=>closeRef.current()}>Mbyll laboratorin</button></header>{error&&<p role="alert" className="error">{error}</p>}{launch?<iframe ref={frame} title="Editori i Laboratorit të Kodimit" src={'/coding-lab/index.html?bridge='+nonce+'&theme='+theme} sandbox="allow-scripts allow-downloads allow-modals" allow="camera 'none'; microphone 'none'; usb 'none'" referrerPolicy="no-referrer"/>:!error&&<p role="status">Po hapim laboratorin…</p>}</section>;
}
