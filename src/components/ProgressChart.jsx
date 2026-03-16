import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { subscribePlayerHistory } from '../firebase'
import { CAT_ORDER, CAT_FORMULAS, calcCategories, calcOverall, getRatingColor } from '../utils'

const LINES = [
    { key: "overall", label: "Overall", color: "#fff" },
    { key: "tec", label: "TEC", color: "#2ecc40" },
    { key: "pas", label: "PAS", color: "#3498db" },
    { key: "att", label: "ATT", color: "#e74c3c" },
    { key: "phy", label: "PHY", color: "#e67e22" },
    { key: "def", label: "DEF", color: "#9b59b6" },
    { key: "ment", label: "MENT", color: "#1abc9c" },
]

function CustomTooltip({ active, payload, label }) {
    if (!active || !payload?.length) return null
    return (
        <div style={{ background: "rgba(22,33,62,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "10px 14px", boxShadow: "0 4px 16px rgba(0,0,0,0.4)" }}>
            <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 10, fontWeight: 600, marginBottom: 6 }}>{label}</div>
            {payload.map(p => (
                <div key={p.dataKey} style={{ display: "flex", alignItems: "center", gap: 8, padding: "2px 0" }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: p.color, flexShrink: 0 }} />
                    <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 11, flex: 1 }}>{p.name}</span>
                    <span style={{ color: "#fff", fontSize: 12, fontWeight: 800 }}>{Math.round(p.value)}</span>
                </div>
            ))}
        </div>
    )
}

export default function ProgressChart({ playerId }) {
    const [history, setHistory] = useState([])
    const [loading, setLoading] = useState(true)
    const [activeLines, setActiveLines] = useState(["overall"])

    useEffect(() => {
        if (!playerId) return
        const unsub = subscribePlayerHistory(playerId, (data) => {
            setHistory(data)
            setLoading(false)
        })
        return () => unsub()
    }, [playerId])

    if (loading) {
        return <div style={{ padding: 20, textAlign: "center", color: "rgba(255,255,255,0.3)", fontSize: 12 }}>Loading history...</div>
    }

    if (history.length === 0) {
        return (
            <div style={{ padding: "20px 0", textAlign: "center" }}>
                <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 12, margin: "0 0 4px" }}>No rating history yet</p>
                <p style={{ color: "rgba(255,255,255,0.2)", fontSize: 10, margin: 0 }}>Ratings will be tracked each time a coach saves changes during an active assessment</p>
            </div>
        )
    }

    // Build chart data
    const chartData = history.map((h, i) => {
        const cats = calcCategories(h)
        const ovr = calcOverall(h)
        const date = new Date(h.timestamp)
        const label = h.assessmentId
            ? (h.assessmentName || date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }))
            : date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
        return {
            name: label,
            overall: Math.round(ovr * 10) / 10,
            tec: Math.round(cats.tec * 10) / 10,
            pas: Math.round(cats.pas * 10) / 10,
            att: Math.round(cats.att * 10) / 10,
            phy: Math.round(cats.phy * 10) / 10,
            def: Math.round(cats.def * 10) / 10,
            ment: Math.round(cats.ment * 10) / 10,
            savedBy: h.savedBy,
        }
    })

    // Calculate progress since first entry
    const first = chartData[0]
    const last = chartData[chartData.length - 1]

    const toggleLine = (key) => {
        setActiveLines(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key])
    }

    return (
        <div>
            {/* Progress Summary */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
                <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 8, padding: "8px 12px", display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 10 }}>Entries:</span>
                    <span style={{ color: "#fff", fontSize: 12, fontWeight: 800 }}>{history.length}</span>
                </div>
                {first && last && history.length > 1 && (
                    <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 8, padding: "8px 12px", display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 10 }}>Overall change:</span>
                        {(() => {
                            const diff = last.overall - first.overall
                            const color = diff > 0 ? "#2ecc40" : diff < 0 ? "#e74c3c" : "rgba(255,255,255,0.5)"
                            return <span style={{ color, fontSize: 12, fontWeight: 800 }}>{diff > 0 ? "+" : ""}{diff.toFixed(1)}</span>
                        })()}
                    </div>
                )}
            </div>

            {/* Line Toggles */}
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
                {LINES.map(l => {
                    const active = activeLines.includes(l.key)
                    return (
                        <button key={l.key} onClick={() => toggleLine(l.key)}
                            style={{
                                background: active ? `${l.color}22` : "rgba(255,255,255,0.03)",
                                border: active ? `1px solid ${l.color}55` : "1px solid rgba(255,255,255,0.06)",
                                borderRadius: 6, padding: "4px 10px", cursor: "pointer",
                                display: "flex", alignItems: "center", gap: 5,
                            }}>
                            <div style={{ width: 8, height: 8, borderRadius: "50%", background: active ? l.color : "rgba(255,255,255,0.15)" }} />
                            <span style={{ fontSize: 10, fontWeight: 700, color: active ? l.color : "rgba(255,255,255,0.25)", letterSpacing: 0.3 }}>{l.label}</span>
                        </button>
                    )
                })}
            </div>

            {/* Chart */}
            <div style={{ width: "100%", height: 220 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                        <XAxis dataKey="name" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} tickLine={false} axisLine={{ stroke: "rgba(255,255,255,0.06)" }} />
                        <YAxis domain={[0, 100]} tick={{ fill: "rgba(255,255,255,0.2)", fontSize: 10 }} tickLine={false} axisLine={false} />
                        <Tooltip content={<CustomTooltip />} />
                        {LINES.filter(l => activeLines.includes(l.key)).map(l => (
                            <Line key={l.key} type="monotone" dataKey={l.key} name={l.label}
                                stroke={l.color} strokeWidth={l.key === "overall" ? 2.5 : 1.5}
                                dot={{ r: 3, fill: l.color, strokeWidth: 0 }}
                                activeDot={{ r: 5, fill: l.color, strokeWidth: 2, stroke: "#fff" }} />
                        ))}
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* History Table */}
            {history.length > 1 && (
                <div style={{ marginTop: 14 }}>
                    <div style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.2)", letterSpacing: 1.5, marginBottom: 8 }}>CHANGE LOG</div>
                    <div style={{ maxHeight: 150, overflow: "auto" }}>
                        {[...chartData].reverse().map((entry, i) => {
                            const prev = i < chartData.length - 1 ? [...chartData].reverse()[i + 1] : null
                            const diff = prev ? entry.overall - prev.overall : 0
                            return (
                                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 0", borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                                    <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 10, width: 70, flexShrink: 0 }}>{entry.name}</span>
                                    <span style={{ color: "#fff", fontSize: 12, fontWeight: 800, width: 30 }}>{Math.round(entry.overall)}</span>
                                    {diff !== 0 && (
                                        <span style={{ fontSize: 10, fontWeight: 700, color: diff > 0 ? "#2ecc40" : "#e74c3c" }}>
                                            {diff > 0 ? "▲" : "▼"} {Math.abs(diff).toFixed(1)}
                                        </span>
                                    )}
                                    <span style={{ color: "rgba(255,255,255,0.15)", fontSize: 9, marginLeft: "auto" }}>{entry.savedBy}</span>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}
        </div>
    )
}