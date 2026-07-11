from sqlalchemy import Column
from sqlalchemy import Integer
from sqlalchemy import Float
from sqlalchemy import String
from sqlalchemy import DateTime
from sqlalchemy.sql import func

from .database import Base


class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    lead_time = Column(
        Integer,
        nullable=False
    )

    arrival_date_month = Column(
        String,
        nullable=False
    )

    stays_in_weekend_nights = Column(
        Integer,
        nullable=False
    )

    stays_in_week_nights = Column(
        Integer,
        nullable=False
    )

    adults = Column(
        Integer,
        nullable=False
    )

    children = Column(
        Integer,
        nullable=False
    )

    babies = Column(
        Integer,
        nullable=False
    )

    meal = Column(
        String,
        nullable=False
    )

    country = Column(
        String,
        nullable=False
    )

    market_segment = Column(
        String,
        nullable=False
    )

    distribution_channel = Column(
        String,
        nullable=False
    )

    reserved_room_type = Column(
        String,
        nullable=False
    )

    booking_changes = Column(
        Integer,
        nullable=False
    )

    deposit_type = Column(
        String,
        nullable=False
    )

    customer_type = Column(
        String,
        nullable=False
    )

    total_of_special_requests = Column(
        Integer,
        nullable=False
    )

    predicted_price = Column(
        Float,
        nullable=False
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )