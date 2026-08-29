"use client";

import React, { useState } from "react";
import { Food } from "@/lib/api";
import { useCart } from "@/lib/cart-context";
import { useAuth } from "@/lib/auth-context";

interface ThaliBuilderProps {
  foods: Food[];
}

export default function ThaliBuilder({ foods }: ThaliBuilderProps) {
  const { addToCart } = useCart();
  const { user } = useAuth();

  const mainCurries = foods.filter((f) => f.category?.name.toLowerCase().includes("main") || f.category?.name.toLowerCase().includes("starter"));
  const breads = foods.filter((f) => f.category?.name.toLowerCase().includes("bread") || f.name.toLowerCase().includes("naan") || f.name.toLowerCase().includes("roti"));
  const sweets = foods.filter((f) => f.category?.name.toLowerCase().includes("sweet") || f.category?.name.toLowerCase().includes("dessert"));

  const [selectedCurry, setSelectedCurry] = useState<Food | null>(mainCurries[0] || null);
  const [selectedBread, setSelectedBread] = useState<Food | null>(breads[0] || null);
  const [selectedSweet, setSelectedSweet] = useState<Food | null>(sweets[0] || null);
  const [added, setAdded] = useState(false);

  const totalPrice = (
    (selectedCurry ? parseFloat(selectedCurry.price) : 0) +
    (selectedBread ? parseFloat(selectedBread.price) : 0) +
    (selectedSweet ? parseFloat(selectedSweet.price) : 0)
  ).toFixed(2);

  const handleAddThaliToCart = async () => {
    if (!user) {
      window.location.href = "/login";
      return;
    }
    if (selectedCurry) await addToCart(selectedCurry.id, 1);
    if (selectedBread) await addToCart(selectedBread.id, 1);
    if (selectedSweet) await addToCart(selectedSweet.id, 1);

    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  };

  return (
    <div className="bg-gradient-to-br from-amber-950 via-neutral-900 to-amber-900 text-amber-50 rounded-3xl p-6 md:p-8 shadow-2xl border border-amber-500/20 relative overflow-hidden my-12">
      {/* Decorative brass mandala backdrop */}
      <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full border border-amber-500/10 animate-spin-slow pointer-events-none" />
      
      <div className="relative z-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <span className="inline-block px-3 py-1 bg-amber-500/20 border border-amber-400/30 rounded-full text-amber-300 text-xs font-semibold tracking-wider uppercase mb-2">
              👑 Royal Thali Creator
            </span>
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-amber-100">
              Customize Your Shahi Feast
            </h2>
            <p className="text-amber-200/70 text-sm mt-1">
              Select your favorite Curry, Naan, and Mithai to craft a complete Indian Thali experience.
            </p>
          </div>

          <div className="bg-neutral-950/60 backdrop-blur border border-amber-500/30 px-5 py-3 rounded-2xl flex items-center justify-between gap-4">
            <div>
              <p className="text-xs text-amber-300/60 uppercase tracking-widest font-mono">Thali Total</p>
              <p className="text-2xl font-bold text-amber-400">₹{totalPrice}</p>
            </div>
            <button
              onClick={handleAddThaliToCart}
              className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-neutral-950 font-bold px-5 py-2.5 rounded-xl transition-all shadow-lg active:scale-95 text-sm"
            >
              {added ? "✅ Added to Thali!" : "🛒 Order Royal Thali"}
            </button>
          </div>
        </div>

        {/* Step Selectors */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Step 1: Curry */}
          <div className="bg-neutral-900/80 border border-amber-500/15 rounded-2xl p-4">
            <h3 className="text-sm font-semibold text-amber-300 mb-3 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-amber-500/20 border border-amber-400 text-amber-300 flex items-center justify-center text-xs">1</span>
              Choose Main Curry / Starter
            </h3>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {mainCurries.slice(0, 5).map((food) => (
                <button
                  key={food.id}
                  onClick={() => setSelectedCurry(food)}
                  className={`w-full text-left p-2.5 rounded-xl border text-xs transition-all flex items-center justify-between ${
                    selectedCurry?.id === food.id
                      ? "bg-amber-500/20 border-amber-400 text-amber-200"
                      : "bg-neutral-950/40 border-neutral-800 text-neutral-300 hover:border-neutral-700"
                  }`}
                >
                  <span className="font-medium truncate">{food.name}</span>
                  <span className="font-semibold text-amber-400 ml-2">₹{food.price}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Step 2: Breads */}
          <div className="bg-neutral-900/80 border border-amber-500/15 rounded-2xl p-4">
            <h3 className="text-sm font-semibold text-amber-300 mb-3 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-amber-500/20 border border-amber-400 text-amber-300 flex items-center justify-center text-xs">2</span>
              Choose Tandoori Bread
            </h3>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {breads.slice(0, 5).map((food) => (
                <button
                  key={food.id}
                  onClick={() => setSelectedBread(food)}
                  className={`w-full text-left p-2.5 rounded-xl border text-xs transition-all flex items-center justify-between ${
                    selectedBread?.id === food.id
                      ? "bg-amber-500/20 border-amber-400 text-amber-200"
                      : "bg-neutral-950/40 border-neutral-800 text-neutral-300 hover:border-neutral-700"
                  }`}
                >
                  <span className="font-medium truncate">{food.name}</span>
                  <span className="font-semibold text-amber-400 ml-2">₹{food.price}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Step 3: Sweet */}
          <div className="bg-neutral-900/80 border border-amber-500/15 rounded-2xl p-4">
            <h3 className="text-sm font-semibold text-amber-300 mb-3 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-amber-500/20 border border-amber-400 text-amber-300 flex items-center justify-center text-xs">3</span>
              Choose Indian Sweet (Mithai)
            </h3>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {sweets.slice(0, 5).map((food) => (
                <button
                  key={food.id}
                  onClick={() => setSelectedSweet(food)}
                  className={`w-full text-left p-2.5 rounded-xl border text-xs transition-all flex items-center justify-between ${
                    selectedSweet?.id === food.id
                      ? "bg-amber-500/20 border-amber-400 text-amber-200"
                      : "bg-neutral-950/40 border-neutral-800 text-neutral-300 hover:border-neutral-700"
                  }`}
                >
                  <span className="font-medium truncate">{food.name}</span>
                  <span className="font-semibold text-amber-400 ml-2">₹{food.price}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
