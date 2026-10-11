# Siguria dhe të dhënat — Hapi 1

Objektivi: klasa 1–4, nxënës me pajisje personale. Burimi mbetet Next/Vinext dhe audienca Sites mbetet private.

## Autorizimi

`lib/school-access.ts` zbaton politikën e çdo rruge API. TEACHER/ADMIN lexojnë dhe ndryshojnë vetëm workspace-in e identitetit të tyre. ADMIN nuk ka qasje automatike te hapësirat e mësuesve të tjerë. STUDENT identifikohet me token 256-bit të ftesës, të ruajtur si SHA-256; scope është vetëm owner/profile i asaj ftese. Llogaritë STUDENT pa lidhje profili refuzohen. Revokimi, skadimi, mungesa e profilit ose çaktivizimi i mësuesit refuzojnë token-in.

Tabela accounts ruan rolin dhe enabled. Llogaritë e reja nuk marrin rol mësuesi nga klienti. Pronari ekzistues bootstrap-ohet vetëm kur email-i i verifikuar nga Sites përputhet me BOOTSTRAP_ADMIN_EMAIL, variabël private e runtime-it. Identifikuesi Sites ndryshon nga account_user_id i panelit, prandaj ruhet userId i kërkesës së autentikuar. Pronari i një workspace-i ekzistues para përmirësimit merr TEACHER vetëm nëse nuk ka ende rekord roli. Një rekord i çaktivizuar nuk riprovisionohet. Rol tjetër admin/mësues kërkon administrim të autorizuar të DB; nuk ekziston endpoint publik për ngritje privilegjesh.

## Ushtrimet dhe integriteti

GET /api/student kthen vetëm profilin, metadata e bibliotekës dhe rezultatet e atij profili. POST /api/adventures zgjedh ushtrimet në server dhe ruan snapshot-in privat, të lidhur me principal-in; përgjigjja publike përmban id/category/title/visual/options/memory, pa answer, explain ose hint. GET ndihma lejohet vetëm për pyetjen aktuale. PATCH pranon vetëm id/index/value dhe kthen correct dhe explain pas dorëzimit.

INSERT atomik mbron rendin, skadencën dhe një përgjigje për pyetje. Riprovimi i së njëjtës zgjedhje është idempotent; ndryshimi i zgjedhjes refuzohet. Finish kërkon përgjigjet e të gjitha pyetjeve dhe e rindërton rezultatin nga DB; cat/question/correct/verified/date nga klienti nuk përdoren si autoritet. Vetëm shënimet opsionale pranohen. D1 batch ruan një sesion dhe completion atomikisht. Snapshot-i ruan vlerësimin edhe nëse mësuesi redakton bibliotekën më pas.

Gjeneratori lib/puzzles.mjs nuk importohet nga klienti. Kategoritë pa zgjidhje janë në lib/categories.mjs. Mësuesi, si autor i ushtrimeve custom, mund të lexojë/redaktojë përgjigjet vetëm përmes API të autorizuar të workspace-it. Kjo është përjashtim i domosdoshëm për editorin; nxënësi dhe payload-i i aventurës nuk i marrin zgjidhjet paraprakisht.

Rezultatet historike ruhen si praktikë e paverifikuar. Fletorja dhe CSV i dallojnë nga rezultatet verified të reja. Cache pending i vjetër ruhet veçmas për eksport; nuk shndërrohet në rezultat të verifikuar. Aventurat e reja pending riprovohen, por kërkojnë token ende aktiv dhe aventurë të paskaduar.

## Validimi, kufizimet dhe privatësia

Zod strict për të gjitha input-et JSON/query të API, klasat 1–4, kufijtë, identifikuesit, opsionet unike dhe revision. Leximi i body ndalet pas 500 KB, edhe pa Content-Length. Mutacionet kërkojnë Origin të saktë.

Counter atomik në D1: auth-source 900/min, identitet llogarie 180/min, token 60/min, dështime hyrjeje 40/min, krijim ftese 10/min, fillim aventure 12/min, përgjigje 90/min, ndihma 60/min. Counter-at ruhen me hash dhe pastrohen në kërkesa. Pa CF-Connecting-IP përdoret kufi i përbashkët i faqes private; ky është fallback konservativ, jo pretendim për identifikim të pajisjes. 429 jep Retry-After:60. Sign-in/callback OAuth menaxhohen nga dispatch Sites jashtë Worker-it; aplikacioni kufizon autentikimin e API/token dhe nuk krijon login/callback alternativ.

Ftesat skadojnë pas 7 ditësh, aventurat e papërfunduara pas 24 orësh. DELETE /api/workspace kërkon rol mësues/admin, profile/revision dhe konfirmimin literal FSHI; fshin profilin, ftesat, sesionet, aventurat dhe përgjigjet me cascade. UI kërkon konfirmim të fshirjes përfundimtare. Ruajtja e rezultateve zgjat deri në fshirje nga mësuesi; nuk pretendohet pastrim automatik vjetor. Kopjet në pajisje nuk fshihen nga larg.

Pa fonte të jashtme (fontet e pajisjes), gjurmues ose analitikë në mësim. CSP lejon vetëm burime/connect/font të origjinës; unsafe-inline është i nevojshëm për bootstrap-in e Vinext dhe stilet React. Në development lejohen websocket për HMR. Referrer-Policy:no-referrer. Privatësia është në /privacy në shqip.

