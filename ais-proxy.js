// Live-ships proxy for the HSN finder. Holds the AISStream API key server-side
// (Render environment variable) and serves the latest vessel positions near
// major India ports to the static site as plain JSON. Zero dependencies - it
// uses the built-in WebSocket client, so it needs Node 22 or newer.
//
// Render setup: New Web Service on this repo, Start command `node ais-proxy.js`.
// Environment variables:
//   AISSTREAM_KEY - free API key from aisstream.io (Account -> API Keys).
//   APP_SECRET    - same token the AI proxy uses; the page sends it as
//                   x-app-token. Visible in the public bundle, so it is a speed
//                   bump, not a true secret; the rate limit below caps the rest.
//
// Data honesty: positions come from each vessel's own AIS broadcast, picked up
// by volunteer shore stations and relayed by AISStream's free tier. Coverage is
// coastal only - a ship mid-ocean disappears until it nears land. Destination
// and ETA are whatever the crew typed into the AIS unit and can be stale. This
// feed is NOT for navigation.
const http = require('http');

const KEY = process.env.AISSTREAM_KEY || '';
const SECRET = process.env.APP_SECRET || '';
const AIS_URL = process.env.AISSTREAM_URL || 'wss://stream.aisstream.io/v0/stream';

// Major India container/bulk gateways. Boxes are about +/-0.35 deg around each
// anchorage; Haldia/Kolkata gets a wider box to cover the Hooghly approach.
const PORTS = [
  { code: 'INNSA', name: 'Nhava Sheva (JNPT)', lat: 18.95, lon: 72.95 },
  { code: 'INBOM', name: 'Mumbai', lat: 18.9, lon: 72.82 },
  { code: 'INMUN', name: 'Mundra', lat: 22.74, lon: 69.7 },
  { code: 'INIXY', name: 'Kandla (Deendayal)', lat: 23.02, lon: 70.22 },
  { code: 'INMAA', name: 'Chennai', lat: 13.09, lon: 80.3 },
  { code: 'INENR', name: 'Kamarajar (Ennore)', lat: 13.25, lon: 80.35 },
  { code: 'INCOK', name: 'Kochi', lat: 9.97, lon: 76.27 },
  { code: 'INTUT', name: 'Tuticorin (V.O.C.)', lat: 8.79, lon: 78.2 },
  { code: 'INNML', name: 'New Mangalore', lat: 12.93, lon: 74.8 },
  { code: 'INVTZ', name: 'Visakhapatnam', lat: 17.69, lon: 83.29 },
  { code: 'INPRT', name: 'Paradip', lat: 20.3, lon: 86.62 },
  { code: 'INHAL', name: 'Haldia / Kolkata', lat: 21.75, lon: 87.95, wide: true },
];
const BOXES = PORTS.map((p) => {
  const d = p.wide ? 0.6 : 0.35;
  return [[p.lat - d, p.lon - d], [p.lat + d, p.lon + d]];
});

