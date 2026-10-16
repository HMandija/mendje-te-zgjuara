// Build-time only. The app serves WAV files; no synthesizer enters client code.
import load from '@echogarden/espeak-ng-emscripten';
import {mkdir,writeFile} from 'node:fs/promises';
const phrases={
 dance:'Shiko lëvizjet në vijën e ritmit. Prek shigjetën e kërcimit, rrotullimin, përkuljen ose dorën për të përshëndetur. Ndërto vallëzimin dhe shtyp trekëndëshin. Përsërit grupin për një program të shkurtër!',
 dancelook:'Shiko robotin dhe figurat që ndizen. Kopjo radhën e lëvizjeve. Miqtë e tu janë në publik!',
 race:'Ndërto programin me shigjeta. Roboti mik ndjek rrugën e tij. Më pak komanda të bëjnë më të shpejtë. Gabimet nuk humbin yje. Provo përsëri!',
 raceif:'Kur ura është e lirë, kalo nga ajo. Kur është e prishur, merr rrugën tjetër. Provo të dyja pistat me të njëjtin program!',
 champion:'Bravo! Përfundove tre raundet e kampionatit. Medaljet dhe kupa të presin në dhomën e lojës. Çdo provë të mëson diçka të re!',
 schoolrepeat:'Mirë se erdhe në shkollë! Shto një shigjetë, zgjidh sa herë përsëritet dhe prek përsëritjen. Pastaj shtyp trekëndëshin. Një komandë mund të bëjë shumë hapa!',
 schoolquiz:'Shiko figurat dhe programin. Numëro hapat ose gjej vendin ku përfundon roboti. Prek përgjigjen. Mund të provosh përsëri!',
 schooldebug:'Roboti vepron gabim. Shiko provën me butonin e syve. Prek komandën që duhet ndrequr, pastaj shigjetën e re. Provo ndreqjen!',
 debuglook:'E pe ku shkoi roboti? Një komandë është ndryshe. Preke dhe zëvendësoje. Faleminderit që më ndreq!',
 schoolif:'Roboti shikon urën djathtas. Kur ura është e hapur, zgjidh rrugën me shenjën e saktë. Kur ura është e prishur, zgjidh rrugën tjetër. Shto hapat pas bashkimit dhe provo të dyja rrugët!',
 graduation:'Bravo! Roboti yt u diplomua! Mësove përsëritjen, logjikën, ndreqjen e gabimeve dhe kushtet. Sot mësuam diçka të re së bashku!',
 budget:'Numëro yjet në figurë. Shiko sa yje kushton një produkt. Sa produkte mund të blesh? Prek numrin.',
 shopping:'Shiko produktin dhe zgjidh raftin e tij: perime, fruta, pije, brumëra ose bulmet. Pastaj prek kontrollin.',
 recipe:'Ndërto recetën me figura. Prek hapat në radhën e duhur, pastaj shtyp trekëndëshin. Mund të provosh përsëri!',
 cooking:'Shiko raftet. Nëse mungojnë përbërësit, shko te dyqani. Rendit recetën, zgjidh një mik dhe shtyp trekëndëshin për të gatuar!',
 shop:'Gjithçka blihet vetëm me yje. Zgjidh ushqime, dekor ose aksesorë. Prek shenjën plus për të blerë. Ushqimet shkojnë në raftin e kuzhinës.',
 decor:'Zgjidh një dekor nga inventari, pastaj prek një vend të lirë. Mund edhe ta tërheqësh. Prek aksesorin për t’ia veshur robotit!',
 rescue:'Shpëto mikun! Prek shigjetat për të ndërtuar rrugën. Shmang gurët dhe pemët. Shtyp trekëndëshin që roboti të ecë.',
 bridge:'Uji nuk kalohet pa urë. Prek dërrasën për ta ndërtuar urën, pastaj shigjetën djathtas. Përsërite dhe shpëto mikun!',
 water:'Çoje robotin te lulja. Prek shigjetën e përkuljes, pastaj pikën e ujit. Ujiti të gjitha lulet!',
 gardenpattern:'Shiko lulet sipër, nga e majta në të djathtë. Mbill të njëjtat lule në të njëjtën radhë. Pastaj prek shenjën e kontrollit.',
 garden:'Kopshti yt po çel! Prek një lule dhe pastaj një vend të lirë për ta zhvendosur. Lulet e tua ruhen.',
 album:'Këta janë miqtë që shpëtove. Prek një kafshë për ta dëgjuar dhe për ta parë të vallëzojë!',
 hello:'Përshëndetje! Faleminderit që më ndërtove!',
 bravo:'Bravo! Një hap i ri për robotin!',again:'Provo përsëri! Je shumë afër.',
 hint:'Shiko figurën sipër. Provo me kujdes. Yjet e tu janë të sigurt.',
 shapes:'Gjej formën e njëjtë me figurën sipër.',count:'Numëro figurat sipër. Prek numrin e saktë.',
 predict:'Roboti ka vetëm një rrotë. A qëndron në ekuilibër? Zgjidh dhe shiko provën.',
 colors:'Gjej ngjyrën e njëjtë me figurën sipër.',pattern:'Shiko radhën e ngjyrave. Cila ngjyrë vjen më pas?',
 arrows:'Vendos shigjetat për te shtëpia. Shmang gurët. Shtyp butonin me trekëndësh për të ecur.',
 world:'Bravo! Roboti yt e ka një shtëpi. Hape hartën dhe eksploro botën!',
 privacy:'Për robotin zgjidh një emër imagjinar. Mos përdor emrin tënd të vërtetë.',
};
const voices=[{name:'I qetë',pitch:43,range:35,rate:142},{name:'I gëzuar',pitch:66,range:65,rate:156},{name:'Robotik',pitch:30,range:12,rate:137},{name:'I butë',pitch:57,range:40,rate:130}];
const m=await load(),engine=new m.eSpeakNGWorker();
if(engine.set_voice('sq','sq')!==0)throw Error('Albanian voice unavailable');
await mkdir('public/sounds/robot-world',{recursive:true});
for(const [index,voice] of voices.entries()){
 engine.set_pitch(voice.pitch);engine.set_range(voice.range);engine.set_rate(voice.rate);engine.set_volume(90);
 for(const [id,text] of Object.entries(phrases)){
  const chunks=[];engine.synthesize(text,samples=>{if(samples.length)chunks.push(Int16Array.from(samples));});
  const total=chunks.reduce((n,a)=>n+a.length,0);if(total<10000)throw Error('Speech is empty: '+id);
  const wave=Buffer.alloc(44+total*2);wave.write('RIFF');wave.writeUInt32LE(wave.length-8,4);wave.write('WAVEfmt ',8);wave.writeUInt32LE(16,16);wave.writeUInt16LE(1,20);wave.writeUInt16LE(1,22);wave.writeUInt32LE(22050,24);wave.writeUInt32LE(44100,28);wave.writeUInt16LE(2,32);wave.writeUInt16LE(16,34);wave.write('data',36);wave.writeUInt32LE(total*2,40);let offset=44;for(const chunk of chunks)for(const sample of chunk){wave.writeInt16LE(sample,offset);offset+=2;}
  await writeFile(`public/sounds/robot-world/v${index}-${id}.wav`,wave);
 }
}
await writeFile('public/sounds/robot-world/manifest.json',JSON.stringify({language:'sq',sampleRate:22050,engine:'eSpeak NG (local build-time synthesis)',voices,phrases},null,2));
// Playful animal calls are local sound design, not recordings of real animals.
const calls={rabbit:[640,840,720],fox:[260,520,310],duck:[290,260,310],pelican:[190,240,180],turtle:[360,480,360],owl:[250,220,250]};
for(const [id,notes] of Object.entries(calls)){
 const rate=22050,total=rate*1.2,wave=Buffer.alloc(44+total*2);wave.write('RIFF');wave.writeUInt32LE(wave.length-8,4);wave.write('WAVEfmt ',8);wave.writeUInt32LE(16,16);wave.writeUInt16LE(1,20);wave.writeUInt16LE(1,22);wave.writeUInt32LE(rate,24);wave.writeUInt32LE(rate*2,28);wave.writeUInt16LE(2,32);wave.writeUInt16LE(16,34);wave.write('data',36);wave.writeUInt32LE(total*2,40);
 for(let i=0;i<total;i++){const t=i/rate,n=Math.min(2,Math.floor(t/.4)),local=t-n*.4,envelope=Math.sin(Math.PI*Math.min(1,local/.32))**2*(local<.32?1:0),f=notes[n]+Math.sin(t*25)*12,sample=(Math.sin(2*Math.PI*f*t)+.25*Math.sin(2*Math.PI*f*2*t))*envelope*.35;wave.writeInt16LE(Math.round(sample*32767),44+i*2);}await writeFile(`public/sounds/robot-world/animal-${id}.wav`,wave);
}
console.log(`${voices.length} local Albanian voice profiles, ${voices.length*Object.keys(phrases).length} prerecorded WAV files generated.`);
// A gentle original loop, synthesized at build time from local oscillators.
const musicRate=22050,beatLength=60/140,musicSamples=Math.round(musicRate*beatLength*32),music=Buffer.alloc(44+musicSamples*2);
music.write('RIFF');music.writeUInt32LE(music.length-8,4);music.write('WAVEfmt ',8);music.writeUInt32LE(16,16);music.writeUInt16LE(1,20);music.writeUInt16LE(1,22);music.writeUInt32LE(musicRate,24);music.writeUInt32LE(musicRate*2,28);music.writeUInt16LE(2,32);music.writeUInt16LE(16,34);music.write('data',36);music.writeUInt32LE(musicSamples*2,40);
const melody=[523.25,659.25,783.99,659.25,587.33,698.46,880,698.46];
for(let n=0;n<musicSamples;n++){const t=n/musicRate,beat=Math.floor(t/beatLength),local=t%beatLength,f=melody[beat%8],tone=Math.sin(2*Math.PI*f*local)*Math.exp(-local*8)*.16,bass=Math.sin(2*Math.PI*(beat%8<4?130.81:146.83)*local)*Math.exp(-local*7)*.12,drum=Math.sin(2*Math.PI*85*local)*Math.exp(-local*30)*.15;music.writeInt16LE(Math.round((tone+bass+drum)*32767),44+n*2);}await writeFile('public/sounds/robot-world/dance-music.wav',music);
