// Original, server-only board generation. Existing snapshots remain immutable.
import {commandsForGrade} from './robot-rules.mjs';
export function robotPuzzles(selected){return (selected?[selected]:[1,2,3,4]).flatMap(grade=>Array.from({length:20},(_,i)=>{
 const gameLevel=i+1,size=grade===1?4:grade===2?5:6;
 // A serpentine route changes its start, length and horizontal orientation.
 const snake=[];for(let y=0;y<size;y++)for(let x=0;x<size;x++)snake.push(y*size+(y%2?size-1-x:x));
 const length=Math.min(size*size-2,grade===1?2+Math.floor(i/2):grade===2?4+i:grade===3?6+i:7+i);
 const startIndex=i%(size*size-length),route=snake.slice(startIndex,startIndex+length+1).map(p=>i%2?Math.floor(p/size)*size+size-1-p%size:p);
 const cells=Array(size*size).fill('#');for(const p of route)cells[p]='.';
 const goals=grade>=2?[route[Math.floor(route.length/2)],route.at(-1)]:[route.at(-1)];
 let direction=0;const program=[];for(let n=1;n<route.length;n++){const diff=route[n]-route[n-1],d=diff===-size?0:diff===1?1:diff===size?2:3;if(grade<=2)program.push({op:['north','east','south','west'][d]});else{const turns=(d-direction+4)%4;if(turns===3)program.push({op:'left'});else for(let t=0;t<turns;t++)program.push({op:'right'});program.push({op:'forward'});direction=d;}}
 // Fold straight runs into loops. Grade 4 later boards use nested repetitions
 // and conditions; any valid program reaching every goal is accepted.
 const folded=[];for(let n=0;n<program.length;){let k=n+1;while(k<program.length&&program[k].op===program[n].op&&k-n<8)k++;if(grade>=2&&k-n>=2)folded.push({op:'repeat',n:k-n,body:[program[n]]});else folded.push(...program.slice(n,k));n=k;}
 const answer=folded;
 return {id:`robot-g${grade}-${gameLevel}`,grade,cat:'code',type:'robot',level:Math.min(3,1+Math.floor(i/7)),gameLevel,gameRevision:2,title:grade<=2?`Roboti në kopsht · ${gameLevel}`:`Ekspedita e robotit · ${gameLevel}`,visual:grade===1?'Ndihmo robotin të arrijë te flamuri.':grade===2?'Vizito të gjithë yjet, pastaj flamurin.':grade===3?'Planifiko lëvizjet dhe kthesat. Vizito yjet dhe arrij te flamuri.':'Përdor kthesa, përsëritje ose kushte për të vizituar yjet dhe arritur te flamuri.',options:[],interaction:{scene:'robot',size,cells,start:route[0],end:route.at(-1),goals,direction:0,commands:commandsForGrade(grade),grade},answer:JSON.stringify(answer),hint:'Ndiq rrugën me sy nga roboti te flamuri. Kontrollo se ku ndryshon drejtimi.',explain:'Një program funksionon kur komandat kryhen në rendin e duhur. Roboti vizitoi çdo objektiv dhe arriti te flamuri.'};
 }));}
