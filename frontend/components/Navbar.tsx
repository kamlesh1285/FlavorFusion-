"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useCart } from "@/lib/cart-context";

function CartIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  );
}

export function Navbar() {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const router = useRouter();

  function handleLogout() {
    logout();
    router.push("/");
  }

  return (
    <header className="sticky top-0 z-50 bg-neutral-950/90 backdrop-blur-md border-b border-amber-500/20 text-neutral-100 shadow-xl">
      <div className="max-w-6xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <span className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-600 to-orange-500 flex items-center justify-center text-neutral-950 font-bold text-lg shadow-md group-hover:scale-105 transition-transform">
            🌶️
          </span>
          <div>
            <span className="font-serif text-xl font-bold tracking-tight bg-gradient-to-r from-amber-200 via-orange-300 to-amber-400 bg-clip-text text-transparent">
              FlavorFusion
            </span>
            <span className="block text-[9px] uppercase tracking-widest text-amber-400/70 font-sans -mt-1">
              Royal Indian Dining
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <div className="flex items-center gap-4 md:gap-6">
          <Link
            href="/"
            className="text-xs md:text-sm font-medium text-amber-100/80 hover:text-amber-300 transition-colors hidden sm:inline"
          >
            Menu & Feast
          </Link>

          {user && (
            <Link
              href="/orders"
              className="text-xs md:text-sm font-medium text-amber-100/80 hover:text-amber-300 transition-colors hidden sm:inline"
            >
              My Orders
            </Link>
          )}

          {user?.role === "KITCHEN" && (
            <Link
              href="/kitchen"
              className="font-mono text-xs text-turmeric hover:text-paper transition-colors hidden sm:inline"
            >
              Kitchen
            </Link>
          )}

          {user?.role === "DELIVERY" && (
            <Link
              href="/delivery"
              className="font-mono text-xs text-turmeric hover:text-paper transition-colors hidden sm:inline"
            >
              Delivery
            </Link>
          )}

          {user?.role === "ADMIN" && (
            <Link
              href="/admin"
              className="px-3 py-1 bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-semibold rounded-lg hover:bg-amber-500/30 transition-colors flex items-center gap-1.5"
            >
              <span>👑</span>
              <span>Rasoi Dashboard</span>
            </Link>
          )}

          {/* Cart Icon & Counter */}
          <Link
            href="/cart"
            className="relative flex items-center gap-2 bg-neutral-900 border border-amber-500/30 px-3.5 py-1.5 rounded-full text-amber-200 hover:border-amber-400 hover:text-amber-100 transition-all text-xs font-medium"
          >
            <CartIcon />
            <span className="hidden sm:inline">Thali Cart</span>
            {itemCount > 0 && (
              <span className="bg-orange-600 text-neutral-950 font-bold text-[10px] rounded-full h-5 w-5 flex items-center justify-center shadow-md animate-pulse">
                {itemCount}
              </span>
            )}
          </Link>

          {/* User Section */}
          {user ? (
            <div className="flex items-center gap-3 border-l border-amber-500/20 pl-4">
              <Link
                href="/profile"
                className="text-xs text-amber-300/90 hover:text-amber-200 font-medium hidden md:inline truncate max-w-[100px]"
              >
                🙏 Namaste, {user.fullName.split(" ")[0]}
              </Link>
              <button
                onClick={handleLogout}
                className="text-xs text-neutral-400 hover:text-rose-400 transition-colors font-mono"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-neutral-950 font-semibold px-4 py-1.5 rounded-xl text-xs transition-all shadow-md active:scale-95"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
