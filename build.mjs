// Builds index.html (the offline single-file finder) from src/.
// Node port of the original build script - plain concatenation, no dependencies.
import fs from 'fs';
import path from 'path';

const SRC = path.join(process.cwd(), 'src');
const pako = fs.readFileSync(path.join(process.cwd(), 'vendor', 'pako-inflate.min.js'), 'utf8');
const PAKO = fs.readFileSync(path.join(process.cwd(), 'vendor', 'pako-inflate.min.js'), 'utf8');
const OUT = path.join(process.cwd(), 'index.html');

const read = (p) => fs.readFileSync(path.join(SRC, p), 'utf8');

// 1. data chunks -> one base64 string
const parts = [];
for (let n = 0; ; n++) {
  if (!fs.existsSync(path.join(SRC, `datachunk${n}.ts`))) break;
  const t = read(`datachunk${n}.ts`);
  const m = t.match(/export const CHUNK\d+ = "([A-Za-z0-9+/=]+)";/);
  if (!m) throw new Error(`chunk ${n} not found`);
  parts.push(m[1]);
}
const dataB64 = parts.join('');

// 2. maps: strip TS types + export - every strip MUST match, or the build dies loudly.
const must = (text, from, to, label) => {
  const out = text.replace(from, to);
  if (out === text) throw new Error('build: strip did not match - ' + label);
  return out;
};
const plain = (file, name) => must(read(file), new RegExp('export const ' + name + '\\s*:\\s*[^=]+='), 'const ' + name + ' =', file + ':' + name);

const gst = plain('gstmap.ts', 'GST_MAP');
const trade = plain('trademap.ts', 'TRADE_CH');
const trade6 = plain('tradevalues.ts', 'TRADE6');
const tradepartners = must(plain('tradepartners.ts', 'TRADE_PARTNERS'), 'export const TRADE_PARTNERS_YEAR =', 'const TRADE_PARTNERS_YEAR =', 'TRADE_PARTNERS_YEAR');
const marketdata = must(must(plain('marketdata.ts', 'MARKET_IMPORTERS'), 'export const MARKET_DATA_YEAR =', 'const MARKET_DATA_YEAR =', 'MARKET_DATA_YEAR'), /export const MARKET_WORLD: Record<string, number> =/, 'const MARKET_WORLD =', 'MARKET_WORLD');
const marketexp = must(must(plain('marketexp.ts', 'MARKET_EXPORTERS'), 'export const MARKET_EXP_YEAR =', 'const MARKET_EXP_YEAR =', 'MARKET_EXP_YEAR'), /export const MARKET_WORLD_X: Record<string, number> =/, 'const MARKET_WORLD_X =', 'MARKET_WORLD_X');
const sancgap = must(plain('sancgap.ts', 'SANCGAP'), 'export const SANCGAP_YEAR =', 'const SANCGAP_YEAR =', 'SANCGAP_YEAR');
const tradetrend = must(plain('tradetrend.ts', 'TRADE_TREND'), 'export const TRADE_TREND_YEARS =', 'const TRADE_TREND_YEARS =', 'TRADE_TREND_YEARS');
const tradeseason = must(plain('tradeseson.ts', 'TRADE_SEASON'), 'export const TRADE_SEASON_YEARS =', 'const TRADE_SEASON_YEARS =', 'TRADE_SEASON_YEARS');
const docs = must(read('docs.ts'), /export const (DOC_BASE_OUT|DOC_BASE_IN|DOC_EXTRA|PORTS|DOC_SRC) =/g, 'const $1 =', 'docs exports');
const sancz = must(must(read('sanc.ts'), 'export const SANC_ZONES =', 'const SANC_ZONES =', 'SANC_ZONES'), 'export const SANC_SRC =', 'const SANC_SRC =', 'SANC_SRC');
const add = must(must(must(read('add.ts'), 'export const ADD_MEASURES =', 'const ADD_MEASURES =', 'ADD_MEASURES'), 'export const ADD_ONGOING =', 'const ADD_ONGOING =', 'ADD_ONGOING'), 'export const ADD_SRC =', 'const ADD_SRC =', 'ADD_SRC');
const certs = must(must(read('certs.ts'), 'export const CERT_RULES =', 'const CERT_RULES =', 'CERT_RULES'), 'export const CERT_SRC =', 'const CERT_SRC =', 'CERT_SRC');
const fta = must(must(plain('fta.ts', 'FTA_UAE'), 'export const FTA_UAE_UNPARSED: string[] =', 'const FTA_UAE_UNPARSED =', 'FTA_UAE_UNPARSED'), 'export const FTA_AU: Record<string, string[]> =', 'const FTA_AU =', 'FTA_AU');
const rodtep = must(must(read('rodtep.ts'), 'export const RODTEP_DTA: Record<string, [string, string, string]> =', 'const RODTEP_DTA =', 'RODTEP_DTA'), 'export const RODTEP_SEZ: Record<string, [string, string, string]> =', 'const RODTEP_SEZ =', 'RODTEP_SEZ');
const scomet = plain('scomet.ts', 'SCOMET');
const alias = plain('aliases.ts', 'ALIASES');
const worldports = plain('worldports.ts', 'WORLD_PORTS');
const hscorr = must(must(read('hscorr.ts'), 'export const HS22_FWD: Record<string, string[]> =', 'const HS22_FWD =', 'HS22_FWD'), 'export const HS22_REV: Record<string, string[]> =', 'const HS22_REV =', 'HS22_REV');
const sanc = must(must(read('sanctions.ts'), 'export const SANCTIONS_META =', 'const SANCTIONS_META =', 'SANCTIONS_META'), 'export const SANCTIONS: [string, string, string][] =', 'const SANCTIONS =', 'SANCTIONS');

