import RadarChart from './RadarChart'
import {
    calcCategories, calcOverall, getRatingColor, getOvrBg,
    CAT_ORDER, CAT_LABELS
} from '../utils'

export default function PlayerCard({ player, rank, isAdmin, onEdit, onDelete }) {
    const cats = calcCategories(player)
    const ovr = calcOverall(player)

    return (
        <div style={{
            background: "linear-gradient(145deg,#1a1a2e,#16213e,#0f3460)",
            borderRadius: 14, width: 270, overflow: "hidden",
            boxShadow: "0 6px 24px rgba(0,0,0,0.4)",
            border: "1px solid rgba(255,255,255,0.08)",
            display: "flex", flexDirection: "column", alignItems: "center",
            position: "relative"
        }}>
            {isAdmin && (
                <div style={{ position: "absolute", top: 8, right: 8, display: "flex", gap: 4 }}>
                    <button onClick={() => onEdit(player)} style={{
                        background: "rgba(255,255,255,0.1)", border: "none",
                        borderRadius: 6, width: 28, height: 28, cursor: "pointer",
                        color: "#fff", fontSize: 13, display: "flex",
                        alignItems: "center", justifyContent: "center"
                    }}>✏️</button>
                    <button onClick={() => onDelete(player.id)} style={{
                        background: "rgba(255,60,60,0.15)", border: "none",
                        borderRadius: 6, width: 28, height: 28, cursor: "pointer",
                        color: "#e74c3c", fontSize: 13, display: "flex",
                        alignItems: "center", justifyContent: "center"
                    }}>✕</button>
                </div>
            )}

            <div style={{
                width: "100%", padding: "14px 16px 8px",
                display: "flex", alignItems: "center", gap: 12,
                borderBottom: "1px solid rgba(255,255,255,0.06)"
            }}>
                <div style={{
                    width: 50, height: 50, borderRadius: 10, background: getOvrBg(ovr),
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 21, fontWeight: 800, color: "#fff", fontFamily: "system-ui",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.3)", flexShrink: 0
                }}>{Math.round(ovr)}</div>
                <div>
                    <div style={{
                        color: "#fff", fontSize: 17, fontWeight: 700,
                        fontFamily: "system-ui"
                    }}>{player.name}</div>
                    <div style={{
                        color: "rgba(255,255,255,0.35)", fontSize: 10,
                        fontWeight: 600, fontFamily: "system-ui", letterSpacing: 1.5
                    }}>
                        #{rank} OVERALL
                    </div>
                </div>
            </div>

            <RadarChart cats={cats} size={195} />

            <div style={{
                width: "100%", padding: "0 14px 12px",
                display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "5px 8px"
            }}>
                {CAT_ORDER.map((c, i) => (
                    <div key={c} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                        <span style={{
                            fontSize: 15, fontWeight: 800,
                            color: getRatingColor(cats[c]), fontFamily: "system-ui",
                            minWidth: 22
                        }}>{Math.round(cats[c])}</span>
                        <span style={{
                            fontSize: 8, fontWeight: 600,
                            color: "rgba(255,255,255,0.4)", fontFamily: "system-ui",
                            letterSpacing: .8
                        }}>{CAT_LABELS[i]}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}