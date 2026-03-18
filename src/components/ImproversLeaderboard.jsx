import { useState, useEffect, useMemo } from 'react'
import { collection, onSnapshot, getFirestore } from 'firebase/firestore'
import { subscribePlayers } from '../firebase'
import { calcOverall, getRatingColor } from '../utils'

export default function ImproversLeaderboard({ limit = 5, showTitle = true }) {
    const [players, setPlayers] = useState([])
    const [allHistory, setAllHistory] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let c = 0
        const check = () => { c++; if (c >= 2) setLoading(false) }

        const u1 = subscribePlayers(d => { setPlayers(d); check() })

        // Subscribe to all rating history
        const db = getFirestore()
        const u2 = onSnapshot(collection(db, 'ratingHistory'), (snapshot) => {
            const list = snapshot.docs.map(d => d.data())
            setAllHistory(list)
            check()
        })

        return () => { u1(); u2() }
    }, [])

    const leaderboard = useMemo(() => {
        if (allHistory.length === 0 || players.length === 0) return []

        // Group history by player
        const byPlayer = {}
        allHistory.forEach(h => {
            if (!byPlayer[h.playerId]) byPlayer[h.playerId] = []
            byPlayer[h.playerId].push(h)
        })

        // Calculate improvement for each player
        const improvements = []
        Object.entries(byPlayer).forEach(([pid, entries]) => {
            if (entries.length < 2) return
            const sorted = [...entries].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
            const first = sorted[0]
            const last = sorted[sorted.length - 1]
            const firstOvr = calcOverall(first)
            const lastOvr = calcOverall(last)
            const diff = lastOvr - firstOvr
            const player = players.find(p => p.id === pid)
            if (!player) return

            improvements.push({
                player,
                firstOvr: Math.round(firstOvr),
                currentOvr: Math.round(lastOvr),
                diff: Math.round(diff * 10) / 10,
                entries: sorted.length,
                firstDate: first.timestamp,
                lastDate: last.timestamp,
            })
        })

        return improvements.sort((a, b) => b.diff - a.diff).slice(0, limit)
    }, [allHistory, players, limit])

    if (loading) return <div style={{ padding: 12, color: "rgba(255,255,255,0.3)", fontSize: 12, textAlign: "center" }}>Loading...</div>

    if (leaderboard.length === 0) {
        return (
            <div style={{ padding: "20px 0", textAlign: "center" }}>
                <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 12, margin: 0 }}>No improvement data yet</p>
                <p style={{ color: "rgba(255,255,255,0.15)", fontSize: 10, margin: "4px 0 0" }}>Ratings need at least 2 assessment snapshots to track progress</p>
            </div>
        )
    }

    const medals = ["🥇", "🥈", "🥉"]

    return (
        <div>
            {showTitle && (
                <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.3)", letterSpacing: 2, marginBottom: 10 }}>BIGGEST IMPROVERS</div>
            )}

            {leaderboard.map((entry, i) => {
                const isPositive = entry.diff > 0
                const diffColor = entry.diff > 5 ? "#2ecc40" : entry.diff > 0 ? "#7bc74d" : entry.diff === 0 ? "rgba(255,255,255,0.3)" : "#e74c3c"

                return (
                    <div key={entry.player.id} style={{
                        display: "flex", alignItems: "center", gap: 12, padding: "10px 0",
                        borderBottom: i < leaderboard.length - 1 ? "1px solid rgba(255,255,255,0.03)" : "none"
                    }}>
                        {/* Rank */}
                        <div style={{
                            width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                            background: i < 3 ? "rgba(255,170,0,0.08)" : "rgba(255,255,255,0.03)",
                            border: i < 3 ? "1px solid rgba(255,170,0,0.15)" : "1px solid rgba(255,255,255,0.06)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: i < 3 ? 16 : 12, fontWeight: 800,
                            color: i < 3 ? undefined : "rgba(255,255,255,0.2)"
                        }}>
                            {i < 3 ? medals[i] : i + 1}
                        </div>

                        {/* Player Info */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ color: "#fff", fontSize: 13, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {entry.player.name}
                            </div>
                            <div style={{ display: "flex", gap: 6, marginTop: 2, alignItems: "center" }}>
                                <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 9 }}>
                                    {entry.firstOvr} → {entry.currentOvr}
                                </span>
                                <span style={{ color: "rgba(255,255,255,0.12)", fontSize: 9 }}>
                                    {entry.entries} assessments
                                </span>
                            </div>
                        </div>

                        {/* Current Rating */}
                        <div style={{
                            width: 34, height: 34, borderRadius: 8,
                            background: `${getRatingColor(entry.currentOvr)}15`,
                            border: `1px solid ${getRatingColor(entry.currentOvr)}33`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 14, fontWeight: 800, color: getRatingColor(entry.currentOvr)
                        }}>
                            {entry.currentOvr}
                        </div>

                        {/* Improvement */}
                        <div style={{
                            minWidth: 50, textAlign: "right",
                            fontSize: 16, fontWeight: 800, color: diffColor,
                            fontFamily: "system-ui"
                        }}>
                            {isPositive ? "+" : ""}{entry.diff}
                        </div>
                    </div>
                )
            })}
        </div>
    )
}