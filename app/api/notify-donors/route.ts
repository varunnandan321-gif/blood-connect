import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase/admin';
import * as admin from 'firebase-admin';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { requestDetails } = body;

        if (!requestDetails || !requestDetails.bloodGroup) {
            return NextResponse.json({ success: false, message: "Invalid request details" }, { status: 400 });
        }

        const adminDb = getAdminDb();
        const notifiedDonors = [];

        // Fetch eligible donors matching the blood group using standard server-side querying
        const donorsSnapshot = await adminDb.collection("Users").where("bloodGroup", "==", requestDetails.bloodGroup).get();

        const batch = adminDb.batch();

        for (const donorDoc of donorsSnapshot.docs) {
            const donorData = donorDoc.data();

            // Exclude the requester and check eligibility
            if (donorDoc.id !== requestDetails.requesterId && donorData.available === true && donorData.isEligibleToDonate !== false) {

                const notificationMessage = `Urgent Blood Request: A patient requires ${requestDetails.bloodGroup} blood near ${requestDetails.location}. Please check the BloodConnect app if you are available to donate.`;

                // 1. Create In-App Notification using batch
                const notificationRef = adminDb.collection(`Users/${donorDoc.id}/Notifications`).doc();
                batch.set(notificationRef, {
                    requestId: requestDetails.requestId,
                    message: notificationMessage,
                    bloodGroup: requestDetails.bloodGroup,
                    location: requestDetails.location,
                    read: false,
                    createdAt: admin.firestore.FieldValue.serverTimestamp()
                });

                // 2. Mock Email Dispatch
                if (donorData.email) {
                    console.log(`\n\n ================ EMAIL DISPATCH ================`);
                    console.log(`To: ${donorData.name || 'Anonymous'} <${donorData.email}>`);
                    console.log(`From: alerts@bloodconnect.com`);
                    console.log(`Subject: Urgent Match: ${requestDetails.bloodGroup} Blood Needed`);
                    console.log(`Body: \n${notificationMessage} \n`);
                    console.log(`================================================\n\n`);
                }

                notifiedDonors.push(donorDoc.id);
            }
        }

        // Commit all in-app notifications to Firestore securely via the backend
        if (notifiedDonors.length > 0) {
            await batch.commit();

            // Log the dispatch event to Firestore for tracking
            await adminDb.collection("NotificationLogs").add({
                requestId: requestDetails.requestId,
                notificationType: "blood_request",
                notifiedCount: notifiedDonors.length,
                timestamp: admin.firestore.FieldValue.serverTimestamp()
            });
        }

        return NextResponse.json({
            success: true,
            message: `Notifications sent to ${notifiedDonors.length} donors.`,
            notifiedCount: notifiedDonors.length
        });

    } catch (error: any) {
        console.error("Notification Dispatch Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
