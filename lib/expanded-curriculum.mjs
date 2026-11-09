import {creativePuzzle} from './creative-puzzles.mjs';
import {memoryBoard,shapeBoard,pipeBoard,mazeBoard,numberPlacement} from './curriculum-boards.mjs';
// SERVER ONLY: deterministic original exercises. Never import this module in client components.
import {curriculumLesson} from './curriculum-catalog.mjs';
import {progressiveRobot} from './progressive-robot.mjs';
const directions=['veri','lindje','jug','perëndim'];
// Answer-position fairness. The correct card must not sit in a fixed slot, and the wrong
// numbers must not always be larger than the right one. Everything is deterministic: the same
// lesson level always produces the same layout, but the layout changes from level to level.
function seedOf(text){let h=2166136261;for(let i=0;i<text.length;i++){h^=text.charCodeAt(i);h=Math.imul(h,16777619);}return h>>>0;}
// ---- Klasa 1, mësimet logjike #8-#10: pyetje konkrete me figura (emoji), jo me shkronja dhe simbole.
const KID_FRUITS=['🍎','🍌','🍇','🍓','🍊','🍐','🍒','🥕'];
const KID_BOXES=[['🟥','e kuqe'],['🟦','blu'],['🟩','e gjelbër'],['🟨','e verdhë']];
const KID_FAMILIES=[['🍎','🍌','🍇','🍓','🍊'],['🐶','🐱','🐰','🐻','🐸'],['🚗','🚌','🚲','✈️','🚂'],['👕','🧦','🧢','👟','🧤']];
function kidPick(seed,list,n){const pool=[...list];let s=seed>>>0;for(let i=pool.length-1;i>0;i--){s=(Math.imul(s,1664525)+1013904223)>>>0;const j=s%(i+1);[pool[i],pool[j]]=[pool[j],pool[i]];}return pool.slice(0,n);}
function kidLogic(v,level,id){
 const b=Math.floor((level-1)/5),seed=seedOf(`${id}|${level}|kid`),tints=['kuqe','blu','gjelber','verdhe'];
 if(v===0){ // Kutia me më shumë
  const fruit=KID_FRUITS[(level-1)%KID_FRUITS.length],n=b===0?2:b===3?4:3,more=!(b===2||(b===3&&level%2===0));
  const counts=kidPick(seed,Array.from({length:b===0?6:b===3?9:8},(_,i)=>i+1),n),target=more?Math.max(...counts):Math.min(...counts),at=counts.indexOf(target);
  const name=i=>`${KID_BOXES[i][0]} Kutia ${KID_BOXES[i][1]}`;
  const boxes=counts.map((c,i)=>({label:`Kutia ${KID_BOXES[i][1]}`,tint:tints[i],items:Array(c).fill(fruit)}));
  const p=choice(more?`Cila kuti ka më shumë ${fruit}?`:`Cila kuti ka më pak ${fruit}?`,counts.map((c,i)=>`${name(i)}: ${fruit.repeat(c)}`).join('   '),name(at),counts.map((_,i)=>name(i)).filter((_,i)=>i!==at),`${name(at)} ka ${target} ${fruit}, ${more?'më shumë':'më pak'} se kutitë e tjera.`);
  return {...p,boxes,hint:`Numëro ${fruit} në çdo kuti, një nga një.`,hint2:`Numrat janë ${counts.join(', ')}. Cili është ${more?'më i madhi':'më i vogli'}?`};
 }
 if(v===1){ // Shkallët e madhësive
  const size=b===0?3:b===3?5:4,items=kidPick(seed,Array.from({length:10},(_,i)=>i+1),size).map(String),down=b===2||(b===3&&level%2===0);
  const p=order(down?'Rendit kartat nga më e madhja te më e vogla.':'Rendit kartat nga më e vogla te më e madhja.',items,down);
  // Tabela miqësore për fëmijë: kutiza bosh sipër, karta me numra për të tërhequr poshtë.
  return {...p,interaction:{...p.interaction,kidOrder:down?'desc':'asc'},hint:down?'Gjej numrin më të madh dhe vendose të parin.':'Gjej numrin më të vogël dhe vendose të parin.',hint2:`Mendo për shkallët: ${down?'zbret':'ngjitesh'} një numër çdo herë.`};
 }
 // v===2: Sendi që nuk përshtatet
 const ordinal=['e para','e dytë','e tretë','e katërt'];
 if(b<=1){ // njëri send është nga një familje tjetër
  const fam=kidPick(seed,KID_FAMILIES,2),mates=kidPick(seed+7,fam[0],3),odd=kidPick(seed+13,fam[1],1)[0],items=kidPick(seed+19,[...mates,odd],4);
  const p=choice('Cili send nuk i përket grupit?',items.join('   '),odd,mates,`${odd} është nga një familje tjetër; tre të tjerat janë të një lloji.`);
  return {...p,boxes:[{label:'Grupi',tint:'neutral',items}],hint:'Shiko të katër figurat. Tre janë të një lloji. Cila është e ndryshme?',hint2:`Tre nga figurat janë ${b===0?'të njëjta nga lloji':'në të njëjtën familje'}. Njëra nuk është.`};
 }
 const fruit=KID_FRUITS[level%KID_FRUITS.length],base=2+(level%3),other=b===2?base+1:base-1,at=seed%4;
 if(b===2){ // një grup ka numër tjetër sendesh
  const groups=Array.from({length:4},(_,i)=>i===at?other:base),boxes=groups.map((n,i)=>({label:`Grupi ${i+1}`,tint:tints[i],items:Array(n).fill(fruit)}));
  const p=choice('Cili grup ka numër tjetër sendesh?',groups.map((n,i)=>`Grupi ${i+1}: ${fruit.repeat(n)}`).join('   '),`Grupi ${at+1}`,[0,1,2,3].filter(i=>i!==at).map(i=>`Grupi ${i+1}`),`Grupi ${at+1} ka ${other} ${fruit}; të tjerët kanë nga ${base}.`);
  return {...p,boxes,hint:'Numëro sendet në çdo grup.',hint2:`Tre grupe kanë ${base} sende. Cili ka ndryshe?`};
 }
 const colors=[['🔴','🔵'],['🟢','🟡'],['🟣','🟠']][level%3],shapes=Array.from({length:4},(_,i)=>i===at?colors[1]:colors[0]),p=choice('Cila figurë ka ngjyrë tjetër?',shapes.map((s,i)=>`${i+1}. ${s}`).join('   '),`Figura ${ordinal[at]}`,[0,1,2,3].filter(i=>i!==at).map(i=>`Figura ${ordinal[i]}`),`Figura ${ordinal[at]} është ${colors[1]}; të tjerat janë ${colors[0]}.`);
 return {...p,hint:'Shiko ngjyrat një nga një, nga e para te e katërta.',hint2:`Tri figura janë ${colors[0]}. Njëra është ${colors[1]}.`};
}
function nearby(result,seed){const c=[result+1,result-1,result+2,result-2,result+3].filter(x=>x>=0&&x!==result),s=seed%c.length;return [c[s],c[(s+2)%c.length]];}
function mixTokens(p,seed){
 const it=p.interaction;
 if(p.type!=='placement'||!it||!Array.isArray(it.tokens)||it.tokens.length<3||!it.targets||it.targets.length!==1)return p;
 let answer;try{answer=JSON.parse(p.answer);}catch{return p;}
 if(!Array.isArray(answer)||answer.length!==1)return p;
 const rest=[...it.tokens],at=rest.findIndex(t=>t.id===answer[0]);if(at<0)return p;
 const [right]=rest.splice(at,1),turn=(seed>>>5)%rest.length,wrong=[...rest.slice(turn),...rest.slice(0,turn)];
 wrong.splice(seed%(rest.length+1),0,right);
 const colors=it.tokens.map(t=>t.color); // reuse the colours already in use, by slot, so colour cannot reveal the answer
 const tokens=colors.some(Boolean)?wrong.map((t,i)=>({...t,color:colors[i]})):wrong;
 return {...p,interaction:{...it,tokens}};
}
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
function numericHint(title,visual){
 const prompt=`${title} ${visual}`.toLocaleLowerCase('sq');
 if(prompt.includes('ec ')&&prompt.includes('hapa përpara')){const [,start,steps]=prompt.match(/nisu te (\d+); ec (\d+) hapa përpara/)||[];if(start&&steps)return `Nisu te ${start} dhe shto ${steps} njësi në vijën e numrave. Ku ndalesh?`;}
 if(prompt.includes('ec ')&&prompt.includes('hapa mbrapa')){const [,start,steps]=prompt.match(/nisu te (\d+); ec (\d+) hapa mbrapa/)||[];if(start&&steps)return `Nisu te ${start} dhe zbrit ${steps} njësi. Numëro mbrapsht një hap për çdo komandë.`;}
 if(prompt.includes('sende. shto ')){const [,start,added]=prompt.match(/ke (\d+) sende\. shto (\d+) sende/)||[];if(start&&added)return `Ke ${start} sende. Numëro edhe ${added} të tjera, duke nisur nga numri pas ${start}.`;}
 if(prompt.includes('sende. hiq ')){const [,start,removed]=prompt.match(/ke (\d+) sende\. hiq (\d+) sende/)||[];if(start&&removed)return `Ke ${start} sende. Hiq ${removed} dhe numëro sa mbeten në shportë.`;}
 if(prompt.includes('sa shigjeta ka në plan'))return `Numëro simbolet → në plan. Çdo shigjetë tregon një lëvizje të vetme.`;
 if(prompt.includes('hapa përpara')&&prompt.includes('kthim')){const nums=prompt.match(/(\d+) hapa përpara, (\d+) hapa kthim/);if(nums)return `Ec ${nums[1]} hapa dhe kthehu ${nums[2]}. Numëro secilën lëvizje vetëm një herë.`;}
 if(prompt.includes('? +')||prompt.includes('? −')||prompt.includes('kutia e panjohur')||prompt.includes('vlera fillestare'))return `Te ${visual}, përdor veprimin e kundërt për të gjetur vlerën që mungon; pastaj zëvendësoje për kontroll.`;
 if(prompt.includes(' ose ')||prompt.includes(' ose')||prompt.includes('të paktën një kusht'))return `Te ${visual}, provo secilin numër me të dy kushtet. Nëse i plotëson të dyja, numëroje vetëm një herë.`;
 if(prompt.includes('të dy kushtet')||prompt.includes(' dhe '))return `Te ${visual}, kontrollo që çdo numër t’i plotësojë të dy kushtet njëkohësisht.`;
 if(prompt.includes('lindje')||prompt.includes('perëndim'))return `Te ${visual}, anulo hapat në drejtime të kundërta; llogarit vetëm sa hapa mbeten në drejtimin e pyetur.`;
 if(prompt.includes('veri')||prompt.includes('jug'))return `Te ${visual}, krahaso hapat veri-jug dhe hiq drejtimin që kthen mbrapa.`;
 if(prompt.includes('kolona')||prompt.includes('rreshti'))return `Te ${visual}, nis nga numri i rreshtit ose kolonës dhe zbato zhvendosjen me drejtimin e duhur.`;
 if(prompt.includes('gjithsej')&&prompt.includes('hapa'))return `Te ${visual}, numëro secilin hap një herë. Kthesa ndryshon drejtimin, jo numrin e hapave.`;
 if(prompt.includes('grupe')&&prompt.includes('sa ka çdo grup'))return `Te ${visual}, ndaj sendet në mënyrë të barabartë. Shumëzimi dhe pjesëtimi kontrollojnë njëri-tjetrin.`;
 if(prompt.includes('grupe')||prompt.includes(' × ')||prompt.includes('shumëzo'))return `Te ${visual}, dallo numrin e grupeve nga sasia në secilin grup, pastaj shumëzoji.`;
 if(prompt.includes(' ÷ ')||prompt.includes('ndaj')||prompt.includes('sa ka çdo'))return `Te ${visual}, përcakto sa grupe ka dhe ndaj sendet në mënyrë të barabartë.`;
 if(prompt.includes('pastaj')||prompt.includes('sipas rendit')||prompt.includes('x ←'))return `Ndiq ${visual} nga komanda e parë te e fundit; shëno rezultatin ndërmjetës para veprimit tjetër.`;
 if(prompt.includes(' < ')||prompt.includes(' > ')||prompt.includes('kufi')||prompt.includes('interval'))return `Përdor kufijtë te ${visual} dhe kontrollo kushtin për secilin numër veçmas.`;
 if(prompt.includes(' − '))return `Te ${visual}, nis nga sasia e parë dhe hiq të dytën. Kontrollo duke i mbledhur përsëri.`;
 if(prompt.includes(' + '))return `Te ${visual}, bashko njësitë dhe dhjetëshet veçmas. Mbart një dhjetëshe kur njësitë arrijnë dhjetë.`;
 if(prompt.includes('rreshti')||prompt.includes('kolona'))return 'Mbaj shënim pikën e nisjes, pastaj numëro zhvendosjen në drejtimin e dhënë.';
 if(prompt.includes('send'))return `Lexo veprimin te ${visual}; përdor numërimin për të gjetur sa sende mbeten ose bëhen gjithsej.`;
 return `Ndiq të dhënat te ${visual}. Numëro ose llogarit hap pas hapi dhe kontrollo rezultatin.`;
}
function numericHint2(title,visual){
 const prompt=`${title} ${visual}`.toLocaleLowerCase('sq');
 if(prompt.includes('ec ')&&prompt.includes('hapa përpara')){const [,start,steps]=prompt.match(/nisu te (\d+); ec (\d+) hapa përpara/)||[];if(start&&steps)return `Kontrollo duke numëruar ${steps} hapa përpara nga ${start}, jo nga zero.`;}
 if(prompt.includes('ec ')&&prompt.includes('hapa mbrapa')){const [,start,steps]=prompt.match(/nisu te (\d+); ec (\d+) hapa mbrapa/)||[];if(start&&steps)return `Kthehu ${steps} vende nga ${start}; përgjigjja duhet të jetë më e vogël se nisja.`;}
 if(prompt.includes('sende. shto ')){const [,start,added]=prompt.match(/ke (\d+) sende\. shto (\d+) sende/)||[];if(start&&added)return `Mbledhja që përfaqëson veprimin është ${start} + ${added}.`;}
 if(prompt.includes('sende. hiq ')){const [,start,removed]=prompt.match(/ke (\d+) sende\. hiq (\d+) sende/)||[];if(start&&removed)return `Zbritja është ${start} − ${removed}. Kontrollo duke shtuar përsëri ${removed}.`;}
 if(prompt.includes('sa shigjeta ka në plan')){const arrows=(visual.match(/→/g)||[]).length;return `Rinumëro shigjetat nga e majta në të djathtë: plani ka ${arrows} komanda.`;}
 if(prompt.includes('pas +')&&prompt.includes('rezultati është')){const [,step,result]=prompt.match(/pas \+(\d+) rezultati është (\d+)/)||[];if(step&&result)return `Nëse pas shtimit të ${step} arrin te ${result}, zbrit ${step} për të gjetur nisjen.`;}
 if(prompt.includes('hapa përpara')&&prompt.includes('kthim')){const nums=prompt.match(/(\d+) hapa përpara, (\d+) hapa kthim/);if(nums)return `Krahaso ${nums[1]} me ${nums[2]}: hapat e kthimit zhbëjnë një pjesë të rrugës.`;}
 if(prompt.includes('? +')||prompt.includes('? −')||prompt.includes('vlera fillestare'))return `Vendose vlerën e mundshme te ? në ${visual}. A del barazia e saktë?`;
 if(prompt.includes(' ose ')||prompt.includes(' ose')||prompt.includes('të paktën një kusht'))return `Kontrollo nëse ndonjë numër plotëson të dy kushtet; mos e numëro dy herë.`;
 if(prompt.includes('të dy kushtet')||prompt.includes(' dhe '))return `Për ${visual}, lëri jashtë numrat që nuk plotësojnë njërin nga kushtet.`;
 if(prompt.includes('lindje')||prompt.includes('perëndim'))return `Për ${visual}, kontrollo drejtimin neto: hapat e kthimit pakësojnë ata të nisjes.`;
 if(prompt.includes('veri')||prompt.includes('jug'))return `Për ${visual}, kontrollo nëse rezultati përfundimtar është veri apo jug.`;
 if(prompt.includes('kolona')||prompt.includes('rreshti'))return `Zëvendëso numrin e gjetur në udhëzimin te ${visual} dhe kontrollo zhvendosjen.`;
 if(prompt.includes(' × ')||prompt.includes('grupe'))return `Kontrollo veprimin te ${visual} me pjesëtimin ose me mbledhje të përsëritur.`;
 if(prompt.includes('pastaj')||prompt.includes('sipas rendit')||prompt.includes('x ←'))return `Shkruaj rezultatin pas çdo hapi të ${visual}; mos i ndërro rendin veprimeve.`;
 if(prompt.includes(' < ')||prompt.includes(' > ')||prompt.includes('kufi')||prompt.includes('interval'))return `Provo kushtet e ${visual} një nga një, përfshirë nëse skajet lejohen.`;
 if(prompt.includes(' − '))return `Për ${visual}, shto diferencën me numrin e hequr për të kontrolluar nisjen.`;
 if(prompt.includes(' + '))return `Te ${visual}, kontrollo njësitë dhe mbartjen në kolonën e dhjetësheve.`;
 if(prompt.includes('send'))return `Kontrollo veprimin te ${visual} me numërim të kundërt.`;
 return `Zëvendëso përgjigjen te ${visual} dhe kontrollo nëse çdo hap përputhet.`;
}
function numeric(title,visual,answer,explain,hint=numericHint(title,visual)){return {type:'number',title,visual,answer:String(answer),options:[],explain,hint,hint2:numericHint2(title,visual)};}
function choice(title,visual,answer,others,explain){const options=[...new Set([String(answer),...others.map(String)])];for(let i=options.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[options[i],options[j]]=[options[j],options[i]];}return {type:'choice',title,visual,answer:String(answer),options,explain,hint:`Lexo të dhënat: ${visual}. Gjej rregullin që kërkohet dhe provo alternativat kundrejt tij.`,hint2:`Përjashto një nga një alternativat që bien ndesh me të dhënat te ${visual}.`};}
function order(title,items,reverse=false){const sorted=[...items].sort((a,b)=>Number(a)-Number(b));if(reverse)sorted.reverse();const shown=[...items].join(', ');return {type:'ordering',title,visual:reverse?'Nga më i madhi te më i vogli':'Nga më i vogli te më i madhi',options:[],interaction:{items:[...items].reverse()},answer:JSON.stringify(sorted),explain:`Rendi i saktë është ${sorted.join(' → ')}.`,hint:`Rendit ${shown} sipas kërkesës. Krahaso dy numra pranë njëri-tjetrit para se t’i lëvizësh.`,hint2:`Nis nga skaji i duhur: ${reverse?'numri më i madh':'numri më i vogël'}. Pastaj kontrollo çdo çift fqinj.`};}
export function curriculumPuzzle(lessonId,level){
 const lesson=curriculumLesson(lessonId);if(!lesson)throw new RangeError('Unknown curriculum lesson');
 if(!Number.isInteger(level)||level<1||level>30)throw new RangeError('Level must be 1–30');
 if(lesson.creative)return creativePuzzle(lesson,level);
 const g=lesson.grade,v=lesson.variant,b=Math.floor((level-1)/5),n=level+(g-1)*40+2,k=g===1?1+Math.min(4,b)+(v%2):1+b+(v%3),a=g===1?level+1:g===2?40+level:g===3?100+level*2:200+level*4,c=g+b+1;
 const N=(title,visual,result,reason)=>numeric(title,visual,result,reason||`${visual} → ${result}`);let p;
 switch(lesson.domain){
 case 'math':{
  const results=[a+k,a-k,a+k,a-k,a*k,a,a+1,a*10+k,(a+k)*c,a];
  const visuals=[`${a} + ${k}`,`${a} − ${k}`,`? + ${k} = ${a+2*k}`,`? − ${k} = ${a-2*k}`,`${a} grupe me nga ${k}`,`${a*k} sende në ${k} grupe`,`${a} < ? < ${a+2}`,`${a} dhjetëshe dhe ${k} njësi`,`${a} + ${k}, pastaj × ${c}`,`? + ${k} = ${a+k}`];
  p=N(['Sa janë gjithsej?','Sa mbeten?','Gjej numrin që mungon.','Gjej numrin fillestar.','Sa sende ka gjithsej?','Sa merr çdo grup?','Cili numër është në mes?','Sa është numri?','Kryej veprimet sipas rendit.','Sa peshon kutia?'][v],visuals[v],results[v]);
  if(g===1&&[4,5,7,8].includes(v)){const group=1+level%3;p=N(v===4?'Bashko dy grupet e vizatuara.':v===5?'Ndaj sendet mes dy fëmijëve.':v===7?'Numëro dhjetë dhe disa njësi.':'Bëj dy mbledhje.',v===4?`${a} + ${group}`:v===5?`${group*2} sende, 2 fëmijë`:v===7?`10 + ${k}`:`${a} + 1 + ${group}`,v===7?10+k:v===8?a+1+group:v===4?a+group:group);}
  // Every arithmetic lesson is an illustrated matching task, with distractors.
  const result=Number(p.answer),tokens=[result,...nearby(result,level*7+v*3+g)].map((quantity,i)=>({id:`t${i}`,asset:g===1?'flower':'number',label:String(quantity),quantity,color:['gold','sky','coral'][i]}));
  p={...p,type:'placement',options:[],answer:JSON.stringify(['t0']),interaction:{scene:'garden',tokens,targets:[{id:'s0',label:p.visual,cue:'pot',quantity:0}]}};break;
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
  p={type:'placement',title:'Zbulo rregullin dhe tërhiq vazhdimin.',visual,options:[],interaction:{scene:'patterns',tokens:[result,...nearby(result,level*5+v*3+g)].map((quantity,i)=>({id:`t${i}`,asset:'number',label:String(quantity),quantity})),targets:[{id:'s0',label:visual}],preview:[{id:'rule',asset:'number',label:String(start),quantity:start}]},answer:JSON.stringify(['t0']),hint:`Te vargu ${visual}, krahaso dy hapa radhazi për të zbuluar çfarë ndryshon.`,hint2:`Kontrollo nëse ruhet e njëjta shtesë, zbritje ose radhë grupi në gjithë vargun.`,explain:`Vazhdimi i kërkuar është ${result}.`};break;
 }
 case 'spatial':{
  if(v===7||v===8){p=board(g,v,level,b);break;}
  const right=n,left=k,up=level+(g-1)*40+1,down=b+g-1;let result,visual;
  if(v===0){result=right-left;visual=`${right} hapa lindje, ${left} perëndim; sa lindje nga nisja?`;}
  if(v===1){result=up-down;visual=`${up} hapa veri, ${down} jug; sa veri nga nisja?`;}
  if(v===2){result=right+left;visual=`${right} hapa përpara, ${left} hapa kthim; sa hapa u ecën gjithsej?`;}
  if(v===3||v===4||v===9){const turns=n+b,sign=v===4?-1:1,start=v===9?g%4:(g-1)%4;const d=((start+sign*turns)%4+4)%4;p=choice('Në cilin drejtim përfundon?',`Nisu drejt ${directions[start]}; ${turns} kthesa ${sign>0?'djathtas':'majtas'}.`,directions[d],directions.filter(x=>x!==directions[d]),'Çdo katër kthesa kthehemi në drejtimin fillestar.');break;}
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
  p={type:'placement',title:requests[v],visual:'Vëzhgo vargun, pastaj vendos numrin e kërkuar.',options:[],interaction:{scene:'memory',tokens:[...tokens].reverse(),targets:[{id:'s0',label:requests[v]}],preview:values.map((quantity,i)=>({id:`preview${i}`,asset:'number',label:String(quantity),quantity})),previewSeconds:Math.max(4,11-g-b)},answer:JSON.stringify([answer]),hint:`Vargu ka ${values.length} numra. Përqendrohu te kërkesa: ${requests[v].toLocaleLowerCase('sq')}`,hint2:`Gjej fillimisht nëse kërkohet skaji, një vend i caktuar apo krahasimi i numrave; pastaj vendos kartën.`,explain:`Numri i kërkuar është ${result}.`};break;
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
 case 'robotics':p=progressiveRobot(g,v,level,lesson.domain);break;
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
 if(g===4&&lesson.domain==='math'){
  const index=(level-1)%5,band=b;
  if(v===0){
   if(band===0){const left=32+index*7,right=15+index*3;p=N('Sa janë gjithsej?',`${left} + ${right}`,left+right);}
   else if(band===1){const left=248+index*17,right=37+index*13;p=N('Sa janë gjithsej?',`${left} + ${right}`,left+right);}
   else if(band===2){const x=126+index*31,y=275+index*23,z=48+index*17;p=N('Sa janë gjithsej?',`${x} + ${y} + ${z}`,x+y+z,'Mblidh njësitë dhe dhjetëshet; mbart dhjetëshet kur një kolonë arrin dhjetë.');}
   else{const missing=286+index*37,right=178+index*19,extra=35+index*11;p=N('Gjej furnizimin që mungon.',`? + ${right} + ${extra} = ${missing+right+extra}`,missing,'Zbrit nga gjithsej të dy sasitë që di për të gjetur pjesën që mungon.');}
  }else if(v===1){
   if(band===0){const total=73+index*7,used=24+index*2;p=N('Sa mbeten?',`${total} − ${used}`,total-used);}
   else if(band===1){const total=402+index*19,used=178+index*11;p=N('Sa mbeten?',`${total} − ${used}`,total-used,'Zbrit njësitë dhe dhjetëshet sipas kolonave; kur duhet, merr një dhjetëshe nga kolona fqinje.');}
   else if(band===2){const total=3204+index*137,used=1786+index*83;p=N('Sa mbeten në inventar?',`${total} − ${used}`,total-used);}
   else{const total=2400+index*215,left=935+index*47;p=N('Sa u përdorën?',`${total} − ? = ${left}`,total-left,'Sasia e përdorur dhe ajo që mbeti së bashku japin sasinë fillestare.');}
  }else if(v===2){
   if(band<2){const left=248+index*27,right=137+index*19;p=N('Gjej mbledhësin që mungon.',`? + ${left} = ${left+right}`,right);}
   else{const left=1250+index*118,right=378+index*43,extra=94+index*16;p=N('Gjej mbledhësin që mungon.',`? + ${left} + ${extra} = ${left+right+extra}`,right,'Hiq nga shuma dy mbledhësit që shfaqen për të gjetur të panjohurin.');}
  }else if(v===3){
   const start=band<2?1240+index*137:5230+index*217,removed=band<2?378+index*29:2684+index*113,result=start-removed;
   p=N('Gjej vlerën fillestare.',`? − ${removed} = ${result}`,start,'Shto përsëri pjesën e hequr te rezultati për të rikthyer numrin fillestar.');
  }else if(v===4){
   if(band===0){const groups=12+index*3,each=3+index;p=N('Sa sende prodhohen?',`${groups} × ${each}`,groups*each);}
   else if(band===1){const groups=24+index*5,each=16+index*3;p=N('Sa sende prodhohen?',`${groups} × ${each}`,groups*each,'Shpërbëje njërin faktor në dhjetëshe dhe njësi, pastaj mblidh prodhimet.');}
   else if(band===2){const rows=18+index*4,columns=23+index*3;p=N('Sa pllaka mbulojnë drejtkëndëshin?',`${rows} rreshta me nga ${columns} pllaka`,rows*columns,'Gjej numrin e rreshtave dhe kolonave; prodhimi jep sipërfaqen me pllaka.');}
   else{const first=14+index*3,second=25+index*4,groups=6+index;p=N('Sa sende ka në të gjitha grupet?',`(${first} + ${second}) × ${groups}`,(first+second)*groups,'Kryej fillimisht mbledhjen brenda kllapave, pastaj shumëzo me numrin e grupeve.');}
  }else if(v===5){
   const groups=12+index*3,each=14+index*5,total=groups*each;
   if(band<2)p=N('Sa sende vendosen në çdo kuti?',`${total} sende në ${groups} kuti`,each,'Ndaji sendet në mënyrë të barabartë mes kutive.');
   else{const remainder=index%3+1;p=N('Sa mbeten pasi mbushen kutitë?',`${total+remainder} sende në kuti me nga ${each}`,remainder,'Gjej sa kuti mbushen plot; sendet që nuk formojnë një kuti të plotë janë mbetja.');}
  }else if(v===6){
   const lower=112+index*37,upper=lower+28+index*5,even=2+index%3;
   p=N('Sa numra plotësojnë të dy kushtet?',`${lower} < numri ≤ ${upper}, numri është shumëfish i ${even}`,Array.from({length:upper-lower},(_,i)=>lower+i+1).filter(n=>n%even===0).length,'Gjej fillimisht numrat brenda kufijve, pastaj numëro vetëm shumëfishat e kërkuar.');
  }else if(v===7){
   const thousands=2+index,hundreds=3+(index*2)%7,tens=4+(index*3)%6,ones=index+1,result=thousands*1000+hundreds*100+tens*10+ones;
   p=N('Ndërto numrin nga vlerat vendore.',`${thousands} mijëshe + ${hundreds} qindëshe + ${tens} dhjetëshe + ${ones} njëshe`,result,'Secila shifër tregon vlerë të ndryshme sipas vendit: mijëshe, qindëshe, dhjetëshe dhe njëshe.');
  }else if(v===8){
   const first=18+index*7,second=4+index,third=3+index%4;
   const expressions=[`${first} + ${second} × ${third}`,`(${first} + ${second}) × ${third}`,`${first} × ${second} − ${third}`,`${first} + ${second} × ${third} − ${index+2}`];
   const values=[first+second*third,(first+second)*third,first*second-third,first+second*third-index-2];
   p=N('Kryej veprimet sipas përparësisë.',expressions[band],values[band],'Kryej fillimisht veprimet brenda kllapave; pa kllapa, shumëzimi vjen para mbledhjes dhe zbritjes.');
  }else{
   const factor=3+index%4,base=125+index*29,total=base*factor,offset=18+index*5;
   if(band===0)p=N('Gjej kutinë që mban baraspeshën.',`? + ${offset} = ${base}`,base-offset);
   else if(band===1)p=N('Gjej numrin e fshehur.',`? × ${factor} = ${total}`,base,'Pjesëto të dy anët me numrin e grupeve për të gjetur vlerën e kutisë.');
   else if(band===2)p=N('Gjej numrin që barazon të dy anët.',`${base} + ? = ${total/factor} × ${factor}`,total/factor-base);
   else p=N('Gjej numrin e fshehur.',`(? + ${offset}) × ${factor} = ${total+offset*factor}`,base,'Hiq fillimisht pjesën e shtuar dhe pastaj përdor pjesëtimin për të gjetur të panjohurin.');
  }
 }
 if(g===1&&lesson.domain==='math'){
  const left=level+1,right=1+Math.floor((level-1)/5),sum=left+right;
  const values=[sum,left,left,left,sum,1+(level-1)%5,left+1,(1+Math.floor((level-1)/10))*10+(level-1)%10,sum+Math.min(3,b),left];
  const cues=[`${left} + ${right}`,`${sum} − ${right}`,`? + ${right} = ${sum}`,`? − ${right} = ${left-right}`,`${left} + ${right}`,`${(1+(level-1)%5)*(2+Math.floor((level-1)/5))} sende ndahen në ${2+Math.floor((level-1)/5)} grupe`,`${left} < ? < ${left+2}`,`${(1+Math.floor((level-1)/10))*10} + ${(level-1)%10}`,`${left} + ${right} + ${Math.min(3,b)}`,`? + ${right} = ${sum}`];
  if(v===3)cues[v]=`? − ${right} = ${left}`;
  if(v===3)values[v]=sum;
  p=numeric(p.title,cues[v],values[v],`${cues[v]} → ${values[v]}`);
 }
 if(g===2&&lesson.domain==='math'&&[4,5,8].includes(v)){
  const group=2+b,each=3+(level+v)%8,total=group*each;
  p=v===4?numeric('Bashko grupet e barabarta.',Array(group).fill(each).join(' + '),total,`${group} grupe me ${each} sende japin ${total}.`):v===5?numeric('Ndaj sendet në grupe të barabarta.',`${total} sende në ${group} grupe. Sa ka çdo grup?`,each,`Çdo grup merr ${each} sende.`):numeric('Kryej dy mbledhje me radhë.',`${each} + ${group} + ${b+1}`,each+group+b+1,'Bashkojmë sasitë njëra pas tjetrës.');
 }
 if(g===1&&lesson.domain==='logic'&&v<=2)p=kidLogic(v,level,lesson.id);
 if(g===1&&lesson.domain==='algorithm'){
  const first=level+1,step=1+Math.floor((level-1)/10),hops=2+Math.floor((level-1)/10);
  if(v<=1)p=order('Rendit kartat e numrave.',Array.from({length:3+Math.floor(b/2)},(_,i)=>String(first+i)),v===1);
  else {
   const result=[0,0,first+hops,first,first+step,hops,first+step+1,first,step,first+step][v];
   const clue=['','',`Nisu te ${first}; ec ${hops} hapa përpara.`,`Nisu te ${first+hops}; ec ${hops} hapa mbrapa.`,`Ke ${first} sende. Shto ${step} sende.`,`Nisja është ${first}. Sa shigjeta ka në plan? ${Array(hops).fill('→').join(' ')}`,`Nisu te ${first}; shto ${step}, pastaj 1.`,`Pas ${step} hapave përpara je te ${first+step}. Ku ishe?`,`Nga ${first} te ${first+step}. Sa hapa përpara?`,`Ke ${first} sende; shto ${step}. Plani tha ${first+step+1}. Cili është rezultati i saktë?`][v];
   p=numeric('Ndiq hapat një nga një.',clue,result,`${clue} → ${result}`);
  }
 }
 if(g<=2&&lesson.domain==='programming')p=progressiveRobot(g,v,level,lesson.domain);
 if(lesson.domain==='spatial'&&v>=5)p=v===5?shapeBoard(g,v,level):v===6||v===7?pipeBoard(g,v,level):mazeBoard(g,v,level);
 if(lesson.domain==='memory'&&v<5)p=memoryBoard(g,v,level);
 if(p.type==='number'&&['math','patterns','thinking','programming','observation'].includes(lesson.domain))p=numberPlacement(p,g,level,v);
 p=mixTokens(p,seedOf(`${lesson.id}|${level}`));
 return {...p,id:`${lesson.id}-level-${level}`,grade:g,cat:lesson.category,level:Math.min(3,1+Math.floor((level-1)/10)),gameLevel:level,lessonId:lesson.id,lessonLevel:level,curriculumLesson:lesson.id,curriculumLevel:level,difficultyBand:b+1,title:`${lesson.title} · Niveli ${level}: ${p.title}`};
}
export function curriculumLevel(lessonId,level){return [curriculumPuzzle(lessonId,level)];}
