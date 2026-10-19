'use client';
import {LockKeyhole} from 'lucide-react';
import {assignmentAtLevel,assignmentLevels,assignmentLevelCount,assignmentLevelSessions} from '../lib/assignment-levels';
import type {Assignment} from '../lib/product-types';
import type {SavedSession} from '../lib/learning-types';
import './assignment-levels.css';

export function AssignmentStudentLevels({task,sessions,start,disabled=false}:{task:Assignment;sessions:SavedSession[];start:(a:Assignment)=>void;disabled?:boolean}) {
  const levels=assignmentLevels(task);
  return <details open className="assignment-student-level-picker">
    <summary>Nivelet e misionit · {levels.length} aktive</summary>
    <div className="assignment-student-levels" aria-label={'Nivelet e '+task.title}>
      {Array.from({length:assignmentLevelCount(task)},(_,i)=>i+1).map(n=>{
        const unlocked=levels.includes(n),rows=assignmentLevelSessions(task,sessions,n),best=rows.reduce((v,s)=>Math.max(v,s.stars||0),0);
        return <button key={n} type="button" className={'secondary '+(rows.length?'level-completed':'')} disabled={disabled||!unlocked}
          aria-label={`Niveli ${n}${!unlocked?', i paaktivizuar nga mësuesi':rows.length?`, i përfunduar, ${best} yje`:''}`} onClick={()=>start(assignmentAtLevel(task,n))}>
          <strong>{n}</strong>{unlocked?<small>{best?'★'.repeat(best):'Luaj'}</small>:<LockKeyhole size={14} aria-hidden="true"/>}
        </button>;
      })}
    </div>
    {!levels.length&&<p>Mësuesi do të aktivizojë nivelet këtu.</p>}
  </details>;
}
