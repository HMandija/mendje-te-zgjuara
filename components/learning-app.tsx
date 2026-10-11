// Use document navigation for privacy: Vinext production Link navigation throws.
'use client';
import {AnswerCelebration} from './answer-celebration';
import {TeacherSignout} from './teacher-signout';
import {clearStudentSession,endStudentSession,getStudentToken,readStudentCache,startStudentSession,writeStudentCache} from '../lib/student-session';
/* eslint-disable @next/next/no-location-assign-relative-destination -- Use document navigation while Vinext client navigation has the observed production failure. */

import { useCallback, useEffect, useRef, useState, type CSSProperties, type FormEvent } from 'react';
import { BookOpen, BrainCircuit, ChevronRight, CircleCheck, GraduationCap, Lightbulb, NotebookPen, RotateCw, Sparkles, Star } from 'lucide-react';
import {motion,useReducedMotion} from 'framer-motion';
import {toast} from 'sonner';
import {DisplaySettings} from './display-settings';
import {LoadingScreen} from './loading-screen';
import {ProgressRing} from './progress-ring';
import {useExperience} from './experience-provider';
import {CourseHub} from './course-hub';
import {ClassroomHub} from './classroom-hub';
import {StudentHome} from './student-home';
import './dashboard.css';
import {VisitorExperience} from './visitor-experience';
import {gameCategoryCount} from '../lib/game-catalog.mjs';
import {PlayGallery} from './play-gallery';
import {RobotHub} from './robot-hub';
import {CurriculumHub} from './curriculum-hub';
import {IllustratedLine} from './play-art';
import type {PlayScene} from '../lib/play-types';
import {PuzzleInput} from './puzzle-input';
import type {Assignment} from '../lib/product-types';
import { LabProfessor, LabRobot, PuzzleArt } from './learning-art';
import { CATEGORIES } from '../lib/categories.mjs';
import { validWorkspace } from '../lib/school-validation.mjs';
import type { Answer, Config, Profile, Puzzle, PublicPuzzle, SavedSession, StudentWorkspace, Workspace } from '../lib/learning-types';

