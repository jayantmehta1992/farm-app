#!/usr/bin/env bash
# start.sh — start the whole FARM stack with one command.
#
# Usage:  ./start.sh
# Stop:   press Ctrl+C — stops the backend, frontend, AND MongoDB.
#         (Your data is kept safe in a Docker volume.)

# "set -e" makes the script stop if any command fails.
set -e

# Figure out the folder this script lives in, so it works no matter where
# you run it from.
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

echo "🚜 Starting FARM app..."

# --- 1. MongoDB (Docker) -------------------------------------------------
echo "🐳 Starting MongoDB..."
docker compose up -d

# --- 2. Backend (FastAPI) ------------------------------------------------
echo "🐍 Starting backend on http://localhost:8000 ..."
cd "$ROOT_DIR/backend"
# Run uvicorn from the venv directly (no need to "activate" first).
# The "&" sends it to the background so the script can continue.
./venv/bin/uvicorn main:app --reload --port 8000 &
BACKEND_PID=$!   # remember its process ID so we can stop it later

# --- 3. Frontend (React / Vite) ------------------------------------------
echo "⚛️  Starting frontend on http://localhost:5173 ..."
cd "$ROOT_DIR/frontend"
# Load nvm and switch to the Node version pinned in .nvmrc (Node 22).
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm use >/dev/null
npm run dev &
FRONTEND_PID=$!

# --- Clean shutdown ------------------------------------------------------
# "trap" runs the given commands when you press Ctrl+C (the INT signal).
# We kill both background servers so nothing is left running.
cleanup() {
  # Turn OFF "exit on error" inside cleanup, so that if one kill fails
  # (e.g. a server already exited) we still run the remaining steps.
  set +e
  echo ""
  echo "🛑 Stopping servers..."
  kill "$BACKEND_PID" "$FRONTEND_PID" 2>/dev/null
  # Wait for them to actually shut down before continuing.
  wait "$BACKEND_PID" "$FRONTEND_PID" 2>/dev/null
  echo "🐳 Stopping MongoDB..."
  # Stop the Docker container too. (Your data is safe — it lives in a named
  # volume, so it's still there next time you run ./start.sh.)
  (cd "$ROOT_DIR" && docker compose stop)
  echo "Done. Everything stopped."
  exit 0
}
# Run cleanup on Ctrl+C (INT) and also on normal termination (TERM).
trap cleanup INT TERM

echo ""
echo "✅ All running!"
echo "   Frontend: http://localhost:5173"
echo "   Backend:  http://localhost:8000  (docs at /docs)"
echo "   Press Ctrl+C to stop."
echo ""

# "wait" keeps the script alive while the background servers run, so the
# terminal stays attached to their logs until you press Ctrl+C.
wait
