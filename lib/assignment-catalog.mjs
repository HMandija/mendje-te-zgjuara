import {CATEGORIES} from './categories.mjs';
import {curriculumLessons} from './curriculum-catalog.mjs';
import {gamesForGrade} from './game-catalog.mjs';
// One public selector; each entry maps to the existing server-validated task type.
export function assignmentCatalog(grade){
 if(![1,2,3,4].includes(grade))return [];
 return [{value:'quiz:mixed',label:'Kuize të përziera',group:'Kuize'},...CATEGORIES.map(c=>({value:'quiz:'+c.id,label:c.name,group:'Kuize'})),{value:'game:robot',label:grade<3?'Programo arushin me shigjeta':'Programo arushin me blloqe',group:'Robotikë'},...curriculumLessons(grade).map(l=>({value:'lesson:'+l.id,label:l.title,group:'Mësime'})),...gamesForGrade(grade).map(g=>({value:'game:'+g.scene,label:g.title,group:'Lojëra me figura'}))];
}
export function assignmentCategory(task){return task.lesson_id?'lesson:'+task.lesson_id:task.scene?'game:'+task.scene:'quiz:'+task.category;}
