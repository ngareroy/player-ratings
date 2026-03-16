import { useState, useEffect, useMemo } from 'react'
import { subscribePlayerMatchStats, subscribeMatches } from '../firebase'
import { getRatingColor } from '../utils'

export default function PlayerMatchStats({ playerId }) {
    const [stats, setStats] = useState([])
    const [matches, setMatches] = useState([])
    const [loading, setLoading] = useState(true)
    const [showAll, setShowAll] = useState(false)

    useEffect(() => {
        if (!playerId) return
        let loaded = 0
        const check = () => { loaded++; if (loaded >= 2) setLoading(false) }
        const u1 = subscribePlayerMatchStats(playerId, (data) => { setStats(data); check() })
        const u2 = subscribeMatches((data) => { setMatches(data); check() })
        return () => { u1(); u2() }
    }, [playerId])

    const matchMap = useMemo(() => {
        const m = {}
        matches.forEach(mt => m[mt.id] = mt)
        return m
    }, [matches])

    // Enrich stats with match data and sort by date
    const enriched = useMemo(() => {
        return stats
            .map(s => ({ ...s, match: matchMap[s.matchId] }))
            .filter(s => s.match)
            .sort((a, b) => new Date(b.match.date) - new Date(a.match.date))
    }, [stats, matchMap])

    // Career totals
    const totals = useMemo(() => {
        const t = { apps: 0, goals: 0, assists: 0, saves: 0, cleanSheets: 0, yellows: 0, reds: 0, motm: 0, totalRating: 0, ratedGames: 0, totalMinutes: 0 }
        enriched.forEach(s => {
            t.apps++
            t.goals += s.goals || 0
            t.assists += s.assists || 0
            t.saves += s.saves || 0
            if (s.cleanSheet) t.cleanSheets++
            t.yellows += s.yellowCards || 0
            if (s.redCard) t.reds++
            if (s.match?.motm === playerId) t.motm++
            if (s.rating) { t.totalRating += s.rating; t.ratedGames++ }
            t.totalMinutes += s.minutes || 0
        })
        t.avgRating = t.ratedGames > 0 ? (t.totalRating / t.ratedGames) : 0
        return t
    }, [enriched, playerId])

    // Recent form (last 5)
    const recentForm = useMemo(() => {
        return enriched.slice(0, 5).map(s => {
            const m = s.match
            if (m.goalsFor === null || m.goalsAgainst === null) return { result: "—", color: "rgba(255,255,255,0.15)" }
            if (m.goalsFor > m.goalsAgainst) return { result: "W", color: "#2ecc40" }
            if (m.goalsFor < m.goalsAgainst) return { result: "L", color: "#e74c3c" }
            return { result: "D", color: "#e8b930" }
        })
    }, [enriched])

    if (loading) {
        return <div style={{ padding: 20, textAlign: "center", color: "rgba(255,255,255,0.3)", fontSize: 12 }}>Loading match stats...</div>
    }

    if (enriched.length === 0) {
        return (
            <div style={{ padding: "20px 0", textAlign: "center" }}>
                <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 12, margin: "0 0 4px" }}>No match appearances yet</p>
                <p style={{ color: "rgba(255,255,255,0.2)", fontSize: 10, margin: 0 }}>Stats will appear once this player is added to a match squad</p>
            </div>
        )
    }

    const displayMatches = showAll ? enriched : enriched.slice(0, 5)

    return (
        <div>
            {/* Career Stats Grid */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
                {[
                    { label: "Apps", value: totals.apps, color: "#fff" },
                    { label: "Goals", value: totals.goals, color: "#2ecc40" },
                    { label: "Assists", value: totals.assists, color: "#3498db" },
                    { label: "Avg Rating", value: totals.avgRating ? totals.avgRating.toFixed(1) : "—", color: totals.avgRating ? getRatingColor(totals.avgRating * 10) : "rgba(255,255,255,0.3)" },
                    { label: "MOTM", value: totals.motm, color: "#ffaa00" },
                    { label: "Minutes", value: totals.totalMinutes, color: "rgba(255,255,255,0.6)" },
                ].map(s => (
                    <div key={s.label} style={{ background: "rgba(255,255,255,0.03)", borderRadius: 8, padding: "8px 12px", minWidth: 70, textAlign: "center" }}>
                        <div style={{ fontSize: 18, fontWeight: 800, color: s.color, fontFamily: "system-ui" }}>{s.value}</div>
                        <div style={{ fontSize: 8, fontWeight: 700, color: "rgba(255,255,255,0.25)", letterSpacing: 1, marginTop: 2 }}>{s.label.toUpperCase()}</div>
                    </div>
                ))}
            </div>

            {/* Extra stats row */}
            {(totals.saves > 0 || totals.cleanSheets > 0 || totals.yellows > 0 || totals.reds > 0) && (
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
                    {totals.saves > 0 && (
                        <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 8, padding: "6px 10px", display: "flex", alignItems: "center", gap: 5 }}>
                            <span style={{ fontSize: 13, fontWeight: 800, color: "#1abc9c" }}>{totals.saves}</span>
                            <span style={{ fontSize: 8, color: "rgba(255,255,255,0.25)", fontWeight: 700, letterSpacing: 0.5 }}>SAVES</span>
                        </div>
                    )}
                    {totals.cleanSheets > 0 && (
                        <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 8, padding: "6px 10px", display: "flex", alignItems: "center", gap: 5 }}>
                            <span style={{ fontSize: 13, fontWeight: 800, color: "#2ecc40" }}>{totals.cleanSheets}</span>
                            <span style={{ fontSize: 8, color: "rgba(255,255,255,0.25)", fontWeight: 700, letterSpacing: 0.5 }}>CLEAN SHEETS</span>
                        </div>
                    )}
                    {totals.yellows > 0 && (
                        <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 8, padding: "6px 10px", display: "flex", alignItems: "center", gap: 5 }}>
                            <span style={{ fontSize: 13, fontWeight: 800, color: "#e8b930" }}>{totals.yellows}</span>
                            <span style={{ fontSize: 8, color: "rgba(255,255,255,0.25)", fontWeight: 700, letterSpacing: 0.5 }}>YELLOWS</span>
                        </div>
                    )}
                    {totals.reds > 0 && (
                        <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 8, padding: "6px 10px", display: "flex", alignItems: "center", gap: 5 }}>
                            <span style={{ fontSize: 13, fontWeight: 800, color: "#e74c3c" }}>{totals.reds}</span>
                            <span style={{ fontSize: 8, color: "rgba(255,255,255,0.25)", fontWeight: 700, letterSpacing: 0.5 }}>REDS</span>
                        </div>
                    )}
                </div>
            )}

            {/* Recent Form */}
            {recentForm.length > 0 && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                    <span style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.2)", letterSpacing: 1 }}>FORM:</span>
                    {recentForm.map((f, i) => (
                        <div key={i} style={{
                            width: 24, height: 24, borderRadius: 6,
                            background: `${f.color}22`, border: `1px solid ${f.color}44`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 10, fontWeight: 800, color: f.color
                        }}>{f.result}</div>
                    ))}
                </div>
            )}

            {/* Match-by-Match List */}
            <div style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.2)", letterSpacing: 1.5, marginBottom: 8 }}>MATCH HISTORY</div>
            <div style={{ maxHeight: showAll ? "none" : "auto" }}>
                {displayMatches.map(s => {
                    const m = s.match
                    const hasScore = m.goalsFor !== null && m.goalsAgainst !== null
                    const result = hasScore ? (m.goalsFor > m.goalsAgainst ? "W" : m.goalsFor < m.goalsAgainst ? "L" : "D") : null
                    const resultColor = { W: "#2ecc40", D: "#e8b930", L: "#e74c3c" }
                    const isMotm = m.motm === playerId

                    return (
                        <div key={s.matchId} style={{
                            display: "flex", alignItems: "center", gap: 10, padding: "8px 0",
                            borderBottom: "1px solid rgba(255,255,255,0.03)"
                        }}>
                            {/* Result */}
                            <div style={{
                                width: 28, height: 28, borderRadius: 6, flexShrink: 0,
                                background: result ? `${resultColor[result]}15` : "rgba(255,255,255,0.03)",
                                border: result ? `1px solid ${resultColor[result]}33` : "1px solid rgba(255,255,255,0.06)",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontSize: 10, fontWeight: 800, color: result ? resultColor[result] : "rgba(255,255,255,0.15)"
                            }}>{result || "—"}</div>

                            {/* Match Info */}
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                    <span style={{ color: "#fff", fontSize: 12, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                        {hasScore ? `${m.goalsFor}–${m.goalsAgainst}` : "vs"} {m.opponent}
                                    </span>
                                    {isMotm && <span style={{ fontSize: 10 }}>⭐</span>}
                                </div>
                                <div style={{ color: "rgba(255,255,255,0.2)", fontSize: 9, marginTop: 1 }}>
                                    {new Date(m.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} · {m.venue} · {m.matchType}
                                </div>
                            </div>

                            {/* Player Stats for this match */}
                            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "flex-end" }}>
                                {s.minutes && (
                                    <span style={{ fontSize: 9, color: "rgba(255,255,255,0.3)" }}>{s.minutes}'</span>
                                )}
                                {(s.goals || 0) > 0 && (
                                    <span style={{ fontSize: 10, fontWeight: 800, color: "#2ecc40" }}>
                                        {s.goals > 1 ? `${s.goals}G` : "G"}
                                    </span>
                                )}
                                {(s.assists || 0) > 0 && (
                                    <span style={{ fontSize: 10, fontWeight: 800, color: "#3498db" }}>
                                        {s.assists > 1 ? `${s.assists}A` : "A"}
                                    </span>
                                )}
                                {(s.saves || 0) > 0 && (
                                    <span style={{ fontSize: 10, fontWeight: 800, color: "#1abc9c" }}>{s.saves}S</span>
                                )}
                                {s.cleanSheet && (
                                    <span style={{ fontSize: 8, fontWeight: 700, color: "#2ecc40", background: "rgba(46,204,64,0.1)", padding: "1px 4px", borderRadius: 3 }}>CS</span>
                                )}
                                {(s.yellowCards || 0) > 0 && (
                                    <div style={{ width: 10, height: 14, borderRadius: 2, background: "#e8b930" }} />
                                )}
                                {s.redCard && (
                                    <div style={{ width: 10, height: 14, borderRadius: 2, background: "#e74c3c" }} />
                                )}
                                {s.rating && (
                                    <span style={{ fontSize: 12, fontWeight: 800, color: getRatingColor(s.rating * 10), minWidth: 18, textAlign: "right" }}>{s.rating}</span>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Show More */}
            {enriched.length > 5 && (
                <button onClick={() => setShowAll(!showAll)}
                    style={{
                        width: "100%", marginTop: 8, padding: "8px", background: "rgba(255,255,255,0.03)",
                        border: "1px solid rgba(255,255,255,0.06)", borderRadius: 8,
                        color: "rgba(255,255,255,0.35)", fontSize: 11, fontWeight: 600,
                        cursor: "pointer", textAlign: "center"
                    }}>
                    {showAll ? "Show less" : `Show all ${enriched.length} matches`}
                </button>
            )}
        </div>
    )
}