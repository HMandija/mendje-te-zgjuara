import {PlayArt} from './play-art';
const illustrations:Record<string,string[]>= {
 draw:['pencil','star','triangle','diamond','flower','book','box','pear','circle','turtle'],
 events:['rabbit','star','flower','owl','car','turtle','book','fox','circle','pot'],
 story:['book','rabbit','flower','apple','owl','box','pencil','fox','pear','car'],
 objects:['box','number','basket','apple','pear','flower','carrot','pot','star','circle'],
 tangram:['triangle','diamond','box','star','circle','fox','owl','turtle','book','car'],
 rules:['circle','triangle','diamond','number','star','box','book','fox','owl','pear'],
 logic:['fox','owl','box','diamond','triangle','book','star','pear','turtle','pencil'],
 math:['apple','flower','basket','carrot','pear','box','number','pot','bike','unicycle'],
 patterns:['pear','berry','flower','apple','diamond','triangle','star','circle','book','carrot'],
 spatial:['maze','pipes','road-down','road-up','fox','owl','triangle','diamond','turtle','car'],
 memory:['owl','rabbit','star','book','apple','carrot','pear','flower','turtle','box'],
 thinking:['box','fox','flower','apple','basket','book','carrot','pear','star','owl'],
 algorithm:['road-down','road-up','pencil','box','maze','pipes','star','book','car','turtle'],
 programming:['road-up','road-down','car','bike','maze','pipes','book','pencil','star','box'],
 robotics:['turtle','rabbit','car','road-down','star','fox','owl','maze','pipes','book'],
 observation:['owl','fox','pencil','book','flower','apple','pear','diamond','star','box']
};
export function CurriculumArt({domain,variant,grade}:{domain:string;variant:number;grade:number}){
 const asset=(illustrations[domain]||illustrations.logic)[variant%10],secondary=(illustrations[domain]||illustrations.logic)[(variant+3)%10];
 return <span className="curriculum-scene" aria-hidden="true"><svg className="curriculum-scenery" viewBox="0 0 240 140"><circle cx="202" cy="24" r="45" fill="white" opacity=".35"/><path d="M0 112Q64 68 135 110T240 92V140H0Z" fill="white" opacity=".3"/><circle cx="22" cy="36" r="5" fill="white"/><path d="m37 72 5-9 5 9 10 2-8 7 2 10-9-5-9 5 2-10-8-7Z" fill="white" opacity=".65"/>{[0,1,2].map(n=><rect key={n} x={150+n*19} y={92-n*12} width="15" height={18+n*12} rx="5" fill="white" opacity=".5"/>)}</svg><span className="curriculum-main-object"><PlayArt asset={asset} quantity={asset==='number'?grade*10+variant:3+variant%5} color={['coral','sky','gold','mint','violet'][variant%5]}/></span><span className="curriculum-side-object"><PlayArt asset={secondary} quantity={3+grade} color="violet"/></span><span className="curriculum-spark">✦</span></span>;
}
