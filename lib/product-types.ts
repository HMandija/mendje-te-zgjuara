import type {SavedSession} from './learning-types';
export type SchoolClass={id:string;name:string;grade:number;code?:string;profiles:string[];archived?:number};
export type Assignment={id:string;class:string;title:string;category:string;level:number;count:5|8|10;due:string;active?:number;source_grade?:number|null;mixed_number?:number|null;mixed_items?:string|null;scene?:string|null;game_level?:number|null;lesson_id?:string|null;lesson_level?:number|null;allowed_levels?:string|null};
export type ProductData={classes:SchoolClass[];assignments:Assignment[];sessions:SavedSession[]};
