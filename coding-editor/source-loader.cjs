const fs=require('node:fs');
const path=require('node:path');
module.exports=function(source){
 const file=this.resourcePath.replace(/\\/g,'/');
 const catalogue=file.match(/\/scratch-gui\/src\/lib\/libraries\/(sprites|costumes|backdrops|sounds)\.json$/);
 if(catalogue)return JSON.stringify(JSON.parse(fs.readFileSync(path.join(__dirname,'node_modules/.lab-library.json'),'utf8'))[catalogue[1]]);
 if(file.endsWith('/lib/legacy-library-asset-url.ts'))source="export const buildLibraryAssetUrl=(assetId,dataFormat)=>new URL('.',window.location.href).pathname+'library-assets/'+encodeURIComponent(assetId)+'.'+encodeURIComponent(dataFormat);";
 if(file.endsWith('/scratch-blocks/dist/main.mjs')){
  const marker='Mi.currentLocale_="en",Mi.locales={ab:';
  if(source.split(marker).length!==2)throw new Error('Unsupported Scratch Blocks locale registry.');
  const translations=JSON.parse(fs.readFileSync(path.join(__dirname,'locales/blocks-sq.json'),'utf8'));
  source=source.replace(marker,`Mi.currentLocale_="en",Mi.locales={sq:${JSON.stringify(translations)},ab:`);
 }
 if(file.endsWith('/lib/settings/color-mode/persistence.js')){
  if(!source.includes('const detectColorMode = () =>'))throw new Error('Unsupported color mode settings.');
  source="import {DEFAULT_MODE,HIGH_CONTRAST_MODE} from '.'; let mode; export const detectColorMode=()=>mode??(window.matchMedia?.('(prefers-contrast: more)').matches?HIGH_CONTRAST_MODE:DEFAULT_MODE); export const persistColorMode=value=>{if(![DEFAULT_MODE,HIGH_CONTRAST_MODE].includes(value))throw new Error('Invalid color mode.');mode=value;};";
 }
 if(file.endsWith('/lib/settings/theme/persistence.js')){
  if(!source.includes('const detectTheme = () =>'))throw new Error('Unsupported theme settings.');
  source="import {DEFAULT_THEME,CAT_BLOCKS_THEME} from '.'; let theme=DEFAULT_THEME; export const detectTheme=()=>theme; export const persistTheme=value=>{if(![DEFAULT_THEME,CAT_BLOCKS_THEME].includes(value))throw new Error('Invalid theme.');theme=value;};";
 }
 if(file.endsWith('/query-string/index.js')){
  const decoder="var decodeComponent = require('decode-uri-component');";
  if(source.split(decoder).length!==2)throw new Error('Unsupported query string decoder.');
  source=source.replace(decoder,"var decodeComponent = require('decode-uri-component').default;");
 }
 if(file.endsWith('/generated/microbit-hex-url.cjs'))source='module.exports="";';
 if(file.endsWith('/extension-support/extension-manager.js')){
  const marker='const builtinExtensions = {';
  if(source.split(marker).length!==2)throw new Error('Unsupported VM extension registry.');
  source=source.replace(/const builtinExtensions = \{[\s\S]*?\n\};/,"const builtinExtensions = {pen:()=>require('../extensions/scratch3_pen'),music:()=>require('../extensions/scratch3_music')};");
  const load='    loadExtensionURL (extensionURL) {';
  if(source.split(load).length!==2)throw new Error('Unsupported VM extension loader.');
  source=source.replace(load,load+"\n        if (!['pen','music'].includes(extensionURL)) return Promise.reject(new Error('External extensions are disabled.'));");
 }
 if(file.endsWith('/components/delete-button/delete-button.jsx')){
  if(!source.includes('aria-label="Delete"'))throw new Error('Unsupported delete button.');
  source=source.replace('aria-label="Delete"','aria-label="Fshi"');
 }
 if(file.endsWith('/containers/sound-tab.jsx')){
  const recording='                }, {\n                    title: intl.formatMessage(messages.recordSound),\n                    img: addSoundFromRecordingIcon,\n                    onClick: onNewSoundFromRecordingClick';
  if(source.split(recording).length!==2)throw new Error('Unsupported sound recording menu.');
  source=source.replace(recording,'');
 }
 if(file.endsWith('/lib/libraries/extensions/index.jsx')){
  const marker='    {\n        name: (\n            <FormattedMessage\n                defaultMessage="Video Sensing"';
  if(source.split(marker).length!==2)throw new Error('Unsupported extension catalogue.');
  source=source.slice(0,source.indexOf(marker))+'];\n';
 }
 return source;
};
