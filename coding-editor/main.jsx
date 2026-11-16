import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {createRoot} from 'react-dom/client';
import * as ReactRedux from 'react-redux';
import * as Redux from 'redux';
import interfaceMessages from './locales/interface-sq.json';
import extensionMessages from './locales/extensions-sq.json';
import paintMessages from './locales/paint-sq.json';
import supplementalMessages from './locales/supplemental-sq.json';
import firstMission from 'virtual:lab-preview';
import sourceParts from 'virtual:lab-sources';
import {previewStorage} from './preview-storage.mjs';
import {MAX_PROJECT_BYTES,readProjectFile} from './project-file.mjs';
import './style.css';

function MissionGuide({mission,privateProject}){
 const [step,setStep]=React.useState(0),[open,setOpen]=React.useState(true);
 const review=step===mission.steps.length;
 return <section className="mission" aria-label="Udhëzuesi i misionit">
  <div className="mission-heading"><div><span className="mission-kicker">{mission.groupTitle} · Klasa 5</span><h1>{mission.title}</h1></div><button aria-expanded={open} aria-controls="mission-guide" onClick={()=>setOpen(value=>!value)}>{open?'Fshih udhëzimet':'Shfaq udhëzimet'}</button></div>
  {open&&<div id="mission-guide"><div className="mission-card"><span className="step-number" aria-hidden="true">{step+1}</span><div className="step-content" aria-live="polite" aria-atomic="true"><h2>{review?'Kontrollo punën':`Hapi ${step+1} nga ${mission.steps.length}`}</h2>{review?<><ul>{mission.criteria.map(criterion=><li key={criterion}>{criterion}</li>)}</ul><p>Ky është vetëkontroll, jo vlerësim automatik. {privateProject?'Ruaje projektin që mësuesi ta shqyrtojë.':'Shkarko projektin nëse dëshiron ta mbash.'}</p></>:<p>{mission.steps[step].split(/(«[^»]+»)/g).map((part,index)=>part.startsWith('«')?<strong key={index}>{part.slice(1,-1)}</strong>:part)}</p>}</div></div><div className="mission-navigation"><p>{mission.objective}</p><nav aria-label="Hapat e udhëzuesit"><button disabled={step===0} onClick={()=>setStep(value=>value-1)}>Mbrapa</button><progress value={step+1} max={mission.steps.length+1} aria-label="Pozicioni në udhëzues"/><button className="next-step" disabled={review} onClick={()=>setStep(value=>value+1)}>{step===mission.steps.length-1?'Kontrollo punën':'Hapi tjetër'}</button></nav></div></div>}
 </section>;
}

