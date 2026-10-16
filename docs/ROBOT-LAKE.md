# Liqeni i urave — prototipi 3D

Nga http://127.0.0.1:8787/robot-world shtyp «Liqeni i urave».

1. Vëzhgo shtyllat e arta mes bregut dhe ishullit.
2. Zgjidh numrin te «Përsërit», pastaj një shigjetë. P.sh. në urën e parë: 3×, Para.
3. Shtyp «Ndërto urën». Pjesët vendosen në skenë dhe roboti ecën mbi to. Drejtimi i gabuar ndalet pa humbur yje.
4. Pasi ura arrin në ishull, shtyp «Kthe rosakun në breg». Roboti kthehet mbi të njëjtën urë, me rosakun pas tij. Vetëm mbërritja në breg jep 3 yje.
5. «Ura tjetër» hap një sfidë me kthesa. Tri urat kanë 3, 5 dhe 7 pjesë dhe mësojnë përsëritjen e komandave.

Kamera 360° përdoret me tërheqje, prekje ose butona; rrotëza afron pamjen. Tingujt përdorin çelësin ekzistues. Animacionet respektojnë cilësimin e lojës dhe prefers-reduced-motion.

Arkitektura: rregulla në lib/robot-lake-game.ts, skena Three.js dhe pastrimi i burimeve në lib/robot-lake-scene.ts, ndërfaqja në components/robot-lake.tsx. Përdoren vetëm burime lokale. Skena e oborrit ndalon vizatimin gjatë vizitës në liqen; skena e liqenit pastrohet kur dilet.

Yjet ruhen gjatë vizitës, edhe pas daljes e rihyrjes në liqen. Rilojtja nuk jep yje të dyfishtë. Rifreskimi i faqes e rinis këtë prototip: lidhja e pamjes së re me progresin D1 të aventurës ekzistuese ende nuk është bërë. Nuk është publikuar.

Kontrolle lokale:

    node scripts/check-robot-lake.mjs
    node scripts/check-robot-lake-browser.mjs
    npm run typecheck

Komandat janë relative ndaj fytyrës së robotit. Para ecën përpara, Mbrapa ecën pas pa e kthyer robotin; Majtas/Djathtas e kthejnë 90° dhe e lëvizin një hap. Pas kthesës përdor Para për të vazhduar në atë kah. Roboti nis i kthyer nga shtylla e parë. Kamera nuk ndryshon kuptimin e komandave.
