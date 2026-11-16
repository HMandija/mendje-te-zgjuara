export const ROLE_PERMISSIONS = {
 STUDENT: new Set(['student:read','student:finish','adventure:start','adventure:answer','adventure:hint','product:read','class:join','document:read','coding:read','coding:write']),
 TEACHER: new Set(['workspace:read','workspace:write','invite:create','invite:revoke','session:finish','adventure:start','adventure:answer','adventure:hint','product:read','class:write','document:read','coding:read']),
 ADMIN: new Set(['workspace:read','workspace:write','invite:create','invite:revoke','session:finish','adventure:start','adventure:answer','adventure:hint','product:read','class:write','document:read','coding:read']),
};
export function allowed(role,permission){return ROLE_PERMISSIONS[role]?.has(permission) === true;}
export function publicPuzzle(p){return {id:p.id,cat:p.cat,title:p.title,visual:p.visual,...(p.boxes?{boxes:p.boxes}:{}),options:p.options,memory:!!p.memory,type:p.type||'choice',level:p.level||1,gameLevel:p.gameLevel,lessonId:p.lessonId,lessonLevel:p.lessonLevel,interaction:p.interaction};}
export {assess as evaluateAnswer} from './puzzle-engine.mjs';
