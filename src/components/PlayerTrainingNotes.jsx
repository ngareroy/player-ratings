import { useState, useEffect, useMemo } from 'react'
import { subscribeSessions, subscribeAllTrainingNotes } from '../firebase'

export default function PlayerTrainingNotes({ playerId }) {
    const [sessions, setSessions] = useState([])
    const [allNotes, setAllNotes] = useState({})
    const [loading, setLoading] = useState(true)
    const [showAll, setShowAll] = useState(false)

    useEffect(() => {
        let c = 0
        const check = () => { c++; if (c >= 2) setLoading(false) }
        const u1 = subscribeSessions(d => { setSessions(d); check() })
        const u2 = subscribeAllTrainingNotes(d => { setAllNotes(d); check() })
        return () => { u1(); u2() }
    }, [])

    const playerNotes = useMemo(() => {
        const result = []
        const sorted = [...sessions].sort((a, b) => b.date.localeCompare(a.date))
        sorted.forEach(s => {
            const sessionNotes = allNotes[s.id]?.notes || {}
            if (sessionNotes[playerId]) {
                result.push({
                    session: s,
                    note: sessionNotes[playerId],
                    drills: s.drills || [],
                    focusAreas: s.focusAreas || [],
                })
            }
        })
        return result
    }, [sessions, allNotes, playerId])

    if (loading) return <div style={{ padding: 10, color: "rgba(255,255,255,0.3)", fontSize: 12 }}>Loading...</div>

    if (playerNotes.length === 0) {
        return (
            <div style={{ padding: "16px 0", textAlign: "center" }}>
                <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 12, margin: 0 }}>No training notes yet</p>
                <p style={{ color: "rgba(255,255,255,0.15)", fontSize: 10, margin: "4px 0 0" }}>Coaches can add notes during training sessions</p>
            </div>
        )
    }

    const display = showAll ? playerNotes : playerNotes.slice(0, 5)

    return (
        <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 6, padding: "5px 10px", display: "flex", alignItems: "center", gap: 5 }}>
                    <span style={{ color: "#fff", fontSize: 14, fontWeight: 800 }}>{playerNotes.length}</span>
                    <span style={{ color: "rgba(255,255,255,0.25)", fontSize: 8, fontWeight: 700, letterSpacing: 0.5 }}>SESSIONS WITH NOTES</span>
                </div>
            </div>

            {display.map((entry, i) => (
                <div key={i} style={{ padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                        <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, fontWeight: 700 }}>{entry.session.sessionType}</span>
                        <span style={{ color: "rgba(255,255,255,0.15)", fontSize: 10 }}>
                            {new Date(entry.session.date + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                    </div>

                    {entry.focusAreas.length > 0 && (
                        <div style={{ display: "flex", gap: 4, marginBottom: 4, flexWrap: "wrap" }}>
                            {entry.focusAreas.map(a => (
                                <span key={a} style={{ fontSize: 8, fontWeight: 700, padding: "1px 6px", borderRadius: 3, background: "rgba(46,204,64,0.08)", color: "rgba(46,204,64,0.5)" }}>{a}</span>
                            ))}
                        </div>
                    )}

                    <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, margin: 0, lineHeight: 1.6, fontStyle: "italic" }}>
                        "{entry.note}"
                    </p>

                    {entry.session.createdBy && (
                        <span style={{ color: "rgba(255,255,255,0.12)", fontSize: 9, marginTop: 4, display: "block" }}>— {entry.session.createdBy}</span>
                    )}
                </div>
            ))}

            {playerNotes.length > 5 && (
                <button onClick={() => setShowAll(!showAll)}
                    style={{ width: "100%", marginTop: 6, padding: "6px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 6, color: "rgba(255,255,255,0.3)", fontSize: 10, fontWeight: 600, cursor: "pointer" }}>
                    {showAll ? "Show less" : `Show all ${playerNotes.length} notes`}
                </button>
            )}
        </div>
    )
}