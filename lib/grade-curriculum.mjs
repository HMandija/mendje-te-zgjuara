// Public grade guidance; exercise generators and answers remain server-only.
export const GRADE_CURRICULUM=Object.freeze([
 {grade:1,title:'Vëzhgo, numëro dhe luaj',focus:'Numërim me sende, krahasime të thjeshta, forma, kujtesë vizuale dhe komanda me shigjeta.',skills:['Numra dhe sende','Forma dhe çifte','Shigjeta dhe rrugë të shkurtra']},
 {grade:2,title:'Lidh, rendit dhe zbulo',focus:'Mbledhje e zbritje, grupe figurash, rrugë me kthesa dhe përsëritje të komandave.',skills:['Mbledhje dhe zbritje','Modele në grupe','Rend dhe përsëritje']},
 {grade:3,title:'Planifiko dhe arsyeto',focus:'Shumëzim e pjesëtim, modele numerike, orientim në rrjet dhe programe me kthesa e cikle.',skills:['Shumëzim dhe pjesëtim','Rrjete dhe orientim','Kthesa dhe cikle']},
 {grade:4,title:'Ndërto një strategji',focus:'Veprime në disa hapa, rregulla që ndryshojnë, rrjete më të mëdha dhe programe me kushte.',skills:['Dy veprime dhe arsyetim','Transformime dhe strategji','Kushte dhe programe më të gjata']}
]);
export function gradeCurriculum(grade){return GRADE_CURRICULUM.find(g=>g.grade===grade)||null;}
