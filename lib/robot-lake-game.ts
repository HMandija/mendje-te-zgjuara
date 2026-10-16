export type LakePoint={x:number;z:number};
export type LakeDirection='up'|'right'|'down'|'left';
export const LAKE_DIRECTIONS:Record<LakeDirection,LakePoint>={up:{x:0,z:-1},right:{x:1,z:0},down:{x:0,z:1},left:{x:-1,z:0}};
export function lakeDirection(heading:number,command:LakeDirection){const turn=command==='left'?-1:command==='right'?1:command==='down'?2:0;const direction=(heading+turn+4)%4;return {delta:Object.values(LAKE_DIRECTIONS)[direction],heading:command==='down'?heading:direction};}
export const LAKE_LEVELS=[
 {name:'Ura e parë',hint:'Përsërit 3 herë: Para.',start:{x:0,z:3},route:[{x:1,z:3},{x:2,z:3},{x:3,z:3}],maxRepeat:3},
 {name:'Kthesa mes zambakëve',hint:'Dy hapa para, pastaj kthehu djathtas dhe vazhdo para.',start:{x:0,z:4},route:[{x:0,z:3},{x:0,z:2},{x:1,z:2},{x:2,z:2},{x:3,z:2}],maxRepeat:3},
 {name:'Ura me dy kthesa',hint:'Ndiq shtyllat. Pas kthesës, vazhdo me Para.',start:{x:0,z:4},route:[{x:1,z:4},{x:2,z:4},{x:2,z:3},{x:2,z:2},{x:3,z:2},{x:4,z:2},{x:4,z:1}],maxRepeat:4}
] as const;
export type LakeRun={built:number;position:LakePoint;heading:number;phase:'building'|'ready'|'complete';blocked:boolean};
export function initialLake(level:number):LakeRun{const c=LAKE_LEVELS[level],first=c.route[0];const heading=first.x>c.start.x?1:first.x<c.start.x?3:first.z<c.start.z?0:2;return {built:0,position:{...c.start},heading,phase:'building',blocked:false};}
export function lakeStep(level:number,state:LakeRun,direction:LakeDirection):LakeRun{
 if(state.phase!=='building')return state;
 const config=LAKE_LEVELS[level];if(!config||!Object.hasOwn(LAKE_DIRECTIONS,direction))return {...state,blocked:true};const {delta,heading}=lakeDirection(state.heading,direction);
 const next={x:state.position.x+delta.x,z:state.position.z+delta.z},expected=config.route[state.built];
 if(!expected||next.x!==expected.x||next.z!==expected.z)return {...state,blocked:true};
 const built=state.built+1;return {built,position:next,heading,phase:built===config.route.length?'ready':'building',blocked:false};
}
export function expandLakeCommand(direction:LakeDirection,count:number,max:number):LakeDirection[]{return Number.isInteger(count)&&count>=1&&count<=max&&Object.hasOwn(LAKE_DIRECTIONS,direction)?Array.from({length:count},()=>direction):[];}
export function finishLakeReturn(state:LakeRun):LakeRun{return state.phase==='ready'?{...state,phase:'complete'}:state;}
