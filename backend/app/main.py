from fastapi import FastAPI

from .api.prediction_routes import router
from .utils.exception_handlers import (
    global_exception_handler,
)


app = FastAPI(
    title="Hotel Dynamic Pricing API",
    version="1.0.0",
)

app.include_router(router)

app.add_exception_handler(
    Exception,
    global_exception_handler,
)