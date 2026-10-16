export type KitchenPhase='sorting'|'ready'|'cooking'|'served';
export type KitchenGame={level:number;jars:number[][];selected:number|null;history:number[][][];moves:number;phase:KitchenPhase;message:string};
export const KITCHEN_FOODS=[{name:'Bizele',color:'#79aa52',icon:'🟢'},{name:'Domate',color:'#d46b4d',icon:'🍅'},{name:'Djathë',color:'#f0c869',icon:'🧀'}];
export const KITCHEN_LEVELS=[{name:'Supa e parë',capacity:3,jars:[[0,1,0],[1,0,1],[],[]]},{name:'Supa me tri ngjyra',capacity:3,jars:[[0,1,2],[2,0,1],[1,2,0],[],[]]},{name:'Receta e kopshtit',capacity:4,jars:[[0,1,2,0],[1,2,0,1],[2,0,1,2],[],[]]}];
export function kitchenSolved(jars:number[][],capacity:number){return jars.every(jar=>!jar.length||jar.length===capacity&&jar.every(food=>food===jar[0]));}
export function initialKitchen(level=0):KitchenGame{const n=Math.max(0,Math.min(KITCHEN_LEVELS.length-1,level));return {level:n,jars:KITCHEN_LEVELS[n].jars.map(j=>[...j]),selected:null,history:[],moves:0,phase:'sorting',message:'Prek një enë, pastaj një enë tjetër. Bashko përbërësit e njëjtë.'};}
export function moveKitchen(jars:number[][],from:number,to:number,capacity:number){
 if(from===to||!jars[from]?.length||!jars[to]||jars[to].length>=capacity)return null;
 const source=jars[from],target=jars[to],food=source.at(-1)!;if(target.length&&target.at(-1)!==food)return null;
 let count=1;while(count<source.length&&source[source.length-1-count]===food)count++;
 count=Math.min(count,capacity-target.length);const next=jars.map(j=>[...j]);next[from].splice(-count);next[to].push(...Array<number>(count).fill(food));return next;
}
export function selectKitchen(state:KitchenGame,jar:number):KitchenGame{
 if(state.phase!=='sorting'||jar<0||jar>=state.jars.length)return state;
 if(state.selected===null)return state.jars[jar].length?{...state,selected:jar,message:'Tani prek enën ku dëshiron ta hedhësh.'}:{...state,message:'Zgjidh fillimisht një enë me përbërës.'};
 if(state.selected===jar)return {...state,selected:null,message:'Zgjedhja u hoq. Mund të provosh një enë tjetër.'};
 const next=moveKitchen(state.jars,state.selected,jar,KITCHEN_LEVELS[state.level].capacity);
 if(!next)return {...state,selected:null,message:'Provo një enë bosh ose me të njëjtin përbërës sipër. Yjet janë të sigurt.'};
 const solved=kitchenSolved(next,KITCHEN_LEVELS[state.level].capacity);return {...state,jars:next,selected:null,history:[...state.history,state.jars.map(j=>[...j])],moves:state.moves+1,phase:solved?'ready':'sorting',message:solved?'Bravo! Përbërësit janë gati. Tani le të gatuajmë supën.':'Bukur! Vazhdo të bashkosh përbërësit e njëjtë.'};
}
export function undoKitchen(state:KitchenGame):KitchenGame{if(!state.history.length||state.phase==='cooking'||state.phase==='served')return state;return {...state,jars:state.history.at(-1)!.map(j=>[...j]),history:state.history.slice(0,-1),selected:null,moves:Math.max(0,state.moves-1),phase:'sorting',message:'U kthyem një hap pas. Provo një zgjidhje tjetër.'};}
