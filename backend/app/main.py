from fastapi import FastAPI

from .database import Base
from .database import engine

# Import models BEFORE create_all()
from . import models

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Hotel Dynamic Pricing API",
    version="1.0.0"
)


@app.get("/")
def root():
    return {
        "message": "Hotel Dynamic Pricing API running"
    }