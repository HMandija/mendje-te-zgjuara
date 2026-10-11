import { spawnSync } from 'node:child_process';
import { readFile, mkdir, writeFile, copyFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../', import.meta.url));
const destination = path.resolve(root, '../mendje-private-release');
try { await stat(destination); throw Error('Release directory already exists; inspect it before reusing.'); }
catch (error) { if (error.code !== 'ENOENT') throw error; }
const listing = spawnSync('git', ['ls-files', '--cached', '--others', '--exclude-standard', '-z'], { cwd: root, encoding: 'utf8' });
if (listing.status !== 0) throw Error('Cannot list release source files.');
const excluded = /^(?:\.openai\/|\.codex\/|\.agents\/|AGENTS\.md$|docs\/(?:STATE|ROADMAP)\.md$)/;
const forbidden = /(?:^|\/)(?:\.env(?:\..*)?|\.dev\.vars.*|credentials\.json|service-account.*\.json)$|\.(?:pem|key|p12|pfx|sqlite3?|db|zip|tar\.gz)$/i;
const patterns = [
  ['private key', /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/],
  ['GitHub token', /\b(?:gh[pousr]_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{30,})\b/],
  ['Supabase key', /\bsb_(?:secret|publishable)_[A-Za-z0-9_-]{15,}\b/],
  ['JWT credential', /\beyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\b/],
  ['AWS key', /\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/],
  ['credential assignment', /(?:API_TOKEN|SERVICE_ROLE_KEY|CLIENT_SECRET|ACCESS_TOKEN)\s*[:=]\s*["'][A-Za-z0-9_\/-]{24,}["']/i],
];
const files = [...new Set(listing.stdout.split('\0').filter(Boolean))].filter(f => !excluded.test(f));
const findings = [];
for (const file of files) {
  if (forbidden.test(file)) { findings.push({ file, type: 'forbidden file' }); continue; }
  const bytes = await readFile(path.join(root, file));
  if (bytes.includes(0)) continue;
  const lines = bytes.toString('utf8').split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) for (const [type, regex] of patterns)
    if (regex.test(lines[i])) findings.push({ file, line: i + 1, type });
}
if (findings.length) { console.error(JSON.stringify(findings, null, 2)); throw Error('Release blocked; inspect potential credentials. Values are not printed.'); }
await mkdir(destination);
for (const file of files) {
  const target = path.join(destination, file);
  await mkdir(path.dirname(target), { recursive: true });
  await copyFile(path.join(root, file), target);
}
// The independent repository must not depend on the old hosting manifest.
await copyFile(path.join(root, 'vite.cloudflare.ts'), path.join(destination, 'vite.config.ts'));
await writeFile(path.join(destination, 'README.md'), '# Mendje të Zgjuara\n\nAplikacion mësimor në shqip për klasat 1–4.\n\nKonfigurimi: [Cloudflare deployment](docs/CLOUDFLARE-DEPLOY.md).\n\nKy repository përmban vetëm kod dhe materiale të aplikacionit; databaza dhe sekretet konfigurohen veçmas.\n');
await writeFile(path.join(destination, '.gitignore'), await readFile(path.join(root, '.gitignore'), 'utf8') + '\n.openai/\n.codex/\n.agents/\n');
console.log(JSON.stringify({ destination, files: files.length, findings: 0, historyCopied: false }));
