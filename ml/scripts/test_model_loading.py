from pathlib import Path
import joblib


PROJECT_ROOT = Path(__file__).resolve().parents[2]


MODEL_PATH = (
    PROJECT_ROOT
    / "ml"
    / "models"
    / "best_price_model.pkl"
)


print("=" * 70)
print("MODEL LOADING TEST")
print("=" * 70)


model = joblib.load(MODEL_PATH)


print("\nModel Loaded Successfully")

print("\nModel Type:")
print(type(model))


print("\nModel Parameters:")
print(model.get_params())


print("\nTest Complete")
print("=" * 70)