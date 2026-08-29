"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { QuantityStepper } from "@/components/QuantityStepper";
import VegBadge from "@/components/VegBadge";
import { UpiPayment } from "@/components/UpiPayment";
import { useAuth } from "@/lib/auth-context";
import { useCart } from "@/lib/cart-context";
import { ApiError, type OrderDto, type PaymentMethod } from "@/lib/api";

const PAYMENT_OPTIONS: { value: PaymentMethod; label: string; hint?: string; icon: string }[] = [
  { value: "UPI", label: "UPI Deep Link & QR Code", hint: "Scan & pay via GPay, PhonePe, Paytm", icon: "📱" },
  { value: "CASH_ON_DELIVERY", label: "Cash / Pay on Delivery", hint: "Pay after receiving your feast", icon: "💵" },
  { value: "CARD", label: "Credit / Debit Card", hint: "Instant mock processing", icon: "💳" },
];

function formatRupees(amount: number) {
  return `₹${amount.toFixed(0)}`;
}

export default function CartPage() {
  const router = useRouter();
  const { token, isLoading: authLoading } = useAuth();
  const { cart, subtotal, isLoading, updateQuantity, removeItem, checkout } = useCart();

  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("UPI");
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
      setCheckoutError("Please enter your complete delivery address.");
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
      <div className="min-h-screen flex flex-col bg-amber-50/40 text-neutral-900">
        <Navbar />
        <main className="flex-1 max-w-lg mx-auto w-full px-6 py-12">
          <div className="bg-neutral-950 text-amber-50 rounded-3xl p-8 border border-amber-500/30 shadow-2xl space-y-6">
            <div className="text-center">
              <span className="text-4xl block mb-2">🎉</span>
              <span className="bg-amber-500 text-neutral-950 font-mono text-xs font-bold px-3 py-1 rounded-full shadow inline-block mb-2">
                🎫 TOKEN #{confirmedOrder.tokenNumber || `TK-${new Date(confirmedOrder.createdAt).toISOString().slice(0,10).replace(/-/g,'')}-${confirmedOrder.id.slice(0,4).toUpperCase()}`}
              </span>
              <h1 className="text-2xl font-serif font-bold text-amber-100 mt-1">
                Sent to Rasoi Kitchen!
              </h1>
              <p className="text-xs font-mono text-neutral-400 mt-1">
                ORDER ID: #{confirmedOrder.id.slice(0, 8).toUpperCase()}
              </p>
            </div>

            <div className="bg-neutral-900 p-4 rounded-2xl border border-neutral-800 space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-neutral-400">Status:</span>
                <span className="font-bold text-amber-400">{confirmedOrder.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Payment:</span>
                <span className="font-bold text-emerald-400">{confirmedOrder.paymentStatus} ({confirmedOrder.paymentMethod})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Address:</span>
                <span className="text-neutral-200 text-right max-w-[60%]">{confirmedOrder.deliveryAddress}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-neutral-800 text-sm">
                <span className="font-bold text-neutral-300">Total Paid:</span>
                <span className="font-bold text-amber-300">{formatRupees(Number(confirmedOrder.totalAmount))}</span>
              </div>
            </div>

            {confirmedOrder.paymentMethod === "UPI" &&
              confirmedOrder.paymentStatus === "PENDING" &&
              confirmedOrder.upiLink && (
                <div className="mt-4">
                  <UpiPayment upiLink={confirmedOrder.upiLink} />
                </div>
              )}

            <Link
              href="/orders"
              className="block w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-neutral-950 font-bold py-3 rounded-xl text-center text-xs uppercase tracking-wider shadow-lg transition-all"
            >
              Track Order Status ➔
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const items = cart?.items ?? [];

  return (
    <div className="min-h-screen flex flex-col bg-amber-50/40 text-neutral-900">
      <Navbar />
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 md:px-8 py-10">
        <div className="mb-6">
          <span className="text-xs uppercase tracking-widest font-mono text-amber-800 font-semibold">Your Royal Feast</span>
          <h1 className="text-3xl font-serif font-bold text-neutral-900">Thali Shopping Cart</h1>
        </div>

        {isLoading ? (
          <p className="text-sm font-mono text-neutral-500 animate-pulse">Loading cart items...</p>
        ) : items.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-3xl border border-amber-900/10 max-w-md mx-auto shadow-sm">
            <span className="text-4xl block mb-3">🍲</span>
            <h2 className="text-lg font-serif font-bold text-neutral-800">Your cart is currently empty</h2>
            <p className="text-neutral-500 text-xs mt-1 mb-6">Explore our menu to add authentic dishes and combos.</p>
            <Link href="/" className="bg-gradient-to-r from-amber-600 to-orange-600 text-white font-bold px-6 py-2.5 rounded-xl text-xs inline-block shadow-md">
              Browse Indian Menu
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Cart Items List */}
            <div className="lg:col-span-7 bg-white rounded-3xl border border-amber-900/10 shadow-sm divide-y divide-neutral-100 overflow-hidden">
              {items.map((item) => (
                <div key={item.id} className="p-5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <VegBadge isVeg={item.food.isVeg} />
                    <div className="min-w-0">
                      <h3 className="font-serif font-bold text-neutral-900 text-sm truncate">{item.food.name}</h3>
                      <span className="text-xs font-semibold text-amber-800">{formatRupees(Number(item.food.price))}</span>
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

                  <span className="font-bold text-neutral-900 text-sm min-w-[60px] text-right">
                    {formatRupees(Number(item.food.price) * item.quantity)}
                  </span>

                  <button
                    onClick={() => removeItem(item.id)}
                    aria-label={`Remove ${item.food.name}`}
                    className="text-neutral-400 hover:text-rose-600 transition-colors text-lg font-bold"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            {/* Checkout Form Card */}
            <div className="lg:col-span-5 bg-neutral-900 text-amber-50 rounded-3xl p-6 border border-amber-500/20 shadow-xl space-y-6 lg:sticky lg:top-24">
              <div className="flex justify-between items-center border-b border-neutral-800 pb-4">
                <span className="text-xs uppercase font-mono text-neutral-400">Total Amount</span>
                <span className="text-2xl font-bold text-amber-400">{formatRupees(subtotal)}</span>
              </div>

              <form onSubmit={handleCheckout} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-amber-300/80 mb-1.5" htmlFor="address">
                    Delivery Address
                  </label>
                  <textarea
                    id="address"
                    className="w-full bg-neutral-950 border border-amber-500/30 rounded-xl p-3 text-xs text-amber-100 placeholder-neutral-600 focus:outline-none focus:border-amber-400 min-h-[72px] resize-none"
                    placeholder="House/Flat No., Street, Landmark, Pincode"
                    required
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-amber-300/80 mb-2">
                    Payment Option
                  </label>
                  <div className="space-y-2">
                    {PAYMENT_OPTIONS.map((opt) => (
                      <button
                        type="button"
                        key={opt.value}
                        onClick={() => setPaymentMethod(opt.value)}
                        className={`w-full text-left p-3 rounded-xl border text-xs transition-all flex items-start gap-2.5 ${
                          paymentMethod === opt.value
                            ? "bg-amber-500/20 border-amber-400 text-amber-200"
                            : "bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700"
                        }`}
                      >
                        <span className="text-base">{opt.icon}</span>
                        <div>
                          <span className="font-semibold block text-amber-100">{opt.label}</span>
                          {opt.hint && <span className="text-[10px] text-neutral-400 block mt-0.5">{opt.hint}</span>}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {checkoutError && (
                  <div className="p-3 bg-rose-950/60 border border-rose-500/40 rounded-xl text-rose-300 text-xs">
                    ⚠️ {checkoutError}
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-neutral-950 font-bold py-3.5 rounded-xl transition-all shadow-lg active:scale-95 text-xs uppercase tracking-wider disabled:opacity-50 mt-4"
                  disabled={isPlacingOrder}
                >
                  {isPlacingOrder ? "Placing Order..." : `Confirm & Pay ${formatRupees(subtotal)} ➔`}
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
