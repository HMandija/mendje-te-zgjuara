import {z} from 'zod';
export const categories=['logic','patterns','math','spatial','memory','code','errors','whatif'];
export const identifier = z.string().regex(/^[a-zA-Z0-9_-]{1,80}$/);
export const gradeSchema = z.number().int().min(1).max(4);
export const schoolGradeSchema = z.number().int().min(1).max(5);
const text = max => z.string().min(1).max(max).refine(s => s.trim().length > 0);
export const profileSchema = z.object({id:identifier,name:text(30),grade:schoolGradeSchema}).strict();
export const puzzleSchema = z.object({id:identifier,grade:gradeSchema,cat:z.enum(categories),title:text(1000),visual:z.string().max(1000),options:z.array(text(160)).min(3).max(4),answer:text(160),explain:text(1000),hint:text(1000),memory:z.boolean().optional()}).strict().refine(p => new Set(p.options).size === p.options.length && p.options.includes(p.answer));
export const configSchema = z.object({profiles:z.array(profileSchema).max(2000),custom:z.array(puzzleSchema).max(150)}).strict().refine(x => new Set(x.profiles.map(p => p.id)).size === x.profiles.length && new Set(x.custom.map(p => p.id)).size === x.custom.length);
export const workspaceSchema = z.object({profiles:z.array(profileSchema).max(2000),custom:z.array(puzzleSchema).max(150),revision:z.number().int().nonnegative()}).strict().refine(x => configSchema.safeParse({profiles:x.profiles,custom:x.custom}).success);
export const answerSchema = z.object({cat:z.enum(categories),correct:z.boolean(),question:text(1000),note:z.string().max(1200).optional()}).strict();
export const sessionSchema = z.object({id:identifier,profile:z.union([identifier,z.literal('')]).optional(),grade:gradeSchema,answers:z.array(answerSchema).min(1).max(10),date:z.string().max(40).optional(),verified:z.boolean().optional(),level:z.number().int().min(1).max(3).optional(),assignment:identifier.optional()}).strict();
export const inviteSchema = z.object({profile:identifier}).strict();
export const deleteProfileSchema = z.object({profile:identifier,revision:z.number().int().nonnegative(),confirmation:z.literal('FSHI')}).strict();
export const startSchema = z.object({grade:gradeSchema,profile:z.union([identifier,z.literal('')]),category:z.enum([...categories,'mixed','custom','play']),count:z.union([z.literal(5),z.literal(8),z.literal(10)]),gameLevel:z.number().int().min(1).max(20).optional(),scene:z.enum(['shadows','garden','path','patterns','memory','wheels','memory-grid','pipes','maze','robot']).optional(),level:z.number().int().min(1).max(3).optional(),assignment:identifier.optional(),assignmentLevel:z.number().int().min(1).max(30).optional(),lessonId:identifier.optional(),lessonLevel:z.number().int().min(1).max(30).optional()}).strict().refine(x=>!!x.lessonId===!!x.lessonLevel&&(!x.lessonId||!x.scene&&!x.gameLevel&&!x.level&&!x.assignment)&&(!x.assignmentLevel||!!x.assignment));
export const submissionSchema = z.object({id:identifier,index:z.number().int().min(0).max(9),value:text(1000)}).strict();
export const hintSchema = z.object({id:identifier,index:z.coerce.number().int().min(0).max(9),step:z.coerce.number().int().min(1).max(2).optional()}).strict();
export function validWorkspace(x){return configSchema.safeParse(x).success;}
export function validSession(x){return sessionSchema.safeParse(x).success;}
