import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import PredictionForm from "../components/PredictionForm";
import PriceCard from "../components/PriceCard";
import { getPredictions } from "../api/predictions";
import { formatPrice } from "../utils/formatPrice";
import Skeleton from "../components/Skeleton";

function Home() {
  const [predictedPrice, setPredictedPrice] = useState(null);
  const [latestPrediction, setLatestPrediction] = useState(null);
  const [history, setHistory] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function loadHistory() {
      try {
        const data = await getPredictions();
        if (!cancelled) setHistory(data);
      } catch {
        if (!cancelled) setHistory([]);
      }
    }

    loadHistory();

    return () => {
      cancelled = true;
    };
  }, []);

  function handlePrediction(data) {
    setPredictedPrice(data.predicted_price);
    setLatestPrediction(data);

    async function refresh() {
      try {
        const data = await getPredictions();
        setHistory(data);
      } catch {
        // Non-critical
      }
    }

    refresh();
  }

  return (
    <div className="min-h-screen bg-gray-50/80">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/80 backdrop-blur-lg">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-sm font-bold text-white">
              HP
            </div>
            <div>
              <h1 className="text-base font-bold text-gray-900 leading-tight">
                Hotel Dynamic Pricing
              </h1>
              <p className="text-xs text-gray-500">Price Predictor</p>
            </div>
          </div>
          <nav className="flex items-center gap-1 rounded-xl bg-gray-100 p-1">
            <span className="rounded-lg bg-white px-3.5 py-1.5 text-xs font-semibold text-gray-900 shadow-sm">
              Predict
            </span>
            <Link
              to="/history"
              className="rounded-lg px-3.5 py-1.5 text-xs font-medium text-gray-500 transition-colors hover:text-gray-900"
            >
              History
            </Link>
          </nav>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Stats row */}
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
              Total Predictions
            </p>
            {history === null ? (
              <Skeleton className="mt-2 h-8 w-16" />
            ) : (
              <p className="mt-2 text-2xl font-bold text-gray-900">
                {history.length}
              </p>
            )}
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
              Latest Price
            </p>
            {predictedPrice !== null ? (
              <p className="mt-2 text-2xl font-bold text-emerald-600">
                {formatPrice(predictedPrice)}
              </p>
            ) : history === null ? (
              <Skeleton className="mt-2 h-8 w-20" />
            ) : history.length > 0 ? (
              <p className="mt-2 text-2xl font-bold text-gray-900">
                {formatPrice(history[0].predicted_price)}
              </p>
            ) : (
              <p className="mt-2 text-2xl font-bold text-gray-300">--</p>
            )}
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
              Avg. Lead Time
            </p>
            {history === null ? (
              <Skeleton className="mt-2 h-8 w-16" />
            ) : history.length > 0 ? (
              <p className="mt-2 text-2xl font-bold text-gray-900">
                {Math.round(
                  history.reduce((s, p) => s + p.lead_time, 0) / history.length,
                )}{" "}
                <span className="text-sm font-normal text-gray-400">days</span>
              </p>
            ) : (
              <p className="mt-2 text-2xl font-bold text-gray-300">--</p>
            )}
          </div>
        </div>

        {/* Two-column layout */}
        <div className="grid gap-8 xl:grid-cols-5">
          {/* Prediction Form */}
          <section className="xl:col-span-3">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="mb-6">
                <h2 className="text-lg font-bold text-gray-900">
                  New Prediction
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Fill in the booking details to get a price estimate.
                </p>
              </div>
              <PredictionForm onPrediction={handlePrediction} />
            </div>
          </section>

          {/* Sidebar */}
          <section className="space-y-6 xl:col-span-2">
            <PriceCard prediction={latestPrediction} />

            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-base font-bold text-gray-900">
                  Recent Predictions
                </h2>
                {history !== null && history.length > 0 && (
                  <Link
                    to="/history"
                    className="text-xs font-medium text-blue-600 hover:text-blue-700"
                  >
                    View all
                  </Link>
                )}
              </div>

              {history === null ? (
                <div className="space-y-3">
                  {Array.from({ length: 4 }, (_, i) => (
                    <div key={i} className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50/50 p-3.5">
                      <div className="space-y-2">
                        <Skeleton className="h-3.5 w-24" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                      <Skeleton className="h-4 w-16" />
                    </div>
                  ))}
                </div>
              ) : history.length === 0 ? (
                <div className="py-10 text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                    <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-500">
                    No predictions yet.
                  </p>
                  <p className="mt-1 text-xs text-gray-400">
                    Submit the form to get started.
                  </p>
                </div>
              ) : (
                <ul className="space-y-2">
                  {history.slice(0, 8).map((p) => (
                    <li
                      key={p.id}
                      className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50/50 px-4 py-3 transition-colors hover:bg-gray-50"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {p.arrival_date_month}
                        </p>
                        <p className="mt-0.5 text-xs text-gray-500">
                          {p.country} &middot; {p.market_segment}
                        </p>
                      </div>
                      <span className="text-sm font-bold text-emerald-600">
                        {formatPrice(p.predicted_price)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default Home;
