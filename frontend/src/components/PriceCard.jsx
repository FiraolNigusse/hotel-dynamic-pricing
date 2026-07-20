import { formatPrice } from "../utils/formatPrice";

const TIER_STYLES = {
  "Very High": { bg: "bg-red-50", text: "text-red-700", border: "border-red-200", dot: "bg-red-500" },
  "High": { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200", dot: "bg-orange-500" },
  "Medium": { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", dot: "bg-amber-500" },
  "Low": { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", dot: "bg-blue-500" },
  "Very Low": { bg: "bg-slate-50", text: "text-slate-700", border: "border-slate-200", dot: "bg-slate-500" },
};

function PriceCard({ prediction }) {
  if (!prediction) return null;

  const { predicted_price, recommended_price, pricing_tier } = prediction;
  const tier = TIER_STYLES[pricing_tier] || TIER_STYLES["Medium"];

  return (
    <div className="space-y-4">
      {/* Predicted Price */}
      <div className="relative overflow-hidden rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-green-50 p-6 text-center shadow-sm">
        <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-emerald-100/60" />
        <div className="absolute -bottom-4 -left-4 h-16 w-16 rounded-full bg-green-100/40" />
        <div className="relative">
          <p className="text-xs font-semibold uppercase tracking-widest text-emerald-600">
            ML Predicted Price
          </p>
          <p className="mt-3 text-4xl font-extrabold tracking-tight text-emerald-900">
            {formatPrice(predicted_price)}
          </p>
          <p className="mt-1 text-xs font-medium text-emerald-500">per night</p>
        </div>
      </div>

      {/* Recommended Price + Tier */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
              Recommended Price
            </p>
            <p className="mt-1.5 text-2xl font-extrabold tracking-tight text-gray-900">
              {formatPrice(recommended_price)}
            </p>
          </div>
          <div className={`flex items-center gap-2 rounded-xl border ${tier.border} ${tier.bg} px-3 py-2`}>
            <span className={`h-2 w-2 rounded-full ${tier.dot}`} />
            <span className={`text-xs font-bold ${tier.text}`}>
              {pricing_tier} Demand
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PriceCard;
