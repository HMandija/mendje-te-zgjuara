// Prova e ngarkesës mbi aplikacionin lokal (wrangler dev + D1 miniflare).
// Shikoni: shkruan vetëm të dhëna testimi me prefiksin "load-" dhe i pastron.
// Përdorimi:
//   node scripts/load-check.mjs seed    — krijon klasën, profilat dhe sesionet test
//   node scripts/load-check.mjs run     — xhiron skenarët A/C/B dhe raporton P50/P95
//   node scripts/load-check.mjs sweep   — matje sekuenciale për çdo rrugë (pa konkurrencë)
//   node scripts/load-check.mjs lesson  — 50 nxënës njëkohësisht, një mësim i plotë, një IP
// Paralajmërim: D1 lokal nuk ka vonesën e rrjetit të prodhimit; matjet relative
// (429, rendi i madhësisë, sjellja nën ngarkim) janë të vlefshme, ms absolutet jo.
import {execSync} from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';

const BASE=process.env.LOAD_BASE||'http://127.0.0.1:8787',OWNER='load-owner',CLASS='load-class',N_PROFILES=30,N_TOKENS=60;
const PROFILE_IDS=Array.from({length:N_PROFILES},(_,i)=>`load-p${i+1}`);
const TOKENS_FILE='.wrangler/load-tokens.json';
const wrangle=sql=>execSync(`npx wrangler d1 execute ${process.env.DB_NAME||'mendje-school'} --local --persist-to .wrangler/state --config dist/server/wrangler.json --command "${sql.replace(/"/g,'\\"')}" 2>&1`,{encoding:'utf8'});
const sha=t=>crypto.createHash('sha256').update(t).digest('hex');
const now=Date.now();

