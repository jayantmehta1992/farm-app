# main.py — the entry point for our FastAPI backend.

import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Import the collection we set up in database.py.
# (database.py calls load_dotenv(), so by this point the .env values are
# already loaded into the environment and os.getenv below can read them.)
from database import item_collection

# Read the frontend address from .env, with a sensible fallback default.
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

app = FastAPI(title="FARM App API")

# --- CORS ----------------------------------------------------------------
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


# --- Data model ----------------------------------------------------------
# A Pydantic model describes the SHAPE of data we expect. By inheriting from
# BaseModel and listing fields with their types, FastAPI will automatically:
#   - validate incoming data (reject bad input),
#   - convert JSON <-> Python for us,
#   - document the shape in the auto-generated /docs page.
class Item(BaseModel):
    name: str
    description: str = ""  # optional, defaults to empty string


# --- Basic endpoints -----------------------------------------------------
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
