export function progress(sessions,profile,grade,now=new Date()){
 const rows=sessions.filter(s=>s.verified&&s.profile===profile&&s.grade===grade),answers=rows.flatMap(s=>s.answers);
 const dates=[...new Set(rows.map(s=>s.date?.slice(0,10)).filter(Boolean))].sort();
 const today=now.toISOString().slice(0,10);let cursor=new Date(today+'T00:00:00Z');
 if(!dates.includes(today))cursor.setUTCDate(cursor.getUTCDate()-1);
 let streak=0;while(dates.includes(cursor.toISOString().slice(0,10))){streak++;cursor.setUTCDate(cursor.getUTCDate()-1);}
 const levels=[1,2,3].map(level=>{const attempts=rows.filter(s=>s.level===level);const stars=Math.max(0,...attempts.map(s=>s.stars||0));return {level,stars,attempts:attempts.length};});
 const skills=[...new Set(answers.map(a=>a.cat))].map(cat=>{const a=answers.filter(v=>v.cat===cat);return {cat,total:a.length,accuracy:Math.round(a.filter(v=>v.correct).length/a.length*100)};}).sort((a,b)=>a.accuracy-b.accuracy);
 const badges=[rows.length>=1?'Hapi i parë':null,answers.length>=20?'Eksplorues':null,streak>=3?'Tre ditë kureshtje':null,levels.every(l=>l.stars>=2)?'Mjeshtër i kursit':null].filter(Boolean);
 return {levels,stars:levels.reduce((n,l)=>n+l.stars,0),streak,dates,badges,skills,completed:rows.length,total:answers.length,accuracy:answers.length?Math.round(answers.filter(a=>a.correct).length/answers.length*100):0,duration:rows.reduce((n,s)=>n+(s.duration||0),0),certificate:levels.every(l=>l.stars>=2)};
}
export function starScore(answers){const ratio=answers.filter(a=>a.correct).length/answers.length;return ratio>=1?3:ratio>=.8?2:1;}
