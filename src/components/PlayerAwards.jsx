import { useState, useEffect, useMemo } from 'react'
import { subscribeAwards, subscribePlayerMatchStats, subscribeMatches, subscribeSessions, subscribeAttendance } from '../firebase'

const AUTO_BADGES = [
    { id: "goals_5", label: "5 Goals", emoji: "⚽", desc: "Scored 5 goals", check: (s) => s.goals >= 5 },
    { id: "goals_10", label: "10 Goals", emoji: "🔥", desc: "Scored 10 goals", check: (s) => s.goals >= 10 },
    { id: "goals_25", label: "25 Goals", emoji: "👑", desc: "Scored 25 goals", check: (s) => s.goals >= 25 },
    { id: "assists_5", label: "5 Assists", emoji: "🎯", desc: "Made 5 assists", check: (s) => s.assists >= 5 },
    { id: "assists_10", label: "10 Assists", emoji: "🎯", desc: "Made 10 assists", check: (s) => s.assists >= 10 },
    { id: "apps_10", label: "10 Apps", emoji: "🏟️", desc: "10 match appearances", check: (s) => s.apps >= 10 },
    { id: "apps_25", label: "25 Apps", emoji: "⭐", desc: "25 match appearances", check: (s) => s.apps >= 25 },
    { id: "motm_3", label: "3x MOTM", emoji: "🏆", desc: "Man of the Match 3 times", check: (s) => s.motm >= 3 },
    { id: "motm_5", label: "5x MOTM", emoji: "🏆", desc: "Man of the Match 5 times", check: (s) => s.motm >= 5 },
    { id: "clean_5", label: "5 Clean Sheets", emoji: "🧤", desc: "Kept 5 clean sheets", check: (s) => s.cleanSheets >= 5 },
    { id: "att_90", label: "90% Attendance", emoji: "💪", desc: "90%+ attendance rate", check: (s) => s.attendanceRate >= 90 && s.attendanceTotal >= 5 },
    { id: "att_100", label: "Perfect Attendance", emoji: "🌟", desc: "100% attendance rate", check: (s) => s.attendanceRate >= 100 && s.attendanceTotal >= 5 },
]

export function usePlayerAwardsData(playerId) {
    const [awards, setAwards] = useState([])
    const [matchStats, setMatchStats] = useState([])
    const [matches, setMatches] = useState([])
    const [sessions, setSessions] = useState([])
    const [attendance, setAttendance] = useState({})
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!playerId) return
        let c = 0
        const check = () => { c++; if (c >= 5) setLoading(false) }
        const u1 = subscribeAwards(d => { setAwards(d); check() })
        const u2 = subscribePlayerMatchStats(playerId, d => { setMatchStats(d); check() })
        const u3 = subscribeMatches(d => { setMatches(d); check() })
        const u4 = subscribeSessions(d => { setSessions(d); check() })
        const u5 = subscribeAttendance(d => { setAttendance(d); check() })
        return () => { u1(); u2(); u3(); u4(); u5() }
    }, [playerId])

    const computed = useMemo(() => {
        const matchMap = {}
        matches.forEach(m => matchMap[m.id] = m)

        const goals = matchStats.reduce((s, m) => s + (m.goals || 0), 0)
        const assists = matchStats.reduce((s, m) => s + (m.assists || 0), 0)
        const apps = matchStats.length
        const motm = matchStats.filter(s => matchMap[s.matchId]?.motm === playerId).length
        const cleanSheets = matchStats.filter(s => s.cleanSheet).length

        let attTotal = 0, attPresent = 0
        sessions.forEach(s => {
            const a = attendance[s.id]?.players || {}
            if (a[playerId] !== undefined) {
                attTotal++
                if (a[playerId] === "present" || a[playerId] === "late") attPresent++
            }
        })
        const attendanceRate = attTotal > 0 ? (attPresent / attTotal * 100) : 0

        const stats = { goals, assists, apps, motm, cleanSheets, attendanceRate, attendanceTotal: attTotal }

        // Auto badges
        const autoBadges = AUTO_BADGES.filter(b => b.check(stats)).map(b => ({
            ...b, type: "auto"
        }))

        // Manual awards for this player
        const manualAwards = awards.filter(a => a.playerId === playerId).map(a => ({
            ...a, type: "manual"
        }))

        return { autoBadges, manualAwards, stats }
    }, [matchStats, matches, sessions, attendance, awards, playerId])

    return { ...computed, loading }
}

export default function PlayerAwards({ playerId }) {
    const { autoBadges, manualAwards, loading } = usePlayerAwardsData(playerId)

    if (loading) return <div style={{ padding: 10, color: "rgba(255,255,255,0.3)", fontSize: 12 }}>Loading...</div>

    const allBadges = [...manualAwards, ...autoBadges]

    if (allBadges.length === 0) {
        return (
            <div style={{ padding: "16px 0", textAlign: "center" }}>
                <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 12, margin: 0 }}>No awards yet</p>
                <p style={{ color: "rgba(255,255,255,0.15)", fontSize: 10, margin: "4px 0 0" }}>Badges are earned through match stats, attendance, and coach awards</p>
            </div>
        )
    }

    return (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {allBadges.map((badge, i) => (
                <div key={badge.id + i} title={badge.desc || badge.reason || badge.label}
                    style={{
                        background: badge.type === "manual" ? "rgba(255,170,0,0.08)" : "rgba(46,204,64,0.06)",
                        border: badge.type === "manual" ? "1px solid rgba(255,170,0,0.15)" : "1px solid rgba(46,204,64,0.12)",
                        borderRadius: 10, padding: "8px 12px",
                        display: "flex", alignItems: "center", gap: 8, cursor: "default"
                    }}>
                    <span style={{ fontSize: 20 }}>{badge.emoji || "🏅"}</span>
                    <div>
                        <div style={{ color: "#fff", fontSize: 11, fontWeight: 700 }}>{badge.label}</div>
                        <div style={{ color: "rgba(255,255,255,0.25)", fontSize: 8, marginTop: 1 }}>
                            {badge.type === "manual" ? `Awarded${badge.awardedBy ? ` by ${badge.awardedBy}` : ""}` : badge.desc}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}