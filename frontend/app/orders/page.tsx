"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { StatusBadge } from "@/components/StatusBadge";
import { VegIndicator } from "@/components/VegIndicator";
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
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-10">
        <p className="field-label text-ink/50 mb-2">Order history</p>
        <h1 className="font-display text-3xl font-semibold italic mb-8">
          Your orders
        </h1>

        {error && (
          <div className="ticket-card p-5">
            <p className="error-text">{error}</p>
          </div>
        )}

        {!error && orders === null && (
          <p className="font-mono text-sm text-ink/60">Loading orders…</p>
        )}

        {!error && orders !== null && orders.length === 0 && (
          <div className="ticket-card p-8 text-center max-w-md">
            <p className="text-ink/60 mb-5">
              No orders yet — your first one will show up here.
            </p>
            <Link href="/" className="btn-primary inline-block">
              Browse the menu
            </Link>
          </div>
        )}

        {!error && orders !== null && orders.length > 0 && (
          <div className="flex flex-col gap-5">
            {orders.map((order) => (
              <div key={order.id} className="ticket-card">
                <div className="bg-ink-soft px-6 py-4 flex items-center justify-between gap-4">
                  <div>
                    <p className="font-mono text-[0.68rem] tracking-wider text-paper/50">
                      ORDER #{order.id.slice(0, 8).toUpperCase()} ·{" "}
                      {formatDate(order.createdAt)}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <StatusBadge status={order.status} />
                      <StatusBadge status={order.paymentStatus} />
                    </div>
                  </div>
                  <span className="font-mono font-semibold text-paper shrink-0">
                    {formatRupees(order.totalAmount)}
                  </span>
                </div>

                <div className="px-6 py-4 divide-y divide-ink/10">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0"
                    >
                      <VegIndicator isVeg={item.food.isVeg} />
                      <span className="text-ink flex-1 min-w-0 truncate">
                        {item.food.name}
                      </span>
                      <span className="font-mono text-xs text-ink/50">
                        ×{item.quantity}
                      </span>
                      <span className="font-mono text-sm text-ink w-16 text-right">
                        {formatRupees(Number(item.price) * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="px-6 pb-4">
                  <p className="font-mono text-[0.7rem] text-ink/45">
                    Delivering to {order.deliveryAddress}
                  </p>
                </div>

                {order.paymentMethod === "UPI" &&
                  order.paymentStatus === "PENDING" &&
                  order.upiLink && (
                    <div className="px-6 pb-6">
                      <UpiPayment upiLink={order.upiLink} />
                    </div>
                  )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
