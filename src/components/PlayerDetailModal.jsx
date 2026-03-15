import RadarChart from './RadarChart'
import {
    ATTRS, CAT_ORDER, CAT_FORMULAS, CAT_LABELS,
    calcCategories, calcOverall, getRatingColor, getOvrBg
} from '../utils'

export default function PlayerDetailModal({ player, rank, onClose }) {
    const cats = calcCategories(player)
    const ovr = calcOverall(player)
    const groups = { tec: [], pas: [], att: [], phy: [], def: [], men: [] }
    ATTRS.forEach(a => groups[a.cat].push(a))

    return (
        <div style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)",
            backdropFilter: "blur(8px)", display: "flex", alignItems: "center",
            justifyContent: "center", zIndex: 999, padding: 16
        }} onClick={onClose}>
            <div onClick={e => e.stopPropagation()} style={{
                background: "linear-gradient(145deg,#1a1a2e 0%,#16213e 40%,#0f3460 100%)",
                borderRadius: 20, width: "100%", maxWidth: 600, maxHeight: "92vh",
                overflow: "auto", boxShadow: "0 24px 80px rgba(0,0,0,0.7)",
                border: "1px solid rgba(255,255,255,0.1)"
            }}>
                {/* Header */}
                <div style={{
                    padding: "24px 28px 20px",
                    background: "linear-gradient(180deg, rgba(46,204,64,0.08) 0%, transparent 100%)",
                    borderBottom: "1px solid rgba(255,255,255,0.06)",
                    display: "flex", alignItems: "center", gap: 18, position: "relative"
                }}>
                    <button onClick={onClose} style={{
                        position: "absolute", top: 16, right: 16,
                        background: "rgba(255,255,255,0.08)", border: "none",
                        borderRadius: 8, width: 32, height: 32, cursor: "pointer",
                        color: "rgba(255,255,255,0.5)", fontSize: 16,
                        display: "flex", alignItems: "center", justifyContent: "center"
                    }}>✕</button>

                    <div style={{
                        width: 72, height: 72, borderRadius: 14,
                        background: getOvrBg(ovr),
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 30, fontWeight: 800, color: "#fff", fontFamily: "system-ui",
                        boxShadow: "0 4px 16px rgba(0,0,0,0.4)", flexShrink: 0
                    }}>{Math.round(ovr)}</div>

                    <div style={{ flex: 1 }}>
                        <div style={{
                            color: "#fff", fontSize: 26, fontWeight: 800,
                            fontFamily: "system-ui", letterSpacing: 0.5
                        }}>{player.name}</div>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 4, flexWrap: "wrap" }}>
                            <span style={{
                                color: "rgba(255,255,255,0.35)", fontSize: 12,
                                fontWeight: 600, fontFamily: "system-ui", letterSpacing: 1.5
                            }}>#{rank} OVERALL</span>
                            {player.playingPosition && (
                                <span style={{
                                    background: "rgba(46,204,64,0.15)", color: "#2ecc40",
                                    fontSize: 11, fontWeight: 700, padding: "3px 10px",
                                    borderRadius: 6, letterSpacing: 1, fontFamily: "system-ui"
                                }}>{player.playingPosition}</span>
                            )}
                            {player.jerseyNumber && (
                                <span style={{
                                    background: "rgba(255,255,255,0.06)",
                                    color: "rgba(255,255,255,0.6)",
                                    fontSize: 11, fontWeight: 700, padding: "3px 10px",
                                    borderRadius: 6, fontFamily: "system-ui"
                                }}>#{player.jerseyNumber}</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Radar + Categories */}
                <div style={{
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexWrap: "wrap", padding: "12px 20px 0", gap: 8
                }}>
                    <div style={{ flexShrink: 0 }}>
                        <RadarChart cats={cats} size={220} />
                    </div>
                    <div style={{
                        display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 16px",
                        padding: "8px 0"
                    }}>
                        {CAT_ORDER.map((c, i) => (
                            <div key={c} style={{
                                background: "rgba(255,255,255,0.03)", borderRadius: 10,
                                padding: "10px 14px", display: "flex", alignItems: "center", gap: 10
                            }}>
                                <span style={{
                                    fontSize: 22, fontWeight: 800,
                                    color: getRatingColor(cats[c]), fontFamily: "system-ui",
                                    minWidth: 30
                                }}>{Math.round(cats[c])}</span>
                                <div>
                                    <div style={{
                                        fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.5)",
                                        fontFamily: "system-ui", letterSpacing: 1
                                    }}>{CAT_FORMULAS[c].full.toUpperCase()}</div>
                                    <div style={{
                                        fontSize: 8, color: "rgba(255,255,255,0.25)",
                                        fontFamily: "system-ui", marginTop: 1
                                    }}>{CAT_FORMULAS[c].keys.length} attributes</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* All Attributes by Category */}
                <div style={{ padding: "16px 24px 24px" }}>
                    <div style={{
                        fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.3)",
                        fontFamily: "system-ui", letterSpacing: 2, marginBottom: 12
                    }}>ALL ATTRIBUTES</div>

                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                        gap: 16
                    }}>
                        {CAT_ORDER.map(c => (
                            <div key={c} style={{
                                background: "rgba(255,255,255,0.02)",
                                borderRadius: 12, padding: "14px 16px",
                                border: "1px solid rgba(255,255,255,0.04)"
                            }}>
                                <div style={{
                                    display: "flex", alignItems: "center", gap: 8, marginBottom: 10
                                }}>
                                    <span style={{
                                        fontSize: 9, fontWeight: 700,
                                        color: getRatingColor(cats[c]),
                                        fontFamily: "system-ui", letterSpacing: 1.5,
                                        background: "rgba(255,255,255,0.06)",
                                        borderRadius: 4, padding: "3px 8px"
                                    }}>{CAT_FORMULAS[c].full.toUpperCase()}</span>
                                    <span style={{
                                        fontSize: 14, fontWeight: 800,
                                        color: getRatingColor(cats[c]),
                                        fontFamily: "system-ui"
                                    }}>{Math.round(cats[c])}</span>
                                </div>

                                {groups[c].map(attr => {
                                    const val = player[attr.key] || 0
                                    return (
                                        <div key={attr.key} style={{
                                            display: "flex", alignItems: "center", gap: 8,
                                            padding: "5px 0",
                                            borderBottom: "1px solid rgba(255,255,255,0.03)"
                                        }}>
                                            <span style={{
                                                fontSize: 12, color: "rgba(255,255,255,0.55)",
                                                fontFamily: "system-ui", flex: 1
                                            }}>{attr.label}</span>
                                            <div style={{
                                                width: 80, height: 6, borderRadius: 3,
                                                background: "rgba(255,255,255,0.06)",
                                                overflow: "hidden", flexShrink: 0
                                            }}>
                                                <div style={{
                                                    width: `${val}%`, height: "100%",
                                                    borderRadius: 3, background: getRatingColor(val),
                                                    transition: "width 0.3s"
                                                }} />
                                            </div>
                                            <span style={{
                                                fontSize: 14, fontWeight: 800,
                                                color: getRatingColor(val),
                                                fontFamily: "system-ui", minWidth: 24,
                                                textAlign: "right"
                                            }}>{val}</span>
                                        </div>
                                    )
                                })}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}