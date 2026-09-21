// Builds index.html (the offline single-file finder) from src/.
// Node port of the original build script - plain concatenation, no dependencies.
import fs from 'fs';
import path from 'path';

const SRC = path.join(process.cwd(), 'src');
const OUT = path.join(process.cwd(), 'index.html');

const read = (p) => fs.readFileSync(path.join(SRC, p), 'utf8');

// 1. data chunks -> one base64 string
const parts = [];
for (let n = 0; n < 66; n++) {
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
const scomet = plain('scomet.ts', 'SCOMET');
const alias = plain('aliases.ts', 'ALIASES');
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
${scomet}
${alias}
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
