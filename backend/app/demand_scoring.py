PEAK_MONTHS = ["June", "July", "August", "December"]
SHOULDER_MONTHS = ["May", "September", "October"]

LEVEL_THRESHOLDS = [
    (80, "Very High"),
    (60, "High"),
    (40, "Medium"),
    (20, "Low"),
    (0, "Very Low"),
]


def _score_lead_time(lead_time: int) -> int:
    if lead_time <= 3:
        return 30
    elif lead_time <= 7:
        return 26
    elif lead_time <= 14:
        return 22
    elif lead_time <= 30:
        return 18
    elif lead_time <= 60:
        return 14
    elif lead_time <= 90:
        return 10
    elif lead_time <= 120:
        return 6
    return 3


def _score_special_requests(count: int) -> int:
    table = {0: 4, 1: 10, 2: 15, 3: 18}
    return table.get(count, 20)


def _score_adults(adults: int) -> int:
    table = {1: 5, 2: 15, 3: 12}
    return table.get(adults, 10)


def _score_market_segment(segment: str) -> int:
    scores = {
        "Direct": 15,
        "Online TA": 13,
        "Corporate": 10,
        "Aviation": 6,
        "Offline TA/TO": 8,
        "Groups": 5,
        "Complementary": 3,
        "Undefined": 1,
    }
    return scores.get(segment, 5)


def _score_month(month: str) -> int:
    if month in PEAK_MONTHS:
        return 12
    elif month in SHOULDER_MONTHS:
        return 8
    return 4


def _score_booking_changes(changes: int) -> int:
    table = {0: 2, 1: 5, 2: 7}
    return table.get(changes, 8)


def compute_demand_score(data: dict) -> dict:
    lead_time = data.get("lead_time", 0)
    special = data.get("total_of_special_requests", 0)
    adults = data.get("adults", 1)
    segment = data.get("market_segment", "Undefined")
    month = data.get("arrival_date_month", "January")
    changes = data.get("booking_changes", 0)

    score = (
        _score_lead_time(lead_time)
        + _score_special_requests(special)
        + _score_adults(adults)
        + _score_market_segment(segment)
        + _score_month(month)
        + _score_booking_changes(changes)
    )

    score = max(0, min(100, score))

    level = "Very Low"
    for threshold, label in LEVEL_THRESHOLDS:
        if score >= threshold:
            level = label
            break

    return {
        "demand_score": score,
        "demand_level": level,
        "breakdown": {
            "lead_time": _score_lead_time(lead_time),
            "special_requests": _score_special_requests(special),
            "adults": _score_adults(adults),
            "market_segment": _score_market_segment(segment),
            "month": _score_month(month),
            "booking_changes": _score_booking_changes(changes),
        },
    }
