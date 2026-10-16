import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const Sound=['click','cheer','page','react','correct','wrong','complete','pick','drop','move','turn','bump','maze','robot','sketch','story','tangram','color','event','sort','memory','lesson','level','pipe'];

for(const sound of Sound){
 const wav=readFileSync(`public/sounds/${sound}.wav`);
 assert.equal(wav.toString('ascii',0,4),'RIFF',`${sound}: WAV container`);
 assert.equal(wav.toString('ascii',8,12),'WAVE',`${sound}: WAVE format`);
 assert.equal(wav.readUInt32LE(4)+8,wav.length,`${sound}: valid file length`);
 assert(wav.subarray(44).some(sample=>sample!==0),`${sound}: non-silent samples`);
}
console.log(`Audio: ${Sound.length} cues have complete, non-silent WAV assets.`);
