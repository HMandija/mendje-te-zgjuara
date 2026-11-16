import storageModule from '@scratch/scratch-storage';
import defaults from './default-assets.json' with {type:'json'};

export function previewStorage(){
 const {ScratchStorage}=storageModule;
 const scratchStorage=new ScratchStorage();
 for(const asset of defaults.assets){
  const type=asset.dataFormat==='svg'?scratchStorage.AssetType.ImageVector:asset.dataFormat==='png'?scratchStorage.AssetType.ImageBitmap:scratchStorage.AssetType.Sound;
  scratchStorage.builtinHelper._store(type,asset.dataFormat,Uint8Array.from(atob(asset.data),letter=>letter.charCodeAt(0)),asset.assetId);
 }
 const blank=scratchStorage.createAsset(scratchStorage.AssetType.ImageVector,scratchStorage.DataFormat.SVG,new TextEncoder().encode('<svg xmlns="http://www.w3.org/2000/svg" width="480" height="360"><rect width="480" height="360" fill="white"/></svg>'),null,true);
 scratchStorage.builtinHelper._store(blank.assetType,blank.dataFormat,blank.data,blank.assetId);
 const project={targets:[
  {isStage:true,name:'Stage',variables:{},lists:{},broadcasts:{},blocks:{},comments:{},currentCostume:0,costumes:[{name:'Sfondi i bardhë',assetId:blank.assetId,md5ext:blank.assetId+'.svg',dataFormat:'svg',bitmapResolution:1,rotationCenterX:240,rotationCenterY:180}],sounds:[],volume:100,layerOrder:0,tempo:60,videoState:'off'},
  {...defaults.sprite,lists:{},broadcasts:{},comments:{},currentCostume:0,volume:100,layerOrder:1,visible:true,x:0,y:0,size:100,direction:90,draggable:false,rotationStyle:'all around'}
 ],monitors:[],extensions:[],meta:{semver:'3.0.0'}};
 scratchStorage.builtinHelper._store(scratchStorage.AssetType.Project,scratchStorage.DataFormat.JSON,new TextEncoder().encode(JSON.stringify(project)),'0');
 const getLibraryAssetUrl=(id,format)=>(typeof location==='undefined'?'/':new URL('.',location.href).pathname)+'library-assets/'+encodeURIComponent(id)+'.'+encodeURIComponent(format);
 scratchStorage.addWebStore([scratchStorage.AssetType.ImageVector,scratchStorage.AssetType.ImageBitmap,scratchStorage.AssetType.Sound],asset=>getLibraryAssetUrl(asset.assetId,asset.dataFormat));
 return {scratchStorage,getLibraryAssetUrl,saveProject:async()=>{throw new Error('Ruajtja kërkon hyrje dhe leje nga mësuesi.');}};
}
