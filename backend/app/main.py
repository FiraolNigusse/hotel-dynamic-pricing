from fastapi import FastAPI

from .api.prediction_routes import router
from .utils.exception_handlers import (
    global_exception_handler,
)


from .config import settings

app = FastAPI(
    title=settings.API_TITLE,
    version=settings.API_VERSION,
)

app.include_router(router)

app.add_exception_handler(
    Exception,
    global_exception_handler,
)