import React from "react";

interface VegBadgeProps {
  isVeg: boolean;
  className?: string;
  showText?: boolean;
}

export default function VegBadge({ isVeg, className = "", showText = false }: VegBadgeProps) {
  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      {isVeg ? (
        <span className="fssai-box fssai-veg" title="100% Pure Vegetarian">
          <span className="fssai-veg-dot" />
        </span>
      ) : (
        <span className="fssai-box fssai-nonveg" title="Non-Vegetarian">
          <span className="fssai-nonveg-dot" />
        </span>
      )}
      {showText && (
        <span className={`text-xs font-medium tracking-wide ${isVeg ? "text-emerald-700" : "text-rose-700"}`}>
          {isVeg ? "Pure Veg" : "Non-Veg"}
        </span>
      )}
    </div>
  );
}
