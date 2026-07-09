"""
Project: AI Hotel Revenue Management & Dynamic Pricing Platform

Script:
    feature_engineering.py

Purpose:
    Transform the cleaned dataset into a machine-learning-ready dataset.

Output:
    data/processed/hotel_bookings_features.csv
"""

from pathlib import Path
import pandas as pd

# ==========================================================
# Paths
# ==========================================================

PROJECT_ROOT = Path(__file__).resolve().parents[2]

INPUT_DATA = (
    PROJECT_ROOT
    / "data"
    / "processed"
    / "hotel_bookings_clean.csv"
)

OUTPUT_DATA = (
    PROJECT_ROOT
    / "data"
    / "processed"
    / "hotel_bookings_features.csv"
)

# ==========================================================
# Month Mapping
# ==========================================================

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

# ==========================================================
# Feature Engineering
# ==========================================================

def engineer_features():

    print("=" * 70)
    print("FEATURE ENGINEERING PIPELINE")
    print("=" * 70)

    df = pd.read_csv(INPUT_DATA)

    print(f"\nOriginal Shape: {df.shape}")

    # ------------------------------------------------------
    # Total Nights
    # ------------------------------------------------------

    df["total_nights"] = (
        df["stays_in_week_nights"]
        + df["stays_in_weekend_nights"]
    )

    # ------------------------------------------------------
    # Total Guests
    # ------------------------------------------------------

    df["total_guests"] = (
        df["adults"]
        + df["children"]
        + df["babies"]
    )

    # ------------------------------------------------------
    # Weekend Stay
    # ------------------------------------------------------

    df["has_weekend_stay"] = (
        df["stays_in_weekend_nights"] > 0
    ).astype(int)

    # ------------------------------------------------------
    # Peak Season
    # ------------------------------------------------------

    peak_months = [
        "June",
        "July",
        "August",
        "December"
    ]

    df["is_peak_season"] = (
        df["arrival_date_month"]
        .isin(peak_months)
        .astype(int)
    )

    # ------------------------------------------------------
    # Month Number
    # ------------------------------------------------------

    df["arrival_month"] = (
        df["arrival_date_month"]
        .map(MONTH_MAP)
    )

    # ------------------------------------------------------
    # One-Hot Encoding
    # ------------------------------------------------------

    categorical_columns = [
        "hotel",
        "meal",
        "market_segment",
        "distribution_channel",
        "reserved_room_type",
        "assigned_room_type",
        "deposit_type",
        "customer_type",
    ]

    df = pd.get_dummies(
        df,
        columns=categorical_columns,
        drop_first=True,
        dtype=int
    )

    print(f"Encoded Shape: {df.shape}")

    # ------------------------------------------------------
    # Save Dataset
    # ------------------------------------------------------

    OUTPUT_DATA.parent.mkdir(parents=True, exist_ok=True)

    df.to_csv(
        OUTPUT_DATA,
        index=False
    )

    print("\nDataset Saved:")

    print(OUTPUT_DATA)

    print("\nFeature Engineering Completed Successfully.")

    print("=" * 70)


if __name__ == "__main__":
    engineer_features()