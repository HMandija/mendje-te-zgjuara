// Public bounded geometry and execution only. No catalog solutions.
export function drawTrace(board,commands){
 if(!Array.isArray(commands)||!commands.length||commands.length>board.maxCommands)return null;
 let [x,y]=board.start,d=board.direction;const points=[[x,y]];
 for(const c of commands){if(!c||Object.keys(c).some(k=>!['op','n'].includes(k))||!['forward','left','right'].includes(c.op)||!Number.isInteger(c.n)||c.n<1||c.n>8)return null;
  if(c.op==='forward'){for(let i=0;i<c.n;i++){x+=[0,1,0,-1][d];y+=[-1,0,1,0][d];if(x<0||y<0||x>board.size||y>board.size)return null;points.push([x,y]);}}
  else d=(d+(c.op==='right'?c.n:4-c.n%4))%4;
 }
 return points;
}
export function polygonAt(points,t){return points.map(([x,y])=>{for(let i=0;i<t.turn;i++)[x,y]=[-y,x];return [x+t.x,y+t.y];});}
function area(p){return Math.abs(p.reduce((s,[x,y],i)=>s+x*p[(i+1)%p.length][1]-y*p[(i+1)%p.length][0],0))/2;}
function inside(p,x,y){let result=false;for(let i=0,j=p.length-1;i<p.length;j=i++){const [xi,yi]=p[i],[xj,yj]=p[j];if((yi>y)!==(yj>y)&&x<(xj-xi)*(y-yi)/(yj-yi)+xi)result=!result;}return result;}
export function tangramSolved(b,placements){
 if(!creativeInput(b,placements))return false;
 const shapes=b.pieces.map((p,i)=>polygonAt(p,placements[i]));
 if(shapes.some(p=>p.some(([x,y])=>x<0||y<0||x>b.size||y>b.size)))return false;
 if(Math.abs(shapes.reduce((n,p)=>n+area(p),0)-b.silhouette.reduce((n,p)=>n+area(p),0))>.001)return false;
 // All vertices lie on a half-unit lattice and edges have slopes 0, 1, -1 or infinity.
 // Sample each of the resulting triangular cells away from its boundaries.
 for(let x=0;x<b.size;x+=.5)for(let y=0;y<b.size;y+=.5)for(const [dx,dy] of [[.25,.08],[.42,.25],[.25,.42],[.08,.25]]){
  const expected=b.silhouette.some(p=>inside(p,x+dx,y+dy));const count=shapes.filter(p=>inside(p,x+dx,y+dy)).length;if(count!==(expected?1:0))return false;
 }
 return true;
}
export function creativeInput(b,a){
 if(!Array.isArray(a))return false;
 if(b.kind==='color')return a.length===b.cells.length&&a.every(x=>Number.isInteger(x)&&x>=0&&x<b.palette.length);
 if(b.kind==='draw')return !!drawTrace(b,a);
 if(b.kind==='events')return a.length===b.events.length&&a.every(x=>typeof x==='string'&&b.actions.some(v=>v.id===x));
 if(b.kind==='story')return a.length===b.story.length&&a.every((x,i)=>b.story[i].options.some(v=>v.id===x));
 if(b.kind==='objects')return a.length===b.tokens.length&&a.every(x=>Number.isInteger(x)&&x>=-1&&x<b.goals.length);
 if(b.kind==='rules')return a.length===b.rounds.length&&a.every((r,i)=>Array.isArray(r)&&r.length===b.rounds[i].figures.length&&r.every(x=>Number.isInteger(x)&&x>=0&&x<b.rounds[i].labels.length));
 if(b.kind==='tangram')return a.length===7&&a.every(t=>t&&Object.keys(t).length===3&&['x','y'].every(k=>Number.isFinite(t[k])&&t[k]>=-8&&t[k]<=b.size&&Number.isInteger(t[k]*2))&&Number.isInteger(t.turn)&&t.turn>=0&&t.turn<=3);
 return false;
}
export function creativeCorrect(b,a,answer){
 if(!creativeInput(b,a))return false;
 if(b.kind==='draw')return JSON.stringify(drawTrace(b,a))===JSON.stringify(b.target);
 if(b.kind==='tangram')return tangramSolved(b,a);
 if(b.kind==='objects')return b.goals.every((goal,i)=>b.tokens.reduce((n,t,k)=>n+(a[k]===i?t.value:0),0)===goal);
 return JSON.stringify(a)===answer;
}
