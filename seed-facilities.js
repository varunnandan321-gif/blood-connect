const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc } = require('firebase/firestore');

// Minimal config for the seed script
const firebaseConfig = {
    apiKey: "dummy",
    authDomain: "blood-connect-demo.firebaseapp.com",
    projectId: "blood-connect-demo",
    storageBucket: "blood-connect-demo.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:12345:web:12345"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const mockFacilities = [
    {
        name: "City Central Hospital",
        type: "Hospital",
        location: "Downtown Medical District",
        contact: "+1 (555) 123-4567",
        inventory: {
            "A+": 12, "A-": 3, "B+": 8, "B-": 1, "AB+": 5, "AB-": 0, "O+": 15, "O-": 2
        }
    },
    {
        name: "Regional Blood Bank Center",
        type: "Blood Bank",
        location: "Northside Industrial Park",
        contact: "+1 (555) 987-6543",
        inventory: {
            "A+": 45, "A-": 12, "B+": 30, "B-": 8, "AB+": 15, "AB-": 4, "O+": 50, "O-": 18
        }
    },
    {
        name: "St. Jude Memorial",
        type: "Hospital",
        location: "West End Suburbs",
        contact: "+1 (555) 456-7890",
        inventory: {
            "A+": 4, "A-": 0, "B+": 2, "B-": 0, "AB+": 1, "AB-": 0, "O+": 5, "O-": 1
        }
    }
];

async function seedData() {
    console.log("Seeding Facilities data...");
    for (const fac of mockFacilities) {
        try {
            await addDoc(collection(db, "Facilities"), fac);
            console.log(`Added: ${fac.name}`);
        } catch (e) {
            console.error("Error adding document: ", e);
        }
    }
    console.log("Done seeding.");
    process.exit(0);
}

seedData();
