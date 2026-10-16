# Oborri 3D — prova e standardit të ri vizual

Hap http://127.0.0.1:8787/robot-world. Kjo është një skenë provë me një mision të plotë; nuk është migrimi i të shtatë temave dhe nuk shkruan progres në D1. Aventura ekzistuese me rregullat dhe ruajtjen e saj qëndron te /robot-world/adventure; hyrja e nxënësit vazhdon te /student/robot-world.

## Çfarë përmban

- Një ambient 3D i vazhdueshëm me shtëpi me tjegulla, dritare, grila, verandë, derë dhe orendi brenda.
- Rrugica, gardh, stol, kopsht, liqen me gurë e urë dhe pemë brenda e përreth oborrit.
- Robot me gjymtyrë të artikuluara, hapa, lëkundje trupi, sy dhe krah që mban kovën gjatë ujitjes.
- Klikim në tokë, rrugë e shënuar dhe navigim me pengesa për shtëpinë, liqenin, parcelën, stolin dhe trungjet.
- Kamerë e pjerrët me rrotullim, afrim dhe ndjekje të butë; komanda me prekje e tastierë.
- Misioni: afrohu te lulet, ujit, shiko çeljen dhe fluturat. Shpërblimi i skenës është 3 yje; përsëritja nuk e rrit.
- Three.js, modelet procedurale, teksturat e gjeneruara dhe zërat ekzistues janë lokale. Nuk ka kërkesa drejt burimeve të jashtme.

## Si ta provosh

1. Kliko një pjesë të lirë të rrugicës dhe shiko robotin duke ndjekur rrugën.
2. Tërhiq skenën për të rrotulluar kamerën; përdor +/− ose rrotëzën për afrim.
3. Shtyp Shko te lulet, pastaj Ujit lulet. Lulet duhet të çelin dhe numëruesi të bëhet 3.
4. Ujit përsëri: numëruesi mbetet 3.
5. Hap Shtëpinë: roboti ecën te dera dhe hyn; pamja kalon drejtpërdrejt në një skenë të veçantë brenda shtëpisë.
6. Zgjidh Dil në oborr për të dalë sërish. Ndrysho destinacionin edhe gjatë ecjes.
7. Nga Cilësimet pakëso animacionet, aktivizo zërin ose rifillo skenën.
8. Provoje në telefon vertikal e horizontal dhe me tastierë (fokus te skena, shigjetat për ecje).

Nëse WebGL nuk hapet, paraqitet lidhja drejt aventurës ekzistuese ku mund të përdoret 2D. Skena provë nuk pretendon ruajtje progresi: rifreskimi e rinis.

## Verifikimi

- npm run typecheck
- npx eslint components/robot-courtyard.tsx lib/robot-courtyard-scene.ts lib/robot-courtyard-path.ts
- node scripts/check-robot-courtyard-path.mjs
- npm run build
- node scripts/check-robot-courtyard-browser.mjs (serveri lokal në 8787)

Prova në Chrome kontrollon pesë përmasa, ujitjen, shpërblimin gjatë rilojtjes, kalimin në dhomën e brendshme dhe daljen në oborr, klikimet reale në tokë, tastierën, dialogët, rikthimin te aventura dhe gabimin WebGL. Pamjet janë te .wrangler/robot-world-qa/yard-*.png.

## Hapi pas vlerësimit vizual

Pasi pamja dhe ndjesia e kësaj pjese të jenë të përshtatshme, lidhim ndërveprimet me profilin real, D1 dhe sistemin ekzistues të sfidave, pastaj shtrijmë botën në temat e tjera. Performanca në pajisje fizike dhe prova me fëmijë mbeten për t'u bërë. Nuk publikohet pa testimin përfundimtar të përdoruesit.

Shtëpia tani përmban tri dhoma dhe lojën e gatimit. Shih ROBOT-HOUSE-KITCHEN.md për përdorimin dhe verifikimin.


Pjesa pasuese: [Pylli i miqve](ROBOT-FOREST.md), me tre misione shpëtimi dhe kamerë 360°.


## Ndërveprimet në hartë

Paneli i madh në fund është hequr nga oborri. Shtëpia klikohet në skenë; tabelat e Pyllit dhe Liqenit e çojnë robotin deri te hyrja përpara kalimit. Lulet shënohen në kopsht; kur roboti afrohet shfaqet veprimi Ujit. Klikimi në tokë shërben për shëtitje. Mesazhet janë flluska pranë robotit që fshihen pas 6.5 sekondash dhe rihapen nga ikona e bisedës. Kontrollet e kamerës hapen nga ikona e saj. Shenjat ndjekin projektimin 3D dhe zhvendosen pak kur nevojitet për të mos u mbivendosur në telefon. Progresi dhe mekanikat brenda shtëpisë ruhen gjatë vizitës si më parë.


## Zgjedhja nga ikona e hartës

Butonat e përhershëm mbi objekte janë hequr. Ikona «Harta e vendeve» hap një dritare me Shtëpinë, Pyllin, Liqenin dhe Lulet. Përzgjedhja e mbyll hartën dhe roboti ecën te vendi; për lulet, pasi afrohet, opsioni bëhet Ujit lulet. Harta mbyllet edhe me Escape ose me X. Klikimet mbi objektet 3D dhe lëvizja në tokë vazhdojnë të funksionojnë.
