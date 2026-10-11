import {authorize} from '../../../lib/school-access';
import {route} from '../../../lib/api-route';
import {identifier} from '../../../lib/school-validation.mjs';
import {rosterData} from '../../../lib/classroom-server';
import {ownedClass} from '../../../lib/product-server';
import {PICTURES} from '../../../lib/picture-catalog';
const escape=(s:string)=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
export async function GET(r:Request){return route(async()=>{
 const actor=await authorize(r,'class:write'),id=identifier.parse(new URL(r.url).searchParams.get('class')),c=await ownedClass(actor,id);
 const data=await (await rosterData(actor,id)).json() as {students:{name:string;picture:string|null}[]};
 const page=`<!doctype html><html lang="sq"><meta charset="utf-8"><title>Kartat e hyrjes</title><style>body{font:18px system-ui;padding:24px;color:#243247}main{display:grid;grid-template-columns:repeat(2,1fr);gap:20px}article{border:2px dashed #aaa;border-radius:16px;padding:20px;break-inside:avoid}strong{font-size:24px}.picture{font-size:56px}small{display:block}button{padding:12px;font:inherit}@media print{button{display:none}}</style><h1>${escape(c.name)} · Kartat e hyrjes</h1><p>Shpërndaj secilën kartë vetëm te nxënësi përkatës.</p><button onclick="window.print()">Printo kartat</button><main>${data.students.map(p=>{const picture=PICTURES.find(x=>x[0]===p.picture);return `<article><strong>${escape(p.name)}</strong><p>Kodi i klasës: <b>${escape(c.code||'')}</b></p><div class="picture">${picture?.[2]||'?'}</div><p>Figura ime: ${picture?.[1]||'Caktoje në panel'}</p><small>${escape(new URL('/student',r.url).href)}</small><p>1. Vendos kodin<br>2. Zgjidh emrin<br>3. Zgjidh figurën</p></article>`;}).join('')}</main></html>`;
 return new Response(page,{headers:{'Content-Type':'text/html; charset=utf-8','Content-Disposition':'attachment; filename="kartat-e-hyrjes.html"','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
 });}
