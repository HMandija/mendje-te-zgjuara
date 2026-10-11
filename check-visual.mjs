import assert from 'node:assert/strict';
import {visualPuzzles} from './lib/visual-puzzles.mjs';
import {assess,accepts} from './lib/puzzle-engine.mjs';
import {publicPuzzle} from './lib/security-policy.mjs';
import {gamesForGrade} from './lib/game-catalog.mjs';
const games=visualPuzzles();assert.equal(games.length,480);assert.equal(new Set(games.map(p=>p.id)).size,480);
const value=s=>{const parts=s.split(' ');let n=Number(parts[0]);for(let i=1;i<parts.length;i+=2){const b=Number(parts[i+1]);n=parts[i]==='+'?n+b:parts[i]==='−'?n-b:parts[i]==='×'?n*b:n/b;}return n;};
for(const grade of [1,2,3,4])for(const scene of ['shadows','garden','wheels','memory','patterns','path']){
 const levels=games.filter(p=>p.grade===grade&&p.interaction.scene===scene);assert.deepEqual(levels.map(p=>p.gameLevel),Array.from({length:20},(_,i)=>i+1));
 assert(levels.at(-1).interaction.targets.length>=levels[0].interaction.targets.length);
 assert.equal(new Set(levels.map(p=>JSON.stringify(p.interaction))).size,20);
 assert(levels.every(p=>p.title.startsWith(gamesForGrade(grade).find(g=>g.scene===scene).title)));
}
for(const p of games){
 assert.deepEqual(assess(p,p.answer),{correct:true,score:1,explain:p.explain},p.id);
 const a=JSON.parse(p.answer),tokens=p.interaction.tokens;
 const wrong=tokens.find(t=>!p.interaction.matchBy?t.id!==a[0]:p.interaction.matchBy.some(k=>(t[k]||0)!==(tokens.find(t=>t.id===a[0])[k]||0)));
 if(wrong){const other=[wrong.id,...a.slice(1).filter(id=>id!==wrong.id)];for(const t of tokens)if(other.length<a.length&&!other.includes(t.id))other.push(t.id);assert(!assess(p,JSON.stringify(other)).correct,p.id);}
 assert(!accepts(p,JSON.stringify(a.map(()=>a[0])))||a.length===1);
 assert(!accepts(p,JSON.stringify(['forged',...a.slice(1)])));assert(!accepts(p,'[]'));assert(!accepts(p,'malformed'));
 const safe=publicPuzzle(p);for(const key of ['answer','hint','explain'])assert(!(key in safe));assert.equal(safe.gameLevel,p.gameLevel);
 if(p.interaction.scene==='garden'||p.interaction.scene==='wheels')a.forEach((id,i)=>{const t=tokens.find(t=>t.id===id);assert.equal(value(p.interaction.targets[i].label),p.interaction.scene==='garden'?t.quantity:['a','b','c','d'].indexOf(id)+1);assert(!p.interaction.targets[i].label.includes('-'));});
 if(p.interaction.scene==='memory')assert.deepEqual(p.interaction.preview.map(t=>t.id),a);
 if(p.interaction.scene==='shadows')a.forEach((id,i)=>{const t=tokens.find(t=>t.id===id),s=p.interaction.targets[i];assert.equal(t.asset,s.cue);assert.equal(t.rotation,s.rotation);});
 if(p.interaction.scene==='patterns'){
  const sequence=[...p.interaction.preview,...a.map(id=>tokens.find(t=>t.id===id))];
  if(p.grade<=2){const cycle=p.grade===1?2:p.gameLevel<11?3:4;sequence.forEach((t,i)=>assert.equal(t.asset,sequence[i%cycle].asset));}
  else{const deltas=sequence.slice(1).map((t,i)=>t.quantity-sequence[i].quantity);assert(deltas.every((n,i)=>n===deltas[0]+(p.grade===4&&p.gameLevel>=11?i:0)));}
 }
 if(p.interaction.matchBy){const pair=tokens.flatMap((t,i)=>tokens.slice(i+1).filter(other=>p.interaction.matchBy.every(k=>(t[k]||0)===(other[k]||0))).map(other=>[t.id,other.id]))[0];if(pair){const same=a.map(id=>id===pair[0]?pair[1]:id===pair[1]?pair[0]:id);assert(assess(p,JSON.stringify(same)).correct,'Visually identical pieces are interchangeable');}}
}
console.log('Visual curriculum: 480 levels, 20 per game/grade, arithmetic/pattern/silhouette/memory clues, equivalent pieces and safe payloads passed.');
