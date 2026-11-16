import assert from 'node:assert/strict';
import {CODING_MISSION_GROUPS,CODING_MISSIONS,codingMission} from './lib/coding-missions.mjs';

assert.equal(CODING_MISSION_GROUPS.length,10);
assert.equal(CODING_MISSIONS.length,60);
assert.equal(new Set(CODING_MISSION_GROUPS.map(group=>group.id)).size,10);
assert.equal(new Set(CODING_MISSIONS.map(mission=>mission.id)).size,60);
assert.equal(new Set(CODING_MISSIONS.map(mission=>mission.title)).size,60);
const expectedLevels=['Hapat e parë','Animacione dhe histori','Ngjarjet dhe bashkëpunimi','Përsëritja','Kushtet dhe logjika','Ndërveprimi me përdoruesin','Variablat dhe pikët','Dizajni i projektit','Projekte më të avancuara','Sfida krijuese'];
assert.deepEqual(CODING_MISSION_GROUPS.map(group=>group.title),expectedLevels,'Groups follow the ten levels from the supplied grade 5 plan');
const plannedTitles=['Personazhi përshëndet','Skena ime e parë','Gjej vendin në hartë','Roboti kthehet','Udhëtimi i fluturës','Macja që ecën','Nga shtëpia në pyll','Biseda e dy miqve','Një histori me radhë','Koncerti i kafshëve','Makina me tastierë','Personazhi surprizë','Çfarë ndodh në pyll?','Sinjali sekret','Vallëzimi në grup','Hapat e ushtarit','Peshku që noton','Vallëzimi me modele','Deri te thesari','Semafori ndalet','Tako mikun','Mos prek lumin','Dera e duhur','Kush është më lart?','Kalimi i sigurt','Flutura ndjek miun','Miku im virtual','Fjalëkalimi i portës','Ylli i papritur','Gara me kohën','Numëruesi im','Mblidh mollët','Tre jetë për aventurën','Dyqani i vogël','Makina që shpejton','Gjiganti dhe milingona','Magjia e ngjyrave','Kush fshihet pas pemës?','Fluturimi në dy drejtime','Orkestra e vogël','Lista e blerjeve','Zgjidh një surprizë','Rregullo inventarin','Shiu i yjeve','Komanda ime','Labirinti me nivele','Kuizi i zgjuar','Loja që bëhet më e vështirë','Detektivi i gabimeve','Projekti im përfundimtar'];
const coreMissions=CODING_MISSIONS.filter((_,index)=>index%6<5);
assert.deepEqual(coreMissions.map(mission=>mission.title),plannedTitles,'The 50 core mission titles match the supplied curriculum in order');
const expansions=CODING_MISSIONS.filter((_,index)=>index%6===5);
assert.deepEqual(expansions.map(mission=>mission.title),['Topi që kërcen në skaj','Stripi me tri pamje','Stafeta e mesazheve','Spiralja që zgjerohet','Numri çift apo tek','Afër apo larg','Mesatarja e tri matjeve','Melodia me katër nota','Katrorë me madhësi të ndryshme','Loja e raketës dhe topit']);
for(const group of CODING_MISSION_GROUPS){
  const missions=CODING_MISSIONS.filter(mission=>mission.group===group.id);
  assert.equal(group.count,6);
  assert.equal(missions.length,group.count);
  assert.ok(group.title.trim());
  for(const [index,mission] of missions.entries()){
    assert.equal(mission.id,`${group.id}-${index+1}`);
    assert.equal(mission.groupTitle,group.title);
    assert.equal(mission.grade,5);
    assert.ok(mission.title.trim());
    assert.ok(mission.objective.trim());
    assert.equal(mission.steps.length,6);
    assert.ok(mission.steps.every(step=>step.trim().length>=30));
    assert.equal(mission.criteria.length,2);
    assert.ok([...mission.steps,...mission.criteria].every(text=>typeof text==='string'&&text.trim().length>15));
    assert.equal(codingMission(mission.id),mission);
  }
}
assert.equal(codingMission('missing'),null);
console.log('Coding missions: 60 unique grade 5 missions with objectives, steps and review criteria.');
