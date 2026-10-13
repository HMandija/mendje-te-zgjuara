// Offline rerolls change the actual corridor, maze or tile entrances. Metadata
// changes, answer IDs, tray permutations and lesson names cannot resolve a clash.
import {writeFile} from 'node:fs/promises';
import {curriculumLessons} from '../lib/curriculum-catalog.mjs';
import {curriculumPuzzle} from '../lib/expanded-curriculum.mjs';
import {catalogSeed} from '../lib/catalog-seed.mjs';
import {visualPuzzles} from '../lib/visual-puzzles.mjs';
import {interactivePuzzles} from '../lib/interactive-puzzles.mjs';
import {scenarioSeeds} from '../lib/scenario-seeds.mjs';
import {challengeFingerprint} from '../lib/curriculum-fingerprint.mjs';
const all=()=>[...[1,2,3,4].flatMap(g=>curriculumLessons(g).flatMap(l=>Array.from({length:30},(_,i)=>curriculumPuzzle(l.id,i+1)))),...catalogSeed()];
function regenerate(p){
 if(p.lessonId&&['robot','pipes','maze'].includes(p.type))return curriculumPuzzle(p.lessonId,p.lessonLevel);
 if(p.id.startsWith('original-play-')&&p.interaction.scene==='path')return visualPuzzles().find(q=>q.id===p.id);
 if(p.id.startsWith('original-interactive-')&&p.type==='maze')return interactivePuzzles().find(q=>q.id===p.id);
 throw Error('Non-board content requires an authored fix: '+p.id);
}
let resolved=false;
for(let pass=0;pass<8;pass++){
 const seen=new Set();let changes=0;
 for(let p of all()){
  let key=challengeFingerprint(p),tries=0;
  while(seen.has(key)){
   if(++tries>200)throw Error('Finite board space exhausted: '+p.id);
   scenarioSeeds[p.id]=(scenarioSeeds[p.id]||0)+1;p=regenerate(p);key=challengeFingerprint(p);changes++;
  }
  seen.add(key);
 }
 console.log(`Pass ${pass+1}: ${changes} real board rerolls; ${seen.size} distinct challenges.`);
 if(!changes){resolved=true;break;}
}
if(!resolved)throw Error('Rerolls did not stabilize');
const seeds=Object.fromEntries(Object.entries(scenarioSeeds).sort(([a],[b])=>a.localeCompare(b)));
await writeFile(new URL('../lib/scenario-seeds.mjs',import.meta.url),'// SERVER ONLY: verified layout rerolls; all question identities remain stable.\nexport const scenarioSeeds='+JSON.stringify(seeds,null,2)+';\nexport const scenarioSeed=id=>scenarioSeeds[id]||0;\n');
console.log(`${Object.keys(seeds).length} deterministic board rerolls stored; no visible or semantic duplicates.`);
