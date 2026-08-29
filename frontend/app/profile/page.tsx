"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { useAuth, ApiError } from "@/lib/auth-context";
import { changePassword, updateProfile, getMyOrders, type AuthUser, type OrderWithItemsDto } from "@/lib/api";

const CITY_RECOMMENDATIONS: Record<string, { title: string; desc: string; dishes: { name: string; tag: string; price: string; icon: string }[] }> = {
  "Jaipur (Pink City)": {
    title: "Rajasthani Royal Specials",
    desc: "Curated delicacies popular in Pink City & Jaipur Royal Heritage Kitchens.",
    dishes: [
      { name: "Dal Baati Churma Feast", tag: "Jaipur Special", price: "₹280", icon: "🍲" },
      { name: "Paneer Butter Masala", tag: "Customer Favorite", price: "₹240", icon: "🧀" },
      { name: "Shahi Rajbhog Sweets", tag: "Authentic Mithai", price: "₹160", icon: "🍯" },
    ],
  },
  "Delhi NCR": {
    title: "Old Delhi Street & Mughlai Delights",
    desc: "Infused with rich spices from Chandni Chowk & Daryaganj.",
    dishes: [
      { name: "Butter Chicken & Garlic Naan", tag: "Delhi Classic", price: "₹340", icon: "🍗" },
      { name: "Amritsari Chole Bhature", tag: "Popular Breakfast", price: "₹180", icon: "🍞" },
      { name: "Gulab Jamun Pair", tag: "Dessert Pick", price: "₹120", icon: "🍮" },
    ],
  },
  "Mumbai": {
    title: "Aamchi Mumbai Tastes",
    desc: "Coastal curries, pav delicacies, and fast street snacks.",
    dishes: [
      { name: "Special Butter Pav Bhaji", tag: "Chowpatty Icon", price: "₹160", icon: "🍞" },
      { name: "Hyderabadi Dum Biryani", tag: "Top Rated", price: "₹290", icon: "🍲" },
      { name: "Fresh Mango Lassi", tag: "Chilled Drink", price: "₹90", icon: "🥭" },
    ],
  },
  "Bengaluru": {
    title: "South Indian Express & Fusion",
    desc: "Fresh coconut chutneys, crispy dosas, and filter coffee.",
    dishes: [
      { name: "Royal South Indian Thali", tag: "Complete Meal", price: "₹220", icon: "🍛" },
      { name: "Ghee Roast Dosa", tag: "Crispy Delight", price: "₹140", icon: "🥞" },
      { name: "Filter Kaapi", tag: "Hot Beverage", price: "₹60", icon: "☕" },
    ],
  },
};

