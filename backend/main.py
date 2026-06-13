# main.py — the entry point for our FastAPI backend.

import os
from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

# Import the collection we set up in database.py.
# (database.py calls load_dotenv(), so by this point the .env values are
# already loaded into the environment and os.getenv below can read them.)
from database import item_collection
from database_sqlite import AsyncSessionLocal, NoteModel, create_tables

# Read the frontend address from .env, with a sensible fallback default.
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")


# --- Startup / shutdown ------------------------------------------------------
# "lifespan" runs once when the server starts (before the "yield") and once
# when it shuts down (after it). We use it to create the SQLite tables if
# they don't already exist.
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


# --- Dependency: SQLite session ----------------------------------------------
# FastAPI's "dependency injection" system calls this function automatically
# whenever a route declares "db: AsyncSession = Depends(get_db)".
# It opens a session, hands it to the route, then closes it when the route
# returns — even if the route raises an exception.
async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        yield session


# --- Pydantic models (request/response shapes) -------------------------------
# A Pydantic model describes the SHAPE of data we expect. By inheriting from
# BaseModel and listing fields with their types, FastAPI will automatically:
#   - validate incoming data (reject bad input),
#   - convert JSON <-> Python for us,
#   - document the shape in the auto-generated /docs page.
class Item(BaseModel):
    name: str
    description: str = ""


class Note(BaseModel):
    title: str
    content: str = ""


# --- Basic endpoints ---------------------------------------------------------
@app.get("/")
def read_root():
    return {"message": "Hello from the FARM backend!"}


@app.get("/health")
def health_check():
    return {"status": "ok"}


# --- Database endpoints --------------------------------------------------
# Notice "async def" instead of "def". Talking to a database involves
# WAITING (for the network/disk). "async" lets the server do other work
# while waiting, instead of freezing. We use "await" on any line that waits.

@app.post("/items")
async def create_item(item: Item):
    # FastAPI fills "item" from the JSON the caller sends, already validated.
    # .model_dump() turns the Pydantic object into a plain dict for MongoDB.
    result = await item_collection.insert_one(item.model_dump())
    # MongoDB gives every document a unique "_id". We return it as a string.
    return {"id": str(result.inserted_id), "name": item.name}


@app.get("/items")
async def list_items():
    items = []
    # .find() with no filter means "all documents". We loop over the results.
    async for doc in item_collection.find():
        # _id is a special MongoDB object; convert it to a string so it can
        # be sent as JSON (which can't represent the raw _id type).
        doc["_id"] = str(doc["_id"])
        items.append(doc)
    return items


# --- SQLite endpoints (/notes) -----------------------------------------------
@app.post("/notes")
async def create_note(note: Note, db: AsyncSession = Depends(get_db)):
    # Build a NoteModel row object and add it to the session.
    db_note = NoteModel(title=note.title, content=note.content)
    db.add(db_note)
    # commit() writes the row to disk and assigns the auto-increment id.
    await db.commit()
    # refresh() re-reads the row so db_note.id is populated.
    await db.refresh(db_note)
    return {"id": db_note.id, "title": db_note.title}


@app.get("/notes")
async def list_notes(db: AsyncSession = Depends(get_db)):
    # select(NoteModel) = "SELECT * FROM notes"
    result = await db.execute(select(NoteModel))
    notes = result.scalars().all()
    return [{"id": n.id, "title": n.title, "content": n.content} for n in notes]
