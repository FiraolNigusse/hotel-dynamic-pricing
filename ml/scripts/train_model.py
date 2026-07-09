"""
Hotel Dynamic Pricing System
Model Training Pipeline

Target:
    ADR (Average Daily Rate)

Models:
    Linear Regression
    Random Forest
    Gradient Boosting
"""

from pathlib import Path
import pandas as pd
import joblib

from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    mean_absolute_error,
    mean_squared_error,
    r2_score
)

from sklearn.linear_model import LinearRegression
from sklearn.ensemble import (
    RandomForestRegressor,
    GradientBoostingRegressor
)


# =====================================================
# Paths
# =====================================================

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


# =====================================================
# Training
# =====================================================

def train_models():

    print("=" * 70)
    print("HOTEL PRICE PREDICTION MODEL TRAINING")
    print("=" * 70)


    df = pd.read_csv(DATA_PATH)


    print("\nDataset Loaded")
    print(f"Rows    : {df.shape[0]}")
    print(f"Columns : {df.shape[1]}")


    # =================================================
    # Handle Remaining Categorical Features
    # =================================================

    categorical_columns = df.select_dtypes(
        include=["object", "string"]
    ).columns


    if len(categorical_columns) > 0:

        print("\nCategorical columns detected:")
        
        for col in categorical_columns:
            print(f"- {col}")


        df = pd.get_dummies(
            df,
            columns=categorical_columns,
            drop_first=True,
            dtype=int
        )


        print(
            "\nCategorical encoding completed."
        )


    print(
        f"\nFinal Training Dataset Shape: {df.shape}"
    )


    # =================================================
    # Separate Features and Target
    # =================================================

    X = df.drop(
        "adr",
        axis=1
    )

    y = df["adr"]


    # =================================================
    # Train Test Split
    # =================================================

    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.2,
        random_state=42
    )


    print("\nTraining Samples:", X_train.shape[0])
    print("Testing Samples :", X_test.shape[0])


    # =================================================
    # Models
    # =================================================

    models = {

        "Linear Regression":
            LinearRegression(),

        "Random Forest":
            RandomForestRegressor(
                n_estimators=100,
                random_state=42,
                n_jobs=-1
            ),

        "Gradient Boosting":
            GradientBoostingRegressor(
                random_state=42
            )
    }


    best_model = None
    best_score = float("-inf")


    # =================================================
    # Train & Evaluate
    # =================================================

    for name, model in models.items():

        print("\n" + "-" * 50)
        print("Training:", name)


        model.fit(
            X_train,
            y_train
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


        print(
            f"MAE : {mae:.2f}"
        )

        print(
            f"RMSE: {rmse:.2f}"
        )

        print(
            f"R2  : {r2:.4f}"
        )


        if r2 > best_score:

            best_score = r2
            best_model = model


    # =================================================
    # Save Best Model
    # =================================================

    MODEL_PATH.parent.mkdir(
        parents=True,
        exist_ok=True
    )


    joblib.dump(
        best_model,
        MODEL_PATH
    )


    print("\n" + "=" * 70)
    print("BEST MODEL SAVED")
    print("=" * 70)

    print(
        MODEL_PATH
    )

    print(
        f"Best R2 Score: {best_score:.4f}"
    )


if __name__ == "__main__":
    train_models()