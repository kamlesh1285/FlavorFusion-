"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useAuth } from "@/lib/auth-context";
import {
  ApiError,
  adjustInventory,
  getFoods,
  getInventory,
  type Food,
  type InventoryRecord,
  type InventoryType,
} from "@/lib/api";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function AdminInventoryPage() {
  const { token } = useAuth();
  const [foods, setFoods] = useState<Food[]>([]);
  const [records, setRecords] = useState<InventoryRecord[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [foodId, setFoodId] = useState("");
  const [type, setType] = useState<InventoryType>("STOCK_IN");
  const [quantity, setQuantity] = useState(5);
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function load() {
    if (!token) return;
    Promise.all([getFoods(), getInventory(token)])
      .then(([f, r]) => {
        setFoods(f);
        setRecords(r);
        setFoodId((prev) => prev || f[0]?.id || "");
      })
      .catch((err) =>
        setError(
          err instanceof ApiError ? err.message : "Couldn't load Rasad inventory.",
        ),
      );
  }

  useEffect(load, [token]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!token || !foodId || quantity < 1) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await adjustInventory(token, { foodId, type, quantity, note: note.trim() || undefined });
      setQuantity(5);
      setNote("");
      load();
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Couldn't record the inventory adjustment.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-amber-950 via-neutral-900 to-orange-950 p-6 rounded-2xl border border-amber-500/20 shadow-xl">
        <div>
          <span className="inline-block text-xs uppercase tracking-widest font-mono text-amber-400 mb-1">
            🌾 Kitchen Pantry Management
          </span>
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-amber-100">
            Rasad Khana — Stock Tracker
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Log raw material stock, monitor ingredient levels, and prevent out-of-stock items.
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-rose-950/40 border border-rose-500/40 p-4 rounded-xl text-rose-300 text-xs flex items-center gap-2">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* Stock Overview Cards Grid */}
      <div>
        <h2 className="text-sm font-mono uppercase tracking-wider text-amber-300 mb-3">
          📦 Current Item Stock Levels
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {foods.map((food) => (
            <div
              key={food.id}
              className={`p-3.5 rounded-xl border flex flex-col justify-between transition-all ${
                food.stockQuantity <= 5
                  ? "bg-rose-950/30 border-rose-500/40"
                  : "bg-neutral-900 border-amber-500/20"
              }`}
            >
              <span className="text-xs font-semibold text-amber-100 truncate block">
                {food.name}
              </span>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-neutral-400 font-mono">Stock</span>
                <span
                  className={`font-mono text-sm font-bold ${
                    food.stockQuantity <= 5 ? "text-rose-400" : "text-emerald-400"
                  }`}
                >
                  {food.stockQuantity} units
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Adjust Stock Form */}
      <form onSubmit={handleSubmit} className="bg-neutral-900 border border-amber-500/20 p-6 rounded-2xl space-y-4">
        <h2 className="text-sm font-semibold text-amber-300 uppercase tracking-wider">
          ➕ Log Ingredient / Dish Adjustment
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-mono uppercase tracking-wider text-neutral-400 mb-1">
              Select Item
            </label>
            <select
              className="w-full bg-neutral-950 border border-amber-500/30 rounded-xl px-3.5 py-2 text-xs text-amber-100 focus:outline-none focus:border-amber-400"
              value={foodId}
              onChange={(e) => setFoodId(e.target.value)}
              required
            >
              {foods.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name} (Current: {f.stockQuantity})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-neutral-400 mb-1">
              Action
            </label>
            <select
              className="w-full bg-neutral-950 border border-amber-500/30 rounded-xl px-3.5 py-2 text-xs text-amber-100 focus:outline-none focus:border-amber-400"
              value={type}
              onChange={(e) => setType(e.target.value as InventoryType)}
            >
              <option value="STOCK_IN">➕ Stock In (+ Supply)</option>
              <option value="STOCK_OUT">➖ Stock Out (- Usage)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-neutral-400 mb-1">
              Quantity
            </label>
            <input
              className="w-full bg-neutral-950 border border-amber-500/30 rounded-xl px-3.5 py-2 text-xs text-amber-100 focus:outline-none focus:border-amber-400"
              type="number"
              min={1}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-neutral-400 mb-1">
            Note / Remark (Optional)
          </label>
          <input
            className="w-full bg-neutral-950 border border-amber-500/30 rounded-xl px-3.5 py-2 text-xs text-amber-100 placeholder-neutral-600 focus:outline-none focus:border-amber-400"
            placeholder="e.g. Fresh Paneer delivery received, Basmati batch restocked"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>

        <button
          type="submit"
          className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-neutral-950 font-bold px-6 py-2.5 rounded-xl text-xs uppercase tracking-wider shadow-md transition-all active:scale-95 disabled:opacity-50"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Recording..." : "Record Adjustment ➔"}
        </button>
      </form>

      {/* Adjustment Log Table */}
      <div>
        <h2 className="text-sm font-mono uppercase tracking-wider text-neutral-400 mb-3">
          📋 Audit Log History
        </h2>

        {records === null ? (
          <p className="text-xs font-mono text-neutral-400 py-4 animate-pulse">
            Loading logs...
          </p>
        ) : records.length === 0 ? (
          <p className="text-xs text-neutral-400 py-4">No adjustments recorded yet.</p>
        ) : (
          <div className="bg-neutral-900 border border-amber-500/20 rounded-2xl divide-y divide-neutral-800 overflow-hidden">
            {records.map((r) => (
              <div key={r.id} className="p-4 flex items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-3">
                  <span
                    className={`font-mono text-xs px-2.5 py-1 rounded-lg border font-bold ${
                      r.type === "STOCK_IN"
                        ? "text-emerald-400 border-emerald-500/40 bg-emerald-950/40"
                        : "text-rose-400 border-rose-500/40 bg-rose-950/40"
                    }`}
                  >
                    {r.type === "STOCK_IN" ? "+" : "−"}{r.quantity}
                  </span>
                  <div>
                    <span className="font-semibold text-amber-100">{r.food.name}</span>
                    {r.note && (
                      <p className="text-neutral-400 text-[11px] mt-0.5">{r.note}</p>
                    )}
                  </div>
                </div>

                <span className="font-mono text-[10px] text-neutral-500">
                  {formatDate(r.createdAt)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
