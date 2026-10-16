# Nisja për bashkëpunëtorin

Repository përmban kodin, figurat, Three.js përmes npm, audion lokale, migrimet D1 dhe testet. Node.js 22.13 ose më i ri dhe Git duhen instaluar paraprakisht.

```sh
git clone https://github.com/HMandija/mendje-te-zgjuara.git
cd mendje-te-zgjuara
npm ci
```

Kopjo `.dev.vars.example` në `.dev.vars` me editorin e skedarëve. Pastaj:

```sh
npm run collaborator:setup
npm run collaborator:start
```

Hap http://127.0.0.1:8787 dhe `/robot-world`. Setup ndërton variantin e pavarur Cloudflare, krijon databazën lokale dhe mbush katalogun. Nuk prek D1 në internet. Përsërite setup pas ndryshimeve të kodit ose migrimeve, duke ndalur serverin fillimisht. Të dhënat lokale mbeten në `.wrangler/state`; mos e fshi për të ruajtur progresin lokal.

## Hyrja dhe konfigurimi privat

Me vlera bosh funksionon shfletimi publik; misionet kërkojnë hyrje të vlefshme. Për funksionimin e hyrjes, pronari ndan konfigurimin privatisht ose jep akses te projekti përkatës Supabase. Vendos URL dhe publishable key të të njëjtit projekt në `.dev.vars`. Për administrimin vendos edhe `ADMIN_EMAIL` dhe `SUPABASE_SECRET_KEY` (vetëm në server). Lejo redirect-in lokal `/teacher/login` në Supabase Auth. Mos përdor sesione, emra apo databaza reale nxënësish si fixture testimi.

Sekretet aktive nuk ruhen në Git, edhe kur repository është privat. Ato ekzistuese të prodhimit mbeten në Cloudflare dhe GitHub Actions. Klonimi nuk shkarkon secrets të Actions. Përdor një kanal privat për konfigurimin lokal; mos i fut në issue, commit apo skedar publik. Nuk kërkohet token Cloudflare për setup-in lokal.

## Ndryshimet dhe publikimi

```sh
git switch -c ndryshimi-im
npm run typecheck
npm test
git add .
git commit -m "Përshkrimi i ndryshimit"
git push -u origin ndryshimi-im
```

Hap pull request drejt `main`. Push/merge në `main` nis workflow ekzistues të publikimit automatik: kontrollon kodin, aplikon migrimet dhe publikon Worker kur variablat/secrets ekzistojnë. Mos ndrysho ID-në e D1 ose sekretet e prodhimit për testim. Pronari duhet të japë rol Write në repository për push; akseset Cloudflare/Supabase janë veçmas. Shih [konfigurimin Cloudflare](CLOUDFLARE-DEPLOY.md) për emrat e variablave të Actions.

## Gjendja aktuale dhe kufijtë

- Loja 3D është në `/robot-world`; vizitorët shëtisin pa misione. Nxënësit dhe mësuesit verifikohen nga `/api/session`.
- Pamja e re 3D e oborrit, shtëpisë, kuzhinës, pyllit dhe liqenit mban shpërblimet gjatë vizitës. Lidhja e këtij progresi me D1 ende duhet përfunduar. Rifreskimi i faqes e rivendos progresin e këtij prototipi.
- Varianti i mëparshëm në `/robot-world/adventure` ka temat A–F dhe ruajtjen D1. Mos ngatërro ruajtjen e tij me prototipin 3D.
- Testet e shfletuesit në `scripts/check-robot-*` mund të kërkojnë Chrome dhe fixture lokale QA; fixture dhe sesionet nuk shpërndahen. `npm test` dhe `typecheck` janë kontrollet pa këto fixture.
- Regjistrimet aktuale të robotit janë skedarë lokalë të gjeneruar. Dokumentet `ROBOT-*` përshkruajnë fazat dhe kufijtë e secilës.

Pas clone-it provo faqen publike, hyrjen e mësuesit, krijimin e një klase provë, hyrjen e nxënësit dhe lojën. Autentikimi real kërkon konfigurimin privat të mësipërm; kod i klonuar nuk jep automatikisht akses te llogaritë cloud.
