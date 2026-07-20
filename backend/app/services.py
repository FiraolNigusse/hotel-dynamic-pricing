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
SHOULDER_MONTHS = ["May", "September", "October"]

DEMAND_TIER_ADJUSTMENTS = {
    "Very High": 0.25,
    "High": 0.15,
    "Medium": 0.0,
    "Low": -0.10,
    "Very Low": -0.20,
}

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


def classify_demand(data: dict) -> str:
    score = 0

    lead_time = data.get("lead_time", 0)
    if lead_time <= 3:
        score += 30
    elif lead_time <= 14:
        score += 25
    elif lead_time <= 30:
        score += 20
    elif lead_time <= 60:
        score += 15
    elif lead_time <= 90:
        score += 10
    else:
        score += 5

    month = data.get("arrival_date_month", "")
    if month in PEAK_MONTHS:
        score += 15
    elif month in SHOULDER_MONTHS:
        score += 10
    else:
        score += 5

    segment_scores = {
        "Direct": 10,
        "Online TA": 9,
        "Corporate": 7,
        "Offline TA/TO": 6,
        "Groups": 4,
        "Aviation": 3,
        "Complementary": 2,
        "Undefined": 1,
    }
    score += segment_scores.get(data.get("market_segment", ""), 3)

    customer_scores = {
        "Transient": 10,
        "Transient-Party": 8,
        "Contract": 6,
        "Group": 4,
    }
    score += customer_scores.get(data.get("customer_type", ""), 5)

    special = data.get("total_of_special_requests", 0)
    if special >= 3:
        score += 10
    elif special == 2:
        score += 7
    elif special == 1:
        score += 5
    else:
        score += 2

    deposit = data.get("deposit_type", "")
    if deposit == "Non Refund":
        score += 10
    elif deposit == "Refundable":
        score += 6
    else:
        score += 3

    adults = data.get("adults", 1)
    if adults == 2:
        score += 5
    elif adults == 1:
        score += 2
    else:
        score += 4

    if score >= 75:
        return "Very High"
    elif score >= 60:
        return "High"
    elif score >= 40:
        return "Medium"
    elif score >= 20:
        return "Low"
    else:
        return "Very Low"


def calculate_recommended_price(
    predicted_price: float,
    pricing_tier: str,
) -> float:
    adjustment = DEMAND_TIER_ADJUSTMENTS[pricing_tier]
    return round(predicted_price * (1 + adjustment), 2)


def generate_pricing_reason(
    data: dict,
    pricing_tier: str,
    predicted_price: float,
    recommended_price: float,
) -> str:
    adjustments = {
        "Very High": ("increased", "25%", "strong"),
        "High": ("increased", "15%", "elevated"),
        "Medium": ("adjusted", "0%", "steady"),
        "Low": ("reduced", "10%", "low"),
        "Very Low": ("reduced", "20%", "very low"),
    }

    direction, percent, demand_word = adjustments[pricing_tier]

    month = data.get("arrival_date_month", "")
    adults = data.get("adults", 1)
    children = data.get("children", 0)
    lead_time = data.get("lead_time", 0)
    special = data.get("total_of_special_requests", 0)
    total_guests = adults + children

    reasons = []

    if month in PEAK_MONTHS:
        reasons.append(f"demand is {demand_word} during {month}")
    elif month in SHOULDER_MONTHS:
        reasons.append(f"{month} is a shoulder season month")
    else:
        reasons.append(f"{month} is an off-peak month")

    if total_guests > 2:
        reasons.append(f"there {'are' if total_guests > 1 else 'is'} {total_guests} guests")
    elif adults == 2:
        reasons.append("2 adults are booking")

    if lead_time <= 7:
        reasons.append("the booking is last-minute")
    elif lead_time <= 14:
        reasons.append("the lead time is short")
    elif lead_time >= 90:
        reasons.append("the booking was made well in advance")

    if special >= 3:
        reasons.append(f"{special} special requests were made")
    elif special == 1:
        reasons.append("a special request was included")

    if len(reasons) == 0:
        reasons.append("standard booking conditions apply")

    opening = f"Price has been {direction} by {percent}"
    if pricing_tier == "Medium":
        opening = f"Price remains unchanged at {percent} adjustment"

    clause = reasons[0]
    if len(reasons) > 1:
        clause += ", and " + reasons[1]
    if len(reasons) > 2:
        clause += ", " + reasons[2]

    return f"{opening} because {clause}."
