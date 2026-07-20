from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Prediction
from ..schemas import (
    DemandScoreRequest,
    DemandScoreResponse,
    PredictionHistoryResponse,
    PredictionRequest,
    PredictionResponse,
    PredictionUpdate,
)
from ..services import (
    classify_demand,
    calculate_recommended_price,
    generate_pricing_reason,
    predict_price,
)
from ..demand_scoring import compute_demand_score

router = APIRouter(tags=["Predictions"])

DbSession = Annotated[Session, Depends(get_db)]


@router.get("/")
def root() -> dict[str, str]:
    return {"message": "Hotel Dynamic Pricing API running"}


@router.post("/demand-score", response_model=DemandScoreResponse)
def demand_score(request: DemandScoreRequest) -> DemandScoreResponse:
    result = compute_demand_score(request.model_dump())
    return DemandScoreResponse(**result)


@router.post("/predict", response_model=PredictionResponse)
def predict(
    request: PredictionRequest,
    db: DbSession,
) -> PredictionResponse:
    data = request.model_dump()
    price = predict_price(data)
    tier = classify_demand(data)
    recommended = calculate_recommended_price(price, tier)
    reason = generate_pricing_reason(data, tier)

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
        predicted_price=round(price, 2),
        recommended_price=recommended,
        pricing_tier=tier,
        pricing_reason=reason,
    )


@router.get("/predictions", response_model=list[PredictionHistoryResponse])
def get_predictions(db: DbSession) -> list[PredictionHistoryResponse]:
    return (
        db.query(Prediction)
        .order_by(Prediction.created_at.desc())
        .all()
    )


@router.put("/predictions/{prediction_id}", response_model=PredictionResponse)
def update_prediction(
    prediction_id: int,
    request: PredictionUpdate,
    db: DbSession,
) -> PredictionResponse:
    prediction = (
        db.query(Prediction)
        .filter(Prediction.id == prediction_id)
        .first()
    )

    if prediction is None:
        raise HTTPException(status_code=404, detail="Prediction not found")

    data = request.model_dump()
    price = predict_price(data)
    tier = classify_demand(data)
    recommended = calculate_recommended_price(price, tier)
    reason = generate_pricing_reason(data, tier)

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
        predicted_price=round(price, 2),
        recommended_price=recommended,
        pricing_tier=tier,
        pricing_reason=reason,
    )


@router.delete("/predictions/{prediction_id}")
def delete_prediction(
    prediction_id: int,
    db: DbSession,
) -> dict[str, str]:
    prediction = (
        db.query(Prediction)
        .filter(Prediction.id == prediction_id)
        .first()
    )

    if prediction is None:
        raise HTTPException(status_code=404, detail="Prediction not found")

    db.delete(prediction)
    db.commit()

    return {"message": "Prediction deleted successfully"}
