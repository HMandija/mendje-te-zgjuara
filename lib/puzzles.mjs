// Server-only original exercises for grades 1-4.
export {CATEGORIES} from './categories.mjs';
export function shuffle(a){const b=[...a];for(let i=b.length-1;i>0;i--){let j=Math.floor(Math.random()*(i+1));[b[i],b[j]]=[b[j],b[i]];}return b;}
function q(title,visual,answer,others,explain,hint){return {title,visual,answer:String(answer),options:shuffle([...new Set([String(answer),...others.map(String)])]).slice(0,4),explain,hint};}
function generatedQuestions(grade,cat){const out=[];const names=['Ana','Beni','Era','Dori','Lira','Ardi','Sara','Tomi','Ina','Joni'];
 for(let i=0;i<12;i++){
  const n=i+2,g=grade;
  if(cat==='patterns'){
   const step=g===1?1:g===2?2:g===3?3:4;let a=n;
   if(g===4&&i%2===0){const ans=n*16;out.push(q('Çdo numër dyfishohet. Cili vjen më pas?',`${n} → ${n*2} → ${n*4} → ${n*8} → ?`,ans,[ans-2,n*10,ans+2],`Çdo herë shumëzojmë me 2. ${n*8} × 2 = ${ans}.`,'Krahaso çdo numër me atë përpara tij.'));}
   else out.push(q('Vargu ndjek të njëjtin rregull. Gjej numrin tjetër.',`${a} · ${a+step} · ${a+step*2} · ${a+step*3} · ?`,a+step*4,[a+step*4+1,a+step*3,a+step*4+3],`Shtojmë ${step} në çdo hap. ${a+step*3} + ${step} = ${a+step*4}.`,'Sa ndryshon numri nga një hap te tjetri?'));
  }
  if(cat==='math'){
   if(g===1){const b=i%4+1;out.push(q(`${names[i%10]} ka ${n} lapsa. Merr edhe ${b}. Sa lapsa ka tani?`,`${n} + ${b} = ?`,n+b,[n+b+1,n+b-1,n+b+2],`Bashkojmë të dy grupet: ${n} + ${b} = ${n+b}.`,'Kur marrim lapsa të tjerë, numri rritet.'));}
   if(g===2){const total=n*3+10,b=n+2;out.push(q(`Në raft janë ${total} libra. Fëmijët marrin ${b}. Sa mbeten?`,`${total} − ${b} = ?`,total-b,[total-b+2,total+b,total-b-1],`Heqim librat e marrë: ${total} − ${b} = ${total-b}.`,'A duhet të shtojmë apo të zbresim?'));}
   if(g===3){const b=i%5+2;out.push(q(`Ka ${n} kuti me nga ${b} topa. Sa topa ka gjithsej?`,`${n} kuti × ${b} topa`,n*b,[n+b,n*b+b,n*b-1],`Kemi ${n} grupe të barabarta: ${n} × ${b} = ${n*b}.`,'Përdor mbledhjen e përsëritur ose shumëzimin.'));}
   if(g===4){const groups=i%5+2,total=n*groups;out.push(q(`${total} fletore ndahen barabar mes ${groups} nxënësve. Secili përdor 1. Sa i mbeten secilit?`,`${total} ÷ ${groups} − 1`,n-1,[n,n+1,total-groups],`Së pari ndajmë: ${total} ÷ ${groups} = ${n}. Pastaj zbresim 1: mbeten ${n-1}.`,'Ky problem ka dy hapa. Fillimisht ndaji barabar.'));}
  }
  if(cat==='logic'){
   if(g===1){const shapes=['rreth','katror','trekëndësh'];const chosen=shapes[i%3];const correct=chosen==='rreth'?'Asnjë kënd':chosen==='katror'?'4 kënde':'3 kënde';out.push(q(`Sa kënde ka një ${chosen}?`,chosen==='rreth'?'○':chosen==='katror'?'□':'△',correct,['Asnjë kënd','3 kënde','4 kënde','5 kënde'].filter(x=>x!==correct),`Një ${chosen} ka ${correct.toLowerCase()}.`,'Vëzhgo vendet ku takohen brinjët.'));}
   else if(i%3===0){out.push(q(`Lira është më e gjatë se Beni. Era është më e gjatë se Beni. Kush është më e gjatë: Lira apo Era?`,'Dy krahasime. A mjaftojnë?', 'Nuk kemi të dhëna të mjaftueshme',['Lira','Era','Janë njësoj'],`Dimë vetëm se të dy janë më të gjatë se Beni. Nuk kemi krahasim mes tyre.`,'Mos supozo një lidhje që nuk është dhënë.'));}
   else if(g===2){out.push(q(`Kutia A ka ${n} topa. Kutia B ka ${n+2}. Kutia C ka ${n+4}. Cila ka më shumë?`,'A  ◇     B  ◇     C  ◇','Kutia C',['Kutia A','Kutia B','Të gjitha njësoj'],`${n+4} është më i madh se ${n+2} dhe ${n}. Prandaj kutia C ka më shumë.`,'Krahaso numrat e të tri kutive.'));}
   else if(g===3){out.push(q('Të gjithë katrorët kanë 4 brinjë. Kjo figurë ka 4 brinjë. A duhet të jetë patjetër katror?','4 brinjë → katror?', 'Jo, mund të jetë drejtkëndësh',['Po, patjetër','Po, nëse është blu','Jo, është patjetër rreth'],`Edhe një drejtkëndësh mund të ketë 4 brinjë. Vetëm numri i brinjëve nuk mjafton për ta quajtur katror.`,'Mendo një figurë tjetër me 4 brinjë.'));}
   else {const a=n*2;out.push(q(`Ana ka ${a} pikë, Beni ka ${n} më shumë se Ana, Era ka 1 më pak se Beni. Kush ka më shumë pikë?`,'Ana → Beni → Era','Beni',['Ana','Era','Të tre njësoj'],`Ana: ${a}; Beni: ${a+n}; Era: ${a+n-1}. Beni ka më shumë.`,'Shkruaj pikët për secilin, pastaj krahasoji.'));}
  }
  if(cat==='spatial'){
   const right=i%3+1,up=g===1?1:g;const left=g>2?1:0;const down=g===4?1:0;const dx=right-left,dy=up-down;
   const end=`${dx} djathtas, ${dy} lart`;
   out.push(q('Nisu nga ●. Ku përfundon në krahasim me pikën e nisjes?',`${'→ '.repeat(right)}${'↑ '.repeat(up)}${'← '.repeat(left)}${'↓ '.repeat(down)}`,end,[`${dx+1} djathtas, ${dy} lart`,`${dx} djathtas, ${dy+1} lart`,`${dx} majtas, ${dy} poshtë`],`Lëvizjet e kundërta anulohen. Horizontalisht: ${right} − ${left} = ${dx} djathtas. Vertikalisht: ${up} − ${down} = ${dy} lart.`,'Numëro veçmas lëvizjet horizontale dhe vertikale.'));
  }
  if(cat==='memory'){
   const symbols=['●','▲','■','★','◆','♥'];const len=g+2;const seq=shuffle(symbols).slice(0,len);const pos=i%len;const target=seq[pos];const item=q(`Cili simbol ishte në vendin ${pos+1}?`,seq.join('   '),target,symbols.filter(x=>x!==target).slice(0,3),`Rendi ishte ${seq.join(' → ')}. Në vendin ${pos+1} ishte ${target}.`,'Mund ta shikosh sërish vargun; kjo nuk ul rezultatin.');item.memory=true;out.push(item);
  }
  if(cat==='code'){
   if(g===1){const tasks=[['Për të mbjellë një farë, cili hap vjen i pari?','Përgatit dheun',['Ujit bimën e rritur','Mbledh lulet','Shkul bimën'],'Së pari përgatitim dheun, pastaj vendosim farën dhe ujitim.'],['Për të larë duart, çfarë bëjmë përpara se t’i thajmë?','I shpëlajmë',['Mbyllim çantën','Veshim dorezat','Marrim librin'],'Pas sapunit, i shpëlajmë duart dhe pastaj i thajmë.']];const t=tasks[i%2];out.push(q(t[0],'1 → 2 → 3',t[1],t[2],t[3],'Imagjino rendin e veprimeve.'));}
   else {const times=g===2?2:g===3?3:4;const add=i%3+1,start=n;const ans=start+times*add;out.push(q(`Fillo me ${start}. Përsërit ${times} herë: «shto ${add}». Cili është rezultati?`,`FILLIM ${start}\n↻ ${times} herë: +${add}`,ans,[ans+add,start+add,ans-1],`Shtojmë ${add}, ${times} herë: ${start} + ${times} × ${add} = ${ans}.`,'Për çdo përsëritje bëj vetëm një mbledhje.'));}
  }
 }
 return out;
}
export function questions(grade,cat){let out=[];if(cat==='errors'||cat==='whatif'){
 for(let i=0;i<12;i++){let a=grade===4&&cat==='whatif'?(i+2)*2:i+2,b=grade+1;
  if(cat==='errors'){
   if(grade<=2){const wrong=a+b+1;out.push(q(`Një robot shkroi ${a} + ${b} = ${wrong}. Cili është rezultati i saktë?`,`${a} + ${b} = ${wrong} ✗`,a+b,[wrong,a+b-1,a+b+2],`Roboti shtoi një më tepër. ${a} + ${b} = ${a+b}, jo ${wrong}.`,'Numëro grupet edhe një herë.'));}
   else if(grade===3){out.push(q(`Roboti ka ${a} kuti me nga ${b} lapsa. Ai i mbledh numrat dhe thotë ${a+b}. Çfarë duhet të bëjë?`,`${a} kuti · ${b} lapsa për kuti`,'Të shumëzojë kutitë me lapsat për kuti',['Të zbresë numrat','Të shtojë vetëm 1','Të përdorë vetëm numrin e kutive'],`Grupet janë të barabarta: ${a} × ${b} = ${a*b}. Mbledhja ${a} + ${b} nuk jep numrin e lapsave.`,'Çdo kuti ka të njëjtin numër lapsash.'));}
   else{out.push(q(`Një robot zgjidh ${a} + 3 × 2 dhe merr ${(a+3)*2}. Cilin veprim duhet të kryejë të parin?`,`${a} + 3 × 2`,'Shumëzimin 3 × 2',['Mbledhjen me 3','Shumëzimin e të gjithë shumës','Zbritjen me 2'],`Pa kllapa, shumëzimi kryhet i pari: 3 × 2 = 6; pastaj ${a} + 6 = ${a+6}.`,'Kontrollo radhën e veprimeve.'));}
  }else{
   if(grade===1){out.push(q(`Ke ${a} kube dhe merr ${b}. Po sikur të marrësh edhe 1 kub më shumë? Sa do të kesh?`,`${a} + ${b} → ${a} + ${b+1}`,a+b+1,[a+b,a+b+2,a],`Kur shtojmë një kub më tepër, shuma rritet me 1: ${a} + ${b+1} = ${a+b+1}.`,'Çfarë ndryshon kur shtojmë një më shumë?'));}
   else if(grade===2){out.push(q(`Nga ${a+10} libra merr ${b}. Po sikur të marrësh edhe 2 libra më shumë? Sa mbeten?`,`${a+10} − ${b+2}`,a+10-b-2,[a+10-b,a+10-b+2,a+10],`Heqim ${b+2} libra. Mbeten ${a+10-b-2}, pra 2 më pak se më parë.`,'Kur marrim më shumë libra, sa mbeten në raft?'));}
   else if(grade===3){out.push(q(`Ka ${a} kuti me nga ${b} topa. Po sikur çdo kuti të ketë edhe 1 top? Me sa rritet numri gjithsej?`,`${a} kuti · nga 1 top shtesë`,a,[a+1,b,a*b],`Çdo kuti shton 1 top. Në ${a} kuti shtohen ${a} topa gjithsej.`,'Ndryshimi ndodh në secilën kuti.'));}
   else {out.push(q(`${a*b} fletore ndahen mes ${b} fëmijëve. Po sikur numri i fëmijëve të dyfishohet, me po aq fletore? Sa merr secili?`,`${a*b} ÷ ${b*2}`,a/2,[a,a*2,a/2+1],`Dyfishohen fëmijët, por fletoret mbeten po aq. Secili merr gjysmën: ${a*b} ÷ ${b*2} = ${a/2}.`,'E njëjta sasi ndahet mes më shumë fëmijëve.'));}
  }
 }
}else out=generatedQuestions(grade,cat);
return out; }
