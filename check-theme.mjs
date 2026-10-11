import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const source=readFileSync(new URL('./app/theme.css',import.meta.url),'utf8');
const css=readFileSync(new URL('./app/globals.css',import.meta.url),'utf8')+readFileSync(new URL('./app/play.css',import.meta.url),'utf8');
assert(!/var\(--[\w-]+\)[a-f0-9]{2,}\b/.test(css),'CSS token references must not contain concatenated hex suffixes');
const defined=new Set([...source.matchAll(/--([\w-]+):/g),...css.matchAll(/--([\w-]+):/g)].map(m=>m[1]));
for(const ref of css.matchAll(/var\(--([\w-]+)\)/g))assert(defined.has(ref[1])||['tint','scene-ground'].includes(ref[1]),`Undefined theme token: ${ref[1]}`);
function tokens(text,base={}){return {...base,...Object.fromEntries([...text.matchAll(/--([\w-]+):([^;]+);/g)].map(m=>[m[1],m[2].trim()]))};}
const light=tokens(source.split("html[data-theme='dark']")[0]),dark=tokens(source.split("html[data-theme='dark']")[1],light);
function luminance(hex){const v=hex.slice(1).match(/../g).map(s=>parseInt(s,16)/255).map(n=>n<=.04045?n/12.92:((n+.055)/1.055)**2.4);return v[0]*.2126+v[1]*.7152+v[2]*.0722;}
function contrast(a,b){const x=luminance(a),y=luminance(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);}
const pairs=[['ink','surface'],['muted','surface'],['muted','surface-subtle'],['outer-text','page-bg'],['outer-muted','page-bg'],['outer-text','header-bg'],['outer-text','hero-bg'],['accent','surface'],['accent-on','accent'],['action-text','action-bg'],['success-text','success-bg'],['error-text','error-bg'],['hint-text','hint-bg'],['star','surface-subtle']];
for(const bg of ['play-ground','play-ground-garden','play-ground-path','play-ground-memory','play-ground-patterns','play-ground-wheels'])for(const fg of ['play-ink','play-muted'])pairs.push([fg,bg]);
for(const [name,palette] of [['light',light],['dark',dark]])for(const [text,bg] of pairs){const ratio=contrast(palette[text],palette[bg]);assert(ratio>=4.5,`${name}: ${text}/${bg} contrast ${ratio.toFixed(2)} < 4.5`);}
for(const palette of [light,dark])assert(contrast(palette['maze-wall'],palette['maze-floor'])>=3,'Maze walls must remain distinguishable in both themes');
for(const name of ['click','cheer','page','react','correct','wrong','complete','pick','drop','move','turn','bump']){const wav=readFileSync(new URL(`./public/sounds/${name}.wav`,import.meta.url));assert.equal(wav.toString('ascii',0,4),'RIFF');assert.equal(wav.toString('ascii',8,12),'WAVE');assert.equal(wav.readUInt32LE(40),wav.length-44);assert(wav.length<40000);}
console.log('Design: both semantic text palettes meet 4.5:1; original local WAV cues are valid. Browser verification is still required.');
