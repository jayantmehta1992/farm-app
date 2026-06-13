# Fly.io Deployment Guide — FARM Stack

This document covers how to deploy this app (FastAPI backend + React frontend + MongoDB) to Fly.io. Follow the steps in order the first time. After that, deployments happen automatically on every push to `main`.

---

## Architecture

```
MongoDB Atlas (free tier, external)
         ↑
FastAPI backend          React/nginx frontend
farm-app-backend.fly.dev  farm-app-frontend.fly.dev
```

- **Backend** — deployed as a Docker container on Fly.io
- **Frontend** — deployed as a Docker container (nginx serving static files) on Fly.io
- **MongoDB** — hosted on MongoDB Atlas free tier (M0); both services connect via `MONGO_URL`

---

## Prerequisites

| Tool | Install |
|---|---|
| `flyctl` CLI | `brew install flyctl` |
| Fly.io account | `fly auth signup` |
| MongoDB Atlas account | [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas) |
| GitHub repo | already set up |

---

## Step 1 — Install flyctl and log in

```bash
brew install flyctl
fly auth login
```

---

## Step 2 — Set up MongoDB Atlas

Fly.io does not host MongoDB. You use Atlas (free forever at M0 tier).

1. Sign up at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster — choose **M0**, any region
3. Under **Database Access** → Add a user with a password — save these
4. Under **Network Access** → Add IP `0.0.0.0/0` (allow from anywhere)
5. Click **Connect → Drivers** → copy the connection string:

```
mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/farmdb
```

Replace `<username>` and `<password>` with your values. Keep this string — you'll need it in Step 4.

---

## Step 3 — Create the Fly.io apps (one-time)

Run these from the project root. The `--no-deploy` flag creates the config without deploying yet.

```bash
# Backend
cd backend
fly launch --name farm-app-backend --no-deploy
# Answer the prompts:
#   Region: pick one close to you (e.g. iad = US East, lhr = London)
#   Postgres: No
#   Redis: No
cd ..

# Frontend
cd frontend
fly launch --name farm-app-frontend --no-deploy
# Same answers as above
cd ..
```

