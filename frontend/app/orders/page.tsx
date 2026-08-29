"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { StatusBadge } from "@/components/StatusBadge";
import VegBadge from "@/components/VegBadge";
import { UpiPayment } from "@/components/UpiPayment";
import { useAuth } from "@/lib/auth-context";
import { ApiError, getMyOrders, type OrderWithItemsDto } from "@/lib/api";

function formatRupees(amount: number | string) {
  return `₹${Number(amount).toFixed(0)}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatToken(order: OrderWithItemsDto) {
  if (order.tokenNumber) return order.tokenNumber;
  const d = new Date(order.createdAt);
  const dateStr = d.toISOString().slice(0, 10).replace(/-/g, "");
  return `TK-${dateStr}-${order.id.slice(0, 4).toUpperCase()}`;
}

export default function OrdersPage() {
  const router = useRouter();
  const { token, isLoading: authLoading } = useAuth();

  const [orders, setOrders] = useState<OrderWithItemsDto[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !token) {
      router.replace("/login");
    }
  }, [authLoading, token, router]);

  useEffect(() => {
    if (!token) return;

    let cancelled = false;

    getMyOrders(token)
      .then((res) => {
        if (!cancelled) setOrders(res);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(
          err instanceof ApiError
            ? err.message
            : "Couldn't load your orders. Please try again.",
        );
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  if (authLoading || !token) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-amber-50/40 text-neutral-900">
      <Navbar />
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 md:px-8 py-10">
        <div className="mb-6">
          <span className="text-xs uppercase tracking-widest font-mono text-amber-800 font-semibold">Your History</span>
          <h1 className="text-3xl font-serif font-bold text-neutral-900">
            Order & Token History
          </h1>
        </div>

        {error && (
          <div className="bg-rose-950/20 border border-rose-500/30 p-5 rounded-2xl text-rose-800 text-sm">
            ⚠️ {error}
          </div>
        )}

        {!error && orders === null && (
          <p className="text-sm font-mono text-neutral-500 animate-pulse">Loading orders...</p>
        )}

        {!error && orders !== null && orders.length === 0 && (
          <div className="bg-white p-12 text-center rounded-3xl border border-amber-900/10 max-w-md mx-auto shadow-sm">
            <p className="text-neutral-500 text-xs mb-6">No orders placed yet. Your first token will appear here!</p>
            <Link href="/" className="bg-gradient-to-r from-amber-600 to-orange-600 text-white font-bold px-6 py-2.5 rounded-xl text-xs inline-block shadow-md">
              Browse Menu
            </Link>
          </div>
        )}

        {!error && orders !== null && orders.length > 0 && (
          <div className="space-y-6">
            {orders.map((order) => {
              const tokenDisplay = formatToken(order);
              return (
                <div key={order.id} className="bg-white rounded-3xl border border-amber-900/10 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  {/* Header Banner */}
                  <div className="bg-neutral-950 text-amber-50 px-6 py-4 flex flex-wrap items-center justify-between gap-4 border-b border-amber-500/20">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="bg-amber-500 text-neutral-950 font-mono text-xs font-bold px-3 py-1 rounded-full shadow">
                          🎫 TOKEN #{tokenDisplay}
                        </span>
                        <span className="text-xs font-mono text-neutral-400">
                          {formatDate(order.createdAt)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <StatusBadge status={order.status} />
                        <StatusBadge status={order.paymentStatus} />
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-neutral-400 uppercase font-mono block">Total Amount</span>
                      <span className="font-bold text-amber-400 text-lg">
                        {formatRupees(order.totalAmount)}
                      </span>
                    </div>
                  </div>

                  {/* Items List */}
                  <div className="p-6 divide-y divide-neutral-100">
                    {order.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0 text-xs"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <VegBadge isVeg={item.food.isVeg} />
                          <span className="font-semibold text-neutral-900 truncate">
                            {item.food.name}
                          </span>
                        </div>
                        <span className="font-mono text-neutral-500">
                          x{item.quantity}
                        </span>
                        <span className="font-bold text-neutral-800 w-16 text-right">
                          {formatRupees(Number(item.price) * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="px-6 pb-4 pt-2 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
                    <span>📍 {order.deliveryAddress}</span>
                    <span className="font-mono text-[11px]">ID: {order.id.slice(0, 8).toUpperCase()}</span>
                  </div>

                  {order.paymentMethod === "UPI" &&
                    order.paymentStatus === "PENDING" &&
                    order.upiLink && (
                      <div className="p-6 pt-0">
                        <UpiPayment upiLink={order.upiLink} />
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
