// One command does everything: node automate.mjs
// trade data -> sanctions -> source watch -> rebuild -> safety checks. Exits 1 if any check fails.
import fs from 'fs';
import zlib from 'zlib';
import { execSync } from 'child_process';
import { runRefresh } from './refresh.mjs';
import { refreshSanctions } from './sanctions-refresh.mjs';
import { monitor, issue } from './monitor.mjs';
import vm from 'vm';
import { expandAliases, draftGst } from './ai-agent.mjs';
const step = async (n, f) => { try { const r = await f(); console.log('[ok]', n, JSON.stringify(r)); return r; } catch (e) { console.log('[skip]', n, e.message); return null; } };
await step('trade+cleanup', runRefresh);
const sr = await step('sanctions', refreshSanctions);
if (sr) {
  const HP = 'state/health.json', h = fs.existsSync(HP) ? JSON.parse(fs.readFileSync(HP, 'utf8')) : {};
  for (const [l, v] of Object.entries(sr)) {
    h[l] = v.startsWith('updated') ? 0 : Math.min((h[l] || 0) + 1, 8);
    if (h[l] === 7) await issue('Sanctions ' + l + ' not refreshing for 7 days', v);
  }
  fs.writeFileSync(HP, JSON.stringify(h) + '\n');
}
await step('source-watch', monitor);
await step('ai-aliases', expandAliases);
await step('ai-gst-draft', draftGst);
execSync('node build.mjs', { stdio: 'inherit' });
// ---- safety checks (nothing is committed if these fail) ----
const fail = (m) => { console.error('CHECK FAILED:', m); process.exit(1); };
let b = ''; for (let n = 0; n < 66; n++) b += fs.readFileSync(`src/datachunk${n}.ts`, 'utf8').match(/"([A-Za-z0-9+/=]+)"/)[1];
const rows = JSON.parse(zlib.gunzipSync(Buffer.from(b, 'base64')).toString());
if (rows.length < 250000) fail('dataset rows ' + rows.length);
if (rows.some((r) => /<[a-z/][^>]*>/i.test(r[2] || ''))) fail('HTML artifacts in descriptions');
const g = fs.readFileSync('src/gstmap.ts', 'utf8');
const rates = [...g.matchAll(/\["([^"]+)",/g)].map((m) => m[1]);
if (rates.length < 1000 || rates.some((r) => !/^\d+(\.\d+)?%$/.test(r))) fail('GST map malformed');
if (fs.readFileSync('src/sanctions.ts', 'utf8').length < 3e6) fail('sanctions file too small');
const idx = fs.readFileSync('index.html', 'utf8');
if (idx.length < 8e6 || !idx.includes('boot(document')) fail('index.html incomplete');
for (const m of idx.matchAll(/<script>([\s\S]*?)<\/script>/g)) { try { new vm.Script(m[1]); } catch (e) { fail('JS syntax error in built page: ' + e.message); } }
fs.writeFileSync('state/heartbeat.txt', new Date().toISOString().slice(0, 7) + '\n'); // monthly commit keeps the schedule alive
console.log('ALL CHECKS PASSED');