function seed(){
 wrangle(`INSERT OR IGNORE INTO accounts(user,role,enabled) VALUES('${OWNER}','TEACHER',1);`);
 const profiles=Array.from({length:N_PROFILES},(_,i)=>({id:`load-p${i+1}`,name:`Nxënësi ${i+1}`,grade:1}));
 const payload=JSON.stringify({profiles,custom:[],revision:1}).replace(/'/g,"''");
 wrangle(`INSERT INTO workspaces(owner,payload,revision) VALUES('${OWNER}','${payload}',1) ON CONFLICT(owner) DO UPDATE SET payload=excluded.payload,revision=1;`);
 wrangle(`INSERT OR IGNORE INTO schools(id,owner,name) VALUES('load-school','${OWNER}','Shkolla Test');`);
 wrangle(`INSERT OR IGNORE INTO classes(id,school,owner,name,grade,code) VALUES('${CLASS}','load-school','${OWNER}','Klasa Test',1,'LOAD1');`);
 const m=Array.from({length:N_PROFILES},(_,i)=>`('${CLASS}','load-p${i+1}')`).join(',');
 wrangle(`INSERT OR IGNORE INTO class_students(class,profile) VALUES ${m};`);
 const tokens=Array.from({length:N_TOKENS},()=>crypto.randomBytes(32).toString('hex'));
 const rows=tokens.map((t,i)=>{const profile=profiles[i%N_PROFILES].id,h=sha(t),expires=now+30*60_000;return `('${h}','${CLASS}','${profile}',${expires})`;}).join(',');
 wrangle(`INSERT OR REPLACE INTO picture_sessions(hash,class,profile,expires) VALUES ${rows};`);
 // Sesionet pa klasë (lidhje personale): lejojnë fillimin e një mësimi pa detyrë klase.
 const lessonTokens=Array.from({length:N_TOKENS},()=>crypto.randomBytes(32).toString('hex'));
 const lessonRows=lessonTokens.map((t,i)=>`('${sha(t)}','${OWNER}','${PROFILE_IDS[i%N_PROFILES]}',${now+30*60_000})`).join(',');
 wrangle(`INSERT OR REPLACE INTO student_sessions(hash,owner,profile,expires) VALUES ${lessonRows};`);
 fs.writeFileSync(TOKENS_FILE,JSON.stringify({tokens,lessonTokens,owner:OWNER,created:now}));
 console.log(`Seed OK: ${N_PROFILES} profila, ${N_TOKENS} sesione picture-login dhe ${N_TOKENS} sesione personale te .wrangler/load-tokens.json`);
}

async function call(path,token){
 const started=performance.now();
 try{
  const res=await fetch(BASE+path,{headers:{authorization:`Bearer ${token}`,origin:BASE}});
  const ms=Math.round(performance.now()-started),body=await res.text();
  return {status:res.status,ms,bytes:body.length};
 }catch(e){return {status:0,ms:Math.round(performance.now()-started),bytes:0,error:e.message};}
}
const pct=(list,p)=>{const s=[...list].sort((a,b)=>a-b);return s[Math.min(s.length-1,Math.floor(s.length*p))];};
function report(label,results){
 const ok=results.filter(r=>r.status===200),err=results.filter(r=>r.status!==200);
 const byErr={};for(const r of err)byErr[r.status]=(byErr[r.status]||0)+1;
 console.log(`${label}: n=${results.length} ok=${ok.length} err=${err.length}${err.length?' ('+JSON.stringify(byErr)+')':''} | ms P50=${pct(results.map(r=>r.ms),.5)} P95=${pct(results.map(r=>r.ms),.95)} max=${Math.max(...results.map(r=>r.ms))} | përgjigje mes. ${Math.round(results.reduce((s,r)=>s+r.bytes,0)/results.length)} bytes`);
}
async function wave(path,tokens,count,label){
 const t0=performance.now();
 const results=await Promise.all(Array.from({length:count},(_,i)=>call(path,tokens[i%tokens.length])));
 console.log(`  — kohë totale e valës: ${Math.round(performance.now()-t0)} ms`);
 report(label,results);
}
async function run(){
 const {tokens}=JSON.parse(fs.readFileSync(TOKENS_FILE,'utf8'));
 console.log('— A: bazë, 60 kërkesa njëra pas tjetrës (1 nxënës)');
 await wave('/api/student',tokens.slice(0,1),60,'A bazë sekuencë');
 console.log('— C: konkurrencë 50 nxënës njëkohësisht');
 await wave('/api/student',tokens,50,'C-50');
 console.log('— C: konkurrencë 100');
 await wave('/api/student',tokens,100,'C-100');
 console.log('— C: konkurrencë 200');
 await wave('/api/student',tokens,200,'C-200');
 console.log('— B: tejkalimi i bucket-it të përbashkët (prit kufirin e minutës, pastaj 1200 njëkohësisht)');
 const wait=(60_000-(Date.now()%60_000))+500;console.log(`  pritje ${Math.round(wait/1000)}s derisa dritarja e rate-limit rimëmbet...`);
 await new Promise(r=>setTimeout(r,wait));
 await wave('/api/student',tokens,1200,'B tejkalim 429');
}
// --- Matje sekuenciale: një kërkesë në herë, pa konkurrencë. CPU-ja matet për
// kërkesë, ndaj edhe 20 përsëritje me një përdorues japin krahasim të besueshëm.
async function apiRequest(path,token,method='GET',body){
 const started=performance.now();
 try{
  const headers={origin:BASE};
  if(token)headers.authorization=`Bearer ${token}`;
  if(body!==undefined)headers['content-type']='application/json';
  const res=await fetch(BASE+path,{method,headers,body:body===undefined?undefined:JSON.stringify(body)});
  const text=await res.text();
  return {status:res.status,ms:Math.round(performance.now()-started),bytes:text.length,data:parseJson(text)};
 }catch(e){return {status:0,ms:Math.round(performance.now()-started),bytes:0,error:e.message,data:null};}
}
function parseJson(text){try{return JSON.parse(text);}catch{return null;}}
function summarize(results){
 const statuses={};for(const r of results)statuses[r.status]=(statuses[r.status]||0)+1;
 return {n:results.length,ok:results.filter(r=>r.status===200).length,statuses,p50:pct(results.map(r=>r.ms),.5),p95:pct(results.map(r=>r.ms),.95),max:Math.max(...results.map(r=>r.ms)),bytes:Math.round(results.reduce((s,r)=>s+r.bytes,0)/results.length)};
}
function line(label,s){const st=Object.entries(s.statuses).map(([k,v])=>`${k}:${v}`).join(' ');console.log(`  ${label.padEnd(46)} n=${String(s.n).padStart(3)} ok=${String(s.ok).padStart(3)} [${st}] P50=${String(s.p50).padStart(4)}ms P95=${String(s.p95).padStart(4)}ms max=${String(s.max).padStart(4)}ms mes=${s.bytes}B`);}

const SWEEP_ROUTES=[
 {label:'faqja /',path:'/'},
 {label:'faqja /student (hyrje)',path:'/student'},
 {label:'faqja /student/learn',path:'/student/learn'},
 {label:'faqja /privacy',path:'/privacy'},
 {label:'faqja /demo',path:'/demo'},
 {label:'faqja /teacher/login',path:'/teacher/login'},
 {label:'faqja /robot-world',path:'/robot-world'},
 {label:'GET /api/session',path:'/api/session',auth:true},
 {label:'GET /api/student',path:'/api/student',auth:true},
 {label:'GET /api/curriculum',path:'/api/curriculum?grade=1&profile=@',auth:true},
 {label:'GET /api/games',path:'/api/games?grade=1&profile=@',auth:true},
 {label:'GET /api/classes',path:'/api/classes',auth:true},
 {label:'GET /api/documents (certifikatë)',path:'/api/documents?kind=certificate&profile=@&grade=1',auth:true},
 {label:'GET /api/robot-world',path:'/api/robot-world',auth:true}
];
async function sweep(iterations=20){
 const {tokens}=JSON.parse(fs.readFileSync(TOKENS_FILE,'utf8'));
 console.log(`— Skanim sekuencial, ${iterations} përsëritje për rrugë, një përdorues në herë`);
 const cold=await apiRequest('/',null);console.log(`  Kërkesa e parë (fillim i ftohtë): ${cold.ms}ms [${cold.status}]`);
 for(const [i,route] of SWEEP_ROUTES.entries()){
  const token=route.auth?tokens[i%tokens.length]:null,path=route.path.replace('@',PROFILE_IDS[i%N_PROFILES]);
  await apiRequest(path,token);await apiRequest(path,token); // nxehje, pa numërim
  const results=[];for(let k=0;k<iterations;k++)results.push(await apiRequest(path,token));
  line(route.label,summarize(results));
 }
}

// --- Skenari i mësimit: 50 nxënës njëkohësisht, të gjithë nga i njëjti IP.
// Rrjedha për nxënës: faqja → studenti → kurrikula → lojërat → fillim mësimi →
// 5 përgjigje → përfundim. 10 kërkesa të autorizuara, pra 500 për klasën.
async function lesson(count=50,rounds=1){
 const {lessonTokens}=JSON.parse(fs.readFileSync(TOKENS_FILE,'utf8'));
 const cohort=lessonTokens.slice(0,count).map((token,i)=>({token,profile:PROFILE_IDS[i%N_PROFILES]}));
 console.log(`— Mësim: ${cohort.length} nxënës njëkohësisht, ${rounds} raund(e), të gjithë nga ${BASE} (një IP)`);
 for(let round=1;round<=rounds;round++){
  const steps={},started=performance.now();
  const perStudent=await Promise.all(cohort.map(async student=>{
   const record=(name,result)=>{(steps[name]||=[]).push(result);return result;};
   record('faqja /student/learn',await apiRequest('/student/learn'));
   record('GET /api/student',await apiRequest('/api/student',student.token));
   record('GET /api/curriculum',await apiRequest(`/api/curriculum?grade=1&profile=${student.profile}`,student.token));
   record('GET /api/games',await apiRequest(`/api/games?grade=1&profile=${student.profile}`,student.token));
   const start=record('POST /api/adventures',await apiRequest('/api/adventures',student.token,'POST',{grade:1,profile:student.profile,category:'errors',count:5}));
   if(start.status!==200||!start.data?.items)return;
   const {id,items}=start.data;
   for(let i=0;i<items.length;i++){
    const value=items[i].options?.[0]??(items[i].type==='number'?'1':'');
    record('PATCH /api/adventures (përgjigje)',await apiRequest('/api/adventures',student.token,'PATCH',{id,index:i,value}));
   }
   record('POST /api/student (përfundim)',await apiRequest('/api/student',student.token,'POST',{id,profile:student.profile,grade:1,answers:items.map(()=>({cat:'errors',correct:false,question:'load'}))}));
  }));
  void perStudent;
  console.log(`  Raundi ${round}: kohë totale ${Math.round(performance.now()-started)} ms`);
  for(const [name,results] of Object.entries(steps))line(name,summarize(results));
  const all=Object.values(steps).flat();
  console.log(`  TOTAL kërkesa=${all.length} (${all.filter(r=>r.status===200).length} ok, ${all.filter(r=>r.status===429).length} 429, ${all.filter(r=>r.status>=400&&r.status!==429).length} gabime të tjera)`);
 }
}

const mode=process.argv[2];
if(mode==='seed')seed();
else if(mode==='run')await run();
else if(mode==='sweep')await sweep();
else if(mode==='lesson')await lesson();
else console.log('Përdorimi: node scripts/load-check.mjs seed | run | sweep | lesson');
