"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

const TABS = [
  { href: "/admin", label: "🔥 Rasoi Orders", icon: "📋" },
  { href: "/admin/menu", label: "📜 Royal Menu", icon: "🍛" },
  { href: "/admin/categories", label: "🏷️ Categories", icon: "📁" },
  { href: "/admin/inventory", label: "📦 Rasad Inventory", icon: "🌾" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (user.role !== "ADMIN" && user.role !== "KITCHEN") {
      router.replace("/");
    }
  }, [isLoading, user, router]);

  if (isLoading || !user || (user.role !== "ADMIN" && user.role !== "KITCHEN")) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-neutral-950 text-neutral-100">
      {/* Top Header */}
      <header className="bg-neutral-900 border-b border-amber-500/20 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-neutral-950 font-bold text-sm">
                👑
              </span>
              <span className="font-serif text-lg font-bold text-amber-200">
                FlavorFusion
              </span>
            </Link>
            <span className="text-[10px] uppercase font-mono tracking-widest px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300">
              Rasoi Management Portal
            </span>
          </div>

          <div className="flex items-center gap-6 text-xs">
            <span className="text-amber-200/80 font-medium hidden sm:inline">
              🙏 Namaste, Chef {user.fullName.split(" ")[0]}
            </span>
            <Link
              href="/"
              className="text-neutral-400 hover:text-amber-300 transition-colors"
            >
              🌐 View Site
            </Link>
            <button
              onClick={() => {
                logout();
                router.push("/");
              }}
              className="text-rose-400 hover:text-rose-300 font-mono transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-7xl mx-auto px-6 flex gap-2 border-t border-neutral-800">
          {TABS.map((tab) => {
            const active =
              tab.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(tab.href);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`text-xs font-semibold px-5 py-3 border-b-2 transition-all flex items-center gap-1.5 ${
                  active
                    ? "border-amber-400 text-amber-300 bg-amber-500/10"
                    : "border-transparent text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/40"
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8">
        {children}
      </main>
    </div>
  );
}
