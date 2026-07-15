from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Prediction
from ..schemas import (
    PredictionRequest,
    PredictionResponse,
    PredictionHistoryResponse,
)
from ..schemas import PredictionUpdate
from ..services import predict_price

router = APIRouter(
    tags=["Predictions"],
)


@router.get("/")
def root():
    return {
        "message": "Hotel Dynamic Pricing API running"
    }


@router.post(
    "/predict",
    response_model=PredictionResponse,
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


@router.get(
    "/predictions",
    response_model=List[PredictionHistoryResponse],
)
def get_predictions(
    db: Session = Depends(get_db),
):
    return (
        db.query(Prediction)
        .order_by(Prediction.created_at.desc())
        .all()
    )


@router.put(
    "/predictions/{prediction_id}",
    response_model=PredictionResponse,
)
def update_prediction(
    prediction_id: int,
    request: PredictionUpdate,
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

    price = predict_price(request.model_dump())

    prediction.lead_time = request.lead_time
    prediction.arrival_date_month = request.arrival_date_month
    prediction.stays_in_weekend_nights = request.stays_in_weekend_nights
    prediction.stays_in_week_nights = request.stays_in_week_nights
    prediction.adults = request.adults
    prediction.children = request.children
    prediction.babies = request.babies
    prediction.meal = request.meal
    prediction.country = request.country
    prediction.market_segment = request.market_segment
    prediction.distribution_channel = request.distribution_channel
    prediction.reserved_room_type = request.reserved_room_type
    prediction.booking_changes = request.booking_changes
    prediction.deposit_type = request.deposit_type
    prediction.customer_type = request.customer_type
    prediction.total_of_special_requests = request.total_of_special_requests
    prediction.predicted_price = price

    db.commit()
    db.refresh(prediction)

    return PredictionResponse(
        predicted_price=round(price, 2)
    )


@router.delete("/predictions/{prediction_id}")
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
        "message": "Prediction deleted successfully"
    }