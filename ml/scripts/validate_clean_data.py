"""
Project: AI Hotel Revenue Management & Dynamic Pricing Platform

Script:
    validate_clean_data.py

Purpose:
    Validate the cleaned dataset before feature engineering.
"""

from pathlib import Path
import pandas as pd

# ==========================================================
# Paths
# ==========================================================

PROJECT_ROOT = Path(__file__).resolve().parents[2]

CLEAN_DATA = (
    PROJECT_ROOT
    / "data"
    / "processed"
    / "hotel_bookings_clean.csv"
)


def print_section(title):
    print("\n" + "=" * 70)
    print(title)
    print("=" * 70)


def validate():

    print_section("DATA VALIDATION REPORT")

    df = pd.read_csv(CLEAN_DATA)

    # ------------------------------------------------------
    # Dataset Shape
    # ------------------------------------------------------

    print(f"\nRows    : {len(df):,}")
    print(f"Columns : {len(df.columns)}")

    # ------------------------------------------------------
    # Missing Values
    # ------------------------------------------------------

    print_section("MISSING VALUES")

    missing = df.isnull().sum()

    missing = missing[missing > 0]

    if len(missing) == 0:
        print("PASS: No missing values.")
    else:
        print(missing)

    # ------------------------------------------------------
    # Duplicate Rows
    # ------------------------------------------------------

    print_section("DUPLICATE ROWS")

    duplicates = df.duplicated().sum()

    if duplicates == 0:
        print("PASS: No duplicate rows.")
    else:
        print(f"WARNING: {duplicates} duplicates remain.")

    # ------------------------------------------------------
    # ADR Validation
    # ------------------------------------------------------

    print_section("ADR VALIDATION")

    negative = (df["adr"] < 0).sum()

    zero = (df["adr"] == 0).sum()

    print(f"Negative ADR : {negative}")
    print(f"Zero ADR     : {zero}")

    if negative == 0 and zero == 0:
        print("PASS: ADR values are valid.")

    # ------------------------------------------------------
    # Stay Validation
    # ------------------------------------------------------

    print_section("STAY VALIDATION")

    weekend_negative = (
        df["stays_in_weekend_nights"] < 0
    ).sum()

    week_negative = (
        df["stays_in_week_nights"] < 0
    ).sum()

    print(f"Negative Weekend Nights : {weekend_negative}")
    print(f"Negative Week Nights    : {week_negative}")

    # ------------------------------------------------------
    # Guest Validation
    # ------------------------------------------------------

    print_section("GUEST VALIDATION")

    adults_negative = (df["adults"] < 0).sum()

    children_negative = (df["children"] < 0).sum()

    babies_negative = (df["babies"] < 0).sum()

    print(f"Negative Adults   : {adults_negative}")
    print(f"Negative Children : {children_negative}")
    print(f"Negative Babies   : {babies_negative}")

    # ------------------------------------------------------
    # Data Types
    # ------------------------------------------------------

    print_section("DATA TYPES")

    print(df.dtypes)

    # ------------------------------------------------------
    # Target Summary
    # ------------------------------------------------------

    print_section("TARGET SUMMARY")

    print(df["adr"].describe())

    # ------------------------------------------------------
    # Validation Summary
    # ------------------------------------------------------

    print_section("VALIDATION COMPLETE")

    print("Dataset is ready for Feature Engineering.")


if __name__ == "__main__":
    validate()