from fastapi import FastAPI

from .api.v1.router import router as api_v1_router

app = FastAPI(title="OpsHub Facilities API")
app.include_router(api_v1_router, prefix="/api/v1")


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