export default function ProfilePage() {
  const router = useRouter();
  const { user, token, isLoading: authLoading, setUserData } = useAuth();

  const [myOrders, setMyOrders] = useState<OrderWithItemsDto[]>([]);
  const [selectedCity, setSelectedCity] = useState<string>("Jaipur (Pink City)");
  
  // Profile Form States
  const [fullName, setFullName] = useState(user?.fullName || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone ? user.phone.replace(/^\+91/, "") : "");
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Password States
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
      return;
    }
    if (token) {
      getMyOrders(token).then(setMyOrders).catch(() => {});
    }
    if (user) {
      setFullName(user.fullName);
      setEmail(user.email);
      setPhone(user.phone.replace(/^\+91/, ""));
    }
  }, [authLoading, user, token, router]);

  if (authLoading || !user) {
    return null;
  }

  // Calculate Order Stats
  const totalOrders = myOrders.length;
  const totalSpent = myOrders.reduce((sum, o) => sum + parseFloat(o.totalAmount || "0"), 0);

  async function handleProfileSubmit(e: FormEvent) {
    e.preventDefault();
    if (!token) return;

    setProfileError(null);
    setProfileSuccess(false);

    const digitsOnly = phone.replace(/\D/g, "");
    if (digitsOnly.length !== 10) {
      setProfileError("Enter a valid 10-digit mobile number.");
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
        err instanceof ApiError ? err.message : "Couldn't save changes.",
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
        err instanceof ApiError ? err.message : "Couldn't change password.",
      );
    } finally {
      setIsSavingPassword(false);
    }
  }

  const currentRecommendation = CITY_RECOMMENDATIONS[selectedCity] || CITY_RECOMMENDATIONS["Jaipur (Pink City)"];

  return (
    <div className="min-h-screen flex flex-col bg-amber-50/40 text-neutral-900">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 md:px-8 py-10 space-y-8">
        
        {/* User Greeting & Stats Header */}
        <div className="bg-gradient-to-r from-amber-950 via-neutral-900 to-orange-950 text-amber-50 p-6 md:p-8 rounded-3xl border border-amber-500/20 shadow-2xl relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-neutral-950 text-2xl font-bold shadow-lg">
                👤
              </div>
              <div>
                <span className="inline-block px-2.5 py-0.5 bg-amber-500/20 border border-amber-400/40 text-amber-300 rounded-full text-[10px] font-mono uppercase tracking-wider mb-1">
                  👑 Shahi Gourmet Member
                </span>
                <h1 className="text-2xl md:text-3xl font-serif font-bold text-amber-100">
                  {user.fullName}
                </h1>
                <p className="text-xs text-neutral-400 font-mono mt-0.5">
                  {user.email} • {user.phone}
                </p>
              </div>
            </div>

            {/* Quick Customer Stats Cards */}
            <div className="flex gap-4">
              <div className="bg-neutral-950/80 border border-amber-500/30 px-5 py-3 rounded-2xl text-center flex-1 md:flex-initial">
                <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 block">Total Orders</span>
                <span className="text-2xl font-bold text-amber-400">{totalOrders}</span>
              </div>
              <div className="bg-neutral-950/80 border border-amber-500/30 px-5 py-3 rounded-2xl text-center flex-1 md:flex-initial">
                <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 block">Total Spent</span>
                <span className="text-2xl font-bold text-emerald-400">₹{totalSpent.toFixed(0)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION: Recommended Dishes Near Customer Location */}
        <div className="bg-white rounded-3xl border border-amber-900/10 p-6 md:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-100 pb-4">
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-amber-700 font-semibold">
                📍 Location Based Culinary Recommendations
              </span>
              <h2 className="text-xl font-serif font-bold text-neutral-900 mt-0.5">
                Best Suggested Menu Near You
              </h2>
            </div>

            {/* Location Selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-neutral-500 font-medium">Select City:</span>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="bg-amber-50 border border-amber-900/20 text-neutral-900 text-xs font-bold px-3.5 py-2 rounded-xl focus:outline-none focus:border-amber-600"
              >
                {Object.keys(CITY_RECOMMENDATIONS).map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold text-amber-800">{currentRecommendation.title}</h3>
            <p className="text-xs text-neutral-500 mt-0.5 mb-4">{currentRecommendation.desc}</p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {currentRecommendation.dishes.map((dish, i) => (
                <div key={i} className="bg-amber-50/60 border border-amber-900/10 rounded-2xl p-4 flex items-center justify-between gap-3 hover:border-amber-400 transition-all">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{dish.icon}</span>
                    <div>
                      <span className="text-[10px] font-bold text-amber-700 uppercase block">{dish.tag}</span>
                      <h4 className="text-xs font-bold text-neutral-900">{dish.name}</h4>
                      <span className="text-xs font-bold text-neutral-700">{dish.price}</span>
                    </div>
                  </div>
                  <a
                    href="/"
                    className="text-xs font-bold bg-amber-600 text-white px-3 py-1.5 rounded-lg shadow hover:bg-amber-700 transition-colors"
                  >
                    Order
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* SECTION: Forms (Personal Details & Security) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Edit Profile Form */}
          <div className="bg-white rounded-3xl border border-amber-900/10 p-6 md:p-8 shadow-sm">
            <h2 className="text-lg font-serif font-bold text-neutral-900 mb-4 flex items-center gap-2">
              <span>📝</span> Personal Information
            </h2>
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-neutral-500 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 text-xs text-neutral-900 focus:outline-none focus:border-amber-600"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-neutral-500 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 text-xs text-neutral-900 focus:outline-none focus:border-amber-600"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-neutral-500 mb-1">
                  Mobile Number (India)
                </label>
                <div className="flex gap-2">
                  <span className="bg-neutral-100 border border-neutral-200 text-neutral-700 px-3 py-2.5 rounded-xl text-xs font-mono flex items-center">
                    🇮🇳 +91
                  </span>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="flex-1 bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 text-xs text-neutral-900 focus:outline-none focus:border-amber-600"
                  />
                </div>
              </div>

              {profileError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
                  ⚠️ {profileError}
                </div>
              )}
              {profileSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl">
                  ✓ Profile updated successfully!
                </div>
              )}

              <button
                type="submit"
                disabled={isSavingProfile}
                className="w-full bg-neutral-900 hover:bg-neutral-800 text-amber-100 font-bold py-2.5 rounded-xl text-xs uppercase tracking-wider shadow transition-all disabled:opacity-50"
              >
                {isSavingProfile ? "Saving..." : "Save Profile Details"}
              </button>
            </form>
          </div>

          {/* Change Password Form */}
          <div className="bg-white rounded-3xl border border-amber-900/10 p-6 md:p-8 shadow-sm">
            <h2 className="text-lg font-serif font-bold text-neutral-900 mb-4 flex items-center gap-2">
              <span>🔒</span> Security & Password
            </h2>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-neutral-500 mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 text-xs text-neutral-900 focus:outline-none focus:border-amber-600"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-neutral-500 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 text-xs text-neutral-900 focus:outline-none focus:border-amber-600"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-neutral-500 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  required
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 text-xs text-neutral-900 focus:outline-none focus:border-amber-600"
                />
              </div>

              {passwordError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
                  ⚠️ {passwordError}
                </div>
              )}
              {passwordSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl">
                  ✓ Password updated successfully!
                </div>
              )}

              <button
                type="submit"
                disabled={isSavingPassword}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-2.5 rounded-xl text-xs uppercase tracking-wider shadow transition-all disabled:opacity-50"
              >
                {isSavingPassword ? "Updating..." : "Update Password"}
              </button>
            </form>
          </div>

        </div>

      </main>
    </div>
  );
}
