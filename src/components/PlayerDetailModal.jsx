import RadarChart from './RadarChart'
import MiniPitch from './MiniPitch'
import ProgressChart from './ProgressChart'
import PlayerMatchStats from './PlayerMatchStats'
import {
    ATTRS, GK_ATTRS, CAT_ORDER, CAT_FORMULAS, CAT_LABELS,
    calcCategories, calcGkCategory, calcBestRating, calcOverall,
    calcAllPositionRatings, calcAge, getRatingColor, getOvrBg
} from '../utils'

export default function PlayerDetailModal({ player, rank, onClose, teamNames }) {
    const cats = calcCategories(player)
    const positions = player.positions || []
    const posRatings = calcAllPositionRatings(player)
    const bestRating = positions.length > 0 ? calcBestRating(player) : calcOverall(player)
    const hasGK = positions.includes("GK")
    const hasOutfield = positions.some(p => p !== "GK")
    const gkScore = hasGK ? calcGkCategory(player) : null
    const needsTwoJerseys = hasGK && hasOutfield
    const jerseyNumber = player.jerseyNumber || ""
    const gkJerseyNumber = player.gkJerseyNumber || ""
    const age = calcAge(player.dob)

    const groups = { tec: [], pas: [], att: [], phy: [], def: [], ment: [] }
    ATTRS.forEach(a => groups[a.cat].push(a))

    return (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999, padding: 16 }} onClick={onClose}>
            <div onClick={e => e.stopPropagation()} style={{ background: "linear-gradient(145deg,#1a1a2e 0%,#16213e 40%,#0f3460 100%)", borderRadius: 20, width: "100%", maxWidth: 640, maxHeight: "92vh", overflow: "auto", boxShadow: "0 24px 80px rgba(0,0,0,0.7)", border: "1px solid rgba(255,255,255,0.1)" }}>

                {/* Header */}
                <div style={{ padding: "24px 28px 20px", background: "linear-gradient(180deg, rgba(46,204,64,0.08) 0%, transparent 100%)", borderBottom: "1px solid rgba(255,255,255,0.06)", position: "relative" }}>
                    <button onClick={onClose} style={{ position: "absolute", top: 16, right: 16, background: "rgba(255,255,255,0.08)", border: "none", borderRadius: 8, width: 32, height: 32, cursor: "pointer", color: "rgba(255,255,255,0.5)", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>

                    <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
                        <div style={{ width: 72, height: 72, borderRadius: 14, background: getOvrBg(bestRating), display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, fontWeight: 800, color: "#fff", fontFamily: "system-ui", boxShadow: "0 4px 16px rgba(0,0,0,0.4)", flexShrink: 0 }}>{Math.round(bestRating)}</div>
                        <div style={{ flex: 1 }}>
                            <div style={{ color: "#fff", fontSize: 26, fontWeight: 800, fontFamily: "system-ui" }}>{player.name}</div>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4, flexWrap: "wrap" }}>
                                <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 11, fontWeight: 600, letterSpacing: 1.5 }}>#{rank}</span>
                                {age !== null && (
                                    <span style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.5)", fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 6 }}>
                                        Age {age}
                                    </span>
                                )}
                                {(teamNames || []).map((tn, i) => (
                                    <span key={i} style={{ background: "rgba(52,152,219,0.12)", color: "#3498db", fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 6, letterSpacing: 0.5 }}>{tn}</span>
                                ))}
                                {positions.map(p => (
                                    <span key={p} style={{ background: p === "GK" ? "rgba(255,170,0,0.15)" : "rgba(46,204,64,0.15)", color: p === "GK" ? "#ffaa00" : "#2ecc40", fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 6, letterSpacing: 1 }}>{p}</span>
                                ))}
                            </div>
                            {(jerseyNumber || gkJerseyNumber) && (
                                <div style={{ display: "flex", gap: 12, marginTop: 6, flexWrap: "wrap" }}>
                                    {needsTwoJerseys ? (
                                        <>
                                            {jerseyNumber && (
                                                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.45)" }}>
                                                    Jersey <span style={{ fontWeight: 700, color: "rgba(255,255,255,0.7)" }}>#{jerseyNumber}</span>
                                                </span>
                                            )}
                                            {gkJerseyNumber && (
                                                <span style={{ fontSize: 12, color: "rgba(255,170,0,0.6)" }}>
                                                    Jersey <span style={{ fontWeight: 700, color: "rgba(255,170,0,0.8)" }}>#{gkJerseyNumber}</span> (GK)
                                                </span>
                                            )}
                                        </>
                                    ) : (
                                        <span style={{ fontSize: 12, color: hasGK ? "rgba(255,170,0,0.6)" : "rgba(255,255,255,0.45)" }}>
                                            Jersey <span style={{ fontWeight: 700, color: hasGK ? "rgba(255,170,0,0.8)" : "rgba(255,255,255,0.7)" }}>#{jerseyNumber || gkJerseyNumber}</span>
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Position Ratings */}
                {posRatings.length > 0 && (
                    <div style={{ padding: "14px 28px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                        <span style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.25)", letterSpacing: 1.5 }}>POSITION RATINGS</span>
                        {posRatings.map(pr => (
                            <div key={pr.pos} style={{ background: "rgba(255,255,255,0.04)", borderRadius: 10, padding: "8px 14px", display: "flex", alignItems: "center", gap: 6 }}>
                                <span style={{ fontSize: 20, fontWeight: 800, color: getRatingColor(pr.rating), fontFamily: "system-ui" }}>{Math.round(pr.rating)}</span>
                                <span style={{ fontSize: 10, fontWeight: 700, color: pr.pos === "GK" ? "rgba(255,170,0,0.7)" : "rgba(255,255,255,0.5)", letterSpacing: 0.5 }}>{pr.pos}</span>
                            </div>
                        ))}
                    </div>
                )}

                {/* Radar + Category Stats (big, like before) */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flexWrap: "wrap", padding: "12px 20px 0", gap: 8 }}>
                    <div style={{ flexShrink: 0 }}>
                        <RadarChart cats={cats} size={220} />
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 14px", padding: "8px 0" }}>
                        {CAT_ORDER.map((c, i) => (
                            <div key={c} style={{ background: "rgba(255,255,255,0.03)", borderRadius: 10, padding: "10px 14px", display: "flex", alignItems: "center", gap: 10 }}>
                                <span style={{ fontSize: 22, fontWeight: 800, color: getRatingColor(cats[c]), fontFamily: "system-ui", minWidth: 30 }}>{Math.round(cats[c])}</span>
                                <div>
                                    <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.5)", letterSpacing: 1 }}>{CAT_FORMULAS[c].full.toUpperCase()}</div>
                                    <div style={{ fontSize: 8, color: "rgba(255,255,255,0.25)", marginTop: 1 }}>{CAT_FORMULAS[c].keys.length} attributes</div>
                                </div>
                            </div>
                        ))}
                        {hasGK && gkScore !== null && (
                            <div style={{ background: "rgba(255,170,0,0.06)", borderRadius: 10, padding: "10px 14px", display: "flex", alignItems: "center", gap: 10, gridColumn: "1 / -1" }}>
                                <span style={{ fontSize: 22, fontWeight: 800, color: getRatingColor(gkScore), fontFamily: "system-ui", minWidth: 30 }}>{Math.round(gkScore)}</span>
                                <div>
                                    <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,170,0,0.7)", letterSpacing: 1 }}>GOALKEEPING</div>
                                    <div style={{ fontSize: 8, color: "rgba(255,255,255,0.25)", marginTop: 1 }}>5 attributes</div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Mini Pitch — small, between stats and attributes */}
                {positions.length > 0 && (
                    <div style={{ padding: "12px 28px 8px", borderTop: "1px solid rgba(255,255,255,0.04)", marginTop: 8, display: "flex", alignItems: "center", gap: 16 }}>
                        <MiniPitch positions={positions} posRatings={posRatings} size="card" />
                        <div>
                            <div style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.25)", letterSpacing: 1.5, marginBottom: 6 }}>PITCH MAP</div>
                            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                                {positions.map(p => {
                                    const pr = posRatings.find(r => r.pos === p)
                                    const rating = pr ? pr.rating : 50
                                    return (
                                        <div key={p} style={{
                                            display: "flex", alignItems: "center", gap: 4,
                                            background: "rgba(255,255,255,0.03)", borderRadius: 6, padding: "4px 8px"
                                        }}>
                                            <span style={{
                                                width: 8, height: 8, borderRadius: "50%", flexShrink: 0,
                                                background: p === "GK" ? "#ffaa00" : getRatingColor(rating),
                                                boxShadow: `0 0 4px ${p === "GK" ? "rgba(255,170,0,0.4)" : getRatingColor(rating) + "44"}`
                                            }} />
                                            <span style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.5)", letterSpacing: 0.5 }}>{p}</span>
                                            <span style={{ fontSize: 11, fontWeight: 800, color: p === "GK" ? "#ffaa00" : getRatingColor(rating) }}>{Math.round(rating)}</span>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                )}

                {/* Progress Chart */}
                <div style={{ padding: "16px 24px 8px", borderTop: "1px solid rgba(255,255,255,0.04)" }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.3)", letterSpacing: 2, marginBottom: 10 }}>PROGRESS HISTORY</div>
                    <ProgressChart playerId={player.id} />
                </div>

                {/* Match Stats */}
                <div style={{ padding: "16px 24px 8px", borderTop: "1px solid rgba(255,255,255,0.04)" }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.3)", letterSpacing: 2, marginBottom: 10 }}>MATCH STATS</div>
                    <PlayerMatchStats playerId={player.id} />
                </div>

                {/* All Attributes by Category */}
                <div style={{ padding: "16px 24px 24px" }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.3)", letterSpacing: 2, marginBottom: 12 }}>ALL ATTRIBUTES</div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 14 }}>
                        {CAT_ORDER.map(c => (
                            <div key={c} style={{ background: "rgba(255,255,255,0.02)", borderRadius: 12, padding: "14px 16px", border: "1px solid rgba(255,255,255,0.04)" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                                    <span style={{ fontSize: 9, fontWeight: 700, color: getRatingColor(cats[c]), letterSpacing: 1.5, background: "rgba(255,255,255,0.06)", borderRadius: 4, padding: "3px 8px" }}>{CAT_FORMULAS[c].full.toUpperCase()}</span>
                                    <span style={{ fontSize: 14, fontWeight: 800, color: getRatingColor(cats[c]) }}>{Math.round(cats[c])}</span>
                                </div>
                                {groups[c].map(attr => {
                                    const val = player[attr.key] || 0
                                    return (
                                        <div key={attr.key} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 0", borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                                            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", flex: 1 }}>{attr.label}</span>
                                            <div style={{ width: 80, height: 6, borderRadius: 3, background: "rgba(255,255,255,0.06)", overflow: "hidden", flexShrink: 0 }}>
                                                <div style={{ width: `${val}%`, height: "100%", borderRadius: 3, background: getRatingColor(val) }} />
                                            </div>
                                            <span style={{ fontSize: 14, fontWeight: 800, color: getRatingColor(val), minWidth: 24, textAlign: "right" }}>{val}</span>
                                        </div>
                                    )
                                })}
                            </div>
                        ))}
                        {hasGK && (
                            <div style={{ background: "rgba(255,170,0,0.03)", borderRadius: 12, padding: "14px 16px", border: "1px solid rgba(255,170,0,0.08)" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                                    <span style={{ fontSize: 9, fontWeight: 700, color: "#ffaa00", letterSpacing: 1.5, background: "rgba(255,170,0,0.1)", borderRadius: 4, padding: "3px 8px" }}>GOALKEEPING</span>
                                    <span style={{ fontSize: 14, fontWeight: 800, color: getRatingColor(gkScore) }}>{Math.round(gkScore)}</span>
                                </div>
                                {GK_ATTRS.map(attr => {
                                    const val = player[attr.key] || 0
                                    return (
                                        <div key={attr.key} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 0", borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                                            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", flex: 1 }}>{attr.label}</span>
                                            <div style={{ width: 80, height: 6, borderRadius: 3, background: "rgba(255,255,255,0.06)", overflow: "hidden", flexShrink: 0 }}>
                                                <div style={{ width: `${val}%`, height: "100%", borderRadius: 3, background: getRatingColor(val) }} />
                                            </div>
                                            <span style={{ fontSize: 14, fontWeight: 800, color: getRatingColor(val), minWidth: 24, textAlign: "right" }}>{val}</span>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}