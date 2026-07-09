"""
Validate ML feature dataset
"""

from pathlib import Path
import pandas as pd


PROJECT_ROOT = Path(__file__).resolve().parents[2]

DATA_PATH = (
    PROJECT_ROOT
    / "data"
    / "processed"
    / "hotel_bookings_features.csv"
)


def validate_features():

    print("=" * 70)
    print("FEATURE DATASET VALIDATION")
    print("=" * 70)


    df = pd.read_csv(DATA_PATH)


    print("\nDATASET SHAPE")
    print("-" * 70)

    print(f"Rows    : {df.shape[0]}")
    print(f"Columns : {df.shape[1]}")


    print("\nMISSING VALUES")
    print("-" * 70)

    missing = df.isnull().sum()

    missing = missing[missing > 0]

    if len(missing) == 0:
        print("PASS: No missing values.")
    else:
        print(missing)


    print("\nTARGET VARIABLE")
    print("-" * 70)

    print(df["adr"].describe())


    print("\nDATA TYPES")
    print("-" * 70)

    print(df.dtypes.value_counts())


    print("\nFEATURE SAMPLE")
    print("-" * 70)

    print(df.head())


    print("\nVALIDATION COMPLETE")


if __name__ == "__main__":
    validate_features()