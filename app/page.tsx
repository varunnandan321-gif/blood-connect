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
    <div className="bg-custom-gradient min-h-screen relative overflow-hidden flex items-center justify-center font-sans">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-ekg-pattern z-0 opacity-50 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-full text-center watermark z-0 font-bold uppercase tracking-tighter">
        Blood Connect
      </div>

      {/* Main Content Container */}
      <main className="relative z-10 w-full max-w-6xl mx-auto px-6 lg:px-12 py-12 flex flex-col lg:flex-row items-center justify-between gap-12">
        {/* Left Column (Text & Branding) */}
        <section className="flex-1 max-w-xl text-left">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-6xl md:text-7xl font-extrabold text-[#4A0404] leading-tight mb-6"
          >
            Save a Life.<br />Give Blood.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg md:text-xl text-gray-800 mb-10 leading-relaxed font-medium"
          >
            A centralized, real-time platform connecting blood donors with recipients during critical moments.
          </motion.p>
          <div className="flex items-center gap-4 bg-white/40 backdrop-blur-md px-6 py-4 rounded-3xl w-fit border border-white/60 shadow-sm">
            <img src="/logo.png" alt="Blood Connect Logo" className="w-auto h-10 md:h-12 object-contain mix-blend-multiply" />
            <span className="text-2xl md:text-3xl font-extrabold text-[#590d22] tracking-tight">Blood Connect</span>
          </div>
        </section>

        {/* Right Column (Login Card Stack) */}
        <section className="relative w-full max-w-md">
          {/* Decorative Stacked Layers */}
          <div className="absolute -bottom-[20px] left-[10%] w-[80%] h-full bg-white/20 backdrop-blur-lg rounded-3xl -z-20 border border-white/40 shadow-sm"></div>
          <div className="absolute -bottom-[10px] left-[5%] w-[90%] h-full bg-white/20 backdrop-blur-xl rounded-3xl -z-10 border border-white/50 shadow-md"></div>

          {/* Main Glass Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/30 backdrop-blur-2xl border border-white/60 shadow-xl rounded-3xl p-8 relative z-10 w-full"
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-900">
                {isLogin ? "Welcome Back" : "Create Account"}
              </h2>
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="px-4 py-1.5 rounded-full bg-black/10 text-gray-800 text-sm font-semibold hover:bg-black/20 transition-colors"
              >
                {isLogin ? "Sign Up" : "Log In"}
              </button>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm font-medium rounded-r-lg">
                {error}
              </div>
            )}

            <form onSubmit={handleAuth} className="space-y-5">
              {!isLogin && (
                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-full shadow-sm sm:text-sm bg-white/30 border-2 border-white focus:outline-none focus:ring-2 focus:ring-white text-gray-800 placeholder-gray-500"
                    placeholder="John Doe"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-800 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 rounded-full shadow-sm sm:text-sm bg-white/30 border-2 border-white focus:outline-none focus:ring-2 focus:ring-white text-gray-800 placeholder-gray-500"
                  placeholder="you@example.com"
                />
              </div>

              {!isLogin && (
                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-1">Your Blood Group</label>
                  <select
                    required
                    value={formData.bloodGroup}
                    onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                    className="w-full px-4 py-3 rounded-full shadow-sm sm:text-sm bg-white/30 border-2 border-white focus:outline-none focus:ring-2 focus:ring-white text-gray-800 font-bold"
                  >
                    <option value="" disabled className="font-normal text-slate-400 bg-white">Select Group...</option>
                    {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((bg) => (
                      <option key={bg} value={bg} className="bg-white text-slate-900">{bg}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-800 mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-3 rounded-full shadow-sm sm:text-sm bg-white/30 border-2 border-white focus:outline-none focus:ring-2 focus:ring-white text-gray-800 placeholder-gray-500"
                  placeholder="••••••••"
                />

                {isLogin && (
                  <div className="text-right mt-2">
                    <button
                      type="button"
                      onClick={handleForgotPassword}
                      className="text-xs text-gray-700 hover:text-gray-900 underline decoration-gray-400 underline-offset-2 bg-transparent border-0 cursor-pointer p-0"
                    >
                      Forgot your password?
                    </button>
                  </div>
                )}
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-gradient-to-r from-red-500 to-red-700 shadow-[0_15px_40px_-5px_rgba(255,0,0,0.6)] w-full flex justify-center items-center py-3 px-4 rounded-full text-sm font-bold text-white hover:scale-[1.02] transition-transform disabled:opacity-70 disabled:hover:scale-100"
                >
                  {loading ? (
                    <Activity className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      {isLogin ? "Sign In" : "Create Account"} <span className="ml-2">→</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            <div className="mt-8 text-center text-xs text-gray-700 space-y-2">
              <p>
                By continuing, you agree to our <span className="underline hover:text-gray-900 cursor-pointer">Terms of Service</span><br />and <span className="underline hover:text-gray-900 cursor-pointer">Privacy Policy</span>.
              </p>
              <p className="pt-2">
                {isLogin ? "New user?" : "Existing user?"}
                <button
                  onClick={() => setIsLogin(!isLogin)}
                  className="underline hover:text-gray-900 font-medium ml-1 bg-transparent border-0 cursor-pointer p-0"
                >
                  {isLogin ? "Sign up here" : "Log in here"}
                </button>
              </p>
            </div>
          </motion.div>
        </section>
      </main>
    </div>
  );
}
