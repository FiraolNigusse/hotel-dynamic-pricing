"""
Project: AI Hotel Revenue Management & Dynamic Pricing Platform

Script:
    clean_data.py

Purpose:
    Clean the raw Hotel Booking Demand dataset and produce
    a machine-learning-ready dataset.

Output:
    data/processed/hotel_bookings_clean.csv
"""

from pathlib import Path
import pandas as pd


# ==========================================================
# Paths
# ==========================================================

PROJECT_ROOT = Path(__file__).resolve().parents[2]

RAW_DATA = PROJECT_ROOT / "data" / "raw" / "hotel_bookings.csv"

PROCESSED_DATA = (
    PROJECT_ROOT
    / "data"
    / "processed"
    / "hotel_bookings_clean.csv"
)


# ==========================================================
# Cleaning Pipeline
# ==========================================================

def clean_dataset():

    print("=" * 70)
    print("HOTEL BOOKINGS DATA CLEANING PIPELINE")
    print("=" * 70)

    # ------------------------------------------------------
    # Load Dataset
    # ------------------------------------------------------

    print("\nLoading dataset...")

    df = pd.read_csv(RAW_DATA)

    initial_rows = len(df)
    initial_columns = len(df.columns)

    print(f"Initial Rows    : {initial_rows:,}")
    print(f"Initial Columns : {initial_columns}")

    # ------------------------------------------------------
    # Remove Duplicate Rows
    # ------------------------------------------------------

    duplicate_rows = df.duplicated().sum()

    df = df.drop_duplicates().reset_index(drop=True)

    print(f"\nDuplicate Rows Removed : {duplicate_rows:,}")

    # ------------------------------------------------------
    # Remove Invalid ADR Values
    # ------------------------------------------------------

    invalid_adr = (df["adr"] <= 0).sum()

    df = df[df["adr"] > 0].copy()

    print(f"Invalid ADR Removed : {invalid_adr:,}")

    # ------------------------------------------------------
    # Missing Values
    # ------------------------------------------------------

    missing_children = df["children"].isna().sum()

    missing_country = df["country"].isna().sum()

    df["children"] = df["children"].fillna(0)

    df["country"] = df["country"].fillna("Unknown")

    print(f"\nMissing Children Filled : {missing_children}")
    print(f"Missing Country Filled  : {missing_country}")

    # ------------------------------------------------------
    # Drop Unused Columns
    # ------------------------------------------------------

    columns_to_drop = [
        "company",
        "agent",
        "reservation_status",
        "reservation_status_date"
    ]

    df = df.drop(columns=columns_to_drop)

    print("\nDropped Columns")

    for column in columns_to_drop:
        print(f"   • {column}")

    # ------------------------------------------------------
    # Remaining Missing Values
    # ------------------------------------------------------

    remaining_missing = df.isna().sum().sum()

    # ------------------------------------------------------
    # Save Clean Dataset
    # ------------------------------------------------------

    PROCESSED_DATA.parent.mkdir(parents=True, exist_ok=True)

    df.to_csv(PROCESSED_DATA, index=False)

    # ------------------------------------------------------
    # Cleaning Report
    # ------------------------------------------------------

    print("\n" + "=" * 70)
    print("DATA CLEANING REPORT")
    print("=" * 70)

    print(f"Initial Rows               : {initial_rows:,}")
    print(f"Final Rows                 : {len(df):,}")

    print()

    print(f"Initial Columns            : {initial_columns}")
    print(f"Final Columns              : {len(df.columns)}")

    print()

    print(f"Duplicates Removed         : {duplicate_rows:,}")
    print(f"Invalid ADR Removed        : {invalid_adr:,}")

    print()

    print(f"Missing Values Remaining   : {remaining_missing}")

    print()

    print("Dataset Saved To:")

    print(PROCESSED_DATA)

    print("\nCleaning Completed Successfully.")

    print("=" * 70)


# ==========================================================
# Main
# ==========================================================

if __name__ == "__main__":
    clean_dataset()