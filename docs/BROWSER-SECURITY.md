# Standalone browser protections

The Cloudflare gateway is the authority for dynamic response headers. Framework
configuration alone did not consistently apply headers to every public page.
Static JS, CSS, images and audio receive baseline headers through `public/_headers`;
hashed assets retain immutable caching.

Every request receives a fresh 192-bit cryptographic script nonce. Incoming CSP,
report-only CSP and `x-nonce` values cannot select it. Vinext receives the generated
CSP before rendering and adds the nonce to bootstrap/streaming scripts. The root
layout passes it to next-themes for its initial theme script. Dynamic HTML, RSC
and API responses are private/no-store in browser and CDN caches.

The enforced script policy has no `unsafe-inline` or `unsafe-eval`. Inline event
attributes, embedded frames, plugins, base elements and third-party form targets
are blocked. Inline **styles** remain necessary for React, motion, charts and
the existing components; this is not a claim of a strict style policy. Images
may use local data/blob URLs; audio and full-screen remain available to this origin.
No external browser connections are required: Supabase calls occur on the server.

Additional headers: X-Frame-Options DENY, nosniff, no-referrer, same-origin opener
and resource policies, and Permissions-Policy denying camera, microphone,
geolocation, payment and USB. HTTPS responses advertise HSTS for 180 days,
without preload or includeSubDomains. The local HTTP Worker does not add HSTS.

Responses remain streamed; status, redirects and multiple Set-Cookie headers are
preserved. `check-browser-security.mjs` tests these properties and policy rules;
the standalone build check also verifies forged incoming headers are replaced
and static asset rules survive the build. This production gateway policy
supersedes the older framework-only CSP description in SECURITY.md. Development
and legacy Sites preview paths retain their existing development policy.

Local Chrome validation: home, demo, student login, teacher login and admin
rendered with matching script nonces and no unexpected CSP violations. Theme
switching, sound-toggle state, full-screen entry/exit and a robot movement worked.
A deliberately inserted script without a nonce was blocked. Same-origin audio
playback was verified independently using the existing move WAV after a click;
the automatic game cue itself did not produce an audio request in this test, so
automatic game-cue playback is not claimed as verified. No changes to the sound
loader are included. HTTP checks cover fresh nonces, spoofed incoming nonces,
401s, 404s, redirects, RSC no-store and static audio/image headers.

References:
- https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CSP
- https://developers.cloudflare.com/workers/static-assets/headers/
