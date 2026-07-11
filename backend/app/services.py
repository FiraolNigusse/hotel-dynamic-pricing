from pathlib import Path

import joblib
import pandas as pd

PROJECT_ROOT = Path(__file__).resolve().parents[2]

MODEL_PATH = (
    PROJECT_ROOT
    / "ml"
    / "models"
    / "best_price_model.pkl"
)

model = joblib.load(MODEL_PATH)

MONTH_MAP = {
    "January": 1,
    "February": 2,
    "March": 3,
    "April": 4,
    "May": 5,
    "June": 6,
    "July": 7,
    "August": 8,
    "September": 9,
    "October": 10,
    "November": 11,
    "December": 12,
}

PEAK_MONTHS = ["June", "July", "August", "December"]

FEATURE_ENGINEERING_CATEGORICALS = [
    "meal",
    "market_segment",
    "distribution_channel",
    "reserved_room_type",
    "deposit_type",
    "customer_type",
]

TRAINING_CATEGORICALS = [
    "arrival_date_month",
    "country",
]

DEFAULT_FEATURES = {
    "is_canceled": 0,
    "arrival_date_year": 2017,
    "arrival_date_week_number": 27,
    "arrival_date_day_of_month": 1,
    "is_repeated_guest": 0,
    "previous_cancellations": 0,
    "previous_bookings_not_canceled": 0,
    "days_in_waiting_list": 0,
    "required_car_parking_spaces": 0,
}


def _build_feature_row(data: dict) -> pd.DataFrame:
    row = {**DEFAULT_FEATURES, **data}

    row["total_nights"] = (
        row["stays_in_week_nights"]
        + row["stays_in_weekend_nights"]
    )
    row["total_guests"] = (
        row["adults"]
        + row["children"]
        + row["babies"]
    )
    row["has_weekend_stay"] = int(row["stays_in_weekend_nights"] > 0)
    row["is_peak_season"] = int(row["arrival_date_month"] in PEAK_MONTHS)
    row["arrival_month"] = MONTH_MAP[row["arrival_date_month"]]

    sample = pd.DataFrame([row])

    sample = pd.get_dummies(
        sample,
        columns=FEATURE_ENGINEERING_CATEGORICALS,
        drop_first=True,
        dtype=int,
    )

    sample = pd.get_dummies(
        sample,
        columns=TRAINING_CATEGORICALS,
        drop_first=True,
        dtype=int,
    )

    return sample


def predict_price(data: dict) -> float:
    sample = _build_feature_row(data)
    expected_columns = list(model.feature_names_in_)

    aligned = pd.DataFrame(0, index=sample.index, columns=expected_columns)
    aligned.update(sample)

    prediction = model.predict(aligned)

    return float(prediction[0])
