// Watches every official source. A change must be seen on 2 consecutive runs
// (filters page noise) before a GitHub Issue "Source changed: X" is opened.
import fs from 'fs';
import crypto from 'crypto';
const STATE = 'state/sources.json';
const app = fs.readFileSync('src/app.js', 'utf8');
const sources = [...app.matchAll(/tag: '(\w+)', name: '([^']+)'.*?url: '([^']+)'/g)].map((m) => ({ id: m[1], name: m[2], url: m[3] }));
const san = fs.readFileSync('src/sanctions.ts', 'utf8').match(/"UFLPA":"([^"]+)"/);
if (san) sources.push({ id: 'UFLPA', name: 'DHS UFLPA Entity List', url: san[1] });
const norm = (h) => h.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<[^>]+>/g, ' ').replace(/\b[0-9a-f]{16,}\b/gi, '').replace(/\s+/g, ' ').trim();
async function sig(url) {
  const r = await fetch(url, { headers: { 'User-Agent': 'hsn-finder-updater' }, signal: AbortSignal.timeout(30000) });
  if (!r.ok) throw new Error('HTTP ' + r.status);
  const v = r.headers.get('etag') || r.headers.get('last-modified');
  if (v) return 'h:' + v;
  return 's:' + crypto.createHash('sha256').update(norm((await r.text()).slice(0, 2e6))).digest('hex');
}
export async function issue(title, body) {
  const T = process.env.GITHUB_TOKEN, R = process.env.GITHUB_REPOSITORY;
  if (!T || !R) return console.log('ISSUE (no token):', title);
  const h = { Authorization: 'Bearer ' + T, Accept: 'application/vnd.github+json', 'User-Agent': 'hsn-finder-updater' };
  const open = await (await fetch(`https://api.github.com/repos/${R}/issues?state=open&per_page=100`, { headers: h })).json();
  if (Array.isArray(open) && open.some((i) => i.title === title)) return;
  await fetch(`https://api.github.com/repos/${R}/issues`, { method: 'POST', headers: h, body: JSON.stringify({ title, body }) });
}
export async function monitor() {
  const st = fs.existsSync(STATE) ? JSON.parse(fs.readFileSync(STATE, 'utf8')) : {};
  const report = { changed: [], unreachable: [], baseline: 0 };
  for (const s of sources) {
    const e = (st[s.id] = st[s.id] || {});
    try {
      const g = await sig(s.url); e.fails = 0;
      if (!e.sig) { e.sig = g; report.baseline++; }
      else if (g === e.sig) { e.cand = null; e.n = 0; }
      else if (g === e.cand) { e.n++; if (e.n >= 2) { e.sig = g; e.cand = null; e.n = 0; e.changedAt = new Date().toISOString().slice(0, 10); report.changed.push(s.id);
        await issue('Source changed: ' + s.name, `The official source page changed (${e.changedAt}).\n${s.url}\n\nReview whether this dataset needs updating. Tariff systems: rebuild the data chunks. India GST: edit src/gstmap.ts.`); } }
      else { e.cand = g; e.n = 1; }
    } catch (err) {
      e.fails = Math.min((e.fails || 0) + 1, 8); report.unreachable.push(s.id);
      if (e.fails === 7) await issue('Source unreachable for 7 days: ' + s.name, s.url + '\n' + err.message);
    }
  }
  fs.mkdirSync('state', { recursive: true });
  fs.writeFileSync(STATE, JSON.stringify(st, null, 1) + '\n');
  return report;
}
