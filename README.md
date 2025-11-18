Pollu-Stake — Local Development README
=====================================

Table of contents
- Project overview
- Features
- Repo layout
- Prerequisites
- Backend (FastAPI) — setup & run
- Frontend (Next.js) — setup & run
- Blockchain (Hardhat) — setup & run
- APIs (list + examples)
- Development shortcuts & dev endpoints
- Persistence modes: JSON vs DB
- Troubleshooting & common fixes
- How to push to GitHub
- Next steps / suggestions


Project overview
----------------
Pollu-Stake is a local developer prototype for an environmental compliance staking / slashing system. It simulates factories with air-quality sensors, forecasts breaches with a simple ML/heuristic forecaster, and performs automated "oracle" slashing (mock transactions) that are recorded and displayed in the Admin UI.

This workspace contains three main parts:
- backend/ — FastAPI backend (simulated sensors, monitoring loops, persistence, API)
- frontend/ — Next.js admin & factory UI (uses mock contract stubs)
- blockchain/ — Hardhat scripts and contracts (optional, mostly stubs in dev)

Features
--------
- Simulated sensor data (PM2.5, SO2, NOx) per factory.
- Mocked LSTM forecaster (works without TensorFlow; real model optional).
- Automatic "oracle" slashing when actual AQI breaches configurable threshold.
- JSON-mode persistence (file) for quick local development without DB.
- DB-mode (asyncpg) for realistic testing if you provide `DATABASE_URL`.
- Admin UI that shows treasury, slash history, factory metrics, and live forecasts.
- Dev endpoints to force breaches and test flows.


Repository layout
-----------------
Root: pollu-stake/
- backend/  — FastAPI app, simulator, forecaster, persistence
- frontend/ — Next.js app (app dir), UI components, store
- blockchain/ — Hardhat scripts (deploy, tests)
- README.md (this file)


Prerequisites
-------------
- Node.js (v18+ recommended)
- npm
- Python 3.10+ (venv recommended)
- Optional: PostgreSQL or compatible DB if you want DB-mode
- Optional: TensorFlow if you want to use a real model (backend will run without it)


Backend (FastAPI) — setup & run
-------------------------------
1. Create & activate Python virtualenv (Windows PowerShell example):

```powershell
cd c:\Users\kumar\Desktop\BruteForce-HackBios\pollu-stake\backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

2. Environment variables (optional):
- `DATABASE_URL` — if set, backend runs in DB-mode and uses asyncpg to talk to that DB. Leave unset to use JSON persistence (`backend/data.json`).
- `.env` may be used; avoid committing secrets.

3. Start backend (from backend folder):

```powershell
# from backend folder
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Notes:
- If TensorFlow is not installed, the backend will fall back to a mock LSTM forecaster; this is intentional for local dev.
- By default the backend runs in JSON-mode (no DATABASE_URL). JSON state file: `backend/data.json`.


Frontend (Next.js) — setup & run
-------------------------------
1. Install dependencies and run dev server:

```powershell
cd ..\frontend
npm install
# if port 3000 is busy, use a different port (we used 3001 in examples):
$env:PORT=3001; npm run dev
```

2. Environment
- `.env.local` in `frontend` may contain `NEXT_PUBLIC_API_BASE_URL` — set this to your backend base (example: `http://localhost:8000` or `http://localhost:8000/api`).
- IMPORTANT: The frontend expects `NEXT_PUBLIC_API_BASE_URL` to be a base without double `/api` appended. The code normalizes it, but prefer `http://localhost:8000`.

3. Open the admin UI at `http://localhost:3001/admin` (or the port you selected).


Blockchain (Hardhat) — setup & run (optional)
---------------------------------------------
There are sample scripts in `blockchain/` for deployment & testing. These are optional for local development because the app uses mock contract stubs by default.

Typical flow to run Hardhat scripts (if you want to run on a local node):

```bash
cd blockchain
npm install
# run tests or scripts
npx hardhat test
npx hardhat node
# then in separate terminal run deploy script
node scripts/deploy.cjs
```


APIs (list & examples)
----------------------
The backend exposes the following key endpoints (default host: `http://localhost:8000`):

- GET /api/health
  - Returns app health and model status.

- GET /api/dashboard-data
  - Returns dashboard object:
    {
      factories: [ { id, name, stakeBalance, status, licenseNftId, complianceScore, riskLevel, address, location, lastForecast }, ... ],
      admin_fund: 123.45,        # treasury balance (ETH)
      sensor_history: { factoryId: [ { pm2_5, so2, nox, timestamp }, ... ] },
      max_history_length: 50
    }

