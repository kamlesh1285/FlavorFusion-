"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { FoodCard } from "@/components/FoodCard";
import VegBadge from "@/components/VegBadge";
import ThaliBuilder from "@/components/ThaliBuilder";
import { useAuth } from "@/lib/auth-context";
import { useCart } from "@/lib/cart-context";
import { ApiError, getCategories, getFoods, type Category, type Food } from "@/lib/api";

export default function Home() {
  const router = useRouter();
  const { token } = useAuth();
  const { addToCart } = useCart();

  const [categories, setCategories] = useState<Category[]>([]);
  const [foods, setFoods] = useState<Food[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [vegOnly, setVegOnly] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setLoadError(null);
      try {
        const [categoriesRes, foodsRes] = await Promise.all([
          getCategories(),
          getFoods(),
        ]);
        if (cancelled) return;
        setCategories(categoriesRes);
        setFoods(foodsRes);
      } catch (err) {
        if (cancelled) return;
        setLoadError(
          err instanceof ApiError
            ? err.message
            : "Couldn't reach the backend API server. Make sure localhost:3001 is running.",
        );
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredFoods = useMemo(() => {
    return foods.filter((f) => {
      if (selectedCategoryId && f.categoryId !== selectedCategoryId) return false;
      if (vegOnly && !f.isVeg) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = f.name.toLowerCase().includes(q);
        const matchesDesc = f.description?.toLowerCase().includes(q) ?? false;
        const matchesCat = f.category?.name.toLowerCase().includes(q) ?? false;
        if (!matchesName && !matchesDesc && !matchesCat) return false;
      }
      return true;
    });
  }, [foods, selectedCategoryId, vegOnly, searchQuery]);

  async function handleAdd(foodId: string) {
    if (!token) {
      router.push("/login");
      throw new Error("Sign in required");
    }
    await addToCart(foodId, 1);
  }

  return (
    <div className="min-h-screen flex flex-col bg-amber-50/40 text-neutral-900">
      <Navbar />

      {/* Hero Section — Royal Taste of India */}
      <section className="bg-gradient-to-br from-neutral-950 via-neutral-900 to-amber-950 text-amber-50 border-b border-amber-500/20 relative overflow-hidden py-16 px-6 md:px-12">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 px-3.5 py-1 bg-amber-500/20 border border-amber-400/30 text-amber-300 rounded-full text-xs font-semibold uppercase tracking-wider mb-4">
              <span>👑</span>
              <span>Authentic Royal Indian Cuisine</span>
            </span>

            <h1 className="text-4xl md:text-6xl font-serif font-bold text-amber-100 leading-tight">
              Experience the True Essence of <span className="bg-gradient-to-r from-amber-300 via-orange-400 to-amber-200 bg-clip-text text-transparent">Desi Flavors</span>
            </h1>

            <p className="text-amber-200/70 text-base md:text-lg mt-4 leading-relaxed">
              From aromatic slow-cooked Dum Biryanis and buttery Paneer Masalas to freshly baked Tandoori Naans and authentic Mithai.
            </p>

            <div className="flex flex-wrap items-center gap-4 mt-8">
              <div className="flex items-center gap-2 bg-neutral-900/80 px-3.5 py-1.5 rounded-full border border-amber-500/20 text-xs">
                <VegBadge isVeg={true} showText={true} />
              </div>
              <div className="flex items-center gap-2 bg-neutral-900/80 px-3.5 py-1.5 rounded-full border border-amber-500/20 text-xs">
                <VegBadge isVeg={false} showText={true} />
              </div>
              <span className="text-xs text-amber-400/70 font-mono">
                ⚡ Express UPI & COD Accepted
              </span>
            </div>
          </div>

          {/* Quick Search & Filters Card */}
          <div className="w-full md:w-80 bg-neutral-900/90 border border-amber-500/30 p-5 rounded-2xl backdrop-blur-md shadow-2xl">
            <h2 className="text-sm font-semibold text-amber-300 uppercase tracking-wider mb-3">
              🔍 Find Your Craving
            </h2>

            <div className="space-y-3">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Biryani, Paneer, Naan..."
                className="w-full bg-neutral-950 border border-amber-500/30 rounded-xl px-3.5 py-2.5 text-xs text-amber-100 placeholder-neutral-500 focus:outline-none focus:border-amber-400"
              />

              <button
                type="button"
                onClick={() => setVegOnly(!vegOnly)}
                className={`w-full py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all flex items-center justify-between ${
                  vegOnly
                    ? "bg-emerald-950 border-emerald-500 text-emerald-300"
                    : "bg-neutral-950 border-amber-500/20 text-neutral-400 hover:border-amber-500/40"
                }`}
              >
                <span className="flex items-center gap-2">
                  <VegBadge isVeg={true} />
                  Pure Veg Only
                </span>
                <span className="font-mono text-[10px]">{vegOnly ? "ENABLED ✓" : "OFF"}</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl mx-auto px-4 md:px-8 py-8 w-full">
        {loadError && (
          <div className="bg-rose-950/20 border border-rose-500/30 p-5 rounded-2xl text-rose-800 text-sm">
            ⚠️ {loadError}
          </div>
        )}

        {!loadError && (
          <>
            {/* Category Pills */}
            <div className="flex gap-2 overflow-x-auto pb-4 mb-4 scrollbar-none">
              <button
                onClick={() => setSelectedCategoryId(null)}
                className={`px-5 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap shadow-sm ${
                  selectedCategoryId === null
                    ? "bg-gradient-to-r from-amber-600 to-orange-600 text-white"
                    : "bg-white text-neutral-700 hover:bg-amber-100/60 border border-amber-900/10"
                }`}
              >
                🍽️ All Items ({foods.length})
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCategoryId(c.id)}
                  className={`px-5 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap shadow-sm ${
                    selectedCategoryId === c.id
                      ? "bg-gradient-to-r from-amber-600 to-orange-600 text-white"
                      : "bg-white text-neutral-700 hover:bg-amber-100/60 border border-amber-900/10"
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>

            {/* Thali Customizer Banner */}
            {foods.length > 0 && <ThaliBuilder foods={foods} />}

            {/* Food Grid Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-serif text-2xl font-bold text-neutral-900">
                {selectedCategoryId
                  ? categories.find((c) => c.id === selectedCategoryId)?.name
                  : "Explore Culinary Delights"}
              </h2>
              <span className="text-xs font-mono text-neutral-500">
                Showing {filteredFoods.length} items
              </span>
            </div>

            {/* Food Cards Grid */}
            {isLoading ? (
              <div className="py-12 text-center text-amber-800 font-medium animate-pulse">
                🍲 Preparing fresh menu...
              </div>
            ) : filteredFoods.length === 0 ? (
              <div className="bg-white p-12 text-center rounded-3xl border border-amber-900/10">
                <p className="text-base text-neutral-600 font-medium">
                  No dishes found matching your filter criteria.
                </p>
                <button
                  onClick={() => {
                    setSelectedCategoryId(null);
                    setSearchQuery("");
                    setVegOnly(false);
                  }}
                  className="mt-4 px-4 py-2 bg-amber-600 text-white text-xs font-bold rounded-xl"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredFoods.map((food) => (
                  <FoodCard key={food.id} food={food} onAdd={handleAdd} />
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
