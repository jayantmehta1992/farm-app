# database.py — sets up the connection to MongoDB.

import os
import tempfile
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

# Read the .env file and load its values so we can use them below.
load_dotenv()

# os.getenv reads a value from the environment (.env). The second argument
# is a fallback default used if the variable isn't set.
MONGO_URL = os.getenv("MONGO_URL")
DB_NAME = os.getenv("DB_NAME")

# X.509 certificate auth (optional).
# If MONGO_CERT is set, its content is written to a temp file so pymongo
# can use it. This avoids baking the cert into the Docker image.
MONGO_CERT = os.getenv("MONGO_CERT")

cert_path = None
if MONGO_CERT:
    cert_file = tempfile.NamedTemporaryFile(mode="w", suffix=".pem", delete=False)
    cert_file.write(MONGO_CERT)
    cert_file.close()
    cert_path = cert_file.name

client = AsyncIOMotorClient(
    MONGO_URL,
    **({"tlsCertificateKeyFile": cert_path} if cert_path else {}),
)

database = client[DB_NAME]

# A "collection" is like a table in traditional databases — a group of
# related documents. Here we grab (or create) one called "items".
item_collection = database["items"]
