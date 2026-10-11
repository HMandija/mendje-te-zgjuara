// Original vector artwork for Mendje të Zgjuara. No third-party assets.
export type MascotState='idle'|'think'|'celebrate';
export function LabRobot({state='idle'}:{state?:MascotState}) {
  return <svg className={`mascot mascot-${state}`} viewBox="0 0 300 280" fill="none" aria-hidden="true">
    <ellipse cx="148" cy="263" rx="101" ry="10" fill="#4b319a" opacity=".22" />
    <path d="M38 239h88l-8-58H47z" fill="#4656b6" /><path d="M44 184h69l7 47H39z" fill="#8ae5ef" /><path d="M55 196h28m-28 10h43m-43 10h18" stroke="#fff" strokeWidth="5" strokeLinecap="round" />
    <path d="M144 196l-28 42m82-40 21 43" stroke="#6378c7" strokeWidth="17" strokeLinecap="round" />
    <path d="M139 244h-27m91 0h29" stroke="#d1f5f9" strokeWidth="17" strokeLinecap="round" />
    <rect x="120" y="139" width="88" height="77" rx="28" fill="#ffa981" /><path d="M144 151h38v24h-38z" fill="#ffe4bb" /><circle cx="163" cy="191" r="10" fill="#7c58ce" /><path d="m160 186 7 5-7 5" stroke="white" strokeWidth="3" strokeLinecap="round" />
    <path d="M121 156 94 173m111-16 24-29" stroke="#ffb99a" strokeWidth="15" strokeLinecap="round" /><circle cx="88" cy="177" r="12" fill="#dcf7fb" /><path d="M230 130v-22m0 22 14-12" stroke="#dcf7fb" strokeWidth="10" strokeLinecap="round" />
    <path d="M165 72V51" stroke="#bfeef4" strokeWidth="7" /><circle cx="165" cy="44" r="11" fill="#ffce67" />
    <rect x="112" y="69" width="105" height="86" rx="35" fill="#e4f8fb" /><rect x="103" y="97" width="12" height="29" rx="6" fill="#87cede" /><rect x="214" y="97" width="12" height="29" rx="6" fill="#87cede" />
    <rect x="126" y="90" width="79" height="42" rx="20" fill="#34447c" /><circle cx="147" cy="110" r="7" fill="#83e5fa" /><circle cx="183" cy="110" r="7" fill="#83e5fa" /><path d={state==='think'?"M157 139h16":state==='celebrate'?"M155 136q10 17 20 0":"M157 139q8 8 16 0"} stroke="#6993af" strokeWidth="4" strokeLinecap="round" />
    <path d="m63 81 9-16 9 16-9 16z" fill="#ffe193" /><path d="m241 57 5 10 11 2-8 8 2 11-10-5-10 5 2-11-8-8 11-2z" fill="#d7c6ff" /><circle cx="94" cy="44" r="5" fill="#c9f4ee" />
    {state==='think'&&<g fill="#ffe191"><circle cx="226" cy="40" r="5"/><circle cx="240" cy="29" r="8"/><text x="248" y="23" fontSize="23" fontWeight="800">?</text></g>}{state==='celebrate'&&<g stroke="#ffe191" strokeWidth="5" strokeLinecap="round"><path d="m70 30-8-10m145 5V9m77 25 9-9"/></g>}
  </svg>;
}

export function LabProfessor({state='idle'}:{state?:MascotState}) {
  return <svg className={`mascot mascot-${state}`} viewBox="0 0 300 280" fill="none" aria-hidden="true">
    <ellipse cx="157" cy="263" rx="96" ry="10" fill="#4b319a" opacity=".22" />
    <rect x="203" y="167" width="59" height="70" rx="12" fill="#6570bc" /><rect x="209" y="173" width="47" height="45" rx="7" fill="#a4eee1" /><path d="m221 186 6 5-6 5m15 0h10" stroke="#488b8e" strokeWidth="4" strokeLinecap="round" /><path d="M233 237v16m-15 0h31" stroke="#c8cdf5" strokeWidth="6" strokeLinecap="round" />
    <path d="m120 206-4 37m48-37 6 37" stroke="#4e3e8a" strokeWidth="17" strokeLinecap="round" /><path d="M111 248H94m65 0h21" stroke="#ffcb8e" strokeWidth="14" strokeLinecap="round" />
    <path d="M100 142h67l23 67h-99z" fill="#72d6c0" /><path d="M119 144v69m26-69v69" stroke="#c7f4de" strokeWidth="10" /><circle cx="135" cy="178" r="3" fill="#3a937f" /><circle cx="135" cy="196" r="3" fill="#3a937f" />
    <path d="m102 154-25 34m90-34 24 33" stroke="#80dfc9" strokeWidth="17" strokeLinecap="round" /><circle cx="74" cy="192" r="10" fill="#ffd3ac" /><circle cx="193" cy="192" r="10" fill="#ffd3ac" />
    <path d="M94 100c-12-36 0-63 32-62 33-19 64 10 51 57l-18 32H108z" fill="#3f3864" /><circle cx="164" cy="54" r="22" fill="#3f3864" />
    <rect x="110" y="60" width="56" height="78" rx="26" fill="#ffdab8" /><path d="M104 86q24-5 37-25 15 25 31 24" fill="#3f3864" /><circle cx="118" cy="100" r="15" stroke="#91558c" strokeWidth="4" /><circle cx="153" cy="100" r="15" stroke="#91558c" strokeWidth="4" /><path d="M133 100h5" stroke="#91558c" strokeWidth="4" /><circle cx="119" cy="100" r="3" fill="#44345f" /><circle cx="152" cy="100" r="3" fill="#44345f" /><path d={state==='think'?"M128 123q9-4 17 0":state==='celebrate'?"M125 118q12 17 24 0":"M128 121q9 8 17 0"} stroke="#bd775f" strokeWidth="3" strokeLinecap="round" />
    <path d="m64 188 52 9 4 36-51-9z" fill="#ffe199" /><path d="m116 197 45-11 4 36-45 11z" fill="#ffcb78" /><path d="m78 200 26 5m-25 4 25 5" stroke="#e3af5e" strokeWidth="3" strokeLinecap="round" />
    <path d="m219 61 6 13 14 2-10 10 2 15-12-7-13 7 3-15-11-10 15-2z" fill="#ffe191" /><circle cx="78" cy="65" r="7" fill="#c2eff2" /><path d="M217 122h14m-7-7v14" stroke="#ddc9ff" strokeWidth="4" strokeLinecap="round" />
    {state==='think'&&<g fill="#ffe191"><circle cx="226" cy="40" r="5"/><circle cx="240" cy="29" r="8"/><text x="248" y="23" fontSize="23" fontWeight="800">?</text></g>}{state==='celebrate'&&<g stroke="#ffe191" strokeWidth="5" strokeLinecap="round"><path d="m70 30-8-10m145 5V9m77 25 9-9"/></g>}
  </svg>;
}

