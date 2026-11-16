import assert from 'node:assert/strict';
import fs from 'node:fs';
import {DatabaseSync} from 'node:sqlite';
import ts from 'typescript';
import {z} from 'zod';
import {identifier} from './lib/school-validation.mjs';
import {CODING_MISSIONS,codingMission} from './lib/coding-missions.mjs';

const sql=new DatabaseSync(':memory:');
sql.exec('PRAGMA foreign_keys=ON');
for(const file of fs.readdirSync('drizzle').filter(f=>f.endsWith('.sql')).sort())sql.exec(fs.readFileSync('drizzle/'+file,'utf8'));
let beforeRun;
const database={prepare(query){let args=[];return {
 bind(...values){args=values;return this;},
 async first(){return sql.prepare(query).get(...args)||null;},
 async all(){return {results:sql.prepare(query).all(...args)};},
 async run(){if(beforeRun)beforeRun(query);const result=sql.prepare(query).run(...args);return {meta:{changes:Number(result.changes)}};}
};}};
class ApiError extends Error{constructor(status,message){super(message);this.status=status;}}
const workspace={profiles:[{id:'student-a',name:'Ana',grade:5},{id:'student-b',name:'Bora',grade:5}],custom:[],revision:0};
const ownedClass=async(actor,id)=>{const row=await database.prepare('SELECT * FROM classes WHERE id=? AND owner=?').bind(id,actor.owner).first();if(!row)throw new ApiError(404,'Klasa nuk u gjet.');return row;};
globalThis.__coding={z,db:()=>database,json:value=>value,ApiError,actorWorkspace:async()=>workspace,identifier,CODING_MISSIONS,codingMission,ownedClass};
const source='const {z,db,json,ApiError,actorWorkspace,identifier,CODING_MISSIONS,codingMission,ownedClass}=globalThis.__coding;\n'+fs.readFileSync('lib/coding-server.ts','utf8').replace(/^import .*;\r?\n/gm,'');
const codingModule=await import('data:text/javascript;base64,'+Buffer.from(ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText).toString('base64'));
const {studentMissionAllowed,codingStudentData,codingClassData,setCodingAssignment}=codingModule;
const teacher={role:'TEACHER',owner:'teacher-a',principal:'teacher-a'};
const student={role:'STUDENT',owner:'teacher-a',profile:'student-a',principal:'student-a',grade:5,classroom:'class-a'};
try{
 sql.exec("INSERT INTO schools(id,owner,name) VALUES('school-a','teacher-a','A'),('school-b','teacher-b','B')");
 const addClass=sql.prepare('INSERT INTO classes(id,school,owner,name,grade,code) VALUES(?,?,?,?,?,?)');
 addClass.run('class-a','school-a','teacher-a','Klasa A',5,'AAAA0001');
 addClass.run('class-other','school-a','teacher-a','Klasa B',5,'AAAA0002');
 addClass.run('class-four','school-a','teacher-a','Klasa 4',4,'AAAA0003');
 addClass.run('class-foreign','school-b','teacher-b','Klasa tjetër',5,'BBBB0001');
 const addStudent=sql.prepare('INSERT INTO class_students(class,profile) VALUES(?,?)');
 addStudent.run('class-a','student-a');addStudent.run('class-other','student-a');addStudent.run('class-a','student-b');
 await setCodingAssignment(teacher,{class:'class-a',mission:'nisja-1',enabled:true});
 await setCodingAssignment(teacher,{class:'class-other',mission:'nisja-2',enabled:true});
 await setCodingAssignment(teacher,{class:'class-a',mission:'nisja-1',enabled:true});
 assert.equal(await studentMissionAllowed(student,'nisja-1'),true);
 assert.equal(await studentMissionAllowed(student,'nisja-2'),false,'Picture login is limited to its class');
 assert.equal(await studentMissionAllowed({...student,classroom:undefined},'nisja-2'),true);
 assert.equal(await studentMissionAllowed({...student,profile:'stranger'},'nisja-1'),false);
 assert.equal(await studentMissionAllowed({...student,owner:'teacher-b'},'nisja-1'),false);
 assert.equal(await studentMissionAllowed({...student,grade:4},'nisja-1'),false);
 assert.equal(await studentMissionAllowed(teacher,'nisja-1'),false);
 assert.deepEqual((await codingStudentData(student)).missions.map(m=>m.id),['nisja-1']);
 await assert.rejects(codingStudentData({...student,grade:4}),e=>e.status===403);
 await assert.rejects(setCodingAssignment(teacher,{class:'class-foreign',mission:'nisja-1',enabled:true}),e=>e.status===404);
 await assert.rejects(setCodingAssignment(teacher,{class:'class-four',mission:'nisja-1',enabled:true}),e=>e.status===400);
 await assert.rejects(setCodingAssignment(teacher,{class:'class-a',mission:'unknown',enabled:true}),e=>e.status===400);
 assert.equal((await codingClassData(teacher,'class-a')).missions.length,60);
 sql.exec("INSERT INTO coding_projects(owner,profile,mission,object_key,revision,updated) VALUES('teacher-a','student-b','nisja-1','secret',1,5),('teacher-b','student-a','nisja-1','other',1,5)");
 const projects=(await codingClassData(teacher,'class-a')).projects;
 assert.equal(projects.length,1);assert.equal(projects[0].name,'Bora');assert.equal('object_key' in projects[0],false);
 sql.exec("INSERT INTO classroom_settings(class,archived) VALUES('class-a',1)");
 assert.equal(await studentMissionAllowed(student,'nisja-1'),false);
 assert.deepEqual((await codingStudentData(student)).missions,[]);
 await assert.rejects(setCodingAssignment(teacher,{class:'class-a',mission:'nisja-2',enabled:true}),e=>e.status===400);
 sql.exec("UPDATE classroom_settings SET archived=0 WHERE class='class-a'");
 beforeRun=query=>{if(query.startsWith('INSERT INTO coding_assignments')){beforeRun=undefined;sql.exec("UPDATE classroom_settings SET archived=1 WHERE class='class-a'");}};
 await assert.rejects(setCodingAssignment(teacher,{class:'class-a',mission:'nisja-2',enabled:true}),e=>e.status===409);
 assert.equal(sql.prepare("SELECT COUNT(*) AS count FROM coding_assignments WHERE class='class-a' AND mission='nisja-2'").get().count,0);
 sql.exec("UPDATE classroom_settings SET archived=0 WHERE class='class-a'");
 beforeRun=query=>{if(query.startsWith('DELETE FROM coding_assignments')){beforeRun=undefined;sql.exec("UPDATE classroom_settings SET archived=1 WHERE class='class-a'");}};
 await assert.rejects(setCodingAssignment(teacher,{class:'class-a',mission:'nisja-1',enabled:false}),e=>e.status===409);
 assert.equal(sql.prepare("SELECT COUNT(*) AS count FROM coding_assignments WHERE class='class-a' AND mission='nisja-1'").get().count,1);
 sql.exec("UPDATE classroom_settings SET archived=0 WHERE class='class-a'");
 await setCodingAssignment(teacher,{class:'class-a',mission:'nisja-1',enabled:false});
 await setCodingAssignment(teacher,{class:'class-a',mission:'nisja-1',enabled:false});
 assert.equal(await studentMissionAllowed(student,'nisja-1'),false);
}finally{delete globalThis.__coding;sql.close();}
console.log('Coding access: class ownership, assigned missions, membership, grade, archive, student isolation and project metadata passed.');
