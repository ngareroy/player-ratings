import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { subscribePlayers, subscribeAwards, saveAward, removeAward, subscribeClubSettings } from '../firebase'

const AWARD_TEMPLATES = [
    { emoji: "🏆", label: "Most Improved" },
    { emoji: "⭐", label: "Player of the Term" },
    { emoji: "👑", label: "Captain's Armband" },
    { emoji: "🥇", label: "Golden Boot" },
    { emoji: "🧤", label: "Golden Glove" },
    { emoji: "💪", label: "Hardest Worker" },
    { emoji: "🎯", label: "Playmaker Award" },
    { emoji: "🛡️", label: "Best Defender" },
    { emoji: "🌟", label: "Rising Star" },
    { emoji: "🤝", label: "Team Player" },
    { emoji: "🧠", label: "Tactical Brain" },
    { emoji: "🔥", label: "Top Scorer" },
]

function AwardModal({ onSave, onClose, players, coachName }) {
    const [playerId, setPlayerId] = useState("")
    const [label, setLabel] = useState("")
    const [emoji, setEmoji] = useState("🏅")
    const [reason, setReason] = useState("")
    const [search, setSearch] = useState("")

    const filtered = players.filter(p => !search || p.name.toLowerCase().includes(search.toLowerCase()))
    const selectedPlayer = players.find(p => p.id === playerId)

    return (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999, padding: 16 }} onClick={onClose}>
            <div onClick={e => e.stopPropagation()} style={{ background: "linear-gradient(145deg,#1a1a2e,#16213e)", borderRadius: 16, width: "100%", maxWidth: 480, maxHeight: "90vh", overflow: "auto", boxShadow: "0 16px 64px rgba(0,0,0,0.6)", border: "1px solid rgba(255,255,255,0.1)", padding: 24 }}>
                <h2 style={{ color: "#fff", fontSize: 18, fontWeight: 700, margin: "0 0 18px" }}>Give Award</h2>

                {/* Player Selection */}
                <div style={{ marginBottom: 14 }}>
                    <label style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, fontWeight: 600, display: "block", marginBottom: 6 }}>PLAYER</label>
                    {selectedPlayer ? (
                        <div style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(46,204,64,0.06)", border: "1px solid rgba(46,204,64,0.15)", borderRadius: 10, padding: "10px 14px" }}>
                            <span style={{ color: "#2ecc40", fontSize: 14, fontWeight: 700, flex: 1 }}>{selectedPlayer.name}</span>
                            <button onClick={() => setPlayerId("")} style={{ background: "rgba(255,255,255,0.06)", border: "none", borderRadius: 6, padding: "4px 10px", color: "rgba(255,255,255,0.4)", fontSize: 10, cursor: "pointer" }}>Change</button>
                        </div>
                    ) : (
                        <>
                            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search player..."
                                style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, padding: "10px 14px", color: "#fff", fontSize: 13, outline: "none", boxSizing: "border-box", marginBottom: 6 }} />
                            <div style={{ maxHeight: 150, overflow: "auto", borderRadius: 8, border: "1px solid rgba(255,255,255,0.06)" }}>
                                {filtered.map(p => (
                                    <div key={p.id} onClick={() => { setPlayerId(p.id); setSearch("") }}
                                        style={{ padding: "8px 14px", cursor: "pointer", borderBottom: "1px solid rgba(255,255,255,0.02)", display: "flex", alignItems: "center", justifyContent: "space-between" }}
                                        onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.03)"}
                                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                                        <span style={{ color: "#fff", fontSize: 12, fontWeight: 600 }}>{p.name}</span>
                                        <div style={{ display: "flex", gap: 3 }}>
                                            {(p.positions || []).slice(0, 2).map(pos => (
                                                <span key={pos} style={{ fontSize: 8, color: "rgba(255,255,255,0.2)", fontWeight: 700 }}>{pos}</span>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>

                {/* Quick Templates */}
                <div style={{ marginBottom: 14 }}>
                    <label style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, fontWeight: 600, display: "block", marginBottom: 8 }}>QUICK PICK (or customize below)</label>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        {AWARD_TEMPLATES.map(t => (
                            <button key={t.label} onClick={() => { setLabel(t.label); setEmoji(t.emoji) }}
                                style={{
                                    background: label === t.label ? "rgba(255,170,0,0.12)" : "rgba(255,255,255,0.04)",
                                    border: label === t.label ? "1px solid rgba(255,170,0,0.3)" : "1px solid rgba(255,255,255,0.08)",
                                    borderRadius: 8, padding: "6px 10px", cursor: "pointer",
                                    display: "flex", alignItems: "center", gap: 5,
                                    color: label === t.label ? "#ffaa00" : "rgba(255,255,255,0.4)",
                                    fontSize: 10, fontWeight: 700
                                }}>
                                <span style={{ fontSize: 14 }}>{t.emoji}</span> {t.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Custom Label */}
                <div style={{ display: "flex", gap: 12, marginBottom: 14 }}>
                    <div style={{ width: 60 }}>
                        <label style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, fontWeight: 600, display: "block", marginBottom: 6 }}>ICON</label>
                        <input value={emoji} onChange={e => setEmoji(e.target.value)} maxLength={2}
                            style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, padding: "10px", color: "#fff", fontSize: 20, textAlign: "center", outline: "none", boxSizing: "border-box" }} />
                    </div>
                    <div style={{ flex: 1 }}>
                        <label style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, fontWeight: 600, display: "block", marginBottom: 6 }}>AWARD NAME</label>
                        <input value={label} onChange={e => setLabel(e.target.value)} placeholder="Award name..."
                            style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, padding: "10px 14px", color: "#fff", fontSize: 14, fontWeight: 700, outline: "none", boxSizing: "border-box" }} />
                    </div>
                </div>

                {/* Reason */}
                <div style={{ marginBottom: 18 }}>
                    <label style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, fontWeight: 600, display: "block", marginBottom: 6 }}>REASON (optional)</label>
                    <textarea value={reason} onChange={e => setReason(e.target.value)} placeholder="Why this player deserves this award..."
                        rows={2} style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, padding: "10px 14px", color: "#fff", fontSize: 12, outline: "none", boxSizing: "border-box", resize: "vertical", fontFamily: "system-ui" }} />
                </div>

                <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={onClose} style={{ flex: 1, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "10px", color: "rgba(255,255,255,0.5)", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Cancel</button>
                    <button onClick={() => {
                        if (!playerId || !label.trim()) return
                        onSave({
                            id: Date.now().toString(),
                            playerId, label: label.trim(), emoji, reason: reason.trim(),
                            awardedBy: coachName,
                            awardedAt: new Date().toISOString(),
                        })
                    }} style={{
                        flex: 1, background: "linear-gradient(135deg,#8a6b00,#ffaa00)",
                        border: "none", borderRadius: 10, padding: "10px",
                        color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer",
                        opacity: (playerId && label.trim()) ? 1 : 0.4
                    }}>Award</button>
                </div>
            </div>
        </div>
    )
}

