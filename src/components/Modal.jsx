import { useState } from 'react'
import {
    ATTRS, CAT_ORDER, CAT_FORMULAS, POSITIONS,
    calcCategories, calcOverall, getRatingColor, getOvrBg
} from '../utils'

function AttrSlider({ attr, value, onChange }) {
    const color = getRatingColor(value)
    return (
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "3px 0" }}>
            <span style={{
                fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.6)",
                fontFamily: "system-ui", width: 130, flexShrink: 0
            }}>{attr.label}</span>
            <input type="range" min={0} max={99} value={value}
                onChange={e => onChange(parseInt(e.target.value))}
                style={{ flex: 1, accentColor: color, height: 4, cursor: "pointer" }} />
            <input type="number" min={0} max={99} value={value}
                onChange={e => {
                    const v = Math.max(0, Math.min(99, parseInt(e.target.value) || 0))
                    onChange(v)
                }}
                style={{
                    width: 42, background: "rgba(255,255,255,0.08)",
                    border: "1px solid rgba(255,255,255,0.15)", borderRadius: 6,
                    color: color, fontSize: 14, fontWeight: 700, fontFamily: "system-ui",
                    textAlign: "center", padding: "4px 2px", outline: "none"
                }} />
        </div>
    )
}

export default function Modal({ player, onSave, onClose, isNew }) {
    const [name, setName] = useState(player?.name || "")
    const [playingPosition, setPlayingPosition] = useState(player?.playingPosition || "")
    const [jerseyNumber, setJerseyNumber] = useState(player?.jerseyNumber || "")
    const [attrs, setAttrs] = useState(() => {
        const a = {}
        ATTRS.forEach(at => a[at.key] = player?.[at.key] ?? 50)
        return a
    })
    const setAttr = (k, v) => setAttrs(prev => ({ ...prev, [k]: v }))
    const cats = calcCategories(attrs)
    const ovr = calcOverall(attrs)
    const groups = { tec: [], pas: [], att: [], phy: [], def: [], men: [] }
    ATTRS.forEach(a => groups[a.cat].push(a))

    return (
        <div style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)",
            backdropFilter: "blur(4px)", display: "flex", alignItems: "center",
            justifyContent: "center", zIndex: 999, padding: 16
        }} onClick={onClose}>
            <div onClick={e => e.stopPropagation()} style={{
                background: "linear-gradient(145deg,#1a1a2e,#16213e)",
                borderRadius: 16, width: "100%", maxWidth: 720, maxHeight: "90vh",
                overflow: "auto", boxShadow: "0 16px 64px rgba(0,0,0,0.6)",
                border: "1px solid rgba(255,255,255,0.1)"
            }}>
                {/* Header */}
                <div style={{
                    padding: "20px 24px 12px",
                    borderBottom: "1px solid rgba(255,255,255,0.08)",
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    flexWrap: "wrap", gap: 12
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                        <div style={{
                            width: 48, height: 48, borderRadius: 10,
                            background: getOvrBg(ovr), display: "flex", alignItems: "center",
                            justifyContent: "center", fontSize: 20, fontWeight: 800,
                            color: "#fff", fontFamily: "system-ui"
                        }}>{Math.round(ovr)}</div>
                        <div>
                            <div style={{
                                color: "rgba(255,255,255,0.4)", fontSize: 10,
                                fontWeight: 600, letterSpacing: 1, marginBottom: 4
                            }}>
                                {isNew ? "ADD NEW LEARNER" : "EDIT LEARNER"}
                            </div>
                            <input value={name} onChange={e => setName(e.target.value)}
                                placeholder="Player name..."
                                style={{
                                    background: "rgba(255,255,255,0.06)",
                                    border: "1px solid rgba(255,255,255,0.15)", borderRadius: 8,
                                    padding: "8px 12px", color: "#fff", fontSize: 16, fontWeight: 700,
                                    fontFamily: "system-ui", outline: "none", width: 200
                                }} />
                        </div>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                        <button onClick={onClose} style={{
                            background: "rgba(255,255,255,0.08)",
                            border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8,
                            padding: "8px 16px", color: "rgba(255,255,255,0.6)",
                            fontSize: 13, fontWeight: 600, cursor: "pointer"
                        }}>Cancel</button>
                        <button onClick={() => {
                            if (!name.trim()) return
                            onSave({
                                ...player, ...attrs,
                                name: name.trim(),
                                playingPosition,
                                jerseyNumber: jerseyNumber ? String(jerseyNumber) : "",
                                id: player?.id || Date.now().toString()
                            })
                        }} style={{
                            background: "linear-gradient(135deg,#1a6b1a,#2ecc40)",
                            border: "none", borderRadius: 8, padding: "8px 20px",
                            color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer",
                            opacity: name.trim() ? 1 : 0.4
                        }}>{isNew ? "Add Learner" : "Save Changes"}</button>
                    </div>
                </div>

                {/* Position & Jersey Number */}
                <div style={{
                    padding: "14px 24px", borderBottom: "1px solid rgba(255,255,255,0.06)",
                    display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center"
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{
                            fontSize: 11, fontWeight: 600,
                            color: "rgba(255,255,255,0.5)", fontFamily: "system-ui"
                        }}>
                            Position
                        </span>
                        <select value={playingPosition}
                            onChange={e => setPlayingPosition(e.target.value)}
                            style={{
                                background: "rgba(255,255,255,0.06)",
                                border: "1px solid rgba(255,255,255,0.15)", borderRadius: 8,
                                padding: "7px 12px", color: "#2ecc40", fontSize: 13,
                                fontWeight: 700, fontFamily: "system-ui", outline: "none",
                                cursor: "pointer"
                            }}>
                            <option value="" style={{ background: "#1a1a2e" }}>Select...</option>
                            {POSITIONS.map(p => (
                                <option key={p} value={p} style={{ background: "#1a1a2e" }}>{p}</option>
                            ))}
                        </select>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{
                            fontSize: 11, fontWeight: 600,
                            color: "rgba(255,255,255,0.5)", fontFamily: "system-ui"
                        }}>
                            Jersey #
                        </span>
                        <input type="number" min={1} max={99}
                            value={jerseyNumber}
                            onChange={e => setJerseyNumber(e.target.value)}
                            placeholder="—"
                            style={{
                                width: 56, background: "rgba(255,255,255,0.06)",
                                border: "1px solid rgba(255,255,255,0.15)", borderRadius: 8,
                                padding: "7px 10px", color: "#fff", fontSize: 14,
                                fontWeight: 700, fontFamily: "system-ui",
                                textAlign: "center", outline: "none"
                            }} />
                    </div>
                </div>

                {/* Category Summary */}
                <div style={{
                    padding: "12px 24px 8px", display: "flex",
                    flexWrap: "wrap", gap: 8,
                    borderBottom: "1px solid rgba(255,255,255,0.06)"
                }}>
                    {CAT_ORDER.map(c => (
                        <div key={c} style={{
                            background: "rgba(255,255,255,0.04)",
                            borderRadius: 8, padding: "6px 12px", display: "flex",
                            alignItems: "center", gap: 6
                        }}>
                            <span style={{
                                fontSize: 15, fontWeight: 800,
                                color: getRatingColor(cats[c])
                            }}>{Math.round(cats[c])}</span>
                            <span style={{
                                fontSize: 9, fontWeight: 600,
                                color: "rgba(255,255,255,0.4)", letterSpacing: .5
                            }}>
                                {CAT_FORMULAS[c].full}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Attribute Sliders */}
                <div style={{
                    padding: "16px 24px 20px", display: "grid",
                    gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))",
                    gap: "12px 32px"
                }}>
                    {CAT_ORDER.map(c => (
                        <div key={c}>
                            <div style={{
                                fontSize: 10, fontWeight: 700,
                                color: getRatingColor(cats[c]), letterSpacing: 1.5,
                                marginBottom: 6, display: "flex", alignItems: "center", gap: 6
                            }}>
                                <span style={{
                                    background: "rgba(255,255,255,0.06)",
                                    borderRadius: 4, padding: "2px 6px"
                                }}>
                                    {CAT_FORMULAS[c].full.toUpperCase()}
                                </span>
                                <span style={{ color: "rgba(255,255,255,0.3)" }}>
                                    {Math.round(cats[c])}
                                </span>
                            </div>
                            {groups[c].map(a => (
                                <AttrSlider key={a.key} attr={a} value={attrs[a.key]}
                                    onChange={v => setAttr(a.key, v)} />
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}