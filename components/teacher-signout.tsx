'use client';
import {useState} from 'react';
export function TeacherSignout(){const [busy,setBusy]=useState(false),[error,setError]=useState('');return <><button className="secondary teacher-signout" disabled={busy} onClick={async()=>{setBusy(true);try{const r=await fetch('/api/teacher-auth',{method:'DELETE'});if(!r.ok)throw Error();location.href=process.env.STANDALONE_DEPLOY==='true'?'/':'/signout-with-chatgpt?return_to=%2F';}catch{setError('Dalja dështoi. Provo sërish.');setBusy(false);}}}>Dil nga llogaria</button>{error&&<span role="alert">{error}</span>}</>;}
