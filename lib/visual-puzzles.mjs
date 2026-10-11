import {gamesForGrade} from './game-catalog.mjs';
// Server-only grade-specific generators. Existing IDs keep issued snapshots compatible.
const object=(id,asset,label,extra={})=>({id,asset,label,...extra});
const target=(id,label,extra={})=>({id,label,...extra});
function firstPuzzles(){const categories={shadows:'spatial',garden:'math',wheels:'logic',memory:'memory',patterns:'patterns',path:'code'};return [1,2,3,4].flatMap(grade=>Object.entries(categories).map(([scene,cat])=>({id:`original-play-${grade}-${scene}`,grade,type:'placement',cat,options:[],interaction:{scene},hint:scene==='shadows'?'Shiko formën dhe drejtimin e figurës.':scene==='path'?'Shiko nga hyhet dhe nga dilet. Dy skajet duhet të lidhen.':'Shiko vargun sërish dhe thuaji me zë emrat nga e majta.',explain:scene==='shadows'?'Një hije ruan formën dhe drejtimin e figurës.':'Çdo pllakë lidh dy hyrjet e shënuara; shiko vazhdimësinë e rrugës.'})));}
const colors=['coral','sky','gold','mint','violet'];
const figures=['fox','owl','turtle','rabbit','apple','pear','berry','carrot','star','book','pencil','box','triangle','diamond'];
const figureNames=['Dhelpra','Bufi','Breshka','Lepuri','Molla','Dardha','Manaferrat','Karota','Ylli','Libri','Lapsi','Kutia','Trekëndëshi','Rombi'];
function shuffled(values,seed){let n=seed;return [...values].map(value=>{n=(Math.imul(n,1664525)+1013904223)>>>0;return {value,key:n};}).sort((a,b)=>a.key-b.key).map(x=>x.value);}
function arithmetic(result,grade,level,index){
 const k=Math.min(result,1+(level+index)%3);
 if(grade===1)return String(result);
 if(grade===2)return level<11?`${result-k} + ${k}`:`${result+k} − ${k}`;
 if(grade===3)return level<11?`${result/2} × 2`:`${result*2} ÷ 2`;
 return level<11?`${result} × 2 − ${result}`:`${result*3+k} − ${result*2} − ${k}`;
}
export function visualPuzzles(){return firstPuzzles().flatMap(base=>Array.from({length:20},(_,i)=>{
 const gameLevel=i+1,grade=base.grade,scene=base.interaction.scene,tier=Math.floor(i/5);
 const name=gamesForGrade(grade).find(g=>g.scene===scene).title;
 let tokens=[],targets=[],answer=[],preview,matchBy,layoutColumns;
 if(scene==='shadows'){
  const count=Math.min(7,grade+1+tier),rotation=grade===1?0:grade===2&&tier===0?0:90;
  const chosen=shuffled(figures.map((asset,n)=>({asset,label:figureNames[n]})),grade*71+gameLevel*43).slice(0,count);
  tokens=chosen.map((t,n)=>object('t'+n,t.asset,t.label+(rotation?` · ${((gameLevel+n)%4)*rotation}°`:''),{rotation:((gameLevel+n)%4)*rotation}));
  answer=shuffled(tokens.map(t=>t.id),gameLevel*101+grade);
  targets=answer.map((id,n)=>{const t=tokens.find(t=>t.id===id);return target('s'+n,`Hija ${n+1}`,{cue:t.asset,rotation:t.rotation,silhouette:true});});
 }else if(scene==='garden'){
  const count=Math.min(4,2+tier),start=grade===1?1+(i%4):grade===2?3+(i%3):4+(i%2)*2;
  tokens=Array.from({length:count},(_,n)=>object('t'+n,'flower',`${start+n*(grade>=3?2:1)} petale`,{quantity:start+n*(grade>=3?2:1),color:colors[(i+n+grade)%5]}));
  answer=shuffled(tokens.map(t=>t.id),grade*29+gameLevel*79);
  targets=answer.map((id,n)=>{const quantity=tokens.find(t=>t.id===id).quantity;return target('s'+n,arithmetic(quantity,grade,gameLevel,n),{cue:'pot',...(grade===1?{quantity}:{quantity:0})});});
 }else if(scene==='wheels'){
  tokens=[object('a','unicycle','Monocikli: 1 rrotë'),object('b','bike','Biçikleta: 2 rrota'),object('c','tricycle','Triçikleta: 3 rrota'),object('d','car','Makina: 4 rrota')].slice(0,Math.min(4,2+tier)).map((t,n)=>({...t,color:colors[(gameLevel+n+grade)%5]}));
  answer=shuffled(tokens.map(t=>t.id),gameLevel*83+grade*13);
  targets=answer.map((id,n)=>{const result=tokens.findIndex(t=>t.id===id)+1;const expression=grade===3?gameLevel<11?`${result} × 3 ÷ 3`:`${result*4} ÷ 4`:arithmetic(result,grade,gameLevel,n);return target('s'+n,expression,{cue:'garage',quantity:grade===1?result:0});});
 }else if(scene==='memory'){
  const count=Math.min(7,grade+1+tier),chosen=shuffled(figures,grade*73+gameLevel*107).slice(0,count);
  tokens=chosen.map((asset,n)=>object('t'+n,asset,figureNames[figures.indexOf(asset)]));
  answer=shuffled(tokens.map(t=>t.id),gameLevel*17+grade);targets=answer.map((_,n)=>target('s'+n,`Vendi ${n+1}`,{cue:'basket'}));preview=answer.map(id=>tokens.find(t=>t.id===id));
 }else if(scene==='patterns'){
  if(grade<=2){
   const assets=shuffled(['apple','pear','berry','carrot'],gameLevel*43+grade),cycle=grade===1?[assets[0],assets[1]]:[assets[0],assets[0],assets[1],...(tier>=2?[assets[2]]:[])];
   const prefix=cycle.length*2+(i%cycle.length),missing=Math.min(3,1+tier),values=Array.from({length:prefix+missing},(_,n)=>cycle[n%cycle.length]);
   preview=values.slice(0,prefix).map((asset,n)=>object('p'+n,asset,figureNames[figures.indexOf(asset)]));
   tokens=values.slice(prefix).map((asset,n)=>object('t'+n,asset,figureNames[figures.indexOf(asset)]));tokens.push(object('d','star','Ylli'));answer=tokens.slice(0,missing).map(t=>t.id);matchBy=['asset'];
  }else{
   const start=gameLevel+grade,step=1+tier,values=Array.from({length:6},(_,n)=>grade===3?start+n*step:start+n*step+(tier>=2?n*(n-1)/2:0));
   preview=values.slice(0,4).map((quantity,n)=>object('p'+n,'number',String(quantity),{quantity}));tokens=values.slice(4).map((quantity,n)=>object('t'+n,'number',String(quantity),{quantity}));tokens.push(object('d','number',String(values[5]+2),{quantity:values[5]+2}));answer=['t0','t1'];
  }
  targets=answer.map((_,n)=>target('s'+n,`Vendi që mungon ${n+1}`));
 }else if(scene==='path'){
  const count=Math.min(7,grade+tier+(i%5>=3||gameLevel===3?1:0)),width=tier===0?count:Math.min(2+i%2,count),originalPositions=Array.from({length:count},(_,n)=>({row:Math.floor(n/width),col:Math.floor(n/width)%2?width-1-n%width:n%width}));
  const turn=i%4,height=Math.max(...originalPositions.map(p=>p.row))+1;
  const positions=originalPositions.map(p=>turn===0?p:turn===1?{row:p.col,col:height-1-p.row}:turn===2?{row:height-1-p.row,col:width-1-p.col}:{row:width-1-p.col,col:p.row});layoutColumns=Math.max(...positions.map(p=>p.col))+1;
  const direction=(from,to)=>to.row<from.row?0:to.col>from.col?1:to.row>from.row?2:3;
  const roads=[['road-straight',[3,1],'a'],['road-down',[3,2],'b'],['road-up',[0,1],'c'],['road-vertical',[0,2],'d']];
  positions.forEach((position,n)=>{const exits=[n?direction(position,positions[n-1]):(3+turn)%4,n<count-1?direction(position,positions[n+1]):((originalPositions[n].col===width-1?1:2)+turn)%4];let shape;for(const [asset,openings,key] of roads)for(let r=0;r<4;r++)if(openings.map(d=>(d+r)%4).sort().join()===exits.sort().join()&&!shape)shape={asset,key,rotation:r*90};tokens.push(object('t'+n,shape.asset,`Pllaka ${n+1}`,{rotation:shape.rotation}));targets.push(target('s'+n,`${['lart','djathtas','poshtë','majtas'][exits[0]]} ↔ ${['lart','djathtas','poshtë','majtas'][exits[1]]}`,{cue:'guide-'+shape.key,rotation:shape.rotation,row:position.row+1,column:position.col+1}));});
  answer=tokens.map(t=>t.id);matchBy=['asset','rotation'];
 }
 const title=`${name} · Niveli ${gameLevel}: ${scene==='garden'||scene==='wheels'?grade===1?'numëro dhe vendos.':'zgjidh veprimin dhe vendos figurën.':scene==='patterns'?'zbulo rregullin dhe vazhdo vargun.':scene==='path'?'bashko daljet e pllakave.':scene==='shadows'?'gjej formën dhe drejtimin e çdo hijeje.':'mbaj mend vendet dhe rikrijo rendin.'}`;
 const hint=scene==='patterns'&&grade>=3?'Krahaso ndryshimin mes dy numrave. Në klasën 4, kontrollo nëse ndryshimi mbetet i njëjtë.':scene==='patterns'?'Gjej grupin që përsëritet. Krahaso fundin e vargut me fillimin e grupit.':scene==='garden'||scene==='wheels'?'Llogarit numrin te vendi. Pastaj gjej figurën me atë numër petalesh ose rrotash.':base.hint;
 return {...base,id:gameLevel===1?base.id:base.id+'-level-'+gameLevel,gameLevel,gameRevision:1,level:Math.min(3,1+Math.floor(i/7)),title,hint,explain:scene==='memory'?`Rendi i vëzhguar është: ${answer.map(id=>tokens.find(t=>t.id===id).label).join(', ')}.`:scene==='garden'||scene==='wheels'?`Vendet kërkojnë: ${answer.map(id=>tokens.find(t=>t.id===id).label).join('; ')}. Llogaritja duhet të përputhet me numrin e petaleve ose rrotave.`:scene==='patterns'?`Vazhdimi i vargut është: ${answer.map(id=>tokens.find(t=>t.id===id).label).join(', ')}.`:base.explain,visual:'',answer:JSON.stringify(answer),interaction:{scene,tokens:shuffled(tokens,i*59+grade),targets,...(preview?{preview}:{}),...(matchBy?{matchBy}:{}),...(layoutColumns?{layoutColumns}:{}),previewSeconds:Math.max(5,11-grade-tier)}};
}));}
