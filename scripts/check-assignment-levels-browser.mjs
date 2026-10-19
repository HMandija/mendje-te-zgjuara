import assert from 'node:assert/strict';
import fs from 'node:fs';
import {chromium} from '@playwright/test';
import {curriculumLessons} from '../lib/curriculum-catalog.mjs';
import {curriculumPuzzle} from '../lib/expanded-curriculum.mjs';
import {publicPuzzle} from '../lib/security-policy.mjs';

const base=process.env.ASSIGNMENT_TEST_URL||'http://127.0.0.1:8787',lesson=curriculumLessons(1)[0];
const classId='assignment-ui-class',profile='assignment-ui-pupil',firstTen=Array.from({length:10},(_,i)=>i+1);
const schoolClass={id:classId,name:'Klasa Provë',grade:1,code:'AABBCCDD',profiles:[profile]};
const pupil={id:profile,name:'Nxënësi Provë',grade:1};
let task={id:'assignment-ui-task',class:classId,title:lesson.title,category:'mixed',level:1,count:5,due:'',lesson_id:lesson.id,lesson_level:1,source_grade:1,allowed_levels:'[1]',active:1};
const sessions=[{id:'completed-first',profile,grade:1,assignment:task.id,lessonId:lesson.id,lessonLevel:1,verified:true,stars:3,answers:[{cat:'logic',correct:true,question:'Test'}],date:new Date().toISOString()}];
let startRequest=null,writeCount=0;
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
fs.mkdirSync('.wrangler/assignment-qa',{recursive:true});
const errors=[];
async function context(role,viewport={width:1280,height:900}) {
 const c=await browser.newContext({viewport,reducedMotion:'reduce'});
 if(role==='STUDENT')await c.addInitScript(()=>sessionStorage.setItem('mendje-student-session-v2','a'.repeat(64)));
 await c.route('**/api/**',async route=>{
  const req=route.request(),url=new URL(req.url()),path=url.pathname;
  if(path==='/api/session')return route.fulfill({json:{authenticated:true,role}});
  if(path==='/api/workspace')return route.fulfill({json:{profiles:[pupil],custom:[],sessions,revision:0,scope:'assignment-browser-fixture'}});
  if(path==='/api/student')return route.fulfill({json:{profile:pupil,custom:[],sessions}});
  if(path==='/api/classes')return route.fulfill({json:{classes:[schoolClass],assignments:[task],sessions}});
  if(path==='/api/roster')return route.fulfill({json:{students:[{...pupil,picture:'sun'}]}});
  if(path==='/api/class-progress')return route.fulfill({json:{sessions,started:[]}});
  if(path==='/api/robot-world')return route.fulfill({json:{students:[]}});
  if(path==='/api/chess-kingdom')return route.fulfill({json:{students:[],summary:{stars:0,maxStars:24,completed:0,total:8,currentTitle:'Hapi i parë',canResume:false,status:'new'}}});
  if(path==='/api/class-assignments'){
   const {task:input}=req.postDataJSON();assert(Array.isArray(input.allowedLevels));writeCount++;
   task={...task,title:input.title,lesson_level:input.lessonLevel||1,allowed_levels:JSON.stringify(input.allowedLevels)};
   return route.fulfill({json:req.method()==='POST'?{ids:[task.id]}:{saved:true}});
  }
  if(path==='/api/teacher-preview')return route.fulfill({json:{puzzle:publicPuzzle(curriculumPuzzle(lesson.id,Number(url.searchParams.get('level'))||1)),persistsProgress:false}});
  if(path==='/api/adventures'){
   startRequest=req.postDataJSON();assert.equal(startRequest.assignment,task.id);assert(JSON.parse(task.allowed_levels).includes(startRequest.assignmentLevel));
   const n=startRequest.assignmentLevel;
   return route.fulfill({json:{id:'browser-adventure',grade:1,profile,assignment:task.id,lessonId:lesson.id,lessonLevel:n,items:[publicPuzzle(curriculumPuzzle(lesson.id,n))]}});
  }
  return route.fulfill({status:404,json:{error:'Unmocked fixture endpoint'}});
 });
 const page=await c.newPage();page.setDefaultTimeout(30000);page.on('pageerror',e=>errors.push(e.message));return {c,page};
}
try{
 const {c:teacher,page}=await context('TEACHER');await page.goto(base+'/teacher');
 await page.getByRole('button',{name:'Mësimet dhe detyrat',exact:true}).click();
 const card=page.locator('.assignment-with-levels');await card.waitFor();
 await card.locator('summary').click();assert.equal(await card.getByRole('checkbox').count(),30);
 await card.getByRole('button',{name:'10 të parat',exact:true}).click();assert.equal(await card.locator('input:checked').count(),10);
 await card.getByRole('button',{name:'Ruaj nivelet',exact:true}).click();await page.getByRole('status').filter({hasText:'Ndryshimet u ruajtën.'}).waitFor();assert.deepEqual(JSON.parse(task.allowed_levels),firstTen);
 await card.locator('summary').click();await card.getByRole('checkbox',{name:'Niveli 10',exact:true}).uncheck();await card.getByRole('checkbox',{name:'Niveli 11',exact:true}).check();await card.getByRole('button',{name:'Ruaj nivelet',exact:true}).click();await page.waitForFunction(()=>!document.querySelector('.assignment-with-levels button.primary'));
 assert.deepEqual(JSON.parse(task.allowed_levels),[1,2,3,4,5,6,7,8,9,11]);
 await card.locator('summary').click();await card.getByRole('button',{name:'10 të parat',exact:true}).click();await card.getByRole('button',{name:'Ruaj nivelet',exact:true}).click();await page.waitForFunction(()=>!document.querySelector('.assignment-with-levels button.primary'));
 await card.locator('summary').click();await card.screenshot({path:'.wrangler/assignment-qa/teacher-level-checkboxes.png'});
 // The original task form offers the same multi-select, including keyboard input.
 await card.getByRole('button',{name:'Ndrysho',exact:true}).click();const form=page.locator('form').filter({has:page.getByRole('heading',{name:'Ndrysho mësimin',exact:true})});
 await form.locator('.assignment-level-picker summary').click();assert.equal(await form.locator('.assignment-level-checkboxes input:checked').count(),10);
 const last=form.getByRole('checkbox',{name:'Niveli 30',exact:true});await last.focus();await page.keyboard.press('Space');assert(await last.isChecked());
 await form.getByRole('button',{name:'Ruaj ndryshimet',exact:true}).click();await page.getByRole('heading',{name:'Cakto një mësim të ri',exact:true}).waitFor();assert(JSON.parse(task.allowed_levels).includes(30));
 // Library assignment is no longer limited to the previewed level.
 await page.getByRole('button',{name:'Biblioteka e mësimeve',exact:true}).click();await page.getByLabel('Kërko një mësim').fill(lesson.title);await page.locator('.curriculum-card').first().click();
 await page.getByRole('button',{name:'Caktoja klasës këtë mësim',exact:true}).click();const dialog=page.getByRole('dialog');await dialog.locator('.assignment-level-picker summary').click();await dialog.getByRole('button',{name:'10 të parat',exact:true}).click();await dialog.getByRole('button',{name:'Cakto mësimin',exact:true}).click();await dialog.waitFor({state:'hidden'});assert.deepEqual(JSON.parse(task.allowed_levels),firstTen);assert(writeCount>=5);
 await teacher.close();
 const {c:student,page:sp}=await context('STUDENT',{width:1024,height:768});await sp.goto(base+'/student/learn');const mission=sp.locator('.student-mission-card');await mission.waitFor();
 assert.equal(await mission.locator('.assignment-student-levels button:enabled').count(),10);assert.equal(await mission.locator('.assignment-student-levels button:disabled').count(),20);
 assert.equal(await mission.locator('.mission-done').count(),0,'Finishing level 1 must not complete ten levels');
 assert(await mission.getByRole('button',{name:'Niveli 1, i përfunduar, 3 yje',exact:true}).isEnabled());
 await mission.screenshot({path:'.wrangler/assignment-qa/student-levels-tablet.png'});
 await sp.setViewportSize({width:390,height:844});await mission.screenshot({path:'.wrangler/assignment-qa/student-levels-phone.png'});
 assert(await sp.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'No horizontal page overflow on phone');
 await mission.getByRole('button',{name:'Niveli 10',exact:true}).click();await sp.waitForFunction(()=>!!document.querySelector('.question-card'));assert.equal(startRequest.assignmentLevel,10);
 await sp.goto(base+'/student/learn');await sp.locator('.student-mission-card').waitFor();await sp.locator('.student-mission-card').getByRole('button',{name:'Fillo',exact:true}).click();await sp.waitForFunction(()=>!!document.querySelector('.question-card'));assert.equal(startRequest.assignmentLevel,2,'Fillo continues at the first enabled unfinished level');
 await student.close();assert.deepEqual(errors,[]);
 console.log('Assignment UI: teacher dropdown with 30 checkboxes, first ten shortcut, arbitrary toggles and save/reload, edit form keyboard control, library multi-level assignment, student enabled/locked tiles, separate completion stars, exact selected level, next unfinished level and tablet/phone layout passed (auth and API fixtures mocked; backend verified separately).');
}finally{await browser.close();}
