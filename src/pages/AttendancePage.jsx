import { useState, useEffect, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { subscribeSessions, saveSession, removeSession, subscribePlayers, subscribeTeams, subscribeAttendance, saveAttendance, subscribeClubSettings } from '../firebase'

const SESSION_TYPES = ["Tuesday Club", "Friday Club", "Saturday Training", "Extra Session", "Match Day"]
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

function SessionModal({ session, teams, onSave, onClose, coachName }) {
    const [name, setName] = useState(session?.name || "")
    const [date, setDate] = useState(session?.date || new Date().toISOString().slice(0, 10))
    const [sessionType, setSessionType] = useState(session?.sessionType || "Tuesday Club")
    const [teamId, setTeamId] = useState(session?.teamId || "all")
    const [notes, setNotes] = useState(session?.notes || "")
    const isNew = !session

    return (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999, padding: 16 }} onClick={onClose}>
            <div onClick={e => e.stopPropagation()} style={{ background: "linear-gradient(145deg,#1a1a2e,#16213e)", borderRadius: 16, width: "100%", maxWidth: 440, boxShadow: "0 16px 64px rgba(0,0,0,0.6)", border: "1px solid rgba(255,255,255,0.1)", padding: 24 }}>
                <h2 style={{ color: "#fff", fontSize: 18, fontWeight: 700, margin: "0 0 18px" }}>{isNew ? "New Session" : "Edit Session"}</h2>

                <div style={{ marginBottom: 14 }}>
                    <label style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, fontWeight: 600, display: "block", marginBottom: 6 }}>SESSION NAME (optional)</label>
                    <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Shooting Drills, Defensive Shape"
                        style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, padding: "11px 14px", color: "#fff", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
                </div>

                <div style={{ display: "flex", gap: 12, marginBottom: 14 }}>
                    <div style={{ flex: 1 }}>
                        <label style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, fontWeight: 600, display: "block", marginBottom: 6 }}>DATE</label>
                        <input type="date" value={date} onChange={e => setDate(e.target.value)}
                            style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, padding: "10px 14px", color: "#fff", fontSize: 13, outline: "none", boxSizing: "border-box", colorScheme: "dark" }} />
                    </div>
                    <div style={{ flex: 1 }}>
                        <label style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, fontWeight: 600, display: "block", marginBottom: 6 }}>TEAM</label>
                        <select value={teamId} onChange={e => setTeamId(e.target.value)}
                            style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, padding: "10px 14px", color: "#fff", fontSize: 13, outline: "none", cursor: "pointer", boxSizing: "border-box" }}>
                            <option value="all" style={{ background: "#1a1a2e" }}>All Teams</option>
                            {teams.map(t => <option key={t.id} value={t.id} style={{ background: "#1a1a2e" }}>{t.name}</option>)}
                        </select>
                    </div>
                </div>

                <div style={{ marginBottom: 14 }}>
                    <label style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, fontWeight: 600, display: "block", marginBottom: 8 }}>TYPE</label>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        {SESSION_TYPES.map(st => (
                            <button key={st} onClick={() => setSessionType(st)} style={{
                                background: sessionType === st ? "rgba(46,204,64,0.15)" : "rgba(255,255,255,0.04)",
                                border: sessionType === st ? "1px solid #2ecc40" : "1px solid rgba(255,255,255,0.1)",
                                borderRadius: 6, padding: "6px 10px", color: sessionType === st ? "#2ecc40" : "rgba(255,255,255,0.35)",
                                fontSize: 10, fontWeight: 700, cursor: "pointer"
                            }}>{st}</button>
                        ))}
                    </div>
                </div>

                <div style={{ marginBottom: 18 }}>
                    <label style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, fontWeight: 600, display: "block", marginBottom: 6 }}>SESSION NOTES (optional)</label>
                    <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="What was covered, observations..."
                        rows={3} style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, padding: "11px 14px", color: "#fff", fontSize: 13, outline: "none", boxSizing: "border-box", resize: "vertical", fontFamily: "system-ui" }} />
                </div>

                <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={onClose} style={{ flex: 1, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "10px", color: "rgba(255,255,255,0.5)", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Cancel</button>
                    <button onClick={() => {
                        onSave({
                            id: session?.id || Date.now().toString(),
                            name: name.trim(), date, sessionType, teamId, notes: notes.trim(),
                            createdBy: session?.createdBy || coachName,
                            createdAt: session?.createdAt || new Date().toISOString(),
                        })
                    }} style={{ flex: 1, background: "linear-gradient(135deg,#1a6b1a,#2ecc40)", border: "none", borderRadius: 10, padding: "10px", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                        {isNew ? "Create" : "Save"}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default function AttendancePage() {
    const { adminData, isHeadCoach } = useAuth()
    const navigate = useNavigate()
    const [sessions, setSessions] = useState([])
    const [players, setPlayers] = useState([])
    const [teams, setTeams] = useState([])
    const [attendance, setAttendance] = useState({})
    const [club, setClub] = useState({ clubName: "Hub FC" })
    const [modal, setModal] = useState(null)
    const [activeSession, setActiveSession] = useState(null)
    const [localAttendance, setLocalAttendance] = useState({})
    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)
    const [filterTeam, setFilterTeam] = useState("all")
    const [confirmDelete, setConfirmDelete] = useState(null)

    useEffect(() => {
        const u1 = subscribeSessions(setSessions)
        const u2 = subscribePlayers(setPlayers)
        const u3 = subscribeTeams(setTeams)
        const u4 = subscribeAttendance(setAttendance)
        const u5 = subscribeClubSettings(setClub)
        return () => { u1(); u2(); u3(); u4(); u5() }
    }, [])

    const sorted = useMemo(() =>
        [...sessions].sort((a, b) => b.date.localeCompare(a.date))
        , [sessions])

    const teamMap = useMemo(() => { const m = {}; teams.forEach(t => m[t.id] = t); return m }, [teams])

    // When opening a session, load its attendance
    useEffect(() => {
        if (activeSession) {
            setLocalAttendance(attendance[activeSession.id]?.players || {})
        }
    }, [activeSession, attendance])

    const sessionPlayers = useMemo(() => {
        if (!activeSession) return []
        return players
            .filter(p => {
                if (activeSession.teamId === "all") return true
                const ids = p.teamIds || (p.teamId ? [p.teamId] : [])
                return ids.includes(activeSession.teamId)
            })
            .sort((a, b) => a.name.localeCompare(b.name))
    }, [activeSession, players])

    const toggleAttendance = (pid) => {
        setLocalAttendance(prev => {
            const current = prev[pid] || "absent"
            const next = current === "present" ? "late" : current === "late" ? "absent" : "present"
            return { ...prev, [pid]: next }
        })
    }

    const handleSaveAttendance = useCallback(async () => {
        if (!activeSession) return
        setSaving(true)
        await saveAttendance(activeSession.id, localAttendance)
        setSaved(true)
        setTimeout(() => setSaved(false), 2500)
        setSaving(false)
    }, [activeSession, localAttendance])

    const handleSaveSession = async (s) => { await saveSession(s); setModal(null) }
    const handleDeleteSession = async (id) => { await removeSession(id); setConfirmDelete(null); if (activeSession?.id === id) setActiveSession(null) }

    const getAttendanceStats = (sessionId) => {
        const a = attendance[sessionId]?.players || {}
        const present = Object.values(a).filter(v => v === "present").length
        const late = Object.values(a).filter(v => v === "late").length
        const total = Object.keys(a).length
        return { present, late, absent: total - present - late, total }
    }

    const presentCount = Object.values(localAttendance).filter(v => v === "present").length
    const lateCount = Object.values(localAttendance).filter(v => v === "late").length

    return (
        <div style={{ minHeight: "100vh", background: "#0a0a1a", padding: "20px 12px", fontFamily: "system-ui" }}>
            <div style={{ maxWidth: 1000, margin: "0 auto" }}>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <button onClick={() => navigate('/admin')} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "7px 14px", color: "rgba(255,255,255,0.5)", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>← Back</button>
                        <h1 style={{ color: "#fff", fontSize: 22, fontWeight: 800, margin: 0, letterSpacing: 1 }}>{club.clubName} ATTENDANCE</h1>
                    </div>
                    <button onClick={() => setModal("new")} style={{ background: "linear-gradient(135deg,#1a6b1a,#2ecc40)", border: "none", borderRadius: 8, padding: "8px 18px", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>+ New Session</button>
                </div>

                <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>

                    {/* Session List */}
                    <div style={{ flex: "1 1 300px", minWidth: 280 }}>
                        <div style={{ background: "linear-gradient(145deg,#1a1a2e,#16213e)", borderRadius: 16, border: "1px solid rgba(255,255,255,0.08)", overflow: "hidden" }}>
                            <div style={{ padding: "14px 18px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                                <h2 style={{ color: "#fff", fontSize: 14, fontWeight: 700, margin: 0 }}>Sessions ({sessions.length})</h2>
                            </div>

                            {sorted.length === 0 && (
                                <div style={{ padding: "30px 18px", textAlign: "center" }}>
                                    <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 12 }}>No sessions yet</p>
                                </div>
                            )}

                            {sorted.map(s => {
                                const stats = getAttendanceStats(s.id)
                                const isActive = activeSession?.id === s.id
                                const dayName = DAYS[new Date(s.date + 'T00:00:00').getDay()]
                                return (
                                    <div key={s.id} onClick={() => setActiveSession(s)}
                                        style={{
                                            padding: "12px 18px", borderBottom: "1px solid rgba(255,255,255,0.03)",
                                            cursor: "pointer", display: "flex", alignItems: "center", gap: 10,
                                            background: isActive ? "rgba(46,204,64,0.06)" : "transparent",
                                            borderLeft: isActive ? "3px solid #2ecc40" : "3px solid transparent",
                                            transition: "all 0.2s"
                                        }}>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                                <span style={{ color: "#fff", fontSize: 13, fontWeight: 700 }}>{s.sessionType}</span>
                                                {s.name && <span style={{ color: "rgba(255,255,255,0.25)", fontSize: 10 }}>· {s.name}</span>}
                                            </div>
                                            <div style={{ display: "flex", gap: 6, marginTop: 3 }}>
                                                <span style={{ color: "rgba(255,255,255,0.25)", fontSize: 10 }}>{dayName} {new Date(s.date + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
                                                {s.teamId !== "all" && teamMap[s.teamId] && <span style={{ fontSize: 8, fontWeight: 700, color: "#3498db" }}>{teamMap[s.teamId].name}</span>}
                                            </div>
                                        </div>
                                        {stats.total > 0 && (
                                            <div style={{ textAlign: "right" }}>
                                                <span style={{ color: "#2ecc40", fontSize: 12, fontWeight: 800 }}>{stats.present + stats.late}</span>
                                                <span style={{ color: "rgba(255,255,255,0.15)", fontSize: 10 }}>/{stats.total}</span>
                                            </div>
                                        )}
                                        <div style={{ display: "flex", gap: 4 }} onClick={e => e.stopPropagation()}>
                                            <button onClick={() => setModal(s)} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 4, padding: "3px 6px", color: "rgba(255,255,255,0.25)", fontSize: 9, cursor: "pointer" }}>Edit</button>
                                            {isHeadCoach && (
                                                confirmDelete === s.id ? (
                                                    <div style={{ display: "flex", gap: 2 }}>
                                                        <button onClick={() => handleDeleteSession(s.id)} style={{ background: "rgba(231,76,60,0.15)", border: "1px solid rgba(231,76,60,0.3)", borderRadius: 4, padding: "3px 5px", color: "#e74c3c", fontSize: 8, fontWeight: 700, cursor: "pointer" }}>Yes</button>
                                                        <button onClick={() => setConfirmDelete(null)} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 4, padding: "3px 5px", color: "rgba(255,255,255,0.3)", fontSize: 8, cursor: "pointer" }}>No</button>
                                                    </div>
                                                ) : (
                                                    <button onClick={() => setConfirmDelete(s.id)} style={{ background: "rgba(231,76,60,0.04)", border: "1px solid rgba(231,76,60,0.08)", borderRadius: 4, padding: "3px 5px", color: "rgba(231,76,60,0.4)", fontSize: 9, cursor: "pointer" }}>✕</button>
                                                )
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* Attendance Panel */}
                    <div style={{ flex: "2 1 400px" }}>
                        {!activeSession ? (
                            <div style={{ background: "linear-gradient(145deg,#1a1a2e,#16213e)", borderRadius: 16, border: "1px solid rgba(255,255,255,0.08)", padding: "60px 20px", textAlign: "center" }}>
                                <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 14 }}>Select a session to take attendance</p>
                                <p style={{ color: "rgba(255,255,255,0.15)", fontSize: 11, marginTop: 4 }}>Or create a new session to get started</p>
                            </div>
                        ) : (
                            <div style={{ background: "linear-gradient(145deg,#1a1a2e,#16213e)", borderRadius: 16, border: "1px solid rgba(255,255,255,0.08)", overflow: "hidden" }}>
                                {/* Session Header */}
                                <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                                    <div>
                                        <div style={{ color: "#fff", fontSize: 16, fontWeight: 700 }}>{activeSession.sessionType}{activeSession.name ? ` — ${activeSession.name}` : ""}</div>
                                        <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 11, marginTop: 2 }}>
                                            {new Date(activeSession.date + 'T00:00:00').toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                                        </div>
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                        <div style={{ display: "flex", gap: 12 }}>
                                            <span style={{ color: "#2ecc40", fontSize: 11, fontWeight: 700 }}>{presentCount} present</span>
                                            {lateCount > 0 && <span style={{ color: "#e8b930", fontSize: 11, fontWeight: 700 }}>{lateCount} late</span>}
                                            <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 11 }}>{sessionPlayers.length} total</span>
                                        </div>
                                        <button onClick={handleSaveAttendance} disabled={saving}
                                            style={{ background: saved ? "rgba(46,204,64,0.2)" : "linear-gradient(135deg,#1a6b1a,#2ecc40)", border: saved ? "1px solid #2ecc40" : "none", borderRadius: 8, padding: "8px 16px", color: "#fff", fontSize: 11, fontWeight: 700, cursor: saving ? "wait" : "pointer" }}>
                                            {saved ? "✓ Saved!" : saving ? "Saving..." : "Save"}
                                        </button>
                                    </div>
                                </div>

                                {/* Quick Actions */}
                                <div style={{ padding: "10px 20px", borderBottom: "1px solid rgba(255,255,255,0.04)", display: "flex", gap: 6 }}>
                                    <button onClick={() => { const m = {}; sessionPlayers.forEach(p => m[p.id] = "present"); setLocalAttendance(m) }}
                                        style={{ background: "rgba(46,204,64,0.08)", border: "1px solid rgba(46,204,64,0.15)", borderRadius: 6, padding: "5px 12px", color: "#2ecc40", fontSize: 10, fontWeight: 700, cursor: "pointer" }}>All Present</button>
                                    <button onClick={() => setLocalAttendance({})}
                                        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 6, padding: "5px 12px", color: "rgba(255,255,255,0.3)", fontSize: 10, fontWeight: 600, cursor: "pointer" }}>Clear All</button>
                                </div>

                                {/* Player List */}
                                {sessionPlayers.map(player => {
                                    const status = localAttendance[player.id] || "absent"
                                    return (
                                        <div key={player.id} onClick={() => toggleAttendance(player.id)}
                                            style={{
                                                padding: "10px 20px", borderBottom: "1px solid rgba(255,255,255,0.02)",
                                                display: "flex", alignItems: "center", gap: 12, cursor: "pointer",
                                                background: status === "present" ? "rgba(46,204,64,0.03)" : status === "late" ? "rgba(232,185,48,0.03)" : "transparent",
                                                transition: "background 0.15s"
                                            }}>
                                            {/* Status indicator */}
                                            <div style={{
                                                width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                                                background: status === "present" ? "rgba(46,204,64,0.15)" : status === "late" ? "rgba(232,185,48,0.15)" : "rgba(255,255,255,0.04)",
                                                border: status === "present" ? "1px solid #2ecc40" : status === "late" ? "1px solid #e8b930" : "1px solid rgba(255,255,255,0.08)",
                                                display: "flex", alignItems: "center", justifyContent: "center",
                                                color: status === "present" ? "#2ecc40" : status === "late" ? "#e8b930" : "rgba(255,255,255,0.15)",
                                                fontSize: 14, fontWeight: 800
                                            }}>
                                                {status === "present" ? "✓" : status === "late" ? "L" : "—"}
                                            </div>

                                            <div style={{ flex: 1 }}>
                                                <span style={{ color: "#fff", fontSize: 13, fontWeight: 700 }}>{player.name}</span>
                                                <div style={{ display: "flex", gap: 4, marginTop: 2 }}>
                                                    {(player.positions || []).slice(0, 3).map(p => (
                                                        <span key={p} style={{ fontSize: 8, fontWeight: 700, color: p === "GK" ? "#ffaa00" : "rgba(255,255,255,0.2)" }}>{p}</span>
                                                    ))}
                                                </div>
                                            </div>

                                            <span style={{
                                                fontSize: 9, fontWeight: 700, letterSpacing: 0.8,
                                                color: status === "present" ? "#2ecc40" : status === "late" ? "#e8b930" : "rgba(255,255,255,0.15)"
                                            }}>{status.toUpperCase()}</span>
                                        </div>
                                    )
                                })}

                                {sessionPlayers.length === 0 && (
                                    <div style={{ padding: "30px 20px", textAlign: "center" }}>
                                        <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 12 }}>No players in this team</p>
                                    </div>
                                )}

                                {/* Session Notes */}
                                {activeSession.notes && (
                                    <div style={{ padding: "14px 20px", borderTop: "1px solid rgba(255,255,255,0.04)" }}>
                                        <div style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.2)", letterSpacing: 1, marginBottom: 4 }}>SESSION NOTES</div>
                                        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, margin: 0, lineHeight: 1.6 }}>{activeSession.notes}</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {modal && <SessionModal session={modal === "new" ? null : modal} teams={teams} onSave={handleSaveSession} onClose={() => setModal(null)} coachName={adminData?.name || "Coach"} />}
        </div>
    )
}