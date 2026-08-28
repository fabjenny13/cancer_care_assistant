from fastapi import FastAPI
from sqlalchemy import text

from app.db.database import engine


app = FastAPI(
    title="Cancer Care AI Backend",
    version="0.1.0"
)


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