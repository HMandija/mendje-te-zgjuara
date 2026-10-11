// Public command interpreter. The server runs this same bounded simulation;
// reaching public goals is checked again against the issued board, never a client claim.
export const robotCommands={north:['↑','Lart'],east:['→','Djathtas'],south:['↓','Poshtë'],west:['←','Majtas'],forward:['⇧','Ec përpara'],right:['↱','Kthehu djathtas'],left:['↰','Kthehu majtas'],repeat:['↻','Përsërit'],ifClear:['◇','Nëse rruga është e lirë'],hop:['✦','Kërce'],say:['☏','Përshëndet'],wait:['◷','Prit']};
export function commandsForGrade(grade){return grade===1?['north','east','south','west']:grade===2?['north','east','south','west','repeat']:grade===3?['forward','right','left','repeat']:['forward','right','left','repeat','ifClear'];}
export function validProgram(board,program){
 let blocks=0;
 function check(list,depth){return Array.isArray(list)&&list.length>0&&list.length<=24&&depth<=3&&list.every(c=>{if(!c||typeof c!=='object'||++blocks>32||!board.commands.includes(c.op))return false;const group=c.op==='repeat'||c.op==='ifClear';if(Object.keys(c).some(k=>!['op','n','body'].includes(k)))return false;if(group){if(c.op==='repeat'&&(!Number.isInteger(c.n)||c.n<2||c.n>8))return false;if(c.op==='ifClear'&&c.n!==undefined)return false;return check(c.body,depth+1);}return c.n===undefined&&c.body===undefined;});}
 return check(program,0);
}
export function runRobot(board,program){
 if(!validProgram(board,program))return {valid:false,trace:[],success:false,error:'Kontrollo blloqet e programit.'};
 let pos=board.start,dir=board.direction||0,steps=0,error='',stopped=false;
 const collected=new Set(board.goals.includes(pos)?[pos]:[]),trace=[{pos,dir,collected:[...collected],op:'start'}],offset=[-board.size,1,board.size,-1];
 function next(d){const x=pos%board.size,y=Math.floor(pos/board.size),nx=x+[0,1,0,-1][d],ny=y+[-1,0,1,0][d];return nx>=0&&nx<board.size&&ny>=0&&ny<board.size?pos+offset[d]:-1;}
 function clear(){const p=next(dir);return p>=0&&board.cells[p]!=='#';}
 function execute(list){for(const c of list){if(stopped)return;if(++steps>160){error='Programi ka shumë hapa. Shkurtoje me përsëritje.';stopped=true;return;}if(c.op==='repeat'){for(let n=0;n<c.n&&!stopped;n++)execute(c.body);continue;}if(c.op==='ifClear'){if(clear())execute(c.body);else trace.push({pos,dir,collected:[...collected],op:'ifClear'});continue;}let blocked=false;if(c.op==='right')dir=(dir+1)%4;else if(c.op==='left')dir=(dir+3)%4;else if(['north','east','south','west','forward'].includes(c.op)){const d=c.op==='forward'?dir:['north','east','south','west'].indexOf(c.op),p=next(d);dir=d;if(p<0||board.cells[p]==='#'){error='Roboti hasi një pengesë. Ndrysho komandën ose drejtimin.';blocked=true;}else{pos=p;if(board.goals.includes(pos))collected.add(pos);}}trace.push({pos,dir,collected:[...collected],op:c.op,blocked});}}
 execute(program);return {valid:true,trace,success:!error&&pos===board.end&&board.goals.every(p=>collected.has(p)),error};
}
