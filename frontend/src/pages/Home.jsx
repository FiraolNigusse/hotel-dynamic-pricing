import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import PredictionForm from "../components/PredictionForm";
import PriceCard from "../components/PriceCard";
import { getPredictions } from "../api/predictions";
import { formatPrice } from "../utils/formatPrice";

function Home() {
  const [predictedPrice, setPredictedPrice] = useState(null);
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

  function handlePrediction(price) {
    setPredictedPrice(price);

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
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <h1 className="text-xl font-bold text-gray-900">
            Hotel Dynamic Pricing
          </h1>
          <nav className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-900">Predict</span>
            <Link to="/history" className="text-sm text-gray-500 hover:text-gray-900">
              History
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-5">
          <section className="lg:col-span-3">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">
                New Prediction
              </h2>
              <PredictionForm onPrediction={handlePrediction} />
            </div>
          </section>

          <section className="space-y-6 lg:col-span-2">
            <PriceCard price={predictedPrice} />

            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">
                Recent Predictions
              </h2>

              {history === null ? (
                <p className="text-sm text-gray-500">Loading...</p>
              ) : history.length === 0 ? (
                <p className="text-sm text-gray-500">
                  No predictions yet. Submit the form to get started.
                </p>
              ) : (
                <ul className="space-y-3">
                  {history.slice(0, 10).map((p) => (
                    <li
                      key={p.id}
                      className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 px-4 py-3"
                    >
                      <div className="text-sm">
                        <span className="font-medium text-gray-900">
                          {p.arrival_date_month}
                        </span>
                        <span className="ml-2 text-gray-500">
                          {p.country} &middot; {p.market_segment}
                        </span>
                      </div>
                      <span className="text-sm font-semibold text-green-700">
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
