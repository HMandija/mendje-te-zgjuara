import fs from 'node:fs';
import ts from 'typescript';
import {z} from 'zod';
const compile=source=>'data:text/javascript;base64,'+Buffer.from(ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText).toString('base64');
const strip=path=>fs.readFileSync(path,'utf8').replace(/^import .*;\r?\n/gm,'');
export async function loadRobotRules(){
 const phaseB=await import(compile(strip('lib/robot-world-phase-b.ts')));
 const phaseC=await import(compile(strip('lib/robot-world-phase-c.ts')));
 globalThis.__schoolDeps=phaseB;
 const phaseD=await import(compile('const {traceMission,missionTokens}=globalThis.__schoolDeps;\n'+strip('lib/robot-world-phase-d.ts')));
 delete globalThis.__schoolDeps;globalThis.__festivalDeps=phaseD;const phaseE=await import(compile('const {traceSchool}=globalThis.__festivalDeps;\n'+strip('lib/robot-world-phase-e.ts')));delete globalThis.__festivalDeps;globalThis.__robotRules={z,...phaseB,...phaseC,...phaseD,...phaseE};
 const rules=await import(compile('const {z,phaseBChallenges,evaluatePhaseB,phaseBSuccess,initialCommerce,phaseCChallenges,evaluatePhaseC,phaseCSuccess,applyCommerce,balance,marketSolution,initialSchool,phaseDChallenges,evaluatePhaseD,phaseDSuccess,schoolHint,schoolIntelligence,initialFestival,phaseEChallenges,evaluatePhaseE,phaseESuccess,festivalHint}=globalThis.__robotRules;\n'+strip('lib/robot-world.ts')));
 delete globalThis.__robotRules;return {...rules,...phaseB,...phaseC,...phaseD,...phaseE};
}
