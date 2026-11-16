import {defineConfig} from 'vite';
import {cpSync,readFileSync,readdirSync,statSync,writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {resolve} from 'node:path';
import JSZip from 'jszip';
import {CODING_MISSIONS} from '../lib/coding-missions.mjs';

const root=fileURLToPath(new URL('.',import.meta.url));
const compiled=resolve(root,'node_modules/.lab-source-build');
const guiDir=resolve(root,'node_modules/@scratch/scratch-gui');
function files(directory,prefix=''){return readdirSync(directory,{withFileTypes:true}).flatMap(entry=>entry.isDirectory()?files(resolve(directory,entry.name),prefix+entry.name+'/'):[prefix+entry.name]);}
function sourceParts(){
 const entries=[],add=(name,file)=>entries.push({name,file});
 const own=['package.json','package-lock.json','main.jsx','index.html','style.css','preview-storage.mjs','default-assets.json','library.mjs','prepare-library.mjs','theme-colors.cjs','project-file.mjs','vite.config.mjs','build-source.mjs','source-entry.mjs','browser-storage.mjs','source-loader.cjs','text-loader.cjs','localize-blocks.mjs','check-blocks-sq.mjs','check-editor.mjs','check-project-file.mjs','check-source-security.mjs',...files(resolve(root,'locales')).map(file=>'locales/'+file),...files(resolve(root,'safe-hull')).map(file=>'safe-hull/'+file)];
 for(const file of own)add('coding-editor/'+file,resolve(root,file));
 for(const file of ['lib/coding-missions.mjs','lib/coding-project-file.mjs','package.json','package-lock.json'])add(file,resolve(root,'..',file));
 for(const name of ['scratch-gui','scratch-vm','scratch-render','scratch-paint','scratch-storage','scratch-svg-renderer']){
  const directory=resolve(root,'node_modules/@scratch',name);
  for(const file of files(directory).filter(file=>file.startsWith('src/')||/^(LICENSE|TRADEMARK|package.json)$/.test(file)))add('upstream/@scratch/'+name+'/'+file,resolve(directory,file));
 }
 for(const name of ['@scratch/task-herder','@scratch/paper','scratch-blocks','scratch-render-fonts']){
  const directory=resolve(root,'node_modules',name);
  for(const file of files(directory).filter(file=>file.startsWith('dist/')||file.startsWith('src/')||/^(LICENSE(?:\.txt)?|TRADEMARK|package.json)$/.test(file)))add('upstream/'+name+'/'+file,resolve(directory,file));
 }
 const groups=[];let group=[],size=0;
 for(const entry of entries){
  const bytes=statSync(entry.file).size;
  if(bytes>20*1024*1024)throw new Error('Source file exceeds archive part limit: '+entry.name);
  if(size+bytes>20*1024*1024){groups.push(group);group=[];size=0;}
  group.push(entry);size+=bytes;
 }
 if(group.length)groups.push(group);
 return groups.map((entries,index)=>({entries,fileName:index?'source-'+(index+1)+'.zip':'source.zip'}));
}
async function sourceArchives(parts){
 const archives=[];
 for(const part of parts){
  const zip=new JSZip();
  for(const entry of part.entries)zip.file(entry.name,readFileSync(entry.file));
  const source=await zip.generateAsync({type:'uint8array',compression:'DEFLATE'});
  if(source.byteLength>=25*1024*1024)throw new Error('Source archive exceeds Cloudflare asset limit.');
  archives.push({type:'asset',fileName:part.fileName,source});
 }
 return archives;
}
const parts=sourceParts();
export default defineConfig(({command})=>({
 root,base:command==='serve'?'/':'/coding-lab/',publicDir:compiled,
 resolve:{alias:[{find:/^@scratch\/scratch-storage$/,replacement:resolve(root,'browser-storage.mjs')}]},

 server:{host:'localhost',port:5184,strictPort:true,headers:{'Access-Control-Allow-Origin':'*'}},
 preview:{host:'localhost',port:5184,strictPort:true},
 build:{outDir:'build',copyPublicDir:false,emptyOutDir:true},
 plugins:[{
  name:'albanian-editor',
  resolveId(id){if(['virtual:lab-preview','virtual:lab-sources'].includes(id))return '\0'+id;},
  load(id){if(id==='\0virtual:lab-preview')return `export default ${JSON.stringify(CODING_MISSIONS[0])};`;if(id==='\0virtual:lab-sources')return `export default ${JSON.stringify(parts.map(part=>part.fileName))};`;},
  async generateBundle(){
   for(const file of files(compiled))this.emitFile({type:'asset',fileName:file,source:readFileSync(resolve(compiled,file))});
   for(const archive of await sourceArchives(parts))this.emitFile(archive);
  },
  writeBundle(options){
   for(const [source,target] of [['LICENSE','licenses/AGPL-3.0.txt'],['TRADEMARK','licenses/TRADEMARK.txt']])cpSync(resolve(guiDir,source),resolve(options.dir,target),{recursive:true});
   const notices=[resolve(compiled,'lab-gui.js.LICENSE.txt'),resolve(root,'node_modules/@scratch/paper/LICENSE.txt'),resolve(root,'node_modules/@scratch/task-herder/LICENSE'),resolve(root,'node_modules/scratch-blocks/LICENSE'),resolve(root,'node_modules/scratch-render-fonts/LICENSE.txt')];
   writeFileSync(resolve(options.dir,'licenses/editor-dependencies.txt'),notices.map(file=>readFileSync(file,'utf8')).join('\n\n'));
  }
 }]
}));
