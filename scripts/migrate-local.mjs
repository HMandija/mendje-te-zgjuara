import {readFile,writeFile,mkdir,rm} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
if(process.argv.slice(2).some(a=>a!=='--local')||!process.argv.includes('--local'))throw Error('This migration helper is local-only: --local');
const cli=['--import','./scripts/sites-env.mjs','./node_modules/wrangler/bin/wrangler.js','d1','execute','DB','--local','--config','dist/server/wrangler.json','--persist-to','.wrangler/state','--json'];
function execute(args){const r=spawnSync(process.execPath,[...cli,...args],{encoding:'utf8'});if(r.error)throw r.error;if(r.status)throw Error(r.stderr||r.stdout);return JSON.parse(r.stdout);}
const quote=s=>"'"+s.replaceAll("'","''")+"'";
execute(['--command','CREATE TABLE IF NOT EXISTS __local_drizzle_migrations (tag TEXT PRIMARY KEY NOT NULL);']);
const applied=new Set(execute(['--command','SELECT tag FROM __local_drizzle_migrations;']).flatMap(x=>x.results).map(x=>x.tag));
const journal=JSON.parse(await readFile('drizzle/meta/_journal.json','utf8'));
const normalize=sql=>sql.replace(/[\s`";]/g,'').toLowerCase();
await mkdir('.wrangler',{recursive:true});const scratch='.wrangler/migration.sql';
try{for(const entry of journal.entries){
 if(applied.has(entry.tag))continue;
 const sql=await readFile('drizzle/'+entry.tag+'.sql','utf8');
 const statements=sql.split('--> statement-breakpoint').map(s=>s.trim()).filter(Boolean);
 const definitions=statements.map(s=>{const m=s.match(/^CREATE (?:UNIQUE )?(TABLE|INDEX)\s+`([^`]+)`/i);return m?{type:m[1].toLowerCase(),name:m[2],sql:s}:null;});
 const objects=execute(['--command',"SELECT name,type,sql FROM sqlite_master WHERE type IN ('table','index');"]).flatMap(x=>x.results);
 const existing=definitions.map(d=>d&&objects.find(o=>o.name===d.name&&o.type===d.type));
 const adoption=definitions.every(Boolean)&&existing.every((o,i)=>o&&normalize(o.sql)===normalize(definitions[i].sql));
 if(existing.some(Boolean)&&!adoption)throw Error('Partial or different schema for '+entry.tag+'. Inspect before applying.');
 await writeFile(scratch,(adoption?'':sql)+'\nINSERT INTO __local_drizzle_migrations(tag) VALUES('+quote(entry.tag)+');');
 execute(['--file',scratch]);console.log((adoption?'Adopted verified existing migration: ':'Applied migration: ')+entry.tag);
}}finally{await rm(scratch,{force:true});}
console.log('Local migrations up to date. Hosted migrations are applied by Sites.');
