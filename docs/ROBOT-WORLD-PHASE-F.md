# Bota e Robotit — Faza F dhe prova përfundimtare

Produkti për provë ka shtatë tema dhe 84 mini-sfida. Nuk është publikuar. Ndryshimet mbeten në projektin lokal; asnjë burim, audio, model ose font i ri nuk merret nga CDN/shërbim i jashtëm.

## Përmirësimet

- Prova si vizitor përditëson inteligjencën pas sfidave të shkollës. Përpara këtij kontrolli pamja e robotit ruante konfigurimin e mëparshëm bashkë me inteligjencën e vjetër; tani ruan personalizimin dhe merr nivelin e verifikuar nga sfida.
- Skena e Fabrikës nuk krijon kontekst të ri WebGL për një përgjigje që nuk ndryshon gjeometrinë. Skenat ndajnë një cikël vizatimi që punon vetëm kur duhet: një vizatim për ndryshimet statike, ndalim kur janë jashtë ekranit ose faqja është fshehur, dhe cikël i kufizuar në 30 vizatime/sekondë për animacionet.
- Pajisjet me pak bërthama ose memorie përdorin rezolucion më të ulët të vizatimit dhe pa hijet e kushtueshme. Zgjedhja 2D/3D ruhet në pajisje. Kur është zgjedhur 2D, rikthimi në faqe nuk nis ngarkimin e Three.js. Dështimi ose humbja e WebGL kalon te pamja 2D.
- Materialet me të njëjtën ngjyrë ripërdoren brenda skenës. Rrjeta e misioneve përdor një mesh me instanca për pllakat, në vend të një mesh/materiali për çdo pllakë. Gjeometritë, materialet, konteksti dhe vëzhguesit pastrohen kur skena mbyllet.
- Dhjetë format e kokës/trupit përdoren edhe në misione dhe dhoma, me të njëjtin ndërtues gjeometrie. Pamja 2D ka dhjetë silueta, modelet, sytë, rrotat, antenën dhe aksesorët.
- Harta 2D shfaq vendet e hapura/mbyllura, dritën e ditës ose hënën, dritaret në mbrëmje, brendësinë pa çati dhe lëvizjen e robotit gjatë udhëtimit. Dhoma e lojës hap medaljet dhe kupën pasi ato bëhen të disponueshme.
- Ndryshimi i faqes/sfidës anulon udhëtimin e mëparshëm. Një timer i vjetër nuk e ndryshon më faqen pasi përdoruesi zgjedh diçka tjetër. Dalja nga një provë ecjeje e Fabrikës e anulon atë provë.
- Titulli, numëruesi i yjeve dhe butonat e kreut përshtaten në telefon. Butoni i kthimit ruan madhësinë. Kontrollet e zërit, animacionit dhe ditës/natës kanë emra të lexueshëm edhe kur teksti fshihet në ekran të vogël. Pamja e errët ka tekst të lexueshëm në kartat e inteligjencës, çmimeve dhe butonave të zgjedhur.
- Diploma shfaq datën në formatin ditë/muaj/vit. Mbetet një faqe A4 me pseudonimin e robotit.

## Matjet dhe kufijtë

