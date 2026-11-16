import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import ts from '../node_modules/typescript/lib/typescript.js';
import {parse} from '@formatjs/icu-messageformat-parser';
import {localizeBlocks} from './localize-blocks.mjs';

const read=path=>readFileSync(new URL(path,import.meta.url),'utf8');
const json=path=>JSON.parse(read(path));
const inputs=[
 ['blocks','./node_modules/scratch-blocks/msg/json/en.json'],
 ['interface','./node_modules/scratch-l10n/editor/interface/en.json'],
 ['extensions','./node_modules/scratch-l10n/editor/extensions/en.json'],
 ['paint','./node_modules/scratch-l10n/editor/paint-editor/en.json']
];
function contract(nodes){
 return nodes.filter(node=>node.type!==0).map(node=>{
  const result={type:node.type};
  if(node.value!==undefined)result.value=node.value;
  if(node.style!==undefined)result.style=node.style;
  if(node.offset!==undefined)result.offset=node.offset;
  if(node.pluralType!==undefined)result.pluralType=node.pluralType;
  if(node.children)result.children=contract(node.children);
  if(node.options)result.options=Object.fromEntries(Object.entries(node.options).map(([key,option])=>[key,contract(option.value)]));
  return result;
 });
}
let total=0;
for(const [name,source] of inputs){
 const english=json(source),text=read(`./locales/${name}-sq.json`),albanian=JSON.parse(text);
 assert.equal((text.match(/^\s*"[^"\n]+"\s*:/gm)||[]).length,Object.keys(albanian).length,name+' duplicate keys');
 assert.deepEqual(Object.keys(albanian).sort(),Object.keys(english).sort(),name+' keys');
 for(const [key,value] of Object.entries(english)){
  const translated=albanian[key];
  assert.equal(typeof translated,'string',key);
  assert(translated.trim(),key);
  const placeholders=message=>(message.match(/%\d+|\[[A-Z][A-Z_0-9]*\]/g)||[]).sort();
  assert.deepEqual(placeholders(translated),placeholders(value),key+' block arguments');
  assert.deepEqual(contract(parse(translated)),contract(parse(value)),key+' ICU arguments and tags');
 }
 total+=Object.keys(albanian).length;
}
const allMessages=Object.assign({},...['interface','extensions','paint','supplemental'].map(name=>json(`./locales/${name}-sq.json`)));
function checkSource(directory){
 for(const entry of readdirSync(directory,{withFileTypes:true})){
  const path=new URL(entry.name,directory);
  if(entry.isDirectory()){checkSource(new URL(entry.name+'/',directory));continue;}
  if(!/\.(jsx|tsx|js|ts)$/.test(entry.name))continue;
  const source=ts.createSourceFile(path.pathname,readFileSync(path,'utf8'),ts.ScriptTarget.Latest,true);
  function visit(node){
   if(ts.isObjectLiteralExpression(node)){
    const fields=Object.fromEntries(node.properties.filter(property=>ts.isPropertyAssignment(property)&&ts.isStringLiteral(property.initializer)).map(property=>[property.name.getText(source).replaceAll("'",''),property.initializer.text]));
    if(fields.id&&fields.defaultMessage){
     assert(allMessages[fields.id],fields.id+' source translation');
     assert.deepEqual(contract(parse(allMessages[fields.id])),contract(parse(fields.defaultMessage)),fields.id+' source ICU contract');
    }
   }
   ts.forEachChild(node,visit);
  }
  visit(source);
 }
}
checkSource(new URL('./node_modules/@scratch/scratch-gui/src/',import.meta.url));
total+=Object.keys(json('./locales/supplemental-sq.json')).length;
const bundle=read('./node_modules/@scratch/scratch-gui/dist/scratch-gui.js');
const blocks=json('./locales/blocks-sq.json');
const localized=localizeBlocks(bundle,blocks);
assert(localized.includes(`On.locales={sq:${JSON.stringify(blocks)},ab:`));
assert.throws(()=>localizeBlocks('',blocks),/exactly once/);
assert.throws(()=>localizeBlocks(bundle+bundle,blocks),/exactly once/);
assert.throws(()=>localizeBlocks(localized,blocks),/exactly once/);
assert.equal(json('./node_modules/@scratch/scratch-gui/package.json').version,'15.3.0');
console.log(`Editor: ${total} Albanian translation entries, ICU structure, block arguments and pinned bundle transformation passed.`);
