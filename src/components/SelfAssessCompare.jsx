import { useState, useEffect, useMemo } from 'react'
import { subscribePlayerSelfAssessments } from '../firebase'
import { ATTRS, GK_ATTRS, CAT_ORDER, CAT_FORMULAS, calcCategories, calcOverall, getRatingColor } from '../utils'

export default function SelfAssessCompare({ player }) {
    const [assessments, setAssessments] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!player?.id) return
        const u = subscribePlayerSelfAssessments(player.id, d => { setAssessments(d); setLoading(false) })
        return () => u()
    }, [player?.id])

    const latest = assessments[0] || null

    const comparison = useMemo(() => {
        if (!latest) return null
        const coachCats = calcCategories(player)
        const selfCats = calcCategories(latest)
        const coachOvr = calcOverall(player)
        const selfOvr = calcOverall(latest)

        const attrDiffs = ATTRS.map(a => {
            const coach = player[a.key] || 0
            const self = latest[a.key] || 0
            return { ...a, coach, self, diff: self - coach }
        }).sort((a, b) => Math.abs(b.diff) - Math.abs(a.diff))

        const hasGK = (player.positions || []).includes("GK")
        const gkDiffs = hasGK ? GK_ATTRS.map(a => {
            const coach = player[a.key] || 0
            const self = latest[a.key] || 0
            return { ...a, coach, self, diff: self - coach }
        }) : []

        return { coachCats, selfCats, coachOvr, selfOvr, attrDiffs, gkDiffs }
    }, [player, latest])

    if (loading) return <div style={{ padding: 10, color: "rgba(255,255,255,0.3)", fontSize: 12 }}>Loading...</div>

    if (!latest) {
        return (
            <div style={{ padding: "16px 0", textAlign: "center" }}>
                <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 12, margin: 0 }}>No self-assessment submitted yet</p>
                <p style={{ color: "rgba(255,255,255,0.15)", fontSize: 10, margin: "4px 0 0" }}>Player can submit one at /self-assess with their access code</p>
            </div>
        )
    }

    const { coachCats, selfCats, coachOvr, selfOvr, attrDiffs, gkDiffs } = comparison
    const ovrDiff = selfOvr - coachOvr

    // Top overestimations and underestimations
    const overestimates = attrDiffs.filter(a => a.diff > 5).slice(0, 3)
    const underestimates = attrDiffs.filter(a => a.diff < -5).sort((a, b) => a.diff - b.diff).slice(0, 3)

    return (
        <div>
            {/* Overall Comparison */}
            <div style={{ display: "flex", gap: 12, marginBottom: 14, flexWrap: "wrap" }}>
                <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 10, padding: "10px 16px", textAlign: "center" }}>
                    <div style={{ fontSize: 8, fontWeight: 700, color: "rgba(255,255,255,0.2)", letterSpacing: 1, marginBottom: 4 }}>COACH</div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: getRatingColor(coachOvr) }}>{Math.round(coachOvr)}</div>
                </div>
                <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 10, padding: "10px 16px", textAlign: "center" }}>
                    <div style={{ fontSize: 8, fontWeight: 700, color: "rgba(255,255,255,0.2)", letterSpacing: 1, marginBottom: 4 }}>SELF</div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: getRatingColor(selfOvr) }}>{Math.round(selfOvr)}</div>
                </div>
                <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 10, padding: "10px 16px", textAlign: "center" }}>
                    <div style={{ fontSize: 8, fontWeight: 700, color: "rgba(255,255,255,0.2)", letterSpacing: 1, marginBottom: 4 }}>GAP</div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: ovrDiff > 3 ? "#e67e22" : ovrDiff < -3 ? "#3498db" : "#2ecc40" }}>
                        {ovrDiff > 0 ? "+" : ""}{ovrDiff.toFixed(1)}
                    </div>
                </div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", alignSelf: "center", flex: 1, minWidth: 120 }}>
                    Submitted {new Date(latest.submittedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    {assessments.length > 1 && ` · ${assessments.length} total`}
                </div>
            </div>

            {/* Category Comparison */}
            <div style={{ marginBottom: 14 }}>
                {CAT_ORDER.map(c => {
                    const coach = Math.round(coachCats[c])
                    const self = Math.round(selfCats[c])
                    const diff = self - coach
                    return (
                        <div key={c} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 0", borderBottom: "1px solid rgba(255,255,255,0.02)" }}>
                            <span style={{ width: 40, color: "rgba(255,255,255,0.35)", fontSize: 10, fontWeight: 700 }}>{CAT_FORMULAS[c].label}</span>
                            <div style={{ flex: 1, display: "flex", gap: 3 }}>
                                <div style={{ flex: 1, height: 6, borderRadius: 3, background: "rgba(255,255,255,0.04)", overflow: "hidden" }}>
                                    <div style={{ width: `${coach}%`, height: "100%", borderRadius: 3, background: "#2ecc40" }} />
                                </div>
                                <div style={{ flex: 1, height: 6, borderRadius: 3, background: "rgba(255,255,255,0.04)", overflow: "hidden" }}>
                                    <div style={{ width: `${self}%`, height: "100%", borderRadius: 3, background: "#3498db" }} />
                                </div>
                            </div>
                            <span style={{ width: 22, textAlign: "right", fontSize: 11, fontWeight: 800, color: "#2ecc40" }}>{coach}</span>
                            <span style={{ width: 22, textAlign: "right", fontSize: 11, fontWeight: 800, color: "#3498db" }}>{self}</span>
                            <span style={{ width: 30, textAlign: "right", fontSize: 10, fontWeight: 700, color: diff > 3 ? "#e67e22" : diff < -3 ? "#9b59b6" : "rgba(255,255,255,0.2)" }}>
                                {diff > 0 ? "+" : ""}{diff}
                            </span>
                        </div>
                    )
                })}
            </div>

            {/* Legend */}
            <div style={{ display: "flex", gap: 14, marginBottom: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <div style={{ width: 10, height: 10, borderRadius: 3, background: "#2ecc40" }} />
                    <span style={{ fontSize: 9, color: "rgba(255,255,255,0.3)" }}>Coach rating</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <div style={{ width: 10, height: 10, borderRadius: 3, background: "#3498db" }} />
                    <span style={{ fontSize: 9, color: "rgba(255,255,255,0.3)" }}>Self rating</span>
                </div>
            </div>

            {/* Key Insights */}
            {(overestimates.length > 0 || underestimates.length > 0) && (
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                    {overestimates.length > 0 && (
                        <div style={{ flex: "1 1 180px", background: "rgba(230,126,34,0.06)", borderRadius: 10, padding: "12px 14px", border: "1px solid rgba(230,126,34,0.1)" }}>
                            <div style={{ fontSize: 9, fontWeight: 700, color: "#e67e22", letterSpacing: 1, marginBottom: 8 }}>RATES SELF HIGHER</div>
                            {overestimates.map(a => (
                                <div key={a.key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "3px 0" }}>
                                    <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>{a.label}</span>
                                    <span style={{ fontSize: 10, fontWeight: 700, color: "#e67e22" }}>+{a.diff}</span>
                                </div>
                            ))}
                        </div>
                    )}
                    {underestimates.length > 0 && (
                        <div style={{ flex: "1 1 180px", background: "rgba(155,89,182,0.06)", borderRadius: 10, padding: "12px 14px", border: "1px solid rgba(155,89,182,0.1)" }}>
                            <div style={{ fontSize: 9, fontWeight: 700, color: "#9b59b6", letterSpacing: 1, marginBottom: 8 }}>RATES SELF LOWER</div>
                            {underestimates.map(a => (
                                <div key={a.key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "3px 0" }}>
                                    <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>{a.label}</span>
                                    <span style={{ fontSize: 10, fontWeight: 700, color: "#9b59b6" }}>{a.diff}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}