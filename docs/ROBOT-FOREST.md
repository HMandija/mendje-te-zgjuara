# Pylli i miqve — prototipi 3D

Hap http://127.0.0.1:8787/robot-world dhe shtyp «Pylli i miqve» nga oborri.

- Tre ambiente progresive: lepurushi në livadh, iriqi me pengesa dhe rosaku me urë mbi përrua.
- Ndërto programin me shigjetat, pastaj shtyp «Provo». Roboti duhet fillimisht të marrë kafshën dhe pastaj ta shoqërojë te strehëza me derën e hapur.
- Trungjet, gurët, uji dhe kufijtë ndalojnë lëvizjen. Gabimi nuk heq yje. «Hiq shigjetën e fundit» korrigjon programin; «Rifillo rrugën» e zbraz.
- Kamera rrotullohet 360° me tërheqje, prekje ose butonat e kamerës. Rrotëza afron pamjen.
- Çdo shpëtim jep 3 yje vetëm një herë gjatë vizitës. Albumi dhe yjet ruhen kur del dhe rihyn në pyll. Rifreskimi i faqes i rinis: ky prototip ende nuk lidhet me progresin D1 të aventurës ekzistuese.
- «Miku tjetër» hap sfidën pasuese. «Oborri» kthen te shtëpia dhe kuzhina, duke ruajtur gjendjen e tyre gjatë vizitës.

Arkitektura: rregulla të pastra në lib/robot-forest-game.ts, skenë Three.js me burime lokale dhe pastrim të burimeve në lib/robot-forest-scene.ts, komandat e lojës në components/robot-forest.tsx. Skena e oborrit ndalon vizatimin kur fshihet; skena e pyllit shkatërrohet kur dilet. Respektohet cilësimi i animacioneve dhe përdoret sistemi ekzistues i tingujve.

Kontrolle:

    node scripts/check-robot-forest.mjs
    node scripts/check-robot-forest-browser.mjs
    npm run typecheck

Asnjë publikim nuk është bërë. Testimi me pajisje reale dhe fëmijë mbetet pjesë e verifikimit final.

Verifikim lokal: tre misionet u luajtën automatikisht në Chrome; u kontrolluan përplasjet, rilojtja pa yje të dyfishtë, kthimi dhe rihyrja, kamera 360°, katër madhësi ekrani dhe mungesa e kërkesave për burime të jashtme. Pamjet u inspektuan vizualisht dhe strehëza u korrigjua që roboti të qëndrojë përpara hyrjes.

Komandat janë relative ndaj robotit: Para/Mbrapa sipas fytyrës, Majtas/Djathtas e kthejnë 90° dhe e lëvizin një hap. Roboti nis nga rruga e parë, dhe rifillimi rikthen të njëjtin kah. Rrotullimi i kamerës nuk ndryshon komandat.
