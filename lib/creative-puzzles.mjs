import {tangramLayouts} from './tangram-layouts.mjs';
import {tangramPieces as pieces} from './tangram-pieces.mjs';
import {storyModels as stories} from './story-models.mjs';
// SERVER ONLY. Original lesson models, deterministic progression and hidden answers.
import {drawTrace,polygonAt} from './creative-rules.mjs';
const actions=[{id:'jump',label:'Kërce'},{id:'wave',label:'Përshëndet'},{id:'spin',label:'Rrotullohu'},{id:'sleep',label:'Fli'},{id:'grow',label:'Zmadhohu'},{id:'move',label:'Ec'}];
export function creativePuzzle(lesson,level){
 const grade=lesson.grade,kind=lesson.domain,band=Math.floor((level-1)/5),seed=(level-1)%5;let b={kind,grade,band,level},a,visual='';
 if(kind==='color'){
  const colors=['#f46b64','#55a8e5','#f5cd47','#65bc81','#b28cdd','#f09ac0','#e99945','#49c5bb','#b48a63','#a7b5c4'],names=['E kuqe','Blu','E verdhë','E gjelbër','Vjollcë','Rozë','Portokalli','Turkeze','Kafe','Gri'];
  const letters=['A','B','C','Ç','D','E','Ë','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','Y','Z'];
  const count=Math.min(10,3+band+(grade===2?2:0)),letterMode=level%2===0;
  const palette=Array.from({length:count},(_,i)=>({symbol:letterMode?letters[(i+seed*3+band)%letters.length]:String(i+1),color:colors[(i+seed)%10],name:names[(i+seed)%10]}));
  // Keep the workload growing through band boundaries (1–30), not cycling
  // back to a shorter exercise every fifth level.
  const length=(grade===1?6:12)+level-1;
  a=Array.from({length},(_,i)=>(i+Math.floor(i/count)+level)%count);
  b={...b,palette,cells:a.map(k=>({symbol:palette[k].symbol})),columns:grade===1?4:6};
  visual=letterMode?'Ngjyros shkronjat sipas çelësit poshtë tabelës.':'Ngjyros numrat sipas çelësit poshtë tabelës.';
 }
 if(kind==='draw'){
  // The five levels in a band vary the route; each new band adds a segment
  // and a longer stroke, so the drawing never gets shorter at a boundary.
  const size=grade===4?20:16,start=[1+Math.floor(seed/4),10],direction=seed%4,segments=grade+band,len=1+band,program=[];
  let facing=direction;
  for(let i=0;i<segments;i++){
   const next=i%2===1?1:i%4===0?0:2;
   const turn=(next-facing+4)%4;if(turn===3)program.push({op:'left',n:1});else if(turn)program.push({op:'right',n:turn});
   program.push({op:'forward',n:i%2===0?len:grade});facing=next;
  }
  b={...b,size,start,direction,maxCommands:24,target:[]};b.target=drawTrace(b,program);a=program;
  visual=grade===1?'Ndiq vijën me hapa dhe kthesa.':'Ndërto modelin me komandat e lapsit. Një numër përsërit veprimin.';
 }
 if(kind==='events'){
  const count=Math.min(6,grade+band),code=level-1+(grade-1)*30,eventNames=['Kur prek arushin','Kur prek lepurin','Kur shtyp diellin','Kur bie zilja','Kur miqtë takohen','Kur fillon nata'];
  const goals=Array.from({length:count},(_,i)=>Math.floor(code/6**i)%6);
  b={...b,events:goals.map((action,i)=>({id:`e${i}`,label:eventNames[i],actor:i%2,trigger:['bear','rabbit','sun','bell','meet','night'][i],goal:actions[action].label})),actions};a=goals.map(i=>actions[i].id);visual='Prek arushin, lepurin ose diellin për të provuar ngjarjen. Provo edhe zilen dhe shiko si takohen miqtë e si bie nata.';
 }
 if(kind==='story'){
  const count=Math.min(4,grade+Math.floor(band/2));const frames=[];a=[];
  for(let i=0;i<count;i++){
   const storyIndex=(level-1+(grade-1)*13+i*(grade+4))%stories.length,s=stories[storyIndex];
   const reasonTask=grade>=3&&band>=2||grade===2&&band>=4;
   const options=[{id:'help',label:reasonTask?s.evidence:s.right,response:s.why},...s.wrong.map((label,k)=>({id:`other${k}`,label:reasonTask?(k===0?'Arushi mban një kapelë.':'Miqtë nuk kanë nevojë për një plan.'):label,response:'Miqtë ndalen dhe mendojnë për një mënyrë tjetër.'}))];
   const rotated=[...options.slice((level+i)%3),...options.slice(0,(level+i)%3)];
   const correctId=rotated.findIndex(o=>o.id==='help');
   const safeOptions=rotated.map((o,k)=>({...o,id:`o${k}`}));
   frames.push({scene:s.scene,text:s.text+(grade>=3&&band>=3?' Mendohu edhe për pasojat që veprimi mund të ketë për miqtë.':''),question:reasonTask?'Cila e dhënë nga historia të ndihmon të zgjedhësh veprimin?':s.question,options:safeOptions});a.push(`o${correctId}`);
  }
  b={...b,story:frames};visual='Lexo, zgjidh dhe ndiq historinë. Mund ta ndryshosh zgjedhjen përpara kontrollit.';
 }
 if(kind==='objects'){
  const groups=grade===1?[1,1,2,2,3,4][band]:grade===2?[2,2,3,3,4,4][band]:[1,2,2,3,3,4][band],unit=grade<=2?1:grade===3?10:100;
  const base=grade===1?level:grade===2?level+5:(level+2)*unit+seed+1;
  const stride=(band+1+(grade===2?1:0))*unit;
  const goals=Array.from({length:groups},(_,i)=>base+i*stride);
  const tokens=[];a=[];
  goals.forEach((goal,i)=>{let rest=goal;const bundle=grade===1&&band>=2?5:grade===2&&band>=3?10:grade>=3&&band>=3?5*unit:unit;for(const value of [...new Set([bundle,unit,1])])while(rest>=value){tokens.push({id:`t${tokens.length}`,value});a.push(i);rest-=value;}});
  b={...b,tokens,goals,labels:goals.map((n,i)=>`Shporta ${i+1}: ${n}`)};visual=grade<=2?'Vendos sasinë e kërkuar në secilën shportë.':'Një bllok ka vlerën e shënuar: njësi, dhjetëshe ose qindëshe.';
 }
 if(kind==='tangram'){
  const transforms=tangramLayouts[grade-1][level-1].transforms;
  b={...b,size:12,pieces,silhouette:pieces.map((p,i)=>polygonAt(p,transforms[i])),initial:pieces.map((_,i)=>({x:2+(i%3)*3,y:6+Math.floor(i/3)*2,turn:(i+level)%4}))};a=transforms;
  visual=band===0?'Bashko shtatë pjesët. Vijat e brendshme të ndihmojnë.':'Mbulo siluetën me shtatë pjesë pa mbivendosje. Pjesët mund të ndërrojnë vende.';
 }
 if(kind==='rules'){
  const count=Math.min(4,1+band),figCount=Math.min(9,2+level),colors=['#ec707b','#55a5e4','#e7b342'],shapes=['circle','square','triangle'];a=[];
  let state=grade*1747+level*941;const random=()=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return state/4294967296;};
  const rounds=Array.from({length:count},(_,r)=>{
   const mode=r===0?grade===1?seed%2:grade===2?2:grade===3?3:4:(seed+r)%(grade===1?2:grade===2?3:grade===3?4:5);
   const figures=Array.from({length:figCount},(_,i)=>({id:`r${r}f${i}`,color:colors[Math.floor(random()*3)],shape:shapes[Math.floor(random()*3)],number:1+Math.floor(random()*(grade<=2?10:grade===3?20:50))}));
   if(mode>=3){figures[0]={...figures[0],color:colors[0],shape:'triangle',number:2*(1+Math.floor(random()*4))};figures[1]={...figures[1],color:colors[1],shape:'circle',number:3};}
   const labels=mode===0?['Rozë','Blu','E verdhë']:mode===1?['Rreth','Katror','Trekëndësh']:mode===2?['Tek','Çift']:mode===3?['Rozë dhe trekëndësh','Figurat e tjera']:['Rozë, trekëndësh dhe çift','Figurat e tjera'];
   a.push(figures.map(f=>mode===0?colors.indexOf(f.color):mode===1?shapes.indexOf(f.shape):mode===2?(f.number%2?0:1):f.color===colors[0]&&f.shape==='triangle'&&(mode===3||f.number%2===0)?0:1));
   return {rule:mode===0?'Rendit sipas ngjyrës':mode===1?'Rendit sipas formës':mode===2?'Rendit sipas numrit: tek ose çift':mode===3?'Zgjidh figurat që janë njëkohësisht rozë dhe trekëndësh':'Zgjidh trekëndëshat rozë që kanë numër çift',labels,figures};
  });b={...b,rounds};visual='Rregulli ndryshon. Lexo kërkesën në çdo raund dhe vendos çdo figurë në grup.';
 }
 return {id:`${lesson.id}-level-${level}`,grade,cat:lesson.category,type:'creative',interaction:{creative:b},options:[],answer:JSON.stringify(a),title:`${lesson.title} · Niveli ${level}`,visual,lessonId:lesson.id,lessonLevel:level,gameLevel:level,level:Math.min(3,1+Math.floor((level-1)/10)),difficultyBand:band+1,hint:kind==='tangram'?'Krahaso skajet e pjerrëta. Dy trekëndësha të vegjël kanë të njëjtën sipërfaqe si katrori.':kind==='draw'?'Nis te pika. Numëro katrorët deri te kthesa e parë.':'Merre një kërkesë në një kohë. Provo zgjedhjen dhe krahasoje me objektivin.',explain:kind==='story'?b.story.map((s,i)=>s.options.find(o=>o.id===a[i]).response).join(' '):kind==='objects'?'Çdo shportë ka shumën e kërkuar të vlerave të sendeve.':kind==='tangram'?'Shtatë pjesët mbulojnë siluetën pa boshllëqe ose mbivendosje.':'Zgjidhja përputhet me të gjitha kërkesat e misionit.'};
}
