import os
import time
import uuid
from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from database import database
from database_sqlite import create_tables
from dependencies import get_db
from logger import log
from routers import items, notes

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")


@asynccontextmanager
async def lifespan(app: FastAPI):
    await create_tables()
    log.info("startup", frontend_url=FRONTEND_URL)
    yield
    log.info("shutdown")


app = FastAPI(title="FARM App API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def log_requests(request: Request, call_next):
    request_id = uuid.uuid4().hex[:8]
    start = time.perf_counter()
    response = await call_next(request)
    duration_ms = round((time.perf_counter() - start) * 1000, 2)
    log.info(
        "request",
        request_id=request_id,
        method=request.method,
        path=request.url.path,
        status=response.status_code,
        duration_ms=duration_ms,
    )
    response.headers["X-Request-ID"] = request_id
    return response


@app.get("/")
def read_root():
    return {"message": "Hello from the FARM backend!"}


@app.get("/health")
async def health_check(db: AsyncSession = Depends(get_db)):
    checks = {}

    try:
        await database.command("ping")
        checks["mongodb"] = "ok"
    except Exception as e:
        log.error("mongodb health check failed", error=str(e))
        checks["mongodb"] = "error"

    try:
        await db.execute(text("SELECT 1"))
        checks["sqlite"] = "ok"
    except Exception as e:
        log.error("sqlite health check failed", error=str(e))
        checks["sqlite"] = "error"

    status = "ok" if all(v == "ok" for v in checks.values()) else "degraded"
    if status == "degraded":
        log.warning("health degraded", checks=checks)
    return {"status": status, "checks": checks}


app.include_router(items.router)
app.include_router(notes.router)
