export type PlayScene='shadows'|'garden'|'path'|'patterns'|'memory'|'wheels'|'memory-grid'|'pipes'|'maze'|'robot';
export type RobotCommand={op:string;n?:number;body?:RobotCommand[]};
export type RobotBoard={scene:'robot';size:number;cells:string[];start:number;end:number;goals:number[];direction:number;commands:string[];grade:number};
export type PlayObject={id:string;asset:string;label:string;color?:string;quantity?:number;rotation?:number;position?:number};
export type PlayTarget={id:string;label:string;cue?:string;color?:string;quantity?:number;rotation?:number;row?:number;column?:number;silhouette?:boolean};
export type PlayInteraction={scene:PlayScene;tokens:PlayObject[];targets:PlayTarget[];preview?:PlayObject[];size?:number;layoutColumns?:number;matchBy?:string[];previewSeconds?:number};
export type PipeBoard={scene:'pipes';size:number;pipes:{id:string;exits:number[];rotation:number}[];start:number;end:number};
export type MazeBoard={scene:'maze';size:number;cells:string[];start:number;end:number};
