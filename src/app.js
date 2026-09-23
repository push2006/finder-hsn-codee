/* Worldwide HSN Code Finder
   Plain HTML/CSS/JavaScript build - no frameworks, no third-party runtime code.
   Copyright (c) 2026 Push. All rights reserved.
   Tariff descriptions and duty rates are compiled from the official public
   government and WCO sources credited in the app's Sources section. */
import { DATA_B64 } from './data';
import { GST_MAP } from './gstmap';
import { TRADE_CH } from './trademap';
import { TRADE6 } from './tradevalues';
import { TRADE_PARTNERS, TRADE_PARTNERS_YEAR } from './tradepartners';
import { TRADE_TREND, TRADE_TREND_YEARS } from './tradetrend';
import { TRADE_SEASON, TRADE_SEASON_YEARS } from './tradeseson';
import { FTA_UAE, FTA_UAE_UNPARSED, FTA_AU } from './fta';
import { CERT_RULES, CERT_SRC } from './certs';
import { ADD_MEASURES, ADD_ONGOING, ADD_SRC } from './add';
import { SANC_ZONES, SANC_SRC } from './sanc';
import { DOC_BASE_OUT, DOC_BASE_IN, DOC_EXTRA, PORTS, DOC_SRC } from './docs';
import { SCOMET } from './scomet';
import { RODTEP_DTA, RODTEP_SEZ } from './rodtep';
import { ALIASES } from './aliases';
import { SANCTIONS, SANCTIONS_META } from './sanctions';

const OWNER = 'Push';
const SYS = [
  { tag: 'HS', name: 'WCO HS 2022 (international)', src: 'UN Comtrade extraction of the WCO HS 2022 nomenclature', url: 'https://comtrade.un.org/data/doc/api/' },
  { tag: 'IN', name: 'India HSN (GST goods master)', src: 'Government-format HSN_SAC workbook, mirrored 22 Sep 2026 from the official HSN/SAC workbook, joined with GST 2.0 rates from Notification 9/2025-Integrated Tax (Rate), 17 Sep 2025, and basic customs duty (BCD) standard rates from the CBIC Customs Tariff First Schedule as on 30.06.2025 (11,387 lines; statutory rates - effective rates vary by exemption notification)', url: 'https://cbic-gst.gov.in/gst-goods-services-rates.html' },
  { tag: 'US', name: 'US HTS (Harmonized Tariff Schedule)', src: 'USITC official HTS export, includes general duty rates', url: 'https://hts.usitc.gov/' },
  { tag: 'EU', name: 'EU CN 2026 (Combined Nomenclature)', src: 'Official Journal Regulation (EU) 2025/1926 (CN 2026), conventional (MFN) duty rates baked for 9,529 of 9,791 eight-digit lines - seasonal footnote rates and tariff-quota-only lines left unbaked', url: 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=OJ:L_202501926' },
  { tag: 'UK', name: 'UK Integrated Online Tariff', src: 'UK Global Tariff official dataset (Department for Business and Trade), version v4.0.1608, third-country (MFN) duty baked for 14,907 declarable ten-digit lines - conditional relief rates and suspensions excluded', url: 'https://data.api.trade.gov.uk/v1/datasets/uk-tariff-2021-01-01/versions/v4.0.1608/metadata?format=html' },
  { tag: 'KR', name: 'Korea HSK 2026', src: 'Korea Customs Service official HS code workbook, 1 Jan 2026, with basic duty rates (기본세율) from the KCS CLIP tariff rate table, applicable year 2026 (11,326 of 11,327 ten-digit lines)', url: 'https://www.data.go.kr/data/15049722/fileData.do' },
  { tag: 'CA', name: 'Canada Customs Tariff 2026', src: 'Canada Border Services Agency official 2026 tariff by chapter', url: 'https://www.cbsa-asfc.gc.ca/trade-commerce/tariff-tarif/2026/menu-eng.html' },
  { tag: 'JP', name: 'Japan Tariff Schedule 2026', src: 'Japan Customs official tariff schedule, 1 Jan 2026', url: 'https://www.customs.go.jp/english/tariff/2026_01_01/index.htm' },
  { tag: 'AU', name: 'Australia Working Tariff (Schedule 3)', src: 'Australian Border Force Combined Australian Customs Tariff Nomenclature and Statistical Classification, current working tariff', url: 'https://www.abf.gov.au/importing-exporting-and-manufacturing/tariff-classification/current-tariff' },
  { tag: 'BR', name: 'Brazil NCM (Mercosur nomenclature)', src: 'Receita Federal / Siscomex Classif official NCM table, in force 23 Sep 2026 (Res. Gecex 926/2026), with II import duty from the Mercosur Common External Tariff (TEC), official MDIC consolidated Anexo I of Res. Gecex 272/2021 updated 08-09-2026 (all 10,515 eight-digit NCM lines) - BK/BIT ex-tarifario reductions and Anexos II-X exception rates not baked', url: 'https://www.gov.br/receitafederal/pt-br/assuntos/aduana-e-comercio-exterior/classificacao-fiscal-de-mercadorias/download-ncm-nomenclatura-comum-do-mercosul' },
  { tag: 'TW', name: 'Taiwan Customs Import Tariff', src: 'Taiwan Customs Administration official import duty open data (data.gov.tw dataset 80871)', url: 'https://data.gov.tw/en/datasets/80871' },
  { tag: 'NZ', name: 'New Zealand Working Tariff (CusMod)', src: 'New Zealand Customs Service official CusMod tariff data files, updated nightly', url: 'https://www.customs.govt.nz/business/tariffs/tariff-classifications-and-rates/' },
  { tag: 'NO', name: 'Norway Customs Tariff (Tolltariffen)', src: 'Norwegian Customs (Tolletaten) official open data: tolltariffstruktur nomenclature + tollavgiftssats ordinary customs duty rates (ordinær toll, country group TALL), current 23 Sep 2026 - all 7,436 eight-digit lines baked; EFTA/EU, GSP and other preferential rates not baked', url: 'https://data.toll.no/no/dataset/tolltariffstruktur' },
  { tag: 'SG', name: 'Singapore STCCED 2022', src: 'Singapore Customs official Singapore Trade Classification, Customs and Excise Duties 2022 (excise applies only to alcohol, tobacco, fuel and motor vehicles, so most lines show no duty)', url: 'https://www.customs.gov.sg/businesses/harmonized-system-hs-classification-of-goods/' },
  { tag: 'IL', name: 'Israel Customs Tariff and Purchase Tax', src: 'Israel Tax Authority official customs book open dataset (data.gov.il, updated 21 Sep 2026), English edition', url: 'https://data.gov.il/dataset/customsbook' },
  { tag: 'MX', name: 'Mexico TIGIE (LIGIE unified)', src: 'Secretaria de Economia official unified LIGIE text with NICO statistical lines, 28 Jul 2025 base', url: 'https://www.snice.gob.mx/cs/avi/snice/ligie.info22.html' },
  { tag: 'HK', name: 'Hong Kong HKHS 2026', src: 'Census and Statistics Department official Hong Kong Harmonized System 2026 CSV via data.gov.hk, bilingual. Hong Kong is a free port - no general import duty (excise applies only to liquor, tobacco, hydrocarbon oil and methyl alcohol), so lines show no duty', url: 'https://data.gov.hk/en-data/dataset/hk-censtatd-tablechart-b2xx0023' },
  { tag: 'ZA', name: 'South Africa Customs Tariff (Schedule 1 Part 1)', src: 'South African Revenue Service (SARS) official Schedule 1 Part 1 (chapters 1-99) of the Customs and Excise Act, tariff dated 28 Aug 2026, general (MFN) rate column; EU/UK, EFTA, SADC, MERCOSUR and AfCFTA preferential columns not baked', url: 'https://www.sars.gov.za/legal-lprim-ce-sch1p1chpt1-to-99-schedule-no-1-part-1-chapters-1-to-99/' },
  { tag: 'PE', name: 'Peru Arancel de Aduanas (NANDINA)', src: 'SUNAT official live tariff tables (NANDINA nomenclature + NANDTASA rates, aduanet servlet, downloaded 22 Sep 2026), ad valorem column; IGV and other internal taxes not baked', url: 'http://www.aduanet.gob.pe/ol-ad-tg/ServletTGConsultaTablas' },
  { tag: 'SAC', name: 'India SAC (GST services master)', src: 'Official HSN/SAC services workbook (Services Accounting Codes), downloaded 22 Sep 2026 from the GST portal HSN/SAC search', url: 'https://services.gst.gov.in/services/searchhsnsac' },
  { tag: 'CN', name: 'China Customs Import Tariff (MFN base rates)', src: 'RCEP Schedule of Tariff Commitments of China (official treaty text, English), Base Rate column = China MFN rate at RCEP signing (2020), 8-digit national tariff lines on the pre-2022 HS base; subheadings without an HS 2022 WCO description show code-only hierarchy rows', url: 'https://www.mfat.govt.nz/en/trade/free-trade-agreements/free-trade-agreements-in-force/regional-comprehensive-economic-partnership-rcep/' },
  { tag: 'AE', name: 'UAE Customs Tariff (GCC common external tariff)', src: 'India-UAE CEPA Appendix 2A-A official UAE tariff schedule (English), Base Rate column = GCC common external tariff (most lines 0% or 5%; prohibited and special-goods lines marked). UAE moved to 12-digit display in 2025 (Cabinet Resolution 119/2024) - first 8 digits unchanged', url: 'https://commerce.gov.in/international-trade/trade-agreements/' },
];

const TRADE_YEAR = 2025;
const DATA_BUILD = '2026-09-23-gen28';
// Gemini model chain lives at the AI swap points below (near the key lines).
let geminiModelUsed = '';
let geminiGrounded = false;
const geminiModelLabel = () => geminiModelUsed || GEMINI_MODELS[0];
let groqModelUsed = '';
// Built-in AI for everyone: AI_PROXY_URL points at the free Render proxy
// service (proxy.js in this repo). The proxy holds the API keys server-side in
// environment variables, so no provider key ships to browsers and every visitor
// gets AI picks + AI reports without pasting anything. Rotation order: Groq,
// Gemini, Mistral, NVIDIA - the proxy tries each in turn. A key pasted in AI
// settings always overrides the proxy. The token is visible in this public
// bundle - a speed bump against drive-by abuse, not a true secret; the proxy
// also rate-limits per IP.
const AI_PROXY_URL = 'https://hsn-ai-proxy.onrender.com';
const AI_PROXY_TOKEN = '648772556a62e577d379272febf550b9e28c5723'; // must match APP_SECRET on the proxy service
// Live ship positions near India ports: served by the SAME hsn-ai-proxy
// service (proxy.js) - it holds the AISStream key server-side alongside the AI
// provider keys; browsers only ever call it with the same speed-bump token.
const AIS_PROXY_URL = 'https://hsn-ai-proxy.onrender.com';
// Built-in shared keys (optional second choice): paste your own free keys here
// to give every visitor AI without a worker. WARNING: anyone can read these in
// the page source and bots scan public repos - a shared key can be stolen and
// its daily quota burned. The worker option above keeps keys hidden. Comma-
// separate several keys to rotate when one hits its daily limit.
const BUILTIN_GEMINI_KEYS = '';
const BUILTIN_GROQ_KEYS = '';
const BUILTIN_MISTRAL_KEYS = '';
const BUILTIN_NVIDIA_KEYS = '';

// ==== AI model swap points: change a model by editing one line ====
const GEMINI_MODEL = 'gemini-3.8-flash'; // report writing; free tier confirmed 22 Sep 2026. Google Search grounding is NOT in the free tier - the report call retries ungrounded automatically.
const GROQ_MODEL = 'openai/gpt-oss-120b'; // instant best-code picks
const GROQ_MODEL_FALLBACK = 'openai/gpt-oss-20b'; // used if the primary is busy or retired
const GROQ_MODELS = [GROQ_MODEL, GROQ_MODEL_FALLBACK];
// Gemini chain: tried in order when a model is retired, busy or quota-maxed.
const GEMINI_MODELS = [GEMINI_MODEL, 'gemini-3.7-flash', 'gemini-3.6-flash', 'gemini-3.5-flash-lite', 'gemini-3.1-flash-lite', 'gemini-2.5-flash-lite', 'gemini-2.5-flash'];
// Extra rotation members: Mistral (free tier on la Plateforme) and NVIDIA NIM
// (free key, 90-day expiry - an expired key is skipped, never fatal).
const MISTRAL_MODELS = ['mistral-small-latest', 'open-mistral-nemo', 'ministral-8b-latest'];
const NVIDIA_MODELS = ['meta/llama-3.3-70b-instruct', 'meta/llama-3.1-70b-instruct', 'meta/llama-3.1-8b-instruct'];
let mistralModelUsed = '', nvidiaModelUsed = '';
const PROVIDER_ORDER = ['groq', 'gemini', 'mistral', 'nvidia'];
const PROVIDER_LABEL = { groq: 'Groq', gemini: 'Gemini', mistral: 'Mistral', nvidia: 'NVIDIA' };
const builtinPools = { gemini: { off: 0 }, groq: { off: 0 }, mistral: { off: 0 }, nvidia: { off: 0 } };
const builtinKeys = (kind) => String(kind === 'groq' ? BUILTIN_GROQ_KEYS : kind === 'mistral' ? BUILTIN_MISTRAL_KEYS : kind === 'nvidia' ? BUILTIN_NVIDIA_KEYS : BUILTIN_GEMINI_KEYS).split(',').map((k) => k.trim()).filter(Boolean);
const aiAvailable = () => Boolean(V.apiKey || AI_PROXY_URL || BUILTIN_GEMINI_KEYS.trim() || BUILTIN_GROQ_KEYS.trim() || BUILTIN_MISTRAL_KEYS.trim() || BUILTIN_NVIDIA_KEYS.trim());
let aiSharedKey = false;
let aiProviderUsed = 'gemini';
let aiLiveSearch = false;
let aiCrossNote = null; // { by, ok, issues } - second-provider fact-check result for reports
// Second-opinion check: when both providers' keys exist, the other provider reviews the answer.
let aiCrossBy = null;
async function aiCrossCall(producer, prompt, opts) {
  aiCrossBy = null;
  for (const target of PROVIDER_ORDER) {
    if (target === producer) continue;
    try {
      if (V.apiKey && ownProvider() === target) { const r = await PROVIDER_CALL[target](V.apiKey, prompt, opts); aiCrossBy = target; return r; }
      const pool = builtinKeys(target);
      if (pool.length) { const r = await PROVIDER_CALL[target](pool, prompt, opts); aiCrossBy = target; return r; }
      if (AI_PROXY_URL) { const r = await PROVIDER_CALL[target]('', prompt, opts); aiCrossBy = target; return r; }
    } catch (e) { /* second opinion is best-effort; never blocks the answer */ }
  }
  return null;
}
const aiHasBoth = () => {
  const set = new Set();
  if (V.apiKey) set.add(ownProvider());
  if (AI_PROXY_URL) { set.add('gemini'); set.add('groq'); set.add('mistral'); set.add('nvidia'); }
  if (builtinKeys('groq').length) set.add('groq');
  if (builtinKeys('gemini').length) set.add('gemini');
  if (builtinKeys('mistral').length) set.add('mistral');
  if (builtinKeys('nvidia').length) set.add('nvidia');
  return set.size >= 2;
};
const geminiAiLabel = () => (aiProviderUsed === 'groq'
  ? 'Groq ' + (groqModelUsed || GROQ_MODELS[0]) + ', ' + (aiLiveSearch ? 'live web search via Groq browser search (Exa)' : 'model knowledge only - no live search')
  : aiProviderUsed === 'mistral'
  ? 'Mistral ' + (mistralModelUsed || MISTRAL_MODELS[0]) + ', model knowledge only - no live search'
  : aiProviderUsed === 'nvidia'
  ? 'NVIDIA ' + (nvidiaModelUsed || NVIDIA_MODELS[0]) + ', model knowledge only - no live search'
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
const ownProvider = () => {
  if (['groq', 'gemini', 'mistral', 'nvidia'].includes(V.apiProvider)) return V.apiProvider;
  const k = V.apiKey.trim();
  if (/^gsk_/i.test(k)) return 'groq';
  if (/^nvapi-/i.test(k)) return 'nvidia';
  return 'gemini';
};
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
      res = await fetch(url, { method: 'POST', headers, body: JSON.stringify(Object.assign({ model: m, messages: [{ role: 'user', content: prompt }], temperature: opts.temperature, max_tokens: opts.maxTokens }, opts.tools ? { tools: opts.tools } : {})) });
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
// Mistral + NVIDIA speak the same OpenAI chat-completions shape as Groq.
async function oaiPoolPost(kind, url, models, apiKey, prompt, opts) {
  if (Array.isArray(apiKey)) {
    const pool = builtinPools[kind];
    let lastErr = null;
    for (let k = 0; k < apiKey.length; k++) {
      const ki = (pool.off + k) % apiKey.length;
      try { const r = await oaiPoolPost(kind, url, models, apiKey[ki], prompt, opts); pool.off = ki; return r; }
      catch (err) {
        lastErr = err;
        if (/not accepted|refused|limit reached|expired/i.test(err.message || '')) continue;
        throw err;
      }
    }
    throw lastErr;
  }
  const headers = { 'Content-Type': 'application/json' };
  if (apiKey) headers.Authorization = 'Bearer ' + apiKey.trim();
  else if (AI_PROXY_TOKEN) headers['x-app-token'] = AI_PROXY_TOKEN;
  const finalUrl = apiKey ? url : AI_PROXY_URL + '/' + kind + '/v1/chat/completions';
  const label = kind === 'mistral' ? 'Mistral' : 'NVIDIA';
  let quotaHit = false, transientHit = false, netFail = false, authFail = false;
  for (const m of models) {
    let res, data;
    try {
      res = await fetch(finalUrl, { method: 'POST', headers, body: JSON.stringify({ model: m, messages: [{ role: 'user', content: prompt }], temperature: opts.temperature, max_tokens: opts.maxTokens }) });
      data = await res.json().catch(() => ({}));
    } catch (err) { netFail = true; continue; }
    if (res.ok) { if (kind === 'mistral') mistralModelUsed = m; else nvidiaModelUsed = m; return String((((data.choices || [])[0] || {}).message || {}).content || ''); }
    const msg = (data && data.error && (data.error.message || data.error)) || (label + ' API error ' + res.status);
    if (/keys configured|not configured/i.test(msg)) throw new Error('AI provider not configured on the server: ' + msg);
    if (apiKey && (res.status === 401 || res.status === 403)) { authFail = true; break; }
    if (res.status === 429 || res.status === 413) { quotaHit = true; continue; }
    if (res.status === 503 || res.status === 500 || /overloaded|try again later/i.test(msg)) { transientHit = true; continue; }
    if (res.status === 404 || /decommissioned|no longer supported|does not exist|not found/i.test(msg)) continue;
    throw new Error('AI generation failed (' + msg + '). The offline data report still works - try again later.');
  }
  if (authFail) throw new Error(kind === 'nvidia' ? 'NVIDIA free key expired (90-day limit) - rotating on.' : 'The ' + label + ' key was not accepted. Check the key in AI settings.');
  if (quotaHit) throw new Error('Free ' + label + ' limit reached for now. Try again after the quota resets.');
  if (transientHit) throw new Error('The AI models are busy right now. Wait a minute and try again.');
  if (netFail) throw new Error('No connection to the AI service. Check the internet connection and try again.');
  throw new Error('Live AI is temporarily unavailable. The offline data report still works - try again later.');
}
const mistralPost = (apiKey, prompt, opts) => oaiPoolPost('mistral', 'https://api.mistral.ai/v1/chat/completions', MISTRAL_MODELS, apiKey, prompt, opts);
const nvidiaPost = (apiKey, prompt, opts) => oaiPoolPost('nvidia', 'https://integrate.api.nvidia.com/v1/chat/completions', NVIDIA_MODELS, apiKey, prompt, opts);
const PROVIDER_CALL = { groq: (k, p, o) => groqPost(k, p, o), gemini: (k, p, o) => geminiText(k, p, o, false), mistral: (k, p, o) => mistralPost(k, p, o), nvidia: (k, p, o) => nvidiaPost(k, p, o) };
async function aiPickText(prompt, opts) {
  aiLiveSearch = false;
  if (V.apiKey) {
    const p = ownProvider();
    aiSharedKey = false; aiProviderUsed = p;
    try { return await PROVIDER_CALL[p](V.apiKey, prompt, opts); }
    catch (err) {
      if (/not accepted|refused/i.test(err.message || '')) throw err;
      for (const prov of PROVIDER_ORDER) {
        if (prov === p) continue;
        const alt = builtinKeys(prov);
        if (!alt.length) continue;
        aiSharedKey = true; aiProviderUsed = prov;
        try { return await PROVIDER_CALL[prov](alt, prompt, opts); } catch (e2) { /* try the next provider */ }
      }
      throw err;
    }
  }
  const errs = [];
  for (const prov of PROVIDER_ORDER) {
    if (AI_PROXY_URL) {
      aiSharedKey = false; aiProviderUsed = prov;
      try { return await PROVIDER_CALL[prov]('', prompt, opts); } catch (err) { if (!/not configured/i.test(err.message || '')) errs.push(err); }
    }
    const pool = builtinKeys(prov);
    if (!pool.length) continue;
    aiSharedKey = true; aiProviderUsed = prov;
    try { return await PROVIDER_CALL[prov](pool, prompt, opts); } catch (err) { errs.push(err); }
  }
  if (!errs.length) throw new Error('no-ai');
  if (errs.every((e) => /limit reached|expired/i.test(e.message || ''))) throw new Error('Free AI limit reached on every provider for now. Try again after the quota resets.');
  throw errs[errs.length - 1];
}
async function aiReportText(prompt, grounded, opts) {
  aiLiveSearch = false;
  const geminiReport = (key, shared) => { aiSharedKey = shared; aiProviderUsed = 'gemini'; return geminiText(key, prompt, opts, grounded); };
  const groqReport = async (key, shared) => {
    // Direct Groq keys can use the built-in browser_search tool for live-web reports.
    aiSharedKey = shared; aiProviderUsed = 'groq';
    const livePrompt = prompt.replace('Use Google Search for current facts.', 'Use live web search for current facts. Write facts only - no inline citation markers or footnote symbols.');
    try { const t = await groqPost(key, livePrompt, Object.assign({}, opts, { tools: [{ type: 'browser_search' }] })); aiLiveSearch = true; return t; }
    catch (err) { aiLiveSearch = false; return groqPost(key, prompt, opts); }
  };
  if (V.apiKey) {
    const p = ownProvider();
    try { return p === 'groq' ? await groqReport(V.apiKey, false) : p === 'gemini' ? await geminiReport(V.apiKey, false) : (aiSharedKey = false, aiProviderUsed = p, await PROVIDER_CALL[p](V.apiKey, prompt, opts)); }
    catch (err) {
      if (/not accepted|refused/i.test(err.message || '')) throw err;
      for (const prov of PROVIDER_ORDER) {
        if (prov === p) continue;
        const alt = builtinKeys(prov);
        if (!alt.length) continue;
        try { return prov === 'groq' ? await groqReport(alt, true) : prov === 'gemini' ? await geminiReport(alt, true) : (aiSharedKey = true, aiProviderUsed = prov, await PROVIDER_CALL[prov](alt, prompt, opts)); } catch (e2) { /* try the next provider */ }
      }
      throw err;
    }
  }
  const errs = [];
  for (const prov of PROVIDER_ORDER) {
    if (AI_PROXY_URL) {
      aiSharedKey = false; aiProviderUsed = prov;
      try { return prov === 'groq' ? await groqReport('', true) : prov === 'gemini' ? await geminiReport('', true) : await PROVIDER_CALL[prov]('', prompt, opts); } catch (err) { if (!/not configured/i.test(err.message || '')) errs.push(err); }
    }
    const pool = builtinKeys(prov);
    if (!pool.length) continue;
    try { return prov === 'groq' ? await groqReport(pool, true) : prov === 'gemini' ? await geminiReport(pool, true) : (aiSharedKey = true, aiProviderUsed = prov, await PROVIDER_CALL[prov](pool, prompt, opts)); } catch (err) { errs.push(err); }
  }
  if (!errs.length) throw new Error('no-ai');
  if (errs.every((e) => /limit reached|expired/i.test(e.message || ''))) throw new Error('Free AI limit reached on every provider for now. Try again after the quota resets.');
  throw errs[errs.length - 1];
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
    /* Short words (under 5 chars) must match a whole word, not sit inside a
       longer one - otherwise pen hits cycloterPENic and susPENsion. Longer
       words keep substring matching for compound nomenclature wording. */
    const matchers = variants.map((vs) => vs.map((v) =>
      v.length < 5 ? new RegExp('(^|[^\\p{L}\\p{N}])(' + stemForms(v).join('|') + ')(s|es)?([^\\p{L}\\p{N}]|$)', 'u') : null));
    const out = [];
    for (let i = 0; i < db.entries.length; i++) {
      const e = db.entries[i];
      if (sysFilter >= 0 && e[0] !== sysFilter) continue;
      if (!codeOk(e)) continue;
      if (variants.length) {
        const h = db.hay[i];
        let ok = true;
        for (let vi = 0; vi < variants.length; vi++) {
          const vs = variants[vi], ms = matchers[vi];
          let hit = false;
          for (let k = 0; k < vs.length; k++) { if (ms[k] ? ms[k].test(h) : h.includes(vs[k])) { hit = true; break; } }
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
  const mkTokRes = (ws) => ws.map((w) => new RegExp('(^|[^\\p{L}\\p{N}])(' + stemForms(w).join('|') + ')(s|es)?([^\\p{L}\\p{N}]|$)', 'u'));  /* hyphen is a boundary: solid-state = two tokens */
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
      /* Spec: the direct deepest national line outranks its family/parent (every system). */
      const sysR = db.entries[i][0] === 0 ? 1 : 0;
      return [ph, -tok, nec, sysR, posSum, -db.entries[i][1].length, h.length, i];
    });
    keyed.sort((a, b) => {
      for (let k = 0; k < 7; k++) { if (a[k] !== b[k]) return a[k] - b[k]; }
      return a[7] - b[7];
    });
    return keyed.map((x) => x[7]);
  };
  const strict = run(words.map((w) => [w]));
  // Typo correction runs before the alias lookup so a misspelt phrase still
  // hits its curated word-sets ('high speed disel' -> 'high speed diesel').
  const longW = words.filter((w) => w.length >= 5);
  const canFuzzy = strict.length < 5 && words.length > 0 && longW.length > 0 && longW.length <= 3;
  const variants = canFuzzy ? words.map((w) => {
    const vs = [w];
    if (w.length >= 5) { for (const v of db.vocab) { if (Math.abs(v.length - w.length) <= 1 && v[0] === w[0] && lev1(w, v)) vs.push(v); if (vs.length > 12) break; } }
    return vs;
  }) : null;
  const normQ = descQ.toLowerCase().trim().replace(/\s+/g, ' ');
  const correctedQ = variants ? words.map((w, wi) => variants[wi][1] || w).join(' ') : normQ;
  const alias = ALIASES[normQ] || (correctedQ !== normQ ? ALIASES[correctedQ] : null);
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
    return { out: buckets.flatMap((b, si) => rank(b, alias[si])).concat(rank(rest)), fuzzy: !ALIASES[normQ] && correctedQ !== normQ };
  }
  if (strict.length >= 5 || !words.length || !variants) return { out: rank(strict), fuzzy: false };
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
    const find = (d) => {
      const out = [];
      for (let i = 0; i < db.entries.length; i++) {
        const e = db.entries[i];
        if (sysFilter >= 0 && e[0] !== sysFilter) continue;
        if (e[1].startsWith(d)) { out.push(i); if (out.length >= 4000) break; }
      }
      return out;
    };
    const out = find(digits);
    if (out.length) {
      // A full national code (7+ digits) that exists gets its own line first,
      // before the 6-digit family group.
      const exact = digits.length >= 7 ? out.filter((i) => db.entries[i][1] === digits).sort((a, b) => {
        const pri = (i) => { const s0 = db.entries[i][0]; return s0 === 1 ? 0 : s0 === 0 ? 1 : 2; };
        return pri(a) - pri(b) || db.entries[a][0] - db.entries[b][0];
      }) : null;
      return exact && exact.length ? { out, fuzzy: false, exact } : { out, fuzzy: false };
    }
    if (digits.length > 6) {
      const root6 = digits.slice(0, 6);
      const fb = find(root6);
      if (fb.length) return { out: fb, fuzzy: false, note: 'No free-data line covers ' + digits + ' (' + digits.length + ' digits). Showing the international 6-digit code ' + root6 + ' and its family - open it to see every country\'s national tariff line under it.' };
    }
    if (digits.length > 4) {
      const root4 = digits.slice(0, 4);
      const fb = find(root4);
      if (fb.length) return { out: fb, fuzzy: false, note: 'No code starting ' + digits + ' - showing the ' + root4 + ' heading family.' };
    }
    return { out: [], fuzzy: false };
  }
  return search(db, t, '', '', sysFilter);
}

