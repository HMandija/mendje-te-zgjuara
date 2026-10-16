import fs from 'node:fs';import ts from 'typescript';
const js=ts.transpileModule(fs.readFileSync('lib/robot-courtyard-path.ts','utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText;
export const yardRules=await import('data:text/javascript;base64,'+Buffer.from(js).toString('base64'));
