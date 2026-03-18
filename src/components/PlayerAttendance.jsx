import { useState, useEffect, useMemo } from 'react'
import { subscribeSessions, subscribeAttendance } from '../firebase'

export default function PlayerAttendance({ playerId }) {
    const [sessions, setSessions] = useState([])
    const [attendance, setAttendance] = useState({})
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let c = 0
        const check = () => { c++; if (c >= 2) setLoading(false) }
        const u1 = subscribeSessions(d => { setSessions(d); check() })
        const u2 = subscribeAttendance(d => { setAttendance(d); check() })
        return () => { u1(); u2() }
    }, [])

    const stats = useMemo(() => {
        let total = 0, present = 0, late = 0, absent = 0
        const recent = []

        const sorted = [...sessions].sort((a, b) => b.date.localeCompare(a.date))

        sorted.forEach(s => {
            const a = attendance[s.id]?.players || {}
            if (a[playerId] !== undefined) {
                total++
                const status = a[playerId]
                if (status === "present") present++
                else if (status === "late") late++
                else absent++
                if (recent.length < 10) recent.push({ session: s, status })
            }
        })

        const rate = total > 0 ? ((present + late) / total * 100) : 0
        return { total, present, late, absent, rate, recent }
    }, [sessions, attendance, playerId])

    if (loading) return <div style={{ padding: 10, color: "rgba(255,255,255,0.3)", fontSize: 12 }}>Loading...</div>

    if (stats.total === 0) {
        return (
            <div style={{ padding: "16px 0", textAlign: "center" }}>
                <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 12, margin: 0 }}>No attendance records yet</p>
            </div>
        )
    }

    const rateColor = stats.rate >= 90 ? "#2ecc40" : stats.rate >= 75 ? "#7bc74d" : stats.rate >= 60 ? "#e8b930" : "#e74c3c"

    return (
        <div>
            {/* Stats Row */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
                <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 8, padding: "8px 14px", textAlign: "center" }}>
                    <div style={{ fontSize: 20, fontWeight: 800, color: rateColor }}>{Math.round(stats.rate)}%</div>
                    <div style={{ fontSize: 8, fontWeight: 700, color: "rgba(255,255,255,0.25)", letterSpacing: 1, marginTop: 2 }}>RATE</div>
                </div>
                <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 8, padding: "8px 14px", textAlign: "center" }}>
                    <div style={{ fontSize: 18, fontWeight: 800, color: "#2ecc40" }}>{stats.present}</div>
                    <div style={{ fontSize: 8, fontWeight: 700, color: "rgba(255,255,255,0.25)", letterSpacing: 1, marginTop: 2 }}>PRESENT</div>
                </div>
                {stats.late > 0 && (
                    <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 8, padding: "8px 14px", textAlign: "center" }}>
                        <div style={{ fontSize: 18, fontWeight: 800, color: "#e8b930" }}>{stats.late}</div>
                        <div style={{ fontSize: 8, fontWeight: 700, color: "rgba(255,255,255,0.25)", letterSpacing: 1, marginTop: 2 }}>LATE</div>
                    </div>
                )}
                <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 8, padding: "8px 14px", textAlign: "center" }}>
                    <div style={{ fontSize: 18, fontWeight: 800, color: "#e74c3c" }}>{stats.absent}</div>
                    <div style={{ fontSize: 8, fontWeight: 700, color: "rgba(255,255,255,0.25)", letterSpacing: 1, marginTop: 2 }}>ABSENT</div>
                </div>
                <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 8, padding: "8px 14px", textAlign: "center" }}>
                    <div style={{ fontSize: 18, fontWeight: 800, color: "rgba(255,255,255,0.6)" }}>{stats.total}</div>
                    <div style={{ fontSize: 8, fontWeight: 700, color: "rgba(255,255,255,0.25)", letterSpacing: 1, marginTop: 2 }}>SESSIONS</div>
                </div>
            </div>

            {/* Attendance Bar */}
            <div style={{ height: 8, borderRadius: 4, background: "rgba(255,255,255,0.04)", overflow: "hidden", display: "flex", marginBottom: 12 }}>
                {stats.present > 0 && <div style={{ width: `${(stats.present / stats.total) * 100}%`, background: "#2ecc40", height: "100%" }} />}
                {stats.late > 0 && <div style={{ width: `${(stats.late / stats.total) * 100}%`, background: "#e8b930", height: "100%" }} />}
                {stats.absent > 0 && <div style={{ width: `${(stats.absent / stats.total) * 100}%`, background: "#e74c3c", height: "100%" }} />}
            </div>

            {/* Recent Sessions */}
            <div style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.2)", letterSpacing: 1, marginBottom: 6 }}>RECENT</div>
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                {stats.recent.map((r, i) => {
                    const color = r.status === "present" ? "#2ecc40" : r.status === "late" ? "#e8b930" : "#e74c3c"
                    const label = r.status === "present" ? "✓" : r.status === "late" ? "L" : "✕"
                    return (
                        <div key={i} title={`${r.session.sessionType} — ${new Date(r.session.date + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}: ${r.status}`}
                            style={{
                                width: 26, height: 26, borderRadius: 6,
                                background: `${color}18`, border: `1px solid ${color}44`,
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontSize: 10, fontWeight: 800, color, cursor: "default"
                            }}>{label}</div>
                    )
                })}
            </div>
        </div>
    )
}