// MMSI first three digits (MID) -> flag, covering the common registries.
const MID = { 201: 'Albania', 205: 'Belgium', 209: 'Cyprus', 210: 'Cyprus', 211: 'Germany', 212: 'Cyprus', 215: 'Malta', 219: 'Denmark', 220: 'Denmark', 224: 'Spain', 225: 'Spain', 226: 'France', 227: 'France', 228: 'France', 229: 'Malta', 231: 'Faroe Is.', 232: 'United Kingdom', 233: 'United Kingdom', 234: 'United Kingdom', 235: 'United Kingdom', 237: 'Greece', 238: 'Croatia', 239: 'Greece', 240: 'Greece', 241: 'Greece', 244: 'Netherlands', 245: 'Netherlands', 246: 'Netherlands', 247: 'Italy', 248: 'Malta', 249: 'Malta', 255: 'Portugal', 256: 'Malta', 257: 'Norway', 258: 'Norway', 259: 'Norway', 265: 'Sweden', 266: 'Sweden', 268: 'San Marino', 270: 'Czechia', 273: 'Russia', 275: 'Latvia', 276: 'Estonia', 277: 'Lithuania', 301: 'Anguilla', 303: 'Alaska USA', 304: 'Antigua', 305: 'Antigua', 306: 'Curacao', 307: 'Aruba', 308: 'Bahamas', 309: 'Bahamas', 310: 'Bermuda', 311: 'Bahamas', 312: 'Belize', 314: 'Barbados', 316: 'Canada', 319: 'Cayman Is.', 325: 'Dominica', 327: 'Dominican Rep.', 329: 'Guadeloupe', 330: 'Grenada', 331: 'Greenland', 332: 'Guatemala', 334: 'Honduras', 336: 'Haiti', 338: 'USA', 339: 'Jamaica', 341: 'St Kitts', 343: 'St Lucia', 345: 'Mexico', 351: 'Panama', 352: 'Panama', 353: 'Panama', 354: 'Panama', 355: 'Panama', 356: 'Panama', 357: 'Panama', 362: 'Trinidad', 364: 'Turks Caicos', 366: 'USA', 367: 'USA', 368: 'USA', 369: 'USA', 370: 'Panama', 371: 'Panama', 372: 'Panama', 373: 'Panama', 374: 'Panama', 375: 'St Vincent', 376: 'St Vincent', 377: 'St Vincent', 378: 'Argentina', 401: 'Afghanistan', 403: 'Saudi Arabia', 405: 'Bangladesh', 408: 'Bahrain', 410: 'Bhutan', 412: 'China', 413: 'China', 414: 'China', 416: 'Taiwan', 417: 'Sri Lanka', 419: 'India', 422: 'Iran', 425: 'Iraq', 428: 'Israel', 431: 'Japan', 432: 'Japan', 434: 'Turkmenistan', 436: 'Kazakhstan', 440: 'South Korea', 441: 'South Korea', 445: 'North Korea', 447: 'Kuwait', 450: 'Lebanon', 453: 'Macao', 455: 'Maldives', 457: 'Mongolia', 459: 'Nepal', 461: 'Oman', 463: 'Pakistan', 466: 'Qatar', 468: 'Syria', 469: 'UAE', 470: 'UAE', 471: 'UAE', 472: 'Tajikistan', 473: 'Yemen', 475: 'Yemen', 477: 'Hong Kong', 478: 'Bosnia', 480: 'Chile', 501: 'Antarctica', 503: 'Australia', 510: 'Micronesia', 511: 'Palau', 515: 'Cambodia', 518: 'Cook Is.', 520: 'Fiji', 525: 'Indonesia', 529: 'Kiribati', 533: 'Malaysia', 536: 'Nauru', 538: 'Marshall Is.', 540: 'New Caledonia', 542: 'Niue', 544: 'Nauru', 546: 'French Polynesia', 548: 'Philippines', 553: 'Papua NG', 555: 'Pitcairn', 557: 'Solomon Is.', 559: 'American Samoa', 561: 'Samoa', 563: 'Singapore', 564: 'Singapore', 565: 'Singapore', 566: 'Singapore', 567: 'Thailand', 570: 'Tonga', 572: 'Tuvalu', 574: 'Vietnam', 576: 'Vanuatu', 577: 'Vanuatu', 601: 'South Africa', 603: 'Angola', 607: 'Djibouti', 608: 'Ascension', 609: 'Burundi', 610: 'Benin', 611: 'Botswana', 612: 'CAR', 613: 'Cameroon', 615: 'Congo', 617: 'Comoros', 618: 'Cape Verde', 619: 'Ivory Coast', 620: 'Comoros', 621: 'Djibouti', 622: 'Egypt', 624: 'Ethiopia', 625: 'Eritrea', 626: 'Gabon', 627: 'Ghana', 629: 'Gambia', 630: 'Guinea-Bissau', 631: 'Eq. Guinea', 632: 'Guinea', 633: 'Burkina Faso', 634: 'Kenya', 635: 'Antarctica', 636: 'Liberia', 637: 'Liberia', 638: 'South Sudan', 642: 'Libya', 644: 'Lesotho', 645: 'Mauritius', 646: 'Madagascar', 647: 'Mali', 649: 'Mauritania', 650: 'Mozambique', 654: 'Niger', 655: 'Nigeria', 657: 'Namibia', 659: 'Seychelles', 660: 'Reunion', 661: 'Rwanda', 662: 'Sudan', 663: 'Senegal', 664: 'Seychelles', 665: 'St Helena', 666: 'Somalia', 667: 'Sierra Leone', 668: 'Sao Tome', 669: 'Eswatini', 670: 'Chad', 671: 'Togo', 672: 'Tunisia', 674: 'Tanzania', 675: 'Uganda', 676: 'DR Congo', 677: 'Tanzania', 678: 'Zambia', 679: 'Zimbabwe', 710: 'Brazil', 720: 'Bolivia', 725: 'Chile', 730: 'Colombia', 735: 'Ecuador', 740: 'Falkland Is.', 745: 'Guyana', 750: 'Paraguay', 755: 'Peru', 760: 'Suriname', 765: 'Uruguay', 770: 'Venezuela' };

