// SERVER ONLY. Original lesson models, deterministic progression and hidden answers.
import {drawTrace,polygonAt} from './creative-rules.mjs';
const actions=[{id:'jump',label:'Kërce'},{id:'wave',label:'Përshëndet'},{id:'spin',label:'Rrotullohu'},{id:'sleep',label:'Fli'},{id:'grow',label:'Zmadhohu'},{id:'move',label:'Ec'}];
const stories=[
 {scene:'garden',text:'Arushi mbolli një farë në një vazo. Dheu është i thatë.',question:'Çfarë i duhet farës tani?',right:'Pak ujë',wrong:['Një kapelë','Një kuti e mbyllur'],why:'Uji lag dheun dhe ndihmon farën të rritet.'},
 {scene:'bridge',text:'Lepuri dhe arushi duan të kalojnë një urë të ngushtë. Ka vend vetëm për njërin.',question:'Si mund të kalojnë të dy?',right:'Njëri pret, tjetri kalon',wrong:['Kalojnë të dy njëkohësisht','Shtyjnë njëri-tjetrin'],why:'Radha u lejon të dyve të kalojnë me kujdes.'},
 {scene:'rain',text:'Retë u errësuan dhe filluan pika shiu. Lepuri ka një libër në dorë.',question:'Si mund ta ruajë librin?',right:'E fut në çantë dhe gjen strehë',wrong:['E lë mbi bar','E hap drejt shiut'],why:'Streha dhe çanta e mbrojnë librin nga uji.'},
 {scene:'picnic',text:'Në piknik janë katër miq. Arushi solli katër mollë.',question:'Si t’i ndajë që secili të marrë një?',right:'I jep një mollë secilit',wrong:['I jep të gjitha një miku','I mban të gjitha'],why:'Katër mollë për katër miq japin nga një për secilin.'},
 {scene:'lost',text:'Arushi gjeti një laps me emrin e lepurit. Lepuri po kërkon diçka.',question:'Cili veprim e ndihmon?',right:'Ia kthen lapsin dhe e pyet',wrong:['E fsheh lapsin','Largohet me lapsin'],why:'Emri është një e dhënë; pyetja dhe kthimi ndihmojnë pronarin.'},
 {scene:'team',text:'Dy miq ndërtojnë një kullë. Njëri vendos kubat, tjetri i gjen.',question:'Çfarë do ta ndihmonte punën?',right:'Flasin dhe ndajnë detyrat',wrong:['Ndryshojnë planin pa folur','Marrin të njëjtin kub nga njëri-tjetri'],why:'Një plan i përbashkët ndihmon bashkëpunimin.'}
];
const pieces=[[[0,0],[4,0],[2,2]],[[0,0],[2,2],[0,4]],[[0,0],[0,2],[-2,2]],[[0,0],[1,-1],[2,0]],[[0,0],[2,0],[1,1]],[[0,0],[1,-1],[2,0],[1,1]],[[0,0],[1,-1],[2,-2],[2,0]]];
const square=[{x:0,y:0,turn:0},{x:0,y:0,turn:0},{x:4,y:0,turn:0},{x:0,y:4,turn:0},{x:2,y:2,turn:0},{x:1,y:3,turn:0},{x:2,y:4,turn:0}];
export function creativePuzzle(lesson,level){
 const grade=lesson.grade,kind=lesson.domain,band=Math.floor((level-1)/5),seed=(level-1)%5;let b={kind,grade,band,level},a,visual='';
 if(kind==='color'){
  const colors=['#f46b64','#55a8e5','#f5cd47','#65bc81','#b28cdd','#f09ac0','#e99945','#49c5bb','#b48a63','#a7b5c4'],names=['E kuqe','Blu','E verdhë','E gjelbër','Vjollcë','Rozë','Portokalli','Turkeze','Kafe','Gri'];
  const letters=['A','B','C','Ç','D','E','Ë','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','Y','Z'];
  const count=Math.min(10,3+band+(grade===2?2:0)),letterMode=level%2===0;
  const palette=Array.from({length:count},(_,i)=>({symbol:letterMode?letters[(i+seed*3+band)%letters.length]:String(i+1),color:colors[(i+seed)%10],name:names[(i+seed)%10]}));
  const length=(grade===1?6:12)+band*2+seed;
  a=Array.from({length},(_,i)=>(i+Math.floor(i/count)+level)%count);
  b={...b,palette,cells:a.map(k=>({symbol:palette[k].symbol})),columns:grade===1?4:6};
  visual=letterMode?'Ngjyros shkronjat sipas çelësit poshtë tabelës.':'Ngjyros numrat sipas çelësit poshtë tabelës.';
 }
 if(kind==='draw'){
  const size=12,start=[1,10],direction=0,len=1+seed;
  const program=[],tier=Math.min(5,band+Math.floor((grade-1)/2));
  const forward=n=>program.push({op:'forward',n}),right=()=>program.push({op:'right',n:1}),left=()=>program.push({op:'left',n:1});
  if(tier===0)forward(len);
  if(tier===1){forward(len);right();forward(1+seed);}
  if(tier===2){forward(len);right();forward(1+seed);right();forward(len);}
  if(tier===3){forward(len);right();forward(1+seed);right();forward(len);right();forward(1+seed);}
  if(tier===4){const step=1+seed%3;for(let i=0;i<3;i++){forward(step);right();forward(step);if(i<2)left();}}
  if(tier===5){const step=2+seed%3;forward(step);right();forward(step+2);right();forward(step);right();forward(step);right();forward(Math.max(1,step-1));right();forward(Math.max(1,step-1));}
  b={...b,size,start,direction,maxCommands:24,target:[]};b.target=drawTrace(b,program);a=program;
  visual=grade===1?'Ndiq vijën me hapa dhe kthesa.':'Ndërto modelin me komandat e lapsit. Një numër përsërit veprimin.';
 }
 if(kind==='events'){
  const count=Math.min(grade===1?3:grade===2?4:6,1+band+(grade>2?1:0));const eventNames=['Kur prek arushin','Kur prek lepurin','Kur shtyp diellin','Kur bie zilja','Kur miqtë takohen','Kur fillon nata'];
  b={...b,events:Array.from({length:count},(_,i)=>({id:`e${i}`,label:eventNames[i],actor:i%2,goal:actions[(i+seed+band+grade-1)%6].label})),actions};a=b.events.map((_,i)=>actions[(i+seed+band+grade-1)%6].id);visual='Çdo ngjarje ka një veprim. Ndërto lidhjet dhe provoji në skenë.';
 }
 if(kind==='story'){
  const count=Math.min(4,1+Math.floor(band/2)+(grade>2?1:0));const frames=[];a=[];
  for(let i=0;i<count;i++){
   const storyIndex=(seed+band+i)%stories.length,s=stories[storyIndex],evidence=['Dheu është i thatë.','Në urë ka vend vetëm për njërin.','Filluan pika shiu.','Ka katër miq dhe katër mollë.','Lapsi ka emrin e lepurit.','Miqtë po bëjnë pjesë të ndryshme të punës.'];
   const reasonTask=grade>=3&&band>=2||grade===2&&band>=4;
   const options=[{id:'help',label:reasonTask?evidence[storyIndex]:s.right,response:s.why},...s.wrong.map((label,k)=>({id:`other${k}`,label:reasonTask?(k===0?'Arushi mban një kapelë.':'Miqtë nuk kanë nevojë për një plan.'):label,response:'Miqtë ndalen dhe mendojnë për një mënyrë tjetër.'}))];
   const rotated=[...options.slice((level+i)%3),...options.slice(0,(level+i)%3)];
   const correctId=rotated.findIndex(o=>o.id==='help');
   const safeOptions=rotated.map((o,k)=>({...o,id:`o${k}`}));
   frames.push({scene:s.scene,text:s.text+(grade>=3&&band>=3?' Mendohu edhe për pasojat që veprimi mund të ketë për miqtë.':''),question:reasonTask?'Cila e dhënë nga historia të ndihmon të zgjedhësh veprimin?':s.question,options:safeOptions});a.push(`o${correctId}`);
  }
  b={...b,story:frames};visual='Lexo, zgjidh dhe ndiq historinë. Mund ta ndryshosh zgjedhjen përpara kontrollit.';
 }
 if(kind==='objects'){
  const groups=Math.min(4,1+Math.floor(band/2)),unit=grade<=2?1:grade===3?10:100,goals=Array.from({length:groups},(_,i)=>Math.min(grade===1?10:grade===2?20:16,2+seed+i+band+(grade===2?3:0))*unit+(grade>=3?1+seed:0));
  const tokens=[];a=[];goals.forEach((n,i)=>{for(let j=0;j<Math.floor(n/unit);j++){tokens.push({id:`t${tokens.length}`,value:unit});a.push(i);}for(let j=0;j<n%unit;j++){tokens.push({id:`t${tokens.length}`,value:1});a.push(i);}});
  b={...b,tokens,goals,labels:goals.map((n,i)=>`Shporta ${i+1}: ${n}`)};visual=grade<=2?'Vendos sasinë e kërkuar në secilën shportë.':'Një bllok ka vlerën e shënuar: njësi, dhjetëshe ose qindëshe.';
 }
 if(kind==='tangram'){
  const model=band===0?0:(band+seed+(grade-1))%6,base=square.map(t=>({...t}));
  if(model===1)base[0]={x:0,y:4,turn:0};
  if(model===2)base[1]={x:4,y:0,turn:0};
  if(model===3){base[0]={x:0,y:4,turn:0};base[1]={x:4,y:0,turn:0};}
  if(model===4)base[3]={x:0,y:4,turn:2};
  if(model===5)base[4]={x:4,y:2,turn:3};
  const turn=(seed+(grade>=3?band:0))%4,offset=1+seed*.5;
  const rotated=base.map(t=>{let x=t.x,y=t.y;for(let i=0;i<turn;i++)[x,y]=[-y,x];return {x,y,turn:(t.turn+turn)%4};});
  const vertices=pieces.flatMap((p,i)=>polygonAt(p,rotated[i])),minX=Math.min(...vertices.map(p=>p[0])),minY=Math.min(...vertices.map(p=>p[1]));
  const transforms=rotated.map(t=>({...t,x:t.x-minX+offset,y:t.y-minY+1}));
  b={...b,size:12,pieces,silhouette:pieces.map((p,i)=>polygonAt(p,transforms[i])),initial:pieces.map((_,i)=>({x:2+(i%3)*3,y:6+Math.floor(i/3)*2,turn:(i+level)%4}))};a=transforms;
  // First band shows piece boundaries; later bands ask for the unpartitioned silhouette.
  visual=band===0?'Bashko shtatë pjesët. Vijat e brendshme të ndihmojnë.':'Mbulo siluetën me shtatë pjesë pa mbivendosje. Pjesët mund të ndërrojnë vende.';
 }
 if(kind==='rules'){
  const count=1+Math.min(grade===1?2:3,band),figCount=Math.min(9,3+seed+Math.floor(band/2)+(grade>2?1:0)),colors=['#ec707b','#55a5e4','#e7b342'],shapes=['circle','square','triangle'];a=[];
  const rounds=Array.from({length:count},(_,r)=>{const mode=(seed+r)%(grade===1?2:grade>=3&&band>=3?4:3),figures=Array.from({length:figCount},(_,i)=>({id:`r${r}f${i}`,color:colors[(i+level+r)%3],shape:shapes[(i*2+seed+r)%3],number:1+(i+seed+r)%9}));
   const labels=mode===0?['Rozë','Blu','E verdhë']:mode===1?['Rreth','Katror','Trekëndësh']:mode===2?['Tek','Çift']:['Rozë dhe trekëndësh','Figurat e tjera'];a.push(figures.map(f=>mode===0?colors.indexOf(f.color):mode===1?shapes.indexOf(f.shape):mode===2?(f.number%2?0:1):f.color===colors[0]&&f.shape==='triangle'?0:1));
   return {rule:mode===0?'Rendit sipas ngjyrës':mode===1?'Rendit sipas formës':mode===2?'Rendit sipas numrit: tek ose çift':'Zgjidh figurat që janë njëkohësisht rozë dhe trekëndësh',labels,figures};});b={...b,rounds};visual='Rregulli ndryshon. Lexo kërkesën në çdo raund dhe vendos çdo figurë në grup.';
 }
 return {id:`${lesson.id}-level-${level}`,grade,cat:lesson.category,type:'creative',interaction:{creative:b},options:[],answer:JSON.stringify(a),title:`${lesson.title} · Niveli ${level}`,visual,lessonId:lesson.id,lessonLevel:level,gameLevel:level,level:Math.min(3,1+Math.floor((level-1)/10)),difficultyBand:band+1,hint:kind==='tangram'?'Krahaso skajet e pjerrëta. Dy trekëndësha të vegjël kanë të njëjtën sipërfaqe si katrori.':kind==='draw'?'Nis te pika. Numëro katrorët deri te kthesa e parë.':'Merre një kërkesë në një kohë. Provo zgjedhjen dhe krahasoje me objektivin.',explain:kind==='story'?b.story.map((s,i)=>s.options.find(o=>o.id===a[i]).response).join(' '):kind==='objects'?'Çdo shportë ka shumën e kërkuar të vlerave të sendeve.':kind==='tangram'?'Shtatë pjesët mbulojnë siluetën pa boshllëqe ose mbivendosje.':'Zgjidhja përputhet me të gjitha kërkesat e misionit.'};
}
