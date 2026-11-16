'use client';
import {useEffect,useRef,useState,useSyncExternalStore,type CSSProperties} from 'react';
import {BrainCircuit,BookOpen,ChevronRight,LockKeyhole,Sparkles,LogIn,Users} from 'lucide-react';
import {DisplaySettings} from './display-settings';
import {RobotWorldLauncher} from './robot-world-launcher';
import {CodingEditor} from './coding-editor';
import {ScratchCourse} from './scratch-course';
import {CurriculumHub} from './curriculum-hub';
import {curriculumLesson} from '../lib/curriculum-catalog.mjs';
import {LabProfessor,LabRobot,PuzzleArt} from './learning-art';
import {PlayGallery} from './play-gallery';
import {PuzzleInput} from './puzzle-input';
import {PuzzleVisual} from './play-art';
import {useExperience} from './experience-provider';
import {categoriesForGrade} from '../lib/categories.mjs';
import {gamesForGrade} from '../lib/game-catalog.mjs';
import {robotCourseNames} from '../lib/lesson-names.mjs';
import {lessonTutorial} from '../lib/lesson-tutorials';
import type {PublicPuzzle} from '../lib/learning-types';
import type {PlayScene} from '../lib/play-types';
type Selection={grade:number;category?:string;scene?:PlayScene;lessonId?:string};
const signIn='/teacher/login';
const subscribeHydration=()=>()=>{};
async function publicApi<T>(path:string,data?:unknown):Promise<T>{const r=await fetch(path,{method:data?'POST':'GET',headers:data?{'Content-Type':'application/json'}:{},body:data?JSON.stringify(data):undefined,cache:'no-store',signal:AbortSignal.timeout(15000)});const x:unknown=await r.json();if(!r.ok)throw Error(x&&typeof x==='object'&&'error' in x?String(x.error):'Kërkesa dështoi.');return x as T;}
export function VisitorExperience(){
 const [grade,setGrade]=useState(1),[selection,setSelection]=useState<Selection|null>(null),[puzzle,setPuzzle]=useState<PublicPuzzle|null>(null),[busy,setBusy]=useState(false),[error,setError]=useState(''),[result,setResult]=useState<{correct:boolean;explain:string}|null>(null),[answer,setAnswer]=useState(''),[round,setRound]=useState(0),[memoryVisible,setMemoryVisible]=useState(true);
 const [coding,setCoding]=useState(false);
 const codingReady=useSyncExternalStore(subscribeHydration,()=>true,()=>false);
 const {play}=useExperience();
 const requestVersion=useRef(0);
 useEffect(()=>{if(!puzzle?.memory)return;const timer=setTimeout(()=>setMemoryVisible(false),(grade+5)*1000);return()=>clearTimeout(timer);},[puzzle,round,grade]);
 async function open(category?:string,scene?:PlayScene,lessonId?:string){const version=++requestVersion.current;setBusy(true);setError('');setPuzzle(null);setResult(null);setAnswer('');setMemoryVisible(true);const s={grade,...(lessonId?{lessonId}:scene?{scene}:{category})};setSelection(s);try{const q=new URLSearchParams({grade:String(grade),...(lessonId?{lessonId}:scene?{scene}:{category:category!})});const x=await publicApi<{puzzle:PublicPuzzle}>('/api/demo?'+q);if(version===requestVersion.current)setPuzzle(x.puzzle);}catch(e){if(version===requestVersion.current)setError(e instanceof Error?e.message:'Mësimi nuk u hap.');}finally{if(version===requestVersion.current)setBusy(false);}window.scrollTo(0,0);}
 async function check(value:string){if(!selection||busy||result)return;setBusy(true);setError('');try{const x=await publicApi<{correct:boolean;explain:string}>('/api/demo',{selection,value});setAnswer(value);setResult(x);play(x.correct?'correct':'wrong');}catch(e){setError(e instanceof Error?e.message:'Përgjigjja nuk u kontrollua.');}finally{setBusy(false);}}
 function reset(){setResult(null);setAnswer('');setRound(n=>n+1);setMemoryVisible(true);}
 const lesson=selection?.lessonId?curriculumLesson(selection.lessonId):null;
 const game=selection?.scene?gamesForGrade(grade).find(g=>g.scene===selection.scene):null,category=selection?.category?categoriesForGrade(grade).find(c=>c.id===selection.category):null,title=lesson?.title||(selection?.scene==='robot'?robotCourseNames[grade-1]:game?.title||category?.name||'Logjikë & mendim'),description=lesson?.description||( selection?.scene==='robot'?'Bashko komandat dhe shiko si lëviz roboti mbi tabelë.':game?.description||category?.desc);
 return <div className={'learning-shell visitor-shell '+(selection?'lesson-shell':'')}>
  <header className="app-header"><button className="brand" onClick={()=>setSelection(null)}><span className="brand-icon"><BrainCircuit size={25}/></span><span>Mendje të<br/><strong>Zgjuara</strong></span></button><nav className="nav" aria-label="Navigimi"><button className="active" onClick={()=>setSelection(null)}><BookOpen size={18}/>Ushtrimet</button><a className="nav-action" href={signIn}><LogIn size={18}/>Hyr / Krijo llogari</a><a className="nav-action" href="/student"><Users size={18}/>Hyrja e nxënësve</a></nav><div className="header-tools"><DisplaySettings/></div></header>
  <main className={selection?'workspace-main':'course-main'}>
   <div className="connection-strip"><span>Po provon si vizitor · Progresi nuk ruhet</span><a className="inline-link" href={signIn}>Hyr për nivelet e tjera →</a></div>
   {coding&&<CodingEditor onClose={()=>setCoding(false)}/>}
   {selection?<section className="exercise"><button className="ghost" onClick={()=>{setSelection(null);setPuzzle(null);}}>← Të gjitha mësimet</button><span className="badge">Klasa {grade} · Vetëm niveli 1</span><h1>{title}</h1><p>{description}</p><section className="demo-tutorial" aria-label="Tutoriali i mësimit"><h2>Si luhet?</h2><ol>{(lesson?.tutorial||lessonTutorial(selection.scene,selection.category)).map((step:string)=><li key={step}>{step}</li>)}</ol></section>{busy&&!puzzle&&<p role="status">Po përgatisim nivelin e parë…</p>}{error&&<p className="error" role="alert">{error}</p>}{puzzle&&<><h2>{puzzle.title}</h2>{!['robot','creative'].includes(puzzle.type||'')&&puzzle.visual&&(!puzzle.memory||memoryVisible)&&<div className="visual"><PuzzleVisual text={puzzle.visual} boxes={puzzle.boxes}/></div>}{puzzle.memory&&memoryVisible&&<p role="status">Vëzhgo me kujdes. Pas pak figurat fshihen.</p>}<PuzzleInput key={puzzle.id+'-'+round} puzzle={puzzle} disabled={busy||!!result||!!puzzle.memory&&memoryVisible} selected={answer} correct={result?.correct} onAnswer={value=>void check(value)}/>{result&&<div className={result.correct?'feedback correct':'feedback wrong'} role="status"><strong>{result.correct?'E saktë!':'Provo një mënyrë tjetër.'}</strong><p>{result.explain}</p><button className="secondary" onClick={reset}>Provo sërish nivelin 1</button></div>}</>}<div className="demo-unlock"><LockKeyhole size={24}/><div><h2>Vazhdo në nivelet e tjera</h2><p>Hyr ose krijo llogari për mësimet e plota dhe ruajtjen e progresit. Nxënësit hyjnë me kodin e klasës.</p></div><a className="primary" href={signIn}>Hyr / Krijo llogari</a><a className="secondary" href="/student">Kam kod klase</a></div></section>:<>
    <RobotWorldLauncher preview/>
    <section className="course-hero"><div className="lab-character robot"><LabRobot/></div><div className="course-intro"><span className="course-kicker"><Sparkles size={14}/> LABORATORI I MENDJES</span><h1>Logjikë &amp; mendim</h1><p>Një botë me zbulime për mendje kureshtare.<br/>Provo nivelin e parë të çdo mësimi!</p><div className="grades" aria-label="Zgjedhja e klasës">{[1,2,3,4,5].map(g=><button key={g} className={'grade '+(grade===g?'selected':'')} aria-pressed={grade===g} onClick={()=>setGrade(g)}>Klasa {g}</button>)}</div></div><div className="lab-character professor"><LabProfessor/></div></section>
   {grade===5?<ScratchCourse onStart={()=>{if(codingReady)setCoding(true);}}/>:<>
     <CurriculumHub key={'curriculum-'+grade} grade={grade} preview start={id=>void open(undefined,undefined,id)}/>
     <section className="robot-hub"><span className="play-kicker">NDËRTO · PROVO · KRIJO</span><span className="grade-label">Për klasën {grade}</span><h2>{robotCourseNames[grade-1]}</h2><div className="robot-hub-intro"><div className="robot-hub-mascot"><LabRobot/></div><div><h3>Komandat e tua e gjallërojnë robotin!</h3><p>20 misione për çdo klasë. Provo misionin e parë me blloqe dhe kthime.</p><button className="primary" onClick={()=>void open(undefined,'robot')}>Provo misionin 1</button></div></div></section>
     <PlayGallery key={grade} grade={grade} profile="" api={publicApi} preview start={scene=>void open(undefined,scene)}/><div className="section-head"><h2>Zgjidh sfidën tënde</h2><a className="secondary" href={signIn}>Kursi i plotë <LockKeyhole size={18}/></a></div><section className="categories" aria-label="Kategoritë e ushtrimeve">{categoriesForGrade(grade).map(c=><button key={c.id} className="puzzle-tile" style={{'--tint':c.tint} as CSSProperties} onClick={()=>void open(c.id)}><span className="tile-art"><PuzzleArt category={c.id}/><span className="tile-count">Provo nivelin 1</span></span><span className="tile-info"><span className="grade-label">Për klasën {grade}</span><span className="tile-title">{c.name}</span><span className="tile-description">{c.desc}</span></span><span className="tile-bottom"><span>Luaj pa llogari</span><ChevronRight size={20}/></span></button>)}</section>
    </>}</>}
  </main><footer><span>Mësim me kureshtje · Klasa 1–5</span><a href="/privacy">Privatësia</a></footer>
 </div>;
}
