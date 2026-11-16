const groups = [
  {id:'nisja',title:'Hapat e parë',missions:[
    ['Personazhi përshëndet','Rendit komandat dhe nis një program me flamurin e gjelbër.',[
      'Poshtë skenës, kliko «Zgjidh një personazh». Kërko «Macja» ose një personazh tjetër dhe kliko figurën. Pastaj zgjidhe personazhin poshtë skenës dhe hap skedën «Kodi».',
      'Në kategorinë «Ngjarjet», tërhiq bllokun «kur klikohet flamuri i gjelbër» në hapësirën bosh të kodimit. Ky është fillimi i programit.',
      'Te «Lëvizja», lidh poshtë tij «shko në x: -180 y: 0» dhe «drejtohu në drejtimin 90». Kliko fushat e bardha të blloqeve për të shkruar vlerat.',
      'Lidh «lëviz 100 hapa». Te «Pamja», shto poshtë tij «thuaj Përshëndetje! për 2 sekonda». Blloqet duhet të bashkohen si pjesët e një figure.',
      'Kliko flamurin e gjelbër mbi skenë. Personazhi duhet të niset majtas, të lëvizë djathtas dhe pastaj të përshëndesë. Klikoje sërish për ta provuar nga e njëjta pikë.',
      'Zhvendose bllokun e përshëndetjes përpara lëvizjes dhe provo përsëri. Çfarë ndryshoi? Shpjego rendin e ri; përdor «Shkarko projektin» ose, kur je i kyçur, «Ruaj projektin».'
    ],['Flamuri nis një sekuencë të lidhur që lëviz dhe përshëndet.','Shpjegon dallimin ndërmjet përshëndetjes para dhe pas lëvizjes.']],
    ['Skena ime e parë','Dallo sfondin e skenës nga personazhet dhe programet e tyre.',[
      'Kliko «Zgjidh një sfond» poshtë djathtas. Kërko «Pylli» dhe kliko figurën për ta vendosur si sfond.',
      'Me «Zgjidh një personazh», shto «Dhelpra» dhe «Lepuri». Zvarriti në dy anë të skenës.',
      'Zgjidh Dhelprën poshtë skenës dhe hap «Kodi». Te «Ngjarjet», tërhiq bllokun e flamurit.',
      'Te «Pamja», lidh «thuaj Jam në pyll! për 2 sekonda» poshtë flamurit të Dhelprës.',
      'Zgjidh Lepurin. Ndërto një program tjetër me flamurin dhe «thuaj Po eksploroj! për 2 sekonda». Kodi i Dhelprës nuk kopjohet vetvetiu.',
      'Nis flamurin dhe pastaj kliko miniaturën e secilit personazh poshtë skenës. Krahaso sfondin, veshjet dhe programet e tyre.'
    ],['Sfondi dhe dy personazhet shfaqen në skenë.','Të dy personazhet flasin nga programet e tyre.']],
    ['Gjej vendin në hartë','Përdor koordinatat X dhe Y për të vendosur personazhin në skenë.',[
      'Zgjidh sfondin «Rrjeti i koordinatave» dhe personazhin «Topi». Zgjidh Topin dhe hap «Kodi».',
      'Lidh flamurin nga «Ngjarjet» me «shko në x: -150 y: -80» nga «Lëvizja».',
      'Nga «Kontrolli», shto «prit 1 sekonda». Pastaj lidh «shko në x: 0 y: 80».',
      'Shto një pritje tjetër prej 1 sekonde dhe «shko në x: 150 y: -80». Të tria pikat duhet të jenë në të njëjtin program.',
      'Nis flamurin dhe shëno tri çiftet e koordinatave. Vëzhgo shenjën minus në anën e majtë dhe poshtë qendrës.',
      'Ndrysho vetëm y të pikës së mesit nga 80 në 0. Provo; pastaj riktheje dhe ndrysho vetëm x. Shpjego cili bosht lëviz në secilin rast.'
    ],['Topi viziton tri pikat sipas rendit.','Dallon lëvizjen horizontale x nga ajo vertikale y.']],
    ['Roboti kthehet','Përdor drejtimin dhe këndin për të kthyer personazhin gjatë lëvizjes.',[
      'Shto «Roboti», zgjidhe dhe vendose madhësinë 50 në fushën poshtë skenës.',
      'Nën flamur lidh «shko në x: -100 y: 80» dhe «drejtohu në drejtimin 90».',
      'Lidh «lëviz 100 hapa» dhe «prit 1 sekonda». Kjo është ana e parë e rrugës.',
      'Shto bllokun e rrotullimit në drejtim të akrepave me 90 gradë dhe pastaj «lëviz 100 hapa».',
      'Nis flamurin. Roboti duhet të ecë djathtas dhe pastaj poshtë. Vëzhgo vlerën e drejtimit poshtë skenës.',
      'Zëvendëso kthimin me bllokun në drejtimin e kundërt, përsëri 90 gradë. Provo dhe krahaso fundin e rrugës.'
    ],['Roboti përshkon dy anë me një kthesë.','Shpjegon dallimin mes dy drejtimeve të rrotullimit.']],
    ['Udhëtimi i fluturës','Lëviz personazhin gradualisht nga një pikë në tjetrën.',[
      'Shto «Flutura» dhe sfondin «Hapësira». Zgjidh Fluturën dhe hap «Kodi».',
      'Nën flamur vendos «shko në x: -160 y: -100». Ky bllok vendos pikën e nisjes menjëherë.',
      'Lidh «rrëshqit për 2 sekonda në x: 0 y: 100» nga «Lëvizja».',
      'Shto «rrëshqit për 2 sekonda në x: 160 y: -100». Kliko flamurin dhe ndiq të dy udhëtimet.',
      'Ndrysho vetëm kohën e rrëshqitjes së parë nga 2 në 4 sekonda. Mos ndrysho koordinatat.',
      'Provo përsëri dhe krahaso shpejtësitë. Pastaj zëvendëso rrëshqitjen e parë me «shko në x: 0 y: 100» për të parë ndryshimin.'
    ],['Flutura arrin në të dy pikat.','Shpjegon pse koha më e gjatë jep lëvizje më të ngadaltë.']],
    ['Topi që kërcen në skaj','Mbaj një personazh në skenë duke përdorur kufijtë e saj.',[
      'Shto «Topi», zgjidhe dhe vendos madhësinë 50. Hap skedën «Kodi».',
      'Nën flamur lidh «shko në x: 0 y: 0» dhe «drejtohu në drejtimin 45».',
      'Te «Kontrolli», vendos «përgjithmonë» poshtë blloqeve të nisjes.',
      'Brenda ciklit fut «lëviz 5 hapa» dhe «nëse prek skajin, kërce prapa» nga «Lëvizja».',
      'Kliko flamurin dhe prit të paktën katër përplasje. Ndale me butonin e kuq mbi skenë.',
      'Ndrysho drejtimin fillestar në 90 dhe pastaj në 30. Krahaso rrugët dhe provo nëse topi mbetet gjithmonë brenda skenës.'
    ],['Topi ndryshon drejtim kur prek skajin.','Nisja e re e rikthen në qendër me drejtimin e zgjedhur.']]
  ]},
  {id:'pamja',title:'Animacione dhe histori',missions:[
    ['Macja që ecën','Krijo animacion duke ndërruar kostumet e personazhit.',[
      'Shto «Macja». Zgjidhe dhe hap «Veshjet» për të parë pamjet e ndryshme të ecjes.',
      'Kthehu te «Kodi». Lidh flamurin me «përsërit 10 herë» nga «Kontrolli».',
      'Brenda përsëritjes vendos «kostumi tjetër» nga «Pamja».',
      'Poshtë tij, brenda të njëjtit cikël, fut «prit 0.2 sekonda». Përdor pikë për numrin dhjetor.',
      'Nis flamurin; macja duhet të ndërrojë kostumin dhjetë herë dhe të ndalojë.',
      'Provo pritjen 0.8 sekonda dhe krahaso ritmin. Ktheje në 0.2 dhe shpjego pse nevojitet pritja.'
    ],['Animacioni përdor të paktën dy kostume.','Pritja ndryshon ritmin e dukshëm.']],
    ['Nga shtëpia në pyll','Ndrysho sfondin për ta çuar historinë nga një vend në tjetrin.',[
      'Nga biblioteka e sfondeve shto «Dhoma» dhe «Pylli». Përdor «Dhoma» si pamjen e brendshme të shtëpisë. Zgjidh një personazh.',
      'Nën flamurin e personazhit vendos «ndrysho sfondin në Dhoma» nga «Pamja».',
      'Lidh «thuaj Jam në shtëpi! për 2 sekonda» dhe «prit 1 sekonda».',
      'Shto «ndrysho sfondin në Pylli». Zgjidhe sfondin në listën e bllokut.',
      'Lidh «thuaj Tani jam në pyll! për 2 sekonda». Nise historinë me flamur.',
      'Provo dy nisje radhazi. Të dyja duhet të fillojnë në shtëpi dhe të përfundojnë në pyll.'
    ],['Historia shfaq sfondet e shtëpisë dhe të pyllit sipas radhës.','Fjalitë përputhen me secilin vend.']],
    ['Biseda e dy miqve','Ndërto dialogun e dy personazheve me radhë.',[
      'Shto «Macja» dhe «Qeni» me sfondin «Këndi i lojërave». Vendosi majtas e djathtas.',
      'Te Macja lidh flamurin me «thuaj A do të luajmë? për 2 sekonda».',
      'Pas fjalisë së Maces shto «prit 2 sekonda» dhe «thuaj Le të fillojmë! për 2 sekonda».',
      'Te Qeni krijo një program me flamurin, «prit 2 sekonda» dhe «thuaj Po, me kënaqësi! për 2 sekonda».',
      'Vazhdo programin e Qenit me «prit 2 sekonda» dhe «thuaj Unë jam gati! për 2 sekonda».',
      'Nis flamurin dhe lexo dialogun. Ndrysho fjalitë, por ruaj radhën 0–2, 2–4, 4–6 dhe 6–8 sekonda.'
    ],['Dialogu përmban katër fjali të lexueshme.','Personazhet flasin me radhë.']],
    ['Një histori me radhë','Përdor pritjen dhe kohëzgjatjen për të renditur ngjarjet.',[
      'Vendos «Macja» majtas dhe «Qeni» djathtas. Zgjidh Macen dhe hap «Kodi».',
      'Nën flamur lidh «shko në x: -180 y: 0» dhe «rrëshqit për 2 sekonda në x: 60 y: 0».',
      'Shto «thuaj Më në fund mbërrita! për 2 sekonda». Fjalia duhet të vijë pas rrëshqitjes.',
      'Zgjidh Qenin dhe ndërto flamur → «prit 4 sekonda» → «thuaj Mirë se erdhe! për 2 sekonda».',
      'Nis flamurin dhe kontrollo nëse përshëndetja e qenit pret mbërritjen dhe fjalinë e maces.',
      'Ndrysho rrëshqitjen në 3 sekonda. Sa duhet të bëhet pritja e qenit? Ndryshoje në 5 dhe provo.'
    ],['Macja flet pasi mbërrin.','Përgjigjja vjen pas fjalisë së parë.']],
    ['Koncerti i kafshëve','Përdor tingujt për të krijuar një koncert me disa personazhe.',[
      'Shto Macen dhe Qenin në skenë. Te «Tingujt» shto një tingull për secilin personazh nga biblioteka.',
      'Te Macja krijo flamur → luaj tingullin e saj deri në fund. Te Qeni krijo një program të njëjtë me tingullin e tij.',
      'Nis flamurin dhe dëgjo si tingujt fillojnë njëkohësisht. Kontrollo që secili tingull është vendosur te personazhi i duhur.',
      'Te Qeni, shto «prit 2 sekonda» ndërmjet flamurit dhe tingullit. Mos ndrysho programin e Maces.',
      'Nis përsëri dhe krahaso koncertin kur tingujt fillojnë bashkë me versionin ku Qeni hyn më vonë.',
      'Zgjidh dy tinguj të tjerë nga biblioteka, cakto radhën e tyre dhe shpjego si pritja ndryshoi koncertin.'
    ],['Dy personazhet luajnë tinguj nga programet e tyre.','Pritja e ndryshon kohën e hyrjes së njërit tingull.']],
    ['Stripi me tri pamje','Planifiko fillimin, ngjarjen dhe përfundimin e një tregimi.',[
      'Shto sfondet «Shkolla», «Shtegu» dhe «Shtëpia e shtrigës». Zgjidh një personazh tregimtar.',
      'Nën flamur lidh «ndrysho sfondin në Shkolla» dhe «thuaj Sot gjeta një hartë! për 3 sekonda».',
      'Lidh «ndrysho sfondin në Shtegu» dhe «thuaj Ndiqa shenjat në hartë. për 3 sekonda».',
      'Lidh «ndrysho sfondin në Shtëpia e shtrigës» dhe «thuaj Thesari ishte një libër! për 3 sekonda».',
      'Nis flamurin dhe kontrollo që të tria pamjet lexohen pa ngut. Ndrysho kohën nëse nevojitet.',
      'Shkruaj tri fjali të tuat duke ruajtur fillimin, ngjarjen dhe fundin. Prezanto historinë te një shok klase.'
    ],['Historia ka tri pamje në rend të qartë.','Çdo pamje shoqërohet me një fjali të lexueshme.']]
  ]},
  {id:'ngjarjet',title:'Ngjarjet dhe bashkëpunimi',missions:[
    ['Makina me tastierë','Kontrollo lëvizjen me veprimet e tasteve të tastierës.',[
      'Shto «Roboti» dhe «Ylli». Vendos Yllin te x: 150, y: 0 dhe Robotin te x: -150, y: 0.',
      'Zgjidh Robotin. Te «Ngjarjet», vendos «kur shtypet tasti shigjeta djathtas».',
      'Lidh poshtë tij «ndrysho x me 10» nga «Lëvizja».',
      'Krijo një program tjetër: «kur shtypet tasti shigjeta majtas» → «ndrysho x me -10».',
      'Kliko skenën dhe provo dy shigjetat. Çoje Robotin deri te Ylli dhe pastaj ktheje majtas.',
      'Shto edhe flamur → «shko në x: -150 y: 0», që çdo nisje të rikthejë Robotin në pikën fillestare.'
    ],['Dy tastet lëvizin Robotin në drejtime të kundërta.','Roboti arrin te objektivi dhe mund të kthehet.']],
    ['Personazhi surprizë','Nis një veprim kur klikohet personazhi.',[
      'Shto «Butoni» dhe zgjidhe poshtë skenës. Hap «Kodi».',
      'Tërhiq «kur klikohet ky personazh» nga «Ngjarjet». Nuk nevojitet flamuri për këtë program.',
      'Lidh «ndrysho efektin ngjyra me 25» nga «Pamja».',
      'Shto «thuaj Surprizë! për 1 sekonda» poshtë efektit.',
      'Kliko drejtpërdrejt butonin në skenë disa herë dhe vëzhgo ngjyrën e mesazhin.',
      'Krijo një program tjetër: flamur → «hiq efektet grafike». Provo rikthimin në ngjyrën fillestare.'
    ],['Klikimi në skenë shfaq mesazhin.','Ngjyra ndryshon dhe flamuri e rikthen.']],
    ['Çfarë ndodh në pyll?','Nis një veprim kur ndryshon sfondi i skenës.',[
      'Shto sfondet «Shtegu» dhe «Dhoma», pastaj zgjidh një personazh.',
      'Te personazhi krijo flamur → «ndrysho sfondin në Shtegu» → «fshihe».',
      'Vazhdo me «prit 2 sekonda» dhe «ndrysho sfondin në Dhoma».',
      'Krijo një program të veçantë: «kur sfondi ndryshon në Dhoma» nga «Ngjarjet».',
      'Poshtë kësaj ngjarjeje lidh «shfaqe» dhe «thuaj Hyra në dhomë! për 2 sekonda».',
      'Nis flamurin. Personazhi duhet të shfaqet vetëm kur historia kalon brenda. Provo dy herë.'
    ],['Ndërrimi i sfondit nis programin e dytë.','Personazhi përshëndet vetëm në dhomë.']],
    ['Sinjali sekret','Dërgo dhe merr mesazhe për të lidhur dy personazhe.',[
      'Shto «Macja» dhe «Bufi». Zgjidh Macen dhe hap «Kodi».',
      'Lidh «kur klikohet ky personazh» me «thuaj Po dërgoj një mesazh! për 1 sekonda».',
      'Nga «Ngjarjet» shto «dërgo mesazhin». Në listën e tij krijo mesazhin e ri «Përshëndetje».',
      'Zgjidh Bufin. Vendos «kur marr Përshëndetje» dhe lidh «thuaj Mesazhi mbërriti! për 2 sekonda».',
      'Te Bufi, shto edhe «kostumi tjetër» poshtë përgjigjes.',
      'Kliko Macen në skenë. Kliko pastaj Bufin: ai nuk duhet ta nisë vetë mesazhin. Shpjego dërguesin dhe marrësin.'
    ],['Klikimi i dërguesit shkakton përgjigjen e marrësit.','Të dy blloqet përdorin të njëjtin emër mesazhi.']],
    ['Vallëzimi në grup','Bashkërendo disa personazhe që veprojnë njëkohësisht.',[
      'Shto «Daullja» dhe «Kitara». Zgjidh secilin dhe kontrollo tingujt në skedën «Tingujt».',
      'Nëse mungon tingulli, shto nga biblioteka «Daulle elektronike» për daullen dhe «Kitarë Do» për kitarën.',
      'Te secili personazh krijo flamur → blloku që luan tingullin e vet deri në fund.',
      'Nis flamurin dhe dëgjo si të dy programet fillojnë njëkohësisht.',
      'Te Kitara, fut «prit 2 sekonda» ndërmjet flamurit dhe tingullit. Mos ndrysho Daullen.',
      'Nis përsëri. Krahaso dy versionet dhe provo një kohë tjetër për hyrjen e kitarës.'
    ],['Flamuri nis programet e të dy instrumenteve.','Pritja ndryshon kohën e hyrjes së kitarës.']],
    ['Stafeta e mesazheve','Përdor mesazhin me pritje për të përfunduar veprimet me radhë.',[
      'Shto dy vrapues nga biblioteka dhe quaji «I pari» dhe «I dyti» në fushën e emrit.',
      'Te I pari krijo flamur → «shko në x: -160 y: 60» → «rrëshqit për 2 sekonda në x: 120 y: 60».',
      'Pastaj vendos «dërgo mesazhin Stafeta dhe prit». Krijo Stafeta nga lista e mesazheve.',
      'Te I dyti vendos «kur marr Stafeta» → «shko në x: -160 y: -60» → «rrëshqit për 2 sekonda në x: 120 y: -60».',
      'Te I pari, pas dërgimit me pritje, shto «thuaj E përfunduam stafetën! për 2 sekonda».',
      'Nis flamurin. Fjalia duhet të shfaqet pasi mbërrin vrapuesi i dytë. Krahasoje me bllokun e dërgimit pa pritje.'
    ],['Vrapuesi i dytë niset pasi merr mesazhin.','Përfundimi pret mbërritjen e vrapuesit të dytë.']]
  ]},
  {id:'perseritja',title:'Përsëritja',missions:[
    ['Hapat e ushtarit','Përdor përsëritjen për të kryer një numër të caktuar hapash.',[
      'Zgjidh një personazh. Nën flamur lidh «shko në x: -50 y: 50» dhe «drejtohu në drejtimin 90».',
      'Nga «Kontrolli» shto «përsërit 4 herë». Lëre hapësirën e brendshme të ciklit të hapur.',
      'Brenda ciklit fut «lëviz 100 hapa» dhe «prit 0.5 sekonda».',
      'Pas pritjes, ende brenda ciklit, fut rrotullimin në drejtim të akrepave me 90 gradë.',
      'Nis flamurin dhe numëro katër anët. Personazhi duhet të kthehet te pika e nisjes.',
      'Ndrysho përsëritjen në 3 dhe provo. Riktheje në 4 e shpjego pse katrori kërkon katër kthesa.'
    ],['Katër përsëritje e kthejnë personazhin në nisje.','Lëvizja dhe kthesa janë të dyja brenda ciklit.']],
    ['Peshku që noton','Krijo një animacion që përsëritet vazhdimisht.',[
      'Shto «Peshku». Te «Veshjet», kopjo një kostum dhe ndrysho pamjen e tij për të krijuar dy pozicione notimi.',
      'Kthehu te «Kodi» dhe krijo flamur → «përgjithmonë».',
      'Brenda ciklit vendos «kostumi tjetër» dhe «prit 0.5 sekonda».',
      'Nis flamurin dhe vëzhgo notimin për disa sekonda. Ndryshimi i kostumit duhet të jetë i dukshëm, jo i menjëhershëm.',
      'Shtyp butonin e kuq të ndalimit mbi skenë. Peshku duhet të ndalojë së ndërruari kostum.',
      'Provo pritjen 1 sekondë dhe krahaso ritmin. Shpjego pse këtu nuk përdorim një numër të caktuar përsëritjesh.'
    ],['Peshku ndërron kostumet derisa ndalet projekti.','Pritja kontrollon ritmin e notimit.']],
    ['Vallëzimi me modele','Përsërit një model brenda një përsëritjeje tjetër.',[
      'Shto «Ylli» dhe vendos madhësinë 20. Me butonin e shtesave poshtë majtas, shto «Lapsi».',
      'Nën flamur lidh «fshi gjithçka» nga Lapsi dhe «shko në x: -120 y: 80» nga Lëvizja.',
      'Shto «përsërit 3 herë». Brenda tij vendos një tjetër «përsërit 5 herë».',
      'Brenda ciklit me 5 përsëritje vendos bllokun e vulës nga Lapsi dhe «ndrysho x me 50».',
      'Pas ciklit të brendshëm, por brenda atij me 3 përsëritje, vendos «vendose x në -120» dhe «ndrysho y me -60».',
      'Nis flamurin. Duhet të shfaqen 3 rreshta me nga 5 yje. Ndrysho vetëm numrin e rreshtave dhe parashiko rezultatin.'
    ],['Modeli përmban 15 vula në tre rreshta.','Dallon ciklin e rreshtit nga cikli i shenjave.']],
    ['Deri te thesari','Përsërit lëvizjen derisa personazhi të arrijë te thesari.',[
      'Shto «Macja» dhe «Ylli». Vendos Yllin në x: 150, y: 0 dhe madhësinë 40.',
      'Te Macja krijo flamur → «shko në x: -150 y: 0» → «drejtohu në drejtimin 90».',
      'Shto «përsërit derisa» nga «Kontrolli». Nga «Ndjesitë», fut kushtin e prekjes dhe zgjidh Yllin.',
      'Brenda ciklit vendos «lëviz 3 hapa». Mos fut këtu mesazhin e mbërritjes.',
      'Pas ciklit lidh «thuaj Mbërrita! për 2 sekonda». Nis flamurin dhe kontrollo ndalimin te ylli.',
      'Zhvendos Yllin pak më afër, në të njëjtën lartësi, dhe provo sërish. Numri i hapave ndryshon pa ndryshuar programin.'
    ],['Macja ndalon kur prek Yllin.','Mesazhi shfaqet vetëm pas përfundimit të ciklit.']],
    ['Semafori ndalet','Ndalo një veprim të përsëritur kur jepet komanda.',[
      'Shto «Topi» dhe «Ndalo». Vendose personazhin Ndalo në një cep të dukshëm të skenës.',
      'Te Topi krijo flamur → «përgjithmonë», me «lëviz 5 hapa» dhe «nëse prek skajin, kërce prapa» brenda.',
      'Te Ndalo vendos ngjarjen «kur klikohet ky personazh».',
      'Lidh bllokun «ndalo» nga «Kontrolli» dhe zgjidh «të gjitha» në listën e tij.',
      'Nis flamurin dhe kliko Ndalo në skenë. Kontrollo që lëvizja e Topit përfundon.',
      'Nis sërish flamurin. Pastaj provo opsionin «këtë program» te butoni dhe shpjego pse Topi nuk ndalon më.'
    ],['Butoni me ndalo të gjitha ndalon animacionin.','Flamuri e nis përsëri projektin.']],
    ['Spiralja që zgjerohet','Ndrysho gjatësinë e lëvizjes brenda një cikli.',[
      'Shto shtesën «Lapsi». Te «Ndryshoret» krijo ndryshoren «Gjatësia» për të gjithë personazhet.',
      'Nën flamur lidh «fshi gjithçka», «shko në x: 0 y: 0», «drejtohu në drejtimin 90» dhe «vendose Gjatësia në 5».',
      'Ule lapsin me bllokun e Lapsit dhe vendos «përsërit 35 herë».',
      'Brenda ciklit lidh «lëviz Gjatësia hapa», rrotullimin me 90 gradë dhe «ndrysho Gjatësia me 3».',
      'Pas ciklit ngrije lapsin. Nise me flamur dhe vëzhgo si zmadhohen anët.',
      'Ndrysho rritjen nga 3 në 2 dhe provo. Krahaso largësinë ndërmjet vijave; mos ndrysho numrin e përsëritjeve.'
    ],['Spiralja ka anë që rriten gradualisht.','Nisja e re fshin vizatimin dhe rivendos gjatësinë.']]
  ]},
  {id:'kushtet',title:'Kushtet dhe logjika',missions:[
    ['Tako mikun','Kontrollo nëse personazhi prek një personazh tjetër.',[
      'Shto «Roboti» në x: -150, y: 0 dhe një personazh mik në x: 80, y: 0.',
      'Te Roboti lidh «kur shtypet tasti shigjeta djathtas» me «ndrysho x me 10».',
      'Pas lëvizjes shto «nëse … atëherë». Brenda kushtit fut prekjen nga «Ndjesitë» dhe zgjidh personazhin mik.',
      'Brenda degës vendos «ndrysho x me -10» dhe «thuaj Të gjeta! për 0.5 sekonda».',
      'Krijo edhe flamur → «shko në x: -150 y: 0». Nise dhe lëviz derisa Roboti të prekë mikun.',
      'Provo lëvizjen larg mikut dhe pranë tij. Mesazhi duhet të shfaqet vetëm kur Roboti e prek.'
    ],['Kur Roboti prek mikun, kthehet prapa.','Pa prekje nuk shfaqet mesazhi.']],
    ['Mos prek lumin','Përdor zbulimin e ngjyrës për të shmangur një pengesë në skenë.',[
      'Zgjidh Skenën dhe hap «Sfondet». Vizato një lumë blu në të djathtë mbi sfond të bardhë.',
      'Zgjidh një personazh, vendose madhësinë 30 dhe krijo flamur → «shko në x: -150 y: 0».',
      'Krijo ngjarjen e shigjetës djathtas me «ndrysho x me 10» dhe pastaj «nëse … atëherë».',
      'Në kusht fut bllokun e prekjes së ngjyrës nga «Ndjesitë». Kliko ngjyrën, zgjidh pikatoren dhe merr blunë nga lumi.',
      'Brenda kushtit vendos «shko në x: -150 y: 0». Nis flamurin dhe drejtohu te muri.',
      'Kontrollo që sfondi i bardhë nuk të kthen në nisje, ndërsa lumi po. Ndrysho ngjyrën e lumit dhe përditëso pikatoren.'
    ],['Prekja e ngjyrës së lumit rikthen personazhin në breg.','Sfondi i bardhë nuk shkakton rikthim.']],
    ['Dera e duhur','Zgjidh mes dy rezultateve me kushtin nëse/përndryshe.',[
      'Shto «Çelësi» dhe «Butoni», të cilin riemërtoje «Dera». Krijo ndryshoren «KamÇelës» për të gjithë personazhet.',
      'Te Çelësi vendos flamur → «vendose KamÇelës në 0» → «shfaqe».',
      'Krijo programin tjetër të Çelësit: «kur klikohet ky personazh» → «vendose KamÇelës në 1» → «fshihe».',
      'Te Dera lidh klikimin me «nëse … atëherë … përndryshe». Nga «Veprimet», fut krahasimin «KamÇelës = 1».',
      'Në degën e parë vendos «thuaj Dera u hap! për 2 sekonda»; te përndryshe vendos «thuaj Gjej çelësin! për 2 sekonda».',
      'Nis flamurin dhe provo Derën pa çelës, pastaj kliko Çelësin dhe provo Derën përsëri.'
    ],['Dera jep dy përgjigje sipas gjendjes së çelësit.','Nisja e re e rivendos çelësin.']],
    ['Kush është më lart?','Krahaso lartësinë e dy personazheve duke përdorur vlerat numerike.',[
      'Shto dy personazhe. Krijo ndryshoret LartësiaA dhe LartësiaB për të gjithë personazhet. Në flamurin e gjelbër vendosi përkatësisht në 10 dhe 15; këto numra përfaqësojnë lartësitë e tyre.',
      'Shto «nëse … atëherë … përndryshe» nga «Kontrolli».',
      'Te kushti fut operatorin «>». Në anën e majtë vendos LartësiaA dhe në të djathtën LartësiaB.',
      'Në degën e parë lidh «thuaj Personazhi A është më lart! për 2 sekonda».',
      'Te përndryshe lidh «thuaj Personazhi B është po aq lart ose më lart! për 2 sekonda».',
      'Provo me 10 dhe 15, pastaj me 20 dhe 15. Provo edhe dy vlera të njëjta dhe shpjego rezultatin.'
    ],['Krahasimi zgjedh personazhin me vlerën më të madhe.','Vlerat e barabarta trajtohen sipas degës përndryshe.']],
    ['Kalimi i sigurt','Kombino dy kushte me operatorin dhe.',[
      'Krijo ndryshoret «Çelësi» dhe «Kodi» për të gjithë personazhet. Nën flamur vendosi të dyja në 0.',
      'Krijo «kur shtypet tasti c» → «vendose Çelësi në 1», dhe «kur shtypet tasti k» → «vendose Kodi në 1».',
      'Krijo «kur shtypet tasti hapësirë» dhe lidh një bllok nëse me përndryshe.',
      'Në kusht vendos operatorin «dhe». Në dy anët e tij fut krahasimet «Çelësi = 1» dhe «Kodi = 1».',
      'Në degën e parë vendos «thuaj Kalo! për 1 sekonda»; te përndryshe «thuaj Mungon çelësi ose kodi. për 1 sekonda».',
      'Provo katër rastet: asnjëri, vetëm c, vetëm k dhe të dy. Nis flamurin ndërmjet provave që të rivendosen ndryshoret.'
    ],['Kalimi lejohet vetëm me të dy kushtet.','Të katër kombinimet japin përgjigjen e pritur.']],
    ['Numri çift apo tek','Përdor mbetjen e pjesëtimit për të klasifikuar numrat.',[
      'Zgjidh një personazh. Lidh flamurin me pyetjen «Shkruaj një numër të plotë, edhe zero pranohet» nga «Ndjesitë».',
      'Shto bllokun nëse me përndryshe. Vendos operatorin e barazimit në kusht.',
      'Te ana e majtë e barazimit fut operatorin e mbetjes së pjesëtimit: «mbetja e përgjigjja pjesëtuar me 2». Djathtas shkruaj 0.',
      'Në degën e parë vendos «thuaj Numri është çift. për 2 sekonda».',
      'Te përndryshe vendos «thuaj Numri është tek. për 2 sekonda».',
      'Provo 2, 7, 10 dhe 0. Shpjego çfarë do të thotë mbetja 0 kur pjesëtojmë me 2.'
    ],['Numrat çift dhe tek dallohen saktë.','Shpjegon kushtin e mbetjes së pjesëtimit.']]
  ]},
  {id:'ndergjigjja',title:'Ndërveprimi me përdoruesin',missions:[
    ['Flutura ndjek miun','Përdor pozicionin e treguesit të mausit për të drejtuar lëvizjen.',[
      'Shto «Flutura», zgjidhe dhe krijo flamur → «shko në x: 0 y: 0».',
      'Lidh «përgjithmonë» nga «Kontrolli».',
      'Brenda ciklit vendos «drejtohu nga treguesi i mausit» prej «Lëvizja».',
      'Pas drejtimit vendos «lëviz 3 hapa». Pastaj nis flamurin.',
      'Lëviz mausin brenda skenës ngadalë dhe shpejt. Ndale projektin me butonin e kuq.',
      'Provo 1 hap dhe pastaj 6 hapa. Shpjego si ndryshon ndjekja dhe zgjidh shpejtësinë më të përshtatshme.'
    ],['Flutura ndjek treguesin në vende të ndryshme.','Ndalimi i projektit ndalon edhe ndjekjen.']],
    ['Miku im virtual','Pyet përdoruesin dhe përdor përgjigjen për të krijuar një bisedë.',[
      'Zgjidh një personazh dhe vendos flamurin në «Kodi».',
      'Nga «Ndjesitë» lidh pyetjen «Cili është emri yt i lojës?» me pritje. Përdor nofkë, jo të dhëna personale.',
      'Nga «Pamja», shto «thuaj … për 2 sekonda».',
      'Në vendin e tekstit të fjalës, fut operatorin «bashko». Shkruaj «Përshëndetje, » në pjesën e parë, me hapësirë në fund.',
      'Në pjesën e dytë të bashkimit fut bllokun «përgjigjja» nga «Ndjesitë».',
      'Nis flamurin dhe provo dy nofka. Kontrollo që përshëndetja përdor përgjigjen e fundit dhe ka hapësirën e duhur.'
    ],['Përshëndetja përmban përgjigjen e shkruar.','Një nisje e re pranon një nofkë tjetër.']],
    ['Fjalëkalimi i portës','Kontrollo nëse përgjigjja e përdoruesit përputhet me fjalën e kërkuar.',[
      'Shto «Dhurata». Nën flamur vendos pyetjen «Cila është fjala e thesarit?» me pritje. Fjala e lojës do të jetë «yll»; mos përdor fjalëkalim real.',
      'Shto një bllok nëse me përndryshe nga «Kontrolli».',
      'Në kusht vendos krahasimin «përgjigjja = yll», duke tërhequr përgjigjen nga «Ndjesitë».',
      'Në degën e parë vendos «kostumi tjetër» dhe «thuaj Thesari u hap! për 2 sekonda».',
      'Te përndryshe vendos «thuaj Provo fjalën yll. për 2 sekonda».',
      'Nis flamurin një herë me fjalë të gabuar dhe një herë me «yll». Shpjego pse ky është vetëm një mekanizëm loje, jo mbrojtje llogarie.'
    ],['Fjala e saktë dhe ajo e gabuar japin rezultate të ndryshme.','Prova përsëritet pa rifreskuar faqen.']],
    ['Ylli i papritur','Përdor numra të rastësishëm për të krijuar një surprizë.',[
      'Shto «Butoni» dhe riemërtoje «Zari». Zgjidhe dhe hap «Kodi».',
      'Vendos ngjarjen «kur klikohet ky personazh».',
      'Lidh «thuaj … për 1 sekonda» nga «Pamja».',
      'Në fushën e tekstit fut «zgjidh rastësisht nga 1 deri në 6» nga «Veprimet».',
      'Kliko Zarin dhjetë herë në skenë dhe shëno rezultatet. Prit përfundimin e fjalisë mes klikimeve.',
      'Kontrollo që nuk del as 0 as 7. A mund të dalë i njëjti numër dy herë radhazi? Ndrysho intervalin në 1–12 dhe provo.'
    ],['Të gjitha rezultatet janë brenda kufijve.','Çdo klikim kryen një zgjedhje të re.']],
    ['Gara me kohën','Përdor kohëmatësin për të matur kohën ndërmjet dy veprimeve.',[
      'Shto dy butona dhe quaji «Nis» e «Mbaro». Krijo ndryshoren «Koha» për të gjithë personazhet.',
      'Te Nis vendos «kur klikohet ky personazh» → blloku i zerimit të kohëmatësit nga «Ndjesitë».',
      'Pas zerimit vendos «vendose Koha në 0» dhe «thuaj U nis! për 0.5 sekonda».',
      'Te Mbaro vendos klikimin → «vendose Koha në kohëmatësi», duke futur bllokun nga «Ndjesitë».',
      'Shto «thuaj Koha për 2 sekonda» duke tërhequr ndryshoren në fushën e tekstit.',
      'Kliko Nis, prit pak dhe kliko Mbaro. Provo përsëri me një pritje më të gjatë; kontrollo që matja e re fillon nga zero.'
    ],['Koha matet nga klikimi i Nis deri te Mbaro.','Një provë e re e rivendos matjen.']],
    ['Afër apo larg','Përdor largësinë nga një objekt si kusht.',[
      'Shto «Macja» në qendër dhe «Ylli» në anën e djathtë. Zgjidh Macen.',
      'Nën flamur vendos «përgjithmonë». Brenda tij lidh «shko te treguesi i mausit».',
      'Pas lëvizjes, brenda ciklit, vendos një nëse me përndryshe.',
      'Në kusht fut «largësia nga Ylli < 100», me bllokun e largësisë nga «Ndjesitë» dhe krahasimin nga «Veprimet».',
      'Në degën e parë vendos «thuaj Afër!» pa kohë; te përndryshe vendos «thuaj Larg!» pa kohë.',
      'Nis flamurin dhe lëviz mausin brenda skenës pranë e larg Yllit. Ndrysho kufirin në 50 dhe krahaso zonën e reagimit.'
    ],['Mesazhi ndryshon sipas largësisë nga Ylli.','Një kufi më i vogël zvogëlon zonën Afër.']]
  ]},
  {id:'variablat',title:'Variablat dhe pikët',missions:[
    ['Numëruesi im','Krijo dhe shfaq një ndryshore që ndryshon gjatë projektit.',[
      'Shto «Ylli». Te «Ndryshoret», kliko krijimin e ndryshores, quaje «Pikë» dhe zgjidh për të gjithë personazhet.',
      'Lëre të shënuar kutinë pranë Pikë që vlera të shfaqet në skenë.',
      'Krijo flamur → «vendose Pikë në 0».',
      'Krijo një program tjetër: «kur klikohet ky personazh» → «ndrysho Pikë me 1».',
      'Nis flamurin dhe kliko Yllin pesë herë. Vlera duhet të bëhet 5.',
      'Nis flamurin përsëri dhe kontrollo zerimin. Provo të shtosh 2 në çdo klikim dhe parashiko rezultatin e pesë klikimeve.'
    ],['Pikët nisin nga zero në çdo nisje.','Çdo klikim e rrit vlerën sipas bllokut.']],
    ['Mblidh mollët','Rrit pikët kur mblidhet një mollë, vetëm një herë për prekje.',[
      'Shto «Tasi» dhe «Molla». Krijo ndryshoren Pikë për të gjithë personazhet.',
      'Te Tasi krijo flamur → përgjithmonë → «shko te treguesi i mausit».',
      'Te Molla krijo flamur → «vendose Pikë në 0» → «shko te pozicion rastësor».',
      'Shto «përsërit derisa Pikë = 5». Brenda vendos «prit derisa prek Tasi», «ndrysho Pikë me 1» dhe «shko te pozicion rastësor».',
      'Në fund të ciklit vendos «prit derisa jo prek Tasi», duke futur prekjen brenda operatorit «jo». Pas ciklit vendos «thuaj Fitove! për 2 sekonda» dhe «ndalo të gjitha».',
      'Nis flamurin dhe mblidh pesë mollë. Mbaje tasin mbi një mollë për të kontrolluar që një prekje nuk numërohet vazhdimisht.'
    ],['Çdo mbledhje shton vetëm një pikë.','Loja përfundon pasi mblidhen pesë fruta.']],
    ['Tre jetë për aventurën','Pakëso jetët dhe përfundo lojën kur bëhen zero.',[
      'Shto «Macja» në x: -150, y: 0 dhe «Shkëmbinjtë» në x: 100, y: 0. Krijo ndryshoren Jetë.',
      'Te Macja krijo flamur → «vendose Jetë në 3» → «shko në x: -150 y: 0».',
      'Krijo ngjarjen e shigjetës djathtas me «ndrysho x me 10» dhe pastaj nëse prek Shkëmbinjtë.',
      'Brenda kushtit vendos «ndrysho Jetë me -1» dhe menjëherë «shko në x: -150 y: 0», që të ndërpritet prekja.',
      'Pas kushtit vendos një tjetër: nëse Jetë = 0, atëherë «thuaj Loja mbaroi! për 2 sekonda» dhe «ndalo të gjitha».',
      'Nis flamurin dhe kryej tri përplasje. Kontrollo vlerat 2, 1, 0 dhe provo nisjen e re me tri jetë.'
    ],['Çdo përplasje heq një jetë.','Loja mbaron në zero dhe riniset me tri jetë.']],
    ['Dyqani i vogël','Llogarit një shumë nga çmimi dhe sasia.',[
      'Shto «Molla» dhe krijo ndryshoret Çmimi, Sasia dhe Shuma.',
      'Nën flamur vendos «vendose Çmimi në 20» dhe pyet «Sa mollë dëshiron?» me pritje.',
      'Shto «vendose Sasia në përgjigjja», duke marrë përgjigjen nga «Ndjesitë».',
      'Shto «vendose Shuma në …». Në vlerë fut operatorin e shumëzimit me Çmimi në njërën anë dhe Sasia në tjetrën.',
      'Lidh «thuaj … për 3 sekonda». Në tekst fut bashkimin e «Gjithsej lekë: » me ndryshoren Shuma.',
      'Provo sasitë 2 dhe 5; duhet të dalin 40 dhe 100. Ndrysho çmimin dhe llogarit me mend përpara provës.'
    ],['Shuma është çmimi i shumëzuar me sasinë.','Mesazhi përdor rezultatin e llogaritur.']],
    ['Makina që shpejton','Përdor një ndryshore për të kontrolluar shpejtësinë e lëvizjes.',[
      'Shto «Topi» dhe krijo ndryshoret Pikë dhe Shpejtësia. Nën flamur vendosi në 0 dhe 2 përkatësisht.',
      'Pas nisjes shto përgjithmonë, me «lëviz Shpejtësia hapa» dhe «nëse prek skajin, kërce prapa» brenda.',
      'Brenda të njëjtit cikël shto nëse Pikë > 4, atëherë «vendose Shpejtësia në 6».',
      'Krijo programin tjetër: kur klikohet ky personazh → «ndrysho Pikë me 1».',
      'Nis flamurin dhe kap Topin me pesë klikime. Vëzhgo ndryshimin e shpejtësisë pas klikimit të pestë.',
      'Nis sërish dhe kontrollo rikthimin në 2. Mos përdor rritje të vazhdueshme brenda kushtit, sepse shpejtësia do të rritej pa kufi.'
    ],['Topi shpejtohet kur arrihen pesë pikë.','Nisja e re rivendos pikët dhe shpejtësinë.']],
    ['Mesatarja e tri matjeve','Ruaj disa vlera para se të lexosh përgjigjen tjetër.',[
      'Krijo ndryshoret A, B, C dhe Mesatarja. Zgjidh një personazh tregimtar.',
      'Nën flamur pyet «Matja e parë?» dhe vendose A në përgjigjja.',
      'Pyet «Matja e dytë?» dhe vendose B në përgjigjja. Pastaj pyet «Matja e tretë?» dhe vendose C në përgjigjja.',
      'Vendose Mesatarja në operatorin e pjesëtimit. Në anën e majtë ndërto me dy mbledhje «(A + B) + C», kurse djathtas vendos 3.',
      'Lidh «thuaj Mesatarja për 3 sekonda», duke tërhequr ndryshoren në fushën e tekstit.',
      'Provo 3, 6 dhe 9: rezultati duhet të jetë 6. Shpjego pse secilën përgjigje e ruajtëm përpara pyetjes tjetër.'
    ],['Mesatarja llogaritet nga tri matjet.','Përgjigjet e mëparshme ruhen në ndryshore të veçanta.']]
  ]},
  {id:'efektet',title:'Dizajni i projektit',missions:[
    ['Gjiganti dhe milingona','Ndrysho madhësinë e personazhit gradualisht dhe rivendose në nisje.',[
      'Shto «Pema» dhe «Mollëkuqja». Vendose Pemën në qendër dhe Mollëkuqen pranë saj. Zgjidh Pemën.',
      'Nën flamur vendos «shko në x: 0 y: -50» dhe «vendose madhësinë në 20 %».',
      'Shto «përsërit 20 herë» nga «Kontrolli».',
      'Brenda ciklit lidh «ndrysho madhësinë me 3» dhe «prit 0.1 sekonda».',
      'Nis flamurin dhe vëzhgo Pemën të bëhet gjigante pranë Milingonës. Në fund madhësia duhet të jetë 80 për qind.',
      'Nis sërish për të kontrolluar madhësinë fillestare. Provo një rritje më të vogël dhe krahaso Pemën me Milingonën.'
    ],['Pema rritet gradualisht pranë Milingonës.','Çdo nisje e rivendos Pemën në madhësinë fillestare.']],
    ['Magjia e ngjyrave','Përdor efektet grafike për të ndryshuar pamjen e personazhit.',[
      'Shto «Flutura». Nën flamur vendos «hiq efektet grafike».',
      'Shto «përsërit 10 herë». Brenda vendos «ndrysho efektin ngjyra me 20».',
      'Pas ndryshimit, brenda ciklit, vendos «prit 0.2 sekonda».',
      'Pas ciklit vendos «prit 1 sekonda» dhe «hiq efektet grafike».',
      'Nis flamurin dhe krahaso pamjen fillestare, animacionin dhe fundin.',
      'Nga lista e efektit zgjidh mozaik ose tejdukshmëri dhe provo. Mbaj në fund pastrimin e efekteve.'
    ],['Një efekt ndryshon pamjen gjatë animacionit.','Në fund personazhi kthehet në pamjen e vet.']],
    ['Kush fshihet pas pemës?','Vendos personazhet përpara ose pas njëri-tjetrit.',[
      'Shto «Pema» në qendër dhe «Macja» pak mbi të, që figurat të mbivendosen.',
      'Zgjidh Macen. Nën flamur vendos «shko në x: 0 y: 0».',
      'Shto «shko në shtresën prapa» nga «Pamja» dhe «prit 2 sekonda».',
      'Lidh «shko në shtresën përpara» dhe «thuaj Tani më sheh! për 2 sekonda».',
      'Nis flamurin dhe vëzhgo cilat pjesë të Maces mbulohen nga Pema përpara ndryshimit.',
      'Shto një personazh të tretë dhe provo bllokun «shko prapa 1 shtresa» për të parë dallimin nga shtresa e fundit.'
    ],['Macja duket pas Pemës në fillim.','Ndryshimi i shtresës e sjell përpara.']],
    ['Fluturimi në dy drejtime','Përdor stile rrotullimi të ndryshme për lëvizjen majtas dhe djathtas.',[
      'Shto «Flutura» dhe zgjidhe. Hap «Kodi».',
      'Nën flamur vendos «vendos stilin e rrotullimit majtas-djathtas».',
      'Krijo ngjarjen e shigjetës djathtas me «drejtohu në drejtimin 90» dhe «lëviz 10 hapa».',
      'Krijo ngjarjen e shigjetës majtas me «drejtohu në drejtimin -90» dhe «lëviz 10 hapa».',
      'Nis flamurin dhe provo shigjetat. Flutura duhet të shohë në drejtimin e fluturimit pa u përmbysur.',
      'Provo stilin «në të gjitha drejtimet», krahasoje dhe rikthe «majtas-djathtas». Shpjego zgjedhjen.'
    ],['Flutura ndryshon drejtim sipas tastit.','Pamja nuk përmbyset gjatë fluturimit majtas.']],
    ['Orkestra e vogël','Kontrollo volumin e tingujve me tastierë.',[
      'Shto «Radioja». Në «Tingujt» shto «Piano Do» nga biblioteka dhe kthehu te «Kodi».',
      'Nën flamur vendos bllokun e volumit në 50 për qind nga «Tingulli».',
      'Krijo ngjarjen e tastit hapësirë dhe lidh bllokun që luan Piano Do deri në fund.',
      'Krijo ngjarjen e shigjetës lart me ndryshimin e volumit me 10.',
      'Krijo ngjarjen e shigjetës poshtë me ndryshimin e volumit me -10.',
      'Nis flamurin, provo dy nivele me tastin hapësirë dhe kontrollo rikthimin në 50. Mos e rrit volumin fizik të pajisjes në nivel të pakëndshëm.'
    ],['Dy tastet ndryshojnë volumin në drejtime të kundërta.','Flamuri rivendos nivelin fillestar.']],
    ['Melodia me katër nota','Krijo një melodi me nota dhe ritëm, jo me regjistrim zanor.',[
      'Me butonin e shtesave poshtë majtas, shto «Muzika». Zgjidh një personazh instrumenti.',
      'Nën flamur vendos instrumentin Piano dhe tempin 90 nga blloqet e Muzikës.',
      'Shto «përsërit 2 herë» nga «Kontrolli».',
      'Brenda ciklit lidh katër blloqe të luajtjes së notës: 60, 64, 67 dhe 72; secila për 0.5 rrahje.',
      'Pas notës së katërt, brenda ciklit, shto një pushim prej 0.5 rrahjeje. Nise melodinë.',
      'Provo tempin 60 dhe pastaj 120 pa ndryshuar notat. Krahaso kohëzgjatjen dhe ndërto një rend tëndin me katër nota.'
    ],['Melodia luan katër nota në rend dhe përsëritet.','Ndryshimi i tempit ndryshon shpejtësinë e melodisë.']]
  ]},
  {id:'listat',title:'Projekte më të avancuara',missions:[
    ['Lista e blerjeve','Krijo një listë dhe shto elemente të reja në të.',[
      'Te «Ndryshoret», krijo listën «Fjalët» për të gjithë personazhet dhe lëre të dukshme në skenë.',
      'Nën flamur vendos «fshi gjithçka nga Fjalët».',
      'Shto «përsërit 3 herë». Brenda vendos pyetjen «Çfarë duhet të blejmë?» me pritje.',
      'Pas pyetjes, brenda ciklit, vendos «shto përgjigjja në Fjalët».',
      'Nis flamurin dhe shkruaj tri artikuj të ndryshëm. Kontrollo rendin nga lart poshtë në listë.',
      'Nis sërish dhe shkruaj fjalë të tjera. Lista duhet të pastrohet përpara pyetjes së parë.'
    ],['Lista përmban tre artikujt në rendin e shtimit.','Nisja e re nuk i bashkon me artikujt e vjetër.']],
    ['Zgjidh një surprizë','Lexo një element nga lista sipas pozicionit dhe kontrollo kufijtë.',[
      'Krijo listën «Ide». Nën flamur fshi gjithçka nga Ide dhe shto, me tri blloqe, «Kuiz», «Labirint» dhe «Histori».',
      'Pyet «Zgjidh një pozicion: 1, 2 ose 3» me pritje.',
      'Shto nëse me përndryshe. Ndërto kushtin me «dhe»: përgjigjja > 0 dhe përgjigjja < 4.',
      'Në degën e parë vendos «thuaj … për 2 sekonda», me bllokun «elementi përgjigjja i Ide» në tekst.',
      'Te përndryshe vendos «thuaj Shkruaj 1, 2 ose 3. për 2 sekonda».',
      'Provo veçmas 1, 3 dhe 4 duke nisur flamurin. Për këtë provë përdor vetëm numra të plotë.'
    ],['Pozicionet 1–3 japin idenë përkatëse.','Pozicioni 4 jep udhëzimin dhe jo një ide të gabuar.']],
    ['Rregullo inventarin','Numëro elementet në listë dhe fshi një element të zgjedhur.',[
      'Krijo listën «Detyrat». Nën flamur fshi gjithçka nga ajo.',
      'Shto me tri blloqe detyrat «Lexo», «Vizato» dhe «Provo kodin».',
      'Lidh «thuaj … për 2 sekonda» dhe fut brenda tij «gjatësia e Detyrat».',
      'Pas fjalisë vendos «fshi 2 nga Detyrat». Ky është pozicioni, jo teksti i detyrës.',
      'Shto një tjetër «thuaj gjatësia e Detyrat për 2 sekonda».',
      'Nis flamurin. Numri duhet të kalojë nga 3 në 2 dhe «Vizato» të hiqet. Shpjego çfarë ndodhi me pozicionin e detyrës së tretë.'
    ],['Numri i elementeve ulet me një.','Hiqet elementi i pozicionit të zgjedhur.']],
    ['Shiu i yjeve','Krijo kopje me sjellje të pavarur dhe fshiji në fund.',[
      'Shto «Ylli» dhe vendos madhësinë 20. Nën flamur vendos «fshihe».',
      'Pas fshehjes vendos «përsërit 10 herë», me «krijo kopje të vetes» dhe «prit 0.3 sekonda» brenda.',
      'Krijo programin «kur filloj si kopje». Lidh «shko në x: rastësisht nga -200 deri në 200 y: 160» dhe «shfaqe».',
      'Shto «përsërit derisa pozicioni y < -150». Brenda tij vendos «ndrysho y me -5».',
      'Pas ciklit të rënies vendos «fshije këtë kopje». Mos e vendos brenda ciklit.',
      'Nis flamurin dhe numëro yjet që bien. Prit fundin: kopjet duhet të zhduken, pa krijuar kopje të reja vetë.'
    ],['Shfaqen dhjetë kopje në pozicione të ndryshme.','Çdo kopje fshihet kur arrin në fund.']],
    ['Komanda ime','Krijo një bllok të personalizuar dhe përdore për të vizatuar forma.',[
      'Shto «Lapsi». Te «Blloqet e mia», krijo një bllok me emrin «Vizato katror» pa hyrje.',
      'Poshtë përkufizimit të tij vendos uljen e lapsit dhe «përsërit 4 herë».',
      'Brenda ciklit lidh «lëviz 60 hapa» dhe rrotullimin me 90 gradë. Pas ciklit ngrije lapsin.',
      'Krijo programin kryesor: flamur → fshi gjithçka → shko në x: -100 y: 50 → drejtohu në drejtimin 90.',
      'Thirr «Vizato katror», pastaj «shko në x: 40 y: 50» dhe thirr përsëri «Vizato katror».',
      'Nis flamurin. Ndrysho gjatësinë vetëm te përkufizimi në 80 dhe kontrollo që ndryshojnë të dy katrorët.'
    ],['Programi kryesor e thërret dy herë të njëjtin bllok.','Ndryshimi te përkufizimi ndikon te të dy format.']],
    ['Katrorë me madhësi të ndryshme','Jepi një parametër bllokut të krijuar vetë.',[
      'Shto «Lapsi». Te «Blloqet e mia», krijo «Vizato katror» dhe shto një hyrje numër ose tekst me emrin «ana».',
      'Te përkufizimi ule lapsin dhe vendos përsërit 4 herë, me lëvizjen dhe kthimin 90 gradë brenda.',
      'Në fushën e hapave të lëvizjes tërhiq hyrjen «ana» nga kreu i përkufizimit. Pas ciklit ngrije lapsin.',
      'Te programi kryesor vendos flamur → fshi gjithçka → drejtohu në drejtimin 90 → shko në x: -150 y: 80.',
      'Thirr «Vizato katror 40», zhvendosu në x: 20 y: 80 dhe thirr «Vizato katror 100».',
      'Nis flamurin dhe krahaso madhësitë. Ndrysho vetëm njërën vlerë të thirrjes dhe shpjego dallimin nga ndryshimi i përkufizimit.'
    ],['Një përkufizim prodhon dy katrorë me madhësi të ndryshme.','Parametri i thirrjes kontrollon gjatësinë e anës.']]
  ]},
  {id:'projekte',title:'Sfida krijuese',missions:[
    ['Labirinti me nivele','Bashko tastierën, pengesat dhe kalimin në nivelin tjetër.',[
      'Te Skena vizato dy sfonde me emrat «Niveli 1» dhe «Niveli 2»: rrugë të bardha, mure të kuqe dhe dalje të gjelbër. Lër nisjen te x: -180, y: 0 të lirë në të dy.',
      'Zgjidh një personazh me madhësi 20. Nën flamur ndrysho sfondin në Niveli 1 dhe shko në x: -180 y: 0.',
      'Krijo katër ngjarje shigjetash: djathtas ndrysho x me 5, majtas me -5, lart ndrysho y me 5 dhe poshtë me -5.',
      'Në një cikël përgjithmonë pas nisjes, vendos nëse prek të kuqen, atëherë shko në x: -180 y: 0. Përdor pikatoren për ngjyrën.',
      'Shto nëse prek të gjelbrën: brenda kontrollo emrin e sfondit. Nëse është Niveli 1, ndrysho në Niveli 2 dhe rikthehu në nisje; përndryshe thuaj «Fitove!» për 2 sekonda dhe ndalo të gjitha.',
      'Provo përplasjen në të dy nivelet dhe përfundimin e tyre. Nëse personazhi kalon përmes murit, zvogëlo hapin ose zgjero murin.'
    ],['Lojtari mund të përfundojë dy nivele.','Muri dhe dalja japin reagimet e duhura.']],
    ['Kuizi i zgjuar','Kontrollo përgjigjet e një kuizi dhe llogarit pikët.',[
      'Zgjidh një personazh dhe krijo ndryshoren Pikë. Nën flamur vendose në 0.',
      'Pyet «Sa bëjnë 3 + 4?» me pritje. Pastaj, nëse përgjigjja = 7, ndrysho Pikë me 1.',
      'Pas kushtit të parë pyet «Sa anë ka katrori?». Nëse përgjigjja = 4, ndrysho Pikë me 1.',
      'Pas kushtit të dytë pyet «Cili planet është shtëpia jonë?». Nëse përgjigjja = Toka, ndrysho Pikë me 1.',
      'Në fund thuaj për 3 sekonda bashkimin e «Pikët e tua: » me ndryshoren Pikë.',
      'Provo të gjitha saktë, të gjitha gabim dhe një përzierje. Pastaj zëvendëso pyetjet me një temë tënden dhe kontrollo përgjigjet.'
    ],['Tri pyetje të ndryshme kontrollohen veçmas.','Pikët janë 0–3 dhe rivendosen në nisje.']],
    ['Loja që bëhet më e vështirë','Ndrysho vështirësinë gjatë lojës sipas pikëve.',[
      'Shto «Ylli» dhe krijo ndryshoret Pikë dhe Pritja. Nën flamur vendosi në 0 dhe 1.',
      'Pas nisjes vendos përgjithmonë: shko te pozicion rastësor dhe prit Pritja sekonda.',
      'Brenda të njëjtit cikël shto nëse Pikë > 4, atëherë vendose Pritja në 0.4.',
      'Krijo një program tjetër: kur klikohet ky personazh → ndrysho Pikë me 1.',
      'Nis flamurin dhe kliko Yllin pesë herë. Pas pragut duhet të ndërrojë vend më shpejt, jo të shtojë pikë vetë.',
      'Nis sërish; pritja duhet të kthehet në 1. Provo me një shok klase dhe zgjidh një prag e ritëm të arsyeshëm.'
    ],['Vështirësia ndryshon vetëm pasi arrihet pragu.','Loja e re fillon me pritjen dhe pikët fillestare.']],
    ['Detektivi i gabimeve','Gjurmo një program dhe gjej udhëzimin e gabuar.',[
      'Shto «Macja» në x: -100, y: 0 dhe «Ylli» në x: 100, y: 0. Zgjidh Macen.',
      'Ndërto flamur → shko në x: -100 y: 0 → drejtohu në drejtimin 90 → lëviz 200 hapa.',
      'Provo programin e saktë dhe shëno ku mbërrin Macja. Pastaj ndrysho qëllimisht drejtimin në -90.',
      'Nis flamurin dhe përshkruaj rezultatin e gabuar para se të ndryshosh diçka tjetër.',
      'Kliko blloqet një nga një nga lart poshtë. Shiko vlerën e drejtimit dhe koordinatën x pas secilit.',
      'Korrigjo vetëm drejtimin në 90, provo përsëri dhe shpjego shkakun. Më pas krijo një gabim tjetër për një shok klase.'
    ],['Identifikon bllokun që shkakton rezultatin e gabuar.','Pas korrigjimit Macja arrin te Ylli.']],
    ['Projekti im përfundimtar','Planifiko, krijo dhe prezanto një projekt personal.',[
      'Shkruaj në letër një fjali për qëllimin: çfarë bën lojtari, çfarë ndodh dhe si kuptohet përfundimi. Zgjidh personazhet e sfondin që i duhen.',
      'Ndërto nisjen me flamur. Rivendos vendet, kostumet dhe ndryshoret që projekti të mund të provohet disa herë.',
      'Shto një ndërveprim me tastierë ose klikim. Provoje këtë pjesë përpara se të vazhdosh.',
      'Shto një kusht nëse që ndryshon rezultatin dhe të paktën një cikël ose një ndryshore. Shpjego çfarë kontrollon secili.',
      'Provo një rrugë të suksesshme dhe një rast të gabuar. Përmirëso një pjesë që nuk kuptohet lehtë nga një shok klase.',
      'Ruaje privatisht ose shkarkoje. Prezanto qëllimin, blloqet kryesore dhe ndryshimin që bëre pas provës; mos përfshi të dhëna personale.'
    ],['Projekti ka qëllim të qartë dhe aftësitë e kërkuara.','Prezantimi shpjegon provën dhe përmirësimin.']],
    ['Loja e raketës dhe topit','Bashko përplasjen, kontrollin me maus dhe humbjen e lojës.',[
      'Shto «Topi» me madhësi 30 dhe «Raketa» me madhësi 80. Këtu Raketa është personazhi i lojës me top, jo raketa hapësinore.',
      'Te Raketa vendos flamur → përgjithmonë, me «vendose x në x i mausit» dhe «vendose y në -130» brenda.',
      'Te Topi vendos flamur → shko në x: 0 y: 100 → drejtohu në drejtimin 135 → përgjithmonë.',
      'Brenda ciklit të Topit vendos lëviz 4 hapa dhe nëse prek skajin, kërce prapa. Pastaj, nëse prek Raketa, drejtohu në drejtimin rastësisht nga -60 deri në 60 dhe ndrysho y me 10.',
      'Në fund të ciklit kontrollo nëse pozicioni y < -160: thuaj «Loja mbaroi!» për 2 sekonda dhe ndalo të gjitha.',
      'Nis flamurin dhe lëviz mausin horizontalisht në skenë. Provo disa goditje, pastaj humbe qëllimisht topin dhe kontrollo nisjen e re.'
    ],['Raketa ndjek mausin dhe e kthen topin lart.','Kalimi poshtë raketës përfundon lojën.']]
  ]}
];

export const CODING_MISSION_GROUPS=groups.map(({id,title,missions})=>({id,title,count:missions.length}));
export const CODING_MISSIONS=groups.flatMap(({id:group,title:groupTitle,missions})=>missions.map(([title,objective,steps,criteria],index)=>({
  id:`${group}-${index+1}`,grade:5,group,groupTitle,title,objective,steps,criteria
})));
export function codingMission(id){return CODING_MISSIONS.find(mission=>mission.id===id)||null;}
