// Each row is a separately authored reasoning task, not a numerical variant.
const bank={
 logic:[
 ['Dy kuti kanë të njëjtën peshë. Njëra ka një top, tjetra ka dy kuba. Sa kuba peshojnë sa një top?','⚽ = 🧊 + 🧊','2','1','3','Një top ekuilibron dy kuba.','Numëro kubat në anën tjetër.'],
 ['Një mollë peshon sa dy kumbulla. Cila anë është më e rëndë: një mollë apo një kumbull?','🍎 = 🟣 + 🟣','Molla','Kumbulla','Janë të barabarta','Molla ka peshën e dy kumbullave, ndaj është më e rëndë se një.','Krahaso dy sende me një send.'],
 ['Tre lapsa peshojnë sa një libër. Çfarë duhet shtuar te dy lapsa për të barazuar librin?','📘 = ✏️ + ✏️ + ✏️','Një laps','Një libër','Dy lapsa','Dy lapsave u mungon një laps për të bërë tre.','Sa mungojnë për të bërë tre?'],
 ['Dy topa peshojnë sa katër kube. Sa kube duhen për një top?','⚽ + ⚽ = 🧊 + 🧊 + 🧊 + 🧊','2','4','1','Ndaj katër kubat në dy grupe të barabarta.','Ndaji kubat njësoj mes topave.'],
 ['Një kuti bosh peshon 2 njësi. Kutia me një lodër peshon 7. Sa peshon lodra?','📦 + 🧸 = 7; 📦 = 2','5','7','9','Nga pesha totale heqim peshën e kutisë: 7 − 2 = 5.','Pesha e kutisë nuk është pesha e lodrës.'],
 ['Një dardhë dhe një mollë peshojnë 9 njësi. Dardha peshon 4. Sa peshon molla?','🍐 + 🍎 = 9; 🍐 = 4','5','13','4','Pjesa që mbetet nga 9 pasi heqim 4 është 5.','Gjej pjesën që mungon.'],
 ['Dy kuti të njëjta dhe një kub peshojnë 11. Kubi peshon 3. Sa peshon secila kuti?','2 × 📦 + 🧊 = 11; 🧊 = 3','4','8','7','Hiq 3 nga 11, pastaj ndaj 8 në dy kuti: 4 secila.','Hiq fillimisht kubin, pastaj ndaj peshën.'],
 ['Një top peshon sa tre kube. Një kub peshon sa dy unaza. Sa unaza peshojnë sa një top?','⚽ = 3 🧊; 🧊 = 2 ◯','6','5','3','Tre grupe me nga dy unaza bëjnë gjashtë.','Zëvendëso çdo kub me dy unaza.'],
 ],
 patterns:[
 ['Çfarë vjen pas në vargun që përsëritet?','● ▲ ● ▲ ● ?','▲','●','■','Rregulli përsërit çiftin rreth–trekëndësh.','Lexo vargun me çifte.'],
 ['Cili grup plotëson modelin?','■ ■ ● | ■ ■ ● | ?','■ ■ ●','■ ● ●','● ■ ●','Çdo grup ka dy katrorë dhe një rreth.','Krahaso grupet, jo vetëm simbolin e fundit.'],
 ['Si vazhdon vargu me hapa të barabartë?','3, 6, 9, 12, ?','15','13','18','Çdo herë shtohen tre.','Krahaso dy numra fqinjë.'],
 ['Cila pjesë mungon te modeli që rrotullohet?','↑ → ↓ ← ↑ ?','→','↓','←','Shigjeta kthehet një çerek rrotullimi djathtas.','Ndiq katër drejtimet me radhë.'],
 ['Cili numër vjen kur hapat rriten nga një?','1, 2, 4, 7, ?','11','10','14','Hapat janë +1, +2, +3 dhe pastaj +4.','Shiko sa shtohet në çdo hap.'],
 ['Çfarë vjen pas te dy vargjet e ndërthurura?','1, 10, 2, 20, 3, ?','30','4','40','Në vendet çift janë 10, 20, 30.','Ndaje vargun në vende tek dhe çift.'],
 ['Sa pika ka figura e katërt?','Figura 1: 1; figura 2: 3; figura 3: 6; figura 4: ?','10','9','12','Shtohen 2, pastaj 3, pastaj 4 pika: 6 + 4 = 10.','Numëro pikat e shtuara, jo vetëm totalin.'],
 ['Cili numër mungon kur çdo hap dyfishon dhe shton një?','2, 5, 11, 23, ?','47','46','48','23 × 2 + 1 = 47.','Kontrollo të dy veprimet në një hap.'],
 ],
 math:[
 ['Në raft janë 4 libra. Vendos edhe 3. Sa libra janë tani?','📚 4 + 3','7','6','8','Bashkojmë grupet: 4 + 3 = 7.','Numëro të dy grupet së bashku.'],
 ['Ke 8 fara dhe mbjell 5. Sa fara mbeten?','8 fara → mbillen 5','3','5','13','Nga tetë heqim pesë: mbeten tre.','Mendo për farat që nuk janë mbjellë.'],
 ['Dhjetë nxënës punojnë në çifte. Sa çifte formohen?','10 nxënës, nga 2 në çift','5','2','8','Dhjetë të ndarë në grupe me nga dy bëjnë pesë çifte.','Formo grupe me nga dy.'],
 ['Një biletë kushton 3 monedha. Sa kushtojnë 4 bileta?','4 bileta × 3 monedha','12','7','9','Katër grupe me nga tre bëjnë dymbëdhjetë.','Çdo biletë kërkon të njëjtën shumë.'],
 ['Një shirit 24 cm ndahet në 3 pjesë të barabarta. Sa cm ka një pjesë?','24 cm ÷ 3','8','6','12','24 të ndarë në tre pjesë bëjnë nga 8 cm.','Kontrollo nëse tri pjesët japin 24.'],
 ['Lira ka 35 monedha. Blen një fletore 18 monedha. Sa i mbeten?','35 − 18','17','23','53','35 − 10 = 25 dhe 25 − 8 = 17.','Hiq dhjetëshin dhe pastaj njësitë.'],
 ['Një kopsht ka 4 rreshta me nga 6 bimë. Hiqen 5 bimë. Sa mbeten?','4 × 6 − 5','19','24','29','Fillimisht janë 24 bimë, pastaj mbeten 19.','Gjej totalin përpara se të heqësh.'],
 ['Ora është 10:45. Mësimi zgjat 30 minuta. Në cilën minutë pas orës 11 mbaron?','10:45 + 30 minuta','15','30','45','15 minuta çojnë në 11:00 dhe 15 të tjera në 11:15.','Ndaje kohën te ora e plotë.'],
 ],
 spatial:[
 ['Shëno + te figurat që kanë kënde dhe − te figurat pa kënde.','Vëzhgo të tri figurat.',['▲','●','■'],['+','−','+'],'Trekëndëshi dhe katrori kanë kënde; rrethi nuk ka.','Shiko ku takohen anët.'],
 ['Shëno + te shigjetat që tregojnë lart dhe − te të tjerat.','Krahaso drejtimet.',['↑','→','↓','↑'],['+','−','−','+'],'Vetëm shigjetat e para dhe të fundit tregojnë lart.','Gjej majën e shigjetës.'],
 ['Shëno + te rrugët që e kthejnë robotin në pikën fillestare.','Robotët nisin nga e njëjta pikë.',['→ ←','↑ →','↓ ↑'],['+','−','+'],'Një hap dhe hapi i kundërt anulohen.','Krahaso lëvizjen me të kundërtën.'],
 ['Shëno + kur numri i anëve përputhet me figurën.','Kontrollo çdo pohim.',['Trekëndësh: 3','Katror: 3','Drejtkëndësh: 4'],['+','−','+'],'Trekëndëshi ka 3 anë; katrori dhe drejtkëndëshi kanë 4.','Numëro anët një herë.'],
 ['Shëno + te çiftet me drejtime të kundërta.','Dy shigjeta në çdo çift.',['↑ ↓','← →','↑ →','↓ ↓'],['+','+','−','−'],'Lart–poshtë dhe majtas–djathtas janë të kundërta.','Kërko drejtime në të njëjtën vijë.'],
 ['Shëno + kur rruga e robotit përfundon një hap djathtas nisjes.','Anulo hapat e kundërt.',['→ ↑ ↓','→ → ←','← ↑ →'],['+','+','−'],'Dy rrugët e para lënë një hap djathtas; e fundit lë një hap lart.','Hiq çiftet që anulohen.'],
 ['Shëno + te pohimet e vërteta për një kub.','Mendo për një kuti të mbyllur.',['Ka 6 faqe','Ka 8 kulme','Ka 6 brinjë','Ka 12 brinjë'],['+','+','−','+'],'Kubi ka 6 faqe, 8 kulme dhe 12 brinjë.','Dallo faqen, kulmin dhe brinjën.'],
 ['Shëno + kur shigjeta fillestare ↑ kthehet në drejtimin e dhënë.','Rrotullim djathtas.',['90° →','180° ↓','270° →','360° ↑'],['+','+','−','+'],'Pas tre çerek rrotullimesh shigjeta tregon majtas, jo djathtas.','Ndiq rrotullimin nga një çerek çdo herë.'],
 ],
 code:[
 ['Rendit hapat për të larë duart.',['Laji me sapun','Thaji duart','Lagi duart'],['Lagi duart','Laji me sapun','Thaji duart'],'Fillimisht i lagim, pastaj përdorim sapunin dhe në fund i thajmë.'],
 ['Rendit hapat për të mbjellë një farë.',['Ujit farën','Vendos farën në dhe','Hap një vrimë'],['Hap një vrimë','Vendos farën në dhe','Ujit farën'],'Duhet hapur vendi para mbjelljes dhe ujitjes.'],
 ['Në planin tonë veshim xhaketën, marrim çadrën dhe pastaj dalim. Rendit këtë plan.',['Dil jashtë','Vish xhaketën','Merr çadrën'],['Vish xhaketën','Merr çadrën','Dil jashtë'],'Ky plan kërkon xhaketën para çadrës dhe daljen në fund.'],
 ['Rendit etapat e një fluture.',['Flutur','Vezë','Pupë','Vemje'],['Vezë','Vemje','Pupë','Flutur'],'Cikli kalon nga veza te vemja, pupa dhe flutura.'],
 ['Rendit numrat nga më i vogli te më i madhi.',['42','24','40','20'],['20','24','40','42'],'Krahasojmë dhjetëshet dhe pastaj njësitë.'],
 ['Rendit kohët nga më e hershmja te më e vona.',['12:15','08:30','10:00','09:45'],['08:30','09:45','10:00','12:15'],'Krahasojmë orën para minutave.'],
 ['Rendit hapat për të kontrolluar një problem matematikor.',['Kontrollo përgjigjen','Lexo të dhënat','Kryej veprimet','Zgjidh veprimin'],['Lexo të dhënat','Zgjidh veprimin','Kryej veprimet','Kontrollo përgjigjen'],'Kuptimi dhe plani vijnë para llogaritjes e kontrollit.'],
 ['Rendit thyesat nga më e vogla te më e madhja.',['1/2','1/8','1/4','1'],['1/8','1/4','1/2','1'],'Kur numëruesi është 1, më shumë pjesë japin një pjesë më të vogël.'],
 ],
 memory:[
 ['Cili simbol ishte në mes?','▲ ● ■','●','▲','■','Simboli i dytë është rrethi.','Rikujto rendin nga e majta.'],
 ['Cili simbol u shfaq dy herë?','★ ● ★ ▲','★','●','▲','Ylli ndodhet në vendin e parë dhe të tretë.','Kërko simbolin që përsëritet.'],
 ['Cila ishte ngjyra e fundit?','E kuqe · E kaltër · E verdhë','E verdhë','E kuqe','E kaltër','Vargu mbyllej me të verdhën.','Rikujto fundin e vargut.'],
 ['Cili çift ishte ngjitur në varg?','▲ ■ ● ★','■ ●','▲ ●','★ ■','Katrori dhe rrethi janë njëri pas tjetrit.','Ruaj në mend çifte fqinjësh.'],
 ['Cili numër ishte para 9?','4 · 7 · 9 · 2 · 6','7','2','4','Numri 7 vjen menjëherë para 9.','Rikujto fqinjët e numrit.'],
 ['Cila fjalë nuk ishte në listë?','Laps · Libër · Gomë · Vizore','Çantë','Gomë','Libër','Çanta nuk shfaqej në listën e katër mjeteve.','Mendo për secilin mjet që pe.'],
 ['Sa shigjeta tregonin djathtas?','→ ↑ → ← ↓ →','3','2','4','Shigjetat e para, të treta dhe të gjashta tregojnë djathtas.','Grupoi sipas drejtimit.'],
 ['Cili simbol ishte i katërti duke numëruar nga e djathta?','★ ▲ ● ■ ◆ ○','●','■','▲','Nga e djathta numërojmë ○, ◆, ■, ●.','Fillo nga ana e kërkuar.'],
 ],
 errors:[
 ['Cili send nuk i përket grupit të frutave?','Gjej elementin e veçantë.','Laps','Mollë','Dardhë','Lapsi është mjet shkrimi; të tjerat janë fruta.','Kërko një veçori të përbashkët.'],
 ['Cila figurë ndryshon nga figurat me tri anë?','▲ △ ■','■','▲','△','Katrori ka katër anë, trekëndëshat kanë tri.','Numëro anët.'],
 ['Cili numër nuk është çift?','2 · 8 · 7 · 10','7','8','10','Shtatë nuk ndahet në çifte pa mbetje.','Ndaj sendet në çifte.'],
 ['Cili barazim duhet korrigjuar?','Kontrollo çdo veprim.','9 − 4 = 6','3 + 5 = 8','2 × 3 = 6','9 − 4 është 5, jo 6.','Rillogarit pa parë rezultatin e dhënë.'],
 ['Cila njësi nuk mat gjatësi?','cm · m · kg','kg','cm','m','Kilogrami mat masë, centimetri dhe metri gjatësi.','Mendo çfarë do të matje me vizore.'],
 ['Cila fjali nuk është gjithmonë e vërtetë?','Kontrollo fjalën “çdo”.','Çdo drejtkëndësh është katror','Çdo katror ka 4 anë','Çdo trekëndësh ka 3 anë','Një drejtkëndësh mund të ketë gjatësi e gjerësi të ndryshme.','Mendo për një drejtkëndësh të gjatë.'],
 ['Cila thyesë nuk është e barabartë me gjysmën?','1/2 · 2/4 · 3/8','3/8','1/2','2/4','Gjysma e tetë pjesëve është katër, jo tre.','Krahaso numëruesin me gjysmën e emëruesit.'],
 ['Cili përfundim nuk rrjedh nga “Të gjithë robotët këtu janë blu”?','Përdor vetëm të dhënën e dhënë.','Çdo send blu është robot','Çdo robot këtu është blu','Një robot këtu nuk është i kuq','Edhe sende që nuk janë robotë mund të jenë blu.','Një rregull nuk kthehet automatikisht mbrapsht.'],
 ],
 whatif:[
 ['Ke 3 kuba. Shton edhe një. A bëhen 4?','3 + 1','Po','Jo','3 + 1 = 4.','Bashko një kub me tre.'],
 ['Heq një laps nga dy lapsa. A mbeten dy?','2 − 1','Jo','Po','Mbetet një laps.','Ndryshon numri kur heqim një send?'],
 ['Një çantë ka 6 topa. Ndajmë topat njësoj në 2 çanta. A ka 3 në secilën?','6 ÷ 2','Po','Jo','Gjashtë ndahet në dy grupe me nga tre.','Kontrollo shumën e dy grupeve.'],
 ['Nëse një numri çift i shton 1, a mbetet gjithmonë çift?','Numra çift: 2, 4, 6…','Jo','Po','Një numër çift plus një bëhet tek.','Provo një numër të vogël.'],
 ['Nëse dyfishojmë anën e një katrori, a dyfishohet perimetri?','Katër anë të barabarta.','Po','Jo','Çdo anë dyfishohet, ndaj edhe shuma e tyre dyfishohet.','Çfarë ndodh me secilën nga katër anët?'],
 ['Nëse dyfishojmë anën e një katrori, a dyfishohet sipërfaqja?','Mendo për katrorë të vegjël brenda.','Jo','Po','Sipërfaqja bëhet katër herë më e madhe.','Ndryshojnë të dy përmasat.'],
 ['Nëse radhën e dy mbledhësve e ndërrojmë, a ndryshon shuma?','7 + 12 dhe 12 + 7','Jo','Po','Mbledhja jep të njëjtën shumë në të dy rendet.','Bashkohen të njëjtat dy grupe.'],
 ['Një rrugë ka 3 hapa djathtas dhe 2 lart. Nëse ndërrojmë rendin e hapave, pa pengesa, a mbërrijmë në të njëjtën pikë?','Vetëm numri i hapave në çdo drejtim.','Po','Jo','Zhvendosja përfundimtare mbetet 3 djathtas dhe 2 lart.','Dallo rrugën e ndjekur nga pika e mbërritjes.'],
 ],
};
export function originalPuzzles(grade){return Object.entries(bank).flatMap(([cat,rows])=>rows.flatMap((row,i)=>{
 const g=Math.floor(i/2)+1,level=i%3+1;if(grade&&g!==grade)return [];
 let title,visual,answer,options,explain,hint,interaction;
 const type={logic:'balance',patterns:'pattern',math:'number',spatial:'grid',code:'ordering',memory:'choice',errors:'odd',whatif:'boolean'}[cat];
 if(type==='ordering'){[title,options,answer,explain]=row;interaction={items:options};visual='Rendit hapat me tërheqje ose me butonat ↑ ↓.';answer=JSON.stringify(answer);hint='Çfarë duhet të ndodhë përpara hapit tjetër?';}
 else if(type==='grid'){[title,visual,options,answer,explain,hint]=row;interaction={cells:options};answer=JSON.stringify(answer);}
 else if(type==='boolean'){[title,visual,answer,...options]=row;[options,explain,hint]=[[options[0]],options[1],options[2]];options=[answer,...options];}
 else{[title,visual,answer,...options]=row;explain=options[2];hint=options[3];options=[answer,...options.slice(0,2)];}
 return [{id:`original-${cat}-${i+1}`,grade:g,level,type,cat,title,visual,options,answer,explain,hint,interaction,memory:cat==='memory'}];
}));}
