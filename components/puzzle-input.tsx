'use client';
import {CreativeGame} from './creative-games';
import {useState} from 'react';
import {DndContext,closestCenter,PointerSensor,KeyboardSensor,useSensor,useSensors,type DragEndEvent} from '@dnd-kit/core';
import {SortableContext,useSortable,arrayMove,verticalListSortingStrategy,sortableKeyboardCoordinates} from '@dnd-kit/sortable';
import {CSS} from '@dnd-kit/utilities';
import {PipeGame,MazeGame} from './board-games';
import {RobotGame} from './robot-game';
import type {RobotBoard} from '../lib/play-types';
import {PlacementGame} from './placement-game';
import {useExperience} from './experience-provider';
import {IllustratedLine} from './play-art';
import type {PlayInteraction,PipeBoard,MazeBoard} from '../lib/play-types';
import {GripVertical} from 'lucide-react';
import type {PublicPuzzle} from '../lib/learning-types';
export function PuzzleInput({puzzle,disabled,selected,correct,onAnswer}:{puzzle:PublicPuzzle;disabled:boolean;selected?:string;correct?:boolean;onAnswer:(value:string)=>void}){
 const {play}=useExperience();
 const [order,setOrder]=useState(puzzle.interaction?.items||[]);
 const [cells,setCells]=useState<string[]>(Array(puzzle.interaction?.cells?.length||0).fill(''));
 const [number,setNumber]=useState('');
 const sensors=useSensors(useSensor(PointerSensor,{activationConstraint:{distance:8}}),useSensor(KeyboardSensor,{coordinateGetter:sortableKeyboardCoordinates}));
 function move(from:number,to:number){play('drop');setOrder(previous=>arrayMove(previous,from,to));}
 function finishDrag({active,over}:DragEndEvent){if(!disabled&&over&&active.id!==over.id)move(order.indexOf(String(active.id)),order.indexOf(String(over.id)));}
 if(puzzle.type==='creative'&&puzzle.interaction?.creative)return <CreativeGame board={puzzle.interaction.creative} disabled={disabled} onAnswer={onAnswer}/>;
 if(puzzle.type==='robot')return <RobotGame board={puzzle.interaction as RobotBoard} disabled={disabled} onAnswer={onAnswer}/>;
 if(puzzle.type==='pipes')return <PipeGame board={puzzle.interaction as PipeBoard} disabled={disabled} onAnswer={onAnswer}/>;
 if(puzzle.type==='maze')return <MazeGame board={puzzle.interaction as MazeBoard} disabled={disabled} onAnswer={onAnswer}/>;
 if(puzzle.type==='placement')return <PlacementGame interaction={puzzle.interaction as PlayInteraction} disabled={disabled} onAnswer={onAnswer}/>;
 if(puzzle.type==='ordering')return <div className="puzzle-interaction"><p>Rendit me dorezën e tërheqjes ose butonat lart/poshtë.</p><DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={()=>play('pick')} onDragEnd={finishDrag} accessibility={{screenReaderInstructions:{draggable:'Për të ngritur një element, shtyp hapësirën. Lëvize me shigjetat. Shtyp sërish hapësirën për ta vendosur ose Escape për ta anuluar.'},announcements:{onDragStart:({active})=>`Po lëviz ${active.id}.`,onDragOver:({active,over})=>over?`${active.id} te pozicioni ${order.indexOf(String(over.id))+1}.`:'Jashtë listës.',onDragEnd:({active,over})=>over?`${active.id} u vendos te pozicioni ${order.indexOf(String(over.id))+1}.`:'Lëvizja u anulua.',onDragCancel:()=> 'Lëvizja u anulua.'}}}><SortableContext items={order} strategy={verticalListSortingStrategy}><ol className="ordering-list">{order.map((item,i)=><OrderingItem key={item} item={item} index={i} count={order.length} disabled={disabled} move={move}/>)}</ol></SortableContext></DndContext><button className="primary" disabled={disabled} onClick={()=>onAnswer(JSON.stringify(order))}>Kontrollo rendin</button></div>;
 if(puzzle.type==='grid')return <div className="puzzle-interaction"><fieldset disabled={disabled}><legend>Zgjidh + për Po ose − për Jo në çdo rresht.</legend>{puzzle.interaction?.cells?.map((cell,i)=><div className="logic-cell" key={i}><span>{cell}</span>{['+','−'].map(value=><button key={value} className={cells[i]===value?'selected':''} aria-pressed={cells[i]===value} aria-label={`${cell}: ${value==='+'?'po':'jo'}`} onClick={()=>setCells(prev=>prev.map((v,n)=>n===i?value:v))}>{value}</button>)}</div>)}</fieldset><button className="primary" disabled={disabled||cells.some(v=>!v)} onClick={()=>onAnswer(JSON.stringify(cells))}>Kontrollo tabelën</button></div>;
 if(puzzle.type==='number')return <form className="number-answer" onSubmit={e=>{e.preventDefault();onAnswer(number);}}><label>Përgjigjja jote<input required inputMode="numeric" pattern="-?[0-9]{1,6}" maxLength={7} disabled={disabled} value={number} onChange={e=>setNumber(e.target.value)} /></label><button className="primary" disabled={disabled}>Kontrollo numrin</button></form>;
 return <>{puzzle.type==='balance'&&<svg className="balance-art" viewBox="0 0 280 120" role="img" aria-label="Peshore në ekuilibër; përdor barazimin e pyetjes"><path d="M140 20v85M65 28h150M40 110h200" fill="none" stroke="#7751a8" strokeWidth="7" strokeLinecap="round"/><path d="M65 28 32 75h66L65 28ZM215 28l-33 47h66l-33-47Z" fill="#eee5fa" stroke="#7751a8" strokeWidth="3"/><circle cx="140" cy="28" r="10" fill="#55b978"/></svg>}<div className="answers">{puzzle.options.map(option=><button key={option} className={'answer '+(selected===option?(correct?'correct':'wrong'):'')} disabled={disabled} onClick={()=>onAnswer(option)}><IllustratedLine text={option}/>{selected===option&&correct?' ✓':''}</button>)}</div></>;
}
function OrderingItem({item,index,count,disabled,move}:{item:string;index:number;count:number;disabled:boolean;move:(from:number,to:number)=>void}){
 const {attributes,listeners,setNodeRef,transform,transition,isDragging}=useSortable({id:item,disabled});
 return <li ref={setNodeRef} style={{transform:CSS.Transform.toString(transform),transition,zIndex:isDragging?2:undefined}} className={isDragging?'is-dragging':''}><button className="drag-handle" {...attributes} {...listeners} disabled={disabled} aria-label={`Tërhiq ${item}`}><GripVertical size={20}/></button><span>{item}</span><button disabled={disabled||index===0} aria-label={`Lëviz ${item} lart`} onClick={()=>move(index,index-1)}>↑</button><button disabled={disabled||index===count-1} aria-label={`Lëviz ${item} poshtë`} onClick={()=>move(index,index+1)}>↓</button></li>;
}
