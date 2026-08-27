"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

const TABS = [
  { href: "/admin", label: "Orders" },
  { href: "/admin/menu", label: "Menu" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/inventory", label: "Inventory" },
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
    if (user.role !== "ADMIN") {
      router.replace("/");
    }
  }, [isLoading, user, router]);

  if (isLoading || !user || user.role !== "ADMIN") {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-ink-soft border-b border-paper/10">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="font-display text-xl font-semibold italic text-paper"
            >
              FlavorFusion
            </Link>
            <span className="font-mono text-[0.65rem] tracking-widest uppercase px-2 py-0.5 rounded-full border border-turmeric/50 text-turmeric">
              Admin
            </span>
          </div>
          <div className="flex items-center gap-5">
            <Link
              href="/"
              className="font-mono text-xs text-paper/60 hover:text-paper transition-colors"
            >
              View site
            </Link>
            <button
              onClick={() => {
                logout();
                router.push("/");
              }}
              className="font-mono text-xs text-paper/60 hover:text-chili transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-6 flex gap-1 -mb-px">
          {TABS.map((tab) => {
            const active =
              tab.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(tab.href);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`font-mono text-xs px-4 py-3 border-b-2 transition-colors ${
                  active
                    ? "border-turmeric text-paper"
                    : "border-transparent text-paper/50 hover:text-paper/80"
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-8">
        {children}
      </main>
    </div>
  );
}
