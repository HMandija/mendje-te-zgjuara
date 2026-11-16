import {createHash} from 'node:crypto';
import {existsSync,mkdirSync,readFileSync,writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {library,libraryAssets} from './library.mjs';

export const assetDirectory=fileURLToPath(new URL('./node_modules/.lab-library-assets/',import.meta.url));
const digest=bytes=>createHash('md5').update(bytes).digest('hex');
export async function prepareLibrary(){
 mkdirSync(assetDirectory,{recursive:true});
 let next=0,downloaded=0;
 await Promise.all(Array.from({length:6},async()=>{
  while(next<libraryAssets.length){
   const asset=libraryAssets[next++];
   if(!/^[a-f0-9]{32}\.(svg|png|jpg|jpeg|wav|mp3)$/.test(asset.md5ext)||asset.md5ext!==asset.assetId+'.'+asset.dataFormat)throw new Error('Invalid library asset: '+asset.name);
   const file=assetDirectory+'/'+asset.md5ext;
   if(existsSync(file)&&digest(readFileSync(file))===asset.assetId)continue;
   let bytes;
   for(let attempt=0;attempt<2;attempt++){
    try{
     const response=await fetch('https://cdn.assets.scratch.mit.edu/internalapi/asset/'+asset.md5ext+'/get/',{signal:AbortSignal.timeout(45000)});
     if(!response.ok)throw new Error('Asset download returned '+response.status);
     bytes=new Uint8Array(await response.arrayBuffer());
     if(bytes.byteLength>10*1024*1024||digest(bytes)!==asset.assetId)throw new Error('Asset integrity mismatch: '+asset.md5ext);
     break;
    }catch(error){if(attempt===1)throw error;}
   }
   writeFileSync(file,bytes);downloaded++;
   if(downloaded%100===0)console.log('Library assets downloaded: '+downloaded);
  }
 }));
 const sprite=library.sprites.find(item=>item.name==='Macja');
 const defaults={sprite,assets:[...sprite.costumes,...sprite.sounds].map(asset=>({...asset,data:readFileSync(assetDirectory+'/'+asset.md5ext).toString('base64')}))};
 writeFileSync(new URL('./default-assets.json',import.meta.url),JSON.stringify(defaults));
 console.log('Official library: '+libraryAssets.length+' verified local assets; '+downloaded+' downloaded.');
}
if(process.argv[1]===fileURLToPath(import.meta.url))await prepareLibrary();
