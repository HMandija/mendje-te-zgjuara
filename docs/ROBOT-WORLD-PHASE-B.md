# Bota e Robotit — Faza B, provë lokale

Faza B shton Temën 2 dhe Temën 3 mbi Fabrikën. Publikimi shtyhet deri pas përfundimit dhe provës së produktit të plotë, sipas kërkesës së përdoruesit. Nuk ndryshon shërbimin publik ose bazën D1 të prodhimit.

## Çfarë përfshin

- **Shpëtimi i Kafshëve:** katër nën-nivele me tri mini-sfida secili: rrugët e lepurushit, pengesat e pyllit, ura e liqenit dhe shpëtimet për albumin. Gjashtë kafshë mblidhen në album; rilojtja nuk shton kopje.
- **Kopshti Magjik:** katër nën-nivele me tri mini-sfida secili: ec–përkulu–ujit, rreshtat me përsëritje, modelet e mbjelljes dhe kopshti i plotë. Lulet çelin në skenë, ruhen, rriten gjatë vizitave dhe zhvendosen me prekje, tastierë ose tërheqje.
- Klasat 1–2 kanë shtigje më të shkurtra dhe kontrolle me figura/shigjeta; klasat 3–4 kanë rrugë më të gjata dhe grupe të përsëritura. Klasa 4 ekzekuton kushtin e ruajtur «nëse rruga është e lirë, ec; ndryshe, ndërto». Kushti kontrollohet edhe në server.
- Ura ndërtohet vetëm në qelizën fqinje. Roboti nuk kalon në ujë pa dërrasë dhe nuk ujit pa u përkulur te lulja. Gabimet nuk heqin yje dhe nuk kanë tingull ndëshkues.
- Three.js mbetet i paketuar lokalisht. Skenat kanë robotin e personalizuar, hapa/gjurmë, dërrasa, kafshë dhe lule. Pamja SVG është alternativa 2D dhe aktivizohet edhe kur WebGL dështon. Skenat e mbyllura pastrojnë burimet dhe kontekstin WebGL.
- Katër profile zanore shqip, me udhëzimet e reja, prodhohen në ndërtim me eSpeak NG lokal. Janë zëra sintetikë të ruajtur si WAV, jo regjistrime njerëzore. Gjashtë thirrjet e kafshëve janë tinguj të stilizuar të krijuar lokalisht, jo regjistrime të kafshëve reale. Nuk përdoret sintezë e shfletuesit ose shërbim i jashtëm gjatë lojës.
- Albumi, lulet, vendosja, rritja, sfidat dhe yjet ruhen për nxënësin në tabelat ekzistuese D1. Snapshot-et e Fazës A plotësohen me fushat e reja pa humbur progresin. Radha lokale është e ndarë sipas profilit dhe sinkronizohet pas rikthimit të internetit.
- Paneli i mësuesit tregon temën aktuale, yjet, sfidat nga 36 gjithsej dhe kohën. Inventari, blerjet/dekorimet dhe gatimi mbeten për Fazën C.

## Si ta provosh

1. Hape `http://127.0.0.1:8787/robot-world` për provë pa ruajtje, ose `/student/robot-world` pas hyrjes si nxënës në mjedisin lokal për ruajtje. Progresi i nxënësit i prodhimit nuk shfaqet në bazën e veçuar lokale.
2. Përfundo 12 sfidat e Fabrikës. Harta hap Pyllin. Shigjetat lëvizin robotin; «▶ Ec» luan programin. Mund të rilosh sfidat e përfunduara.
3. Në liqen vendos «🪵 →» dhe përdor «🔁» për të përsëritur grupin. Një shigjetë tjetër e çon robotin te miku në bregun tjetër. Provo kalimin pa urë për të parë ndalesën pozitive.
4. Hape Albumin dhe prek kafshët. Aktivizo zërin nga çelësi «🔊» për udhëzimet dhe thirrjet e kafshëve.
5. Pas 12 shpëtimeve hapet Kopshti. Programo «→ ↘ 💧». Për rreshtin përdor përsëritjen e grupit; për modelin mbill lulet sipas figurave dhe numrave.
6. Në kopshtin e ruajtur prek lulen dhe një qelizë të lirë. Rifresko faqen, kthehu nga harta dhe kontrollo që vendosja mbetet e rritja shtohet. Kjo vlen për nxënësin e loguar; prova si vizitor rivendoset pas rifreskimit.
7. Provo 2D/3D, animacionet e pakësuara, shpejtësinë dhe një ekran telefoni ose tableti. Ndërprit internetin, përfundo një sfidë dhe riktheje: radha duhet të sinkronizohet pa yje të dyfishtë.

## Kontrollet teknike

- `npm test` përfshin provat e Fazës A dhe B, plus testet ekzistuese të aplikacionit.
- `npm run typecheck`, `npm run lint` dhe `npm run build`.
- `scripts/check-robot-world-phase-b-browser.mjs`: 24 sfidat e Fazës B, zëri real i skedarëve në Chrome, albumi, kopshti, 2D/3D, telefona/tableta, rilidhja dhe kushti i klasës 4.
- `scripts/check-robot-world-browser.mjs`: regresioni i Fabrikës dhe radha lokale.
- `scripts/check-robot-world-runtime.mjs`: Worker real me D1 **lokale të veçuar**, 36 sfida, ruajtja, izolimi, idempotenca, origjina dhe autorizimi. Ritmi i testit respekton kufirin e kërkesave të hyrjes.
- `scripts/reset-robot-world-local-qa.mjs` rivendos vetëm dy profile sintetike të provës në `.wrangler/robot-world-local-state`; kërkon Wrangler të ndalur. Tokenët ruhen vetëm në skedarin e injoruar `.wrangler/robot-world-runtime-fixture.json`.

Prova në një Chromebook fizik dhe përdorshmëria me fëmijë nuk zëvendësohen nga kontrollet automatike; këto mbeten pjesë e vlerësimit përfundimtar.
