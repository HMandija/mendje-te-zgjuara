import type {Assignment} from './product-types';
import type {SavedSession} from './learning-types';

export function assignmentLevelCount(task: Pick<Assignment,'lesson_id'|'scene'>) {
  return task.lesson_id ? 30 : task.scene ? 20 : 3;
}

// NULL preserves the single level of assignments created before level selection.
// An explicit [] pauses every level; corrupt data never unlocks extra content.
export function assignmentLevels(task: Assignment): number[] {
  const maximum = assignmentLevelCount(task);
  let values: unknown;
  try { values = task.allowed_levels == null ? [task.lesson_level || task.game_level || task.level] : JSON.parse(task.allowed_levels); }
  catch { return []; }
  if (!Array.isArray(values) || values.some(n => !Number.isInteger(n) || n < 1 || n > maximum)) return [];
  return [...new Set(values as number[])].sort((a,b) => a-b);
}

export function assignmentAtLevel(task: Assignment, level: number): Assignment {
  return {...task, ...(task.lesson_id ? {lesson_level:level} : task.scene ? {game_level:level} : {level})};
}

export function assignmentSessionLevel(task: Assignment, session: SavedSession) {
  return task.lesson_id ? session.lessonLevel : task.scene ? session.gameLevel : session.level || task.level;
}

export function assignmentLevelSessions(task: Assignment, sessions: SavedSession[], level: number) {
  return sessions.filter(s => s.verified && s.assignment === task.id && assignmentSessionLevel(task,s) === level);
}

export function assignmentCompleted(task: Assignment, sessions: SavedSession[]) {
  const levels=assignmentLevels(task);
  return levels.length>0 && levels.every(n=>assignmentLevelSessions(task,sessions,n).length>0);
}

export function assignmentTaskInput(task: Assignment, levels: number[]) {
  const first = levels[0];
  return {title:task.title, category:task.category, level:task.scene || task.lesson_id ? task.level : first || task.level,
    count:task.count, due:task.due, allowedLevels:levels,
    ...(task.source_grade ? {sourceGrade:task.source_grade} : {}),
    ...(task.lesson_id ? {lessonId:task.lesson_id,lessonLevel:first || task.lesson_level || 1} :
      task.scene ? {scene:task.scene,gameLevel:first || task.game_level || 1} : {})};
}
