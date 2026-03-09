"use client";

import React, { useEffect, useState } from "react";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { auth, db } from "@/lib/firebase/config";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { Loader2, LogOut, Droplet, User as UserIcon, Activity } from "lucide-react";
import Link from "next/link";
import { AuthContext } from "./context";
import { collection, query, onSnapshot, where } from "firebase/firestore";
import { DonorProfileModal } from "./components/DonorProfileModal";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [userData, setUserData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [activeRequests, setActiveRequests] = useState<any[]>([]);
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (!currentUser) {
                router.push("/");
            } else {
                setUser(currentUser);
                // Fetch user role/data
                const docRef = doc(db, "Users", currentUser.uid);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setUserData(docSnap.data());
                }
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, [router]);

    useEffect(() => {
        if (!user) return;
        const q = query(collection(db, "Requests"), where("status", "==", "active"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setActiveRequests(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
        return () => unsubscribe();
    }, [user]);

    if (loading) {
        return (
            <div className="min-h-screen bg-rose-50 flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-red-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-rose-50 flex flex-col font-sans relative overflow-x-hidden text-gray-800">
            {/* Background Blob Elements */}
            <div className="blob-2"></div>
            <div className="blob-1"></div>
            <div className="bg-watermark">BLOOD</div>
            <div className="ekg-line"></div>

            <div className="max-w-6xl mx-auto px-4 py-6 flex flex-col gap-8 relative z-10 w-full">
                {/* Main Header */}
                <header className="glass-panel rounded-2xl p-4 flex justify-between items-center shadow-glass">
                    {/* Logo area */}
                    <Link href="/dashboard" className="flex items-center gap-3 group">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-white shadow-glow-sm transition-transform group-hover:scale-105">
                            <Droplet className="w-5 h-5 drop-shadow-md" />
                        </div>
                        <div className="leading-tight hidden sm:block">
                            <h1 className="font-bold text-xl text-blood-900 m-0 leading-none tracking-tight">Blood</h1>
                            <h1 className="font-bold text-xl text-gray-900 m-0 leading-none tracking-tight">Connect</h1>
                        </div>
                    </Link>

                    {/* User profile area */}
                    <div className="flex items-center gap-4 md:gap-6">
                        <button onClick={() => setShowProfileModal(true)} className="flex items-center gap-3 text-right group cursor-pointer transition-transform hover:scale-105">
                            <div className="hidden md:block">
                                <div className="font-semibold text-sm text-gray-900 leading-tight">
                                    {userData?.name || user?.email?.split('@')[0]}
                                </div>
                                <div className="text-[10px] text-gray-500 tracking-wider font-bold">
                                    {userData?.role ? userData.role.toUpperCase() : "DONOR"}
                                </div>
                            </div>
                            <div className="w-10 h-10 rounded-xl glass-panel flex items-center justify-center shadow-sm group-hover:bg-white/60 transition-colors">
                                <UserIcon className="w-5 h-5 text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                            </div>
                        </button>

                        <button
                            onClick={() => signOut(auth)}
                            className="text-sm font-medium text-gray-600 hover:text-red-600 transition-colors flex items-center gap-2"
                        >
                            <span className="hidden sm:inline">Sign Out</span>
                            <LogOut className="w-4 h-4" />
                        </button>
                    </div>
                </header>

                {/* Main Content Area */}
                <main className="flex-1 w-full flex flex-col gap-6">
                    <AuthContext.Provider value={{ user, userData }}>
                        {children}
                    </AuthContext.Provider>
                </main>
            </div>

            <DonorProfileModal
                isOpen={showProfileModal}
                onClose={() => setShowProfileModal(false)}
                userData={userData}
                requests={activeRequests}
            />
        </div>
    );
}
