# Plani i laboratorit të kodimit për klasën e pestë

Ky plan e përcakton laboratorin si mjedis Scratch 3 për nxënësit e klasës së pestë. Klasat 1–4 mbeten të ndara dhe përmbajtja e tyre nuk ndryshohet nga kjo punë. Programi përfundimtar do të ketë 60 misione në shqip, të organizuara në 10 grupe me nga 6 misione, me objektiva dhe kritere të kuptueshme. Dokumenti i mëparshëm propozonte 50 misione; vendimi i fundit është të vazhdojmë me 60.

## Gjendja në kod sot

- Scratch 3 është i paketuar lokalisht në `coding-editor`; editori nuk mbështetet te ngarkimi i ndërfaqes nga një faqe e jashtme.
- Ekziston një editor me blloqe, udhëzime të lokalizuara, lexues/skedarë projekti `.sb3` dhe ruajtje private në hapësirën e nxënësit kur misioni është lejuar nga mësuesi.
- Mësuesi mund të lejojë misione për një klasë të pestë dhe të shohë projektet që nxënësit kanë ruajtur.
- Vizitori mund të provojë misionin e parë pa ruajtje. Nxënësi i kyçur sheh vetëm misionet që i janë lejuar.
- Hyrja te mësimet e klasës së pestë është e dukshme në panelin publik, panelin e nxënësit me login dhe navigimin e mësuesit. Hyrja e mësuesit shfaqet kur është zgjedhur klasa 5; për klasat 1–4 etiketa dhe rrjedha ekzistuese mbeten të pandryshuara.
- Janë përgatitur 10 grupe me nga 6 misione, pra 60 gjithsej. Ky është numri i konfirmuar për programin.
- Struktura e 60 misioneve riorganizohet si 50 tema bazë të planit tënd, të ndjekura nga 10 misione zgjeruese, nga një shtesë në secilin grup.
- Titujt, objektivat, hapat dhe kriteret e 50 misioneve bazë u krahasuan me planin. U korrigjuan mospërputhjet e shembujve të robotit dhe fluturës, sfondit shtëpi–pyll, tingujve në grup, prekjes së personazhit, lumit, krahasimit të lartësive, madhësisë dhe listave.
- Misionet zgjeruese janë: topi që kërcen në skaj, stripi me tri pamje, stafeta e mesazheve, spiralja që zgjerohet, numri çift apo tek, afër apo larg, mesatarja e tri matjeve, melodia me katër nota, katrorët me madhësi të ndryshme dhe loja e raketës me topin.
- Përfundimi i misionit nuk duhet paraqitur si notë automatike: ruajtja e projektit është e verifikueshme teknikisht, ndërsa cilësia e zgjidhjes dhe shpjegimi i nxënësit kërkojnë kritere të qarta dhe shqyrtim nga mësuesi.

## Hapat që duhen përfunduar

### 1. Harmonizimi i programit mësimor

- [x] Vendosim programin përfundimtar prej 60 misionesh, me 10 grupe nga 6 misione.
- [x] Vendosim strukturën: pesë misionet e para të çdo grupi ndjekin temat bazë të planit; misioni i gjashtë është zgjerim praktik i grupit.
- [x] Përshtatim titujt dhe objektivat e 50 misioneve bazë sipas programit.
- [x] Kontrollojmë përputhjen e hapave dhe kritereve me 50 temat bazë dhe korrigjojmë mospërputhjet e dalluara.
- [x] Emërtojmë 10 misionet zgjeruese, nga një shtesë në secilin grup.
- [x] Përputhim titujt dhe renditjen me 10 nivelet e planit: hapat e parë, animacionet dhe historitë, ngjarjet, përsëritja, kushtet, ndërveprimi, variablat, dizajni, projektet e avancuara dhe sfida përmbyllëse.
- [x] Për çdo mision shqyrtojmë udh निर्देशimet në shqip, objektivin, projektin praktik dhe kriteret e dorëzimit; korrigjojmë emrat që nuk përputhen me bibliotekën e lokalizuar të Scratch dhe udhëzimet e paqarta.
- [x] Dallojmë provat teknike nga vlerësimi: `.sb3` mund të tregojë strukturën e projektit (personazhe, sfond, blloqe, ndryshore/lista), por nuk provon vetvetiu se projekti funksionon sipas objektivit ose se nxënësi e shpjegon. Këto dy kritere mbeten për shqyrtim nga mësuesi.

### 2. Rrjedha e nxënësit dhe ruajtja

