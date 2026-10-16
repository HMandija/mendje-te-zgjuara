import {applyWorld,normalizeWorld,type WorldState,type WorldCommand} from './robot-world';
const KEY='mendje-robot-world-v1';
export type WorldCache={profile:string;grade:number;state:WorldState;pending:WorldCommand[]};
export function loadWorldCache(profile?:string):WorldCache|null{try{const cache=JSON.parse((profile?localStorage.getItem(KEY+':'+profile):sessionStorage.getItem(KEY))||'null');if(cache)cache.state=normalizeWorld(cache.state);return cache;}catch{return null;}}
export function storeWorldCache(cache:WorldCache){const raw=JSON.stringify(cache);sessionStorage.setItem(KEY,raw);localStorage.setItem(KEY+':'+cache.profile,raw);}
export function clearWorldCache(){try{sessionStorage.removeItem(KEY);}catch{}}
export function replayWorld(state:WorldState,pending:WorldCommand[],grade:number){return pending.reduce((current,command)=>{try{return applyWorld(current,command,grade).state;}catch{return current;}},state);}