Matjet bëhen në Windows/Chrome headless, me SwiftShader. Nuk janë matje në Chromebook fizik, telefon fizik ose të dhëna nga fëmijë. Chrome DevTools Protocol regjistron kërkesat dhe gjurmën e performancës; PerformanceObserver regjistron LCP, CLS, detyrat e gjata dhe kohëzgjatjen e ndërveprimeve. Kohëzgjatja e një ndërveprimi të vetëm nuk raportohet si INP nga përdorues realë. [Shpjegimi i Web Vitals për matjet laboratorike](https://web.dev/articles/vitals).

Në mostrën lokale të Fabrikës:

| Kontrolli | Përpara | Pas ndryshimit |
|---|---:|---:|
| Kontekste WebGL përpara/pas një përgjigjeje | 1 → 2 | 1 → 1 |
| Thirrje vizatimi në skenën statike për një sekondë | 0 | 0 |
| Thirrje vizatimi jashtë ekranit për një sekondë | cikli vazhdonte | 0 |
| LCP i mostrës lokale | 1.928 s | 1.792 s |
| CLS i mostrës lokale | 0 | 0 |

Koha e ngarkimit ndryshon sipas ngarkesës së kompjuterit; një mostër nuk provon përmirësim në çdo pajisje ose përmbushjen e 30–60 fps në Chromebook. Kufiri i ciklit është 30 fps, por shpejtësia reale duhet matur në pajisjet e shkollës. `scripts/audit-robot-world-performance.mjs` ruan raportin dhe gjurmën vetëm në `.wrangler`.

## Kontrollet teknike

- `npm test`: logjika e të katër klasave, 84 sfida për klasë, progresi i kontrolluar nga serveri, yjet/medaljet, D1/SQLite, kërkesat e dyfishta, izolimi dhe ndarja brenda klasës.
- `check-robot-world-render.mjs`: cikli statik, animacionet, ndalimi/rikthimi kur skena është jashtë ekranit ose faqja është fshehur, pastrimi dhe cilësia për pajisje të dobëta.
- `scripts/check-robot-world-phase-f-browser.mjs`: të gjitha 84 sfidat si vizitor, inteligjenca, diploma, kupa, shtatë temat në 360 px, pamja e errët, çatia e hapur 2D, anulimi i udhëtimit, ruajtja e zgjedhjes 2D dhe WebGL i detyruar të dështojë.
- Provat e shfletuesit për Fazat A–E mbulojnë ruajtjen/rifreskimin si nxënës, radhën pa internet, zërin, albumin, kuzhinën, dekorimet, shkollën, galerinë dhe garat.
- `npm run typecheck`, `npm run lint`, `npm run build`. Paralajmërimi ekzistues për `robotCourseNames` në `learning-app.tsx` është jashtë ndryshimeve të kësaj faze.
- Me serverin lokal aktiv në portën 8787, `npm run robot-world:test:browser` i kalon provat e Fazave A–E me radhë, rrugëtimin e Fazës F dhe pamjet përfundimtare. `npm run robot-world:audit` ruan matjet lokale. Provat e pamjes përfshijnë gjerësitë 320, 360, 390, 820 dhe 1280 px.

## Prova jote me produktin e plotë

Hape `http://127.0.0.1:8787/robot-world` si vizitor ose `/student/robot-world` me hyrjen e nxënësit lokal. Vizitori provon pa ruajtje pas rifreskimit; nxënësi ruan progresin në D1 lokale. Mos përdor emrin e vërtetë si emër roboti.

1. Provo telefonin dhe tabletin fizik në orientim portret dhe peizazh; kontrollo që figurat dhe komandat preken lehtë.
2. Ndërto robotin, ndrysho pjesët/ngjyrat dhe provo zërin. Kontrollo kërcimin, përshëndetjen, rrotullimin dhe ecjen.
3. Përfundo një sfidë, bëj një gabim dhe riluaje; yjet e fituar duhet të mbeten. Si nxënës rifresko dhe vazhdo aty ku mbete.
4. Provo urën, kafshët, ujitjen dhe modelet e luleve. Në kuzhinë provo rend të gabuar, blerje dhe gatim përsëri.
5. Përfundo Shkollën, kontrollo inteligjencën 1–5, antenën dhe diplomën. Ndryshimi i pjesëve të robotit nuk duhet t'i humbë këto.
6. Aktivizo/çaktivizo muzikën gjatë vallëzimit. Kontrollo vijën e ritmit, dy robotët në garë, dy gjendjet e urës dhe kupën pas tre raundeve.
7. Me dy nxënës të së njëjtës klasë provo galerinë; një nxënës i një klase tjetër nuk duhet të ketë qasje.
8. Provo 2D/3D, animacionet e pakësuara dhe shpejtësinë e ngadaltë. Kontrollo që zgjedhja 2D mbahet pas rifreskimit.
9. Si nxënës përfundo një sfidë me internet të shkëputur, pastaj rilidhe para skadimit të sesionit dhe kontrollo sinkronizimin. Mos ndrysho profilin gjatë kësaj prove.
10. Provoje me një fëmijë të klasës 1 pa i shpjeguar komandat. Shëno ku ndalon, çfarë nuk kupton nga figura/zëri dhe çfarë prek gabimisht. Kjo provë njerëzore ende nuk është kryer nga agjenti.

Publikimi bëhet vetëm pasi përdoruesi ta provojë dhe ta pranojë produktin e plotë. Kjo fazë nuk publikon ose ndryshon D1 të prodhimit.
