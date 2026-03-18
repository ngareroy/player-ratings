import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { subscribePlayers, subscribeTeams, subscribeClubSettings } from '../firebase'
import { calcPositionRating, calcCategories, calcGkCategory, calcOverall, calcBestRating, getRatingColor, getOvrBg } from '../utils'

const FORMATIONS = {
    "4-4-2": { label: "4-4-2", slots: ["GK", "LB", "CB", "CB", "RB", "LM", "CM", "CM", "RM", "ST", "ST"] },
    "4-3-3": { label: "4-3-3", slots: ["GK", "LB", "CB", "CB", "RB", "CM", "CM", "CM", "LW", "ST", "RW"] },
    "4-2-3-1": { label: "4-2-3-1", slots: ["GK", "LB", "CB", "CB", "RB", "CDM", "CDM", "LW", "CAM", "RW", "ST"] },
    "3-5-2": { label: "3-5-2", slots: ["GK", "CB", "CB", "CB", "LM", "CM", "CDM", "CM", "RM", "ST", "ST"] },
    "4-1-4-1": { label: "4-1-4-1", slots: ["GK", "LB", "CB", "CB", "RB", "CDM", "LM", "CM", "CM", "RM", "ST"] },
    "3-4-3": { label: "3-4-3", slots: ["GK", "CB", "CB", "CB", "LM", "CM", "CM", "RM", "LW", "ST", "RW"] },
    "5-3-2": { label: "5-3-2", slots: ["GK", "LWB", "CB", "CB", "CB", "RWB", "CM", "CM", "CM", "ST", "ST"] },
    "4-3-2-1": { label: "4-3-2-1", slots: ["GK", "LB", "CB", "CB", "RB", "CM", "CM", "CM", "CAM", "CAM", "ST"] },
}

const SLOT_POSITIONS = {
    "4-4-2": [{ x: 50, y: 92 }, { x: 15, y: 74 }, { x: 37, y: 78 }, { x: 63, y: 78 }, { x: 85, y: 74 }, { x: 15, y: 48 }, { x: 37, y: 52 }, { x: 63, y: 52 }, { x: 85, y: 48 }, { x: 35, y: 18 }, { x: 65, y: 18 }],
    "4-3-3": [{ x: 50, y: 92 }, { x: 15, y: 74 }, { x: 37, y: 78 }, { x: 63, y: 78 }, { x: 85, y: 74 }, { x: 30, y: 52 }, { x: 50, y: 48 }, { x: 70, y: 52 }, { x: 20, y: 20 }, { x: 50, y: 14 }, { x: 80, y: 20 }],
    "4-2-3-1": [{ x: 50, y: 92 }, { x: 15, y: 74 }, { x: 37, y: 78 }, { x: 63, y: 78 }, { x: 85, y: 74 }, { x: 37, y: 58 }, { x: 63, y: 58 }, { x: 18, y: 36 }, { x: 50, y: 32 }, { x: 82, y: 36 }, { x: 50, y: 14 }],
    "3-5-2": [{ x: 50, y: 92 }, { x: 25, y: 76 }, { x: 50, y: 78 }, { x: 75, y: 76 }, { x: 12, y: 48 }, { x: 35, y: 52 }, { x: 50, y: 58 }, { x: 65, y: 52 }, { x: 88, y: 48 }, { x: 35, y: 18 }, { x: 65, y: 18 }],
    "4-1-4-1": [{ x: 50, y: 92 }, { x: 15, y: 74 }, { x: 37, y: 78 }, { x: 63, y: 78 }, { x: 85, y: 74 }, { x: 50, y: 60 }, { x: 15, y: 42 }, { x: 37, y: 46 }, { x: 63, y: 46 }, { x: 85, y: 42 }, { x: 50, y: 14 }],
    "3-4-3": [{ x: 50, y: 92 }, { x: 25, y: 76 }, { x: 50, y: 78 }, { x: 75, y: 76 }, { x: 12, y: 48 }, { x: 37, y: 52 }, { x: 63, y: 52 }, { x: 88, y: 48 }, { x: 20, y: 20 }, { x: 50, y: 14 }, { x: 80, y: 20 }],
    "5-3-2": [{ x: 50, y: 92 }, { x: 12, y: 70 }, { x: 30, y: 78 }, { x: 50, y: 78 }, { x: 70, y: 78 }, { x: 88, y: 70 }, { x: 30, y: 48 }, { x: 50, y: 44 }, { x: 70, y: 48 }, { x: 35, y: 16 }, { x: 65, y: 16 }],
    "4-3-2-1": [{ x: 50, y: 92 }, { x: 15, y: 74 }, { x: 37, y: 78 }, { x: 63, y: 78 }, { x: 85, y: 74 }, { x: 30, y: 56 }, { x: 50, y: 52 }, { x: 70, y: 56 }, { x: 35, y: 32 }, { x: 65, y: 32 }, { x: 50, y: 14 }],
}

