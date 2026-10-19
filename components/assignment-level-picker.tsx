'use client';
import {useId} from 'react';
import './assignment-levels.css';

export function AssignmentLevelPicker({count,value,onChange,disabled=false,label='Nivelet e mësimit'}:{count:number;value:number[];onChange:(levels:number[])=>void;disabled?:boolean;label?:string}) {
  const id=useId();
  return <details className="assignment-level-picker">
    <summary><span>{label}</span><strong>{value.length ? `${value.length} nga ${count} aktive` : 'Asnjë nivel aktiv'}</strong></summary>
    <div className="assignment-level-picker-content">
      <p id={id}>Nxënësit mund të plotësojnë vetëm nivelet e shënuara. Mund t’i ndryshosh më vonë; rezultatet ruhen.</p>
      <div className="assignment-level-tools">
        {count>=10&&<button type="button" className="secondary" disabled={disabled} onClick={()=>onChange(Array.from({length:10},(_,i)=>i+1))}>10 të parat</button>}
        <button type="button" className="ghost" disabled={disabled} onClick={()=>onChange(Array.from({length:count},(_,i)=>i+1))}>Zgjidh të gjitha</button>
        <button type="button" className="ghost" disabled={disabled} onClick={()=>onChange([])}>Hiq shënimet</button>
      </div>
      <fieldset aria-describedby={id} disabled={disabled}>
        <legend>{label}</legend>
        <div className="assignment-level-checkboxes">{Array.from({length:count},(_,i)=>i+1).map(n=><label key={n} className={value.includes(n)?'is-enabled':''}>
          <input type="checkbox" checked={value.includes(n)} onChange={e=>onChange(e.target.checked?[...value,n].sort((a,b)=>a-b):value.filter(x=>x!==n))}/><span>Niveli {n}</span>
        </label>)}</div>
      </fieldset>
    </div>
  </details>;
}