export default function AwardsPage() {
    const { adminData, isHeadCoach } = useAuth()
    const navigate = useNavigate()
    const [players, setPlayers] = useState([])
    const [awards, setAwards] = useState([])
    const [club, setClub] = useState({ clubName: "Hub FC" })
    const [modal, setModal] = useState(false)
    const [confirmDelete, setConfirmDelete] = useState(null)

    useEffect(() => {
        const u1 = subscribePlayers(setPlayers)
        const u2 = subscribeAwards(setAwards)
        const u3 = subscribeClubSettings(setClub)
        return () => { u1(); u2(); u3() }
    }, [])

    const playerMap = useMemo(() => { const m = {}; players.forEach(p => m[p.id] = p); return m }, [players])

    const sorted = useMemo(() =>
        [...awards].sort((a, b) => new Date(b.awardedAt) - new Date(a.awardedAt))
        , [awards])

    const handleSave = async (a) => { await saveAward(a); setModal(false) }
    const handleDelete = async (id) => { await removeAward(id); setConfirmDelete(null) }

    // Group by player
    const byPlayer = useMemo(() => {
        const map = {}
        awards.forEach(a => {
            if (!map[a.playerId]) map[a.playerId] = []
            map[a.playerId].push(a)
        })
        return map
    }, [awards])

    const topAwarded = useMemo(() =>
        Object.entries(byPlayer)
            .map(([pid, list]) => ({ player: playerMap[pid], count: list.length }))
            .filter(x => x.player)
            .sort((a, b) => b.count - a.count)
            .slice(0, 5)
        , [byPlayer, playerMap])

    return (
        <div style={{ minHeight: "100vh", background: "#0a0a1a", padding: "20px 12px", fontFamily: "system-ui" }}>
            <div style={{ maxWidth: 900, margin: "0 auto" }}>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <button onClick={() => navigate('/admin')} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "7px 14px", color: "rgba(255,255,255,0.5)", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>← Back</button>
                        <h1 style={{ color: "#fff", fontSize: 22, fontWeight: 800, margin: 0, letterSpacing: 1 }}>{club.clubName} AWARDS</h1>
                    </div>
                    <button onClick={() => setModal(true)} style={{ background: "linear-gradient(135deg,#8a6b00,#ffaa00)", border: "none", borderRadius: 8, padding: "8px 18px", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>+ Give Award</button>
                </div>

                {/* Top Awarded */}
                {topAwarded.length > 0 && (
                    <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
                        {topAwarded.map((ta, i) => (
                            <div key={ta.player.id} style={{ background: "linear-gradient(145deg,#1a1a2e,#16213e)", borderRadius: 12, border: "1px solid rgba(255,170,0,0.1)", padding: "12px 16px", display: "flex", alignItems: "center", gap: 10, flex: "1 1 160px" }}>
                                <span style={{ fontSize: 20 }}>{i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : "🏅"}</span>
                                <div>
                                    <div style={{ color: "#fff", fontSize: 13, fontWeight: 700 }}>{ta.player.name}</div>
                                    <div style={{ color: "#ffaa00", fontSize: 10, fontWeight: 600 }}>{ta.count} award{ta.count !== 1 ? 's' : ''}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* All Awards */}
                <div style={{ background: "linear-gradient(145deg,#1a1a2e,#16213e)", borderRadius: 16, border: "1px solid rgba(255,255,255,0.08)", overflow: "hidden" }}>
                    <div style={{ padding: "14px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                        <h2 style={{ color: "#fff", fontSize: 14, fontWeight: 700, margin: 0 }}>All Awards ({awards.length})</h2>
                    </div>

                    {sorted.length === 0 && (
                        <div style={{ padding: "40px 20px", textAlign: "center" }}>
                            <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 14 }}>No awards given yet</p>
                            <p style={{ color: "rgba(255,255,255,0.15)", fontSize: 11, marginTop: 4 }}>Give your first award to recognize a player's achievement</p>
                        </div>
                    )}

                    {sorted.map(award => {
                        const player = playerMap[award.playerId]
                        return (
                            <div key={award.id} style={{ padding: "12px 20px", borderBottom: "1px solid rgba(255,255,255,0.03)", display: "flex", alignItems: "center", gap: 12 }}>
                                <span style={{ fontSize: 24 }}>{award.emoji || "🏅"}</span>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                        <span style={{ color: "#ffaa00", fontSize: 13, fontWeight: 700 }}>{award.label}</span>
                                        <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 10 }}>→</span>
                                        <span style={{ color: "#fff", fontSize: 13, fontWeight: 700 }}>{player?.name || "Unknown"}</span>
                                    </div>
                                    <div style={{ display: "flex", gap: 8, marginTop: 3, flexWrap: "wrap" }}>
                                        {award.reason && <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 10, fontStyle: "italic" }}>"{award.reason}"</span>}
                                        <span style={{ color: "rgba(255,255,255,0.15)", fontSize: 9 }}>
                                            {new Date(award.awardedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            {award.awardedBy ? ` by ${award.awardedBy}` : ""}
                                        </span>
                                    </div>
                                </div>
                                {isHeadCoach && (
                                    confirmDelete === award.id ? (
                                        <div style={{ display: "flex", gap: 4 }}>
                                            <button onClick={() => handleDelete(award.id)} style={{ background: "rgba(231,76,60,0.15)", border: "1px solid rgba(231,76,60,0.3)", borderRadius: 6, padding: "5px 8px", color: "#e74c3c", fontSize: 9, fontWeight: 700, cursor: "pointer" }}>Yes</button>
                                            <button onClick={() => setConfirmDelete(null)} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 6, padding: "5px 8px", color: "rgba(255,255,255,0.3)", fontSize: 9, cursor: "pointer" }}>No</button>
                                        </div>
                                    ) : (
                                        <button onClick={() => setConfirmDelete(award.id)} style={{ background: "rgba(231,76,60,0.04)", border: "1px solid rgba(231,76,60,0.08)", borderRadius: 6, padding: "5px 8px", color: "rgba(231,76,60,0.4)", fontSize: 10, cursor: "pointer" }}>✕</button>
                                    )
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>

            {modal && <AwardModal players={players} onSave={handleSave} onClose={() => setModal(false)} coachName={adminData?.name || "Coach"} />}
        </div>
    )
}