'use client';
import {FullscreenToggle} from './fullscreen-toggle';
import {useTheme} from 'next-themes';
import {Moon,Sun,Volume2,VolumeX,X,Settings2} from 'lucide-react';
import {Button} from './ui/button';
import {Dialog,DialogTrigger,DialogContent,DialogTitle,DialogClose} from './ui/dialog';
import {useExperience} from './experience-provider';
export function DisplaySettings(){
 const {theme,setTheme}=useTheme(),{muted,toggleMute}=useExperience();
 return <><FullscreenToggle/><Dialog><DialogTrigger asChild><Button variant="ghost" className="display-settings-trigger" aria-label="Pamja dhe tingujt"><Settings2 size={20}/></Button></DialogTrigger><DialogContent className="display-settings-dialog" showCloseButton={false}><DialogTitle>Pamja dhe tingujt</DialogTitle><DialogClose asChild><Button variant="ghost" className="settings-close" aria-label="Mbyll cilësimet"><X size={20}/></Button></DialogClose><div className="settings-options"><Button variant="outline" className="secondary" aria-pressed={theme!=='dark'} onClick={()=>setTheme('light')}><Sun size={20}/> Pamja e ditës</Button><Button variant="outline" className="secondary" aria-pressed={theme==='dark'} onClick={()=>setTheme('dark')}><Moon size={20}/> Pamja e natës</Button></div><Button variant="outline" className="secondary sound-toggle" aria-pressed={!muted} onClick={toggleMute}>{muted?<VolumeX size={20}/>:<Volume2 size={20}/>} {muted?'Aktivizo tingujt':'Çaktivizo tingujt'}</Button></DialogContent></Dialog></>;
}
