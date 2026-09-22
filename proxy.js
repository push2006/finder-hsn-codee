// AI proxy for the HSN finder. Provider keys live ONLY in Render environment
// variables here - browsers never see them. The static site calls these
// endpoints; this service forwards to Groq / Gemini / Mistral / NVIDIA and
// returns the provider's answer untouched. Zero dependencies (node >= 20).
//
// Render setup: New Web Service on this repo, Start command `node proxy.js`.
// Environment variables:
//   APP_SECRET   - token the page sends as x-app-token. It is visible in the
//                  public bundle, so it is a speed bump, not a true secret:
//                  it stops drive-by abuse; the rate limit below caps the rest.
//   GEMINI_KEYS  - comma-separated Google AI Studio keys
//   GROQ_KEYS    - comma-separated Groq keys
//   MISTRAL_KEYS - comma-separated Mistral keys (optional)
//   NVIDIA_KEYS  - comma-separated NVIDIA NIM keys (optional)
const http = require('http');

const SECRET = process.env.APP_SECRET || '';
const POOLS = {};
for (const kind of ['gemini', 'groq', 'mistral', 'nvidia']) {
  POOLS[kind] = (process.env[kind.toUpperCase() + '_KEYS'] || '').split(',').map((k) => k.trim()).filter(Boolean);
}
const OFF = { gemini: 0, groq: 0, mistral: 0, nvidia: 0 };

const ROUTES = [
  { kind: 'gemini', match: /^\/gemini\/v1beta\/models\/[A-Za-z0-9._-]+:generateContent$/, upstream: (p) => 'https://generativelanguage.googleapis.com' + p.replace(/^\/gemini/, ''), header: (k) => ({ 'x-goog-api-key': k }) },
  { kind: 'groq', match: /^\/groq\/openai\/v1\/chat\/completions$/, upstream: () => 'https://api.groq.com/openai/v1/chat/completions', header: (k) => ({ Authorization: 'Bearer ' + k }) },
  { kind: 'mistral', match: /^\/mistral\/v1\/chat\/completions$/, upstream: () => 'https://api.mistral.ai/v1/chat/completions', header: (k) => ({ Authorization: 'Bearer ' + k }) },
  { kind: 'nvidia', match: /^\/nvidia\/v1\/chat\/completions$/, upstream: () => 'https://integrate.api.nvidia.com/v1/chat/completions', header: (k) => ({ Authorization: 'Bearer ' + k }) },
];

// Lean abuse cap: 60 AI calls per 10 minutes per IP (a full report is 1-3 calls).
const HITS = new Map();
const WINDOW = 10 * 60 * 1000, MAX = 60;
function rateOk(ip) {
  const now = Date.now();
  let a = HITS.get(ip);
  if (!a || now - a.t > WINDOW) { a = { t: now, n: 0 }; HITS.set(ip, a); }
  a.n++;
  if (HITS.size > 5000) HITS.clear();
  return a.n <= MAX;
}

function send(res, status, body, extra) {
  const headers = Object.assign({ 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }, extra || {});
  res.writeHead(status, headers);
  res.end(typeof body === 'string' ? body : JSON.stringify(body));
}

const port = process.env.PORT || 3000;
http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') {
    res.writeHead(204, { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, GET', 'Access-Control-Allow-Headers': 'Content-Type, x-app-token', 'Access-Control-Max-Age': '86400' });
    return res.end();
  }
  const path = req.url.split('?')[0];
  if (req.method === 'GET' && (path === '/' || path === '/health')) {
    return send(res, 200, 'hsn ai proxy ok - providers configured: ' + Object.keys(POOLS).filter((k) => POOLS[k].length).join(', '));
  }
  if (req.method !== 'POST') return send(res, 405, { error: { message: 'method not allowed' } });
  if (!SECRET || req.headers['x-app-token'] !== SECRET) return send(res, 401, { error: { message: 'bad app token' } });
  const route = ROUTES.find((r) => r.match.test(path));
  if (!route) return send(res, 404, { error: { message: 'unknown endpoint' } });
  const ip = req.headers['cf-connecting-ip'] || req.headers['x-forwarded-for'] || req.socket.remoteAddress || '?';
  if (!rateOk(String(ip).split(',')[0].trim())) return send(res, 429, { error: { message: 'rate limit exceeded. try again later.' } });
  const pool = POOLS[route.kind];
  if (!pool.length) return send(res, 503, { error: { message: route.kind + ' keys not configured on the server' } });
  let body = '';
  req.on('data', (c) => { body += c; if (body.length > 2e6) req.destroy(); });
  req.on('end', async () => {
    for (let i = 0; i < pool.length; i++) {
      const ki = (OFF[route.kind] + i) % pool.length;
      const key = pool[ki];
      try {
        const ctrl = new AbortController();
        const timer = setTimeout(() => ctrl.abort(), 150000);
        const up = await fetch(route.upstream(path), {
          method: 'POST',
          headers: Object.assign({ 'Content-Type': 'application/json' }, route.header(key)),
          body,
          signal: ctrl.signal,
        });
        clearTimeout(timer);
        const text = await up.text();
        if ((up.status === 401 || up.status === 403 || up.status === 429) && pool.length > 1 && i < pool.length - 1) continue; // next key
        OFF[route.kind] = ki;
        res.writeHead(up.status, { 'Content-Type': up.headers.get('content-type') || 'application/json', 'Access-Control-Allow-Origin': '*' });
        return res.end(text);
      } catch (e) {
        if (i < pool.length - 1) continue;
        return send(res, 502, { error: { message: 'upstream unreachable - try again in a minute' } });
      }
    }
  });
}).listen(port, () => console.log('ai proxy listening on ' + port + ' - providers: ' + Object.keys(POOLS).filter((k) => POOLS[k].length).join(', ')));
