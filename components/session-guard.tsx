'use client';

import {useEffect} from 'react';
import {clearStudentSession,getStudentToken} from '../lib/student-session';

const IDLE_MS=30*60_000;
const TEACHER_ACTIVITY='mendje-teacher-last-activity-v1';
const STUDENT_ACTIVITY='mendje-student-last-activity-v1';
type Role='TEACHER'|'STUDENT';

async function sessionState(role:Role,token?:string):Promise<boolean|null>{
  try{
    const response=await fetch('/api/session',{cache:'no-store',headers:token?{Authorization:'Bearer '+token}:{}});
    if(!response.ok)return response.status===401||response.status===403?false:null;
    const state=await response.json() as {authenticated:boolean;role:Role|null};
    return state.authenticated&&state.role===role;
  }catch{return null;}
}

export function SessionGuard(){
  useEffect(()=>{
    let stopped=false,checking=false,activeRole:Role|null=null,lastInput=0;
    const volatileActivity:Record<Role,number>={TEACHER:0,STUDENT:0};
    let idleTimer=0,heartbeat=0;
    const path=()=>location.pathname;
    const isTeacherPage=()=>path()==='/teacher';
    const isStudentPage=()=>path()==='/student/learn';
    const activityKey=(role:Role)=>role==='TEACHER'?TEACHER_ACTIVITY:STUDENT_ACTIVITY;
    const readActivity=(role:Role)=>{
      try{const storage=role==='TEACHER'?localStorage:sessionStorage;const value=Number(storage.getItem(activityKey(role))||0);return Number.isFinite(value)?value:volatileActivity[role];}catch{return volatileActivity[role];}
    };
    const writeActivity=(role:Role,time:number)=>{
      volatileActivity[role]=time;
      try{const storage=role==='TEACHER'?localStorage:sessionStorage;storage.setItem(activityKey(role),String(time));}catch{/* Keep the active tab's timer in memory when storage is blocked. */}
    };

    const stopTimers=()=>{window.clearTimeout(idleTimer);window.clearInterval(heartbeat);idleTimer=0;heartbeat=0;activeRole=null;};
    const go=(to:string)=>{if(location.pathname!==to)location.replace(to);};
    const signOutForIdle=async(role:Role)=>{
      if(stopped)return;
      stopTimers();
      if(role==='TEACHER'){
        try{localStorage.removeItem(TEACHER_ACTIVITY);}catch{/* Continue to server logout. */}
        try{await fetch('/api/teacher-auth',{method:'DELETE',cache:'no-store'});}catch{/* The server-side idle deadline still revokes access. */}
        go('/');
      }else{
        let token='';try{token=getStudentToken();}catch{/* Storage may already have been cleared by the browser. */}
        clearStudentSession();try{sessionStorage.removeItem(STUDENT_ACTIVITY);}catch{/* Continue to the login page. */}
        if(token)try{await fetch('/api/class-login',{method:'DELETE',headers:{Authorization:'Bearer '+token},cache:'no-store'});}catch{/* The server-side idle deadline still revokes access. */}
        go('/student');
      }
    };
    const scheduleIdle=(role:Role)=>{
      window.clearTimeout(idleTimer);
      const remaining=IDLE_MS-(Date.now()-readActivity(role));
      idleTimer=window.setTimeout(()=>{
        if(Date.now()-readActivity(role)>=IDLE_MS)void signOutForIdle(role);
        else scheduleIdle(role);
      },Math.max(0,remaining));
    };
    const startActiveSession=(role:Role)=>{
      if(activeRole===role)return;
      stopTimers();activeRole=role;
      if(!readActivity(role))writeActivity(role,Date.now());
      if(Date.now()-readActivity(role)>=IDLE_MS){void signOutForIdle(role);return;}
      scheduleIdle(role);
      heartbeat=window.setInterval(async()=>{
        if(Date.now()-readActivity(role)>=IDLE_MS){void signOutForIdle(role);return;}
        let token:string|undefined;
        if(role==='STUDENT'){try{token=getStudentToken();}catch{token='';}}
        if(role==='STUDENT'&&!token){clearStudentSession();go('/student');return;}
        const valid=await sessionState(role,token);
        if(valid===false&&role==='STUDENT'){clearStudentSession();try{sessionStorage.removeItem(STUDENT_ACTIVITY);}catch{/* Continue to login. */}go('/student');}
        if(valid===false&&role==='TEACHER'){try{localStorage.removeItem(TEACHER_ACTIVITY);}catch{/* Continue to login. */}go('/teacher/login');}
      },5*60_000);
    };
    const checkRoute=async()=>{
      if(checking||stopped)return;
      const current=path();
      const publicLanding=current==='/',teacherLogin=current==='/teacher/login',studentLogin=current==='/student';
      const teacherPage=isTeacherPage(),studentPage=isStudentPage();
      if(!publicLanding&&!teacherLogin&&!studentLogin&&!teacherPage&&!studentPage){stopTimers();return;}
      checking=true;
      try{
        let studentToken='';try{studentToken=getStudentToken();}catch{/* Teacher sessions do not depend on student storage. */}
        const shouldCheckTeacher=publicLanding||teacherLogin||teacherPage;
        const teacherValid=shouldCheckTeacher?await sessionState('TEACHER'):false;
        if(stopped)return;
        if(teacherValid===null){if(teacherPage&&activeRole==='TEACHER')startActiveSession('TEACHER');return;}
        if(teacherValid){
          if(publicLanding||teacherLogin){stopTimers();go('/teacher');return;}
          startActiveSession('TEACHER');return;
        }
        if(teacherPage){stopTimers();go('/teacher/login');return;}

        const shouldCheckStudent=!!studentToken&&(publicLanding||studentLogin||studentPage);
        const studentValid=shouldCheckStudent?await sessionState('STUDENT',studentToken):false;
        if(stopped)return;
        if(studentValid===null){if(studentPage&&activeRole==='STUDENT')startActiveSession('STUDENT');return;}
        if(studentValid){
          if(publicLanding||studentLogin){stopTimers();go('/student/learn');return;}
          startActiveSession('STUDENT');return;
        }
        if(studentToken)clearStudentSession();
        if(studentPage){stopTimers();go('/student');return;}
        stopTimers();
      }finally{checking=false;}
    };
    const onInput=()=>{
      const now=Date.now();if(now-lastInput<2000)return;lastInput=now;
      if(activeRole){writeActivity(activeRole,now);scheduleIdle(activeRole);}
    };
    const onStorage=(event:StorageEvent)=>{
      if(activeRole==='TEACHER'&&event.key===TEACHER_ACTIVITY)scheduleIdle('TEACHER');
    };
    const onPageShow=()=>{void checkRoute();};
    const onPopState=()=>{window.setTimeout(()=>void checkRoute(),0);};
    window.addEventListener('pageshow',onPageShow);
    window.addEventListener('popstate',onPopState);
    window.addEventListener('storage',onStorage);
    window.addEventListener('pointerdown',onInput,{passive:true});
    window.addEventListener('keydown',onInput);
    window.addEventListener('touchstart',onInput,{passive:true});
    window.addEventListener('wheel',onInput,{passive:true});
    void checkRoute();
    return()=>{
      stopped=true;stopTimers();
      window.removeEventListener('pageshow',onPageShow);window.removeEventListener('popstate',onPopState);
      window.removeEventListener('storage',onStorage);window.removeEventListener('pointerdown',onInput);
      window.removeEventListener('keydown',onInput);window.removeEventListener('touchstart',onInput);window.removeEventListener('wheel',onInput);
    };
  },[]);
  return null;
}
