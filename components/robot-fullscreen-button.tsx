'use client';
import {useEffect,useState} from 'react';
import {Expand,Minimize} from 'lucide-react';

export function RobotFullscreenButton({className=''}:{className?:string}){
 const [active,setActive]=useState(false),[error,setError]=useState('');
 useEffect(()=>{const update=()=>setActive(!!document.fullscreenElement);document.addEventListener('fullscreenchange',update);update();return()=>document.removeEventListener('fullscreenchange',update);},[]);
 const toggle=async()=>{setError('');try{if(document.fullscreenElement)await document.exitFullscreen();else{const game=document.querySelector<HTMLElement>('.ry-game');if(!game?.requestFullscreen)throw new Error('unsupported');await game.requestFullscreen();}}catch{setError('Ekrani i plotë nuk u lejua nga shfletuesi.');}};
 return <><button className={className} aria-label={active?'Dil nga ekrani i plotë':'Ekran i plotë'} aria-pressed={active} title={active?'Dil nga ekrani i plotë':'Ekran i plotë'} onClick={()=>void toggle()}>{active?<Minimize size={21}/>:<Expand size={21}/>}</button>{error&&<button className="ry-fullscreen-error" style={{zIndex:30}} role="alert" onClick={()=>setError('')}>{error} ×</button>}</>;
}
