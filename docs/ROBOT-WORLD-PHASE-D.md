# Bota e Robotit — Faza D

Shkolla hapet pasi përfundojnë 48 sfidat e Fabrikës, Kafshëve, Kopshtit dhe Kuzhinës. Faza D mbetet lokale; publikimi shtyhet deri te produkti i plotë dhe prova e përdoruesit. Nuk shton tabelë D1 ose shërbim të jashtëm.

## Përmbajtja

- Katër nën-nivele me tri mini-sfida secili: Dita e parë, Kuizi i robotit, Ndreq robotin dhe Nëse… atëherë. Gjithsej loja ka 60 sfida deri në fund të kësaj faze.
- **Dita e parë:** mësuesi robot prezanton përsëritjen. Një shigjetë me numër përsëritjeje e çon robotin në shkollë. Klasat 1–2 kanë 3–5 hapa; klasat 3–4 kanë 5–7 hapa. Programi duhet të përdorë vërtet përsëritjen, jo vetëm shigjeta të kopjuara.
- **Kuizi:** numërimi i hapave, parashikimi i vendit të përfundimit dhe zgjedhja e veprimit kur ura mungon. Figurave dhe pikave në hartë u shtohen numra; përgjigjja nuk kërkon dallimin vetëm të ngjyrave.
- **Roboti i prishur:** programi i gabuar zbatohet në skenë. Fëmija zgjedh një komandë dhe e zëvendëson me një shigjetë. Serveri kërkon një ndryshim dhe një rrugë që arrin qëllimin. Shtimi i një etikete «i ndrequr» pa ndrequr programin nuk jep progres.
- **Kushtet:** një program testohet në dy botë. Kur ura djathtas është e lirë, ndjek degën e parë; kur është e prishur, ndjek rrugën tjetër. Të dyja duhet të arrijnë të njëjtin qëllim. Fëmija ndërton degët me figura/shigjeta dhe shton pjesën e përbashkët të rrugës. Klasat më të larta kanë më shumë hapa dhe përfitojnë nga përsëritja.
- Inteligjenca e robotit është 1–5: përfundimi i Ditës së parë jep nivelin 2 dhe antenën e re; tri kuizet e rrisin në 3, 4 dhe 5. Ajo llogaritet nga progresi i verifikuar. Ndryshimi i robotit nuk mund ta falsifikojë ose ta ulë nivelin.
- Përfundimi i Shkollës ruan diplomimin dhe datën. Roboti fiton kapelën e diplomimit; ajo shfaqet kur nuk ka veshur kapelë nga inventari. Diploma përdor pseudonimin e robotit, shfaq katër konceptet e mësuara dhe printohet në një faqe A4. Nuk printon emrin e vërtetë të nxënësit.
- Ndihma, përgjigjet e gabuara dhe rilojtja ruajnë rregullin e yjeve: asnjë humbje për gabime, asnjë bonus i dyfishtë. Inteligjenca, antena dhe diplomimi nuk humbasin pas një prove të gabuar.
- Skenat Three.js, alternativa 2D dhe udhëzimet shqip janë lokale. Skedarët zanorë prodhohen në ndërtim me katër profile sintetikë eSpeak NG; nuk përdoret sintezë e shfletuesit ose API e jashtme.
- Progresi ruhet në të njëjtin Worker/D1, me radhë lokale pa internet. Paneli i mësuesit shfaq temën, yjet, sfidat nga 60, inteligjencën dhe diplomimin. Faqja e privatësisë përfshin këto të dhëna.

## Si ta provosh

1. Rifresko `http://127.0.0.1:8787/robot-world`. Si vizitor loja është provë pa ruajtje pas rifreskimit. Si nxënës në mjedisin lokal përdor `/student/robot-world` për ruajtje në D1 lokale.
2. Pas Kuzhinës hap Shkollën nga harta ose Tema 5. Vendos shigjetën djathtas, zgjidh numrin e përsëritjeve dhe prek «🔁», pastaj «▶ Ec».
3. Provo kuizet. Kontrollo që përgjigjja e gabuar nuk heq yje dhe inteligjenca rritet vetëm pas përfundimit të sfidave përkatëse.
4. Te Ndreq robotin, shtyp «👀 Shiko robotin e prishur». Prek komandën që duhet ndryshuar dhe një shigjetë nga paleta. Shtyp «Provo ndreqjen».
5. Te kushtet vendos «→ ↓» për urën e lirë dhe «↓ →» për urën e prishur, pastaj hapat e përbashkët djathtas. Shtyp «Provo të dyja rrugët». Provo edhe një degë të gabuar për të parë që sfida kërkon zgjidhjen e të dyja rasteve.
6. Në fund hape Diplomën dhe «Printo diplomën». Kontrollo pseudonimin dhe datën; ruaj PDF nga dialogu i shfletuesit nëse dëshiron. Rifresko si nxënës: diplomimi duhet të mbetet.
7. Provo 2D/3D, telefon/tablet, animacionet e pakësuara dhe përfundimin pa internet me sinkronizim më pas.

## Kontrollet

- `npm test`, `npm run typecheck`, `npm run lint`, `npm run build`.
- `check-robot-world-phase-d.mjs`: 12 sfidat në katër klasa, përsëritja, kuizet, ndreqja e një komande, të dyja degët e kushtit, inteligjenca, antena, diplomimi dhe mbrojtja nga falsifikimi i nivelit.
- `check-robot-world.mjs`: rruga reale API mbi SQLite, deri në 60 sfida, kërkesa të dyfishta dhe ruajtja e diplomimit.
- `scripts/check-robot-world-phase-d-browser.mjs`: 12 sfidat në Chrome, zëri, modeli 3D/2D, telefon/tablet, rihyrja, radha pa internet dhe diploma si PDF me një faqe. PDF/screenshot-et e kontrollit mbeten në `.wrangler/robot-world-qa`, pa publikim.
- `scripts/check-robot-world-phase-d-runtime.mjs`: Worker real dhe D1 lokale të veçuar, me dy nxënës sintetikë. Përgatiten me `scripts/reset-robot-world-local-qa.mjs --phase-d`, vetëm me Wrangler të ndalur. Tokenët e provës mbeten në `.wrangler`, të injoruar nga Git.

Testimi me fëmijë dhe në një Chromebook fizik mbetet pjesë e vlerësimit përfundimtar. Faza E shton Vallëzimin dhe Garën e Robotëve.
