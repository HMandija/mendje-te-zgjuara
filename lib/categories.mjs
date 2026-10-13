export const CATEGORIES=[
 {id:'errors',name:'Gjej gabimin',icon:'⌕',tint:'var(--category-errors)',desc:'Kontrollo një zgjidhje dhe zbulo hapin që duhet korrigjuar.'},
 {id:'whatif',name:'Po sikur…?',icon:'?',tint:'var(--category-whatif)',desc:'Ndrysho një kusht, parashiko dhe shpjego çfarë ndodh.'},
 {id:'logic',name:'Detektivët e logjikës',icon:'◇',tint:'var(--category-logic)',desc:'Krahaso, lidh të dhënat dhe zbulo çfarë mund të dimë.'},
 {id:'patterns',name:'Modele & vargje',icon:'▦',tint:'var(--category-patterns)',desc:'Gjej rregullin dhe parashiko hapin që vjen më pas.'},
 {id:'math',name:'Matematikë në jetë',icon:'＋',tint:'var(--category-math)',desc:'Zgjidh probleme me numra, sende dhe situata të përditshme.'},
 {id:'spatial',name:'Mendo në hapësirë',icon:'↗',tint:'var(--category-spatial)',desc:'Ndiq drejtimet dhe imagjino lëvizjen në një rrjet.'},
 {id:'memory',name:'Kujtesë & vëmendje',icon:'◎',tint:'var(--category-memory)',desc:'Vëzhgo me kujdes dhe mbaj mend rendin e simboleve.'},
 {id:'code',name:'Hapat e zgjuar',icon:'⌘',tint:'var(--category-code)',desc:'Planifiko hapa, ndiq udhëzime dhe zbulo gabimet.'}
];

const gradeNames={errors:['Gjej gabimin e vogël','Korrigjo hapin e humbur','Detektivi i zgjidhjeve','Auditimi i arsyetimit'],whatif:['Po të ndryshojë një send?','Provo një kusht të ri','Laboratori i parashikimeve','Skenarët me disa kushte'],logic:['Zbuluesit e formave','Lidhjet e zgjuara','Provat e detektivit','Argumentet dhe përfundimet'],patterns:['Vargjet e para me figura','Ritmet dhe përsëritjet','Modelet numerike në veprim','Sekreti i vargjeve të ndërlikuara'],math:['Numrat në lojën time','Llogaritjet e përditshme','Problemet me grupe','Matematika me disa hapa'],spatial:['Hapat në hartën e vogël','Kthesat në rrugët e mia','Orientimi në rrjet','Strategjitë e hapësirës'],memory:['Kujto figurën e parë','Kujtesa e rendit','Harta e vëzhgimeve','Arkivi i kujtesës së saktë'],code:['Rendit veprimet e vogla','Plani me përsëritje','Udhëzimet që ndërtojnë zgjidhje','Algoritmet me vendime']};
export function categoriesForGrade(grade){if(![1,2,3,4].includes(grade))throw new RangeError('Grade must be 1–4');return CATEGORIES.map(c=>({...c,name:gradeNames[c.id][grade-1]}));}
export function mixedQuizName(grade){return ['Kuize të përziera · Zbulimet e vogla','Kuize të përziera · Lidhjet e reja','Kuize të përziera · Provat e mendimit','Kuize të përziera · Strategjitë e mia'][grade-1];}
