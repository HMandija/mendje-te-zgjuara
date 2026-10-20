// Server-only missions. Distinct seeded corridors, rather than reused snake slices.
import {commandsForGrade,validProgram} from './robot-rules.mjs';
import {scenarioSeed} from './scenario-seeds.mjs';
export function missionHash(text){let n=2166136261;for(const c of text)n=Math.imul(n^c.charCodeAt(0),16777619)>>>0;return n;}
function random(seed){let n=seed;return()=>{n=(Math.imul(n,1664525)+1013904223)>>>0;return n/4294967296;};}
function neighbours(cell,size){const x=cell%size,y=Math.floor(cell/size);return [y?cell-size:-1,x<size-1?cell+1:-1,y<size-1?cell+size:-1,x?cell-1:-1].filter(n=>n>=0);}
export function progressiveRobot(grade,variant,level,family='robotics',salt=0){
 const size=grade+4,moves=(grade===1?2:grade+1)+Math.floor((level-1)/(grade===1?3:2)),direction=variant%4;
 const seed=missionHash(`${family}:${grade}:${variant}:${level}:${salt+scenarioSeed(`curriculum-g${grade}-${family}-${variant+1}-level-${level}`)}`),rng=random(seed);
 for(let attempt=0;attempt<180;attempt++){
  const path=[Math.floor(rng()*size*size)],seen=new Set(path);
  while(path.length<=moves){
   const current=path.at(-1),choices=neighbours(current,size).filter(p=>!seen.has(p)&&neighbours(p,size).filter(n=>seen.has(n)).length===1);
   if(!choices.length)break;const next=choices[Math.floor(rng()*choices.length)];path.push(next);seen.add(next);
  }
  if(path.length!==moves+1)continue;
  const cells=Array(size*size).fill('#');for(const p of path)cells[p]='.';
  const goalCount=Math.min(moves,1+Math.floor((level-1)/10)+(variant>=5?1:0)),goals=Array.from({length:goalCount},(_,i)=>path[Math.ceil(moves*(i+1)/goalCount)]);
  const program=[];let facing=direction;
  for(let i=1;i<path.length;i++){
   const diff=path[i]-path[i-1],d=diff===-size?0:diff===1?1:diff===size?2:3;
   if(grade<=2)program.push({op:['north','east','south','west'][d]});
   else{const turn=(d-facing+4)%4;if(turn===3)program.push({op:'left'});else for(let k=0;k<turn;k++)program.push({op:'right'});program.push({op:'forward'});facing=d;}
  }
  const folded=[];for(let i=0;i<program.length;){let j=i+1;while(j<program.length&&program[j].op===program[i].op&&j-i<8)j++;if(grade>=2&&j-i>=2)folded.push({op:'repeat',n:j-i,body:[program[i]]});else folded.push(...program.slice(i,j));i=j;}
  if(grade===4&&level>=16){const i=folded.findIndex(c=>c.op==='forward'||c.op==='repeat'&&c.body[0].op==='forward');if(i>=0)folded[i]={op:'ifClear',body:[folded[i]]};}
  const interaction={scene:'robot',size,cells,start:path[0],end:path.at(-1),goals,direction,commands:commandsForGrade(grade),grade};
  if(!validProgram(interaction,folded))continue;
  const stars=goals.length,turns=program.filter(c=>c.op==='left'||c.op==='right').length,repeats=folded.filter(c=>c.op==='repeat').length;
  const explain=`Rruga ka ${moves} lëvizje dhe ${stars} ${stars===1?'yll':'yje'}. ${turns?`Programi bën ${turns} kthesa; `:''}${repeats?`përsërit ${repeats} grup komandash dhe `:''}e çon arushin te flamuri.`;
  const hint=`Ndiq korridorin me ${moves} lëvizje. Gjej ${stars} ${stars===1?'yllin':'yjet'} dhe shiko drejtimin në çdo kthesë.`;
  return {type:'robot',title:'Programo arushin të ndjekë rrugën.',visual:grade<=2?'Vendos shigjetat dhe vizito yjet përpara flamurit.':'Planifiko kthesat, përdor përsëritjet dhe vizito çdo objektiv.',options:[],interaction,answer:JSON.stringify(folded),hint,hint2:`Kontrollo nisjen, drejtimin e parë (${['veri','lindje','jug','perëndim'][direction]}) dhe rendin e yjeve në korridor. Sigurohu që komanda e fundit të çojë te flamuri.`,explain};
 }
 throw new Error(`Cannot construct robot corridor: ${grade}/${variant}/${level}`);
}
