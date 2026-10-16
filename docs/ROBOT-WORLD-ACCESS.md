# Hyrjet dhe aksesi në Botën e Robotit

- Biblioteka publike /demo e shfaq lojën përpara mësimeve, me «Eksploro lojën».
- Mësuesi ka lidhjen «Argëtohu» në navigim dhe kartën e lojës mbi bibliotekën e mësimeve.
- Nxënësi ka kartën në krye të panelit. /student/robot-world hap pamjen e re 3D.
- /robot-world/adventure mbetet për aventurën ekzistuese; kërkon hyrje. Për nxënësit vazhdon të përdorë progresin ekzistues D1.

RobotGameEntry verifikon sesionin përmes /api/session; nuk i beson një flamuri lokal, rolit në URL ose pranisë së tokenit pa verifikim. Kontrolli përsëritet kur dritarja merr fokus dhe çdo minutë. Një verifikim i dështuar nuk hap misionet. SessionGuard ruan kontrollin e mosaktivitetit edhe në aventurën e plotë.

Vizitori mund të ecë në oborr dhe të shohë shtëpinë. Ujitja, recetat, Pylli dhe Liqeni kërkojnë hyrje. Kontrolli zbatohet edhe te komandat e skenës (klikime në objekt, tastierë), jo vetëm te menutë. Ndryshimi i rolit e rinis skenën që misionet dhe yjet e një sesioni të mëparshëm të mos mbeten aktive. API e progresit ruan autorizimin ekzistues në server dhe refuzon kërkesat anonime.

Ndërfaqja e hyrjes ofron /teacher/login dhe /student. Nuk shtohen çelësa sekretë ose identitete në kodin e klientit. Nuk është bërë publikim.

Verifikimi lokal:

    node scripts/check-robot-game-access.mjs
    npm run typecheck
    node check-browser-security.mjs

Testi përdor një sesion real sintetik nxënësi në D1 lokale të izoluar. Kontrollon token të pavlefshëm, API anonime, eksplorim pa misione, ujitje me tastierë, kuzhinë, hyrje direkte te adventure dhe aksesin e nxënësit. Navigimi i mësuesit provohet me përgjigje të simuluara për sesionin dhe workspace; nuk përdoren kredenciale reale Supabase në test. Progresi i pamjes së re 3D mbetet vetëm gjatë vizitës, si përpara këtij ndryshimi.
