# Shtëpia e zgjeruar dhe kuzhina e robotit

Adresa lokale: http://127.0.0.1:8787/robot-world

## Shtëpia

Pamja e jashtme është zgjeruar dhe pengesa e navigimit përputhet me përmasat e reja. Kur roboti hyn nga dera hapet pamja e brendshme. Nga skedat sipër mund të kalosh midis:

- Dhomës së ndenjes: divan, kolltuk, jastëkë, tavolinë, qilim, televizor, komodë, libra dhe bimë.
- Dhomës së gjumit: krevat, jastëkë, batanije, komodina e abazhurë, dollap, tavolinë, pasqyrë, qilim dhe bimë.
- Kuzhinës: frigorifer, dollapë, raft, gota, lavaman, rubinet, furrë, sobë, aspirator, vegla, banak dhe tenxhere.

Kamera rrotullohet horizontalisht 360° me tërheqje ose butonat me shigjeta rrethore. +/− afron/largon pamjen. Në kuzhinë hyrja e vendos kamerën ballore, me robotin përballë përdoruesit, pas banakut. Për ta kthyer në pamjen ballore pas rrotullimit, zgjidh përsëri skedën Kuzhina.

## Loja e kuzhinës

Videoja e dërguar u përdor si referencë mekanike për renditjen e përbërësve në enë. Modelet dhe ndërfaqja janë të këtij aplikacioni; nuk kopjohen skedarë të lojës së videos.

1. Hyr në shtëpi dhe zgjidh Kuzhina.
2. Prek një enë me përbërës, pastaj një enë bosh ose me të njëjtin përbërës sipër.
3. Zhvendoset grupi i sipërm që mund të futet, pa kaluar kapacitetin. Zgjedhja e gabuar nuk heq yje.
4. Kthe hapin lejon korrigjimin e lëvizjeve. Te Cilësimet mund të rifillosh recetën.
5. Kur secila enë e përdorur ka vetëm një lloj përbërësi dhe është e plotë, aktivizohet Gatuaj supën.
6. Roboti gatuan, tenxherja nxjerr avull dhe supa serviret në tas.
7. Receta tjetër hap recetën pasuese. Ka tri receta me vështirësi në rritje; secila jep 3 yje vetëm një herë gjatë seancës.
8. Dil në oborr të kthen te bota e jashtme. Ndërrimi i dhomës nuk e rinis recetën.

## Kufijtë e prototipit

Shtëpia dhe loja e re janë pjesë e skenës vizuale lokale. Ruajtja e aventurës ekzistuese në D1 nuk ndryshon. Përparimi i këtyre recetave mbahet gjatë seancës së hapur; rifreskimi i faqes e rinis. Nuk është publikuar.

Three.js, modelet, ngjyrat, teksturat dhe tingujt përdoren lokalisht; loja nuk kërkon burime të jashtme.

## Verifikimi

- npm run typecheck
- npx eslint lib/robot-house-scene.ts lib/robot-kitchen-game.ts lib/robot-courtyard-scene.ts components/robot-courtyard.tsx
- node scripts/check-robot-courtyard-path.mjs
- node scripts/check-robot-kitchen.mjs
- npm run build
- node scripts/check-robot-house-browser.mjs (kërkon serverin lokal në 8787)

Prova e rregullave gjen zgjidhje për të tria recetat dhe verifikon kapacitetin, ruajtjen e përbërësve dhe kthimin e hapave. Prova në Chrome luan të tria recetat përmes enëve të vërteta të skenës, kontrollon dhomat, rrotullimin, madhësitë e telefonit, ruajtjen gjatë ndërrimit të dhomave dhe daljen.
