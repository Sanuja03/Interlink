/**
 * UsageCell
 * Displays "used / limit" with colour-coded text based on usage percentage.
 * Shows "— / ∞" when no limit is set (unlimited).
 *
 * Props:
 *  - used  {number}  current usage count
 *  - limit {number}  maximum allowed (0 or falsy = unlimited)
 */
export default function UsageCell({ used, limit }) {
    if (!limit || limit <= 0) {
      return <span className="text-xs text-gray-400">— / ∞</span>;
    }
  
    const pct = (used / limit) * 100;
    const color =
      pct >= 90 ? "text-red-500" :
      pct >= 65 ? "text-amber-500" :
      "text-gray-700";
  
    return (
      <span className={`text-xs font-medium ${color}`}>
        {used} / {limit}
      </span>
    );
  }