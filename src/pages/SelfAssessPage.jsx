import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { getPlayerByAccessCode, saveSelfAssessment, subscribeClubSettings } from '../firebase'
import { ATTRS, GK_ATTRS, CAT_ORDER, CAT_FORMULAS, calcCategories, calcGkCategory, calcOverall, getRatingColor } from '../utils'
import { useEffect } from 'react'

export default function SelfAssessPage() {
    const navigate = useNavigate()
    const [code, setCode] = useState("")
    const [player, setPlayer] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [attrs, setAttrs] = useState({})
    const [submitting, setSubmitting] = useState(false)
    const [submitted, setSubmitted] = useState(false)
    const [club, setClub] = useState({ clubName: "Hub FC", logoEmoji: "⚽" })

    useEffect(() => {
        const u = subscribeClubSettings(setClub)
        return () => u()
    }, [])

    const handleLookup = async () => {
        if (!code.trim()) return
        setError("")
        setLoading(true)
        try {
            const p = await getPlayerByAccessCode(code.trim().toUpperCase())
            if (!p) { setError("Invalid access code. Check with your coach."); setLoading(false); return }
            setPlayer(p)
            const a = {}
            ATTRS.forEach(at => a[at.key] = 50)
            if ((p.positions || []).includes("GK")) GK_ATTRS.forEach(at => a[at.key] = 50)
            setAttrs(a)
        } catch (err) { setError("Something went wrong. Try again.") }
        setLoading(false)
    }

    const setAttr = (k, v) => setAttrs(prev => ({ ...prev, [k]: v }))
    const hasGK = player && (player.positions || []).includes("GK")
    const cats = useMemo(() => calcCategories(attrs), [attrs])
    const ovr = useMemo(() => calcOverall(attrs), [attrs])

    const handleSubmit = async () => {
        setSubmitting(true)
        try {
            await saveSelfAssessment({
                id: `${player.id}_${Date.now()}`,
                playerId: player.id,
                playerName: player.name,
                ...attrs,
                submittedAt: new Date().toISOString(),
            })
            setSubmitted(true)
        } catch (err) { setError("Failed to submit. Please try again.") }
        setSubmitting(false)
    }

    const groups = { tec: [], pas: [], att: [], phy: [], def: [], ment: [] }
    ATTRS.forEach(a => groups[a.cat].push(a))

    const pc = club.primaryColor || "#2ecc40"

    // Success screen
    if (submitted) {
        return (
            <div style={{ minHeight: "100vh", background: "#0a0a1a", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "system-ui", padding: 20 }}>
                <div style={{ textAlign: "center", maxWidth: 400 }}>
                    <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
                    <h1 style={{ color: "#fff", fontSize: 24, fontWeight: 800, margin: "0 0 8px" }}>Assessment Submitted!</h1>
                    <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, margin: "0 0 24px", lineHeight: 1.6 }}>
                        Thanks {player.name}! Your self-assessment has been saved. Your coaches will review it and compare it with their evaluation.
                    </p>
                    <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
                        <button onClick={() => { setSubmitted(false); setPlayer(null); setCode("") }}
                            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "10px 20px", color: "rgba(255,255,255,0.5)", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                            Submit Another
                        </button>
                        <button onClick={() => navigate('/')}
                            style={{ background: `linear-gradient(135deg, ${pc}88, ${pc})`, border: "none", borderRadius: 10, padding: "10px 20px", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                            Back to Home
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    // Code entry screen
    if (!player) {
        return (
            <div style={{ minHeight: "100vh", background: "#0a0a1a", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "system-ui", padding: 20 }}>
                <div style={{ width: "100%", maxWidth: 400 }}>
                    <div style={{ textAlign: "center", marginBottom: 32 }}>
                        <span style={{ fontSize: 36 }}>{club.logoEmoji}</span>
                        <h1 style={{ color: "#fff", fontSize: 24, fontWeight: 800, margin: "8px 0 4px" }}>{club.clubName}</h1>
                        <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 12, letterSpacing: 2, margin: 0 }}>PLAYER SELF-ASSESSMENT</p>
                    </div>

                    <div style={{ background: "linear-gradient(145deg,#1a1a2e,#16213e)", borderRadius: 16, padding: 28, border: "1px solid rgba(255,255,255,0.08)" }}>
                        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, margin: "0 0 18px", lineHeight: 1.6 }}>
                            Enter your access code to start your self-assessment. Ask your coach if you don't have one.
                        </p>

                        <div style={{ marginBottom: 14 }}>
                            <input value={code} onChange={e => setCode(e.target.value.toUpperCase())} placeholder="ACCESS CODE"
                                onKeyDown={e => { if (e.key === 'Enter') handleLookup() }}
                                style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, padding: "14px 18px", color: "#fff", fontSize: 20, fontWeight: 800, textAlign: "center", letterSpacing: 6, outline: "none", boxSizing: "border-box" }} />
                        </div>

                        {error && (
                            <div style={{ background: "rgba(231,76,60,0.1)", border: "1px solid rgba(231,76,60,0.2)", borderRadius: 8, padding: "8px 12px", marginBottom: 14 }}>
                                <p style={{ color: "#e74c3c", fontSize: 12, fontWeight: 600, margin: 0 }}>{error}</p>
                            </div>
                        )}

                        <button onClick={handleLookup} disabled={loading || !code.trim()}
                            style={{ width: "100%", background: `linear-gradient(135deg, ${pc}88, ${pc})`, border: "none", borderRadius: 10, padding: "12px", color: "#fff", fontSize: 14, fontWeight: 700, cursor: loading ? "wait" : "pointer", opacity: code.trim() ? 1 : 0.4 }}>
                            {loading ? "Looking up..." : "Start Assessment"}
                        </button>

                        <button onClick={() => navigate('/')}
                            style={{ width: "100%", background: "transparent", border: "none", padding: "12px", color: "rgba(255,255,255,0.25)", fontSize: 12, cursor: "pointer", marginTop: 8 }}>
                            ← Back to Home
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    // Assessment form
    return (
        <div style={{ minHeight: "100vh", background: "#0a0a1a", padding: "20px 12px", fontFamily: "system-ui" }}>
            <div style={{ maxWidth: 700, margin: "0 auto" }}>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
                    <div>
                        <h1 style={{ color: "#fff", fontSize: 22, fontWeight: 800, margin: "0 0 2px" }}>Hey {player.name}!</h1>
                        <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 12, margin: 0 }}>Rate yourself honestly on each attribute (0-99)</p>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ textAlign: "right" }}>
                            <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 9, letterSpacing: 1 }}>YOUR SELF-RATING</div>
                            <div style={{ color: getRatingColor(ovr), fontSize: 22, fontWeight: 800 }}>{Math.round(ovr)}</div>
                        </div>
                        <button onClick={handleSubmit} disabled={submitting}
                            style={{ background: `linear-gradient(135deg, ${pc}88, ${pc})`, border: "none", borderRadius: 10, padding: "10px 24px", color: "#fff", fontSize: 13, fontWeight: 700, cursor: submitting ? "wait" : "pointer" }}>
                            {submitting ? "Submitting..." : "Submit"}
                        </button>
                    </div>
                </div>

                {/* Category Pills */}
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
                    {CAT_ORDER.map(c => (
                        <div key={c} style={{ background: "rgba(255,255,255,0.04)", borderRadius: 8, padding: "6px 12px", display: "flex", alignItems: "center", gap: 5 }}>
                            <span style={{ fontSize: 14, fontWeight: 800, color: getRatingColor(cats[c]) }}>{Math.round(cats[c])}</span>
                            <span style={{ fontSize: 9, fontWeight: 600, color: "rgba(255,255,255,0.35)" }}>{CAT_FORMULAS[c].full}</span>
                        </div>
                    ))}
                </div>

                {/* Attribute Sliders */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 16 }}>
                    {CAT_ORDER.map(c => (
                        <div key={c} style={{ background: "linear-gradient(145deg,#1a1a2e,#16213e)", borderRadius: 14, border: "1px solid rgba(255,255,255,0.08)", padding: "16px 18px" }}>
                            <div style={{ fontSize: 10, fontWeight: 700, color: getRatingColor(cats[c]), letterSpacing: 1.5, marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
                                <span style={{ background: "rgba(255,255,255,0.06)", borderRadius: 4, padding: "2px 6px" }}>{CAT_FORMULAS[c].full.toUpperCase()}</span>
                                <span style={{ color: "rgba(255,255,255,0.3)" }}>{Math.round(cats[c])}</span>
                            </div>
                            {groups[c].map(a => {
                                const val = attrs[a.key] || 50
                                const color = getRatingColor(val)
                                return (
                                    <div key={a.key} style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 0" }}>
                                        <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.5)", width: 120, flexShrink: 0 }}>{a.label}</span>
                                        <input type="range" min={0} max={99} value={val} onChange={e => setAttr(a.key, parseInt(e.target.value))}
                                            style={{ flex: 1, accentColor: color, height: 4, cursor: "pointer" }} />
                                        <span style={{ fontSize: 14, fontWeight: 800, color, width: 24, textAlign: "right" }}>{val}</span>
                                    </div>
                                )
                            })}
                        </div>
                    ))}

                    {/* GK */}
                    {hasGK && (
                        <div style={{ background: "linear-gradient(145deg,#1a1a2e,#16213e)", borderRadius: 14, border: "1px solid rgba(255,170,0,0.12)", padding: "16px 18px" }}>
                            <div style={{ fontSize: 10, fontWeight: 700, color: "#ffaa00", letterSpacing: 1.5, marginBottom: 10 }}>
                                <span style={{ background: "rgba(255,170,0,0.1)", borderRadius: 4, padding: "2px 6px" }}>GOALKEEPING</span>
                            </div>
                            {GK_ATTRS.map(a => {
                                const val = attrs[a.key] || 50
                                const color = getRatingColor(val)
                                return (
                                    <div key={a.key} style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 0" }}>
                                        <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.5)", width: 120, flexShrink: 0 }}>{a.label}</span>
                                        <input type="range" min={0} max={99} value={val} onChange={e => setAttr(a.key, parseInt(e.target.value))}
                                            style={{ flex: 1, accentColor: color, height: 4, cursor: "pointer" }} />
                                        <span style={{ fontSize: 14, fontWeight: 800, color, width: 24, textAlign: "right" }}>{val}</span>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>

                {/* Submit */}
                <div style={{ display: "flex", justifyContent: "center", marginTop: 20, marginBottom: 40 }}>
                    <button onClick={handleSubmit} disabled={submitting}
                        style={{ background: `linear-gradient(135deg, ${pc}88, ${pc})`, border: "none", borderRadius: 12, padding: "14px 40px", color: "#fff", fontSize: 15, fontWeight: 700, cursor: submitting ? "wait" : "pointer" }}>
                        {submitting ? "Submitting..." : "Submit Self-Assessment"}
                    </button>
                </div>
            </div>
        </div>
    )
}