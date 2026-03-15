import { useState } from 'react'
import {
    ATTRS, GK_ATTRS, CAT_ORDER, CAT_FORMULAS, POS_GROUPS,
    calcCategories, calcGkCategory, calcBestRating, calcOverall,
    calcAllPositionRatings, getAllUsedJerseyNumbers,
    getRatingColor, getOvrBg
} from '../utils'

function AttrSlider({ attr, value, onChange, disabled }) {
    const color = disabled ? "rgba(255,255,255,0.15)" : getRatingColor(value)
    return (
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "3px 0", opacity: disabled ? 0.3 : 1 }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.6)", fontFamily: "system-ui", width: 130, flexShrink: 0 }}>{attr.label}</span>
            <input type="range" min={0} max={99} value={value}
                onChange={e => onChange(parseInt(e.target.value))} disabled={disabled}
                style={{ flex: 1, accentColor: color, height: 4, cursor: disabled ? "not-allowed" : "pointer" }} />
            <input type="number" min={0} max={99} value={value} disabled={disabled}
                onChange={e => { const v = Math.max(0, Math.min(99, parseInt(e.target.value) || 0)); onChange(v) }}
                style={{
                    width: 42, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)",
                    borderRadius: 6, color: color, fontSize: 14, fontWeight: 700, fontFamily: "system-ui",
                    textAlign: "center", padding: "4px 2px", outline: "none",
                    cursor: disabled ? "not-allowed" : "text"
                }} />
        </div>
    )
}

