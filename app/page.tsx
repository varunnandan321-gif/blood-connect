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
    <div className="min-h-screen bg-rose-50 text-slate-900 flex flex-col md:flex-row font-sans">

      {/* Left Side - Hero & Details */}
      <div className="flex-1 bg-white p-10 flex flex-col justify-between relative overflow-hidden border-r border-rose-100">
        <div className="absolute top-0 right-0 p-32 bg-red-100 rounded-full blur-3xl opacity-60 pointer-events-none transform translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 p-32 bg-rose-200 rounded-full blur-3xl opacity-40 pointer-events-none transform -translate-x-1/2 translate-y-1/2"></div>

        <div className="relative z-10 space-y-2">
          <div className="flex items-center space-x-3 mb-10">
            <div className="bg-red-50 p-3 rounded-2xl shadow-sm border border-red-100">
              <Droplet className="text-red-600 w-8 h-8" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-800">Blood Connect</h1>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-5xl md:text-6xl font-black leading-tight mb-6 text-slate-900 tracking-tight">
              Save a Life.<br />
              <span className="text-red-600">Give Blood.</span>
            </h2>
            <p className="text-slate-600 text-lg md:text-xl max-w-lg mb-8 leading-relaxed">
              A centralized, real-time platform connecting blood donors with recipients during critical moments.
            </p>
          </motion.div>
        </div>

        <div className="relative z-10 grid grid-cols-2 gap-6 mt-12 hidden md:grid">
          <div className="bg-white/60 backdrop-blur-md border border-rose-100 shadow-sm p-5 rounded-2xl flex items-start space-x-4">
            <Heart className="w-8 h-8 text-red-500 shrink-0" />
            <div>
              <h4 className="font-bold text-lg text-slate-800">Instant Matching</h4>
              <p className="text-slate-500 text-sm mt-1">Real-time alerts to nearby compatible donors.</p>
            </div>
          </div>
          <div className="bg-white/60 backdrop-blur-md border border-rose-100 shadow-sm p-5 rounded-2xl flex items-start space-x-4">
            <Shield className="w-8 h-8 text-red-500 shrink-0" />
            <div>
              <h4 className="font-bold text-lg text-slate-800">Secure Database</h4>
              <p className="text-slate-500 text-sm mt-1">Centralized verified registry of donors.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Auth Form */}
      <div className="flex-1 flex items-center justify-center p-8 md:p-12 relative z-10 w-full max-w-2xl mx-auto bg-rose-50/50">

        <motion.div
          className="w-full max-w-md bg-white p-8 rounded-3xl shadow-xl border border-rose-100"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-2xl font-bold text-slate-900">
              {isLogin ? "Welcome Back" : "Create Account"}
            </h3>
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm font-semibold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-full transition-colors flex items-center gap-2"
            >
              {isLogin ? <><UserPlus className="w-4 h-4" /> Sign Up</> : <><LogIn className="w-4 h-4" /> Login</>}
            </button>
          </div>
          <p className="text-slate-500 mb-6">
            {isLogin ? "Log in to view active emergency requests or update your status." : "Join the platform to request blood or save lives."}
          </p>
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r-lg text-sm font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-5">
            {!isLogin && (
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Full Name</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition-all font-medium placeholder:text-slate-400"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email Address</label>
              <input
                type="email"
                required
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition-all font-medium placeholder:text-slate-400"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            {!isLogin && (
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Your Blood Group</label>
                <select
                  required
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition-all font-bold placeholder:text-slate-400"
                  value={formData.bloodGroup}
                  onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                >
                  <option value="" disabled className="font-normal text-slate-400">Select Group...</option>
                  {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(bg => <option key={bg} value={bg}>{bg}</option>)}
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password</label>
              <input
                type="password"
                required
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition-all font-medium placeholder:text-slate-400"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>

            {isLogin && (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-sm font-medium text-slate-500 hover:text-red-600 transition-colors"
                >
                  Forgot your password?
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 px-4 rounded-xl transition-all flex justify-center items-center group shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Activity className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  {isLogin ? "Sign In" : "Create Account"}
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-slate-500 font-medium pb-2 border-b border-rose-100">
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </p>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-500">
              {isLogin ? "New user?" : "Existing user?"}
              <span
                onClick={() => setIsLogin(!isLogin)}
                className="ml-2 font-bold text-red-600 hover:text-red-700 cursor-pointer transition-colors"
              >
                {isLogin ? "Sign up here" : "Log in here"}
              </span>
            </p>
          </div>

        </motion.div>
      </div>

    </div>
  );
}
