// Builds index.html (the offline single-file finder) from src/.
// Node port of the original build script - plain concatenation, no dependencies.
import fs from 'fs';
import path from 'path';

const SRC = path.join(process.cwd(), 'src');
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

// 2. maps: strip TS types + export
const plain = (file, name) => read(file).replace(new RegExp('export const ' + name + '\\s*:\\s*[^=]+='), 'const ' + name + ' =');

const gst = plain('gstmap.ts', 'GST_MAP');
const trade = plain('trademap.ts', 'TRADE_CH');
const trade6 = plain('tradevalues.ts', 'TRADE6');
const tradepartners = plain('tradepartners.ts', 'TRADE_PARTNERS')
  .replace('export const TRADE_PARTNERS_YEAR =', 'const TRADE_PARTNERS_YEAR =');
const marketdata = plain('marketdata.ts', 'MARKET_IMPORTERS')
  .replace('export const MARKET_DATA_YEAR =', 'const MARKET_DATA_YEAR =')
  .replace(/export const MARKET_WORLD: Record<string, number> =/, 'const MARKET_WORLD =');
const marketexp = plain('marketexp.ts', 'MARKET_EXPORTERS')
  .replace('export const MARKET_EXP_YEAR =', 'const MARKET_EXP_YEAR =')
  .replace(/export const MARKET_WORLD_X: Record<string, number> =/, 'const MARKET_WORLD_X =');
const sancgap = plain('sancgap.ts', 'SANCGAP')
  .replace('export const SANCGAP_YEAR =', 'const SANCGAP_YEAR =');
const tradetrend = plain('tradetrend.ts', 'TRADE_TREND')
  .replace('export const TRADE_TREND_YEARS =', 'const TRADE_TREND_YEARS =');
const tradeseason = plain('tradeseson.ts', 'TRADE_SEASON')
  .replace('export const TRADE_SEASON_YEARS =', 'const TRADE_SEASON_YEARS =');
const docs = read('docs.ts')
  .replace(/export const (DOC_BASE_OUT|DOC_BASE_IN|DOC_EXTRA|PORTS|DOC_SRC) =/g, 'const $1 =');
const sancz = read('sanc.ts')
  .replace('export const SANC_ZONES =', 'const SANC_ZONES =')
  .replace('export const SANC_SRC =', 'const SANC_SRC =');
const add = read('add.ts')
  .replace('export const ADD_MEASURES =', 'const ADD_MEASURES =')
  .replace('export const ADD_ONGOING =', 'const ADD_ONGOING =')
  .replace('export const ADD_SRC =', 'const ADD_SRC =');
const certs = read('certs.ts')
  .replace('export const CERT_RULES =', 'const CERT_RULES =')
  .replace('export const CERT_SRC =', 'const CERT_SRC =');
const fta = plain('fta.ts', 'FTA_UAE')
  .replace('export const FTA_UAE_UNPARSED: string[] =', 'const FTA_UAE_UNPARSED =')
  .replace('export const FTA_AU: Record<string, string[]> =', 'const FTA_AU =');
const rodtep = read('rodtep.ts')
  .replace('export const RODTEP_DTA: Record<string, [string, string, string]> =', 'const RODTEP_DTA =')
  .replace('export const RODTEP_SEZ: Record<string, [string, string, string]> =', 'const RODTEP_SEZ =');
const scomet = plain('scomet.ts', 'SCOMET');
const alias = plain('aliases.ts', 'ALIASES');
const hscorr = read('hscorr.ts')
  .replace('export const HS22_FWD: Record<string, string[]> =', 'const HS22_FWD =')
  .replace('export const HS22_REV: Record<string, string[]> =', 'const HS22_REV =');
const sanc = read('sanctions.ts')
  .replace('export const SANCTIONS_META =', 'const SANCTIONS_META =')
  .replace('export const SANCTIONS: [string, string, string][] =', 'const SANCTIONS =');

// 3. app.js: drop ES imports/exports
const app = read('app.js')
  .replace(/^import [^\n]+\n/gm, '')
  .replace('export function boot(', 'function boot(');

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
var DATA_B64 = "${dataB64}";
${gst}
${trade}
${trade6}
${tradepartners}
${marketexp}
${marketdata}
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
fs.writeFileSync(OUT, doc);
console.log('written', OUT, fs.statSync(OUT).size);
