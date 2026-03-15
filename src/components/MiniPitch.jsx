import { getRatingColor } from '../utils'

const POS_COORDS = {
    GK: { left: "50%", top: "91%" },
    CB: { left: "50%", top: "78%" },
    LB: { left: "18%", top: "76%" },
    RB: { left: "82%", top: "76%" },
    LWB: { left: "12%", top: "66%" },
    RWB: { left: "88%", top: "66%" },
    CDM: { left: "50%", top: "60%" },
    CM: { left: "50%", top: "50%" },
    LM: { left: "18%", top: "48%" },
    RM: { left: "82%", top: "48%" },
    CAM: { left: "50%", top: "38%" },
    LW: { left: "22%", top: "18%" },
    RW: { left: "78%", top: "18%" },
    CF: { left: "50%", top: "20%" },
    ST: { left: "50%", top: "12%" },
}

const ALL_DISPLAY = [
    "GK", "LB", "CB", "RB", "CDM", "CM", "LM", "RM", "CAM", "LW", "ST", "RW"
]

export default function MiniPitch({ positions, posRatings, size = "card" }) {
    const w = size === "detail" ? 130 : 100
    const h = size === "detail" ? 180 : 140
    const markerW = size === "detail" ? 24 : 20
    const markerH = size === "detail" ? 16 : 14
    const fontSize = size === "detail" ? 8 : 7

    const ratingMap = {}
    if (posRatings) posRatings.forEach(pr => { ratingMap[pr.pos] = pr.rating })

    const activeSet = new Set(positions || [])

    const getMarkerStyle = (pos) => {
        if (!activeSet.has(pos)) {
            return {
                background: "rgba(255,255,255,0.06)",
                color: "rgba(255,255,255,0.15)",
                boxShadow: "none"
            }
        }
        if (pos === "GK") {
            return {
                background: "rgba(255,170,0,0.3)",
                color: "#ffaa00",
                boxShadow: "0 0 6px rgba(255,170,0,0.3)"
            }
        }
        const rating = ratingMap[pos] || 50
        const color = getRatingColor(rating)
        return {
            background: color + "44",
            color: color,
            boxShadow: `0 0 6px ${color}44`
        }
    }

    return (
        <div style={{
            width: w, height: h, flexShrink: 0,
            background: "linear-gradient(180deg,#1a5c2a 0%,#1e6b31 50%,#1a5c2a 100%)",
            borderRadius: 8, border: "2px solid rgba(255,255,255,0.2)",
            position: "relative", overflow: "hidden"
        }}>
            {/* Pitch markings */}
            {/* Halfway line */}
            <div style={{
                position: "absolute", top: "50%", left: 4, right: 4,
                height: 1, background: "rgba(255,255,255,0.2)"
            }} />
            {/* Center circle */}
            <div style={{
                position: "absolute", top: "50%", left: "50%",
                width: 24, height: 24,
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: "50%", transform: "translate(-50%,-50%)"
            }} />
            {/* Top penalty box */}
            <div style={{
                position: "absolute", top: 4, left: "20%", right: "20%",
                height: Math.round(h * 0.2),
                border: "1px solid rgba(255,255,255,0.15)",
                borderTop: "none", borderRadius: "0 0 4px 4px"
            }} />
            {/* Bottom penalty box */}
            <div style={{
                position: "absolute", bottom: 4, left: "20%", right: "20%",
                height: Math.round(h * 0.2),
                border: "1px solid rgba(255,255,255,0.15)",
                borderBottom: "none", borderRadius: "4px 4px 0 0"
            }} />

            {/* Position markers */}
            {ALL_DISPLAY.map(pos => {
                const coords = POS_COORDS[pos]
                if (!coords) return null
                const ms = getMarkerStyle(pos)
                return (
                    <div key={pos} style={{
                        position: "absolute",
                        left: coords.left, top: coords.top,
                        width: markerW, height: markerH,
                        borderRadius: 3,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: fontSize, fontWeight: 800, letterSpacing: 0.3,
                        fontFamily: "system-ui",
                        transform: "translate(-50%,-50%)",
                        transition: "all 0.3s",
                        ...ms
                    }}>{pos}</div>
                )
            })}

            {/* Extra positions not in default display */}
            {(positions || []).filter(p => !ALL_DISPLAY.includes(p)).map(pos => {
                const coords = POS_COORDS[pos]
                if (!coords) return null
                const ms = getMarkerStyle(pos)
                return (
                    <div key={pos} style={{
                        position: "absolute",
                        left: coords.left, top: coords.top,
                        width: markerW, height: markerH,
                        borderRadius: 3,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: fontSize, fontWeight: 800, letterSpacing: 0.3,
                        fontFamily: "system-ui",
                        transform: "translate(-50%,-50%)",
                        transition: "all 0.3s",
                        ...ms
                    }}>{pos}</div>
                )
            })}
        </div>
    )
}