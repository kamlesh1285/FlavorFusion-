"use client";

import { useState } from "react";
import { VegIndicator } from "./VegIndicator";
import { resolveImageUrl, type Food } from "@/lib/api";

// Decorative "tin" swatch colors — rotates per category so the grid reads
// like a shelf of different spice tins rather than one flat palette.
const SWATCHES = ["#d99a1b", "#b23a2e", "#3f6b4d", "#5b3a5c"];

function swatchFor(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return SWATCHES[hash % SWATCHES.length];
}

export function FoodCard({
  food,
  onAdd,
  disabled,
}: {
  food: Food;
  onAdd: (foodId: string) => Promise<void>;
  disabled?: boolean;
}) {
  const [status, setStatus] = useState<"idle" | "adding" | "added" | "error">(
    "idle",
  );

  const outOfStock = !food.isAvailable || food.stockQuantity <= 0;
  const swatch = swatchFor(food.category?.name ?? food.name);
  const imageSrc = resolveImageUrl(food.imageUrl);

  async function handleAdd() {
    setStatus("adding");
    try {
      await onAdd(food.id);
      setStatus("added");
      setTimeout(() => setStatus("idle"), 1400);
    } catch {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 1800);
    }
  }

  return (
    <div className="ticket-card flex flex-col overflow-hidden">
      <div
        className="h-24 flex items-center justify-center relative overflow-hidden"
        style={{ backgroundColor: swatch }}
      >
        {imageSrc ? (
          // Served from the backend's own origin, not optimizable by
          // next/image without extra remote-pattern config for local dev.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageSrc}
            alt={food.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="font-display text-3xl italic font-semibold text-paper/90">
            {food.name.charAt(0)}
          </span>
        )}
        {outOfStock && (
          <div className="absolute inset-0 bg-ink/70 flex items-center justify-center">
            <span className="font-mono text-[0.7rem] tracking-wider text-paper uppercase">
              Sold out
            </span>
          </div>
        )}
      </div>

      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center gap-2 mb-1.5">
          <VegIndicator isVeg={food.isVeg} />
          <span className="field-label">{food.category?.name}</span>
        </div>

        <h3 className="font-display text-lg font-semibold text-ink leading-snug">
          {food.name}
        </h3>

        {food.description && (
          <p className="text-ink/55 text-[0.85rem] mt-1 line-clamp-2 flex-1">
            {food.description}
          </p>
        )}

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-ink/10">
          <span className="font-mono font-semibold text-ink">
            ₹{Number(food.price).toFixed(0)}
          </span>

          <button
            onClick={handleAdd}
            disabled={disabled || outOfStock || status === "adding"}
            className="btn-primary !py-2 !px-4 text-sm disabled:!bg-ink/20"
          >
            {status === "adding" && "Adding…"}
            {status === "added" && "Added ✓"}
            {status === "error" && "Try again"}
            {status === "idle" && (outOfStock ? "Unavailable" : "Add")}
          </button>
        </div>
      </div>
    </div>
  );
}
