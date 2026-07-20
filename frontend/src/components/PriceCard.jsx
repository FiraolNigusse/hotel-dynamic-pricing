import { formatPrice } from "../utils/formatPrice";

function PriceCard({ price }) {
  if (price === null) return null;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-green-50 p-6 text-center shadow-sm">
      <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-emerald-100/60" />
      <div className="absolute -bottom-4 -left-4 h-16 w-16 rounded-full bg-green-100/40" />
      <div className="relative">
        <p className="text-xs font-semibold uppercase tracking-widest text-emerald-600">
          Predicted Price
        </p>
        <p className="mt-3 text-4xl font-extrabold tracking-tight text-emerald-900">
          {formatPrice(price)}
        </p>
        <p className="mt-1 text-xs font-medium text-emerald-500">per night</p>
      </div>
    </div>
  );
}

export default PriceCard;
