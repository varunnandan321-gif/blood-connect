import * as admin from "firebase-admin";

export const getAdminDb = () => {
    if (!admin.apps.length) {
        try {
            admin.initializeApp({
                credential: admin.credential.cert({
                    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "blood-connect-6b59f",
                    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
                })
            });
        } catch (error: any) {
            console.error("Firebase admin init failed (missing env vars?):", error.message);
            // It might fail locally without env vars, but we catch it so build doesn't crash
        }
    }
    return admin.firestore();
}
