// Original, short synthesized cues. Run with node scripts/generate-sounds.mjs.
import {mkdirSync,writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
const dir=fileURLToPath(new URL('../public/sounds/',import.meta.url));
mkdirSync(dir,{recursive:true});
for(const [name,notes] of Object.entries({click:[740],cheer:[523.25,659.25,783.99,659.25,1046.5],page:[440,587.33],react:[659.25,880,783.99],correct:[523.25,659.25],wrong:[261.63,220],complete:[523.25,659.25,783.99,1046.5],pick:[880],drop:[659.25,880],move:[196,246.94],turn:[392,523.25],bump:[146.83,130.81]})){
 const rate=22050,step=name==='click'?.045:.12,duration=name==='click'?.085:notes.length*step+.1,count=Math.ceil(rate*duration);
 const wav=Buffer.alloc(44+count*2);wav.write('RIFF');wav.writeUInt32LE(wav.length-8,4);wav.write('WAVEfmt ',8);wav.writeUInt32LE(16,16);wav.writeUInt16LE(1,20);wav.writeUInt16LE(1,22);wav.writeUInt32LE(rate,24);wav.writeUInt32LE(rate*2,28);wav.writeUInt16LE(2,32);wav.writeUInt16LE(16,34);wav.write('data',36);wav.writeUInt32LE(count*2,40);
 for(let i=0;i<count;i++){const time=i/rate;let sample=0;notes.forEach((frequency,n)=>{const elapsed=time-n*step;if(elapsed>=0&&elapsed<.2){const envelope=Math.min(1,elapsed/.012)*Math.exp(-elapsed*22);sample+=Math.sin(2*Math.PI*frequency*elapsed)*envelope*.3;}});wav.writeInt16LE(Math.round(Math.max(-1,Math.min(1,sample))*32767),44+i*2);}
 writeFileSync(`${dir}/${name}.wav`,wav);
}
