# Bota e Robotit — Faza A

Nxënësi hap **Bota e Robotit** nga paneli ose `/student/robot-world`.
Mësuesi / vizitori provon `/robot-world`; kjo provë nuk shkruan progres.

Katër nën-nivele me tri mini-sfida secili: forma, pjesë/ecje,
ngjyra/modele dhe shtëpia/rruga me shigjeta. Sfida të përfunduara mund
të riluhen; sfidat e reja hapen me radhë. Dhjetë variante për secilën
nga pesë pjesët, 12 ngjyra, gjashtë modele, katër zëra dhe katër shtëpi.
Klasa 3 përdor përsëritjen; Klasa 4 ka rrugë më të gjata dhe ndihmësin
e kushtit për pengesat. Gabimet nuk heqin yje.

Three.js ngarkohet si chunk lokal. Objekte procedurale, pa modele,
tekstura ose burime të jashtme. Renderer kufizon pixel ratio në 1.5,
animacionin në 30fps dhe ndalon vizatimin kur skeda është e fshehur.
SVG përdoret kur WebGL dështon ose kur nxënësi zgjedh 2D.

Worker verifikon sfidat me klasën e sesionit dhe ruan gjendjen në D1.
`robot_worlds` ka çelës `(owner,profile)`; `robot_world_events` ka
çelës `(owner,profile,id)`. Batch me revision kontrollon konkurrencën
dhe receipt-i ndalon shpërblimin e dyfishtë. Yjet llogariten nga
rekordi më i mirë për çdo mini-sfidë. Asnjë credential në kodin klient.

Radhë lokale në sessionStorage dhe localStorage të ndarë sipas ID-së së profilit, pa token në kopjen e botës. Kërkesat
shkojnë me sesionin aktual; përgjigjet pas logout nuk rikrijojnë cache.
Mbyllja e skedës/logout fshin vetëm kopjen aktive. Rihyrja e të njëjtit
nxënës merr progresin D1 dhe sinkronizon radhën e ruajtur lokalisht.
Nxënës tjetër merr një kopje tjetër; kopjet fshihen nga të dhënat e faqes.

Zëri është **sintezë lokale eSpeak NG e prodhuar paraprakisht**, jo
regjistrim njerëzor dhe jo sintezë në shfletues. Katër profile shqiptimi
me lartësi, ritëm dhe ton të ndryshëm. Gjenerimi:
`node scripts/generate-robot-world-audio.mjs`. eSpeak është vetëm
devDependency dhe nuk paketohet me lojën. Skedarët mund të zëvendësohen
me regjistrime njerëzore në të njëjtat paths. Manifesti përmban tekstet.

Migrimi: `drizzle/0016_robot_world.sql` (vetëm tabela të reja).
Privatësia dhe fshirja e profilit përfshijnë progresin e robotit.
Mësuesi sheh temën, yjet, mini-sfidat dhe kohën në progresin e klasës.

## Prova

1. Hap `/robot-world`, zgjidh klasën dhe aktivizo zërin. Ndërto robotin,
   rrotulloje dhe provo të pesë pjesët. Përfundo 12 sfidat me radhë.
2. Gabimi jep "Provo përsëri" pa humbje yjesh. Riluaj të njëjtën sfidë:
   numëruesi nuk rritet përsëri nëse rekordi është i njëjtë.
3. Klasa 1: ikonat/shigjetat; Klasa 3: butoni përsërit. Provo pengesat,
   programin bosh, kufijtë e hartës dhe pastrimin e komandave.
4. Hap hartën, shtëpinë, dhomat, natën; vendet e ardhshme shënohen
   të mbyllura. Temat 2–7 mbeten për fazat pasuese.
5. Hyr si nxënës dhe rifresko pas një sfide. Provo offline pas ngarkimit,
   bëj një sfidë dhe rikthe lidhjen. Prit konfirmimin e sinkronizimit.
6. Në panelin e mësuesit rifresko progresin e klasës. Provo nxënës tjetër:
   nuk duhet të shfaqet roboti/progresi i nxënësit të parë.
7. Telefon/tablet: butona min. 48px. Tastierë: Tab/Enter, shigjetat për
   rrotullim në 3D. Provo 2D dhe prefers-reduced-motion.

Kontrolle: `node check-robot-world.mjs`, `npm test`, `npm run typecheck`,
`npm run lint`, build dhe test shfletuesi. Nuk pretendohet verifikim në
Chromebook fizik ose testim me fëmijë pa kryer ato prova.
