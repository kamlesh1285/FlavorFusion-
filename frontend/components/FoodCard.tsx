"use client";

import { useState } from "react";
import VegBadge from "./VegBadge";
import SpiceMeter from "./SpiceMeter";
import { resolveImageUrl, type Food } from "@/lib/api";

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
    <div className="bg-white rounded-2xl border border-amber-900/10 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col group hover:-translate-y-1">
      {/* Dish Image Banner */}
      <div className="h-44 bg-neutral-900 relative overflow-hidden flex items-center justify-center">
        {imageSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageSrc}
            alt={food.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-tr from-amber-950 via-neutral-900 to-orange-900 flex items-center justify-center p-4 text-center">
            <span className="font-serif text-4xl text-amber-400/60 font-bold italic">
              {food.name.charAt(0)}
            </span>
          </div>
        )}

        {/* FSSAI Veg Badge overlay */}
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2 py-1 rounded-md shadow">
          <VegBadge isVeg={food.isVeg} showText={true} />
        </div>

        {/* Category Pill */}
        {food.category?.name && (
          <div className="absolute top-3 right-3 bg-neutral-950/80 text-amber-300 text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full border border-amber-500/20 backdrop-blur-md">
            {food.category.name}
          </div>
        )}

        {/* Sold out overlay */}
        {outOfStock && (
          <div className="absolute inset-0 bg-neutral-950/80 backdrop-blur-sm flex items-center justify-center">
            <span className="px-3 py-1 bg-rose-600 text-white font-mono text-xs tracking-wider rounded-md font-bold uppercase shadow">
              Sold Out
            </span>
          </div>
        )}
      </div>

      {/* Dish Details */}
      <div className="p-4 flex flex-col flex-1 justify-between bg-gradient-to-b from-amber-50/30 to-white">
        <div>
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <h3 className="font-serif text-base font-bold text-neutral-900 group-hover:text-amber-700 transition-colors line-clamp-1">
              {food.name}
            </h3>
          </div>

          <p className="text-neutral-600 text-xs line-clamp-2 leading-relaxed mb-3">
            {food.description || "Authentic Indian delicacy prepared with traditional spices."}
          </p>

          <div className="flex items-center justify-between gap-2 text-xs border-t border-amber-900/10 pt-2.5 mb-3">
            <SpiceMeter dishName={food.name} />
            {food.preparationTime ? (
              <span className="text-[11px] text-neutral-500 font-medium flex items-center gap-1">
                ⏱️ {food.preparationTime} mins
              </span>
            ) : null}
          </div>
        </div>

        {/* Pricing & Add Button */}
        <div className="flex items-center justify-between pt-2 border-t border-neutral-100">
          <div>
            <span className="text-[10px] text-neutral-400 font-mono uppercase tracking-wider block">Price</span>
            <span className="text-lg font-bold text-amber-800">
              ₹{Number(food.price).toFixed(0)}
            </span>
          </div>

          <button
            onClick={handleAdd}
            disabled={disabled || outOfStock || status === "adding"}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 flex items-center gap-1 ${
              status === "added"
                ? "bg-emerald-600 text-white"
                : outOfStock
                ? "bg-neutral-200 text-neutral-400 cursor-not-allowed shadow-none"
                : "bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white"
            }`}
          >
            {status === "adding" && "Adding..."}
            {status === "added" && "Added ✓"}
            {status === "error" && "Try Again"}
            {status === "idle" && (outOfStock ? "Unavailable" : "+ Add to Feast")}
          </button>
        </div>
      </div>
    </div>
  );
}
