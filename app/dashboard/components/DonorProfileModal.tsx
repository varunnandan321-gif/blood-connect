"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Droplet, Clock, Activity, AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";

export function DonorProfileModal({
    isOpen,
    onClose,
    userData,
    requests
}: {
    isOpen: boolean,
    onClose: () => void,
    userData: any,
    requests: any[]
}) {
    if (!isOpen) return null;

    // Calculate Eligible Time
    const getEligibilityStatus = () => {
        if (!userData?.lastDonationDate) return { text: "Eligible Now", sub: "Ready!", isEligible: true };

        const lastDonation = userData.lastDonationDate.toDate();
        const nextEligibleDate = new Date(lastDonation.getTime() + (120 * 24 * 60 * 60 * 1000)); // 120 days
        const now = new Date();

        if (now >= nextEligibleDate) return { text: "Eligible Now", sub: "Ready!", isEligible: true };

        const diffTime = Math.abs(nextEligibleDate.getTime() - now.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return {
            text: `In ${diffDays} Days`,
            sub: nextEligibleDate.toLocaleDateString(),
            isEligible: false
        };
    };

    const status = getEligibilityStatus();
    const donationsCount = userData?.donationsCount || 0;
    const mlGiven = donationsCount * 450;
    const livesSaved = donationsCount * 3;

    // Filter Nearby Requests (simplified to active requests matching blood group or O-)
    const urgentRequests = requests.filter(r => r.status === 'active' && (r.bloodGroup === userData?.bloodGroup || r.bloodGroup === 'O-')).slice(0, 3);

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                    onClick={onClose}
                />

                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative w-full max-w-[1200px] max-h-[90vh] overflow-y-auto overflow-x-hidden bg-[#f4f7f9] rounded-3xl shadow-2xl p-6 md:p-10 font-sans"
                >
                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 p-2 bg-white rounded-full shadow-sm text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors z-10"
                    >
                        <X className="w-6 h-6" />
                    </button>

                    <div className="flex flex-col gap-8">
                        {/* Header */}
                        <header className="flex flex-col md:flex-row justify-between items-start md:items-center py-2 border-b border-slate-200 pb-6 pr-12">
                            <div className="flex items-center gap-3 mb-4 md:mb-0">
                                <img src="/logo.png" alt="Blood Connect" className="w-auto h-12" />
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="text-right">
                                    <p className="text-sm md:text-lg text-slate-600">Donor Profile</p>
                                    <p className="text-xl md:text-2xl font-bold text-slate-800">{userData?.name}</p>
                                </div>
                                <div className="w-14 h-14 rounded-full bg-red-100 border-2 border-red-200 flex items-center justify-center shrink-0">
                                    <span className="text-red-600 font-black text-xl">{userData?.bloodGroup || "?"}</span>
                                </div>
                            </div>
                        </header>

                        {/* Main Grid */}
                        <main className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                            {/* Left Column */}
                            <div className="col-span-1 lg:col-span-2 flex flex-col gap-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                                    {/* Next Eligible Donation Card */}
                                    <div className="bg-white rounded-[2rem] p-8 shadow-sm flex flex-col h-full border border-slate-100 relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 rounded-bl-full pointer-events-none opacity-50"></div>
                                        <h2 className="text-[1.1rem] font-semibold text-slate-800 mb-6 relative z-10">Next Eligible Donation</h2>
                                        <div className="flex-grow flex items-center justify-center relative pb-4 z-10">
                                            <div className="relative w-48 h-48 flex justify-center items-center">
                                                <svg className="w-full h-full absolute transform -rotate-90" viewBox="0 0 100 100">
                                                    <path d="M 50,50 m -40,0 a 40,40 0 1,1 80,0 a 40,40 0 1,1 -80,0" fill="none" stroke="#fce7e7" strokeWidth="8" strokeLinecap="round" />
                                                </svg>
                                                {!status.isEligible && (
                                                    <svg className="w-full h-full absolute transform -rotate-90" viewBox="0 0 100 100">
                                                        <path d="M 50,50 m -40,0 a 40,40 0 1,1 80,0 a 40,40 0 1,1 -80,0" fill="none" stroke="#c1272d" strokeWidth="8" strokeLinecap="round" strokeDasharray="150 251" />
                                                    </svg>
                                                )}
                                                <div className="absolute flex flex-col items-center justify-center mt-2">
                                                    <span className={`text-xl font-bold mb-1 ${status.isEligible ? 'text-green-600' : 'text-slate-800'}`}>{status.text}</span>
                                                    <span className="text-sm text-slate-400 font-medium">{status.sub}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Donation Impact Card */}
                                    <div className="bg-white rounded-[2rem] p-8 shadow-sm flex flex-col justify-between h-full border border-slate-100">
                                        <h2 className="text-[1.1rem] font-semibold text-slate-800">Donation Impact</h2>
                                        <div className="flex flex-col items-center justify-center my-6">
                                            <span className="font-bold text-red-600 leading-none text-[5rem]">{livesSaved}</span>
                                            <span className="text-lg text-slate-600 font-medium mt-2">Lives Saved</span>
                                        </div>
                                        <div className="flex justify-between items-end mt-4 pt-4 border-t border-slate-100">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-red-600">
                                                    <Activity className="w-6 h-6" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-2xl font-bold leading-none text-slate-800">{donationsCount}</span>
                                                    <span className="text-xs text-slate-400 font-medium mt-1">Total Donations</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-red-600">
                                                    <Droplet className="w-6 h-6" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-2xl font-bold leading-none text-slate-800">{mlGiven}ml</span>
                                                    <span className="text-xs text-slate-400 font-medium mt-1">Volume Given</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Recent Activity Card */}
                                <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100">
                                    <h2 className="text-[1.1rem] font-semibold text-slate-800 mb-6 flex items-center">
                                        <Clock className="w-5 h-5 mr-2 text-slate-400" /> Recent Activity
                                    </h2>
                                    {userData?.lastDonationDate ? (
                                        <ul className="flex flex-col gap-6">
                                            <li className="flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600 shrink-0">
                                                        <Activity className="w-5 h-5" />
                                                    </div>
                                                    <span className="text-[15px] font-medium text-slate-700">Donated Blood</span>
                                                </div>
                                                <span className="text-sm font-semibold text-slate-400">
                                                    {userData.lastDonationDate.toDate().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </span>
                                            </li>
                                            <li className="flex items-center justify-between opacity-50">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                                                        <AlertCircle className="w-5 h-5" />
                                                    </div>
                                                    <span className="text-[15px] font-medium text-slate-600">Awaiting new opportunities</span>
                                                </div>
                                            </li>
                                        </ul>
                                    ) : (
                                        <div className="text-center py-6 text-slate-400 italic">No recent donation activity detected.</div>
                                    )}
                                </div>
                            </div>

                            {/* Right Column */}
                            <div className="col-span-1 flex flex-col h-full">
                                <h2 className="text-[1.1rem] font-semibold text-slate-800 mb-4 ml-1 flex items-center">
                                    <AlertCircle className="w-5 h-5 mr-2 text-red-500" /> Urgent Dispatches
                                </h2>
                                <div className="flex flex-col gap-4 flex-grow">
                                    {urgentRequests.length > 0 ? urgentRequests.map(req => (
                                        <div key={req.id} className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 border-l-[6px] border-l-red-600 relative overflow-hidden flex flex-col gap-3 group hover:shadow-md transition-all">
                                            <div className="flex items-center gap-3">
                                                <span className="bg-red-600 text-white px-2 py-0.5 rounded text-sm font-bold shadow-sm">{req.bloodGroup}</span>
                                                <span className="text-red-600 font-bold text-sm tracking-wide uppercase">{req.status === 'active' ? 'Urgent' : 'Fulfilled'}</span>
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-800 text-sm mb-1">{req.patientName}</p>
                                                <p className="text-sm text-slate-500 flex items-center"><Clock className="w-3 h-3 mr-1" /> Needed {new Date(req.requiredBy).toLocaleDateString()}</p>
                                            </div>
                                            <button onClick={onClose} className="w-full bg-red-50 text-red-600 rounded-lg py-2.5 mt-2 text-sm font-bold border border-red-100 hover:bg-red-600 hover:text-white transition-colors">
                                                View Board
                                            </button>
                                        </div>
                                    )) : (
                                        <div className="bg-white rounded-xl p-8 border border-slate-100 text-center flex-grow flex flex-col justify-center items-center">
                                            <Droplet className="w-10 h-10 text-slate-200 mb-3" />
                                            <p className="text-sm text-slate-500 font-medium">No urgent requests matching your profile right now.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </main>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
