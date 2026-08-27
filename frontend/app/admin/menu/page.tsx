"use client";

import { useEffect, useState, type FormEvent } from "react";
import { VegIndicator } from "@/components/VegIndicator";
import { ImageUploadField } from "@/components/ImageUploadField";
import { useAuth } from "@/lib/auth-context";
import {
  ApiError,
  createFood,
  deleteFood,
  getCategories,
  getFoods,
  resolveImageUrl,
  updateFood,
  type Category,
  type Food,
  type FoodPayload,
} from "@/lib/api";

const emptyForm: FoodPayload = {
  name: "",
  description: "",
  price: 0,
  isVeg: true,
  isAvailable: true,
  stockQuantity: 0,
  preparationTime: 20,
  categoryId: "",
};

export default function AdminMenuPage() {
  const { token } = useAuth();
  const [foods, setFoods] = useState<Food[] | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<FoodPayload>(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<FoodPayload>(emptyForm);

  function load() {
    Promise.all([getFoods(), getCategories()])
      .then(([f, c]) => {
        setFoods(f);
        setCategories(c);
        setForm((prev) => ({ ...prev, categoryId: prev.categoryId || c[0]?.id || "" }));
      })
      .catch((err) =>
        setError(err instanceof ApiError ? err.message : "Couldn't load menu."),
      );
  }

  useEffect(load, []);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    if (!token || !form.name.trim() || !form.categoryId) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const created = await createFood(token, {
        ...form,
        name: form.name.trim(),
        description: form.description?.trim() || undefined,
        price: Number(form.price),
        stockQuantity: Number(form.stockQuantity),
        preparationTime: Number(form.preparationTime),
      });
      setFoods((prev) => (prev ? [...prev, created] : [created]));
      setForm({ ...emptyForm, categoryId: form.categoryId });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't add food.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function startEdit(food: Food) {
    setEditingId(food.id);
    setEditForm({
      name: food.name,
      description: food.description ?? "",
      price: Number(food.price),
      imageUrl: food.imageUrl,
      isVeg: food.isVeg,
      isAvailable: food.isAvailable,
      stockQuantity: food.stockQuantity,
      preparationTime: food.preparationTime,
      categoryId: food.categoryId,
    });
  }

  async function saveEdit(id: string) {
    if (!token) return;
    try {
      const updated = await updateFood(token, id, {
        ...editForm,
        name: editForm.name.trim(),
        description: editForm.description?.trim() || undefined,
        price: Number(editForm.price),
        stockQuantity: Number(editForm.stockQuantity),
        preparationTime: Number(editForm.preparationTime),
      });
      setFoods((prev) =>
        prev ? prev.map((f) => (f.id === id ? updated : f)) : prev,
      );
      setEditingId(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't update food.");
    }
  }

  async function toggleAvailable(food: Food) {
    if (!token) return;
    try {
      const updated = await updateFood(token, food.id, {
        isAvailable: !food.isAvailable,
      });
      setFoods((prev) =>
        prev ? prev.map((f) => (f.id === food.id ? updated : f)) : prev,
      );
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't update food.");
    }
  }

  async function handleDelete(id: string) {
    if (!token) return;
    if (!window.confirm("Delete this food item? This can't be undone.")) {
      return;
    }
    try {
      await deleteFood(token, id);
      setFoods((prev) => (prev ? prev.filter((f) => f.id !== id) : prev));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't delete food.");
    }
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold italic mb-6">
        Menu
      </h1>

      {error && (
        <div className="ticket-card p-4 mb-6">
          <p className="error-text">{error}</p>
        </div>
      )}

      <form onSubmit={handleCreate} className="ticket-card p-5 mb-6">
        <p className="field-label mb-3">Add a dish</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3">
          <input
            className="field-input col-span-2 sm:col-span-1"
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <select
            className="field-input"
            value={form.categoryId}
            onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
            required
          >
            <option value="" disabled>
              Category…
            </option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <input
            className="field-input"
            type="number"
            min={0}
            step="0.01"
            placeholder="Price ₹"
            value={form.price || ""}
            onChange={(e) =>
              setForm({ ...form, price: Number(e.target.value) })
            }
            required
          />
          <input
            className="field-input"
            type="number"
            min={0}
            placeholder="Stock qty"
            value={form.stockQuantity || ""}
            onChange={(e) =>
              setForm({ ...form, stockQuantity: Number(e.target.value) })
            }
            required
          />
          <input
            className="field-input"
            type="number"
            min={1}
            placeholder="Prep time (min)"
            value={form.preparationTime || ""}
            onChange={(e) =>
              setForm({ ...form, preparationTime: Number(e.target.value) })
            }
          />
          <label className="flex items-center gap-2 font-mono text-xs text-ink/70">
            <input
              type="checkbox"
              checked={form.isVeg}
              onChange={(e) => setForm({ ...form, isVeg: e.target.checked })}
            />
            Vegetarian
          </label>
        </div>
        <input
          className="field-input mb-3"
          placeholder="Description (optional)"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
        <div className="mb-4">
          <ImageUploadField
            imageUrl={form.imageUrl}
            onChange={(url) => setForm({ ...form, imageUrl: url })}
          />
        </div>
        <button
          type="submit"
          className="btn-primary !py-2.5"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Adding…" : "Add to menu"}
        </button>
      </form>

      {foods === null ? (
        <p className="font-mono text-sm text-ink/60">Loading…</p>
      ) : (
        <div className="ticket-card divide-y divide-ink/10">
          {foods.map((food) =>
            editingId === food.id ? (
              <div key={food.id} className="p-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3">
                  <input
                    className="field-input col-span-2 sm:col-span-1"
                    value={editForm.name}
                    onChange={(e) =>
                      setEditForm({ ...editForm, name: e.target.value })
                    }
                  />
                  <select
                    className="field-input"
                    value={editForm.categoryId}
                    onChange={(e) =>
                      setEditForm({ ...editForm, categoryId: e.target.value })
                    }
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  <input
                    className="field-input"
                    type="number"
                    min={0}
                    step="0.01"
                    value={editForm.price}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        price: Number(e.target.value),
                      })
                    }
                  />
                  <input
                    className="field-input"
                    type="number"
                    min={0}
                    value={editForm.stockQuantity}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        stockQuantity: Number(e.target.value),
                      })
                    }
                  />
                  <input
                    className="field-input"
                    type="number"
                    min={1}
                    value={editForm.preparationTime}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        preparationTime: Number(e.target.value),
                      })
                    }
                  />
                  <label className="flex items-center gap-2 font-mono text-xs text-ink/70">
                    <input
                      type="checkbox"
                      checked={editForm.isVeg}
                      onChange={(e) =>
                        setEditForm({ ...editForm, isVeg: e.target.checked })
                      }
                    />
                    Vegetarian
                  </label>
                </div>
                <input
                  className="field-input mb-3"
                  value={editForm.description}
                  onChange={(e) =>
                    setEditForm({ ...editForm, description: e.target.value })
                  }
                />
                <div className="mb-3">
                  <ImageUploadField
                    imageUrl={editForm.imageUrl}
                    onChange={(url) =>
                      setEditForm({ ...editForm, imageUrl: url })
                    }
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => saveEdit(food.id)}
                    className="btn-primary !py-2 !px-4 text-sm"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="font-mono text-xs text-ink/50 hover:text-ink px-2"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div key={food.id} className="p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg overflow-hidden bg-paper-dim border border-ink/10 shrink-0 flex items-center justify-center">
                  {resolveImageUrl(food.imageUrl) ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={resolveImageUrl(food.imageUrl)!}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="font-display text-sm italic text-ink/30">
                      {food.name.charAt(0)}
                    </span>
                  )}
                </div>
                <VegIndicator isVeg={food.isVeg} />
                <div className="flex-1 min-w-0">
                  <p className="text-ink font-medium truncate">
                    {food.name}
                  </p>
                  <p className="font-mono text-[0.7rem] text-ink/45">
                    {food.category?.name} · ₹{Number(food.price).toFixed(0)} ·
                    stock {food.stockQuantity}
                  </p>
                </div>

                <button
                  onClick={() => toggleAvailable(food)}
                  className={`font-mono text-[0.68rem] px-2.5 py-1 rounded-full border shrink-0 ${
                    food.isAvailable
                      ? "text-masala border-masala/50 bg-masala/10"
                      : "text-ink/40 border-ink/20 bg-ink/5"
                  }`}
                >
                  {food.isAvailable ? "Available" : "Hidden"}
                </button>

                <button
                  onClick={() => startEdit(food)}
                  className="font-mono text-xs text-ink/60 hover:text-ink px-2 shrink-0"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(food.id)}
                  className="font-mono text-xs text-ink/40 hover:text-chili px-2 shrink-0"
                >
                  Delete
                </button>
              </div>
            ),
          )}
        </div>
      )}
    </div>
  );
}