export function PuzzleArt({ category }: { category: string }) {
  const art: Record<string, React.ReactNode> = {
    logic: <><path d="m30 106 42-73 43 73z" fill="#ffb84b" /><rect x="101" y="66" width="58" height="58" rx="12" fill="#76cdd1" transform="rotate(-9 101 66)" /><circle cx="176" cy="71" r="32" fill="#f286a7" /><path d="m48 102 22-38 22 38" stroke="#ffe4a4" strokeWidth="5" strokeLinecap="round" /></>,
    patterns: <><circle cx="46" cy="72" r="23" fill="#8bd4dd" /><path d="m81 95 25-47 25 47z" fill="#ffb570" /><rect x="142" y="49" width="47" height="47" rx="10" fill="#b298ee" /><path d="M38 119h143" stroke="#d6c9ed" strokeWidth="5" strokeDasharray="4 12" strokeLinecap="round" /></>,
    math: <><rect x="24" y="43" width="49" height="61" rx="13" fill="#8f7ad7" transform="rotate(-9 24 43)" /><text x="45" y="83" fill="white" fontSize="35" fontWeight="800">3</text><path d="M91 76h25m-12-12v25" stroke="#75bda5" strokeWidth="7" strokeLinecap="round" /><rect x="140" y="43" width="49" height="61" rx="13" fill="#f8b35e" transform="rotate(9 140 43)" /><text x="154" y="88" fill="white" fontSize="35" fontWeight="800">2</text></>,
    spatial: <><path d="m45 58 39-22 39 22-39 23z" fill="#a5def0" /><path d="m45 58 39 23v45l-39-22z" fill="#75bdd7" /><path d="m84 81 39-23v46l-39 22z" fill="#559aba" /><path d="m139 107 20-35h35" stroke="#b493eb" strokeWidth="8" strokeLinecap="round" /><path d="m182 60 14 12-14 12" stroke="#b493eb" strokeWidth="8" strokeLinecap="round" /></>,
    memory: <><rect x="39" y="39" width="56" height="75" rx="13" fill="#f6a3b4" transform="rotate(-10 39 39)" /><path d="m54 62 20 20-20 20-20-20z" fill="#fff1d4" /><rect x="111" y="36" width="56" height="75" rx="13" fill="#b39ae7" transform="rotate(10 111 36)" /><text x="123" y="89" fill="white" fontSize="47" fontWeight="800">?</text></>,
    code: <><path d="M42 116V82h46V48h48" stroke="#c6b8e9" strokeWidth="13" strokeLinecap="round" strokeLinejoin="round" /><path d="m128 37 14 11-14 11" stroke="#8b72c8" strokeWidth="7" strokeLinecap="round" /><rect x="150" y="81" width="40" height="42" rx="12" fill="#83cbb8" /><circle cx="162" cy="97" r="4" fill="white" /><circle cx="179" cy="97" r="4" fill="white" /><path d="M164 109h12m-6-29V68" stroke="#478f83" strokeWidth="4" strokeLinecap="round" /></>,
    errors: <><rect x="34" y="34" width="112" height="91" rx="14" fill="#ffd69a" /><path d="M51 57h35m-35 17h51m-51 17h29" stroke="#dea968" strokeWidth="5" strokeLinecap="round" /><circle cx="133" cy="78" r="30" fill="#fcf9f1" stroke="#91bed0" strokeWidth="10" /><path d="m154 101 30 30" stroke="#8b73c1" strokeWidth="14" strokeLinecap="round" /><path d="m123 72 18 14m-18 0 18-14" stroke="#ef8c84" strokeWidth="5" strokeLinecap="round" /></>,
    whatif: <><path d="M50 89c-18-36 14-62 43-50 17-24 58-12 57 15 29 4 34 39 10 51-9 17-27 21-40 10-20 21-50 7-49-9-12 0-18-5-21-17z" fill="#a9b1ec" /><text x="92" y="90" fill="white" fontSize="48" fontWeight="800">?</text><path d="m175 35 4 9 10 2-7 7 2 10-9-5-9 5 2-10-7-7 10-2z" fill="#ffbd6e" /></>,
  };
  return <svg viewBox="0 0 220 155" fill="none" aria-hidden="true"><ellipse cx="111" cy="132" rx="76" ry="7" fill="#6a4aa3" opacity=".08" />{art[category] || art.logic}</svg>;
}
