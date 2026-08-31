"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { VegIndicator } from "@/components/VegIndicator";
import { useAuth } from "@/lib/auth-context";
import {
  ApiError,
  getAllOrders,
  updateOrder,
  type AdminOrderDto,
  type OrderStatus,
} from "@/lib/api";

// What the kitchen actively works on, oldest first. Once an order hits
// READY it leaves this list — that's the delivery team's job now.
const KITCHEN_STATUSES: OrderStatus[] = ["PENDING", "CONFIRMED", "PREPARING"];

const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  PENDING: "CONFIRMED",
  CONFIRMED: "PREPARING",
  PREPARING: "READY",
};

const ACTION_LABEL: Partial<Record<OrderStatus, string>> = {
  PENDING: "Confirm order",
  CONFIRMED: "Start preparing",
  PREPARING: "Mark ready",
};

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function KitchenPage() {
  const router = useRouter();
  const { user, token, isLoading: authLoading } = useAuth();

  const [orders, setOrders] = useState<AdminOrderDto[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (user.role !== "KITCHEN" && user.role !== "ADMIN") {
      router.replace("/");
    }
  }, [authLoading, user, router]);

  const load = useCallback(() => {
    if (!token) return;
    getAllOrders(token)
      .then((all) => {
        const active = all
          .filter((o) => KITCHEN_STATUSES.includes(o.status as OrderStatus))
          .sort(
            (a, b) =>
              new Date(a.createdAt).getTime() -
              new Date(b.createdAt).getTime(),
          );
        setOrders(active);
      })
      .catch((err) =>
        setError(
          err instanceof ApiError ? err.message : "Couldn't load orders.",
        ),
      );
  }, [token]);

  useEffect(() => {
    load();
    // Live kitchen display — poll for new orders without a manual refresh.
    const interval = setInterval(load, 20000);
    return () => clearInterval(interval);
  }, [load]);

  async function handleAdvance(orderId: string, next: OrderStatus) {
    if (!token) return;
    setUpdatingId(orderId);
    try {
      await updateOrder(token, orderId, { status: next });
      setOrders((prev) =>
        prev ? prev.filter((o) => o.id !== orderId) : prev,
      );
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Couldn't update the order.",
      );
    } finally {
      setUpdatingId(null);
    }
  }

  if (authLoading || !user || (user.role !== "KITCHEN" && user.role !== "ADMIN")) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-10">
        <p className="field-label text-ink/50 mb-2">Kitchen</p>
        <h1 className="font-display text-3xl font-semibold italic mb-8">
          Orders to prepare
        </h1>

        {error && (
          <div className="ticket-card p-4 mb-6">
            <p className="error-text">{error}</p>
          </div>
        )}

        {orders === null ? (
          <p className="font-mono text-sm text-ink/60">Loading…</p>
        ) : orders.length === 0 ? (
          <div className="ticket-card p-8 text-center max-w-md">
            <p className="text-ink/60">
              Nothing to prepare right now — all caught up.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {orders.map((order) => {
              const next = NEXT_STATUS[order.status as OrderStatus];
              return (
                <div key={order.id} className="ticket-card flex flex-col">
                  <div className="bg-ink-soft px-5 py-3.5 flex items-center justify-between">
                    <p className="font-mono text-[0.7rem] tracking-wider text-paper/60">
                      #{order.id.slice(0, 8).toUpperCase()} ·{" "}
                      {formatTime(order.createdAt)}
                    </p>
                    <span className="font-mono text-[0.65rem] uppercase tracking-wide text-turmeric">
                      {order.status}
                    </span>
                  </div>

                  <div className="px-5 py-4 flex-1 divide-y divide-ink/10">
                    {order.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-2.5 py-2 first:pt-0 last:pb-0"
                      >
                        <VegIndicator isVeg={item.food.isVeg} />
                        <span className="text-ink flex-1 min-w-0">
                          {item.food.name}
                        </span>
                        <span className="font-mono text-sm text-ink/60">
                          ×{item.quantity}
                        </span>
                      </div>
                    ))}
                  </div>

                  {next && (
                    <div className="px-5 pb-5">
                      <button
                        onClick={() => handleAdvance(order.id, next)}
                        disabled={updatingId === order.id}
                        className="btn-primary w-full"
                      >
                        {updatingId === order.id
                          ? "Updating…"
                          : ACTION_LABEL[order.status as OrderStatus]}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
