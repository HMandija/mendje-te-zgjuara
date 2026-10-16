import {traceSchool} from './robot-world-phase-d';
import type {WorldChallenge,WorldState} from './robot-world';
export const MOVES={J:{icon:'⤴',name:'Kërce'},S:{icon:'↻',name:'Rrotullo'},B:{icon:'↘',name:'Përkulu'},H:{icon:'👋',name:'Përshëndet'}};
export type DanceMove=keyof typeof MOVES;
export type Festival={dance:string[];challenge:string;medals:Record<string,'gold'|'silver'|'bronze'>;trophy:boolean;shared?:{classId:string;program:string[];challenge:string;at:number}};
export type FestivalMission={pattern?:DanceMove[];repeat?:boolean;opponent?:string[];conditional?:boolean;championship?:boolean};
export const initialFestival=():Festival=>({dance:[],challenge:'',medals:{},trophy:false});
export const E_STAGES={6:['Hapat e parë','Ndjej ritmin','Koreografia','Shfaqja e miqve'],7:['Gara e parë','Komanda më të shkurtra','Pista me pengesa','Kampionati']};
export function danceTokens(value:string):DanceMove[]|null{
 if(value.length>1500)return null;const out:DanceMove[]=[];
 for(const token of value.split(',').filter(Boolean)){const group=/^\[([JSBH.]+)\]x([2-9])$/.exec(token),single=/^([JSBH])(?:x([2-9]))?$/.exec(token),sequence=group?group[1].split('.'):single?[single[1]]:null;if(!sequence||sequence.length>8||sequence.some(t=>!(t in MOVES)))return null;for(let n=0;n<Number(group?.[2]||single?.[2]||1);n++)out.push(...sequence as DanceMove[]);if(out.length>40)return null;}return out.length?out:null;
}
export function shortestRace(c:WorldChallenge,variant=0){
 const size=c.size!,blocked=c.school?.variants?.[variant]||c.blocked||[],queue:[number,string[]][]=[[c.start||0,[]]],seen=new Set([c.start||0]);
 for(let i=0;i<queue.length;i++){const [cell,path]=queue[i];if(cell===c.goal)return path;for(const d of ['R','D','L','U']){const x=cell%size+(d==='R'?1:d==='L'?-1:0),y=Math.floor(cell/size)+(d==='D'?1:d==='U'?-1:0),next=y*size+x;if(x>=0&&y>=0&&x<size&&y<size&&!blocked.includes(next)&&!seen.has(next)){seen.add(next);queue.push([next,[...path,d]]);}}}return [];
}
export function compactRace(path:string[]){const out:string[]=[];for(let i=0;i<path.length;){let n=1;while(n<9&&path[i+n]===path[i])n++;out.push(path[i]+(n>1?'x'+n:''));i+=n;}return out.join(',');}
export function phaseEChallenges(grade:number):WorldChallenge[]{
 const list:WorldChallenge[]=[],advanced=grade>=3;
 for(let stage=0;stage<4;stage++)for(let round=0;round<3;round++){
  const motifs:DanceMove[][]=[['J','H'],['S','B'],stage===2?['H','S']:['H','J','S']],motif=motifs[round],count=stage===0?1:stage===1?2:stage===2?4:advanced?6:5;
  const pattern=stage===0?([['J','H','B'],['S','J','H','B'],['H','S','B','J','H']] as DanceMove[][])[round]:Array.from({length:count},()=>motif).flat();
  if(advanced&&stage===0)pattern.push('S','J');
  list.push({id:`dance-${stage+1}-${round+1}`,theme:6,stage,round,kind:'dance',title:['Mëso lëvizjet e robotit','Ndiq ritmin me dritën','Ndërto një koreografi','Vallëzo për miqtë e shpëtuar'][stage],icon:'🎵',target:0,options:[],visual:'',efficient:stage===0?pattern.length:1,festival:{pattern,repeat:advanced&&stage>=2}});
 }
 for(let stage=0;stage<4;stage++)for(let round=0;round<3;round++){
  const conditional=stage>=2&&(grade===4||stage===3),size=advanced?10:8,count=(advanced?3:1)+round+stage,start=conditional?0:stage*size,goal=start+size+count+1;
  const blocked=conditional?[size]:[start+size,start+2*size,start+2*size+1],c:WorldChallenge={id:`race-${stage+1}-${round+1}`,theme:7,stage,round,kind:'race',title:['Gara miqësore','Më pak komanda, më shpejt','Përsërit dhe shmang pengesat','Raundi i kampionatit'][stage],icon:'🏁',target:goal,options:[],visual:'',size,start,goal,blocked,mission:{},school:conditional?{variants:[[size],[1]],crossing:1}:undefined,efficient:conditional?2:stage===0?count+2:3,festival:{conditional,repeat:stage>=1&&(advanced||stage>=2),championship:stage===3}};
  c.path=shortestRace(c);c.festival!.opponent=[...c.path];list.push(c);
 }
 return list;
}
export function festivalSolution(c:WorldChallenge){if(c.kind==='dance'){const p=c.festival!.pattern!,motif=c.round===2&&c.stage!==2?3:2;if(c.stage>0)return `[${p.slice(0,motif).join('.')}]x${p.length/motif}`;return p.join(',');}if(c.festival?.conditional){const count=c.goal!-c.size!-1;return `IFR:[R.D]:[D.R],R${count>1?'x'+count:''}`;}return c.stage===0?c.path!.join(','):compactRace(c.path!);}
export function festivalHint(c:WorldChallenge){if(c.kind==='dance')return c.festival!.pattern!.map(m=>MOVES[m].icon).join(' ');if(c.festival?.conditional)return '🌉 ✓ → ↓ · 🌉 ✗ ↓ → · 🔁 →';return c.path!.map(d=>({R:'→',D:'↓',U:'↑',L:'←'})[d]).join(' ');}
export function raceTrace(c:WorldChallenge,value:string,variant=0){return traceSchool(c,value,variant);}
export function raceTime(c:WorldChallenge,value:string,variant=0){const t=raceTrace(c,value,variant);return t.commands+t.steps*.15;}
export function evaluatePhaseE(c:WorldChallenge,value:string){
 if(c.kind==='dance'){const tokens=danceTokens(value);return {correct:!!tokens&&tokens.join(',')===c.festival!.pattern!.join(',')&&(!c.festival?.repeat||/x[2-9]/.test(value)),steps:value.split(',').filter(Boolean).length};}
 const trace=raceTrace(c,value),second=c.festival?.conditional?raceTrace(c,value,1):undefined,correct=trace.correct&&(!c.festival?.repeat||/x[2-9]/.test(value))&&(!c.festival?.conditional||trace.conditionUsed&&second!.correct),detour=trace.steps>shortestRace(c).length||!!second&&second.steps>shortestRace(c,1).length;return {correct,steps:detour?Math.max(trace.commands,c.efficient+1):trace.commands};
}
export function phaseESuccess(state:WorldState,c:WorldChallenge,value:string){
 if(c.kind==='dance'){state.festival.dance=value.split(',');state.festival.challenge=c.id;}
 else{const stars=state.progress[c.id].stars,medal=stars===3?'gold':stars===2?'silver':'bronze',rank={bronze:1,silver:2,gold:3},previous=state.festival.medals[c.id];if(!previous||rank[medal]>rank[previous])state.festival.medals[c.id]=medal;if([1,2,3].every(n=>state.progress[`race-4-${n}`]?.stars))state.festival.trophy=true;}
}