## Databaza dhe migrimet

Migrimet 0000 mbetet i pandryshuar. 0001 shton accounts, puzzle_catalog, adventures, attempt_answers (FK cascade), rate_limits; 0002 shton indekse owner/profile për sessions/invitations. Tabelat bazë JSON ruhen për përputhshmëri; klasa/detyra me afate, shkolla dhe memberships të përbashkëta ndërtohen në Hapin 2, kur shtohet modeli i bashkëpunimit.

`node scripts/migrate-local.mjs --local` mban ledger lokal dhe është idempotent. Për DB të migruar manualisht adopton vetëm CREATE TABLE/INDEX me SQL që përputhet me historikun; skemat e pjesshme/të ndryshme bllokohen për inspektim. Nuk punon remote. Sites zbaton migrimet hosted para Worker-it.

`node scripts/seed.mjs --local` shton 384 variante origjinale, me id stabil dhe INSERT OR IGNORE. Opsionet --test-teacher/--test-student/--test-admin vlejnë vetëm për identitetin local_seedy. --reset-test-limits pastron vetëm DB lokale. Në prodhim seedCatalog mbush katalogun idempotent në aventurën e parë të autorizuar; seed/backfill nuk futet në migrime skeme. 384 variante nuk përbëjnë 384 probleme pedagogjikisht të ndryshme.

## Verifikimi

check-security: matrica e të tri roleve, deny-by-default, Zod strict, 384 ids, projection pa zgjidhje dhe vlerësimi. check-api në DB lokale: rol student/teacher/admin, refuzim header spoof lokal, izolim profilesh, payload pa zgjidhje, CSRF, CAS, rend pyetjesh, dorëzime të njëkohshme/idempotente, falsifikim correct i refuzuar nga rezultati real, revokim, fshirje profili/cascade dhe rate limiting. Testi rikthen bibliotekën/profilet dhe rolin lokal pas provës.

QA lokale në shfletues: mësuesi përfundoi matematikë 4/5 me reflektim; nxënës prove përfundoi logjikë 5/5 përmes lidhjes personale dhe mësuesi pa progresin pas rifreskimit. Pa gabime console në rrjedhë. Nuk u përdorën të dhëna reale të nxënësve dhe asnjë e dhënë prove nuk dërgohet në prodhim.

Mbushja e parë e katalogut përdor 20 INSERT-e me deri 80 parametra secili (21 queries me COUNT), brenda kufijve D1 edhe në planin Free. Burimi: https://developers.cloudflare.com/d1/platform/limits/. Testi SQLite në memorie verifikon SQL reale, 384 rreshta, kufirin e parametrave/query dhe idempotencën pa prekur të dhënat e përdoruesit.

## Hapi 2

Leje të reja: product:read/document:read për rolet e autorizuara, class:write vetëm teacher/admin, class:join vetëm student. Të gjitha query-t e klasave/detyrave përfshijnë owner; studenti gjithashtu profile nga token. Membership nuk merret nga klienti. Kodi me 8 shifra hex është identifikues klase, jo kredencial; bashkimi kërkon lidhje aktive, owner dhe grade që përputhen.

Seti i detyrës dhe metadata level/assignment/started ruhen në aventurë. Finish llogarit stars dhe kohën në server. Certificate kontrollon ≥2 yje për tre nivele vetëm nga DB verified. Studentët nuk eksportojnë raporte/fletë pune të mësuesit. CSV i raporteve kufizon formula injection; PDF-të nuk dërgojnë përmbajtje te shërbime të jashtme.

Seed i ri ka 448 rekorde: 64 detyra të veçanta + 384 variante. 23 multi-row INSERT me deri 80 binds, 24 queries përfshirë COUNT; upsert prek vetëm payload-in e katalogut të sistemit. Snapshot-et e lëshuara nuk ndryshojnë. Migrimi 0003 append-only; profile DELETE pastron edhe class_students.

Game levels: POST /api/adventures accepts strict gameLevel 1–20 only with a selected play scene and without course-level/assignment metadata. Grade/profile scope is checked server-side. GET /api/games enforces product:read and grade/profile ownership; all-history aggregation uses bound values. Completion metadata is derived from issued server snapshots, never client claims. Placement equivalence uses known token attributes after the token/length/uniqueness schema checks. Existing issued snapshots remain unchanged. No third-party Code.org embeds or requests were added.

Teacher library: /api/teacher-preview requires class:write, strict selection and server-side answer validation. It reads catalog snapshots and generates deterministic curriculum levels without creating learning records. Cross-grade assignments require explicit allowGradeMismatch; migration 0009 stores source_grade. Student authorization and adventure grade stay scoped to the actual enrolled class; only content generation uses the teacher-approved source grade.

Independent Cloudflare deployment: the standalone Worker strips all incoming
oai-authenticated-user-* headers and compile-time disables the Sites identity
fallback. Sites gateway trust must never be transferred to a public endpoint.
Standalone builds omit mock authentication and connector preview. Deployment
starts with a new empty D1 database and does not import school data. Supabase
runtime configuration and email delivery need account-side verification before
rollout; current teacher cookies expire after at most one hour.
