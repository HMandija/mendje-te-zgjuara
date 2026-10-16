import {House} from 'lucide-react';

export function RobotHomeButton({href}:{href:string}){
 const label=href==='/student/learn'?'Kthehu në panelin e nxënësit':href==='/teacher'?'Kthehu në panelin e mësuesit':'Kthehu në faqen kryesore';
 return <a href={href} aria-label={label} title={label} style={{display:'inline-flex',alignItems:'center',justifyContent:'center',width:48,height:48,minWidth:48,minHeight:48,borderRadius:14,background:'#fff9eb',color:'#305b50',border:'1px solid #fff',boxShadow:'0 3px 12px #254b4520',textDecoration:'none'}}><House size={22}/></a>;
}
