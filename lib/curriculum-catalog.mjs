import {lessonName} from './lesson-names.mjs';
import {creativeLessons,CREATIVE_FAMILIES} from './creative-catalog.mjs';
// Public curriculum metadata. This module contains no answers or board solutions.
/** @type {[string,string,string,string[]][]} */
const domainDefinitions=[
 ['logic','Logjikë','logic',['Krahasimet','Rendi i madhësive','Kutia e përjashtuar','Të dhënat që mungojnë','Dy kushte së bashku','Vetëm një kusht','Pohimet e sakta','Lidhjet e transitivitetit','Kufijtë e mundësive','Detektivi i numrave']],
 ['math','Matematikë','math',['Bashko grupet','Gjej ndryshimin','Plotëso shumën','Plotëso zbritjen','Grupet e barabarta','Ndaj në grupe','Numri midis','Dhjetëshet dhe njëshet','Dy veprime','Pesha e panjohur']],
 ['patterns','Modele','patterns',['Hapi që përsëritet','Vargu zbritës','Dy hapa me radhë','Grupet e përsëritura','Numrat që rriten','Vendi bosh','Rregulli i fshehur','Dy vargje të ndërthurura','Vargu i çiftëzuar','Parashiko më larg']],
 ['spatial','Hapësirë','spatial',['Lindje dhe perëndim','Veri dhe jug','Rruga me kthim','Kthesat e djathta','Kthesat e majta','Figurat dhe drejtimet','Rrjeti me kthesa','Rrjeti i plotë','Kryqëzimet e pyllit','Labirinti i ekspeditës']],
 ['memory','Kujtesë','memory',['Figurat në rrjet','Cepat e kujtesës','Rreshtat e kujtesës','Kolonat e kujtesës','Harta e figurave','Fqinji paraardhës','Kujto numrin më të madh','Kujto numrin më të vogël','Sa herë e pe','Kujto shumën']],
 ['thinking','Mendim kritik','whatif',['Një më shumë','Një më pak','Dyfisho grupin','Ndrysho çdo grup','Ndrysho nisjen','Hiq një grup','Shto një grup','Krahaso dy plane','Ndrysho dy kushte','Ruaj sasinë']],
 ['algorithm','Algoritme','code',['Rendit në rritje','Rendit në zbritje','Përsërit shtimin','Përsërit zbritjen','Zbato kushtin','Numëro ciklet','Ndiq dy udhëzime','Gjej vlerën fillestare','Gjej hapat e nevojshëm','Kontrollo rezultatin']],
 ['programming','Programim','code',['Variabla e parë','Ndrysho variablën','Dy variabla','Kushti më i madh','Kushti më i vogël','Blloku i përsëritjes','Dy blloqe radhazi','Dalja e programit','Rregullo rezultatin','Gjurmimi i programit']],
 ['robotics','Robotikë','code',['Nisja te flamuri','Nisja në lindje','Nisja në jug','Nisja në perëndim','Ylli i parë','Dy objektiva','Rruga e kopshtit','Planifiko ndalesat','Rruga e gjatë','Ekspedita e arushit']],
 ['observation','Vëzhgim','errors',['Numëro çiftet','Numëro tekët','Gjej maksimumin','Gjej minimumin','Gjej përsëritjen','Kontrollo mbledhjen','Kontrollo zbritjen','Numëro mbi kufi','Numëro nën kufi','Zbulo ndryshimin']]
];
export const CURRICULUM_DOMAINS=[...domainDefinitions.map(([id,title,category,topics])=>({id,title,category,topics})),...CREATIVE_FAMILIES.map(([id,title,category])=>({id,title,category,topics:[]}))];
const stages=['Hapat e parë','Lidh dhe zbulo','Planifiko dhe arsyeto','Strategji me disa hapa'];
const arrowTopics=['Shigjeta e parë','Dy shigjeta','Lart dhe poshtë','Djathtas dhe majtas','Shko te ylli','Komandat në radhë','Rruga me ndalesë','Shiko dhe korrigjo','Provo hap pas hapi','Historia e arushit'];
const repeatTopics=['Programi i parë','Rendi i komandave','Dy drejtime','Ndrysho drejtimin','Vizito yjet','Përsërit komandën','Dy blloqe radhazi','Ekzekuto planin','Gjej hapin e gabuar','Gjurmimi i rrugës'];
const domainDescriptions={logic:'Krahaso të dhënat dhe shpjego pse një zgjedhje funksionon.',math:'Llogarit dhe vendos kartën e numrit në vendin e duhur.',patterns:'Zbulo çfarë përsëritet ose ndryshon dhe plotëso vargun.',spatial:'Ndiq drejtimet, përputh forma dhe ndërto rrugë të lidhura.',memory:'Vëzhgo, mbaj mend dhe rikrijo figurat ose numrat.',thinking:'Ndrysho një të dhënë dhe parashiko rezultatin e ri.',algorithm:'Rendit dhe zbato udhëzimet, hap pas hapi.',programming:'Ndërto ose gjurmo një program dhe kontrollo rezultatin.',robotics:'Programo arushin, vizito objektivat dhe arrij te flamuri.',observation:'Vëzhgo me kujdes dhe zbulo ndryshimin ose gabimin.'};
function tutorial(domain,grade,variant){
 if(domain==='robotics'||domain==='programming'&&grade<=2)return ['Shiko nisjen, yjet dhe flamurin.','Tërhiq blloqet ose kliko për t’i shtuar në program.','Shtyp Nis. Vëzhgo çdo hap dhe korrigjo komandat.'];
 if(domain==='memory')return ['Shiko figurat ose numrat gjatë kohës së vëzhgimit.','Kur fshihen, tërhiq kartat në vendet e kërkuara.','Përdor Shiko sërish kur ke nevojë, pastaj kontrollo vendosjen.'];
 if(domain==='spatial'&&variant<5)return ['Lexo drejtimet dhe numëro hapat.','Shkruaj numrin në kutinë e përgjigjes.','Shtyp Kontrollo numrin.'];
 if(domain==='spatial'&&[6,7].includes(variant))return ['Gjej nisjen dhe fundin e rrugës.','Prek tubat për t’i rrotulluar. Çdo dalje duhet të lidhet me tubin fqinj.','Shtyp Kontrollo lidhjen.'];
 if(domain==='spatial'&&variant>=8)return ['Gjej nisjen dhe mbërritjen.','Përdor shigjetat për të lëvizur në korridore. Muret nuk kalohen.','Kur mbërrin, kontrollo rrugën.'];
 if(domain==='spatial')return ['Shiko drejtimin e nisjes dhe objektivin.','Rrotullo, lëviz ose përputh figurat sipas kërkesës.','Kontrollo çdo lidhje; mund të rifillosh nëse duhet.'];
 if(['math','patterns','thinking','observation','programming'].includes(domain))return ['Vëzhgo të dhënat dhe gjej çfarë kërkohet.','Tërhiq kartën e përgjigjes ose prek kartën, pastaj vendin.','Shtyp Kontrollo dhe lexo shpjegimin e rezultatit.'];
 return ['Lexo kërkesën dhe vëzhgo të dhënat.','Rendit, zgjidh ose shkruaj përgjigjen sipas kërkesës.','Kontrollo zgjidhjen dhe shpjego si mendove.'];
}
export const DIFFICULTY_BANDS=['Njohje','Praktikë','Lidhje','Zbatim'];
export function curriculumLessons(grade){
 if(!Number.isInteger(grade)||grade<1||grade>4)throw new RangeError('Grade must be 1–4');
 return [...creativeLessons(grade),...CURRICULUM_DOMAINS.flatMap(domain=>domain.topics.map((baseTopic,index)=>{const topic=domain.id==='logic'&&grade===1?['Cili është më i madh?','Nga i vogli te i madhi','Cila nuk shkon?','Gjej çfarë mungon','Ngjyra dhe forma','Gjej të ngjashmen','Po apo jo?','Kush vjen para?','Çfarë mund të jetë?','Gjej numrin'][index]:domain.id==='programming'&&grade<=2?(grade===1?arrowTopics:repeatTopics)[index]:domain.id==='algorithm'&&grade===1?['Kartat në rritje','Kartat në zbritje','Hapat përpara','Hapat mbrapa','Shto sende','Numëro shigjetat','Dy hapa me radhë','Gjej nisjen','Sa hapa duhen','Kontrollo planin'][index]:domain.id==='math'&&grade===2?['Bashko sasitë','Gjej sa mbeten','Plotëso mbledhjen','Plotëso zbritjen','Mbledhje e përsëritur','Ndarje e barabartë','Numri në mes','Dhjetëshe dhe njësi','Dy mbledhje radhazi','Kutia e panjohur'][index]:domain.id==='math'&&grade===1?['Numëroj gjithsej','Sa sende mbeten','Numri që mungon','Para dhe pas zbritjes','Bashkoj dy grupe','Ndaj mes dy fëmijëve','Numri në mes','Dhjetë dhe disa njësi','Dy mbledhje me radhë','Kutia e numrave'][index]:baseTopic;return ({
  id:`curriculum-g${grade}-${domain.id}-${index+1}`,grade,recommendedGrade:grade,domain:domain.id,category:domain.category,variant:index,
  title:lessonName(domain.id,grade,index),description:`Për klasën ${grade}. ${domainDescriptions[domain.id]}`,
  objective:`${stages[grade-1]}: ushtro ${topic.toLowerCase()} dhe kontrollo zgjidhjen për klasën ${grade}.`,
  tutorial:tutorial(domain.id,grade,index),levels:20,difficultyBands:DIFFICULTY_BANDS
 });}))];
}
const all=Array.from({length:4},(_,i)=>curriculumLessons(i+1)).flat();
const lookup=new Map(all.map(lesson=>[lesson.id,lesson]));
export function curriculumLesson(id){return lookup.get(id)||null;}
export const CURRICULUM_TOTALS=Object.freeze({grades:4,lessonsPerGrade:{1:107,2:107,3:106,4:106},levelsPerLesson:20,lessons:426,levels:8520});
