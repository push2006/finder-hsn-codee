/* Worldwide HSN Code Finder
   Plain HTML/CSS/JavaScript build - no frameworks, no third-party runtime code.
   Copyright (c) 2026 Push. All rights reserved.
   Tariff descriptions and duty rates are compiled from the official public
   government and WCO sources credited in the app's Sources section. */
import { DATA_B64 } from './data';
import { GST_MAP } from './gstmap';
import { TRADE_CH } from './trademap';
import { TRADE6 } from './tradevalues';
import { SCOMET } from './scomet';
import { ALIASES } from './aliases';
import { SANCTIONS, SANCTIONS_META } from './sanctions';

const OWNER = 'Push';
const SYS = [
  { tag: 'HS', name: 'WCO HS 2022 (international)', src: 'UN Comtrade extraction of the WCO HS 2022 nomenclature', url: 'https://comtrade.un.org/data/doc/api/' },
  { tag: 'IN', name: 'India HSN (GST goods master)', src: 'Government-format HSN_SAC workbook, mirrored Sep 2025 (GST portal blocks direct download), joined with GST 2.0 rates from Notification 9/2025-Integrated Tax (Rate), 17 Sep 2025', url: 'https://cbic-gst.gov.in/gst-goods-services-rates.html' },
  { tag: 'US', name: 'US HTS (Harmonized Tariff Schedule)', src: 'USITC official HTS export, includes general duty rates', url: 'https://hts.usitc.gov/' },
  { tag: 'EU', name: 'EU CN 2026 (Combined Nomenclature)', src: 'Publications Office of the EU, official CN 2026 dataset', url: 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=OJ:L_202501926' },
  { tag: 'UK', name: 'UK Integrated Online Tariff', src: 'UK Department for Business and Trade official 2026 commodity report', url: 'https://data.api.trade.gov.uk/v1/datasets/uk-tariff-2021-01-01/versions/v4.0.200/metadata?format=html' },
  { tag: 'KR', name: 'Korea HSK 2026', src: 'Korea Customs Service official HS code workbook, 1 Jan 2026', url: 'https://www.data.go.kr/data/15049722/fileData.do' },
  { tag: 'CA', name: 'Canada Customs Tariff 2026', src: 'Canada Border Services Agency official 2026 tariff by chapter', url: 'https://www.cbsa-asfc.gc.ca/trade-commerce/tariff-tarif/2026/menu-eng.html' },
  { tag: 'JP', name: 'Japan Tariff Schedule 2026', src: 'Japan Customs official tariff schedule, 1 Jan 2026', url: 'https://www.customs.go.jp/english/tariff/2026_01_01/index.htm' },
  { tag: 'AU', name: 'Australia Working Tariff (Schedule 3)', src: 'Australian Border Force Combined Australian Customs Tariff Nomenclature and Statistical Classification, current working tariff', url: 'https://www.abf.gov.au/importing-exporting-and-manufacturing/tariff-classification/current-tariff' },
  { tag: 'BR', name: 'Brazil NCM (Mercosur nomenclature)', src: 'Receita Federal / Siscomex Classif official NCM table, in force 21 Sep 2026 (Res. Gecex 926/2026)', url: 'https://www.gov.br/receitafederal/pt-br/assuntos/aduana-e-comercio-exterior/classificacao-fiscal-de-mercadorias/download-ncm-nomenclatura-comum-do-mercosul' },
  { tag: 'TW', name: 'Taiwan Customs Import Tariff', src: 'Taiwan Customs Administration official import duty open data (data.gov.tw dataset 80871)', url: 'https://data.gov.tw/en/datasets/80871' },
  { tag: 'NZ', name: 'New Zealand Working Tariff (CusMod)', src: 'New Zealand Customs Service official CusMod tariff data files, updated nightly', url: 'https://www.customs.govt.nz/business/tariffs/tariff-classifications-and-rates/' },
  { tag: 'NO', name: 'Norway Customs Tariff (Tolltariffen)', src: 'Norwegian Customs official open data service, tariff structure dataset', url: 'https://data.toll.no/no/dataset/tolltariffstruktur' },
  { tag: 'SG', name: 'Singapore STCCED 2022', src: 'Singapore Customs official Singapore Trade Classification, Customs and Excise Duties 2022 (excise applies only to alcohol, tobacco, fuel and motor vehicles, so most lines show no duty)', url: 'https://www.customs.gov.sg/businesses/harmonized-system-hs-classification-of-goods/' },
  { tag: 'IL', name: 'Israel Customs Tariff and Purchase Tax', src: 'Israel Tax Authority official customs book open dataset (data.gov.il, updated 21 Sep 2026), English edition', url: 'https://data.gov.il/dataset/customsbook' },
  { tag: 'MX', name: 'Mexico TIGIE (LIGIE unified)', src: 'Secretaria de Economia official unified LIGIE text with NICO statistical lines, 28 Jul 2025 base', url: 'https://www.snice.gob.mx/cs/avi/snice/ligie.info22.html' },
];

const TRADE_YEAR = 2025;
const DATA_BUILD = '2026-09-22-gen10';
// Gemini model chain lives at the AI swap points below (near the key lines).
let geminiModelUsed = '';
let geminiGrounded = false;
const geminiModelLabel = () => geminiModelUsed || GEMINI_MODELS[0];
let groqModelUsed = '';
// Built-in AI for everyone: point AI_PROXY_URL at your free Cloudflare Worker
// (setup steps in worker-setup.txt). The worker holds the API keys server-side,
// so every visitor gets AI picks + AI reports without pasting anything. Jobs
// route by purpose: best-code picks use Groq (fast), report writing uses Gemini
// (Google Search capable). A key pasted in AI settings always overrides the proxy.
const AI_PROXY_URL = '';
const AI_PROXY_TOKEN = ''; // set only if you also set APP_SECRET on the worker
// Built-in shared keys (optional second choice): paste your own free keys here
// to give every visitor AI without a worker. WARNING: anyone can read these in
// the page source and bots scan public repos - a shared key can be stolen and
// its daily quota burned. The worker option above keeps keys hidden. Comma-
// separate several keys to rotate when one hits its daily limit.
const BUILTIN_GEMINI_KEYS = 'AIzaSyAeLPnOoR_M_jTJnj9dYGVOPyUJMJ91dDw';
const BUILTIN_GROQ_KEYS = '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';

// ==== AI model swap points: change a model by editing one line ====
const GEMINI_MODEL = 'gemini-3.8-flash'; // report writing; free tier confirmed 22 Sep 2026. Google Search grounding is NOT in the free tier - the report call retries ungrounded automatically.
const GROQ_MODEL = 'openai/gpt-oss-120b'; // instant best-code picks
const GROQ_MODEL_FALLBACK = 'openai/gpt-oss-20b'; // used if the primary is busy or retired
const GROQ_MODELS = [GROQ_MODEL, GROQ_MODEL_FALLBACK];
// Gemini chain: tried in order when a model is retired, busy or quota-maxed.
const GEMINI_MODELS = [GEMINI_MODEL, 'gemini-3.7-flash', 'gemini-3.6-flash', 'gemini-3.5-flash-lite', 'gemini-3.1-flash-lite', 'gemini-2.5-flash-lite', 'gemini-2.5-flash'];
const builtinPools = { gemini: { off: 0 }, groq: { off: 0 } };
const builtinKeys = (kind) => String(kind === 'groq' ? BUILTIN_GROQ_KEYS : BUILTIN_GEMINI_KEYS).split(',').map((k) => k.trim()).filter(Boolean);
const aiAvailable = () => Boolean(V.apiKey || AI_PROXY_URL || BUILTIN_GEMINI_KEYS.trim() || BUILTIN_GROQ_KEYS.trim());
let aiSharedKey = false;
let aiProviderUsed = 'gemini';
const geminiAiLabel = () => (aiProviderUsed === 'groq'
  ? 'Groq ' + (groqModelUsed || GROQ_MODELS[0]) + ', model knowledge only - no live search'
  : 'Gemini ' + geminiModelLabel() + (geminiGrounded ? ', Google Search grounded' : ', model knowledge only - no live search')) + (aiSharedKey ? ' (shared free key - may hit daily limit)' : '');
const geminiEndpoint = (m) => 'https://generativelanguage.googleapis.com/v1beta/models/' + m + ':generateContent';
async function geminiPost(apiKey, body) {
  if (Array.isArray(apiKey)) { // built-in shared pool: rotate on dead/maxed keys
    const pool = builtinPools.gemini;
    let lastErr = null;
    for (let k = 0; k < apiKey.length; k++) {
      const ki = (pool.off + k) % apiKey.length;
      try { const r = await geminiPost(apiKey[ki], body); pool.off = ki; return r; }
      catch (err) {
        lastErr = err;
        if (/not accepted|refused|limit reached/i.test(err.message || '')) continue;
        throw err;
      }
    }
    throw lastErr;
  }
  let quotaHit = false, transientHit = false, netFail = false;
  for (const m of GEMINI_MODELS) {
    let res, data;
    try {
      const headers = { 'Content-Type': 'application/json' };
      if (apiKey) headers['x-goog-api-key'] = apiKey.trim();
      else if (AI_PROXY_TOKEN) headers['x-app-token'] = AI_PROXY_TOKEN;
      res = await fetch(apiKey ? geminiEndpoint(m) : AI_PROXY_URL + '/gemini/v1beta/models/' + m + ':generateContent', {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });
      data = await res.json().catch(() => ({}));
    } catch (err) {
      netFail = true;
      continue;
    }
    if (res.ok) { geminiModelUsed = m; return { data, model: m }; }
    const msg = (data && data.error && data.error.message) || ('Gemini API error ' + res.status);
    if (res.status === 400 && /key|api/i.test(msg)) throw new Error('The Gemini key was not accepted. Check the key in AI settings.');
    if (res.status === 403 && /key|permission|referer|restrict|identity/i.test(msg)) throw new Error('The Gemini key was refused. Check the key and its restrictions in AI settings.');
    if (/keys configured|not configured/i.test(msg)) throw new Error('AI provider not configured on the server: ' + msg);
    if (res.status === 429) { quotaHit = true; continue; }
    if (res.status === 503 || res.status === 500 || /high demand|overloaded|try again later/i.test(msg)) { transientHit = true; continue; }
    if (res.status === 404 || /not found|no longer|deprecated|not supported|unavailable|retired/i.test(msg)) continue;
    throw new Error('AI generation failed (' + msg + '). The offline data report still works - try again later.');
  }
  if (quotaHit) throw new Error('Free Gemini limit reached for now on every available model. Try again after the quota resets.');
  if (transientHit) throw new Error('The AI models are busy right now. Wait a minute and try again.');
  if (netFail) throw new Error('No connection to the AI service. Check the internet connection and try again.');
  throw new Error('Live AI is temporarily unavailable. The offline data report still works - try again later.');
}
const API_KEY_STORE = 'hsn-gemini-api-key';
const API_PROVIDER_STORE = 'hsn-ai-provider';
// Visitor's own key always wins over the proxy. If the worker has no keys for a
// job's own provider yet, the other provider covers it (the AI label stays honest).
const ownProvider = () => (V.apiProvider === 'groq' || (V.apiProvider !== 'gemini' && /^gsk_/i.test(V.apiKey.trim())) ? 'groq' : 'gemini');
async function geminiText(apiKey, prompt, opts, grounded) {
  const body = { contents: [{ role: 'user', parts: [{ text: prompt }] }], generationConfig: { temperature: opts.temperature, maxOutputTokens: opts.maxTokens } };
  if (grounded) body.tools = [{ google_search: {} }];
  const { data } = await geminiPost(apiKey, body);
  const cand = data && data.candidates && data.candidates[0];
  return ((cand && cand.content && cand.content.parts) || []).map((pt) => pt.text || '').join('\n');
}
async function groqPost(apiKey, prompt, opts) {
  if (Array.isArray(apiKey)) { // built-in shared pool: rotate on dead/maxed keys
    const pool = builtinPools.groq;
    let lastErr = null;
    for (let k = 0; k < apiKey.length; k++) {
      const ki = (pool.off + k) % apiKey.length;
      try { const r = await groqPost(apiKey[ki], prompt, opts); pool.off = ki; return r; }
      catch (err) {
        lastErr = err;
        if (/not accepted|limit reached/i.test(err.message || '')) continue;
        throw err;
      }
    }
    throw lastErr;
  }
  const headers = { 'Content-Type': 'application/json' };
  if (apiKey) headers.Authorization = 'Bearer ' + apiKey.trim();
  else if (AI_PROXY_TOKEN) headers['x-app-token'] = AI_PROXY_TOKEN;
  const url = apiKey ? 'https://api.groq.com/openai/v1/chat/completions' : AI_PROXY_URL + '/groq/openai/v1/chat/completions';
  let quotaHit = false, transientHit = false, netFail = false;
  for (const m of GROQ_MODELS) {
    let res, data;
    try {
      res = await fetch(url, { method: 'POST', headers, body: JSON.stringify({ model: m, messages: [{ role: 'user', content: prompt }], temperature: opts.temperature, max_tokens: opts.maxTokens }) });
      data = await res.json().catch(() => ({}));
    } catch (err) { netFail = true; continue; }
    if (res.ok) { groqModelUsed = m; return String((((data.choices || [])[0] || {}).message || {}).content || ''); }
    const msg = (data && data.error && data.error.message) || ('Groq API error ' + res.status);
    if (/keys configured|not configured/i.test(msg)) throw new Error('AI provider not configured on the server: ' + msg);
    if (apiKey && res.status === 401) throw new Error('The Groq key was not accepted. Check the key in AI settings.');
    if (res.status === 429 || res.status === 413) { quotaHit = true; continue; }
    if (res.status === 503 || res.status === 500 || /overloaded|try again later/i.test(msg)) { transientHit = true; continue; }
    if (res.status === 404 || /decommissioned|no longer supported|does not exist/i.test(msg)) continue;
    throw new Error('AI generation failed (' + msg + '). The offline data report still works - try again later.');
  }
  if (quotaHit) throw new Error('Free Groq limit reached for now. Try again after the quota resets.');
  if (transientHit) throw new Error('The AI models are busy right now. Wait a minute and try again.');
  if (netFail) throw new Error('No connection to the AI service. Check the internet connection and try again.');
  throw new Error('Live AI is temporarily unavailable. The offline data report still works - try again later.');
}
async function aiPickText(prompt, opts) {
  if (V.apiKey) { aiSharedKey = false; aiProviderUsed = ownProvider(); return aiProviderUsed === 'groq' ? groqPost(V.apiKey, prompt, opts) : geminiText(V.apiKey, prompt, opts, false); }
  if (AI_PROXY_URL) {
    aiSharedKey = false;
    try { aiProviderUsed = 'groq'; return await groqPost('', prompt, opts); }
    catch (err) { if (!/not configured/.test(err.message || '')) throw err; aiProviderUsed = 'gemini'; return geminiText('', prompt, opts, false); }
  }
  const gk = builtinKeys('groq');
  if (gk.length) { aiSharedKey = true; aiProviderUsed = 'groq'; return groqPost(gk, prompt, opts); }
  const mk = builtinKeys('gemini');
  if (mk.length) { aiSharedKey = true; aiProviderUsed = 'gemini'; return geminiText(mk, prompt, opts, false); }
  throw new Error('no-ai');
}
async function aiReportText(prompt, grounded, opts) {
  if (V.apiKey) { aiSharedKey = false; aiProviderUsed = ownProvider(); return aiProviderUsed === 'groq' ? groqPost(V.apiKey, prompt, opts) : geminiText(V.apiKey, prompt, opts, grounded); }
  if (AI_PROXY_URL) {
    aiSharedKey = false;
    try { aiProviderUsed = 'gemini'; return await geminiText('', prompt, opts, grounded); }
    catch (err) { if (!/not configured/.test(err.message || '')) throw err; aiProviderUsed = 'groq'; return groqPost('', prompt, opts); }
  }
  const mk = builtinKeys('gemini');
  if (mk.length) { aiSharedKey = true; aiProviderUsed = 'gemini'; return geminiText(mk, prompt, opts, grounded); }
  const gk = builtinKeys('groq');
  if (gk.length) { aiSharedKey = true; aiProviderUsed = 'groq'; return groqPost(gk, prompt, opts); }
  throw new Error('no-ai');
}

/* ---------- small helpers ---------- */
function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
function gstFor(code) {
  for (const L of [8, 6, 4, 2]) {
    if (code.length >= L) {
      const hit = GST_MAP[code.slice(0, L)];
      if (hit) return hit;
    }
  }
  return GST_MAP['*'] || null;
}

async function decodeData() {
  const bin = Uint8Array.from(atob(DATA_B64), (c) => c.charCodeAt(0));
  const ds = new DecompressionStream('gzip');
  const stream = new Blob([bin]).stream().pipeThrough(ds);
  const buf = await new Response(stream).arrayBuffer();
  return JSON.parse(new TextDecoder().decode(buf));
}

function loadDb(entries) {
  entries.forEach((e) => {
    if (e[0] === 1 && !e[5]) {
      const g = gstFor(e[1]);
      if (g) e[5] = g[1].indexOf('residual') >= 0 || (GST_MAP['*'] && g === GST_MAP['*'] && g[1].indexOf('not specified in Schedule') >= 0) ? 'GST ' + g[0] + ' (residual)' : 'GST ' + g[0];
    }
  });
  const keyToIdx = new Map();
  entries.forEach((e, i) => keyToIdx.set(e[0] + ':' + e[1], i));
  const children = new Map();
  entries.forEach((e, i) => {
    if (e[3]) {
      const p = keyToIdx.get(e[0] + ':' + e[3]);
      if (p !== undefined) { if (!children.has(p)) children.set(p, []); children.get(p).push(i); }
    }
  });
  const chapterTitle = new Map();
  const chapters = [];
  entries.forEach((e, i) => { if (e[0] === 0 && e[1].length === 2) { chapterTitle.set(e[1], pretty(e[2])); chapters.push(i); } });
  chapters.sort((a, b) => (entries[a][1] < entries[b][1] ? -1 : 1));
  const hay = entries.map((e) => (e[1] + ' ' + e[2]).toLowerCase());
  const vocabSet = new Set();
  hay.forEach((h) => h.split(/[^a-z0-9]+/).forEach((w) => { if (w.length >= 4 && w.length <= 14 && /[a-z]/.test(w)) vocabSet.add(w); }));
  const sorted = SYS.map((_, s) =>
    entries.map((e, i) => i).filter((i) => entries[i][0] === s).sort((a, b) => (entries[a][1] < entries[b][1] ? -1 : 1)));
  return { entries, hay, vocab: [...vocabSet], keyToIdx, children, chapterTitle, chapters, sorted };
}

function pretty(desc) {
  const letters = desc.replace(/[^A-Za-z]/g, '');
  if (letters.length > 8 && letters === letters.toUpperCase()) {
    return desc.toLowerCase().replace(/(^|[:(]|-)(\s*[a-z])/g, (m) => m.toUpperCase());
  }
  return desc;
}

function fmtCode(sys, code) {
  if (sys === 2) {
    if (code.length === 10) return code.replace(/(\d{4})(\d{2})(\d{2})(\d{2})/, '$1.$2.$3.$4');
    if (code.length === 8) return code.replace(/(\d{4})(\d{2})(\d{2})/, '$1.$2.$3');
    if (code.length === 6) return code.replace(/(\d{4})(\d{2})/, '$1.$2');
    return code;
  }
  if (sys === 3 && code.length === 8) return code.replace(/(\d{4})(\d{2})(\d{2})/, '$1 $2 $3');
  if (sys === 8) {
    if (code.length === 10) return code.replace(/(\d{4})(\d{2})(\d{2})(\d{2})/, '$1.$2.$3.$4');
    if (code.length === 8) return code.replace(/(\d{4})(\d{2})(\d{2})/, '$1.$2.$3');
    if (code.length === 6) return code.replace(/(\d{4})(\d{2})/, '$1.$2');
    return code;
  }
  if ((sys === 9 || sys === 12) && code.length === 8) return code.replace(/(\d{4})(\d{2})(\d{2})/, '$1.$2.$3');
  if (sys >= 13 && sys <= 15) {
    if (code.length === 10) return code.replace(/(\d{4})(\d{2})(\d{2})(\d{2})/, '$1.$2.$3.$4');
    if (code.length === 8) return code.replace(/(\d{4})(\d{2})(\d{2})/, '$1.$2.$3');
    if (code.length === 6) return code.replace(/(\d{4})(\d{2})/, '$1.$2');
    return code;
  }
  return code;
}

function levelName(code) {
  const n = code.length;
  if (n <= 2) return 'Chapter';
  if (n <= 4) return 'Heading (4-digit)';
  if (n <= 6) return 'Subheading (6-digit international)';
  if (n <= 8) return 'National tariff line (8-digit)';
  return 'Statistical line (10-digit)';
}

function lev1(a, b) {
  const la = a.length, lb = b.length;
  if (Math.abs(la - lb) > 1) return false;
  let i = 0, j = 0, edits = 0;
  while (i < la && j < lb) {
    if (a[i] === b[j]) { i++; j++; continue; }
    edits++;
    if (edits > 1) return false;
    if (la === lb) { i++; j++; }
    else if (la > lb) i++;
    else j++;
  }
  if (i < la || j < lb) edits++;
  return edits <= 1;
}

const SEARCH_CAP = 20000;
const stemForms = (w) => {
  const f = [w];
  if (w.length > 4 && w.endsWith('ies')) f.push(w.slice(0, -3) + 'y');
  if (w.length > 4 && w.endsWith('es')) f.push(w.slice(0, -2));
  if (w.length > 3 && w.endsWith('s') && !w.endsWith('ss')) f.push(w.slice(0, -1));
  return [...new Set(f)];
};
function search(db, descQ, hsnQ, tarQ, sysFilter) {
  const words = descQ.toLowerCase().split(/[^a-z0-9]+/).filter((w) => w.length > 1);
  const hsn = hsnQ.replace(/\D/g, '');
  const tar = tarQ.replace(/\D/g, '');
  const codeOk = (e) =>
    (!hsn || (e[1].startsWith(hsn) && (e[0] === 0 || e[0] === 1))) &&
    (!tar || (e[1].startsWith(tar) && e[0] >= 1));
  const run = (variants) => {
    const out = [];
    for (let i = 0; i < db.entries.length; i++) {
      const e = db.entries[i];
      if (sysFilter >= 0 && e[0] !== sysFilter) continue;
      if (!codeOk(e)) continue;
      if (variants.length) {
        const h = db.hay[i];
        let ok = true;
        for (const vs of variants) {
          let hit = false;
          for (const v of vs) { if (h.includes(v)) { hit = true; break; } }
          if (!hit) { ok = false; break; }
        }
        if (!ok) continue;
      }
      out.push(i);
      if (out.length >= SEARCH_CAP) break;
    }
    return out;
  };
  // Relevance order: exact whole-word (token) matches first, substring-only hits last;
  // ties break to earliest mention, then shallower codes and tighter descriptions.
  const mkTokRes = (ws) => ws.map((w) => new RegExp('(^|[^\\p{L}\\p{N}])(' + stemForms(w).join('|') + ')(s|es)?([^\\p{L}\\p{N}]|$)', 'u'));
  const tokRes = mkTokRes(words);
  const phrase = descQ.toLowerCase().trim().replace(/\s+/g, ' ');
  const rank = (idxs, rWords) => {
    const rw = rWords || words;
    const rRes = rWords ? mkTokRes(rw) : tokRes;
    const keyed = idxs.map((i) => {
      const h = db.hay[i];
      let tok = 0, posSum = 0;
      for (let wi = 0; wi < rw.length; wi++) {
        if (rRes[wi].test(h)) tok++;
        const p = h.indexOf(rw[wi]);
        posSum += p < 0 ? 999 : p;
      }
      const ph = !rWords && words.length > 1 && h.includes(phrase) ? 0 : 1;
      const nec = /\bn\.?e\.?c\b/.test(h) ? 1 : 0;
      const sysR = db.entries[i][0] === 0 ? 0 : 1;
      return [ph, -tok, nec, sysR, posSum, db.entries[i][1].length, h.length, i];
    });
    keyed.sort((a, b) => {
      for (let k = 0; k < 7; k++) { if (a[k] !== b[k]) return a[k] - b[k]; }
      return a[7] - b[7];
    });
    return keyed.map((x) => x[7]);
  };
  const strict = run(words.map((w) => [w]));
  const alias = ALIASES[descQ.toLowerCase().trim().replace(/\s+/g, ' ')];
  if (alias) {
    // Alias word-sets are listed best-first: bucket matches per set to keep
    // that preference, then rank within each bucket.
    const seen = new Set();
    const buckets = alias.map(() => []);
    const rest = [];
    const put = (i) => {
      if (seen.has(i)) return;
      seen.add(i);
      const h = db.hay[i];
      for (let si = 0; si < alias.length; si++) {
        let all = true;
        for (const w of alias[si]) { if (!h.includes(w)) { all = false; break; } }
        if (all) { buckets[si].push(i); return; }
      }
      rest.push(i);
    };
    for (const wordSet of alias) { for (const i of run(wordSet.map((w) => [w]))) put(i); }
    for (const i of strict) put(i);
    return { out: buckets.flatMap((b, si) => rank(b, alias[si])).concat(rank(rest)), fuzzy: false };
  }
  if (strict.length >= 5 || !words.length) return { out: rank(strict), fuzzy: false };
  const longWords = words.filter((w) => w.length >= 5);
  if (longWords.length > 3 || longWords.length !== words.length) return { out: rank(strict), fuzzy: false };
  const variants = words.map((w) => {
    const vs = [w];
    for (const v of db.vocab) { if (Math.abs(v.length - w.length) <= 1 && v[0] === w[0] && lev1(w, v)) vs.push(v); if (vs.length > 12) break; }
    return vs;
  });
  const fz = run(variants);
  return fz.length > strict.length ? { out: rank(fz), fuzzy: true } : { out: rank(strict), fuzzy: false };
}


// One smart box: digits run a code-prefix search across every system,
// words run the description search (aliases + spell-correction).
function smartSearch(db, q, sysFilter) {
  const t = q.trim();
  if (/^\d/.test(t)) {
    const digits = t.replace(/\D/g, '');
    if (!digits) return { out: [], fuzzy: false };
    const out = [];
    for (let i = 0; i < db.entries.length; i++) {
      const e = db.entries[i];
      if (sysFilter >= 0 && e[0] !== sysFilter) continue;
      if (e[1].startsWith(digits)) { out.push(i); if (out.length >= 4000) break; }
    }
    return { out, fuzzy: false };
  }
  return search(db, t, '', '', sysFilter);
}

function familyOf(code) {
  return code.length >= 6 ? 'S' + code.slice(0, 6) : 'H' + code;
}
function groupFamilies(db, idxs) {
  const rep = new Map();
  const order = [];
  const score = (e, anchorLen) => (e[0] === 0 ? 0 : 1000) + Math.abs(e[1].length - anchorLen) * 10 + e[1].length;
  for (const i of idxs) {
    const e = db.entries[i];
    const fk = familyOf(e[1]);
    const anchor = fk.slice(1);
    const wco = db.keyToIdx.get('0:' + anchor);
    if (wco !== undefined) {
      if (!rep.has(fk)) { rep.set(fk, wco); order.push(fk); }
      continue;
    }
    const anchorLen = anchor.length;
    const cur = rep.get(fk);
    if (cur === undefined) { rep.set(fk, i); order.push(fk); continue; }
    if (score(e, anchorLen) < score(db.entries[cur], anchorLen)) rep.set(fk, i);
  }
  return order.map((fk) => rep.get(fk));
}

function chain(db, idx) {
  const out = [];
  let cur = idx;
  let guard = 0;
  while (cur !== undefined && guard++ < 8) {
    out.unshift(cur);
    const par = db.entries[cur][3];
    cur = par ? db.keyToIdx.get(db.entries[cur][0] + ':' + par) : undefined;
  }
  return out;
}

function prefixRange(db, sys, prefix) {
  const arr = db.sorted[sys];
  let lo = 0, hi = arr.length;
  while (lo < hi) { const m = (lo + hi) >> 1; if (db.entries[arr[m]][1] < prefix) lo = m + 1; else hi = m; }
  const out = [];
  for (let i = lo; i < arr.length && db.entries[arr[i]][1].startsWith(prefix); i++) out.push(arr[i]);
  return out;
}

function linkage(db, e) {
  const base6 = e[1].length >= 6 ? e[1].slice(0, 6) : e[1];
  return SYS.map((_, s) => {
    const target = s === e[0] ? e[1] : base6;
    const chainIdx = [];
    for (const L of [2, 4, 6, 8]) {
      if (L > target.length) break;
      const j = db.keyToIdx.get(s + ':' + target.slice(0, L));
      if (j !== undefined) chainIdx.push(j);
    }
    const ext = prefixRange(db, s, target).filter((i) => db.entries[i][1].length > target.length);
    return { sys: s, target, chainIdx, selfExists: db.keyToIdx.has(s + ':' + target), extCount: ext.length, extSample: ext.slice(0, 8) };
  });
}

/* ---------- persistent state ---------- */
function loadKeys(k) { try { return JSON.parse(localStorage.getItem(k) || '[]'); } catch { return []; } }
function saveJson(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* ignore */ } }

const S = {
  db: null, err: null,
  sel: null, cmpA: null, cmpB: null, showList: false,
  favs: loadKeys('hsn-favs'),
  recent: loadKeys('hsn-recent'),
  shortlist: loadKeys('hsn-shortlist'),
  notes: (() => { try { return JSON.parse(localStorage.getItem('hsn-notes') || '{}'); } catch { return {}; } })(),
  changes: [],
  clientMode: false,
};
const V = { // per-view ephemeral state
  q: '', sysFilter: -1, browse: false, sanQ: '',
  cmpQ: '',
  clsQ: '', clsBusy: false, clsErr: null, clsHits: null, clsOffline: null,
  dIdx: null, needKey: false, busy: false, settingsOpen: false, briefError: null, copied: false,
  apiKey: (() => { try { return localStorage.getItem(API_KEY_STORE) || ''; } catch { return ''; } })(),
  apiProvider: (() => { try { return localStorage.getItem(API_PROVIDER_STORE) || ''; } catch { return ''; } })(),
  ccy: {}, // sys -> info | 'err'
};

function el(id) { return document.getElementById(id); }
function sysTagHtml(s) { return '<span class="sys-tag sys-' + s + '">' + SYS[s].tag + '</span>'; }
function codeBtn(i, cls) {
  const e = S.db.entries[i];
  return '<button class="' + (cls || 'crumb') + '" data-open="' + i + '" title="' + esc(pretty(e[2])) + '">' + esc(fmtCode(e[0], e[1])) + '</button>';
}
function bindOpens(scope) {
  Array.prototype.forEach.call(scope.querySelectorAll('[data-open]'), function (b) {
    b.addEventListener('click', function () { openEntry(parseInt(b.getAttribute('data-open'), 10)); });
  });
}

function fmtUsd(v) {
  if (v >= 1e9) return '$' + (v / 1e9).toFixed(1) + 'B';
  if (v >= 1e6) return '$' + (v / 1e6).toFixed(1) + 'M';
  if (v >= 1e3) return '$' + Math.round(v / 1e3) + 'k';
  return '$' + Math.round(v);
}

/* ---------- change alerts ---------- */
function checkChanges(db, keys) {
  let w = null;
  try { w = JSON.parse(localStorage.getItem('hsn-watch-v1') || 'null'); } catch { w = null; }
  const snap = w && w.snap ? w.snap : {};
  const hits = [];
  if (w && w.build === DATA_BUILD) return hits;
  if (w) {
    keys.forEach((k) => {
      const old2 = snap[k];
      if (!old2) return;
      const i = db.keyToIdx.get(k);
      if (i === undefined) { hits.push({ key: k, kind: 'removed', oldDesc: old2[0], oldDuty: old2[1] }); return; }
      const e = db.entries[i];
      if (pretty(e[2]) !== old2[0] || (e[5] || '') !== old2[1]) hits.push({ key: k, kind: 'changed', oldDesc: old2[0], oldDuty: old2[1] });
    });
  }
  const next = {};
  keys.forEach((k) => { const i = db.keyToIdx.get(k); if (i !== undefined) { const e = db.entries[i]; next[k] = [pretty(e[2]), e[5] || '']; } });
  try { localStorage.setItem('hsn-watch-v1', JSON.stringify({ build: DATA_BUILD, snap: next })); } catch { /* ignore */ }
  return w ? hits : [];
}

/* ---------- detail ---------- */
function gstRowHtml(code) {
  const g = gstFor(code);
  if (!g) return '<div><dt>GST rate</dt><dd>Not found in the GST 2.0 rate schedules - check the official CBIC repository: <a href="https://taxinformation.cbic.gov.in/" target="_blank" rel="noreferrer">taxinformation.cbic.gov.in</a></dd></div>';
  const residual = g[1].indexOf('not specified in Schedule') >= 0;
  return '<div><dt>GST rate (IGST)</dt><dd><strong>' + esc(g[0]) + '</strong>' + (residual ? ' - residual rate for goods not specified in the GST 2.0 rate schedules' : '') + ' - ' + esc(g[1].length > 110 ? g[1].slice(0, 110) + '...' : g[1]) + ' <span class="muted">From Notification 9/2025-Integrated Tax (Rate), 17 Sep 2025. Exempt goods are on a separate list - <a href="https://cbic-gst.gov.in/gst-goods-services-rates.html" target="_blank" rel="noreferrer">verify on CBIC</a>.</span></dd></div>';
}

function linkPanelHtml(e, idx) {
  const groups = linkage(S.db, e);
  let body = '';
  groups.forEach((g) => {
    if (!g.selfExists && g.extCount === 0 && g.chainIdx.length === 0) return;
    body += '<div class="link-group' + (g.sys === e[0] ? ' own' : '') + '">' +
      '<div class="link-group-head">' + sysTagHtml(g.sys) + '<span class="lg-name">' + esc(SYS[g.sys].name) + '</span></div>' +
      '<div class="crumbs">' +
      g.chainIdx.map((ci, k) => '<span class="crumb-wrap">' + (k > 0 ? '<span class="crumb-sep">&rsaquo;</span>' : '') + codeBtn(ci, 'crumb' + (ci === idx ? ' here' : '')) + '</span>').join('') +
      (!g.selfExists && g.chainIdx.length > 0 ? '<span class="muted"> (no exact ' + esc(g.target) + ' line in this system)</span>' : '') +
      '</div>' +
      (g.extCount > 0 ? '<div class="ext-row"><span class="muted">' + g.extCount + ' deeper line' + (g.extCount === 1 ? '' : 's') + ': </span>' +
        g.extSample.map((i) => codeBtn(i)).join('') +
        (g.extCount > g.extSample.length ? '<span class="muted"> +' + (g.extCount - g.extSample.length) + ' more</span>' : '') + '</div>' : '') +
      '</div>';
  });
  return '<div class="detail-sec link-panel"><h3>Worldwide code linkage - international to national to domestic</h3>' +
    '<p class="muted">The same product across every system in this finder. Tap any code to open it.</p>' + body + '</div>';
}

function dutyCompareHtml(e) {
  const groups = linkage(S.db, e);
  const rows = groups.map((g) => {
    const exact = S.db.keyToIdx.get(g.sys + ':' + g.target);
    const exts = [...g.extSample].sort((a, b) => S.db.entries[b][1].length - S.db.entries[a][1].length);
    let pick = null;
    if (exact !== undefined && S.db.entries[exact][5]) pick = exact;
    else { for (const i2 of exts) { if (S.db.entries[i2][5]) { pick = i2; break; } } }
    if (pick === null) pick = exact !== undefined ? exact : (exts.length ? exts[0] : null);
    return { sys: g.sys, pick, deeper: g.extCount };
  }).filter((r) => r.pick !== null);
  if (rows.length < 2) return '';
  const withDuty = rows.filter((r) => S.db.entries[r.pick][5]).length;
  return '<div class="detail-sec duty-panel"><h3>Compare everywhere - this product across all ' + SYS.length + ' systems</h3>' +
    '<p class="muted">Matched code, description, level, duty and sub-lines per system. ' + withDuty + ' of ' + rows.length + ' publish an open general (MFN) rate here; preferential/FTA rates excluded. Rates change - verify on the official portal before filing.</p>' +
    '<div class="cmp-all-grid">' + rows.map((r) => {
      const x = S.db.entries[r.pick];
      const kids = (S.db.children.get(r.pick) || []).length;
      return '<button class="cmp-card' + (r.sys === e[0] ? ' own' : '') + '" data-open="' + r.pick + '">' +
        '<div class="cmp-card-head">' + sysTagHtml(r.sys) + '<span class="duty-val' + (x[5] ? '' : ' none') + '">' + esc(x[5] || 'No open rate') + '</span></div>' +
        '<div class="rcode cmp-card-code">' + esc(fmtCode(r.sys, x[1])) + '</div>' +
        '<div class="cmp-card-desc">' + esc(pretty(x[2])) + '</div>' +
        '<div class="cmp-card-meta muted">' + esc(levelName(x[1])) + (kids ? ' - ' + kids + ' sub-line' + (kids === 1 ? '' : 's') : (r.deeper ? ' - ' + r.deeper + ' deeper line' + (r.deeper === 1 ? '' : 's') : '')) + '</div>' +
        '</button>';
    }).join('') + '</div></div>';
}


function scometKids(code) { return Object.keys(SCOMET).filter((k) => k.startsWith(code)); }
function scometFlagHtml(e) {
  if (e[0] !== 1) return '';
  const sc = SCOMET[e[1]];
  const note = '<p class="muted">From DGFT\'s own Appendix-3 code mapping. Most of the SCOMET list is description-based with no tariff-code mapping - no flag here does not clear an item; check the full official list.</p>';
  if (sc) {
    return '<div class="detail-sec alert-banner scomet-flag"><strong>Export controlled - SCOMET entry ' + esc(sc[0]) + '</strong>' + (sc[1] ? ' (' + esc(sc[1]) + ')' : '') +
      '. Exporting this item from India needs a DGFT export authorisation (CWC Schedule chemicals list). <a href="https://www.dgft.gov.in/CP/?opt=scomet" target="_blank" rel="noreferrer">Verify on DGFT SCOMET</a>.' + note + '</div>';
  }
  if (e[1].length >= 6) {
    const kids = scometKids(e[1]);
    if (kids.length) {
      return '<div class="detail-sec alert-banner scomet-flag"><strong>SCOMET-controlled tariff line' + (kids.length > 1 ? 's' : '') + ' under this code</strong>: ' +
        kids.map((k) => 'entry ' + esc(SCOMET[k][0]) + ' (ITC(HS) ' + esc(k) + ')').join(', ') +
        '. Export of those items from India needs a DGFT export authorisation. <a href="https://www.dgft.gov.in/CP/?opt=scomet" target="_blank" rel="noreferrer">Verify on DGFT SCOMET</a>.' + note + '</div>';
    }
  }
  return '';
}

const PORTAL_LINKS = [
  [{ label: 'UN Comtrade Plus', url: 'https://comtradeplus.un.org/' }],
  [{ label: 'ICEGATE duty calculator', url: 'https://www.icegate.gov.in/services/custom-duty-calculator' }, { label: 'CBIC GST rates', url: 'https://cbic-gst.gov.in/gst-goods-services-rates.html' }, { label: 'DGFT', url: 'https://www.dgft.gov.in/' }, { label: 'DGFT SCOMET export controls', url: 'https://www.dgft.gov.in/CP/?opt=scomet' }],
  [{ label: 'USITC HTS search', url: 'https://hts.usitc.gov/' }],
  [{ label: 'EU TARIC consultation', url: 'https://ec.europa.eu/taxation_customs/dds2/taric/taric_consultation.jsp?Lang=en' }],
  [{ label: 'UK Trade Tariff', url: 'https://www.gov.uk/trade-tariff' }],
  [{ label: 'Korea Customs', url: 'https://www.customs.go.kr/english/main.do' }],
  [{ label: 'CBSA tariff', url: 'https://www.cbsa-asfc.gc.ca/trade-commerce/tariff-tarif/menu-eng.html' }],
  [{ label: 'Japan Customs tariff', url: 'https://www.customs.go.jp/english/tariff/index.htm' }],
  [{ label: 'ABF tariff', url: 'https://www.abf.gov.au/importing-exporting-and-manufacturing/tariff-classification/current-tariff' }],
  [{ label: 'Siscomex (Brazil)', url: 'https://www.gov.br/siscomex/pt-br/informacoes/importacao/tarifa' }],
  [{ label: 'Taiwan Customs portal', url: 'https://portal.sw.nat.gov.tw/PGAE00' }],
  [{ label: 'NZ Customs tariff', url: 'https://www.customs.govt.nz/business/tariffs/' }],
  [{ label: 'Tolltariffen (Norway)', url: 'https://www.toll.no/en/corporate/import/customs-tariff/' }],
  [{ label: 'Singapore Customs HS', url: 'https://www.customs.gov.sg/businesses/harmonized-system-hs-classification-of-goods/' }],
  [{ label: 'Israel Tax Authority', url: 'https://www.gov.il/en/departments/israel_tax_authority/govil-landing-page' }],
  [{ label: 'Mexico LIGIE', url: 'https://www.snice.gob.mx/cs/avi/snice/ligie.info22.html' }],
];
function portalRowHtml(sys) {
  const links = PORTAL_LINKS[sys] || [];
  if (!links.length) return '';
  return '<div class="detail-sec portal-row"><h3>Verify live on official portals</h3><div class="crumbs">' +
    links.map((l) => '<a class="crumb" href="' + l.url + '" target="_blank" rel="noreferrer">' + esc(l.label) + '</a>').join('') +
    '</div></div>';
}

const SYS_CCY = [null, 'INR', 'USD', 'EUR', 'GBP', 'KRW', 'CAD', 'JPY', 'AUD', 'BRL', 'TWD', 'NZD', 'NOK', 'SGD', 'ILS', 'MXN'];

function currencySlotHtml(sys) {
  const ccy = SYS_CCY[sys];
  if (!ccy || ccy === 'USD') return '';
  const info = V.ccy[sys];
  if (!info) return '<div class="detail-sec ccy-card" id="ccy-card"><h3>Currency trend - ' + ccy + ' vs USD</h3><p class="muted">Loading live rates...</p></div>';
  if (info === 'err') return '';
  const pct = (a, b) => ((a - b) / b) * 100;
  const p30 = pct(info.cur, info.m);
  const p365 = pct(info.cur, info.y);
  const trend = Math.abs(p30) < 0.5 ? 'flat' : p30 > 0 ? 'weakening' : 'strengthening';
  return '<div class="detail-sec ccy-card" id="ccy-card"><h3>Currency trend - ' + ccy + ' vs USD</h3>' +
    '<p>1 USD = <strong>' + info.cur.toFixed(2) + ' ' + ccy + '</strong> on ' + esc(info.date) + '. Last 30 days: ' + (p30 >= 0 ? '+' : '') + p30.toFixed(1) + '%. Last year: ' + (p365 >= 0 ? '+' : '') + p365.toFixed(1) + '%. The ' + ccy + ' is ' + trend + ' against the US dollar' + (trend === 'weakening' ? ' - goods priced in USD are getting costlier in ' + ccy : trend === 'strengthening' ? ' - goods priced in USD are getting cheaper in ' + ccy : '') + '.</p>' +
    '<p class="muted">Live ECB reference rates via the free Frankfurter API, fetched in your browser when this page opens - not baked into the dataset. Rates are indicative, not settlement rates.</p></div>';
}
function fetchCurrency(sys, onDone) {
  const ccy = SYS_CCY[sys];
  if (!ccy || ccy === 'USD') return;
  if (V.ccy[sys]) { onDone(); return; }
  if (typeof fetch !== 'function') { V.ccy[sys] = 'err'; onDone(); return; }
  const now = new Date();
  const fmt = (d) => d.toISOString().slice(0, 10);
  const start = new Date(now.getTime() - 400 * 864e5);
  fetch('https://api.frankfurter.dev/v1/' + fmt(start) + '..' + fmt(now) + '?from=USD&to=' + ccy)
    .then((r) => { if (!r.ok) throw new Error('http ' + r.status); return r.json(); })
    .then((j) => {
      const rates = j.rates || {};
      const days = Object.keys(rates).sort();
      if (!days.length) { V.ccy[sys] = 'err'; onDone(); return; }
      const last = days[days.length - 1];
      const pick = (ago) => {
        const t = fmt(new Date(now.getTime() - ago * 864e5));
        let best = days[0];
        for (const d of days) { if (d <= t) best = d; else break; }
        return rates[best][ccy];
      };
      V.ccy[sys] = { cur: rates[last][ccy], m: pick(30), y: pick(365), date: last };
      onDone();
    })
    .catch(() => { V.ccy[sys] = 'err'; onDone(); });
}

function tradeCardHtml(chapter, code) {
  const t = TRADE_CH[chapter];
  const c6 = code ? code.slice(0, 6) : '';
  const t6 = c6 ? TRADE6[c6] : null;
  if ((!t || (!t[0] && !t[1])) && !t6) return '';
  return '<div class="detail-sec currency-card"><h3>India trade - ' + TRADE_YEAR + '</h3>' +
    (t6 ? '<p>This product, HS ' + esc(c6) + ': imports <strong>' + fmtUsd(t6[0]) + '</strong> - exports <strong>' + fmtUsd(t6[1]) + '</strong></p>' : '') +
    (t && (t[0] || t[1]) ? '<p>Whole chapter ' + esc(chapter) + ': imports <strong>' + fmtUsd(t[0]) + '</strong> - exports <strong>' + fmtUsd(t[1]) + '</strong>' + (t[1] > t[0] ? ' - India is a net exporter here.' : t[0] > t[1] * 3 ? ' - India relies heavily on imports here.' : '') + '</p>' : '') +
    '<p class="muted">UN Comtrade annual data (reporter: India, partner: world), USD, imports at CIF. Product line is 6-digit HS level; chapter line covers all products under chapter ' + esc(chapter) + '. Baked into the dataset, not fetched live.</p></div>';
}


/* ---------- 14-section template report (print to PDF) ---------- */
const TPL_SECTIONS = [
  ['01', 'Fundamentals'], ['01A', 'Features and trade-offs'], ['02', 'Manufacturing and distribution'],
  ['03', 'Global market, pricing and shortages'], ['04', 'Buyers and sellers by country'],
  ['05', 'India market and opportunities'], ['06', 'Geopolitics and supply-chain risks'],
  ['07', 'Technical uses'], ['08', 'Safety, storage and regulation'], ['09', 'Summary'],
  ['10', 'Impact'], ['11', 'Geopolitics'], ['12', 'Financial way'], ['13', 'Advantage'], ['14', 'Change'],
  ['15', 'Documents and compliance'], ['16', 'Logistics and Incoterms'], ['17', 'Policy changes and news'],
];
const TPL_PAGE_H = 994; // A4 content px per printed page with the @page margins below

function tplDutyRows(db, e) {
  const groups = linkage(db, e);
  return groups.map((g) => {
    const exact = db.keyToIdx.get(g.sys + ':' + g.target);
    const exts = [...g.extSample].sort((a, b) => db.entries[b][1].length - db.entries[a][1].length);
    let pick = null;
    if (exact !== undefined && db.entries[exact][5]) pick = exact;
    else { for (const i2 of exts) { if (db.entries[i2][5]) { pick = i2; break; } } }
    if (pick === null) pick = exact !== undefined ? exact : (exts.length ? exts[0] : null);
    return pick === null ? null : { sys: g.sys, e: db.entries[pick] };
  }).filter((r) => r !== null);
}

async function tplNarrative(db, idx, apiKey) {
  const e = db.entries[idx];
  const prompt = 'Write the narrative sections for a professional product research report on this exact tariff product.\n' +
    'Product: ' + pretty(e[2]) + '\n' +
    'Classification: ' + SYS[e[0]].name + ' code ' + fmtCode(e[0], e[1]) + ', chapter ' + e[4] + ' - ' + (db.chapterTitle.get(e[4]) || '') + '\n' +
    'Use Google Search for current facts. Rules: plain simple English, short sentences, readable on a phone. Never invent a number, price, company role, regulation or statistic; rough ranges and qualitative judgements are fine when labelled approximate. Where product-specific data is unavailable, say so plainly and give clearly labelled general chapter-level context instead. Be specific to THIS product: name real grades, hubs, ports, companies and rules; no filler that could fit any product. Do not use markdown or headings.\n' +
    'Tables: inside sections that compare or list facts, add ONE compact pipe table within that section\'s string, on its own lines: a header line like \'| Column | Column |\' then 3 to 6 row lines, cells separated by \'|\', 2 to 4 columns, no separator dashes line. Good spots: sec03 (exporter/importer countries with rough shares), sec04 (company | country | role), sec07 (industry | what it uses this product for), sec08 (hazard or rule | requirement), sec12 (cost item | typical range | note), sec13 (advantage | why it matters), sec16 (option | when to use it | note).\n' +
    'Return ONLY a JSON object, no code fences, with exactly these keys. Every key except sec15 maps to one string of 2 to 4 short paragraphs (paragraphs separated by a blank line). sec15 maps to one string of newline-separated checklist lines, each line formatted as "Document name - issuing authority - why it is needed for this product":\n' +
    '{"sec01a":"product features and trade-offs - be concrete: physical forms, grades, quality markers, substitutes","sec02":"manufacturing and distribution - typical production process, input materials, manufacturing hubs, distribution channels","sec03":"global market, pricing and shortages - market size direction, price drivers, major exporting and importing countries, current shortages or gluts","sec04":"notable verified producer and buyer companies by country, only with evidence - if none verified, say data unavailable","sec05":"India market and realistic opportunities - demand pockets, buyer types, realistic entry routes for an Indian trader","sec06":"geopolitics and supply-chain risks - concentration risks, trade tensions, logistics chokepoints affecting this product","sec07":"technical uses by industry - which industries consume it and for what","sec08":"safety, storage and regulation - handling, shelf life, transport hazards, product-specific rules","sec09":"overall summary","sec10":"impact of trade in this product","sec11":"geopolitics deep view","sec12":"financial considerations - working capital, payment terms, price volatility, margin structure","sec13":"competitive advantages","sec14":"what is changing and the outlook","sec15":"export-import document checklist for trading this product to or from India","sec16":"logistics, packing and Incoterms guidance - typical packing, container or shipping mode, insurance notes, which Incoterms suit this trade and why","sec17":"recent policy changes and news from the last 12 months affecting this product - tariff changes, bans, new rules, with dates"}';
  // Grounded (Google Search) first; free-tier keys often have no grounding quota (429),
  // so fall back to a plain model-knowledge call rather than failing the whole report.
  const plainPrompt = prompt.replace('Use Google Search for current facts.', 'Use your built-in knowledge of this product, its industry and trade.');
  for (const grounded of [true, false]) {
    let text;
    try { text = await aiReportText(grounded ? prompt : plainPrompt, grounded, { temperature: 0.2, maxTokens: 16000 }); }
    catch (err) { if (grounded) continue; throw err; }
    const a = text.indexOf('{'), b = text.lastIndexOf('}');
    if (a < 0 || b <= a) continue;
    try {
      const obj = JSON.parse(text.slice(a, b + 1));
      if (obj && typeof obj === 'object') { geminiGrounded = grounded && aiProviderUsed === 'gemini'; return obj; }
    } catch { /* try the next attempt */ }
  }
  return null;
}

function tplTag(kind) {
  if (kind === 'fact') return '<span class="tpl-tag fact">VERIFIED FACT</span>';
  if (kind === 'ai') return '<span class="tpl-tag judge">ANALYTICAL JUDGMENT - AI-assisted (' + geminiAiLabel() + ') - verify independently</span>';
  return '<span class="tpl-tag judge">ANALYTICAL JUDGMENT - general chapter-level context</span>';
}
function tplTableFromLines(lines) {
  const rows = lines.map((l) => l.replace(/^\|/, '').replace(/\|$/, '').split('|').map((c) => c.trim()))
    .filter((cells) => !cells.every((c) => /^[\s:\-]*$/.test(c)));
  if (!rows.length) return '';
  const head = rows[0], body = rows.slice(1);
  return '<table class="tpl-table"><thead><tr>' + head.map((c) => '<th>' + esc(c) + '</th>').join('') + '</tr></thead>' +
    (body.length ? '<tbody>' + body.map((r) => '<tr>' + r.map((c) => '<td>' + esc(c) + '</td>').join('') + '</tr>').join('') + '</tbody>' : '') + '</table>';
}
function tplParas(s) {
  // AI sections may carry compact pipe tables (header line then rows, cells split by '|').
  // Consecutive pipe lines become a real table; everything else stays paragraphs.
  const out = [];
  let para = [], tbl = [];
  const flushP = () => { if (para.length) { out.push('<p>' + esc(para.join(' ')) + '</p>'); para = []; } };
  const flushT = () => { if (tbl.length) { out.push(tplTableFromLines(tbl)); tbl = []; } };
  for (const raw of String(s || '').split(/\n+/)) {
    const line = raw.trim();
    if (!line) { flushT(); flushP(); continue; }
    if (line.charAt(0) === '|') { flushP(); tbl.push(line); }
    else { flushT(); para.push(line); }
  }
  flushT(); flushP();
  return out.join('');
}
function tplNarr(narr, key) {
  return narr && typeof narr[key] === 'string' && narr[key].trim() ? tplTag('ai') + tplParas(narr[key]) : '';
}
function tplDocTable(s) {
  // "Document - issuing authority - why needed" lines become a 3-column table; fall back to the bullet list.
  const lines = String(s || '').split(/\n+/).map((l) => l.trim()).filter((l) => l.length > 3);
  const rows = lines.map((l) => l.replace(/^[-*•\d.)\s]+/, '')).map((l) => {
    const parts = l.split(/\s+-\s+/);
    return parts.length >= 3 ? [parts[0], parts[1], parts.slice(2).join(' - ')] : null;
  }).filter(Boolean);
  if (rows.length < 2) return tplCheck(s);
  return '<table class="tpl-table"><thead><tr><th>Document</th><th>Issuing authority</th><th>Why it is needed</th></tr></thead><tbody>' +
    rows.map((r) => '<tr><td>' + esc(r[0]) + '</td><td>' + esc(r[1]) + '</td><td>' + esc(r[2]) + '</td></tr>').join('') + '</tbody></table>';
}
function tplCheck(s) {
  const items = String(s || '').split(/\n+/).map((l) => l.trim()).filter((l) => l.length > 3 && /[a-zA-Z]/.test(l));
  if (!items.length) return '';
  return '<ul class="tpl-check">' + items.map((l) => '<li>' + esc(l.replace(/^[-*•\d.\)\s]+/, '')) + '</li>').join('') + '</ul>';
}
function tplBars(rows, unit) {
  const max = Math.max.apply(null, rows.map((r) => r[1]).concat([1]));
  const w = 660, bh = 22, gap = 10, lw = 190;
  const h = rows.length * (bh + gap) + 6;
  let svg = '<svg viewBox="0 0 ' + w + ' ' + h + '" width="100%" role="img">';
  rows.forEach((r, i) => {
    const y = 3 + i * (bh + gap);
    const bw = Math.max(2, Math.round((w - lw - 120) * r[1] / max));
    svg += '<text x="0" y="' + (y + 15) + '" font-size="12" fill="#444" font-family="-apple-system,Arial,sans-serif">' + esc(r[0]) + '</text>' +
      '<rect x="' + lw + '" y="' + y + '" width="' + bw + '" height="' + bh + '" rx="3" fill="' + (r[3] || '#8a7b5c') + '"></rect>' +
      '<text x="' + (lw + bw + 6) + '" y="' + (y + 15) + '" font-size="12" font-weight="600" fill="#1c1c1e" font-family="-apple-system,Arial,sans-serif">' + esc(r[2]) + '</text>';
  });
  return '<div class="tpl-chart">' + svg + '</svg><p class="cap">' + esc(unit) + '</p></div>';
}
function tplDutyChart(rated) {
  const rows = [];
  for (const r of rated) {
    const d = String(r.e[5] || '');
    let v = null;
    if (/^free|^0\s*%/i.test(d.trim())) v = 0;
    else { const m = d.match(/(\d+(?:\.\d+)?)\s*%/); if (m) v = parseFloat(m[1]); }
    if (v === null) continue;
    rows.push([SYS[r.e[0]].tag, v, v + '%', v === 0 ? '#4d8f5a' : '#a4703d']);
  }
  if (rows.length < 2) return '';
  return '<div class="tpl-keep">' + '<h3>Duty comparison across systems ' + tplTag('fact') + '</h3>' + tplBars(rows.slice(0, 12), 'General / MFN duty rate where the official source publishes an open figure. Preferential and FTA rates not shown.') + '</div>';
}
function tplTradeChart(trade6, trade, code6) {
  const rows = [];
  if (trade6) { rows.push(['HS ' + code6 + ' imports', trade6[0], fmtUsd(trade6[0]), '#4a5a8a']); rows.push(['HS ' + code6 + ' exports', trade6[1], fmtUsd(trade6[1]), '#8a7b5c']); }
  if (trade) { rows.push(['Chapter imports', trade[0], fmtUsd(trade[0]), '#4a5a8a']); rows.push(['Chapter exports', trade[1], fmtUsd(trade[1]), '#8a7b5c']); }
  if (rows.length < 2) return '';
  return '<div class="tpl-keep">' + '<h3>India trade at a glance ' + tplTag('fact') + '</h3>' + tplBars(rows, 'UN Comtrade annual data, reporter India, partner World, calendar ' + TRADE_YEAR + ' (baked into this file). Imports CIF, USD.') + '</div>';
}
function tplKpis(e, g, trade6, trade, rated) {
  const chips = [];
  if (e[0] === 1 && g) chips.push(['India IGST', g[0], 'GST 2.0, Notif. 9/2025-IT(R)']);
  else if (e[5]) chips.push(['Duty - ' + SYS[e[0]].tag, e[5], 'General / MFN']);
  if (trade6) chips.push(['Imports ' + TRADE_YEAR, fmtUsd(trade6[0]), 'CIF, USD, Comtrade']);
  if (trade6) chips.push(['Exports ' + TRADE_YEAR, fmtUsd(trade6[1]), 'USD, Comtrade']);
  if (trade6) chips.push(['Balance', trade6[1] >= trade6[0] ? 'Net exporter' : 'Net importer', 'HS ' + e[1].slice(0, 6) + ' level']);
  chips.push(['Systems', String(rated.length) + ' with open rates', 'of ' + SYS.length + ' official']);
  return '<div class="tpl-kpis">' + chips.map((c) => '<div class="tpl-kpi"><div class="k">' + esc(c[0]) + '</div><div class="v">' + esc(c[1]) + '</div><div class="s">' + esc(c[2]) + '</div></div>').join('') + '</div>';
}
function tplFallback(topic, chTitle) {
  return tplTag('general') + '<p>General chapter-level context only - this file carries no product-specific ' + esc(topic) + ' data for this code. Chapter context: ' + esc(chTitle || 'this chapter') + '.</p>' +
    '<p>For a full AI-written ' + esc(topic) + ' analysis of this exact product, add a free Gemini key (AI settings on the code page) and regenerate this report.</p>';
}
function tplSrc(items) {
  return '<p class="tpl-src">Sources: ' + items.map((it) => it.u ? '<a href="' + it.u + '" target="_blank" rel="noreferrer">' + esc(it.t) + '</a>' : esc(it.t)).join(' - ') + '</p>';
}

