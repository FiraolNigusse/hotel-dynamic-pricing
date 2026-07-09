"""
Project: AI Hotel Revenue Management & Dynamic Pricing Platform

Script: explore_data.py

Purpose:
    Explore the raw hotel booking dataset before cleaning or preprocessing.

Author: Your Name
"""

from pathlib import Path
import pandas as pd


def main():
    # ---------------------------------------------------
    # Locate dataset
    # ---------------------------------------------------
    project_root = Path(__file__).resolve().parents[2]
    data_path = project_root / "data" / "raw" / "hotel_bookings.csv"

    print("=" * 60)
    print("HOTEL BOOKINGS DATASET EXPLORATION")
    print("=" * 60)

    # ---------------------------------------------------
    # Load dataset
    # ---------------------------------------------------
    try:
        df = pd.read_csv(data_path)
    except FileNotFoundError:
        print(f"\nDataset not found:\n{data_path}")
        return

    # ---------------------------------------------------
    # Dataset Shape
    # ---------------------------------------------------
    print("\nDATASET SHAPE")
    print("-" * 60)
    print(f"Rows    : {df.shape[0]}")
    print(f"Columns : {df.shape[1]}")

    # ---------------------------------------------------
    # First Five Rows
    # ---------------------------------------------------
    print("\nFIRST 5 ROWS")
    print("-" * 60)
    print(df.head())

    # ---------------------------------------------------
    # Column Names
    # ---------------------------------------------------
    print("\nCOLUMN NAMES")
    print("-" * 60)

    for i, column in enumerate(df.columns, start=1):
        print(f"{i:2}. {column}")

    # ---------------------------------------------------
    # Data Types
    # ---------------------------------------------------
    print("\nDATA TYPES")
    print("-" * 60)
    print(df.dtypes)

    # ---------------------------------------------------
    # Missing Values
    # ---------------------------------------------------
    print("\nMISSING VALUES")
    print("-" * 60)

    missing = df.isnull().sum()
    missing = missing[missing > 0]

    if missing.empty:
        print("No missing values found.")
    else:
        print(missing.sort_values(ascending=False))

    # ---------------------------------------------------
    # Duplicate Rows
    # ---------------------------------------------------
    print("\nDUPLICATE ROWS")
    print("-" * 60)

    duplicates = df.duplicated().sum()
    print(f"Duplicate rows: {duplicates}")

    # ---------------------------------------------------
    # Numerical Summary
    # ---------------------------------------------------
    print("\nNUMERICAL SUMMARY")
    print("-" * 60)
    print(df.describe())

    # ---------------------------------------------------
    # Categorical Summary
    # ---------------------------------------------------
    print("\nCATEGORICAL FEATURES")
    print("-" * 60)

    categorical = df.select_dtypes(include="object").columns

    print(f"Number of categorical columns: {len(categorical)}")

    for column in categorical:
        print(f"\n{column}")
        print(f"Unique values: {df[column].nunique()}")

    # ---------------------------------------------------
    # Target Variable
    # ---------------------------------------------------
    if "adr" in df.columns:

        print("\nTARGET VARIABLE (ADR)")
        print("-" * 60)

        print(df["adr"].describe())

        print(f"\nMinimum ADR : {df['adr'].min()}")
        print(f"Maximum ADR : {df['adr'].max()}")
        print(f"Average ADR : {df['adr'].mean():.2f}")

    print("\n" + "=" * 60)
    print("DATASET EXPLORATION COMPLETED")
    print("=" * 60)


if __name__ == "__main__":
    main()