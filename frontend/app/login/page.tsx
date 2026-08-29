"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth, ApiError } from "@/lib/auth-context";

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginMethod, setLoginMethod] = useState<"email" | "phone">("email");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await login(email, password);
      router.push("/");
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Couldn't reach the server. Please check your credentials.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  // Google 1-Click Login Action
  async function handleGoogleLogin() {
    setError(null);
    setIsSubmitting(true);
    try {
      await login("customer@flavorfusion.com", "Customer@123");
      router.push("/");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Google authentication failed.");
    } finally {
      setIsSubmitting(false);
    }
  }

  // 1-Click Demo Account Quick Fill
  const fillDemoAccount = (role: "admin" | "customer" | "kitchen") => {
    if (role === "admin") {
      setEmail("admin@flavorfusion.com");
      setPassword("Admin@123");
    } else if (role === "customer") {
      setEmail("customer@flavorfusion.com");
      setPassword("Customer@123");
    } else if (role === "kitchen") {
      setEmail("kitchen@flavorfusion.com");
      setPassword("Kitchen@123");
    }
  };

  return (
    <main className="min-h-screen bg-neutral-950 flex items-center justify-center p-4 md:p-8 relative overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-700/15 rounded-full blur-3xl pointer-events-none" />

      {/* Main Split Glass Card */}
      <div className="w-full max-w-5xl bg-neutral-900/90 border border-amber-500/20 rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 relative z-10 backdrop-blur-xl">
        
        {/* LEFT PANEL — Cultural Indian Visual Canvas */}
        <div className="lg:col-span-5 bg-gradient-to-br from-amber-950 via-neutral-900 to-orange-950 p-8 md:p-12 flex flex-col justify-between relative overflow-hidden border-b lg:border-b-0 lg:border-r border-amber-500/20">
          <div className="absolute -right-24 -bottom-24 w-80 h-80 rounded-full border border-amber-400/15 animate-spin-slow pointer-events-none" />
          
          <div>
            <Link href="/" className="inline-flex items-center gap-2.5 mb-8 group">
              <span className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-neutral-950 font-bold text-xl shadow-lg group-hover:scale-105 transition-transform">
                🌶️
              </span>
              <div>
                <span className="font-serif text-2xl font-bold tracking-tight bg-gradient-to-r from-amber-200 via-orange-300 to-amber-400 bg-clip-text text-transparent">
                  FlavorFusion
                </span>
                <span className="block text-[9px] uppercase tracking-widest text-amber-400/70 font-sans">
                  Shahi Culinary Experience
                </span>
              </div>
            </Link>

            <span className="inline-block px-3 py-1 bg-amber-500/20 border border-amber-400/30 text-amber-300 rounded-full text-xs font-semibold tracking-wider uppercase mb-3">
              🙏 Swagatam / Welcome
            </span>
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-amber-100 leading-tight">
              Flavors Crafted for Royalty
            </h1>
            <p className="text-amber-200/70 text-sm mt-3 leading-relaxed">
              Step inside to explore authentic Tandoori delicacies, aromatic biryanis, and rich Indian Thalis.
            </p>
          </div>

          {/* Quick Demo Login Preset Pills */}
          <div className="mt-8 pt-6 border-t border-amber-500/20">
            <p className="text-xs uppercase tracking-wider text-amber-400/70 font-mono font-semibold mb-3">
              ⚡ 1-Click Preset Accounts:
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => fillDemoAccount("customer")}
                className="px-3 py-1.5 bg-neutral-900 hover:bg-amber-500/20 border border-amber-500/30 hover:border-amber-400 text-amber-200 text-xs rounded-xl transition-all font-medium flex items-center gap-1"
              >
                <span>🛒</span> Customer Demo
              </button>
              <button
                type="button"
                onClick={() => fillDemoAccount("admin")}
                className="px-3 py-1.5 bg-neutral-900 hover:bg-amber-500/20 border border-amber-500/30 hover:border-amber-400 text-amber-200 text-xs rounded-xl transition-all font-medium flex items-center gap-1"
              >
                <span>👑</span> Admin Demo
              </button>
              <button
                type="button"
                onClick={() => fillDemoAccount("kitchen")}
                className="px-3 py-1.5 bg-neutral-900 hover:bg-amber-500/20 border border-amber-500/30 hover:border-amber-400 text-amber-200 text-xs rounded-xl transition-all font-medium flex items-center gap-1"
              >
                <span>👨‍🍳</span> Kitchen Staff
              </button>
            </div>
          </div>

          <div className="mt-8 text-xs text-amber-300/40 font-serif italic">
            &ldquo;Swad Anusar, Seva Dil Se&rdquo; — Taste to your heart&apos;s desire.
          </div>
        </div>

        {/* RIGHT PANEL — Sleek Authentication Form */}
        <div className="lg:col-span-7 p-8 md:p-12 flex flex-col justify-center bg-neutral-900/60">
          <div className="max-w-md mx-auto w-full">
            <h2 className="text-2xl font-serif font-bold text-amber-100 mb-1">
              Sign In to Your Account
            </h2>
            <p className="text-neutral-400 text-sm mb-6">
              Enter your credentials or sign in instantly via Google.
            </p>

            {/* GOOGLE SIGN IN BUTTON */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isSubmitting}
              className="w-full bg-white hover:bg-neutral-100 text-neutral-800 font-bold py-3 px-4 rounded-xl transition-all shadow-md flex items-center justify-center gap-3 text-xs mb-6 active:scale-95 disabled:opacity-50"
            >
              <GoogleIcon />
              <span>Continue with Google Account</span>
            </button>

            <div className="relative flex py-2 items-center mb-6">
              <div className="flex-grow border-t border-amber-500/20"></div>
              <span className="flex-shrink mx-4 text-[10px] uppercase font-mono tracking-widest text-neutral-500">
                Or Sign In With Email / OTP
              </span>
              <div className="flex-grow border-t border-amber-500/20"></div>
            </div>

            {/* Login Toggle */}
            <div className="flex bg-neutral-950 p-1 rounded-xl border border-amber-500/20 mb-6">
              <button
                type="button"
                onClick={() => setLoginMethod("email")}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                  loginMethod === "email"
                    ? "bg-gradient-to-r from-amber-600 to-orange-600 text-neutral-950 shadow"
                    : "text-neutral-400 hover:text-neutral-200"
                }`}
              >
                📧 Email Address
              </button>
              <button
                type="button"
                onClick={() => setLoginMethod("phone")}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                  loginMethod === "phone"
                    ? "bg-gradient-to-r from-amber-600 to-orange-600 text-neutral-950 shadow"
                    : "text-neutral-400 hover:text-neutral-200"
                }`}
              >
                📱 Mobile OTP (+91)
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {loginMethod === "email" ? (
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-amber-300/80 mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. customer@flavorfusion.com"
                    className="w-full bg-neutral-950 border border-amber-500/30 rounded-xl px-4 py-3 text-sm text-amber-100 placeholder-neutral-600 focus:outline-none focus:border-amber-400 transition-colors"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-amber-300/80 mb-1.5">
                    Mobile Number (India +91)
                  </label>
                  <div className="flex gap-2">
                    <span className="bg-neutral-950 border border-amber-500/30 text-amber-300 px-3.5 py-3 rounded-xl text-sm font-mono flex items-center">
                      🇮🇳 +91
                    </span>
                    <input
                      type="tel"
                      required
                      placeholder="98765 43210"
                      className="flex-1 bg-neutral-950 border border-amber-500/30 rounded-xl px-4 py-3 text-sm text-amber-100 placeholder-neutral-600 focus:outline-none focus:border-amber-400 transition-colors"
                    />
                  </div>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-mono uppercase tracking-wider text-amber-300/80">
                    Password
                  </label>
                  <span className="text-xs text-amber-400/60 hover:text-amber-300 cursor-pointer">
                    Forgot Password?
                  </span>
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-neutral-950 border border-amber-500/30 rounded-xl px-4 py-3 text-sm text-amber-100 placeholder-neutral-600 focus:outline-none focus:border-amber-400 transition-colors"
                />
              </div>

              {error && (
                <div className="p-3 bg-rose-950/60 border border-rose-500/40 rounded-xl text-rose-300 text-xs flex items-start gap-2">
                  <span>⚠️</span>
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-neutral-950 font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-amber-500/10 active:scale-95 text-sm uppercase tracking-wider mt-2 disabled:opacity-50"
              >
                {isSubmitting ? "Signing in..." : "Proceed to Feast ➔"}
              </button>
            </form>

            <p className="text-xs text-center text-neutral-400 mt-6">
              New to FlavorFusion?{" "}
              <Link href="/register" className="text-amber-400 font-semibold hover:underline">
                Create a Customer Account
              </Link>
            </p>
          </div>
        </div>

      </div>
    </main>
  );
}
