from fastapi import FastAPI
from app.api.v1.projects import router as projects_router
from app.api.v1.health import router as health_router

app = FastAPI(title="SceneBySync API")

app.include_router(health_router)
app.include_router(projects_router)