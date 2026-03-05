import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";
import * as admin from "firebase-admin";

export async function GET(request: Request) {
    // Protect this route from public access using Vercel CRON_SECRET
    const authHeader = request.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized. Invalid Cron Secret.' }, { status: 401 });
    }

    try {
        const adminDb = getAdminDb();
        const now = new Date();
        const cooldownTime = new Date(now.getTime() - (120 * 24 * 60 * 60 * 1000)); // Exactly 120 days ago

        // Find users who are ineligible and whose last donation was >= 120 days ago
        const usersRef = adminDb.collection("Users");
        const snapshot = await usersRef
            .where("isEligibleToDonate", "==", false)
            .where("lastDonationDate", "<=", admin.firestore.Timestamp.fromDate(cooldownTime))
            .get();

        if (snapshot.empty) {
            return NextResponse.json({ success: true, message: "No donors ready for reactivation.", count: 0 });
        }

        const batch = adminDb.batch();
        let reactivatedCount = 0;

        for (const userDoc of snapshot.docs) {
            const userData = userDoc.data();
            const userId = userDoc.id;

            // 1. Log the automated reactivation
            const logRef = adminDb.collection("ReactivationLogs").doc();
            batch.set(logRef, {
                donorId: userId,
                cooldownStartedAt: userData.lastDonationDate || null,
                reactivatedAt: admin.firestore.FieldValue.serverTimestamp()
            });

            // 2. Set the donor back to eligible
            batch.update(userDoc.ref, {
                isEligibleToDonate: true
            });

            reactivatedCount++;

            // 3. Mock Email dispatch
            // If using Resend/Sendgrid, you would call `await resend.emails.send(...)` here
            console.log(`\n\n[MOCK EMAIL SENT TO DONOR #${userId} / ${userData.name || 'Anonymous'}]`);
            console.log(`Subject: You're eligible to save lives again!`);
            console.log(`Body: Your BloodConnect donor profile is active again. Thank you for your generous blood donation. Your support helps save lives. We wish you good health and welcome you to donate again when needed.\n\n`);
        }

        // Commit all reactivations and logs at once safely
        await batch.commit();

        return NextResponse.json({
            success: true,
            message: `Successfully reactivated ${reactivatedCount} donors off their 120-day cooldown.`,
            count: reactivatedCount
        });
    } catch (error: any) {
        console.error("Cron Auto-Reactivate Job Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
