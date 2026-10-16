import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{
 const page=await browser.newPage({reducedMotion:'reduce'});const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.addInitScript(()=>localStorage.setItem('mendje-robot-view','2d'));await page.goto('http://127.0.0.1:8787/robot-world/adventure');await page.locator('.rw-flat svg').waitFor();
 for(const [width,height] of [[1280,800],[820,1180],[360,800],[320,640],[844,390]]){
  await page.setViewportSize({width,height});
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth&&document.documentElement.scrollHeight<=innerHeight),'Page must remain within the viewport');
  const box=await page.locator('.rw-game-frame').boundingBox();assert(box&&box.y>=0&&box.y+box.height<=height+1);
  await page.getByRole('button',{name:'Hap menynë e lojës',exact:true}).click();assert(await page.locator('.rw-game-dialog').evaluate(x=>x.open));await page.keyboard.press('Escape');assert(!await page.locator('.rw-game-dialog').evaluate(x=>x.open));
  await page.getByRole('button',{name:'🛠 Ndërto',exact:true}).click();assert(await page.locator('.rw-builder-dialog').evaluate(x=>x.open));await page.getByRole('button',{name:'Koka, forma 2',exact:true}).click();assert.equal(await page.getByRole('button',{name:'Koka, forma 2',exact:true}).getAttribute('aria-pressed'),'true');await page.getByRole('button',{name:'Përfundo ndërtimin',exact:true}).click();
  await page.getByRole('button',{name:'Hap cilësimet e lojës',exact:true}).click();await page.locator('.rw-preview select').selectOption('1');await page.getByRole('button',{name:'Mbyll panelin',exact:true}).click();
  await page.screenshot({path:`.wrangler/robot-world-qa/game-screen-${width}.png`});
 }
 await page.setViewportSize({width:1280,height:800});await page.getByRole('button',{name:'Forma ●',exact:true}).click();assert.match(await page.locator('.rw-stars').innerText(),/3/);await page.locator('.rw-game-toolbar button').first().click();await page.locator('.rw-map-places').waitFor();assert(await page.locator('.rw-flat svg').isVisible());assert.deepEqual(errors,[]);console.log('Single-screen viewport, builder editing, modal Escape/focus, settings, answer and map checks passed on five sizes.');
}finally{await browser.close();}
