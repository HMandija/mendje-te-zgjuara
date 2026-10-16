import type {WorldChallenge,WorldState} from './robot-world';
export type Category='vegetable'|'fruit'|'drink'|'dough'|'dairy';
export const CATEGORIES:Record<Category,{name:string;icon:string}>={vegetable:{name:'Perime',icon:'🥕'},fruit:{name:'Fruta',icon:'🍎'},drink:{name:'Pije',icon:'🥤'},dough:{name:'Brumëra',icon:'🌾'},dairy:{name:'Bulmet',icon:'🥛'}};
export type ShopItem={id:string;name:string;icon:string;price:number;kind:'food'|'decor'|'accessory';category?:Category;rooms?:('bedroom'|'garden')[];slot?:'head'|'eyes'|'neck'|'back'};
export const SHOP:ShopItem[]=[
 {id:'carrot',name:'Karrota',icon:'🥕',price:1,kind:'food',category:'vegetable'},
 {id:'tomato',name:'Domatja',icon:'🍅',price:1,kind:'food',category:'vegetable'},
 {id:'apple',name:'Molla',icon:'🍎',price:1,kind:'food',category:'fruit'},
 {id:'water',name:'Uji',icon:'💧',price:1,kind:'food',category:'drink'},
 {id:'flour',name:'Mielli',icon:'🌾',price:2,kind:'food',category:'dough'},
 {id:'cheese',name:'Djathi',icon:'🧀',price:3,kind:'food',category:'dairy'},
 {id:'potato',name:'Patatja',icon:'🥔',price:2,kind:'food',category:'vegetable'},
 {id:'onion',name:'Qepa',icon:'🧅',price:1,kind:'food',category:'vegetable'},
 {id:'rug',name:'Tapeti',icon:'🟪',price:2,kind:'decor',rooms:['bedroom']},
 {id:'poster',name:'Posteri',icon:'🖼',price:3,kind:'decor',rooms:['bedroom']},
 {id:'plant',name:'Bima',icon:'🪴',price:3,kind:'decor',rooms:['bedroom','garden']},
 {id:'lamp',name:'Llamba',icon:'💡',price:4,kind:'decor',rooms:['bedroom','garden']},
 {id:'tree',name:'Pema',icon:'🌳',price:6,kind:'decor',rooms:['garden']},
 {id:'fence',name:'Gardhi',icon:'🪵',price:5,kind:'decor',rooms:['garden']},
 {id:'pet',name:'Macja lodër',icon:'🐱',price:10,kind:'decor',rooms:['bedroom','garden']},
 {id:'hat',name:'Kapela',icon:'🎩',price:5,kind:'accessory',slot:'head'},
 {id:'glasses',name:'Syzet',icon:'👓',price:7,kind:'accessory',slot:'eyes'},
 {id:'scarf',name:'Shalli',icon:'🧣',price:8,kind:'accessory',slot:'neck'},
 {id:'wings',name:'Krahët me yje',icon:'🪽',price:15,kind:'accessory',slot:'back'},
];
export type Placement={item:string;room:'bedroom'|'garden';cell:number};
export type Commerce={spent:number;bonus:number;pantry:Record<string,number>;owned:string[];placed:Placement[];equipped:Record<string,string>;meals:number;cooked:string[]};
export const initialCommerce=():Commerce=>({spent:0,bonus:0,pantry:{},owned:[],placed:[],equipped:{},meals:0,cooked:[]});
export const C_STAGES=['Lista e blerjes','Raftet e dyqanit','Receta me hapa','Dreka e miqve'];
export type Recipe={id:string;name:string;icon:string;ingredients:Record<string,number>;steps:{id:string;icon:string;name:string}[]};
export const RECIPES:Recipe[]=[
 {id:'byrek',name:'Byrek',icon:'🥧',ingredients:{flour:1,cheese:1,water:1},steps:[{id:'mix',icon:'🥣',name:'Përziej brumin'},{id:'fill',icon:'🧀',name:'Shto mbushjen'},{id:'bake',icon:'🔥',name:'Piq byrekun'}]},
 {id:'qofte',name:'Qofte me perime',icon:'🧆',ingredients:{potato:1,carrot:1,onion:1},steps:[{id:'mix',icon:'🥣',name:'Përziej perimet'},{id:'shape',icon:'🟠',name:'Formo qoftet'},{id:'bake',icon:'🔥',name:'Piq qoftet'}]},
 {id:'salad',name:'Sallatë',icon:'🥗',ingredients:{tomato:1,carrot:1,apple:1},steps:[{id:'wash',icon:'💧',name:'Laj përbërësit'},{id:'cut',icon:'🔪',name:'Prit përbërësit'},{id:'serve',icon:'🍽',name:'Vendos tryezën'}]},
];
export type MarketMission={budget?:number;unit?:number;items?:string[];recipe?:Recipe};
export type CommerceCommand={id:string;action:'cook-meal';challenge:string;value:string}|{id:string;action:'buy';item:string;quantity:number}|{id:string;action:'place';item:string;room:'bedroom'|'garden';cell:number}|{id:string;action:'unplace'|'equip'|'unequip';item:string};
export class CommerceError extends Error{}
export function balance(state:WorldState){return Object.values(state.progress).reduce((sum,p)=>sum+p.stars,0)+state.commerce.bonus-state.commerce.spent;}
export function phaseCChallenges(grade:number):WorldChallenge[]{
 const items:WorldChallenge[]=[];for(let stage=0;stage<4;stage++)for(let round=0;round<3;round++){
  const base={id:`market-${stage+1}-${round+1}`,theme:4 as const,stage,round,target:0,options:[],visual:'',efficient:1};
  if(stage===0){const unit=round+1,budget=(grade>=3?[8,11,14]:[3,5,7])[round],target=Math.floor(budget/unit);items.push({...base,kind:'budget',title:'Sa produkte mund të blesh?',icon:'★',target,options:[target,target+1,Math.max(0,target-1),target+2],market:{budget,unit,items:[['carrot','flour','cheese'][round]]}});}
  else if(stage===1){const ids=(grade>=3?[['carrot','apple','flour','cheese'],['water','onion','apple','flour','tomato'],['potato','cheese','water','apple','carrot']]:[['carrot','apple','flour'],['water','onion','cheese'],['potato','cheese','apple','tomato']])[round];items.push({...base,kind:'sort',title:'Gjej raftin për çdo produkt',icon:'🧺',efficient:ids.length,market:{items:ids}});}
  else{const recipe=structuredClone(RECIPES[round]);if(grade>=3)recipe.steps=[{id:'collect',icon:'🧺',name:'Mblidh përbërësit'},...recipe.steps,{id:'invite',icon:'🐾',name:'Fto mikun në tryezë'}];items.push({...base,kind:stage===2?'recipe':'cook',title:stage===2?'Rendit hapat e recetës':'Gatuaj dhe fto një mik',icon:recipe.icon,efficient:recipe.steps.length,market:{recipe}});}
 }return items;
}
export function marketSolution(c:WorldChallenge){if(c.kind==='budget')return String(c.target);if(c.kind==='sort')return c.market!.items!.map(id=>SHOP.find(i=>i.id===id)!.category).join(',');return c.market!.recipe!.steps.map(s=>s.id).join(',');}
export function missingIngredients(state:WorldState,recipe:Recipe){return Object.entries(recipe.ingredients).filter(([id,count])=>(state.commerce.pantry[id]||0)<count);}
export function evaluatePhaseC(state:WorldState,c:WorldChallenge,value:string){const [steps,guest]=value.split('|');if(value.split('|').length>(c.kind==='cook'?2:1))return {correct:false,steps:0};const validGuest=c.kind!=='cook'||Boolean(guest&&state.animals.includes(guest as WorldState['animals'][number]));return {correct:steps===marketSolution(c)&&validGuest&&(c.kind!=='cook'||Boolean(state.progress[c.id]?.stars)||missingIngredients(state,c.market!.recipe!).length===0),steps:c.kind==='budget'?1:steps.split(',').length};}
export function phaseCSuccess(state:WorldState,c:WorldChallenge){if(c.kind!=='cook')return;for(const [id,count] of Object.entries(c.market!.recipe!.ingredients))state.commerce.pantry[id]-=count;state.commerce.meals++;if(!state.commerce.cooked.includes(c.id)){state.commerce.cooked.push(c.id);state.commerce.bonus+=2;}}
export function applyCommerce(state:WorldState,command:CommerceCommand,grade:number){
 if(command.action==='cook-meal'){const c=phaseCChallenges(grade).find(c=>c.id===command.challenge&&c.kind==='cook');if(!c||!state.progress[c.id]?.stars||missingIngredients(state,c.market!.recipe!).length||!evaluatePhaseC(state,c,command.value).correct)throw new CommerceError('Mbush raftet dhe rendit recetën për të gatuar sërish.');phaseCSuccess(state,c);return 'Dreka është gati! Përbërësit u përdorën; bonusin e ke fituar.';}
 const c=state.commerce,item=SHOP.find(i=>i.id===command.item);if(!item)throw new CommerceError('Ky produkt nuk gjendet.');
 if(command.action==='buy'){
  const quantity=command.quantity;if(!Number.isInteger(quantity)||quantity<1||quantity>5||item.kind!=='food'&&quantity!==1)throw new CommerceError('Zgjidh sasinë e lejuar.');
  if(item.kind==='food'&&(c.pantry[item.id]||0)+quantity>20)throw new CommerceError('Rafti është plot. Gatuaj diçka së pari.');
  if(item.kind!=='food'&&c.owned.includes(item.id))throw new CommerceError('Këtë e ke tashmë.');
  if(balance(state)<item.price*quantity)throw new CommerceError('Mblidh edhe disa yje. Yjet e tu janë të sigurt.');
  c.spent+=item.price*quantity;if(item.kind==='food')c.pantry[item.id]=(c.pantry[item.id]||0)+quantity;else c.owned.push(item.id);return 'Blerja u ruajt.';
 }
 if(!c.owned.includes(item.id))throw new CommerceError('Bli këtë objekt në dyqan së pari.');
 if(command.action==='place'){
  if(item.kind!=='decor'||!item.rooms?.includes(command.room)||!Number.isInteger(command.cell)||command.cell<0||command.cell>35)throw new CommerceError('Zgjidh një vend të përshtatshëm.');
  if(c.placed.some(p=>p.item!==item.id&&p.room===command.room&&p.cell===command.cell)||command.room==='garden'&&state.garden.plots.some(f=>f.cell===command.cell))throw new CommerceError('Zgjidh një vend të lirë.');
  c.placed=c.placed.filter(p=>p.item!==item.id);c.placed.push({item:item.id,room:command.room,cell:command.cell});return 'Dekori u vendos.';
 }
 if(command.action==='unplace'){c.placed=c.placed.filter(p=>p.item!==item.id);return 'Dekori është në inventar.';}
 if(item.kind!=='accessory'||!item.slot)throw new CommerceError('Zgjidh një aksesor të robotit.');
 if(command.action==='equip')c.equipped[item.slot]=item.id;else if(c.equipped[item.slot]===item.id)delete c.equipped[item.slot];return 'Roboti është gati!';
}
