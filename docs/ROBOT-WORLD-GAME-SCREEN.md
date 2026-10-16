# Bota e Robotit: ekran i vetëm

Loja hapet në /robot-world dhe zë hapësirën e shfletuesit. Harta, yjet, sfidat dhe komandat qëndrojnë brenda kornizës. Butoni ⛶ kalon në ekran të plotë kur pajisja e lejon.

- Menyja hap temat, albumin dhe vendet e hapura.
- Ndërto hap panelin me robotin e dukshëm dhe pjesët/ngjyrat sipas fazës.
- Cilësimet mbajnë klasën e provës, zërin, animacionet, shpejtësinë dhe 2D/3D.
- Panelet mbyllen me X/Gati ose Escape. Dialogët përdorin fokusin modal të shfletuesit.
- Lista të gjata dhe panelet në ekrane shumë të vogla lëvizin brenda lojës; dokumenti nuk lëviz.
- Progresi, yjet dhe rregullat D1 nuk ndryshojnë.

Provo: hape lojën, ndrysho pjesët te Ndërto, mbyll panelin, zgjidh sfidën, vazhdo, hape Hartën dhe provo ekranin e plotë. Përsërite në telefon vertikal dhe horizontal.

Kontrollet: npm run typecheck; npx eslint components/robot-world.tsx; npm run build; node scripts/check-robot-world-game-layout.mjs; node scripts/check-robot-world-game-browser.mjs. Dy kontrollet e fundit kërkojnë serverin lokal në 8787. Prova e rrugëtimit përdor profil vizitori dhe përfundon 84 sfidat.

Ky version qëndron lokal; nuk është publikuar.
