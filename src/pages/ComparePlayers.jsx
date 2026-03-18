import { useState, useEffect, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { subscribePlayers, subscribeTeams, subscribeClubSettings } from '../firebase'
import {
    ATTRS, GK_ATTRS, CAT_ORDER, CAT_FORMULAS, CAT_LABELS,
    calcCategories, calcGkCategory, calcOverall, calcBestRating,
    calcAllPositionRatings, calcAge, getRatingColor, getOvrBg
} from '../utils'

const COMPARE_COLORS = ["#2ecc40", "#3498db", "#e67e22"]

function OverlaidRadar({ playersData, size = 260 }) {
    const cx = size / 2, cy = size / 2, r = size * 0.37, n = 6
    const step = (2 * Math.PI) / n, start = -Math.PI / 2
    const pt = (i, v) => {
        const a = start + i * step, d = (v / 100) * r
        return [cx + d * Math.cos(a), cy + d * Math.sin(a)]
    }

    return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            {[20, 40, 60, 80, 100].map(lv => (
                <polygon key={lv} points={Array.from({ length: n }, (_, i) => pt(i, lv).join(",")).join(" ")}
                    fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
            ))}
            {Array.from({ length: n }, (_, i) => {
                const [x, y] = pt(i, 100)
                return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
            })}
            {playersData.map((pd, pi) => {
                const vals = CAT_ORDER.map(c => pd.cats[c])
                const poly = vals.map((v, i) => pt(i, v).join(",")).join(" ")
                const color = COMPARE_COLORS[pi]
                return (
                    <g key={pi}>
                        <polygon points={poly} fill={`${color}20`} stroke={color} strokeWidth="2" />
                        {vals.map((v, i) => {
                            const [x, y] = pt(i, v)
                            return <circle key={i} cx={x} cy={y} r="3.5" fill={color} stroke="#fff" strokeWidth="1" />
                        })}
                    </g>
                )
            })}
            {Array.from({ length: n }, (_, i) => {
                const [x, y] = pt(i, 115)
                return <text key={i} x={x} y={y} textAnchor="middle" dominantBaseline="central" fontSize="10" fontWeight="700" fill="rgba(255,255,255,0.5)" fontFamily="system-ui">{CAT_LABELS[i]}</text>
            })}
        </svg>
    )
}

