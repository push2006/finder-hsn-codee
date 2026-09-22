// Incremental UN Comtrade partner + quantity bake.
// Each daily run pulls top-partner breakdowns for the next batch of head codes
// (ranked by India trade weight from src/tradevalues.ts) and grows src/tradepartners.ts.
// One API call per code (flows M,X combined, all partners). Free key documents
// 500 calls/day; this uses ~40, on top of the 2 calls refresh.mjs already makes.
// State lives in state/comtrade-partners.json so coverage survives reruns and
// resets automatically when tradevalues.ts rolls to a new calendar year.
import fs from 'fs';

const KEY = process.env.COMTRADE_KEY || '';
const DRY = process.env.RENDER_DRY === '1';
const BATCH = parseInt(process.env.COMTRADE_PARTNERS_BATCH || '40', 10);
const STATE = 'state/comtrade-partners.json';
const OUT = 'src/tradepartners.ts';

// WCO supplementary quantity units (UN Comtrade codes 1-13, official UNSD methodology table).
const UNITS = { 2: 'm2', 3: '1000 kWh', 4: 'm', 5: 'items', 6: 'pairs', 7: 'litres', 8: 'kg', 9: 'thousand items', 10: 'packs', 11: 'dozens', 12: 'm3', 13: 'carats' };

const log = (...a) => console.log(new Date().toISOString(), ...a);

function tradeYearAndCodes() {
  const src = fs.readFileSync('src/tradevalues.ts', 'utf8');
  const ym = src.match(/calendar year (\d{4})/);
  const year = ym ? parseInt(ym[1], 10) : new Date().getUTCFullYear() - 1;
  const codes = {};
  for (const m of src.matchAll(/'(\d{6})': \[(\d+), (\d+)\]/g)) codes[m[1]] = parseInt(m[2], 10) + parseInt(m[3], 10);
  return { year, codes };
}

async function fetchJson(url, withKey) {
  const headers = withKey ? { 'Ocp-Apim-Subscription-Key': KEY } : {};
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error('HTTP ' + res.status + ' for ' + url.slice(0, 110));
  return res.json();
}

async function partnerNames() {
  const d = await fetchJson('https://comtradeapi.un.org/files/v1/app/reference/partnerAreas.json', false);
  const map = {};
  for (const r of d.results || []) if (!r.isGroup) map[r.PartnerCode] = r.PartnerDesc;
  return map;
}

function extract(records, names) {
  const world = { M: null, X: null };
  const top = { M: [], X: [] };
  for (const r of records) {
    const f = r.flowCode;
    if (f !== 'M' && f !== 'X') continue;
    if (r.partnerCode === 0) { world[f] = r; continue; }
    const name = names[r.partnerCode];
    if (!name || !(r.primaryValue > 0)) continue;
    top[f].push([name, Math.round(r.primaryValue)]);
  }
  for (const f of ['M', 'X']) top[f] = top[f].sort((a, b) => b[1] - a[1]).slice(0, 5);
  const qty = (w) => {
    if (!w) return {};
    const out = {};
    const qc = w.qtyUnitCode > 0 && w.qty > 0 ? [w.qty, w.qtyUnitCode] : (w.altQtyUnitCode > 0 && w.altQty > 0 ? [w.altQty, w.altQtyUnitCode] : null);
    if (qc && UNITS[qc[1]]) out.q = [Math.round(qc[0]), UNITS[qc[1]]];
    if (w.netWgt > 0) out.n = [Math.round(w.netWgt), !!w.isNetWgtEstimated];
    return out;
  };
  const qx = qty(world.X), qm = qty(world.M);
  const rec = { x: top.X, m: top.M };
  if (qx.q) rec.xq = qx.q;
  if (qx.n) rec.xn = qx.n;
  if (qm.q) rec.mq = qm.q;
  if (qm.n) rec.mn = qm.n;
  return rec;
}

