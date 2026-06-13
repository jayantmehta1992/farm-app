# database_sqlite.py — sets up the SQLite database using SQLAlchemy.
#
# SQLAlchemy is an ORM (Object-Relational Mapper): it lets you define your
# database tables as Python classes, and then read/write rows using those
# classes instead of writing raw SQL strings.
#
# "aiosqlite" is the async driver — it lets SQLAlchemy talk to SQLite
# without blocking the FastAPI server while waiting for disk I/O.

import os

from sqlalchemy import Column, Integer, String, Text
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

# Where the SQLite file lives. "sqlite+aiosqlite://" is the driver prefix.
# "///./data/app.db" = relative path: the "data/" folder next to this file.
# In Docker the WORKDIR is /app, so this becomes /app/data/app.db.
SQLITE_URL = os.getenv("SQLITE_URL", "sqlite+aiosqlite:///./data/app.db")

# Make sure the data/ directory exists before SQLAlchemy tries to create the file.
os.makedirs("data", exist_ok=True)

# The engine is the single connection point to the database.
# "echo=False" means SQLAlchemy won't print every SQL statement it runs.
engine = create_async_engine(SQLITE_URL, echo=False)

# A session is a short-lived "unit of work" — you open one, do some reads/writes,
# then close it. async_sessionmaker is a factory that creates sessions on demand.
# expire_on_commit=False keeps objects usable after a commit (important for async).
AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False)


# --- Table definitions -------------------------------------------------------
# DeclarativeBase is the base class all our table models inherit from.
# It registers them so SQLAlchemy knows which tables to create.
class Base(DeclarativeBase):
    pass


class NoteModel(Base):
    # __tablename__ is the actual name of the table in the .db file.
    __tablename__ = "notes"

    # Each Column maps to a column in the table.
    id = Column(Integer, primary_key=True, index=True)  # auto-incremented ID
    title = Column(String(100), nullable=False)          # required, max 100 chars
    content = Column(Text, default="")                   # optional body text


# --- Startup helper ----------------------------------------------------------
async def create_tables():
    # Creates all tables that don't yet exist. Safe to call on every startup —
    # it won't drop or alter tables that are already there.
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
