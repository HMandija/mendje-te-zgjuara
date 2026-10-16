'use client';
import {lazy,Suspense,useEffect,useState} from 'react';
import {getStudentToken} from '../lib/student-session';
import {RobotCourtyard} from './robot-courtyard';
const Adventure=lazy(()=>import('./robot-world').then(m=>({default:m.RobotWorld})));
type Role='TEACHER'|'STUDENT'|'GUEST';
export function RobotGameEntry({adventure=false}:{adventure?:boolean}){
 const [role,setRole]=useState<Role|null>(null);
 useEffect(()=>{let disposed=false,running=false;const abort=new AbortController();const check=async()=>{if(running)return;running=true;let next:Role='GUEST';try{let token='';try{token=getStudentToken();}catch{}if(token){const response=await fetch('/api/session',{cache:'no-store',headers:{Authorization:'Bearer '+token},signal:abort.signal});if(response.ok){const data=await response.json() as {authenticated?:unknown;role?:unknown};if(data.authenticated===true&&data.role==='STUDENT')next='STUDENT';}}if(next==='GUEST'){const response=await fetch('/api/session',{cache:'no-store',signal:abort.signal});if(response.ok){const data=await response.json() as {authenticated?:unknown;role?:unknown};if(data.authenticated===true&&data.role==='TEACHER')next='TEACHER';}}}catch{/* A failed verification never unlocks missions. */}finally{running=false;if(!disposed)setRole(next);}};void check();const focus=()=>void check(),timer=setInterval(focus,60000);window.addEventListener('focus',focus);return()=>{disposed=true;abort.abort();clearInterval(timer);window.removeEventListener('focus',focus);};},[]);
 if(role===null)return <main className="panel" role="status">Po hapim Botën e Robotit…</main>;
 if(adventure&&role!=='GUEST')return <Suspense fallback={<p role="status">Po hapim aventurën…</p>}><Adventure student={role==='STUDENT'}/></Suspense>;
 return <RobotCourtyard key={role} missionsAllowed={role!=='GUEST'} returnHref={role==='STUDENT'?'/student/learn':role==='TEACHER'?'/teacher':'/'}/>;
}
