import RadarChart from './RadarChart'
import MiniPitch from './MiniPitch'
import {
    calcCategories, calcOverall, calcBestRating, calcAllPositionRatings,
    calcGkCategory, getRatingColor, getOvrBg, CAT_ORDER, CAT_LABELS
} from '../utils'

export default function PlayerCard({ player, rank, isAdmin, onEdit, onDelete, onClick }) {
    const cats = calcCategories(player)
    const positions = player.positions || []
    const posRatings = calcAllPositionRatings(player)
    const bestRating = positions.length > 0 ? calcBestRating(player) : calcOverall(player)
    const hasGK = positions.includes("GK")
    const hasOutfield = positions.some(p => p !== "GK")
    const gkScore = hasGK ? calcGkCategory(player) : null
    const jerseyNumber = player.jerseyNumber || ""
    const gkJerseyNumber = player.gkJerseyNumber || ""
    const needsTwoJerseys = hasGK && hasOutfield

    return (
        <div onClick={() => onClick && onClick(player)}
            style={{
                background: "linear-gradient(145deg,#1a1a2e,#16213e,#0f3460)",
                borderRadius: 14, width: 270, overflow: "hidden",
                boxShadow: "0 6px 24px rgba(0,0,0,0.4)",
                border: "1px solid rgba(255,255,255,0.08)",
                display: "flex", flexDirection: "column", alignItems: "center",
                position: "relative", cursor: "pointer",
                transition: "transform 0.2s, box-shadow 0.2s",
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 12px 36px rgba(0,0,0,0.5)" }}
            onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 6px 24px rgba(0,0,0,0.4)" }}
        >
            {isAdmin && (
                <div style={{ position: "absolute", top: 8, right: 8, display: "flex", gap: 4, zIndex: 2 }}>
                    <button onClick={e => { e.stopPropagation(); onEdit(player) }} style={{
                        background: "rgba(255,255,255,0.1)", border: "none", borderRadius: 6,
                        width: 28, height: 28, cursor: "pointer", color: "#fff", fontSize: 13,
                        display: "flex", alignItems: "center", justifyContent: "center"
                    }}>✏️</button>
                    <button onClick={e => { e.stopPropagation(); onDelete(player.id) }} style={{
                        background: "rgba(255,60,60,0.15)", border: "none", borderRadius: 6,
                        width: 28, height: 28, cursor: "pointer", color: "#e74c3c", fontSize: 13,
                        display: "flex", alignItems: "center", justifyContent: "center"
                    }}>✕</button>
                </div>
            )}

            {/* Header */}
            <div style={{ width: "100%", padding: "14px 16px 8px", display: "flex", alignItems: "center", gap: 12, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <div style={{
                    width: 50, height: 50, borderRadius: 10, background: getOvrBg(bestRating),
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 21, fontWeight: 800, color: "#fff", fontFamily: "system-ui",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.3)", flexShrink: 0
                }}>{Math.round(bestRating)}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: "#fff", fontSize: 16, fontWeight: 700, fontFamily: "system-ui" }}>{player.name}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginTop: 2 }}>
                        <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 9, fontWeight: 600, letterSpacing: 1.5 }}>#{rank}</span>
                        {positions.map(p => (
                            <span key={p} style={{
                                background: p === "GK" ? "rgba(255,170,0,0.15)" : "rgba(46,204,64,0.15)",
                                color: p === "GK" ? "#ffaa00" : "#2ecc40",
                                fontSize: 9, fontWeight: 700, padding: "1px 6px", borderRadius: 4, letterSpacing: 0.8
                            }}>{p}</span>
                        ))}
                    </div>
                </div>
            </div>

            {/* Jersey Numbers */}
            {(jerseyNumber || gkJerseyNumber) && (
                <div style={{ width: "100%", padding: "4px 16px 0", display: "flex", gap: 10, flexWrap: "wrap" }}>
                    {needsTwoJerseys ? (
                        <>
                            {jerseyNumber && (
                                <span style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", fontFamily: "system-ui" }}>
                                    Jersey <span style={{ fontWeight: 700, color: "rgba(255,255,255,0.6)" }}>#{jerseyNumber}</span>
                                </span>
                            )}
                            {gkJerseyNumber && (
                                <span style={{ fontSize: 9, color: "rgba(255,170,0,0.5)", fontFamily: "system-ui" }}>
                                    Jersey <span style={{ fontWeight: 700, color: "rgba(255,170,0,0.7)" }}>#{gkJerseyNumber}</span> (GK)
                                </span>
                            )}
                        </>
                    ) : (
                        <span style={{ fontSize: 9, color: hasGK ? "rgba(255,170,0,0.5)" : "rgba(255,255,255,0.4)", fontFamily: "system-ui" }}>
                            Jersey <span style={{ fontWeight: 700, color: hasGK ? "rgba(255,170,0,0.7)" : "rgba(255,255,255,0.6)" }}>#{jerseyNumber || gkJerseyNumber}</span>
                        </span>
                    )}
                </div>
            )}

            {/* Mini Pitch + Radar side by side */}
            <div style={{ display: "flex", gap: 6, padding: "8px 10px 0", alignItems: "center", width: "100%" }}>
                <MiniPitch positions={positions} posRatings={posRatings} size="card" />
                <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
                    <RadarChart cats={cats} size={155} />
                </div>
            </div>

            {/* Category Scores */}
            <div style={{ width: "100%", padding: "0 14px 4px", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "4px 8px" }}>
                {CAT_ORDER.map((c, i) => (
                    <div key={c} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                        <span style={{ fontSize: 14, fontWeight: 800, color: getRatingColor(cats[c]), fontFamily: "system-ui", minWidth: 22 }}>{Math.round(cats[c])}</span>
                        <span style={{ fontSize: 8, fontWeight: 600, color: "rgba(255,255,255,0.4)", fontFamily: "system-ui", letterSpacing: .8 }}>{CAT_LABELS[i]}</span>
                    </div>
                ))}
            </div>

            {/* GK Category */}
            {hasGK && gkScore !== null && (
                <div style={{ width: "100%", padding: "2px 14px 4px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                        <span style={{ fontSize: 14, fontWeight: 800, color: getRatingColor(gkScore), fontFamily: "system-ui" }}>{Math.round(gkScore)}</span>
                        <span style={{ fontSize: 8, fontWeight: 600, color: "rgba(255,170,0,0.6)", fontFamily: "system-ui", letterSpacing: .8 }}>GK</span>
                    </div>
                </div>
            )}

            {/* Position Ratings */}
            {posRatings.length > 0 && (
                <div style={{ width: "100%", padding: "4px 14px 12px", display: "flex", gap: 6, flexWrap: "wrap", borderTop: "1px solid rgba(255,255,255,0.04)", marginTop: 4, paddingTop: 8 }}>
                    {posRatings.map(pr => (
                        <div key={pr.pos} style={{
                            background: "rgba(255,255,255,0.04)", borderRadius: 6,
                            padding: "4px 8px", display: "flex", alignItems: "center", gap: 4
                        }}>
                            <span style={{ fontSize: 13, fontWeight: 800, color: getRatingColor(pr.rating), fontFamily: "system-ui" }}>{Math.round(pr.rating)}</span>
                            <span style={{ fontSize: 8, fontWeight: 700, color: pr.pos === "GK" ? "rgba(255,170,0,0.6)" : "rgba(255,255,255,0.4)", letterSpacing: .5 }}>{pr.pos}</span>
                        </div>
                    ))}
                </div>
            )}
            {posRatings.length === 0 && <div style={{ height: 12 }} />}
        </div>
    )
}