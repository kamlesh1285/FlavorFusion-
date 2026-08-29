import React from "react";

interface SpiceMeterProps {
  level?: number; // 1 (Mild), 2 (Medium), 3 (Spicy / Desi Tikka)
  dishName?: string;
  className?: string;
}

export default function SpiceMeter({ level = 2, dishName = "", className = "" }: SpiceMeterProps) {
  // Infer spice level based on dish name if not specified
  let inferredLevel = level;
  const lowerName = dishName.toLowerCase();
  if (lowerName.includes("sweet") || lowerName.includes("kheer") || lowerName.includes("jamun") || lowerName.includes("lassi")) {
    inferredLevel = 0; // Sweet
  } else if (lowerName.includes("tikka") || lowerName.includes("vindaloo") || lowerName.includes("spicy") || lowerName.includes("kolhapuri") || lowerName.includes("kadai")) {
    inferredLevel = 3;
  } else if (lowerName.includes("butter") || lowerName.includes("korma") || lowerName.includes("dal")) {
    inferredLevel = 1;
  }

  if (inferredLevel === 0) {
    return (
      <span className={`inline-flex items-center text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 ${className}`}>
        🍯 Sweet
      </span>
    );
  }

  return (
    <div className={`inline-flex items-center gap-0.5 text-xs font-medium text-amber-800 ${className}`} title={`Spice Level: ${inferredLevel}/3`}>
      {Array.from({ length: 3 }).map((_, i) => (
        <span key={i} className={i < inferredLevel ? "opacity-100 scale-100 transition-transform" : "opacity-25 grayscale"}>
          🌶️
        </span>
      ))}
      <span className="ml-1 text-[10px] uppercase tracking-wider font-semibold text-amber-700">
        {inferredLevel === 1 ? "Mild" : inferredLevel === 2 ? "Medium" : "Desi Tikka"}
      </span>
    </div>
  );
}