function buildTemplateReport(db, idx, narrative, opts) {
  opts = opts || {};
  const e = db.entries[idx];
  const chTitle = db.chapterTitle.get(e[4]) || '';
  const prod = pretty(e[2]);
  const _now = new Date(); const today = _now.getFullYear() + '-' + String(_now.getMonth() + 1).padStart(2, '0') + '-' + String(_now.getDate()).padStart(2, '0');
  const path = chain(db, idx).map((i) => ({ sys: db.entries[i][0], code: db.entries[i][1], desc: db.entries[i][2] }));
  const dutyRows = tplDutyRows(db, e);
  const g = e[0] === 1 ? gstFor(e[1]) : null;
  const trade = TRADE_CH[e[4]];
  const trade6 = TRADE6[e[1].slice(0, 6)];
  const scomet = e[0] === 1 ? SCOMET[e[1]] : null;
  const scometUnder = (!scomet && e[0] === 1 && e[1].length >= 6) ? scometKids(e[1]) : [];
  const rated = dutyRows.filter((r) => r.e[5]);
  const aiUsed = !!narrative;
  const has = (k) => !!(narrative && typeof narrative[k] === 'string' && narrative[k].trim());

  const factTable = (rows) => '<table class="tpl-table"><tbody>' + rows.map((r) => '<tr><th>' + esc(r[0]) + '</th><td>' + r[1] + '</td></tr>').join('') + '</tbody></table>';
  const escA = (s) => esc(s);

  let secs = '';
  // 01 Fundamentals
  secs += '<section class="tpl-sec"><h2><span class="tpl-num">01</span> Fundamentals ' + tplTag('fact') + '</h2>' +
    factTable([
      ['Product', escA(prod)],
      ['System', escA(SYS[e[0]].name)],
      ['Code', escA(fmtCode(e[0], e[1]))],
      ['Level', escA(levelName(e[1]))],
      ['Chapter', escA(e[4] + (chTitle ? ' - ' + chTitle : ''))],
      ['Classification path', path.map((pt) => escA(SYS[pt.sys].tag + ' ' + fmtCode(pt.sys, pt.code) + ' - ' + pretty(pt.desc))).join('<br>')],
    ]) +
    (e[0] === 1 ? '<h3>India GST</h3>' + factTable([['IGST rate', g ? '<strong>' + escA(g[0]) + '</strong> - ' + escA(g[1]) : 'Not found in the GST 2.0 rate schedules - check CBIC.'], ['Legal basis', 'Notification No. 9/2025-Integrated Tax (Rate), 17 Sep 2025 (GST 2.0)']]) : '') +
    (e[5] && e[0] !== 1 ? factTable([['Dataset duty / rate', escA(e[5]) + ' (general/MFN, preferential rates excluded)']]) : '') +
    tplSrc([{ t: SYS[e[0]].src, u: SYS[e[0]].url }].concat(e[0] === 1 ? [{ t: 'CBIC GST rates', u: 'https://cbic-gst.gov.in/gst-goods-services-rates.html' }] : []) , ) +
    '</section>';
  // 01A
  const kids = db.children.get(idx) || [];
  const rel = kids.slice(0, 8).map((i) => db.entries[i]);
  secs += '<section class="tpl-sec"><h2><span class="tpl-num">01A</span> Features and trade-offs</h2>' +
    (has('sec01a') ? tplNarr(narrative, 'sec01a') : tplFallback('features and trade-offs', chTitle)) +
    (rel.length ? '<h3>Classification alternatives under this code ' + tplTag('fact') + '</h3><table class="tpl-table"><thead><tr><th>Code</th><th>Description</th><th>Duty / rate</th></tr></thead><tbody>' +
      rel.map((x) => '<tr><td>' + escA(fmtCode(x[0], x[1])) + '</td><td>' + escA(pretty(x[2])) + '</td><td>' + escA(x[5] || 'No open rate') + '</td></tr>').join('') + '</tbody></table>' +
      tplSrc([{ t: SYS[e[0]].src, u: SYS[e[0]].url }]) : '') +
    '</section>';
  // 02
  secs += '<section class="tpl-sec"><h2><span class="tpl-num">02</span> Manufacturing and distribution</h2>' + (has('sec02') ? tplNarr(narrative, 'sec02') : tplFallback('manufacturing and distribution', chTitle)) +
    tplSrc([{ t: aiUsed && has('sec02') ? 'AI analysis (' + geminiAiLabel() + '), generated ' + today : 'No section-specific source - general context' }]) + '</section>';
  // 03
  secs += '<section class="tpl-sec"><h2><span class="tpl-num">03</span> Global market, pricing and shortages</h2>' +
    '<h3>Duty / rate for this product across ' + SYS.length + ' official systems ' + tplTag('fact') + '</h3>' +
    '<table class="tpl-table"><thead><tr><th>System</th><th>Code</th><th>Level</th><th>General (MFN) rate</th></tr></thead><tbody>' +
    dutyRows.map((r) => '<tr><td>' + escA(SYS[r.sys].name) + '</td><td>' + escA(fmtCode(r.sys, r.e[1])) + '</td><td>' + escA(levelName(r.e[1])) + '</td><td>' + escA(r.e[5] || 'No open rate') + '</td></tr>').join('') + '</tbody></table>' +
    '<p class="muted">' + rated.length + ' of ' + dutyRows.length + ' systems publish an open general rate here; preferential/FTA rates excluded. Rates change - verify on the official portal before filing.</p>' +
    (trade6 ? '<h3>India trade for this product, HS ' + escA(e[1].slice(0, 6)) + ', calendar ' + TRADE_YEAR + ' ' + tplTag('fact') + '</h3>' + factTable([['Imports (CIF, USD)', escA(fmtUsd(trade6[0]))], ['Exports (USD)', escA(fmtUsd(trade6[1]))]]) : '') +
    (trade ? '<h3>India trade in chapter ' + escA(e[4]) + ', calendar ' + TRADE_YEAR + ' ' + tplTag('fact') + '</h3>' + factTable([['Imports (CIF, USD)', escA(fmtUsd(trade[0]))], ['Exports (USD)', escA(fmtUsd(trade[1]))], ['Balance', trade[1] > trade[0] ? 'India is a net exporter in this chapter.' : (trade[0] > trade[1] * 3 ? 'India relies heavily on imports in this chapter.' : 'Mixed trade balance.')]]) : '') +
    tplTradeChart(trade6, trade, e[1].slice(0, 6)) +
    tplDutyChart(rated) +
    (has('sec03') ? '<h3>Market analysis</h3>' + tplNarr(narrative, 'sec03') : tplFallback('market and pricing', chTitle)) +
    tplSrc([{ t: SYS[e[0]].src, u: SYS[e[0]].url }, { t: 'UN Comtrade annual data, reporter India, partner World, ' + TRADE_YEAR + ' (baked into this file)', u: 'https://comtradeplus.un.org/' }].concat(has('sec03') ? [{ t: 'AI analysis (' + geminiAiLabel() + '), generated ' + today }] : [])) +
    '</section>';
  // 04
  secs += '<section class="tpl-sec"><h2><span class="tpl-num">04</span> Buyers and sellers by country</h2>' + (has('sec04') ? tplNarr(narrative, 'sec04') : tplFallback('buyer and seller company', chTitle)) +
    tplSrc([{ t: has('sec04') ? 'AI analysis (' + geminiAiLabel() + '), generated ' + today + ' - verify every company claim independently before contacting' : 'No verified company-level data in this file' }]) + '</section>';
  // 05
  secs += '<section class="tpl-sec"><h2><span class="tpl-num">05</span> India market and opportunities</h2>' +
    (e[0] === 1 && g ? '<h3>India duty and tax position ' + tplTag('fact') + '</h3>' + factTable([['IGST', '<strong>' + escA(g[0]) + '</strong> - ' + escA(g[1])], ['Legal basis', 'Notification No. 9/2025-Integrated Tax (Rate), 17 Sep 2025']]) : '') +
    (trade6 ? '<h3>India product trade, HS ' + escA(e[1].slice(0, 6)) + ', ' + TRADE_YEAR + ' ' + tplTag('fact') + '</h3>' + factTable([['Imports (CIF)', escA(fmtUsd(trade6[0]))], ['Exports', escA(fmtUsd(trade6[1]))]]) : '') +
    (trade ? '<h3>India chapter trade, ' + TRADE_YEAR + ' ' + tplTag('fact') + '</h3>' + factTable([['Imports', escA(fmtUsd(trade[0]))], ['Exports', escA(fmtUsd(trade[1]))]]) : '') +
    (has('sec05') ? '<h3>Opportunities analysis</h3>' + tplNarr(narrative, 'sec05') : tplFallback('India market', chTitle)) +
    tplSrc([{ t: 'CBIC GST rates', u: 'https://cbic-gst.gov.in/gst-goods-services-rates.html' }, { t: 'UN Comtrade ' + TRADE_YEAR + ' (baked)', u: 'https://comtradeplus.un.org/' }].concat(has('sec05') ? [{ t: 'AI analysis, generated ' + today }] : [])) +
    '</section>';
  // 06
  secs += '<section class="tpl-sec"><h2><span class="tpl-num">06</span> Geopolitics and supply-chain risks</h2>' +
    '<h3>Sanctions screening ' + tplTag('fact') + '</h3><p>This finder includes an offline screening box against the US OFAC SDN, EU consolidated financial sanctions and DHS UFLPA Entity List (' + SANCTIONS.length.toLocaleString('en-US') + ' names baked in, OFAC downloaded 22 Sep 2026, EU file generated 05/08/2026, UFLPA checked 22 Sep 2026). Screen every counterparty by name before trading. A name match is an alert, not proof - verify identifiers on the official list.</p>' +
    (has('sec06') ? '<h3>Risk analysis</h3>' + tplNarr(narrative, 'sec06') : tplFallback('geopolitical and supply-chain risk', chTitle)) +
    tplSrc([{ t: 'OFAC SDN', u: SANCTIONS_META.sources.OFAC }, { t: 'EU consolidated list', u: 'https://data.europa.eu/data/datasets/consolidated-list-of-persons-groups-and-entities-subject-to-eu-financial-sanctions?locale=en' }, { t: 'DHS UFLPA Entity List', u: SANCTIONS_META.sources.UFLPA }].concat(has('sec06') ? [{ t: 'AI analysis, generated ' + today }] : [])) +
    '</section>';
  // 07
  secs += '<section class="tpl-sec"><h2><span class="tpl-num">07</span> Technical uses</h2>' + (has('sec07') ? tplNarr(narrative, 'sec07') : tplFallback('technical use', chTitle)) +
    tplSrc([{ t: has('sec07') ? 'AI analysis, generated ' + today : 'No section-specific source - general context' }]) + '</section>';
  // 08
  secs += '<section class="tpl-sec"><h2><span class="tpl-num">08</span> Safety, storage and regulation</h2>' +
    (scomet ? '<h3>SCOMET export control ' + tplTag('fact') + '</h3>' + factTable([['Status', 'Export controlled - SCOMET entry ' + escA(scomet[0]) + (scomet[1] ? ' (' + escA(scomet[1]) + ')' : '')], ['Requirement', 'DGFT export authorisation needed to export from India (CWC Schedule chemicals)'], ['Scope note', 'Most SCOMET items are description-based; absence of a code flag does not clear an item - check the full DGFT Appendix 3 list.']]) : '') +
    (scometUnder.length ? '<h3>SCOMET export control ' + tplTag('fact') + '</h3>' + factTable([['Status', scometUnder.length + ' SCOMET-controlled national line' + (scometUnder.length > 1 ? 's' : '') + ' under this code: ' + escA(scometUnder.map((k) => SCOMET[k][0] + ' (ITC(HS) ' + k + ')').join(', '))], ['Requirement', 'DGFT export authorisation needed to export those items from India'], ['Scope note', 'Most SCOMET items are description-based; absence of a code flag does not clear an item - check the full DGFT Appendix 3 list.']]) : '') +
    '<h3>Classification and rate regulation ' + tplTag('fact') + '</h3><p>The tariff classification, duty rate and GST rate in this report come from the official sources listed in section 01. Rates and legal notes change - verify against the official source before filing any declaration.</p>' +
    (has('sec08') ? '<h3>Product safety and handling</h3>' + tplNarr(narrative, 'sec08') : tplFallback('safety, storage and regulation', chTitle)) +
    tplSrc([{ t: SYS[e[0]].src, u: SYS[e[0]].url }].concat(has('sec08') ? [{ t: 'AI analysis, generated ' + today }] : [])) +
    '</section>';
  // 09 Summary
  secs += '<section class="tpl-sec"><h2><span class="tpl-num">09</span> Summary</h2>' +
    '<h3>Verified position ' + tplTag('fact') + '</h3><ul class="tpl-list">' +
    '<li>' + escA(prod) + ' is classified ' + escA(fmtCode(e[0], e[1])) + ' in ' + escA(SYS[e[0]].name) + ' (' + escA(levelName(e[1])) + ', chapter ' + escA(e[4]) + ').</li>' +
    (e[0] === 1 && g ? '<li>India IGST: ' + escA(g[0]) + ' under Notification 9/2025-Integrated Tax (Rate).</li>' : '') +
    (e[5] ? '<li>General dataset duty/rate: ' + escA(e[5]) + '.</li>' : '') +
    '<li>' + rated.length + ' of ' + dutyRows.length + ' linked official systems publish an open general rate for this product.</li>' +
    (trade ? '<li>India traded this chapter in ' + TRADE_YEAR + ': imports ' + escA(fmtUsd(trade[0])) + ', exports ' + escA(fmtUsd(trade[1])) + '.</li>' : '') +
    '</ul>' +
    (has('sec09') ? '<h3>Analyst summary</h3>' + tplNarr(narrative, 'sec09') : tplFallback('summary analysis', chTitle)) +
    tplSrc([{ t: SYS[e[0]].src, u: SYS[e[0]].url }]) + '</section>';
  // 10-14
  const simple = [
    ['10', 'Impact', 'sec10', 'impact'],
    ['11', 'Geopolitics', 'sec11', 'geopolitical'],
    ['13', 'Advantage', 'sec13', 'competitive advantage'],
    ['14', 'Change', 'sec14', 'change and outlook'],
  ];
  // 12 custom before loop ordering - build 10,11,12,13,14 in order
  secs += '<section class="tpl-sec"><h2><span class="tpl-num">10</span> Impact</h2>' + (has('sec10') ? tplNarr(narrative, 'sec10') : tplFallback('impact', chTitle)) + tplSrc([{ t: has('sec10') ? 'AI analysis, generated ' + today : 'No section-specific source - general context' }]) + '</section>';
  secs += '<section class="tpl-sec"><h2><span class="tpl-num">11</span> Geopolitics</h2>' + (has('sec11') ? tplNarr(narrative, 'sec11') : tplFallback('geopolitics', chTitle)) + tplSrc([{ t: has('sec11') ? 'AI analysis, generated ' + today : 'No section-specific source - general context' }]) + '</section>';
  secs += '<section class="tpl-sec"><h2><span class="tpl-num">12</span> Financial way</h2>' +
    '<h3>Cost factors from verified data ' + tplTag('fact') + '</h3><ul class="tpl-list">' +
    (e[5] ? '<li>Import duty (general/MFN): ' + escA(e[5]) + ' in ' + escA(SYS[e[0]].name) + '.</li>' : '') +
    (e[0] === 1 && g ? '<li>India IGST on this code: ' + escA(g[0]) + '.</li>' : '') +
    (rated.length ? '<li>Duty spread across ' + rated.length + ' systems with open rates - compare section 03 before choosing a market.</li>' : '') +
    (trade ? '<li>Chapter trade scale (India, ' + TRADE_YEAR + '): ' + escA(fmtUsd(trade[0] + trade[1])) + ' total two-way trade.</li>' : '') +
    '</ul>' +
    (has('sec12') ? '<h3>Financial analysis</h3>' + tplNarr(narrative, 'sec12') : tplFallback('financial', chTitle)) +
    tplSrc([{ t: SYS[e[0]].src, u: SYS[e[0]].url }].concat(has('sec12') ? [{ t: 'AI analysis, generated ' + today }] : [])) + '</section>';
  secs += '<section class="tpl-sec"><h2><span class="tpl-num">13</span> Advantage</h2>' + (has('sec13') ? tplNarr(narrative, 'sec13') : tplFallback('advantage', chTitle)) + tplSrc([{ t: has('sec13') ? 'AI analysis, generated ' + today : 'No section-specific source - general context' }]) + '</section>';
  secs += '<section class="tpl-sec"><h2><span class="tpl-num">14</span> Change</h2>' +
    '<h3>Data currency ' + tplTag('fact') + '</h3><p>This report was generated ' + escA(today) + ' from dataset build ' + escA(DATA_BUILD) + '. The finder refreshes official sources automatically every week and its change-alerts feature flags saved codes whose duty, GST or linkage changed between builds.</p>' +
    (has('sec14') ? '<h3>What is changing</h3>' + tplNarr(narrative, 'sec14') : tplFallback('change and outlook', chTitle)) +
    tplSrc([{ t: SYS[e[0]].src, u: SYS[e[0]].url }].concat(has('sec14') ? [{ t: 'AI analysis, generated ' + today }] : [])) + '</section>';

  secs += '<section class="tpl-sec"><h2><span class="tpl-num">15</span> Documents and compliance checklist</h2>' +
    '<p class="muted">Paperwork typically needed to move this product to or from India. AI-compiled from current official guidance - confirm each item with your CHA or DGFT before shipping.</p>' +
    (has('sec15') ? tplTag('ai') + tplDocTable(narrative.sec15) : tplFallback('document checklist', chTitle)) +
    tplSrc([{ t: has('sec15') ? 'AI analysis (' + geminiAiLabel() + '), generated ' + today + ' - confirm against DGFT/CBIC before shipping' : 'No section-specific source - general context' }, { t: 'DGFT', u: 'https://www.dgft.gov.in/' }, { t: 'CBIC', u: 'https://www.cbic.gov.in/' }]) + '</section>';
  secs += '<section class="tpl-sec"><h2><span class="tpl-num">16</span> Logistics and Incoterms</h2>' +
    (has('sec16') ? tplNarr(narrative, 'sec16') : tplFallback('logistics and Incoterms', chTitle)) +
    tplSrc([{ t: has('sec16') ? 'AI analysis (' + geminiAiLabel() + '), generated ' + today : 'No section-specific source - general context' }]) + '</section>';
  secs += '<section class="tpl-sec"><h2><span class="tpl-num">17</span> Policy changes and news</h2>' +
    (has('sec17') ? tplNarr(narrative, 'sec17') : tplFallback('recent policy changes', chTitle)) +
    tplSrc([{ t: has('sec17') ? 'AI analysis (' + geminiAiLabel() + '), generated ' + today + ' - verify against the gazette or notification cited' : 'No section-specific source - general context' }]) + '</section>';

  const contents = TPL_SECTIONS.map((s) => '<li><span class="tpl-num">' + s[0] + '</span> ' + esc(s[1]) + '</li>').join('');
  const modeLine = aiUsed
    ? 'Live AI research edition - narrative sections written by ' + geminiAiLabel() + ' and labelled ANALYTICAL JUDGMENT; all codes, rates, GST, trade figures and sanctions facts are exact official data baked into this file.'
    : 'Data edition - codes, rates, GST, trade figures and sanctions facts are exact official data baked into this file; narrative sections show general chapter-level context. Add a free Gemini key on the code page to generate the full AI-written edition.' +
      (opts.aiError ? ' (AI narrative was attempted but failed: ' + esc(opts.aiError) + ')' : '');

  return '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' +
    '<title>' + esc(prod) + ' - Product Research Report</title><style>' +
    '@page { size: A4; margin: 14mm 12mm 20mm 12mm; }' +
    '* { box-sizing: border-box; }' +
    'body { font-family: Georgia, "Times New Roman", serif; color: #1c1c1e; margin: 0 auto; max-width: 186mm; background: #f2efe9; position: relative; }' +
    'h1,h2,h3 { font-family: -apple-system, "Segoe UI", Arial, sans-serif; }' +
    'p, li, td, th { font-size: 12.5px; line-height: 1.55; }' +
    '.tpl-page { background: #fff; min-height: 250mm; padding: 22mm 16mm; margin: 8mm auto; break-after: page; box-shadow: 0 1px 8px rgba(0,0,0,.12); }' +
    '.tpl-sec { background: #fff; padding: 14mm 16mm 10mm; margin: 8mm auto; break-before: page; box-shadow: 0 1px 8px rgba(0,0,0,.12); }' +
    '.tpl-brand { font-family: -apple-system, Arial, sans-serif; letter-spacing: .35em; font-size: 13px; color: #8a7b5c; text-transform: uppercase; }' +
    '.tpl-cover-title { font-size: 30px; margin: 4mm 0 2mm; }' +
    '.tpl-cover-sub { color: #555; font-size: 14px; }' +
    '.tpl-contents { columns: 2; list-style: none; padding: 0; margin: 8mm 0 0; }' +
    '.tpl-contents li { padding: 2.2mm 0; border-bottom: 1px solid #eee; font-size: 12.5px; break-inside: avoid; }' +
    '.tpl-num { font-family: -apple-system, Arial, sans-serif; color: #8a7b5c; font-weight: 700; }' +
    '.tpl-tag { display: inline-block; font-family: -apple-system, Arial, sans-serif; font-size: 9px; letter-spacing: .04em; padding: 1.2mm 2.4mm; border-radius: 3px; vertical-align: middle; margin-left: 2mm; }' +
    '.tpl-tag.fact { background: #e5f2e5; color: #1e6b2e; border: 1px solid #b8d9bc; }' +
    '.tpl-tag.judge { background: #fdf0dc; color: #8a5a12; border: 1px solid #ecd3a8; }' +
    '.tpl-table { width: 100%; border-collapse: collapse; margin: 3mm 0; }' +
    '.tpl-table th, .tpl-table td { border: 1px solid #ddd; padding: 1.8mm 2.4mm; text-align: left; vertical-align: top; font-size: 11.5px; }' +
    '.tpl-table thead th { background: #f5f1e8; font-family: -apple-system, Arial, sans-serif; font-size: 10.5px; }' +
    '.tpl-table tbody th { width: 34%; background: #faf8f3; font-family: -apple-system, Arial, sans-serif; font-size: 10.5px; }' +
    '.tpl-list { padding-left: 6mm; }' +
    '.tpl-sec h2 { border-left: 2.5mm solid #8a7b5c; padding: 1.5mm 0 1.5mm 3mm; background: linear-gradient(90deg, #f7f3ea, transparent); }' +
    '.tpl-table tbody tr:nth-child(even) td { background: #fcfaf5; }' +
    '.tpl-kpis { display: flex; flex-wrap: wrap; gap: 3mm; margin: 5mm 0; }' +
    '.tpl-kpi { flex: 1 1 36mm; border: 1px solid #e3dccb; border-radius: 4px; padding: 3mm; background: #fbf9f4; break-inside: avoid; }' +
    '.tpl-kpi .k { font-family: -apple-system, Arial, sans-serif; font-size: 9.5px; letter-spacing: .06em; text-transform: uppercase; color: #8a7b5c; }' +
    '.tpl-kpi .v { font-family: -apple-system, Arial, sans-serif; font-size: 16.5px; font-weight: 700; margin-top: 1mm; }' +
    '.tpl-kpi .s { font-size: 10px; color: #666; margin-top: .5mm; }' +
    '.tpl-chart { margin: 4mm 0; break-inside: avoid; }' +
    '.tpl-keep { break-inside: avoid; }' +
    '.tpl-chart .cap { font-size: 10px; color: #666; margin-top: 1mm; }' +
    '.tpl-check { list-style: none; padding: 0; margin: 3mm 0; }' +
    '.tpl-check li { padding: 1.8mm 0 1.8mm 7mm; position: relative; border-bottom: 1px dashed #e8e2d4; break-inside: avoid; }' +
    '.tpl-check li::before { content: ""; position: absolute; left: 0; top: 2.6mm; width: 2.8mm; height: 2.8mm; border: 1px solid #8a7b5c; border-radius: .8mm; }' +
    '.tpl-src { font-size: 10.5px; color: #666; border-top: 1px solid #eee; padding-top: 2mm; margin-top: 5mm; }' +
    '.tpl-src a { color: #4a5a8a; }' +
    '.muted { color: #666; font-size: 11px; }' +
    '.pgnum { position: absolute; right: 12mm; font-family: -apple-system, Arial, sans-serif; font-size: 9px; color: #999; }' +
    '.tpl-foot { position: fixed; bottom: 0; left: 0; right: 0; font-family: -apple-system, Arial, sans-serif; font-size: 9px; color: #999; text-align: center; padding: 1mm 0; }' +
    '.tpl-actions { position: fixed; top: 8px; right: 8px; z-index: 9; }' +
    '.tpl-actions button { font: 600 13px -apple-system, Arial, sans-serif; padding: 8px 14px; border: 0; border-radius: 8px; background: #1c1c1e; color: #fff; cursor: pointer; }' +
    '@media print { body { background: #fff; max-width: none; } .tpl-page, .tpl-sec { box-shadow: none; margin: 0; } .tpl-actions { display: none; } }' +
    '</style></head><body>' +
    '<div class="tpl-actions"><button onclick="window.print()">Save as PDF / Print</button></div>' +
    '<div class="tpl-page"><div class="tpl-brand">Push</div>' +
    '<h1 class="tpl-cover-title">' + esc(prod) + '</h1>' +
    '<p class="tpl-cover-sub">' + esc(SYS[e[0]].name) + ' - code ' + esc(fmtCode(e[0], e[1])) + '</p>' +
    tplKpis(e, g, trade6, trade, rated) +
    '<table class="tpl-table"><tbody>' +
    '<tr><th>Report date</th><td>' + esc(today) + '</td></tr>' +
    '<tr><th>Edition</th><td>1.0 - ' + (aiUsed ? 'Live AI research edition' : 'Data edition') + '</td></tr>' +
    '<tr><th>Dataset build</th><td>' + esc(DATA_BUILD) + '</td></tr>' +
    '<tr><th>Mode</th><td>' + esc(modeLine) + '</td></tr>' +
    '</tbody></table>' +
    '<h3>Contents</h3><ol class="tpl-contents">' + contents + '</ol></div>' +
    '<div class="tpl-page"><h2>How to use this report</h2>' +
    '<p>Every statement in this report carries one of two labels:</p>' +
    '<p>' + tplTag('fact') + '</p><p><strong>Verified fact.</strong> Exact data baked into this file from official government and WCO sources: tariff codes, legal descriptions, duty rates, GST rates, India trade totals and sanctions list contents. Each carries its source and data date. Rates change - verify against the official source before filing.</p>' +
    '<p>' + tplTag('ai') + '</p><p><strong>Analytical judgment.</strong> Interpretation and context - market reading, opportunities, risks. AI-assisted sections are written by ' + geminiAiLabel() + ' on the report date; general-context sections are chapter-level orientation only. Judgment can be wrong; act on it only after your own verification.</p>' +
    '<p class="muted">This report is research support, not legal, tax or customs advice.</p></div>' +
    secs +
    '<div class="tpl-foot">Push - Product Research Report - ' + esc(fmtCode(e[0], e[1])) + '</div>' +
    '<script>window.addEventListener("load",function(){var PH=' + TPL_PAGE_H + ';var kids=Array.prototype.slice.call(document.body.children).filter(function(k){return k.classList.contains("tpl-page")||k.classList.contains("tpl-sec");});var total=0;var stamps=[];kids.forEach(function(k){var pages=Math.max(1,Math.ceil(k.offsetHeight/(PH-40)));k.style.minHeight=(pages*PH)+"px";k.style.position="relative";for(var j=0;j<pages;j++){total++;var d=document.createElement("div");d.className="pgnum";d.style.top=((j+1)*PH-30)+"px";k.appendChild(d);stamps.push(d);}});stamps.forEach(function(d,i){d.textContent="Page "+(i+1)+" of "+total;});});</scr' + 'ipt>' +
    '</body></html>';
}

