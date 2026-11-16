export function localizeBlocks(bundle,translations){
 // The pinned GUI bundle does not export its internal block locale registry.
 const marker='On.currentLocale_="en",On.locales={ab:';
 if(bundle.split(marker).length!==2)throw new Error('Unsupported editor bundle: block locale marker not found exactly once.');
 const deleteLabel='"aria-label":"Delete"';
 if(bundle.split(deleteLabel).length!==2)throw new Error('Unsupported editor bundle: delete label not found exactly once.');
 return bundle.replace(marker,`On.currentLocale_="en",On.locales={sq:${JSON.stringify(translations)},ab:`).replace(deleteLabel,'"aria-label":"Fshi"');
}
