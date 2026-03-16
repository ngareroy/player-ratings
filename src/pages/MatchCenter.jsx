import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { subscribeMatches, subscribeTeams, saveMatch, removeMatch } from '../firebase'

const MATCH_TYPES = ["League", "Friendly", "Cup", "Tournament", "Training Match"]

function MatchModal({ match, teams, onSave, onClose }) {
    const [opponent, setOpponent] = useState(match?.opponent || "")
    const [date, setDate] = useState(match?.date || new Date().toISOString().split('T')[0])
    const [time, setTime] = useState(match?.time || "15:00")
    const [venue, setVenue] = useState(match?.venue || "Home")
    const [teamId, setTeamId] = useState(match?.teamId || (teams[0]?.id || ""))
    const [matchType, setMatchType] = useState(match?.matchType || "Friendly")
    const [goalsFor, setGoalsFor] = useState(match?.goalsFor ?? "")
    const [goalsAgainst, setGoalsAgainst] = useState(match?.goalsAgainst ?? "")
    const [report, setReport] = useState(match?.report || "")
    const [motm, setMotm] = useState(match?.motm || "")
    const isNew = !match

    const isPast = new Date(date) < new Date(new Date().toDateString())

    return (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999, padding: 16 }} onClick={onClose}>
            <div onClick={e => e.stopPropagation()} style={{ background: "linear-gradient(145deg,#1a1a2e,#16213e)", borderRadius: 16, width: "100%", maxWidth: 480, maxHeight: "90vh", overflow: "auto", boxShadow: "0 16px 64px rgba(0,0,0,0.6)", border: "1px solid rgba(255,255,255,0.1)", padding: 24 }}>
                <h2 style={{ color: "#fff", fontSize: 18, fontWeight: 700, margin: "0 0 18px" }}>{isNew ? "New Match" : "Edit Match"}</h2>

                <div style={{ marginBottom: 14 }}>
                    <label style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, fontWeight: 600, display: "block", marginBottom: 6, letterSpacing: 0.5 }}>OPPONENT</label>
                    <input value={opponent} onChange={e => setOpponent(e.target.value)} placeholder="e.g. Greenfield Academy"
                        style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, padding: "11px 14px", color: "#fff", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
                </div>

                <div style={{ display: "flex", gap: 12, marginBottom: 14 }}>
                    <div style={{ flex: 1 }}>
                        <label style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, fontWeight: 600, display: "block", marginBottom: 6 }}>DATE</label>
                        <input type="date" value={date} onChange={e => setDate(e.target.value)}
                            style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, padding: "10px 14px", color: "#fff", fontSize: 13, outline: "none", boxSizing: "border-box", colorScheme: "dark" }} />
                    </div>
                    <div style={{ flex: 1 }}>
                        <label style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, fontWeight: 600, display: "block", marginBottom: 6 }}>KICK-OFF</label>
                        <input type="time" value={time} onChange={e => setTime(e.target.value)}
                            style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, padding: "10px 14px", color: "#fff", fontSize: 13, outline: "none", boxSizing: "border-box", colorScheme: "dark" }} />
                    </div>
                </div>

                <div style={{ display: "flex", gap: 12, marginBottom: 14 }}>
                    <div style={{ flex: 1 }}>
                        <label style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, fontWeight: 600, display: "block", marginBottom: 6 }}>VENUE</label>
                        <div style={{ display: "flex", gap: 6 }}>
                            {["Home", "Away", "Neutral"].map(v => (
                                <button key={v} onClick={() => setVenue(v)} style={{
                                    flex: 1, background: venue === v ? "rgba(46,204,64,0.15)" : "rgba(255,255,255,0.04)",
                                    border: venue === v ? "1px solid #2ecc40" : "1px solid rgba(255,255,255,0.1)",
                                    borderRadius: 8, padding: "8px", color: venue === v ? "#2ecc40" : "rgba(255,255,255,0.4)",
                                    fontSize: 11, fontWeight: 700, cursor: "pointer"
                                }}>{v}</button>
                            ))}
                        </div>
                    </div>
                </div>

                <div style={{ marginBottom: 14 }}>
                    <label style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, fontWeight: 600, display: "block", marginBottom: 6 }}>TEAM</label>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        {teams.map(t => (
                            <button key={t.id} onClick={() => setTeamId(t.id)} style={{
                                background: teamId === t.id ? "rgba(52,152,219,0.2)" : "rgba(255,255,255,0.04)",
                                border: teamId === t.id ? "1px solid #3498db" : "1px solid rgba(255,255,255,0.1)",
                                borderRadius: 6, padding: "6px 12px", color: teamId === t.id ? "#3498db" : "rgba(255,255,255,0.35)",
                                fontSize: 11, fontWeight: 700, cursor: "pointer"
                            }}>{t.name}</button>
                        ))}
                    </div>
                </div>

                <div style={{ marginBottom: 14 }}>
                    <label style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, fontWeight: 600, display: "block", marginBottom: 6 }}>MATCH TYPE</label>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        {MATCH_TYPES.map(mt => (
                            <button key={mt} onClick={() => setMatchType(mt)} style={{
                                background: matchType === mt ? "rgba(155,89,182,0.15)" : "rgba(255,255,255,0.04)",
                                border: matchType === mt ? "1px solid #9b59b6" : "1px solid rgba(255,255,255,0.1)",
                                borderRadius: 6, padding: "6px 10px", color: matchType === mt ? "#9b59b6" : "rgba(255,255,255,0.35)",
                                fontSize: 10, fontWeight: 700, cursor: "pointer"
                            }}>{mt}</button>
                        ))}
                    </div>
                </div>

                {/* Score (only show for past/completed matches) */}
                {(isPast || goalsFor !== "" || goalsAgainst !== "") && (
                    <div style={{ marginBottom: 14 }}>
                        <label style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, fontWeight: 600, display: "block", marginBottom: 6 }}>SCORE</label>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <input type="number" min={0} value={goalsFor} onChange={e => setGoalsFor(e.target.value === "" ? "" : parseInt(e.target.value))} placeholder="—"
                                style={{ width: 56, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, padding: "10px", color: "#2ecc40", fontSize: 20, fontWeight: 800, textAlign: "center", outline: "none" }} />
                            <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 16, fontWeight: 800 }}>—</span>
                            <input type="number" min={0} value={goalsAgainst} onChange={e => setGoalsAgainst(e.target.value === "" ? "" : parseInt(e.target.value))} placeholder="—"
                                style={{ width: 56, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, padding: "10px", color: "#e74c3c", fontSize: 20, fontWeight: 800, textAlign: "center", outline: "none" }} />
                            <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 11, marginLeft: 4 }}>(Us — Them)</span>
                        </div>
                    </div>
                )}

                {/* Report */}
                <div style={{ marginBottom: 18 }}>
                    <label style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, fontWeight: 600, display: "block", marginBottom: 6 }}>MATCH REPORT (optional)</label>
                    <textarea value={report} onChange={e => setReport(e.target.value)} placeholder="Brief summary of the match..."
                        rows={3} style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, padding: "11px 14px", color: "#fff", fontSize: 13, outline: "none", boxSizing: "border-box", resize: "vertical", fontFamily: "system-ui" }} />
                </div>

                <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={onClose} style={{ flex: 1, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "10px", color: "rgba(255,255,255,0.5)", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Cancel</button>
                    <button onClick={() => {
                        if (!opponent.trim()) return
                        onSave({
                            id: match?.id || Date.now().toString(),
                            opponent: opponent.trim(), date, time, venue, teamId, matchType,
                            goalsFor: goalsFor === "" ? null : goalsFor,
                            goalsAgainst: goalsAgainst === "" ? null : goalsAgainst,
                            report, motm: match?.motm || "",
                            createdAt: match?.createdAt || new Date().toISOString(),
                        })
                    }} style={{ flex: 1, background: "linear-gradient(135deg,#1a6b1a,#2ecc40)", border: "none", borderRadius: 10, padding: "10px", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", opacity: opponent.trim() ? 1 : 0.4 }}>
                        {isNew ? "Create Match" : "Save"}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default function MatchCenter() {
    const { isHeadCoach } = useAuth()
    const navigate = useNavigate()
    const [matches, setMatches] = useState([])
    const [teams, setTeams] = useState([])
    const [modal, setModal] = useState(null)
    const [filterTeam, setFilterTeam] = useState("all")
    const [confirmDelete, setConfirmDelete] = useState(null)

    useEffect(() => {
        const u1 = subscribeMatches(setMatches)
        const u2 = subscribeTeams(setTeams)
        return () => { u1(); u2() }
    }, [])

    const teamMap = useMemo(() => { const m = {}; teams.forEach(t => m[t.id] = t); return m }, [teams])

    const filtered = useMemo(() => {
        let list = [...matches]
        if (filterTeam !== "all") list = list.filter(m => m.teamId === filterTeam)
        return list.sort((a, b) => new Date(b.date) - new Date(a.date))
    }, [matches, filterTeam])

    const upcoming = filtered.filter(m => new Date(m.date) >= new Date(new Date().toDateString()))
    const past = filtered.filter(m => new Date(m.date) < new Date(new Date().toDateString()))

    const handleSave = async (m) => { await saveMatch(m); setModal(null) }
    const handleDelete = async (id) => { await removeMatch(id); setConfirmDelete(null) }

    const getResult = (m) => {
        if (m.goalsFor === null || m.goalsAgainst === null) return null
        if (m.goalsFor > m.goalsAgainst) return "W"
        if (m.goalsFor < m.goalsAgainst) return "L"
        return "D"
    }

    const resultColor = { W: "#2ecc40", D: "#e8b930", L: "#e74c3c" }

    const renderMatch = (m) => {
        const team = teamMap[m.teamId]
        const result = getResult(m)
        const hasScore = m.goalsFor !== null && m.goalsAgainst !== null
        return (
            <div key={m.id} style={{ padding: "14px 20px", borderBottom: "1px solid rgba(255,255,255,0.03)", display: "flex", alignItems: "center", gap: 12, cursor: "pointer", transition: "background 0.2s" }}
                onClick={() => navigate(`/admin/matches/${m.id}`)}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.02)"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>

                {/* Result badge */}
                <div style={{
                    width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                    background: result ? `${resultColor[result]}15` : "rgba(255,255,255,0.04)",
                    border: result ? `1px solid ${resultColor[result]}33` : "1px solid rgba(255,255,255,0.08)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: result ? 14 : 11, fontWeight: 800,
                    color: result ? resultColor[result] : "rgba(255,255,255,0.2)",
                }}>{result || new Date(m.date).getDate()}</div>

                <div style={{ flex: 1 }}>
                    <div style={{ color: "#fff", fontSize: 14, fontWeight: 700 }}>
                        {hasScore ? (
                            <><span style={{ color: resultColor[result] || "#fff" }}>Hub FC {m.goalsFor}</span> <span style={{ color: "rgba(255,255,255,0.2)" }}>—</span> <span>{m.goalsAgainst} {m.opponent}</span></>
                        ) : (
                            <>Hub FC vs {m.opponent}</>
                        )}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 3, flexWrap: "wrap" }}>
                        <span style={{ color: "rgba(255,255,255,0.25)", fontSize: 10 }}>
                            {new Date(m.date).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })} · {m.time}
                        </span>
                        <span style={{ fontSize: 9, fontWeight: 700, padding: "1px 6px", borderRadius: 3, background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.25)" }}>{m.venue}</span>
                        <span style={{ fontSize: 9, fontWeight: 700, padding: "1px 6px", borderRadius: 3, background: "rgba(155,89,182,0.1)", color: "rgba(155,89,182,0.6)" }}>{m.matchType}</span>
                        {team && <span style={{ fontSize: 9, fontWeight: 700, padding: "1px 6px", borderRadius: 3, background: "rgba(52,152,219,0.1)", color: "#3498db" }}>{team.name}</span>}
                    </div>
                </div>

                <div style={{ display: "flex", gap: 6 }} onClick={e => e.stopPropagation()}>
                    <button onClick={() => setModal(m)}
                        style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 6, padding: "5px 10px", color: "rgba(255,255,255,0.4)", fontSize: 10, cursor: "pointer" }}>Edit</button>
                    {isHeadCoach && (
                        confirmDelete === m.id ? (
                            <div style={{ display: "flex", gap: 4 }}>
                                <button onClick={() => handleDelete(m.id)} style={{ background: "rgba(231,76,60,0.15)", border: "1px solid rgba(231,76,60,0.3)", borderRadius: 6, padding: "5px 8px", color: "#e74c3c", fontSize: 9, fontWeight: 700, cursor: "pointer" }}>Confirm</button>
                                <button onClick={() => setConfirmDelete(null)} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 6, padding: "5px 8px", color: "rgba(255,255,255,0.3)", fontSize: 9, cursor: "pointer" }}>Cancel</button>
                            </div>
                        ) : (
                            <button onClick={() => setConfirmDelete(m.id)} style={{ background: "rgba(231,76,60,0.06)", border: "1px solid rgba(231,76,60,0.1)", borderRadius: 6, padding: "5px 8px", color: "rgba(231,76,60,0.5)", fontSize: 10, cursor: "pointer" }}>✕</button>
                        )
                    )}
                </div>
            </div>
        )
    }

    return (
        <div style={{ minHeight: "100vh", background: "#0a0a1a", padding: "20px 12px", fontFamily: "system-ui" }}>
            <div style={{ maxWidth: 900, margin: "0 auto" }}>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <button onClick={() => navigate('/admin')}
                            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "7px 14px", color: "rgba(255,255,255,0.5)", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>
                            ← Back
                        </button>
                        <h1 style={{ color: "#fff", fontSize: 22, fontWeight: 800, margin: 0, letterSpacing: 1 }}>MATCH CENTER</h1>
                    </div>
                    <button onClick={() => setModal("new")}
                        style={{ background: "linear-gradient(135deg,#1a6b1a,#2ecc40)", border: "none", borderRadius: 8, padding: "8px 18px", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                        + New Match
                    </button>
                </div>

                {/* Team Filter */}
                {teams.length > 0 && (
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
                        <button onClick={() => setFilterTeam("all")} style={{
                            background: filterTeam === "all" ? "rgba(52,152,219,0.2)" : "rgba(255,255,255,0.04)",
                            border: filterTeam === "all" ? "1px solid #3498db" : "1px solid rgba(255,255,255,0.08)",
                            borderRadius: 6, padding: "5px 10px", color: filterTeam === "all" ? "#3498db" : "rgba(255,255,255,0.35)",
                            fontSize: 10, fontWeight: 700, cursor: "pointer"
                        }}>All Teams</button>
                        {teams.map(t => (
                            <button key={t.id} onClick={() => setFilterTeam(t.id)} style={{
                                background: filterTeam === t.id ? "rgba(52,152,219,0.2)" : "rgba(255,255,255,0.04)",
                                border: filterTeam === t.id ? "1px solid #3498db" : "1px solid rgba(255,255,255,0.08)",
                                borderRadius: 6, padding: "5px 10px", color: filterTeam === t.id ? "#3498db" : "rgba(255,255,255,0.35)",
                                fontSize: 10, fontWeight: 700, cursor: "pointer"
                            }}>{t.name}</button>
                        ))}
                    </div>
                )}

                {/* Upcoming */}
                {upcoming.length > 0 && (
                    <div style={{ background: "linear-gradient(145deg,#1a1a2e,#16213e)", borderRadius: 16, border: "1px solid rgba(255,255,255,0.08)", overflow: "hidden", marginBottom: 16 }}>
                        <div style={{ padding: "14px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                            <h2 style={{ color: "#fff", fontSize: 14, fontWeight: 700, margin: 0 }}>Upcoming ({upcoming.length})</h2>
                        </div>
                        {upcoming.map(renderMatch)}
                    </div>
                )}

                {/* Results */}
                <div style={{ background: "linear-gradient(145deg,#1a1a2e,#16213e)", borderRadius: 16, border: "1px solid rgba(255,255,255,0.08)", overflow: "hidden" }}>
                    <div style={{ padding: "14px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                        <h2 style={{ color: "#fff", fontSize: 14, fontWeight: 700, margin: 0 }}>
                            {past.length > 0 ? `Results (${past.length})` : "No matches yet"}
                        </h2>
                    </div>
                    {past.length === 0 && upcoming.length === 0 && (
                        <div style={{ padding: "40px 20px", textAlign: "center" }}>
                            <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 13, margin: "0 0 4px" }}>No matches created</p>
                            <p style={{ color: "rgba(255,255,255,0.2)", fontSize: 11, margin: 0 }}>Create a match to start tracking results and player stats</p>
                        </div>
                    )}
                    {past.map(renderMatch)}
                </div>
            </div>

            {modal && <MatchModal match={modal === "new" ? null : modal} teams={teams} onSave={handleSave} onClose={() => setModal(null)} />}
        </div>
    )
}