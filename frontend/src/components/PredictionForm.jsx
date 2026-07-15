import { useState } from "react";
import { createPrediction } from "../api/predictions";
import { MONTHS } from "../constants/months";
import { COUNTRIES } from "../constants/countries";
import LoadingSpinner from "./LoadingSpinner";

const MEAL_OPTIONS = ["BB", "HB", "FB", "SC", "Undefined"];
const MARKET_SEGMENT_OPTIONS = [
  "Online TA",
  "Offline TA/TO",
  "Direct",
  "Corporate",
  "Groups",
  "Complementary",
  "Aviation",
  "Undefined",
];
const DISTRIBUTION_CHANNEL_OPTIONS = [
  "TA/TO",
  "Direct",
  "Corporate",
  "GDS",
  "Undefined",
];
const ROOM_TYPE_OPTIONS = ["A", "B", "C", "D", "E", "F", "G", "H", "L"];
const DEPOSIT_TYPE_OPTIONS = ["No Deposit", "Non Refund", "Refundable"];
const CUSTOMER_TYPE_OPTIONS = [
  "Transient",
  "Transient-Party",
  "Contract",
  "Group",
];

const INITIAL_FORM = {
  lead_time: "",
  arrival_date_month: "January",
  stays_in_weekend_nights: "",
  stays_in_week_nights: "",
  adults: "",
  children: "",
  babies: "",
  meal: "BB",
  country: "PRT",
  market_segment: "Online TA",
  distribution_channel: "TA/TO",
  reserved_room_type: "A",
  booking_changes: "",
  deposit_type: "No Deposit",
  customer_type: "Transient",
  total_of_special_requests: "",
};

const NUMERIC_FIELDS = [
  "lead_time",
  "stays_in_weekend_nights",
  "stays_in_week_nights",
  "adults",
  "babies",
  "booking_changes",
  "total_of_special_requests",
];

