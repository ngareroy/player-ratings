import { useState, useEffect, useMemo, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { subscribeSessions, saveSession, subscribePlayers, subscribeTeams, subscribeSessionAttendance, saveAttendance, subscribeTrainingNotes, saveTrainingNotes } from '../firebase'
import { useAuth } from '../contexts/AuthContext'

const FOCUS_AREAS = ["Passing", "Shooting", "Defending", "Dribbling", "Fitness", "Tactics", "Set Pieces", "Goalkeeping", "Positioning", "Ball Control", "Game Play", "Other"]

export default function TrainingDetail() {
    const { sessionId } = useParams()
    const navigate = useNavigate()
    const { adminData } = useAuth()
    const [session, setSession] = useState(null)
    const [players, setPlayers] = useState([])
    const [teams, setTeams] = useState([])
    const [attendance, setAttendance] = useState({})
    const [notes, setNotes] = useState({})
    const [drills, setDrills] = useState([])
    const [focusAreas, setFocusAreas] = useState([])
    const [sessionNotes, setSessionNotes] = useState("")
    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)

    useEffect(() => {
        const u1 = subscribeSessions(list => {
            const s = list.find(x => x.id === sessionId)
            if (s) {
                setSession(s)
                setDrills(s.drills || [])
                setFocusAreas(s.focusAreas || [])
                setSessionNotes(s.notes || "")
            }
        })
        const u2 = subscribePlayers(setPlayers)
        const u3 = subscribeTeams(setTeams)
        const u4 = subscribeSessionAttendance(sessionId, setAttendance)
        const u5 = subscribeTrainingNotes(sessionId, setNotes)
        return () => { u1(); u2(); u3(); u4(); u5() }
    }, [sessionId])

    const teamMap = useMemo(() => { const m = {}; teams.forEach(t => m[t.id] = t); return m }, [teams])

    const sessionPlayers = useMemo(() => {
        if (!session) return []
        return players
            .filter(p => {
                if (session.teamId === "all") return true
                const ids = p.teamIds || (p.teamId ? [p.teamId] : [])
                return ids.includes(session.teamId)
            })
            .sort((a, b) => {
                const aStatus = attendance[a.id] || "absent"
                const bStatus = attendance[b.id] || "absent"
                const order = { present: 0, late: 1, absent: 2 }
                return (order[aStatus] || 2) - (order[bStatus] || 2) || a.name.localeCompare(b.name)
            })
    }, [session, players, attendance])

    const presentPlayers = sessionPlayers.filter(p => attendance[p.id] === "present" || attendance[p.id] === "late")

    const updateNote = (pid, val) => {
        setNotes(prev => ({ ...prev, [pid]: val }))
    }

    const addDrill = () => {
        setDrills(prev => [...prev, { id: Date.now().toString(), name: "", duration: 15, description: "" }])
    }

    const updateDrill = (id, key, val) => {
        setDrills(prev => prev.map(d => d.id === id ? { ...d, [key]: val } : d))
    }

    const removeDrill = (id) => {
        setDrills(prev => prev.filter(d => d.id !== id))
    }

    const toggleFocus = (area) => {
        setFocusAreas(prev => prev.includes(area) ? prev.filter(a => a !== area) : [...prev, area])
    }

    const handleSaveAll = useCallback(async () => {
        if (!session) return
        setSaving(true)
        try {
            await Promise.all([
                saveSession({ ...session, drills, focusAreas, notes: sessionNotes }),
                saveTrainingNotes(sessionId, notes),
            ])
            setSaved(true)
            setTimeout(() => setSaved(false), 2500)
        } catch (err) { console.error(err) }
        setSaving(false)
    }, [session, drills, focusAreas, sessionNotes, notes, sessionId])

    if (!session) {
        return (
            <div style={{ minHeight: "100vh", background: "#0a0a1a", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <p style={{ color: "rgba(255,255,255,0.4)", fontFamily: "system-ui" }}>Loading session...</p>
            </div>
        )
    }

    const team = teamMap[session.teamId]

    return (
        <div style={{ minHeight: "100vh", background: "#0a0a1a", padding: "20px 12px", fontFamily: "system-ui" }}>
            <div style={{ maxWidth: 900, margin: "0 auto" }}>

                {/* Header */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <button onClick={() => navigate('/admin/attendance')} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "7px 14px", color: "rgba(255,255,255,0.5)", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>← Back</button>
                        <h1 style={{ color: "#fff", fontSize: 20, fontWeight: 800, margin: 0 }}>TRAINING LOG</h1>
                    </div>
                    <button onClick={handleSaveAll} disabled={saving}
                        style={{ background: saved ? "rgba(46,204,64,0.2)" : "linear-gradient(135deg,#1a6b1a,#2ecc40)", border: saved ? "1px solid #2ecc40" : "none", borderRadius: 8, padding: "8px 20px", color: "#fff", fontSize: 12, fontWeight: 700, cursor: saving ? "wait" : "pointer" }}>
                        {saved ? "✓ Saved!" : saving ? "Saving..." : "Save All"}
                    </button>
                </div>

                {/* Session Info */}
                <div style={{ background: "linear-gradient(145deg,#1a1a2e,#16213e)", borderRadius: 14, border: "1px solid rgba(255,255,255,0.08)", padding: "18px 22px", marginBottom: 16 }}>
                    <div style={{ color: "#fff", fontSize: 18, fontWeight: 800 }}>{session.sessionType}{session.name ? ` — ${session.name}` : ""}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6, flexWrap: "wrap" }}>
                        <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 12 }}>
                            {new Date(session.date + 'T00:00:00').toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                        </span>
                        {team && <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 4, background: "rgba(52,152,219,0.1)", color: "#3498db" }}>{team.name}</span>}
                        <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 4, background: "rgba(46,204,64,0.1)", color: "#2ecc40" }}>{presentPlayers.length} present</span>
                    </div>
                </div>

                <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>

                    {/* Left: Drills & Focus */}
                    <div style={{ flex: "1 1 380px" }}>

                        {/* Focus Areas */}
                        <div style={{ background: "linear-gradient(145deg,#1a1a2e,#16213e)", borderRadius: 14, border: "1px solid rgba(255,255,255,0.08)", padding: "16px 20px", marginBottom: 16 }}>
                            <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.3)", letterSpacing: 1.5, marginBottom: 10 }}>FOCUS AREAS</div>
                            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                                {FOCUS_AREAS.map(area => {
                                    const sel = focusAreas.includes(area)
                                    return (
                                        <button key={area} onClick={() => toggleFocus(area)} style={{
                                            background: sel ? "rgba(46,204,64,0.15)" : "rgba(255,255,255,0.04)",
                                            border: sel ? "1px solid #2ecc40" : "1px solid rgba(255,255,255,0.08)",
                                            borderRadius: 6, padding: "5px 10px", color: sel ? "#2ecc40" : "rgba(255,255,255,0.3)",
                                            fontSize: 10, fontWeight: 700, cursor: "pointer"
                                        }}>{area}</button>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Drills */}
                        <div style={{ background: "linear-gradient(145deg,#1a1a2e,#16213e)", borderRadius: 14, border: "1px solid rgba(255,255,255,0.08)", overflow: "hidden", marginBottom: 16 }}>
                            <div style={{ padding: "14px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.3)", letterSpacing: 1.5 }}>DRILLS & ACTIVITIES</div>
                                <button onClick={addDrill} style={{ background: "rgba(46,204,64,0.1)", border: "1px solid rgba(46,204,64,0.2)", borderRadius: 6, padding: "4px 12px", color: "#2ecc40", fontSize: 10, fontWeight: 700, cursor: "pointer" }}>+ Add Drill</button>
                            </div>

                            {drills.length === 0 && (
                                <div style={{ padding: "24px 20px", textAlign: "center" }}>
                                    <p style={{ color: "rgba(255,255,255,0.2)", fontSize: 12 }}>No drills logged yet — click "Add Drill" to start</p>
                                </div>
                            )}

                            {drills.map((drill, i) => (
                                <div key={drill.id} style={{ padding: "12px 20px", borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                                        <span style={{ color: "rgba(255,255,255,0.15)", fontSize: 10, fontWeight: 700, width: 18 }}>{i + 1}.</span>
                                        <input value={drill.name} onChange={e => updateDrill(drill.id, 'name', e.target.value)} placeholder="Drill name..."
                                            style={{ flex: 1, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "8px 12px", color: "#fff", fontSize: 13, fontWeight: 700, outline: "none" }} />
                                        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                            <input type="number" min={1} max={120} value={drill.duration} onChange={e => updateDrill(drill.id, 'duration', parseInt(e.target.value) || 15)}
                                                style={{ width: 40, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, padding: "6px 4px", color: "#fff", fontSize: 12, fontWeight: 700, textAlign: "center", outline: "none" }} />
                                            <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 9 }}>min</span>
                                        </div>
                                        <button onClick={() => removeDrill(drill.id)} style={{ background: "rgba(231,76,60,0.06)", border: "1px solid rgba(231,76,60,0.1)", borderRadius: 6, width: 24, height: 24, color: "rgba(231,76,60,0.5)", fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
                                    </div>
                                    <textarea value={drill.description} onChange={e => updateDrill(drill.id, 'description', e.target.value)} placeholder="Description, setup, key coaching points..."
                                        rows={2} style={{ width: "100%", marginLeft: 26, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 8, padding: "8px 12px", color: "rgba(255,255,255,0.6)", fontSize: 12, outline: "none", boxSizing: "border-box", resize: "vertical", fontFamily: "system-ui" }} />
                                </div>
                            ))}

                            {drills.length > 0 && (
                                <div style={{ padding: "10px 20px", borderTop: "1px solid rgba(255,255,255,0.04)", display: "flex", justifyContent: "space-between" }}>
                                    <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 10 }}>{drills.length} drill{drills.length !== 1 ? 's' : ''}</span>
                                    <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 10 }}>Total: {drills.reduce((s, d) => s + (d.duration || 0), 0)} min</span>
                                </div>
                            )}
                        </div>

                        {/* Session Notes */}
                        <div style={{ background: "linear-gradient(145deg,#1a1a2e,#16213e)", borderRadius: 14, border: "1px solid rgba(255,255,255,0.08)", padding: "16px 20px" }}>
                            <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.3)", letterSpacing: 1.5, marginBottom: 8 }}>SESSION NOTES</div>
                            <textarea value={sessionNotes} onChange={e => setSessionNotes(e.target.value)} placeholder="General observations, team performance..."
                                rows={4} style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "12px 14px", color: "rgba(255,255,255,0.6)", fontSize: 13, outline: "none", boxSizing: "border-box", resize: "vertical", fontFamily: "system-ui", lineHeight: 1.6 }} />
                        </div>
                    </div>

                    {/* Right: Player Notes */}
                    <div style={{ flex: "1 1 340px" }}>
                        <div style={{ background: "linear-gradient(145deg,#1a1a2e,#16213e)", borderRadius: 14, border: "1px solid rgba(255,255,255,0.08)", overflow: "hidden" }}>
                            <div style={{ padding: "14px 18px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                                <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.3)", letterSpacing: 1.5 }}>PLAYER NOTES</div>
                                <div style={{ color: "rgba(255,255,255,0.15)", fontSize: 10, marginTop: 2 }}>Individual observations for each player</div>
                            </div>

                            {presentPlayers.length === 0 && (
                                <div style={{ padding: "30px 18px", textAlign: "center" }}>
                                    <p style={{ color: "rgba(255,255,255,0.2)", fontSize: 12 }}>Mark attendance first to see players here</p>
                                </div>
                            )}

                            {presentPlayers.map(player => {
                                const note = notes[player.id] || ""
                                const status = attendance[player.id]
                                return (
                                    <div key={player.id} style={{ padding: "10px 18px", borderBottom: "1px solid rgba(255,255,255,0.02)" }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                                            <div style={{
                                                width: 8, height: 8, borderRadius: "50%",
                                                background: status === "present" ? "#2ecc40" : "#e8b930"
                                            }} />
                                            <span style={{ color: "#fff", fontSize: 12, fontWeight: 700, flex: 1 }}>{player.name}</span>
                                            <div style={{ display: "flex", gap: 3 }}>
                                                {(player.positions || []).slice(0, 2).map(p => (
                                                    <span key={p} style={{ fontSize: 8, fontWeight: 700, color: p === "GK" ? "#ffaa00" : "rgba(255,255,255,0.2)" }}>{p}</span>
                                                ))}
                                            </div>
                                        </div>
                                        <textarea value={note} onChange={e => updateNote(player.id, e.target.value)}
                                            placeholder="Performance notes, areas to work on..."
                                            rows={2} style={{ width: "100%", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 8, padding: "8px 10px", color: "rgba(255,255,255,0.5)", fontSize: 11, outline: "none", boxSizing: "border-box", resize: "vertical", fontFamily: "system-ui", lineHeight: 1.5 }} />
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}