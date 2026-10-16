'use client';
import {useEffect,useState} from 'react';
type Summary={profile:string;theme:number;stars:number;completed:number;seconds:number;intelligence:number;graduated:boolean;medals:number;trophy:boolean};
type Api=<T>(path:string,method?:string,data?:unknown)=>Promise<T>;
export function RobotWorldClassProgress({api,classId,students}:{api:Api;classId:string;students:{id:string;name:string}[]}){
 const [rows,setRows]=useState<Summary[]>([]),[error,setError]=useState(''),[refresh,setRefresh]=useState(0);
 useEffect(()=>{let live=true;void api<{students:Summary[]}>('/api/robot-world?class='+encodeURIComponent(classId)).then(result=>{if(live){setRows(result.students);setError('');}}).catch(()=>{if(live)setError('Progresi i robotit nuk u ngarkua.');});return()=>{live=false;};},[api,classId,refresh]);
 return <section className="panel"><div className="section-head"><h3>🤖 Bota e Robotit · Shtatë tema</h3><button className="secondary" onClick={()=>setRefresh(n=>n+1)}>Rifresko</button><a className="inline-link" href="/robot-world">Provo lojën →</a></div>{error?<p role="alert">{error}</p>:<div className="table-wrap"><table><thead><tr><th>Nxënësi</th><th>Tema</th><th>Yje</th><th>Mini-sfida</th><th>Inteligjenca</th><th>Medaljet</th><th>Koha</th></tr></thead><tbody>{students.map(p=>{const row=rows.find(r=>r.profile===p.id);return <tr key={p.id}><td>{p.name}</td><td>{row?.completed===84?'🏆 Përfunduar':`${row?.theme||1} · ${['Fabrika','Kafshët','Kopshti','Kuzhina','Shkolla','Vallëzimi','Gara'][(row?.theme||1)-1]}`} </td><td>{row?.stars||0} ★</td><td>{row?.completed||0} / 84</td><td>{row?.intelligence||1}/5 {row?.graduated?'🎓':''}</td><td>{row?.medals||0} {row?.trophy?'🏆':'🏅'}</td><td>{Math.floor((row?.seconds||0)/60)} min</td></tr>;})}</tbody></table></div>}</section>;
}