function PredictionForm({ onPrediction }) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState(null);
  const [loading, setLoading] = useState(false);

  function validate() {
    const next = {};

    for (const field of NUMERIC_FIELDS) {
      const val = form[field];
      if (val === "" || val === null || val === undefined) {
        next[field] = "Required";
      } else if (!Number.isInteger(Number(val)) || Number(val) < 0) {
        next[field] = "Must be a non-negative integer";
      }
    }

    const childrenVal = form.children;
    if (childrenVal === "" || childrenVal === null || childrenVal === undefined) {
      next.children = "Required";
    } else if (isNaN(Number(childrenVal)) || Number(childrenVal) < 0) {
      next.children = "Must be a non-negative number";
    }

    if (Number(form.adults) < 1) {
      next.adults = "At least 1 adult required";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
    setServerError(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setServerError(null);

    if (!validate()) return;

    setLoading(true);
    try {
      const payload = {
        lead_time: Number(form.lead_time),
        arrival_date_month: form.arrival_date_month,
        stays_in_weekend_nights: Number(form.stays_in_weekend_nights),
        stays_in_week_nights: Number(form.stays_in_week_nights),
        adults: Number(form.adults),
        children: Number(form.children),
        babies: Number(form.babies),
        meal: form.meal,
        country: form.country,
        market_segment: form.market_segment,
        distribution_channel: form.distribution_channel,
        reserved_room_type: form.reserved_room_type,
        booking_changes: Number(form.booking_changes),
        deposit_type: form.deposit_type,
        customer_type: form.customer_type,
        total_of_special_requests: Number(form.total_of_special_requests),
      };

      const data = await createPrediction(payload);
      onPrediction(data.predicted_price);
    } catch (err) {
      const detail = err.response?.data?.detail;
      if (Array.isArray(detail)) {
        const msgs = detail.map((d) => d.msg).join("; ");
        setServerError(msgs);
      } else if (typeof detail === "string") {
        setServerError(detail);
      } else {
        setServerError("Prediction failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  function fieldError(name) {
    if (!errors[name]) return null;
    return (
      <p className="mt-1 text-xs text-red-600">{errors[name]}</p>
    );
  }

  function inputClasses(name) {
    const base =
      "w-full rounded-lg border px-3 py-2 text-sm outline-none transition-colors";
    const ring = errors[name]
      ? "border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-500"
      : "border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500";
    return `${base} ${ring}`;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {serverError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {serverError}
        </div>
      )}

      <fieldset disabled={loading}>
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Lead Time */}
          <div>
            <label htmlFor="lead_time" className="mb-1 block text-sm font-medium text-gray-700">
              Lead Time (days)
            </label>
            <input
              id="lead_time"
              name="lead_time"
              type="number"
              min="0"
              value={form.lead_time}
              onChange={handleChange}
              className={inputClasses("lead_time")}
            />
            {fieldError("lead_time")}
          </div>

          {/* Arrival Month */}
          <div>
            <label htmlFor="arrival_date_month" className="mb-1 block text-sm font-medium text-gray-700">
              Arrival Month
            </label>
            <select
              id="arrival_date_month"
              name="arrival_date_month"
              value={form.arrival_date_month}
              onChange={handleChange}
              className={inputClasses("arrival_date_month")}
            >
              {MONTHS.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          {/* Weekend Nights */}
          <div>
            <label htmlFor="stays_in_weekend_nights" className="mb-1 block text-sm font-medium text-gray-700">
              Weekend Nights
            </label>
            <input
              id="stays_in_weekend_nights"
              name="stays_in_weekend_nights"
              type="number"
              min="0"
              value={form.stays_in_weekend_nights}
              onChange={handleChange}
              className={inputClasses("stays_in_weekend_nights")}
            />
            {fieldError("stays_in_weekend_nights")}
          </div>

          {/* Week Nights */}
          <div>
            <label htmlFor="stays_in_week_nights" className="mb-1 block text-sm font-medium text-gray-700">
              Week Nights
            </label>
            <input
              id="stays_in_week_nights"
              name="stays_in_week_nights"
              type="number"
              min="0"
              value={form.stays_in_week_nights}
              onChange={handleChange}
              className={inputClasses("stays_in_week_nights")}
            />
            {fieldError("stays_in_week_nights")}
          </div>

          {/* Adults */}
          <div>
            <label htmlFor="adults" className="mb-1 block text-sm font-medium text-gray-700">
              Adults
            </label>
            <input
              id="adults"
              name="adults"
              type="number"
              min="1"
              value={form.adults}
              onChange={handleChange}
              className={inputClasses("adults")}
            />
            {fieldError("adults")}
          </div>

          {/* Children */}
          <div>
            <label htmlFor="children" className="mb-1 block text-sm font-medium text-gray-700">
              Children
            </label>
            <input
              id="children"
              name="children"
              type="number"
              min="0"
              step="0.1"
              value={form.children}
              onChange={handleChange}
              className={inputClasses("children")}
            />
            {fieldError("children")}
          </div>

          {/* Babies */}
          <div>
            <label htmlFor="babies" className="mb-1 block text-sm font-medium text-gray-700">
              Babies
            </label>
            <input
              id="babies"
              name="babies"
              type="number"
              min="0"
              value={form.babies}
              onChange={handleChange}
              className={inputClasses("babies")}
            />
            {fieldError("babies")}
          </div>

          {/* Meal */}
          <div>
            <label htmlFor="meal" className="mb-1 block text-sm font-medium text-gray-700">
              Meal
            </label>
            <select
              id="meal"
              name="meal"
              value={form.meal}
              onChange={handleChange}
              className={inputClasses("meal")}
            >
              {MEAL_OPTIONS.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          {/* Country */}
          <div>
            <label htmlFor="country" className="mb-1 block text-sm font-medium text-gray-700">
              Country
            </label>
            <select
              id="country"
              name="country"
              value={form.country}
              onChange={handleChange}
              className={inputClasses("country")}
            >
              {COUNTRIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Market Segment */}
          <div>
            <label htmlFor="market_segment" className="mb-1 block text-sm font-medium text-gray-700">
              Market Segment
            </label>
            <select
              id="market_segment"
              name="market_segment"
              value={form.market_segment}
              onChange={handleChange}
              className={inputClasses("market_segment")}
            >
              {MARKET_SEGMENT_OPTIONS.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          {/* Distribution Channel */}
          <div>
            <label htmlFor="distribution_channel" className="mb-1 block text-sm font-medium text-gray-700">
              Distribution Channel
            </label>
            <select
              id="distribution_channel"
              name="distribution_channel"
              value={form.distribution_channel}
              onChange={handleChange}
              className={inputClasses("distribution_channel")}
            >
              {DISTRIBUTION_CHANNEL_OPTIONS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {/* Reserved Room Type */}
          <div>
            <label htmlFor="reserved_room_type" className="mb-1 block text-sm font-medium text-gray-700">
              Room Type
            </label>
            <select
              id="reserved_room_type"
              name="reserved_room_type"
              value={form.reserved_room_type}
              onChange={handleChange}
              className={inputClasses("reserved_room_type")}
            >
              {ROOM_TYPE_OPTIONS.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          {/* Booking Changes */}
          <div>
            <label htmlFor="booking_changes" className="mb-1 block text-sm font-medium text-gray-700">
              Booking Changes
            </label>
            <input
              id="booking_changes"
              name="booking_changes"
              type="number"
              min="0"
              value={form.booking_changes}
              onChange={handleChange}
              className={inputClasses("booking_changes")}
            />
            {fieldError("booking_changes")}
          </div>

          {/* Deposit Type */}
          <div>
            <label htmlFor="deposit_type" className="mb-1 block text-sm font-medium text-gray-700">
              Deposit Type
            </label>
            <select
              id="deposit_type"
              name="deposit_type"
              value={form.deposit_type}
              onChange={handleChange}
              className={inputClasses("deposit_type")}
            >
              {DEPOSIT_TYPE_OPTIONS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {/* Customer Type */}
          <div>
            <label htmlFor="customer_type" className="mb-1 block text-sm font-medium text-gray-700">
              Customer Type
            </label>
            <select
              id="customer_type"
              name="customer_type"
              value={form.customer_type}
              onChange={handleChange}
              className={inputClasses("customer_type")}
            >
              {CUSTOMER_TYPE_OPTIONS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Special Requests */}
          <div>
            <label htmlFor="total_of_special_requests" className="mb-1 block text-sm font-medium text-gray-700">
              Special Requests
            </label>
            <input
              id="total_of_special_requests"
              name="total_of_special_requests"
              type="number"
              min="0"
              value={form.total_of_special_requests}
              onChange={handleChange}
              className={inputClasses("total_of_special_requests")}
            />
            {fieldError("total_of_special_requests")}
          </div>
        </div>
      </fieldset>

      <button
        type="submit"
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? (
          <>
            <LoadingSpinner size="sm" />
            Predicting...
          </>
        ) : (
          "Predict Price"
        )}
      </button>
    </form>
  );
}

export default PredictionForm;
