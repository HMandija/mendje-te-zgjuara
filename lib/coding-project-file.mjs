import JSZip from 'jszip';

export const MAX_PROJECT_BYTES=10*1024*1024;
const MAX_EXPANDED_BYTES=30*1024*1024;
export async function readProjectFile(bytes){
 if(!bytes.byteLength||bytes.byteLength>MAX_PROJECT_BYTES)throw new Error('Zgjidh një projekt .sb3 deri në 10 MB.');
 let zip;
 try{zip=await JSZip.loadAsync(bytes);}catch{throw new Error('Ky nuk është një projekt .sb3 i vlefshëm.');}
 const files=Object.values(zip.files).filter(file=>!file.dir);
 if(files.length>500)throw new Error('Projekti përmban shumë skedarë.');
 if(files.some(file=>file.unsafeOriginalName&&file.unsafeOriginalName!==file.name)||files.some(file=>!/^project\.json$|^[a-f0-9]{32}\.(svg|png|jpg|jpeg|wav|mp3)$/i.test(file.name)))throw new Error('Projekti përmban skedarë të palejuar.');
 // Reject declared sizes before streaming the actual expanded bytes.
 if(files.reduce((sum,file)=>sum+file._data.uncompressedSize,0)>MAX_EXPANDED_BYTES)throw new Error('Projekti është shumë i madh pas hapjes.');
 const manifest=zip.file('project.json');
 if(!manifest||manifest._data.uncompressedSize>2*1024*1024)throw new Error('Ky nuk është një projekt .sb3 i vlefshëm.');
 let expanded=0,manifestText='';
 const decoder=new TextDecoder('utf-8',{fatal:true});
 for(const file of files){
  let entryBytes=0;
  await new Promise((resolve,reject)=>{
   const stream=file.internalStream('uint8array');
   stream.on('data',chunk=>{
    expanded+=chunk.byteLength;entryBytes+=chunk.byteLength;
    if(expanded>MAX_EXPANDED_BYTES||(file===manifest&&entryBytes>2*1024*1024)){stream.pause();reject(new Error('Projekti është shumë i madh pas hapjes.'));return;}
    if(file===manifest){try{manifestText+=decoder.decode(chunk,{stream:true});}catch(error){stream.pause();reject(error);}}
   }).on('end',resolve).on('error',reject).resume();
  });
 }
 manifestText+=decoder.decode();
 let project;
 try{project=JSON.parse(manifestText);}catch{throw new Error('Ky nuk është një projekt .sb3 i vlefshëm.');}
 if(!project||!Array.isArray(project.targets)||!project.targets.length||project.targets.length>100||project.extensionURLs||!Array.isArray(project.extensions||[])||(project.extensions||[]).some(id=>!['pen','music'].includes(id)))throw new Error('Lejohen vetëm projekte me blloqet bazë, Lapsin dhe Muzikën.');
 if(project.targets.filter(target=>target.isStage===true).length!==1||!project.targets.some(target=>target.isStage===true&&target.name==='Stage'))throw new Error('Skena e projektit është e pavlefshme.');
 let blocks=0;
 for(const target of project.targets){
  if(!target||typeof target.name!=='string'||!target.blocks||typeof target.blocks!=='object'||Array.isArray(target.blocks)||!Array.isArray(target.costumes)||!target.costumes.length||!Array.isArray(target.sounds))throw new Error('Përmbajtja e projektit është e pavlefshme.');
  blocks+=Object.keys(target.blocks).length;
  for(const asset of [...target.costumes,...target.sounds]){
   if(!asset||!/^[a-f0-9]{32}$/i.test(asset.assetId)||!['svg','png','jpg','jpeg','wav','mp3'].includes(asset.dataFormat)||!zip.file(asset.assetId+'.'+asset.dataFormat))throw new Error('Projektit i mungojnë materialet e nevojshme.');
  }
 }
 if(blocks>20000)throw new Error('Projekti përmban shumë blloqe.');
 return bytes;
}
