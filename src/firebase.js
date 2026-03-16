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

// ============ CLUB SETTINGS ============

export async function getClubSettings() {
    const snap = await getDoc(doc(db, 'clubSettings', 'main'))
    if (snap.exists()) return snap.data()
    return { clubName: "Hub FC", motto: "", about: "", primaryColor: "#2ecc40", logoEmoji: "⚽" }
}

export async function saveClubSettings(settings) {
    await setDoc(doc(db, 'clubSettings', 'main'), settings)
}

export function subscribeClubSettings(callback) {
    return onSnapshot(doc(db, 'clubSettings', 'main'), (snap) => {
        if (snap.exists()) callback(snap.data())
        else callback({ clubName: "Hub FC", motto: "", about: "", primaryColor: "#2ecc40", logoEmoji: "⚽" })
    })
}

// ============ NEWS ============

const newsRef = collection(db, 'news')

export async function saveNewsPost(post) {
    await setDoc(doc(db, 'news', post.id), post)
}

export async function removeNewsPost(id) {
    await deleteDoc(doc(db, 'news', id))
}

export function subscribeNews(callback) {
    return onSnapshot(newsRef, (snapshot) => {
        const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
        callback(list)
    })
}

// ============ MATCHES ============

const matchesRef = collection(db, 'matches')

export async function saveMatch(match) {
    await setDoc(doc(db, 'matches', match.id), match)
}

export async function removeMatch(id) {
    await deleteDoc(doc(db, 'matches', id))
    // Also delete all stats for this match
    const snap = await getDocs(query(collection(db, 'matchStats'), where('matchId', '==', id)))
    await Promise.all(snap.docs.map(d => deleteDoc(d.ref)))
}

export function subscribeMatches(callback) {
    return onSnapshot(matchesRef, (snapshot) => {
        const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
        callback(list)
    })
}

// ============ MATCH STATS (per player per match) ============

const matchStatsRef = collection(db, 'matchStats')

export async function saveMatchStat(stat) {
    const id = stat.id || `${stat.matchId}_${stat.playerId}`
    await setDoc(doc(db, 'matchStats', id), { ...stat, id })
}

export function subscribeMatchStats(matchId, callback) {
    return onSnapshot(
        query(matchStatsRef, where('matchId', '==', matchId)),
        (snapshot) => {
            const list = snapshot.docs.map(d => d.data())
            callback(list)
        }
    )
}

export function subscribePlayerMatchStats(playerId, callback) {
    return onSnapshot(
        query(matchStatsRef, where('playerId', '==', playerId)),
        (snapshot) => {
            const list = snapshot.docs.map(d => d.data())
            callback(list)
        }
    )
}

// ============ ASSESSMENTS ============

const assessmentsRef = collection(db, 'assessments')

export async function saveAssessment(assessment) {
    await setDoc(doc(db, 'assessments', assessment.id), assessment)
}

export async function removeAssessment(id) {
    await deleteDoc(doc(db, 'assessments', id))
}

export function subscribeAssessments(callback) {
    return onSnapshot(assessmentsRef, (snapshot) => {
        const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
        callback(list)
    })
}

// ============ RATING HISTORY ============

const historyRef = collection(db, 'ratingHistory')

export async function saveRatingSnapshot(playerId, playerData, assessmentId, savedByName) {
    const id = `${playerId}_${Date.now()}`
    await setDoc(doc(db, 'ratingHistory', id), {
        id,
        playerId,
        assessmentId: assessmentId || "",
        savedBy: savedByName || "Unknown",
        timestamp: new Date().toISOString(),
        ...playerData,
    })
}

export function subscribePlayerHistory(playerId, callback) {
    return onSnapshot(
        query(historyRef, where('playerId', '==', playerId)),
        (snapshot) => {
            const list = snapshot.docs.map(d => d.data())
                .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
            callback(list)
        }
    )
}

export async function deletePlayerHistory(playerId) {
    const snap = await getDocs(query(historyRef, where('playerId', '==', playerId)))
    const batch = []
    snap.docs.forEach(d => batch.push(deleteDoc(d.ref)))
    await Promise.all(batch)
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