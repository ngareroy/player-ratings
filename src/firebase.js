import { initializeApp } from 'firebase/app'
import { getFirestore, collection, doc, setDoc, getDoc, deleteDoc, onSnapshot, getDocs, query, where } from 'firebase/firestore'
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from 'firebase/auth'

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
const auth = getAuth(app)
const googleProvider = new GoogleAuthProvider()

// ============ AUTH ============

export { auth, onAuthStateChanged }

export function loginWithEmail(email, password) {
    return signInWithEmailAndPassword(auth, email, password)
}

export function registerWithEmail(email, password) {
    return createUserWithEmailAndPassword(auth, email, password)
}

// Create account WITHOUT signing in as that user (for invites)
export async function createAccountWithoutSignIn(email, password) {
    const { initializeApp, deleteApp } = await import('firebase/app')
    const { getAuth, createUserWithEmailAndPassword } = await import('firebase/auth')
    const tempApp = initializeApp(firebaseConfig, 'temp-' + Date.now())
    const tempAuth = getAuth(tempApp)
    try {
        const cred = await createUserWithEmailAndPassword(tempAuth, email, password)
        const uid = cred.user.uid
        await deleteApp(tempApp)
        return uid
    } catch (err) {
        await deleteApp(tempApp)
        throw err
    }
}

export function loginWithGoogle() {
    return signInWithPopup(auth, googleProvider)
}

export function logout() {
    return signOut(auth)
}

// ============ ADMIN ROLES ============
// Roles: "head_coach", "assistant_coach"
// head_coach: full access (add/edit/delete players, manage admins)
// assistant_coach: can edit ratings but not delete players or manage admins

const adminsRef = collection(db, 'admins')

export async function getAdminRole(uid) {
    const snap = await getDoc(doc(db, 'admins', uid))
    if (snap.exists()) return snap.data()
    return null
}

export async function setAdminRole(uid, email, role, name, avatar, avatarColor) {
    const existing = await getDoc(doc(db, 'admins', uid))
    const prev = existing.exists() ? existing.data() : {}
    await setDoc(doc(db, 'admins', uid), {
        email,
        role,
        name,
        avatar: avatar !== undefined ? avatar : (prev.avatar || ""),
        avatarColor: avatarColor !== undefined ? avatarColor : (prev.avatarColor || "green"),
        createdAt: prev.createdAt || new Date().toISOString(),
    })
}

export async function removeAdmin(uid) {
    await deleteDoc(doc(db, 'admins', uid))
}

export function subscribeAdmins(callback) {
    return onSnapshot(adminsRef, (snapshot) => {
        const admins = snapshot.docs.map(d => ({ uid: d.id, ...d.data() }))
        callback(admins)
    })
}

export async function getAdminCount() {
    const snap = await getDocs(adminsRef)
    return snap.size
}

// ============ TEAMS ============

const teamsRef = collection(db, 'teams')

export async function saveTeam(team) {
    await setDoc(doc(db, 'teams', team.id), team)
}

export async function removeTeam(id) {
    await deleteDoc(doc(db, 'teams', id))
}

export function subscribeTeams(callback) {
    return onSnapshot(teamsRef, (snapshot) => {
        const teams = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
        callback(teams)
    })
}

// ============ SEASONS ============

const seasonsRef = collection(db, 'seasons')

export async function saveSeason(season) {
    await setDoc(doc(db, 'seasons', season.id), season)
}

export async function removeSeason(id) {
    await deleteDoc(doc(db, 'seasons', id))
}

export function subscribeSeasons(callback) {
    return onSnapshot(seasonsRef, (snapshot) => {
        const seasons = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
        callback(seasons)
    })
}

// ============ PLAYERS ============

const playersRef = collection(db, 'players')

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