import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, deleteDoc } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyDIFmyoaP6BFhFWEF-HwTOPm8PC-bqAaXM",
    authDomain: "blood-connect-6b59f.firebaseapp.com",
    projectId: "blood-connect-6b59f",
    storageBucket: "blood-connect-6b59f.firebasestorage.app",
    messagingSenderId: "50185170828",
    appId: "1:50185170828:web:622aea2a9f57015f7cf0a9"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function run() {
    console.log("Fetching docs...");
    const snap = await getDocs(collection(db, "Facilities"));
    let count = 0;
    for (const doc of snap.docs) {
        await deleteDoc(doc.ref);
        count++;
    }
    console.log(`Deleted ${count} facilities.`);
    process.exit(0);
}
run().catch(e => { console.error(e); process.exit(1); });
