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
    <div className="bg-[#fdfaf9] dark:bg-stone-950 min-h-screen flex items-center justify-center overflow-hidden relative font-sans">
      {/* Background Elements */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Decorative soft blob behind card */}
        <div className="absolute right-[-10%] bottom-[-20%] w-[800px] h-[800px] bg-rose-50 dark:bg-rose-950/20 rounded-full blur-[120px] -z-10"></div>
        {/* ECG Line (Very subtle) */}
        <svg className="absolute top-12 left-4 md:left-12 opacity-80" height="150" viewBox="0 0 400 150" width="400">
          <path className="ecg-line-v2" d="M0,75 L40,75 L50,55 L65,95 L80,30 L95,120 L105,75 L150,75 L160,20 L180,130 L200,75 L400,75" fill="none" stroke="#fecdd3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
        </svg>
      </div>

      <main className="container mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-[1fr_440px] gap-12 lg:gap-24 items-center relative z-10 max-w-7xl">
        {/* Left Section (Hero Area) */}
        <div className="flex flex-col gap-6 lg:pr-8 pt-10 lg:pt-0">
          {/* Logo Pill */}
          <div className="fade-up-v2 inline-flex items-center gap-3 bg-white dark:bg-stone-900 px-5 py-2.5 rounded-full border border-gray-100 dark:border-stone-800 shadow-sm w-fit mt-12 lg:mt-0">
            <div className="flex items-center justify-center text-medical-red">
              <svg viewBox="0 0 24 24" className="w-5 h-5 heart-pulse-v2" fill="currentColor">
                <rect x="3" y="6" width="4" height="12" rx="2" />
                <rect x="10" y="3" width="4" height="18" rx="2" />
                <rect x="17" y="6" width="4" height="12" rx="2" />
              </svg>
            </div>
            <span className="text-[12px] font-bold text-slate-800 dark:text-slate-200 uppercase tracking-[0.15em] leading-none text-center pt-[1px]">Blood Connect</span>
          </div>

          <div className="space-y-4 lg:space-y-6 mt-4">
            <h1 className="text-6xl md:text-7xl xl:text-[6.5rem] font-black text-[#111827] dark:text-slate-100 leading-[0.95] tracking-tight">
              <span className="fade-up-v2 block">Save a Life.</span>
              <span className="fade-up-v2 block text-medical-red mt-2" style={{ animationDelay: '0.2s' }}>Give Blood.</span>
            </h1>
            <p className="fade-up-v2 text-base md:text-[18px] text-slate-500 max-w-[420px] leading-relaxed font-medium pt-2" style={{ animationDelay: '0.4s' }}>
              A centralized real-time platform connecting blood donors with recipients during critical moments. Your contribution can change a story today.
            </p>
          </div>

          <div className="fade-up-v2 flex items-center gap-5 mt-4" style={{ animationDelay: '0.7s' }}>
            <div className="flex -space-x-3">
              <div className="w-10 h-10 rounded-full border-[3px] border-[#fdfaf9] dark:border-stone-950 bg-orange-100 flex shadow-sm items-center justify-center overflow-hidden">
                <div className="w-full h-full bg-[url('https://lh3.googleusercontent.com/aida-public/AB6AXuCJc_uzu8ElKF_G_VigZSuvselmy3SiLmfUQnXHliWAZviPNg3baqPZ0i8A8LUDzDmoNVEllpmBrpu8NScrOl-PCuNASB5siYXN5TlJvArShCiPSZKuGhACcOUeOBpSZ73u7qLEiwSA3eD02P--80xBdarhcb4d6Al4M5tF00CMXwEHXYUR7unU1OUTBVALLGgGOgh388ChattNKlw_zsESS9NKAyvl3rtZOG_nB5cEo6axtSlDmJUjs1toNcQwtDKjwTM9_0hHSbE')] bg-cover bg-center"></div>
              </div>
              <div className="w-10 h-10 rounded-full border-[3px] border-[#fdfaf9] dark:border-stone-950 bg-blue-100 flex shadow-sm items-center justify-center overflow-hidden">
                <div className="w-full h-full bg-[url('https://lh3.googleusercontent.com/aida-public/AB6AXuDsosudcwCY5QKdyp69ViEOnR-GrXmZ7H_hLAP9lcBNImyvtW9hgkkpEL69h0WVRZmxad815CVE5xBwQNAwFxW_VFQ5dvF6gKThOc1-SP7W4YwoL9Xcv7E1_v4Td40CH8JHeZDWa99kveqBW1ixf9h9RiMMROs1J_neCb-W-C-OqBMKVjDQVKmgubUHo4MuHkoCFt3_M0ims4Bjj8w4QLsXH88QEuM_G78YeWYIBexrAh0z5_XwaCb__lUD4VfDTNTYf_x3yhsJgak')] bg-cover bg-center"></div>
              </div>
              <div className="w-10 h-10 rounded-full border-[3px] border-[#fdfaf9] dark:border-stone-950 bg-green-100 flex shadow-sm items-center justify-center overflow-hidden">
                <div className="w-full h-full bg-[url('https://lh3.googleusercontent.com/aida-public/AB6AXuANW7lZ3J_DX60v6NO6K79ImJA48hyMBhEy2IQfWgs2dieMWq2tJEeN9jtlY_vrD7sbKbJe5Jvq74kWnWMJxH2kdbdUpXRhsoMYqKBOTTb5tdqPfZKx4y5PGybbX1sccJA67Pv_jZW742PqtthDz4r-WCM9fu_yo4HSVZiafN5iv9Bdj1cOcAXAbbUps0FYr8zvjhonyFZHOZcm3D--x0y8UgqPEbUIlFSMmIJIUl8ap5-v26RXDM9mpKJ63I9N8L9QuJAu5jmzzYU')] bg-cover bg-center"></div>
              </div>
              <div className="w-10 h-10 rounded-full border-[3px] border-[#fdfaf9] dark:border-stone-950 relative z-10 bg-medical-red flex shadow-sm items-center justify-center text-[11px] text-white font-bold tracking-tight">+12k</div>
            </div>
            <div className="text-[13px] sm:text-sm text-slate-500 font-semibold tracking-wide">Joined the mission this month</div>
          </div>
        </div>

        {/* Right Section (Login Card) */}
        <div className="fade-up-v2 w-full mt-8 lg:mt-0" style={{ animationDelay: '0.4s' }}>
          <div className="bg-white dark:bg-stone-900 w-full p-8 sm:p-10 rounded-[2.5rem] shadow-[0_20px_50px_-15px_rgba(225,29,72,0.1)] dark:shadow-[0_20px_50px_-15px_rgba(0,0,0,0.5)] transition-all duration-500 relative z-20">
            <div className="mb-6">
              <h2 className="text-[28px] font-bold text-slate-900 dark:text-slate-100 tracking-tight">{isLogin ? "Welcome Back" : "Create Account"}</h2>
              <p className="text-slate-500 dark:text-slate-400 text-[13px] mt-1.5 font-medium">{isLogin ? "Please sign in to your donor account" : "Join the donor community today"}</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 text-sm font-medium rounded-xl">
                {error}
              </div>
            )}

            <form className="space-y-5" onSubmit={handleAuth}>
              {!isLogin && (
                <div className="space-y-2.5">
                  <label className="text-[13px] font-bold text-slate-700 dark:text-slate-200 ml-1">Full Name</label>
                  <div className="relative">
                    <UserPlus className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 transition-colors" />
                    <input autoFocus required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full pl-11 pr-4 py-3.5 bg-white dark:bg-stone-950 border border-gray-200 dark:border-stone-800 rounded-xl focus:ring-2 focus:ring-medical-red/20 focus:border-medical-red outline-none transition-all duration-300 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 text-sm" placeholder="John Doe" type="text" />
                  </div>
                </div>
              )}

              <div className="space-y-2.5">
                <label className="text-[13px] font-bold text-slate-700 dark:text-slate-200 ml-1">Email Address</label>
                <div className="relative">
                  <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 transition-colors" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2" ry="2"></rect><path d="m2 4 10 8 10-8"></path></svg>
                  <input required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full pl-11 pr-4 py-3.5 bg-white dark:bg-stone-950 border border-gray-200 dark:border-stone-800 rounded-xl focus:ring-2 focus:ring-medical-red/20 focus:border-medical-red outline-none transition-all duration-300 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 text-sm" placeholder="name@company.com" type="email" />
                </div>
              </div>

              {!isLogin && (
                <div className="space-y-2.5">
                  <label className="text-[13px] font-bold text-slate-700 dark:text-slate-200 ml-1">Your Blood Group</label>
                  <div className="relative">
                    <Droplet className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 transition-colors" />
                    <select required value={formData.bloodGroup} onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })} className="appearance-none w-full pl-11 pr-4 py-3.5 bg-white dark:bg-stone-950 border border-gray-200 dark:border-stone-800 rounded-xl focus:ring-2 focus:ring-medical-red/20 focus:border-medical-red outline-none transition-all duration-300 text-slate-900 dark:text-slate-100 text-sm">
                      <option value="" disabled className="text-slate-400">Select Group...</option>
                      {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((bg) => (
                        <option key={bg} value={bg}>{bg}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              <div className="space-y-2.5">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[13px] font-bold text-slate-700 dark:text-slate-200">Password</label>
                  {isLogin && <button type="button" onClick={handleForgotPassword} className="text-[11px] font-bold text-medical-red hover:text-red-700 dark:hover:text-red-400 transition-colors">Forgot?</button>}
                </div>
                <div className="relative">
                  <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 transition-colors" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                  <input required value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="w-full pl-11 pr-11 py-3.5 bg-white dark:bg-stone-950 border border-gray-200 dark:border-stone-800 rounded-xl focus:ring-2 focus:ring-medical-red/20 focus:border-medical-red outline-none transition-all duration-300 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 text-sm tracking-widest" placeholder="••••••••" type="password" />
                  <button type="button" className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 dark:hover:text-slate-300 transition-colors">
                    <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button disabled={loading} className="w-full py-4 px-6 bg-gradient-to-r from-medical-red to-orange-600 text-white font-bold rounded-xl shadow-[0_6px_20px_-6px_rgba(225,29,72,0.5)] hover:shadow-[0_8px_25px_-8px_rgba(225,29,72,0.6)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 flex items-center justify-center gap-2 group disabled:opacity-75" type="submit">
                  {loading ? (
                    <Activity className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <span className="text-sm">{isLogin ? "Sign In to Dashboard" : "Create Account"}</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </div>
            </form>

            <div className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400 font-medium">
              <p>
                {isLogin ? "Don't have an account?" : "Already have an account?"}
                <button onClick={() => setIsLogin(!isLogin)} className="text-medical-red font-bold hover:text-red-700 ml-1.5 transition-colors">
                  {isLogin ? "Create Account" : "Sign In"}
                </button>
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer Links */}
      <footer className="absolute bottom-6 md:bottom-10 w-full px-6 flex justify-between items-center text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-[#9ca3af] dark:text-slate-600 z-10">
        <div className="flex gap-6 sm:gap-8 lg:px-6">
          <a className="hover:text-medical-red transition-colors" href="#">Privacy Policy</a>
          <a className="hover:text-medical-red transition-colors" href="#">Terms of Service</a>
        </div>
        <div className="lg:px-6 hidden sm:block">© 2024 Blood Connect HQ. All rights reserved.</div>
      </footer>
    </div>
  );
}
