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
  const [activeTabFilter, setActiveTabFilter] = useState<string>("ALL");

  useEffect(() => {
    if (!token) return;
    getAllOrders(token)
      .then(setOrders)
      .catch((err) =>
        setError(
          err instanceof ApiError ? err.message : "Couldn't load kitchen orders.",
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
        err instanceof ApiError ? err.message : "Couldn't update the order status.",
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

  // Summary Metrics
  const totalRevenue = orders
    ? orders.reduce((sum, o) => sum + parseFloat(o.totalAmount || "0"), 0)
    : 0;
  const pendingOrdersCount = orders
    ? orders.filter((o) => o.status === "PENDING" || o.status === "CONFIRMED" || o.status === "PREPARING").length
    : 0;
  const readyOrdersCount = orders
    ? orders.filter((o) => o.status === "READY").length
    : 0;
  const deliveredOrdersCount = orders
    ? orders.filter((o) => o.status === "DELIVERED").length
    : 0;

  const filteredOrders = orders
    ? orders.filter((o) => {
        if (activeTabFilter === "ALL") return true;
        if (activeTabFilter === "ACTIVE") return o.status !== "DELIVERED" && o.status !== "CANCELLED";
        return o.status === activeTabFilter;
      })
    : [];

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-amber-950 via-neutral-900 to-orange-950 p-6 rounded-2xl border border-amber-500/20 shadow-xl">
        <div>
          <span className="inline-block text-xs uppercase tracking-widest font-mono text-amber-400 mb-1">
            🔥 Live Kitchen Monitor
          </span>
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-amber-100">
            Rasoi Orders Management (&ldquo;Kadam&rdquo;)
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Monitor incoming thali requests, update kitchen prep status, and confirm UPI/COD payments.
          </p>
        </div>

        {/* Realtime Status Pill */}
        <div className="bg-neutral-950/80 px-4 py-2 rounded-xl border border-amber-500/30 flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-xs font-mono text-amber-200">
            Kitchen Online • {orders?.length || 0} Orders
          </span>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-neutral-900 border border-amber-500/20 p-5 rounded-2xl">
          <p className="text-xs text-neutral-400 font-mono uppercase tracking-wider">Total Sales</p>
          <p className="text-2xl font-bold text-amber-400 mt-1">{formatRupees(totalRevenue)}</p>
          <span className="text-[10px] text-amber-300/60 font-mono mt-1 block">Accumulated earnings</span>
        </div>
        <div className="bg-neutral-900 border border-amber-500/20 p-5 rounded-2xl">
          <p className="text-xs text-neutral-400 font-mono uppercase tracking-wider">Bhatthi / Prep Active</p>
          <p className="text-2xl font-bold text-orange-400 mt-1">{pendingOrdersCount}</p>
          <span className="text-[10px] text-orange-300/60 font-mono mt-1 block">In cooking queue</span>
        </div>
        <div className="bg-neutral-900 border border-amber-500/20 p-5 rounded-2xl">
          <p className="text-xs text-neutral-400 font-mono uppercase tracking-wider">Tayyar (Ready)</p>
          <p className="text-2xl font-bold text-emerald-400 mt-1">{readyOrdersCount}</p>
          <span className="text-[10px] text-emerald-300/60 font-mono mt-1 block">Awaiting pickup</span>
        </div>
        <div className="bg-neutral-900 border border-amber-500/20 p-5 rounded-2xl">
          <p className="text-xs text-neutral-400 font-mono uppercase tracking-wider">Rawaana (Delivered)</p>
          <p className="text-2xl font-bold text-neutral-300 mt-1">{deliveredOrdersCount}</p>
          <span className="text-[10px] text-neutral-500 font-mono mt-1 block">Completed orders</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-neutral-800 pb-3 overflow-x-auto">
        {["ALL", "ACTIVE", "PENDING", "PREPARING", "READY", "DELIVERED"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTabFilter(tab)}
            className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTabFilter === tab
                ? "bg-amber-500 text-neutral-950 font-bold"
                : "bg-neutral-900 text-neutral-400 hover:text-neutral-200 border border-neutral-800"
            }`}
          >
            {tab === "ALL" ? "All Orders" : tab === "ACTIVE" ? "🔥 Active Queue" : tab}
          </button>
        ))}
      </div>

      {error && (
        <div className="bg-rose-950/40 border border-rose-500/40 p-4 rounded-xl text-rose-300 text-xs flex items-center gap-2">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* Orders List */}
      {orders === null ? (
        <p className="text-sm font-mono text-neutral-400 py-8 text-center animate-pulse">
          Loading orders...
        </p>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-12 text-center">
          <p className="text-neutral-400 text-sm">No orders matching this filter.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className="bg-neutral-900 border border-amber-500/20 rounded-2xl p-5 hover:border-amber-500/40 transition-all space-y-4"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-800 pb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs bg-amber-500 text-neutral-950 px-2.5 py-0.5 rounded-full font-bold shadow">
                      🎫 TOKEN #{order.tokenNumber || `TK-${new Date(order.createdAt).toISOString().slice(0,10).replace(/-/g,'')}-${order.id.slice(0,4).toUpperCase()}`}
                    </span>
                    <span className="text-xs text-neutral-500 font-mono">•</span>
                    <span className="text-xs text-neutral-400">{formatDate(order.createdAt)}</span>
                    <span className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[10px] font-mono font-semibold">
                      {order.paymentMethod}
                    </span>
                  </div>
                  <h3 className="font-bold text-amber-100 text-sm">{order.user.fullName}</h3>
                  <p className="text-xs text-neutral-400 font-mono mt-0.5">
                    📞 {order.user.phone} | 📍 {order.deliveryAddress}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {/* Payment Status Dropdown */}
                  <div>
                    <span className="block text-[10px] uppercase font-mono text-neutral-400 mb-1">
                      Payment ({order.paymentMethod})
                    </span>
                    <select
                      value={order.paymentStatus}
                      disabled={updatingId === order.id}
                      onChange={(e) =>
                        handlePaymentStatusChange(
                          order.id,
                          e.target.value as OrderPaymentStatus,
                        )
                      }
                      className={`bg-neutral-950 border px-3 py-1.5 rounded-xl text-xs font-semibold focus:outline-none ${
                        order.paymentStatus === "PAID"
                          ? "border-emerald-500 text-emerald-300"
                          : "border-amber-500/40 text-amber-300"
                      }`}
                    >
                      {PAYMENT_FLOW.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Order Status Dropdown */}
                  <div>
                    <span className="block text-[10px] uppercase font-mono text-neutral-400 mb-1">
                      Kitchen Prep Status
                    </span>
                    <select
                      value={order.status}
                      disabled={updatingId === order.id}
                      onChange={(e) =>
                        handleStatusChange(order.id, e.target.value as OrderStatus)
                      }
                      className={`bg-neutral-950 border px-3 py-1.5 rounded-xl text-xs font-bold focus:outline-none ${
                        order.status === "DELIVERED"
                          ? "border-emerald-500 text-emerald-300"
                          : order.status === "PREPARING"
                          ? "border-orange-500 text-orange-300"
                          : "border-amber-500/50 text-amber-200"
                      }`}
                    >
                      {STATUS_FLOW.map((s) => (
                        <option key={s} value={s}>
                          {s === "PENDING" ? "🛎️ PENDING" : s === "PREPARING" ? "🍲 PREPARING" : s === "READY" ? "✨ READY" : s === "DELIVERED" ? "🛵 DELIVERED" : s}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Order Items Breakdown */}
              <div className="flex items-center justify-between gap-4 pt-1">
                <div className="flex flex-wrap gap-2 text-xs text-neutral-300">
                  {order.items.map((item) => (
                    <span
                      key={item.id}
                      className="bg-neutral-950 border border-neutral-800 px-2.5 py-1 rounded-lg font-medium"
                    >
                      {item.quantity}x {item.food?.name || "Dish"} (₹{item.price})
                    </span>
                  ))}
                </div>

                <div className="text-right flex-shrink-0">
                  <span className="text-[10px] text-neutral-400 uppercase tracking-wider block font-mono">
                    Total Amount
                  </span>
                  <span className="text-base font-bold text-amber-400">
                    {formatRupees(order.totalAmount)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
