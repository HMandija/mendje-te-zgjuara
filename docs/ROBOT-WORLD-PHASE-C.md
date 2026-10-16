# Bota e Robotit — Faza C

Faza C shton Dyqanin, Kuzhinën dhe dekorimet pas Kopshtit Magjik. Mbetet lokale; publikimi i produktit të plotë bëhet vetëm pas testimit të përdoruesit. Nuk kërkon migrim të ri: inventari dhe ekonomia ruhen në payload-in ekzistues D1, me të njëjtat kontrolle të sesionit, origjinës, revisionit dhe idempotencës.

## Çfarë u ndërtua

- Tema 4: katër nën-nivele me tri sfida secili. Lista e blerjes, klasifikimi i produkteve, renditja e recetave dhe dreka për një mik të shpëtuar.
- Tetë ushqime me çmime 1–3 yje. Blerjet shtojnë sasinë reale në raft; maksimumi është 20 për produkt. Çmimin, sasinë, hapjen e dyqanit dhe bilancin i kontrollon serveri. Asnjë pagesë me para ose shërbim pagese.
- Recetat: byrek, qofte me perime dhe sallatë. Klasat 1–2 renditin tri figura; klasat 3–4 kanë pesë hapa, duke shtuar përgatitjen dhe ftesën. Gatimi kërkon përbërës të blerë dhe një kafshë nga albumi. Rendi i gabuar animon brumin dhe jep mesazh pozitiv; nuk konsumon ushqime ose yje.
- Gatimi i parë i secilës sfidë konsumon përbërësit dhe jep dy yje bonus, vetëm një herë. Rilojtja është provë pa konsum. Butoni **Gatuaj përsëri** bën një drekë të re me përbërësit e blerë, pa bonus të ri; kërkesa e përsëritur me të njëjtin ID nuk konsumon ushqime dy herë.
- Shtatë dekorime me çmime 2–10 yje dhe katër aksesorë me çmime 5–15 yje. Inventari është i përhershëm. Dekoret vendosen në dhomën e gjumit ose kopsht, me prekje, tastierë dhe tërheqje. Serveri refuzon mbivendosjen me objekte/lule dhe vendosjen në dhoma të papërshtatshme.
- Kapela, syzet, shalli dhe krahët vishen/hiqen pa pagesë tjetër dhe shfaqen në robot. Skenat e dyqanit, kuzhinës, dhomës dhe kopshtit janë lokale Three.js, me pamje 2D rezervë. Miku shfaqet pranë tryezës pas gatimit. Pamja statike rirenderohet pas ndryshimit të madhësisë së ekranit.
- Katër profile zanore shqip kanë udhëzime të reja të ruajtura si WAV. Janë zëra sintetikë të prodhuar lokalisht gjatë ndërtimit, jo regjistrime njerëzore. Nuk përdoret shërbim zëri i jashtëm në lojë.
- Blerjet, përbërësit, bonuset, drekat, dekorimet dhe aksesorët ruhen për nxënësin. Radha lokale sinkronizohet pas internetit; një blerje e refuzuar për mungesë yjesh pas veprimit nga një pajisje tjetër hiqet nga radha dhe bilanci rifreskohet. Konfliktet e revisionit kanë riprova të kufizuara.
- Paneli i mësuesit tregon temën, yjet e disponueshme, sfidat nga 48 gjithsej dhe kohën. Faqja e privatësisë përfshin të dhënat e reja. Snapshot-et e Fazave A/B plotësohen pa humbur progresin.

## Si ta provosh

1. Hape `http://127.0.0.1:8787/robot-world` dhe përfundo Fabrikën, Kafshët dhe Kopshtin. Dyqani hapet pas 36 mini-sfidave. Si vizitor progresi është për provë dhe rivendoset pas rifreskimit; si nxënës në mjedisin lokal përdor `/student/robot-world` për ruajtje.
2. Zgjidh Temën 4 dhe përfundo blerjet, raftet dhe recetat. Provo një rend të gabuar: bilanci dhe përbërësit duhet të mbeten të njëjtë.
3. Te dreka hap dyqanin nga butoni i rafteve bosh. Bli përbërësit që shfaqen në recetë, pastaj **Vazhdo sfidën**. Rendit figurat, zgjidh mikun dhe gatuaj. Përbërësit përdoren dhe bonusin e merr vetëm një herë.
4. Bli ushqime të tjera dhe përdor **Gatuaj përsëri** për një drekë reale tjetër. **Provo recetën** është rilojë pa konsum dhe pa yje të rinj.
5. Bli dekor/aksesorë, hape **Dekoro dhe vishu**. Prek dekorin, pastaj një vend të lirë, ose tërhiqe. Vish kapelën/syzet. Rifresko si nxënës dhe kontrollo inventarin dhe vendosjen.
6. Provo telefon/tablet, 2D/3D, zërin dhe animacionet e pakësuara. Ndrysho madhësinë e ekranit: skena duhet të mbetet e dukshme. Bli pa internet dhe rikthe lidhjen për të provuar radhën.

## Verifikimi

- `npm test`, `npm run typecheck`, `npm run lint`, `npm run build`.
- `check-robot-world-phase-c.mjs` verifikon 12 sfidat për katër klasat, ekonominë, përbërësit, bonuset, dekorimet, aksesorët, kufijtë dhe përputhshmërinë me progresin e vjetër.
- `check-robot-world.mjs` ekzekuton rrugën reale API mbi SQLite, duke përfshirë 48 sfida, blerje, gatim të përsëritur dhe kërkesa të dyfishta.
- `scripts/check-robot-world-phase-c-browser.mjs` provon 12 sfidat, blerjet, gatimin, ruajtjen, zërin, telefon/tablet, 2D/3D dhe rikuperimin e një blerjeje të refuzuar pas konfliktit të bilancit.
- `scripts/check-robot-world-phase-c-runtime.mjs` provon Worker-in real me D1 lokale të veçuar dhe dy nxënës sintetikë. `scripts/reset-robot-world-local-qa.mjs --phase-c` përgatit vetëm këta nxënës, me Wrangler të ndalur; tokenët e provës ruhen në `.wrangler`, që është e injoruar nga Git.

Prova me fëmijë dhe në një Chromebook fizik mbetet pjesë e testimit përfundimtar. Faza D shton Shkollën dhe Robotin e Prishur.
