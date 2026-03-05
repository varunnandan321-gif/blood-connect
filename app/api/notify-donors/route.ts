import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase/admin';
import * as admin from 'firebase-admin';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { donorIds, requestDetails } = body;

        if (!donorIds || !Array.isArray(donorIds) || donorIds.length === 0) {
            return NextResponse.json({ success: false, message: "No donors provided" }, { status: 400 });
        }

        const adminDb = getAdminDb();
        const notifiedDonors = [];

        // In a real application, you would initialize Resend/SendGrid right here:
        // const resend = new Resend(process.env.RESEND_API_KEY);

        for (const donorId of donorIds) {
            // Fetch donor's email from the secure Users collection
            const donorSnapshot = await adminDb.collection("Users").doc(donorId).get();

            if (donorSnapshot.exists) {
                const donorData = donorSnapshot.data();
                if (donorData?.email) {

                    const notificationMessage = `Urgent Blood Request: A patient requires ${requestDetails.bloodGroup} blood near ${requestDetails.location}. Please check the BloodConnect app if you are available to donate.`;

                    // --- MOCK EMAIL DISPATCH ---
                    console.log(`\n\n ================ EMAIL DISPATCH ================`);
                    console.log(`To: ${donorData.name || 'Anonymous'} <${donorData.email} > `);
                    console.log(`From: alerts @bloodconnect.com`);
                    console.log(`Subject: Urgent Match: ${requestDetails.bloodGroup} Blood Needed`);
                    console.log(`Body: \n${notificationMessage} \n`);
                    console.log(`================================================\n\n`);
                    // ---------------------------

                    /*
                    Example Resend Implementation:
                    await resend.emails.send({
                        from: 'Alerts <alerts@bloodconnect.com>',
                        to: [donorData.email],
                        subject: `Urgent Match: ${ requestDetails.bloodGroup } Blood Needed`,
                        html: `< p > ${ notificationMessage } </p>`
                    });
                    */

                    notifiedDonors.push(donorId);
                }
            }
        }

        // Log the dispatch event to Firestore for tracking
        if (notifiedDonors.length > 0) {
            await adminDb.collection("NotificationLogs").add({
                requestId: requestDetails.requestId,
                notificationType: "blood_request",
                notifiedCount: notifiedDonors.length,
                timestamp: admin.firestore.FieldValue.serverTimestamp()
            });
        }

        return NextResponse.json({
            success: true,
            message: `Mock emails sent to ${notifiedDonors.length} donors.`,
            notifiedCount: notifiedDonors.length
        });

    } catch (error: any) {
        console.error("Email Dispatch Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
