from typing import List

from fastapi import Depends, FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from .database import Base, engine, get_db
from .models import Prediction
from .schemas import (
    PredictionRequest,
    PredictionResponse,
    PredictionHistoryResponse,
)
from .services import predict_price


Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Hotel Dynamic Pricing API",
    description="Machine Learning API for predicting hotel room prices using a trained Random Forest model.",
    version="1.0.0",
)


@app.exception_handler(Exception)
async def global_exception_handler(
    request: Request,
    exc: Exception,
):
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error": str(exc),
        },
    )


@app.get(
    "/",
    tags=["Health"]
)
def root():
    return {
        "success": True,
        "application": "Hotel Dynamic Pricing API",
        "version": "1.0.0",
        "status": "running",
    }


@app.post(
    "/predict",
    response_model=PredictionResponse,
    tags=["Predictions"],
)
def predict(
    request: PredictionRequest,
    db: Session = Depends(get_db),
):
    price = predict_price(request.model_dump())

    prediction = Prediction(
        lead_time=request.lead_time,
        arrival_date_month=request.arrival_date_month,
        stays_in_weekend_nights=request.stays_in_weekend_nights,
        stays_in_week_nights=request.stays_in_week_nights,
        adults=request.adults,
        children=request.children,
        babies=request.babies,
        meal=request.meal,
        country=request.country,
        market_segment=request.market_segment,
        distribution_channel=request.distribution_channel,
        reserved_room_type=request.reserved_room_type,
        booking_changes=request.booking_changes,
        deposit_type=request.deposit_type,
        customer_type=request.customer_type,
        total_of_special_requests=request.total_of_special_requests,
        predicted_price=price,
    )

    db.add(prediction)
    db.commit()
    db.refresh(prediction)

    return PredictionResponse(
        predicted_price=round(price, 2)
    )


@app.get(
    "/predictions",
    response_model=List[PredictionHistoryResponse],
    tags=["Predictions"],
)
def get_predictions(
    db: Session = Depends(get_db),
):
    predictions = (
        db.query(Prediction)
        .order_by(Prediction.created_at.desc())
        .all()
    )

    return predictions


@app.delete(
    "/predictions/{prediction_id}",
    tags=["Predictions"],
)
def delete_prediction(
    prediction_id: int,
    db: Session = Depends(get_db),
):
    prediction = (
        db.query(Prediction)
        .filter(Prediction.id == prediction_id)
        .first()
    )

    if prediction is None:
        raise HTTPException(
            status_code=404,
            detail="Prediction not found",
        )

    db.delete(prediction)
    db.commit()

    return {
        "success": True,
        "message": "Prediction deleted successfully",
    }