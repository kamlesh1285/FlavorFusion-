"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useAuth } from "@/lib/auth-context";
import {
  ApiError,
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
  type Category,
} from "@/lib/api";

export default function AdminCategoriesPage() {
  const { token } = useAuth();
  const [categories, setCategories] = useState<Category[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");

  function load() {
    getCategories()
      .then(setCategories)
      .catch((err) =>
        setError(
          err instanceof ApiError ? err.message : "Couldn't load categories.",
        ),
      );
  }

  useEffect(load, []);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    if (!token || !name.trim()) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const created = await createCategory(token, {
        name: name.trim(),
        description: description.trim() || undefined,
      });
      setCategories((prev) => (prev ? [...prev, created] : [created]));
      setName("");
      setDescription("");
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Couldn't create category.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function startEdit(category: Category) {
    setEditingId(category.id);
    setEditName(category.name);
    setEditDescription(category.description ?? "");
  }

  async function saveEdit(id: string) {
    if (!token) return;
    try {
      const updated = await updateCategory(token, id, {
        name: editName.trim(),
        description: editDescription.trim() || undefined,
      });
      setCategories((prev) =>
        prev ? prev.map((c) => (c.id === id ? updated : c)) : prev,
      );
      setEditingId(null);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Couldn't update category.",
      );
    }
  }

  async function toggleActive(category: Category) {
    if (!token) return;
    try {
      const updated = await updateCategory(token, category.id, {
        isActive: !category.isActive,
      });
      setCategories((prev) =>
        prev ? prev.map((c) => (c.id === category.id ? updated : c)) : prev,
      );
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Couldn't update category.",
      );
    }
  }

  async function handleDelete(id: string) {
    if (!token) return;
    if (!window.confirm("Delete this category? This can't be undone.")) {
      return;
    }
    try {
      await deleteCategory(token, id);
      setCategories((prev) => (prev ? prev.filter((c) => c.id !== id) : prev));
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Couldn't delete category.",
      );
    }
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold italic mb-6">
        Categories
      </h1>

      {error && (
        <div className="ticket-card p-4 mb-6">
          <p className="error-text">{error}</p>
        </div>
      )}

      <form
        onSubmit={handleCreate}
        className="ticket-card p-5 mb-6 flex flex-wrap items-end gap-3"
      >
        <div className="flex-1 min-w-[160px]">
          <label className="field-label block mb-1.5">Name</label>
          <input
            className="field-input"
            placeholder="e.g. Starters"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="flex-[2] min-w-[220px]">
          <label className="field-label block mb-1.5">
            Description (optional)
          </label>
          <input
            className="field-input"
            placeholder="What goes in this category"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <button
          type="submit"
          className="btn-primary !py-2.5"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Adding…" : "Add category"}
        </button>
      </form>

      {categories === null ? (
        <p className="font-mono text-sm text-ink/60">Loading…</p>
      ) : (
        <div className="ticket-card divide-y divide-ink/10">
          {categories.map((category) =>
            editingId === category.id ? (
              <div key={category.id} className="p-4 flex flex-wrap gap-3 items-end">
                <input
                  className="field-input flex-1 min-w-[140px]"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                />
                <input
                  className="field-input flex-[2] min-w-[200px]"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                />
                <button
                  onClick={() => saveEdit(category.id)}
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
            ) : (
              <div
                key={category.id}
                className="p-4 flex items-center gap-4"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-ink font-medium">{category.name}</p>
                  {category.description && (
                    <p className="text-ink/50 text-sm truncate">
                      {category.description}
                    </p>
                  )}
                </div>

                <button
                  onClick={() => toggleActive(category)}
                  className={`font-mono text-[0.68rem] px-2.5 py-1 rounded-full border ${
                    category.isActive
                      ? "text-masala border-masala/50 bg-masala/10"
                      : "text-ink/40 border-ink/20 bg-ink/5"
                  }`}
                >
                  {category.isActive ? "Active" : "Hidden"}
                </button>

                <button
                  onClick={() => startEdit(category)}
                  className="font-mono text-xs text-ink/60 hover:text-ink px-2"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(category.id)}
                  className="font-mono text-xs text-ink/40 hover:text-chili px-2"
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
