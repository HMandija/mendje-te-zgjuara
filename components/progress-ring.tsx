'use client';
import {motion,useReducedMotion} from 'framer-motion';
export function ProgressRing({value,total}:{value:number;total:number}){
 const reduced=useReducedMotion();
 const percent=total?Math.min(100,value/total*100):0;
 return <div className="progress-ring" role="img" aria-label={`${value} nga ${total} ushtrime të përfunduara`}><svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="26" fill="none" stroke="var(--line)" strokeWidth="5"/><motion.circle cx="32" cy="32" r="26" fill="none" stroke="var(--accent)" strokeWidth="5" strokeLinecap="round" strokeDasharray="163.36" initial={false} animate={{strokeDashoffset:163.36*(1-percent/100)}} transition={{duration:reduced?0:.3}} transform="rotate(-90 32 32)"/></svg><strong>{value}/{total}</strong></div>;
}
