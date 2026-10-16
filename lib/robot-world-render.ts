// One event-driven loop per scene. Static or invisible scenes consume no RAFs.
export function startRobotSceneLoop(host:HTMLElement,draw:(time:number)=>void,animated:()=>boolean){
 let frame=0,dirty=true,visible=true,stopped=false,last=-Infinity;
 const schedule=()=>{if(!stopped&&!document.hidden&&visible&&!frame)frame=requestAnimationFrame(tick);};
 const tick=(time:number)=>{frame=0;if(stopped||document.hidden||!visible)return;if(dirty||time-last>=1000/30){draw(time);dirty=false;last=time;}if(animated())schedule();};
 const invalidate=()=>{dirty=true;schedule();};
 const visibility=()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0;}else invalidate();};
 const observer=new IntersectionObserver(entries=>{visible=entries[0]?.isIntersecting??true;if(!visible){cancelAnimationFrame(frame);frame=0;}else invalidate();},{rootMargin:'80px'});observer.observe(host);document.addEventListener('visibilitychange',visibility);schedule();
 return {invalidate,stop(){stopped=true;cancelAnimationFrame(frame);observer.disconnect();document.removeEventListener('visibilitychange',visibility);}};
}
export function robotRenderQuality(){const memory=(navigator as Navigator&{deviceMemory?:number}).deviceMemory,limited=navigator.hardwareConcurrency<=4||!!memory&&memory<=4;return {pixelRatio:Math.min(devicePixelRatio,limited?1:1.5),shadows:!limited};}
