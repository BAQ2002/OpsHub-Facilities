from fastapi import FastAPI

from .api.activities import router as activities_router

app = FastAPI(title="OpsHub Facilities API", version="1.0.0")
app.include_router(activities_router)


@app.get("/health", tags=["health"])
def health() -> dict[str, str]:
    return {"status": "ok"}
