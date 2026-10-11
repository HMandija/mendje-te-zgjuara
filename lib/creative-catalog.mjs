// Public metadata for the six original interactive learning families.
/** @type {[string,string,string,string,string[]][]} */
export const CREATIVE_FAMILIES=[
 ['draw','Vizato me kod','code','Ndërto figura me hapa, kthesa dhe përsëritje.',['Shiko modelin me vijë të ndërprerë.','Shto komandat dhe shtyp Vizato.','Korrigjo rrugën dhe kontrollo vizatimin.']],
 ['events','Personazhe që reagojnë','code','Lidh një ngjarje me një veprim dhe provo skenën.',['Shiko çfarë duhet të bëjë çdo personazh.','Zgjidh veprimin për secilën ngjarje.','Provo ngjarjet në skenë, pastaj kontrollo rregullat.']],
 ['story','Tregime interaktive','whatif','Zgjidh, parashiko dhe kupto arsyet në një histori.',['Lexo historinë me një të rritur nëse duhet.','Zgjidh një veprim dhe shiko si vazhdon historia.','Përgjigju pyetjeve dhe kontrollo arsyetimin.']],
 ['objects','Numrat si sende','math','Ndërto numra dhe grupe duke lëvizur sende.',['Shiko sa kërkon çdo shportë.','Tërhiq një send ose preke, pastaj prek shportën.','Numëro vlerën e sendeve dhe kontrollo grupet.']],
 ['tangram','Tangram','spatial','Bashko shtatë pjesë dhe rindërto siluetën.',['Zgjidh një pjesë dhe vendose mbi tabelë.','Lëvize dhe rrotulloje me butonat ose tastierën.','Mbulo siluetën pa mbivendosur pjesët.']],
 ['color','Ngjyros numrat dhe shkronjat','logic','Lidh çdo numër ose shkronjë me ngjyrën e tij.',['Zgjidh një ngjyrë nga çelësi poshtë tabelës.','Prek rrethet që kanë të njëjtin numër ose shkronjë.','Ngjyros të gjithë rrethet dhe shtyp Kontrollo.']],
 ['rules','Ndrysho rregullin','logic','Klasifiko figurat dhe përshtatu kur rregulli ndryshon.',['Lexo rregullin e raundit.','Vendos çdo figurë në grupin që kërkohet.','Në raundin tjetër lexo rregullin e ri para se të veprosh.']]
];
export function creativeLessons(grade){return CREATIVE_FAMILIES.filter(([kind])=>kind!=='color'||grade<=2).map(([kind,title,category,description,tutorial],variant)=>({id:`creative-g${grade}-${kind}`,grade,recommendedGrade:grade,domain:kind,category,variant,title:`${title} · ${['Zbulo','Lidh dhe provo','Planifiko','Strategji'][grade-1]}`,description:`Për klasën ${grade}. ${description}`,tutorial,levels:30,creative:true,objective:`Klasa ${grade}: ${description} Gjashtë etapa: model, praktikë, lidhje, zbatim, strategji dhe krijim.`}));}
