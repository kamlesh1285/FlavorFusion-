"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import {
  ApiError,
  getAllOrders,
  updateOrder,
  type AdminOrderDto,
  type OrderPaymentStatus,
  type OrderStatus,
} from "@/lib/api";

const STATUS_FLOW: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "PREPARING",
  "READY",
  "DELIVERED",
  "CANCELLED",
];

const PAYMENT_FLOW: OrderPaymentStatus[] = [
  "PENDING",
  "PAID",
  "FAILED",
  "REFUNDED",
];

function formatRupees(amount: number | string) {
  return `₹${Number(amount).toFixed(0)}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function AdminOrdersPage() {
  const { token } = useAuth();
  const [orders, setOrders] = useState<AdminOrderDto[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    getAllOrders(token)
      .then(setOrders)
      .catch((err) =>
        setError(
          err instanceof ApiError ? err.message : "Couldn't load orders.",
        ),
      );
  }, [token]);

  async function handleStatusChange(orderId: string, status: OrderStatus) {
    if (!token) return;
    setUpdatingId(orderId);
    try {
      const updated = await updateOrder(token, orderId, { status });
      setOrders((prev) =>
        prev ? prev.map((o) => (o.id === orderId ? updated : o)) : prev,
      );
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Couldn't update the order.",
      );
    } finally {
      setUpdatingId(null);
    }
  }

  async function handlePaymentStatusChange(
    orderId: string,
    paymentStatus: OrderPaymentStatus,
  ) {
    if (!token) return;
    setUpdatingId(orderId);
    try {
      const updated = await updateOrder(token, orderId, { paymentStatus });
      setOrders((prev) =>
        prev ? prev.map((o) => (o.id === orderId ? updated : o)) : prev,
      );
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Couldn't update the payment status.",
      );
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold italic mb-6">
        All orders
      </h1>

      {error && (
        <div className="ticket-card p-4 mb-6">
          <p className="error-text">{error}</p>
        </div>
      )}

      {orders === null ? (
        <p className="font-mono text-sm text-ink/60">Loading orders…</p>
      ) : orders.length === 0 ? (
        <p className="font-mono text-sm text-ink/60">No orders yet.</p>
      ) : (
        <div className="ticket-card divide-y divide-ink/10">
          {orders.map((order) => (
            <div
              key={order.id}
              className="p-5 flex flex-wrap items-center gap-4"
            >
              <div className="min-w-[160px]">
                <p className="font-mono text-[0.68rem] text-ink/45">
                  #{order.id.slice(0, 8).toUpperCase()} ·{" "}
                  {formatDate(order.createdAt)}
                </p>
                <p className="text-ink font-medium mt-0.5">
                  {order.user.fullName}
                </p>
                <p className="font-mono text-[0.7rem] text-ink/50">
                  {order.user.phone}
                </p>
              </div>

              <div className="flex-1 min-w-[140px]">
                <p className="text-ink/70 text-sm">
                  {order.items.length} item
                  {order.items.length !== 1 ? "s" : ""} ·{" "}
                  {formatRupees(order.totalAmount)}
                </p>
                <p className="font-mono text-[0.68rem] text-ink/45 truncate max-w-xs">
                  {order.deliveryAddress}
                </p>
              </div>

              <div className="flex flex-col items-end gap-1">
                <select
                  value={order.paymentStatus}
                  disabled={updatingId === order.id}
                  onChange={(e) =>
                    handlePaymentStatusChange(
                      order.id,
                      e.target.value as OrderPaymentStatus,
                    )
                  }
                  className="field-input !w-auto text-sm py-1.5"
                >
                  {PAYMENT_FLOW.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                {order.paymentMethod === "UPI" &&
                  order.paymentStatus === "PENDING" &&
                  order.upiLink && (
                    <a
                      href={order.upiLink}
                      className="font-mono text-[0.65rem] text-turmeric-dark hover:underline"
                    >
                      Check UPI request
                    </a>
                  )}
              </div>

              <select
                value={order.status}
                disabled={updatingId === order.id}
                onChange={(e) =>
                  handleStatusChange(order.id, e.target.value as OrderStatus)
                }
                className="field-input !w-auto text-sm py-1.5"
              >
                {STATUS_FLOW.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