async function openTemplateReport(db, idx) {
  let narrative = null, aiError = '';
  if (aiAvailable()) {
    try { narrative = await tplNarrative(db, idx, V.apiKey); } catch (err) { aiError = err.message || 'AI call failed'; }
  }
  const html = buildTemplateReport(db, idx, narrative, { aiError });
  const w = window.open('', '_blank');
  if (!w) { V.briefError = 'Popup blocked - allow popups for this page to open the report.'; paintDetail(); return; }
  w.document.open();
  w.document.write(html);
  w.document.close();
}

/* ---------- detail view ---------- */
function detailHtml(idx) {
  const db = S.db;
  const e = db.entries[idx];
  const kids = db.children.get(idx) || [];
  const path = chain(db, idx);
  const chTitle = db.chapterTitle.get(e[4]);
  const key = e[0] + ':' + e[1];
  const isFav = S.favs.includes(key);
  const shortlisted = S.shortlist.includes(key);
  const note = S.notes[key] || '';
  const apiKey = V.apiKey;
  let s = '<div class="page-pad detail-view">';
  s += '<div class="no-print back-row">' +
    '<button class="file-button is-compact" data-variant="secondary" id="d-back">Back to search</button>' +
    (!S.clientMode ? '<button class="fav-btn" id="d-fav" title="' + (isFav ? 'Remove from favorites' : 'Save to favorites') + '">' + (isFav ? '&#9733; Saved' : '&#9734; Save') + '</button>' : '') +
    (!S.clientMode ? '<button class="fav-btn" id="d-short" title="' + (shortlisted ? 'Remove from client shortlist' : 'Add to client shortlist') + '">' + (shortlisted ? '&#10003; Shortlisted' : '+ Shortlist') + '</button>' : '') +
    '</div>';
  s += '<div class="detail-head">' + sysTagHtml(e[0]) + '<h1 class="detail-code">' + esc(fmtCode(e[0], e[1])) + '</h1></div>';
  s += '<p class="detail-desc">' + esc(pretty(e[2])) + '</p>';
  s += '<dl class="detail-facts">' +
    '<div><dt>System</dt><dd>' + esc(SYS[e[0]].name) + '</dd></div>' +
    '<div><dt>Chapter</dt><dd>' + esc(e[4]) + (chTitle ? ' - ' + esc(chTitle) : '') + '</dd></div>' +
    '<div><dt>Level</dt><dd>' + esc(levelName(e[1])) + '</dd></div>' +
    (e[5] ? '<div><dt>' + (e[0] === 2 ? 'US general duty' : 'Dataset duty / rate') + '</dt><dd>' + esc(e[5]) + '</dd></div>' : '') +
    (e[0] === 1 ? gstRowHtml(e[1]) : '') +
    '</dl>' +
    scometFlagHtml(e);
  if (!S.clientMode) {
    s += '<div class="detail-sec no-print note-sec"><h3>Your note</h3>' +
      '<textarea class="note-box" id="d-note" rows="3" placeholder="Your private note for this code - client name, shipment, price, anything. Saved on this device only.">' + esc(note) + '</textarea></div>';
  }
  s += linkPanelHtml(e, idx);
  s += dutyCompareHtml(e);
  s += currencySlotHtml(e[0]);
  s += tradeCardHtml(e[4], e[1]);
  if (path.length > 1) {
    s += '<div class="detail-sec"><h3>Classification path in ' + SYS[e[0]].tag + '</h3><ol class="path-list">' +
      path.map((i) => '<li><button class="linkbtn" data-open="' + i + '">' + esc(fmtCode(db.entries[i][0], db.entries[i][1])) + '</button> <span>' + esc(pretty(db.entries[i][2])) + '</span></li>').join('') +
      '</ol></div>';
  }
  s += '<div class="detail-sec"><h3>Products covered under this code (' + kids.length + ')</h3>';
  if (kids.length) {
    s += '<ul class="kids-list">' + kids.slice(0, 120).map((i) => '<li><button class="linkbtn" data-open="' + i + '">' + esc(fmtCode(db.entries[i][0], db.entries[i][1])) + '</button> <span>' + esc(pretty(db.entries[i][2])) + '</span>' + (db.entries[i][5] ? '<em class="rate">' + esc(db.entries[i][5]) + '</em>' : '') + '</li>').join('') + '</ul>';
  } else s += '<p>Leaf tariff line - it covers exactly the product described above.</p>';
  if (kids.length > 120) s += '<p class="muted">Showing 120 of ' + kids.length + ' sub-lines. Use the code search with prefix ' + esc(e[1]) + ' to see more.</p>';
  s += '</div>';
  s += '<div class="detail-sec no-print ai-panel">' +
    '<div class="ai-panel-head"><div><h3>Full report</h3><p class="muted">One tap makes the branded 14-section PDF - exact official data with AI-written analysis inside. ' + (AI_PROXY_URL || builtinKeys('gemini').length || builtinKeys('groq').length ? 'AI is built in for everyone - no key needed.' : 'Needs a free AI key, set up once.') + '</p></div><span class="ai-status ' + (aiAvailable() ? 'ready' : 'offline') + '">' + (apiKey || AI_PROXY_URL ? 'Live ready' : aiAvailable() ? 'Shared AI - may hit daily limit' : 'Key needed') + '</span></div>' +
    '<div class="action-row">' +
    '<button class="file-button is-compact" id="d-tpl"' + (V.busy ? ' disabled' : '') + '>' + (V.busy ? 'Writing the report with AI...' : 'Full report') + '</button>' +
    '<button class="file-button is-compact" data-variant="secondary" id="ai-settings">' + (V.settingsOpen ? 'Hide AI settings' : apiKey ? 'Change API key' : 'Use your own key') + '</button>' +
    '</div>';
  if (V.needKey) s += '<p class="error-note">Add a free AI key first - the full report uses AI writing, so the key comes before the report. Paste it below and tap Save on this phone.</p>';
  if (V.settingsOpen) {
    const selProv = V.apiProvider || (/^gsk_/i.test(apiKey.trim()) ? 'groq' : 'gemini');
    s += '<div class="api-settings">' +
      '<label class="sfield"><span class="slabel">Key provider</span><select id="api-provider"><option value="gemini"' + (selProv === 'gemini' ? ' selected' : '') + '>Gemini (Google) - can search the live web</option><option value="groq"' + (selProv === 'groq' ? ' selected' : '') + '>Groq - faster answers</option></select></label>' +
      '<label class="sfield"><span class="slabel">API key</span><input type="password" id="api-key" value="' + esc(apiKey) + '" placeholder="Paste Gemini or Groq key once" autocomplete="off"></label>' +
      '<div class="action-row"><button class="file-button is-compact" id="api-save">Save on this phone</button>' +
      (apiKey ? '<button class="file-button is-compact" data-variant="secondary" id="api-remove">Remove key</button>' : '') +
      '<a class="file-button is-compact" data-variant="secondary" href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer">Create free key</a></div>' +
      '<p class="api-note">Free-tier prompts may be used by Google to improve its products. Do not enter confidential product or customer data. For this hosted page, a browser key cannot be kept secret like a server-side key; restrict or revoke it in AI Studio if needed.</p></div>';
  }
  if (V.briefError) s += '<p class="error-note">' + esc(V.briefError) + ' Your saved key was not removed.</p>';
  s += '</div>';
  s += '<div class="detail-sec no-print action-row">' +
    '<button class="file-button is-compact" data-variant="secondary" id="d-compare">Compare codes</button>' +
    '<button class="file-button is-compact" data-variant="secondary" id="d-copy">' + (V.copied ? 'Link copied' : 'Copy link to this code') + '</button>' +
    '</div>';
  s += portalRowHtml(e[0]);
  s += '<div class="detail-sec muted src-line">Source: ' + esc(SYS[e[0]].src) + '. <a href="' + SYS[e[0]].url + '" target="_blank" rel="noreferrer">Official reference</a>. Duty rates change; verify before filing.</div>';
  return s + '</div>';
}

