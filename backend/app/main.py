from fastapi import FastAPI


app = FastAPI(
    title="Cancer Care AI Backend",
    version="0.1.0"
)


@app.get("/")
def root():
    return {
        "message": "Cancer Care AI Backend is running"
    }