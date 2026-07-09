"""
Project: AI Hotel Revenue Management & Dynamic Pricing Platform

Script: analyze_duplicates.py

Purpose:
    Investigate duplicate rows in the Hotel Booking Demand dataset
    before deciding whether to remove them.
"""

from pathlib import Path
import pandas as pd


def main():
    # ---------------------------------------------------
    # Load Dataset
    # ---------------------------------------------------
    project_root = Path(__file__).resolve().parents[2]
    data_path = project_root / "data" / "raw" / "hotel_bookings.csv"

    print("=" * 70)
    print("DUPLICATE RECORD ANALYSIS")
    print("=" * 70)

    df = pd.read_csv(data_path)

    print(f"\nTotal Rows: {len(df):,}")

    # ---------------------------------------------------
    # Find Exact Duplicates
    # ---------------------------------------------------
    duplicates = df[df.duplicated(keep=False)]

    duplicate_count = df.duplicated().sum()

    print(f"Duplicate Rows: {duplicate_count:,}")

    if duplicate_count == 0:
        print("\nNo duplicate rows found.")
        return

    # ---------------------------------------------------
    # Percentage
    # ---------------------------------------------------
    percentage = (duplicate_count / len(df)) * 100

    print(f"Percentage of Dataset: {percentage:.2f}%")

    # ---------------------------------------------------
    # Number of Duplicate Groups
    # ---------------------------------------------------
    duplicate_groups = duplicates.groupby(list(df.columns)).size()

    print(f"\nDuplicate Groups: {len(duplicate_groups):,}")

    # ---------------------------------------------------
    # Largest Duplicate Groups
    # ---------------------------------------------------
    print("\nTop 10 Largest Duplicate Groups")
    print("-" * 70)

    print(
        duplicate_groups
        .sort_values(ascending=False)
        .head(10)
    )

    # ---------------------------------------------------
    # Sample Duplicate Records
    # ---------------------------------------------------
    print("\nSample Duplicate Records")
    print("-" * 70)

    print(duplicates.head(10))

    # ---------------------------------------------------
    # ADR Statistics
    # ---------------------------------------------------
    print("\nADR Statistics for Duplicate Records")
    print("-" * 70)

    print(duplicates["adr"].describe())

    print("\nAnalysis Complete.")
    print("=" * 70)


if __name__ == "__main__":
    main()