function paintDetail() {
  const idx = S.sel;
  el('view').innerHTML = detailHtml(idx);
  const db = S.db;
  const e = db.entries[idx];
  const key = e[0] + ':' + e[1];
  bindOpens(el('view'));
  el('d-back').addEventListener('click', back);
  const favB = el('d-fav');
  if (favB) favB.addEventListener('click', () => { toggleFav(key); paintDetail(); paintNav(); });
  const slB = el('d-short');
  if (slB) slB.addEventListener('click', () => { toggleShort(key); paintDetail(); paintNav(); });
  const noteT = el('d-note');
  if (noteT) noteT.addEventListener('input', () => { setNote(key, noteT.value); });
  el('ai-settings').addEventListener('click', () => { V.needKey = false; V.settingsOpen = !V.settingsOpen; paintDetail(); });
  if (V.settingsOpen) {
    el('api-save').addEventListener('click', () => {
      const v = el('api-key').value.trim();
      const p = el('api-provider') ? el('api-provider').value : '';
      try { localStorage.setItem(API_KEY_STORE, v); localStorage.setItem(API_PROVIDER_STORE, p); } catch { /* ignore */ }
      V.apiKey = v; V.apiProvider = p; V.settingsOpen = false; paintDetail();
    });
    const rm = el('api-remove');
    if (rm) rm.addEventListener('click', () => {
      try { localStorage.removeItem(API_KEY_STORE); } catch { /* ignore */ }
      V.apiKey = ''; V.needKey = false; paintDetail();
    });
  }
  el('d-compare').addEventListener('click', () => { S.cmpA = idx; S.cmpB = null; V.cmpQ = ''; render(); });
  el('d-tpl').addEventListener('click', () => {
    if (!aiAvailable()) {
      V.needKey = true; V.settingsOpen = true; V.briefError = null; paintDetail();
      const k = el('api-key');
      if (k) { try { k.scrollIntoView({ block: 'center' }); } catch { /* ignore */ } try { k.focus(); } catch { /* ignore */ } }
      return;
    }
    V.needKey = false; V.busy = true; V.briefError = null; paintDetail();
    openTemplateReport(db, idx).finally(() => { V.busy = false; if (S.sel === idx) paintDetail(); });
  });
  el('d-copy').addEventListener('click', () => {
    const u = location.href.split('#')[0] + '#code=' + key;
    const done = (ok) => { V.copied = ok; paintDetail(); };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(u).then(() => done(true)).catch(() => done(false));
    else done(false);
  });
  // currency card: fill in async
  const ccy = SYS_CCY[e[0]];
  if (ccy && ccy !== 'USD') {
    fetchCurrency(e[0], () => {
      if (S.sel !== idx) return;
      const slot = el('ccy-card');
      if (!slot) return;
      const html = currencySlotHtml(e[0]);
      if (!html) { slot.remove(); return; }
      const tmp = document.createElement('div');
      tmp.innerHTML = html;
      slot.replaceWith(tmp.firstChild);
    });
  }
}

