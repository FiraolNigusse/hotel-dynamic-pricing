import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getPredictions, updatePrediction, deletePrediction } from "../api/predictions";
import { formatPrice } from "../utils/formatPrice";
import { SkeletonTable } from "../components/Skeleton";
import EditModal from "../components/EditModal";
import ConfirmDialog from "../components/ConfirmDialog";
import Alert from "../components/Alert";

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
  const [editingPrediction, setEditingPrediction] = useState(null);
  const [deletingPrediction, setDeletingPrediction] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [notification, setNotification] = useState(null);

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

  async function handleUpdate(payload) {
    const data = await updatePrediction(editingPrediction.id, payload);
    setPredictions((prev) =>
      prev.map((p) =>
        p.id === editingPrediction.id
          ? { ...p, ...payload, predicted_price: data.predicted_price }
          : p,
      ),
    );
    setEditingPrediction(null);
  }

  async function handleDelete() {
    setDeleteLoading(true);
    try {
      await deletePrediction(deletingPrediction.id);
      setPredictions((prev) => prev.filter((p) => p.id !== deletingPrediction.id));
      setDeletingPrediction(null);
      setNotification(`Prediction #${deletingPrediction.id} deleted.`);
      setTimeout(() => setNotification(null), 4000);
    } catch (err) {
      const detail = err.response?.data?.detail;
      setDeletingPrediction(null);
      setError(typeof detail === "string" ? detail : "Failed to delete prediction.");
    } finally {
      setDeleteLoading(false);
    }
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
            <Link
              to="/"
              className="rounded-lg px-3.5 py-1.5 text-xs font-medium text-gray-500 transition-colors hover:text-gray-900"
            >
              Predict
            </Link>
            <span className="rounded-lg bg-white px-3.5 py-1.5 text-xs font-semibold text-gray-900 shadow-sm">
              History
            </span>
          </nav>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Page header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              Prediction History
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              {predictions === null
                ? "Loading predictions..."
                : `${predictions.length} prediction${predictions.length !== 1 ? "s" : ""} total`}
            </p>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-6">
            <Alert type="error" message={error} onClose={() => setError(null)} />
          </div>
        )}

        {/* Content card */}
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
          {predictions === null && !error && (
            <div className="p-6">
              <SkeletonTable rows={6} cols={6} />
            </div>
          )}

          {predictions !== null && predictions.length === 0 && (
            <div className="py-16 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
                <svg className="h-7 w-7 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-sm font-medium text-gray-900">No predictions yet</p>
              <p className="mt-1 text-sm text-gray-500">
                Make a prediction to see it here.
              </p>
              <Link
                to="/"
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-blue-600/25 transition-all hover:bg-blue-700 hover:shadow-md hover:shadow-blue-600/30"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                New Prediction
              </Link>
            </div>
          )}

          {predictions !== null && predictions.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/80 text-xs font-semibold uppercase tracking-wider text-gray-500">
                    <th className="px-6 py-3.5">ID</th>
                    <th className="px-6 py-3.5 text-right">Price</th>
                    <th className="px-6 py-3.5">Market Segment</th>
                    <th className="px-6 py-3.5">Room Type</th>
                    <th className="px-6 py-3.5">Created At</th>
                    <th className="px-6 py-3.5 text-right"><span className="sr-only">Actions</span></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {predictions.map((p) => (
                    <tr key={p.id} className="transition-colors hover:bg-gray-50/60">
                      <td className="whitespace-nowrap px-6 py-4 font-semibold text-gray-900">
                        #{p.id}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-bold text-emerald-600">
                        {formatPrice(p.predicted_price)}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-gray-600">
                        <span className="inline-flex items-center rounded-lg bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
                          {p.market_segment}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-gray-600">
                        <span className="inline-flex items-center rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                          {p.reserved_room_type}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-xs text-gray-500">
                        {formatDate(p.created_at)}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setEditingPrediction(p)}
                            className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-50 hover:shadow"
                          >
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                            </svg>
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeletingPrediction(p)}
                            className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-600 shadow-sm transition-all hover:bg-red-50 hover:shadow"
                          >
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                            </svg>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {editingPrediction && (
        <EditModal
          prediction={editingPrediction}
          onClose={() => setEditingPrediction(null)}
          onSubmit={handleUpdate}
        />
      )}

      {deletingPrediction && (
        <ConfirmDialog
          title={`Delete Prediction #${deletingPrediction.id}?`}
          message="This action cannot be undone. The prediction will be permanently removed."
          confirmLabel="Delete"
          loading={deleteLoading}
          onConfirm={handleDelete}
          onCancel={() => setDeletingPrediction(null)}
        />
      )}

      {notification && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl border border-green-200 bg-white px-5 py-3.5 text-sm text-green-700 shadow-lg shadow-green-900/5">
          <svg className="h-5 w-5 shrink-0 text-green-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="font-medium">{notification}</span>
        </div>
      )}
    </div>
  );
}

export default History;
