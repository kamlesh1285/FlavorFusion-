"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { FoodCard } from "@/components/FoodCard";
import { VegIndicator } from "@/components/VegIndicator";
import { useAuth } from "@/lib/auth-context";
import { useCart } from "@/lib/cart-context";
import { ApiError, getCategories, getFoods, type Category, type Food } from "@/lib/api";

export default function Home() {
  const router = useRouter();
  const { token } = useAuth();
  const { addToCart } = useCart();

  const [categories, setCategories] = useState<Category[]>([]);
  const [foods, setFoods] = useState<Food[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null,
  );
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
            : "Couldn't reach the kitchen. Is the backend running?",
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
    if (!selectedCategoryId) return foods;
    return foods.filter((f) => f.categoryId === selectedCategoryId);
  }, [foods, selectedCategoryId]);

  async function handleAdd(foodId: string) {
    if (!token) {
      router.push("/login");
      throw new Error("Sign in required");
    }
    await addToCart(foodId, 1);
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <section className="bg-ink border-b border-paper/10">
        <div className="max-w-5xl mx-auto px-6 pt-16 pb-12">
          <p className="field-label text-paper/50 mb-3">
            Today&apos;s spread · made fresh to order
          </p>
          <h1 className="font-display text-4xl sm:text-5xl font-semibold italic leading-[1.05] max-w-xl text-paper">
            Pick a tin,
            <br />
            we&apos;ll do the rest.
          </h1>
          <div className="flex items-center gap-6 mt-7">
            <div className="flex items-center gap-2">
              <VegIndicator isVeg />
              <span className="font-mono text-xs text-paper/55">
                Vegetarian
              </span>
            </div>
            <div className="flex items-center gap-2">
              <VegIndicator isVeg={false} />
              <span className="font-mono text-xs text-paper/55">
                Non-vegetarian
              </span>
            </div>
          </div>
        </div>
      </section>

      <main className="flex-1 max-w-5xl mx-auto px-6 py-10 w-full">
        {loadError && (
          <div className="ticket-card p-5 mb-8">
            <p className="error-text">{loadError}</p>
          </div>
        )}

        {!loadError && (
          <>
            <div className="flex gap-2 flex-wrap mb-8">
              <button
                onClick={() => setSelectedCategoryId(null)}
                className={`font-mono text-xs px-4 py-2 rounded-full border transition-colors ${
                  selectedCategoryId === null
                    ? "bg-turmeric text-ink border-turmeric font-semibold"
                    : "border-ink/25 text-ink/70 hover:border-ink/50 bg-paper/40"
                }`}
              >
                All
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCategoryId(c.id)}
                  className={`font-mono text-xs px-4 py-2 rounded-full border transition-colors ${
                    selectedCategoryId === c.id
                      ? "bg-turmeric text-ink border-turmeric font-semibold"
                      : "border-ink/25 text-ink/70 hover:border-ink/50 bg-paper/40"
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>

            {isLoading ? (
              <p className="font-mono text-sm text-ink/60">
                Loading the menu…
              </p>
            ) : filteredFoods.length === 0 ? (
              <p className="font-mono text-sm text-ink/60">
                Nothing in this category yet.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
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
