# Paneli i administratorit

Adresa `/admin` nuk ka link në homepage. Fshehja e linkut nuk është kontroll aksesi: çdo API kërkon sesionin admin në server.

Konfigurimi vetëm në Worker:
- `ADMIN_EMAIL`: email-i i vetëm i autorizuar, i konfirmuar në Supabase.
- `SUPABASE_SECRET_KEY`: Supabase Secret/service_role, për listën e përdoruesve. Nuk shfaqet në client ose GitHub.
- Konfigurimi ekzistues `SUPABASE_URL` dhe `SUPABASE_PUBLISHABLE_KEY`.

Llogaria dhe fjalëkalimi menaxhohen në Supabase. Asnjë fjalëkalim nuk futet në burim. Në template Magic Link duhet `{{ .Token }}` për kod numerik; aktivizoni SMTP të përshtatshëm për dërgim. Dërgimi real nuk është verifikuar nga testet lokale.

Fjalëkalimi kontrollohet para kërkesës për OTP. Token-i password-only nuk krijon sesion admin. Challenge është cookie HttpOnly/SameSite Strict, me hash në D1, 10 minuta, 5 prova dhe konsumim atomik. Sesioni pas OTP vlen 30 minuta, ruhet me hash dhe revokohet me logout. Sesioni mësues/student nuk autorizon API-të admin. Ky është verifikim shtesë në aplikacion me email, jo pretendim për Supabase AAL2.

Paneli shfaq metadata të sigurta të llogarive, profilet e nxënësve dhe hyrjet e reja të suksesshme (IP/shtet/orë). Nuk shfaq fjalëkalime, figura sekrete, JWT, kode OTP ose kredenciale. Lista Supabase ka 50 llogari për faqe; nxënësit lexohen në grupe prej 20 workspace-sh; hyrjet kanë 50 rreshta për faqe.

Hyrjet ruhet 30 ditë dhe fshihen gradualisht gjatë hyrjeve të reja. Statistikat e faqeve janë kërkesa serveri, jo vizitorë unikë apo përdorim aktiv; përfshijnë robotët dhe rifreskimet. Ditët janë UTC. Nuk ruhen query strings. Gjeolokacioni është vetëm shtet i përafërt nga Cloudflare. Historiku përpara migrimit nuk ekziston. Kontrollet e rate limit dhe SMTP kufizojnë dërgimet.

Migrimi `0010_admin_access.sql` është vetëm strukturë; nuk krijon llogari dhe nuk importon të dhëna.