export default function FormationBuilder() {
    const navigate = useNavigate()
    const [players, setPlayers] = useState([])
    const [teams, setTeams] = useState([])
    const [club, setClub] = useState({ clubName: "Hub FC" })
    const [formation, setFormation] = useState("4-3-3")
    const [filterTeam, setFilterTeam] = useState("all")
    const [slots, setSlots] = useState(Array(11).fill(null))
    const [search, setSearch] = useState("")
    const [dragIdx, setDragIdx] = useState(null)
    const [selectedPlayer, setSelectedPlayer] = useState(null) // for tap-to-assign on mobile

    useEffect(() => {
        const u1 = subscribePlayers(setPlayers)
        const u2 = subscribeTeams(setTeams)
        const u3 = subscribeClubSettings(setClub)
        return () => { u1(); u2(); u3() }
    }, [])

    // Reset slots when formation changes
    useEffect(() => { setSlots(Array(11).fill(null)) }, [formation])

    const teamMap = useMemo(() => { const m = {}; teams.forEach(t => m[t.id] = t); return m }, [teams])

    const availablePlayers = useMemo(() => {
        const usedIds = new Set(slots.filter(Boolean))
        let list = players.filter(p => !usedIds.has(p.id))
        if (filterTeam !== "all") list = list.filter(p => (p.teamIds || (p.teamId ? [p.teamId] : [])).includes(filterTeam))
        if (search) list = list.filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
        return list.sort((a, b) => a.name.localeCompare(b.name))
    }, [players, slots, filterTeam, search])

    const formationData = FORMATIONS[formation]
    const slotPositions = SLOT_POSITIONS[formation]

    const assignPlayer = (slotIdx, playerId) => {
        setSlots(prev => {
            const next = [...prev]
            // Remove player from any other slot
            const existingIdx = next.indexOf(playerId)
            if (existingIdx !== -1) next[existingIdx] = null
            next[slotIdx] = playerId
            return next
        })
    }

    const removeFromSlot = (slotIdx) => {
        setSlots(prev => { const n = [...prev]; n[slotIdx] = null; return n })
    }

    const handleSlotClick = (i, sr) => {
        if (selectedPlayer) {
            // Tap-to-assign: place selected player in this slot
            assignPlayer(i, selectedPlayer)
            setSelectedPlayer(null)
        } else if (sr) {
            // No selection active: tap a filled slot to remove
            removeFromSlot(i)
        }
    }

    const getSlotRating = (slotIdx) => {
        const pid = slots[slotIdx]
        if (!pid) return null
        const player = players.find(p => p.id === pid)
        if (!player) return null
        const pos = formationData.slots[slotIdx]
        const cats = calcCategories(player)
        const gk = calcGkCategory(player)
        return { player, rating: Math.round(calcPositionRating(cats, gk, pos)), pos }
    }

    // Team average
    const teamStats = useMemo(() => {
        const filled = slots.map((pid, i) => pid ? getSlotRating(i) : null).filter(Boolean)
        if (filled.length === 0) return null
        const avg = filled.reduce((s, f) => s + f.rating, 0) / filled.length
        return { avg: Math.round(avg), filled: filled.length, total: 11 }
    }, [slots, players, formation])

    // Auto-fill
    const autoFill = () => {
        const pool = filterTeam === "all" ? [...players] : players.filter(p => (p.teamIds || (p.teamId ? [p.teamId] : [])).includes(filterTeam))
        const newSlots = Array(11).fill(null)
        const used = new Set()

        formationData.slots.forEach((pos, i) => {
            // Find best rated player for this position who isn't used
            let best = null, bestRating = -1
            pool.forEach(p => {
                if (used.has(p.id)) return
                const cats = calcCategories(p)
                const gk = calcGkCategory(p)
                const r = calcPositionRating(cats, gk, pos)
                if (r > bestRating) { bestRating = r; best = p }
            })
            if (best) { newSlots[i] = best.id; used.add(best.id) }
        })
        setSlots(newSlots)
    }

    const pc = club.primaryColor || "#2ecc40"

    return (
        <div style={{ minHeight: "100vh", background: "#0a0a1a", padding: "20px 12px", fontFamily: "system-ui" }}>
            <div style={{ maxWidth: 1100, margin: "0 auto" }}>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <button onClick={() => navigate(-1)} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "7px 14px", color: "rgba(255,255,255,0.5)", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>← Back</button>
                        <h1 style={{ color: "#fff", fontSize: 22, fontWeight: 800, margin: 0 }}>{club.clubName} FORMATION</h1>
                    </div>
                    {teamStats && (
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 11 }}>Team Avg:</span>
                            <span style={{ fontSize: 20, fontWeight: 800, color: getRatingColor(teamStats.avg) }}>{teamStats.avg}</span>
                            <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 10 }}>{teamStats.filled}/11</span>
                        </div>
                    )}
                </div>

                {/* Formation & Controls */}
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12, alignItems: "center" }}>
                    {Object.keys(FORMATIONS).map(f => (
                        <button key={f} onClick={() => setFormation(f)} style={{
                            background: formation === f ? `${pc}22` : "rgba(255,255,255,0.04)",
                            border: formation === f ? `1px solid ${pc}` : "1px solid rgba(255,255,255,0.08)",
                            borderRadius: 8, padding: "6px 14px", color: formation === f ? pc : "rgba(255,255,255,0.35)",
                            fontSize: 11, fontWeight: 700, cursor: "pointer"
                        }}>{f}</button>
                    ))}
                    <button onClick={autoFill} style={{ background: "rgba(52,152,219,0.1)", border: "1px solid rgba(52,152,219,0.2)", borderRadius: 8, padding: "6px 14px", color: "#3498db", fontSize: 11, fontWeight: 700, cursor: "pointer", marginLeft: 8 }}>Auto-Fill Best XI</button>
                    <button onClick={() => setSlots(Array(11).fill(null))} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: "6px 14px", color: "rgba(255,255,255,0.3)", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>Clear All</button>
                </div>

                <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>

                    {/* Pitch */}
                    <div style={{ flex: "1 1 420px" }}>
                        <div style={{
                            width: "100%", aspectRatio: "68/100", maxWidth: 480,
                            background: "linear-gradient(180deg,#1a5c2a 0%,#1e6b31 25%,#1a5c2a 50%,#1e6b31 75%,#1a5c2a 100%)",
                            borderRadius: 16, border: "2px solid rgba(255,255,255,0.15)",
                            position: "relative", overflow: "hidden"
                        }}>
                            {/* Pitch markings */}
                            <div style={{ position: "absolute", top: "50%", left: "5%", right: "5%", height: 1, background: "rgba(255,255,255,0.15)" }} />
                            <div style={{ position: "absolute", top: "50%", left: "50%", width: 60, height: 60, border: "1px solid rgba(255,255,255,0.1)", borderRadius: "50%", transform: "translate(-50%,-50%)" }} />
                            <div style={{ position: "absolute", top: 0, left: "25%", right: "25%", height: "16%", border: "1px solid rgba(255,255,255,0.1)", borderTop: "none", borderRadius: "0 0 6px 6px" }} />
                            <div style={{ position: "absolute", bottom: 0, left: "25%", right: "25%", height: "16%", border: "1px solid rgba(255,255,255,0.1)", borderBottom: "none", borderRadius: "6px 6px 0 0" }} />

                            {/* Slots */}                            {formationData.slots.map((pos, i) => {
                                const coord = slotPositions[i]
                                const sr = getSlotRating(i)
                                const isEmpty = !sr
                                const isTargeted = !!selectedPlayer  // waiting to be placed

                                return (
                                    <div key={i}
                                        onDragOver={e => { e.preventDefault(); e.currentTarget.style.transform = "translate(-50%,-50%) scale(1.15)" }}
                                        onDragLeave={e => { e.currentTarget.style.transform = "translate(-50%,-50%) scale(1)" }}
                                        onDrop={e => {
                                            e.preventDefault()
                                            e.currentTarget.style.transform = "translate(-50%,-50%) scale(1)"
                                            const pid = e.dataTransfer.getData("playerId")
                                            if (pid) { assignPlayer(i, pid); setSelectedPlayer(null) }
                                        }}
                                        onClick={() => handleSlotClick(i, sr)}
                                        style={{
                                            position: "absolute",
                                            left: `${coord.x}%`, top: `${coord.y}%`,
                                            transform: "translate(-50%,-50%)",
                                            width: isEmpty ? 44 : 52, minHeight: isEmpty ? 44 : 56,
                                            borderRadius: 10,
                                            background: isEmpty
                                                ? (isTargeted ? "rgba(255,170,0,0.1)" : "rgba(255,255,255,0.06)")
                                                : `${getRatingColor(sr.rating)}15`,
                                            border: isEmpty
                                                ? (isTargeted ? "2px dashed rgba(255,170,0,0.5)" : "2px dashed rgba(255,255,255,0.12)")
                                                : `2px solid ${getRatingColor(sr.rating)}55`,
                                            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                                            cursor: (isTargeted || sr) ? "pointer" : "default",
                                            transition: "all 0.2s",
                                            padding: "3px 2px",
                                        }}
                                        title={sr ? `${sr.player.name} — ${sr.rating} as ${pos} (tap/click to remove)` : isTargeted ? `Tap to place here` : `Drop or tap player for ${pos}`}
                                    >
                                        {sr ? (
                                            <>
                                                <div style={{ fontSize: 14, fontWeight: 800, color: getRatingColor(sr.rating), lineHeight: 1 }}>{sr.rating}</div>
                                                <div style={{ fontSize: 7, fontWeight: 700, color: "#fff", maxWidth: 48, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", textAlign: "center", lineHeight: 1.2, marginTop: 2 }}>{sr.player.name}</div>
                                                <div style={{ fontSize: 7, fontWeight: 700, color: "rgba(255,255,255,0.35)", marginTop: 1 }}>{pos}</div>
                                            </>
                                        ) : (
                                            <div style={{ fontSize: 9, fontWeight: 700, color: isTargeted ? "rgba(255,170,0,0.6)" : "rgba(255,255,255,0.2)" }}>{pos}</div>
                                        )}
                                    </div>
                                )
            })}
                        </div>
                    </div>

                    {/* Player List */}
                    <div style={{ flex: "1 1 280px", minWidth: 250 }}>
                        <div style={{ background: "linear-gradient(145deg,#1a1a2e,#16213e)", borderRadius: 16, border: "1px solid rgba(255,255,255,0.08)", overflow: "hidden" }}>
                            <div style={{ padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                                <input type="text" placeholder="Search players..." value={search} onChange={e => setSearch(e.target.value)}
                                    style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "7px 10px", color: "#fff", fontSize: 12, outline: "none", boxSizing: "border-box", marginBottom: 8 }} />
                                <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                                    <button onClick={() => setFilterTeam("all")} style={{
                                        background: filterTeam === "all" ? `${pc}22` : "rgba(255,255,255,0.04)",
                                        border: filterTeam === "all" ? `1px solid ${pc}` : "1px solid rgba(255,255,255,0.06)",
                                        borderRadius: 5, padding: "3px 8px", color: filterTeam === "all" ? pc : "rgba(255,255,255,0.25)",
                                        fontSize: 9, fontWeight: 700, cursor: "pointer"
                                    }}>All</button>
                                    {teams.map(t => (
                                        <button key={t.id} onClick={() => setFilterTeam(t.id)} style={{
                                            background: filterTeam === t.id ? `${pc}22` : "rgba(255,255,255,0.04)",
                                            border: filterTeam === t.id ? `1px solid ${pc}` : "1px solid rgba(255,255,255,0.06)",
                                            borderRadius: 5, padding: "3px 8px", color: filterTeam === t.id ? pc : "rgba(255,255,255,0.25)",
                                            fontSize: 9, fontWeight: 700, cursor: "pointer"
                                        }}>{t.name}</button>
                                    ))}
                                </div>
                            </div>

                            {/* Tap-to-assign banner */}
                            {selectedPlayer && (() => {
                                const sp = players.find(p => p.id === selectedPlayer)
                                return sp ? (
                                    <div style={{ padding: "8px 16px", background: "rgba(255,170,0,0.12)", borderBottom: "1px solid rgba(255,170,0,0.2)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                        <span style={{ color: "#ffaa00", fontSize: 11, fontWeight: 700 }}>{sp.name} — tap a slot to place</span>
                                        <button onClick={() => setSelectedPlayer(null)}
                                            style={{ background: "rgba(255,255,255,0.08)", border: "none", borderRadius: 6, padding: "4px 10px", color: "rgba(255,255,255,0.5)", fontSize: 10, fontWeight: 700, cursor: "pointer" }}>
                                            Cancel
                                        </button>
                                    </div>
                                ) : null
                            })()}
                            <div style={{ maxHeight: 500, overflow: "auto" }}>
                                {availablePlayers.map(p => {
                                    const ovr = Math.round(calcOverall(p))
                                    const isSelected = selectedPlayer === p.id
                                    return (
                                        <div key={p.id} draggable
                                            onDragStart={e => { e.dataTransfer.setData("playerId", p.id); setDragIdx(p.id); setSelectedPlayer(null) }}
                                            onDragEnd={() => setDragIdx(null)}
                                            onClick={() => setSelectedPlayer(prev => prev === p.id ? null : p.id)}
                                            style={{
                                                padding: "10px 16px", display: "flex", alignItems: "center", gap: 10,
                                                borderBottom: "1px solid rgba(255,255,255,0.02)",
                                                cursor: "pointer", opacity: dragIdx === p.id ? 0.4 : 1,
                                                transition: "background 0.15s, opacity 0.2s",
                                                background: isSelected ? "rgba(255,170,0,0.08)" : "transparent",
                                                borderLeft: isSelected ? "3px solid #ffaa00" : "3px solid transparent",
                                            }}
                                            onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = "rgba(255,255,255,0.03)" }}
                                            onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = "transparent" }}
                                        >
                                            <div style={{ width: 28, height: 28, borderRadius: 6, background: getOvrBg(ovr), display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: "#fff", flexShrink: 0 }}>{ovr}</div>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ color: isSelected ? "#ffaa00" : "#fff", fontSize: 12, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</div>
                                                <div style={{ display: "flex", gap: 3, marginTop: 1 }}>
                                                    {(p.positions || []).slice(0, 4).map(pos => (
                                                        <span key={pos} style={{ fontSize: 7, fontWeight: 700, color: pos === "GK" ? "#ffaa00" : "rgba(255,255,255,0.2)" }}>{pos}</span>
                                                    ))}
                                                </div>
                                            </div>
                                            {isSelected && <span style={{ fontSize: 9, color: "#ffaa00", fontWeight: 700 }}>→ TAP SLOT</span>}
                                        </div>
                                    )
                                })}
                                {availablePlayers.length === 0 && (
                                    <div style={{ padding: "20px 16px", textAlign: "center", color: "rgba(255,255,255,0.2)", fontSize: 11 }}>
                                        {slots.filter(Boolean).length === 11 ? "All positions filled!" : "No more players available"}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
}