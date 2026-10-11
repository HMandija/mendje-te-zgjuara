'use client';
import {BarChart,Bar,XAxis,YAxis,ResponsiveContainer,Tooltip} from 'recharts';
import {useReducedMotion} from 'framer-motion';
import {CATEGORIES} from '../lib/categories.mjs';
export function SkillChart({skills}:{skills:{cat:string;accuracy:number}[]}){
 const reduced=useReducedMotion();
 const rows=skills.map(s=>({name:CATEGORIES.find(c=>c.id===s.cat)?.name||s.cat,accuracy:s.accuracy}));
 return <figure className="skill-chart"><figcaption>Saktësia sipas aftësisë</figcaption><div aria-hidden="true" className="chart-canvas"><ResponsiveContainer width="100%" height={Math.max(160,rows.length*44)}><BarChart accessibilityLayer={false} data={rows} layout="vertical" margin={{left:0,right:24}}><XAxis type="number" domain={[0,100]} tick={{fill:'var(--muted)'}} tickFormatter={value=>`${value}%`}/><YAxis type="category" dataKey="name" width={110} tick={{fill:'var(--ink)',fontSize:12}}/><Tooltip formatter={value=>[`${value}%`,'Saktësia']} contentStyle={{background:'var(--surface)',color:'var(--ink)',borderColor:'var(--line)',borderRadius:10}} cursor={{fill:'var(--surface-hover)'}}/><Bar dataKey="accuracy" fill="var(--chart-1)" radius={[0,8,8,0]} isAnimationActive={reduced===false}/></BarChart></ResponsiveContainer></div><table className="sr-only"><caption>Saktësia sipas aftësisë</caption><thead><tr><th>Aftësia</th><th>Saktësia</th></tr></thead><tbody>{rows.map(row=><tr key={row.name}><td>{row.name}</td><td>{row.accuracy}%</td></tr>)}</tbody></table></figure>;
}
