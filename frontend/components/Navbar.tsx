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
    <header className="sticky top-0 z-10 bg-ink-soft/95 backdrop-blur border-b border-paper/10">
      <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link
          href="/"
          className="font-display text-xl font-semibold italic text-paper"
        >
          FlavorFusion
        </Link>

        <div className="flex items-center gap-5">
          {user && (
            <Link
              href="/profile"
              className="font-mono text-xs text-paper/70 hover:text-paper transition-colors hidden sm:inline"
            >
              Profile
            </Link>
          )}

          {user && (
            <Link
              href="/orders"
              className="font-mono text-xs text-paper/70 hover:text-paper transition-colors hidden sm:inline"
            >
              Orders
            </Link>
          )}

          {user?.role === "ADMIN" && (
            <Link
              href="/admin"
              className="font-mono text-xs text-turmeric hover:text-paper transition-colors hidden sm:inline"
            >
              Admin
            </Link>
          )}

          <Link
            href="/cart"
            className="relative flex items-center gap-2 text-paper/85 hover:text-paper transition-colors"
          >
            <CartIcon />
            <span className="font-mono text-xs tracking-wide hidden sm:inline">
              Cart
            </span>
            {itemCount > 0 && (
              <span className="absolute -top-2 -right-2.5 bg-chili text-paper text-[0.65rem] font-mono font-semibold rounded-full h-4 w-4 flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </Link>

          {user ? (
            <div className="flex items-center gap-4">
              <span className="font-mono text-xs text-paper/60 hidden sm:inline">
                {user.fullName.split(" ")[0]}
              </span>
              <button
                onClick={handleLogout}
                className="font-mono text-xs text-paper/70 hover:text-chili transition-colors"
              >
                Sign out
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="font-mono text-xs text-turmeric hover:text-paper transition-colors"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
