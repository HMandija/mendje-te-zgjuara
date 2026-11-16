'use strict';
module.exports=function numericHull(points,concavity,format){
 if(concavity!==Infinity||format!==undefined)throw new TypeError('Only numeric convex hulls are supported.');
 if(points.length<4)return points.slice();
 const sorted=points.slice().sort((a,b)=>a[0]-b[0]||a[1]-b[1]).filter((p,i,list)=>!i||p[0]!==list[i-1][0]||p[1]!==list[i-1][1]);
 if(sorted.length===1)return [sorted[0],sorted[0]];
 const cross=(a,b,c)=>(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);
 const lower=[],upper=[];
 for(const p of sorted){while(lower.length>1&&cross(lower[lower.length-2],lower[lower.length-1],p)<=0)lower.pop();lower.push(p);}
 for(let i=sorted.length-1;i>=0;i--){const p=sorted[i];while(upper.length>1&&cross(upper[upper.length-2],upper[upper.length-1],p)<=0)upper.pop();upper.push(p);}
 const hull=lower.slice(0,-1).concat(upper.slice(0,-1));
 if(hull.length)hull.push(hull[0]);
 return hull;
};
