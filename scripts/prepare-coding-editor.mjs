import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {cpSync,existsSync,readFileSync,readdirSync,rmSync,writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {resolve} from 'node:path';

const root=fileURLToPath(new URL('..',import.meta.url)),editor=resolve(root,'coding-editor'),target=resolve(root,'public/coding-lab');
function inputs(directory){return readdirSync(directory,{withFileTypes:true}).filter(entry=>!['node_modules','build'].includes(entry.name)).flatMap(entry=>entry.isDirectory()?inputs(resolve(directory,entry.name)):[resolve(directory,entry.name)]);}
function run(args){const result=spawnSync(process.execPath,args,{cwd:editor,stdio:'inherit'});if(result.error)throw result.error;if(result.status!==0)throw new Error('Përgatitja e laboratorit dështoi.');}
export function prepareCodingEditor(force=false){
 const hash=createHash('sha256').update(process.version);
 for(const file of [...inputs(editor),resolve(root,'lib/coding-missions.mjs'),resolve(root,'lib/coding-project-file.mjs'),resolve(root,'package.json'),resolve(root,'package-lock.json')].sort())hash.update(file.slice(root.length)).update(readFileSync(file));
 const fingerprint=hash.digest('hex'),stamp=resolve(target,'.lab-build');
 if(!force&&existsSync(stamp)&&readFileSync(stamp,'utf8')===fingerprint&&existsSync(resolve(target,'index.html')))return;
 if(!existsSync(resolve(editor,'node_modules/webpack/bin/webpack.js'))||!existsSync(resolve(editor,'node_modules/@scratch/scratch-gui/package.json'))){
  if(!process.env.npm_execpath)throw new Error('Nise përgatitjen me npm run dev ose npm run build.');
  run([process.env.npm_execpath,'ci','--prefix',editor,'--ignore-scripts','--include=dev','--prefer-offline','--no-audit','--no-fund']);
 }
 run([resolve(editor,'build-source.mjs')]);
 run([resolve(editor,'node_modules/vite/bin/vite.js'),'build','--config',resolve(editor,'vite.config.mjs')]);
 rmSync(target,{recursive:true,force:true});
 cpSync(resolve(editor,'build'),target,{recursive:true});
 writeFileSync(stamp,fingerprint);
 console.log('Laboratori i Kodimit u përgatit për aplikacionin.');
}
