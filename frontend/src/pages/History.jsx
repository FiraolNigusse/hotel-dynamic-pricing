import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getPredictions } from "../api/predictions";
import { formatPrice } from "../utils/formatPrice";
import LoadingSpinner from "../components/LoadingSpinner";

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function History() {
  const [predictions, setPredictions] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const data = await getPredictions();
        if (!cancelled) setPredictions(data);
      } catch (err) {
        if (!cancelled) {
          const detail = err.response?.data?.detail;
          setError(typeof detail === "string" ? detail : "Failed to load predictions.");
        }
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <h1 className="text-xl font-bold text-gray-900">
            Hotel Dynamic Pricing
          </h1>
          <nav className="flex items-center gap-4">
            <Link to="/" className="text-sm text-gray-500 hover:text-gray-900">
              Predict
            </Link>
            <span className="text-sm font-medium text-gray-900">History</span>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Prediction History
          </h2>

          {predictions === null && !error && (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          )}

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {predictions !== null && predictions.length === 0 && (
            <p className="py-12 text-center text-sm text-gray-500">
              No predictions yet.{" "}
              <Link to="/" className="font-medium text-blue-600 hover:underline">
                Make a prediction
              </Link>{" "}
              to get started.
            </p>
          )}

          {predictions !== null && predictions.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-xs font-medium uppercase tracking-wider text-gray-500">
                    <th className="px-4 py-3">ID</th>
                    <th className="px-4 py-3 text-right">Price</th>
                    <th className="px-4 py-3">Market Segment</th>
                    <th className="px-4 py-3">Room Type</th>
                    <th className="px-4 py-3">Created At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {predictions.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {p.id}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-green-700">
                        {formatPrice(p.predicted_price)}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {p.market_segment}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {p.reserved_room_type}
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {formatDate(p.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default History;
