'use client';
import {useEffect,useState,type CSSProperties} from 'react';
import {DndContext,useDraggable,useDroppable,DragOverlay,PointerSensor,useSensor,useSensors,rectIntersection,type DragEndEvent} from '@dnd-kit/core';
import {Eye,Hand,RotateCcw,X,ArrowRight,House,Trees} from 'lucide-react';
import {PlayArt} from './play-art';
import {useExperience} from './experience-provider';
import type {PlayInteraction,PlayObject,PlayTarget} from '../lib/play-types';
export function PlacementGame({interaction,disabled,onAnswer}:{interaction:PlayInteraction;disabled:boolean;onAnswer:(value:string)=>void}){
 const {play}=useExperience();
 const {tokens,targets,scene,preview}=interaction;
 const previewSeconds=interaction.previewSeconds||7;
 const gridMemory=scene==='memory-grid',memoryGame=scene==='memory'||gridMemory;
 const [slots,setSlots]=useState<(string|null)[]>(targets.map(()=>null)),[selected,setSelected]=useState<string|null>(null),[dragged,setDragged]=useState<string|null>(null),[notice,setNotice]=useState('');
 const [memoryVisible,setMemoryVisible]=useState(memoryGame),[memoryRound,setMemoryRound]=useState(0),[remaining,setRemaining]=useState(previewSeconds);
 useEffect(()=>{if(!memoryGame)return;const tick=setInterval(()=>setRemaining(n=>Math.max(0,n-1)),1000);const timer=setTimeout(()=>{setMemoryVisible(false);clearInterval(tick);},previewSeconds*1000);return()=>{clearTimeout(timer);clearInterval(tick);};},[memoryGame,memoryRound,previewSeconds]);
 const sensors=useSensors(useSensor(PointerSensor,{activationConstraint:{distance:6}}));
 const blocked=disabled||memoryVisible;
 function place(id:string,index:number){if(blocked)return;play('drop');setSlots(previous=>{const next=[...previous],from=next.indexOf(id),displaced=next[index];if(from!==-1)next[from]=displaced;next[index]=id;return next;});setSelected(null);setNotice(`${tokens.find(t=>t.id===id)?.label} u vendos te ${targets[index].label}.`);}
 function drop({active,over}:DragEndEvent){setDragged(null);if(!over)return;const index=targets.findIndex(t=>t.id===over.id);if(index>=0)place(String(active.id),index);}
 const active=tokens.find(t=>t.id===dragged),selectedToken=tokens.find(t=>t.id===selected);
 return <div className={`placement-game scene-${scene}`}>
  <div className="game-sky" aria-hidden="true"><span/><span/><span/></div>
  <div className="game-instruction"><Hand size={20}/><p>{memoryVisible?'Vëzhgo vendet. Pas pak figurat fshihen.':selectedToken?`${selectedToken.label}: zgjidh vendin ku do ta vendosësh.`:'Tërhiq figurat në vende. Ose prek një figurë, pastaj vendin e saj.'}</p></div>
  <DndContext sensors={sensors} collisionDetection={rectIntersection} onDragStart={({active})=>{play('pick');setDragged(String(active.id));setSelected(null);}} onDragCancel={()=>setDragged(null)} onDragEnd={drop} accessibility={{announcements:{onDragStart:({active})=>`Po tërheq ${tokens.find(t=>t.id===active.id)?.label}.`,onDragOver:({over})=>over?`Te ${targets.find(t=>t.id===over.id)?.label}.`:'Zgjidh një vend.',onDragEnd:()=> 'Tërheqja përfundoi.',onDragCancel:()=> 'Tërheqja u anulua.'}}}>
   {scene==='path'&&<div className="path-endpoints"><span><Trees/> Nisja</span><span>Shtëpia <House/></span></div>}
   {scene==='patterns'&&<div className="pattern-preview" aria-label="Vargu i frutave">{preview?.map((token,i)=><div className="pattern-step" key={token.id}><PlayArt {...token}/><span className="sr-only">{i+1}: {token.label}</span></div>)}<ArrowRight aria-hidden="true"/><span className="pattern-question">?</span></div>}
   {gridMemory&&memoryVisible?<div className="memory-grid-preview" style={{gridTemplateColumns:`repeat(${interaction.size},1fr)`}} aria-label="Mbaj mend rreshtin dhe kolonën">{targets.map((target,i)=>{const token=preview?.find(t=>t.position===i);return <div key={target.id} aria-label={target.label+(token?`: ${token.label}`:': bosh')}>{token&&<PlayArt {...token}/>}</div>;})}</div>:memoryGame&&memoryVisible?<div className="memory-preview" aria-label="Mbaj mend këtë rend">{preview?.map((token,i)=><div key={token.id}><PlayArt {...token}/><strong>{i+1}</strong><span>{token.label}</span></div>)}</div>:<div className="drop-landscape" style={gridMemory||scene==='path'?{gridTemplateColumns:`repeat(${gridMemory?interaction.size:interaction.layoutColumns||2},1fr)`}:undefined}>{targets.map((target,index)=><DropPlace compact={gridMemory} position={scene==='path'?{gridRow:target.row||index+1,gridColumn:target.column||1}:undefined} key={target.id} target={target} token={tokens.find(t=>t.id===slots[index])} disabled={blocked} selected={selected} choose={()=>{if(selected)place(selected,index);else if(slots[index])setSelected(slots[index]);}} select={id=>setSelected(id)} remove={()=>{setSlots(previous=>previous.map((v,n)=>n===index?null:v));setSelected(null);}}/>)}</div>}
   <div className="object-tray" aria-label="Figurat për t’u vendosur">{tokens.filter(t=>!slots.includes(t.id)).map(token=><DragObject key={token.id} token={token} disabled={blocked} selected={selected===token.id} onSelect={()=>{play('pick');setSelected(selected===token.id?null:token.id);}}/>)}{(gridMemory?tokens.every(t=>slots.includes(t.id)):slots.every(Boolean))&&<p>{gridMemory?'Figurat u vendosën. Vendet e tjera mbeten bosh.':'Të gjitha vendet u plotësuan. Kontrollo zgjedhjen!'}</p>}</div>
   <DragOverlay dropAnimation={null}>{active&&<div className="drag-object-overlay"><PlayArt {...active}/><span>{active.label}</span></div>}</DragOverlay>
  </DndContext>
  <p className="sr-only" role="status">{notice}</p>{memoryVisible&&<p className="memory-countdown" role="status">Shiko me kujdes · {remaining} sekonda</p>}
  <div className="game-controls">{gridMemory&&selected&&slots.includes(selected)&&<button className="secondary" disabled={blocked} onClick={()=>{setSlots(previous=>previous.map(v=>v===selected?null:v));setSelected(null);}}>Hiq figurën e zgjedhur</button>}{memoryGame&&<button className="secondary" disabled={disabled||memoryVisible} onClick={()=>{setMemoryVisible(true);setRemaining(previewSeconds);setMemoryRound(n=>n+1);}}><Eye size={18}/> Shiko sërish</button>}<button className="secondary" disabled={blocked||slots.every(v=>!v)} onClick={()=>{setSlots(targets.map(()=>null));setSelected(null);setNotice('Figurat u kthyen në fillim.');}}><RotateCcw size={18}/> Nga fillimi</button><button className="primary" disabled={blocked||(gridMemory?tokens.some(t=>!slots.includes(t.id)):slots.some(v=>!v))} onClick={()=>onAnswer(JSON.stringify(slots.map(v=>v||'_')))}>Kontrollo <ArrowRight size={20}/></button></div>
 </div>;
}
function DragObject({token,disabled,selected,onSelect}:{token:PlayObject;disabled:boolean;selected:boolean;onSelect:()=>void}){
 const {attributes,listeners,setNodeRef,isDragging}=useDraggable({id:token.id,disabled});
 return <button ref={setNodeRef} {...attributes} {...listeners} className={'drag-object '+(selected?'object-selected':'')} style={{opacity:isDragging?.25:1} as CSSProperties} disabled={disabled} aria-label={`Zgjidh ${token.label}`} aria-pressed={selected} onClick={onSelect}><PlayArt {...token}/><span>{token.label}</span></button>;
}
function DropPlace({compact,position,target,token,disabled,selected,choose,select,remove}:{compact?:boolean;position?:CSSProperties;target:PlayTarget;token?:PlayObject;disabled:boolean;selected:string|null;choose:()=>void;select:(id:string)=>void;remove:()=>void}){
 const {setNodeRef,isOver}=useDroppable({id:target.id,disabled});
 return <div ref={setNodeRef} style={position} className={`drop-place ${isOver?'drop-over':''} ${token?'drop-filled':''}`}>
  {token?<><DragObject token={token} disabled={disabled} selected={selected===token.id} onSelect={()=>selected&&selected!==token.id?choose():select(token.id)}/>{!compact&&!disabled&&<button className="remove-object" aria-label={`Hiq ${token.label}`} onClick={remove}><X size={15}/></button>}{!compact&&<button className="replace-object" disabled={disabled||!selected||selected===token.id} aria-label={`Vendos te ${target.label}`} onClick={choose}>Ndërro</button>}</>:<button className="slot-select" disabled={disabled} aria-label={`Vendos te ${target.label}`} onClick={choose}><span className={target.silhouette?'target-cue silhouette':'target-cue'}>{target.cue?<PlayArt asset={target.cue} color={target.color} quantity={target.quantity} rotation={target.rotation}/>:<span className="slot-question">?</span>}</span><span className="drop-plus">+</span></button>}
  <strong className="target-label">{target.label}</strong>
 </div>;
}
