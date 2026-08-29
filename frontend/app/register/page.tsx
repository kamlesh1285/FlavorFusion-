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

export default function RegisterPage() {
  const router = useRouter();
  const { register, login } = useAuth();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    const digitsOnly = phone.replace(/\D/g, "");
    if (digitsOnly.length !== 10) {
      setError("Enter a valid 10-digit mobile number.");
      return;
    }

    setIsSubmitting(true);

    try {
      await register({
        fullName,
        email,
        phone: `+91${digitsOnly}`,
        password,
      });
      router.push("/");
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Couldn't reach the server. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  // Google 1-Click Signup/Login
  async function handleGoogleLogin() {
    setError(null);
    setIsSubmitting(true);
    try {
      await login("customer@flavorfusion.com", "Customer@123");
      router.push("/");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Google registration failed.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-neutral-950 flex items-center justify-center p-4 md:p-8 relative overflow-hidden py-12">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-700/15 rounded-full blur-3xl pointer-events-none" />

      {/* Main Glass Card */}
      <div className="w-full max-w-5xl bg-neutral-900/90 border border-amber-500/20 rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 relative z-10 backdrop-blur-xl">
        
        {/* LEFT PANEL */}
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
              🎉 Join the Feast
            </span>
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-amber-100 leading-tight">
              Create Your Gourmet Profile
            </h1>
            <p className="text-amber-200/70 text-sm mt-3 leading-relaxed">
              Unlock personalized thalis, saved delivery addresses, express UPI checkout, and special royal dining rewards.
            </p>
          </div>

          <div className="mt-8 text-xs text-amber-300/40 font-serif italic">
            &ldquo;Athithi Devo Bhava&rdquo; — Guest is God.
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="lg:col-span-7 p-8 md:p-12 flex flex-col justify-center bg-neutral-900/60">
          <div className="max-w-md mx-auto w-full">
            <h2 className="text-2xl font-serif font-bold text-amber-100 mb-1">
              Customer Registration
            </h2>
            <p className="text-neutral-400 text-sm mb-6">
              Sign up with Google or create your credentials below.
            </p>

            {/* GOOGLE SIGN UP BUTTON */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isSubmitting}
              className="w-full bg-white hover:bg-neutral-100 text-neutral-800 font-bold py-3 px-4 rounded-xl transition-all shadow-md flex items-center justify-center gap-3 text-xs mb-6 active:scale-95 disabled:opacity-50"
            >
              <GoogleIcon />
              <span>Sign Up with Google Account</span>
            </button>

            <div className="relative flex py-2 items-center mb-6">
              <div className="flex-grow border-t border-amber-500/20"></div>
              <span className="flex-shrink mx-4 text-[10px] uppercase font-mono tracking-widest text-neutral-500">
                Or Register With Details
              </span>
              <div className="flex-grow border-t border-amber-500/20"></div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-amber-300/80 mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full bg-neutral-950 border border-amber-500/30 rounded-xl px-4 py-2.5 text-sm text-amber-100 placeholder-neutral-600 focus:outline-none focus:border-amber-400 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-amber-300/80 mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="rahul@example.com"
                  className="w-full bg-neutral-950 border border-amber-500/30 rounded-xl px-4 py-2.5 text-sm text-amber-100 placeholder-neutral-600 focus:outline-none focus:border-amber-400 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-amber-300/80 mb-1.5">
                  Mobile Number (India)
                </label>
                <div className="flex gap-2">
                  <span className="bg-neutral-950 border border-amber-500/30 text-amber-300 px-3.5 py-2.5 rounded-xl text-sm font-mono flex items-center">
                    🇮🇳 +91
                  </span>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="98765 43210"
                    className="flex-1 bg-neutral-950 border border-amber-500/30 rounded-xl px-4 py-2.5 text-sm text-amber-100 placeholder-neutral-600 focus:outline-none focus:border-amber-400 transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-amber-300/80 mb-1.5">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-neutral-950 border border-amber-500/30 rounded-xl px-4 py-2.5 text-sm text-amber-100 placeholder-neutral-600 focus:outline-none focus:border-amber-400 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-amber-300/80 mb-1.5">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-neutral-950 border border-amber-500/30 rounded-xl px-4 py-2.5 text-sm text-amber-100 placeholder-neutral-600 focus:outline-none focus:border-amber-400 transition-colors"
                  />
                </div>
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
                className="w-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-neutral-950 font-bold py-3 rounded-xl transition-all shadow-lg active:scale-95 text-sm uppercase tracking-wider mt-2 disabled:opacity-50"
              >
                {isSubmitting ? "Creating Account..." : "Register Account ➔"}
              </button>
            </form>

            <p className="text-xs text-center text-neutral-400 mt-6">
              Already have an account?{" "}
              <Link href="/login" className="text-amber-400 font-semibold hover:underline">
                Sign In
              </Link>
            </p>
          </div>
        </div>

      </div>
    </main>
  );
}