function flagOf(mmsi) {
  const mid = Number(String(mmsi).slice(0, 3));
  return MID[mid] || null;
}
function typeText(t) {
  if (t >= 60 && t <= 69) return 'Passenger';
  if (t >= 70 && t <= 79) return 'Cargo';
  if (t >= 80 && t <= 89) return 'Tanker';
  if (t === 30) return 'Fishing';
  if (t === 52 || t === 31 || t === 32) return 'Tug';
  if (t === 50) return 'Pilot boat';
  if (t === 35) return 'Military';
  if (t === 36) return 'Sailing';
  if (t === 37) return 'Pleasure';
  if (t === 51) return 'SAR';
  if (t === 53 || t === 55 || t === 58 || t === 59) return 'Service';
  if (t === 33 || t === 34) return 'Work boat';
  if (t >= 40 && t <= 49) return 'High-speed';
  if (t >= 90) return 'Other';
  return null;
}

function distKm(aLat, aLon, bLat, bLon) {
  const r = Math.PI / 180;
  const h = Math.sin((bLat - aLat) * r / 2) ** 2 + Math.cos(aLat * r) * Math.cos(bLat * r) * Math.sin((bLon - aLon) * r / 2) ** 2;
  return 12742 * Math.asin(Math.sqrt(h));
}
function nearestPort(lat, lon) {
  let best = null, bd = 1e9;
  for (const p of PORTS) {
    const d = distKm(lat, lon, p.lat, p.lon);
    if (d < bd) { bd = d; best = p; }
  }
  return bd <= (best.wide ? 70 : 45) ? best.code : null;
}
function etaText(e) {
  if (!e || !e.Month || e.Month < 1 || e.Month > 12 || !e.Day) return null;
  const now = new Date();
  let y = now.getUTCFullYear();
  let d = new Date(Date.UTC(y, e.Month - 1, e.Day, e.Hour && e.Hour < 24 ? e.Hour : 0, e.Minute && e.Minute < 60 ? e.Minute : 0));
  if (d.getTime() < now.getTime() - 45 * 864e5) d = new Date(Date.UTC(y + 1, e.Month - 1, e.Day, e.Hour && e.Hour < 24 ? e.Hour : 0, e.Minute && e.Minute < 60 ? e.Minute : 0));
  if (d.getTime() < now.getTime() - 864e5 || d.getTime() > now.getTime() + 400 * 864e5) return null;
  return d.toISOString().slice(0, 16).replace('T', ' ') + ' UTC';
}

const ships = new Map(); // mmsi -> record
let msgCount = 0, lastMsgAt = 0, connected = false, bootedAt = Date.now();

function upsert(m) {
  const md = m.MetaData || {};
  const body = m.Message && (m.Message.PositionReport || m.Message.ShipStaticData);
  const mmsi = String(md.MMSI || (body && body.UserID) || '');
  if (!mmsi || mmsi === '0') return;
  let r = ships.get(mmsi);
  if (!r) {
    r = { mmsi, name: '', type: null, dest: '', eta: null, imo: null, lat: null, lon: null, sog: null, cog: null, seen: 0, port: null };
    ships.set(mmsi, r);
    if (ships.size > 6000) { // drop oldest
      let oldK = null, oldT = Infinity;
      for (const [k, v] of ships) if (v.seen < oldT) { oldT = v.seen; oldK = k; }
      if (oldK) ships.delete(oldK);
    }
  }
  if (md.ShipName && String(md.ShipName).trim()) r.name = String(md.ShipName).trim();
  if (m.MessageType === 'PositionReport' && m.Message && m.Message.PositionReport) {
    const p = m.Message.PositionReport;
    const la = typeof p.Latitude === 'number' ? p.Latitude : (typeof md.latitude === 'number' ? md.latitude : null);
    const lo = typeof p.Longitude === 'number' ? p.Longitude : (typeof md.longitude === 'number' ? md.longitude : null);
    if (la !== null && la >= -90 && la <= 90 && la !== 91) r.lat = la;
    if (lo !== null && lo >= -180 && lo <= 180 && lo !== 181) r.lon = lo;
    if (typeof p.Sog === 'number' && p.Sog >= 0 && p.Sog < 102.3) r.sog = Math.round(p.Sog * 10) / 10;
    if (typeof p.Cog === 'number' && p.Cog >= 0 && p.Cog < 360) r.cog = Math.round(p.Cog);
    r.seen = Date.now();
  } else if (m.MessageType === 'ShipStaticData' && m.Message && m.Message.ShipStaticData) {
    const s = m.Message.ShipStaticData;
    if (s.Name && String(s.Name).trim()) r.name = String(s.Name).trim();
    if (typeof s.Type === 'number') r.type = s.Type;
    if (s.Destination && String(s.Destination).trim()) r.dest = String(s.Destination).trim();
    if (s.ImoNumber) r.imo = s.ImoNumber;
    const et = etaText(s.Eta);
    if (et) r.eta = et;
    r.seen = Date.now();
  }
  if (r.lat !== null && r.lon !== null) r.port = nearestPort(r.lat, r.lon);
}

