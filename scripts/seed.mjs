import {writeFile,mkdir,rm} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import {catalogSeed} from '../lib/catalog-seed.mjs';
const args=process.argv.slice(2);
if(args.some(a=>!['--local','--test-teacher','--test-student','--test-admin','--reset-test-limits'].includes(a))||!args.includes('--local'))throw Error('Seed is local-only: --local [--test-teacher|--test-student|--test-admin] [--reset-test-limits]');
const roles=args.filter(a=>a.startsWith('--test-'));if(roles.length>1)throw Error('Choose one test role');
const quote=x=>"'"+String(x).replaceAll("'","''")+"'";
const statements=catalogSeed().map(p=>`INSERT INTO puzzle_catalog(id,grade,category,payload) VALUES(${quote(p.id)},${p.grade},${quote(p.cat)},${quote(JSON.stringify(p))}) ON CONFLICT(id) DO UPDATE SET payload=excluded.payload;`);
if(args.includes('--reset-test-limits'))statements.push('DELETE FROM rate_limits;');
if(roles.length){const role=roles[0].slice(7).toUpperCase();statements.push(`INSERT INTO accounts(user,role,enabled) VALUES('local_seedy',${quote(role)},1) ON CONFLICT(user) DO UPDATE SET role=excluded.role,enabled=1;`);}
await mkdir('.wrangler',{recursive:true});const path='.wrangler/seed.sql';
await writeFile(path,statements.join('\n'));
try{
 const result=spawnSync(process.execPath,['--import','./scripts/sites-env.mjs','./node_modules/wrangler/bin/wrangler.js','d1','execute','DB','--local','--config','dist/server/wrangler.json','--persist-to','.wrangler/state','--file',path],{encoding:'utf8'});
 if(result.error)throw result.error;if(result.status){console.error(result.stderr||result.stdout);process.exitCode=result.status;}else console.log('Local seed: 64 authored tasks + 384 numerical variants + 720 grade-specific game levels, idempotent; test role '+(roles[0]||'unchanged')+'.');
}finally{await rm(path,{force:true});}
