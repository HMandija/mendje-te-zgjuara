# Dependency security review — 2026-10-12

The lockfile audit changed from 30 affected packages (1 critical, 21 high,
7 moderate, 1 low) to 8 high findings, all from one unresolved development-tool
advisory. `npm audit --omit=dev` reports zero vulnerabilities. These are package
audit results, not a claim that the whole application is vulnerability-free.

Updated Next.js and its ESLint configuration to 16.3.8, React/React DOM/React
Server Components together to 19.2.8, Vite to 8.0.16, Vinext to 1.1.0 and its
RSC plugin to 0.5.36. Cloudflare's Vite plugin 1.63.1, Wrangler 4.149.0 and
Workers types 5.20261006.1 are aligned. Compatible transitive updates are
recorded in package-lock.json. The old vulnerable Sharp override was removed.

Two narrowly scoped overrides remain:

- Satori's pinned `fflate` 0.7.3 is replaced by patched 0.7.5. ZIP round-trip
  compatibility was checked.
- `@esbuild-kit/core-utils` uses esbuild 0.25.12 instead of vulnerable 0.18.x.
  Its synchronous and asynchronous TypeScript transformations were checked.
  Drizzle Kit itself is updated to 0.31.11. No schema or data migration was made.

## Remaining advisory

GHSA-vfj7-8cjw-p6xm affects `braces` through 3.0.3. At review time there is no
patched release. It propagates through micromatch/fast-glob into the ESLint
plugin and Vite's CommonJS/dynamic-import build plugins, accounting for all
eight remaining findings. These consume developer-controlled file patterns;
the application does not accept user-provided glob patterns. No references to
these packages were found in the generated production bundles. Do not expose
development servers or run builds from untrusted source/configuration.

Do not use `npm audit fix --force`: its proposed Next ESLint/Drizzle/Vinext
downgrades are not compatible replacements for this application. Recheck this
advisory on the next dependency update and remove overrides when upstream
dependencies include their fixes. A clean production-only audit does not
replace the full audit: some runtime framework packages are devDependencies
because they are bundled at build time.

## Validation and deployment gate

Lint, TypeScript, the complete existing test suite, the Cloudflare production
build and the standalone security checks passed. The built Worker was started
locally with an isolated D1 database: home, demo, student login, teacher login
and admin pages returned 200; their referenced JS/CSS loaded successfully;
unauthenticated admin and roster APIs returned 401. Provider email delivery
and browser interaction are not asserted by these checks.

CI now blocks deployment if the production dependency audit reports a known
vulnerability. Continue to run the full `npm audit` for development tooling.

References:
- https://github.com/vercel/next.js/security/advisories/GHSA-vcvr-r3jv-pc5j
- https://github.com/react/react/security/advisories/GHSA-wx67-qw84-cm4g
- https://github.com/advisories/GHSA-vfj7-8cjw-p6xm
- https://github.com/evanw/esbuild/security/advisories/GHSA-67mh-4wv8-2f99
