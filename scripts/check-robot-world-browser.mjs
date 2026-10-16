import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {loadRobotRules} from './load-robot-world-rules.mjs';
const rules=await loadRobotRules();
const base=process.env.ROBOT_WORLD_TEST_URL||'http://localhost:5173';
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
await fs.promises.mkdir('.wrangler/robot-world-qa',{recursive:true});
const failures=[];
try{
 const context=await browser.newContext({viewport:{width:1280,height:900},reducedMotion:'reduce'}),page=await context.newPage();page.on('pageerror',e=>failures.push(e.message));
 const external=[];page.on('request',r=>{if(!r.url().startsWith(base)&&!r.url().startsWith('data:'))external.push(r.url());});
 await page.goto(base+'/robot-world');await page.locator('.rw-challenge').waitFor();await page.locator('.rw-scene canvas').waitFor({timeout:30000});
 await page.locator('.rw-options button').nth(2).click();await page.waitForTimeout(650);await page.screenshot({path:'.wrangler/robot-world-qa/factory-desktop.png',fullPage:true});
 await page.locator('.rw-answers button').nth(1).click();assert.match(await page.locator('.rw-feedback').innerText(),/Provo përsëri/);assert.equal((await page.locator('.rw-stars').innerText()).replace(/\s/g,''),'★0');
 await page.locator('.rw-answers button').first().click();assert.match(await page.locator('.rw-stars').innerText(),/3/);await page.locator('.rw-answers button').first().click();assert.match(await page.locator('.rw-stars').innerText(),/3/);
 for(let index=0;index<12;index++){
  if(index>0){await page.locator('.rw-challenge-footer .rw-primary').click();}
  const c=rules.challenges(1)[index];if(index===0)continue;
  if(c.kind==='route'){for(const d of c.path)await page.getByRole('button',{name:{R:'Djathtas',L:'Majtas',U:'Lart',D:'Poshtë'}[d],exact:true}).click();await page.locator('.rw-run .rw-primary').click();}
  else await page.locator('.rw-answers button').nth(c.options.indexOf(c.target)).click();
  await page.locator('.rw-challenge-footer .rw-primary').waitFor();
 }
 assert.match(await page.locator('.rw-stars').innerText(),/36/);await page.locator('.rw-challenge-footer .rw-primary').click();await page.locator('.rw-world').waitFor();await page.getByRole('button',{name:/Shtëpia/}).click();await page.locator('.rw-rooms').waitFor();await page.screenshot({path:'.wrangler/robot-world-qa/world-desktop.png',fullPage:true});
 await page.getByRole('button',{name:'2D',exact:true}).click();await page.locator('.rw-flat svg').waitFor();
 for(const [name,width,height] of [['phone',390,844],['tablet',820,1180]]){await page.setViewportSize({width,height});await page.screenshot({path:`.wrangler/robot-world-qa/world-${name}.png`,fullPage:true});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+1));}
 assert.equal(external.length,0,external.join('\n'));await context.close();
 // API is mocked only in this browser case. The separate SQLite test runs the
 // real Worker route's authorization contract, queries and transactions.
 const student=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'}),p=await student.newPage();let ownerProfile='student-a',server=rules.initialWorld(),posts=0;
 await student.addInitScript(()=>{sessionStorage.setItem('mendje-student-session-v2','a'.repeat(64));sessionStorage.setItem('mendje-student-last-activity-v1',String(Date.now()));});
 await p.route('**/api/session',r=>r.fulfill({json:{authenticated:true,role:'STUDENT'}}));
 await p.route('**/api/robot-world',r=>{if(r.request().method()==='POST'){posts++;const command=r.request().postDataJSON(),result=rules.applyWorld(server,command,2);server=result.state;return r.fulfill({json:{...result,grade:2,profile:ownerProfile}});}return r.fulfill({json:{state:server,grade:2,profile:ownerProfile}});});
 await p.goto(base+'/student/robot-world');await p.locator('.rw-challenge').waitFor();await p.locator('.rw-answers button').first().click();await p.waitForFunction(()=>document.querySelector('.rw-save')?.textContent.includes('Progresi u ruajt'));assert.equal(posts,1);
 await p.reload();await p.locator('.rw-challenge').waitFor();assert.match(await p.locator('.rw-stars').innerText(),/3/);
 await student.setOffline(true);await p.locator('.rw-rounds button').nth(1).click();await p.locator('.rw-answers button').first().click();assert.match(await p.locator('.rw-save').innerText(),/presin/);assert.equal(posts,1);
 await student.setOffline(false);await p.waitForFunction(()=>document.querySelector('.rw-save')?.textContent.includes('Progresi u ruajt'));assert.equal(posts,2);assert.equal(rules.worldStars(server),6);
 await p.screenshot({path:'.wrangler/robot-world-qa/student-phone.png',fullPage:true});
 ownerProfile='student-b';server=rules.initialWorld();await p.evaluate(()=>{sessionStorage.removeItem('mendje-robot-world-v1');});await p.reload();await p.locator('.rw-challenge').waitFor();assert.match(await p.locator('.rw-stars').innerText(),/0/);await student.close();
 assert.equal(failures.length,0,failures.join('\n'));
 console.log('Browser: 3D rendering, all 12 factory challenges, replay rewards, home/map, 2D fallback, phone/tablet layout, no external requests, student reload/offline queue/sync and profile isolation passed.');
}finally{await browser.close();}
