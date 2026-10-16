'use client';
import {createContext,useCallback,useContext,useEffect,useRef,useState,type ReactNode} from 'react';
import {ThemeProvider} from 'next-themes';
import {MotionConfig} from 'framer-motion';
import {Toaster} from './ui/sonner';
export type Sound='click'|'cheer'|'page'|'react'|'correct'|'wrong'|'complete'|'pick'|'drop'|'move'|'turn'|'bump'|'maze'|'robot'|'sketch'|'story'|'tangram'|'color'|'event'|'sort'|'memory'|'lesson'|'level'|'pipe';
type AudioStatus='idle'|'playing'|'blocked'|'error';
type Experience={muted:boolean;audioStatus:AudioStatus;toggleMute:()=>void;testSound:()=>void;play:(sound:Sound)=>void;celebrate:()=>void};
const ExperienceContext=createContext<Experience>({muted:true,audioStatus:'idle',toggleMute:()=>{},testSound:()=>{},play:()=>{},celebrate:()=>{}});
export const useExperience=()=>useContext(ExperienceContext);
export function ExperienceProvider({children,nonce}:{children:ReactNode;nonce?:string}){
 const [muted,setMuted]=useState(true),[audioStatus,setAudioStatus]=useState<AudioStatus>('idle');const mute=useRef(true);const sounds=useRef<Partial<Record<Sound,HTMLAudioElement>>>({});const lastCue=useRef({time:0,sound:''}),rewardUntil=useRef(0);
 useEffect(()=>{try{mute.current=localStorage.getItem('mendje-sound')!=='on';const timer=setTimeout(()=>setMuted(mute.current),0);return()=>clearTimeout(timer);}catch{}},[]);
 const play=useCallback((sound:Sound)=>{
  if(mute.current||document.visibilityState==='hidden')return;
  const now=performance.now(),reward=['correct','wrong','cheer','complete'].includes(sound);
  if(!reward&&now<rewardUntil.current||sound===lastCue.current.sound&&now-lastCue.current.time<70)return;
  if(sound==='click'&&now-lastCue.current.time<90)return;
  lastCue.current={time:now,sound};
  if(reward){Object.values(sounds.current).forEach(s=>{if(s){s.pause();s.currentTime=0;}});rewardUntil.current=now+(sound==='complete'||sound==='cheer'?700:350);}
  let instance=sounds.current[sound];if(!instance){instance=new Audio(`/sounds/${sound}.wav`);instance.preload='auto';instance.volume=sound==='click'?.24:['move','turn','pick','drop','page','react'].includes(sound)?.35:.5;instance.addEventListener('error',()=>setAudioStatus('error'));sounds.current[sound]=instance;}
  instance.pause();instance.currentTime=0;void instance.play().then(()=>setAudioStatus('playing')).catch(()=>setAudioStatus(instance?.error?'error':'blocked'));
 },[]);
 const enableSound=useCallback((sound:Sound)=>{if(mute.current){mute.current=false;setMuted(false);try{localStorage.setItem('mendje-sound','on');}catch{}}play(sound);},[play]);
 const toggleMute=useCallback(()=>{mute.current=!mute.current;setMuted(mute.current);try{localStorage.setItem('mendje-sound',mute.current?'off':'on');}catch{}if(mute.current){Object.values(sounds.current).forEach(sound=>{sound?.pause();if(sound)sound.currentTime=0;});rewardUntil.current=0;setAudioStatus('idle');}else play('click');},[play]);
 const testSound=useCallback(()=>enableSound('complete'),[enableSound]);
 useEffect(()=>{
  // Bubble after component handlers so a game cue replaces the generic click.
  const click=(event:MouseEvent)=>{if(!(event.target instanceof Element))return;const control=event.target.closest('button,a[href],[role="button"],[role="option"]');if(!control||control.closest('[data-sound="none"]')||control.matches(':disabled,[aria-disabled="true"]'))return;const cue=control.getAttribute('data-sound');if(cue){if(['click','cheer','page','react','correct','wrong','complete','pick','drop','move','turn','bump','maze','robot','sketch','story','tangram','color','event','sort','memory','lesson','level','pipe'].includes(cue))play(cue as Sound);return;}if(performance.now()-lastCue.current.time<100)return;play('click');};
  const change=(event:Event)=>{if(event.target instanceof HTMLSelectElement||event.target instanceof HTMLInputElement&&['checkbox','radio'].includes(event.target.type))play('click');};
  const hide=()=>{if(document.visibilityState==='hidden')Object.values(sounds.current).forEach(s=>s?.pause());};
  document.addEventListener('click',click);document.addEventListener('change',change);document.addEventListener('visibilitychange',hide);
  return()=>{document.removeEventListener('click',click);document.removeEventListener('change',change);document.removeEventListener('visibilitychange',hide);};
 },[play]);
 const celebrate=useCallback(()=>{if(window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;void import('canvas-confetti').then(({default:confetti})=>confetti({particleCount:65,spread:60,origin:{y:.7},disableForReducedMotion:true,colors:['#a78bdd','#77cf9a','#ffd879'],ticks:130})).catch(()=>{});},[]);
 useEffect(()=>()=>{Object.values(sounds.current).forEach(sound=>{if(sound){sound.pause();sound.src='';}});},[]);
 return <ThemeProvider nonce={nonce} attribute="data-theme" defaultTheme="light" enableSystem={false} enableColorScheme><MotionConfig reducedMotion="user"><ExperienceContext.Provider value={{muted,audioStatus,toggleMute,testSound,play,celebrate}}>{children}<Toaster richColors position="bottom-center" closeButton containerAriaLabel="Njoftimet" toastOptions={{closeButtonAriaLabel:'Mbyll njoftimin'}}/></ExperienceContext.Provider></MotionConfig></ThemeProvider>;
}
