"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { QuantityStepper } from "@/components/QuantityStepper";
import { VegIndicator } from "@/components/VegIndicator";
import { UpiPayment } from "@/components/UpiPayment";
import { useAuth } from "@/lib/auth-context";
import { useCart } from "@/lib/cart-context";
import { ApiError, type OrderDto, type PaymentMethod } from "@/lib/api";

const PAYMENT_OPTIONS: { value: PaymentMethod; label: string; hint?: string }[] = [
  { value: "CASH_ON_DELIVERY", label: "Cash on delivery" },
  { value: "UPI", label: "UPI", hint: "Scan a real QR to pay" },
  { value: "CARD", label: "Card", hint: "Demo only" },
];

function formatRupees(amount: number) {
  return `₹${amount.toFixed(0)}`;
}

export default function CartPage() {
  const router = useRouter();
  const { token, isLoading: authLoading } = useAuth();
  const { cart, subtotal, isLoading, updateQuantity, removeItem, checkout } =
    useCart();

  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("CASH_ON_DELIVERY");
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<OrderDto | null>(null);

  useEffect(() => {
    if (!authLoading && !token) {
      router.replace("/login");
    }
  }, [authLoading, token, router]);

  async function handleCheckout(e: FormEvent) {
    e.preventDefault();
    setCheckoutError(null);

    if (!deliveryAddress.trim()) {
      setCheckoutError("Add a delivery address so we know where to send it.");
      return;
    }

    setIsPlacingOrder(true);
    try {
      const order = await checkout({ deliveryAddress, paymentMethod });
      setConfirmedOrder(order);
    } catch (err) {
      setCheckoutError(
        err instanceof ApiError
          ? err.message
          : "Couldn't place the order. Please try again.",
      );
    } finally {
      setIsPlacingOrder(false);
    }
  }

  if (authLoading || !token) {
    return null;
  }

  if (confirmedOrder) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 max-w-md mx-auto w-full px-6 py-14">
          <div className="ticket-card">
            <div className="bg-ink-soft px-7 pt-7 pb-8">
              <p className="field-label text-paper/60">Order placed</p>
              <h1 className="font-display text-2xl font-semibold italic text-paper mt-1">
                On its way to the kitchen
              </h1>
              <p className="font-mono text-[0.68rem] tracking-wider text-paper/45 mt-2">
                ORDER #{confirmedOrder.id.slice(0, 8).toUpperCase()}
              </p>
            </div>

            <div className="ticket-perforation mx-7" />

            <div className="px-7 pt-7 pb-7">
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-ink/55">Status</dt>
                  <dd className="font-mono text-ink">
                    {confirmedOrder.status}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-ink/55">Payment</dt>
                  <dd className="font-mono text-ink">
                    {confirmedOrder.paymentStatus}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-ink/55">Delivering to</dt>
                  <dd className="text-ink text-right max-w-[60%]">
                    {confirmedOrder.deliveryAddress}
                  </dd>
                </div>
                <div className="flex justify-between pt-3 border-t border-ink/10">
                  <dt className="text-ink font-medium">Total</dt>
                  <dd className="font-mono font-semibold text-ink">
                    {formatRupees(Number(confirmedOrder.totalAmount))}
                  </dd>
                </div>
              </dl>

              {confirmedOrder.paymentMethod === "UPI" &&
                confirmedOrder.paymentStatus === "PENDING" &&
                confirmedOrder.upiLink && (
                  <div className="mt-6">
                    <UpiPayment upiLink={confirmedOrder.upiLink} />
                  </div>
                )}

              <Link
                href="/"
                className="btn-primary w-full mt-7 block text-center"
              >
                Back to menu
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const items = cart?.items ?? [];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-10">
        <p className="field-label text-ink/50 mb-2">Your order</p>
        <h1 className="font-display text-3xl font-semibold italic mb-8">
          Cart
        </h1>

        {isLoading ? (
          <p className="font-mono text-sm text-ink/60">Loading your cart…</p>
        ) : items.length === 0 ? (
          <div className="ticket-card p-8 text-center max-w-md">
            <p className="text-ink/60 mb-5">Your cart is empty.</p>
            <Link href="/" className="btn-primary inline-block">
              Browse the menu
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start">
            <div className="ticket-card divide-y divide-ink/10">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="p-5 flex items-center gap-4"
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <VegIndicator isVeg={item.food.isVeg} />
                    <div className="min-w-0">
                      <p className="font-display font-semibold text-ink truncate">
                        {item.food.name}
                      </p>
                      <p className="font-mono text-xs text-ink/50">
                        {formatRupees(Number(item.food.price))} each
                      </p>
                    </div>
                  </div>

                  <QuantityStepper
                    quantity={item.quantity}
                    onChange={(next) => {
                      if (next < 1) {
                        removeItem(item.id);
                      } else {
                        updateQuantity(item.id, next);
                      }
                    }}
                  />

                  <span className="font-mono text-sm text-ink w-16 text-right">
                    {formatRupees(Number(item.food.price) * item.quantity)}
                  </span>

                  <button
                    onClick={() => removeItem(item.id)}
                    aria-label={`Remove ${item.food.name}`}
                    className="text-ink/35 hover:text-chili transition-colors text-lg leading-none"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            <div className="ticket-card p-6 lg:sticky lg:top-24">
              <div className="flex justify-between text-sm mb-5 pb-5 border-b border-ink/10">
                <span className="text-ink/60">Total</span>
                <span className="font-mono font-semibold text-ink">
                  {formatRupees(subtotal)}
                </span>
              </div>

              <form onSubmit={handleCheckout}>
                <div className="mb-4">
                  <label className="field-label block mb-1.5" htmlFor="address">
                    Delivery address
                  </label>
                  <textarea
                    id="address"
                    className="field-input min-h-[72px] resize-none"
                    placeholder="Flat, street, landmark, city"
                    required
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                  />
                </div>

                <div className="mb-5">
                  <p className="field-label mb-2">Payment method</p>
                  <div className="flex flex-col gap-2">
                    {PAYMENT_OPTIONS.map((opt) => (
                      <button
                        type="button"
                        key={opt.value}
                        onClick={() => setPaymentMethod(opt.value)}
                        className={`text-left px-3.5 py-2.5 rounded-lg border text-sm transition-colors ${
                          paymentMethod === opt.value
                            ? "bg-turmeric/15 border-turmeric text-ink font-medium"
                            : "border-ink/15 text-ink/65 hover:border-ink/30"
                        }`}
                      >
                        {opt.label}
                        {opt.hint && (
                          <span className="font-mono text-[0.68rem] text-ink/40 ml-2">
                            {opt.hint}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {checkoutError && (
                  <p className="error-text mb-4" role="alert">
                    {checkoutError}
                  </p>
                )}

                <button
                  type="submit"
                  className="btn-primary w-full"
                  disabled={isPlacingOrder}
                >
                  {isPlacingOrder
                    ? "Placing order…"
                    : `Place order · ${formatRupees(subtotal)}`}
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
