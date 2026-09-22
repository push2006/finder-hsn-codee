# Worldwide HSN Code Finder

Free, offline-first tariff code finder covering 20 official systems (WCO HS 2022 + India, USA, EU, UK, Korea, Canada, Japan, Australia, Brazil, Taiwan, New Zealand, Norway, Singapore, Israel, Mexico, Hong Kong, South Africa, Peru and India SAC), about 310,000 codes, as a single `index.html`.

Live: https://finder-hsn-codee.onrender.com/

## What it does
- **Search anything**: product names, trader terms, typo-tolerant ("DISEL" finds diesel), code prefixes. Results group into one row per product; each row leads with the direct deepest national code (India first), never the 6-digit family parent. Open a row for every country's code and duty rate.
- **Detail + PDF**: full code chain from HS root to national line, GST rates (India), per-code India import/export values (UN Comtrade), and a print/PDF report.
- **Sanctions check**: baked OFAC + EU lists, refreshed daily; search any party name.
- **Compare + shortlist + favorites + notes**: side-by-side codes, saved lists, personal notes (all in localStorage).
- **AI assist, verified**: "Suggest best codes" and report briefs run through the proxy below. AI proposes, code verifies; official data is never AI-generated.

## Architecture (all free)
1. **Static site** (Render, this repo root): serves `index.html`, auto-deploys on every push to `main`.
2. **AI proxy** (`proxy.js`, Render web service): the browser holds no provider keys. The page calls the proxy with a public-by-design `APP_SECRET` speed bump; the proxy attaches the real key from its env and forwards to Gemini / Groq / Mistral / NVIDIA, with key rotation and a 60-calls-per-10-minutes per-IP cap.
   - Render setup: New Web Service on this repo, start command `node proxy.js`, env:
     - `APP_SECRET` - the token baked into the public bundle
     - `GEMINI_KEYS`, `GROQ_KEYS` - comma-separated key pools
     - `MISTRAL_KEYS`, `NVIDIA_KEYS` - optional comma-separated pools
3. **Daily refresh** (GitHub Actions, 03:30 UTC, `.github/workflows/refresh.yml` -> `automate.mjs`): India trade values (Comtrade), description cleanup, OFAC + EU sanctions refresh, watch of all official source pages, rebuild `index.html`, safety checks, commit only if changed. Render redeploys on the commit.
   - Repo secret needed: `COMTRADE_KEY`. Optional: `GEMINI_API_KEY` for the AI jobs below.

## AI automation jobs (Actions, need `GEMINI_API_KEY`)
Rule: **AI proposes, code verifies.** Nothing unverified is written.
1. **Search aliases**: Gemini suggests new trader terms daily; every word must match real tariff descriptions or the alias is dropped. Committed automatically.
2. **GST drafter**: reads new CBIC "Integrated Tax (Rate)" notification PDFs, keeps only items whose code AND rate appear on the same PDF table row, opens a Pull Request (never a direct edit). Optional variable `AUTO_MERGE_GST=1` merges automatically (needs "Allow GitHub Actions to create pull requests").
3. **Description cleanup**: HTML artifacts removed, content-verified.

## Automatic vs. alerted
- Automatic: India trade values, OFAC + EU sanctions, description cleanup, aliases, rebuild, deploy.
- Alerted (GitHub Issue "Source changed: ..."): national tariff systems, the India GST page, UFLPA - no stable feed. GST rates are legal data and are never auto-edited from a scraped page.

## Repo layout
- `index.html` - the complete finder as one file (what the static site serves)
- `src/` - dataset + app source (data chunks, GST/trade/sanctions maps, aliases, app.js, style.css)
- `build.mjs` - rebuilds `index.html` from `src/` (`node build.mjs`)
- `automate.mjs`, `refresh.mjs`, `sanctions-refresh.mjs`, `comtrade-partners.mjs`, `gemini.mjs`, `ai-agent.mjs`, `apply-gst.mjs`, `monitor.mjs` - the daily pipeline
- `proxy.js` - the AI proxy web service (see above)
- `render.yaml` - blueprint for the static site