/* ---------- compare view ---------- */
function cmpColHtml(i) {
  const db = S.db;
  const e = db.entries[i];
  const kids = db.children.get(i) || [];
  const groups = linkage(db, e);
  return '<div class="cmp-col"><div class="link-group-head">' + sysTagHtml(e[0]) + '<button class="linkbtn cmp-code" data-open="' + i + '">' + esc(fmtCode(e[0], e[1])) + '</button></div>' +
    '<p class="cmp-desc">' + esc(pretty(e[2])) + '</p>' +
    '<dl class="detail-facts">' +
    '<div><dt>Chapter</dt><dd>' + esc(e[4]) + '</dd></div>' +
    '<div><dt>Level</dt><dd>' + esc(levelName(e[1])) + '</dd></div>' +
    '<div><dt>Duty</dt><dd>' + esc(e[5] || '-') + '</dd></div>' +
    '<div><dt>Direct sub-lines</dt><dd>' + kids.length + '</dd></div>' +
    '<div><dt>Worldwide</dt><dd>' + groups.filter((g) => g.selfExists).length + ' of ' + SYS.length + ' systems have this line</dd></div>' +
    '</dl></div>';
}
function paintCompare() {
  let right;
  if (S.cmpB !== null) right = cmpColHtml(S.cmpB);
  else right = '<div class="cmp-col"><p class="muted">Pick the second code:</p>' +
    '<input class="cmp-input" id="cmp-q" value="' + esc(V.cmpQ) + '" placeholder="Search any product or code" autocomplete="off">' +
    '<div id="cmp-res"></div></div>';
  el('view').innerHTML = '<div class="page-pad"><div class="no-print back-row"><button class="file-button is-compact" data-variant="secondary" id="cmp-close">Close compare</button></div>' +
    '<h2 class="cmp-title">Compare codes</h2><div class="cmp-grid">' + cmpColHtml(S.cmpA) + right + '</div></div>';
  bindOpens(el('view'));
  el('cmp-close').addEventListener('click', back);
  const qi = el('cmp-q');
  if (qi) {
    const paintRes = () => {
      const res = V.cmpQ ? groupFamilies(S.db, search(S.db, V.cmpQ, '', '', -1).out).slice(0, 8) : [];
      el('cmp-res').innerHTML = '<ul class="result-list">' + res.map((i) => {
        const e = S.db.entries[i];
        return '<li><button class="result-link linkbtn-block" data-pick="' + i + '">' + (e[0] !== 0 ? sysTagHtml(e[0]) : '') + ' <span class="rcode">' + esc(fmtCode(e[0], e[1])) + '</span> <span class="rdesc">' + esc(pretty(e[2])) + '</span></button></li>';
      }).join('') + '</ul>';
      Array.prototype.forEach.call(el('cmp-res').querySelectorAll('[data-pick]'), (b) => {
        b.addEventListener('click', () => { S.cmpB = parseInt(b.getAttribute('data-pick'), 10); V.cmpQ = ''; paintCompare(); });
      });
    };
    qi.addEventListener('input', () => { V.cmpQ = qi.value; paintRes(); });
    paintRes();
  }
}