- [x] Provojmë me sesion nxënësi se hapen vetëm misionet e caktuara, projekti ruhet/ringarkohet në D1/R2 lokale dhe qasja hiqet pas revokimit.
- [x] Provojmë hyrjen e nxënësit përmes kodit të klasës në ndërfaqe: vendosjen e kodit, zgjedhjen e profilit dhe figurës, pastaj hapjen e misionit të kodimit në klasën e pestë.
- [x] Kontrollojmë shkarkimin dhe hapjen e projektit `.sb3` në Scratch 3, përfshirë skedarë të dëmtuar, të mëdhenj ose të papritur. Prova e ndërfaqes kaloi për shkarkim/ringarkim, arkiv të dëmtuar, madhësi mbi 10 MB dhe projekt me zgjerim të jashtëm; kontrollet për arkiva të tejzgjeruara kaluan në testet e parser-it.
- [x] Sqarojmë se vizitori provon vetëm misionin e parë publik, nuk ruan në server dhe mund të shkarkojë `.sb3`; nxënësi hyn me kod klase, hap vetëm misionet që cakton mësuesi dhe ruan privatisht. Udhëzimi shpjegon edhe si importohet shkarkimi i vizitorit me «Hap projekt» e pastaj «Ruaj projektin».
- [x] Shpjegojmë pasojat për projektet: heqja e misionit fsheh hyrjen e nxënësit, por ruajtja mbetet te Progresi i mësuesit dhe rikthehet kur misioni caktohet sërish. Heqja e nxënësit nga klasa revokon hyrjen; projektet fshihen nëse ky është anëtarësimi i tij i fundit në klasë të pestë te i njëjti mësues, por ruhen kur ka anëtarësim tjetër të tillë. Paralajmërimet e konfirmimit e bëjnë të qartë fshirjen.

### 3. Rrjedha e mësuesit

- [x] Provojmë caktimin dhe heqjen e misioneve për një klasë të pestë. Prova Chrome me API të simuluara verifikoi caktimin/heqjen/rikthimin, fshehjen/rishfaqjen te nxënësi dhe projektin e ruajtur te Progresi. Kodi i serverit konfirmon se heqja fshin caktimin, jo projektin.
- [x] Sigurohemi që pamja e progresit dallon projektin e ruajtur nga misioni i përfunduar ose i vlerësuar. Paneli thotë se shfaq vetëm projektet e ruajtura dhe se përfundimi/vlerësimi nuk regjistrohen automatikisht; mësuesi hap projektin për shqyrtim. Nxënësi sheh të njëjtin dallim te misioni i ruajtur.
- [ ] Përgatisim udhëzime të shkurtra për hapjen, shkarkimin dhe shqyrtimin e projektit të nxënësit. (Nuk përgatitet material mësuesi pa kërkesë të veçantë.)

### 4. Prova me nxënës dhe pajisje

- [ ] Provojmë në Chrome/Chromebook, tablet dhe telefon; kontrollojmë tastierën, madhësinë e blloqeve, gjuhën dhe daljen nga editori.
- [ ] Bëjmë një provë të drejtuar me nxënës të klasës së pestë dhe regjistrojmë ku kanë nevojë për ndihmë.
- [ ] Simulojmë 50 nxënës, përfshirë hyrje nga e njëjta adresë IP, ruajtje njëkohësisht dhe rifreskim të sesionit.
- [ ] Kontrollojmë qasjen në klasat e tjera, privatësinë e projekteve dhe kufijtë e kërkesave.

### 5. Përgatitja për publikim

- [ ] Përfundojmë verifikimet automatike për editorin, API-të, autorizimin, ruajtjen dhe ndërtimin Cloudflare.
- [ ] Konfirmojmë se databaza dhe ruajtja e skedarëve në prodhim janë konfiguruar, migrimet janë të renditura dhe backup-i është i përshtatshëm.
- [ ] Publikojmë vetëm pas provës së përdorimit dhe pranimit të rrjedhës së plotë.

## Pika e radhës

U sqarua rruga vizitor → hyrje me kod klase → mision i caktuar → import i `.sb3` → ruajtje private. Paneli i progresit dallon projektin e ruajtur nga përfundimi ose vlerësimi; provat Chrome për mësuesin dhe dukshmërinë te nxënësi kaluan me API të simuluara. Ruajtja private lokale, revokimi, rikthimi i projektit dhe ngarkimi i `.sb3` u verifikuan në editorin Scratch lokal. Numri është 60: 50 tema bazë dhe 10 zgjerime, në 10 grupe me nga 6. Titujt e grupeve dhe të 50 temave ndjekin dokumentin; u shqyrtuan udhëzimet e 60 misioneve dhe u korrigjuan emrat e personazheve/sfondeve që nuk përputheshin me bibliotekën shqip. Skedari `.sb3` ofron prova strukturore; funksionimi dhe shpjegimi vlerësohen nga mësuesi. Mbeten prova me pajisje fizike dhe nxënës, simulimi i 50 nxënësve, kontrollet automatike të plota dhe verifikimet e mjedisit të publikimit. Material udhëzues për mësuesin nuk përgatitet në këtë fazë, sipas kërkesës së përdoruesit. Klasat 1–4 nuk janë pjesë e këtij ndryshimi.
