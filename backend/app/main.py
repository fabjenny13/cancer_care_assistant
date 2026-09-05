from fastapi import FastAPI
from sqlalchemy import text

from app.db.database import engine
from app import models
from app.routers.auth import router as auth_router
from app.routers.profile import router as profile_router
from app.routers.conversation import router as conversation_router
from app.routers.mood import router as mood_router


app = FastAPI(
    title="Cancer Care AI Backend",
    version="0.1.0"
)

app.include_router(auth_router)
app.include_router(profile_router)
app.include_router(conversation_router)
app.include_router(mood_router)

@app.get("/")
def root():
    return {
        "message": "Cancer Care AI Backend is running"
    }


@app.get("/health/db")
def database_health():
    try:
        with engine.connect() as connection:
            result = connection.execute(text("SELECT 1"))
            value = result.scalar()

        return {
            "database": "connected",
            "test": value
        }

    except Exception as e:
        return {
            "database": "error",
            "detail": str(e)
        }