/* ---------- shortlist view ---------- */
function paintShortlist() {
  const db = S.db;
  const items = S.shortlist.map((k) => ({ k, i: db.keyToIdx.get(k) })).filter((x) => x.i !== undefined);
  const rows = items.map((x) => {
    const e = db.entries[x.i];
    return '<tr><td>' + sysTagHtml(e[0]) + '</td>' +
      '<td><button class="linkbtn rcode" data-open="' + x.i + '">' + esc(fmtCode(e[0], e[1])) + '</button></td>' +
      '<td>' + esc(pretty(e[2])) + (S.notes[x.k] ? '<div class="sl-note">Note: ' + esc(S.notes[x.k]) + '</div>' : '') + '</td>' +
      '<td class="sl-duty">' + esc(e[5] || '-') + '</td>' +
      '<td class="no-print"><button class="linkbtn" data-rm="' + esc(x.k) + '">Remove</button></td></tr>';
  }).join('');
  el('view').innerHTML = '<div class="page-pad shortlist-view"><div class="no-print back-row">' +
    '<button class="file-button is-compact" data-variant="secondary" id="sl-close">Close shortlist</button>' +
    (items.length ? '<button class="file-button is-compact" data-variant="secondary" id="sl-csv">Export Excel / CSV</button>' : '') +
    (items.length ? '<button class="file-button is-compact" data-variant="secondary" id="sl-print">Print / save as PDF</button>' : '') +
    '</div><h2 class="cmp-title">Client shortlist</h2>' +
    '<p class="muted">' + items.length + ' code' + (items.length === 1 ? '' : 's') + ' saved on this device. Export opens in Excel; print saves a clean PDF.</p>' +
    (items.length === 0 ? '<p class="muted">Nothing here yet. Open any code and tap "+ Shortlist" to add it.</p>' : '') +
    '<table class="sl-table"><tbody>' + rows + '</tbody></table></div>';
  bindOpens(el('view'));
  el('sl-close').addEventListener('click', back);
  const csvB = el('sl-csv');
  if (csvB) csvB.addEventListener('click', () => {
    const q = (s) => '"' + String(s).replace(/"/g, '""') + '"';
    const lines = [['System', 'Code', 'Description', 'Open duty / rate', 'Note', 'Source'].map(q).join(',')];
    items.forEach((x) => {
      const e = db.entries[x.i];
      lines.push([SYS[e[0]].name, fmtCode(e[0], e[1]), pretty(e[2]), e[5] || '', S.notes[x.k] || '', SYS[e[0]].url].map(q).join(','));
    });
    const blob = new Blob(['﻿' + lines.join('\n')], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'hsn-shortlist.csv';
    a.click();
    URL.revokeObjectURL(a.href);
  });
  const prB = el('sl-print');
  if (prB) prB.addEventListener('click', () => window.print());
  Array.prototype.forEach.call(el('view').querySelectorAll('[data-rm]'), (b) => {
    b.addEventListener('click', () => { toggleShort(b.getAttribute('data-rm')); paintShortlist(); paintNav(); });
  });
}

/* ---------- classify panel ---------- */
function classifyHtml() {
  const apiKey = V.apiKey;
  let s = '';
  if (!aiAvailable() && !V.clsHits && !V.clsOffline && !V.clsBusy) {
    s += '<p class="muted no-print" style="margin:2px 0 6px">Tip: add a free Gemini or Groq key on any detail page and this box also gives AI best-code picks. Without a key it shows closest text matches.</p>';
  }
  if (V.clsErr) s += '<p class="error-note">' + esc(V.clsErr) + '</p>';
  if (V.clsBusy) s += '<p class="muted">Thinking...</p>';
  s += '<div id="cls-res">' + classifyResHtml() + '</div>';
  return s;
}
function classifyResHtml() {
  const db = S.db;
  if (V.clsHits) {
    return '<ul class="result-list">' + V.clsHits.map((h) => {
      const code = String(h.code);
      const rows = clsRowsFor(code);
      return '<li><div class="classify-why"><strong>HS ' + esc(code.replace(/(\d{4})(\d{2})/, '$1.$2')) + '</strong> - ' + esc(h.why) + '</div>' +
        (rows.length ? rows.map((i) => { const e = db.entries[i]; return '<button class="result-link linkbtn-block" data-open="' + i + '">' + (e[0] !== 0 ? sysTagHtml(e[0]) : '') + '<span class="rcode">' + esc(fmtCode(e[0], e[1])) + '</span><span class="rdesc">' + esc(pretty(e[2])) + '</span></button>'; }).join('') : '<span class="muted">No matching line in this dataset - try the code search.</span>') +
        '</li>';
    }).join('') + '</ul>';
  }
  if (V.clsOffline) {
    if (!V.clsOffline.length) return '<p class="muted">No offline matches. Try different words.</p>';
    return '<ul class="result-list">' + V.clsOffline.map((i) => {
      const e = db.entries[i];
      return '<li><button class="result-link linkbtn-block" data-open="' + i + '">' + (e[0] !== 0 ? sysTagHtml(e[0]) : '') + '<span class="rcode">' + esc(fmtCode(e[0], e[1])) + '</span><span class="rdesc">' + esc(pretty(e[2])) + '</span></button></li>';
    }).join('') + '</ul>';
  }
  return '';
}
function clsRowsFor(code) {
  const db = S.db;
  const hs = db.keyToIdx.get('0:' + code);
  if (hs !== undefined) return [hs];
  for (let sys = 1; sys < SYS.length; sys++) {
    const arr = db.sorted[sys] || [];
    for (const i of arr) { if (db.entries[i][1].startsWith(code)) return [i]; }
  }
  return [];
}
async function classifyRun() {
  const text = V.q.trim();
  if (!text || V.clsBusy) return;
  V.clsBusy = true; V.clsErr = null; V.clsHits = null; V.clsOffline = null;
  paintClassify();
  const hasAi = aiAvailable();
  if (hasAi) {
    try {
      const prompt = 'You are an expert customs tariff classifier using the WCO Harmonized System 2022. A trader describes a product: "' + text.replace(/"/g, "'") + '". Suggest up to 5 most likely 6-digit HS codes (subheading level), best first. Return ONLY a JSON array, no Markdown, no commentary: [{"code":"280421","why":"one short line"}]. Codes must be real HS 2022 subheadings.';
      let txt = (await aiPickText(prompt, { temperature: 0, maxTokens: 4000 }) /* thinking models burn tokens before the JSON; keep headroom */).trim().replace(/```[a-z]*/gi, '');
      const a = txt.indexOf('['); const b = txt.lastIndexOf(']');
      if (a < 0 || b <= a) throw new Error('no JSON');
      const arr = JSON.parse(txt.slice(a, b + 1));
      const clean = arr.filter((h) => h && /^\d{6}$/.test(String(h.code))).slice(0, 5);
      if (!clean.length) throw new Error('no valid codes');
      V.clsHits = clean;
      V.clsBusy = false;
      paintClassify();
      return;
    } catch (e) {
      V.clsErr = 'AI suggestion failed (' + String(e.message).slice(0, 80) + ') - showing offline text matches instead.';
    }
  }
  let r = search(S.db, text, '', '', -1);
  if (!r.out.length) {
    const words = text.split(/\s+/).filter((w) => w.length > 2);
    for (let k = Math.min(3, words.length); k >= 1 && !r.out.length; k--) {
      r = search(S.db, words.slice(0, k).join(' '), '', '', -1);
    }
  }
  if (!r.out.length) {
    const words = text.split(/\s+/).filter((w) => w.length > 3);
    for (const w of words) { r = search(S.db, w, '', '', -1); if (r.out.length) break; }
  }
  V.clsOffline = groupFamilies(S.db, r.out).slice(0, 10);
  V.clsBusy = false;
  paintClassify();
}
function paintClassify() {
  const slot = el('cls-slot');
  if (!slot) return;
  slot.innerHTML = classifyHtml();
  bindOpens(el('cls-res'));
}


function normSan(s) {
  return s.toUpperCase().replace(/[^A-Z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim();
}
function sanctionHits(q) {
  const n = normSan(q);
  if (n.length < 3) return [];
  const out = [];
  for (const r of SANCTIONS) {
    const name = r[0];
    const nk = normSan(name);
    if (nk.includes(n)) {
      const pos = nk.indexOf(n);
      out.push({ name, list: r[1], program: r[2], exact: nk === n, pos });
      if (out.length >= 200) break;
    }
  }
  out.sort((a, b) => (b.exact - a.exact) || (a.pos - b.pos) || (a.name.length - b.name.length));
  return out.slice(0, 30);
}
function sanctionsCardHtml() {
  const hits = V.sanQ.trim() ? sanctionHits(V.sanQ) : [];
  return '<div class="detail-sec sanctions-card no-print"><h3>Sanctions check - company or person</h3>' +
    '<p class="muted">Offline screen against three official lists baked into this file: US OFAC SDN, EU consolidated financial sanctions, and the DHS UFLPA Entity List. Name match is an alert, not proof - always open the official source and verify identifiers.</p>' +
    '<div class="classify-row"><input id="san-q" value="' + esc(V.sanQ) + '" placeholder="e.g. Ninestar, XPCC, Aerocaribbean" autocomplete="off"></div>' +
    '<div id="san-res">' +
    (V.sanQ.trim() ? (hits.length ? '<ul class="result-list">' + hits.map((h) => '<li class="sanction-hit"><div><strong>' + esc(h.name) + '</strong></div><div class="muted">' + esc(h.list) + (h.program ? ' - ' + esc(h.program) : '') + '</div></li>').join('') + '</ul>' : '<p class="muted">No name match in the baked lists.</p>') : '') +
    '</div>' +
    '<p class="muted src-line">Sources: <a href="https://sanctionslistservice.ofac.treas.gov/api/download/sdn.xml" target="_blank" rel="noreferrer">OFAC SDN XML</a> (downloaded 22 Sep 2026), <a href="https://data.europa.eu/data/datasets/consolidated-list-of-persons-groups-and-entities-subject-to-eu-financial-sanctions?locale=en" target="_blank" rel="noreferrer">EU consolidated list</a> (file generated 05/08/2026), <a href="https://www.dhs.gov/uflpa-entity-list" target="_blank" rel="noreferrer">DHS UFLPA Entity List</a> (checked 22 Sep 2026). ' + SANCTIONS.length.toLocaleString('en-US') + ' names. Not legal advice.</p>' +
    '</div>';
}
function paintSanctions() {
  const slot = el('san-slot');
  if (!slot) return;
  slot.innerHTML = sanctionsCardHtml();
  const q = el('san-q');
  if (!q) return;
  q.addEventListener('input', () => {
    V.sanQ = q.value;
    paintSanctions();
    const nq = el('san-q');
    nq.focus();
    nq.setSelectionRange(nq.value.length, nq.value.length);
  });
}

/* ---------- search page ---------- */
function chipRowHtml(title, keys) {
  if (!keys.length) return '';
  const chips = keys.map((k) => {
    const i = S.db.keyToIdx.get(k);
    if (i === undefined) return '';
    return '<span class="crumb-wrap">' + sysTagHtml(S.db.entries[i][0]) + codeBtn(i) + '</span>';
  }).join('');
  return '<div class="chip-sec no-print"><h3>' + esc(title) + '</h3><div class="crumbs">' + chips + '</div></div>';
}
const INSIDE_LIST = [
  'WCO HS 2022 - the international 2/4/6-digit standard every country shares (6,940 codes)',
  'India HSN - the full GST goods master at 4/6/8-digit with GST 2.0 rates filled in (21,790 codes)',
  'US HTS - the American tariff schedule, 4-10 digits with general duty rates (26,221 lines)',
  'EU CN 2026 - the European Combined Nomenclature at 8-digit (13,774 codes)',
  'UK Integrated Online Tariff - 30,547 headings and commodity lines',
  'Korea HSK 2026 - 19,407 headings and national lines',
  'Canada Customs Tariff 2026 - 19,264 headings and tariff/statistical lines',
  'Japan Tariff Schedule 2026 - 10,829 headings and statistical lines',
  'Australia Working Tariff - 15,662 headings and 8/10-digit tariff lines with general rates',
  'Brazil NCM - the Mercosur nomenclature at every level (15,156 codes, Portuguese)',
  'Taiwan Customs Import Tariff - 12,680 tariff lines with general duty rates (English + Chinese)',
  'New Zealand Working Tariff - 16,853 tariff items with normal rates',
  'Norway Tolltariffen - 10,763 headings and commodity lines (Norwegian)',
  'Singapore STCCED 2022 - 14,390 headings and 8-digit lines (excise only on a few categories)',
  'Israel Customs Tariff - 12,717 headings and tariff lines with duty and purchase-tax rates',
  'Mexico TIGIE - 18,176 partidas, fracciones and NICO lines with import duties (Spanish)',
];
function searchIdleHtml() {
  let s = '<div class="no-print">';
  if (!S.clientMode) s += chipRowHtml('Favorites', S.favs);
  if (!S.clientMode && S.shortlist.length) {
    s += '<div class="chip-sec no-print"><h3>Client shortlist (' + S.shortlist.length + ')</h3><p><button class="file-button is-compact" data-variant="secondary" id="open-sl">Open shortlist - export Excel/PDF</button></p></div>';
  }
  s += '<div id="san-slot"></div>';
  s += chipRowHtml('Recently viewed', S.recent);
  if (!S.clientMode) s += '<div class="chip-sec no-print"><p><button class="file-button is-compact" data-variant="secondary" id="client-on">Present to client - hide my notes and settings</button></p></div>';
  s += '<div class="about-box">' +
    '<p>One smart box does both jobs: type a product name and the list filters live, type digits and it becomes a code search, or tap Suggest best codes for an AI pick of the most likely code. Tap a result for the full detail page: what the code covers, how it links worldwide (international 6-digit to national to domestic tariff lines), and a PDF download.</p>' +
    '<p><button class="file-button is-compact" data-variant="secondary" id="browse-toggle">' + (V.browse ? 'Hide chapter browser' : 'Browse all 98 chapters') + '</button></p>' +
    (V.browse ? '<div class="chapter-grid">' + S.db.chapters.map((i) => '<button class="chapter-item" data-open="' + i + '"><strong>' + esc(S.db.entries[i][1]) + '</strong> ' + esc(pretty(S.db.entries[i][2])) + '</button>').join('') + '</div>' : '') +
    '<h3>What is inside</h3><ul>' + INSIDE_LIST.map((x) => '<li>' + esc(x) + '</li>').join('') + '</ul>' +
    '<h3>Sources</h3><ul>' + SYS.map((sy) => '<li><strong>' + sy.tag + '</strong>: ' + esc(sy.src) + '. <a href="' + sy.url + '" target="_blank" rel="noreferrer">Reference</a></li>').join('') + '</ul>' +
    '<p class="muted">Duty and GST rates change - always verify on the official portal before filing. Data as of the Sep 2026 build.</p>' +
    '</div></div>';
  return s;
}
function changesBannerHtml() {
  if (!S.changes.length) return '';
  return '<div class="alert-banner no-print"><strong>Dataset updated - ' + S.changes.length + ' of your saved codes changed:</strong><ul>' +
    S.changes.slice(0, 10).map((c) => {
      const i = S.db.keyToIdx.get(c.key);
      const cur = i !== undefined ? S.db.entries[i] : null;
      const sys = Number(c.key.split(':')[0]);
      return '<li>' + sysTagHtml(sys) + ' ' + esc(fmtCode(sys, c.key.split(':')[1])) + ': ' +
        esc(c.kind === 'removed' ? 'removed in the latest data (was: ' + c.oldDesc + ')' : (c.oldDuty !== (cur ? cur[5] || '' : '') ? 'duty ' + (c.oldDuty || 'none') + ' -> ' + (cur ? cur[5] || 'none' : '') : 'description updated')) + '</li>';
    }).join('') + '</ul>' +
    (S.changes.length > 10 ? '<p class="muted">and ' + (S.changes.length - 10) + ' more</p>' : '') +
    '<button class="file-button is-compact" data-variant="secondary" id="changes-ok">Got it</button></div>';
}
function paintSearch() {
  const idle = !V.q.trim();
  el('view').innerHTML = '<div class="page-pad">' +
    '<div id="banner-slot">' + changesBannerHtml() + (S.clientMode ? '<div class="alert-banner no-print"><strong>Client view</strong> - personal notes, favorites and settings are hidden. <button class="file-button is-compact" data-variant="secondary" id="client-off">Exit client view</button></div>' : '') + '</div>' +
    '<div class="search-stick no-print"><div class="search-grid smart-grid">' +
    '<label class="sfield"><span class="slabel">Product or code</span><input id="q-main" value="' + esc(V.q) + '" placeholder="Type any product or code - e.g. mobile phone, 8517, 85171300" autocomplete="off"></label>' +
    '<div class="sfield smart-btn"><button class="file-button is-compact" id="cls-go"' + (V.clsBusy || !V.q.trim() ? ' disabled' : '') + '>' + (V.clsBusy ? 'Thinking...' : 'Suggest best codes') + '</button></div>' +
    '</div>' +
    '<div class="chip-row no-print" id="sys-chips">' + [{ s: -1, t: 'All' }].concat(SYS.map((x, si) => ({ s: si, t: x.tag }))).map((c) => '<button class="chip' + (V.sysFilter === c.s ? ' on' : '') + '" data-sysf="' + c.s + '">' + c.t + '</button>').join('') + '</div></div>' +
    '<div id="cls-slot"></div>' +
    '<div id="res-slot"></div>' +
    '<div id="idle-slot">' + (idle ? searchIdleHtml() : '') + '</div>' +
    '</div>';
  const qm = el('q-main');
  qm.addEventListener('input', () => {
    V.q = qm.value;
    V.clsHits = null; V.clsOffline = null; V.clsErr = null;
    el('cls-go').disabled = V.clsBusy || !V.q.trim();
    paintResults(); paintIdle(); paintClassify();
  });
  qm.addEventListener('keydown', (ev) => { if (ev.key === 'Enter') classifyRun(); });
  el('cls-go').addEventListener('click', classifyRun);
  Array.prototype.forEach.call(el('sys-chips').querySelectorAll('[data-sysf]'), (b) => {
    b.addEventListener('click', () => {
      V.sysFilter = parseInt(b.getAttribute('data-sysf'), 10);
      Array.prototype.forEach.call(el('sys-chips').querySelectorAll('.chip'), (x) => x.classList.remove('on'));
      b.classList.add('on');
      paintResults();
    });
  });
  const okB = el('changes-ok');
  if (okB) okB.addEventListener('click', () => { S.changes = []; paintSearch(); });
  const cOff = el('client-off');
  if (cOff) cOff.addEventListener('click', () => { S.clientMode = false; paintSearch(); });
  paintClassify();
  paintResults();
  paintIdle();
}
function paintIdle() {
  const slot = el('idle-slot');
  if (!slot) return;
  const idle = !V.q.trim();
  slot.innerHTML = idle ? searchIdleHtml() : '';
  if (!idle) return;
  bindOpens(slot);
  paintSanctions();
  const osl = el('open-sl');
  if (osl) osl.addEventListener('click', () => { S.showList = true; render(); });
  const con = el('client-on');
  if (con) con.addEventListener('click', () => { S.clientMode = true; paintSearch(); });
  const bt = el('browse-toggle');
  if (bt) bt.addEventListener('click', () => { V.browse = !V.browse; paintIdle(); });
}
function paintResults() {
  const slot = el('res-slot');
  if (!slot) return;
  const idle = !V.q.trim();
  if (idle) { slot.innerHTML = ''; return; }
  const r = smartSearch(S.db, V.q, V.sysFilter);
  const fam = groupFamilies(S.db, r.out);
  const shown = fam.slice(0, 60);
  let s = '';
  if (fam.length) {
    s += '<p class="muted no-print">' + (r.out.length >= SEARCH_CAP ? SEARCH_CAP + '+' : fam.length) + ' ' + (fam.length === 1 ? 'match' : 'matches') + (r.fuzzy ? ' (spell-corrected)' : '') + (fam.length > 60 ? ' - showing first 60. Type more to narrow down.' : '') + ' One row per product - open it for every country\'s code and rate.</p>';
    s += '<ul class="result-list no-print">' + shown.map((i) => {
      const e = S.db.entries[i];
      return '<li><button class="result-link linkbtn-block" data-open="' + i + '">' + (e[0] !== 0 ? sysTagHtml(e[0]) : '') + '<span class="rcode">' + esc(fmtCode(e[0], e[1])) + '</span><span class="rdesc">' + esc(pretty(e[2])) + '</span></button></li>';
    }).join('') + '</ul>';
  } else {
    s = '<p class="muted">No matches. Try fewer words or a shorter code prefix.</p>';
  }
  slot.innerHTML = s;
  bindOpens(slot);
}

/* ---------- controller ---------- */
function toggleFav(k) {
  S.favs = S.favs.includes(k) ? S.favs.filter((x) => x !== k) : [k].concat(S.favs).slice(0, 30);
  saveJson('hsn-favs', S.favs);
}
function toggleShort(k) {
  S.shortlist = S.shortlist.includes(k) ? S.shortlist.filter((x) => x !== k) : [k].concat(S.shortlist).slice(0, 200);
  saveJson('hsn-shortlist', S.shortlist);
}
function setNote(k, v) {
  if (v.trim()) S.notes[k] = v; else delete S.notes[k];
  saveJson('hsn-notes', S.notes);
}
function openEntry(i) {
  S.sel = i; S.cmpA = null; S.cmpB = null; S.showList = false;
  V.dIdx = i; V.needKey = false; V.busy = false; V.briefError = null; V.copied = false; V.settingsOpen = false;
  const e = S.db.entries[i];
  const k = e[0] + ':' + e[1];
  try { history.replaceState(null, '', '#code=' + k); } catch { /* ignore */ }
  S.recent = [k].concat(S.recent.filter((x) => x !== k)).slice(0, 12);
  saveJson('hsn-recent', S.recent);
  render();
  window.scrollTo(0, 0);
}
function back() {
  S.sel = null; S.cmpA = null; S.cmpB = null; S.showList = false;
  try { history.replaceState(null, '', location.pathname + location.search); } catch { /* ignore */ }
  render();
}
function paintNav() { /* nav count refresh placeholder - shortlist count shown on search idle */ }
function render() {
  if (S.cmpA !== null) paintCompare();
  else if (S.showList) paintShortlist();
  else if (S.sel !== null) paintDetail();
  else paintSearch();
}

function headerHtml() {
  return '<div class="app-head no-print"><h1 class="app-title">Worldwide HSN Code Finder</h1>' +
    '<p class="app-fact">' + SYS.length + ' official systems - ' + S.db.entries.length.toLocaleString('en-US') + ' codes</p>' +
    '<p class="app-intro">Search WCO, India, USA, EU, UK, Korea, Canada, Japan, Australia, Brazil, Taiwan, New Zealand, Norway, Singapore, Israel and Mexico. Every code links international roots to national and statistical lines, with detail and PDF.</p></div>';
}
function footerHtml() {
  return '<footer class="app-foot no-print">Copyright (c) 2026 ' + esc(OWNER) + '. All rights reserved.<br>Tariff descriptions and duty rates compiled from the official public government and WCO sources credited above; verify against the official source before filing.</footer>';
}

export function boot(rootEl) {
  rootEl.innerHTML = '<div class="app-shell"><div class="app-head"><h1 class="app-title">Worldwide HSN Code Finder</h1><p class="muted">Loading 265,169 codes...</p></div></div>';
  decodeData().then((entries) => {
    S.db = loadDb(entries);
    S.changes = checkChanges(S.db, Array.from(new Set(loadKeys('hsn-favs').concat(loadKeys('hsn-shortlist')))));
    rootEl.innerHTML = '<div class="app-shell">' + headerHtml() + '<div id="view"></div>' + footerHtml() + '</div>';
    const m = location.hash.match(/#code=(\d+):(\d+)/);
    if (m) {
      const i = S.db.keyToIdx.get(Number(m[1]) + ':' + m[2]);
      if (i !== undefined) { S.sel = i; V.dIdx = i; }
    }
    render();
  }).catch((e) => {
    rootEl.innerHTML = '<div class="app-shell"><div class="app-head"><h1 class="app-title">Worldwide HSN Code Finder</h1><div class="page-pad"><p>Could not load the dataset in this browser: ' + esc(String(e)) + '</p></div></div></div>';
  });
}
