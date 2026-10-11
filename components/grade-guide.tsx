import {GraduationCap,Check} from 'lucide-react';
import {gradeCurriculum} from '../lib/grade-curriculum.mjs';
import './grade-guide.css';
export function GradeGuide({grade}:{grade:number}){const plan=gradeCurriculum(grade);if(!plan)return null;return <section className={'grade-guide grade-guide-'+grade} aria-label={'Programi për klasën '+grade}><span className="grade-label"><GraduationCap size={18}/>Për klasën {grade}</span><div><h3>{plan.title}</h3><p>{plan.focus}</p><ul>{plan.skills.map(skill=><li key={skill}><Check size={15}/>{skill}</li>)}</ul></div></section>;}
