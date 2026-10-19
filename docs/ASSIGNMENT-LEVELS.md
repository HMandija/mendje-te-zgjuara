# Nivelet e aktivizuara nga mësuesi

Në localhost, te **Mësimet dhe detyrat**, zgjedhja **Nivelet e mësimit** hap një listë me checkbox. Shëno nivelet që lejon, ose përdor **10 të parat**, dhe cakto detyrën. I njëjti kontroll është edhe në dialogun e caktimit nga Biblioteka e mësimeve.

Poshtë detyrës ekzistuese hap listën e niveleve, ndrysho shënimet dhe shtyp **Ruaj nivelet**. Ndryshimi ruan të njëjtën detyrë dhe historikun e saj. Heqja e të gjitha shënimeve pezullon nivelet pa fshirë rezultatet.

Nxënësi sheh nivelet aktive dhe nivelet e tjera me kyç. Çdo nivel aktiv mund të hapet drejtpërdrejt. Butoni **Fillo** zgjedh nivelin e parë aktiv ende të papërfunduar. Detyra shënohet e përfunduar vetëm kur plotësohen të gjitha nivelet aktive. Yjet ruhen për secilin nivel. Kur mësuesi aktivizon nivele të tjera, detyra mund të vazhdohet.

## Ruajtja dhe kontrolli i aksesit

- Migrimi `0018_assignment_levels.sql` shton `assignments.allowed_levels`, një listë JSON me nivelet e lejuara; `NULL` ruan sjelljen e detyrave ekzistuese me një nivel.
- API-ja e caktimit pranon `allowedLevels`, pa përsëritje, brenda kufijve 1–30 për mësime, 1–20 për lojëra dhe 1–3 për kuize.
- Hapja e detyrës dërgon `assignmentLevel`. Serveri kontrollon detyrën, klasën, nxënësin dhe listën e ruajtur; përmbajtja merret gjithmonë nga detyra e serverit.
- Përgjigjet, ndihmat dhe përfundimi i një aventure në vazhdim kontrollojnë sërish nëse niveli është ende aktiv. Rezultatet e ruajtura nuk fshihen kur niveli çaktivizohet.
- Progresi krahasohet sipas ID-së së detyrës dhe numrit të nivelit, duke shmangur përfundimin e të gjithë mësimit nga një përpjekje e vetme.

## Verifikimi

`npm run test:assignments` ushtron funksionet reale të serverit mbi SQLite me të gjitha migrimet: ruajtjen, klasat paralele, përzgjedhjen 1–10, nivele të veçuara dhe 30, refuzimin e niveleve të mbyllura, çaktivizimin gjatë një aventure, historikun dhe përputhshmërinë me detyrat e vjetra.

`npm run test:assignments:browser` ushtron ndërfaqen e vërtetë të mësuesit dhe nxënësit me autentikim dhe përgjigje API sintetike: checkbox, tastierë, ruajtje/rilexim, caktim nga biblioteka, nivelet e mbyllura dhe pamjet në tablet e telefon. Pamjet ruhen te `.wrangler/assignment-qa/`.

`npm run test:assignments:api` përdor Worker-in dhe D1 real lokal në portin 8787 me `.wrangler/robot-world-local-state`. Krijon vetëm të dhëna sintetike të veçuara dhe i heq pas testit. Kontrollon sesionin e nxënësit, nisjen e niveleve të sakta, ruajtjen e yjeve dhe bllokimin pas çaktivizimit; refuzon URL jashtë localhost.

Ndryshimi përgatitet dhe provohet lokalisht. Migrimi duhet të aplikohet në D1 e synuar përpara publikimit të kodit që përdor kolonën e re. Nuk ka ndryshime te loja e shahut ose te përmbajtja e mësimeve.
