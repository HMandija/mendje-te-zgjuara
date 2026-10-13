'use client';
import {useState} from 'react';
export function TeacherSignout(){const [busy,setBusy]=useState(false),[error,setError]=useState('');return <><button className="secondary teacher-signout" disabled={busy} onClick={async()=>{setBusy(true);try{const r=await fetch('/api/teacher-auth',{method:'DELETE',cache:'no-store'});if(!r.ok)throw Error();location.replace('/');}catch{setError('Dalja dështoi. Provo sërish.');setBusy(false);}}}>Dil nga llogaria</button>{error&&<span role="alert">{error}</span>}</>;}
