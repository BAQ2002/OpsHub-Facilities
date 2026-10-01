from contextlib import asynccontextmanager
from .database import open_pool, close_pool, settings
from fastapi import FastAPI

from .api.v1.router import router as api_v1_router

@asynccontextmanager
async def lifespan(app):
    open_pool()
    try:
        yield
    finally:
        close_pool()


app = FastAPI(
    title="OpsHub Facilities API", lifespan=lifespan,
    docs_url="/docs" if settings.api_docs_enabled else None,
    redoc_url="/redoc" if settings.api_docs_enabled else None,
    openapi_url="/openapi.json" if settings.api_docs_enabled else None,
)
app.include_router(api_v1_router, prefix="/api/v1")


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
