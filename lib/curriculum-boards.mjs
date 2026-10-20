import {scenarioSeed} from './scenario-seeds.mjs';
import {pipePath} from './interactive-puzzles.mjs';
// Original interactive curriculum boards. Solutions stay in this server module.
const assets=['apple','pear','owl','turtle','rabbit','flower','star','book','carrot'];
const names=['Molla','Dardha','Bufi','Breshka','Lepuri','Lulja','Ylli','Libri','Karota'];
function random(seed){let state=seed;return()=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return state/4294967296;};}
function shuffle(items,rng){const a=[...items];for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
export function memoryBoard(grade,variant,level){
 const band=Math.floor((level-1)/5),size=grade===1?3:4,count=Math.min(8,grade+1+Math.floor(band/2)),rng=random(grade*901+variant*71+level*37),positions=shuffle(Array.from({length:size*size},(_,i)=>i),rng).slice(0,count);
 const chosen=shuffle(assets,rng).slice(0,count),tokens=chosen.map((asset,i)=>({id:'t'+i,asset,label:names[assets.indexOf(asset)],...(grade===4?{rotation:((level+i)%4)*90}:{}),...(asset==='flower'?{quantity:5}:{} )}));
 const answer=Array(size*size).fill('_');positions.forEach((pos,i)=>answer[pos]=tokens[i].id);
 return {type:'placement',title:'Mbaj mend figurat dhe rikrijo vendet.',visual:'',options:[],interaction:{scene:'memory-grid',size,tokens:shuffle(tokens,rng),targets:answer.map((_,i)=>({id:'s'+i,label:`Rreshti ${Math.floor(i/size)+1}, kolona ${i%size+1}`})),preview:tokens.map((t,i)=>({...t,position:positions[i]})),previewSeconds:Math.max(5,13-grade-band)},answer:JSON.stringify(answer),hint:`Mbaj mend ${count} figura dhe vendos secilën sipas rreshtit e kolonës në rrjetin ${size}×${size}.`,hint2:`Rikujto fillimisht rreshtin, pastaj kolonën e secilës figurë; vendet pa figurë lëri bosh.`,explain:`Rikrijo ${count} pozicionet në rrjetin ${size}×${size}; vendet e tjera mbeten bosh.`};
}
export function shapeBoard(grade,variant,level){
 const band=Math.floor((level-1)/5),count=Math.min(7,2+grade+Math.floor(band/2)),rng=random(grade*811+variant*97+level*53),chosen=shuffle(assets,rng).slice(0,count),tokens=chosen.map((asset,i)=>({id:'t'+i,asset,label:names[assets.indexOf(asset)],rotation:grade===1?0:((level+i+variant)%4)*90})),ordered=shuffle(tokens,rng);
 return {type:'placement',title:'Përputh figurën me formën dhe drejtimin.',visual:'',options:[],interaction:{scene:'shadows',tokens:shuffle(tokens,rng),targets:ordered.map((t,i)=>({id:'s'+i,label:`Hija ${i+1}`,cue:t.asset,rotation:t.rotation,silhouette:true}))},answer:JSON.stringify(ordered.map(t=>t.id)),hint:'Krahaso veshët, bishtin dhe drejtimin e secilës figurë.',explain:'Çdo figurë ruan formën dhe drejtimin e hijes së saj.'};
}
export function pipeBoard(grade,variant,level){
 const band=Math.floor((level-1)/5),size=Math.min(5,grade+1+Math.floor(band/2)),rng=random(grade*307+variant*83+level*61+scenarioSeed(`curriculum-g${grade}-spatial-${variant+1}-level-${level}`)*1009),count=size*size;
 const path=pipePath(size,rng);
 const pipes=Array.from({length:count},(_,i)=>({id:'t'+i,exits:[],rotation:Math.floor(rng()*4)}));
 for(let i=0;i<path.length;i++)for(const next of [path[i-1],path[i+1]].filter(x=>x!==undefined)){const diff=next-path[i];pipes[path[i]].exits.push(diff===-size?0:diff===1?1:diff===size?2:3);}
 return {type:'pipes',title:'Rrotullo tubat dhe lidh rrjetin e ujit.',visual:'',options:[],interaction:{scene:'pipes',size,pipes,start:path[0],end:path.at(-1)},answer:JSON.stringify(pipes.map(()=>0)),hint:'Çdo dalje duhet të lidhet me hyrjen e fqinjit; fillo nga burimi.',explain:'Një rrjet i lidhur ka të gjitha tubat në rrugën e ujit, pa dalje jashtë tabelës.'};
}
export function mazeBoard(grade,variant,level){
 const band=Math.floor((level-1)/5),size=Math.min(13,3+2*grade+2*Math.floor(band/2)),rng=random(grade*997+variant*131+level*67+scenarioSeed(`curriculum-g${grade}-spatial-${variant+1}-level-${level}`)*1009),distance=3+grade+level;
 const neighbour=(p,d)=>{const x=p%size,y=Math.floor(p/size);return d===0?(y?p-size:-1):d===1?(x<size-1?p+1:-1):d===2?(y<size-1?p+size:-1):(x?p-1:-1);};
 for(let attempt=0;attempt<120;attempt++){
  const cells=Array(size*size).fill('#'),stack=[0],visited=new Set([0]);cells[0]='.';
  while(stack.length){const p=stack.at(-1);let next=-1,middle=-1;for(const d of shuffle([0,1,2,3],rng)){const m=neighbour(p,d),n=m<0?-1:neighbour(m,d);if(n>=0&&!visited.has(n)){next=n;middle=m;break;}}if(next<0){stack.pop();continue;}visited.add(next);cells[next]=cells[middle]='.';stack.push(next);}
  const queue=[[0]],seen=new Set([0]);let answer;
  while(queue.length){const route=queue.shift(),p=route.at(-1);if(route.length===distance+1){answer=route;break;}for(let d=0;d<4;d++){const n=neighbour(p,d);if(n>=0&&cells[n]==='.'&&!seen.has(n)){seen.add(n);queue.push([...route,n]);}}}
  if(!answer)continue;
  return {type:'maze',title:'Gjej rrugën për te mbërritja.',visual:'',options:[],interaction:{scene:'maze',size,cells,start:0,end:answer.at(-1)},answer:JSON.stringify(answer),hint:'Në një kryqëzim, shiko degët. Kthehu prapa kur rruga mbyllet.',explain:'Rruga kalon vetëm në korridore dhe arrin te mbërritja. Kthimi prapa është i lejuar.'};
 }
 throw new Error('Maze distance unavailable');
}
export function numberPlacement(p,grade,level,variant){
 const result=Number(p.answer),offset=grade===1?1:1+Math.floor((level-1)/5),values=[result,result+offset,result+offset+1,result>offset?result-offset:result+offset+2];
 const tokens=values.map((quantity,i)=>({id:'n'+i,asset:'number',quantity,label:String(quantity)})),rng=random(level*113+grade*71+variant*43);
 return {...p,type:'placement',visual:'',interaction:{scene:'garden',tokens:shuffle(tokens,rng),targets:[{id:'s0',label:p.visual||p.title}]},options:[],answer:JSON.stringify(['n0'])};
}
