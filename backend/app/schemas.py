from pydantic import BaseModel


class PredictionRequest(BaseModel):
    lead_time: int
    arrival_date_month: str
    stays_in_weekend_nights: int
    stays_in_week_nights: int
    adults: int
    children: float
    babies: int
    meal: str
    country: str
    market_segment: str
    distribution_channel: str
    reserved_room_type: str
    booking_changes: int
    deposit_type: str
    customer_type: str
    total_of_special_requests: int


class PredictionResponse(BaseModel):
    predicted_price: float


class PredictionUpdate(BaseModel):
    lead_time: int
    arrival_date_month: str
    stays_in_weekend_nights: int
    stays_in_week_nights: int
    adults: int
    children: float
    babies: int
    meal: str
    country: str
    market_segment: str
    distribution_channel: str
    reserved_room_type: str
    booking_changes: int
    deposit_type: str
    customer_type: str
    total_of_special_requests: int

from datetime import datetime


class PredictionHistoryResponse(BaseModel):
    id: int
    lead_time: int
    arrival_date_month: str
    stays_in_weekend_nights: int
    stays_in_week_nights: int
    adults: int
    children: float
    babies: int
    meal: str
    country: str
    market_segment: str
    distribution_channel: str
    reserved_room_type: str
    booking_changes: int
    deposit_type: str
    customer_type: str
    total_of_special_requests: int
    predicted_price: float
    created_at: datetime

    model_config = {
        "from_attributes": True
    }