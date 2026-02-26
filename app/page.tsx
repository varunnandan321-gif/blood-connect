"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Droplet, Heart, Shield, Activity, ArrowRight, UserPlus, LogIn } from "lucide-react";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "@/lib/firebase/config";
import { doc, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function LandingPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
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

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col md:flex-row dark:bg-slate-900 dark:text-slate-50 font-sans">

      {/* Left Side - Hero & Details */}
      <div className="flex-1 bg-red-600 dark:bg-red-700 text-white p-10 flex flex-col justify-between relative overflow-hidden">
        <div className="absolute top-0 right-0 p-32 bg-red-500 rounded-full blur-3xl opacity-30 mix-blend-screen animate-pulse pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 p-32 bg-red-800 rounded-full blur-3xl opacity-40 mix-blend-multiply pointer-events-none"></div>

        <div className="relative z-10 space-y-2">
          <div className="flex items-center space-x-3 mb-10">
            <div className="bg-white p-3 rounded-2xl shadow-lg">
              <Droplet className="text-red-600 w-8 h-8" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">Blood Connect</h1>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-5xl md:text-6xl font-black leading-tight mb-6">
              Save a Life.<br />Give Blood.
            </h2>
            <p className="text-red-100 text-lg md:text-xl max-w-lg mb-8 leading-relaxed">
              A centralized, real-time platform connecting blood donors with recipients during critical moments.
            </p>
          </motion.div>
        </div>

        <div className="relative z-10 grid grid-cols-2 gap-6 mt-12 hidden md:grid">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-5 rounded-2xl flex items-start space-x-4">
            <Heart className="w-8 h-8 text-red-200 shrink-0" />
            <div>
              <h4 className="font-bold text-lg">Instant Matching</h4>
              <p className="text-red-100 text-sm mt-1">Real-time alerts to nearby compatible donors.</p>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-5 rounded-2xl flex items-start space-x-4">
            <Shield className="w-8 h-8 text-red-200 shrink-0" />
            <div>
              <h4 className="font-bold text-lg">Secure Database</h4>
              <p className="text-red-100 text-sm mt-1">Centralized verified registry of donors.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Auth Form */}
      <div className="flex-1 flex items-center justify-center p-8 md:p-12 relative z-10 w-full max-w-2xl mx-auto">
        <motion.div
          className="w-full max-w-md bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 relative overflow-hidden"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          {/* Subtle decoration */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-red-100 dark:bg-red-900/30 rounded-full blur-3xl pointer-events-none"></div>

          <div className="mb-8 relative z-10">
            <h3 className="text-2xl font-bold mb-2 flex items-center">
              {isLogin ? (
                <><LogIn className="mr-2 w-6 h-6 text-red-500" /> Welcome Back</>
              ) : (
                <><UserPlus className="mr-2 w-6 h-6 text-red-500" /> Create Account</>
              )}
            </h3>
            <p className="text-slate-500 dark:text-slate-400">
              {isLogin ? "Log in to view active emergency requests or update your status." : "Join the platform to request blood or save lives."}
            </p>
          </div>

          <form onSubmit={handleAuth} className="space-y-4 relative z-10">
            {!isLogin && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-1 text-slate-700 dark:text-slate-300">Full Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-transparent focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all outline-none"
                    placeholder="John Doe"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold mb-1 text-slate-700 dark:text-slate-300">Email Address</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-transparent focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all outline-none"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1 text-slate-700 dark:text-slate-300">Password</label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-transparent focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all outline-none"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-xl text-sm font-medium border border-red-200 dark:border-red-800/50"
              >
                {error}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 px-4 rounded-xl transition-all flex items-center justify-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed mt-2 shadow-lg shadow-red-600/20"
            >
              <span>{loading ? "Processing..." : isLogin ? "Sign In" : "Create Account"}</span>
              {!loading && <ArrowRight className="w-5 h-5" />}
            </button>
          </form>

          <div className="mt-8 text-center relative z-10 hidden md:block border-t border-slate-200 dark:border-slate-700 pt-6">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              <span
                onClick={() => setIsLogin(!isLogin)}
                className="ml-2 font-bold text-red-600 hover:text-red-500 transition-colors cursor-pointer"
              >
                {isLogin ? "Sign up here" : "Log in here"}
              </span>
            </p>
          </div>

          <div className="mt-6 text-center relative z-10 md:hidden pb-2">
            <p className="text-sm text-slate-500">
              {isLogin ? "New user?" : "Existing user?"}
              <span
                onClick={() => setIsLogin(!isLogin)}
                className="ml-2 font-bold text-red-600 cursor-pointer"
              >
                {isLogin ? "Sign up" : "Log in"}
              </span>
            </p>
          </div>
        </motion.div>
      </div>

    </div>
  );
}
