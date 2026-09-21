# Worldwide HSN Code Finder - fully automatic (GitHub Actions + Render)

## Deploy once, never touch again
1. Upload this whole folder (including the hidden `.github` folder) to a GitHub repo.
2. Render -> New -> **Blueprint** -> pick the repo (uses `render.yaml`; static site, auto-deploy on).
3. GitHub repo -> Settings -> Secrets and variables -> Actions -> add `COMTRADE_KEY` (and optional `GEMINI_API_KEY`).
4. Actions tab -> "Daily data refresh" -> Run workflow once to confirm it is green.

No Render web service and no UptimeRobot are needed any more.

## What runs every day (03:30 UTC, free)
`node automate.mjs` does: India trade values (Comtrade) -> description cleanup -> OFAC + EU sanctions refresh ->
watches all 17 official source pages -> rebuilds `index.html` -> runs safety checks -> commits only if changed.
Render redeploys on the commit. If any safety check fails nothing is committed and GitHub emails you.

## AI jobs (need the GEMINI_API_KEY secret)
Rule: **AI proposes, code verifies.** Nothing unverified is written.
1. **Search aliases** - each day Gemini suggests new trader terms (English + Indian usage). Every word must match real tariff
   descriptions (1 to 3000 rows) or the alias is dropped. Committed automatically.
2. **GST drafter** - reads NEW "Integrated Tax (Rate)" notification PDFs from the CBIC page, extracts rate changes, and keeps only
   items whose code AND rate appear on the same table row of the PDF text. Result is a **Pull Request** (never a direct edit).
   Merge it with one click. Optional: repo Settings -> Variables -> `AUTO_MERGE_GST` = `1` to merge automatically.
   Needs Settings -> Actions -> General -> "Allow GitHub Actions to create pull requests" ticked.
3. **Description cleanup** (already existed) - HTML artifacts removed, content-verified.
First GST run only records existing notifications as "known" (baseline); it proposes changes for notifications published after that.

## What is automatic vs. alerted
- Automatic: India trade values, OFAC, EU sanctions, description cleanup, rebuild, deploy.
- Alerted (GitHub Issue "Source changed: ..."): tariff systems, India GST page, UFLPA - these publish no stable feed.
  GST rates are legal data, so they are never auto-edited from a scraped page.

---
# Original manual notes (old approach)
# Worldwide HSN Code Finder — self-hosted on Render (free)

Two free Render parts run this:
1. **Static site** — serves the finder (`index.html`). Free forever.
2. **Web service (updater)** — a tiny Node server that re-pulls India trade values
   from UN Comtrade once a day, rebuilds `index.html`, and commits it back to this
   repo. That commit auto-redeploys the static site. Free forever (uses the one
   always-on free service the 750 instance-hours/month covers).

Everything here is free. No card on file. No paid Render features are used
(no cron jobs, no Postgres, no disk — the dataset lives in the repo itself).

---

## One-time setup (about 15 minutes)

### 1. Put this code on GitHub
1. Go to https://github.com/new
2. Repository name: `hsn-finder` (anything works). Keep it **Private** if you like.
3. Click **Create repository**.
4. On the next page click **uploading an existing file**, drag in ALL the files
   and folders from this zip (including `index.html` and the `src` folder), and
   **Commit changes**.

### 2. Create a GitHub token (lets the updater commit new data)
1. Go to https://github.com/settings/tokens?type=beta (Fine-grained token)
2. **Generate new token**. Name: `hsn-updater`. Expiration: your choice (1 year is fine).
3. Under **Repository access** choose **Only select repositories** → your `hsn-finder` repo.
4. Under **Permissions → Repository permissions** set **Contents: Read and write**.
5. Generate and COPY the token (starts with `github_pat_...`). Save it somewhere.

### 3. Deploy the static site (the finder itself)
1. Go to https://dashboard.render.com → **New +** → **Static Site**.
2. Connect your GitHub account if asked, pick the `hsn-finder` repo.
3. Settings:
   - Build Command: *(leave blank)*
   - Publish Directory: `.` (a single dot)
   - **Auto-Deploy: On** (this is the default — keep it)
4. Click **Deploy Static Site**. Render gives you a URL like
   `https://hsn-finder.onrender.com` — that's your always-current finder link.

### 4. Deploy the updater (keeps data fresh)
1. **New +** → **Web Service** → same repo.
2. Settings:
   - Runtime: **Node**
   - Build Command: *(leave blank)*
   - Start Command: `node server.js`
   - Instance Type: **Free**
3. Before clicking deploy, open **Environment → Add Environment Variable** and add:
   - `COMTRADE_KEY` = your UN Comtrade API key (from https://comtradedeveloper.un.org)
   - `GEMINI_API_KEY` = your Gemini API key (from https://aistudio.google.com/apikey - free tier is enough). The worker uses it for AI-assisted description cleanup during bakes. Optional: without it the worker still refreshes trade data and does plain (non-AI) cleanup.
   - `GITHUB_TOKEN` = the token from step 2
   - `GITHUB_REPO` = `your-github-username/hsn-finder`
   - `GITHUB_BRANCH` = `main`
4. Click **Deploy Web Service**.

### 5. Keep the updater awake (UptimeRobot, free)
Free Render services sleep after 15 min without traffic. A free UptimeRobot
monitor pings it so it never sleeps:
1. Sign up at https://uptimerobot.com (free).
2. **Add New Monitor** → type **HTTP(s)**.
3. URL: your web service URL from step 4 (e.g. `https://hsn-finder-updater.onrender.com`).
4. Interval: **5 minutes**. Save.

Done. The finder at the step-3 URL now updates itself daily.

---

## What updates automatically vs. manually

**Automatic (daily):**
- India per-code import/export values (`src/tradevalues.ts`), via Comtrade.
  This copy already ships with the newest complete year (2025). The worker only
  commits when the data actually changed.
- AI-assisted description cleanup (via Gemini): scans the dataset for markup
  artifacts in descriptions (e.g. raw HTML tags some national tariff files
  contain) and cleans them. Every AI proposal is content-verified against the
  original before it is accepted - the AI never rewrites official wording.
  If GEMINI_API_KEY is not set, the worker falls back to a plain tag strip.

**Manual (for now):**
- **GST rates** — CBIC does not publish a stable machine-readable feed. When GST
  rates change, edit `src/gstmap.ts` and push; the static site redeploys.
- **Sanctions lists** (OFAC/EU/UFLPA) — each list has a different format. Download
  the current list, update `src/sanctions.ts`, push.
- The hosted Instinct copy of this finder is refreshed separately on a weekly
  schedule, so these lists stay current there even without manual edits here.

Check the updater any time at `https://your-updater-url.onrender.com/status`.

## Repo layout
- `index.html` — the complete finder as one file (what the static site serves)
- `src/` — dataset + app source (data chunks, GST/trade/sanctions maps, app.js, style.css)
- `build.mjs` — rebuilds `index.html` from `src/` (`node build.mjs`)
- `refresh.mjs` — the daily data refresh pipeline (`node refresh.mjs` to run by hand)
- `server.js` — the always-on updater web service
