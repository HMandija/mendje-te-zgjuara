export type ForestPoint={x:number;z:number};
export type ForestCommand='up'|'right'|'down'|'left';
export const FOREST_DIRECTIONS:Record<ForestCommand,ForestPoint>={up:{x:0,z:-1},right:{x:1,z:0},down:{x:0,z:1},left:{x:-1,z:0}};
export function forestDirection(heading:number,command:ForestCommand){const turn=command==='left'?-1:command==='right'?1:command==='down'?2:0;const direction=(heading+turn+4)%4;return {delta:Object.values(FOREST_DIRECTIONS)[direction],heading:command==='down'?heading:direction};}
export const FOREST_LEVELS=[
 {name:'Lepurushi te livadhi',animal:'Lepurushi',kind:'rabbit',start:{x:0,z:4},animalAt:{x:2,z:3},safe:{x:3,z:2},blocks:[[1,4],[1,2],[3,4],[4,3]],water:[],bridge:[],limit:12},
 {name:'Iriqi pas trungut',animal:'Iriqi',kind:'hedgehog',start:{x:0,z:4},animalAt:{x:3,z:2},safe:{x:4,z:0},blocks:[[1,4],[1,3],[1,1],[2,1],[3,3],[4,2]],water:[],bridge:[],limit:18},
 {name:'Rosaku përtej përroit',animal:'Rosaku',kind:'duck',start:{x:0,z:4},animalAt:{x:3,z:3},safe:{x:4,z:0},blocks:[[1,3],[3,1],[4,4]],water:[[2,0],[2,1],[2,2],[2,3],[2,4]],bridge:[[2,2]],limit:24}
] as const;
export type ForestRun={position:ForestPoint;heading:number;collected:boolean;complete:boolean;blocked:boolean};
export function forestStep(level:number,state:ForestRun,command:ForestCommand):ForestRun{
 if(state.complete)return state;
 const config=FOREST_LEVELS[level];if(!config||!Object.hasOwn(FOREST_DIRECTIONS,command))return state;const {delta,heading}=forestDirection(state.heading,command);
 const p={x:state.position.x+delta.x,z:state.position.z+delta.z};
 const at=(items:readonly (readonly number[])[])=>items.some(([x,z])=>p.x===x&&p.z===z);
 if(p.x<0||p.x>4||p.z<0||p.z>4||at(config.blocks)||(at(config.water)&&!at(config.bridge)))return {...state,blocked:true};
 const collected=state.collected||(p.x===config.animalAt.x&&p.z===config.animalAt.z);
 return {position:p,heading,collected,complete:collected&&p.x===config.safe.x&&p.z===config.safe.z,blocked:false};
}
export function initialForest(level:number):ForestRun{return {position:{...FOREST_LEVELS[level].start},heading:0,collected:false,complete:false,blocked:false};}
