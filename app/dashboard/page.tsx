"use client";

import { useState, useEffect } from "react";
import { collection, addDoc, query, onSnapshot, orderBy, where, serverTimestamp, getDocs, writeBatch, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { MapPin, Search, AlertCircle, Phone, Clock, PlusCircle, Loader2, UserCircle, Hand, Bell, MessageCircle, Send, Building2, Droplet, CheckCircle2, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "./context";

// Custom hook to track previous state for notifications
function usePrevious(value: any) {
    // Fallback sync version 
    const refSync = require("react").useRef();
    require("react").useEffect(() => {
        refSync.current = value;
    });
    return refSync.current;
}

export default function DashboardPage() {
    const { user, userData } = useAuth();

    // Safety check - though layout protects it, type safety ensures user exists before rendering this client component fully
    if (!user) return null;

    const isAdmin = user?.email === "blood.connect123@gmail.com";

    const [activeTab, setActiveTab] = useState("feed"); // 'feed' | 'my-requests' | 'matches' | 'messages' | 'profile' | 'facilities'
    const [requests, setRequests] = useState<any[]>([]);
    const [facilities, setFacilities] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterGroup, setFilterGroup] = useState("All");

    const [loadingReqs, setLoadingReqs] = useState(true);
    const [loadingFacilities, setLoadingFacilities] = useState(true);

    // Chat State
    const [chats, setChats] = useState<any[]>([]);
    const [activeChat, setActiveChat] = useState<any>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState("");

    // New Request Form State
    const [requestForm, setRequestForm] = useState({
        patientName: "",
        bloodGroup: "A+",
        location: "",
        contact: "",
        urgency: "high",
        unitsRequired: 1,
        requiredBy: ""
    });

    // Donor Profile Form State
    const [donorForm, setDonorForm] = useState({
        bloodGroup: userData?.bloodGroup || "A+",
        location: userData?.location || "",
        contact: userData?.contact || "",
        medicalConditions: userData?.medicalConditions || "",
        available: userData?.available ?? true,
    });
    const [updatingProfile, setUpdatingProfile] = useState(false);
    const [allUsers, setAllUsers] = useState<any[]>([]);

    // Notification State
    const [notifications, setNotifications] = useState<any[]>([]);
    const [toastMessage, setToastMessage] = useState<{ title: string, desc: string, isRead?: boolean, id?: string } | null>(null);

    // Fetch Blood Requests Real-time
    useEffect(() => {
        if (!user) return;

        // Grab all requests, ordered by time.
        const q = query(collection(db, "Requests"), orderBy("createdAt", "desc"));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setRequests(data);
            setLoadingReqs(false);
        });

        return () => unsubscribe();
    }, [user]);

    // Fetch Targeted Notifications Real-time
    useEffect(() => {
        if (!user) return;

        const q = query(
            collection(db, `Users/${user.uid}/Notifications`),
            orderBy("createdAt", "desc")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setNotifications(data);

            // Just for the toast: check if the first item is unread and perfectly new
            if (data.length > 0) {
                const latestNotif: any = data[0];
                if (!latestNotif.read) {
                    setToastMessage({
                        id: latestNotif.id,
                        title: "Targeted Emergency Match!",
                        desc: latestNotif.message,
                        isRead: false
                    });
                    // Auto-hide toast after 8s
                    setTimeout(() => setToastMessage(null), 8000);
                }
            }
        });

        return () => unsubscribe();
    }, [user]);

    // Fetch All Users for Admin
    useEffect(() => {
        if (!isAdmin || activeTab !== "admin") return;
        const q = query(collection(db, "Users"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setAllUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
        return () => unsubscribe();
    }, [isAdmin, activeTab]);

    // Fetch User's Chats
    useEffect(() => {
        if (!user) return;
        const q = query(collection(db, "Chats"), where("participants", "array-contains", user.uid));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const rawChats = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            // Sort locally to avoid needing a Firestore Composite Index
            rawChats.sort((a: any, b: any) => {
                const timeA = a.updatedAt?.toMillis() || 0;
                const timeB = b.updatedAt?.toMillis() || 0;
                return timeB - timeA;
            });
            setChats(rawChats);
        });
        return () => unsubscribe();
    }, [user]);

    // Fetch Messages for Active Chat
    useEffect(() => {
        if (!activeChat) return;
        const q = query(collection(db, `Chats/${activeChat.id}/Messages`), orderBy("createdAt", "asc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
        return () => unsubscribe();
    }, [activeChat]);

    // Setup delete function for Admin Facilities
    const handleDeleteFacility = async (facilityId: string) => {
        if (!isAdmin || !user) return;
        if (!window.confirm("Are you sure you want to permanently delete this facility from the database?")) return;

        try {
            await deleteDoc(doc(db, "Facilities", facilityId));
            setToastMessage({ title: "Facility Removed", desc: "The facility has been successfully deleted from the platform." });
        } catch (error) {
            console.error("Error deleting facility: ", error);
            setToastMessage({ title: "Error", desc: "Could not delete the facility. Please try again." });
        }
    };

    // Fetch Facilities
    useEffect(() => {
        if (!user) return;

        const seedFacilities = async () => {
            const mockFacilities = [
                {
                    name: "City Central Hospital",
                    type: "Hospital",
                    location: "Downtown Medical District",
                    contact: "+1 (555) 123-4567",
                    inventory: { "A+": 12, "A-": 3, "B+": 8, "B-": 1, "AB+": 5, "AB-": 0, "O+": 15, "O-": 2 }
                },
                {
                    name: "Regional Blood Bank Center",
                    type: "Blood Bank",
                    location: "Northside Industrial Park",
                    contact: "+1 (555) 987-6543",
                    inventory: { "A+": 45, "A-": 12, "B+": 30, "B-": 8, "AB+": 15, "AB-": 4, "O+": 50, "O-": 18 }
                },
                {
                    name: "St. Jude Memorial",
                    type: "Hospital",
                    location: "West End Suburbs",
                    contact: "+1 (555) 456-7890",
                    inventory: { "A+": 4, "A-": 0, "B+": 2, "B-": 0, "AB+": 1, "AB-": 0, "O+": 5, "O-": 1 }
                }
            ];

            const q = query(collection(db, "Facilities"), orderBy("name"));
            onSnapshot(q, async (snapshot) => {
                setFacilities(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
                setLoadingFacilities(false);
            });
        };

        seedFacilities();

    }, [user]);

    const handleCreateRequest = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // 1. Create the Request
            const requestRef = await addDoc(collection(db, "Requests"), {
                ...requestForm,
                requesterId: user.uid,
                status: "active",
                createdAt: serverTimestamp()
            });

            // 2. Dispatch Notifications via Backend API
            // The API handles querying users and batch-writing notifications to avoid client-side read permission errors.
            try {
                await fetch('/api/notify-donors', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        requestDetails: {
                            requestId: requestRef.id,
                            requesterId: user.uid,
                            bloodGroup: requestForm.bloodGroup,
                            location: requestForm.location
                        }
                    })
                });
            } catch (notifyErr) {
                console.error("Failed to trigger Notification API:", notifyErr);
                // Allow request to remain created even if notifying fails
            }

            setActiveTab("feed");
            setRequestForm({ patientName: "", bloodGroup: "A+", location: "", contact: "", urgency: "high", unitsRequired: 1, requiredBy: "" });
            alert("Emergency request broadcasted! Matching donors have been notified.");
        } catch (err: any) {
            console.error("Error posting request:", err);
            alert("Error posting request: " + err.message);
        }
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setUpdatingProfile(true);
        try {
            // Using setDoc with {merge: true} ensures that if the user document is somewhat incomplete, 
            // it safely creates/merges the donor fields instead of throwing an updateDoc "document not found" error.
            const { doc, setDoc } = await import("firebase/firestore");
            const userRef = doc(db, "Users", user.uid);
            await setDoc(userRef, {
                ...donorForm,
                isRegisteredDonor: true,
                // If they're newly registering, they are eligible by default
                // don't overwrite it if it's already explicitly false due to a recent donation
                isEligibleToDonate: userData?.isEligibleToDonate !== false,
                updatedAt: serverTimestamp()
            }, { merge: true });

            alert("Donor profile updated successfully! You can now receive targeted blood requests.");

            // Optionally flip back to the feed automatically so they aren't stuck on the form
            // setActiveTab("feed");

        } catch (err: any) {
            console.error(err);
            alert("Error updating profile: " + err.message);
        } finally {
            setUpdatingProfile(false);
        }
    };

    const handleDonateBlood = async () => {
        if (!confirm("Have you successfully completed a blood donation today?\n\nFor health and safety reasons, donors can only give blood once every 4 months (120 days). By confirming, your profile will be temporarily deactivated from receiving emergency requests until you are eligible again.")) return;

        try {
            const { doc, updateDoc, collection, addDoc, serverTimestamp } = await import("firebase/firestore");

            // 1. Mark the User as ineligible and record the donation date
            await updateDoc(doc(db, "Users", user.uid), {
                isEligibleToDonate: false,
                lastDonationDate: serverTimestamp()
            });

            // 2. Log the donation event in the general logs
            await addDoc(collection(db, "DonationLogs"), {
                donorId: user.uid,
                bloodGroup: userData?.bloodGroup || "unknown",
                date: serverTimestamp()
            });

            alert("Thank you for donating blood! Your profile will remain inactive for 4 months to ensure your health and safety.");

        } catch (error: any) {
            console.error("Donation log failed:", error);
            alert("Error logging donation: " + error.message);
        }
    };

    const handleConfirmDonation = async (chat: any) => {
        if (!confirm("Did you successfully donate blood for this specific emergency request?\n\nBy confirming, this request will be marked as fulfilled, tracked in the system, and your profile will enter a 120-day safety cooldown.")) return;

        try {
            const { doc, updateDoc, collection, addDoc, serverTimestamp } = await import("firebase/firestore");

            // 1. Fulfill the Request and tag the donor
            await updateDoc(doc(db, "Requests", chat.requestId), {
                status: "fulfilled",
                fulfilledBy: user.uid,
                fulfilledByName: userData?.name || "Anonymous Donor",
                fulfilledAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });

            // 2. Cooldown the Donor
            await updateDoc(doc(db, "Users", user.uid), {
                isEligibleToDonate: false,
                lastDonationDate: serverTimestamp()
            });

            // 3. Log the structured donation event
            await addDoc(collection(db, "DonationLogs"), {
                donorId: user.uid,
                requestId: chat.requestId,
                bloodGroup: userData?.bloodGroup || "unknown",
                date: serverTimestamp()
            });

            alert("Heroic! This emergency is now fulfilled. Thank you for saving a life. Your profile is on a temporary safety cooldown.");
            setActiveTab("feed");
        } catch (error: any) {
            console.error("Donation confirmation failed:", error);
            alert("Error confirming donation: " + error.message);
        }
    };

    const handleCloseRequest = async (requestId: string) => {
        if (!confirm("Are you sure you want to close this request? This means you have received the required blood.")) return;
        try {
            const { doc, updateDoc } = await import("firebase/firestore");
            await updateDoc(doc(db, "Requests", requestId), {
                status: "fulfilled",
                updatedAt: serverTimestamp()
            });
            alert("Request marked as fulfilled.");
        } catch (err: any) {
            alert("Error closing request: " + err.message);
        }
    };

    const deleteUserProfile = async (userId: string) => {
        if (!confirm("Delete this user profile completely?")) return;
        try {
            const { doc, deleteDoc } = await import("firebase/firestore");
            await deleteDoc(doc(db, "Users", userId));
            alert("User profile deleted.");
        } catch (e: any) { alert(e.message); }
    };

    const handleDeleteRequest = async (requestId: string) => {
        if (!confirm("Are you sure you want to delete this request? Doing so will remove it permanently and clear any related notifications.")) return;
        try {
            const req = requests.find(r => r.id === requestId);
            const { doc, deleteDoc, collection, query, where, getDocs, writeBatch, serverTimestamp, addDoc } = await import("firebase/firestore");

            // Log the deletion
            await addDoc(collection(db, "DeletionLogs"), {
                requestId,
                requesterId: user.uid,
                reason: isAdmin && user.uid !== req?.requesterId ? "admin_deletion" : "manual_deletion",
                bloodGroup: req?.bloodGroup || "unknown",
                deletedAt: serverTimestamp()
            });

            // Delete notifications for this request in batch across all matching donors
            if (req && req.bloodGroup) {
                const donorsQuery = query(
                    collection(db, "Users"),
                    where("isRegisteredDonor", "==", true),
                    where("bloodGroup", "==", req.bloodGroup)
                );
                const donorsSnapshot = await getDocs(donorsQuery);

                if (!donorsSnapshot.empty) {
                    const batch = writeBatch(db);
                    donorsSnapshot.forEach((donorDoc) => {
                        if (donorDoc.id !== req.requesterId) {
                            // Since we created Notifications with the RequestID as the doc ID!
                            const notificationRef = doc(db, `Users/${donorDoc.id}/Notifications`, requestId);
                            batch.delete(notificationRef);
                        }
                    });
                    await batch.commit();
                }
            }

            // Delete the request itself
            await deleteDoc(doc(db, "Requests", requestId));

            alert("Request permanently deleted and notifications cleared.");
        } catch (e: any) {
            console.error("Delete failed:", e);
            alert(e.message);
        }
    };

    const markNotificationAsRead = async (notificationId: string) => {
        try {
            const { doc, updateDoc } = await import("firebase/firestore");
            await updateDoc(doc(db, `Users/${user.uid}/Notifications`, notificationId), {
                read: true
            });
        } catch (e: any) { console.error("Could not mark as read", e); }
    };

    const deleteNotification = async (notificationId: string) => {
        try {
            const { doc, deleteDoc } = await import("firebase/firestore");
            await deleteDoc(doc(db, `Users/${user.uid}/Notifications`, notificationId));
        } catch (e: any) { console.error("Could not delete notification", e); }
    };

    const filteredRequests = requests.filter(req => {
        const matchesGroup = filterGroup === "All" || req.bloodGroup === filterGroup;
        const matchesSearch = req.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (req.patientName && req.patientName.toLowerCase().includes(searchQuery.toLowerCase()));

        // If the tab is "my-requests", filter strictly to User's requests.
        // Show all of their requests, even fulfilled ones.
        if (activeTab === "my-requests") {
            return req.requesterId === user?.uid && matchesGroup && matchesSearch;
        }

        // Hide fulfilled requests from public feeds
        if (req.status !== "active") return false;

        // If the tab is "matches" for donors, only show requests matching their registered blood type.
        if (activeTab === "matches") {
            const donorHasRegisteredGroup = userData?.bloodGroup;
            if (!donorHasRegisteredGroup) return false;
            return req.bloodGroup === userData.bloodGroup && matchesSearch;
        }

        return matchesGroup && matchesSearch;
    });

    const filteredFacilities = facilities.filter(fac => {
        const matchesSearch = fac.location.toLowerCase().includes(searchQuery.toLowerCase()) || fac.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesGroup = filterGroup === "All" || (fac.inventory && fac.inventory[filterGroup] > 0);
        return matchesSearch && matchesGroup;
    });

    const initiateChat = async (req: any) => {
        // Check if chat already exists
        const existingChat = chats.find(c => c.requestId === req.id && c.participants?.includes(user.uid) && c.participants?.includes(req.requesterId));

        if (existingChat) {
            setActiveTab("messages");
            setActiveChat(existingChat);
            return;
        }

        try {
            const chatRef = await addDoc(collection(db, "Chats"), {
                requestId: req.id,
                requestDetails: { patientName: req.patientName, bloodGroup: req.bloodGroup, location: req.location },
                donorId: user.uid,
                donorBloodGroup: userData?.bloodGroup || "Unknown",
                participants: [user.uid, req.requesterId],
                users: {
                    [user.uid]: userData?.name || "Donor",
                    [req.requesterId]: req.patientName // Defaulting to patient name for recipient
                },
                lastMessage: "Chat initiated",
                updatedAt: serverTimestamp()
            });
            setActiveTab("messages");
            setActiveChat({ id: chatRef.id, requestDetails: req, users: { [user.uid]: userData?.name, [req.requesterId]: req.patientName } });
        } catch (err: any) {
            alert("Error starting chat: " + err.message);
        }
    };

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !activeChat) return;

        try {
            const msgText = newMessage;
            setNewMessage(""); // Optimistic clear

            // Add message
            await addDoc(collection(db, `Chats/${activeChat.id}/Messages`), {
                senderId: user.uid,
                text: msgText,
                createdAt: serverTimestamp()
            });

            // Update chat's last message
            const { doc, updateDoc } = await import("firebase/firestore");
            await updateDoc(doc(db, "Chats", activeChat.id), {
                lastMessage: msgText,
                updatedAt: serverTimestamp()
            });

        } catch (err: any) {
            alert("Error sending message: " + err.message);
        }
    };



    return (
        <>
            {/* BEGIN: Stats Row */}
            {activeTab !== "create" && activeTab !== "admin" && activeTab !== "profile" && (
                <section className="flex justify-center gap-6 flex-wrap mb-2 mt-4 z-10 relative">
                    {/* Stat Card 1 */}
                    <div className="glass-panel rounded-2xl p-5 w-64 relative hover:-translate-y-1 transition-transform">
                        <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,1)]"></div>
                        <h3 className="text-sm text-gray-600 font-medium mb-1">Active Requests:</h3>
                        <p className="text-4xl font-bold text-gray-900">{requests.filter(r => r.status === "active").length}</p>
                    </div>
                    {/* Stat Card 2 */}
                    <div className="glass-panel rounded-2xl p-5 w-64 relative hover:-translate-y-1 transition-transform">
                        <div className="absolute top-4 right-4 flex gap-1">
                            <div className="w-1 h-3 bg-red-400 rounded-full"></div>
                            <div className="w-1 h-4 bg-red-500 rounded-full"></div>
                            <div className="w-1 h-2 bg-red-300 rounded-full"></div>
                        </div>
                        <h3 className="text-sm text-gray-600 font-medium mb-1">Available Donors:</h3>
                        <p className="text-4xl font-bold text-gray-900">{facilities.length > 0 ? facilities.length * 15 : 124}</p>
                    </div>
                    {/* Stat Card 3 */}
                    <div className="glass-panel rounded-2xl p-5 w-64 relative hover:-translate-y-1 transition-transform">
                        <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,1)]"></div>
                        <h3 className="text-sm text-gray-600 font-medium mb-1">Nearby Hospitals:</h3>
                        <p className="text-4xl font-bold text-gray-900">{facilities.length}</p>
                    </div>
                </section>
            )}

            {/* Title & Main Action */}
            <section className="text-center flex flex-col items-center gap-6 mt-4 mb-4 relative z-10 w-full max-w-5xl mx-auto">
                <h2 className="text-4xl font-bold tracking-tight">
                    <span className="text-blood-800">Blood Connect</span> Dashboard
                </h2>
                <button
                    onClick={() => setActiveTab(activeTab === "create" ? "feed" : "create")}
                    className="bg-gradient-to-r from-red-600 to-red-700 text-white px-8 py-3 rounded-full font-semibold text-lg flex items-center gap-2 shadow-glow hover:scale-105 transition-transform"
                    style={{ boxShadow: "0 0 25px rgba(220, 38, 38, 0.6)" }}
                >
                    {activeTab === "create" ? "Cancel Emergency Alert" : <><Hand className="w-5 h-5 text-white/90" /> Raise Hand for Emergency</>}
                </button>
            </section>

            {/* Navigation Pills */}
            <div className="w-full relative z-10 mb-2">
                <div className="w-full overflow-x-auto nav-scrollbar pb-4 px-4 sm:px-6">
                    <nav className="flex items-center justify-start md:justify-center gap-3 w-max min-w-full max-w-5xl mx-auto pb-2">
                        <button
                            onClick={() => setActiveTab("feed")}
                            className={`${activeTab === "feed" ? "bg-gradient-to-r from-red-600 to-red-700 text-white shadow-glow-sm" : "glass-button text-gray-700 hover:bg-white/80"} px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap flex items-center gap-2 transition-all shrink-0`}
                        >
                            Active Emergencies
                        </button>
                        <button
                            onClick={() => setActiveTab("my-requests")}
                            className={`${activeTab === "my-requests" ? "bg-gradient-to-r from-red-600 to-red-700 text-white shadow-glow-sm" : "glass-button text-gray-700 hover:bg-white/80"} px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap flex items-center gap-2 transition-all shrink-0`}
                        >
                            My Requests
                        </button>
                        <button
                            onClick={() => setActiveTab("matches")}
                            className={`${activeTab === "matches" ? "bg-gradient-to-r from-red-600 to-red-700 text-white shadow-glow-sm" : "glass-button text-gray-700 hover:bg-white/80"} px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap flex items-center gap-2 transition-all shrink-0`}
                        >
                            My Matches
                        </button>
                        <button
                            onClick={() => setActiveTab("messages")}
                            className={`${activeTab === "messages" ? "bg-gradient-to-r from-red-600 to-red-700 text-white shadow-glow-sm" : "glass-button text-gray-700 hover:bg-white/80"} px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap flex items-center gap-2 transition-all shrink-0 relative`}
                        >
                            Messages
                            {chats.length > 0 && <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-400 rounded-full animate-ping border border-white"></span>}
                        </button>
                        <button
                            onClick={() => setActiveTab("notifications")}
                            className={`${activeTab === "notifications" ? "bg-gradient-to-r from-red-600 to-red-700 text-white shadow-glow-sm" : "glass-button text-gray-700 hover:bg-white/80"} px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap flex items-center gap-2 transition-all shrink-0 relative`}
                        >
                            Alerts
                            {notifications.filter(n => !n.read).length > 0 && <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-400 rounded-full animate-ping border border-white"></span>}
                        </button>
                        <button
                            onClick={() => setActiveTab("facilities")}
                            className={`${activeTab === "facilities" ? "bg-gradient-to-r from-red-600 to-red-700 text-white shadow-glow-sm" : "glass-button text-gray-700 hover:bg-white/80"} px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap flex items-center gap-2 transition-all shrink-0`}
                        >
                            Hospitals & Banks
                        </button>
                        <button
                            onClick={() => setActiveTab("profile")}
                            className={`${activeTab === "profile" ? "bg-gradient-to-r from-red-600 to-red-700 text-white shadow-glow-sm" : "glass-button text-gray-700 hover:bg-white/80"} px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap flex items-center gap-2 transition-all shrink-0`}
                        >
                            Donor Profile
                        </button>
                        {isAdmin && (
                            <button
                                onClick={() => setActiveTab("admin")}
                                className={`${activeTab === "admin" ? "bg-gradient-to-r from-gray-700 to-gray-900 text-white shadow-glow-sm" : "glass-button text-red-700 font-bold hover:bg-red-50/80 border-red-200"} px-5 py-2 rounded-full text-sm whitespace-nowrap flex items-center gap-2 transition-all shrink-0`}
                            >
                                Admin Panel
                            </button>
                        )}
                    </nav>
                </div>
            </div>

            <AnimatePresence mode="popLayout">

                {/* Create Request Form Pane */}
                {activeTab === "create" && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98 }}
                        className="bg-white  p-8 rounded-3xl shadow-xl border border-red-100  relative overflow-hidden max-w-2xl"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-red-100  rounded-bl-full pointer-events-none"></div>

                        <h2 className="text-2xl font-bold mb-6 flex items-center text-red-600 ">
                            <Hand className="mr-2 w-6 h-6" /> Raise Hand for Blood
                        </h2>
                        <p className="text-slate-500 mb-6 border-b border-slate-100  pb-4">
                            Raise a hand to notify all registered donors that you have an emergency need for a specific blood group.
                        </p>

                        <form onSubmit={handleCreateRequest} className="space-y-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-semibold mb-1">Patient Name</label>
                                    <input type="text" required value={requestForm.patientName} onChange={e => setRequestForm({ ...requestForm, patientName: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-300  bg-transparent focus:ring-2 focus:ring-red-500 outline-none" placeholder="Enter patient name" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold mb-1">Blood Group Required</label>
                                    <select required value={requestForm.bloodGroup} onChange={e => setRequestForm({ ...requestForm, bloodGroup: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-300  bg-transparent focus:ring-2 focus:ring-red-500 outline-none">
                                        {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(bg => <option key={bg} value={bg}>{bg}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-semibold mb-1">Units Needed (Pints)</label>
                                    <input type="number" min="1" required value={requestForm.unitsRequired} onChange={e => setRequestForm({ ...requestForm, unitsRequired: parseInt(e.target.value) || 1 })} className="w-full px-4 py-3 rounded-xl border border-slate-300  bg-transparent focus:ring-2 focus:ring-red-500 outline-none" placeholder="e.g. 2" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold mb-1">Required By (Date/Time)</label>
                                    <input type="datetime-local" required value={requestForm.requiredBy} onChange={e => setRequestForm({ ...requestForm, requiredBy: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-300  bg-transparent focus:ring-2 focus:ring-red-500 outline-none" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold mb-1">Hospital / Location</label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
                                    <input type="text" required value={requestForm.location} onChange={e => setRequestForm({ ...requestForm, location: e.target.value })} className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300  bg-transparent focus:ring-2 focus:ring-red-500 outline-none" placeholder="E.g. City Hospital, Downtown" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold mb-1">Contact Phone</label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
                                    <input type="tel" required value={requestForm.contact} onChange={e => setRequestForm({ ...requestForm, contact: e.target.value })} className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300  bg-transparent focus:ring-2 focus:ring-red-500 outline-none" placeholder="+1 (555) 000-0000" />
                                </div>
                            </div>

                            <div className="pt-4 border-t border-slate-100 ">
                                <button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg flex justify-center items-center text-lg">
                                    <Hand className="w-5 h-5 mr-2" /> Raise Hand Now
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}

                {/* Messages Pane */}
                {activeTab === "messages" && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-[75vh] flex bg-white  rounded-3xl overflow-hidden shadow-xl border border-slate-200 ">
                        {/* Chat List (Sidebar) */}
                        <div className={`w-full md:w-1/3 border-r border-slate-100  flex flex-col ${activeChat ? 'hidden md:flex' : 'flex'}`}>
                            <div className="p-5 border-b border-slate-100  bg-slate-50 ">
                                <h3 className="font-bold text-lg flex items-center"><MessageCircle className="w-5 h-5 mr-2 text-red-500" /> Active Chats</h3>
                            </div>
                            <div className="flex-1 overflow-y-auto">
                                {chats.length === 0 ? (
                                    <div className="p-8 text-center text-slate-400 text-sm">No active conversations yet. Reach out to a match to start chatting.</div>
                                ) : (
                                    chats.map(chat => {
                                        const otherUserId = chat.participants?.find((id: string) => id !== user.uid);
                                        const otherUserName = chat.users?.[otherUserId] || "Unknown User";
                                        return (
                                            <div
                                                key={chat.id}
                                                onClick={() => setActiveChat(chat)}
                                                className={`p-4 border-b border-slate-50  cursor-pointer transition-colors ${activeChat?.id === chat.id ? 'bg-red-50  border-l-4 border-l-red-500' : 'hover:bg-slate-50 :bg-slate-700/30'}`}
                                            >
                                                <div className="flex justify-between items-start mb-1">
                                                    <h4 className="font-bold text-slate-800  text-sm truncate">{otherUserName}</h4>
                                                    <span className="text-xs text-red-600  font-bold bg-red-100  px-2 py-0.5 rounded-md">{chat.requestDetails?.bloodGroup}</span>
                                                </div>
                                                <p className="text-xs text-slate-500 truncate">{chat.lastMessage}</p>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>

                        {/* Active Chat Area */}
                        <div className={`flex-1 flex flex-col bg-slate-50/50  ${!activeChat ? 'hidden md:flex items-center justify-center' : 'flex'}`}>
                            {!activeChat ? (
                                <div className="text-center text-slate-400">
                                    <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-20" />
                                    <p>Select a conversation to start messaging</p>
                                </div>
                            ) : (
                                <>
                                    {/* Chat Header */}
                                    <div className="p-4 bg-white  border-b border-slate-100  flex items-center justify-between shadow-sm z-10 w-full">
                                        <div className="flex items-center w-full">
                                            <button onClick={() => setActiveChat(null)} className="md:hidden mr-3 text-slate-400 hover:text-slate-600 font-bold px-3 py-1 bg-slate-100  rounded-lg">
                                                ← Back
                                            </button>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-bold text-slate-800  truncate flex items-center">
                                                    {activeChat.users?.[activeChat.participants?.find((id: string) => id !== user.uid)] || "User"}
                                                    {activeChat.donorId && activeChat.donorId !== user.uid && activeChat.donorBloodGroup && (
                                                        <span className="ml-2 text-[10px] bg-red-100  text-red-600  px-2 py-0.5 rounded-full font-bold border border-red-200  uppercase tracking-wider">
                                                            Donor: {activeChat.donorBloodGroup}
                                                        </span>
                                                    )}
                                                </h3>
                                                <p className="text-xs text-red-500 font-medium truncate">Matched Request: {activeChat.requestDetails?.bloodGroup} at {activeChat.requestDetails?.location}</p>
                                            </div>
                                            {activeChat.donorId === user.uid && (
                                                <button
                                                    onClick={() => handleConfirmDonation(activeChat)}
                                                    className="ml-3 shrink-0 bg-green-50 hover:bg-green-100 text-green-700 font-bold px-3 py-1.5 rounded-lg text-xs border border-green-200 transition-colors shadow-sm"
                                                >
                                                    <CheckCircle2 className="w-3.5 h-3.5 inline mr-1" /> Mark As Donated
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Messages Feed */}
                                    <div className="flex-1 overflow-y-auto p-5 space-y-4">
                                        {messages.length === 0 && (
                                            <div className="text-center text-slate-400 text-sm py-10">Start the conversation...</div>
                                        )}
                                        {messages.map(msg => {
                                            const isMe = msg.senderId === user.uid;
                                            return (
                                                <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                                    <div className={`max-w-[85%] md:max-w-[75%] rounded-2xl px-5 py-3 ${isMe ? 'bg-red-600 hover:bg-red-700 text-white rounded-br-none shadow-md shadow-red-600/20' : 'bg-white  text-slate-800  rounded-bl-none shadow-sm border border-slate-100 '}`}>
                                                        <p className="text-sm break-words">{msg.text}</p>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>

                                    {/* Input Area */}
                                    <div className="p-4 bg-white  border-t border-slate-100  w-full">
                                        <form onSubmit={sendMessage} className="flex space-x-2 w-full">
                                            <input
                                                type="text"
                                                value={newMessage}
                                                onChange={e => setNewMessage(e.target.value)}
                                                placeholder="Type a message (e.g., 'I can be there in 20 mins')..."
                                                className="flex-1 min-w-0 bg-slate-100  border-none rounded-full px-5 py-3 text-sm focus:ring-2 focus:ring-red-500 outline-none"
                                            />
                                            <button type="submit" disabled={!newMessage.trim()} className="shrink-0 bg-red-600 hover:bg-red-700 text-white rounded-full w-12 h-12 flex items-center justify-center transition-transform active:scale-95 disabled:opacity-50">
                                                <Send className="w-5 h-5 ml-1" />
                                            </button>
                                        </form>
                                    </div>
                                </>
                            )}
                        </div>
                    </motion.div>
                )}

                {/* Alerts Pane */}
                {activeTab === "notifications" && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }}
                        className="bg-white  p-8 rounded-3xl shadow-xl border border-slate-200  relative max-w-2xl"
                    >
                        <h2 className="text-2xl font-bold mb-2 flex items-center text-slate-800 ">
                            <Bell className="mr-2 w-6 h-6 text-red-500" /> Emergency Alerts
                        </h2>
                        <p className="text-slate-500 mb-6 border-b border-slate-100  pb-4">
                            These are urgent requests from patients exactly matching your registered blood group.
                        </p>

                        <div className="space-y-4">
                            {notifications.length === 0 ? (
                                <div className="text-center text-slate-400 py-10 font-medium">
                                    You have no targeted blood requests right now.
                                </div>
                            ) : (
                                notifications.map(notif => (
                                    <motion.div
                                        key={notif.id}
                                        initial={{ opacity: 0, y: 5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={`p-5 rounded-2xl border ${!notif.read ? 'bg-red-50  border-red-200 ' : 'bg-slate-50  border-slate-200 '}`}
                                        onClick={() => !notif.read && markNotificationAsRead(notif.id)}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex items-center gap-2">
                                                {!notif.read && <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse"></span>}
                                                <h4 className={`font-bold ${!notif.read ? 'text-red-700 ' : 'text-slate-700 '}`}>
                                                    Targeted Request for {notif.bloodGroup}
                                                </h4>
                                            </div>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); deleteNotification(notif.id); }}
                                                className="text-xs text-slate-400 hover:text-red-600 font-medium px-2 py-1 rounded bg-white  shadow-sm"
                                            >
                                                Dismiss
                                            </button>
                                        </div>
                                        <p className="text-sm text-slate-600  mb-3">
                                            {notif.message}
                                        </p>

                                        <div className="flex gap-2">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setActiveTab("feed"); }}
                                                className="text-xs font-bold bg-white  text-slate-800  px-3 py-1.5 rounded-lg border border-slate-200  shadow-sm hover:border-slate-300 :border-slate-500 transition-colors"
                                            >
                                                View all on Feed
                                            </button>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </div>
                    </motion.div>
                )}

                {/* Donor Profile Pane */}
                {activeTab === "profile" && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }}
                        className="bg-white  p-8 rounded-3xl shadow-xl border border-slate-200  relative overflow-hidden max-w-2xl"
                    >
                        <h2 className="text-2xl font-bold mb-2 flex items-center text-slate-800 ">
                            <UserCircle className="mr-2 w-6 h-6 text-red-500" /> Donor Registration Profile
                        </h2>
                        <p className="text-slate-500 mb-6 border-b border-slate-100  pb-4">
                            Update your blood type and availability to help us match you quickly during critical emergencies.
                        </p>

                        <form onSubmit={handleUpdateProfile} className="space-y-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-semibold mb-1">Your Blood Group (Crucial)</label>
                                    <select required value={donorForm.bloodGroup} onChange={e => setDonorForm({ ...donorForm, bloodGroup: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-300  bg-transparent focus:ring-2 focus:ring-red-500 outline-none font-bold text-red-600">
                                        <option value="">Select Group...</option>
                                        {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(bg => <option key={bg} value={bg}>{bg}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold mb-1">City / Region</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
                                        <input type="text" required value={donorForm.location} onChange={e => setDonorForm({ ...donorForm, location: e.target.value })} className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300  bg-transparent focus:ring-2 focus:ring-red-500 outline-none" placeholder="Your City" />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold mb-1">Contact Phone</label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
                                    <input type="tel" required value={donorForm.contact} onChange={e => setDonorForm({ ...donorForm, contact: e.target.value })} className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300  bg-transparent focus:ring-2 focus:ring-red-500 outline-none" placeholder="+1 (555) 000-0000" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold mb-1 text-slate-700 ">
                                    Medical Conditions (Optional)
                                </label>
                                <textarea
                                    className="w-full px-4 py-3 rounded-xl border border-slate-300  bg-transparent focus:ring-2 focus:ring-red-500 transition-all outline-none resize-none"
                                    rows={2}
                                    placeholder="List any ongoing medications, recent surgeries, or conditions..."
                                    value={donorForm.medicalConditions}
                                    onChange={e => setDonorForm({ ...donorForm, medicalConditions: e.target.value })}
                                />
                                <p className="text-xs text-slate-500 mt-1">This information helps recipients know if your blood is safe for specific immediate uses.</p>
                            </div>

                            <label className="flex items-center space-x-3 p-4 bg-slate-50  rounded-xl border border-slate-200  mt-2 cursor-pointer hover:bg-slate-100 :bg-white transition-colors">
                                <input
                                    type="checkbox"
                                    checked={donorForm.available}
                                    onChange={e => setDonorForm({ ...donorForm, available: e.target.checked })}
                                    className="w-5 h-5 rounded border-slate-300 text-red-600 focus:ring-red-500"
                                />
                                <div>
                                    <div className="font-bold text-slate-800 ">Available to Donate Right Now</div>
                                    <div className="text-sm text-slate-500">Uncheck this if you are temporarily unavailable or recently donated.</div>
                                </div>
                            </label>

                            <div className="pt-2 border-t border-slate-100  space-y-3">
                                <button type="submit" disabled={updatingProfile} className="w-full bg-rose-50  hover:bg-white :bg-slate-600 text-slate-800 font-bold py-4 rounded-xl transition-all shadow-md flex justify-center items-center text-lg disabled:opacity-50">
                                    {updatingProfile ? <Loader2 className="animate-spin w-5 h-5" /> : "Save Profile Details"}
                                </button>
                                {userData?.isEligibleToDonate !== false && (
                                    <button
                                        type="button"
                                        onClick={handleDonateBlood}
                                        className="w-full bg-red-50  hover:bg-red-100 :bg-red-900/30 text-red-600 font-bold py-4 rounded-xl transition-all flex justify-center items-center text-lg border-2 border-red-200 "
                                    >
                                        🩸 I Have Donated Blood Today
                                    </button>
                                )}
                            </div>
                        </form>
                    </motion.div>
                )}

                {/* Feed & Searching */}
                {(activeTab === "feed" || activeTab === "my-requests" || activeTab === "matches") && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        {/* Search and Filters */}
                        <div className="flex flex-col md:flex-row gap-4 items-center justify-between w-full max-w-5xl mx-auto mb-6 relative z-10">
                            {/* Search Bar */}
                            <div className="glass-panel flex-grow rounded-xl flex items-center px-4 py-2 w-full h-12 shadow-sm">
                                <Search className="w-5 h-5 text-gray-400 mr-3" />
                                <input
                                    className="bg-transparent border-none outline-none w-full text-gray-700 placeholder-gray-400 focus:ring-0 text-sm h-full"
                                    placeholder="Search by location or hospital..."
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            {/* Blood Type Filters */}
                            <div className={`flex gap-2 flex-wrap justify-center md:justify-end ${activeTab === 'matches' ? 'opacity-50 pointer-events-none' : ''}`}>
                                <button onClick={() => setFilterGroup("All")} className={`glass-button w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold transition-all ${filterGroup === 'All' ? 'bg-red-100/80 text-red-600 border-red-300 shadow-sm shadow-red-200 backdrop-blur-md scale-105' : 'text-gray-600 hover:bg-white'}`}>All</button>
                                {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(bg => (
                                    <button
                                        key={bg}
                                        onClick={() => setFilterGroup(bg)}
                                        className={`glass-button w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold transition-all ${filterGroup === bg ? 'bg-red-100/80 text-red-600 border-red-300 shadow-sm shadow-red-200 backdrop-blur-md scale-105' : 'text-gray-600 hover:bg-white'}`}
                                    >
                                        {bg}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* List of Requests */}
                        {loadingReqs ? (
                            <div className="py-20 flex justify-center text-slate-400"><Loader2 className="animate-spin w-8 h-8" /></div>
                        ) : filteredRequests.length === 0 ? (
                            <main className="glass-panel rounded-3xl p-16 flex flex-col items-center justify-center text-center w-full max-w-5xl mx-auto mt-2 min-h-[300px]">
                                <div className="mb-4 relative">
                                    <Search className="w-16 h-16 text-white drop-shadow-[0_0_15px_rgba(239,68,68,0.8)]" style={{ WebkitTextStroke: "4px #ef4444" }} />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">No Requests Found</h3>
                                <p className="text-gray-600">
                                    {activeTab === 'matches' && !userData?.bloodGroup
                                        ? "You need to update your Donor Profile with your Blood Group before we can show your matches!"
                                        : "There are no active blood requests matching your filters."}
                                </p>
                            </main>
                        ) : (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {filteredRequests.map(req => (
                                    <motion.div
                                        key={req.id}
                                        layoutId={req.id}
                                        className="bg-white  rounded-2xl p-6 border-l-4 border-l-red-500 shadow-md hover:shadow-xl transition-all group"
                                    >
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center space-x-4">
                                                <div className="w-14 h-14 rounded-full bg-red-100  text-red-600  font-black text-xl flex items-center justify-center border-2 border-red-200 ">
                                                    {req.bloodGroup}
                                                </div>
                                                <div>
                                                    <div className="flex items-center">
                                                        <h4 className="font-bold text-lg mr-2">{req.patientName}</h4>
                                                        <span className="bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-md font-bold flex items-center">
                                                            <Hand className="w-3 h-3 mr-1" /> Hand Raised
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center text-sm text-slate-500  mt-0.5">
                                                        <MapPin className="w-3.5 h-3.5 mr-1" />
                                                        {req.location}
                                                    </div>
                                                    <div className="flex items-center space-x-3 mt-1 text-sm font-medium">
                                                        {req.unitsRequired && (
                                                            <span className="text-red-600 ">
                                                                {req.unitsRequired} Unit{req.unitsRequired > 1 ? 's' : ''} Needed
                                                            </span>
                                                        )}
                                                        {req.requiredBy && (
                                                            <span className="text-orange-600  flex items-center">
                                                                <Clock className="w-3 h-3 mr-1" />
                                                                By {new Date(req.requiredBy).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {req.status === "active" ? (
                                                <div className="text-xs font-medium text-slate-400 bg-slate-100  px-3 py-1 rounded-full flex items-center">
                                                    <Clock className="w-3.5 h-3.5 mr-1" /> Active
                                                </div>
                                            ) : (
                                                <div className="text-xs font-medium text-emerald-600 bg-emerald-100  px-3 py-1 rounded-full flex items-center font-bold">
                                                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Fulfilled
                                                </div>
                                            )}
                                        </div>

                                        <div className="mt-4 pt-4 border-t border-slate-100  flex justify-between items-center">
                                            <div className="text-sm font-semibold flex items-center">
                                                <Phone className="w-4 h-4 text-slate-400 mr-2" />
                                                {req.contact}
                                            </div>

                                            {user?.uid !== req.requesterId && req.status === "active" && (
                                                <button
                                                    onClick={() => initiateChat(req)}
                                                    className="bg-red-50 text-red-600 hover:bg-red-600 hover:text-slate-800  :bg-red-600 font-bold px-5 py-2 rounded-lg transition-colors shadow-sm text-sm flex items-center"
                                                >
                                                    <MessageCircle className="w-4 h-4 inline-block mr-2" /> I can donate
                                                </button>
                                            )}

                                            {user?.uid === req.requesterId && (
                                                <>
                                                    {req.status === "active" && (
                                                        <button
                                                            onClick={() => handleCloseRequest(req.id)}
                                                            className="bg-slate-100 text-slate-600 hover:bg-slate-200  :bg-slate-700 font-bold px-5 py-2 rounded-lg transition-colors shadow-sm text-sm"
                                                        >
                                                            Mark as Fulfilled
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => handleDeleteRequest(req.id)}
                                                        className="bg-red-50 text-red-600 hover:bg-red-100  :bg-red-900/30 font-bold px-5 py-2 rounded-lg transition-colors shadow-sm text-sm"
                                                    >
                                                        Delete Request
                                                    </button>
                                                </>
                                            )}

                                            {isAdmin && user?.uid !== req.requesterId && (
                                                <button
                                                    onClick={() => handleDeleteRequest(req.id)}
                                                    className="bg-red-100 text-red-600 hover:bg-red-600 hover:text-slate-800  :bg-red-600 font-bold px-5 py-2 rounded-lg transition-colors shadow-sm text-sm"
                                                >
                                                    Force Delete
                                                </button>
                                            )}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </motion.div>
                )}

                {/* Admin Pane */}
                {activeTab === "admin" && isAdmin && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <div className="bg-white  p-8 rounded-3xl shadow-xl border border-slate-200  relative mb-8">
                            <h2 className="text-2xl font-bold mb-6 flex items-center text-slate-800 ">
                                <UserCircle className="mr-2 w-6 h-6 text-slate-500" /> Platform Users
                            </h2>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-slate-200  text-sm">
                                            <th className="pb-3 text-slate-500 font-semibold">User ID</th>
                                            <th className="pb-3 text-slate-500 font-semibold px-4">Name</th>
                                            <th className="pb-3 text-slate-500 font-semibold px-4">Email</th>
                                            <th className="pb-3 text-slate-500 font-semibold px-4">Group</th>
                                            <th className="pb-3 text-slate-500 font-semibold px-4">Location</th>
                                            <th className="pb-3 text-slate-500 text-right font-semibold">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {allUsers.map((u: any) => (
                                            <tr key={u.id} className="border-b border-slate-100  hover:bg-slate-50 :bg-white/50 transition-colors">
                                                <td className="py-4 text-xs font-mono text-slate-400">{u.id}</td>
                                                <td className="py-4 font-semibold text-sm px-4">{u.name || "N/A"}</td>
                                                <td className="py-4 text-sm text-slate-500 px-4">{u.email || "N/A"}</td>
                                                <td className="py-4 px-4 text-red-500 font-bold text-sm">{u.bloodGroup || "N/A"}</td>
                                                <td className="py-4 px-4 text-sm text-slate-600 ">{u.location || "N/A"}</td>
                                                <td className="py-4 text-right">
                                                    <button onClick={() => deleteUserProfile(u.id)} className="text-xs bg-red-100 text-red-600 hover:bg-red-600 hover:text-slate-800 px-3 py-1.5 rounded-lg font-bold transition-colors">
                                                        Delete Profile
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        {allUsers.length === 0 && (
                                            <tr>
                                                <td colSpan={5} className="py-8 text-center text-sm text-slate-400">No users found.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Admin Requests Management */}
                        <div className="bg-white  p-8 rounded-3xl shadow-xl border border-slate-200  relative mb-8">
                            <h2 className="text-2xl font-bold mb-6 flex items-center text-slate-800 ">
                                <Hand className="mr-2 w-6 h-6 text-slate-500" /> Platform Requests
                            </h2>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-slate-200  text-sm">
                                            <th className="pb-3 text-slate-500 font-semibold">Request ID</th>
                                            <th className="pb-3 text-slate-500 font-semibold px-4">Patient</th>
                                            <th className="pb-3 text-slate-500 font-semibold px-4">Group</th>
                                            <th className="pb-3 text-slate-500 font-semibold px-4">Location</th>
                                            <th className="pb-3 text-slate-500 font-semibold px-4">Status</th>
                                            <th className="pb-3 text-slate-500 text-right font-semibold">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {requests.map((req: any) => (
                                            <tr key={req.id} className="border-b border-slate-100  hover:bg-slate-50 :bg-white/50 transition-colors">
                                                <td className="py-4 text-xs font-mono text-slate-400">{req.id}</td>
                                                <td className="py-4 font-semibold text-sm px-4">{req.patientName || "N/A"}</td>
                                                <td className="py-4 px-4 text-red-500 font-bold text-sm">{req.bloodGroup || "N/A"}</td>
                                                <td className="py-4 px-4 text-sm text-slate-600 ">{req.location || "N/A"}</td>
                                                <td className="py-4 px-4 text-sm font-bold">
                                                    {req.status === 'active' ? (
                                                        <span className="text-red-500">Active</span>
                                                    ) : (
                                                        <div className="text-green-500">
                                                            Fulfilled
                                                            {req.fulfilledByName && (
                                                                <div className="text-xs text-slate-600 font-normal mt-0.5">
                                                                    by {req.fulfilledByName}
                                                                </div>
                                                            )}
                                                            {req.fulfilledAt && (
                                                                <div className="text-[10px] text-slate-400 font-normal mt-0.5">
                                                                    {new Date(req.fulfilledAt?.toDate()).toLocaleString()}
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="py-4 text-right">
                                                    <button onClick={() => handleDeleteRequest(req.id)} className="text-xs bg-red-100 text-red-600 hover:bg-red-600 hover:text-slate-800 px-3 py-1.5 rounded-lg font-bold transition-colors">
                                                        Force Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        {requests.length === 0 && (
                                            <tr>
                                                <td colSpan={6} className="py-8 text-center text-sm text-slate-400">No requests found on the platform.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Facilities / Blood Banks Pane */}
                {activeTab === "facilities" && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        {/* Search and Filters */}
                        <div className="flex flex-col md:flex-row gap-4 mb-8">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search by location or facility name..."
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200  bg-white  focus:ring-2 focus:ring-red-500 outline-none shadow-sm"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <div className="flex items-center space-x-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                                {["All", "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(bg => (
                                    <button
                                        key={bg}
                                        onClick={() => setFilterGroup(bg)}
                                        className={`px-4 py-2.5 rounded-xl font-bold text-sm shrink-0 border-2 transition-all ${filterGroup === bg
                                            ? "border-red-500 bg-red-50  text-red-600 "
                                            : "border-slate-200  text-slate-600  bg-white "
                                            }`}
                                    >
                                        {bg}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* List of Facilities */}
                        {loadingFacilities ? (
                            <div className="py-20 flex justify-center text-slate-400"><Loader2 className="animate-spin w-8 h-8" /></div>
                        ) : filteredFacilities.length === 0 ? (
                            <div className="bg-slate-100  rounded-3xl p-12 text-center border border-dashed border-slate-300 ">
                                <Building2 className="w-12 h-12 text-slate-300  mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-slate-700  mb-2">No Facilities Found</h3>
                                <p className="text-slate-500">
                                    {filterGroup !== "All"
                                        ? `No nearby blood banks currently have '${filterGroup}' in stock.`
                                        : "There are no registered facilities matching your search area."}
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {filteredFacilities.map(fac => (
                                    <motion.div
                                        key={fac.id}
                                        layoutId={fac.id}
                                        className="bg-white  rounded-2xl p-6 border-l-4 border-l-blue-500 shadow-md hover:shadow-xl transition-all group"
                                    >
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center space-x-4">
                                                <div className="w-14 h-14 rounded-xl bg-blue-100  text-blue-600  flex items-center justify-center border-2 border-blue-200 ">
                                                    <Building2 className="w-7 h-7" />
                                                </div>
                                                <div>
                                                    <div className="flex items-center">
                                                        <h4 className="font-bold text-lg mr-2">{fac.name}</h4>
                                                        <span className="bg-blue-100 text-blue-600 text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-bold">
                                                            {fac.type || "Blood Bank"}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center text-sm text-slate-500  mt-1">
                                                        <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400" />
                                                        {fac.location}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* INVENTORY DISPLAY */}
                                        <div className="bg-slate-50  rounded-xl p-4 mt-5 border border-slate-100 ">
                                            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center">
                                                <Droplet className="w-3.5 h-3.5 mr-1" /> Current Inventory
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {fac.inventory && Object.keys(fac.inventory).map(bg => (
                                                    <div key={bg} className={`px-3 py-1.5 rounded-lg border flex flex-col items-center min-w-[60px] ${fac.inventory[bg] > 0
                                                        ? (filterGroup === bg || filterGroup === "All" ? 'bg-red-50 border-red-200 text-red-700   ' : 'bg-white border-slate-200 text-slate-700   ')
                                                        : 'bg-slate-50 border-slate-200 text-slate-400    opacity-50'
                                                        }`}>
                                                        <span className="font-bold">{bg}</span>
                                                        <span className="text-xs">{fac.inventory[bg]} units</span>
                                                    </div>
                                                ))}
                                                {(!fac.inventory || Object.keys(fac.inventory).length === 0) && (
                                                    <div className="text-sm text-slate-400 italic">Inventory unknown</div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="mt-4 flex justify-between items-center px-1">
                                            <div className="text-sm font-semibold flex items-center text-slate-600 ">
                                                <Phone className="w-4 h-4 text-slate-400 mr-2" />
                                                {fac.contact}
                                            </div>
                                            <div className="flex space-x-3 items-center">
                                                {isAdmin && (
                                                    <button onClick={() => handleDeleteFacility(fac.id)} className="text-sm font-bold text-red-600 hover:text-red-700 transition-colors flex items-center bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg border border-red-100 shadow-sm">
                                                        <Trash2 className="w-4 h-4 mr-1.5" /> Delete
                                                    </button>
                                                )}
                                                <a href={`tel:${fac.contact}`} className="text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors flex items-center bg-blue-50 px-3 py-1.5 rounded-lg">
                                                    Call Now <Clock className="w-4 h-4 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                </a>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </motion.div>
                )}

            </AnimatePresence >

            {/* Notification Toast */}
            <AnimatePresence>
                {
                    toastMessage && (
                        <motion.div
                            initial={{ opacity: 0, y: 50, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="fixed bottom-6 right-6 bg-white  shadow-2xl border-l-4 border-red-500 rounded-xl p-5 max-w-sm z-50 flex items-start space-x-4 cursor-pointer"
                            onClick={() => {
                                setToastMessage(null);
                                setActiveTab("matches");
                            }}
                        >
                            <div className="bg-red-100  p-2 rounded-full">
                                <Bell className="w-6 h-6 text-red-600  animate-pulse" />
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-800 ">{toastMessage.title}</h4>
                                <p className="text-sm text-slate-500  mt-1 leading-snug">{toastMessage.desc}</p>
                            </div>
                        </motion.div>
                    )
                }
            </AnimatePresence >
        </>
    );
}
