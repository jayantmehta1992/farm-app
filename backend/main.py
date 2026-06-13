import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database_sqlite import create_tables
from routers import items, notes

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")


@asynccontextmanager
async def lifespan(app: FastAPI):
    await create_tables()
    yield


app = FastAPI(title="FARM App API", lifespan=lifespan)

# --- CORS --------------------------------------------------------------------
# "Middleware" is code that runs on every request before/after our endpoints.
# This CORS middleware tells browsers it's OK for our React frontend
# (running at localhost:5173) to call this API. Without it, the browser
# would block the requests for security reasons.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL],  # the React dev server's address (from .env)
    allow_credentials=True,
    allow_methods=["*"],  # allow all HTTP methods (GET, POST, etc.)
    allow_headers=["*"],
)


@app.get("/")
def read_root():
    return {"message": "Hello from the FARM backend!"}


@app.get("/health")
def health_check():
    return {"status": "ok"}


app.include_router(items.router)
app.include_router(notes.router)
