import {z} from 'zod';
import {authorize,ApiError,actorWorkspace} from '../../../lib/school-access';
import {route} from '../../../lib/api-route';
import {db,sessionRows} from '../../../lib/school-server';
import {identifier,gradeSchema,categories} from '../../../lib/school-validation.mjs';
import {ownedClass} from '../../../lib/product-server';
import {progress} from '../../../lib/progress.mjs';
import {pdfDocument} from '../../../lib/pdf-document.mjs';
import {csvExport} from '../../../lib/csv-export.mjs';
import {seedCatalog} from '../../../lib/catalog-seed.mjs';
import type {Puzzle} from '../../../lib/learning-types';
const query=z.object({kind:z.enum(['certificate','worksheet','report','csv']),profile:identifier.optional(),class:identifier.optional(),grade:z.coerce.number().pipe(gradeSchema),level:z.coerce.number().int().min(1).max(3).optional(),category:z.enum(['mixed',...categories]).optional()}).strict();
export async function GET(r:Request){return route(async()=>{
 const actor=await authorize(r,'document:read'),x=query.parse(Object.fromEntries(new URL(r.url).searchParams)),w=await actorWorkspace(actor);
 if(actor.role==='STUDENT'&&(x.kind!=='certificate'||x.profile!==actor.profile||x.grade!==actor.grade))throw new ApiError(403,'Dokumenti nuk lejohet.');
 let title='Mendje të Zgjuara',lines:string[]=[];
 if(x.kind==='certificate'){
  const profile=w.profiles.find(p=>p.id===x.profile&&p.grade===x.grade);if(!profile)throw new ApiError(404,'Profili nuk u gjet.');
  const p=progress(await sessionRows(actor.owner,profile.id),profile.id,x.grade),level=p.levels.find(l=>l.level===x.level);if(x.level?(!level||level.stars<2):!p.certificate)throw new ApiError(409,x.level?'Fito të paktën 2 yje në këtë nivel.':'Përfundo tre nivelet me të paktën 2 yje secilin.');
  title=x.level?`Certifikatë e nivelit ${x.level}`:'Certifikatë e kursit';lines=[profile.name,`Klasa ${x.grade}`,x.level?`Përfundoi nivelin ${x.level} të kursit Logjikë & mendim.`:'Përfundoi tri nivelet e kursit Logjikë & mendim.',x.level?`Yjet e nivelit: ${level?.stars}/3`:`Yjet e kursit: ${p.stars}/9`,`Data: ${new Date().toISOString().slice(0,10)}`,'Mendje të Zgjuara - Mësim me kureshtje.'];
 }else if(x.kind==='worksheet'){
  await seedCatalog(db());const rows=await db().prepare('SELECT payload FROM puzzle_catalog WHERE grade=? AND id LIKE ?').bind(x.grade,'original-%').all<{payload:string}>();
  const pool=rows.results.map(row=>JSON.parse(row.payload) as Puzzle).filter(p=>(!x.category||x.category==='mixed'||p.cat===x.category)&&(!x.level||p.level===x.level));
  const puzzles=[...categories.flatMap(cat=>pool.filter(p=>p.cat===cat).slice(0,1)),...categories.flatMap(cat=>pool.filter(p=>p.cat===cat).slice(1))].slice(0,10);
  title=`Fletë pune - Klasa ${x.grade}`;lines=['Pseudonimi: __________________  Data: __________','Shpjego si mendove. Punoni me qetësi.','',...puzzles.flatMap((p,i)=>[`${i+1}. ${p.title}`,p.type==='ordering'?'Shkruaj hapat në rendin e duhur.':p.type==='grid'?'Shëno + ose - pranë çdo pohimi.':p.visual,...(p.memory?['Vëzhgo vargun, pastaj mbuloje për të dhënë përgjigjen.']:[]),...(p.type==='ordering'?p.interaction?.items||[]:p.type==='grid'?p.interaction?.cells||[]:p.type==='number'?[]:p.options).map((v,n)=>`${n+1}) ${v}`),'Përgjigjja / arsyetimi: __________________________','________________________________________________',''])];
 }else{
  if(!x.class)throw new ApiError(400,'Zgjidh klasën.');const c=await ownedClass(actor,x.class);if(c.grade!==x.grade)throw new ApiError(400,'Klasa nuk përputhet.');
  const members=await db().prepare('SELECT profile FROM class_students WHERE class=?').bind(c.id).all<{profile:string}>(),rows=await sessionRows(actor.owner);
  const stats=members.results.map(m=>{const profile=w.profiles.find(p=>p.id===m.profile);return {name:profile?.name||'Profil i fshirë',...progress(rows,m.profile,c.grade)};});
  if(x.kind==='csv'){const content=csvExport([['Pseudonimi','Klasa','Ushtrime','Saktësi %','Koha sekonda','Yje'],...stats.map(p=>[p.name,c.grade,p.total,p.accuracy,p.duration,p.stars])]);return new Response(content,{headers:{'Content-Type':'text/csv;charset=utf-8','Content-Disposition':'attachment; filename="progres-klase.csv"','Cache-Control':'no-store'}});}
  title=`Raport klase: ${c.name}`;lines=[`Klasa ${c.grade} - ${stats.length} nxënës`,'Vetëm rezultate të kontrolluara në server.',...stats.map(p=>`${p.name}: ${p.total} ushtrime, ${p.accuracy}% saktësi, ${p.stars}/9 yje, ${p.duration} sekonda.`),'Koha përfshin pushimet; nuk përdoret për renditje.','Analiza përdor deri në 200 aventurat më të fundit.'];
 }
 return new Response(pdfDocument(title,lines),{headers:{'Content-Type':'application/pdf','Content-Disposition':`attachment; filename="mendje-${x.kind}.pdf"`,'Cache-Control':'no-store'}});
});}
