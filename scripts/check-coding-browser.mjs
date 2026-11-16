import assert from 'node:assert/strict';
import {chromium,expect} from '@playwright/test';
import {CODING_MISSIONS} from '../lib/coding-missions.mjs';

const base=process.env.CODING_TEST_URL||'http://localhost:5173';
const classroom={id:'coding-class',name:'Klasa 5A',grade:5,code:'AABBCCDD',profiles:['coding-pupil']};
const pupil={id:'coding-pupil',name:'Ana',grade:5,picture:'sun'};
const assigned=new Set();
let saved=null,revision=0;
const errors=[];
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
async function selectGrade(page,grade){
 const button=page.getByRole('button',{name:'Klasa '+grade,exact:true});
 await expect(button).toBeVisible();
 await expect.poll(async()=>{await button.click();return button.getAttribute('aria-pressed');},{timeout:30000}).toBe('true');
}
async function makeContext(role){
 const context=await browser.newContext({viewport:{width:1280,height:900},reducedMotion:'reduce'});
 if(role==='STUDENT')await context.addInitScript(()=>{if(window===window.top)sessionStorage.setItem('mendje-student-session-v2','a'.repeat(64));});
 else await context.addInitScript(()=>{if(window===window.top)localStorage.setItem('mendje-v1',JSON.stringify({activeProfile:'coding-pupil',grade:5}));});
 await context.route('**/api/**',async route=>{
  const request=route.request(),path=new URL(request.url()).pathname;
  if(path==='/api/session')return route.fulfill({json:{authenticated:true,role}});
  if(path==='/api/workspace')return route.fulfill({json:{profiles:[pupil],custom:[],sessions:[],revision:0,scope:'coding-browser-test'}});
  if(path==='/api/student')return route.fulfill({json:{profile:pupil,custom:[],sessions:[]}});
  if(path==='/api/classes')return route.fulfill({json:{classes:[classroom],assignments:[],sessions:[]}});
  if(path==='/api/roster')return route.fulfill({json:{students:[pupil]}});
  if(path==='/api/class-progress')return route.fulfill({json:{sessions:[],started:[]}});
  if(['/api/games','/api/curriculum'].includes(path)){
   assert.equal(role,'TEACHER');
   assert(['1','2','3','4'].includes(new URL(request.url()).searchParams.get('grade')));
   return route.fulfill({json:{progress:[]}});
  }
  if(path==='/api/coding-class'){
   if(request.method()==='POST'){const body=request.postDataJSON();assert.equal(body.class,classroom.id);if(body.enabled)assigned.add(body.mission);else assigned.delete(body.mission);return route.fulfill({json:{saved:true}});}
   return route.fulfill({json:{missions:CODING_MISSIONS,assigned:[...assigned],projects:saved?[{profile:pupil.id,name:pupil.name,mission:CODING_MISSIONS[0].id,revision,updated:Date.now()}]:[]}});
  }
  if(path==='/api/coding-project'){
   assert.equal(new URL(request.url()).searchParams.get('class'),classroom.id);
   if(request.method()==='PUT'){assert.equal(role,'STUDENT');saved=request.postDataBuffer();revision++;return route.fulfill({json:{saved:true,revision}});}
   return route.fulfill({status:saved?200:204,headers:{'Content-Type':'application/octet-stream','X-Project-Revision':String(revision)},body:saved||''});
  }
  if(path==='/api/coding'){
   const mission=new URL(request.url()).searchParams.get('mission');
   if(mission)return route.fulfill({json:{mission:CODING_MISSIONS.find(m=>m.id===mission),readonly:role!=='STUDENT',project:saved?{revision}:null}});
   return route.fulfill({json:{missions:CODING_MISSIONS.filter(m=>assigned.has(m.id)).map(m=>({...m,classes:[{id:classroom.id,name:classroom.name}],project:saved?{revision,updated:Date.now()}:null}))}});
  }
  console.error('Unmocked fixture endpoint:',request.method(),path);
  return route.fulfill({status:404,json:{error:'Unmocked fixture endpoint'}});
 });
 const page=await context.newPage();page.setDefaultTimeout(60000);page.on('pageerror',e=>errors.push(e.message));page.on('console',message=>{if(message.type()==='error')errors.push(message.text()+' '+message.location().url);});return {context,page};
}
try{
 const visitor=await browser.newContext({viewport:{width:1280,height:900}}),publicPage=await visitor.newPage();
 publicPage.setDefaultTimeout(60000);
 publicPage.on('pageerror',e=>errors.push(e.message));
 publicPage.on('console',message=>{if(message.type()==='error')errors.push(message.text()+' '+message.location().url);});
 await publicPage.goto(base+'/demo');
 await expect(publicPage.getByRole('button',{name:'Klasa 5',exact:true})).toBeVisible();
 await expect(publicPage.getByRole('button',{name:'Hap laboratorin e kodimit · Misioni 1',exact:true})).toHaveCount(0);
 await selectGrade(publicPage,5);
 await expect(publicPage.getByRole('region',{name:'Laboratori i klasës së pestë'})).toBeVisible();
 await expect(publicPage.locator('.robot-hub,.categories')).toHaveCount(0);
 for(const grade of [1,2,3,4]){
  await selectGrade(publicPage,grade);
  await expect(publicPage.locator('.categories')).toBeVisible();
  await expect(publicPage.getByRole('button',{name:'Hap laboratorin e kodimit · Misioni 1',exact:true})).toHaveCount(0);
 }
 await selectGrade(publicPage,5);
 await publicPage.screenshot({path:'preview-coding-grade5.png',fullPage:true});
 await publicPage.getByRole('button',{name:'Hap laboratorin e kodimit · Misioni 1',exact:true}).click();
 const publicEditor=publicPage.frameLocator('iframe[title="Editori i Laboratorit të Kodimit"]');
 await expect(publicEditor.getByRole('button',{name:'Shkarko projektin',exact:true})).toBeEnabled({timeout:60000});
 assert.equal(await publicPage.getByRole('button',{name:'Mbyll laboratorin',exact:true}).count(),1,'The outer application provides the single close button');
 assert.equal(await publicEditor.getByRole('button',{name:'Mbyll laboratorin',exact:true}).count(),0,'Scratch does not duplicate the outer close button');
 assert.equal(new URL(await publicPage.locator('iframe[title="Editori i Laboratorit të Kodimit"]').getAttribute('src'),base).searchParams.get('theme'),'light');
 await publicEditor.locator('.blocklyFlyout .blocklyDraggable').first().waitFor();
 await publicEditor.getByText(CODING_MISSIONS[0].title,{exact:true}).waitFor();
 assert.equal(await publicEditor.getByRole('button',{name:'Ruaj projektin',exact:true}).count(),0);
 await visitor.close();
 const teacher=await makeContext('TEACHER');await teacher.page.goto(base+'/teacher');
 await teacher.page.getByRole('button',{name:'Krijo një klasë',exact:true}).click();
 assert.equal(await teacher.page.locator('select[name=grade] option[value="5"]').count(),1);
 await teacher.page.getByRole('button',{name:'Mësimet e klasës së pestë · Laboratori i kodimit',exact:true}).click();
 const first=teacher.page.locator('.assignment-card').filter({has:teacher.page.getByRole('heading',{name:CODING_MISSIONS[0].title,exact:true})});await first.waitFor();
 assert.equal(await teacher.page.locator('.assignment-card').count(),60);
 await first.getByRole('checkbox').check();await teacher.page.waitForFunction(()=>!document.querySelector('.assignment-card input:disabled'));
 assert(assigned.has(CODING_MISSIONS[0].id));
 await first.locator('summary').click();assert(await first.getByText(CODING_MISSIONS[0].steps[0],{exact:true}).isVisible());
 await teacher.page.getByRole('button',{name:'Progresi',exact:true}).click();await teacher.page.getByText('Shfaqen vetëm projektet e ruajtura. Ruajtja nuk do të thotë se misioni është përfunduar ose vlerësuar; hap projektin dhe shqyrto kriteret e misionit.',{exact:true}).waitFor();await teacher.page.getByText('Nuk ka ende projekte të ruajtura. Kjo nuk tregon nëse misionet janë përfunduar.',{exact:true}).waitFor();
 await teacher.page.getByRole('button',{name:'Ushtrimet',exact:true}).click();
 await teacher.page.getByLabel('Profili i nxënësit').selectOption(pupil.id);
 await teacher.page.getByText('Misionet e laboratorit menaxhohen te klasat e mia.',{exact:false}).waitFor();
 await teacher.page.getByRole('button',{name:'Menaxho profilet →'}).click();
 await teacher.page.locator('.profile-form select[name=grade]').waitFor();
 assert.equal(await teacher.page.locator('.profile-form select[name=grade] option').allTextContents().then(options=>options.includes('5')),true);
 assert.equal(await teacher.page.locator('.profile-form select[name=grade]').inputValue(),'5');
 await teacher.page.getByRole('button',{name:'Për mësuesin',exact:true}).click();
 assert.equal(await teacher.page.locator('select').filter({has:teacher.page.locator('option[value="5"]')}).inputValue(),'5');
 await teacher.context.close();
 const student=await makeContext('STUDENT');await student.page.goto(base+'/student/learn');await student.page.getByRole('heading',{name:CODING_MISSIONS[0].title}).waitFor();
 assert.equal(await student.page.getByRole('heading',{name:CODING_MISSIONS[1].title}).count(),0);
 await student.page.getByRole('button',{name:'Hap laboratorin',exact:true}).click();
 const editor=student.page.frameLocator('iframe[title="Editori i Laboratorit të Kodimit"]');
 await editor.getByRole('button',{name:'Ruaj projektin',exact:true}).waitFor();
 await editor.locator('body').evaluate(()=>window.parent.postMessage({type:'lab:save',nonce:'wrong-session',id:99,bytes:new ArrayBuffer(1)},'*'));
 await student.page.evaluate(()=>{const nonce=new URL(document.querySelector('iframe').src).searchParams.get('bridge');window.postMessage({type:'lab:save',nonce,id:100,bytes:new ArrayBuffer(1)},'*');});
 await editor.getByRole('button',{name:'Ruaj projektin',exact:true}).click();
 await editor.getByRole('status').filter({hasText:'Projekti u ruajt privatisht.'}).waitFor();
 assert(saved?.length>0);assert.equal(revision,1);
 const iframe=student.page.locator('iframe[title="Editori i Laboratorit të Kodimit"]');
 assert.equal(await iframe.getAttribute('sandbox'),'allow-scripts allow-downloads allow-modals');
 assert(await iframe.contentFrame().locator('body').evaluate(()=>{try{return !window.parent.document;}catch{return true;}}));
 await student.page.getByRole('button',{name:'Mbyll laboratorin',exact:true}).click();
 await student.page.getByRole('button',{name:'Vazhdo projektin',exact:true}).click();
 await editor.getByRole('button',{name:'Ruaj projektin',exact:true}).waitFor();
 await editor.getByRole('tab',{name:'Veshjet',exact:true}).click();
 await editor.getByRole('button',{name:'Zhbëj',exact:true}).waitFor();
 student.page.once('dialog',dialog=>dialog.accept());
 await student.page.getByRole('button',{name:'Mbyll laboratorin',exact:true}).click();
 const review=await makeContext('TEACHER');await review.page.goto(base+'/teacher');
 await review.page.getByRole('button',{name:'Progresi',exact:true}).click();
 await review.page.getByText('Shfaqen vetëm projektet e ruajtura. Ruajtja nuk do të thotë se misioni është përfunduar ose vlerësuar; hap projektin dhe shqyrto kriteret e misionit.',{exact:true}).waitFor();
 await review.page.getByRole('button',{name:'Shqyrto projektin',exact:true}).click();
 const teacherEditor=review.page.frameLocator('iframe[title="Editori i Laboratorit të Kodimit"]');
 await teacherEditor.getByRole('button',{name:'Shkarko projektin',exact:true}).waitFor();
 assert.equal(await teacherEditor.getByRole('button',{name:'Ruaj projektin',exact:true}).count(),0);
 await review.page.getByRole('button',{name:'Mbyll laboratorin',exact:true}).click();
 await review.page.getByRole('button',{name:'Mësimet e klasës së pestë · Laboratori i kodimit',exact:true}).click();
 const reviewMission=review.page.locator('.assignment-card').filter({has:review.page.getByRole('heading',{name:CODING_MISSIONS[0].title,exact:true})});
 await reviewMission.getByRole('checkbox').uncheck();await review.page.waitForFunction(()=>!document.querySelector('.assignment-card input:disabled'));
 assert.equal(assigned.has(CODING_MISSIONS[0].id),false);
 await student.page.goto(base+'/student/learn');
 await student.page.getByRole('heading',{name:'Misioni i radhës po vjen!',exact:true}).waitFor();
 await review.page.getByRole('button',{name:'Progresi',exact:true}).click();
 await review.page.getByText('Shfaqen vetëm projektet e ruajtura. Ruajtja nuk do të thotë se misioni është përfunduar ose vlerësuar; hap projektin dhe shqyrto kriteret e misionit.',{exact:true}).waitFor();
 await review.page.getByRole('button',{name:'Shqyrto projektin',exact:true}).waitFor();
 await review.page.getByRole('button',{name:'Mësimet e klasës së pestë · Laboratori i kodimit',exact:true}).click();
 await reviewMission.getByRole('checkbox').check();await review.page.waitForFunction(()=>!document.querySelector('.assignment-card input:disabled'));
 assert(assigned.has(CODING_MISSIONS[0].id));
 await student.page.goto(base+'/student/learn');
 await student.page.getByRole('heading',{name:CODING_MISSIONS[0].title,exact:true}).waitFor();
 await student.page.getByText(/Projekti është ruajtur\. Kjo nuk e shënon misionin të përfunduar/).waitFor();
 await review.context.close();
 await teacher.context.close();
 await student.page.setViewportSize({width:390,height:844});assert(await student.page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 await student.context.close();assert.deepEqual(errors,[]);
 console.log('Coding UI: grade 5 class choice, teacher assignment/removal/reassignment, student access changes, retained project in teacher progress, private save/reopen, teacher inspection and mobile layout passed with mocked APIs.');
}catch(error){console.error('Browser errors:',errors);throw error;}finally{await browser.close();}