const bridge=new URLSearchParams(location.search).get('bridge');
const base=import.meta.env.BASE_URL;
Object.assign(window,{react:React,'react-dom':ReactDOM,'react-redux':ReactRedux,redux:Redux});
const element=document.getElementById('root');
const inheritedTheme=new URLSearchParams(location.search).get('theme');
if(inheritedTheme==='dark')document.documentElement.dataset.theme='dark';
else delete document.documentElement.dataset.theme;
const script=document.createElement('script');
script.src=base+'lab-gui.js';
script.onerror=()=>{element.textContent='Editori nuk u ngarkua. Rifresko faqen për të provuar përsëri.';};
script.onload=()=>{
 const gui=window.GUI;
 const messages={...interfaceMessages,...extensionMessages,...paintMessages,...supplementalMessages};
 const locales={...gui.localesInitialState,locale:'sq',messagesByLocale:{sq:messages},messages};
 const config={storage:previewStorage()};
 const store=Redux.createStore(Redux.combineReducers(gui.guiReducers),{locales,scratchGui:gui.buildInitialState(config)},gui.buildGuiMiddleware());
 gui.setAppElement(element);
 const Editor=gui.default;
 function Laboratory(){
  const vm=React.useRef(null),fileInput=React.useRef(null),working=React.useRef(false),changed=React.useRef(false),changeVersion=React.useRef(0),initialized=React.useRef(!bridge),saveRequest=React.useRef(null),requestId=React.useRef(0);
  const [ready,setReady]=React.useState(false),[busy,setBusy]=React.useState(false),[notice,setNotice]=React.useState(''),[error,setError]=React.useState(''),[mission,setMission]=React.useState(firstMission),[privateProject,setPrivate]=React.useState(false),[readonly,setReadonly]=React.useState(false),[connected,setConnected]=React.useState(!bridge);
  const send=React.useCallback(message=>{if(bridge)window.parent.postMessage({...message,nonce:bridge},location.origin);},[]);
  const setChanged=React.useCallback(value=>{changed.current=value;send({type:'lab:changed',changed:value});},[send]);
  React.useEffect(()=>{
   if(!ready||!bridge)return;
   const signal=()=>{if(!initialized.current)send({type:'lab:ready'});};
   signal();const timer=setInterval(signal,1000);
   return()=>clearInterval(timer);
  },[ready,send]);
  React.useEffect(()=>{
   const warn=event=>{if(changed.current){event.preventDefault();event.returnValue='';}};
   let lastActivity=0;
   const activity=event=>{if(event.isTrusted&&Date.now()-lastActivity>10000){lastActivity=Date.now();send({type:'lab:activity'});}};
   async function receive(event){
    if(event.source!==window.parent||event.origin!==location.origin||!event.data||event.data.nonce!==bridge)return;
    const message=event.data;
    if(message.type==='lab:init'&&!initialized.current&&vm.current){
     initialized.current=true;setBusy(true);setMission(message.mission);setPrivate(message.private===true);setReadonly(message.readonly===true);
     try{if(message.bytes){await readProjectFile(message.bytes);await vm.current.loadProject(message.bytes);}setChanged(false);setConnected(true);}
     catch(e){setError(e instanceof Error?e.message:'Projekti nuk u hap.');}
     finally{setBusy(false);}
    }else if(message.type==='lab:saved'&&saveRequest.current?.id===message.id){saveRequest.current.resolve();saveRequest.current=null;}
    else if(message.type==='lab:save-error'&&saveRequest.current?.id===message.id){saveRequest.current.reject(new Error(message.error));saveRequest.current=null;}
    else if(message.type==='lab:error')setError(message.error);
   }
   window.addEventListener('beforeunload',warn);window.addEventListener('message',receive);document.addEventListener('pointerdown',activity,true);document.addEventListener('keydown',activity,true);
   return()=>{window.removeEventListener('beforeunload',warn);window.removeEventListener('message',receive);document.removeEventListener('pointerdown',activity,true);document.removeEventListener('keydown',activity,true);};
  },[send,setChanged]);
  function initialize(machine){
   vm.current=machine;
   machine.on('PROJECT_CHANGED',()=>{changeVersion.current++;setChanged(true);});
   if(import.meta.env.DEV)window.codingLab={store,vm:machine};
  }
  async function run(action){
   if(working.current||!ready||!connected)return;
   working.current=true;setBusy(true);setNotice('');setError('');
   try{await action();}catch(e){setError(e instanceof Error?e.message:'Provo përsëri.');}
   finally{working.current=false;setBusy(false);}
  }
  function save(){void run(async()=>{
   const version=changeVersion.current;
   const blob=await vm.current.saveProjectSb3();
   if(blob.size>MAX_PROJECT_BYTES)throw new Error('Projekti është më i madh se 10 MB. Hiq materialet e panevojshme.');
   const bytes=await readProjectFile(await blob.arrayBuffer());
   await new Promise((resolve,reject)=>{
    const id=++requestId.current;
    const timer=setTimeout(()=>{saveRequest.current=null;reject(new Error('Ruajtja nuk u konfirmua. Provo përsëri; mos e mbyll projektin.'));},45000);
    saveRequest.current={id,resolve:()=>{clearTimeout(timer);resolve();},reject:e=>{clearTimeout(timer);reject(e);}};
    send({type:'lab:save',id,bytes});
   });
   if(changeVersion.current===version)setChanged(false);
   setNotice(changeVersion.current===version?'Projekti u ruajt privatisht.':'Projekti u ruajt. Ke ndryshime të reja që duhen ruajtur.');
  });}
  function download(){void run(async()=>{
   const version=changeVersion.current,blob=await vm.current.saveProjectSb3();
   if(blob.size>MAX_PROJECT_BYTES)throw new Error('Projekti është më i madh se 10 MB. Hiq materialet e panevojshme.');
   const url=URL.createObjectURL(blob),link=document.createElement('a');
   link.href=url;link.download='projekti-im.sb3';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
   if(!privateProject&&changeVersion.current===version)setChanged(false);
   setNotice('Skedari u përgatit për shkarkim. Kjo nuk është ruajtje në server.');
  });}
  async function openFile(event){
   const file=event.target.files?.[0];event.target.value='';if(!file)return;
   if(changed.current&&!window.confirm('Të zëvendësohet projekti aktual? Ruaje ose shkarkoje fillimisht.'))return;
   await run(async()=>{
    if(!/\.sb3$/i.test(file.name)||file.size>MAX_PROJECT_BYTES)throw new Error('Zgjidh një projekt .sb3 deri në 10 MB.');
    const bytes=await readProjectFile(await file.arrayBuffer());await vm.current.loadProject(bytes);setChanged(privateProject);setNotice('Projekti u hap nga kompjuteri.');
   });
  }
  function reset(){
   if(!window.confirm('Të fillojë një projekt i ri? Ruaje ose shkarkoje projektin aktual përpara zëvendësimit.'))return;
   void run(async()=>{
    const storage=previewStorage().scratchStorage,asset=await storage.load(storage.AssetType.Project,'0',storage.DataFormat.JSON);
    for(const target of JSON.parse(new TextDecoder().decode(asset.data)).targets)for(const item of [...target.costumes,...target.sounds]){const cached=storage.get(item.assetId);config.storage.scratchStorage.builtinHelper._store(cached.assetType,cached.dataFormat,cached.data,cached.assetId);}
    await vm.current.loadProject(asset.data);setChanged(privateProject);setNotice('Projekti i ri u hap.');
   });
  }
  return <div className="laboratory">
   <header className="lab-header"><div><strong>Laboratori i Kodimit</strong><span>Mendje të Zgjuara · {readonly?'Shqyrtim pa ndryshuar projektin e nxënësit':privateProject?'Projekti yt privat':'Misioni i parë publik'}</span></div><nav aria-label="Veprimet e projektit">{!readonly&&<><button className="lab-action-secondary" disabled={!ready||busy||!connected} onClick={reset}>Projekt i ri</button><button className="lab-action-secondary" disabled={!ready||busy||!connected} onClick={()=>fileInput.current.click()}>Hap projekt</button></>}{privateProject&&!readonly&&<button className="lab-action-primary" disabled={!ready||busy||!connected} onClick={save}>Ruaj projektin</button>}<button className="lab-action-secondary" disabled={!ready||busy||!connected} onClick={download}>Shkarko projektin</button></nav><input ref={fileInput} type="file" accept=".sb3" hidden onChange={openFile}/></header>
   <MissionGuide key={mission.id} mission={mission} privateProject={privateProject}/>
   {!connected&&!error&&<p role="status" className="message">Po hapim projektin…</p>}{error&&<p role="alert" className="message error">{error}</p>}{notice&&<p role="status" className="message">{notice}</p>}
   <main className="editor-scroll" aria-label="Hapësira e kodimit"><div className="editor-root"><ReactRedux.Provider store={store}><Editor projectId={gui.defaultProjectId} menuBarHidden canChangeLanguage={false} canSave={false} canUseCloud={false} canShare={false} enableCommunity={false} isTelemetryEnabled={false} onVmInit={initialize} onProjectLoaded={()=>{setChanged(false);setReady(true);}} assetHost={location.origin+base} projectHost={location.origin+base}/></ReactRedux.Provider></div></main>
   <footer><span>{readonly?'Ndryshimet gjatë shqyrtimit nuk mund të ruhen mbi projektin e nxënësit.':privateProject?'Shtyp «Ruaj projektin» për ta ruajtur privatisht.':'Prova publike nuk ruan në server.'} Në ekrane të vegjël, lëviz brenda hapësirës së editorit.</span><details><summary>Licenca dhe burimi</summary><p>Ky laborator përdor editorin Scratch 3 të Scratch Foundation, me përshtatje dhe përkthime në shqip. Nuk është produkt zyrtar i Scratch Foundation.</p><p>Editorin dhe përshtatjet e tij i mbulon GNU AGPL v3. <a href={base+'licenses/AGPL-3.0.txt'}>Licenca</a> · <a href={base+'licenses/TRADEMARK.txt'}>Markat</a> · <a href={base+'licenses/editor-dependencies.txt'}>Njoftimet e varësive</a> · {sourceParts.map((part,index)=><React.Fragment key={part}>{index>0&&' · '}<a href={base+part}>Burimi · Pjesa {index+1}</a></React.Fragment>)} · <a href="https://github.com/scratchfoundation/scratch-editor">Burimi zyrtar</a></p><p>Shkarko të gjitha pjesët e burimit dhe hapi në të njëjtën dosje.</p></details></footer>
  </div>;
 }
 createRoot(element).render(<Laboratory/>);
};
document.head.appendChild(script);
