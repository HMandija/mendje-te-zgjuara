import type {WorldChallenge,WorldState} from './robot-world';

export type AnimalId='rabbit'|'fox'|'duck'|'pelican'|'turtle'|'owl';
export const ANIMALS:Record<AnimalId,{name:string;icon:string;color:string}>={rabbit:{name:'Lepurushi',icon:'🐰',color:'#d7c2eb'},fox:{name:'Dhelpra',icon:'🦊',color:'#e9a16b'},duck:{name:'Rosa',icon:'🦆',color:'#efd76d'},pelican:{name:'Pelikani',icon:'🐦',color:'#dae5e8'},turtle:{name:'Breshka',icon:'🐢',color:'#84b59a'},owl:{name:'Bufi',icon:'🦉',color:'#b39a83'}};
export const B_STAGES={2:['Rruga e shkurtër','Pengesa në pyll','Ura e liqenit','Albumi i kafshëve'],3:['Ujit lulen','Rreshti i luleve','Mbjellja me ritëm','Kopshti në lulëzim']};
export type Flower={id:string;cell:number;color:number;growth:number};
export type Garden={plots:Flower[];visits:number;growth:number};
export type Mission={animal?:AnimalId;water?:number[];flowers?:{cell:number;color:number}[];pattern?:number[];requiredCondition?:boolean};
export type MissionFrame={position:number;bridges:number[];watered:number[];event:'start'|'move'|'build'|'bend'|'water'|'bump';condition?:boolean};
export type MissionTrace={correct:boolean;frames:MissionFrame[];bumped:boolean;steps:number;commands:number;conditionUsed:boolean};
const BASIC=/^[UDLRBKW]$/;
const CONDITIONAL=/^IF([UDLR]):([UDLRBKW]):([UDLRBKW])$/;
export function missionTokens(value:string):string[]|null{
 if(value.length>1500)return null;const result:string[]=[];
 for(const token of value.split(',').filter(Boolean)){
  const group=/^\[([^\[\]]+)\]x([2-9])$/.exec(token),repeated=/^(.+)x([2-9])$/.exec(token);
  const sequence=group?group[1].split('.'):repeated?[repeated[1]]:[token],count=Number(group?.[2]||repeated?.[2]||1);
  if(sequence.length>8||!sequence.every(t=>BASIC.test(t)||CONDITIONAL.test(t)))return null;
  for(let n=0;n<count;n++)result.push(...sequence);if(result.length>120)return null;
 }
 return result;
}
export function phaseBChallenges(grade:number):WorldChallenge[]{
 const items:WorldChallenge[]=[],advanced=grade>=3;
 for(let stage=0;stage<4;stage++)for(let round=0;round<3;round++){
  let size=advanced?6:5,path:string[],blocked:number[]=[],mission:Mission={};const kind:WorldChallenge['kind']='route';
  if(stage===2){const count=Math.min(6,(grade===4?5:advanced?4:2)+round);size=count+2;const lane=1+round%3,start=lane*size,water=Array.from({length:count},(_,n)=>start+n+1);mission={animal:round===0?'duck':round===1?'pelican':'duck',water,requiredCondition:grade===4&&round===2};path=mission.requiredCondition?Array.from({length:count*2+1},()=> 'IFR:R:B'):[...Array.from({length:count},()=>['B','R']).flat(),'R'];blocked=Array.from({length:size*size},(_,n)=>n).filter(n=>Math.floor(n/size)!==lane);items.push({id:`rescue-3-${round+1}`,theme:2,stage,round,kind:'bridge',title:'Ndërto urën dhe shpëto mikun',icon:'🌉',target:start+count+1,options:[],visual:'',size,start,goal:start+count+1,path,blocked,efficient:2,mission});continue;}
  if(stage===0)path=advanced?[['R','R','R','D','D','R'],['D','D','D','R','R','D','R'],['R','R','R','R','D','D','D','L']][round]:[['R','R','D'],['D','D','R','R'],['R','R','R','D','D']][round];
  else if(stage===1){path=advanced?[['R','R','R','D','D','L','D'],['D','D','D','R','R','R','D'],['R','R','R','R','D','D','D','L','L']][round]:[['R','R','D','D'],['D','D','R','R','R','D'],['R','R','R','D','D','L']][round];blocked=round===1?[1,2,size+1]:[size,size+1,2*size+1];}
  else{path=advanced?[['R','R','D','D','R','R','D'],['D','D','D','R','R','R','R'],['R','R','R','R','D','D','D','D','L']][round]:[['R','D','D','R'],['D','D','R','R','D'],['R','R','R','D','D','D']][round];blocked=round===1?[1,size+1]:[size,size+1];}
  let goal=0;const witness=[0];for(const direction of path){goal+=direction==='R'?1:direction==='L'?-1:direction==='D'?size:-size;witness.push(goal);}blocked=blocked.filter(cell=>!witness.includes(cell));
  mission={animal:stage===0?'rabbit':stage===1?(['fox','turtle','rabbit'] as AnimalId[])[round]:(['fox','turtle','owl'] as AnimalId[])[round]};
  items.push({id:`rescue-${stage+1}-${round+1}`,theme:2,stage,round,kind,title:stage===3?'Shpëto një mik për albumin':stage===1?'Gjej rrugën mes pengesave':'Çoje robotin te lepurushi',icon:ANIMALS[mission.animal!].icon,target:goal,options:[],visual:'',size,start:0,goal,path,blocked,efficient:path.length,mission});
 }
 for(let stage=0;stage<4;stage++)for(let round=0;round<3;round++){
  const id=`garden-${stage+1}-${round+1}`,size=6,start=12;let path:string[]=[],flowers:{cell:number;color:number}[]=[],goal=start,mission:Mission={},efficient=1;const kind:WorldChallenge['kind']='water';
  if(stage===2){const length=(advanced?6:4)+round;const pattern=Array.from({length},(_,n)=>advanced&&round===2?[2,1,4][n%3]:n%2?1:2);items.push({id,theme:3,stage,round,kind:'garden-pattern',title:'Mbille kopshtin me ritëm',icon:'🌻',target:0,options:[2,1,4,3],visual:'',efficient:length,mission:{pattern}});continue;}
  if(stage===0){const distance=round+1;goal=start+distance;flowers=[{cell:goal,color:[2,1,4][round]}];path=[...Array(distance).fill('R'),'K','W'];efficient=distance+2;}
  else if(stage===1){const count=4+round%2;flowers=Array.from({length:count},(_,n)=>({cell:start+n+1,color:n%2?1:2}));path=Array.from({length:count},()=>['R','K','W']).flat();goal=start+count;efficient=1;}
  else{const positions=advanced?[13,14,15,21,20,19,25,26]:[13,14,20,19,25,26];const count=4+round+(advanced?1:0);flowers=positions.slice(0,count).map((cell,n)=>({cell,color:[2,1,4][n%3]}));let pos=start;for(const f of flowers){const dx=f.cell%size-pos%size,dy=Math.floor(f.cell/size)-Math.floor(pos/size);path.push(...Array(Math.abs(dx)).fill(dx>0?'R':'L'),...Array(Math.abs(dy)).fill(dy>0?'D':'U'),'K','W');pos=f.cell;}goal=pos;efficient=Math.max(4,path.length-2);}
  mission={flowers};items.push({id,theme:3,stage,round,kind,title:stage===0?'Ec, përkulu dhe ujit lulen':stage===1?'Ujit rreshtin me përsëritje':'Bëje kopshtin të lulëzojë',icon:'💧',target:goal,options:[],visual:'',size,start,goal,path,blocked:[],efficient,mission});
 }
 return items;
}
export function traceMission(c:WorldChallenge,value:string):MissionTrace{
 const tokens=missionTokens(value),size=c.size||6,frames:MissionFrame[]=[{position:c.start||0,bridges:[],watered:[],event:'start'}];let position=c.start||0,bent=false,bumped=false,conditionUsed=false;const bridges:number[]=[],watered:number[]=[];
 const adjacent=(direction:string)=>{const x=position%size,y=Math.floor(position/size),nx=x+(direction==='R'?1:direction==='L'?-1:0),ny=y+(direction==='D'?1:direction==='U'?-1:0);return nx<0||ny<0||nx>=size||ny>=size?-1:ny*size+nx;};
 const clear=(cell:number)=>cell>=0&&!c.blocked?.includes(cell)&&(!c.mission?.water?.includes(cell)||bridges.includes(cell));
 const frame=(event:MissionFrame['event'],condition?:boolean)=>frames.push({position,bridges:[...bridges],watered:[...watered],event,...(condition!==undefined?{condition}:{})});
 if(!tokens?.length)return {correct:false,frames,bumped:false,steps:0,commands:0,conditionUsed:false};
 for(let token of tokens){const cond=CONDITIONAL.exec(token);let condition:boolean|undefined;if(cond){conditionUsed=true;condition=clear(adjacent(cond[1]));token=condition?cond[2]:cond[3];}
  if('UDLR'.includes(token)){const next=adjacent(token);if(!clear(next)){bumped=true;frame('bump',condition);break;}position=next;bent=false;frame('move',condition);}
  else if(token==='B'){const next=adjacent('R');if(!c.mission?.water?.includes(next)||bridges.includes(next)){bumped=true;frame('bump',condition);break;}bridges.push(next);frame('build',condition);}
  else if(token==='K'){if(!c.mission?.flowers?.some(f=>f.cell===position)){bumped=true;frame('bump',condition);break;}bent=true;frame('bend',condition);}
  else if(token==='W'){if(!bent||!c.mission?.flowers?.some(f=>f.cell===position)){bumped=true;frame('bump',condition);break;}if(!watered.includes(position))watered.push(position);frame('water',condition);}
 }
 const correct=!bumped&&position===c.goal&&(!c.mission?.flowers||c.mission.flowers.every(f=>watered.includes(f.cell)))&&(!c.mission?.water||c.mission.water.every(cell=>bridges.includes(cell)))&&(!c.mission?.requiredCondition||conditionUsed);
 return {correct,frames,bumped,steps:frames.filter(f=>f.event==='move').length,commands:value.split(',').filter(Boolean).length,conditionUsed};
}
export function evaluatePhaseB(c:WorldChallenge,value:string){if(c.kind==='garden-pattern'){const correct=value===c.mission!.pattern!.join(',');return {correct,steps:c.mission!.pattern!.length};}const result=traceMission(c,value);return {correct:result.correct,steps:c.kind==='route'?result.steps:result.commands};}
export function phaseBSuccess(state:WorldState,c:WorldChallenge){
 if(c.theme===2&&c.mission?.animal&&!state.animals.includes(c.mission.animal))state.animals.push(c.mission.animal);
 if(c.theme===3){const flowers=c.mission?.flowers||c.mission?.pattern?.map((color,cell)=>({cell,color}))||[];for(const flower of flowers){const cell=flower.cell%36,id=`flower-${cell}`,existing=state.garden.plots.find(f=>f.id===id);if(existing){existing.color=flower.color;existing.growth=Math.min(3,existing.growth+1);}else{const placement=state.garden.plots.some(f=>f.cell===cell)?Array.from({length:36},(_,n)=>n).find(n=>!state.garden.plots.some(f=>f.cell===n)):cell;if(placement!==undefined)state.garden.plots.push({id,cell:placement,color:flower.color,growth:1});}}state.garden.growth=Math.max(state.garden.growth,1);}
}
