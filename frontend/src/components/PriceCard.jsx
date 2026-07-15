import { formatPrice } from "../utils/formatPrice";

function PriceCard({ price }) {
  if (price === null) return null;

  return (
    <div className="rounded-2xl border border-green-200 bg-green-50 p-6 text-center">
      <p className="text-sm font-medium uppercase tracking-wide text-green-700">
        Predicted Price
      </p>
      <p className="mt-2 text-4xl font-bold text-green-900">
        {formatPrice(price)}
      </p>
      <p className="mt-1 text-sm text-green-600">per night</p>
    </div>
  );
}

export default PriceCard;