function render(year, data) {
  const codes = Object.keys(data).sort();
  let out = `// India trade partners and quantities by 6-digit HS code, calendar year ${year}.\n` +
    `// Source: UN Comtrade API (comtradeapi.un.org), reporter 699 (India), flows M (imports, CIF)\n` +
    `// and X (exports, FOB), values in USD, top 5 partners each way. Quantities are the\n` +
    `// world-total supplementary quantity (WCO units) and net weight; estimated flags kept.\n` +
    `// Baked ${new Date().toISOString().slice(0, 10)} - coverage ${codes.length} codes, grows daily.\n` +
    `export const TRADE_PARTNERS_YEAR = ${year};\n` +
    `export const TRADE_PARTNERS: Record<string, { x: [string, number][]; m: [string, number][]; xq?: [number, string]; mq?: [number, string]; xn?: [number, boolean]; mn?: [number, boolean] }> = {\n`;
  for (const c of codes) {
    const d = data[c];
    const pair = (a) => '[' + a.map((p) => '[' + JSON.stringify(p[0]) + ', ' + p[1] + ']').join(', ') + ']';
    let line = `  '${c}': { x: ${pair(d.x)}, m: ${pair(d.m)}`;
    const q = (k, v) => v ? `, ${k}: [${v[0]}, ${JSON.stringify(v[1])}]` : '';
    const n = (k, v) => v ? `, ${k}: [${v[0]}, ${v[1]}]` : '';
    line += q('xq', d.xq) + q('mq', d.mq) + n('xn', d.xn) + n('mn', d.mn) + ' },\n';
    out += line;
  }
  return out + '};\n';
}

export async function bakePartners() {
  if (!KEY) { log('COMTRADE_KEY not set - skipping partner bake'); return { skipped: 'no key' }; }
  const { year, codes } = tradeYearAndCodes();
  const ranked = Object.entries(codes).sort((a, b) => b[1] - a[1]).map((e) => e[0]);
  let st = fs.existsSync(STATE) ? JSON.parse(fs.readFileSync(STATE, 'utf8')) : null;
  if (!st || st.year !== year) st = { year, data: {}, failures: {} };
  const remaining = ranked.filter((c) => !st.data[c] && (st.failures[c] || 0) < 3);
  if (!remaining.length) {
    renderAndWrite(st, year);
    return { complete: Object.keys(st.data).length, year };
  }
  const names = await partnerNames();
  const batch = remaining.slice(0, DRY ? 2 : BATCH);
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  let pulled = 0, failed = 0, throttled = false;
  for (const code of batch) {
    try {
      const url = `https://comtradeapi.un.org/data/v1/get/C/A/HS?reporterCode=699&period=${year}&cmdCode=${code}&flowCode=M%2CX&partner2Code=0&customsCode=C00&motCode=0`;
      const d = await fetchJson(url, true);
      st.data[code] = extract(d.data || [], names);
      delete st.failures[code];
      pulled++;
      await sleep(450); // free tier throttles bursts; pace the calls
    } catch (e) {
      if (/HTTP 429/.test(e.message)) { throttled = true; log('rate limited - stopping batch, resumes tomorrow'); break; }
      st.failures[code] = (st.failures[code] || 0) + 1;
      failed++;
      log('partner pull failed', code, e.message);
      await sleep(450);
    }
  }
  renderAndWrite(st, year);
  log('partner bake:', pulled, 'pulled,', failed, 'failed, coverage', Object.keys(st.data).length, '/', ranked.length, 'year', year);
  return { pulled, failed, throttled, coverage: Object.keys(st.data).length, total: ranked.length, year };
}

function renderAndWrite(st, year) {
  fs.mkdirSync('state', { recursive: true });
  fs.writeFileSync(STATE, JSON.stringify(st) + '\n');
  fs.writeFileSync(OUT, render(year, st.data));
}

if (process.argv[1] && process.argv[1].endsWith('comtrade-partners.mjs')) {
  bakePartners().then((r) => console.log('[ok] comtrade-partners', JSON.stringify(r))).catch((e) => { console.error('[fail] comtrade-partners', e.message); process.exit(1); });
}
