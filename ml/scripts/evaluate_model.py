"""
Hotel Dynamic Pricing System
Model Evaluation Script
"""

from pathlib import Path
import json
import joblib
import pandas as pd

from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    mean_absolute_error,
    mean_squared_error,
    r2_score
)


PROJECT_ROOT = Path(__file__).resolve().parents[2]


DATA_PATH = (
    PROJECT_ROOT
    / "data"
    / "processed"
    / "hotel_bookings_features.csv"
)


MODEL_PATH = (
    PROJECT_ROOT
    / "ml"
    / "models"
    / "best_price_model.pkl"
)


OUTPUT_PATH = (
    PROJECT_ROOT
    / "ml"
    / "artifacts"
    / "model_metrics.json"
)


def evaluate_model():

    print("=" * 70)
    print("MODEL EVALUATION")
    print("=" * 70)


    df = pd.read_csv(DATA_PATH)


    # Handle remaining categorical values

    categorical_columns = df.select_dtypes(
        include=["object", "string"]
    ).columns


    if len(categorical_columns) > 0:

        df = pd.get_dummies(
            df,
            columns=categorical_columns,
            drop_first=True,
            dtype=int
        )


    X = df.drop(
        "adr",
        axis=1
    )

    y = df["adr"]


    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.2,
        random_state=42
    )


    model = joblib.load(
        MODEL_PATH
    )


    predictions = model.predict(
        X_test
    )


    mae = mean_absolute_error(
        y_test,
        predictions
    )


    mse = mean_squared_error(
        y_test,
        predictions
    )

    rmse = mse ** 0.5


    r2 = r2_score(
        y_test,
        predictions
    )


    metrics = {

        "model": "Random Forest Regressor",

        "mae": round(
            mae,
            4
        ),

        "rmse": round(
            rmse,
            4
        ),

        "r2_score": round(
            r2,
            4
        )
    }


    OUTPUT_PATH.parent.mkdir(
        parents=True,
        exist_ok=True
    )


    with open(
        OUTPUT_PATH,
        "w"
    ) as file:

        json.dump(
            metrics,
            file,
            indent=4
        )


    print("\nEvaluation Results")

    print(metrics)


    print("\nSaved:")
    print(OUTPUT_PATH)


if __name__ == "__main__":
    evaluate_model()