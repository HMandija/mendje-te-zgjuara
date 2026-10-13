'use client';
import {useEffect,useState} from 'react';
import {motion,useReducedMotion} from 'framer-motion';
import {Star,X} from 'lucide-react';
import {LabRobot} from './learning-art';
import {useExperience} from './experience-provider';
import './answer-celebration.css';

export function AnswerCelebration({name}:{name:string}){
 const reduced=useReducedMotion(),[visible,setVisible]=useState(true);
 const {play}=useExperience();
 useEffect(()=>{play('cheer');},[play]);
 useEffect(()=>{const timer=setTimeout(()=>setVisible(false),3400);return()=>clearTimeout(timer);},[]);
 if(!visible)return null;
 return <div className="answer-celebration"><motion.div className="answer-celebration-card" role="status" aria-live="polite" initial={reduced?false:{opacity:0,scale:.65,y:40}} animate={{opacity:1,scale:1,y:0}} transition={{type:'spring',stiffness:230,damping:18}}><button className="celebration-close" data-sound="none" onClick={()=>setVisible(false)} aria-label="Mbyll urimin"><X size={20}/></button><div className="celebration-stars" aria-hidden="true">{[0,1,2].map(i=><motion.span key={i} animate={reduced?{}:{y:[0,-10,0],rotate:[-8,8,-8]}} transition={{duration:1.5,repeat:Infinity,delay:i*.12}}><Star fill="currentColor" size={i===1?48:32}/></motion.span>)}</div><div className="celebration-bear" aria-hidden="true"><LabRobot state="celebrate"/></div><strong>{name?`Të lumtë, ${name}!`:'Të lumtë!'}</strong><p>E zgjidhe saktë! ✨</p></motion.div></div>;
}
