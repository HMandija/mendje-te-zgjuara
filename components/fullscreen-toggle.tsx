'use client';
import {useEffect,useState} from 'react';
import {Maximize,Minimize} from 'lucide-react';
export function FullscreenToggle(){
 const [full,setFull]=useState(false),[fullError,setFullError]=useState('');
 useEffect(()=>{const update=()=>setFull(!!document.fullscreenElement);document.addEventListener('fullscreenchange',update);return()=>document.removeEventListener('fullscreenchange',update);},[]);
 async function toggleFull(){setFullError('');try{if(document.fullscreenElement)await document.exitFullscreen();else if(document.documentElement.requestFullscreen)await document.documentElement.requestFullscreen();else setFullError('Ekrani i plotë nuk mbështetet nga ky shfletues.');}catch{setFullError('Shfletuesi nuk lejoi ekranin e plotë. Provo përsëri.');}}
 return <><button className="fullscreen-toggle" onClick={()=>void toggleFull()} aria-label={full?'Dil nga ekrani i plotë':'Hap në ekran të plotë'} title={full?'Dil nga ekrani i plotë':'Hap në ekran të plotë'} aria-pressed={full}>{full?<Minimize size={20}/>:<Maximize size={20}/>}</button>{fullError&&<span role="alert" className="fullscreen-error">{fullError}</span>}</>;
}
