import assert from 'node:assert/strict';
import {loadRobotRules} from './scripts/load-robot-world-rules.mjs';
const r=await loadRobotRules(),command=(action,data={})=>({id:crypto.randomUUID(),action,...data}),apply=(state,c,grade)=>r.applyWorld(state,c,grade);
for(let grade=1;grade<=4;grade++){
 let state=r.initialWorld();assert.throws(()=>apply(state,command('buy',{item:'carrot',quantity:1}),grade));
 const list=r.allWorldChallenges(grade).slice(0,48);assert.equal(list.length,48);
 for(const c of list.slice(0,36))state=apply(state,command('answer',{challenge:c.id,value:c.mission?.pattern?.join(',')||c.path?.join(',')||String(c.target)}),grade).state;
 for(const c of list.slice(36,48)){
  const before=r.worldStars(state),value=r.marketSolution(c)+(c.kind==='cook'?'|rabbit':'');
  const wrong=apply(state,command('answer',{challenge:c.id,value:'bad'}),grade);assert.equal(wrong.correct,false);assert.equal(r.worldStars(wrong.state),before);assert.deepEqual(wrong.state.commerce.pantry,state.commerce.pantry);
  if(c.kind==='cook'){
   assert.equal(apply(state,command('answer',{challenge:c.id,value}),grade).correct,false);
   for(const [item,quantity] of Object.entries(c.market.recipe.ingredients))state=apply(state,command('buy',{item,quantity}),grade).state;
   assert.equal(apply(state,command('answer',{challenge:c.id,value:r.marketSolution(c)+'|not-a-rescued-animal'}),grade).correct,false);
  }
  const result=apply(state,command('answer',{challenge:c.id,value}),grade);assert(result.correct,`${grade} ${c.id}`);assert.equal(result.earned,c.kind==='cook'?5:3);state=result.state;
  const replay=apply(state,command('answer',{challenge:c.id,value}),grade);assert.equal(replay.earned,0);assert.deepEqual(replay.state.commerce,state.commerce);
 }
 assert.equal(r.unlockedWorld(state),48);assert.equal(r.completedWorld(state),48);assert.equal(state.commerce.meals,3);assert.equal(state.commerce.bonus,6);assert.equal(state.commerce.cooked.length,3);
 const cook=list[45];for(const [item,quantity] of Object.entries(cook.market.recipe.ingredients))state=apply(state,command('buy',{item,quantity}),grade).state;
 const meal=command('cook-meal',{challenge:cook.id,value:r.marketSolution(cook)+'|rabbit'}),mealBalance=r.worldStars(state);state=apply(state,meal,grade).state;assert.equal(state.commerce.meals,4);assert.equal(state.commerce.bonus,6);assert.equal(r.worldStars(state),mealBalance);assert.throws(()=>apply(state,{...meal,id:crypto.randomUUID()},grade));
 const before=r.worldStars(state);state=apply(state,command('buy',{item:'carrot',quantity:5}),grade).state;assert.equal(r.worldStars(state),before-5);assert.equal(state.commerce.pantry.carrot,5);
 assert.throws(()=>apply(state,command('buy',{item:'unknown',quantity:1}),grade));assert.throws(()=>apply(state,command('buy',{item:'carrot',quantity:-1}),grade));assert.throws(()=>apply(state,command('equip',{item:'hat'}),grade));
 for(const item of ['rug','tree','hat','glasses','scarf','wings'])state=apply(state,command('buy',{item,quantity:1}),grade).state;
 const saved=structuredClone(state);assert.throws(()=>apply(state,command('buy',{item:'hat',quantity:1}),grade));assert.deepEqual(state,saved);
 state=apply(state,command('place',{item:'rug',room:'bedroom',cell:0}),grade).state;
 assert.throws(()=>apply(state,command('place',{item:'rug',room:'garden',cell:0}),grade));
 assert.throws(()=>apply(state,command('place',{item:'tree',room:'garden',cell:state.garden.plots[0].cell}),grade));
 const free=Array.from({length:36},(_,n)=>n).find(n=>!state.garden.plots.some(f=>f.cell===n));state=apply(state,command('place',{item:'tree',room:'garden',cell:free}),grade).state;
 assert.throws(()=>apply(state,command('garden-move',{flower:state.garden.plots[0].id,cell:free}),grade));
 state=apply(state,command('equip',{item:'hat'}),grade).state;assert.equal(state.commerce.equipped.head,'hat');
 const balance=r.worldStars(state);state=apply(state,command('unequip',{item:'hat'}),grade).state;state=apply(state,command('unplace',{item:'rug'}),grade).state;assert.equal(r.worldStars(state),balance);assert(state.commerce.owned.includes('rug'));
 const poor={...state,commerce:{...state.commerce,spent:state.commerce.spent+r.worldStars(state)}};assert.equal(r.worldStars(poor),0);assert.throws(()=>apply(poor,command('buy',{item:'water',quantity:1}),grade));
 const full={...state,commerce:{...state.commerce,pantry:{...state.commerce.pantry,carrot:20}}};assert.throws(()=>apply(full,command('buy',{item:'carrot',quantity:1}),grade));
}
for(const data of [{action:'buy',item:'carrot',quantity:1,price:0},{action:'buy',item:'carrot',quantity:1.5},{action:'place',item:'rug',room:'bedroom',cell:36}])assert.equal(r.worldCommandSchema.safeParse({id:crypto.randomUUID(),...data}).success,false);
const old=r.initialWorld();delete old.commerce;assert.deepEqual(r.normalizeWorld(old).commerce,r.initialCommerce());
console.log('Phase C: 48 new grade-specific challenges solved; authoritative prices, stock/spending, cooking ingredients and guests, single bonus, replay safety, owned decor/accessories, placements, collisions, old progress upgrades and forged input guards passed.');
