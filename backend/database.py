# database.py — sets up the connection to MongoDB.

import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

# Read the .env file and load its values so we can use them below.
load_dotenv()

# os.getenv reads a value from the environment (.env). The second argument
# is a fallback default used if the variable isn't set.
MONGO_URL = os.getenv("MONGO_URL")
DB_NAME = os.getenv("DB_NAME")

# Create the client — this object manages the connection to MongoDB.
client = AsyncIOMotorClient(MONGO_URL)

# Pick the specific database inside MongoDB we'll work with.
database = client[DB_NAME]

# A "collection" is like a table in traditional databases — a group of
# related documents. Here we grab (or create) one called "items".
item_collection = database["items"]
