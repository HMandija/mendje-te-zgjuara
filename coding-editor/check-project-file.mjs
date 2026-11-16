import assert from 'node:assert/strict';
import JSZip from 'jszip';
import {MAX_PROJECT_BYTES,readProjectFile} from './project-file.mjs';
import {previewStorage} from './preview-storage.mjs';

async function archive(project,extras={}){
 const zip=new JSZip();zip.file('project.json',JSON.stringify(project));
 for(const target of project.targets)for(const item of [...target.costumes,...target.sounds])zip.file(item.md5ext,storage.get(item.assetId).data);
 for(const [name,data] of Object.entries(extras))zip.file(name,data);
 return zip.generateAsync({type:'uint8array',compression:'DEFLATE'});
}
const storage=previewStorage().scratchStorage;
const asset=await storage.load(storage.AssetType.Project,'0',storage.DataFormat.JSON);
const project=JSON.parse(new TextDecoder().decode(asset.data));
assert.equal(project.targets[0].name,'Stage','The interchange format requires the internal English stage name');
assert.equal(project.targets[1].name,'Macja');
for(const target of project.targets)for(const costume of target.costumes)assert(storage.get(costume.assetId));
const valid=await archive(project);assert.equal(await readProjectFile(valid),valid);
await assert.rejects(readProjectFile(new Uint8Array()),/10 MB/);
await assert.rejects(readProjectFile(new Uint8Array(MAX_PROJECT_BYTES+1)),/10 MB/);
await assert.rejects(readProjectFile(new Uint8Array([1,2,3])),/vlefshëm/);
await assert.rejects(readProjectFile(await archive({...project,extensionURLs:{pen:'https://example.invalid/extension.js'}})),/Lejohen/);
await assert.rejects(readProjectFile(await archive({...project,extensions:['unknown']})),/Lejohen/);
await assert.rejects(readProjectFile(await archive({...project,targets:[]})),/Lejohen/);
await assert.rejects(readProjectFile(await archive(project,{['0'.repeat(32)+'.png']:new Uint8Array(31*1024*1024)})),/madh/);
await assert.rejects(readProjectFile(await archive(project,Object.fromEntries(Array.from({length:501},(_,i)=>[i+'.txt','x'])))),/shumë skedarë/);
const unicode={...project,targets:[...project.targets,{...project.targets[1],name:'ëç'.repeat(10000)}]};
assert.equal(await readProjectFile(await archive(unicode)) instanceof Uint8Array,true);
console.log('Local projects: official Scratch cat assets, SB3 round trip, size limits, invalid archives and external extension rejection passed.');
