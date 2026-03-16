import { useState, useEffect } from 'react'
import {
    ATTRS, GK_ATTRS, CAT_ORDER, CAT_FORMULAS, POS_GROUPS,
    calcCategories, calcGkCategory, calcBestRating, calcOverall,
    calcAllPositionRatings, getAllUsedJerseyNumbers,
    calcAge, suggestTeam,
    getRatingColor, getOvrBg
} from '../utils'
import { subscribeTeams } from '../firebase'

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
    const [dob, setDob] = useState(player?.dob || "")
    const [teamId, setTeamId] = useState(player?.teamId || "")
    const [teamAutoSet, setTeamAutoSet] = useState(false)
    const [teams, setTeams] = useState([])
    const [positions, setPositions] = useState(player?.positions || [])
    const [jerseyNumber, setJerseyNumber] = useState(player?.jerseyNumber || "")
    const [gkJerseyNumber, setGkJerseyNumber] = useState(player?.gkJerseyNumber || "")
    const [error, setError] = useState("")
    const [attrs, setAttrs] = useState(() => {
        const a = {}
        ATTRS.forEach(at => a[at.key] = player?.[at.key] ?? 50)
        GK_ATTRS.forEach(at => a[at.key] = player?.[at.key] ?? 50)
        return a
    })
    const setAttr = (k, v) => setAttrs(prev => ({ ...prev, [k]: v }))

    useEffect(() => {
        const unsub = subscribeTeams(setTeams)
        return () => unsub()
    }, [])

    // Auto-assign team when DOB changes (only if not manually set)
    useEffect(() => {
        if (dob && teams.length > 0 && (isNew || !player?.teamId || teamAutoSet)) {
            const suggested = suggestTeam(dob, teams)
            if (suggested) {
                setTeamId(suggested)
                setTeamAutoSet(true)
            }
        }
    }, [dob, teams])

    const age = calcAge(dob)
    const hasGK = positions.includes("GK")
    const hasOutfield = positions.some(p => p !== "GK")
    const needsTwoJerseys = hasGK && hasOutfield
    const cats = calcCategories(attrs)
    const gkCat = calcGkCategory(attrs)
    const posRatings = calcAllPositionRatings({ ...attrs, positions })
    const bestRating = positions.length > 0 ? calcBestRating({ ...attrs, positions }) : calcOverall(attrs)

    const usedJerseys = getAllUsedJerseyNumbers(allPlayers || [], player?.id)

    const togglePosition = (pos) => {
        setPositions(prev => {
            const next = prev.includes(pos) ? prev.filter(p => p !== pos) : [...prev, pos]
            return next
        })
        setError("")
    }

    const handleSave = () => {
        if (!name.trim()) return

        // Collect all jersey numbers this player is using
        const myNumbers = []
        if (needsTwoJerseys) {
            if (jerseyNumber) myNumbers.push(String(jerseyNumber))
            if (gkJerseyNumber) myNumbers.push(String(gkJerseyNumber))
            // Check if both are the same
            if (jerseyNumber && gkJerseyNumber && String(jerseyNumber) === String(gkJerseyNumber)) {
                setError("Outfield and GK jersey numbers must be different.")
                return
            }
        } else {
            // Single jersey — use jerseyNumber for outfield-only or GK-only
            const singleNum = hasGK ? (gkJerseyNumber || jerseyNumber) : jerseyNumber
            if (singleNum) myNumbers.push(String(singleNum))
        }

        // Check against other players
        for (const v of myNumbers) {
            if (usedJerseys.has(v)) {
                setError("Jersey #" + v + " is already taken by another player.")
                return
            }
        }

        const gkAttrs = {}
        if (hasGK) {
            GK_ATTRS.forEach(a => gkAttrs[a.key] = attrs[a.key])
        } else {
            GK_ATTRS.forEach(a => gkAttrs[a.key] = 0)
        }

        // Normalize jersey storage
        let saveJersey = ""
        let saveGkJersey = ""
        if (needsTwoJerseys) {
            saveJersey = jerseyNumber ? String(jerseyNumber) : ""
            saveGkJersey = gkJerseyNumber ? String(gkJerseyNumber) : ""
        } else if (hasGK) {
            saveGkJersey = (gkJerseyNumber || jerseyNumber) ? String(gkJerseyNumber || jerseyNumber) : ""
            saveJersey = ""
        } else {
            saveJersey = jerseyNumber ? String(jerseyNumber) : ""
            saveGkJersey = ""
        }

        onSave({
            ...player, ...attrs, ...gkAttrs,
            name: name.trim(), positions, teamId, dob,
            jerseyNumber: saveJersey,
            gkJerseyNumber: saveGkJersey,
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
                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
                                <input type="date" value={dob} onChange={e => setDob(e.target.value)}
                                    style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 6, padding: "5px 10px", color: "#fff", fontSize: 11, outline: "none", colorScheme: "dark" }} />
                                {age !== null && (
                                    <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, fontWeight: 600 }}>
                                        Age: <span style={{ color: "#fff" }}>{age}</span>
                                    </span>
                                )}
                            </div>
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

                {/* Team Assignment */}
                <div style={{ padding: "14px 24px 10px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                        <label style={{ color: "rgba(255,255,255,0.4)", fontSize: 10, fontWeight: 700, letterSpacing: 1.5 }}>TEAM</label>
                        {teamAutoSet && age !== null && (
                            <span style={{ fontSize: 9, color: "rgba(52,152,219,0.7)", fontStyle: "italic" }}>auto-assigned by age ({age})</span>
                        )}
                    </div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        <button onClick={() => { setTeamId(""); setTeamAutoSet(false) }}
                            style={{
                                background: !teamId ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.04)",
                                border: !teamId ? "1px solid rgba(255,255,255,0.25)" : "1px solid rgba(255,255,255,0.1)",
                                borderRadius: 6, padding: "6px 12px",
                                color: !teamId ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.35)",
                                fontSize: 11, fontWeight: 600, cursor: "pointer"
                            }}>Unassigned</button>
                        {teams.map(t => (
                            <button key={t.id} onClick={() => { setTeamId(t.id); setTeamAutoSet(false) }}
                                style={{
                                    background: teamId === t.id ? "rgba(52,152,219,0.2)" : "rgba(255,255,255,0.04)",
                                    border: teamId === t.id ? "1px solid #3498db" : "1px solid rgba(255,255,255,0.1)",
                                    borderRadius: 6, padding: "6px 12px",
                                    color: teamId === t.id ? "#3498db" : "rgba(255,255,255,0.35)",
                                    fontSize: 11, fontWeight: 700, cursor: "pointer", letterSpacing: 0.3
                                }}>
                                {t.name}
                                <span style={{ marginLeft: 4, opacity: 0.5, fontSize: 9 }}>{t.ageGroup}</span>
                            </button>
                        ))}
                    </div>
                </div>

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

                {/* Jersey Numbers */}
                {positions.length > 0 && (
                    <div style={{ padding: "12px 24px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center" }}>
                        {/* Single jersey for outfield-only or GK-only */}
                        {!needsTwoJerseys && (
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <span style={{ fontSize: 11, fontWeight: 600, color: hasGK ? "rgba(255,170,0,0.7)" : "rgba(255,255,255,0.5)" }}>Jersey</span>
                                <input type="number" min={1} max={99}
                                    value={hasGK ? (gkJerseyNumber || jerseyNumber) : jerseyNumber}
                                    onChange={e => {
                                        if (hasGK) setGkJerseyNumber(e.target.value)
                                        else setJerseyNumber(e.target.value)
                                        setError("")
                                    }}
                                    placeholder="—"
                                    style={{ width: 56, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 8, padding: "7px 10px", color: "#fff", fontSize: 14, fontWeight: 700, textAlign: "center", outline: "none" }} />
                            </div>
                        )}

                        {/* Two jerseys when GK + outfield */}
                        {needsTwoJerseys && (
                            <>
                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.5)" }}>Jersey (Outfield)</span>
                                    <input type="number" min={1} max={99} value={jerseyNumber}
                                        onChange={e => { setJerseyNumber(e.target.value); setError("") }}
                                        placeholder="—"
                                        style={{ width: 56, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 8, padding: "7px 10px", color: "#fff", fontSize: 14, fontWeight: 700, textAlign: "center", outline: "none" }} />
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,170,0,0.7)" }}>Jersey (GK)</span>
                                    <input type="number" min={1} max={99} value={gkJerseyNumber}
                                        onChange={e => { setGkJerseyNumber(e.target.value); setError("") }}
                                        placeholder="—"
                                        style={{ width: 56, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,170,0,0.2)", borderRadius: 8, padding: "7px 10px", color: "#ffaa00", fontSize: 14, fontWeight: 700, textAlign: "center", outline: "none" }} />
                                </div>
                            </>
                        )}
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