export const tangramPieces=[[[0,0],[4,0],[2,2]],[[0,0],[2,2],[0,4]],[[0,0],[0,2],[-2,2]],[[0,0],[1,-1],[2,0]],[[0,0],[2,0],[1,1]],[[0,0],[1,-1],[2,0],[1,1]],[[0,0],[1,-1],[2,-2],[2,0]]];
// Compare the union boundary, not piece order, translations or rotations.
export function tangramShapeKey(polygons){
 const keys=[];
 for(let turn=0;turn<4;turn++){
  const rotated=polygons.map(p=>p.map(point=>{let [x,y]=point;for(let i=0;i<turn;i++)[x,y]=[-y,x];return [x,y];}));
  const all=rotated.flat(),minX=Math.min(...all.map(p=>p[0])),minY=Math.min(...all.map(p=>p[1])),edges=new Map();
  for(const polygon of rotated)for(let i=0;i<polygon.length;i++){
   const a=polygon[i],b=polygon[(i+1)%polygon.length],n=Math.max(Math.abs(a[0]-b[0]),Math.abs(a[1]-b[1]))*2;
   for(let s=0;s<n;s++){const points=[s,s+1].map(k=>[2*(a[0]-minX)+(b[0]-a[0])*2*k/n,2*(a[1]-minY)+(b[1]-a[1])*2*k/n].join(','));const key=points.sort().join(':');edges.set(key,(edges.get(key)||0)+1);}
  }
  keys.push([...edges].filter(([,count])=>count===1).map(([key])=>key).sort().join('|'));
 }
 return keys.sort()[0];
}
