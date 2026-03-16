import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { subscribeTeams, subscribeSeasons, subscribePlayers, saveTeam, removeTeam, saveSeason, removeSeason } from '../firebase'

const AGE_GROUPS = ["U8", "U10", "U12", "U13", "U14", "U15", "U16", "U18", "U21", "Senior", "Mixed"]

function SeasonModal({ season, onSave, onClose }) {
    const [name, setName] = useState(season?.name || "")
    const [startDate, setStartDate] = useState(season?.startDate || "")
    const [endDate, setEndDate] = useState(season?.endDate || "")
    const isNew = !season

    return (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999, padding: 16 }} onClick={onClose}>
            <div onClick={e => e.stopPropagation()} style={{ background: "linear-gradient(145deg,#1a1a2e,#16213e)", borderRadius: 16, width: "100%", maxWidth: 400, boxShadow: "0 16px 64px rgba(0,0,0,0.6)", border: "1px solid rgba(255,255,255,0.1)", padding: 24 }}>
                <h2 style={{ color: "#fff", fontSize: 18, fontWeight: 700, margin: "0 0 18px" }}>{isNew ? "New Season" : "Edit Season"}</h2>

                <div style={{ marginBottom: 14 }}>
                    <label style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, fontWeight: 600, letterSpacing: 0.5, display: "block", marginBottom: 6 }}>SEASON NAME</label>
                    <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Term 1 2026, Season 2025/26"
                        style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, padding: "11px 14px", color: "#fff", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
                </div>

                <div style={{ display: "flex", gap: 12, marginBottom: 18 }}>
                    <div style={{ flex: 1 }}>
                        <label style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, fontWeight: 600, letterSpacing: 0.5, display: "block", marginBottom: 6 }}>START DATE</label>
                        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                            style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, padding: "10px 14px", color: "#fff", fontSize: 13, outline: "none", boxSizing: "border-box", colorScheme: "dark" }} />
                    </div>
                    <div style={{ flex: 1 }}>
                        <label style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, fontWeight: 600, letterSpacing: 0.5, display: "block", marginBottom: 6 }}>END DATE</label>
                        <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
                            style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, padding: "10px 14px", color: "#fff", fontSize: 13, outline: "none", boxSizing: "border-box", colorScheme: "dark" }} />
                    </div>
                </div>

                <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={onClose} style={{ flex: 1, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "10px", color: "rgba(255,255,255,0.5)", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Cancel</button>
                    <button onClick={() => {
                        if (!name.trim()) return
                        onSave({ id: season?.id || Date.now().toString(), name: name.trim(), startDate, endDate, active: season?.active ?? true, createdAt: season?.createdAt || new Date().toISOString() })
                    }} style={{ flex: 1, background: "linear-gradient(135deg,#1a6b1a,#2ecc40)", border: "none", borderRadius: 10, padding: "10px", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", opacity: name.trim() ? 1 : 0.4 }}>
                        {isNew ? "Create Season" : "Save Changes"}
                    </button>
                </div>
            </div>
        </div>
    )
}

function TeamModal({ team, seasons, onSave, onClose }) {
    const [name, setName] = useState(team?.name || "")
    const [ageGroup, setAgeGroup] = useState(team?.ageGroup || "U15")
    const [seasonId, setSeasonId] = useState(team?.seasonId || (seasons.find(s => s.active)?.id || ""))
    const isNew = !team

    return (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999, padding: 16 }} onClick={onClose}>
            <div onClick={e => e.stopPropagation()} style={{ background: "linear-gradient(145deg,#1a1a2e,#16213e)", borderRadius: 16, width: "100%", maxWidth: 420, boxShadow: "0 16px 64px rgba(0,0,0,0.6)", border: "1px solid rgba(255,255,255,0.1)", padding: 24 }}>
                <h2 style={{ color: "#fff", fontSize: 18, fontWeight: 700, margin: "0 0 18px" }}>{isNew ? "New Team" : "Edit Team"}</h2>

                <div style={{ marginBottom: 14 }}>
                    <label style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, fontWeight: 600, letterSpacing: 0.5, display: "block", marginBottom: 6 }}>TEAM NAME</label>
                    <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Hub FC U15, Junior Lions"
                        style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, padding: "11px 14px", color: "#fff", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
                </div>

                <div style={{ marginBottom: 14 }}>
                    <label style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, fontWeight: 600, letterSpacing: 0.5, display: "block", marginBottom: 8 }}>AGE GROUP</label>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        {AGE_GROUPS.map(ag => (
                            <button key={ag} onClick={() => setAgeGroup(ag)}
                                style={{
                                    background: ageGroup === ag ? "rgba(46,204,64,0.2)" : "rgba(255,255,255,0.04)",
                                    border: ageGroup === ag ? "1px solid #2ecc40" : "1px solid rgba(255,255,255,0.1)",
                                    borderRadius: 6, padding: "6px 12px", color: ageGroup === ag ? "#2ecc40" : "rgba(255,255,255,0.4)",
                                    fontSize: 11, fontWeight: 700, cursor: "pointer", letterSpacing: 0.5
                                }}>{ag}</button>
                        ))}
                    </div>
                </div>

                <div style={{ marginBottom: 18 }}>
                    <label style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, fontWeight: 600, letterSpacing: 0.5, display: "block", marginBottom: 6 }}>SEASON</label>
                    <select value={seasonId} onChange={e => setSeasonId(e.target.value)}
                        style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, padding: "11px 14px", color: "#fff", fontSize: 13, outline: "none", cursor: "pointer", boxSizing: "border-box" }}>
                        <option value="" style={{ background: "#1a1a2e" }}>No season</option>
                        {seasons.map(s => (
                            <option key={s.id} value={s.id} style={{ background: "#1a1a2e" }}>
                                {s.name}{s.active ? " (Active)" : ""}
                            </option>
                        ))}
                    </select>
                </div>

                <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={onClose} style={{ flex: 1, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "10px", color: "rgba(255,255,255,0.5)", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Cancel</button>
                    <button onClick={() => {
                        if (!name.trim()) return
                        onSave({ id: team?.id || Date.now().toString(), name: name.trim(), ageGroup, seasonId, createdAt: team?.createdAt || new Date().toISOString() })
                    }} style={{ flex: 1, background: "linear-gradient(135deg,#1a6b1a,#2ecc40)", border: "none", borderRadius: 10, padding: "10px", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", opacity: name.trim() ? 1 : 0.4 }}>
                        {isNew ? "Create Team" : "Save Changes"}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default function TeamManager() {
    const { isHeadCoach, logout } = useAuth()
    const navigate = useNavigate()
    const [teams, setTeams] = useState([])
    const [seasons, setSeasons] = useState([])
    const [players, setPlayers] = useState([])
    const [seasonModal, setSeasonModal] = useState(null)
    const [teamModal, setTeamModal] = useState(null)
    const [confirmDelete, setConfirmDelete] = useState(null)

    useEffect(() => {
        const u1 = subscribeTeams(setTeams)
        const u2 = subscribeSeasons(setSeasons)
        const u3 = subscribePlayers(setPlayers)
        return () => { u1(); u2(); u3() }
    }, [])

    const sortedSeasons = useMemo(() =>
        [...seasons].sort((a, b) => (b.active ? 1 : 0) - (a.active ? 1 : 0) || new Date(b.createdAt) - new Date(a.createdAt))
        , [seasons])

    const teamsBySeason = useMemo(() => {
        const map = {}
        teams.forEach(t => {
            const key = t.seasonId || "none"
            if (!map[key]) map[key] = []
            map[key].push(t)
        })
        // Sort teams within each season by age group
        Object.values(map).forEach(arr => arr.sort((a, b) => a.ageGroup.localeCompare(b.ageGroup)))
        return map
    }, [teams])

    const playerCountByTeam = useMemo(() => {
        const map = {}
        let unassigned = 0
        players.forEach(p => {
            const ids = p.teamIds || (p.teamId ? [p.teamId] : [])
            if (ids.length === 0) { unassigned++; return }
            ids.forEach(tid => { map[tid] = (map[tid] || 0) + 1 })
        })
        map["unassigned"] = unassigned
        return map
    }, [players])

    const handleSaveSeason = async (s) => { await saveSeason(s); setSeasonModal(null) }
    const handleSaveTeam = async (t) => { await saveTeam(t); setTeamModal(null) }

    const handleToggleActive = async (season) => {
        await saveSeason({ ...season, active: !season.active })
    }

    const handleDeleteTeam = async (id) => {
        const count = playerCountByTeam[id] || 0
        if (count > 0) { alert(`Can't delete — ${count} player${count > 1 ? 's are' : ' is'} assigned to this team. Reassign them first.`); return }
        await removeTeam(id)
        setConfirmDelete(null)
    }

    const handleDeleteSeason = async (id) => {
        const seasonTeams = teamsBySeason[id] || []
        if (seasonTeams.length > 0) { alert(`Can't delete — ${seasonTeams.length} team${seasonTeams.length > 1 ? 's are' : ' is'} in this season. Delete or reassign them first.`); return }
        await removeSeason(id)
        setConfirmDelete(null)
    }

    return (
        <div style={{ minHeight: "100vh", background: "#0a0a1a", padding: "20px 12px", fontFamily: "system-ui" }}>
            <div style={{ maxWidth: 900, margin: "0 auto" }}>

                {/* Top Bar */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <button onClick={() => navigate('/admin/manage')}
                            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "7px 14px", color: "rgba(255,255,255,0.5)", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>
                            ← Back
                        </button>
                        <h1 style={{ color: "#fff", fontSize: 22, fontWeight: 800, margin: 0, letterSpacing: 1 }}>TEAMS & SEASONS</h1>
                    </div>
                </div>

                {/* Seasons Section */}
                <div style={{ background: "linear-gradient(145deg,#1a1a2e,#16213e)", borderRadius: 16, border: "1px solid rgba(255,255,255,0.08)", overflow: "hidden", marginBottom: 20 }}>
                    <div style={{ padding: "18px 22px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div>
                            <h2 style={{ color: "#fff", fontSize: 16, fontWeight: 700, margin: "0 0 2px" }}>Seasons</h2>
                            <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 11, margin: 0 }}>Organize your teams into terms or seasons</p>
                        </div>
                        <button onClick={() => setSeasonModal("new")}
                            style={{ background: "linear-gradient(135deg,#1a6b1a,#2ecc40)", border: "none", borderRadius: 8, padding: "8px 16px", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                            + New Season
                        </button>
                    </div>

                    {sortedSeasons.length === 0 && (
                        <div style={{ padding: "30px 22px", textAlign: "center" }}>
                            <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 13, margin: "0 0 4px" }}>No seasons yet</p>
                            <p style={{ color: "rgba(255,255,255,0.2)", fontSize: 11, margin: 0 }}>Create a season to start organizing your teams</p>
                        </div>
                    )}

                    {sortedSeasons.map(season => (
                        <div key={season.id} style={{ padding: "14px 22px", borderBottom: "1px solid rgba(255,255,255,0.03)", display: "flex", alignItems: "center", gap: 14 }}>
                            <div style={{
                                width: 10, height: 10, borderRadius: "50%", flexShrink: 0,
                                background: season.active ? "#2ecc40" : "rgba(255,255,255,0.15)",
                                boxShadow: season.active ? "0 0 6px rgba(46,204,64,0.4)" : "none"
                            }} />
                            <div style={{ flex: 1 }}>
                                <div style={{ color: "#fff", fontSize: 14, fontWeight: 700 }}>{season.name}</div>
                                <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 11, marginTop: 1 }}>
                                    {season.startDate && season.endDate ? `${season.startDate} → ${season.endDate}` : "No dates set"}
                                    {" · "}{(teamsBySeason[season.id] || []).length} team{(teamsBySeason[season.id] || []).length !== 1 ? 's' : ''}
                                </div>
                            </div>
                            <button onClick={() => handleToggleActive(season)}
                                style={{
                                    background: season.active ? "rgba(46,204,64,0.1)" : "rgba(255,255,255,0.04)",
                                    border: season.active ? "1px solid rgba(46,204,64,0.2)" : "1px solid rgba(255,255,255,0.08)",
                                    borderRadius: 6, padding: "4px 10px", fontSize: 9, fontWeight: 700, cursor: "pointer",
                                    color: season.active ? "#2ecc40" : "rgba(255,255,255,0.3)", letterSpacing: 0.5
                                }}>{season.active ? "ACTIVE" : "INACTIVE"}</button>
                            <button onClick={() => setSeasonModal(season)}
                                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 6, padding: "5px 10px", color: "rgba(255,255,255,0.4)", fontSize: 10, cursor: "pointer" }}>Edit</button>
                            {confirmDelete === "s-" + season.id ? (
                                <div style={{ display: "flex", gap: 4 }}>
                                    <button onClick={() => handleDeleteSeason(season.id)} style={{ background: "rgba(231,76,60,0.15)", border: "1px solid rgba(231,76,60,0.3)", borderRadius: 6, padding: "5px 8px", color: "#e74c3c", fontSize: 9, fontWeight: 700, cursor: "pointer" }}>Confirm</button>
                                    <button onClick={() => setConfirmDelete(null)} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 6, padding: "5px 8px", color: "rgba(255,255,255,0.3)", fontSize: 9, cursor: "pointer" }}>Cancel</button>
                                </div>
                            ) : (
                                <button onClick={() => setConfirmDelete("s-" + season.id)}
                                    style={{ background: "rgba(231,76,60,0.06)", border: "1px solid rgba(231,76,60,0.1)", borderRadius: 6, padding: "5px 8px", color: "rgba(231,76,60,0.5)", fontSize: 10, cursor: "pointer" }}>✕</button>
                            )}
                        </div>
                    ))}
                </div>

                {/* Teams Section */}
                <div style={{ background: "linear-gradient(145deg,#1a1a2e,#16213e)", borderRadius: 16, border: "1px solid rgba(255,255,255,0.08)", overflow: "hidden" }}>
                    <div style={{ padding: "18px 22px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div>
                            <h2 style={{ color: "#fff", fontSize: 16, fontWeight: 700, margin: "0 0 2px" }}>Teams</h2>
                            <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 11, margin: 0 }}>
                                {teams.length} team{teams.length !== 1 ? 's' : ''} · {playerCountByTeam["unassigned"] || 0} unassigned player{(playerCountByTeam["unassigned"] || 0) !== 1 ? 's' : ''}
                            </p>
                        </div>
                        <button onClick={() => setTeamModal("new")}
                            style={{ background: "linear-gradient(135deg,#1a6b1a,#2ecc40)", border: "none", borderRadius: 8, padding: "8px 16px", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                            + New Team
                        </button>
                    </div>

                    {teams.length === 0 && (
                        <div style={{ padding: "30px 22px", textAlign: "center" }}>
                            <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 13, margin: "0 0 4px" }}>No teams yet</p>
                            <p style={{ color: "rgba(255,255,255,0.2)", fontSize: 11, margin: 0 }}>Create a season first, then add teams to it</p>
                        </div>
                    )}

                    {/* Group by season */}
                    {sortedSeasons.map(season => {
                        const sTeams = teamsBySeason[season.id] || []
                        if (sTeams.length === 0) return null
                        return (
                            <div key={season.id}>
                                <div style={{ padding: "10px 22px 6px", display: "flex", alignItems: "center", gap: 8 }}>
                                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: season.active ? "#2ecc40" : "rgba(255,255,255,0.15)" }} />
                                    <span style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.25)", letterSpacing: 1.5 }}>{season.name.toUpperCase()}</span>
                                </div>
                                {sTeams.map(team => (
                                    <TeamRow key={team.id} team={team} playerCount={playerCountByTeam[team.id] || 0}
                                        onEdit={() => setTeamModal(team)}
                                        onDelete={() => confirmDelete === "t-" + team.id ? handleDeleteTeam(team.id) : setConfirmDelete("t-" + team.id)}
                                        isConfirming={confirmDelete === "t-" + team.id}
                                        onCancelDelete={() => setConfirmDelete(null)} />
                                ))}
                            </div>
                        )
                    })}

                    {/* Teams without season */}
                    {(teamsBySeason["none"] || []).length > 0 && (
                        <div>
                            <div style={{ padding: "10px 22px 6px" }}>
                                <span style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.15)", letterSpacing: 1.5 }}>NO SEASON</span>
                            </div>
                            {(teamsBySeason["none"] || []).map(team => (
                                <TeamRow key={team.id} team={team} playerCount={playerCountByTeam[team.id] || 0}
                                    onEdit={() => setTeamModal(team)}
                                    onDelete={() => confirmDelete === "t-" + team.id ? handleDeleteTeam(team.id) : setConfirmDelete("t-" + team.id)}
                                    isConfirming={confirmDelete === "t-" + team.id}
                                    onCancelDelete={() => setConfirmDelete(null)} />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {seasonModal && <SeasonModal season={seasonModal === "new" ? null : seasonModal} onSave={handleSaveSeason} onClose={() => setSeasonModal(null)} />}
            {teamModal && <TeamModal team={teamModal === "new" ? null : teamModal} seasons={seasons} onSave={handleSaveTeam} onClose={() => setTeamModal(null)} />}
        </div>
    )
}

function TeamRow({ team, playerCount, onEdit, onDelete, isConfirming, onCancelDelete }) {
    const agColor = team.ageGroup?.startsWith("U1") ? "#3498db" : team.ageGroup?.startsWith("U8") || team.ageGroup?.startsWith("U10") ? "#2ecc40" : "#9b59b6"
    return (
        <div style={{ padding: "12px 22px 12px 38px", borderBottom: "1px solid rgba(255,255,255,0.03)", display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
                width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                background: `${agColor}18`, border: `1px solid ${agColor}33`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 11, fontWeight: 800, color: agColor, letterSpacing: 0.5
            }}>{team.ageGroup}</div>
            <div style={{ flex: 1 }}>
                <div style={{ color: "#fff", fontSize: 14, fontWeight: 700 }}>{team.name}</div>
                <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 11, marginTop: 1 }}>
                    {playerCount} player{playerCount !== 1 ? 's' : ''}
                </div>
            </div>
            <button onClick={onEdit}
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 6, padding: "5px 10px", color: "rgba(255,255,255,0.4)", fontSize: 10, cursor: "pointer" }}>Edit</button>
            {isConfirming ? (
                <div style={{ display: "flex", gap: 4 }}>
                    <button onClick={onDelete} style={{ background: "rgba(231,76,60,0.15)", border: "1px solid rgba(231,76,60,0.3)", borderRadius: 6, padding: "5px 8px", color: "#e74c3c", fontSize: 9, fontWeight: 700, cursor: "pointer" }}>Confirm</button>
                    <button onClick={onCancelDelete} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 6, padding: "5px 8px", color: "rgba(255,255,255,0.3)", fontSize: 9, cursor: "pointer" }}>Cancel</button>
                </div>
            ) : (
                <button onClick={onDelete}
                    style={{ background: "rgba(231,76,60,0.06)", border: "1px solid rgba(231,76,60,0.1)", borderRadius: 6, padding: "5px 8px", color: "rgba(231,76,60,0.5)", fontSize: 10, cursor: "pointer" }}>✕</button>
            )}
        </div>
    )
}