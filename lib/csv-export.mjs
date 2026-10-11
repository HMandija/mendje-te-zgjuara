export function csvExport(rows){return '\uFEFF'+rows.map(row=>row.map(value=>'"'+String(value).replace(/^(?=\s*[=+@-])/u,"'").replaceAll('"','""')+'"').join(',')).join('\r\n');}
