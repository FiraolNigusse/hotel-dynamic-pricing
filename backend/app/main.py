from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .api.prediction_routes import router
from .utils.exception_handlers import (
    global_exception_handler,
)


from .config import settings

app = FastAPI(
    title=settings.API_TITLE,
    version=settings.API_VERSION,
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)

app.add_exception_handler(
    Exception,
    global_exception_handler,
)