"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { StatusBadge } from "@/components/StatusBadge";
import { useAuth } from "@/lib/auth-context";
import {
  ApiError,
  getAllOrders,
  updateOrder,
  type AdminOrderDto,
} from "@/lib/api";

function formatRupees(amount: number | string) {
  return `₹${Number(amount).toFixed(0)}`;
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function DeliveryPage() {
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
    if (user.role !== "DELIVERY" && user.role !== "ADMIN") {
      router.replace("/");
    }
  }, [authLoading, user, router]);

  const load = useCallback(() => {
    if (!token) return;
    getAllOrders(token)
      .then((all) => {
        const ready = all
          .filter((o) => o.status === "READY")
          .sort(
            (a, b) =>
              new Date(a.createdAt).getTime() -
              new Date(b.createdAt).getTime(),
          );
        setOrders(ready);
      })
      .catch((err) =>
        setError(
          err instanceof ApiError ? err.message : "Couldn't load orders.",
        ),
      );
  }, [token]);

  useEffect(() => {
    load();
    const interval = setInterval(load, 20000);
    return () => clearInterval(interval);
  }, [load]);

  async function handleDelivered(orderId: string) {
    if (!token) return;
    setUpdatingId(orderId);
    try {
      await updateOrder(token, orderId, { status: "DELIVERED" });
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

  if (
    authLoading ||
    !user ||
    (user.role !== "DELIVERY" && user.role !== "ADMIN")
  ) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-10">
        <p className="field-label text-ink/50 mb-2">Delivery</p>
        <h1 className="font-display text-3xl font-semibold italic mb-8">
          Ready for pickup
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
            <p className="text-ink/60">Nothing waiting for pickup right now.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            {orders.map((order) => (
              <div key={order.id} className="ticket-card">
                <div className="bg-ink-soft px-6 py-4 flex items-center justify-between gap-4">
                  <div>
                    <p className="font-mono text-[0.68rem] tracking-wider text-paper/50">
                      #{order.id.slice(0, 8).toUpperCase()} ·{" "}
                      {formatTime(order.createdAt)}
                    </p>
                    <p className="font-display font-semibold text-paper mt-0.5">
                      {order.user.fullName}
                    </p>
                    <p className="font-mono text-[0.72rem] text-paper/60">
                      {order.user.phone}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-mono font-semibold text-paper block">
                      {formatRupees(order.totalAmount)}
                    </span>
                    <div className="mt-1">
                      <StatusBadge status={order.paymentStatus} />
                    </div>
                  </div>
                </div>

                <div className="px-6 py-4">
                  <p className="field-label mb-1">Deliver to</p>
                  <p className="text-ink">{order.deliveryAddress}</p>

                  {order.paymentMethod === "CASH_ON_DELIVERY" &&
                    order.paymentStatus === "PENDING" && (
                      <p className="font-mono text-[0.72rem] text-chili mt-2">
                        Collect {formatRupees(order.totalAmount)} cash on
                        delivery
                      </p>
                    )}
                  {order.paymentMethod === "UPI" &&
                    order.paymentStatus === "PENDING" && (
                      <p className="font-mono text-[0.72rem] text-turmeric-dark mt-2">
                        UPI payment not yet confirmed — check with the
                        restaurant before handing over
                      </p>
                    )}
                </div>

                <div className="px-6 pb-6">
                  <button
                    onClick={() => handleDelivered(order.id)}
                    disabled={updatingId === order.id}
                    className="btn-primary w-full"
                  >
                    {updatingId === order.id ? "Updating…" : "Mark delivered"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
