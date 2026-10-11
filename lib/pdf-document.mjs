// Small text PDF writer: embedded content only; no external rendering service.
export function pdfDocument(title,lines){
 const symbols={'⚽':'[top]','🧊':'[kub]','🍎':'[molle]','🟣':'[kumbull]','📘':'[liber]','✏️':'[laps]','📦':'[kuti]','🧸':'[loder]','🍐':'[dardhe]','📚':'[libra]','▲':'[trekendesh i mbushur]','△':'[trekendesh bosh]','■':'[katror]','●':'[rreth i mbushur]','○':'[rreth bosh]','◯':'[unaze]','★':'[yll]','◆':'[romb]','↑':'[lart]','↓':'[poshte]','→':'[djathtas]','←':'[majtas]'};
 const readable=s=>Object.entries(symbols).reduce((text,[symbol,name])=>text.replaceAll(symbol,name),String(s));
 const clean=s=>String(s).replace(/[−–—]/g,'-').replace(/[^\x20-\x7e\xa0-\xff]/g,' ').replaceAll('\\','\\\\').replaceAll('(','\\(').replaceAll(')','\\)');
 const wrapped=[title,'',...lines].flatMap(line=>{const words=readable(line).split(' '),rows=[];let current='';for(const word of words){if((current+' '+word).length>75){rows.push(current);current=word;}else current+=(current?' ':'')+word;}rows.push(current);return rows;});
 const blocks=[];let block=[];for(const line of wrapped){block.push(line);if(!line){blocks.push(block);block=[];}}if(block.length)blocks.push(block);const pages=[];let page=[];for(const block of blocks){if(block.length<=44&&page.length+block.length>44){pages.push(page);page=[];}for(const line of block){if(page.length===44){pages.push(page);page=[];}page.push(line);}}if(page.length)pages.push(page);
 const objects=['<< /Type /Catalog /Pages 2 0 R >>','', '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>'];
 const pageIds=[];
 for(const page of pages){const id=objects.length+1;pageIds.push(id);const stream='BT /F1 12 Tf 48 792 Td 16 TL '+page.map((line,i)=>(i?'T* ':'')+'('+clean(line)+') Tj').join('\n')+' ET';objects.push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 3 0 R >> >> /Contents ${id+1} 0 R >>`,`<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`);}
 objects[1]=`<< /Type /Pages /Kids [${pageIds.map(id=>id+' 0 R').join(' ')}] /Count ${pages.length} >>`;
 let content='%PDF-1.4\n',offsets=[0];objects.forEach((o,i)=>{offsets.push(content.length);content+=`${i+1} 0 obj\n${o}\nendobj\n`;});const xref=content.length;content+=`xref\n0 ${objects.length+1}\n0000000000 65535 f \n`+offsets.slice(1).map(n=>String(n).padStart(10,'0')+' 00000 n \n').join('')+`trailer\n<< /Size ${objects.length+1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
 return Uint8Array.from(content,c=>c.charCodeAt(0));
}