- GET /api/forecast/{factory_id}
  - Returns forecast shape matching frontend `ForecastData`:
    {
      factory_id: string,
      predicted_aqi: number,
      forecast_breach: boolean,
      confidence: number,  # 0..1
      timestamp: string,
      next_check: string
    }

- GET /api/slash-events?limit=50
  - Returns recent slash events: { events: [ { id, factoryId, amount, reason, triggered_by, txHash, timestamp }, ... ] }

- POST /api/dev/trigger-breach
  - Dev-only: force a slash for testing. JSON body: { "factory_id": "Bhilai-001", "amount": 5 }

- GET /api/dao-proposals
- GET /api/user-votes/{user_id}

Notes: the UI polls `/api/dashboard-data` and `/api/slash-events` every 5 seconds for near-real-time updates.


Persistence modes: JSON vs DB
----------------------------
- JSON-mode (default): If `DATABASE_URL` is NOT set, the app uses `backend/data.json` via `persistence.py`. This is ideal for local development and demos — no DB setup required.
  - Automatic monitor writes to `app.state.data` and `backend/data.json`.
  - Admin UI reads `admin_fund` and `slash_events` from API backed by `data.json`.

- DB-mode: If you set `DATABASE_URL`, the backend uses asyncpg and expects the schema with tables: `factories`, `sensor_readings`, `forecast_logs`, `protocol_state`, `slash_events`, etc.
  - If you run DB-mode and you see errors like `invalid input value for enum trigger_type: "oracle"`, note that the code now inserts uppercase `'ORACLE'` to match typical enum values. If your DB uses different enum labels, update the DB or change the backend insert tokens accordingly.


Development shortcuts & dev endpoints
------------------------------------
- Force a breach (dev):
  ```powershell
  Invoke-RestMethod -Method Post -Uri http://localhost:8000/api/dev/trigger-breach -Body '{"factory_id":"Bhilai-001","amount":5}' -ContentType 'application/json'
  ```
- Check slash events:
  ```powershell
  Invoke-RestMethod http://localhost:8000/api/slash-events
  ```
- Check dashboard data:
  ```powershell
  Invoke-RestMethod http://localhost:8000/api/dashboard-data
  ```


Troubleshooting & common fixes
------------------------------
- Backend fails with `ModuleNotFoundError: No module named 'tensorflow'`:
  - This is expected if TF is not installed. The project includes a mock forecaster fallback — install TensorFlow only if you want the real model.

- Frontend showing 404 for `/api/api/...` requests:
  - Ensure `NEXT_PUBLIC_API_BASE_URL` does not include a trailing `/api` (or let the frontend use the normalized base). We added normalization in the code to avoid double `/api` but prefer `http://localhost:8000`.

- Backend logs `invalid input value for enum trigger_type: "oracle"` when inserting to DB:
  - The code uses uppercase `ORACLE` on inserts to match the DB enum. If your DB enum uses different tokens, update the DB enum or change backend inserts to a matching token.

- Port conflicts for frontend (3000):
  - Use a different port: `$env:PORT=3001; npm run dev` or kill the process using the port.

- If you see `connection has been released back to the pool` from asyncpg:
  - The backend was adjusted so DB reads occur inside the same `async with pool.acquire()` context.


How the automatic slashing works (high-level)
--------------------------------------------
1. The `autonomous_monitor` loop (DB-mode) or `autonomous_monitor_json` (JSON-mode) periodically samples simulated sensors.
2. If current PM2.5 >= `ACTUAL_PENALTY_THRESHOLD` (configurable in `backend/main.py`), the backend:
   - marks factory status `PENALTY`,
   - reduces `stake_balance` by `SLASH_AMOUNT` (or up to current stake),
   - increments `protocol_state.admin_fund_balance`,
   - inserts a `slash_events` record with a mock `tx_hash`.
3. The admin UI polls `/api/slash-events` and `/api/dashboard-data` and reflects changes in the Slashed Monitor and Treasury cards.


Push to GitHub (safe workflow)
------------------------------
If you want to push this repo to GitHub (example remote `https://github.com/RazzGourav/BruteForce-HackBios`):

```powershell
cd <repo root>
git remote add origin <your-remote>
# If remote has commits, pull & rebase first
git pull --rebase origin main
# resolve conflicts if any
git push -u origin main
```


Next steps & suggestions
------------------------
- For real-time UI without polling, consider adding SSE or WebSocket in the backend and consuming it from the frontend.
- Add DB migration SQL or use a migration tool to create the required tables for DB-mode.
- Replace the mock forecaster with a real trained model (optionally add TF in a separate environment for production).


If anything is missing or you want this README to include screenshots, ENV examples, or a minimal `requirements.txt` + `package.json` summary, tell me which parts to expand and I will update the README accordingly.
