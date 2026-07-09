"""
Hotel Dynamic Pricing System
Prediction Pipeline

Loads trained model
Recreates training feature preparation
Predicts ADR
"""

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


DATA_PATH = (
    PROJECT_ROOT
    / "data"
    / "processed"
    / "hotel_bookings_features.csv"
)


def load_model():

    return joblib.load(
        MODEL_PATH
    )


def prepare_features():

    df = pd.read_csv(DATA_PATH)


    X = df.drop(
        "adr",
        axis=1
    )


    # Same encoding used during training

    categorical_columns = X.select_dtypes(
        include=["object", "string"]
    ).columns


    if len(categorical_columns) > 0:

        X = pd.get_dummies(
            X,
            columns=categorical_columns,
            drop_first=True,
            dtype=int
        )


    return X.iloc[[0]]



def predict_price():

    print("=" * 70)
    print("HOTEL PRICE PREDICTION")
    print("=" * 70)


    model = load_model()


    sample = prepare_features()


    print("\nPrepared Features:")
    print(sample.shape)


    prediction = model.predict(
        sample
    )


    print("\nPredicted ADR:")
    print(
        round(
            prediction[0],
            2
        )
    )


    print("\nPrediction Completed Successfully")



if __name__ == "__main__":
    predict_price()