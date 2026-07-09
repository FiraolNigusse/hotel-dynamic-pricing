# Dataset Analysis

## Project

**AI Hotel Revenue Management & Dynamic Pricing Platform**

---

# Dataset Information

## Dataset Name

Hotel Booking Demand Dataset

## Source

Nuno Antonio, Ana Almeida, Luis Nunes.

Hotel Booking Demand Datasets (2019)

https://www.sciencedirect.com/science/article/pii/S2352340918315191

Downloaded from Kaggle.

---

## Description

The dataset contains booking information for two hotels located in Portugal:

- Resort Hotel
- City Hotel

The records span from:

- July 2015
- August 2017

Each row represents a single hotel booking.

The dataset contains customer booking behavior, reservation details, stay information, pricing information, and booking outcomes.

---

# Dataset Statistics

| Property | Value |
|-----------|------:|
| Number of Rows | 119,390 |
| Number of Columns | 32 |
| Missing Columns | company, agent, country, children |
| Duplicate Rows | 31,994 |

---

# Project Goal

The objective of this project is to build an AI-powered revenue management platform capable of recommending optimal hotel room prices using historical booking behavior and dynamic pricing techniques.

The machine learning model will learn patterns from historical bookings and predict the expected room price (ADR).

---

# Target Variable

## ADR (Average Daily Rate)

Column:

```text
adr
```

Description:

ADR represents the average price paid per room per night.

This will be the target variable that the machine learning model will predict.

---

# Candidate Features (Version 1)

The following features are selected because they are available before a booking is finalized and can reasonably influence room pricing.

| Feature | Reason |
|----------|--------|
| hotel | Different hotel types have different pricing behavior |
| lead_time | Advance booking time strongly affects price |
| arrival_date_year | Captures yearly trends |
| arrival_date_month | Captures seasonality |
| arrival_date_week_number | Captures seasonal demand |
| arrival_date_day_of_month | Captures monthly demand patterns |
| stays_in_weekend_nights | Weekend stays often have different pricing |
| stays_in_week_nights | Longer stays influence pricing |
| adults | Occupancy affects price |
| children | Occupancy affects price |
| babies | Occupancy affects price |
| meal | Meal package affects room price |
| market_segment | Booking source influences pricing |
| distribution_channel | Different sales channels behave differently |
| is_repeated_guest | Loyalty may influence booking patterns |
| previous_cancellations | Customer history |
| previous_bookings_not_canceled | Customer reliability |
| reserved_room_type | Requested room category |
| assigned_room_type | Actual assigned room |
| booking_changes | Indicates booking modifications |
| deposit_type | Booking commitment level |
| days_in_waiting_list | Indicates demand |
| customer_type | Customer classification |
| required_car_parking_spaces | Indicates travel profile |
| total_of_special_requests | Demand and customer preferences |

---

# Features Excluded (Version 1)

The following columns will not be used in the first machine learning model.

## company

Reason:

Approximately 94% of values are missing.

The feature contributes very little information.

---

## agent

Reason:

Large number of missing values.

Will be considered in future versions if needed.

---

## country

Reason:

Contains missing values.

Large number of unique categories (177).

Can be added later after proper encoding.

---

## reservation_status

Reason:

Contains information that is only known after the booking outcome.

Using it would introduce data leakage.

---

## reservation_status_date

Reason:

Represents information available after booking completion.

Would leak future information into the model.

---

# Data Quality Observations

During the initial exploration the following observations were made.

## Missing Values

| Column | Missing Values |
|----------|--------------:|
| company | 112593 |
| agent | 16340 |
| country | 488 |
| children | 4 |

---

## Duplicate Records

31,994 duplicate rows were detected.

These duplicates will be investigated before removal because multiple bookings may legitimately share identical attributes.

---

## ADR Observations

Minimum ADR:

```text
-6.38
```

Maximum ADR:

```text
5400
```

Average ADR:

```text
101.83
```

Negative ADR values are invalid and will be removed during preprocessing.

Extremely large ADR values will be investigated as potential outliers before deciding whether to keep, cap, or remove them.

---

# Planned Data Cleaning Strategy

Version 1 preprocessing will include:

- Remove invalid ADR values
- Handle missing values
- Remove unused columns
- Validate data types
- Investigate duplicate records
- Preserve the original raw dataset

---

# Next Step

The next phase is implementing the preprocessing pipeline (`clean_data.py`) based on the decisions documented in this file.