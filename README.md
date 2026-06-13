# 🚜 FARM App

A starter app built on the **FARM** stack:

- **F** — [FastAPI](https://fastapi.tiangolo.com/) (Python backend / API)
- **A** — Async (FastAPI + Motor talk to MongoDB without blocking)
- **R** — [React](https://react.dev/) (frontend, built with [Vite](https://vite.dev/))
- **M** — [MongoDB](https://www.mongodb.com/) (database, run in Docker)

## Project structure

```
farm-app/
├── docker-compose.yml   # runs MongoDB in a Docker container
├── .nvmrc               # pins Node 22 for the frontend
├── backend/             # FastAPI app
│   ├── venv/            # Python virtual environment (not committed)
│   ├── .env             # config: DB connection + name (not committed)
│   ├── database.py      # MongoDB connection setup
│   ├── main.py          # API endpoints
│   ├── requirements.txt # Python dependencies
│   └── .gitignore
└── frontend/            # React app (Vite)
    ├── src/
    │   ├── App.jsx      # main UI component
    │   └── App.css
    └── package.json     # JS dependencies
```

## Prerequisites

- **Docker** (for MongoDB)
- **Python 3.10+**
- **Node 22** (via [nvm](https://github.com/nvm-sh/nvm): run `nvm use` in this folder)

## Running the app

### Quick start (one command)

From the project root, run:

```bash
./start.sh
```

This starts MongoDB (Docker), the backend, and the frontend together, and
streams their logs. Press **Ctrl+C** to stop everything — the backend,
frontend, *and* MongoDB. (Your data is preserved in a Docker volume.)

> First time only: make sure the backend venv and frontend packages are
> installed (see the manual steps below).

### Manual start (three terminals)

If you'd rather run each piece yourself, you need **three things** running.
Open three terminal tabs (or run the database in the background).

### 1. Start MongoDB (Docker)

From the project root (`farm-app/`):

```bash
docker compose up -d        # start MongoDB in the background
```

Useful commands:
```bash
docker compose ps           # check it's running
docker compose stop         # stop it (data is kept)
docker compose down         # stop and remove the container (data kept in volume)
```

### 2. Start the backend (FastAPI)

```bash
cd backend
source venv/bin/activate    # turn on the Python virtual environment
uvicorn main:app --reload   # --reload restarts automatically on code changes
```

- API runs at **http://localhost:8000**
- Interactive API docs at **http://localhost:8000/docs**

First time on a new machine? Recreate the environment first:
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 3. Start the frontend (React)

```bash
cd frontend
nvm use                     # switches to Node 22 (reads .nvmrc)
npm install                 # first time only — installs dependencies
npm run dev
```

- App runs at **http://localhost:5173**

Open **http://localhost:5173** in your browser to use the app.

## Configuration (environment variables)

Settings live in `.env` files instead of being hardcoded, so you can change
addresses/names without editing source code.

**`backend/.env`** (private — not committed):

| Variable       | Meaning                                      | Default                     |
|----------------|----------------------------------------------|-----------------------------|
| `MONGO_URL`    | Where MongoDB lives                          | `mongodb://localhost:27017` |
| `DB_NAME`      | Database name inside MongoDB                 | `farm_app`                  |
| `FRONTEND_URL` | Frontend address allowed through CORS        | `http://localhost:5173`     |

**`frontend/.env`** (public — values are bundled into the browser code, so
**never put secrets here**). Vite only exposes variables prefixed `VITE_`:

| Variable        | Meaning                  | Default                 |
|-----------------|--------------------------|-------------------------|
| `VITE_API_URL`  | Address of the backend   | `http://localhost:8000` |

## API endpoints

| Method | Path        | Description              |
|--------|-------------|--------------------------|
| GET    | `/`         | Hello message            |
| GET    | `/health`   | Health check             |
| GET    | `/items`    | List all items           |
| POST   | `/items`    | Create an item           |

Example — create an item from the command line:
```bash
curl -X POST http://localhost:8000/items \
  -H "Content-Type: application/json" \
  -d '{"name": "My item", "description": "optional text"}'
```

## How it fits together

```
Browser (React :5173) ──fetch──> FastAPI (:8000) ──motor──> MongoDB (:27017)
        ▲                                                        │
        └─────────────────── items as JSON ──────────────────────┘
```

## Next ideas to learn

- Add **update** (PUT) and **delete** (DELETE) endpoints for items.
- Add input validation rules to the Pydantic `Item` model.
- Split endpoints into separate files using FastAPI's `APIRouter`.
- Add a loading spinner / error handling in the React UI.
