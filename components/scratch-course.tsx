'use client';
import {useState} from 'react';
import {ArrowLeft,ChevronRight,LockKeyhole} from 'lucide-react';
import {CODING_MISSIONS} from '../lib/coding-missions.mjs';
import './scratch-course.css';

const missions=CODING_MISSIONS as {id:string;title:string;objective:string;groupTitle:string}[];
const stages=['Zbulo','Praktiko','Lidh','Krijo'];

function ScratchCat(){
 return <svg viewBox="0 0 240 170" role="img" aria-label="Macja portokalli e Scratch-it">
  <ellipse cx="122" cy="149" rx="76" ry="9" fill="#547b68" opacity=".16"/>
  <path d="M79 112c-31 8-34 31-17 39 15 7 28-8 38-20" fill="none" stroke="#e88c18" strokeWidth="13" strokeLinecap="round"/>
  <path d="m90 119-13 20m55-17 16 20" stroke="#e88c18" strokeWidth="15" strokeLinecap="round"/>
  <path d="m78 69 2-39 30 25m24-1 27-25 5 42" fill="#ff9b21" stroke="#b85e0b" strokeWidth="4" strokeLinejoin="round"/>
  <path d="M80 77c0-27 20-43 45-43s44 16 44 43c0 25-18 43-44 43S80 102 80 77Z" fill="#ffad32" stroke="#b85e0b" strokeWidth="4"/>
  <path d="m88 43-2 24 18-12m44-12 2 24-18-12" fill="#ffcf77"/>
  <ellipse cx="108" cy="75" rx="7" ry="10" fill="#fff"/><ellipse cx="141" cy="75" rx="7" ry="10" fill="#fff"/>
  <circle cx="110" cy="77" r="3.5" fill="#263c31"/><circle cx="139" cy="77" r="3.5" fill="#263c31"/>
  <path d="m120 87 6 0-3 4z" fill="#b85e65"/><path d="M123 91q-7 9-14 2m14-2q7 9 14 2" fill="none" stroke="#754c42" strokeWidth="2.5" strokeLinecap="round"/>
  <path d="m91 87-23-5m23 12-24 3m91-10 22-6m-22 14 24 3" stroke="#754c42" strokeWidth="2" strokeLinecap="round"/>
  <path d="M111 117q13 12 26 0" fill="#fff" stroke="#b85e0b" strokeWidth="3"/>
  <path d="m177 48 5 10 11 2-8 7 2 11-10-5-10 5 2-11-8-7 11-2z" fill="#fff" opacity=".75"/>
 </svg>;
}

export function ScratchCourse({onStart,initiallyExpanded=false,assignedMissionIds,savedMissionIds}:{onStart:(missionId:string)=>void;initiallyExpanded?:boolean;assignedMissionIds?:string[];savedMissionIds?:string[]}){
 const [selected,setSelected]=useState(initiallyExpanded);
 const total=missions.length;
 return <section className="scratch-course" aria-label="Mësimet e Scratch për klasën e pestë">
  <div className="scratch-course-heading"><div><span className="play-kicker">EKSPLORO · ARSYETO · KRIJO</span><h2>{total} misione për klasën 5</h2><p>Nis me blloqet bazë dhe krijo histori, animacione e lojëra me personazhe.</p></div><div className="scratch-course-count"><strong>{total}</strong><span>misione në Scratch</span></div></div>
  {!selected?<div className="curriculum-cards scratch-course-cards"><button className="curriculum-card" aria-label="Për klasën 5: Programim me Scratch" data-sound="lesson" onClick={()=>setSelected(true)}><span className="curriculum-art scratch-cat-art"><ScratchCat/><span className="curriculum-number">01</span></span><span className="curriculum-card-content"><span className="grade-label">Për klasën 5</span><strong>Laboratori i Scratch-it</strong><small>Krijo projekte me blloqe, personazhe, skena dhe tinguj. Mëso duke provuar dhe përmirësuar lojërat e tua.</small><span className="curriculum-card-footer"><span>Provo misionin 1 · {total} gjithsej</span><ChevronRight size={18}/></span></span></button></div>:<>
   <button className="ghost scratch-course-back" onClick={()=>setSelected(false)}><ArrowLeft size={17}/>Të gjitha mësimet</button>
   <div className="curriculum-detail scratch-course-detail"><div className="curriculum-detail-art scratch-cat-detail"><ScratchCat/></div><div><span className="badge">Klasa 5</span><h3>Laboratori i Scratch-it</h3><p>Krijo animacione, histori dhe lojëra duke lidhur blloqe programimi. Çdo mision të ndihmon të planifikosh, të provosh kodin dhe ta përmirësosh.</p><strong>Çfarë mësojmë?</strong><p>Nga hapat e parë deri te projektet krijuese, do të përdorësh:</p><ol><li>Ngjarje, lëvizje dhe pamjen e personazheve.</li><li>Përsëritje, kushte, koordinata dhe mesazhe.</li><li>Prova, korrigjim gabimesh dhe krijim të lojërave të tua.</li></ol></div></div>
   <div className="curriculum-levels scratch-course-levels" aria-label="Misionet e Scratch për klasën e pestë">{missions.map((mission,index)=>{const level=index+1,locked=assignedMissionIds? !assignedMissionIds.includes(mission.id):level>1,saved=savedMissionIds?.includes(mission.id);return <button key={mission.id} className="curriculum-level" disabled={locked} data-sound="level" aria-label={`${locked?'I kyçur nga mësuesi: ':''}Misioni ${level}: ${mission.title}${saved?', projekti është ruajtur':''}`} onClick={()=>onStart(mission.id)}><span>{locked?<LockKeyhole size={18}/>:level}</span><strong>Misioni {level}</strong><small>{saved?'Projekt i ruajtur':stages[Math.min(3,Math.floor(index/(total/4))) ]}</small></button>;})}</div>
   {assignedMissionIds?<p className="tiny scratch-course-unlock">Misionet me kyç janë mbyllur nga mësuesi. Kur cakton një mision, ai bëhet i klikueshëm këtu.</p>:<p className="tiny scratch-course-unlock">Si vizitor mund të provosh misionin e parë. <a href="/teacher/login">Hyr për të hapur misionet e tjera dhe për të ruajtur progresin.</a></p>}
  </>}
 </section>;
}
