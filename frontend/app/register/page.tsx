"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { TicketCard } from "@/components/TicketCard";
import { FormField } from "@/components/FormField";
import { useAuth, ApiError } from "@/lib/auth-context";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();

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
      setError("Enter a 10-digit mobile number.");
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

  return (
    <main className="min-h-screen flex items-center justify-center p-6 py-12">
      <TicketCard
        eyebrow="First visit"
        title="Create an account"
        subtitle="Takes about a minute. Then straight to the menu."
        ticketNo="001"
      >
        <form onSubmit={handleSubmit} noValidate>
          <FormField
            id="fullName"
            label="Full name"
            type="text"
            autoComplete="name"
            placeholder="Rahul Sharma"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
          <FormField
            id="email"
            label="Email"
            type="email"
            autoComplete="email"
            placeholder="rahul@example.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <FormField
            id="phone"
            label="Mobile number"
            type="tel"
            autoComplete="tel"
            placeholder="98765 43210"
            inputMode="numeric"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <FormField
            id="password"
            label="Password"
            type="password"
            autoComplete="new-password"
            placeholder="At least 6 characters"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <FormField
            id="confirmPassword"
            label="Confirm password"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          {error && (
            <p className="error-text mb-4" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="btn-primary w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p className="font-mono text-[0.78rem] text-ink/55 mt-6 text-center">
          Already have an account?{" "}
          <Link href="/login" className="text-chili font-medium">
            Sign in
          </Link>
        </p>
      </TicketCard>
    </main>
  );
}
