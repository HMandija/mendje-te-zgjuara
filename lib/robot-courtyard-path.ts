export type YardPoint={x:number;z:number};
export const YARD_HOME={x:-4,z:.5},YARD_FLOWER={x:1,z:-1.5};
export const YARD_TREES=[[-8,-5,1.2,0],[-7,-7,1,1],[-1,-7,1.1,0],[3,-7,1.15,1],[8,-5,1.2,0],[8,3,1,1],[4,6,.9,0],[-8,3.5,1,0],[-1,6.5,.8,1]];
export function yardWalkable(p:YardPoint){
 if(Math.abs(p.x)>9||Math.abs(p.z)>7.5)return false;
 if(p.x>-7.5&&p.x<-.5&&p.z>-6&&p.z<0)return false;
 if(((p.x-5.8)/2.5)**2+((p.z+3.9)/2.05)**2<1.15)return false;
 if(p.x>-.35&&p.x<2.8&&p.z>-5.5&&p.z<-2.35)return false;
 if(p.x>-7.1&&p.x<-4.9&&p.z>2.5&&p.z<3.8)return false;
 return !YARD_TREES.some(([x,z,size])=>Math.hypot(p.x-x,p.z-z)<size*.25+.3);
}
// Four-connected cells prevent diagonal corner cutting through walls and pond banks.
export function yardPath(from:YardPoint,to:YardPoint):YardPoint[]{
 const cell=(p:YardPoint)=>({x:Math.round(p.x*2),z:Math.round(p.z*2)}),start=cell(from),goal=cell(to),key=(p:YardPoint)=>p.x+','+p.z;
 if(!yardWalkable({x:goal.x/2,z:goal.z/2}))return [];
 const queue=[start],seen=new Map<string,YardPoint|null>([[key(start),null]]);let cursor=0;
 while(cursor<queue.length){const p=queue[cursor++];if(p.x===goal.x&&p.z===goal.z){const path:YardPoint[]=[];let current:YardPoint|null=p;while(current){path.push({x:current.x/2,z:current.z/2});current=seen.get(key(current))||null;}return path.reverse();}
  for(const [x,z] of [[p.x+1,p.z],[p.x-1,p.z],[p.x,p.z+1],[p.x,p.z-1]]){const n={x,z};if(!seen.has(key(n))&&yardWalkable({x:x/2,z:z/2})){seen.set(key(n),p);queue.push(n);}}
 }
 return [];
}