export default function Modal({ player, onSave, onClose, isNew, allPlayers }) {
    const [name, setName] = useState(player?.name || "")
    const [positions, setPositions] = useState(player?.positions || [])
    const [jerseyNumbers, setJerseyNumbers] = useState(player?.jerseyNumbers || {})
    const [error, setError] = useState("")
    const [attrs, setAttrs] = useState(() => {
        const a = {}
        ATTRS.forEach(at => a[at.key] = player?.[at.key] ?? 50)
        GK_ATTRS.forEach(at => a[at.key] = player?.[at.key] ?? 50)
        return a
    })
    const setAttr = (k, v) => setAttrs(prev => ({ ...prev, [k]: v }))

    const hasGK = positions.includes("GK")
    const cats = calcCategories(attrs)
    const gkCat = calcGkCategory(attrs)
    const posRatings = calcAllPositionRatings({ ...attrs, positions })
    const bestRating = positions.length > 0 ? calcBestRating({ ...attrs, positions }) : calcOverall(attrs)

    const usedJerseys = getAllUsedJerseyNumbers(allPlayers || [], player?.id)

    const togglePosition = (pos) => {
        setPositions(prev => {
            const next = prev.includes(pos) ? prev.filter(p => p !== pos) : [...prev, pos]
            if (!next.includes(pos)) {
                const jn = { ...jerseyNumbers }
                delete jn[pos]
                setJerseyNumbers(jn)
            }
            return next
        })
        setError("")
    }

    const setJersey = (pos, val) => {
        setJerseyNumbers(prev => ({ ...prev, [pos]: val }))
        setError("")
    }

    const handleSave = () => {
        if (!name.trim()) return
        // Validate jersey uniqueness
        const myNumbers = Object.entries(jerseyNumbers).filter(([p]) => positions.includes(p))
        const myVals = myNumbers.map(([, v]) => String(v)).filter(v => v)
        // Check duplicates within this player
        const mySet = new Set()
        for (const v of myVals) {
            if (mySet.has(v)) { setError("Same jersey number used twice for this player."); return }
            mySet.add(v)
        }
        // Check against other players
        for (const v of myVals) {
            if (usedJerseys.has(v)) { setError("Jersey #" + v + " is already taken by another player."); return }
        }
        const cleanJerseys = {}
        positions.forEach(p => { if (jerseyNumbers[p]) cleanJerseys[p] = String(jerseyNumbers[p]) })
        const gkAttrs = {}
        if (positions.includes("GK")) {
            GK_ATTRS.forEach(a => gkAttrs[a.key] = attrs[a.key])
        } else {
            GK_ATTRS.forEach(a => gkAttrs[a.key] = 0)
        }
        onSave({
            ...player, ...attrs, ...gkAttrs,
            name: name.trim(), positions, jerseyNumbers: cleanJerseys,
            id: player?.id || Date.now().toString()
        })
    }

    const groups = { tec: [], pas: [], att: [], phy: [], def: [], ment: [] }
    ATTRS.forEach(a => groups[a.cat].push(a))

    return (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999, padding: 16 }} onClick={onClose}>
            <div onClick={e => e.stopPropagation()} style={{ background: "linear-gradient(145deg,#1a1a2e,#16213e)", borderRadius: 16, width: "100%", maxWidth: 760, maxHeight: "92vh", overflow: "auto", boxShadow: "0 16px 64px rgba(0,0,0,0.6)", border: "1px solid rgba(255,255,255,0.1)" }}>

                {/* Header */}
                <div style={{ padding: "20px 24px 12px", borderBottom: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                        <div style={{ width: 48, height: 48, borderRadius: 10, background: getOvrBg(bestRating), display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 800, color: "#fff", fontFamily: "system-ui" }}>{Math.round(bestRating)}</div>
                        <div>
                            <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 10, fontWeight: 600, letterSpacing: 1, marginBottom: 4 }}>{isNew ? "ADD NEW LEARNER" : "EDIT LEARNER"}</div>
                            <input value={name} onChange={e => setName(e.target.value)} placeholder="Player name..."
                                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 8, padding: "8px 12px", color: "#fff", fontSize: 16, fontWeight: 700, fontFamily: "system-ui", outline: "none", width: 200 }} />
                        </div>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                        <button onClick={onClose} style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, padding: "8px 16px", color: "rgba(255,255,255,0.6)", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Cancel</button>
                        <button onClick={handleSave} style={{ background: "linear-gradient(135deg,#1a6b1a,#2ecc40)", border: "none", borderRadius: 8, padding: "8px 20px", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", opacity: name.trim() ? 1 : 0.4 }}>{isNew ? "Add Learner" : "Save Changes"}</button>
                    </div>
                </div>

                {/* Error */}
                {error && (
                    <div style={{ margin: "8px 24px 0", padding: "8px 12px", background: "rgba(231,76,60,0.15)", border: "1px solid rgba(231,76,60,0.3)", borderRadius: 8, color: "#e74c3c", fontSize: 12, fontWeight: 600 }}>{error}</div>
                )}

                {/* Position Selection */}
                <div style={{ padding: "14px 24px 10px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.4)", letterSpacing: 1.5, marginBottom: 10 }}>POSITIONS (select multiple)</div>
                    {Object.entries(POS_GROUPS).map(([group, poses]) => (
                        <div key={group} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8, flexWrap: "wrap" }}>
                            <span style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.25)", width: 30, flexShrink: 0 }}>{group}</span>
                            {poses.map(pos => {
                                const sel = positions.includes(pos)
                                const isGK = pos === "GK"
                                return (
                                    <button key={pos} onClick={() => togglePosition(pos)} style={{
                                        background: sel ? (isGK ? "rgba(255,170,0,0.2)" : "rgba(46,204,64,0.2)") : "rgba(255,255,255,0.04)",
                                        border: sel ? (isGK ? "1px solid #ffaa00" : "1px solid #2ecc40") : "1px solid rgba(255,255,255,0.1)",
                                        borderRadius: 6, padding: "5px 12px",
                                        color: sel ? (isGK ? "#ffaa00" : "#2ecc40") : "rgba(255,255,255,0.4)",
                                        fontSize: 11, fontWeight: 700, cursor: "pointer", letterSpacing: 0.5
                                    }}>{pos}</button>
                                )
                            })}
                        </div>
                    ))}
                </div>

                {/* Jersey Numbers per Position */}
                {positions.length > 0 && (
                    <div style={{ padding: "12px 24px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", gap: 14, flexWrap: "wrap", alignItems: "center" }}>
                        {positions.map(pos => (
                            <div key={pos} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                <span style={{ fontSize: 10, fontWeight: 600, color: pos === "GK" ? "rgba(255,170,0,0.7)" : "rgba(255,255,255,0.5)" }}>Jersey ({pos})</span>
                                <input type="number" min={1} max={99} value={jerseyNumbers[pos] || ""}
                                    onChange={e => setJersey(pos, e.target.value)} placeholder="—"
                                    style={{ width: 52, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 8, padding: "6px 8px", color: "#fff", fontSize: 14, fontWeight: 700, textAlign: "center", outline: "none" }} />
                            </div>
                        ))}
                    </div>
                )}

                {/* Position Ratings Preview */}
                {posRatings.length > 0 && (
                    <div style={{ padding: "10px 24px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", gap: 8, flexWrap: "wrap" }}>
                        {posRatings.map(pr => (
                            <div key={pr.pos} style={{ background: "rgba(255,255,255,0.04)", borderRadius: 8, padding: "5px 10px", display: "flex", alignItems: "center", gap: 5 }}>
                                <span style={{ fontSize: 15, fontWeight: 800, color: getRatingColor(pr.rating) }}>{Math.round(pr.rating)}</span>
                                <span style={{ fontSize: 9, fontWeight: 600, color: pr.pos === "GK" ? "rgba(255,170,0,0.6)" : "rgba(255,255,255,0.4)", letterSpacing: 0.5 }}>{pr.pos}</span>
                            </div>
                        ))}
                    </div>
                )}

                {/* Category Summary */}
                <div style={{ padding: "10px 24px 8px", display: "flex", flexWrap: "wrap", gap: 8, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                    {CAT_ORDER.map(c => (
                        <div key={c} style={{ background: "rgba(255,255,255,0.04)", borderRadius: 8, padding: "5px 10px", display: "flex", alignItems: "center", gap: 5 }}>
                            <span style={{ fontSize: 14, fontWeight: 800, color: getRatingColor(cats[c]) }}>{Math.round(cats[c])}</span>
                            <span style={{ fontSize: 9, fontWeight: 600, color: "rgba(255,255,255,0.4)", letterSpacing: .5 }}>{CAT_FORMULAS[c].full}</span>
                        </div>
                    ))}
                    {hasGK && (
                        <div style={{ background: "rgba(255,170,0,0.08)", borderRadius: 8, padding: "5px 10px", display: "flex", alignItems: "center", gap: 5 }}>
                            <span style={{ fontSize: 14, fontWeight: 800, color: getRatingColor(gkCat) }}>{Math.round(gkCat)}</span>
                            <span style={{ fontSize: 9, fontWeight: 600, color: "rgba(255,170,0,0.6)", letterSpacing: .5 }}>Goalkeeping</span>
                        </div>
                    )}
                </div>

                {/* Attribute Sliders */}
                <div style={{ padding: "16px 24px 8px", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: "12px 32px" }}>
                    {CAT_ORDER.map(c => (
                        <div key={c}>
                            <div style={{ fontSize: 10, fontWeight: 700, color: getRatingColor(cats[c]), letterSpacing: 1.5, marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}>
                                <span style={{ background: "rgba(255,255,255,0.06)", borderRadius: 4, padding: "2px 6px" }}>{CAT_FORMULAS[c].full.toUpperCase()}</span>
                                <span style={{ color: "rgba(255,255,255,0.3)" }}>{Math.round(cats[c])}</span>
                            </div>
                            {groups[c].map(a => (
                                <AttrSlider key={a.key} attr={a} value={attrs[a.key]} onChange={v => setAttr(a.key, v)} />
                            ))}
                        </div>
                    ))}
                </div>

                {/* GK Attributes */}
                <div style={{ padding: "8px 24px 20px" }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: hasGK ? "#ffaa00" : "rgba(255,255,255,0.15)", letterSpacing: 1.5, marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ background: hasGK ? "rgba(255,170,0,0.1)" : "rgba(255,255,255,0.03)", borderRadius: 4, padding: "2px 6px" }}>GOALKEEPING</span>
                        <span style={{ color: hasGK ? "rgba(255,170,0,0.5)" : "rgba(255,255,255,0.1)" }}>{hasGK ? Math.round(gkCat) : "—"}</span>
                        {!hasGK && <span style={{ fontSize: 9, color: "rgba(255,255,255,0.2)", fontWeight: 500, fontStyle: "italic" }}>Select GK position to enable</span>}
                    </div>
                    <div style={{ maxWidth: 380 }}>
                        {GK_ATTRS.map(a => (
                            <AttrSlider key={a.key} attr={a} value={attrs[a.key]} onChange={v => setAttr(a.key, v)} disabled={!hasGK} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}