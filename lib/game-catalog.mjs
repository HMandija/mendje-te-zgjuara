// Public curriculum metadata only. No solutions or puzzle generators.
export const gameScenes=['memory-grid','pipes','maze','shadows','garden','path','patterns','memory','wheels'];
const assets=['memory-grid','pipes','maze','fox','flower','road-down','pear','basket','bike'];
const names=[
 ['Dritaret me figura','Pikat e ujit','Shëtitja e breshkës','Kafshët dhe hijet','Numëroj petalet','Pllakat e para','Çiftet e frutave','Pikniku i vogël','Numëroj rrotat'],
 ['Rrjeti i kujtesës','Kthesat e kopshtit','Kryqëzimet e pyllit','Hijet që rrotullohen','Kopshti i mbledhjes','Rrugët me kthesa','Grupet që përsëriten','Shporta e kujtesës','Garazhi i mbledhjes'],
 ['Harta e figurave','Rrjeti i ujit','Ekspedita në labirint','Detektivi i formave','Kopshti i shumëzimit','Arkitekti i rrugës','Vargjet me numra','Laboratori i kujtesës','Garazhi i shumëzimit'],
 ['Koordinatat e kujtesës','Inxhinieri i tubave','Misioni i labirintit','Studioja e transformimeve','Kopshti me dy veprime','Planifikuesi i rrugëve','Rregullat e fshehta','Arkivi i kujtesës','Garazhi me dy veprime']
];
const descriptions=[
 ['Mbaj mend 1–4 figura.','Lidh rrjete të vogla.','Ndiq korridoret e shkurtra.','Përputh kafshë dhe sende.','Lidh numrin me petalet.','Vendos pllakat sipas daljeve.','Vazhdo çiftet e përsëritura.','Kujto rendin e 2–5 sendeve.','Lidh mjetin me numrin e rrotave.'],
 ['Kujto rreshtin dhe kolonën.','Planifiko kthesa në një rrjet.','Zgjidh mes disa degëve.','Krahaso edhe drejtimin.','Zgjidh mbledhje dhe zbritje.','Lidh një varg me kthesa.','Përsërit grupe me 3 figura.','Rikrijo 3–6 sende në rend.','Zgjidh veprime me rrota.'],
 ['Rikrijo 4–7 pozicione.','Lidh të gjitha degët e rrjetit.','Planifiko një rrugë më të gjatë.','Dallo forma në drejtime të ndryshme.','Përdor shumëzim dhe pjesëtim.','Ndërto rrugë me më shumë pllaka.','Zbulo hapin e një vargu numerik.','Mbaj mend 4–7 sende.','Zgjidh shumëzim dhe pjesëtim.'],
 ['Kujto deri në 9 pozicione.','Planifiko rrjete deri në 5 × 5.','Eksploro dhe kthehu te kryqëzimet.','Krahaso deri në 7 forma të rrotulluara.','Zgjidh shprehje me dy veprime.','Planifiko rrugë me 7 pllaka.','Zbulo vargje me hapa që ndryshojnë.','Rikrijo rendin e deri në 7 sendeve.','Lidh dy veprime me numrin e rrotave.']
];
export function gamesForGrade(grade){return gameScenes.map((scene,i)=>({scene,grade,recommendedGrade:grade,asset:assets[i],title:names[grade-1][i],description:descriptions[grade-1][i],levels:20}));}
export function difficultyBand(level){return ['Hapat e parë','Zbulo rregullin','Mendo disa hapa','Sfida e madhe'][Math.floor((level-1)/5)];}
export function gameCategoryCount(cat){return ({spatial:40,math:20,code:60,patterns:20,memory:40,logic:20})[cat]||0;}
