import fs from 'node:fs';import ts from 'typescript';import assert from 'node:assert/strict';
const js=ts.transpileModule(fs.readFileSync('lib/robot-courtyard-path.ts','utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText;
const {yardPath,yardWalkable,YARD_HOME,YARD_FLOWER,YARD_TREES}=await import('data:text/javascript;base64,'+Buffer.from(js).toString('base64'));
const start={x:-4,z:2};for(const target of [YARD_HOME,YARD_FLOWER,{x:0,z:3},{x:8,z:5},{x:-8,z:5}]){const path=yardPath(start,target);assert(path.length);for(let i=0;i<path.length;i++){assert(yardWalkable(path[i]));if(i)assert.equal(Math.abs(path[i].x-path[i-1].x)+Math.abs(path[i].z-path[i-1].z),.5);}}
for(const target of [{x:-4,z:-3},{x:5.8,z:-3.9},{x:1,z:-4},{x:-6,z:3},{x:15,z:0},...YARD_TREES.map(([x,z])=>({x,z}))]){assert(!yardWalkable(target));assert.deepEqual(yardPath(start,target),[]);}
assert.deepEqual(yardPath(start,start),[start]);assert(yardPath(YARD_FLOWER,YARD_HOME).length);console.log('Courtyard navigation: home, flower, free destinations, reverse routes, four-connected steps and house/pond/bed/bench/tree collisions passed.');
