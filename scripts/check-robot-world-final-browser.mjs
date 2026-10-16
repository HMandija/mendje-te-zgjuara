import {spawn} from 'node:child_process';import fs from 'node:fs';
// Sequential runs keep software WebGL/audio measurements from competing for CPU.
for(const [phase,file] of [['a','check-robot-world-browser.mjs'],['b','check-robot-world-phase-b-browser.mjs'],['c','check-robot-world-phase-c-browser.mjs'],['d','check-robot-world-phase-d-browser.mjs'],['e','check-robot-world-phase-e-browser.mjs']]){
 const path=`.wrangler/robot-world-final-${phase}.log`,fd=fs.openSync(path,'w');console.log('Checking Phase '+phase.toUpperCase());const code=await new Promise(resolve=>{const child=spawn(process.execPath,['scripts/'+file],{env:{...process.env,ROBOT_WORLD_TEST_URL:'http://127.0.0.1:8787'},stdio:['ignore',fd,fd]});child.on('exit',resolve);child.on('error',()=>resolve(1));});fs.closeSync(fd);if(code!==0){console.log(fs.readFileSync(path,'utf8').slice(-4500));throw Error('Browser regression failed: '+phase);}console.log(fs.readFileSync(path,'utf8').trim().split('\n').at(-1));
}
console.log('Final A–E browser regression suite passed.');
