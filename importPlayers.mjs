// Save this as: importPlayers.mjs (in your project root folder)
// Run with: node importPlayers.mjs

import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

// 🔥 PASTE YOUR FIREBASE CONFIG HERE (same one from src/firebase.js)
const firebaseConfig = {
    apiKey: "AIzaSyAFLmRl_PoSF2bDdcD7-r0llmMcIzLNJAY",
    authDomain: "player-ratings-e979f.firebaseapp.com",
    projectId: "player-ratings-e979f",
    storageBucket: "player-ratings-e979f.firebasestorage.app",
    messagingSenderId: "882859560495",
    appId: "1:882859560495:web:e7960f6d6b5e4315dac0da"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const players = [
    { id: "p01", name: "Otsula", firstTouch: 70, dribbling: 80, passAccuracy: 70, shootingTechnique: 70, weakFoot: 50, tackling: 90, ballProtection: 70, speed: 70, agility: 70, strength: 70, stamina: 80, balance: 70, position: 70, decisionMaking: 70, communication: 50, workRate: 70, coachability: 80, discipline: 80, leadershipPotential: 80 },
    { id: "p02", name: "Aaron", firstTouch: 80, dribbling: 80, passAccuracy: 70, shootingTechnique: 70, weakFoot: 60, tackling: 50, ballProtection: 60, speed: 80, agility: 50, strength: 60, stamina: 60, balance: 70, position: 80, decisionMaking: 80, communication: 50, workRate: 60, coachability: 70, discipline: 70, leadershipPotential: 50 },
    { id: "p03", name: "Athman", firstTouch: 60, dribbling: 70, passAccuracy: 60, shootingTechnique: 70, weakFoot: 50, tackling: 50, ballProtection: 60, speed: 80, agility: 50, strength: 60, stamina: 60, balance: 60, position: 60, decisionMaking: 60, communication: 50, workRate: 60, coachability: 70, discipline: 70, leadershipPotential: 50 },
    { id: "p04", name: "Jhanpier", firstTouch: 90, dribbling: 80, passAccuracy: 70, shootingTechnique: 50, weakFoot: 60, tackling: 60, ballProtection: 60, speed: 50, agility: 60, strength: 60, stamina: 50, balance: 70, position: 40, decisionMaking: 60, communication: 60, workRate: 60, coachability: 70, discipline: 80, leadershipPotential: 60 },
    { id: "p05", name: "Tevin", firstTouch: 90, dribbling: 80, passAccuracy: 80, shootingTechnique: 90, weakFoot: 80, tackling: 70, ballProtection: 80, speed: 80, agility: 80, strength: 80, stamina: 80, balance: 70, position: 80, decisionMaking: 80, communication: 70, workRate: 70, coachability: 80, discipline: 70, leadershipPotential: 80 },
    { id: "p06", name: "Michael", firstTouch: 70, dribbling: 75, passAccuracy: 60, shootingTechnique: 50, weakFoot: 60, tackling: 50, ballProtection: 60, speed: 60, agility: 60, strength: 60, stamina: 60, balance: 70, position: 80, decisionMaking: 60, communication: 50, workRate: 70, coachability: 70, discipline: 40, leadershipPotential: 50 },
    { id: "p07", name: "Rafael", firstTouch: 50, dribbling: 50, passAccuracy: 40, shootingTechnique: 60, weakFoot: 50, tackling: 50, ballProtection: 50, speed: 60, agility: 50, strength: 50, stamina: 60, balance: 60, position: 60, decisionMaking: 50, communication: 50, workRate: 60, coachability: 80, discipline: 60, leadershipPotential: 60 },
    { id: "p08", name: "Brooklyn", firstTouch: 40, dribbling: 60, passAccuracy: 50, shootingTechnique: 50, weakFoot: 50, tackling: 40, ballProtection: 40, speed: 50, agility: 40, strength: 40, stamina: 40, balance: 50, position: 40, decisionMaking: 40, communication: 50, workRate: 50, coachability: 60, discipline: 70, leadershipPotential: 60 },
    { id: "p09", name: "Pablo", firstTouch: 70, dribbling: 70, passAccuracy: 60, shootingTechnique: 70, weakFoot: 60, tackling: 80, ballProtection: 60, speed: 60, agility: 60, strength: 50, stamina: 70, balance: 60, position: 70, decisionMaking: 70, communication: 60, workRate: 60, coachability: 70, discipline: 40, leadershipPotential: 60 },
    { id: "p10", name: "Morgan", firstTouch: 60, dribbling: 60, passAccuracy: 50, shootingTechnique: 70, weakFoot: 50, tackling: 50, ballProtection: 60, speed: 50, agility: 60, strength: 50, stamina: 40, balance: 50, position: 50, decisionMaking: 50, communication: 50, workRate: 50, coachability: 60, discipline: 70, leadershipPotential: 50 },
    { id: "p11", name: "Ferdinand", firstTouch: 60, dribbling: 70, passAccuracy: 60, shootingTechnique: 70, weakFoot: 50, tackling: 80, ballProtection: 80, speed: 90, agility: 70, strength: 90, stamina: 90, balance: 80, position: 70, decisionMaking: 70, communication: 60, workRate: 80, coachability: 80, discipline: 80, leadershipPotential: 80 },
    { id: "p12", name: "Ken", firstTouch: 40, dribbling: 50, passAccuracy: 50, shootingTechnique: 50, weakFoot: 40, tackling: 80, ballProtection: 80, speed: 70, agility: 60, strength: 80, stamina: 80, balance: 70, position: 60, decisionMaking: 50, communication: 50, workRate: 60, coachability: 50, discipline: 60, leadershipPotential: 50 },
    { id: "p13", name: "Heston", firstTouch: 40, dribbling: 40, passAccuracy: 50, shootingTechnique: 50, weakFoot: 40, tackling: 70, ballProtection: 60, speed: 60, agility: 40, strength: 70, stamina: 70, balance: 50, position: 50, decisionMaking: 50, communication: 40, workRate: 60, coachability: 50, discipline: 70, leadershipPotential: 40 },
    { id: "p14", name: "Alvin", firstTouch: 50, dribbling: 50, passAccuracy: 60, shootingTechnique: 50, weakFoot: 50, tackling: 60, ballProtection: 50, speed: 70, agility: 60, strength: 50, stamina: 60, balance: 60, position: 60, decisionMaking: 60, communication: 60, workRate: 70, coachability: 60, discipline: 60, leadershipPotential: 60 },
    { id: "p15", name: "Joe", firstTouch: 30, dribbling: 30, passAccuracy: 30, shootingTechnique: 30, weakFoot: 30, tackling: 50, ballProtection: 40, speed: 50, agility: 30, strength: 40, stamina: 40, balance: 30, position: 30, decisionMaking: 20, communication: 30, workRate: 50, coachability: 40, discipline: 70, leadershipPotential: 50 },
];

async function importAll() {
    console.log("Starting import of " + players.length + " players...\n");

    for (const player of players) {
        try {
            await setDoc(doc(db, "players", player.id), player);
            console.log("  ✅ " + player.name + " imported successfully");
        } catch (err) {
            console.log("  ❌ " + player.name + " failed: " + err.message);
        }
    }

    console.log("\n🎉 Import complete! Refresh your browser to see the players.");
    process.exit(0);
}

importAll();