This creates `backend/fly.toml` and `frontend/fly.toml`. See the [Expected fly.toml files](#expected-flytoml-files) section below for what they should look like.

---

## Step 4 — Set environment variables (secrets)

Fly.io stores secrets encrypted — never commit these to the repo.

```bash
# Backend secrets
fly secrets set \
  MONGO_URL="mongodb+srv://<user>:<pass>@cluster0.xxxxx.mongodb.net/farmdb" \
  CORS_ORIGIN="https://farm-app-frontend.fly.dev" \
  --app farm-app-backend

# Frontend — the backend URL is baked in at build time via Docker ARG
# Fly.io passes secrets as build args automatically when the name matches ARG in Dockerfile
fly secrets set \
  VITE_API_URL="https://farm-app-backend.fly.dev" \
  --app farm-app-frontend
```

---

## Step 5 — First manual deploy

```bash
cd backend && fly deploy --app farm-app-backend && cd ..
cd frontend && fly deploy --app farm-app-frontend && cd ..
```

Verify both are running:
```bash
fly status --app farm-app-backend
fly status --app farm-app-frontend
```

Test the backend health check:
```bash
curl https://farm-app-backend.fly.dev/health
```

---

## Step 6 — Connect GitHub for auto-deploy

After Step 5 works, wire up GitHub Actions so every push to `main` deploys automatically.

**Get a Fly.io API token:**
```bash
fly tokens create deploy -x 999999h
# Copy the printed token
```

**Add it to GitHub:**
1. Go to your repo on GitHub
2. Settings → Secrets and variables → Actions → New repository secret
3. Name: `FLY_API_TOKEN`
4. Value: paste the token

**Apply the workflow change** shown in the [Code Changes](#code-changes) section below.

---

## Step 7 — Push and verify

```bash
git add .
git commit -m "Add Fly.io deployment"
git push origin main
```

Go to your repo on GitHub → Actions tab. You'll see the CI jobs run, followed by `deploy-backend` and `deploy-frontend`.

---

## Expected fly.toml files

These are created by `fly launch`. Adjust `app` names and `primary_region` to match yours.

**`backend/fly.toml`**
```toml
app = 'farm-app-backend'
primary_region = 'iad'

[build]

[http_service]
  internal_port = 8000
  force_https = true
  auto_stop_machines = 'off'
  auto_start_machines = true
  min_machines_running = 1

[[vm]]
  memory = '256mb'
  cpu_kind = 'shared'
  cpus = 1
```

**`frontend/fly.toml`**
```toml
app = 'farm-app-frontend'
primary_region = 'iad'

[build]
  [build.args]
    VITE_API_URL = 'https://farm-app-backend.fly.dev'

[http_service]
  internal_port = 80
  force_https = true
  auto_stop_machines = 'off'
  auto_start_machines = true
  min_machines_running = 1

[[vm]]
  memory = '256mb'
  cpu_kind = 'shared'
  cpus = 1
```

> **Note:** `auto_stop_machines = 'off'` keeps machines always running (no cold starts). On the free tier you get 3 shared VMs — using 2 here leaves 1 spare.

---

## Code Changes

These are the exact changes you apply to the repo when setting up Fly.io deployment. Nothing else in the codebase changes — the Dockerfiles already work as-is.

### `.github/workflows/ci.yml`

```diff
 name: CI

 on:
   pull_request:
   push:
     branches: [main]

 jobs:
   build-backend:
     name: Build backend image
     runs-on: ubuntu-latest
     steps:
       - uses: actions/checkout@v5
       - name: docker build (backend)
         run: docker build -t farm-backend:ci ./backend

   build-frontend:
     name: Build frontend image
     runs-on: ubuntu-latest
     steps:
       - uses: actions/checkout@v5
       - name: docker build (frontend)
         run: docker build -t farm-frontend:ci ./frontend
+
+  deploy-backend:
+    name: Deploy backend to Fly.io
+    needs: build-backend
+    runs-on: ubuntu-latest
+    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
+    steps:
+      - uses: actions/checkout@v5
+      - uses: superfly/flyctl-actions/setup-flyctl@master
+      - name: fly deploy (backend)
+        run: flyctl deploy --remote-only
+        working-directory: ./backend
+        env:
+          FLY_API_TOKEN: ${{ secrets.FLY_API_TOKEN }}
+
+  deploy-frontend:
+    name: Deploy frontend to Fly.io
+    needs: build-frontend
+    runs-on: ubuntu-latest
+    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
+    steps:
+      - uses: actions/checkout@v5
+      - uses: superfly/flyctl-actions/setup-flyctl@master
+      - name: fly deploy (frontend)
+        run: flyctl deploy --remote-only
+        working-directory: ./frontend
+        env:
+          FLY_API_TOKEN: ${{ secrets.FLY_API_TOKEN }}
```

### `backend/fly.toml` *(new file)*

```diff
+app = 'farm-app-backend'
+primary_region = 'iad'
+
+[build]
+
+[http_service]
+  internal_port = 8000
+  force_https = true
+  auto_stop_machines = 'off'
+  auto_start_machines = true
+  min_machines_running = 1
+
+[[vm]]
+  memory = '256mb'
+  cpu_kind = 'shared'
+  cpus = 1
```

### `frontend/fly.toml` *(new file)*

```diff
+app = 'farm-app-frontend'
+primary_region = 'iad'
+
+[build]
+  [build.args]
+    VITE_API_URL = 'https://farm-app-backend.fly.dev'
+
+[http_service]
+  internal_port = 80
+  force_https = true
+  auto_stop_machines = 'off'
+  auto_start_machines = true
+  min_machines_running = 1
+
+[[vm]]
+  memory = '256mb'
+  cpu_kind = 'shared'
+  cpus = 1
```

---

## Useful flyctl commands

```bash
# Check app status
fly status --app farm-app-backend
fly status --app farm-app-frontend

# View live logs
fly logs --app farm-app-backend
fly logs --app farm-app-frontend

# Open the app in browser
fly open --app farm-app-frontend

# SSH into the running container (debugging)
fly ssh console --app farm-app-backend

# List all your Fly.io apps
fly apps list

# Scale down to zero (pause, stops billing for compute)
fly scale count 0 --app farm-app-backend
```

---

## Troubleshooting

| Problem | Fix |
|---|---|
| `CORS error` in browser | Check `CORS_ORIGIN` secret matches your frontend URL exactly (no trailing slash) |
| Backend `500` on `/items` | Check `MONGO_URL` secret — run `fly logs --app farm-app-backend` to see the error |
| Frontend shows blank page | Check `VITE_API_URL` in `frontend/fly.toml` build args matches backend URL |
| Deploy fails in CI | Confirm `FLY_API_TOKEN` secret is added to GitHub repo settings |
| `fly launch` asks about Postgres | Always say No — this app uses MongoDB Atlas, not Postgres |
