import {scenarioSeed} from './scenario-seeds.mjs';
import {gamesForGrade} from './game-catalog.mjs';
import {neighbour} from './board-rules.mjs';
function random(seed){let x=seed;return()=>{x=(Math.imul(x,1664525)+1013904223)>>>0;return x/4294967296;};}
function shuffled(values,rng){const x=[...values];for(let i=x.length-1;i>0;i--){const n=Math.floor(rng()*(i+1));[x[i],x[n]]=[x[n],x[i]];}return x;}
function problem(grade,variant,scene,type,cat,title,interaction,answer,hint,explain){return {id:`original-interactive-${grade}-${scene}-${variant}`,grade,gameLevel:variant,gameRevision:1,level:Math.min(3,1+Math.floor((variant-1)/7)),type,cat,title,visual:'',options:[],interaction,answer:JSON.stringify(answer),hint,explain};}
function maze(size,seed){
 const rng=random(seed),cells=Array(size*size).fill('#'),stack=[0],visited=new Set([0]);cells[0]='.';
 while(stack.length){const cell=stack[stack.length-1],choices=shuffled([0,1,2,3],rng);let next=-1,middle=-1;
  for(const d of choices){const m=neighbour(cell,d,size),n=m<0?-1:neighbour(m,d,size);if(n>=0&&!visited.has(n)){next=n;middle=m;break;}}
  if(next<0){stack.pop();continue;}visited.add(next);cells[next]=cells[middle]='.';stack.push(next);
 }
 const end=size*size-1,queue=[[0]],seen=new Set([0]);let answer;
 while(queue.length){const path=queue.shift(),last=path.at(-1);if(last===end){answer=path;break;}for(let d=0;d<4;d++){const n=neighbour(last,d,size);if(n>=0&&cells[n]==='.'&&!seen.has(n)){seen.add(n);queue.push([...path,n]);}}}
 return {scene:'maze',size,cells,start:0,end,answer};
}
export function pipePath(size,rng){
 const count=size*size,start=[0,size-1,count-size,count-1][Math.floor(rng()*4)],path=[start],seen=new Set(path);let attempts=0;
 function visit(cell){if(path.length===count)return true;if(++attempts>3000)return false;const choices=shuffled([0,1,2,3],rng).map(d=>neighbour(cell,d,size)).filter(n=>n>=0&&!seen.has(n));choices.sort((a,b)=>[0,1,2,3].filter(d=>{const n=neighbour(a,d,size);return n>=0&&!seen.has(n);}).length-[0,1,2,3].filter(d=>{const n=neighbour(b,d,size);return n>=0&&!seen.has(n);}).length);for(const next of choices){seen.add(next);path.push(next);if(visit(next))return true;path.pop();seen.delete(next);}return false;}
 if(visit(start))return path;return Array.from({length:count},(_,i)=>Math.floor(i/size)*size+(Math.floor(i/size)%2?size-1-i%size:i%size));
}
export function interactivePuzzles(){const seenMemory=new Set(),seenMazes=new Set();return [1,2,3,4].flatMap(grade=>Array.from({length:20},(_,i)=>i+1).flatMap(variant=>{
 const rng=random(grade*113+variant*71),tier=Math.floor((variant-1)/5),size=grade===1?3:4,count=Math.min(grade===2?5:9,grade+Math.floor(grade/2)+tier);
 let positions=shuffled(Array.from({length:size*size},(_,i)=>i),rng).slice(0,count);
 while(seenMemory.has(size+':'+positions.join(',')))positions=shuffled(Array.from({length:size*size},(_,i)=>i),rng).slice(0,count);
 seenMemory.add(size+':'+positions.join(','));
 const tokens=[{id:'a',asset:'star',label:'Ylli i artë'},{id:'b',asset:'apple',label:'Molla e kuqe'},{id:'c',asset:'owl',label:'Bufi vjollcë'},{id:'d',asset:'flower',label:'Lulja blu',color:'sky'},{id:'e',asset:'turtle',label:'Breshka e gjelbër'},{id:'f',asset:'pear',label:'Dardha'},{id:'g',asset:'rabbit',label:'Lepuri'},{id:'h',asset:'book',label:'Libri'},{id:'i',asset:'carrot',label:'Karota'}].slice(0,count);
 const memoryAnswer=Array(size*size).fill('_');positions.forEach((position,i)=>memoryAnswer[position]=tokens[i].id);
 const pipeSize=Math.min(5,[2,3,3,4][grade-1]+Math.floor((tier+(grade===3?1:0))/2)),path=pipePath(pipeSize,rng);
 const pipes=Array.from({length:pipeSize*pipeSize},(_,i)=>({id:`t${i}`,exits:[],rotation:1+Math.floor(rng()*3)}));
 for(let i=0;i<path.length;i++)for(const n of [path[i-1],path[i+1]].filter(n=>n!==undefined))pipes[path[i]].exits.push([0,1,2,3].find(d=>neighbour(path[i],d,pipeSize)===n));
 let mazeSeed=grade*163+variant*89+scenarioSeed(`original-interactive-${grade}-maze-${variant}`)*1009,generated=maze(grade*2+3+(tier>=2?2:0),mazeSeed);
 while(seenMazes.has(generated.size+':'+generated.cells.join('')))generated=maze(grade*2+3+(tier>=2?2:0),mazeSeed+=1009);
 seenMazes.add(generated.size+':'+generated.cells.join(''));
 const {answer:mazeAnswer,...mazeBoard}=generated;
 return [
  problem(grade,variant,'memory-grid','placement','memory',`${gamesForGrade(grade)[0].title} · Niveli ${variant}: mbaj mend vendet e figurave.`,{scene:'memory-grid',size,previewSeconds:Math.max(5,11-grade-tier),tokens:shuffled(tokens,rng),targets:memoryAnswer.map((_,i)=>({id:`s${i}`,label:`Rreshti ${Math.floor(i/size)+1}, kolona ${i%size+1}`})),preview:tokens.map((t,i)=>({...t,position:positions[i]}))},memoryAnswer,'Shiko sërish. Lidh çdo figurë me një cep ose një rresht të rrjetit.','Figurat ruajnë rreshtin dhe kolonën që pe në fillim. Vendet e tjera mbeten bosh.'),
  problem(grade,variant,'pipes','pipes','spatial',`${gamesForGrade(grade)[1].title} · Niveli ${variant}: rrotullo tubat dhe lidh të gjithë rrugën.`,{scene:'pipes',size:pipeSize,pipes,start:path[0],end:path.at(-1)},pipes.map(()=>0),'Nis nga pika e ujit. Çdo dalje duhet të takojë hyrjen e tubit fqinj.','Tubat duhet të lidhen pa skaje të hapura. Uji kalon nga nisja deri te mbërritja përmes të gjitha pllakave.'),
  problem(grade,variant,'maze','maze','code',`${gamesForGrade(grade)[2].title} · Niveli ${variant}: gjej rrugën për te pikniku.`,mazeBoard,mazeAnswer,'Shiko një kryqëzim përpara se të lëvizësh. Nëse rruga mbyllet, kthehu një hap.','Një rrugë e vlefshme kalon vetëm në korridore dhe mbaron te pikniku. Kthimi prapa ndihmon të provosh një rrugë tjetër.'),
 ];}));}
