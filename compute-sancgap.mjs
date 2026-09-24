// Sanction-gap dataset: per 6-digit code, sanctioned-market exposure and alternative suppliers.
// Demand side: red-zone (comprehensively sanctioned) countries among the code's top importers.
// Supply side: red-zone countries among the code's top exporters (supply at sanctions risk),
// plus the top alternative (non-listed) exporters and India's exporter rank.
// Computed locally from src/marketdata.ts + src/marketexp.ts + src/sanc.ts - no API calls.
import fs from 'fs';

const load = (f, re) => {
  const src = fs.readFileSync(f, 'utf8');
  const out = {};
  for (const m of src.matchAll(re)) out[m[1]] = m[2];
  return out;
};
const rowsOf = (body) => [...body.matchAll(/\["([^"]+)", (\d+)\]/g)].map((m) => [m[1], parseInt(m[2], 10)]);

const imp = load('src/marketdata.ts', /'(\d{6})': \[((?:\[[^\]]*\](?:, )?)+)\]/g);
const exp = load('src/marketexp.ts', /'(\d{6})': \[((?:\[[^\]]*\](?:, )?)+)\]/g);

// SANC_ZONES country -> zone. Map Comtrade reporter names onto the zone list.
const zs = fs.readFileSync('src/sanc.ts', 'utf8');
const zones = {};
for (const m of zs.matchAll(/"([^"]+)": \[(\d),/g)) zones[m[1]] = parseInt(m[2], 10);
const NAME2ZONE = [
  [/dem.*people.*korea|korea.*dem/i, 'North Korea'],
  [/^russia/i, 'Russia'], [/^iran/i, 'Iran'], [/^cuba/i, 'Cuba'], [/^belarus/i, 'Belarus'],
  [/^syria/i, 'Syria'], [/^venezuela/i, 'Venezuela'], [/^myanmar/i, 'Myanmar'],
  [/^afghanistan/i, 'Afghanistan'], [/^iraq/i, 'Iraq'], [/^lebanon/i, 'Lebanon'], [/^libya/i, 'Libya'],
  [/^somalia/i, 'Somalia'], [/^south sudan/i, 'South Sudan'], [/^sudan/i, 'Sudan'], [/^yemen/i, 'Yemen'],
  [/congo/i, 'Congo (DRC)'], [/central african/i, 'Central African Republic'], [/^haiti/i, 'Haiti'],
  [/guinea-bissau/i, 'Guinea-Bissau'], [/^mali/i, 'Mali'], [/^nicaragua/i, 'Nicaragua'], [/^zimbabwe/i, 'Zimbabwe'],
  [/^serbia|^bosnia|^kosovo/i, 'Western Balkans (Serbia, Bosnia, Kosovo)'],
  [/hong kong/i, 'Hong Kong'], [/^china$/i, 'China'], [/^pakistan/i, 'Pakistan'],
];
const zoneOf = (name) => {
  for (const [re, zc] of NAME2ZONE) if (re.test(name)) return zones[zc] ? { c: zc, z: zones[zc] } : null;
  return null;
};

const year = (fs.readFileSync('src/marketdata.ts', 'utf8').match(/MARKET_DATA_YEAR = (\d{4})/) || [])[1];
const gap = {};
const codes = new Set([...Object.keys(imp), ...Object.keys(exp)]);
for (const code of codes) {
  const rec = {};
  const im = imp[code] ? rowsOf(imp[code]) : [];
  const ex = exp[code] ? rowsOf(exp[code]) : [];
  const dm = im.filter((r) => { const z = zoneOf(r[0]); return z && z.z === 1; }).map((r) => [r[0], r[1]]);
  const sx = ex.filter((r) => { const z = zoneOf(r[0]); return z && z.z === 1; }).map((r) => [r[0], r[1]]);
  const alt = ex.filter((r) => !zoneOf(r[0])).slice(0, 5);
  let india = null;
  ex.forEach((r, i) => { if (r[0] === 'India') india = [i + 1, r[1]]; });
  if (!dm.length && !sx.length) continue;
  if (dm.length) rec.dm = dm;
  if (sx.length) rec.sx = sx;
  if (alt.length) rec.alt = alt;
  if (india) rec.in = india;
  gap[code] = rec;
}
let out = `// Sanction-gap exposure by 6-digit HS code, calendar year ${year}.\n` +
  `// Computed from UN Comtrade ${year} (all reporters) + the country-level sanctions snapshot\n` +
  `// (SANC_ZONES, baked 23 Sep 2026: OFAC/EU/UN/UK programmes). dm = red-zone countries among the\n` +
  `// code's top importers (demand at sanctions risk); sx = red-zone countries among top exporters\n` +
  `// (supply at sanctions risk); alt = top exporters not on any sanctions list (alternative\n` +
  `// suppliers); in = India's rank and export value among all exporters.\n` +
  `// Computed ${new Date().toISOString().slice(0, 10)} - coverage ${Object.keys(gap).length} codes.\n` +
  `export const SANCGAP_YEAR = ${year};\n` +
  `export const SANCGAP: Record<string, { dm?: [string, number][]; sx?: [string, number][]; alt?: [string, number][]; in?: [number, number] }> = {\n`;
const pair = (a) => '[' + a.map((p) => '[' + JSON.stringify(p[0]) + ', ' + p[1] + ']').join(', ') + ']';
for (const c of Object.keys(gap).sort()) {
  const g = gap[c];
  let line = `  '${c}': {`;
  if (g.dm) line += ` dm: ${pair(g.dm)},`;
  if (g.sx) line += ` sx: ${pair(g.sx)},`;
  if (g.alt) line += ` alt: ${pair(g.alt)},`;
  if (g.in) line += ` in: [${g.in[0]}, ${g.in[1]}],`;
  out += line + ' },\n';
}
fs.writeFileSync('src/sancgap.ts', out + '};\n');
console.log('[ok] sancgap codes:', Object.keys(gap).length, 'year', year);
