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
  const [quantity, setQuantity] = useState(1);
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
          err instanceof ApiError ? err.message : "Couldn't load inventory.",
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
      setQuantity(1);
      setNote("");
      load();
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Couldn't record the adjustment.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold italic mb-6">
        Inventory
      </h1>

      {error && (
        <div className="ticket-card p-4 mb-6">
          <p className="error-text">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="ticket-card p-5 mb-6">
        <p className="field-label mb-3">Adjust stock</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
          <select
            className="field-input col-span-2"
            value={foodId}
            onChange={(e) => setFoodId(e.target.value)}
            required
          >
            {foods.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name} (stock {f.stockQuantity})
              </option>
            ))}
          </select>
          <select
            className="field-input"
            value={type}
            onChange={(e) => setType(e.target.value as InventoryType)}
          >
            <option value="STOCK_IN">Stock in</option>
            <option value="STOCK_OUT">Stock out</option>
          </select>
          <input
            className="field-input"
            type="number"
            min={1}
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            required
          />
        </div>
        <input
          className="field-input mb-3"
          placeholder="Note (optional) — e.g. delivery received, wastage"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
        <button
          type="submit"
          className="btn-primary !py-2.5"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Recording…" : "Record adjustment"}
        </button>
      </form>

      <p className="field-label text-ink/50 mb-3">Recent adjustments</p>

      {records === null ? (
        <p className="font-mono text-sm text-ink/60">Loading…</p>
      ) : records.length === 0 ? (
        <p className="font-mono text-sm text-ink/60">
          No adjustments recorded yet.
        </p>
      ) : (
        <div className="ticket-card divide-y divide-ink/10">
          {records.map((r) => (
            <div key={r.id} className="p-4 flex items-center gap-4">
              <span
                className={`font-mono text-[0.68rem] px-2.5 py-1 rounded-full border shrink-0 ${
                  r.type === "STOCK_IN"
                    ? "text-masala border-masala/50 bg-masala/10"
                    : "text-chili border-chili/50 bg-chili/10"
                }`}
              >
                {r.type === "STOCK_IN" ? "+" : "−"}
                {r.quantity}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-ink font-medium truncate">{r.food.name}</p>
                {r.note && (
                  <p className="text-ink/50 text-sm truncate">{r.note}</p>
                )}
              </div>
              <span className="font-mono text-[0.68rem] text-ink/40 shrink-0">
                {formatDate(r.createdAt)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
