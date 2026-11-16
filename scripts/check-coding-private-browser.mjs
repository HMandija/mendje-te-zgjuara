import assert from 'node:assert/strict';
import {createHash,randomBytes,randomUUID} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {readFile,writeFile,rm} from 'node:fs/promises';
import {chromium} from '@playwright/test';
import JSZip from 'jszip';

const base=process.env.CODING_TEST_URL||'http://localhost:5173';
assert(['localhost','127.0.0.1'].includes(new URL(base).hostname),'This fixture is local-only.');
const owner='coding-qa-'+randomUUID(),classId=randomUUID(),profile=randomUUID(),classCode=randomBytes(4).toString('hex').toUpperCase(),token=randomBytes(32).toString('hex'),hash=createHash('sha256').update(token).digest('hex'),mission='nisja-1';
const quote=value=>"'"+String(value).replaceAll("'","''")+"'";
async function sql(command){
 const file='.wrangler/coding-qa-'+randomUUID()+'.sql';await writeFile(file,command);
 try{const result=spawnSync(process.execPath,['node_modules/wrangler/bin/wrangler.js','d1','execute','DB','--local','--config','.cloudflare/wrangler.json','--persist-to','.wrangler/state','--file',file],{encoding:'utf8',timeout:120000,env:{...process.env,CLOUDFLARE_CF_FETCH_ENABLED:'false',WRANGLER_SEND_METRICS:'false',WRANGLER_WRITE_LOGS:'false'}});assert.equal(result.status,0,result.stderr||result.stdout);}
 finally{await rm(file,{force:true});}
}
const scope=new URLSearchParams({class:classId,mission}),headers={Authorization:'Bearer '+token,Origin:base};
const localFetch=(url,options={})=>fetch(url,{...options,signal:AbortSignal.timeout(30000)});
const errors=[],external=[];
let browser;
try{
 await sql(`INSERT INTO accounts(user,role) VALUES(${quote(owner)},'TEACHER'); INSERT INTO workspaces(owner,payload) VALUES(${quote(owner)},${quote(JSON.stringify({profiles:[{id:profile,name:'Nxënësi i provës',grade:5}],custom:[]}))}); INSERT INTO schools(id,owner,name) VALUES(${quote(owner)},${quote(owner)},'Prova lokale'); INSERT INTO classes(id,school,owner,name,grade,code) VALUES(${quote(classId)},${quote(owner)},${quote(owner)},'Prova 5',5,${quote(classCode)}); INSERT INTO class_students(class,profile) VALUES(${quote(classId)},${quote(profile)}); INSERT INTO picture_logins(class,profile,picture) VALUES(${quote(classId)},${quote(profile)},'sun'); INSERT INTO coding_assignments(class,mission,created) VALUES(${quote(classId)},'nisja-1',${Date.now()}); INSERT INTO invitations(hash,owner,profile,expires) VALUES(${quote(hash)},${quote(owner)},${quote(profile)},${Date.now()+3600000});`);
 const list=await localFetch(base+'/api/coding',{headers});assert.equal(list.status,200,await list.clone().text());assert.equal((await list.json()).missions.length,1);
 assert.equal((await localFetch(base+'/api/coding-project?'+scope)).status,401);
 const denied=new URLSearchParams({class:classId,mission:'nisja-2'});assert.equal((await localFetch(base+'/api/coding-project?'+denied,{headers})).status,403);
 browser=await chromium.launch({channel:'chrome',headless:true});
 const loginContext=await browser.newContext({viewport:{width:1440,height:1000}});const loginPage=await loginContext.newPage();loginPage.setDefaultTimeout(60000);loginPage.on('pageerror',error=>errors.push(error.message));loginPage.on('console',message=>{if(message.type()==='error')errors.push(message.text());});loginPage.on('request',request=>{const url=new URL(request.url());if(url.protocol.startsWith('http')&&url.origin!==base)external.push(url.href);});
 await loginPage.goto(base+'/student');await loginPage.getByRole('heading',{name:'Hyr me kodin e mësuesit'}).waitFor();await loginPage.locator('input[name=code]').fill(classCode);await loginPage.getByRole('button',{name:/Fillo të mësosh/}).click();await loginPage.getByRole('button',{name:'Nxënësi i provës'}).click();await loginPage.getByRole('button',{name:'Dielli'}).click();await loginPage.waitForURL('**/student/learn');await loginPage.getByRole('heading',{name:'Personazhi përshëndet',exact:true}).waitFor();await loginPage.getByRole('button',{name:'Hap laboratorin',exact:true}).click();await loginPage.locator('iframe[title="Editori i Laboratorit të Kodimit"]').waitFor();await loginPage.close();await loginContext.close();
 const context=await browser.newContext({viewport:{width:1440,height:1000}});
 await context.addInitScript(value=>{if(window===window.top)sessionStorage.setItem('mendje-student-session-v2',value);},token);
 const page=await context.newPage();page.setDefaultTimeout(60000);page.on('pageerror',error=>errors.push(error.message));page.on('console',message=>{if(message.type()==='error')errors.push(message.text());});page.on('request',request=>{const url=new URL(request.url());if(url.protocol.startsWith('http')&&url.origin!==base)external.push(url.href);});
 await page.goto(base+'/student/learn');await page.getByRole('heading',{name:'Personazhi përshëndet',exact:true}).waitFor();await page.getByRole('button',{name:'Hap laboratorin',exact:true}).click();
 const iframe=page.locator('iframe[title="Editori i Laboratorit të Kodimit"]'),editor=page.frameLocator('iframe[title="Editori i Laboratorit të Kodimit"]');
 await editor.getByRole('button',{name:'Ruaj projektin',exact:true}).waitFor();
 assert(await editor.locator('body').evaluate(async()=>{const fonts=await Promise.all(['Sans Serif','Serif','Handwriting','Marker','Curly','Pixel','Scratch'].map(name=>document.fonts.load('12px "'+name+'"')));return fonts.every(faces=>faces.length===1&&faces[0].status==='loaded');}));
 const block=editor.locator('.blocklyFlyout .blocklyDraggable').filter({hasText:/lëviz/}).first(),box=await block.boundingBox();
 await page.mouse.move(box.x+30,box.y+18);await page.mouse.down();await page.mouse.move(box.x+330,box.y+25,{steps:25});await page.mouse.up();
 assert.equal(await iframe.getAttribute('sandbox'),'allow-scripts allow-downloads allow-modals');
 await editor.getByRole('tab',{name:'Tingujt',exact:true}).click();
 await editor.getByRole('button',{name:'Zgjidh një tingull',exact:true}).first().click();
 await editor.getByRole('dialog').getByText('Zilja e derës',{exact:true}).click();
 await editor.getByRole('button',{name:'Luaj',exact:true}).click();
 await editor.getByRole('tab',{name:'Kodi',exact:true}).click();
 for(const name of ['Lapsi','Muzika']){
  await editor.getByRole('button',{name:'Shto shtesë',exact:true}).click();
  await editor.getByRole('dialog').getByText(name,{exact:true}).click();
 }
 await editor.getByRole('button',{name:'Ruaj projektin',exact:true}).click();await editor.getByRole('status').filter({hasText:'Projekti u ruajt privatisht.'}).waitFor();
 const saved=await localFetch(base+'/api/coding-project?'+scope,{headers});assert.equal(saved.status,200,await saved.clone().text());assert.equal(saved.headers.get('X-Project-Revision'),'1');assert.equal(saved.headers.get('Cache-Control'),'private, no-store');
 const savedBytes=Buffer.from(await saved.arrayBuffer()),zip=await JSZip.loadAsync(savedBytes),data=JSON.parse(await zip.file('project.json').async('string'));
 assert(Object.values(data.targets.find(target=>!target.isStage).blocks).some(block=>block.opcode==='motion_movesteps'));
 await page.getByRole('button',{name:'Mbyll laboratorin',exact:true}).click();await page.getByRole('button',{name:'Vazhdo projektin',exact:true}).click();await editor.getByRole('button',{name:'Shkarko projektin',exact:true}).waitFor();
 const downloading=page.waitForEvent('download');await editor.getByRole('button',{name:'Shkarko projektin',exact:true}).click();const download=await downloading,downloaded=await JSZip.loadAsync(await readFile(await download.path()));const reopened=JSON.parse(await downloaded.file('project.json').async('string'));assert.deepEqual(reopened.targets.map(target=>target.blocks),data.targets.map(target=>target.blocks));
 await sql(`DELETE FROM coding_assignments WHERE class=${quote(classId)} AND mission='nisja-1';`);
 assert.equal((await localFetch(base+'/api/coding-project?'+scope,{headers})).status,403);
 assert.equal((await localFetch(base+'/api/coding-project?'+scope+'&revision=1',{method:'PUT',headers:{...headers,'Content-Type':'application/octet-stream'},body:savedBytes})).status,403);
 await page.screenshot({path:'preview-coding-private.png',fullPage:true});
 assert.deepEqual(errors,[]);assert.deepEqual(external,[]);
 console.log('Real local coding: class-code login UI and grade 5 coding mission, authenticated pupil, assigned-only mission, opaque iframe, block drag, private D1/R2 save, binary reopen/download, anonymous denial and revoked read/write passed.');
}catch(error){
 console.error('Browser errors:',errors,'External requests:',external);
 throw error;
}finally{
 if(browser)await browser.close();
 await sql(`DELETE FROM invitations WHERE owner=${quote(owner)}; DELETE FROM classes WHERE owner=${quote(owner)}; DELETE FROM schools WHERE owner=${quote(owner)}; DELETE FROM workspaces WHERE owner=${quote(owner)}; DELETE FROM accounts WHERE user=${quote(owner)};`);
}
