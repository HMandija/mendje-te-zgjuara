// Grade-specific names describe the skill, rather than adding a grade suffix.
const names={
 logic:[
  ['Kutia me më shumë','Shkallët e madhësive','Sendi që nuk përshtatet','Pjesa që mungon','Dy shenja për një figurë','Familjet e sendeve','Pohimi i vogël','Radha e miqve','Mundësitë në shportë','Numri pas perdes'],
  ['Krahasimi i tri kutive','Parada e sasive','Numri jashtë gardhit','A mjaftojnë të dhënat?','Mes dy kufijve','Njëri nga dy kushtet','Kontrolluesi i pohimeve','Zinxhiri i krahasimeve','Kufiri i parë','Dy të dhëna për një numër'],
  ['Peshorja e arsyetimit','Renditja me diferenca','Përjashtimi në interval','Lidhja që mungon','Porta me dy kushte','Bashkimi i mundësive','Tabela e së vërtetës','Nga A te C','Më i vogli i lejuar','Dosja e numrit të fshehur'],
  ['Vendimi me prova','Hierarkia e sasive','Kontrolli i kufijve','Përfundimi i pasigurt','Filtri i dyfishtë','Rruga e kushteve alternative','Verifikimi i argumenteve','Ura e transitivitetit','Strategjia e minimumit','Hetimi me dy dëshmi'],
 ],
 math:[
  ['Shporta e mbledhjes','Lapsat që mbetën','Mbledhësi i fshehur','Nisja para zbritjes','Dy grupe në një shportë','Ndarja mes miqve','Fqinji i mesit','Dhjetëshet me njësi','Tre grupe së bashku','Kutia që plotëson shumën'],
  ['Rafti i sasive','Diferenca e librave','Pjesa e munguar e shumës','Numri përpara heqjes','Grupet me mbledhje','Shpërndarja e barabartë','Numri mes fqinjëve','Punishtja e dhjetësheve','Mbledhja me dy hapa','Pesha brenda kutisë'],
  ['Bilanci i mbledhjes','Matja e ndryshimit','Ekuacioni me një boshllëk','Zbritja në të kundërt','Kutitë e shumëzimit','Ndarësi i grupeve','Pika brenda intervalit','Ndërtuesi i numrave','Rendi i dy veprimeve','Peshorja me të panjohur'],
  ['Llogaria e furnizimeve','Diferenca në inventar','Shuma me të panjohur','Rikthimi te vlera fillestare','Prodhimi i grupeve','Shpërndarja në disa kuti','Kufijtë e numrit të plotë','Arkitektura e numrit','Laboratori i shprehjeve','Barazpesha numerike'],
 ],
 patterns:[
  ['Treni që shton','Shkallët që zbresin','Dy hapa në valle','Çifti që përsëritet','Hapat që zmadhohen','Vrima në varg','Sa shton treni?','Dy shtigje me numra','Numrat në dyshe','Vendi i ardhshëm'],
  ['Shiritat e rritjes','Numërimi mbrapsht','Ritmi i dy shtesave','Rradha e alternuar','Shtesa që ndryshon','Kartela bosh','Gjej madhësinë e hapit','Vargjet që takohen','Çiftet e rritura','Parashikimi në distancë'],
  ['Progresioni i fshehur','Zbritja me intervale','Alternimi i hapave','Cikli numerik','Shkallë me shtesa të reja','Vendos vlerën e mesit','Diferenca e përbashkët','Dy linja paralele','Progresioni në çifte','Kërkimi i termit të largët'],
  ['Motori i progresionit','Rruga e vargut zbritës','Modeli me dy operatorë','Përsëritja e strukturuar','Diferencat që rriten','Korrigjuesi i vargut','Nxirr rregullin numerik','Dekodimi i vargjeve të ndërthurura','Dyfishimi i pozicioneve','Formula e parashikimit'],
 ],
 spatial:[
  ['Hapat drejt diellit','Lart e poshtë në hartë','Ec dhe kthehu','Rrotullimi në të djathtë','Rrotullimi në të majtë','Hija e shokut','Uji te lulja','Tubat e oborrit','Shtegu i breshkës','Dalja nga kopshti'],
  ['Lindja në hartën time','Veriu i udhëtimit','Matësit e ecjes','Kthesat e kompasit','Rrotullimi i kundërt','Hijet me drejtim','Ujitja me kthesa','Rrjeti i lagjes','Kryqëzimet e shtegut','Harta e kthimit'],
  ['Zhvendosja horizontale','Zhvendosja vertikale','Gjatësia e udhëtimit','Busulla me disa kthesa','Kthimi i busullës','Laboratori i siluetave','Tubacionet e parkut','Lidhja e të gjitha degëve','Eksplorimi i korridoreve','Rruga e ekspeditës'],
  ['Bilanci lindje–perëndim','Bilanci veri–jug','Matja e dy segmenteve','Ciklet e orientimit','Strategjia e kthesave majtas','Transformimet e formave','Inxhinieria e ujit','Projektimi i rrjetit','Strategjia në labirint','Planifikuesi i daljes'],
 ],
 memory:[
  ['Dritaret e mollëve','Cepat e oborrit','Figurat në rresht','Figurat në kolonë','Harta e lodrave','Kush ishte më parë?','Më i madhi që pashë','Më i vogli që pashë','Sa herë e pashë?','Dy skajet e vargut'],
  ['Rrjeti i kujtimeve','Kujtesa e cepave','Rreshti i fshehur','Kolona e fshehur','Vendet e miqve','Fqinji i mëparshëm','Numri kryesor në kujtesë','Numri i vogël i fshehur','Numërimi nga kujtesa','Shuma e dy skajeve'],
  ['Koordinatat e figurave','Pikat e vëzhgimit','Rikrijimi i rreshtave','Rikrijimi i kolonave','Harta pas perdes','Gjurmimi i paraardhësit','Maksimumi i vëzhguar','Minimumi i vëzhguar','Frekuenca e numrit','Llogaritja pas vëzhgimit'],
  ['Arkivi i pozicioneve','Strategjia e orientimit në rrjet','Kodi i rreshtit','Kodi i kolonës','Rindërtimi i hartës','Paraardhësi në sekuencë','Përzgjedhja e maksimumit','Përzgjedhja e minimumit','Analiza e përsëritjeve','Dy skaje, një rezultat'],
 ],
 thinking:[
  ['Edhe një në shportë','Një send më pak','Dy shporta njësoj','Një shtesë për grup','Nisja me më shumë','Grupi që largohet','Grupi që bashkohet','Dy plane për lodrat','Ndryshimi i dy gjërave','Sendet ndërrojnë kuti'],
  ['Shtesa e papritur','Heqja e vogël','Dyfishimi i koleksionit','Shtesa për secilën kuti','Nisja e ndryshuar','Heqja e një kutie','Kutia e re','Krahasimi i planeve','Dy ndryshime së bashku','Sasia gjatë transferimit'],
  ['Parashikimi i shtesës','Parashikimi i heqjes','Zgjerimi i dyfishtë','Çdo grup ndryshon','Ndikimi i vlerës fillestare','Grupimi pas heqjes','Grupimi pas shtimit','Diferenca e dy planeve','Dy kushte, një parashikim','Ruajtja e totalit'],
  ['Analiza e një ndryshimi','Ndryshimi i bilancit','Efekti i dyfishimit','Zgjerimi i çdo grupi','Strategjia e nisjes së re','Modeli pas përjashtimit','Modeli pas zgjerimit','Vlerësimi i alternativave','Skenari me dy ndërhyrje','Ligji i sasisë së ruajtur'],
 ],
 algorithm:[
  ['Parada nga i vogli','Parada nga i madhi','Hapat e numërimit','Kthimi në vijën e numrave','Shto në shportë','Sa shigjeta shikon?','Dy udhëzime të vogla','Gjej pikën e nisjes','Distanca mes numrave','Ndreq planin e shportës'],
  ['Renditja e kartelave','Rendi i kundërt i kartelave','Shtimi i përsëritur','Zbritja e përsëritur','Porta e kushtit','Matësi i cikleve','Udhëzimet në radhë','Nisja nga rezultati','Numërimi i hapave','Prova e planit'],
  ['Algoritmi në rritje','Algoritmi në zbritje','Cikli i shtesave','Cikli i heqjeve','Dega e vendimit','Gjurmuesi i cikleve','Dy operatorë në seri','Algoritmi në të kundërt','Llogaritja e distancës','Kontrolli i ekzekutimit'],
  ['Renditja me strategji','Përmbysja e sekuencës','Akumulatori i shtesave','Akumulatori i zbritjeve','Përzgjedhja me kusht','Analiza e cikleve','Përbërja e udhëzimeve','Zbulimi i gjendjes fillestare','Numri i iterimeve','Verifikuesi i algoritmit'],
 ],
 programming:[
  ['Shigjeta te arushi','Plani me dy shigjeta','Arushi ngjitet e zbret','Arushi ndërron anë','Flamuri i kopshtit','Komandat e vogla','Ndalesa te lulja','Arushi kërkon korrigjim','Nisja hap pas hapi','Udhëtimi me lodrat'],
  ['Blloqet e para të arushit','Rendi i rrugëtimit','Plani me dy drejtime','Ndryshimi i drejtimit','Vizita te dy yje','Përsëritja në rrugë','Dy blloqe për një mision','Provoje rrugëtimin','Komanda e gabuar','Harta e programit'],
  ['Variabla në ekran','Përditësimi i variablës','Bashkëpunimi i dy variablave','Kushti mbi kufi','Kushti nën kufi','Cikli i variablës','Dy blloqe për një vlerë','Dalja pas zbritjes','Riparimi i daljes','Gjurmimi i ciklit'],
  ['Gjendja fillestare e programit','Ndryshimi i gjendjes','Lidhja e dy vlerave','Dega e maksimumit','Dega e minimumit','Përsëritja e llogaritjes','Përpunimi me dy blloqe','Analiza e daljes','Riparimi i rezultatit','Ekzekutimi hap pas hapi'],
 ],
 robotics:[
  ['Arushi gjen flamurin','Shëtitja drejt lindjes','Shëtitja drejt jugut','Shëtitja drejt perëndimit','Ylli në oborr','Dy ndalesa në kopsht','Arushi ndjek shtegun','Pikniku me ndalesa','Arushi në rrugën e gjatë','Aventura e parë në pyll'],
  ['Misioni i flamurit blu','Nisja nga lindja e parkut','Nisja nga jugu i parkut','Nisja nga perëndimi i parkut','Mbledhësi i yjeve','Shëtitja me dy objektiva','Rruga mes luleve','Harta e ndalesave','Udhëtimi i zgjatur','Ekspedita e parkut'],
  ['Roboti në korridor','Orientimi nga lindja','Orientimi nga jugu','Orientimi nga perëndimi','Ndjekësi i objektivit','Planifikimi i dy qëllimeve','Programi i rrugës së pyllit','Ndalesat në program','Cikli i udhëtimit','Eksploruesi me blloqe'],
  ['Strategjia e flamurit','Busulla e nisjes lindore','Busulla e nisjes jugore','Busulla e nisjes perëndimore','Misioni me prioritete','Itinerari me disa objektiva','Kushtet në shtegun e robotit','Planifikimi i vizitave','Programi i ekspeditës së gjatë','Inxhinieri i arushit'],
 ],
 observation:[
  ['Çiftet në tavolinë','Tekët në tavolinë','Numri që prin','Numri i vogël në radhë','Numri që del dy herë','Mbledhja me gabim','Zbritja me gabim','Numrat mbi shenjë','Numrat nën shenjë','Ndryshimi i vogël'],
  ['Vëzhguesi i numrave çift','Vëzhguesi i numrave tek','Kartela më e madhe','Kartela më e vogël','Numri i përsëritur','Ndreq mbledhjen','Ndreq zbritjen','Kufiri i sipërm në rresht','Kufiri i poshtëm në rresht','Sa ndryshoi kartela?'],
  ['Filtri i numrave çift','Filtri i numrave tek','Maksimumi në koleksion','Minimumi në koleksion','Detektivi i përsëritjes','Kontrolli i shumës','Kontrolli i diferencës','Numërimi mbi prag','Numërimi nën prag','Matja e rritjes'],
  ['Analiza e çiftësisë','Analiza e numrave tek','Përzgjedhja e vlerës maksimale','Përzgjedhja e vlerës minimale','Gjurma e dublimit','Auditimi i mbledhjes','Auditimi i zbritjes','Filtrimi mbi kufi','Filtrimi nën kufi','Diferenca para–pas'],
 ],
};
const creativeNames={
 draw:['Lapsi në shtegun e parë','Vizato kthesa me komandat','Studioja e vizatimit me kod','Arkitekti i vijave me program'],
 events:['Miqtë reagojnë me një prekje','Lidh ngjarjen me veprimin','Regjisori i reagimeve','Laboratori i ngjarjeve dhe pasojave'],
 story:['Përrallat e zgjedhjeve të vogla','Historitë me vendime','Detektivi brenda tregimit','Strategjitë në tregime interaktive'],
 objects:['Shportat me sende','Ndërto grupet e numrave','Punishtja e dhjetësheve dhe njësive','Qindëshet në laborator'],
 tangram:['Shtatë pjesët e figurës','Mozaiku i tangramit','Siluetat që ndërtojmë','Transformimet me shtatë pjesë'],
 color:['Ngjyrat e numrave dhe shkronjave','Kodi me shkronja shumëngjyrëshe'],
 rules:['Grupet që ndryshojnë','Klasifiko me rregullin e ri','Filtrat e figurave','Vendimet me rregulla të ndërthurura'],
};
export function lessonName(domain,grade,variant){const name=names[domain]?.[grade-1]?.[variant];if(!name)throw new RangeError('Unknown lesson name');return name;}
export function creativeName(domain,grade){const name=creativeNames[domain]?.[grade-1];if(!name)throw new RangeError('Unknown creative name');return name;}
export const robotCourseNames=['Arushi dhe flamuri i parë','Blloqet e aventurës së arushit','Ekspedita me kthesa dhe cikle','Misionet e robotit strateg'];