type Screen = 'classes' | 'home' | 'course' | 'teacher' | 'profiles' | 'editor' | 'notebook' | 'ideas' | 'exercise' | 'pause' | 'result';
type Adventure = { id: string; grade: number; profile: string; category: string; gameLevel?:number;lessonId?:string;lessonLevel?:number;scene?:PlayScene;level?:number; assignment?:string; stars?:number; items: PublicPuzzle[]; index: number; answers: Answer[]; selected?: string };
type Cache = { config: Config; revision: number; pending: SavedSession[]; dirty?: boolean };
const EMPTY: Config = { profiles: [], custom: [] };
const GRADES = [1, 2, 3, 4];
const COURSE_CATEGORIES = ['logic', 'patterns', 'math', 'spatial', 'memory', 'code', 'errors', 'whatif'].map(id => CATEGORIES.find(category => category.id === id)!);
const STORAGE = 'mendje-v1';
function readJSON(key: string): Record<string, unknown> {
  try { return JSON.parse(localStorage.getItem(key) || '{}'); } catch { return {}; }
}
function download(name: string, content: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = document.createElement('a'); link.href = url; link.download = name; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
const IDEAS = [
  ['Mendo me zë', 'Pyet: Çfarë di? Çfarë kërkon? Pse zgjodhe këtë mënyrë? Përdor fjalë, sende ose vizatim.'],
  ['Gabimi i detektivit', 'Gjeni, shpjegoni dhe korrigjoni një gabim. Kategoria Gjej gabimin ju ndihmon ta praktikoni.'],
  ['Më shumë se një zgjidhje', 'Formoni numrin 12 në disa mënyra. Krahasoni mbledhjen, grupimin dhe vizatimin.'],
  ['Robot pa ekran', 'Njëri jep udhëzime për një rrugë në dysheme, tjetri i ndjek. Ndërroni rolet dhe korrigjoni hapat.'],
  ['Po sikur…?', 'Ndryshoni një kusht. Parashikoni rezultatin përpara llogaritjes; praktikojeni në kategorinë Po sikur…?'],
  ['Nxënësi bëhet krijues', 'Krijoni një varg ose gjëegjëzë në dyshe. Një dyshe tjetër kontrollon nëse të dhënat mjaftojnë.'],
  ['Mision bashkëpunimi', 'Secili anëtar merr një të dhënë. Ndajini dhe lidhini për të gjetur zgjidhjen.'],
  ['Portofoli i mendimit', 'Lexoni shënimet në Fletoren e mendimit dhe diskutoni strategjinë, jo vetëm rezultatin.'],
];

export default function LearningApp({ student = false }: { student?: boolean }) {
  const {play,celebrate}=useExperience();
  const reduced=useReducedMotion();
  const celebrated=useRef('');
  const [answerCelebration,setAnswerCelebration]=useState<{id:string;name:string}|null>(null);
  const [config, setConfig] = useState<Config>(EMPTY);
  const [studentCustom,setStudentCustom] = useState<StudentWorkspace['custom']>([]);
  const [sessions, setSessions] = useState<SavedSession[]>([]);
  const [screen, setScreen] = useState<Screen>(student?'home':'classes');
  const [grade, setGrade] = useState(1);
  const [previewClass,setPreviewClass]=useState('');
  const [active, setActive] = useState('');
  const [count, setCount] = useState(5);
  const [reflection, setReflection] = useState(true);
  const [ready, setReady] = useState(false);
  const [visitor,setVisitor]=useState(false);
  const [status, setStatus] = useState('Po lidhim klasën…');
  const [storageError, setStorageError] = useState(false);
  const [adventure, setAdventure] = useState<Adventure | null>(null);
  const [hint, setHint] = useState(false);
  const [hintStep,setHintStep]=useState(0);
  const [memoryVisible, setMemoryVisible] = useState(true);
  const [memoryRound, setMemoryRound] = useState(0);
  const [editor, setEditor] = useState<Puzzle | null>(null);
  const [editorVersion, setEditorVersion] = useState(0);
  const [invite, setInvite] = useState<{ profile: string; url: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const token = useRef('');
  const leaving = useRef(false);
  const cacheKey = useRef('');
  const current = useRef<Cache>({ config: EMPTY, revision: 0, pending: [] });
  const saving = useRef(false);
  const flushing = useRef(false);
  const connecting = useRef(false);
  const heading = useRef<HTMLHeadingElement>(null);

  useEffect(()=>{if(screen!=='result'||!adventure?.stars||celebrated.current===adventure.id)return;celebrated.current=adventure.id;play('complete');celebrate();},[screen,adventure,play,celebrate]);

  const storeCache = useCallback(() => {
    if (leaving.current || !cacheKey.current) return;
    try {
      if(student)writeStudentCache(token.current, {pending:current.current.pending});
      else localStorage.setItem(cacheKey.current, JSON.stringify(current.current));
    } catch { setStorageError(true); }
  }, [student]);
  const api = useCallback(async <T,>(path: string, method = 'GET', data?: unknown): Promise<T> => {
    if(leaving.current)throw Error('Duke dalë nga llogaria.');
    const requestToken=token.current;
    const headers: Record<string, string> = {};
    if (data !== undefined) headers['Content-Type'] = 'application/json';
    if (student) headers.Authorization = 'Bearer ' + token.current;
    const controller = new AbortController(); const timer = setTimeout(() => controller.abort(), 15000);
    try {
      const response = await fetch(path, { method:method==='DOWNLOAD'?'GET':method, headers, body: data === undefined ? undefined : JSON.stringify(data), cache: 'no-store', signal: controller.signal });
      if(method==='DOWNLOAD'&&response.ok){const blob=await response.blob();const url=URL.createObjectURL(blob);const link=document.createElement('a');link.href=url;link.download=response.headers.get('content-disposition')?.match(/filename="([^"]+)"/)?.[1]||'mendje.pdf';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);return {} as T;}
      const result: unknown = await response.json();
      if(student && (leaving.current || token.current!==requestToken))throw Error('Hyrja ka ndryshuar.');
      if(student && response.status===401){clearStudentSession();token.current='';leaving.current=true;location.href='/student';}
      if (!response.ok) throw Object.assign(Error(result && typeof result === 'object' && 'error' in result ? String(result.error) : 'Kërkesa dështoi.'),{status:response.status});
      return result as T;
    } finally { clearTimeout(timer); }
  }, [student]);
  const syncConfig = useCallback(async () => {
    if (student || saving.current || !current.current.dirty) return;
    saving.current = true;
    try {
      while (current.current.dirty) {
        const snapshot = current.current.config;
        const result = await api<{ revision: number }>('/api/workspace', 'PUT', { ...snapshot, revision: current.current.revision });
        current.current.revision = result.revision;
        current.current.dirty = snapshot !== current.current.config;
        storeCache();
      }
      setStatus('Ndryshimet u ruajtën në server.');toast.success('Ndryshimet u ruajtën.');
    } catch (error) { setStatus(message(error) + ' Ndryshimet mbeten në këtë pajisje. Eksporto bibliotekën përpara rifreskimit.'); }
    finally { saving.current = false; }
  }, [api, storeCache, student]);
  const flush = useCallback(async () => {
    if (flushing.current) return;
    flushing.current = true;
    try {
      await syncConfig();
      if (current.current.dirty) throw Error('Biblioteka duhet ruajtur përpara aventurës.');
      while (current.current.pending.length) {
        const pending=current.current.pending[0];
        const result=await api<{stars:number}>(student ? '/api/student' : '/api/sessions', 'POST', pending);
        setAdventure(previous=>previous?.id===pending.id?{...previous,stars:result.stars}:previous);
        current.current.pending.shift(); storeCache();
      }
      setStatus('Lidhja me serverin është aktive.');
    } catch (error) { setStatus('Aventura pret ruajtjen: ' + message(error)); }
    finally { flushing.current = false; }
  }, [api, storeCache, student, syncConfig]);

  const connect = useCallback(async () => {
    if (connecting.current || leaving.current) return;
    connecting.current = true; setReady(false); setStatus('Po lidhim klasën…');
    try {
      const preferences = readJSON(STORAGE);
      const selectedGrade = GRADES.includes(Number(preferences.grade)) ? Number(preferences.grade) : 1;
      setCount([5, 8, 10].includes(Number(preferences.count)) ? Number(preferences.count) : 5);
      setReflection(preferences.reflection !== false);
      let cfg: Config, revision = 0, selected = String(preferences.activeProfile || ''), rows: SavedSession[];
      if (student) {
        const fragment = new URLSearchParams(location.hash.slice(1)).get('token');
        if (fragment) {
          setAdventure(null); setScreen('home'); setHint(false); setHintStep(0); setMemoryVisible(true);
          history.replaceState(null, '', location.pathname + location.search);
          startStudentSession(fragment);
        }
        token.current=getStudentToken();
        if(!token.current){location.href='/student';return;}
        const data = await api<StudentWorkspace>('/api/student');
        cfg = { profiles: [data.profile], custom: [] }; setStudentCustom(data.custom); selected = data.profile.id; rows = data.sessions;
        cacheKey.current = 'student-session';
      } else {
        const data = await api<Workspace>('/api/workspace');
        cfg = { profiles: data.profiles, custom: data.custom }; revision = data.revision; rows = data.sessions;
        cacheKey.current = 'mendje-cloud-teacher-' + data.scope;
      }
      const cached = (student ? readStudentCache() : readJSON(cacheKey.current)) as Partial<Cache> & { lastConfig?: string };
      const oldDirty = cached.config && cached.lastConfig && JSON.stringify(cached.config) !== cached.lastConfig;
      let dirty = false;
      if (!student && cached.config && (cached.dirty || oldDirty) && validWorkspace(cached.config)) {
        if (cached.revision === revision) { cfg = cached.config; dirty = true; }
        else {
          try { localStorage.setItem(cacheKey.current + '-conflict', JSON.stringify(cached.config)); } catch { setStorageError(true); }
          setStatus('Ka ndryshime lokale me konflikt. Eksporto kopjen lokale nga biblioteka përpara ndryshimeve të tjera.');
        }
      }
      // Preserve legacy pending data for export, but never submit client-scored records as verified results.
      const pending = Array.isArray(cached.pending) ? cached.pending.filter(s => s.verified === true) : [];
      if (!student && Array.isArray(cached.pending) && cached.pending.some(s => s.verified !== true)) {
        localStorage.setItem(cacheKey.current + '-legacy-pending', JSON.stringify(cached.pending.filter(s => s.verified !== true)));
      }
      current.current = { config: cfg, revision, pending, dirty };
      if (!cfg.profiles.some(p => p.id === selected)) selected = '';
      setConfig(cfg); setActive(selected); setGrade(cfg.profiles.find(p => p.id === selected)?.grade || selectedGrade);
      const unique = new Map(rows.map(s => [s.id, s]));
      for (const s of pending) if (!unique.has(s.id)) unique.set(s.id, s);
      setSessions([...unique.values()]); setReady(true);setVisitor(false);
      if (!(cached.config && (cached.dirty || oldDirty) && cached.revision !== revision)) {
        storeCache(); await flush();
      }
    } catch (error) { setStatus(message(error));if(!student&&error&&typeof error==='object'&&'status' in error&&error.status===401)setVisitor(true); }
    finally { connecting.current = false; }
  }, [api, flush, storeCache, student]);

  useEffect(() => {
    // Start browser-only storage/auth initialization after hydration.
    const timer = setTimeout(() => { void connect(); }, 0);
    const reconnect = () => { if(student && new URLSearchParams(location.hash.slice(1)).has('token'))void connect(); };
    window.addEventListener('hashchange',reconnect);
    return () => {clearTimeout(timer);window.removeEventListener('hashchange',reconnect);};
  }, [connect,student]);
  useEffect(() => {
    if (!ready || student) return;
    try {
      const old = readJSON(STORAGE);
      localStorage.setItem(STORAGE, JSON.stringify({ ...old, grade, count, reflection, activeProfile: active }));
    } catch { /* Cache is optional; server data remains available. */ }
  }, [ready, grade, count, reflection, active, student]);

  function logoutStudent() {
    if(leaving.current)return;
    if(current.current.pending.length&&!window.confirm('Disa rezultate ende nuk janë ruajtur në server. Nëse del tani, kopja në këtë skedë do të fshihet. Të dalësh?'))return;
    leaving.current=true;
    const bearer=token.current;
    token.current='';cacheKey.current='';
    current.current={config:EMPTY,revision:0,pending:[]};
    setConfig(EMPTY);setSessions([]);setStudentCustom([]);setAdventure(null);setActive('');setReady(false);setBusy(true);setStatus('Duke dalë nga llogaria…');
    void endStudentSession(async()=>{
      const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),3000);
      try{await fetch('/api/class-login',{method:'DELETE',headers:{Authorization:'Bearer '+bearer},cache:'no-store',signal:controller.signal});}
      finally{clearTimeout(timer);}
    },()=>{location.href='/student';});
  }
  const item = adventure?.items[adventure.index];
  const answered = !!adventure && adventure.answers.length > adventure.index;
  useEffect(() => {
    if (screen !== 'exercise') return;
    heading.current?.focus({ preventScroll: true });
    if (!item?.memory || answered) return;
    const timer = setTimeout(() => setMemoryVisible(false), (grade + 5) * 1000);
    return () => clearTimeout(timer);
  }, [screen, item, answered, memoryRound, grade]);

  function changeConfig(next: Config) {
    current.current.config = next; current.current.dirty = true;
    setConfig(next); storeCache(); void syncConfig();
  }
  function navigate(next: Screen) {
    if (screen === 'exercise' && !window.confirm('Të dilni? Aventura e papërfunduar nuk ruhet.')) return;
    setScreen(next); window.scrollTo(0, 0);
  }
  function selectProfile(id: string) {
    setActive(id); const p = config.profiles.find(p => p.id === id); if (p) setGrade(p.grade);
  }
  async function start(category: string,level?:number,assignment?:Assignment,scene?:PlayScene,gameLevel?:number,lessonId?:string,lessonLevel?:number) {
    setAnswerCelebration(null);
    if (busy || !ready) return;
    setBusy(true);
    try {
      await syncConfig();
      if (current.current.dirty) throw Error('Ruaj bibliotekën përpara aventurës.');
      const issued = await api<{id:string;grade:number;profile:string;items:PublicPuzzle[];level?:number;assignment?:string}>('/api/adventures','POST',{grade,profile:active,category,count,level,assignment:assignment?.id,scene,gameLevel,lessonId,lessonLevel});
      setAdventure({ ...issued, category, index:0, answers:[] });
      setHint(false); setHintStep(0); setMemoryVisible(true); setScreen('exercise'); window.scrollTo(0,0);
    } catch(error) {setStatus(message(error));}
    finally {setBusy(false);}
  }
  async function answer(value: string) {
    if (busy || !adventure || !item || answered || (item.memory && memoryVisible)) return;
    setBusy(true);
    try {
      const result = await api<{correct:boolean;explain:string}>('/api/adventures','PATCH',{id:adventure.id,index:adventure.index,value});
      if(!result.correct)play('wrong');
      if(result.correct){setAnswerCelebration({id:adventure.id+'-'+adventure.index,name:config.profiles.find(p=>p.id===adventure.profile)?.name||''});celebrate();}
      setAdventure({ ...adventure, selected:value, items:adventure.items.map((p,i)=>i===adventure.index?{...p,explain:result.explain}:p), answers:[...adventure.answers,{cat:item.cat,question:item.title,correct:result.correct}] });
    } catch(error) {setStatus(message(error));}
    finally {setBusy(false);}
  }
  async function requestHint() {
    if (!adventure || !item || busy) return;
    if(item.memory){setMemoryVisible(true);setMemoryRound(v=>v+1);return;}
    setBusy(true);
    try {
      const result=await api<{hint:string}>('/api/adventures?id='+encodeURIComponent(adventure.id)+'&index='+adventure.index+'&step='+Math.min(2,hintStep+1));
      setAdventure({...adventure,items:adventure.items.map((p,i)=>i===adventure.index?{...p,hint:result.hint}:p)});setHint(true);setHintStep(previous=>Math.min(2,previous+1));
    } catch(error){setStatus(message(error));}
    finally {setBusy(false);}
  }
  function nextQuestion() {
    setAnswerCelebration(null);
    if (!adventure || !answered) return;
    if (adventure.index + 1 < adventure.items.length) {
      setAdventure({ ...adventure, index: adventure.index + 1, selected: undefined }); setHint(false); setHintStep(0); setMemoryVisible(true); return;
    }
    const saved: SavedSession = { id: adventure.id, profile: adventure.profile, grade: adventure.grade, answers: adventure.answers, date: new Date().toISOString(), verified:true,level:adventure.level,assignment:adventure.assignment };
    current.current.pending.push(saved); storeCache(); setSessions(prev => [...prev, saved]);
    setScreen('pause'); void flush();
  }
  function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const form = event.currentTarget; const data = new FormData(form);
    const name = String(data.get('name') || '').trim();
    if (!name || config.profiles.length >= 2000) { setStatus('Plotëso pseudonimin. Mund të ketë deri në 2000 profile.'); return; }
    if (config.profiles.some(p => p.name.toLocaleLowerCase() === name.toLocaleLowerCase())) { setStatus('Ky pseudonim ekziston.'); return; }
    const profile: Profile = { id: crypto.randomUUID(), name, grade: Number(data.get('grade')) };
    changeConfig({ ...config, profiles: [...config.profiles, profile] }); setActive(profile.id); setGrade(profile.grade); form.reset();
  }
  function savePuzzle(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const data = new FormData(event.currentTarget);
    const allOptions = [0, 1, 2, 3].map(i => String(data.get('option' + i) || '').trim());
    const puzzle: Puzzle = { id: editor?.id || crypto.randomUUID(), grade: Number(data.get('grade')), cat: String(data.get('cat')), title: String(data.get('title') || '').trim(), visual: String(data.get('visual') || '').trim(), options: allOptions.filter(Boolean), answer: allOptions[Number(data.get('correct'))], explain: String(data.get('explain') || '').trim(), hint: String(data.get('hint') || '').trim() };
    const custom = [...config.custom.filter(p => p.id !== puzzle.id), puzzle];
    if (!validWorkspace({ ...config, custom })) { setStatus('Plotëso tri alternativa të ndryshme, përgjigjen, ndihmën dhe shpjegimin. Kufiri: 150 ushtrime.'); return; }
    changeConfig({ ...config, custom }); setEditor(null); setEditorVersion(v => v + 1);
  }
  async function importLibrary(file?: File) {
    if (!file) return;
    try {
      if (file.size > 1_000_000) throw Error('Maksimumi i skedarit është 1 MB.');
      const data = JSON.parse(await file.text());
      if (data.version !== 1 || !Array.isArray(data.exercises) || !validWorkspace({ profiles: [], custom: data.exercises })) throw Error('Biblioteka nuk është e vlefshme.');
      const merged = new Map(config.custom.map(p => [p.id, p]));
      for (const p of data.exercises) if (!merged.has(p.id)) merged.set(p.id, p);
      const next = { ...config, custom: [...merged.values()] };
      if (!validWorkspace(next)) throw Error('Biblioteka do të tejkalonte kufirin prej 150 ushtrimesh.');
      changeConfig(next);
    } catch (error) { setStatus(message(error)); }
  }
  async function manageInvite(revoke = false) {
    setBusy(true);
    try {
      await syncConfig(); if (current.current.dirty) throw Error('Ruaj profilin në server përpara krijimit të lidhjes.');
      const data = await api<{ token?: string }>('/api/invites', revoke ? 'DELETE' : 'POST', { profile: active });
      setInvite(revoke ? null : { profile: active, url: location.origin + '/student#token=' + data.token });
      setStatus(revoke ? 'Lidhjet u çaktivizuan.' : 'Lidhja u krijua dhe vlen 7 ditë.');
    } catch (error) { setStatus(message(error)); }
    finally { setBusy(false); }
  }
  async function deleteProfile() {
    if(!active||busy||!window.confirm('Të fshihet ky profil dhe të gjitha rezultatet e tij në server? Fshirja është përfundimtare.'))return;
    setBusy(true);
    try{
      await syncConfig();if(current.current.dirty)throw Error('Ruaj ndryshimet përpara fshirjes.');
      const result=await api<{revision:number}>('/api/workspace','DELETE',{profile:active,revision:current.current.revision,confirmation:'FSHI'});
      current.current.config={...current.current.config,profiles:current.current.config.profiles.filter(p=>p.id!==active)};
      current.current.pending=current.current.pending.filter(s=>s.profile!==active);current.current.revision=result.revision;
      setConfig(current.current.config);setSessions(prev=>prev.filter(s=>s.profile!==active));setInvite(null);setActive('');storeCache();setStatus('Profili dhe të dhënat e tij u fshinë nga serveri.');
    }catch(error){setStatus(message(error));}finally{setBusy(false);}
  }
  const filtered = sessions.filter(s => s.profile === active && s.grade === grade);
  const availableCustom = student ? studentCustom : config.custom;
  const answers = filtered.flatMap(s => s.answers);
  const profileName = config.profiles.find(p => p.id === active)?.name || 'Përdorim i përbashkët';
  const correctCount = answers.filter(a => a.correct).length;
  const normalStatus = ['Lidhja me serverin është aktive.', 'Ndryshimet u ruajtën në server.', 'Lidhjet u çaktivizuan.'].includes(status);
  const profileBar = <div className="workspace-bar">{student ? <strong>{profileName} · Klasa {grade}</strong> : <><label>Profili i nxënësit <select value={active} onChange={e => selectProfile(e.target.value)}><option value="">Përdorim i përbashkët</option>{config.profiles.map(p => <option key={p.id} value={p.id}>{p.name} · Klasa {p.grade}</option>)}</select></label><button className="ghost" onClick={() => navigate('profiles')}>Menaxho profilet →</button></>}</div>;

  if(visitor&&!student)return <VisitorExperience/>;
  return <div className={screen==='exercise'?'learning-shell lesson-shell':'learning-shell dashboard-shell'}>
    {screen==='exercise'&&answerCelebration&&<AnswerCelebration key={answerCelebration.id} name={answerCelebration.name}/>}
    <header className="app-header"><button className="brand" onClick={() => navigate('home')}><span className="brand-icon"><BrainCircuit size={25} strokeWidth={2.4} /></span><span>Mendje të<br /><strong>Zgjuara</strong></span></button><nav className="nav" aria-label="Navigimi">{(student ? [['home', 'Misionet e mia']] : [['classes','Klasat e mia'],['home', 'Ushtrimet'],['course','Kursi & klasat'], ['teacher', 'Për mësuesin'], ['ideas', 'Ide për klasën']]).map(([key, label]) => <button key={key} className={screen === key || key === 'home' && ['exercise', 'pause', 'result'].includes(screen) ? 'active' : ''} onClick={() => navigate(key as Screen)}>{key === 'home' ? <BookOpen size={18} /> : key === 'teacher' ? <GraduationCap size={19} /> : key === 'notebook' ? <NotebookPen size={18} /> : <Lightbulb size={18} />}{label}</button>)}</nav><div className="header-tools"><DisplaySettings/>{!student&&<TeacherSignout/>}{student&&<button className="ghost" onClick={logoutStudent} disabled={busy}>Dil</button>}<div className="header-score" title="Përgjigje të sakta në profilin dhe klasën e zgjedhur"><Star size={21} fill="currentColor" /><span>{correctCount}<small>të sakta</small></span></div></div></header>
    <main className={screen === 'home' ? 'course-main' : 'workspace-main'}>
      <div className={'connection-strip ' + (ready && normalStatus ? 'connected' : '')} role="status"><span>{ready && normalStatus ? <><CircleCheck size={14} /> Gati për të mësuar</> : status}</span><button className="connection-refresh" title={ready ? 'Rifresko progresin' : 'Provo përsëri'} aria-label={ready ? 'Rifresko progresin' : 'Provo përsëri'} disabled={screen === 'exercise' || busy} onClick={() => { if (current.current.dirty && !window.confirm('Ka ndryshime lokale. Eksporto bibliotekën përpara rifreskimit. Të vazhdojmë?')) return; void connect(); }}><RotateCw size={14} />{!ready && 'Provo përsëri'}</button>{!ready && !student && <a className="inline-link" href="/teacher/login">Hyr si mësues</a>}</div>
      {storageError && <p className="error" role="alert">Ruajtja lokale nuk është e disponueshme. Mbaje faqen hapur derisa ndryshimet të ruhen në server.</p>}
      {!ready ? status==='Po lidhim klasën…'?<LoadingScreen student={student}/>:<section className="pause"><span className="result-mark">✳</span><h1>{student ? 'Hyrja jote ka skaduar.' : 'Klasa jote, kudo që je.'}</h1><p>Profile dhe ushtrime për klasat 1–4. Hyr si mësues ose vendos kodin e klasës te hyrja e nxënësit.</p><a className="secondary" href="/student">Hyrja e nxënësve →</a></section> : <>
      {['teacher', 'notebook', 'editor','course'].includes(screen) && profileBar}
      {screen==='classes'&&!student&&<ClassroomHub api={api} onStudent={(id,g,classId)=>{setPreviewClass(classId);localStorage.setItem(STORAGE,JSON.stringify({...readJSON(STORAGE),activeProfile:id,grade:g}));setScreen('course');void connect();}}/>}
      {screen==='home'&&student&&<StudentHome name={profileName} api={api} sessions={sessions} start={a=>void start(a.category,a.level,a)}/>}
      {screen==='course'&&<CourseHub initialClass={previewClass} student={student} grade={grade} profile={active} profiles={config.profiles} api={api} start={(category,level,assignment)=>void start(category,level,assignment)} onError={setStatus} onSessions={setSessions}/>}
      {screen === 'home' && !student && <>
        <div className="course-topline"><span className="course-breadcrumb"><BookOpen size={16} /> Kursi im <ChevronRight size={14} /><strong>Logjikë & mendim</strong></span>{profileBar}</div>
        <section className="course-hero" aria-labelledby="course-title"><div className="lab-character robot"><LabRobot /></div><div className="course-intro"><span className="course-kicker"><Sparkles size={14} /> LABORATORI I MENDJES</span><h1 id="course-title">Logjikë & mendim</h1><p>Një botë me zbulime për mendje kureshtare.<br />Luaj, arsyeto dhe gjej mënyrën tënde!</p>{student ? <span className="student-grade">Klasa {grade}</span> : <div className="grades" aria-label="Zgjedhja e klasës">{GRADES.map(g => <button key={g} className={'grade ' + (grade === g ? 'selected' : '')} aria-pressed={grade === g} disabled={student && g !== config.profiles[0]?.grade} onClick={() => setGrade(g)}>Klasa {g}</button>)}</div>}</div><div className="lab-character professor"><LabProfessor /></div><span className="hero-doodle doodle-one" aria-hidden="true">✦</span><span className="hero-doodle doodle-two" aria-hidden="true">+</span><span className="hero-doodle doodle-three" aria-hidden="true">○</span></section>
        <CurriculumHub key={'curriculum-'+grade+'-'+active} grade={grade} profile={active} api={api} start={(id,level)=>void start('mixed',undefined,undefined,undefined,undefined,id,level)}/><RobotHub key={'robot-'+grade+'-'+active} grade={grade} profile={active} api={api} start={level=>void start('play',undefined,undefined,'robot',level)}/><PlayGallery key={grade+'-'+active} grade={grade} profile={active} api={api} start={(scene,level)=>void start('play',undefined,undefined,scene,level)}/><div className="course-route-link"><button className="secondary" onClick={()=>navigate('course')}>Shiko rrugën e niveleve, detyrat dhe yjet →</button></div><div className="section-head course-section-head"><div><h2>Zgjidh sfidën tënde</h2><p>Çdo ushtrim, një zbulim i ri.</p></div><div className="course-section-actions"><span className="course-class-label">{count} ushtrime · Klasa {grade}</span><button className="primary hero-start" onClick={() => start('mixed')}>Fillo aventurën <ChevronRight size={19} /></button></div></div>
        <section className="categories" aria-label="Kategoritë e ushtrimeve">{COURSE_CATEGORIES.map(c => { const categoryAnswers = answers.filter(a => a.cat === c.id); return <button key={c.id} className="puzzle-tile" style={{ '--tint': c.tint } as CSSProperties} onClick={() => start(c.id)} aria-label={`${c.name} · Klasa ${grade}. ${c.desc}`}><span className="tile-art"><PuzzleArt category={c.id} /><span className="tile-count">{14 + gameCategoryCount(c.id) + availableCustom.filter(p => p.grade === grade && p.cat === c.id).length} ushtrime</span></span><span className="tile-info"><span className="grade-label">Për klasën {grade}</span><span className="tile-title">{c.name}</span><span className="tile-description">{c.desc}</span></span><span className="tile-bottom"><span className="tile-progress">{categoryAnswers.length ? <><CircleCheck size={14} />{categoryAnswers.filter(a => a.correct).length}/{categoryAnswers.length} të sakta</> : <><Sparkles size={14} />Gati për zbulim</>}</span><span className="tile-play" aria-hidden="true"><ChevronRight size={20} /></span></span></button>; })}</section>
        <div className="course-bottom"><section className="progress-summary"><span className="summary-icon"><Star size={25} /></span><div><h2>Rruga jote deri tani</h2><p>{filtered.length ? 'Çdo përpjekje të çon një hap më tej.' : 'Fillo aventurën dhe shiko progresin tënd këtu.'}</p></div><div className="stats"><div className="stat"><strong>{filtered.length}</strong><span>aventura</span></div><div className="stat"><strong>{answers.length}</strong><span>ushtrime</span></div><div className="stat"><strong>{answers.length ? Math.round(correctCount / answers.length * 100) : 0}%</strong><span>saktësi</span></div></div><button className="summary-link" onClick={() => navigate(student ? 'notebook' : 'teacher')} aria-label={student ? 'Shiko fletoren e mendimit' : 'Shiko progresin në panelin e mësuesit'}><ChevronRight size={22} /></button></section><section className="class-collection"><span className="class-book"><NotebookPen size={25} /></span><div><h2>Nga mësuesi yt</h2><p>{availableCustom.filter(p => p.grade === grade).length} ushtrime për klasën {grade}</p></div><button className="secondary" disabled={!availableCustom.some(p => p.grade === grade)} onClick={() => start('custom')}>Fillo ushtrimet e mësuesit <ChevronRight size={17} /></button></section></div>
      </>}
      {screen === 'exercise' && adventure && item && <section className="exercise"><div className="exercise-top"><button className="ghost" onClick={() => navigate('home')}>← Dil nga aventura</button><span className="badge">Klasa {adventure.grade} · {(adventure.lessonLevel||adventure.gameLevel)?`Niveli ${adventure.lessonLevel||adventure.gameLevel} · `:''}{adventure.index + 1}/{adventure.items.length}</span></div><div className="progress" role="progressbar" aria-label="Progresi i aventurës" aria-valuemin={0} aria-valuemax={adventure.items.length} aria-valuenow={adventure.index}><div style={{ width: adventure.index / adventure.items.length * 100 + '%' }} /></div><motion.div className="question-card" animate={{x:answered&&!adventure.answers[adventure.index]?.correct&&!reduced?[0,-5,5,-3,3,0]:0}} transition={{duration:.35}}><div className="puzzle-guide"><div className="guide-character"><LabProfessor state={answered?'celebrate':'think'}/></div><p>{answered?'Le të zbulojmë pse.':'Shiko të dhënat. Merre me radhë.'}</p><ProgressRing value={adventure.index+(answered?1:0)} total={adventure.items.length}/></div><span className="eyebrow">{['placement','pipes','maze'].includes(item.type||'')?'LOJË ME FIGURA':CATEGORIES.find(c => c.id === item.cat)?.name}</span><h1 ref={heading} tabIndex={-1}>{item.title}</h1>{!['placement','pipes','maze','robot','creative'].includes(item.type||'')&&<div className="visual"><IllustratedLine text={item.memory && !memoryVisible && !answered ? '● ? ●' : item.visual}/></div>}{item.memory && !answered && <p className="tiny" role="status">{memoryVisible ? `Vëzhgo vargun për ${grade + 5} sekonda.` : 'Zgjidh simbolin. Mund ta shohësh sërish.'}</p>}<div hidden={item.memory && memoryVisible && !answered}><PuzzleInput key={adventure.id+'-'+adventure.index} puzzle={item} disabled={answered||busy} selected={adventure.selected} correct={adventure.answers[adventure.index]?.correct} onAnswer={value=>void answer(value)}/></div><div aria-live="polite">{answered ? <><div className="feedback"><strong>{adventure.answers[adventure.index]?.correct ? 'Bukur, e gjete!' : 'Një gabim është një mundësi për të mësuar.'}</strong>{item.explain}</div><details className="lesson-reflection"><summary>Shpjego si mendove (opsionale)</summary>{reflection && <div className="reason">Si e gjete? A ka një mënyrë tjetër?</div>}<label htmlFor="reasoning">Shkruaj si mendove (opsionale)</label><textarea id="reasoning" className="journal-input" maxLength={1200} value={adventure.answers[adventure.index].note || ''} onChange={e => setAdventure({ ...adventure, answers: adventure.answers.map((a, i) => i === adventure.index ? { ...a, note: e.target.value } : a) })} /><p className="tiny">Shënimi ruhet kur përfundon aventurën.</p></details></> : hint && <div className="reason">💡 {item.hint}</div>}</div><div className="actions">{answered ? <button className="primary" onClick={nextQuestion}>{adventure.index + 1 === adventure.items.length ? 'Përfundo aventurën' : 'Ushtrimi tjetër →'}</button> : <button className="secondary" disabled={busy} onClick={() => { void requestHint(); }}>{item.memory ? 'Shiko vargun sërish' : hintStep===0?'Më jep një ndihmë':hintStep===1?'Një ndihmë më e thellë':'Rilexo ndihmën'}</button>}<span className="tiny">Mendo me qetësi.</span></div></motion.div></section>}
      {screen === 'pause' && <section className="pause"><span className="result-mark">🌿</span><h1>Një pushim i vogël.</h1><p>Shiko larg ekranit, shtri krahët dhe trego një gjë të re që zbulove.</p><button className="primary" onClick={() => setScreen('result')}>Shiko përmbledhjen</button></section>}
      {screen === 'result' && adventure && <><section className="result"><div className="result-character"><LabRobot state="celebrate"/></div><h1>Çdo përpjekje të ndihmon të rritesh.</h1><p>Zgjidhe saktë {adventure.answers.filter(a => a.correct).length} nga {adventure.items.length} ushtrime.</p><div className="result-stars" aria-label={adventure.stars===undefined?'Po ruajmë rezultatin':`${adventure.stars} nga 3 yje`}>{adventure.stars===undefined?<p className="tiny">Po ruajmë rezultatin në server…</p>:[1,2,3].map(n=><motion.span key={n} initial={reduced?false:{scale:.5}} animate={{scale:1}} transition={{delay:reduced?0:n*.1,type:'spring',stiffness:200}}><Star size={38} fill={n<=adventure.stars!?'currentColor':'none'}/></motion.span>)}</div><button className="primary" onClick={() => student&&adventure.assignment?navigate('home'):start(adventure.category,adventure.level,undefined,adventure.scene,adventure.gameLevel?Math.min(20,adventure.gameLevel+1):undefined,adventure.lessonId,adventure.lessonLevel?Math.min(30,adventure.lessonLevel+1):undefined)}>{student&&adventure.assignment?'Misionet e mia':adventure.lessonLevel?(adventure.lessonLevel<30?'Niveli tjetër →':'Provo sërish nivelin 30'):adventure.gameLevel&&adventure.gameLevel<20?'Niveli tjetër →':adventure.gameLevel?'Luaj sërish nivelin 20':'Provo një aventurë tjetër'}</button><button className="secondary" onClick={()=>navigate('course')}>Shiko rrugën dhe detyrat</button><button className="ghost" onClick={() => navigate('home')}>Kthehu te ushtrimet</button></section><section className="panel"><h2>Të mendojmë sërish</h2>{adventure.items.map((p, i) => <article className="idea" key={i}><span className="badge">{adventure.answers[i]?.correct ? 'E saktë' : 'Për t’u diskutuar'}</span><h3>{p.title}</h3><p>{p.explain}</p>{adventure.answers[i]?.note && <blockquote className="review">{adventure.answers[i].note}</blockquote>}</article>)}</section></>}
      {!student && screen === 'teacher' && <>
        <h1>Udhëhiq mendimin,<br />jo vetëm përgjigjen.</h1><p className="alert">Përgjigjet e aventurave të reja kontrollohen në server. Rezultatet e vjetra mbeten të shënuara si praktikë e paverifikuar.</p><div className="panels"><section className="panel"><h2>Përshtat aventurën</h2><label>Klasa <select value={grade} onChange={e => setGrade(Number(e.target.value))}>{GRADES.map(g => <option key={g}>{g}</option>)}</select></label><label>Ushtrime në aventurë <select value={count} onChange={e => setCount(Number(e.target.value))}>{[5, 8, 10].map(n => <option key={n}>{n}</option>)}</select></label><label><input type="checkbox" checked={reflection} onChange={e => setReflection(e.target.checked)} /> Pyetje reflektimi</label></section><section className="panel"><h2>Mjetet e klasës</h2><div className="subnav">{(['profiles', 'editor', 'notebook'] as Screen[]).map((s, i) => <button key={s} className="secondary" onClick={() => navigate(s)}>{['Profilet', 'Biblioteka', 'Fletorja e mendimit'][i]}</button>)}</div></section></div><section className="panel collection"><div className="section-head"><h2>Progresi · {profileName}</h2><button className="secondary" onClick={() => download('progres-mendje.csv', '\uFEFFData,Klasa,Kategoria,Sakte,Gjithsej,Verifikuar\r\n' + filtered.flatMap(s => CATEGORIES.map(c => { const a = s.answers.filter(a => a.cat === c.id); return a.length ? [s.date?.slice(0, 10), s.grade, c.id, a.filter(a => a.correct).length, a.length,s.verified ? 'Po' : 'Jo'].join(',') : ''; }).filter(Boolean)).join('\r\n'), 'text/csv;charset=utf-8')}>Eksporto CSV</button></div><div className="table-wrap"><table><thead><tr><th>Kategoria</th><th>Ushtrime</th><th>Saktësi</th></tr></thead><tbody>{CATEGORIES.map(c => { const a = answers.filter(a => a.cat === c.id); return <tr key={c.id}><td>{c.name}</td><td>{a.length}</td><td>{a.length ? Math.round(a.filter(a => a.correct).length / a.length * 100) + '%' : '—'}</td></tr>; })}</tbody></table></div><p>Shfaqen deri në 200 aventurat më të fundit të marra nga serveri.</p></section>
      </>}
      {!student && screen === 'profiles' && <><h1>Secili ka rrugën e vet.</h1><p>Përdor pseudonime. Secili nxënës merr lidhjen e vet që vlen 7 ditë.</p><section className="panel"><h2>Shto profil</h2><form className="profile-form" onSubmit={saveProfile}><label>Pseudonimi <input name="name" required maxLength={30} placeholder="Ylli 01" /></label><label>Klasa <select name="grade" defaultValue={grade}>{GRADES.map(g => <option key={g}>{g}</option>)}</select></label><button className="primary" type="submit">Shto profilin</button></form></section><section className="panel collection">{profileBar}{config.profiles.map(p => <div className="collection-item" key={p.id}><strong>{p.name} · Klasa {p.grade}</strong><button className="secondary" onClick={() => selectProfile(p.id)}>Zgjidh profilin</button></div>)}</section><section className="panel"><h2>Hyrja nga pajisja e nxënësit</h2><p className="alert">Faqja mbetet private në Sites. Hyrja nga pajisjet e nxënësve kërkon qasje të lejuar në hosting.</p><div className="actions"><button className="primary" disabled={!active || busy} onClick={() => void manageInvite()}>Krijo lidhje për {profileName}</button><button className="secondary" disabled={!active || busy} onClick={() => void manageInvite(true)}>Çaktivizo lidhjet</button><button className="secondary" disabled={!active || busy} onClick={() => { void deleteProfile(); }}>Fshi profilin dhe rezultatet</button></div>{invite?.profile === active && <label>Lidhja personale<textarea className="journal-input" readOnly value={invite.url} /></label>}</section></>}
      {!student && screen === 'editor' && <><h1>Krijo një pyetje që zgjon mendimin.</h1><p>Ushtrimet ruhen në server dhe shfaqen për klasën përkatëse.</p><form key={editorVersion + (editor?.id || '')} onSubmit={savePuzzle} className="panel form-grid"><label>Klasa<select name="grade" defaultValue={editor?.grade || grade}>{GRADES.map(g => <option key={g}>{g}</option>)}</select></label><label>Kategoria<select name="cat" defaultValue={editor?.cat || 'logic'}>{CATEGORIES.filter(c => c.id !== 'memory').map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label><label className="wide">Pyetja<textarea name="title" required maxLength={1000} defaultValue={editor?.title || ''} /></label><label className="wide">Numra ose simbole (opsionale)<input name="visual" maxLength={1000} defaultValue={editor?.visual || ''} /></label>{[0, 1, 2, 3].map(i => <label key={i}>Alternativa {i + 1}{i === 3 ? ' (opsionale)' : ''}<input name={'option' + i} required={i < 3} maxLength={160} defaultValue={editor?.options[i] || ''} /></label>)}<label className="wide">Alternativa e saktë<select name="correct" defaultValue={Math.max(0, editor?.options.indexOf(editor.answer) || 0)}>{[0, 1, 2, 3].map(i => <option key={i} value={i}>Alternativa {i + 1}</option>)}</select></label><label className="wide">Shpjegimi<textarea name="explain" required maxLength={1000} defaultValue={editor?.explain || ''} /></label><label className="wide">Ndihma<input name="hint" required maxLength={1000} defaultValue={editor?.hint || ''} /></label><div className="actions wide"><button className="primary" type="submit">Ruaj ushtrimin</button><button className="secondary" type="button" onClick={() => { setEditor(null); setEditorVersion(v => v + 1); }}>Pyetje e re</button></div></form><section className="panel collection"><h2>Biblioteka ({config.custom.length})</h2><div className="subnav"><button className="secondary" onClick={() => download('biblioteka-mendje.json', JSON.stringify({ version: 1, exercises: config.custom }, null, 2), 'application/json')}>Eksporto bibliotekën</button><button className="secondary" onClick={() => { const legacy = readJSON(STORAGE); const cached = readJSON(cacheKey.current) as Partial<Cache>; const conflict = readJSON(cacheKey.current + '-conflict') as Partial<Config>; const custom = conflict.custom || cached.config?.custom || legacy.custom || []; download('biblioteka-kopje-lokale.json', JSON.stringify({ version: 1, exercises: custom }, null, 2), 'application/json'); }}>Eksporto kopjen lokale</button></div><button className="secondary" onClick={() => download('aventura-praktike-te-vjetra.json', localStorage.getItem(cacheKey.current + '-legacy-pending') || '[]', 'application/json')}>Eksporto aventurat e vjetra në pritje</button><label>Importo bibliotekë JSON <input type="file" accept="application/json,.json" onChange={e => { void importLibrary(e.target.files?.[0]); e.target.value = ''; }} /></label>{config.custom.map(p => <article className="collection-item" key={p.id}><div><span className="pill">Klasa {p.grade}</span><p><strong>{p.title}</strong></p><span className="tiny">Përgjigjja: {p.answer}</span></div><button className="secondary" onClick={() => { setEditor(p); setEditorVersion(v => v + 1); window.scrollTo(0, 0); }}>Redakto</button></article>)}</section></>}
      {screen === 'notebook' && <><h1>Si arrita te përgjigjja?</h1><p>Shënimet diskutohen me mësuesin; nuk vlerësohen automatikisht.</p>{answers.some(a => a.note?.trim()) ? filtered.slice().reverse().flatMap(s => s.answers.filter(a => a.note?.trim()).map((a, i) => <article className="notebook-entry" key={s.id + i}><span className="tiny">{s.date?.slice(0, 10)} · {s.verified ? 'Kontrolluar në server' : 'Praktikë e vjetër, e paverifikuar'} · {a.correct ? 'E saktë' : 'Për t’u diskutuar'}</span><h3>{a.question}</h3><blockquote>{a.note}</blockquote><p>Cilat të dhëna përdore dhe si e kontrollove?</p></article>)) : <section className="panel"><p>Shkruaj si mendove pas një përgjigjeje. Përfundo aventurën për ta ruajtur këtu.</p><button className="primary" onClick={() => navigate('home')}>Fillo një aventurë</button></section>}</>}
      {!student && screen === 'ideas' && <><h1>Mësoji të pyesin.<br />Jepu hapësirë të zbulojnë.</h1><div className="panels">{IDEAS.map(([title, description], i) => <article className="panel" key={title}><span className="eyebrow">{String(i + 1).padStart(2, '0')}</span><h2>{title}</h2><p>{description}</p></article>)}</div></>}
      </>}
    </main><footer><span>Mësim me kureshtje, hap pas hapi. · Klasa 1–4</span><a className="inline-link" href="/privacy">Të dhënat e klasës</a></footer>
  </div>;
}
function message(error: unknown) { return error instanceof Error ? error.message : 'Kërkesa dështoi. Provo përsëri.'; }
