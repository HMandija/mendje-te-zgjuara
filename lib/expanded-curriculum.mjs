import {creativePuzzle} from './creative-puzzles.mjs';
import {memoryBoard,shapeBoard,pipeBoard,mazeBoard,numberPlacement} from './curriculum-boards.mjs';
// SERVER ONLY: deterministic original exercises. Never import this module in client components.
import {curriculumLesson} from './curriculum-catalog.mjs';
import {commandsForGrade} from './robot-rules.mjs';
const directions=['veri','lindje','jug','perëndim'];
function board(g,v,level,band){
 const size=3+Math.min(2,Math.floor((g+band)/3)),route=[];
 for(let row=0;row<size;row++)for(let col=0;col<size;col++)route.push(row*size+(row%2?size-1-col:col));
 if(level%2)route.reverse();
 const rotation=(level+g)%4,rotate=p=>{let row=Math.floor(p/size),col=p%size;for(let i=0;i<rotation;i++)[row,col]=[col,size-1-row];return row*size+col;};
 const path=route.map(rotate),count=Math.min(path.length,4+g+band+level%5),walk=path.slice(0,count);
 if(v===7){const cells=Array(size*size).fill('#');walk.forEach(p=>cells[p]='.');return {type:'maze',title:'Gjej një rrugë deri te mbërritja.',visual:'Ndiq korridorin pa kaluar murin.',options:[],interaction:{scene:'maze',size,cells,start:walk[0],end:walk.at(-1)},answer:JSON.stringify(walk),hint:'Kontrollo korridorin përpara lëvizjes.',explain:'Rruga kalon vetëm në korridore dhe mbaron te objektivi.'};}
 const pipes=Array.from({length:size*size},(_,i)=>({id:`p${i}`,exits:[],rotation:(level+i)%4}));
 for(let i=0;i<path.length;i++)for(const next of [path[i-1],path[i+1]].filter(x=>x!==undefined)){const d=next-path[i];pipes[path[i]].exits.push(d===-size?0:d===1?1:d===size?2:3);}
 return {type:'pipes',title:'Rrotullo tubat dhe lidh rrugën.',visual:'Lidh çdo pllakë nga nisja te mbërritja.',options:[],interaction:{scene:'pipes',size,pipes,start:path[0],end:path.at(-1)},answer:JSON.stringify(pipes.map(()=>0)),hint:'Kontrollo të dy skajet e çdo tubi.',explain:'Çdo dalje takon hyrjen fqinje dhe rruga lidh të gjitha pllakat.'};
}
function numeric(title,visual,answer,explain){return {type:'number',title,visual,answer:String(answer),options:[],explain,hint:'Shkruaj të dhënat në rend dhe kontrollo veprimin e fundit.'};}
function choice(title,visual,answer,others,explain){const options=[...new Set([String(answer),...others.map(String)])];return {type:'choice',title,visual,answer:String(answer),options,explain,hint:'Kontrollo çdo alternativë kundrejt të gjitha të dhënave.'};}
function order(title,items,reverse=false){const sorted=[...items].sort((a,b)=>Number(a)-Number(b));if(reverse)sorted.reverse();return {type:'ordering',title,visual:reverse?'Nga më i madhi te më i vogli':'Nga më i vogli te më i madhi',options:[],interaction:{items:[...items].reverse()},answer:JSON.stringify(sorted),explain:`Rendi i saktë është ${sorted.join(' → ')}.`,hint:'Krahaso dy numra fqinjë dhe zhvendos atë që nuk është në rend.'};}
function robot(g,v,level,band){
 const size=g<=2?5:6,length=Math.min(3+band+Math.floor((level-1)/5)+g,14),snake=[];
 for(let y=0;y<size;y++)for(let x=0;x<size;x++)snake.push(y*size+(y%2?size-1-x:x));
 const offset=(level+v*3)%(size*size-length-1),mirror=v%2===0;
 const route=snake.slice(offset,offset+length+1).map(p=>mirror?Math.floor(p/size)*size+(size-1-p%size):p);
 const cells=Array(size*size).fill('#');for(const p of route)cells[p]='.';
 const goals=v>=4?[route[Math.floor(route.length/2)],...(v>=5&&g>=2?[route[Math.floor(route.length/3)]]:[]),route.at(-1)]:[route.at(-1)];
 const program=[];let direction=v%4;
 for(let i=1;i<route.length;i++){const diff=route[i]-route[i-1],d=diff===-size?0:diff===1?1:diff===size?2:3;if(g<=2)program.push({op:['north','east','south','west'][d]});else{const turn=(d-direction+4)%4;if(turn===3)program.push({op:'left'});else for(let n=0;n<turn;n++)program.push({op:'right'});program.push({op:'forward'});direction=d;}}
 const folded=[];for(let i=0;i<program.length;){let j=i+1;while(j<program.length&&program[j].op===program[i].op&&j-i<8)j++;if(g>=2&&j-i>=2)folded.push({op:'repeat',n:j-i,body:[program[i]]});else folded.push(...program.slice(i,j));i=j;}
 return {type:'robot',title:'Programo arushin të ndjekë rrugën.',visual:g<=2?'Vendos shigjetat dhe arrij te flamuri.':'Përdor përpara, kthesat dhe përsëritjet. Vizito çdo yll.',options:[],interaction:{scene:'robot',size,cells,start:route[0],end:route.at(-1),goals,direction:v%4,commands:commandsForGrade(g),grade:g},answer:JSON.stringify(folded),hint:'Ndiq rrugën nga nisja. Kontrollo drejtimin e arushit në çdo kthesë.',explain:'Arushi vizitoi objektivat dhe përfundoi te flamuri.'};
}
export function curriculumPuzzle(lessonId,level){
 const lesson=curriculumLesson(lessonId);if(!lesson)throw new RangeError('Unknown curriculum lesson');
 if(!Number.isInteger(level)||level<1||level>30)throw new RangeError('Level must be 1–30');
 if(lesson.creative)return creativePuzzle(lesson,level);
 const g=lesson.grade,v=lesson.variant,b=Math.floor((level-1)/5),n=level+g*2,k=g===1?1+Math.min(4,b)+(v%2):1+b+(v%3),a=g===1?level+2:g===2?10+level:g===3?20+level*2:40+level*3,c=g+b+1;
 const N=(title,visual,result,reason)=>numeric(title,visual,result,reason||`${visual} → ${result}`);let p;
 switch(lesson.domain){
 case 'math':{
  const results=[a+k,a-k,a+k,a-k,a*k,a,a+1,a*10+k,(a+k)*c,a];
  const visuals=[`${a} + ${k}`,`${a} − ${k}`,`? + ${k} = ${a+2*k}`,`? − ${k} = ${a-2*k}`,`${a} grupe me nga ${k}`,`${a*k} sende në ${k} grupe`,`${a} < ? < ${a+2}`,`${a} dhjetëshe dhe ${k} njësi`,`${a} + ${k}, pastaj × ${c}`,`? + ${k} = ${a+k}`];
  p=N(['Sa janë gjithsej?','Sa mbeten?','Gjej numrin që mungon.','Gjej numrin fillestar.','Sa sende ka gjithsej?','Sa merr çdo grup?','Cili numër është në mes?','Sa është numri?','Kryej veprimet sipas rendit.','Sa peshon kutia?'][v],visuals[v],results[v]);
  if(g===1&&[4,5,7,8].includes(v)){const group=1+level%3;p=N(v===4?'Bashko dy grupet e vizatuara.':v===5?'Ndaj sendet mes dy fëmijëve.':v===7?'Numëro dhjetë dhe disa njësi.':'Bëj dy mbledhje.',v===4?`${a} + ${group}`:v===5?`${group*2} sende, 2 fëmijë`:v===7?`10 + ${k}`:`${a} + 1 + ${group}`,v===7?10+k:v===8?a+1+group:v===4?a+group:group);}
  // Every arithmetic lesson is an illustrated matching task, with distractors.
  const result=Number(p.answer),tokens=[result,result+1,result+2].map((quantity,i)=>({id:`t${i}`,asset:g===1?'flower':'number',label:String(quantity),quantity,color:['gold','sky','coral'][i]}));
  p={...p,type:'placement',options:[],answer:JSON.stringify(['t0']),interaction:{scene:'garden',tokens:[tokens[1],tokens[2],tokens[0]],targets:[{id:'s0',label:p.visual,cue:'pot',quantity:0}]}};break;
 }
 case 'logic':{
  const vals=[a,a+k,a+2*k],all=`A=${vals[0]}, B=${vals[1]}, C=${vals[2]}`;
  if(v===0)p=choice('Cila kuti ka më shumë?',all,'C',['A','B'],`${vals[2]} është më i madh.`);
  else if(v===1)p=order('Rendit sasitë.',vals.map(String));
  else if(v===2)p=choice('Cili numër nuk është brenda intervalit?',`${a} deri ${a+2*k}: ${a}, ${a+k}, ${a+3*k}`,a+3*k,[a,a+k],'Vetëm numri i fundit është mbi kufirin.');
  else if(v===3)p=choice('A mund të dimë kush ka më shumë, A apo C?',`A ka më shumë se B. C ka më shumë se B. B ka ${a}.`,'Jo',['A','C'],'Nuk kemi krahasim midis A dhe C.');
  else if(v===4)p=N('Gjej numrin: është mbi kufirin e parë dhe nën të dytin.',`${a} < ? < ${a+2}`,a+1);
  else if(v===5)p=N('Sa nga numrat plotësojnë të paktën një kusht?',`${vals.join(', ')}; më i vogël se ${a+k} OSE më i madh se ${a+k}`,2);
  else if(v===6){const cells=[`${a} < ${a+k}`,`${a+k} > ${a+2*k}`,`${a+2*k} > ${a}`];p={type:'grid',title:'Shëno + për saktë dhe − për gabim.',visual:all,options:[],interaction:{cells},answer:JSON.stringify(['+','−','+']),explain:'Krahaso numrat në secilin pohim.',hint:'Kontrollo çdo pohim veçmas.'};}
  else if(v===7)p=choice('A është C më e madhe se A?',`B ka ${a+k}, A ka ${a}, C ka ${a+2*k}.`,'Po',['Jo'],'Nëse C>B dhe B>A, atëherë C>A.');
  else if(v===8)p=N('Cili është numri më i vogël i mundshëm?',`Numër i plotë mbi ${a} dhe deri ${a+k+1}.`,a+1);
  else p=N('Gjej numrin nga dy të dhënat.',`? + ${k} = ${a+k}; ? është më i vogël se ${a+k}.`,a);break;
 }
 case 'patterns':{
  const step=k+g-1,start=a,seq=Array.from({length:5},(_,i)=>start+i*step);let visual,result;
  if(v===0){visual=seq.slice(0,4).join(' → ')+' → ?';result=seq[4];}
  if(v===1){visual=[a+4*step,a+3*step,a+2*step,a+step,'?'].join(' → ');result=a;}
  if(v===2){visual=[a,a+k,a+k+1,a+2*k+1,'?'].join(' → ')+` (përsërit +${k}, +1)`;result=a+2*k+2;}
  if(v===3){visual=`${a}, ${a+k}, ${a}, ${a+k}, ?`;result=a;}
  if(v===4){visual=[a,a+1,a+3,a+6,'?'].join(' → ')+' (shto 1, 2, 3, 4)';result=a+10;}
  if(v===5){visual=[seq[0],seq[1],'?',seq[3],seq[4]].join(' → ');result=seq[2];}
  if(v===6){visual=seq.slice(0,4).join(' → ')+'; sa shtohet çdo herë?';result=step;}
  if(v===7){visual=`${a}, ${a+20}, ${a+k}, ${a+20+k}, ? (dy vargje me +${k})`;result=a+2*k;}
  if(v===8){visual=`${a}, ${a}, ${a+k}, ${a+k}, ?, ?`;result=a+2*k;}
  if(v===9){visual=seq.slice(0,3).join(' → ')+`; cili është numri në vendin ${5+b}?`;result=a+(4+b)*step;}
  p={type:'placement',title:'Zbulo rregullin dhe tërhiq vazhdimin.',visual,options:[],interaction:{scene:'patterns',tokens:[result+1,result,result+2].map((quantity,i)=>({id:`t${i}`,asset:'number',label:String(quantity),quantity})),targets:[{id:'s0',label:visual}],preview:[{id:'rule',asset:'number',label:String(start),quantity:start}]},answer:JSON.stringify(['t1']),hint:'Krahaso dy hapa dhe kontrollo nëse rregulli përsëritet.',explain:`Vazhdimi i kërkuar është ${result}.`};break;
 }
 case 'spatial':{
  if(v===7||v===8){p=board(g,v,level,b);break;}
  const right=n,left=k,up=level+g,down=b;let result,visual;
  if(v===0){result=right-left;visual=`${right} hapa lindje, ${left} perëndim; sa lindje nga nisja?`;}
  if(v===1){result=up-down;visual=`${up} hapa veri, ${down} jug; sa veri nga nisja?`;}
  if(v===2){result=right+left;visual=`${right} hapa përpara, ${left} hapa kthim; sa hapa u ecën gjithsej?`;}
  if(v===3||v===4||v===9){const turns=n+b,sign=v===4?-1:1,start=v===9?g%4:0;const d=((start+sign*turns)%4+4)%4;p=choice('Në cilin drejtim përfundon?',`Nisu drejt ${directions[start]}; ${turns} kthesa ${sign>0?'djathtas':'majtas'}.`,directions[d],directions.filter(x=>x!==directions[d]),'Çdo katër kthesa kthehemi në drejtimin fillestar.');break;}
  if(v===5){result=a+k;visual=`Kolona ${a}, zhvendos ${k} kolona djathtas. Kolona e re?`;}
  if(v===6){result=a+k;visual=`Rreshti ${a}, zhvendos ${k} rreshta poshtë. Rreshti i ri?`;}
  if(v===7){result=right+up;visual=`${right} hapa lindje dhe ${up} veri; sa hapa gjithsej?`;}
  if(v===8){result=left;visual=`Rruga A: ${right} hapa. Rruga B: ${right+left} hapa. Me sa është B më e gjatë?`;}
  p=N('Ndiq udhëzimet në hapësirë.',visual,result);break;
 }
 case 'memory':{
  const count=Math.min(8,3+g+b),values=Array.from({length:count},(_,i)=>a+((i*3+level)%count)*k),pos=(level+v)%count;let result;
  if(v===0)result=values[0];if(v===1)result=values.at(-1);if(v===2)result=values[pos];if(v===3)result=values.at(-1);if(v===4)result=values[Math.min(count-1,pos+1)];if(v===5)result=values[Math.max(0,pos-1)];if(v===6)result=Math.max(...values);if(v===7)result=Math.min(...values);if(v===8)result=values.filter(x=>x===values[pos]).length;if(v===9)result=values[0]+values.at(-1);
  const requests=['Cili ishte numri i parë?','Cili ishte numri i fundit?',`Cili ishte numri në vendin ${pos+1}?`,'Po ta kthejmë rendin, cili numër vjen i pari?',`Cili numër ishte pas vendit ${Math.min(count-1,pos+1)}?`,`Cili numër ishte para vendit ${Math.max(2,pos+1)}?`,'Cili ishte numri më i madh?','Cili ishte numri më i vogël?',`Sa herë u shfaq ${values[pos]}?`,'Sa është shuma e numrit të parë dhe të fundit?'];
  const tokens=[...new Set(values)].map((quantity,i)=>({id:`t${i}`,asset:'number',label:String(quantity),quantity}));
  // Visual recall uses the existing hide/reveal placement renderer. Distinct targets
  // ask for positional recall, reverse recall, extrema or computed recall.
  if(!tokens.some(t=>t.quantity===result))tokens.push({id:'result',asset:'number',label:String(result),quantity:result});
  const answer=tokens.find(t=>t.quantity===result).id;
  p={type:'placement',title:requests[v],visual:'Vëzhgo vargun, pastaj vendos numrin e kërkuar.',options:[],interaction:{scene:'memory',tokens:[...tokens].reverse(),targets:[{id:'s0',label:requests[v]}],preview:values.map((quantity,i)=>({id:`preview${i}`,asset:'number',label:String(quantity),quantity})),previewSeconds:Math.max(4,11-g-b)},answer:JSON.stringify([answer]),hint:'Shiko vargun sërish dhe përqendrohu te kërkesa.',explain:`Numri i kërkuar është ${result}.`};break;
 }
 case 'thinking':{
  const results=[a+k+1,a+k-1,2*a,a*(k+1),a+k+c,a*k-a,a*k+a,k,(a+c)*(k+1),a];
  const visuals=[`Ke ${a}, merr ${k}. Po të marrësh edhe 1?`,`Ke ${a}, merr ${k}. Po të marrësh 1 më pak?`,`Ke ${a} sende. Po t'i dyfishosh?`,`${a} grupe me ${k} sende. Shto 1 në çdo grup.`,`Nisu me ${a}, shto ${k}. Po të nisësh me ${c} më shumë?`,`${k} grupe me ${a} sende. Hiq një grup.`,`${k} grupe me ${a} sende. Shto një grup.`,`Plani A jep ${a}; plani B jep ${a+k}. Sa më shumë jep B?`,`${a} grupe me ${k} sende. Shto ${c} grupe dhe 1 send në çdo grup.`,`${a} sende transferohen në një kuti tjetër. Sa sende ka gjithsej?`];p=N('Parashiko çfarë ndryshon.',visuals[v],results[v]);break;
 }
 case 'algorithm':{
  if(v<=1){p=order('Rendit numrat sipas udhëzimit.',Array.from({length:Math.min(8,g+b+2)},(_,i)=>String(a+i*k)),v===1);break;}
  const repeats=2+b,result=[0,0,a+repeats*k,a+repeats*k-repeats,a>k?a+k:a-k,repeats,(a+k)*c,a,k,a+k][v];
  const visuals=['','',`Nisu ${a}; përsërit ${repeats} herë +${k}.`,`Nisu ${a+repeats*k}; përsërit ${repeats} herë −1.`,`Nëse ${a}>${k}, shto ${k}; ndryshe zbrit ${k}.`,`Numëro ciklet: ${Array(repeats).fill('↻').join(' ')} (nisja ${a}).`,`Nisu ${a}; shto ${k}; shumëzo me ${c}.`,`Pas +${k} rezultati është ${a+k}. Nisja?`,`Nisu ${a}; shto 1 deri te ${a+k}. Sa hapa?`,`Nisu ${a}; shto ${k}. Cili duhet të jetë rezultati?`];p=N('Ekzekuto algoritmin sipas rendit.',visuals[v],result);break;
 }
 case 'programming':{
  const repeats=2+b,results=[a,a+k,a+k,a>k?a:0,a<k?a:0,a+repeats*k,a+k+c,a-k,a+k,a+k*c];
  const visuals=[`x ← ${a}; shfaq x`,`x ← ${a}; x ← x + ${k}; shfaq x`,`x ← ${a}; y ← ${k}; shfaq x+y`,`x ← ${a}; nëse x>${k}, shfaq x; ndryshe 0`,`x ← ${a}; nëse x<${k}, shfaq x; ndryshe 0`,`x ← ${a}; përsërit ${repeats}: x ← x+${k}`,`x ← ${a}; x ← x+${k}; x ← x+${c}`,`x ← ${a}; x ← x−${k}; shfaq x`,`x ← ${a}; shto ${k}; roboti tha ${a+k+1}. Rezultati i saktë?`,`x ← ${a}; përsërit ${c}: x ← x+${k}`];p=N('Cilin numër shfaq programi?',visuals[v],results[v]);break;
 }
 case 'robotics':p=robot(g,v,level,b);break;
 case 'observation':{
  const values=Array.from({length:Math.min(8,3+g+b)},(_,i)=>a+i),text=values.join(', ');let result,visual=text,title;
  if(v===0){result=values.filter(x=>x%2===0).length;title='Sa numra çift shikon?';}
  if(v===1){result=values.filter(x=>x%2!==0).length;title='Sa numra tek shikon?';}
  if(v===2){result=Math.max(...values);title='Cili është numri më i madh?';}
  if(v===3){result=Math.min(...values);title='Cili është numri më i vogël?';}
  if(v===4){result=a+k;visual=[a,a+k,a+2*k,a+k,a+3*k].join(', ');title='Cili numër përsëritet?';}
  if(v===5){result=a+k;visual=`${a} + ${k} = ${a+k+1}`;title='Korrigjo rezultatin.';}
  if(v===6){result=a-k;visual=`${a} − ${k} = ${a-k+1}`;title='Korrigjo rezultatin.';}
  if(v===7){result=values.filter(x=>x>a+1).length;title=`Sa numra janë mbi ${a+1}?`;}
  if(v===8){result=values.filter(x=>x<a+2).length;title=`Sa numra janë nën ${a+2}?`;}
  if(v===9){result=k;visual=`Para: ${a}; pas: ${a+k}`;title='Sa u rrit numri?';}
  p=N(title,visual,result);break;
 }
 default:throw new RangeError('Unsupported domain');
 }
 if(g===1&&lesson.domain==='math'){
  const left=1+(level-1)%10,right=1+Math.floor((level-1)/5),sum=left+right;
  const values=[sum,left,left,left,sum,left,left+1,10+right,sum+Math.min(3,b),left];
  const cues=[`${left} + ${right}`,`${sum} − ${right}`,`? + ${right} = ${sum}`,`? − ${right} = ${left-right}`,`${left} + ${right}`,`${left*2} sende ndahen në dy grupe`,`${left} < ? < ${left+2}`,`10 + ${right}`,`${left} + ${right} + ${Math.min(3,b)}`,`? + ${right} = ${sum}`];
  if(v===3)cues[v]=`? − ${right} = ${left}`;
  if(v===3)values[v]=sum;
  p=numeric(p.title,cues[v],values[v],`${cues[v]} → ${values[v]}`);
 }
 if(g===2&&lesson.domain==='math'&&[4,5,8].includes(v)){
  const group=2+b,each=3+(level+v)%8,total=group*each;
  p=v===4?numeric('Bashko grupet e barabarta.',Array(group).fill(each).join(' + '),total,`${group} grupe me ${each} sende japin ${total}.`):v===5?numeric('Ndaj sendet në grupe të barabarta.',`${total} sende në ${group} grupe. Sa ka çdo grup?`,each,`Çdo grup merr ${each} sende.`):numeric('Kryej dy mbledhje me radhë.',`${each} + ${group} + ${b+1}`,each+group+b+1,'Bashkojmë sasitë njëra pas tjetrës.');
 }
 if(g===1&&lesson.domain==='algorithm'){
  const first=1+(level-1)%10,step=1+Math.floor((level-1)/10),hops=2+Math.floor((level-1)/10);
  if(v<=1)p=order('Rendit kartat e numrave.',Array.from({length:3+b%3},(_,i)=>String(first+i)),v===1);
  else {
   const result=[0,0,first+hops,first,first+step,hops,first+step+1,first,step,first+step][v];
   const clue=['','',`Nisu te ${first}; ec ${hops} hapa përpara.`,`Nisu te ${first+hops}; ec ${hops} hapa mbrapa.`,`Ke ${first} sende. Shto ${step} sende.`,`Nisja është ${first}. Sa shigjeta ka në plan? ${Array(hops).fill('→').join(' ')}`,`Nisu te ${first}; shto ${step}, pastaj 1.`,`Pas ${step} hapave përpara je te ${first+step}. Ku ishe?`,`Nga ${first} te ${first+step}. Sa hapa përpara?`,`Ke ${first} sende; shto ${step}. Sa duhet të kesh?`][v];
   p=numeric('Ndiq hapat një nga një.',clue,result,`${clue} → ${result}`);
  }
 }
 if(g<=2&&lesson.domain==='programming')p=robot(g,v,level,b);
 if(lesson.domain==='spatial'&&v>=5)p=v===5?shapeBoard(g,v,level):v===6||v===7?pipeBoard(g,v,level):mazeBoard(g,v,level);
 if(lesson.domain==='memory'&&v<5)p=memoryBoard(g,v,level);
 if(p.type==='number'&&['math','patterns','thinking','programming','observation'].includes(lesson.domain))p=numberPlacement(p,g,level,v);
 return {...p,id:`${lesson.id}-level-${level}`,grade:g,cat:lesson.category,level:Math.min(3,1+Math.floor((level-1)/10)),gameLevel:level,lessonId:lesson.id,lessonLevel:level,curriculumLesson:lesson.id,curriculumLevel:level,difficultyBand:b+1,title:`${lesson.title} · Niveli ${level}: ${p.title}`};
}
export function curriculumLevel(lessonId,level){return [curriculumPuzzle(lessonId,level)];}
