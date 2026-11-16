module.exports=function themeColors(file,source){
 if(!/[/\\]@scratch[/\\]scratch-(gui|paint)[/\\]src[/\\]css[/\\]colors\.css$/.test(file))return source;
 const colors={'ui-primary':'#e8f5ff','ui-secondary':'#edf6fc','ui-tertiary':'#d3e6ef','ui-modal-overlay':'rgba(40,108,67,.88)','ui-alert-overlay':'rgba(40,108,67,.35)','text-primary':'#344449','text-primary-transparent':'rgba(52,68,73,.75)','motion-primary':'#32834f','looks-secondary':'#286c43','looks-secondary-dark':'#205636','looks-transparent':'rgba(40,108,67,.35)','looks-light-transparent':'rgba(40,108,67,.15)','ui-pane-border':'#8aa9b9','ui-pane-gray':'#edf6fc','ui-background-blue':'#e8f5ff','form-border':'#8aa9b9'};
 if(!source.includes('$looks-secondary:'))throw new Error('Unsupported editor color palette.');
 return source.replace(/\$([\w-]+):\s*[^;]+;/g,(declaration,name)=>colors[name]?'$'+name+': '+colors[name]+';':declaration);
};