export default function ComparePlayers() {
    const navigate = useNavigate()
    const [searchParams, setSearchParams] = useSearchParams()
    const [players, setPlayers] = useState([])
    const [teams, setTeams] = useState([])
    const [club, setClub] = useState({ clubName: "Hub FC" })
    const [search, setSearch] = useState("")

    const selectedIds = (searchParams.get('ids') || '').split(',').filter(Boolean)

    useEffect(() => {
        const u1 = subscribePlayers(setPlayers)
        const u2 = subscribeTeams(setTeams)
        const u3 = subscribeClubSettings(setClub)
        return () => { u1(); u2(); u3() }
    }, [])

    const teamMap = useMemo(() => { const m = {}; teams.forEach(t => m[t.id] = t); return m }, [teams])

    const selected = useMemo(() =>
        selectedIds.map(id => players.find(p => p.id === id)).filter(Boolean)
        , [selectedIds, players])

    const enriched = useMemo(() =>
        selected.map(p => ({
            ...p,
            cats: calcCategories(p),
            ovr: calcOverall(p),
            best: (p.positions || []).length > 0 ? calcBestRating(p) : calcOverall(p),
            posRatings: calcAllPositionRatings(p),
            gk: calcGkCategory(p),
            age: calcAge(p.dob),
        }))
        , [selected])

    const togglePlayer = (id) => {
        let ids = [...selectedIds]
        if (ids.includes(id)) {
            ids = ids.filter(x => x !== id)
        } else {
            if (ids.length >= 3) return
            ids.push(id)
        }
        setSearchParams(ids.length > 0 ? { ids: ids.join(',') } : {})
    }

    const filteredPlayers = useMemo(() => {
        let list = [...players]
        if (search) list = list.filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
        return list.sort((a, b) => a.name.localeCompare(b.name))
    }, [players, search])

    const allAttrs = [...ATTRS, ...(enriched.some(p => (p.positions || []).includes("GK")) ? GK_ATTRS.map(a => ({ ...a, cat: "gk" })) : [])]

    // Find which player leads each attribute
    const getLeader = (key) => {
        if (enriched.length < 2) return -1
        let best = -1, bestVal = -1
        enriched.forEach((p, i) => {
            const v = p[key] || 0
            if (v > bestVal) { bestVal = v; best = i }
        })
        // Check for tie
        const tied = enriched.filter(p => (p[key] || 0) === bestVal).length
        return tied === enriched.length ? -1 : best
    }

    return (
        <div style={{ minHeight: "100vh", background: "#0a0a1a", padding: "20px 12px", fontFamily: "system-ui" }}>
            <div style={{ maxWidth: 1000, margin: "0 auto" }}>

                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                    <button onClick={() => navigate(-1)} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "7px 14px", color: "rgba(255,255,255,0.5)", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>← Back</button>
                    <h1 style={{ color: "#fff", fontSize: 22, fontWeight: 800, margin: 0, letterSpacing: 1 }}>COMPARE PLAYERS</h1>
                </div>

                <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>

                    {/* Player Selector */}
                    <div style={{ flex: "1 1 240px", minWidth: 220 }}>
                        <div style={{ background: "linear-gradient(145deg,#1a1a2e,#16213e)", borderRadius: 16, border: "1px solid rgba(255,255,255,0.08)", overflow: "hidden" }}>
                            <div style={{ padding: "14px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                                <div style={{ color: "#fff", fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Select 2-3 Players</div>
                                <input type="text" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)}
                                    style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "7px 10px", color: "#fff", fontSize: 12, outline: "none", boxSizing: "border-box" }} />
                            </div>
                            <div style={{ maxHeight: 400, overflow: "auto" }}>
                                {filteredPlayers.map(p => {
                                    const idx = selectedIds.indexOf(p.id)
                                    const sel = idx !== -1
                                    const color = sel ? COMPARE_COLORS[idx] : null
                                    return (
                                        <div key={p.id} onClick={() => togglePlayer(p.id)}
                                            style={{
                                                padding: "8px 16px", display: "flex", alignItems: "center", gap: 10,
                                                borderBottom: "1px solid rgba(255,255,255,0.02)", cursor: "pointer",
                                                background: sel ? `${color}08` : "transparent",
                                                borderLeft: sel ? `3px solid ${color}` : "3px solid transparent",
                                                opacity: !sel && selectedIds.length >= 3 ? 0.3 : 1,
                                            }}>
                                            <div style={{
                                                width: 22, height: 22, borderRadius: 6, flexShrink: 0,
                                                background: sel ? `${color}22` : "rgba(255,255,255,0.04)",
                                                border: sel ? `1px solid ${color}` : "1px solid rgba(255,255,255,0.08)",
                                                display: "flex", alignItems: "center", justifyContent: "center",
                                                color: sel ? color : "transparent", fontSize: 11, fontWeight: 800
                                            }}>{sel ? idx + 1 : ""}</div>
                                            <div style={{ flex: 1 }}>
                                                <span style={{ color: "#fff", fontSize: 12, fontWeight: 600 }}>{p.name}</span>
                                                <div style={{ display: "flex", gap: 3, marginTop: 1 }}>
                                                    {(p.positions || []).slice(0, 3).map(pos => (
                                                        <span key={pos} style={{ fontSize: 7, fontWeight: 700, color: "rgba(255,255,255,0.2)" }}>{pos}</span>
                                                    ))}
                                                </div>
                                            </div>
                                            <span style={{ fontSize: 12, fontWeight: 800, color: getRatingColor(calcOverall(p)) }}>{Math.round(calcOverall(p))}</span>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Comparison */}
                    <div style={{ flex: "2 1 500px" }}>
                        {enriched.length < 2 ? (
                            <div style={{ background: "linear-gradient(145deg,#1a1a2e,#16213e)", borderRadius: 16, border: "1px solid rgba(255,255,255,0.08)", padding: "60px 20px", textAlign: "center" }}>
                                <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 14 }}>Select at least 2 players to compare</p>
                                <p style={{ color: "rgba(255,255,255,0.15)", fontSize: 11, marginTop: 4 }}>Click players from the list on the left</p>
                            </div>
                        ) : (
                            <div style={{ background: "linear-gradient(145deg,#1a1a2e,#16213e)", borderRadius: 16, border: "1px solid rgba(255,255,255,0.08)", overflow: "hidden" }}>

                                {/* Player Headers */}
                                <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", gap: 12, flexWrap: "wrap" }}>
                                    {enriched.map((p, i) => (
                                        <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 14px", background: `${COMPARE_COLORS[i]}08`, border: `1px solid ${COMPARE_COLORS[i]}33`, borderRadius: 10, flex: "1 1 160px" }}>
                                            <div style={{ width: 40, height: 40, borderRadius: 10, background: getOvrBg(p.best), display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, fontWeight: 800, color: "#fff", flexShrink: 0 }}>{Math.round(p.best)}</div>
                                            <div>
                                                <div style={{ color: COMPARE_COLORS[i], fontSize: 14, fontWeight: 700 }}>{p.name}</div>
                                                <div style={{ display: "flex", gap: 4, marginTop: 2 }}>
                                                    {p.age !== null && <span style={{ color: "rgba(255,255,255,0.25)", fontSize: 9 }}>Age {p.age}</span>}
                                                    {(p.positions || []).slice(0, 3).map(pos => (
                                                        <span key={pos} style={{ fontSize: 8, fontWeight: 700, color: "rgba(255,255,255,0.2)" }}>{pos}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Overlaid Radar */}
                                <div style={{ display: "flex", justifyContent: "center", padding: "10px 0" }}>
                                    <OverlaidRadar playersData={enriched} size={280} />
                                </div>

                                {/* Category Comparison */}
                                <div style={{ padding: "0 20px 12px" }}>
                                    <div style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.2)", letterSpacing: 1.5, marginBottom: 8 }}>CATEGORY COMPARISON</div>
                                    {CAT_ORDER.map(c => {
                                        const vals = enriched.map(p => Math.round(p.cats[c]))
                                        const maxVal = Math.max(...vals)
                                        return (
                                            <div key={c} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0", borderBottom: "1px solid rgba(255,255,255,0.02)" }}>
                                                <span style={{ width: 40, color: "rgba(255,255,255,0.35)", fontSize: 10, fontWeight: 700, flexShrink: 0 }}>{CAT_FORMULAS[c].label}</span>
                                                <div style={{ flex: 1, display: "flex", gap: 4 }}>
                                                    {enriched.map((p, i) => (
                                                        <div key={i} style={{ flex: 1 }}>
                                                            <div style={{ height: 6, borderRadius: 3, background: "rgba(255,255,255,0.04)", overflow: "hidden" }}>
                                                                <div style={{ width: `${vals[i]}%`, height: "100%", borderRadius: 3, background: COMPARE_COLORS[i], opacity: vals[i] === maxVal ? 1 : 0.5 }} />
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                                {enriched.map((p, i) => (
                                                    <span key={i} style={{ width: 24, textAlign: "right", fontSize: 12, fontWeight: 800, color: vals[i] === maxVal && enriched.length > 1 ? COMPARE_COLORS[i] : "rgba(255,255,255,0.3)" }}>{vals[i]}</span>
                                                ))}
                                            </div>
                                        )
                                    })}
                                </div>

                                {/* Attribute-by-Attribute */}
                                <div style={{ padding: "12px 20px 16px" }}>
                                    <div style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.2)", letterSpacing: 1.5, marginBottom: 8 }}>ATTRIBUTE COMPARISON</div>
                                    {ATTRS.map(attr => {
                                        const vals = enriched.map(p => p[attr.key] || 0)
                                        const leader = getLeader(attr.key)
                                        return (
                                            <div key={attr.key} style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 0", borderBottom: "1px solid rgba(255,255,255,0.02)" }}>
                                                <span style={{ width: 100, color: "rgba(255,255,255,0.35)", fontSize: 10, flexShrink: 0 }}>{attr.label}</span>
                                                {enriched.map((p, i) => (
                                                    <span key={i} style={{
                                                        width: 30, textAlign: "center", fontSize: 12, fontWeight: 800,
                                                        color: leader === i ? COMPARE_COLORS[i] : "rgba(255,255,255,0.25)"
                                                    }}>{vals[i]}</span>
                                                ))}
                                                <div style={{ flex: 1, display: "flex", gap: 3 }}>
                                                    {enriched.map((p, i) => {
                                                        const diff = enriched.length === 2 ? vals[0] - vals[1] : 0
                                                        return (
                                                            <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.04)", overflow: "hidden" }}>
                                                                <div style={{ width: `${vals[i]}%`, height: "100%", borderRadius: 2, background: COMPARE_COLORS[i], opacity: leader === i ? 1 : 0.35 }} />
                                                            </div>
                                                        )
                                                    })}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}