// 3. app.js: drop ES imports/exports
const app0 = read('app.js');
const appImports = (app0.match(/^import [^\n]+\n/gm) || []).length;
const app = must(must(app0, /^import [^\n]+\n/gm, '', 'app.js import lines'), 'export function boot(', 'function boot(', 'boot export');
if (!appImports) throw new Error('build: app.js import lines not found');

const css = read('style.css');

const doc = `<!doctype html>
<!--
  Worldwide HSN Code Finder - offline single-file build
  Copyright (c) 2026 Push. All rights reserved.
  Plain HTML/CSS/JavaScript. No frameworks, no third-party runtime code.
  Tariff descriptions and duty rates are compiled from the official public
  government and WCO sources credited in the app's Sources section.
-->
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Worldwide HSN Code Finder</title>
<meta name="description" content="Search 340,000+ official customs tariff codes across 22 national systems - India HSN, US HTS, EU CN, UK, Korea, Canada, Japan, Australia, Brazil and more. Duty rates, export incentives, trade data, documents and AI reports in one free file.">
<meta property="og:title" content="Worldwide HSN Code Finder">
<meta property="og:description" content="Find the right customs code for any product across 22 official tariff systems, with duty rates, trade data and export documents.">
<meta property="og:type" content="website">
<link rel="canonical" href="https://finder-hsn-codee.onrender.com/">
<style>
${css}
</style>
</head>
<body>
<div id="root"></div>
<script>
${pako}
var DATA_B64 = "${dataB64}";
${gst}
${trade}
${trade6}
${tradepartners}
${marketexp}
${marketdata}
${worldports}
${sancgap}
${tradetrend}
${tradeseason}
${docs}
${sancz}
${add}
${certs}
${fta}
${rodtep}
${scomet}
${alias}
${hscorr}
${sanc}
</script>
<script>
${app}
</script>
<script>
boot(document.getElementById('root'));
</script>
</body>
</html>
`;
// Final leak check: no TS export/import syntax may survive into the bundle.
if (/export (const|function)/.test(doc)) throw new Error('build: TS export leaked into bundle');
if (/^import /m.test(app)) throw new Error('build: import line leaked into bundle');
fs.writeFileSync(OUT, doc);
console.log('written', OUT, fs.statSync(OUT).size);