function familyOf(code) {
  return code.length >= 6 ? 'S' + code.slice(0, 6) : 'H' + code;
}
function groupFamilies(db, idxs) {
  const rep = new Map();
  const order = [];
  // The direct deepest national line represents the family; the WCO/parent
  // heading is used only when no national line matched (direct-code spec).
  const score = (e) => (e[0] === 0 ? 1000000000 : 0) + e[0] * 1000000 + (30 - e[1].length) * 100;
  for (const i of idxs) {
    const e = db.entries[i];
    const fk = familyOf(e[1]);
    const cur = rep.get(fk);
    if (cur === undefined) { rep.set(fk, i); order.push(fk); continue; }
    if (score(e) < score(db.entries[cur])) rep.set(fk, i);
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
  ships: false, shipsPort: 'ALL', shipsData: null, shipsBusy: false, shipsErr: null, shipsAt: 0,
  tcur: false, tcurData: null, tcurBusy: false, tcurErr: false,
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

function fmtQty(v, unit) {
  const n = Number(v) || 0;
  const a = Math.abs(n);
  const s = a >= 1e9 ? (n / 1e9).toFixed(1).replace(/\.0$/, '') + 'B' : a >= 1e6 ? (n / 1e6).toFixed(1).replace(/\.0$/, '') + 'M' : a >= 1e3 ? (n / 1e3).toFixed(1).replace(/\.0$/, '') + 'K' : String(Math.round(n));
  return s + (unit ? ' ' + unit : '');
}
function usdPerKg(value, kg) {
  if (!kg) return '';
  const v = value / kg;
  return v >= 100 ? '$' + Math.round(v).toLocaleString('en-US') + '/kg' : v >= 1 ? '$' + v.toFixed(1).replace(/\.0$/, '') + '/kg' : '$' + (Math.round(v * 100) / 100) + '/kg';
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

function parseAdvalorem(d) {
  const s = String(d || '').trim();
  if (!s) return null;
  if (/^free\b|^0\s*%/i.test(s)) return 0;
  const m = s.match(/(\d+(?:\.\d+)?)\s*%/);
  return m ? parseFloat(m[1]) : null;
}
function lcMoney(v) { return v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
function landedCostHtml(e) {
  const sys = e[0];
  let mode, rateDesc = '';
  if (sys === 1) {
    const g = gstFor(e[1]);
    mode = 'in';
    rateDesc = g ? ('IGST ' + g[0] + ' from the baked GST 2.0 schedule') : 'IGST rate not found in the baked GST schedule';
    if (e[5] && e[5].indexOf('BCD ') === 0) rateDesc = 'BCD ' + e[5].slice(4) + ' (CBIC Customs Tariff as on 30.06.2025) + ' + rateDesc;
  } else {
    const pct = parseAdvalorem(e[5]);
    if (e[5] && (pct === null || ((sys === 3 || sys === 4) && /[€£+]|MIN|MAX|GBP/.test(e[5])) || (sys === 5 && /원/.test(e[5])) || (sys === 12 && /NOK|eller/.test(e[5])))) mode = 'specific';
    else if (pct !== null) mode = sys === 2 ? 'us' : 'adval';
    else mode = 'none';
    rateDesc = e[5] ? ('General duty ' + e[5] + ' (baked official rate)') : '';
  }
  if (mode === 'none') {
    return '<div class="detail-sec no-print lc-panel"><h3>Landed cost estimate</h3><p class="muted">This system publishes no open general rate for this line in the dataset, so an automatic estimate would be invented - use the official portal link at the bottom of this page for the current rate.</p></div>';
  }
  if (mode === 'specific') {
    return '<div class="detail-sec no-print lc-panel"><h3>Landed cost estimate</h3><p class="muted">This line carries a specific duty rate (' + esc(e[5]) + ') - the duty depends on the shipped quantity and unit, which this page does not know. Any total here would mislead; use the official tariff calculator linked at the bottom of this page.</p></div>';
  }
  let inputs = '<div class="lc-inputs">' +
    '<label class="sfield"><span class="slabel">Goods value (USD)</span><input id="lc-goods" inputmode="decimal" placeholder="10000" autocomplete="off"></label>' +
    '<label class="sfield"><span class="slabel">Freight (USD)</span><input id="lc-freight" inputmode="decimal" placeholder="800" autocomplete="off"></label>' +
    '<label class="sfield"><span class="slabel">Insurance (USD)</span><input id="lc-ins" inputmode="decimal" placeholder="0" autocomplete="off"></label>';
  if (mode === 'in') { const bcdRaw = e[5] && e[5].indexOf('BCD ') === 0 ? e[5].slice(4).trim() : null; const bcdBaked = bcdRaw !== null && (/^\d+(\.\d+)?\s*%$/.test(bcdRaw) || /^free$/i.test(bcdRaw)) ? parseAdvalorem(bcdRaw) : null; inputs += '<label class="sfield"><span class="slabel">BCD % (basic customs duty)</span><input id="lc-bcd" inputmode="decimal" placeholder="e.g. 10 - check ICEGATE" autocomplete="off"' + (bcdBaked !== null ? ' value="' + bcdBaked + '"' : '') + '></label>'; }
  inputs += '</div>';
  const srcNote = mode === 'in'
    ? 'IGST rate from the baked GST 2.0 schedule (Notification 9/2025-Integrated Tax (Rate), 17 Sep 2025). ' + (e[5] && e[5].indexOf('BCD ') === 0 ? 'BCD is prefilled from the CBIC Customs Tariff First Schedule as on 30.06.2025 (statutory standard rate) - effective rates vary by exemption notification, so check and edit before relying on the total; verify on the ICEGATE duty calculator.' : 'BCD is your input - it varies by line and changes; verify on the ICEGATE duty calculator.') + ' Social welfare surcharge = 10% of BCD (official rule). Excludes port, handling and other fees. Estimate only - verify before filing.'
    : mode === 'us'
      ? 'Duty = baked general (MFN) rate from the official USITC HTS on the entered (CIF) value. Merchandise processing fee 0.3464% ad valorem (yearly min/max caps not applied) and harbor maintenance fee 0.125% (ocean freight only) are official CBP fees. State and local taxes, broker and port fees not included. Estimate only - verify before filing.'
      : 'Duty = baked general (MFN) rate from this system\'s official tariff on the CIF value. Destination VAT/GST and port fees are not baked for this system - check its official portal below. Estimate only - verify before filing.';
  return '<div class="detail-sec no-print lc-panel"><h3>Landed cost estimate</h3>' +
    '<p class="muted">' + esc(rateDesc) + '. Type your shipment values - the full duty and tax cascade computes on this page; nothing is sent anywhere.</p>' +
    inputs + '<div id="lc-out"></div>' +
    '<p class="muted lc-src">' + esc(srcNote) + '</p></div>';
}
function paintLanded(e) {
  const out = el('lc-out'); if (!out) return;
  const num = (id) => { const x = el(id); if (!x) return 0; const v = parseFloat(String(x.value).replace(/,/g, '')); return isFinite(v) && v > 0 ? v : 0; };
  const goods = num('lc-goods'), fr = num('lc-freight'), ins = num('lc-ins');
  if (!goods) { out.innerHTML = '<p class="muted">Enter the goods value to see the breakdown.</p>'; return; }
  const cif = goods + fr + ins;
  const rows = [['Assessable value (CIF = goods + freight + insurance)', cif]];
  let total = cif, note = '';
  if (e[0] === 1) {
    const g = gstFor(e[1]);
    const igst = g ? parseAdvalorem(g[0]) : null;
    const bcdPct = num('lc-bcd');
    const bcd = cif * bcdPct / 100;
    const sws = bcd * 0.10;
    rows.push(['Basic customs duty (BCD ' + bcdPct + '%)', bcd]);
    rows.push(['Social welfare surcharge (10% of BCD)', sws]);
    if (igst !== null) {
      const igstAmt = (cif + bcd + sws) * igst / 100;
      rows.push(['IGST ' + igst + '% on (CIF + BCD + SWS)', igstAmt]);
      total = cif + bcd + sws + igstAmt;
    } else { note = 'IGST rate missing from the baked schedule - total excludes IGST.'; total = cif + bcd + sws; }
  } else if (e[0] === 2) {
    const pct = parseAdvalorem(e[5]) || 0;
    const duty = cif * pct / 100;
    const mpf = goods * 0.003464;
    const hmf = goods * 0.00125;
    rows.push(['General duty ' + pct + '% on CIF', duty]);
    rows.push(['Merchandise processing fee 0.3464% on goods value', mpf]);
    rows.push(['Harbor maintenance fee 0.125% (ocean only)', hmf]);
    total = cif + duty + mpf + hmf;
  } else {
    const pct = parseAdvalorem(e[5]) || 0;
    const duty = cif * pct / 100;
    rows.push(['General duty ' + pct + '% on CIF', duty]);
    total = cif + duty;
  }
  rows.push(['Estimated landed cost', total]);
  const pctOver = (total - goods) / goods * 100;
  let h = '<table class="lc-table"><tbody>' + rows.map((r, i) => '<tr' + (i === rows.length - 1 ? ' class="lc-total"' : '') + '><td>' + esc(r[0]) + '</td><td>' + lcMoney(r[1]) + ' USD</td></tr>').join('') +
    '<tr><td>Duty + tax over goods value</td><td>' + pctOver.toFixed(1) + '%</td></tr></tbody></table>';
  if (note) h += '<p class="muted">' + esc(note) + '</p>';
  out.innerHTML = h;
}

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

// Booming products - India trade momentum leaderboard (UN Comtrade 2021-2025, baked).
function boomData() {
  if (V.boomData) return V.boomData;
  const out = { X: [], M: [] };
  for (const c6 in TRADE_TREND) {
    const tr = TRADE_TREND[c6];
    let r24 = null, r25 = null;
    for (const r of tr) { if (r[0] === 2024) r24 = r; else if (r[0] === 2025) r25 = r; }
    if (!r24 || !r25) continue;
    const flows = [['M', 1], ['X', 2]];
    for (const fl of flows) {
      const base = r24[fl[1]], cur = r25[fl[1]];
      if (cur < 25000000 || base < 5000000) continue;
      const pct = ((cur - base) / base) * 100;
      if (pct <= 15) continue;
      out[fl[0]].push([c6, base, cur, cur - base, pct]);
    }
  }
  out.X.sort((a, b) => b[4] - a[4]);
  out.M.sort((a, b) => b[4] - a[4]);
  V.boomData = out;
  return out;
}
function boomPanelHtml() {
  const d = boomData();
  const flow = V.boomFlow || 'X';
  const ch = V.boomCh || '';
  const all = d[flow];
  const rows = all.filter((r) => !ch || r[0].slice(0, 2) === ch).slice(0, 60);
  const chapters = [];
  for (let i = 1; i <= 99; i++) {
    const c2 = String(i).padStart(2, '0');
    if (all.some((r) => r[0].slice(0, 2) === c2)) chapters.push(c2);
  }
  return '<div class="chip-sec boom-panel"><h3>Booming products - India ' + (flow === 'X' ? 'export' : 'import') + ' momentum, 2024 to 2025</h3>' +
    '<div class="chip-row no-print">' +
    '<button class="chip' + (flow === 'X' ? ' on' : '') + '" data-boomf="X">Exports</button>' +
    '<button class="chip' + (flow === 'M' ? ' on' : '') + '" data-boomf="M">Imports</button>' +
    '<select id="boom-ch" class="boom-sel"><option value="">All chapters</option>' + chapters.map((c) => '<option value="' + c + '"' + (ch === c ? ' selected' : '') + '>Chapter ' + c + '</option>').join('') + '</select></div>' +
    '<table class="boom-table"><thead><tr><th>#</th><th>HS 6-digit</th><th>Product</th><th>2024</th><th>2025</th><th>Added</th><th>Growth</th></tr></thead><tbody>' +
    rows.map((r, i) => {
      const idx = S.db.keyToIdx.get('0:' + r[0]);
      const desc = idx !== undefined ? S.db.entries[idx][2] : '';
      return '<tr class="boom-row"' + (idx !== undefined ? ' data-open="' + idx + '"' : '') + '><td>' + (i + 1) + '</td><td>' + esc(r[0]) + '</td><td>' + esc(pretty(desc)) + '</td><td>' + esc(fmtUsd(r[1])) + '</td><td>' + esc(fmtUsd(r[2])) + '</td><td>+' + esc(fmtUsd(r[3])) + '</td><td><strong>+' + r[4].toFixed(0) + '%</strong></td></tr>';
    }).join('') +
    '</tbody></table>' +
    (rows.length === 0 ? '<p class="muted">No lines above the floors in this selection.</p>' : '') +
    '<p class="muted">UN Comtrade, India reporter, calendar years (baked 22 Sep 2026). Ranked by 2024-to-2025 growth; floors: at least $25M traded in 2025 on a $5M base in 2024, minimum +15%. Tap a row for the full code detail.</p></div>';
}
function boomBadgeHtml(e) {
  const tr = TRADE_TREND[e[1].slice(0, 6)];
  if (!tr) return '';
  let r24 = null, r25 = null;
  for (const r of tr) { if (r[0] === 2024) r24 = r; else if (r[0] === 2025) r25 = r; }
  if (!r24 || !r25) return '';
  const notes = [];
  if (r25[2] >= 25000000 && r24[2] >= 5000000) { const pc = ((r25[2] - r24[2]) / r24[2]) * 100; if (pc >= 50) notes.push('exports +' + pc.toFixed(0) + '% in 2025'); }
  if (r25[1] >= 25000000 && r24[1] >= 5000000) { const pc = ((r25[1] - r24[1]) / r24[1]) * 100; if (pc >= 50) notes.push('imports +' + pc.toFixed(0) + '% in 2025'); }
  if (!notes.length) return '';
  return '<div class="alert-banner boom-badge no-print"><strong>Booming product</strong> - India ' + esc(notes.join(' and ')) + ' (UN Comtrade, min $25M traded).</div>';
}

// Supply-chain risk scan - composite, honest about coverage.
function riskHtml(e) {
  const c6 = e[1].slice(0, 6);
  const tp = TRADE_PARTNERS[c6];
  const digs = e[1].replace(/\D/g, '');
  const rows = [];
  let score = 0;
  if (tp) {
    const conc = (list, start, mid) => {
      if (!list || !list.length) return;
      const tot = list.reduce((a, pp) => a + pp[1], 0);
      if (!tot) return;
      const top1 = list[0][1] / tot;
      const hhi = list.reduce((a, pp) => a + Math.pow(pp[1] / tot, 2), 0);
      const lvl = top1 >= 0.6 ? 2 : top1 >= 0.4 ? 1 : 0;
      score += lvl;
      rows.push([lvl, start + ' concentration: ' + list[0][0] + ' alone takes ' + Math.round(top1 * 100) + '% of India\'s top-5 ' + mid + ' for this product (' + fmtUsd(list[0][1]) + ', 2025)' + (hhi >= 0.35 ? ' - concentrated supply base.' : hhi >= 0.2 ? ' - moderately spread.' : ' - well spread.')]);
    };
    conc(tp.m, 'Import-source', 'import sources');
    conc(tp.x, 'Export-market', 'export markets');
    const seen = {};
    for (const lst of [tp.m || [], tp.x || []]) {
      for (const pp of lst) {
        const z = SANC_ZONES[pp[0]];
        if (z && !seen[pp[0]]) {
          seen[pp[0]] = 1;
          score += z[0] === 1 ? 2 : 1;
          rows.push([z[0] === 1 ? 2 : 1, 'Sanctions zone: ' + pp[0] + ' (' + fmtUsd(pp[1]) + ' of India trade in this product, 2025) is a ' + (z[0] === 1 ? 'RED' : 'amber') + ' zone partner. ' + z[3]]);
        }
      }
    }
  }
  const addHits = [];
  for (const m of ADD_MEASURES) {
    for (const h of m[0].split(',')) {
      if (digs === h || (digs.length >= 6 && h.slice(0, 6) === digs.slice(0, 6))) { addHits.push(m); break; }
    }
  }
  if (addHits.length) {
    score += 1;
    rows.push([1, 'Anti-dumping: ' + addHits.length + ' in-force measure' + (addHits.length > 1 ? 's' : '') + ' cover this line (e.g. ' + addHits[0][1] + ' from ' + addHits[0][2] + ', duty ' + addHits[0][3] + ') - imports from those origins cost more.']);
  }
  const sc = e[0] === 1 ? SCOMET[e[1]] : null;
  if (sc) {
    score += 2;
    rows.push([2, 'Export controlled: SCOMET entry ' + sc[0] + (sc[1] ? ' (' + sc[1] + ')' : '') + ' - exporting from India needs a DGFT authorisation.']);
  }
  if (!rows.length && !tp) return '';
  const lvl = score >= 5 ? ['HIGH', '#a83232'] : score >= 3 ? ['MODERATE', '#b0761a'] : ['LOW', '#1e7a4f'];
  rows.sort((a, b) => b[0] - a[0]);
  return '<div class="detail-sec risk-card"><h3>Supply-chain risk scan <span class="risk-chip" style="background:' + lvl[1] + '">' + lvl[0] + '</span></h3>' +
    (rows.length ? '<ul class="risk-list">' + rows.map((r) => '<li>' + esc(r[1]) + '</li>').join('') + '</ul>' : '<p>No concentration, sanctions-zone, anti-dumping or export-control flags for this product in the baked data.</p>') +
    '<p class="muted">Composite of: India partner concentration (UN Comtrade 2025' + (tp ? '' : ' - partner breakdown not yet baked for this code, coverage grows daily') + '), sanctions-zone exposure of top partners, in-force anti-dumping measures (CBIC) and SCOMET export control (DGFT). Screening aid, not legal advice - verify before shipping.</p></div>';
}

// RoDTEP export incentive - DGFT Appendix 4R (DTA) + 4RE (SEZ/EOU/AA).
function rodtepRow(code, row, label) {
  const rate = row[0], cap = row[1], uqc = row[2];
  return '<tr><td>' + esc(label) + '</td><td><strong>' + esc(rate) + (rate.indexOf('%') >= 0 ? ' of FOB' : '') + '</strong></td><td>' + (cap ? 'cap Rs ' + esc(cap) + ' per ' + esc(uqc || 'unit') : 'no value cap') + '</td></tr>';
}
function rodtepHtml(e) {
  if (e[0] !== 1) return '';
  const rows = [];
  const d = RODTEP_DTA[e[1]];
  const s = RODTEP_SEZ[e[1]];
  if (d) rows.push(rodtepRow(e[1], d, 'Exports from DTA (Appendix 4R)'));
  if (s) rows.push(rodtepRow(e[1], s, 'Exports from SEZ / EOU / AA (Appendix 4RE)'));
  let extra = '';
  if (!rows.length && e[1].length < 8) {
    const kids = [];
    for (const c in RODTEP_DTA) { if (c.slice(0, e[1].length) === e[1]) kids.push(c); if (kids.length > 9) break; }
    if (kids.length) {
      extra = '<p class="muted">Rebated lines under this heading include ' + kids.slice(0, 9).map((c) => esc(c) + ' (' + esc(RODTEP_DTA[c][0]) + ')').join(', ') + ' - open an 8-digit line for its exact rate.</p>';
    }
  }
  if (!rows.length && !extra) return '';
  return '<div class="detail-sec rodtep-card"><h3>Export incentive - RoDTEP rebate</h3>' +
    (rows.length ? '<table class="boom-table"><thead><tr><th>Route</th><th>Rebate rate</th><th>Value cap</th></tr></thead><tbody>' + rows.join('') + '</tbody></table>' : '') +
    extra +
    '<p class="muted">Remission of embedded duties and taxes, claimed as e-scrips on ICEGATE by declaring the RoDTEP intent on the shipping bill. Rates from DGFT Appendix 4R / 4RE: base Notification 32/2024 (wef 10.10.2024) as amended by Notification 15/2026-27 (wef 01.05.2026). Rebates are budget-capped and rates change - verify the current schedule on DGFT (Regulations > RoDTEP) before pricing. <a href="https://www.dgft.gov.in/CP/?opt=rodtep" target="_blank" rel="noreferrer">DGFT RoDTEP schedule</a>.</p></div>';
}

// Reverse lookup - foreign code -> India HSN crosswalk.
function resolveForeign(raw) {
  let digs = String(raw || '').replace(/\D/g, '');
  if (digs.length > 12) digs = digs.slice(0, 12);
  if (digs.length < 6) return { err: 'short', input: digs };
  const findSys = (c) => {
    const out = [];
    for (let s = 0; s < SYS.length; s++) {
      if (s === 0 && c.length > 6) continue;
      const i = S.db.keyToIdx.get(s + ':' + c);
      if (i !== undefined) out.push([s, i]);
    }
    return out;
  };
  let code = digs;
  let hits = findSys(code);
  let trimmed = 0;
  while (!hits.length && code.length > 6) {
    code = code.slice(0, -1);
    trimmed++;
    hits = findSys(code);
  }
  const root6 = code.slice(0, 6);
  const rootIdx = S.db.keyToIdx.get('0:' + root6);
  const india = [];
  for (let i = 0; i < S.db.entries.length; i++) {
    const e = S.db.entries[i];
    if (e[0] === 1 && e[1].length >= 8 && e[1].slice(0, 6) === root6) india.push(i);
  }
  india.sort((a, b) => S.db.entries[b][1].length - S.db.entries[a][1].length || a - b);
  return { input: digs, code: code, hits: hits, trimmed: trimmed, root6: root6, rootIdx: rootIdx === undefined ? -1 : rootIdx, india: india };
}
function revResultHtml(res) {
  if (res.err === 'short') return '<p class="muted">Type at least 6 digits of the foreign code - dots, spaces and dashes are fine.</p>';
  let s = '';
  if (!res.hits.length) {
    return '<p class="muted">No system in the finder carries a line under ' + esc(res.root6) + ' - check the code. An India line cannot be resolved for it.</p>';
  }
  const inHit = res.hits.filter((h) => h[0] === 1);
  if (inHit.length && res.input.length > 6) {
    s += '<div class="alert-banner"><strong>This is already an India HSN line</strong> - ' + esc(fmtCode(1, res.code)) + ' ' + esc(pretty(S.db.entries[inHit[0][1]][2])) + '. Tap it below for the full detail.</div>';
  }
  if (res.input.length > 6) {
    const others = res.hits.filter((h) => h[0] !== 1).slice(0, 6);
    if (others.length) {
      s += '<p>Your code <strong>' + esc(res.input) + '</strong> resolves to ' + (res.trimmed ? 'the nearest baked line' : 'a direct line') + ' in ' + others.length + ' foreign system' + (others.length > 1 ? 's' : '') + (res.trimmed ? ' (trimmed ' + res.trimmed + ' trailing digit' + (res.trimmed > 1 ? 's' : '') + ' - the finder bakes up to 10-digit national lines)' : '') + ':</p>' +
        '<ul class="result-list no-print">' + others.map((h) => {
          const e = S.db.entries[h[1]];
          return '<li><button class="result-link linkbtn-block" data-open="' + h[1] + '">' + sysTagHtml(h[0]) + '<span class="rcode">' + esc(fmtCode(h[0], e[1])) + '</span><span class="rdesc">' + esc(pretty(e[2])) + '</span></button></li>';
        }).join('') + '</ul>';
    }
  }
  const rootDesc = res.rootIdx >= 0 ? S.db.entries[res.rootIdx][2] : '';
  s += '<h4>India HSN lines under ' + esc(res.root6) + (rootDesc ? ' - ' + esc(pretty(rootDesc)) : '') + '</h4>';
  if (res.india.length) {
    s += '<ul class="result-list no-print">' + res.india.slice(0, 40).map((i) => {
      const e = S.db.entries[i];
      return '<li><button class="result-link linkbtn-block direct-hit" data-open="' + i + '">' + sysTagHtml(1) + '<span class="rcode">' + esc(fmtCode(1, e[1])) + '</span><span class="rdesc">' + esc(pretty(e[2])) + '</span></button></li>';
    }).join('') + '</ul>' +
    (res.india.length > 40 ? '<p class="muted">Showing 40 of ' + res.india.length + ' India lines - tap any row for the full detail with GST, FTA rates and landed cost.</p>' : '<p class="muted">Tap a row for the full detail - GST, FTA rates, landed cost, risk scan.</p>');
  } else {
    s += '<p class="muted">No India national line sits under this root in the baked India dataset.</p>';
  }
  s += '<p class="muted">Crosswalk through the shared 6-digit international root (WCO HS 2022) that the foreign system and India both build on. Rates and rules live on each line\'s detail page - verify on the official portal before filing.</p>';
  return s;
}
function revPanelHtml() {
  return '<div class="chip-sec rev-panel"><h3>Reverse lookup - foreign code to India HSN</h3>' +
    '<p class="muted">Buyer or supplier gave you THEIR country\'s tariff code? Paste it here (any format, dots or spaces fine) - get the matching India HSN lines.</p>' +
    '<div class="rev-row no-print"><input id="rev-in" class="rev-in" type="text" inputmode="numeric" placeholder="e.g. 1006.30.4000 (a US HTS line)" value="' + esc(V.revQ || '') + '"><button class="file-button is-compact" id="rev-go">Find India HSN</button></div>' +
    (V.revRes ? '<div class="rev-res">' + revResultHtml(V.revRes) + '</div>' : '') +
    '</div>';
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
PORTAL_LINKS[20] = [{ label: 'GACC China Customs', url: 'http://english.customs.gov.cn/' }, { label: 'MOFCOM FTA portal', url: 'http://fta.mofcom.gov.cn/' }];
PORTAL_LINKS[21] = [{ label: 'Dubai Customs', url: 'https://www.dubaicustoms.gov.ae/' }, { label: 'UAE Federal Customs Authority', url: 'https://www.fca.gov.ae/' }];
function portalRowHtml(sys) {
  const links = PORTAL_LINKS[sys] || [];
  if (!links.length) return '';
  return '<div class="detail-sec portal-row"><h3>Verify live on official portals</h3><div class="crumbs">' +
    links.map((l) => '<a class="crumb" href="' + l.url + '" target="_blank" rel="noreferrer">' + esc(l.label) + '</a>').join('') +
    '</div></div>';
}

const SYS_CCY = [null, 'INR', 'USD', 'EUR', 'GBP', 'KRW', 'CAD', 'JPY', 'AUD', 'BRL', 'TWD', 'NZD', 'NOK', 'SGD', 'ILS', 'MXN'];
SYS_CCY[20] = 'CNY';
SYS_CCY[21] = 'AED';

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

// Year-by-year imports/exports bar chart for the India trade trend (inline SVG, no libraries).
function trendChart(tr) {
  const yrs = tr.filter((r) => r[1] || r[2]);
  if (yrs.length < 2) return '';
  const max = Math.max.apply(null, yrs.map((r) => Math.max(r[1], r[2])).concat([1]));
  const w = 660, h = 190, x0 = 46, y0 = h - 26, bw = 26, bgap = 5;
  const groupW = Math.min(bw * 2 + bgap + 36, (w - x0) / yrs.length);
  let svg = '<svg viewBox="0 0 ' + w + ' ' + h + '" width="100%" role="img">';
  svg += '<line x1="' + (x0 - 8) + '" y1="' + y0 + '" x2="' + w + '" y2="' + y0 + '" stroke="#ccc" stroke-width="1"/>';
  yrs.forEach((r, i) => {
    const gx = x0 + Math.round(i * groupW);
    const ih = Math.round((y0 - 24) * r[1] / max);
    const xh = Math.round((y0 - 24) * r[2] / max);
    svg += '<rect x="' + gx + '" y="' + (y0 - ih) + '" width="' + bw + '" height="' + Math.max(1, ih) + '" rx="2" fill="#4a5a8a"><title>' + r[0] + ' imports ' + esc(fmtUsd(r[1])) + '</title></rect>' +
      '<rect x="' + (gx + bw + bgap) + '" y="' + (y0 - xh) + '" width="' + bw + '" height="' + Math.max(1, xh) + '" rx="2" fill="#8a7b5c"><title>' + r[0] + ' exports ' + esc(fmtUsd(r[2])) + '</title></rect>' +
      '<text x="' + (gx + bw) + '" y="' + (h - 9) + '" font-size="11" text-anchor="middle" fill="#666" font-family="-apple-system,Arial,sans-serif">' + r[0] + '</text>';
  });
  svg += '<text x="' + (x0 - 8) + '" y="14" font-size="11" fill="#4a5a8a" font-family="-apple-system,Arial,sans-serif">&#9632; imports</text>' +
    '<text x="' + (x0 + 62) + '" y="14" font-size="11" fill="#8a7b5c" font-family="-apple-system,Arial,sans-serif">&#9632; exports</text>';
  return '<div class="tpl-chart">' + svg + '</svg></div>';
}


const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
function seasonChart(sm, sx) {
  const months = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];
  const max = Math.max.apply(null, sm.concat(sx).concat([1]));
  const w = 660, h = 150, x0 = 30, y0 = h - 24, bw = 9, bgap = 3;
  const groupW = (w - x0) / 12;
  let svg = '<svg viewBox="0 0 ' + w + ' ' + h + '" width="100%" role="img">';
  svg += '<line x1="' + (x0 - 8) + '" y1="' + y0 + '" x2="' + w + '" y2="' + y0 + '" stroke="#ccc" stroke-width="1"/>';
  for (let i = 0; i < 12; i++) {
    const gx = x0 + Math.round(i * groupW);
    const ih = Math.round((y0 - 22) * (sm[i] || 0) / max);
    const xh = Math.round((y0 - 22) * (sx[i] || 0) / max);
    svg += '<rect x="' + gx + '" y="' + (y0 - ih) + '" width="' + bw + '" height="' + Math.max(1, ih) + '" rx="2" fill="#4a5a8a"><title>' + MONTH_NAMES[i] + ' imports ' + esc(fmtUsd(sm[i] || 0)) + '</title></rect>' +
      '<rect x="' + (gx + bw + bgap) + '" y="' + (y0 - xh) + '" width="' + bw + '" height="' + Math.max(1, xh) + '" rx="2" fill="#8a7b5c"><title>' + MONTH_NAMES[i] + ' exports ' + esc(fmtUsd(sx[i] || 0)) + '</title></rect>' +
      '<text x="' + (gx + bw) + '" y="' + (h - 8) + '" font-size="10" text-anchor="middle" fill="#666" font-family="-apple-system,Arial,sans-serif">' + months[i] + '</text>';
  }
  svg += '<text x="' + (x0 - 8) + '" y="13" font-size="11" fill="#4a5a8a" font-family="-apple-system,Arial,sans-serif">&#9632; imports</text>' +
    '<text x="' + (x0 + 62) + '" y="13" font-size="11" fill="#8a7b5c" font-family="-apple-system,Arial,sans-serif">&#9632; exports</text>';
  return '<div class="tpl-chart">' + svg + '</svg></div>';
}
function seasonHtml(c6) {
  const s = c6 ? TRADE_SEASON[c6] : null;
  if (!s) return '';
  const sm = s[0], sx = s[1];
  const tot = sm.map((v, i) => (v || 0) + (sx[i] || 0));
  const sumAll = tot.reduce((a, b) => a + b, 0);
  if (!sumAll) return '';
  let pk = 0, tr = 0;
  for (let i = 1; i < 12; i++) { if (tot[i] > tot[pk]) pk = i; if (tot[i] < tot[tr]) tr = i; }
  const avg = sumAll / 12;
  const swing = Math.round((tot[pk] - tot[tr]) / avg * 100);
  return seasonChart(sm, sx) + '<p>Seasonality ' + TRADE_SEASON_YEARS[0] + '-' + TRADE_SEASON_YEARS[1] + ' (monthly average): combined trade peaks in <strong>' + MONTH_NAMES[pk] + '</strong> and dips in <strong>' + MONTH_NAMES[tr] + '</strong>' + (swing > 25 ? ' - a ' + swing + '% swing around the average month; plan inventory and contracts around it' : ' - fairly even across the year') + '.</p>';
}


const FTA_UAE_YEAR_NOW = 4;
function ftaPct(s) { const m = /^(\d+(?:\.\d+)?)%$/.exec(s || ''); return m ? parseFloat(m[1]) : null; }
function ftaHtml(code) {
  const c6 = code ? code.slice(0, 6) : '';
  if (!c6) return '';
  const uae = [], au = [];
  for (const k in FTA_UAE) { if (k.slice(0, 6) === c6) uae.push(k); }
  for (const k in FTA_AU) { if (k.slice(0, 6) === c6) au.push(k); }
  const uaeUnp = FTA_UAE_UNPARSED.some((k) => k.slice(0, 6) === c6);
  if (!uae.length && !au.length && !uaeUnp) return '';
  let bestSave = 0, bestWhere = '';
  let rows = '';
  uae.sort();
  for (const k of uae) {
    const v = FTA_UAE[k];
    const base = v[0], cat = v[1], now = v[2 + FTA_UAE_YEAR_NOW];
    let line;
    if (cat === 'EX') line = 'no CEPA concession - normal MFN rate applies';
    else if (cat === 'PG') line = 'imports of this line are prohibited in the UAE';
    else if (cat === 'SG') line = 'special goods - concession runs through a quota/special route, see the annex';
    else {
      const b = ftaPct(base), n = ftaPct(now);
      if (cat === 'E(0)') line = 'duty-free since 1 May 2022';
      else if (b !== null && n !== null && n < b) {
        line = 'MFN ' + esc(base) + ' &rarr; <strong>' + esc(now) + ' now</strong>, ' + esc(v[11]) + ' from year 10';
        if (b - n > bestSave) { bestSave = b - n; bestWhere = 'UAE'; }
      } else line = 'MFN ' + esc(base) + ' &rarr; <strong>' + esc(now) + ' now</strong>';
    }
    rows += '<tr><td class="num">' + esc(k) + '</td><td>' + line + '</td></tr>';
  }
  if (uaeUnp) rows += '<tr><td></td><td class="muted">one or more UAE lines under this heading were not machine-readable - check the official annex</td></tr>';
  const uaeBlock = '<h4>India-UAE CEPA - duty when selling to the UAE</h4><table class="fta-t">' + rows + '</table>';
  rows = '';
  au.sort();
  for (const k of au) {
    const v = FTA_AU[k];
    const line = v[1] === 'A'
      ? 'MFN ' + esc(v[0]) + ' &rarr; <strong>duty-free</strong> since 29 Dec 2022'
      : 'MFN ' + esc(v[0]) + ' &rarr; <strong>duty-free</strong> from 1 Jan 2026 (5 equal annual cuts)';
    if (v[1] === 'B5') { const b = ftaPct(v[0]); if (b && b > bestSave) { bestSave = b; bestWhere = 'Australia'; } }
    rows += '<tr><td class="num">' + esc(k) + '</td><td>' + line + '</td></tr>';
  }
  const auBlock = '<h4>Australia-India ECTA - duty when selling to Australia</h4><table class="fta-t">' + rows + '</table>';
  const lead = bestSave > 0
    ? '<p>FTA advantage: save up to <strong>' + bestSave.toFixed(1).replace(/\.0$/, '') + '%</strong> duty into ' + bestWhere + ' under the agreements below, versus their normal MFN rate.</p>'
    : '<p>These products already enter at low or zero duty under the agreements below.</p>';
  return '<div class="detail-sec fta-sec"><h3>FTA duty advantages (India agreements)</h3>' + lead + uaeBlock + auBlock +
    '<p class="muted">Sources: India-UAE CEPA Appendix 2A-A (Tariff Schedule of UAE, in force 1 May 2022; "now" = agreement year 5, May 2026 - Apr 2027); Australia-India ECTA Annex 2A (Tariff Schedule of Australia, in force 29 Dec 2022). Preferential rates need a certificate of origin. Baked into the dataset, not fetched live.</p></div>';
}



const ADD_STOP = new Set(['anti', 'dumping', 'investigation', 'concerning', 'imports', 'originating', 'exported', 'from', 'initiation', 'sunset', 'review', 'aluminium', 'steel', 'stainless', 'plastic', 'plastics', 'rubber', 'paper', 'glass', 'copper', 'iron', 'textile', 'textiles', 'chemical', 'chemicals', 'products', 'technical', 'grade', 'certain', 'other', 'originating', 'thereof']);


const PORT_STATS = [
  ["Paradip", 135361, 145380, 150408, "coal, POL, iron ore"],
  ["Deendayal (Kandla)", 137561, 132373, 150157, "POL, coal, containers (0.48M TEU)"],
  ["JNPT (Nhava Sheva)", 83861, 85817, 92115, "containers (7.30M TEU)"],
  ["Visakhapatnam", 73750, 81090, 82623, "POL, iron ore, containers"],
  ["Mumbai", 63608, 67261, 68625, "POL, coal, iron ore"],
  ["Chennai", 48949, 51598, 54961, "containers (1.82M TEU), POL"],
  ["Kamarajar (Ennore)", 43507, 45277, 48407, "coal, containers"],
  ["SMPA Haldia", 48608, 49536, 47310, "coal, POL"],
  ["New Mangalore", 41417, 45708, 46014, "POL, coal, containers"],
  ["V.O.C. (Tuticorin)", 38042, 41402, 41724, "containers (0.80M TEU), coal"],
  ["Cochin", 35256, 36316, 37745, "POL, containers (0.84M TEU)"],
  ["Mormugao", 17334, 20628, 18126, "coal, iron ore"],
  ["SMPA Kolkata DS", 17051, 16909, 16641, "containers (0.62M TEU)"],
  ["ALL MAJOR PORTS", 784305, 819295, 854858, "13.53M TEU containers across all major ports"]
];
const PORT_STATS_SRC = "Traffic in million tonnes from Basic Port Statistics of India 2024-25 (Ministry of Ports, Shipping & Waterways), tables 2.1.1-2.1.3. Only the 12 government major ports are covered - private non-major ports (Mundra, Pipavav, Krishnapatnam and others) together moved another 742.41 MT in 2024-25 and are outside this table. Baked 23 Sep 2026, refreshed by the weekly source check.";

function portStatsTable() {
  const mt = (v) => (Math.round(v / 10) / 100).toFixed(2);
  const rows = PORT_STATS.map((r) => {
    const yoy = r[2] ? (r[3] - r[2]) / r[2] * 100 : 0;
    return '<tr><td>' + esc(r[0]) + '</td><td class="num">' + mt(r[1]) + '</td><td class="num">' + mt(r[2]) + '</td><td class="num"><strong>' + mt(r[3]) + '</strong></td><td class="num">' + (yoy >= 0 ? '+' : '') + yoy.toFixed(1) + '%</td><td>' + esc(r[4]) + '</td></tr>';
  }).join('');
  return '<table class="fta-t"><thead><tr><th>Port</th><th class="num">2022-23</th><th class="num">2023-24</th><th class="num">2024-25 (MT)</th><th class="num">YoY</th><th>Main cargo 2024-25</th></tr></thead><tbody>' + rows + '</tbody></table>';
}

function docsHtml(chapter) {
  const ch = parseInt(chapter, 10);
  if (!ch) return '';
  const mk = (base, side) => {
    const rows = base.slice();
    for (const r of DOC_EXTRA) {
      if (ch >= r[0] && ch <= r[1] && (r[2] === 'both' || r[2] === side)) rows.push(r[3]);
    }
    return rows.map((t) => '<li>' + esc(t) + '</li>').join('');
  };
  return '<div class="detail-sec"><h3>Shipping documents &amp; India ports</h3>' +
    '<h4>Exporting from India</h4><ul class="certs-l">' + mk(DOC_BASE_OUT, 'out') + '</ul>' +
    '<h4>Importing into India</h4><ul class="certs-l">' + mk(DOC_BASE_IN, 'in') + '</ul>' +
    '<h4>Main Indian ports</h4><div class="ports-grid">' + PORTS.map((pt) => '<div class="port-chip"><strong>' + esc(pt[0]) + '</strong> ' + esc(pt[1]) + ' <span class="muted">' + esc(pt[3]) + '</span></div>').join('') + '</div>' +
    '<h4>Port cargo statistics - last 3 years</h4>' + portStatsTable() +
    '<p class="muted">' + esc(PORT_STATS_SRC) + '</p>' +
    '<p class="muted">' + esc(DOC_SRC) + '</p></div>';
}

function sancHtml() {
  const keys = Object.keys(SANC_ZONES).sort();
  let opts = '<option value="">Pick the buyer / supplier country</option>';
  for (const k of keys) opts += '<option value="' + esc(k) + '">' + esc(k) + '</option>';
  opts += '<option value="__other">Any other country</option>';
  return '<div class="detail-sec"><h3>Sanctions zone - is the other country clear?</h3>' +
    '<select class="sanc-pick" id="sanc-pick">' + opts + '</select><div id="sanc-out"></div>' +
    '<p class="muted">' + esc(SANC_SRC) + '</p></div>';
}
function sancRender(country) {
  const out = el('sanc-out');
  if (!out) return;
  if (!country) { out.innerHTML = ''; return; }
  const z = SANC_ZONES[country];
  if (!z) {
    out.innerHTML = '<div class="sanc-card sanc-green"><strong>Green zone</strong> - no standing UN, US, EU or India country-level trade sanctions found for this country in the baked snapshot. Counterparty screening (SDN and entity lists) still applies to any deal.</div>';
    return;
  }
  const cls = z[0] === 1 ? 'sanc-red' : 'sanc-amber';
  const label = z[0] === 1 ? 'Red zone - treat as blocked' : 'Amber zone - targeted sanctions';
  out.innerHTML = '<div class="sanc-card ' + cls + '"><strong>' + label + '</strong><p>' + esc(z[1]) + '</p>' +
    '<p class="muted">Programs: ' + esc(z[2]) + '</p>' +
    (z[3] ? '<p><strong>India angle:</strong> ' + esc(z[3]) + '</p>' : '') + '</div>';
}

function addHtml(code, desc) {
  const digs = String(code || '').replace(/\D/g, '');
  if (!digs) return '';
  const hits = [];
  for (const m of ADD_MEASURES) {
    const lines = m[0].split(',');
    let relLine = '', exact = false;
    for (const h of lines) {
      if (digs === h) exact = true;
      else if (h.slice(0, 6) === digs.slice(0, 6) && digs.length >= 6 && !relLine) relLine = h;
    }
    if (exact || relLine) hits.push({ m: m, rel: exact ? '' : relLine });
  }
  const dl = (' ' + String(desc || '').toLowerCase() + ' ');
  const ong = [];
  for (const o of ADD_ONGOING) {
    const toks = o[0].toLowerCase().replace(/[^a-z0-9 ]/g, ' ').split(/\s+/).filter((t) => t.length >= 5 && !ADD_STOP.has(t));
    if (toks.some((t) => dl.indexOf(t) !== -1)) ong.push(o);
  }
  if (!hits.length && !ong.length) return '';
  let h = '<div class="detail-sec"><h3>Anti-dumping duty (India import)</h3><ul class="certs-l">';
  for (const x of hits.slice(0, 6)) {
    const m = x.m;
    h += '<li><strong>' + esc(m[1]) + '</strong> from ' + esc(m[2]) + ': <strong>' + esc(m[3]) + '</strong> anti-dumping duty, ' + esc(m[6]).toLowerCase() + (m[5] ? ' until ' + esc(m[5]) : '') + ' <span class="muted">(CBIC notfn ' + esc(m[4]) + ')' + (x.rel ? ' - on related line ' + esc(x.rel) + ', confirm your exact line' : '') + '</span></li>';
  }
  h += '</ul>';
  if (ong.length) {
    h += '<h4>Under investigation at DGTR (no duty yet)</h4><ul class="certs-l">';
    for (const o of ong.slice(0, 4)) {
      h += '<li>' + esc(o[0]) + ' <span class="muted">(' + esc(o[1]) + ') - possible match, verify: <a href="https://www.dgtr.gov.in' + esc(o[2]) + '" target="_blank" rel="noopener">DGTR case</a></span></li>';
    }
    h += '</ul>';
  }
  h += '<p class="muted">' + esc(ADD_SRC) + '</p></div>';
  return h;
}

function certsHtml(chapter) {
  const ch = parseInt(chapter, 10);
  if (!ch) return '';
  const ins = [], outs = [];
  for (const r of CERT_RULES) { if (ch >= r.from && ch <= r.to) (r.side === 'in' ? ins : outs).push(r); }
  if (!ins.length && !outs.length) return '';
  const mk = (list) => list.map((r) => '<li><strong>' + esc(r.who) + '</strong>: ' + esc(r.what) + ' <span class="muted">(' + esc(r.law) + ')</span></li>').join('');
  return '<div class="detail-sec"><h3>Certificates &amp; compliance (India)</h3>' +
    (ins.length ? '<h4>Bringing it into India</h4><ul class="certs-l">' + mk(ins) + '</ul>' : '') +
    (outs.length ? '<h4>Sending it out of India</h4><ul class="certs-l">' + mk(outs) + '</ul>' : '') +
    '<p class="muted">' + esc(CERT_SRC) + '</p></div>';
}

function tradeCardHtml(chapter, code) {
  const t = TRADE_CH[chapter];
  const c6 = code ? code.slice(0, 6) : '';
  const t6 = c6 ? TRADE6[c6] : null;
  const tp = c6 ? TRADE_PARTNERS[c6] : null;
  if ((!t || (!t[0] && !t[1])) && !t6 && !tp) return '';
  return '<div class="detail-sec currency-card"><h3>India trade - ' + TRADE_YEAR + '</h3>' +
    (t6 ? '<p>This product, HS ' + esc(c6) + ': imports <strong>' + fmtUsd(t6[0]) + '</strong> - exports <strong>' + fmtUsd(t6[1]) + '</strong></p>' : '') +
    (t && (t[0] || t[1]) ? '<p>Whole chapter ' + esc(chapter) + ': imports <strong>' + fmtUsd(t[0]) + '</strong> - exports <strong>' + fmtUsd(t[1]) + '</strong>' + (t[1] > t[0] ? ' - India is a net exporter here.' : t[0] > t[1] * 3 ? ' - India relies heavily on imports here.' : '') + '</p>' : '') +
    (tp && tp.x.length ? '<p>Top export destinations: ' + tp.x.map((p) => esc(p[0]) + ' <strong>' + fmtUsd(p[1]) + '</strong>').join(', ') + '</p>' : '') +
    (tp && tp.m.length ? '<p>Top import origins: ' + tp.m.map((p) => esc(p[0]) + ' <strong>' + fmtUsd(p[1]) + '</strong>').join(', ') + '</p>' : '') +
    (tp && (tp.xq || tp.xn) ? '<p>Export volume: ' + (tp.xq ? fmtQty(tp.xq[0], tp.xq[1]) : '') + (tp.xq && tp.xn ? ' - ' : '') + (tp.xn ? 'net weight ' + fmtQty(tp.xn[0], 'kg') + (tp.xn[1] ? ' (estimated)' : '') : '') + '</p>' : '') +
    (() => { const tr = c6 ? TRADE_TREND[c6] : null; if (!tr) return '';
      const yrs = tr.filter((r) => r[1] || r[2]); if (!yrs.length) return '';
      const first = yrs[0], last = yrs[yrs.length - 1];
      const grow = (a, b) => { if (!(a > 0 && b > 0)) return ''; const r = b / a, p = Math.round((r - 1) * 100); const t = r >= 1.05 ? 'up ' + r.toFixed(1).replace(/\.0$/, '') + 'x' : p === 0 ? 'roughly flat' : (p > 0 ? 'up ' + p : 'down ' + (-p)) + '%'; return ' (' + t + ')'; };
      const kg = (last[3] || last[4]) ? ' Volume in ' + last[0] + ': net weight ' + fmtQty(last[3], 'kg') + ' in, ' + fmtQty(last[4], 'kg') + ' out.' : '';
      return trendChart(tr) + '<p>Trend ' + first[0] + ' to ' + last[0] + ': imports ' + fmtUsd(first[1]) + ' to ' + fmtUsd(last[1]) + grow(first[1], last[1]) + ' - exports ' + fmtUsd(first[2]) + ' to ' + fmtUsd(last[2]) + grow(first[2], last[2]) + '.' + kg + '</p>'; })() +
    seasonHtml(c6) +
    '<p class="muted">UN Comtrade annual data (reporter: India), USD, imports at CIF. Product line is 6-digit HS level; chapter line covers all products under chapter ' + esc(chapter) + '. Top partners, volumes and net weight where reported. Baked into the dataset, not fetched live.</p></div>';
}


/* ---------- 14-section template report (print to PDF) ---------- */
const TPL_SECTIONS = [
  ['01', 'Fundamentals'], ['01A', 'Features and trade-offs'], ['02', 'Manufacturing and distribution'],
  ['03', 'Global market, pricing and shortages'], ['04', 'Buyers and sellers by country'],
  ['05', 'India market and opportunities'], ['06', 'Geopolitics and supply-chain risks'],
  ['07', 'Technical uses'], ['08', 'Safety, storage and regulation'], ['09', 'Summary'],
  ['10', 'Impact'], ['11', 'Geopolitics'], ['12', 'Financial way'], ['13', 'Advantage'], ['14', 'Change'],
  ['15', 'Documents and compliance'], ['16', 'Logistics and Incoterms'], ['17', 'Policy changes and news'],
  ['18', 'Crisis and risk watch'], ['19', 'Sanctions status'], ['20', 'FAQ - quick answers'],
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

// Verified UN Comtrade facts for this code - injected into the report prompt so the AI
// writes with real numbers, and reused for the second-provider fact-check.
function comtradeFacts(e) {
  const c6 = String(e[1]).slice(0, 6);
  const t6 = TRADE6[c6], tp = TRADE_PARTNERS[c6];
  if (!t6 && !tp) return '';
  let f = 'Verified UN Comtrade figures, calendar ' + TRADE_PARTNERS_YEAR + ', HS ' + c6 + ', reporter India, USD: ';
  if (t6) f += 'imports ' + fmtUsd(t6[0]) + ' (CIF), exports ' + fmtUsd(t6[1]) + '. ';
  if (tp && tp.x.length) f += 'Top export destinations: ' + tp.x.map((p) => p[0] + ' ' + fmtUsd(p[1])).join(', ') + '. ';
  if (tp && tp.m.length) f += 'Top import origins: ' + tp.m.map((p) => p[0] + ' ' + fmtUsd(p[1])).join(', ') + '. ';
  if (tp && tp.xq) f += 'Export volume: ' + fmtQty(tp.xq[0], tp.xq[1]) + '. ';
  if (tp && tp.xn) f += 'Export net weight: ' + fmtQty(tp.xn[0], 'kg') + (tp.xn[1] ? ' (estimated)' : '') + '. ';
  if (tp && tp.gx && tp.gx.length) f += 'Top global exporters of this product (all reporters): ' + tp.gx.map((p) => p[0] + ' ' + fmtUsd(p[1])).join(', ') + '. ';
  if (tp && tp.gm && tp.gm.length) f += 'Top global importers of this product (all reporters): ' + tp.gm.map((p) => p[0] + ' ' + fmtUsd(p[1])).join(', ') + '. ';
  const tr = TRADE_TREND[c6];
  if (tr) {
    const yrs = tr.filter((r) => r[1] || r[2]);
    if (yrs.length) f += 'India trade trend, USD (year: imports / exports, then net kg in / out where reported): ' + yrs.map((r) => r[0] + ': ' + fmtUsd(r[1]) + ' / ' + fmtUsd(r[2]) + ((r[3] || r[4]) ? ' (' + fmtQty(r[3], 'kg') + ' / ' + fmtQty(r[4], 'kg') + ')' : '')).join(', ') + '. ';
  }
  return f + 'Use these exact figures and countries wherever trade values, volumes, trends or top trading partners are discussed; never contradict them or invent different ones.\n';
}

async function tplNarrative(db, idx, apiKey) {
  aiCrossNote = null;
  const e = db.entries[idx];
  const prompt = 'Write the narrative sections for a professional product research report on this exact tariff product.\n' +
    'Product: ' + pretty(e[2]) + '\n' +
    'Classification: ' + SYS[e[0]].name + ' code ' + fmtCode(e[0], e[1]) + ', chapter ' + e[4] + ' - ' + (db.chapterTitle.get(e[4]) || '') + '\n' +
    comtradeFacts(e) +
    'Use Google Search for current facts. Rules: plain simple English, short sentences, readable on a phone. Never invent a number, price, company role, regulation or statistic; rough ranges and qualitative judgements are fine when labelled approximate. Where product-specific data is unavailable, say so plainly and give clearly labelled general chapter-level context instead. Be specific to THIS product: name real grades, hubs, ports, companies and rules; no filler that could fit any product. Do not use markdown or headings.\n' +
    'Tables: inside sections that compare or list facts, add ONE compact pipe table within that section\'s string, on its own lines: a header line like \'| Column | Column |\' then 3 to 6 row lines, cells separated by \'|\', 2 to 4 columns, no separator dashes line. Good spots: sec03 (exporter/importer countries with rough shares), sec04 (company | country | role), sec07 (industry | what it uses this product for), sec08 (hazard or rule | requirement), sec12 (cost item | typical range | note), sec13 (advantage | why it matters), sec16 (option | when to use it | note).\n' +
    'Return ONLY a JSON object, no code fences, with exactly these keys. Every key except sec15 maps to one string of 2 to 4 short paragraphs (paragraphs separated by a blank line). sec15 maps to one string of newline-separated checklist lines, each line formatted as "Document name - issuing authority - why it is needed for this product":\n' +
    '{"sec01a":"product features and trade-offs - be concrete: physical forms, grades, quality markers, substitutes","sec02":"manufacturing and distribution - typical production process, input materials, manufacturing hubs, distribution channels","sec03":"global market, pricing and shortages - market size direction, price drivers, major exporting and importing countries, current shortages or gluts","sec04":"notable verified producer and buyer companies by country, only with evidence - if none verified, say data unavailable","sec05":"India market and realistic opportunities - demand pockets, buyer types, realistic entry routes for an Indian trader","sec06":"geopolitics and supply-chain risks - concentration risks, trade tensions, logistics chokepoints affecting this product","sec07":"technical uses by industry - which industries consume it and for what","sec08":"safety, storage and regulation - handling, shelf life, transport hazards, product-specific rules","sec09":"overall summary","sec10":"impact of trade in this product","sec11":"geopolitics deep view","sec12":"financial considerations - working capital, payment terms, price volatility, margin structure","sec13":"competitive advantages AND disadvantages - honest both sides for an Indian trader entering this trade","sec14":"what is changing and the outlook","sec15":"export-import document checklist for trading this product to or from India","sec16":"logistics, packing and Incoterms guidance - typical packing, container or shipping mode, insurance notes, which Incoterms suit this trade and why","sec17":"recent policy changes and news from the last 12 months affecting this product - tariff changes, bans, new rules, with dates","sec18":"crisis and risk watch - current conflicts, shipping disruptions, price shocks, export bans or supply crises affecting this product right now, with dates; if nothing notable is active, say so plainly","sec19":"sanctions and export-control status for this product and its major trade lanes - current measures, restricted or high-risk destinations, licensing notes for an Indian trader, with dates; state plainly if the product faces no major sanctions"}';
  // Grounded (Google Search) first; free-tier keys often have no grounding quota (429),
  // so fall back to a plain model-knowledge call rather than failing the whole report.
  const plainPrompt = prompt.replace('Use Google Search for current facts.', 'Use your built-in knowledge of this product, its industry and trade.');
  for (const grounded of [true, false]) {
    let text;
    try { text = await aiReportText(grounded ? prompt : plainPrompt, grounded, { temperature: 0.2, maxTokens: 16000 }); }
    catch (err) { if (grounded) continue; throw err; }
    const a = text.indexOf('{'), b = text.lastIndexOf('}');
    if (a < 0 || b <= a) continue;
    let obj = null;
    try { obj = JSON.parse(text.slice(a, b + 1)); } catch { /* live-search answers may prepend page snippets */ }
    if (!obj) {
      const m = text.indexOf('"sec01a"');
      if (m > 0) { const from = text.lastIndexOf('{', m); if (from >= 0 && from < b) { try { obj = JSON.parse(text.slice(from, b + 1)); } catch { /* next attempt */ } } }
    }
    if (obj && typeof obj === 'object') {
      for (const k in obj) if (typeof obj[k] === 'string') obj[k] = obj[k].replace(/【[^】]*】/g, '').trim();
      geminiGrounded = grounded && aiProviderUsed === 'gemini';
      if (aiHasBoth()) {
        const by = PROVIDER_LABEL[aiCrossBy] || 'a second provider';
        const facts = comtradeFacts(e).replace(/\n$/, '') || 'No Comtrade figures baked for this code yet.';
        const chk = await aiCrossCall(aiProviderUsed,
          'Fact-check an AI-written trade report against official figures. ' + facts + ' India GST and duty rates in the dataset are official. ' +
          'Report JSON: ' + JSON.stringify(obj) + ' ' +
          'Rules: flag only statements that contradict the verified figures above, or specific numbers, companies or dates presented as hard fact that nothing above supports (rough ranges and clearly approximate judgements are fine). Reply ONLY JSON: {"ok":true} or {"ok":false,"issues":["short issue 1","short issue 2"]} - at most 5 issues.',
          { temperature: 0, maxTokens: 4000 });
        if (chk) {
          try {
            const cj = JSON.parse(chk.slice(chk.indexOf('{'), chk.lastIndexOf('}') + 1));
            if (cj && cj.ok === true) aiCrossNote = { by, ok: true, issues: [] };
            else if (cj && Array.isArray(cj.issues) && cj.issues.length) aiCrossNote = { by, ok: false, issues: cj.issues.slice(0, 5).map((x) => String(x)) };
          } catch (e2) { /* unparseable second opinion - stay silent */ }
        }
      }
      return obj;
    }
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
function tplCrossRows(db, e) {
  const groups = linkage(db, e);
  const rows = [];
  for (const g of groups) {
    const exact = db.keyToIdx.get(g.sys + ':' + g.target);
    const exts = [...g.extSample].sort((a, b) => db.entries[b][1].length - db.entries[a][1].length);
    const pick = exact !== undefined ? exact : (exts.length ? exts[0] : null);
    if (pick === null) continue;
    rows.push([SYS[g.sys].name, fmtCode(g.sys, db.entries[pick][1]), levelName(db.entries[pick][1])]);
  }
  return rows;
}
function plainWords(db, e, idx) {
  const parts = [];
  const chTitle = db.chapterTitle.get(e[4]) || '';
  parts.push(pretty(e[2]) + ' sits in chapter ' + e[4] + (chTitle ? ' (' + chTitle + ')' : '') + ' of the tariff.');
  const wcoPath = chain(db, idx).filter((i) => db.entries[i][0] === 0).map((i) => db.entries[i]);
  if (wcoPath.length) parts.push('Internationally (WCO HS 2022) it runs ' + wcoPath.map((x) => x[1] + ' (' + pretty(x[2]).toLowerCase() + ')').join(' -> ') + '.');
  parts.push('In ' + SYS[e[0]].name + ' the full national line is ' + fmtCode(e[0], e[1]) + ' (' + levelName(e[1]) + ').');
  const kids = db.children.get(idx) || [];
  if (kids.length) parts.push('It has ' + kids.length + ' narrower line' + (kids.length > 1 ? 's' : '') + ' under it in this system.');
  else parts.push('This is the deepest national line in this system.');
  return parts.join(' ');
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
    '<h3>In plain words ' + tplTag('fact') + '</h3><p>' + escA(plainWords(db, e, idx)) + '</p>' +
    (() => { const xrows = tplCrossRows(db, e); if (!xrows.length) return ''; return '<h3>The same product across ' + xrows.length + ' official systems ' + tplTag('fact') + '</h3><table class="tpl-table"><thead><tr><th>System</th><th>Code</th><th>Level</th></tr></thead><tbody>' + xrows.map((r) => '<tr><td>' + escA(r[0]) + '</td><td>' + escA(r[1]) + '</td><td>' + escA(r[2]) + '</td></tr>').join('') + '</tbody></table>'; })() +
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
  secs += '<section class="tpl-sec"><h2><span class="tpl-num">02</span> Manufacturing and distribution</h2>' +
    (() => { const c6b = e[1].slice(0, 6); const trb = TRADE_TREND[c6b]; const rows = []; if (trade) { rows.push(['Chapter ' + e[4] + ' imports, India ' + TRADE_YEAR, escA(fmtUsd(trade[0]))]); rows.push(['Chapter ' + e[4] + ' exports, India ' + TRADE_YEAR, escA(fmtUsd(trade[1]))]); } if (trade6) { rows.push(['This product imports, HS ' + c6b + ' ' + TRADE_YEAR, escA(fmtUsd(trade6[0]))]); rows.push(['This product exports, HS ' + c6b + ' ' + TRADE_YEAR, escA(fmtUsd(trade6[1]))]); } if (!rows.length) return ''; return '<h3>Industry scale, India ' + tplTag('fact') + '</h3>' + factTable(rows) + (trb ? trendChart(trb) : '') + tplSrc([{ t: 'UN Comtrade ' + TRADE_YEAR + ' (baked)', u: 'https://comtradeplus.un.org/' }]); })() +
    (has('sec02') ? tplNarr(narrative, 'sec02') : tplFallback('manufacturing and distribution', chTitle)) +
    tplSrc([{ t: aiUsed && has('sec02') ? 'AI analysis (' + geminiAiLabel() + '), generated ' + today : 'No section-specific source - general context' }]) + '</section>';
  // 03
  secs += '<section class="tpl-sec"><h2><span class="tpl-num">03</span> Global market, pricing and shortages</h2>' +
    '<h3>Duty / rate for this product across ' + SYS.length + ' official systems ' + tplTag('fact') + '</h3>' +
    '<table class="tpl-table"><thead><tr><th>System</th><th>Code</th><th>Level</th><th>General (MFN) rate</th></tr></thead><tbody>' +
    dutyRows.map((r) => '<tr><td>' + escA(SYS[r.sys].name) + '</td><td>' + escA(fmtCode(r.sys, r.e[1])) + '</td><td>' + escA(levelName(r.e[1])) + '</td><td>' + escA(r.e[5] || 'No open rate') + '</td></tr>').join('') + '</tbody></table>' +
    '<p class="muted">' + rated.length + ' of ' + dutyRows.length + ' systems publish an open general rate here; preferential/FTA rates excluded. Rates change - verify on the official portal before filing.</p>' +
    (trade6 ? '<h3>India trade for this product, HS ' + escA(e[1].slice(0, 6)) + ', calendar ' + TRADE_YEAR + ' ' + tplTag('fact') + '</h3>' + factTable([['Imports (CIF, USD)', escA(fmtUsd(trade6[0]))], ['Exports (USD)', escA(fmtUsd(trade6[1]))]]) : '') +
    (() => { const tp6 = TRADE_PARTNERS[e[1].slice(0, 6)]; if (!tp6) return '';
      const rows = [];
      for (const p of tp6.x) rows.push(['Exports to ' + p[0], escA(fmtUsd(p[1])) + (p[2] ? ' - ' + escA(usdPerKg(p[1], p[2])) : '')]);
      for (const p of tp6.m) rows.push(['Imports from ' + p[0], escA(fmtUsd(p[1])) + (p[2] ? ' - ' + escA(usdPerKg(p[1], p[2])) : '')]);
      if (tp6.xq) rows.push(['Export volume', escA(fmtQty(tp6.xq[0], tp6.xq[1]))]);
      if (tp6.xn) rows.push(['Export net weight', escA(fmtQty(tp6.xn[0], 'kg')) + (tp6.xn[1] ? ' (estimated)' : '')]);
      let out = rows.length ? '<h3>Top trading partners and volumes, HS ' + escA(e[1].slice(0, 6)) + ', calendar ' + TRADE_PARTNERS_YEAR + ' ' + tplTag('fact') + '</h3>' + factTable(rows) : '';
      if (tp6.gx && tp6.gx.length) out += '<h3>World top exporters and importers, HS ' + escA(e[1].slice(0, 6)) + ', calendar ' + TRADE_PARTNERS_YEAR + ' ' + tplTag('fact') + '</h3>' +
        factTable(tp6.gx.map((p) => ['Exports from ' + p[0], escA(fmtUsd(p[1]))]).concat(tp6.gm.map((p) => ['Imports into ' + p[0], escA(fmtUsd(p[1]))])));
      return out; })() +
    (() => { const tr = TRADE_TREND[e[1].slice(0, 6)]; if (!tr) return '';
      const yrs = tr.filter((r) => r[1] || r[2]); if (!yrs.length) return '';
      const first = yrs[0], last = yrs[yrs.length - 1];
      const grow = (a, b) => { if (!(a > 0 && b > 0)) return 'n/a'; const r = b / a, p = Math.round((r - 1) * 100); return r >= 1.05 ? 'up ' + r.toFixed(1).replace(/\.0$/, '') + 'x' : p === 0 ? 'roughly flat' : (p > 0 ? 'up ' + p : 'down ' + (-p)) + '%'; };
      const rows = yrs.map((r) => [String(r[0]), 'imports ' + escA(fmtUsd(r[1])) + (r[3] ? ' (' + escA(fmtQty(r[3], 'kg')) + ')' : '') + ' - exports ' + escA(fmtUsd(r[2])) + (r[4] ? ' (' + escA(fmtQty(r[4], 'kg')) + ')' : '')]);
      rows.push(['Change ' + first[0] + ' to ' + last[0], 'imports ' + grow(first[1], last[1]) + ' - exports ' + grow(first[2], last[2])]);
      return '<h3>India trade trend, HS ' + escA(e[1].slice(0, 6)) + ', ' + TRADE_TREND_YEARS[0] + '-' + TRADE_TREND_YEARS[TRADE_TREND_YEARS.length - 1] + ' ' + tplTag('fact') + '</h3>' + trendChart(tr) + factTable(rows); })() +
    (trade ? '<h3>India trade in chapter ' + escA(e[4]) + ', calendar ' + TRADE_YEAR + ' ' + tplTag('fact') + '</h3>' + factTable([['Imports (CIF, USD)', escA(fmtUsd(trade[0]))], ['Exports (USD)', escA(fmtUsd(trade[1]))], ['Balance', trade[1] > trade[0] ? 'India is a net exporter in this chapter.' : (trade[0] > trade[1] * 3 ? 'India relies heavily on imports in this chapter.' : 'Mixed trade balance.')]]) : '') +
    tplTradeChart(trade6, trade, e[1].slice(0, 6)) +
    tplDutyChart(rated) +
    (has('sec03') ? '<h3>Market analysis</h3>' + tplNarr(narrative, 'sec03') : tplFallback('market and pricing', chTitle)) +
    tplSrc([{ t: SYS[e[0]].src, u: SYS[e[0]].url }, { t: 'UN Comtrade annual data, reporter India, partner World, ' + TRADE_YEAR + ' (baked into this file)', u: 'https://comtradeplus.un.org/' }].concat(has('sec03') ? [{ t: 'AI analysis (' + geminiAiLabel() + '), generated ' + today }] : [])) +
    '</section>';
  // 04
  secs += '<section class="tpl-sec"><h2><span class="tpl-num">04</span> Buyers and sellers by country</h2>' +
    (() => { const tp4 = TRADE_PARTNERS[e[1].slice(0, 6)]; if (!tp4) return ''; let out = ''; if (tp4.x.length) out += '<h3>Likely buyer markets - India\'s top export destinations, ' + TRADE_PARTNERS_YEAR + ' ' + tplTag('fact') + '</h3>' + factTable(tp4.x.map((pp) => [pp[0], escA(fmtUsd(pp[1])) + (trade6 && trade6[1] ? ' (' + Math.round(100 * pp[1] / trade6[1]) + '% of India\'s exports)' : '')])); if (tp4.m.length) out += '<h3>Competing supplier countries - India\'s top import origins, ' + TRADE_PARTNERS_YEAR + ' ' + tplTag('fact') + '</h3>' + factTable(tp4.m.map((pp) => [pp[0], escA(fmtUsd(pp[1])) + (trade6 && trade6[0] ? ' (' + Math.round(100 * pp[1] / trade6[0]) + '% of India\'s imports)' : '')])); return out; })() + (has('sec04') ? tplNarr(narrative, 'sec04') : tplFallback('buyer and seller company', chTitle)) +
    tplSrc([{ t: has('sec04') ? 'AI analysis (' + geminiAiLabel() + '), generated ' + today + ' - verify every company claim independently before contacting' : 'No verified company-level data in this file' }]) + '</section>';
  // 05
  secs += '<section class="tpl-sec"><h2><span class="tpl-num">05</span> India market and opportunities</h2>' +
    (e[0] === 1 && g ? '<h3>India duty and tax position ' + tplTag('fact') + '</h3>' + factTable([['IGST', '<strong>' + escA(g[0]) + '</strong> - ' + escA(g[1])], ['Legal basis', 'Notification No. 9/2025-Integrated Tax (Rate), 17 Sep 2025']]) : '') +
    (trade6 ? '<h3>India product trade, HS ' + escA(e[1].slice(0, 6)) + ', ' + TRADE_YEAR + ' ' + tplTag('fact') + '</h3>' + factTable([['Imports (CIF)', escA(fmtUsd(trade6[0]))], ['Exports', escA(fmtUsd(trade6[1]))]]) : '') +
    (trade ? '<h3>India chapter trade, ' + TRADE_YEAR + ' ' + tplTag('fact') + '</h3>' + factTable([['Imports', escA(fmtUsd(trade[0]))], ['Exports', escA(fmtUsd(trade[1]))]]) : '') +
    (has('sec05') ? '<h3>Opportunities analysis</h3>' + tplNarr(narrative, 'sec05') : tplFallback('India market', chTitle)) +
    (() => { const tr5 = TRADE_TREND[e[1].slice(0, 6)]; if (!tr5) return ''; const yrs5 = tr5.filter((r) => r[1] || r[2]); if (yrs5.length < 2) return ''; return '<h3>Five-year trajectory ' + tplTag('fact') + '</h3>' + trendChart(tr5); })() +
    tplSrc([{ t: 'CBIC GST rates', u: 'https://cbic-gst.gov.in/gst-goods-services-rates.html' }, { t: 'UN Comtrade ' + TRADE_YEAR + ' (baked)', u: 'https://comtradeplus.un.org/' }].concat(has('sec05') ? [{ t: 'AI analysis, generated ' + today }] : [])) +
    '</section>';
  // 06
  secs += '<section class="tpl-sec"><h2><span class="tpl-num">06</span> Geopolitics and supply-chain risks</h2>' +
    (() => { const tp6b = TRADE_PARTNERS[e[1].slice(0, 6)]; if (!tp6b || !trade6) return ''; const items = []; if (tp6b.m.length && trade6[0]) items.push('Import concentration: ' + tp6b.m[0][0] + ' alone supplied ' + Math.round(100 * tp6b.m[0][1] / trade6[0]) + '% of India\'s imports of this product in ' + TRADE_PARTNERS_YEAR + '.'); if (tp6b.x.length && trade6[1]) items.push('Market concentration: ' + tp6b.x[0][0] + ' took ' + Math.round(100 * tp6b.x[0][1] / trade6[1]) + '% of India\'s exports of this product in ' + TRADE_PARTNERS_YEAR + '.'); if (trade6[0] > trade6[1] * 3) items.push('Import dependence: India imports more than 3x what it exports here - supply shocks hit buyers directly.'); if (!items.length) return ''; return '<h3>Measured supply-chain exposure ' + tplTag('fact') + '</h3><ul class="tpl-list">' + items.map((x) => '<li>' + escA(x) + '</li>').join('') + '</ul>' + tplSrc([{ t: 'Computed from UN Comtrade ' + TRADE_PARTNERS_YEAR + ' (baked)', u: 'https://comtradeplus.un.org/' }]); })() +
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
    (() => { const tr12 = TRADE_TREND[e[1].slice(0, 6)]; if (!tr12) return ''; const rows = []; for (const r of tr12) { const uv = []; if (r[1] && r[3]) uv.push('imports ' + usdPerKg(r[1], r[3])); if (r[2] && r[4]) uv.push('exports ' + usdPerKg(r[2], r[4])); if (uv.length) rows.push([String(r[0]), escA(uv.join(' - '))]); } if (!rows.length) return ''; return '<h3>Unit values, USD per kg ' + tplTag('fact') + '</h3>' + factTable(rows) + '<p class="muted">Trade value / net weight per year, computed from UN Comtrade. A proxy for price movement, not a quoted price.</p>'; })() +
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
    factTable([
      ['Dataset build', escA(DATA_BUILD)],
      ['Tariff systems', String(SYS.length) + ' official systems - section 01 cites this code\'s source'],
      ['India GST', 'Notification No. 9/2025-Integrated Tax (Rate), 17 Sep 2025'],
      ['India trade values', 'UN Comtrade, calendar ' + TRADE_YEAR],
      ['Trade partners and volumes', 'UN Comtrade, calendar ' + TRADE_PARTNERS_YEAR],
      ['Trade trend', 'UN Comtrade, ' + TRADE_TREND_YEARS[0] + '-' + TRADE_TREND_YEARS[TRADE_TREND_YEARS.length - 1]],
      ['Sanctions lists', 'OFAC SDN, EU consolidated, UFLPA - pull dates in section 06'],
    ]) +
    (aiUsed && aiProviderUsed === 'groq' ? '<p>' + tplTag('AI') + ' ' + (aiLiveSearch
      ? 'AI-written market sections in this report used live web search today (Groq browser search, powered by Exa). Inline citation markers were removed for readability; verify live claims against the official sources cited in each section before acting.'
      : 'AI-written market sections in this report used the Groq model\u2019s built-in knowledge only - no live web search was performed. Treat them as leads and verify against current official sources.') + '</p>' : '') +
    (aiUsed && aiCrossNote ? (aiCrossNote.ok
      ? '<p>' + tplTag('fact') + ' Cross-checked: a second AI provider (' + escA(aiCrossNote.by) + ') reviewed this report against the dataset and UN Comtrade figures - no contradictions found.</p>'
      : '<p>' + tplTag('ai') + ' Second opinion (' + escA(aiCrossNote.by) + ') flags - verify before acting:</p><ul>' + aiCrossNote.issues.map((i) => '<li>' + escA(i) + '</li>').join('') + '</ul>') : '') +
    (aiUsed && !aiCrossNote && !aiHasBoth() ? '<p>' + tplTag('ai') + ' AI sections were written by a single provider and not cross-checked. Add both a Gemini and a Groq key to enable the second-opinion check.</p>' : '') +
    (has('sec14') ? '<h3>What is changing</h3>' + tplNarr(narrative, 'sec14') : tplFallback('change and outlook', chTitle)) +
    tplSrc([{ t: SYS[e[0]].src, u: SYS[e[0]].url }].concat(has('sec14') ? [{ t: 'AI analysis, generated ' + today }] : [])) + '</section>';

  secs += '<section class="tpl-sec"><h2><span class="tpl-num">15</span> Documents and compliance checklist</h2>' +
    '<p class="muted">Paperwork typically needed to move this product to or from India. AI-compiled from current official guidance - confirm each item with your CHA or DGFT before shipping.</p>' +
    (has('sec15') ? tplTag('ai') + tplDocTable(narrative.sec15) : '<h3>General export/import paperwork for India ' + tplTag('general') + '</h3><ul class="tpl-check">' + ['Commercial invoice and packing list', 'Bill of lading / airway bill', 'Certificate of origin (needed for FTA preferential duty claims)', 'Import Export Code (IEC) from DGFT, and AD code registration with your bank', 'GST registration; e-invoice and e-way bill where applicable', 'Insurance, and product test certificates where the product demands them (e.g. BIS for regulated goods)'].map((x) => '<li>' + escA(x) + '</li>').join('') + '</ul><p class="muted">Standard process list - confirm the exact set for this product with your CHA or DGFT before shipping.</p>') +
    tplSrc([{ t: has('sec15') ? 'AI analysis (' + geminiAiLabel() + '), generated ' + today + ' - confirm against DGFT/CBIC before shipping' : 'No section-specific source - general context' }, { t: 'DGFT', u: 'https://www.dgft.gov.in/' }, { t: 'CBIC', u: 'https://www.cbic.gov.in/' }]) + '</section>';
  secs += '<section class="tpl-sec"><h2><span class="tpl-num">16</span> Logistics and Incoterms</h2>' +
    (has('sec16') ? tplNarr(narrative, 'sec16') : '<h3>Incoterms 2020 quick reference ' + tplTag('general') + '</h3><table class="tpl-table"><thead><tr><th>Term</th><th>Seller delivers</th></tr></thead><tbody>' + [['EXW', 'at own premises - buyer carries everything'], ['FCA', 'to the buyer\'s carrier'], ['FOB', 'on board the vessel (sea only)'], ['CFR', 'pays ocean freight; risk passes on loading'], ['CIF', 'CFR plus insurance'], ['DAP', 'at the named place, ready for unloading'], ['DDP', 'delivered duty paid - maximum seller responsibility']].map((r) => '<tr><td>' + r[0] + '</td><td>' + escA(r[1]) + '</td></tr>').join('') + '</tbody></table><p class="muted">ICC Incoterms 2020, general reference. Agree the term before pricing - it decides who pays freight, insurance and duty.</p>') +
    tplSrc([{ t: has('sec16') ? 'AI analysis (' + geminiAiLabel() + '), generated ' + today : 'No section-specific source - general context' }]) + '</section>';
  secs += '<section class="tpl-sec"><h2><span class="tpl-num">17</span> Policy changes and news</h2>' +
    (has('sec17') ? tplNarr(narrative, 'sec17') : '<h3>Where this report stands today ' + tplTag('fact') + '</h3><p>This file has no live news feed. What it does have: the dataset rebuilds automatically from official sources (current build ' + escA(DATA_BUILD) + '), and the finder\'s change-alerts feature flags saved codes whose duty, GST or linkage changed between builds. For same-day policy moves check the CBIC notifications page and the DGFT portal directly.</p>') +
    tplSrc([{ t: has('sec17') ? 'AI analysis (' + geminiAiLabel() + '), generated ' + today + ' - verify against the gazette or notification cited' : 'No section-specific source - general context' }]) + '</section>';
  // 18-19 (user wishlist: crisis watch + sanctions status, live-searched when a Groq key exists)
  secs += '<section class="tpl-sec"><h2><span class="tpl-num">18</span> Crisis and risk watch</h2>' +
    (has('sec18') ? tplNarr(narrative, 'sec18') : tplFallback('crisis and risk', chTitle)) +
    tplSrc([{ t: has('sec18') ? 'AI analysis (' + geminiAiLabel() + '), generated ' + today + ' - fast-moving situation, verify before acting' : 'No section-specific source - general context' }]) + '</section>';
  secs += '<section class="tpl-sec"><h2><span class="tpl-num">19</span> Sanctions status</h2>' +
    (scomet ? '<p>' + tplTag('fact') + ' This code is on India\u2019s SCOMET export-control list - export licensing applies. See the Documents section.</p>' : '') +
    (has('sec19') ? tplNarr(narrative, 'sec19') : tplFallback('sanctions status', chTitle)) +
    '<p class="muted">Counterparty screening: this file\u2019s main page carries an offline checker against the US OFAC SDN, EU consolidated and DHS UFLPA lists - screen every buyer and seller there before dealing.</p>' +
    tplSrc([{ t: has('sec19') ? 'AI analysis (' + geminiAiLabel() + '), generated ' + today + ' - verify against OFAC, EU and Indian official notices' : 'No section-specific source - general context' }]) + '</section>';

  // 20 FAQ (deterministic answers from baked data)
  secs += '<section class="tpl-sec"><h2><span class="tpl-num">20</span> FAQ - quick answers</h2>' + (() => {
    const qa = [];
    qa.push(['What is the code for ' + prod + '?', fmtCode(e[0], e[1]) + ' in ' + SYS[e[0]].name + ' (' + levelName(e[1]) + ').']);
    if (e[0] === 1 && g) qa.push(['What is the India GST rate?', g[0] + ' IGST under Notification 9/2025-Integrated Tax (Rate) - ' + g[1] + '.']);
    else if (e[5]) qa.push(['What is the duty rate?', e[5] + ' (general/MFN) in ' + SYS[e[0]].name + '.']);
    const tpq = TRADE_PARTNERS[e[1].slice(0, 6)];
    if (tpq && tpq.x.length) qa.push(['Who buys the most of this from India?', tpq.x[0][0] + ' - ' + fmtUsd(tpq.x[0][1]) + ' in ' + TRADE_PARTNERS_YEAR + ' (UN Comtrade).']);
    if (tpq && tpq.m.length) qa.push(['Where does India import it from?', tpq.m[0][0] + ' - ' + fmtUsd(tpq.m[0][1]) + ' in ' + TRADE_PARTNERS_YEAR + ' (UN Comtrade).']);
    const trq = TRADE_TREND[e[1].slice(0, 6)];
    if (trq) { const yq = trq.filter((r) => r[1] || r[2]); if (yq.length >= 2) { const f0 = yq[0], l0 = yq[yq.length - 1]; qa.push(['Is India\'s trade in this product growing?', 'Imports ' + fmtUsd(f0[1]) + ' (' + f0[0] + ') to ' + fmtUsd(l0[1]) + ' (' + l0[0] + '); exports ' + fmtUsd(f0[2]) + ' to ' + fmtUsd(l0[2]) + ' - see the trend chart in section 03.']); } }
    qa.push(['Is this product export-controlled from India?', scomet ? 'Yes - SCOMET entry ' + scomet[0] + '; DGFT export authorisation needed (see section 08).' : (scometUnder.length ? 'Lines under this code are SCOMET-controlled (' + scometUnder.length + ') - see section 08.' : 'No SCOMET code flag in the DGFT mapping - but most of the SCOMET list is description-based, so check the full official list before exporting.')]);
    return '<table class="tpl-table"><tbody>' + qa.map((r) => '<tr><th>' + escA(r[0]) + '</th><td>' + escA(r[1]) + '</td></tr>').join('') + '</tbody></table>' + tplSrc([{ t: 'All answers computed from the baked official data in this file' }]);
  })() + '</section>';

  const contents = TPL_SECTIONS.map((s) => '<li><span class="tpl-num">' + s[0] + '</span> ' + esc(s[1]) + '</li>').join('');
  const modeLine = aiUsed
    ? 'Live AI research edition - narrative sections written by ' + geminiAiLabel() + ' and labelled ANALYTICAL JUDGMENT; all codes, rates, GST, trade figures and sanctions facts are exact official data baked into this file.'
    : 'Data edition - codes, rates, GST, trade figures and sanctions facts are exact official data baked into this file; narrative sections show general chapter-level context. Add a free Gemini key on the code page to generate the full AI-written edition.' +
      (opts.aiError ? ' (AI narrative sections were unavailable this time - the free AI services were busy or at their daily limit. Every figure, code and rate in this report is verified official data.)' : '');

  return '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' +
    '<title>' + esc(prod) + ' - Product Research Report</title><style>' +
    '@page { size: A4; margin: 14mm 12mm 20mm 12mm; }' +
    '* { box-sizing: border-box; }' +
    'html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }' +
    'body { font-family: Georgia, "Times New Roman", serif; color: #21242b; margin: 0 auto; max-width: 186mm; background: #efeae1; position: relative; }' +
    'h1,h2,h3 { font-family: -apple-system, "Segoe UI", Arial, sans-serif; color: #1a2332; }' +
    'p, li, td, th { font-size: 12.5px; line-height: 1.6; }' +
    '.tpl-page { background: #fff; min-height: 250mm; padding: 16mm 16mm 20mm; margin: 8mm auto; break-after: page; box-shadow: 0 2px 14px rgba(26,35,50,.14); border-top: 2.2mm solid #9a7b2d; }' +
    '.tpl-sec { background: #fff; padding: 12mm 16mm 10mm; margin: 8mm auto; break-before: page; box-shadow: 0 2px 14px rgba(26,35,50,.14); border-top: 1mm solid #e4dcc8; }' +
    '.tpl-cover-top { display: flex; justify-content: space-between; align-items: baseline; border-bottom: 1px solid #e4dcc8; padding-bottom: 3mm; }' +
    '.tpl-brand { font-family: -apple-system, Arial, sans-serif; letter-spacing: .42em; font-size: 14px; font-weight: 700; color: #9a7b2d; text-transform: uppercase; }' +
    '.tpl-doctype { font-family: -apple-system, Arial, sans-serif; font-size: 9.5px; letter-spacing: .18em; text-transform: uppercase; color: #8b8574; }' +
    '.tpl-cover-title { font-size: 34px; line-height: 1.12; letter-spacing: -0.01em; margin: 8mm 0 2.5mm; }' +
    '.tpl-cover-sub { color: #5a616e; font-size: 14.5px; margin: 0 0 4mm; }' +
    '.tpl-contents { columns: 2; list-style: none; padding: 0; margin: 6mm 0 0; }' +
    '.tpl-contents li { padding: 2.2mm 0; border-bottom: 1px solid #eee6d4; font-size: 12.5px; break-inside: avoid; }' +
    '.tpl-contents .tpl-num { color: #9a7b2d; }' +
    '.tpl-page h2 { font-size: 18px; margin: 0 0 4mm; padding-bottom: 2mm; border-bottom: 2px solid #1a2332; break-after: avoid; }' +
    '.tpl-sec h2 { display: flex; align-items: baseline; gap: 3mm; font-size: 21px; letter-spacing: -0.005em; margin: 0 0 5mm; padding-bottom: 2.6mm; border-bottom: 2px solid #1a2332; break-after: avoid; }' +
    '.tpl-num { font-family: -apple-system, Arial, sans-serif; color: #9a7b2d; font-weight: 700; }' +
    '.tpl-sec h2 .tpl-num { flex: 0 0 auto; background: #1a2332; color: #f3ecd9; font-size: 12px; letter-spacing: .08em; border-radius: 2px; padding: 1.4mm 2.6mm; }' +
    '.tpl-sec h3 { font-size: 14px; margin: 6mm 0 2mm; break-after: avoid; }' +
    '.tpl-tag { display: inline-block; font-family: -apple-system, Arial, sans-serif; font-size: 8.5px; font-weight: 700; letter-spacing: .07em; padding: 1mm 2.6mm; border-radius: 999px; vertical-align: middle; margin-left: 2mm; }' +
    '.tpl-tag.fact { background: #e8f3e9; color: #1e6b2e; border: 1px solid #b8d9bc; }' +
    '.tpl-tag.judge { background: #fdf0dc; color: #8a5a12; border: 1px solid #ecd3a8; }' +
    '.tpl-table { width: 100%; border-collapse: collapse; margin: 3.5mm 0; }' +
    '.tpl-table th, .tpl-table td { border: 1px solid #e3ddcd; padding: 2mm 2.6mm; text-align: left; vertical-align: top; font-size: 11.5px; }' +
    '.tpl-table thead th { background: #1a2332; color: #f5f1e6; border-color: #1a2332; font-family: -apple-system, Arial, sans-serif; font-size: 10px; letter-spacing: .04em; text-transform: uppercase; }' +
    '.tpl-table tbody th { width: 34%; background: #f7f3e8; color: #1a2332; font-family: -apple-system, Arial, sans-serif; font-size: 10.5px; }' +
    '.tpl-table tbody tr:nth-child(even) td { background: #faf7ef; }' +
    '.tpl-table tr { break-inside: avoid; }' +
    '.tpl-list { padding-left: 6mm; }' +
    '.tpl-check { list-style: none; padding: 0; margin: 3mm 0; }' +
    '.tpl-check li { padding: 2mm 0 2mm 7.5mm; position: relative; border-bottom: 1px dashed #e8e2d4; break-inside: avoid; }' +
    '.tpl-check li::before { content: ""; position: absolute; left: 0; top: 2.8mm; width: 2.8mm; height: 2.8mm; border: 1.5px solid #9a7b2d; border-radius: .8mm; background: #fbf8ef; }' +
    '.tpl-kpis { display: flex; flex-wrap: wrap; gap: 3mm; margin: 6mm 0; }' +
    '.tpl-kpi { flex: 1 1 36mm; border: 1px solid #e7dfc9; border-top: 1.2mm solid #9a7b2d; border-radius: 4px; padding: 3.2mm 3.4mm; background: #fffdf7; break-inside: avoid; }' +
    '.tpl-kpi .k { font-family: -apple-system, Arial, sans-serif; font-size: 9px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: #9a7b2d; }' +
    '.tpl-kpi .v { font-family: -apple-system, Arial, sans-serif; font-size: 17.5px; font-weight: 700; color: #1a2332; margin-top: 1.2mm; }' +
    '.tpl-kpi .s { font-size: 10px; color: #6a7076; margin-top: .6mm; }' +
    '.tpl-chart { margin: 4mm 0; break-inside: avoid; background: #fffdf7; border: 1px solid #efe8d6; border-radius: 4px; padding: 3mm; }' +
    '.tpl-keep { break-inside: avoid; }' +
    '.tpl-chart .cap { font-size: 10px; color: #6a7076; margin-top: 1mm; }' +
    '.tpl-src { font-size: 10.5px; color: #6a7076; border-top: 1px solid #eee6d4; padding-top: 2mm; margin-top: 5mm; }' +
    '.tpl-src a { color: #37527e; }' +
    '.muted { color: #6a7076; font-size: 11px; }' +
    '.pgnum { position: absolute; right: 12mm; font-family: -apple-system, Arial, sans-serif; font-size: 9px; color: #9aa0a8; }' +
    '.tpl-foot { position: fixed; bottom: 0; left: 0; right: 0; font-family: -apple-system, Arial, sans-serif; font-size: 9px; color: #9aa0a8; text-align: center; padding: 1.2mm 0; background: #fff; border-top: 1px solid #eee6d4; }' +
    '.tpl-actions { position: fixed; top: 8px; right: 8px; z-index: 9; }' +
    '.tpl-actions button { font: 600 13px -apple-system, Arial, sans-serif; padding: 8px 14px; border: 0; border-radius: 8px; background: #1a2332; color: #fff; cursor: pointer; box-shadow: 0 2px 8px rgba(26,35,50,.3); }' +
    '@media print { body { background: #fff; max-width: none; } .tpl-page, .tpl-sec { box-shadow: none; margin: 0; } .tpl-actions { display: none; } h2, h3 { break-after: avoid; } }' +
    '</style></head><body>' +
    '<div class="tpl-actions"><button onclick="window.print()">Save as PDF / Print</button></div>' +
    '<div class="tpl-page"><div class="tpl-cover-top"><div class="tpl-brand">Push</div><div class="tpl-doctype">Product Research Report</div></div>' +
    '<h1 class="tpl-cover-title">' + esc(prod) + '</h1>' +
    '<p class="tpl-cover-sub">' + esc(SYS[e[0]].name) + ' - code ' + esc(fmtCode(e[0], e[1])) + '</p>' +
    tplKpis(e, g, trade6, trade, rated) +
    '<table class="tpl-table"><tbody>' +
    '<tr><th>Report date</th><td>' + esc(today) + '</td></tr>' +
    '<tr><th>Edition</th><td>1.0 - ' + (aiUsed ? 'Live AI research edition' : 'Data edition') + '</td></tr>' +
    '<tr><th>Copyright</th><td>Copyright (c) 2026 Push. All rights reserved.</td></tr>' +
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
    '<div class="tpl-foot">Copyright (c) 2026 Push. All rights reserved. - Product Research Report - ' + esc(fmtCode(e[0], e[1])) + ' - compiled from the official sources cited in each section; verify before filing.</div>' +
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
// India national line vs the international WCO 6-digit wording, side by side.
function hsnVsHsHtml(db, e) {
  if (e[0] !== 1 || e[1].length < 6) return '';
  const w = db.keyToIdx.get('0:' + e[1].slice(0, 6));
  if (w === undefined) return '';
  const squash = (t) => String(t || '').toLowerCase().replace(/[^a-z0-9]+/g, '');
  if (squash(db.entries[w][2]) === squash(e[2])) return '';
  return '<div class="detail-sec"><h3>HSN vs international HS</h3>' +
    '<table class="tpl-table"><tbody>' +
    '<tr><th>India HSN ' + esc(fmtCode(1, e[1])) + '</th><td>' + esc(pretty(e[2])) + '</td></tr>' +
    '<tr><th>International HS ' + esc(fmtCode(0, e[1].slice(0, 6))) + ' (WCO)</th><td>' + esc(pretty(db.entries[w][2])) + '</td></tr>' +
    '</tbody></table></div>';
}
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
    (e[5] ? '<div><dt>' + (e[0] === 2 ? 'US general duty' : 'Dataset duty / rate') + '</dt><dd>' + esc(e[5]) + (e[0] === 1 && e[5].indexOf('BCD ') === 0 ? ' <span class="muted">Statutory standard rate, CBIC Customs Tariff First Schedule as on 30.06.2025. Effective rates vary by exemption notification - verify on ICEGATE.</span>' : (e[0] === 3 ? ' <span class="muted">Conventional (MFN) duty, Regulation (EU) 2025/1926 (CN 2026). Tariff quotas, seasonal rates and preferential agreements can lower it - verify in TARIC.</span>' : (e[0] === 4 ? ' <span class="muted">UK third-country (MFN) duty, official UK Global Tariff v4.0.1608. FTA preferences, reliefs and suspensions can lower it - verify on the UK Trade Tariff service.</span>' : (e[0] === 5 ? ' <span class="muted">Korea Customs Service basic rate (기본세율) from the official CLIP tariff rate table, applicable year 2026. Korea FTA rates are usually lower - verify on the KCS CLIP portal.</span>' : (e[0] === 9 ? ' <span class="muted">Mercosur Common External Tariff (TEC) import duty (II), official MDIC consolidated Anexo I of Res. Gecex 272/2021, updated 08-09-2026. BK/BIT ex-tarifario reductions and exception annexes can lower it - verify on Siscomex Classif.</span>' : (e[0] === 12 ? ' <span class="muted">Ordinary customs duty (ordinær toll) from Tolletaten official open data (tollavgiftssats), current 23 Sep 2026. Most industrial goods are duty-free; EFTA/EU and GSP preferential rates are often lower - verify in Tolltariffen.</span>' : '')))))) + '</dd></div>' : '') +
    (e[0] === 1 ? gstRowHtml(e[1]) : '') +
    '</dl>' +
    scometFlagHtml(e);
  s += hsnVsHsHtml(db, e);
  if (!S.clientMode) {
    s += '<div class="detail-sec no-print note-sec"><h3>Your note</h3>' +
      '<textarea class="note-box" id="d-note" rows="3" placeholder="Your private note for this code - client name, shipment, price, anything. Saved on this device only.">' + esc(note) + '</textarea></div>';
  }
  s += linkPanelHtml(e, idx);
  s += dutyCompareHtml(e);
  s += landedCostHtml(e);
  s += currencySlotHtml(e[0]);
  s += tradeCardHtml(e[4], e[1]);
  s += ftaHtml(e[1]);
  s += certsHtml(e[4]);
  s += addHtml(e[1], e[2]);
  s += boomBadgeHtml(e);
  s += riskHtml(e);
  s += rodtepHtml(e);
  s += sancHtml();
  s += docsHtml(e[4]);
  if (path.length > 1) {
    s += '<div class="detail-sec"><h3>Classification path in ' + SYS[e[0]].tag + '</h3><ol class="path-list">' +
      path.map((i) => '<li><button class="linkbtn" data-open="' + i + '">' + esc(fmtCode(db.entries[i][0], db.entries[i][1])) + '</button> <span>' + esc(pretty(db.entries[i][2])) + '</span></li>').join('') +
      '</ol></div>';
  }
  s += '<div class="detail-sec"><h3>Products covered under this code' + (kids.length ? ' (' + kids.length + ')' : '') + '</h3>';
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
      '<label class="sfield"><span class="slabel">Key provider</span><select id="api-provider"><option value="gemini"' + (selProv === 'gemini' ? ' selected' : '') + '>Gemini (Google) - can search the live web</option><option value="groq"' + (selProv === 'groq' ? ' selected' : '') + '>Groq - faster answers</option><option value="mistral"' + (selProv === 'mistral' ? ' selected' : '') + '>Mistral - free tier</option><option value="nvidia"' + (selProv === 'nvidia' ? ' selected' : '') + '>NVIDIA - free key (90-day)</option></select></label>' +
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
  if (el('lc-goods')) {
    const lcUpd = () => paintLanded(e);
    ['lc-goods', 'lc-freight', 'lc-ins', 'lc-bcd'].forEach((id) => { const x = el(id); if (x) x.addEventListener('input', lcUpd); });
  const sancP = el('sanc-pick');
  if (sancP) sancP.addEventListener('change', () => { sancRender(sancP.value); });
    paintLanded(e);
  }
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
      const deep = clsDeep(code);
      const rows = deep[0];
      return '<li><div class="classify-why"><strong>HS ' + esc(code.replace(/(\d{4})(\d{2})/, '$1.$2')) + '</strong> - ' + esc(h.why) + '</div>' +
        (rows.length ? rows.map((i) => { const e = db.entries[i]; return '<button class="result-link linkbtn-block" data-open="' + i + '">' + (e[0] !== 0 ? sysTagHtml(e[0]) : '') + '<span class="rcode">' + esc(fmtCode(e[0], e[1])) + '</span><span class="rdesc">' + esc(pretty(e[2])) + '</span></button>'; }).join('') + (deep[1] > rows.length ? '<span class="muted">+' + (deep[1] - rows.length) + ' more lines under this code in the ' + esc(SYS[V.sysFilter].tag) + ' system - open any row for the full family.</span>' : '') : '<span class="muted">No matching line in this dataset - try the code search.</span>') +
        '</li>';
    }).join('') + '</ul>' +
    (V.clsCross ? '<p class="muted">' + (V.clsCross.agree
      ? 'Cross-checked by ' + esc(V.clsCross.by) + ' - it agrees with these picks.'
      : 'Second opinion (' + esc(V.clsCross.by) + '): suggests HS ' + esc(V.clsCross.better.replace(/(\d{4})(\d{2})/, '$1.$2')) + (V.clsCross.why ? ' - ' + esc(V.clsCross.why) : '') + '. Both readings shown on purpose - compare duties before deciding.') + '</p>' : '');
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
/* Product picks must land on the deepest NATIONAL line of the selected system (8/10-digit), not the generic HS 6-digit family row. Falls back to the HS row when that system has no line under the code. */
function clsDeep(code) {
  const db = S.db;
  if (V.sysFilter > 0) {
    const arr = db.sorted[V.sysFilter] || [];
    const under = [];
    for (const i of arr) { if (db.entries[i][1].startsWith(code)) under.push(i); }
    if (under.length) {
      const leaves = under.filter((i) => !(db.children.get(i) || []).length);
      const pick = leaves.length ? leaves : under;
      return [pick.slice(0, 6), pick.length];
    }
  }
  const rows = clsRowsFor(code);
  return [rows, rows.length];
}
async function classifyRun() {
  const text = V.q.trim();
  if (!text || V.clsBusy) return;
  V.clsBusy = true; V.clsErr = null; V.clsHits = null; V.clsOffline = null; V.clsCross = null;
  paintClassify();
  const hasAi = aiAvailable();
  if (hasAi) {
    try {
      const prompt = 'You are an expert customs tariff classifier using the WCO Harmonized System 2022. A trader describes a product: "' + text.replace(/"/g, "'") + '". Suggest up to 5 most likely 6-digit HS codes (subheading level), best first. Return ONLY a JSON array, no Markdown, no commentary: [{"code":"280421","why":"one short line"}]. Codes must be real HS 2022 subheadings.';
      /* QA hardening: retry once on a malformed/empty AI reply; normalize dotted or 8-digit codes; dedupe. */
      let clean = null, lastErr = null;
      for (let attempt = 0; attempt < 2 && !clean; attempt++) {
        try {
          const txt = (await aiPickText(prompt, { temperature: 0, maxTokens: 4000 })).trim().replace(/```[a-z]*/gi, '');
          const a = txt.indexOf('['); const b = txt.lastIndexOf(']');
          if (a < 0 || b <= a) throw new Error('no JSON');
          const arr = JSON.parse(txt.slice(a, b + 1));
          const seen = {};
          const c2 = arr.map((h) => {
            const d = h ? String(h.code).replace(/\D/g, '') : '';
            return { code: d.length === 6 ? d : (d.length === 8 ? d.slice(0, 6) : ''), why: h ? String(h.why || '') : '' };
          }).filter((h) => /^\d{6}$/.test(h.code) && !seen[h.code] && (seen[h.code] = 1)).slice(0, 5);
          if (!c2.length) throw new Error('no valid codes');
          clean = c2;
        } catch (e) { lastErr = e; }
      }
      if (!clean) throw lastErr;
      V.clsHits = clean;
      V.clsCross = null;
      if (aiHasBoth()) {
        const by = PROVIDER_LABEL[aiCrossBy] || 'a second provider';
        const chk = await aiCrossCall(aiProviderUsed,
          'Product: "' + text.replace(/"/g, "'") + '". Another AI suggested these HS 2022 6-digit codes for it, best first: ' + clean.map((h) => h.code + ' (' + h.why + ')').join('; ') + '. Are these real HS 2022 subheadings and is the first one the best fit? Reply ONLY JSON: {"agree":true} or {"agree":false,"better":"6-digit code","why":"one short line"}.',
          { temperature: 0, maxTokens: 4000 });
        if (chk) {
          try {
            const cj = JSON.parse(chk.slice(chk.indexOf('{'), chk.lastIndexOf('}') + 1));
            if (cj && cj.agree === true) V.clsCross = { by, agree: true };
            else if (cj && cj.agree === false && /^\d{6}$/.test(String(cj.better || '')) && clsRowsFor(String(cj.better)).length) V.clsCross = { by, agree: false, better: String(cj.better), why: String(cj.why || '') };
          } catch (e2) { /* unparseable second opinion - stay silent */ }
        }
      }
      V.clsBusy = false;
      paintClassify();
      paintResults();
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
  paintResults();
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
    '<p><button class="file-button is-compact" data-variant="secondary" id="boom-toggle">' + (V.boom ? 'Hide booming products' : 'Booming products 2025 - India\'s fastest-growing trade lines') + '</button></p>' +
    (V.boom ? boomPanelHtml() : '') +
    '<p><button class="file-button is-compact" data-variant="secondary" id="ships-toggle">' + (V.ships ? 'Hide live ships' : 'Live ships near India ports - real-time vessel positions') + '</button></p>' +
    (V.ships ? '<div id="ships-slot"></div>' : '') +
    '<p><button class="file-button is-compact" data-variant="secondary" id="tcur-toggle">' + (V.tcur ? 'Hide trade currencies' : 'Trade currencies - INR vs USD, EUR, GBP, AED and 8 more (live)') + '</button></p>' +
    (V.tcur ? '<div id="tcur-slot"></div>' : '') +
    '<p><button class="file-button is-compact" data-variant="secondary" id="rev-toggle">' + (V.rev ? 'Hide reverse lookup' : 'Reverse lookup - have a foreign code? Find the India HSN') + '</button></p>' +
    (V.rev ? revPanelHtml() : '') +
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
// ---- Live ships near India ports (AISStream free feed via ais-proxy.js) ----
let shipsTimer = null;
function shipsAgo(sec) {
  if (sec < 60) return sec + 's ago';
  if (sec < 3600) return Math.floor(sec / 60) + 'm ago';
  return Math.floor(sec / 3600) + 'h ' + Math.floor((sec % 3600) / 60) + 'm ago';
}
function shipsLoad() {
  if (!V.ships) return;
  V.shipsBusy = true;
  paintShips();
  const ctrl = new AbortController();
  const to = setTimeout(() => ctrl.abort(), 90000); // free server cold start can take a minute
  fetch(AIS_PROXY_URL + '/ships?port=' + encodeURIComponent(V.shipsPort), { headers: { 'x-app-token': AI_PROXY_TOKEN }, signal: ctrl.signal })
    .then((r) => r.json().then((j) => ({ ok: r.ok, j })))
    .then(({ ok, j }) => {
      clearTimeout(to);
      V.shipsBusy = false;
      if (!ok) {
        V.shipsErr = (j && j.error && /not configured/.test(j.error.message || '')) ? 'setup' : 'down';
        V.shipsData = null;
      } else {
        V.shipsErr = null;
        V.shipsData = j;
        V.shipsAt = Date.now();
      }
      paintShips();
      if (shipsTimer) clearTimeout(shipsTimer);
      if (V.ships) shipsTimer = setTimeout(shipsLoad, 60000);
    })
    .catch(() => {
      clearTimeout(to);
      V.shipsBusy = false; V.shipsErr = 'down'; V.shipsData = null;
      paintShips();
      if (shipsTimer) clearTimeout(shipsTimer);
      if (V.ships) shipsTimer = setTimeout(shipsLoad, 60000);
    });
}
function paintShips() {
  const slot = el('ships-slot');
  if (!slot) return;
  if (V.shipsBusy && !V.shipsData) {
    slot.innerHTML = '<div class="about-box"><h3>Live ships near India ports</h3><p class="muted">Connecting to the live ship feed - the free tracking server sleeps when nobody is watching, so the first load can take up to a minute. Hang on...</p></div>';
    return;
  }
  if (V.shipsErr) {
    slot.innerHTML = '<div class="about-box"><h3>Live ships near India ports</h3><p class="muted">' +
      (V.shipsErr === 'setup'
        ? 'Live tracking is being set up on our side - please check back soon.'
        : 'Could not reach the live ship feed. The free tracking server sleeps when idle and can take up to a minute to wake - tap Retry.') +
      '</p><p><button class="file-button is-compact" data-variant="secondary" id="ships-retry">Retry</button></p></div>';
    const rb = el('ships-retry');
    if (rb) rb.addEventListener('click', shipsLoad);
    return;
  }
  const d = V.shipsData;
  if (!d) { slot.innerHTML = ''; return; }
  const total = d.ports.reduce((a, x) => a + x.count, 0);
  const chips = [{ code: 'ALL', name: 'All ports', count: total }].concat(d.ports)
    .map((x) => '<button class="chip' + (V.shipsPort === x.code ? ' on' : '') + '" data-shipsp="' + x.code + '">' + esc(x.name) + ' (' + x.count + ')</button>').join('');
  let rows = '';
  if (!d.vessels.length) {
    rows = '<p class="muted">No vessels reporting in this area right now' + (d.warming ? ' - the feed just woke up and positions are still arriving, give it a few minutes' : '') + '.</p>';
  } else {
    rows = '<div class="report-table-wrap"><table class="report-table"><thead><tr><th>Vessel</th><th>Type</th><th>Flag</th><th>Speed</th><th>Destination</th><th>ETA (UTC)</th><th>Port area</th><th>Last seen</th></tr></thead><tbody>' +
      d.vessels.map((v) => '<tr><td><strong>' + esc(v.name || 'MMSI ' + v.mmsi) + '</strong></td><td>' + esc(v.type || '-') + '</td><td>' + esc(v.flag || '-') + '</td><td>' + (v.sog !== null ? v.sog + ' kn' : '-') + '</td><td>' + esc(v.dest || '-') + '</td><td>' + esc(v.eta || '-') + '</td><td>' + esc((d.ports.find((x) => x.code === v.port) || {}).name || v.port) + '</td><td>' + esc(shipsAgo(v.seenAgoSec)) + '</td></tr>').join('') +
      '</tbody></table></div>';
  }
  slot.innerHTML = '<div class="about-box"><h3>Live ships near India ports</h3>' +
    '<p class="muted">' + d.count + ' vessel' + (d.count === 1 ? '' : 's') + ' reporting - updated ' + new Date(d.updated).toLocaleTimeString() + (V.shipsBusy ? ' - refreshing...' : ' - auto-refreshes every 60 seconds') + '.</p>' +
    '<div class="chip-row">' + chips + '</div>' + rows +
    '<p class="muted">Every vessel broadcasts its own position by AIS radio; volunteer shore stations relay it through the free AISStream community feed. Coastal coverage only - a ship mid-ocean appears when it nears land. Destination and ETA are keyed in by the crew and can be stale. Free data, not for navigation.</p></div>';
  Array.prototype.forEach.call(slot.querySelectorAll('[data-shipsp]'), (b) => {
    b.addEventListener('click', () => { V.shipsPort = b.getAttribute('data-shipsp'); shipsLoad(); });
  });
}

// ---- Trade currencies: INR vs all major trade currencies, live via Frankfurter/ECB ----
const TCUR_LIST = [
  ['USD', 'US dollar'], ['EUR', 'Euro'], ['GBP', 'British pound'], ['CNY', 'Chinese yuan'],
  ['JPY', 'Japanese yen'], ['AED', 'UAE dirham'], ['KRW', 'South Korean won'], ['SGD', 'Singapore dollar'],
  ['AUD', 'Australian dollar'], ['CAD', 'Canadian dollar'], ['CHF', 'Swiss franc'], ['HKD', 'Hong Kong dollar'],
];
const AED_PEG = 3.6725; // UAE central bank peg: 1 USD = 3.6725 AED, so the dirham row derives from the live USD rate
function tcurLoad() {
  if (!V.tcur) return;
  if (V.tcurData || V.tcurBusy) { paintTcur(); return; }
  V.tcurBusy = true; V.tcurErr = false;
  paintTcur();
  const now = new Date();
  const fmt = (d) => d.toISOString().slice(0, 10);
  const start = new Date(now.getTime() - 400 * 864e5);
  const to = TCUR_LIST.map((c) => c[0]).filter((c) => c !== 'AED').join(',');
  fetch('https://api.frankfurter.dev/v1/' + fmt(start) + '..' + fmt(now) + '?from=INR&to=' + to)
    .then((r) => { if (!r.ok) throw new Error('http ' + r.status); return r.json(); })
    .then((j) => {
      const rates = j.rates || {};
      const days = Object.keys(rates).sort();
      if (!days.length) throw new Error('empty');
      const last = days[days.length - 1];
      const pick = (ago) => {
        const tt = fmt(new Date(now.getTime() - ago * 864e5));
        let best = days[0];
        for (const d of days) { if (d <= tt) best = d; else break; }
        return rates[best];
      };
      const mkRow = (fx) => {
        const cur = 1 / fx(rates[last]);
        const m = 1 / fx(pick(30));
        const y = 1 / fx(pick(365));
        return { cur, p30: ((cur - m) / m) * 100, p365: ((cur - y) / y) * 100 };
      };
      V.tcurData = {
        date: last,
        rows: TCUR_LIST.map((pair) => {
          const r = pair[0] === 'AED' ? mkRow((dr) => dr.USD * AED_PEG) : mkRow((dr) => dr[pair[0]]);
          r.ccy = pair[0]; r.name = pair[1];
          return r;
        }),
      };
      V.tcurBusy = false;
      paintTcur();
    })
    .catch(() => { V.tcurBusy = false; V.tcurErr = true; paintTcur(); });
}
function paintTcur() {
  const slot = el('tcur-slot');
  if (!slot) return;
  if (V.tcurBusy && !V.tcurData) {
    slot.innerHTML = '<div class="about-box"><h3>Trade currencies - INR vs the world</h3><p class="muted">Loading live rates...</p></div>';
    return;
  }
  if (V.tcurErr) {
    slot.innerHTML = '<div class="about-box"><h3>Trade currencies - INR vs the world</h3><p class="muted">Could not load live currency rates - check the connection and tap Retry.</p><p><button class="file-button is-compact" data-variant="secondary" id="tcur-retry">Retry</button></p></div>';
    const rb = el('tcur-retry');
    if (rb) rb.addEventListener('click', () => { V.tcurErr = false; tcurLoad(); });
    return;
  }
  const d = V.tcurData;
  if (!d) { slot.innerHTML = ''; return; }
  const fmtR = (v) => (v >= 5 ? v.toFixed(2) : v.toFixed(3));
  const cell = (p2) => '<span style="color:' + (p2 > 0.05 ? '#a33' : p2 < -0.05 ? '#273' : 'inherit') + '">' + (p2 >= 0 ? '+' : '') + p2.toFixed(1) + '%</span>';
  const weaker = d.rows.filter((r) => r.p30 > 0).length;
  slot.innerHTML = '<div class="about-box"><h3>Trade currencies - INR vs the world</h3>' +
    '<p class="muted">Live rates for ' + esc(d.date) + '. In the last 30 days the rupee weakened against ' + weaker + ' of ' + d.rows.length + ' major trade currencies.</p>' +
    '<div class="report-table-wrap"><table class="report-table"><thead><tr><th>Currency</th><th>Today (1 unit = INR)</th><th>30 days</th><th>1 year</th></tr></thead><tbody>' +
    d.rows.map((r) => '<tr><td><strong>' + r.ccy + '</strong> ' + esc(r.name) + '</td><td>' + fmtR(r.cur) + '</td><td>' + cell(r.p30) + '</td><td>' + cell(r.p365) + '</td></tr>').join('') +
    '</tbody></table></div>' +
    '<p class="muted">Positive % = that currency costs more rupees than before (the rupee weakened against it) - goods priced in it are getting costlier. The UAE dirham row derives from the live US dollar rate: the UAE central bank pegs 1 USD = 3.6725 AED, so the dirham moves exactly with the dollar.</p>' +
    '<p class="muted">Live ECB reference rates via the free Frankfurter API, fetched in your browser when you open this panel - not baked into the dataset. Indicative, not settlement rates.</p></div>';
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
    '<div id="res-slot"></div>' +
    '<div id="cls-slot"></div>' +
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
  const bm = el('boom-toggle');
  if (bm) bm.addEventListener('click', () => { V.boom = !V.boom; paintIdle(); });
  Array.prototype.forEach.call(slot.querySelectorAll('[data-boomf]'), (b) => {
    b.addEventListener('click', () => { V.boomFlow = b.getAttribute('data-boomf'); paintIdle(); });
  });
  const bch = el('boom-ch');
  if (bch) bch.addEventListener('change', () => { V.boomCh = bch.value; paintIdle(); });
  const stg = el('ships-toggle');
  if (stg) stg.addEventListener('click', () => {
    V.ships = !V.ships;
    if (!V.ships && shipsTimer) { clearTimeout(shipsTimer); shipsTimer = null; }
    paintIdle();
    if (V.ships) shipsLoad();
  });
  const tcg = el('tcur-toggle');
  if (tcg) tcg.addEventListener('click', () => {
    V.tcur = !V.tcur;
    paintIdle();
    if (V.tcur) tcurLoad();
  });
  const rt = el('rev-toggle');
  if (rt) rt.addEventListener('click', () => { V.rev = !V.rev; paintIdle(); });
  const runRev = () => {
    const inp = el('rev-in');
    V.revQ = inp ? inp.value : '';
    V.revRes = resolveForeign(V.revQ);
    paintIdle();
  };
  const rg = el('rev-go');
  if (rg) rg.addEventListener('click', runRev);
  const ri = el('rev-in');
  if (ri) ri.addEventListener('keydown', (ev) => { if (ev.key === 'Enter') runRev(); });
}
function paintResults() {
  const slot = el('res-slot');
  if (!slot) return;
  const idle = !V.q.trim();
  if (idle) { slot.innerHTML = ''; return; }
  const r = smartSearch(S.db, V.q, V.sysFilter);
  const exact = r.exact || [];
  const fam = groupFamilies(S.db, r.out).filter((i) => !exact.includes(i));
  const shown = fam.slice(0, 60);
  let s = '';
  if (r.note) s += '<p class="alert-banner no-print">' + esc(r.note) + '</p>';
  if (exact.length || fam.length) {
    s += '<p class="muted no-print">' + (r.out.length >= SEARCH_CAP ? SEARCH_CAP + '+' : fam.length + exact.length) + ' ' + (fam.length + exact.length === 1 ? 'match' : 'matches') + (r.fuzzy ? ' (spell-corrected)' : '') + (fam.length > 60 ? ' - showing first 60. Type more to narrow down.' : '') + ' One row per product - open it for every country\'s code and rate.</p>';
    const row = (i, direct) => {
      const e = S.db.entries[i];
      return '<li><button class="result-link linkbtn-block' + (direct ? ' direct-hit' : '') + '" data-open="' + i + '">' + (e[0] !== 0 ? sysTagHtml(e[0]) : '') + '<span class="rcode">' + esc(fmtCode(e[0], e[1])) + '</span><span class="rdesc">' + esc(pretty(e[2])) + '</span>' + (direct ? ' <span class="muted">exact match</span>' : '') + '</button></li>';
    };
    s += '<ul class="result-list no-print">' + exact.map((i) => row(i, true)).join('') + shown.map((i) => row(i, false)).join('') + '</ul>';
  } else {
    s = (V.clsHits && V.clsHits.length) || (V.clsOffline && V.clsOffline.length) ? '' : '<p class="muted">No matches. Try fewer words or a shorter code prefix.</p>';
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
    '<p class="app-intro">Search WCO, India, USA, EU, UK, Korea, Canada, Japan, Australia, Brazil, Taiwan, New Zealand, Norway, Singapore, Israel, Mexico, Hong Kong, South Africa, Peru, China and the UAE. Every code links international roots to national and statistical lines, with detail and PDF.</p></div>';
}
function footerHtml() {
  return '<footer class="app-foot no-print">Copyright (c) 2026 ' + esc(OWNER) + '. All rights reserved.<br>Tariff descriptions and duty rates compiled from the official public government and WCO sources credited above; verify against the official source before filing.</footer>';
}

export function boot(rootEl) {
  rootEl.innerHTML = '<div class="app-shell"><div class="app-head"><h1 class="app-title">Worldwide HSN Code Finder</h1><p class="muted">Loading 340,232 codes...</p></div></div>';
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
