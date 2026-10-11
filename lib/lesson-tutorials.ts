export function lessonTutorial(scene?:string,category?:string):string[]{
 const tutorials:Record<string,string[]>={
 robot:['Shto blloqe me klikim ose tërheqje, në rendin që do të ndjekë roboti.','Shtyp Nis për të parë programin; Hap pas hapi tregon çdo komandë.','Në klasat 3–4, kthesat ndryshojnë drejtimin e robotit. Pastaj Ec përpara përdor drejtimin e ri.','Vizito yjet dhe arrij te flamuri. Një pengesë të ndihmon të gjesh komandën për t’u korrigjuar.'],
 pipes:['Prek një pllakë që ta rrotullosh me një çerek rrotullimi.','Bashko daljet e tubave me pllakat fqinje, pa skaje të hapura.','Lidh nisjen N me fundin F dhe shtyp Kontrollo lidhjen.'],
 maze:['Shiko nisjen e breshkës dhe piknikun ku duhet të arrijë.','Lëviz me shigjetat në ekran ose tastierë; muret nuk kalohen.','Mund të kthehesh një hap ose ta rifillosh rrugën. Në fund, kontrolloje.'],
 'memory-grid':['Shiko figurat dhe mbaj mend rreshtin e kolonën para se të fshihen.','Tërhiq secilën figurë te vendi që mban mend. Mund ta prekësh figurën dhe pastaj vendin.','Shiko sërish të jep edhe një mundësi. Vendet e papërdorura mbeten bosh.'],
 memory:['Mbaj mend rendin e figurave para se të fshihen.','Vendosi figurat sipas rendit që pe; përdor Shiko sërish kur të duhet.','Shtyp Kontrollo pasi të plotësosh të gjitha vendet.'],
 shadows:['Krahaso formën dhe drejtimin e figurës me hijen.','Tërhiq figurën mbi hijen ose prek figurën, pastaj vendin e saj.','Përdor Ndërro ose Nga fillimi dhe kontrollo kur të jesh gati.'],
 garden:['Lexo numrin ose veprimin në çdo vend.','Numëro petalet dhe vendos lulen e përshtatshme.','Kontrollo të gjitha vendet; mund ta rifillosh për të provuar ndryshe.'],
 wheels:['Lexo numrin ose veprimin dhe numëro rrotat e mjetit.','Tërhiq mjetin te vendi i përshtatshëm ose përdor dy prekje.','Kontrollo pasi të vendosësh të gjitha mjetet.'],
 path:['Shiko nisjen, fundin dhe drejtimin e secilës pllakë.','Vendos pllakat që rruga të vazhdojë pa ndërprerje.','Ndërro pllakat sipas nevojës dhe kontrollo rrugën.'],
 patterns:['Shiko grupin që përsëritet në vargun e figurave.','Vendos figurat që vazhdojnë të njëjtin rregull.','Kontrollo rendin pasi të plotësosh të gjitha vendet.'],
 };
 return scene?tutorials[scene]||[]:[`Lexo pyetjen dhe vëzhgo të dhënat${category==='memory'?' para se të fshihen':''}.`,'Zgjidh përgjigjen ose plotëso kontrollin që shfaqet në ekran.','Kontrollo, lexo shpjegimin dhe provo sërish nëse dëshiron.'];
}
