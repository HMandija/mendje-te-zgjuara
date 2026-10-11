import {PuzzleArt} from './learning-art';
export function EmptyState({title,description,category='logic'}:{title:string;description:string;category?:string}){return <div className="empty-state"><div><PuzzleArt category={category}/></div><h3>{title}</h3><p>{description}</p></div>;}
