// Only synthetic QA rows in the isolated local D1. Stop Wrangler first.
import fs from 'node:fs';
import path from 'node:path';
import {randomBytes,createHash} from 'node:crypto';
import {DatabaseSync} from 'node:sqlite';
import {loadRobotRules} from './load-robot-world-rules.mjs';
const rules=await loadRobotRules(),phaseC=process.argv.includes('--phase-c'),phaseD=process.argv.includes('--phase-d'),phaseE=process.argv.includes('--phase-e');
const directory=path.resolve('.wrangler/robot-world-local-state/v3/d1/miniflare-D1DatabaseObject');
const file=fs.readdirSync(directory).find(n=>n.endsWith('.sqlite')&&!n.startsWith('metadata'));
if(!file)throw Error('Isolated local QA database is missing.');
const database=new DatabaseSync(path.join(directory,file)),owner='robot-world-local-qa';
if(!database.prepare('SELECT user FROM accounts WHERE user=?').get(owner))throw Error('QA owner is missing; no records changed.');
const profiles=['ee000000-0000-4000-8000-000000000001','ee000000-0000-4000-8000-000000000002',...(phaseE?['ee000000-0000-4000-8000-000000000003']:[])],tokens=profiles.map(()=>randomBytes(32).toString('hex'));
database.exec('PRAGMA foreign_keys=ON; BEGIN');
try{
 database.prepare('DELETE FROM student_sessions WHERE owner=?').run(owner);
 for(const [index,profile] of profiles.entries()){
  database.prepare('DELETE FROM robot_worlds WHERE owner=? AND profile=?').run(owner,profile);
  if((phaseC||phaseD||phaseE)&&index===0){let state=rules.initialWorld();for(const c of rules.allWorldChallenges(1).slice(0,phaseE?60:phaseD?48:36)){if(c.kind==='cook')for(const [item,quantity] of Object.entries(c.market.recipe.ingredients))state=rules.applyWorld(state,{id:crypto.randomUUID(),action:'buy',item,quantity},1).state;state=rules.applyWorld(state,{id:crypto.randomUUID(),action:'answer',challenge:c.id,value:c.theme===5?rules.schoolSolution(c):c.theme===4?rules.marketSolution(c)+(c.kind==='cook'?'|rabbit':''):c.mission?.pattern?.join(',')||c.path?.join(',')||String(c.target)},1).state;}database.prepare('INSERT INTO robot_worlds(owner,profile,payload,updated) VALUES(?,?,?,?)').run(owner,profile,JSON.stringify(state),Date.now());}
  database.prepare('INSERT INTO student_sessions(hash,owner,profile,expires) VALUES(?,?,?,?)').run(createHash('sha256').update(tokens[index]).digest('hex'),owner,profile,Date.now()+24*60*60*1000);
 }
 if(phaseE){const row=database.prepare('SELECT payload FROM workspaces WHERE owner=?').get(owner),workspace=JSON.parse(row.payload);if(!workspace.profiles.some(p=>p.id===profiles[2])){workspace.profiles.push({...workspace.profiles[0],id:profiles[2],name:'QA Stranger'});database.prepare('UPDATE workspaces SET payload=? WHERE owner=?').run(JSON.stringify(workspace),owner);}const existing=database.prepare('SELECT id FROM schools WHERE owner=?').get(owner),school=existing?.id||'ef000000-0000-4000-8000-000000000010';database.prepare('INSERT OR IGNORE INTO schools(id,owner,name) VALUES(?,?,?)').run(school,owner,'Robot QA');for(const [id,name,code] of [['ef000000-0000-4000-8000-000000000001','Robot QA class','ROBOT-QA-E1'],['ef000000-0000-4000-8000-000000000002','Other QA class','ROBOT-QA-E2']])database.prepare('INSERT OR IGNORE INTO classes(id,school,owner,name,grade,code) VALUES(?,?,?,?,1,?)').run(id,school,owner,name,code);for(const profile of profiles.slice(0,2))database.prepare('INSERT OR IGNORE INTO class_students(class,profile) VALUES(?,?)').run('ef000000-0000-4000-8000-000000000001',profile);}
 database.exec('COMMIT');
}catch(e){database.exec('ROLLBACK');throw e;}finally{database.close();}
fs.writeFileSync('.wrangler/robot-world-runtime-fixture.json',JSON.stringify({tokens}));
console.log('Isolated local QA profiles reset. Tokens stored only in ignored .wrangler file.');
