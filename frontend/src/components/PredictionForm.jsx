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

function buildFormValues(initialValues) {
  if (!initialValues) return INITIAL_FORM;
  return {
    lead_time: String(initialValues.lead_time),
    arrival_date_month: initialValues.arrival_date_month,
    stays_in_weekend_nights: String(initialValues.stays_in_weekend_nights),
    stays_in_week_nights: String(initialValues.stays_in_week_nights),
    adults: String(initialValues.adults),
    children: String(initialValues.children),
    babies: String(initialValues.babies),
    meal: initialValues.meal,
    country: initialValues.country,
    market_segment: initialValues.market_segment,
    distribution_channel: initialValues.distribution_channel,
    reserved_room_type: initialValues.reserved_room_type,
    booking_changes: String(initialValues.booking_changes),
    deposit_type: initialValues.deposit_type,
    customer_type: initialValues.customer_type,
    total_of_special_requests: String(initialValues.total_of_special_requests),
  };
}

function SectionHeader({ icon, label }) {
  return (
    <div className="col-span-full flex items-center gap-2 border-b border-gray-100 pb-2 pt-2">
      <span className="text-gray-400">{icon}</span>
      <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
        {label}
      </h3>
    </div>
  );
}

const STAY_ICON = (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
  </svg>
);

const GUEST_ICON = (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
  </svg>
);

const BOOKING_ICON = (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
  </svg>
);

function PredictionForm({ onPrediction, onSubmit, submitLabel, initialValues }) {
  const [form, setForm] = useState(() => buildFormValues(initialValues));
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

      if (onSubmit) {
        await onSubmit(payload);
      } else {
        const data = await createPrediction(payload);
        onPrediction(data);
      }
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
      <p className="mt-1.5 text-xs font-medium text-red-500">{errors[name]}</p>
    );
  }

  function inputClasses(name) {
    const base =
      "w-full rounded-xl border bg-gray-50 px-3.5 py-2.5 text-sm text-gray-900 outline-none transition-all placeholder:text-gray-400";
    const ring = errors[name]
      ? "border-red-300 bg-red-50 focus:border-red-500 focus:bg-white focus:ring-2 focus:ring-red-500/20"
      : "border-gray-200 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20";
    return `${base} ${ring}`;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {serverError && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <svg className="mt-0.5 h-5 w-5 shrink-0 text-red-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          <p>{serverError}</p>
        </div>
      )}

      <fieldset disabled={loading}>
        <div className="grid gap-x-4 gap-y-3 sm:grid-cols-2">
          <SectionHeader icon={STAY_ICON} label="Stay Details" />

          {/* Lead Time */}
          <div>
            <label htmlFor="lead_time" className="mb-1.5 block text-sm font-medium text-gray-700">
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
            <label htmlFor="arrival_date_month" className="mb-1.5 block text-sm font-medium text-gray-700">
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
            <label htmlFor="stays_in_weekend_nights" className="mb-1.5 block text-sm font-medium text-gray-700">
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
            <label htmlFor="stays_in_week_nights" className="mb-1.5 block text-sm font-medium text-gray-700">
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

          <SectionHeader icon={GUEST_ICON} label="Guests" />

          {/* Adults */}
          <div>
            <label htmlFor="adults" className="mb-1.5 block text-sm font-medium text-gray-700">
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
            <label htmlFor="children" className="mb-1.5 block text-sm font-medium text-gray-700">
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
            <label htmlFor="babies" className="mb-1.5 block text-sm font-medium text-gray-700">
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

          <SectionHeader icon={BOOKING_ICON} label="Booking Options" />

          {/* Meal */}
          <div>
            <label htmlFor="meal" className="mb-1.5 block text-sm font-medium text-gray-700">
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
            <label htmlFor="country" className="mb-1.5 block text-sm font-medium text-gray-700">
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
            <label htmlFor="market_segment" className="mb-1.5 block text-sm font-medium text-gray-700">
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
            <label htmlFor="distribution_channel" className="mb-1.5 block text-sm font-medium text-gray-700">
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
            <label htmlFor="reserved_room_type" className="mb-1.5 block text-sm font-medium text-gray-700">
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
            <label htmlFor="booking_changes" className="mb-1.5 block text-sm font-medium text-gray-700">
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
            <label htmlFor="deposit_type" className="mb-1.5 block text-sm font-medium text-gray-700">
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
            <label htmlFor="customer_type" className="mb-1.5 block text-sm font-medium text-gray-700">
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
            <label htmlFor="total_of_special_requests" className="mb-1.5 block text-sm font-medium text-gray-700">
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
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm shadow-blue-600/25 transition-all hover:bg-blue-700 hover:shadow-md hover:shadow-blue-600/30 active:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
      >
        {loading ? (
          <>
            <LoadingSpinner size="sm" />
            {onSubmit ? "Saving..." : "Predicting..."}
          </>
        ) : (
          submitLabel || "Predict Price"
        )}
      </button>
    </form>
  );
}

export default PredictionForm;
