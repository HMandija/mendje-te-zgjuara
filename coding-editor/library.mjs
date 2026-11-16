import {readFileSync} from 'node:fs';

const labels=JSON.parse(readFileSync(new URL('./locales/library-sq.json',import.meta.url),'utf8'));
const prefixes=Object.keys(labels).sort((a,b)=>b.length-a.length);
export function libraryName(name){
 const text=name.trim();
 if(labels[text])return labels[text];
 const prefix=prefixes.find(key=>text.startsWith(key)&&/^[-\s\d]/.test(text.slice(key.length)));
 return prefix?labels[prefix]+text.slice(prefix.length):text;
}
const translate=item=>({...item,name:libraryName(item.name)});
export const library=Object.fromEntries(['sprites','costumes','backdrops','sounds'].map(kind=>{
 const items=JSON.parse(readFileSync(new URL('./node_modules/@scratch/scratch-gui/src/lib/libraries/'+kind+'.json',import.meta.url),'utf8'));
 return [kind,items.map(item=>kind==='sprites'?{...translate(item),costumes:item.costumes.map(translate),sounds:item.sounds.map(translate)}:translate(item))];
}));
export const libraryAssets=[...new Map([...library.costumes,...library.backdrops,...library.sounds,...library.sprites.flatMap(sprite=>[...sprite.costumes,...sprite.sounds])].map(asset=>[asset.md5ext,asset])).values()];
