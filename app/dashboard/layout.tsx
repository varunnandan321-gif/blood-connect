"use client";

import React, { useEffect, useState } from "react";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { auth, db } from "@/lib/firebase/config";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { Loader2, LogOut, Droplet, User as UserIcon, Activity } from "lucide-react";
import Link from "next/link";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [userData, setUserData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
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

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-red-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col font-sans">
            {/* Navbar */}
            <nav className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-6 py-4 flex justify-between items-center sticky top-0 z-50">
                <Link href="/dashboard" className="flex items-center space-x-2">
                    <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded-xl">
                        <Droplet className="text-red-600 dark:text-red-500 w-6 h-6" />
                    </div>
                    <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Blood Connect</span>
                </Link>

                <div className="flex items-center space-x-6">
                    <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-full">
                        <UserIcon className="w-4 h-4 text-slate-500" />
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            {userData?.name || user?.email}
                            {userData?.role && (
                                <span className="ml-2 text-xs uppercase tracking-wider font-bold text-red-500 bg-red-100 dark:bg-red-900/30 px-2 py-0.5 rounded text-center">
                                    {userData.role}
                                </span>
                            )}
                        </span>
                    </div>

                    <button
                        onClick={() => signOut(auth)}
                        className="text-slate-500 hover:text-red-500 transition-colors flex items-center"
                    >
                        <LogOut className="w-5 h-5 md:mr-2" />
                        <span className="hidden md:inline font-semibold">Sign Out</span>
                    </button>
                </div>
            </nav>

            {/* Main Content Area */}
            <main className="flex-1 p-6 md:p-12 max-w-7xl mx-auto w-full flex flex-col gap-6">
                {React.cloneElement(children as React.ReactElement<any>, { user, userData })}
            </main>

        </div>
    );
}
