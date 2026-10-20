import {creativeInput,creativeCorrect} from './creative-rules.mjs';
import {z} from 'zod';
import {pipeConnected,mazeWalk} from './board-rules.mjs';
import {validProgram,runRobot} from './robot-rules.mjs';
export const puzzleTypes=['choice','ordering','grid','balance','number','boolean','pattern','odd','placement','pipes','maze','robot','creative'];
const bounded=z.string().min(1).max(1000);
export const plugins=Object.fromEntries(puzzleTypes.map(type=>[type,{
 schema: type==='pipes'?z.array(z.number().int().min(0).max(3)).min(1).max(25):type==='maze'?z.array(z.number().int().min(0).max(168)).min(1).max(256):type==='placement'?z.array(bounded).min(1).max(16):type==='ordering'?z.array(bounded).min(2).max(8):type==='grid'?z.array(z.enum(['+','−'])).min(1).max(16):type==='number'?z.string().regex(/^-?\d{1,6}$/):bounded,
 render:type,
 validate(p,value){if(type==='placement'&&p.interaction.matchBy){const a=JSON.parse(value),expected=JSON.parse(p.answer);return a.every((id,i)=>{const actual=p.interaction.tokens.find(t=>t.id===id),target=p.interaction.tokens.find(t=>t.id===expected[i]);return p.interaction.matchBy.every(key=>(actual[key]||0)===(target[key]||0));});}if(type==='pipes')return pipeConnected(p.interaction,JSON.parse(value));if(type==='maze')return JSON.parse(value).at(-1)===p.interaction.end;return normalize(p,value)===normalize(p,p.answer);},
 hint(p,step=1){if(step===1)return p.hint;if(p.hint2)return `${p.hint} ${p.hint2}`;const strategy={pipes:'Ndiq lidhjet nga nisja drejt mbërritjes; kontrollo hyrjen dhe daljen në çdo nyje.',maze:'Në çdo kryqëzim provo një degë. Shëno degët e mbyllura që të mos kthehesh në to.',placement:p.interaction?.scene==='garden'?'Lexo numrin ose kërkesën te vendi bosh dhe krahasoje me etiketat e kartave; pozicioni i kartës mund të ndryshojë.':p.interaction?.scene==='memory'?'Kujto vendin e kërkuar në varg dhe verifikoje me figurën që ishte pranë tij.':'Krahaso veçorinë e saktë që kërkohet—formën, numrin ose pozicionin—me secilën kartë.',ordering:'Krahaso dy sende pranë njëri-tjetrit dhe vendos të parin sipas rendit që kërkohet.',grid:'Vlerëso çdo pohim më vete; kërko një shembull që e vërteton ose e rrëzon.',number:'Kontrolloje llogaritjen me veprimin e kundërt ose duke zëvendësuar përgjigjen në pyetje.',balance:'Ruaj baraspeshën: çdo veprim në njërën anë duhet bërë edhe në anën tjetër.',boolean:'Provo një rast të thjeshtë që mund ta vërtetosh. Për “gjithmonë”, kontrollo nëse ka kundërshembull.',pattern:'Krahaso disa hapa radhazi për të dalluar rritjen, alternimin ose grupin që përsëritet.',odd:'Zgjidh një veçori të përbashkët dhe provo nëse vetëm një element nuk e ka.',choice:'Përjashto vetëm alternativat që kundërshtojnë të dhënat. Rilexo kushtet para zgjedhjes së fundit.'};const context=p.visual||p.interaction?.targets?.map(t=>t.label).filter(Boolean).join(', ')||p.title;return `${p.hint} ${strategy[type]} Të dhënat e pyetjes: ${context}.`;},
 score(correct){return correct?1:0;},
}]));
const robotCommandSchema=z.lazy(()=>z.object({op:z.enum(['north','east','south','west','forward','right','left','repeat','ifClear','hop','say','wait']),n:z.number().int().min(2).max(8).optional(),body:z.array(robotCommandSchema).min(1).max(24).optional()}).strict());
plugins.robot.schema=z.array(robotCommandSchema).min(1).max(24);
plugins.robot.validate=(p,value)=>runRobot(p.interaction,JSON.parse(value)).success;
plugins.robot.hint=(p,step=1)=>step===1?p.hint:`${p.hint} ${p.hint2||'Kontrollo nisjen, secilën kthesë dhe vendndodhjen e yjeve përpara se të nisësh programin.'}`;
plugins.creative.hint=(p,step=1)=>p.hint+(step>1?' Ndaje misionin në hapa të vegjël. Provo një hap dhe krahasoje me modelin para se të vazhdosh.':'');
plugins.creative.validate=(p,value)=>creativeCorrect(p.interaction.creative,JSON.parse(value),p.answer);
export function normalize(p,value){
 if(p.type==='creative'){if(typeof value!=='string'||value.length>12000)throw Error('Invalid creative input');const a=JSON.parse(value);if(!creativeInput(p.interaction.creative,a))throw Error('Invalid creative input');return JSON.stringify(a); }
 const type=p.type||'choice';
 if(type==='robot'){const program=plugins.robot.schema.parse(JSON.parse(value));if(!validProgram(p.interaction,program))throw Error('Invalid program');return JSON.stringify(program);}
 if(type==='number')return String(Number(plugins.number.schema.parse(value)));
 if(['ordering','grid','placement','pipes','maze'].includes(type))return JSON.stringify(plugins[type].schema.parse(JSON.parse(value)));
 return plugins[type].schema.parse(value);
}
export function accepts(p,value){
 try{
  normalize(p,value);
  if(p.type==='robot'||p.type==='creative')return true;
  if(p.type==='pipes')return JSON.parse(value).length===p.interaction.pipes.length;
  if(p.type==='maze')return mazeWalk(p.interaction,JSON.parse(value));
  if(p.type==='placement'){const x=JSON.parse(value),filled=x.filter(v=>v!=='_');return x.length===p.interaction.targets.length&&new Set(filled).size===filled.length&&filled.every(v=>p.interaction.tokens.some(t=>t.id===v))&&(p.interaction.scene==='memory-grid'?filled.length===p.interaction.tokens.length:filled.length===x.length);}
  if(p.type==='ordering'){const x=JSON.parse(value);return x.length===p.interaction.items.length&&new Set(x).size===x.length&&x.every(v=>p.interaction.items.includes(v));}
  if(p.type==='grid')return JSON.parse(value).length===p.interaction.cells.length;
  if(p.type==='number')return true;
  return p.options.includes(value);
 }catch{return false;}
}
export function assess(p,value){if(!accepts(p,value))throw Error('Invalid choice');const plugin=plugins[p.type||'choice'];const correct=p.type==='robot'?runRobot(p.interaction,JSON.parse(value)).success:plugin.validate(p,value);return {correct,score:plugin.score(correct),explain:correct?p.explain:p.type==='creative'?'Ende nuk përputhen të gjitha kërkesat. Provo përsëri: kontrollo modelin, rregullin ose sasinë në çdo hap.':p.type==='robot'?'Programi nuk vizitoi çdo objektiv ose nuk përfundoi te flamuri. Planifiko sërish rrugën dhe kontrollo kthesat.':p.explain};}
