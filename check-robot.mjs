import assert from 'node:assert/strict';
import {robotPuzzles} from './lib/robot-puzzles.mjs';
import {runRobot,validProgram} from './lib/robot-rules.mjs';
import {assess,accepts,plugins} from './lib/puzzle-engine.mjs';
import {publicPuzzle} from './lib/security-policy.mjs';
const puzzles=robotPuzzles();
assert.equal(puzzles.length,80);
for(const grade of [1,2,3,4]){
 const group=puzzles.filter(p=>p.grade===grade);
 assert.equal(group.length,20);
 assert.deepEqual(group.map(p=>p.gameLevel),Array.from({length:20},(_,i)=>i+1));
 assert.equal(new Set(group.map(p=>JSON.stringify(p.interaction))).size,20);
 for(let i=1;i<group.length;i++)assert(group[i].interaction.cells.filter(c=>c==='.').length>=group[i-1].interaction.cells.filter(c=>c==='.').length);
 for(const puzzle of group){
  const answer=JSON.parse(puzzle.answer);
  assert(validProgram(puzzle.interaction,answer),puzzle.id);
  assert(puzzle.answer.length<=1000,puzzle.id+' fits answer payload');
  assert(runRobot(puzzle.interaction,answer).success,puzzle.id);
  assert(assess(puzzle,puzzle.answer).correct,puzzle.id);
  assert(plugins.robot.hint(puzzle,2).length>puzzle.hint.length);
  assert(!('answer' in publicPuzzle(puzzle)));
  assert(!accepts(puzzle,'[{"op":"forward","correct":true}]'));
  assert(!accepts(puzzle,'[{"op":"repeat","n":99999,"body":[{"op":"east"}]}]'));
  assert(!validProgram(puzzle.interaction,[{op:'invalid'}]));
 }
}
const board={size:3,start:3,end:5,goals:[4,5],cells:Array(9).fill('.'),direction:1,commands:['forward','right','left','repeat','ifClear']};
assert(runRobot(board,[{op:'repeat',n:2,body:[{op:'ifClear',body:[{op:'forward'}]}]}]).success);
assert(runRobot(board,[{op:'repeat',n:2,body:[{op:'repeat',n:2,body:[{op:'ifClear',body:[{op:'forward'}]}]}]}]).success);
assert(!runRobot({...board,cells:['.','.','.','.','#','.','.','.','.']},[{op:'forward'}]).success);
assert(!runRobot(board,[{op:'repeat',n:8,body:[{op:'repeat',n:8,body:[{op:'repeat',n:8,body:[{op:'right'}]}]}]}]).success);
assert(!validProgram(board,[{op:'repeat',n:2,body:[]} ]));
const blockedRun=runRobot({...board,start:0,direction:0},[{op:'forward'},{op:'right'},{op:'forward'},{op:'left'},{op:'forward'}]);
assert.equal(blockedRun.trace.length,6);
assert.equal(blockedRun.trace[1].blocked,true);
assert.equal(blockedRun.trace[2].dir,1);
assert.equal(blockedRun.trace[3].pos,1);
assert.equal(blockedRun.trace[4].dir,0);
assert.equal(blockedRun.trace[5].blocked,true);
assert.equal(blockedRun.success,false);
const turns=runRobot(board,[{op:'forward'},{op:'forward'},{op:'left'},{op:'forward'}]);
assert.deepEqual(turns.trace.map(f=>[f.pos,f.dir]),[[3,1],[4,1],[5,1],[5,0],[2,0]]);
console.log('Robot: 80 grade-specific missions, bounded programs, routes and verified goals passed.');