setInterval(() => {
  const cut = Date.now() - 2 * 3600e3;
  for (const [k, v] of ships) if (v.seen < cut) ships.delete(k);
}, 300e3);

// --- AISStream connection (built-in WebSocket, Node >= 22) ---
let backoff = 1000;
function connect() {
  if (!KEY) return;
  let ws;
  try { ws = new WebSocket(AIS_URL); } catch (e) { return scheduleRetry(); }
  ws.onopen = () => {
    backoff = 1000;
    connected = true;
    console.log('aisstream connected, subscribing to', BOXES.length, 'port boxes');
    ws.send(JSON.stringify({ APIKey: KEY, BoundingBoxes: BOXES, MessageTypes: ['PositionReport', 'ShipStaticData'] }));
  };
  ws.onmessage = (ev) => {
    lastMsgAt = Date.now();
    msgCount++;
    try { upsert(JSON.parse(ev.data)); } catch (e) { /* bad frame - skip */ }
  };
  ws.onclose = () => { connected = false; scheduleRetry(); };
  ws.onerror = () => { try { ws.close(); } catch (e) { } };
}
function scheduleRetry() {
  connected = false;
  setTimeout(connect, backoff);
  backoff = Math.min(backoff * 2, 60000);
}
// Watchdog: a silent socket is a dead socket - force reconnect after 6 quiet minutes.
setInterval(() => {
  if (connected && lastMsgAt && Date.now() - lastMsgAt > 6 * 60e3) {
    console.log('aisstream quiet for 6 min - reconnecting');
    connected = false;
    connect();
  }
}, 60e3);
connect();

// --- HTTP side (same shape as proxy.js) ---
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
function send(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
  res.end(typeof body === 'string' ? body : JSON.stringify(body));
}
function publicShip(r) {
  return {
    mmsi: r.mmsi, name: r.name || null, type: r.type !== null ? typeText(r.type) : null,
    flag: flagOf(r.mmsi), sog: r.sog, dest: r.dest || null, eta: r.eta,
    lat: r.lat, lon: r.lon, port: r.port, seenAgoSec: Math.max(0, Math.round((Date.now() - r.seen) / 1000)),
  };
}
function perPortCounts() {
  const c = {};
  for (const r of ships.values()) if (r.port) c[r.port] = (c[r.port] || 0) + 1;
  return c;
}
const warming = () => (Date.now() - bootedAt < 10 * 60e3) || ships.size === 0;

const port = process.env.PORT || 3000;
http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') {
    res.writeHead(204, { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET', 'Access-Control-Allow-Headers': 'Content-Type, x-app-token', 'Access-Control-Max-Age': '86400' });
    return res.end();
  }
  if (req.method !== 'GET') return send(res, 405, { error: { message: 'method not allowed' } });
  const u = new URL(req.url, 'http://x');
  if (u.pathname === '/' || u.pathname === '/health') {
    return send(res, 200, {
      ok: true, service: 'hsn ais proxy', keySet: !!KEY, connected,
      messages: msgCount, vessels: ships.size, perPort: perPortCounts(),
      uptimeSec: Math.round((Date.now() - bootedAt) / 1000), warming: warming(),
    });
  }
  if (u.pathname === '/ships') {
    if (!SECRET || req.headers['x-app-token'] !== SECRET) return send(res, 401, { error: { message: 'bad app token' } });
    const ip = String(req.headers['cf-connecting-ip'] || req.headers['x-forwarded-for'] || req.socket.remoteAddress || '?').split(',')[0].trim();
    if (!rateOk(ip)) return send(res, 429, { error: { message: 'rate limit exceeded. try again later.' } });
    if (!KEY) return send(res, 503, { error: { message: 'AISSTREAM_KEY not configured on the server' } });
    const want = (u.searchParams.get('port') || 'ALL').toUpperCase();
    const out = [];
    for (const r of ships.values()) {
      if (!r.port || r.lat === null) continue;
      if (want !== 'ALL' && r.port !== want) continue;
      out.push(publicShip(r));
    }
    out.sort((a, b) => a.seenAgoSec - b.seenAgoSec);
    const counts = perPortCounts();
    return send(res, 200, {
      ok: true, warming: warming(), updated: new Date().toISOString(), count: out.length,
      ports: PORTS.map((p) => ({ code: p.code, name: p.name, count: counts[p.code] || 0 })),
      vessels: out.slice(0, 150),
    });
  }
  return send(res, 404, { error: { message: 'unknown endpoint' } });
}).listen(port, () => console.log('ais proxy listening on ' + port + ' - key ' + (KEY ? 'set' : 'MISSING')));
