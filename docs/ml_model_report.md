# Machine Learning Model Report

## Objective

Predict hotel room prices using historical booking data.

Target Variable:

ADR (Average Daily Rate)


## Dataset

Rows after cleaning:

85617

Features after engineering:

249


## Models Tested

| Model | R2 Score |
|------|----------|
| Linear Regression | 0.6564 |
| Gradient Boosting | 0.7795 |
| Random Forest | 0.8730 |


## Final Model

Random Forest Regressor


## Evaluation Metrics

MAE:

10.5277


RMSE:

18.0102


R2 Score:

0.8730


## Prediction Example

Input:

Hotel booking characteristics


Output:

Predicted room price (ADR)


## Future Improvements

- Add real competitor pricing data
- Add demand forecasting
- Add seasonal pricing rules
- Add real-time market signals