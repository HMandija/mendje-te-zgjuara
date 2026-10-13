// Offline original geometry generation. Runtime uses the verified bounded bank.
import {writeFile} from 'node:fs/promises';
import {tangramPieces,tangramShapeKey} from '../lib/tangram-pieces.mjs';
import {polygonAt,tangramSolved} from '../lib/creative-rules.mjs';
let seed=213927;const rng=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
const shuffle=a=>a.map(value=>({value,rank:rng()})).sort((a,b)=>a.rank-b.rank).map(x=>x.value);
function inside(p,x,y){let result=false;for(let i=0,j=p.length-1;i<p.length;j=i++){const [xi,yi]=p[i],[xj,yj]=p[j];if((yi>y)!==(yj>y)&&x<(xj-xi)*(y-yi)/(yj-yi)+xi)result=!result;}return result;}
const probes=[[.25,.08],[.42,.25],[.25,.42],[.08,.25]];
const footprints=tangramPieces.map(piece=>Array.from({length:4},(_,turn)=>{
 const p=polygonAt(piece,{x:0,y:0,turn}),cells=[];
 for(let x=Math.min(...p.map(p=>p[0]));x<Math.max(...p.map(p=>p[0]));x+=.5)for(let y=Math.min(...p.map(p=>p[1]));y<Math.max(...p.map(p=>p[1]));y+=.5)probes.forEach(([dx,dy],i)=>{if(inside(p,x+dx,y+dy))cells.push([x*2,y*2,i]);});
 return cells;
}));
const cellKey=(t,x,y,s)=>`${x+t.x*2},${y+t.y*2},${s}`;
function sharesEdge(a,b){
 for(let i=0;i<a.length;i++)for(let j=0;j<b.length;j++){
  const p=a[i],q=a[(i+1)%a.length],r=b[j],s=b[(j+1)%b.length],cross=v=>(q[0]-p[0])*(v[1]-p[1])-(q[1]-p[1])*(v[0]-p[0]);
  if(cross(r)||cross(s))continue;const axis=p[0]===q[0]?1:0;if(Math.min(Math.max(p[axis],q[axis]),Math.max(r[axis],s[axis]))-Math.max(Math.min(p[axis],q[axis]),Math.min(r[axis],s[axis]))>=.5)return true;
 }
 return false;
}
const models=new Map();
for(let attempt=0;attempt<12000&&models.size<240;attempt++){
 const transforms=[{x:4,y:4,turn:Math.floor(rng()*4)}],polygons=[polygonAt(tangramPieces[0],transforms[0])],occupied=new Set(footprints[0][transforms[0].turn].map(([x,y,s])=>cellKey(transforms[0],x,y,s)));
 for(let i=1;i<7;i++){
  const candidates=new Map();
  for(let turn=0;turn<4;turn++)for(const anchor of polygons.flat())for(const vertex of polygonAt(tangramPieces[i],{x:0,y:0,turn})){
   const t={x:anchor[0]-vertex[0],y:anchor[1]-vertex[1],turn},polygon=polygonAt(tangramPieces[i],t);
   if(polygon.some(([x,y])=>x<0||y<0||x>12||y>12)||footprints[i][turn].some(([x,y,s])=>occupied.has(cellKey(t,x,y,s)))||!polygons.some(p=>sharesEdge(p,polygon)))continue;
   candidates.set(JSON.stringify(t),{t,polygon});
  }
  const candidate=shuffle([...candidates.values()])[0];if(!candidate)break;
  transforms.push(candidate.t);polygons.push(candidate.polygon);for(const [x,y,s] of footprints[i][candidate.t.turn])occupied.add(cellKey(candidate.t,x,y,s));
 }
 if(transforms.length!==7)continue;
 const key=tangramShapeKey(polygons);if(models.has(key))continue;
 const all=polygons.flat(),minX=Math.min(...all.map(p=>p[0])),minY=Math.min(...all.map(p=>p[1]));
 const centered=transforms.map(t=>({...t,x:t.x-minX+1,y:t.y-minY+1})),silhouette=tangramPieces.map((p,i)=>polygonAt(p,centered[i]));
 if(silhouette.flat().some(([x,y])=>x>12||y>12))continue;
 const width=Math.max(...all.map(p=>p[0]))-minX,height=Math.max(...all.map(p=>p[1]))-minY;
 const score=key.split('|').length+width*height+transforms.reduce((s,t)=>s+(t.turn!==0?1:0),0);
 const model={score,transforms:centered};
 if(!tangramSolved({kind:'tangram',size:12,pieces:tangramPieces,silhouette},centered))throw Error('Invalid model');
 models.set(key,model);
}
if(models.size<120)throw Error('Insufficient distinct tangram shapes');
const sorted=[...models.values()].sort((a,b)=>a.score-b.score),bank=Array.from({length:4},(_,g)=>Array.from({length:30},(_,i)=>sorted[Math.floor((g*30+i)*(sorted.length-1)/119)]));
await writeFile(new URL('../lib/tangram-layouts.mjs',import.meta.url),'// SERVER ONLY: 120 verified original silhouettes, ordered by geometric complexity.\nexport const tangramLayouts='+JSON.stringify(bank)+';\n');
console.log(`Tangram: ${models.size} distinct connected shapes; 120 selected in increasing geometric complexity.`);
