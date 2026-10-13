// Audit utility: no IDs, names, grade tags, level counters or tray shuffle count
// as a new exercise. This file is used by checks, not by the student client.
import {tangramShapeKey} from './tangram-pieces.mjs';
function clean(value,key='',kind=''){
 if(Array.isArray(value)){
  const values=value.map(v=>clean(v,'',kind));
  if(['tokens','options','actions','events','figures'].includes(key))values.sort((a,b)=>JSON.stringify(a).localeCompare(JSON.stringify(b)));
  if(key==='preview'&&values.every(v=>v&&typeof v==='object'&&'position' in v))values.sort((a,b)=>a.position-b.position);
  return values;
 }
 if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).filter(([k])=>!['id','grade','band','level','previewSeconds','maxCommands','response'].includes(k)&&(!['color','name'].includes(k)||['color','rules'].includes(kind))).sort(([a],[b])=>a.localeCompare(b)).map(([k,v])=>[k,clean(v,k,kind)]));
 return value;
}
export function challengeFingerprint(p){
 const creative=p.interaction?.creative;
 if(creative?.kind==='tangram')return JSON.stringify({type:'tangram',shape:tangramShapeKey(creative.silhouette)});
 const match=/ · Niveli \d+(?::\s*([\s\S]*))?$/.exec(p.title||'');
 const boardOnly=['robot','maze','pipes'].includes(p.type)||['memory-grid','shadows','path'].includes(p.interaction?.scene);
 const instruction=creative||boardOnly?'':match?match[1]||'':p.title||'';
 let interaction=p.interaction;
 if(creative?.kind==='rules')interaction={creative:{kind:'rules',rounds:creative.rounds.map(r=>({...r,figures:r.figures.map(f=>r.rule.includes('ngjyrës')?{color:f.color}:r.rule.includes('formës')?{shape:f.shape}:r.rule.includes('tek ose çift')?{number:f.number}:{color:f.color,shape:f.shape,...(r.rule.includes('numër çift')?{number:f.number}:{})})}))}};
 if(p.type==='pipes')interaction={...interaction,pipes:interaction.pipes.map(t=>({exits:t.exits.map(d=>(d+t.rotation)%4).sort()}))};
 return JSON.stringify(clean({type:p.type||'choice',memory:!!p.memory,instruction,visual:boardOnly?'':p.visual||'',options:p.options||[],interaction},'',creative?.kind));
}
