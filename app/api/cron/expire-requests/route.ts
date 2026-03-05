import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";
import * as admin from "firebase-admin";

export async function GET(request: Request) {
    // Protect this route from public access (Vercel provides a CRON_SECRET)
    const authHeader = request.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized. Invalid Cron Secret.' }, { status: 401 });
    }

    try {
        const adminDb = getAdminDb();
        const now = new Date();
        const expiryTime = new Date(now.getTime() - (72 * 60 * 60 * 1000)); // exactly 72 hours ago

        // Find all requests created before exactly 72 hours ago
        const requestsRef = adminDb.collection("Requests");
        const snapshot = await requestsRef.where("createdAt", "<=", admin.firestore.Timestamp.fromDate(expiryTime)).get();

        if (snapshot.empty) {
            return NextResponse.json({ success: true, message: "No expired requests found.", count: 0 });
        }

        const batch = adminDb.batch();
        let expiredCount = 0;

        for (const requestDoc of snapshot.docs) {
            const reqData = requestDoc.data();
            const requestId = requestDoc.id;

            // 1. Log the automated expiration deletion
            const logRef = adminDb.collection("DeletionLogs").doc();
            batch.set(logRef, {
                requestId,
                requesterId: reqData.requesterId || "unknown",
                reason: "auto_expired_72h",
                bloodGroup: reqData.bloodGroup || "unknown",
                deletedAt: admin.firestore.FieldValue.serverTimestamp()
            });

            // 2. Clear out any lingering notifications in specific donors' inboxes
            if (reqData.bloodGroup) {
                const donorsQuery = adminDb.collection("Users")
                    .where("bloodGroup", "==", reqData.bloodGroup)
                    .where("isRegisteredDonor", "==", true);

                const donorsSnapshot = await donorsQuery.get();

                donorsSnapshot.forEach((donorDoc: any) => {
                    if (donorDoc.id !== reqData.requesterId) {
                        const notifRef = adminDb.collection("Users").doc(donorDoc.id).collection("Notifications").doc(requestId);
                        batch.delete(notifRef);
                    }
                });
            }

            // 3. Delete the request entity itself
            batch.delete(requestDoc.ref);
            expiredCount++;
        }

        await batch.commit();

        return NextResponse.json({ success: true, message: `Successfully auto-expired ${expiredCount} 72h+ requests.`, count: expiredCount });
    } catch (error: any) {
        console.error("Cron Job Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
