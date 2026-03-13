import { initializeApp } from 'firebase/app'
import { getFirestore, collection, getDocs, doc, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore'

// 🔥 PASTE YOUR FIREBASE CONFIG HERE
const firebaseConfig = {
    apiKey: "AIzaSyAFLmRl_PoSF2bDdcD7-r0llmMcIzLNJAY",
    authDomain: "player-ratings-e979f.firebaseapp.com",
    projectId: "player-ratings-e979f",
    storageBucket: "player-ratings-e979f.firebasestorage.app",
    messagingSenderId: "882859560495",
    appId: "1:882859560495:web:e7960f6d6b5e4315dac0da"
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)
const playersRef = collection(db, 'players')

// 🔑 SET YOUR SECRET ADMIN KEY HERE
export const ADMIN_SECRET = 'hubfc2026'

export async function savePlayer(player) {
    await setDoc(doc(db, 'players', player.id), player)
}

export async function removePlayer(id) {
    await deleteDoc(doc(db, 'players', id))
}

export function subscribePlayers(callback) {
    return onSnapshot(playersRef, (snapshot) => {
        const players = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
        callback(players)
    })
}