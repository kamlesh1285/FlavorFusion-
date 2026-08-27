"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { FormField } from "@/components/FormField";
import { useAuth, ApiError } from "@/lib/auth-context";
import { changePassword, updateProfile, type AuthUser } from "@/lib/api";

// Only mounts once `user` is guaranteed non-null (see the guard in
// ProfilePage below), so lazy useState initializers correctly pick up
// the user's current details without needing an effect to sync them.
function ProfileForms({ user }: { user: AuthUser }) {
  const { token, setUserData } = useAuth();

  const [fullName, setFullName] = useState(user.fullName);
  const [email, setEmail] = useState(user.email);
  // Strip the +91 prefix for the plain 10-digit input, mirroring register.
  const [phone, setPhone] = useState(user.phone.replace(/^\+91/, ""));
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  async function handleProfileSubmit(e: FormEvent) {
    e.preventDefault();
    if (!token) return;

    setProfileError(null);
    setProfileSuccess(false);

    const digitsOnly = phone.replace(/\D/g, "");
    if (digitsOnly.length !== 10) {
      setProfileError("Enter a 10-digit mobile number.");
      return;
    }

    setIsSavingProfile(true);
    try {
      const updated = await updateProfile(token, {
        fullName: fullName.trim(),
        email: email.trim(),
        phone: `+91${digitsOnly}`,
      });
      setUserData(updated);
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 2500);
    } catch (err) {
      setProfileError(
        err instanceof ApiError
          ? err.message
          : "Couldn't save your changes. Please try again.",
      );
    } finally {
      setIsSavingProfile(false);
    }
  }

  async function handlePasswordSubmit(e: FormEvent) {
    e.preventDefault();
    if (!token) return;

    setPasswordError(null);
    setPasswordSuccess(false);

    if (newPassword !== confirmNewPassword) {
      setPasswordError("New passwords don't match.");
      return;
    }

    setIsSavingPassword(true);
    try {
      await changePassword(token, { currentPassword, newPassword });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
      setPasswordSuccess(true);
      setTimeout(() => setPasswordSuccess(false), 2500);
    } catch (err) {
      setPasswordError(
        err instanceof ApiError
          ? err.message
          : "Couldn't change your password. Please try again.",
      );
    } finally {
      setIsSavingPassword(false);
    }
  }

  return (
    <>
      <div className="ticket-card p-6 mb-6">
        <h2 className="font-display text-lg font-semibold text-ink mb-5">
          Details
        </h2>
        <form onSubmit={handleProfileSubmit} noValidate>
          <FormField
            id="fullName"
            label="Full name"
            type="text"
            autoComplete="name"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
          <FormField
            id="email"
            label="Email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <FormField
            id="phone"
            label="Mobile number"
            type="tel"
            autoComplete="tel"
            inputMode="numeric"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          {profileError && (
            <p className="error-text mb-4" role="alert">
              {profileError}
            </p>
          )}
          {profileSuccess && (
            <p className="font-mono text-[0.78rem] text-masala mb-4">
              Saved ✓
            </p>
          )}

          <button
            type="submit"
            className="btn-primary w-full"
            disabled={isSavingProfile}
          >
            {isSavingProfile ? "Saving…" : "Save changes"}
          </button>
        </form>
      </div>

      <div className="ticket-card p-6">
        <h2 className="font-display text-lg font-semibold text-ink mb-5">
          Change password
        </h2>
        <form onSubmit={handlePasswordSubmit} noValidate>
          <FormField
            id="currentPassword"
            label="Current password"
            type="password"
            autoComplete="current-password"
            required
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
          <FormField
            id="newPassword"
            label="New password"
            type="password"
            autoComplete="new-password"
            placeholder="At least 6 characters"
            required
            minLength={6}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <FormField
            id="confirmNewPassword"
            label="Confirm new password"
            type="password"
            autoComplete="new-password"
            required
            value={confirmNewPassword}
            onChange={(e) => setConfirmNewPassword(e.target.value)}
          />

          {passwordError && (
            <p className="error-text mb-4" role="alert">
              {passwordError}
            </p>
          )}
          {passwordSuccess && (
            <p className="font-mono text-[0.78rem] text-masala mb-4">
              Password updated ✓
            </p>
          )}

          <button
            type="submit"
            className="btn-primary w-full"
            disabled={isSavingPassword}
          >
            {isSavingPassword ? "Updating…" : "Update password"}
          </button>
        </form>
      </div>
    </>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
    }
  }, [authLoading, user, router]);

  if (authLoading || !user) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-md mx-auto w-full px-6 py-10">
        <p className="field-label text-ink/50 mb-2">Account</p>
        <h1 className="font-display text-3xl font-semibold italic mb-2">
          Your profile
        </h1>
        <p className="font-mono text-[0.7rem] tracking-wider text-ink/45 uppercase mb-8">
          {user.role}
        </p>

        <ProfileForms key={user.id} user={user} />
      </main>
    </div>
  );
}
