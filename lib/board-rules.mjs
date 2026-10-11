// Public rules only. No generated solutions or server catalog imports.
export function neighbour(index,direction,size){
 const row=Math.floor(index/size),col=index%size;
 if(direction===0)return row>0?index-size:-1;
 if(direction===1)return col<size-1?index+1:-1;
 if(direction===2)return row<size-1?index+size:-1;
 return col>0?index-1:-1;
}
export function pipeConnected(board,rotations){
 const exits=board.pipes.map((tile,i)=>tile.exits.map(d=>(d+rotations[i])%4));
 for(let i=0;i<exits.length;i++)for(const d of exits[i]){
  const n=neighbour(i,d,board.size);if(n<0||!exits[n].includes((d+2)%4))return false;
 }
 const seen=new Set([board.start]),queue=[board.start];
 while(queue.length){const i=queue.pop();for(const d of exits[i]){const n=neighbour(i,d,board.size);if(!seen.has(n)){seen.add(n);queue.push(n);}}}
 return seen.size===board.pipes.length&&seen.has(board.end);
}
export function mazeWalk(board,path){
 if(path[0]!==board.start)return false;
 for(let i=0;i<path.length;i++){
  const cell=path[i];if(!Number.isInteger(cell)||cell<0||cell>=board.cells.length||board.cells[cell]==='#')return false;
  if(i&&!Array.from({length:4},(_,d)=>neighbour(path[i-1],d,board.size)).includes(cell))return false;
 }
 return true;
}
