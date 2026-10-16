# Bota e Robotit — Faza E

Faza E shton Vallëzimin dhe Garën e Robotëve. Loja ka 84 mini-sfida: 12 për secilën prej shtatë temave. Publikimi mbetet i shtyrë deri pas provës së produktit të plotë. Nuk shtohen shërbime të jashtme ose çelësa në faqen e lojës.

## Çfarë u ndërtua

- Sheshi i Festës hapet pas Shkollës; pista hapet pas shfaqjes së Vallëzimit. Nga harta roboti ecën drejt vendit. Nivelet e përfunduara mund të riluhen.
- Tema 6 ka katër nën-nivele: Hapat e parë, Ndjej ritmin, Koreografia dhe Shfaqja e miqve. Fëmija ndërton kërcime, rrotullime, përkulje dhe përshëndetje me figura. «Shiko vallëzimin» demonstron modelin pa dhënë yje. Vija e ritmit tregon veprimin që po luhet.
- Koreografia ka tetë lëvizje. Përsëritja mund të përmbledhë një lëvizje ose një grup; klasat 3–4 duhet ta përdorin në koreografi dhe shfaqje. Shfaqjet e fundit kanë vargje më të gjata. Publiku përbëhet nga kafshët e shpëtuara dhe duartroket.
- Roboti i personalizuar vallëzon në skenë 3D me Three.js të paketuar lokalisht; ka alternativë 2D. Muzika është një kompozim i shkurtër origjinal i prodhuar nga oshilatorë gjatë ndërtimit dhe shërbehet si WAV lokal. Ritmi dhe shpejtësia përshtaten me cilësimin e lojës. Zëri ndalet kur çaktivizohet, faqja fshihet ose skena mbyllet.
- Nxënësi mund të ndajë një shfaqje të përfunduar vetëm brenda klasës së tij aktive. Serveri kontrollon anëtarësinë, pronarin, klasën e sesionit dhe arkivimin. Galeria jep vetëm robotin me pseudonim, komandat e vallëzimit dhe datën; nuk jep profilin, rezultatet ose lidhje publike. Heqja e anëtarësisë e heq vallëzimin nga galeria.
- Tema 7 ka Garën e parë, Komanda më të shkurtra, Pistën me pengesa dhe Kampionatin. Kundërshtari llogarit rrugën më të shkurtër me një algoritëm lokal determinist mbi rrjetën; nuk përdor AI të jashtëm. Të dy robotët shfaqen në pistë.
- Koha e garës llogaritet nga programi: një njësi për komandë plus 0.15 për hap. Përsëritja ul koston e komandave. Nuk matet shpejtësia e klikimit të fëmijës dhe serveri nuk pranon kohë ose medalje të deklaruara nga klienti.
- Pista me kusht testohet me urë të lirë dhe urë të prishur; programi duhet të arrijë qëllimin në të dyja. Klasat 3–4 kanë rrugë më të gjata; klasa 4 përdor kushtin që në Pistën me pengesa. Kampionati ka tre raunde me kusht.
- Çdo garë e përfunduar jep medalje ari, argjendi ose bronzi sipas yjeve të verifikuara. Një zgjidhje më efikase mund ta përmirësojë medaljen; gabimet nuk ulin çmimet ose yjet. Tri raundet e kampionatit japin kupën. Dhoma e lojës dhe butoni i çmimeve tregojnë medaljet dhe kupën.
- Koreografia, medaljet, kupa dhe ndarja ruhen në të njëjtin Worker/D1, me radhën ekzistuese lokale kur mungon interneti. Të dhënat e fazave A–D normalizohen pa humbje. Paneli i mësuesit shfaq temën, progresin nga 84, medaljet dhe kupën; privatësia përfshin të dhënat e reja.
- Udhëzimet shqip janë skedarë lokalë në katër profile zanore sintetike eSpeak NG, të prodhuara gjatë ndërtimit. Nuk janë regjistrime njerëzore dhe loja nuk përdor sintezën e shfletuesit.

## Si ta provosh

1. Rifresko `http://127.0.0.1:8787/robot-world`. Pas diplomimit, zgjidh Tema 6 ose Sheshin e Festës nga harta. «Vazhdo botën» në diplomë hap sfidën e radhës.
2. Shiko demonstrimin. Ndërto të njëjtën radhë me katër figurat dhe prek «Vallëzo». Aktivizo zërin për muzikën; provo edhe çaktivizimin gjatë luajtjes.
3. Për përsëritjen e grupit vendos figurat e një cikli, zgjidh sa herë përsëritet dhe prek «🔁 [ ]». Te Koreografia ndërto tetë lëvizjet me një grup të përsëritur.
4. Si nxënës, pas një shfaqjeje të përfunduar zgjidh klasën dhe prek «Ndaj me klasën time». Një bashkënxënës mund ta luajë nga galeria. Si vizitor kjo pjesë nuk shfaqet.
5. Pas shfaqjes zgjidh Tema 7. Ndërto rrugën, pastaj provo të njëjtën rrugë me përsëritje dhe krahaso kohët. Në pistat me urë vendos «→ ↓» për urën e lirë dhe «↓ →» për të prishurën, pastaj hapat e përbashkët djathtas.
6. Përfundo tri raundet e kampionatit dhe hape Dhomën e çmimeve. Si nxënës rifresko dhe kontrollo që medaljet dhe kupa mbeten.
7. Provo telefon/tablet, 2D/3D, animacionet e pakësuara dhe një sfidë pa internet që sinkronizohet më pas.

## Kontrollet

- `npm test`, `npm run typecheck`, `npm run lint`, `npm run build`.
- `check-robot-world-phase-e.mjs`: 24 sfidat në katër klasa, kufijtë e parserit, përsëritja, dy skenarët e urës, koha nga programi, medaljet/kupa, ruajtjet e vjetra, kronologjia dhe rilojtja pa yje të dyfishta.
- `check-robot-world.mjs`: rruga reale API mbi SQLite me 84 sfida; ndarja brenda klasës, origjina, anëtarësia, arkivimi, heqja e anëtarit, izolimi dhe kërkesat e dyfishta.
- `scripts/check-robot-world-phase-e-browser.mjs`: Chrome lokal, 24 sfida, muzikë/udhëzime/çaktivizim, 3D/2D, dy robotë në garë, galeria, medaljet/kupa, telefon/tablet, radha pa internet dhe ndarja sipas profilit.
- `scripts/check-robot-world-phase-e-runtime.mjs`: Worker real me D1 lokale të veçuar dhe nxënës sintetikë; 24 sfida, kërkesa të dyfishta, ruajtja dhe kontrolli i ndarjes. Përgatitja bëhet me Wrangler të ndalur: `node scripts/reset-robot-world-local-qa.mjs --phase-e`. Tokenët ruhen vetëm në `.wrangler`, të injoruar nga Git.

Faza F mbetet për kontrollin përfundimtar të pamjes, animacioneve, performancës dhe testimit me fëmijë/pajisje fizike. Ky kontroll nuk zëvendëson provën e përdoruesit para publikimit.
