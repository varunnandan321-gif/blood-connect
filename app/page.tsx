"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Droplet, Heart, Shield, Activity, ArrowRight, UserPlus, LogIn } from "lucide-react";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { auth, db } from "@/lib/firebase/config";
import { doc, setDoc } from "firebase/firestore";

export default function LandingPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    bloodGroup: "",
  });

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, formData.email, formData.password);
        router.push("/dashboard");
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        const user = userCredential.user;

        // Save to Firestore
        await setDoc(doc(db, "Users", user.uid), {
          uid: user.uid,
          email: user.email,
          name: formData.name,
          bloodGroup: formData.bloodGroup || null,
          role: "user", // Default role since everyone can do everything
          createdAt: new Date().toISOString()
        });

        router.push("/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "Authentication failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!formData.email) {
      setError("Please enter your email above first, then click 'Forgot your password?'");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await sendPasswordResetEmail(auth, formData.email);
      setError("Password reset email sent! Check your inbox.");
    } catch (err: any) {
      setError(err.message || "Failed to send reset email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen flex items-center justify-center overflow-hidden relative selection:bg-medical-red/20 selection:text-medical-red font-sans">
      {/* Background Elements */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-rose-50 via-white to-orange-50 dark:from-stone-900 dark:via-background-dark dark:to-stone-950"></div>
        {/* ECG Background Animation */}
        <svg className="absolute top-10 left-10 opacity-10 dark:opacity-5" height="150" viewBox="0 0 400 150" width="400">
          <path className="ecg-line-v2" d="M0,75 L40,75 L50,55 L65,95 L80,30 L95,120 L105,75 L150,75 L160,20 L180,130 L200,75 L280,75 L290,50 L305,100 L320,75 L400,75" fill="none" stroke="#e11d48" strokeWidth="2"></path>
        </svg>
        {/* Watermark Logo */}
        <div className="absolute bottom-[-10%] right-[-5%] opacity-[0.03] dark:opacity-[0.02] transform rotate-12">
          <svg className="text-medical-red" fill="currentColor" height="600" viewBox="0 0 48 48" width="600">
            <path d="M36.7273 44C33.9891 44 31.6043 39.8386 30.3636 33.69C29.123 39.8386 26.7382 44 24 44C21.2618 44 18.877 39.8386 17.6364 33.69C16.3957 39.8386 14.0109 44 11.2727 44C7.25611 44 4 35.0457 4 24C4 12.9543 7.25611 4 11.2727 4C14.0109 4 16.3957 8.16144 17.6364 14.31C18.877 8.16144 21.2618 4 24 4C26.7382 4 29.123 8.16144 30.3636 14.31C31.6043 8.16144 33.9891 4 36.7273 4C40.7439 4 44 12.9543 44 24C44 35.0457 40.7439 44 36.7273 44Z"></path>
          </svg>
        </div>
      </div>
      <main className="container mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10 max-w-7xl">
        {/* Left Section (Hero Area) */}
        <div className="flex flex-col gap-8 lg:pr-12">
          <div className="fade-up-v2 inline-flex items-center gap-3 bg-white/80 dark:bg-stone-800/80 px-4 py-2 rounded-full border border-rose-100 dark:border-stone-700 shadow-sm w-fit heart-pulse-v2">
            <div className="w-6 h-6 text-medical-red flex shrink-0 justify-center items-center">
              <svg fill="currentColor" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6">
                <path d="M36.7273 44C33.9891 44 31.6043 39.8386 30.3636 33.69C29.123 39.8386 26.7382 44 24 44C21.2618 44 18.877 39.8386 17.6364 33.69C16.3957 39.8386 14.0109 44 11.2727 44C7.25611 44 4 35.0457 4 24C4 12.9543 7.25611 4 11.2727 4C14.0109 4 16.3957 8.16144 17.6364 14.31C18.877 8.16144 21.2618 4 24 4C26.7382 4 29.123 8.16144 30.3636 14.31C31.6043 8.16144 33.9891 4 36.7273 4C40.7439 4 44 12.9543 44 24C44 35.0457 40.7439 44 36.7273 44Z"></path>
              </svg>
            </div>
            <span className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-widest leading-none">Blood Connect</span>
          </div>
          <div className="space-y-4">
            <h1 className="text-6xl lg:text-8xl font-black text-slate-900 dark:text-slate-100 leading-[1.1] tracking-tighter">
              <span className="fade-up-v2 block">Save a Life.</span>
              <span className="fade-up-v2 block text-medical-red" style={{ animationDelay: '0.2s' }}>Give Blood.</span>
            </h1>
            <p className="fade-up-v2 text-lg text-slate-600 dark:text-slate-400 max-w-md leading-relaxed" style={{ animationDelay: '0.4s' }}>
              A centralized real-time platform connecting blood donors with recipients during critical moments. Your contribution can change a story today.
            </p>
          </div>
          <div className="fade-up-v2 flex items-center gap-6" style={{ animationDelay: '0.7s' }}>
            <div className="flex -space-x-3">
              <img className="w-10 h-10 rounded-full border-2 border-white dark:border-stone-900" alt="Volunteer donor profile picture 1" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCJc_uzu8ElKF_G_VigZSuvselmy3SiLmfUQnXHliWAZviPNg3baqPZ0i8A8LUDzDmoNVEllpmBrpu8NScrOl-PCuNASB5siYXN5TlJvArShCiPSZKuGhACcOUeOBpSZ73u7qLEiwSA3eD02P--80xBdarhcb4d6Al4M5tF00CMXwEHXYUR7unU1OUTBVALLGgGOgh388ChattNKlw_zsESS9NKAyvl3rtZOG_nB5cEo6axtSlDmJUjs1toNcQwtDKjwTM9_0hHSbE" />
              <img className="w-10 h-10 rounded-full border-2 border-white dark:border-stone-900" alt="Volunteer donor profile picture 2" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDsosudcwCY5QKdyp69ViEOnR-GrXmZ7H_hLAP9lcBNImyvtW9hgkkpEL69h0WVRZmxad815CVE5xBwQNAwFxW_VFQ5dvF6gKThOc1-SP7W4YwoL9Xcv7E1_v4Td40CH8JHeZDWa99kveqBW1ixf9h9RiMMROs1J_neCb-W-C-OqBMKVjDQVKmgubUHo4MuHkoCFt3_M0ims4Bjj8w4QLsXH88QEuM_G78YeWYIBexrAh0z5_XwaCb__lUD4VfDTNTYf_x3yhsJgak" />
              <img className="w-10 h-10 rounded-full border-2 border-white dark:border-stone-900" alt="Volunteer donor profile picture 3" src="https://lh3.googleusercontent.com/aida-public/AB6AXuANW7lZ3J_DX60v6NO6K79ImJA48hyMBhEy2IQfWgs2dieMWq2tJEeN9jtlY_vrD7sbKbJe5Jvq74kWnWMJxH2kdbdUpXRhsoMYqKBOTTb5tdqPfZKx4y5PGybbX1sccJA67Pv_jZW742PqtthDz4r-WCM9fu_yo4HSVZiafN5iv9Bdj1cOcAXAbbUps0FYr8zvjhonyFZHOZcm3D--x0y8UgqPEbUIlFSMmIJIUl8ap5-v26RXDM9mpKJ63I9N8L9QuJAu5jmzzYU" />
              <div className="w-10 h-10 rounded-full border-2 border-white dark:border-stone-900 bg-medical-red flex items-center justify-center text-[10px] text-white font-bold">+12k</div>
            </div>
            <div className="text-sm text-slate-500 font-medium">Joined the mission this month</div>
          </div>
        </div>
        {/* Right Section (Login Card) */}
        <div className="fade-up-v2 flex justify-center lg:justify-end" style={{ animationDelay: '0.4s' }}>
          <div className="glass-card-v2 w-full max-w-[440px] p-8 lg:p-10 rounded-3xl shadow-2xl shadow-rose-200/50 dark:shadow-black/40 transition-all duration-500 hover:translate-y-[-5px]">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{isLogin ? "Welcome Back" : "Create Account"}</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{isLogin ? "Please sign in to your donor account" : "Join the donor community today"}</p>
            </div>
            {error && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm font-medium rounded-r-lg">
                {error}
              </div>
            )}
            <form className="space-y-6" onSubmit={handleAuth}>

              {!isLogin && (
                <div className="space-y-2 group">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1 transition-colors group-focus-within:text-medical-red">Full Name</label>
                  <div className="relative">
                    <UserPlus className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-medical-red transition-colors" />
                    <input autoFocus required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full pl-12 pr-4 py-4 bg-white/50 dark:bg-stone-900/50 border border-slate-200 dark:border-stone-700 rounded-2xl focus:ring-4 focus:ring-medical-red/10 focus:border-medical-red outline-none transition-all duration-300 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 input-glow-pulse" placeholder="John Doe" type="text" />
                  </div>
                </div>
              )}

              <div className="space-y-2 group">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1 transition-colors group-focus-within:text-medical-red">Email Address</label>
                <div className="relative">
                  <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-medical-red transition-colors" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2" ry="2"></rect><path d="m2 4 10 8 10-8"></path></svg>
                  <input required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full pl-12 pr-4 py-4 bg-white/50 dark:bg-stone-900/50 border border-slate-200 dark:border-stone-700 rounded-2xl focus:ring-4 focus:ring-medical-red/10 focus:border-medical-red outline-none transition-all duration-300 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 input-glow-pulse" placeholder="name@company.com" type="email" />
                </div>
              </div>

              {!isLogin && (
                <div className="space-y-2 group">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1 transition-colors group-focus-within:text-medical-red">Your Blood Group</label>
                  <div className="relative">
                    <Droplet className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-medical-red transition-colors" />
                    <select required value={formData.bloodGroup} onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })} className="appearance-none w-full pl-12 pr-4 py-4 bg-white/50 dark:bg-stone-900/50 border border-slate-200 dark:border-stone-700 rounded-2xl focus:ring-4 focus:ring-medical-red/10 focus:border-medical-red outline-none transition-all duration-300 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 input-glow-pulse">
                      <option value="" disabled>Select Group...</option>
                      {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((bg) => (
                        <option key={bg} value={bg}>{bg}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              <div className="space-y-2 group">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 transition-colors group-focus-within:text-medical-red">Password</label>
                  {isLogin && <button type="button" onClick={handleForgotPassword} className="text-xs font-medium text-medical-red hover:underline underline-offset-4">Forgot?</button>}
                </div>
                <div className="relative">
                  <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-medical-red transition-colors" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                  <input required value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="w-full pl-12 pr-12 py-4 bg-white/50 dark:bg-stone-900/50 border border-slate-200 dark:border-stone-700 rounded-2xl focus:ring-4 focus:ring-medical-red/10 focus:border-medical-red outline-none transition-all duration-300 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 input-glow-pulse" placeholder="••••••••" type="password" />
                </div>
              </div>
              <div className="pt-2">
                <button disabled={loading} className="w-full py-4 px-6 bg-gradient-to-r from-medical-red to-orange-600 text-white font-bold rounded-2xl shadow-[0_4px_14px_0_rgba(225,29,72,0.39)] hover:shadow-[0_6px_20px_rgba(225,29,72,0.23)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 flex items-center justify-center gap-2 group shimmer-btn-v2 disabled:opacity-75" type="submit">
                  {loading ? (
                    <Activity className="w-6 h-6 animate-spin" />
                  ) : (
                    <>
                      <span>{isLogin ? "Sign In to Dashboard" : "Create Account"}</span>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </div>
            </form>
            <div className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
              <p>
                {isLogin ? "Don't have an account?" : "Already have an account?"}
                <button onClick={() => setIsLogin(!isLogin)} className="text-medical-red font-bold hover:underline underline-offset-4 ml-1">
                  {isLogin ? "Create Account" : "Log In"}
                </button>
              </p>
            </div>
          </div>
        </div>
      </main>
      {/* Footer Links */}
      <footer className="absolute bottom-6 left-0 w-full px-12 hidden lg:flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-600 z-10">
        <div className="flex gap-8">
          <a className="hover:text-medical-red transition-colors" href="#">Privacy Policy</a>
          <a className="hover:text-medical-red transition-colors" href="#">Terms of Service</a>
        </div>
        <div>© 2024 Blood Connect HQ. All rights reserved.</div>
      </footer>
    </div>
  );
}
