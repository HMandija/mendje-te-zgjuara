'use client';
import {useState} from 'react';
import {AssignmentLevelPicker} from './assignment-level-picker';
import {assignmentLevels,assignmentLevelCount,assignmentTaskInput} from '../lib/assignment-levels';
import type {Assignment} from '../lib/product-types';

export function AssignmentTaskLevels({task,busy,save}:{task:Assignment;busy:boolean;save:(body:{id:string;task:ReturnType<typeof assignmentTaskInput>})=>void}) {
  const [levels,setLevels]=useState(()=>assignmentLevels(task));
  const original=assignmentLevels(task),changed=JSON.stringify(levels)!==JSON.stringify(original);
  return <div>
    <AssignmentLevelPicker count={assignmentLevelCount(task)} value={levels} onChange={setLevels} disabled={busy}/>
    {changed&&<div className="actions"><button className="primary" disabled={busy} onClick={()=>save({id:task.id,task:assignmentTaskInput(task,levels)})}>Ruaj nivelet</button><button className="ghost" disabled={busy} onClick={()=>setLevels(original)}>Anulo</button></div>}
  </div>;
}
