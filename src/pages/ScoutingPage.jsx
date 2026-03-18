import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { subscribeTrials, saveTrial, removeTrial, convertTrialToPlayer, subscribeClubSettings } from '../firebase'
import { ATTRS, GK_ATTRS, CAT_ORDER, CAT_FORMULAS, calcCategories, calcOverall, getRatingColor, getOvrBg } from '../utils'

const VERDICTS = ["Pending", "Sign", "Reject", "Callback"]
const VERDICT_COLORS = { Pending: "rgba(255,255,255,0.3)", Sign: "#2ecc40", Reject: "#e74c3c", Callback: "#e8b930" }

const ALL_POSITIONS = ["GK", "CB", "LB", "RB", "CDM", "CM", "CAM", "LM", "RM", "LW", "RW", "ST"]

function TrialModal({ trial, onSave, onClose, coachName }) {
    const [name, setName] = useState(trial?.name || "")
    const [dob, setDob] = useState(trial?.dob || "")
    const [trialDate, setTrialDate] = useState(trial?.trialDate || new Date().toISOString().slice(0, 10))
    const [source, setSource] = useState(trial?.source || "")
    const [parentContact, setParentContact] = useState(trial?.parentContact || "")
    const [positions, setPositions] = useState(trial?.positions || [])
    const [trialNotes, setTrialNotes] = useState(trial?.trialNotes || "")
    const [verdict, setVerdict] = useState(trial?.verdict || "Pending")
    const [attrs, setAttrs] = useState(() => {
        const a = {}
        ATTRS.forEach(at => a[at.key] = trial?.[at.key] ?? 50)
        GK_ATTRS.forEach(at => a[at.key] = trial?.[at.key] ?? 50)
        return a
    })
    const isNew = !trial

    const setAttr = (k, v) => setAttrs(prev => ({ ...prev, [k]: v }))
    const hasGK = positions.includes("GK")
    const cats = calcCategories(attrs)
    const ovr = calcOverall(attrs)

    const togglePos = (p) => setPositions(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p])

    const groups = {}
    CAT_ORDER.forEach(c => groups[c] = ATTRS.filter(a => a.cat === c))

    return (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999, padding: 16 }} onClick={onClose}>
            <div onClick={e => e.stopPropagation()} style={{ background: "linear-gradient(145deg,#1a1a2e,#16213e)", borderRadius: 16, width: "100%", maxWidth: 680, maxHeight: "92vh", overflow: "auto", boxShadow: "0 16px 64px rgba(0,0,0,0.6)", border: "1px solid rgba(255,255,255,0.1)", padding: 24 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{ width: 44, height: 44, borderRadius: 10, background: getOvrBg(ovr), display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 800, color: "#fff" }}>{Math.round(ovr)}</div>
                        <h2 style={{ color: "#fff", fontSize: 18, fontWeight: 700, margin: 0 }}>{isNew ? "New Trial Player" : "Edit Trial"}</h2>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                        <button onClick={onClose} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "8px 16px", color: "rgba(255,255,255,0.5)", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Cancel</button>
                        <button onClick={() => {
                            if (!name.trim()) return
                            onSave({
                                ...trial,
                                ...attrs,
                                id: trial?.id || Date.now().toString(),
                                name: name.trim(),
                                dob,
                                trialDate,
                                source,
                                parentContact,
                                positions,
                                trialNotes,
                                verdict,
                                // ✅ FIX: always ensure status is explicitly 'active' for new trials
                                status: trial?.status || 'active',
                                scoutedBy: trial?.scoutedBy || coachName,
                                createdAt: trial?.createdAt || new Date().toISOString()
                            })
                        }} style={{ background: "linear-gradient(135deg,#1a6b1a,#2ecc40)", border: "none", borderRadius: 8, padding: "8px 20px", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", opacity: name.trim() ? 1 : 0.4 }}>
                            {isNew ? "Add Trial" : "Save"}
                        </button>
                    </div>
                </div>

                {/* Basic Info */}
                <div style={{ display: "flex", gap: 12, marginBottom: 14, flexWrap: "wrap" }}>
                    <div style={{ flex: "2 1 180px" }}>
                        <label style={{ color: "rgba(255,255,255,0.4)", fontSize: 10, fontWeight: 600, display: "block", marginBottom: 5 }}>NAME</label>
                        <input value={name} onChange={e => setName(e.target.value)} placeholder="Player name..."
                            style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, padding: "10px 12px", color: "#fff", fontSize: 14, fontWeight: 700, outline: "none", boxSizing: "border-box" }} />
                    </div>
                    <div style={{ flex: "1 1 120px" }}>
                        <label style={{ color: "rgba(255,255,255,0.4)", fontSize: 10, fontWeight: 600, display: "block", marginBottom: 5 }}>DOB</label>
                        <input type="date" value={dob} onChange={e => setDob(e.target.value)}
                            style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, padding: "9px 12px", color: "#fff", fontSize: 12, outline: "none", boxSizing: "border-box", colorScheme: "dark" }} />
                    </div>
                    <div style={{ flex: "1 1 120px" }}>
                        <label style={{ color: "rgba(255,255,255,0.4)", fontSize: 10, fontWeight: 600, display: "block", marginBottom: 5 }}>TRIAL DATE</label>
                        <input type="date" value={trialDate} onChange={e => setTrialDate(e.target.value)}
                            style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, padding: "9px 12px", color: "#fff", fontSize: 12, outline: "none", boxSizing: "border-box", colorScheme: "dark" }} />
                    </div>
                </div>

                <div style={{ display: "flex", gap: 12, marginBottom: 14, flexWrap: "wrap" }}>
                    <div style={{ flex: "1 1 180px" }}>
                        <label style={{ color: "rgba(255,255,255,0.4)", fontSize: 10, fontWeight: 600, display: "block", marginBottom: 5 }}>SOURCE / REFERRED BY</label>
                        <input value={source} onChange={e => setSource(e.target.value)} placeholder="Where did they come from?"
                            style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, padding: "10px 12px", color: "#fff", fontSize: 12, outline: "none", boxSizing: "border-box" }} />
                    </div>
                    <div style={{ flex: "1 1 180px" }}>
                        <label style={{ color: "rgba(255,255,255,0.4)", fontSize: 10, fontWeight: 600, display: "block", marginBottom: 5 }}>PARENT CONTACT</label>
                        <input value={parentContact} onChange={e => setParentContact(e.target.value)} placeholder="Phone or email"
                            style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, padding: "10px 12px", color: "#fff", fontSize: 12, outline: "none", boxSizing: "border-box" }} />
                    </div>
                </div>

                {/* Positions */}
                <div style={{ marginBottom: 14 }}>
                    <label style={{ color: "rgba(255,255,255,0.4)", fontSize: 10, fontWeight: 600, display: "block", marginBottom: 6 }}>POSITIONS</label>
                    <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                        {ALL_POSITIONS.map(p => (
                            <button key={p} onClick={() => togglePos(p)} style={{
                                background: positions.includes(p) ? "rgba(46,204,64,0.15)" : "rgba(255,255,255,0.04)",
                                border: positions.includes(p) ? "1px solid #2ecc40" : "1px solid rgba(255,255,255,0.08)",
                                borderRadius: 5, padding: "6px 10px", color: positions.includes(p) ? "#2ecc40" : "rgba(255,255,255,0.3)",
                                fontSize: 9, fontWeight: 700, cursor: "pointer"
                            }}>{p}</button>
                        ))}
                    </div>
                </div>

                {/* Verdict */}
                <div style={{ marginBottom: 14 }}>
                    <label style={{ color: "rgba(255,255,255,0.4)", fontSize: 10, fontWeight: 600, display: "block", marginBottom: 6 }}>VERDICT</label>
                    <div style={{ display: "flex", gap: 6 }}>
                        {VERDICTS.map(v => (
                            <button key={v} onClick={() => setVerdict(v)} style={{
                                background: verdict === v ? `${VERDICT_COLORS[v]}22` : "rgba(255,255,255,0.04)",
                                border: verdict === v ? `1px solid ${VERDICT_COLORS[v]}` : "1px solid rgba(255,255,255,0.08)",
                                borderRadius: 6, padding: "8px 16px", color: verdict === v ? VERDICT_COLORS[v] : "rgba(255,255,255,0.3)",
                                fontSize: 11, fontWeight: 700, cursor: "pointer"
                            }}>{v}</button>
                        ))}
                    </div>
                </div>

                {/* Trial Notes */}
                <div style={{ marginBottom: 14 }}>
                    <label style={{ color: "rgba(255,255,255,0.4)", fontSize: 10, fontWeight: 600, display: "block", marginBottom: 5 }}>TRIAL NOTES</label>
                    <textarea value={trialNotes} onChange={e => setTrialNotes(e.target.value)} placeholder="Observations, strengths, concerns..." rows={3}
                        style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, padding: "10px 12px", color: "#fff", fontSize: 12, outline: "none", boxSizing: "border-box", resize: "vertical", fontFamily: "system-ui" }} />
                </div>

                {/* Category Summary */}
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10, paddingBottom: 10, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                    {CAT_ORDER.map(c => (
                        <div key={c} style={{ background: "rgba(255,255,255,0.04)", borderRadius: 6, padding: "4px 10px", display: "flex", alignItems: "center", gap: 4 }}>
                            <span style={{ fontSize: 13, fontWeight: 800, color: getRatingColor(cats[c]) }}>{Math.round(cats[c])}</span>
                            <span style={{ fontSize: 8, fontWeight: 600, color: "rgba(255,255,255,0.3)" }}>{CAT_FORMULAS[c].label}</span>
                        </div>
                    ))}
                </div>

                {/* Attribute Sliders — Outfield */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: "10px 24px" }}>
                    {CAT_ORDER.map(c => (
                        <div key={c}>
                            <div style={{ fontSize: 9, fontWeight: 700, color: getRatingColor(cats[c]), letterSpacing: 1, marginBottom: 4 }}>
                                <span style={{ background: "rgba(255,255,255,0.06)", borderRadius: 3, padding: "1px 5px" }}>{CAT_FORMULAS[c].full.toUpperCase()}</span>
                            </div>
                            {groups[c].map(a => (
                                <div key={a.key} style={{ display: "flex", alignItems: "center", gap: 6, padding: "2px 0" }}>
                                    <span style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", width: 110, flexShrink: 0 }}>{a.label}</span>
                                    <input type="range" min={0} max={99} value={attrs[a.key]} onChange={e => setAttr(a.key, parseInt(e.target.value))}
                                        style={{ flex: 1, accentColor: getRatingColor(attrs[a.key]), height: 3, cursor: "pointer" }} />
                                    <span style={{ fontSize: 12, fontWeight: 800, color: getRatingColor(attrs[a.key]), width: 22, textAlign: "right" }}>{attrs[a.key]}</span>
                                </div>
                            ))}
                        </div>
                    ))}
                </div>

                {/* ✅ FIX: GK Attributes — only shown when GK position is selected */}
                {hasGK && GK_ATTRS.length > 0 && (
                    <div style={{ marginTop: 16, paddingTop: 14, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                        <div style={{ fontSize: 9, fontWeight: 700, color: "#3498db", letterSpacing: 1, marginBottom: 8 }}>
                            <span style={{ background: "rgba(52,152,219,0.1)", borderRadius: 3, padding: "1px 5px" }}>GK ATTRIBUTES</span>
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: "4px 24px" }}>
                            {GK_ATTRS.map(a => (
                                <div key={a.key} style={{ display: "flex", alignItems: "center", gap: 6, padding: "2px 0" }}>
                                    <span style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", width: 110, flexShrink: 0 }}>{a.label}</span>
                                    <input type="range" min={0} max={99} value={attrs[a.key]} onChange={e => setAttr(a.key, parseInt(e.target.value))}
                                        style={{ flex: 1, accentColor: getRatingColor(attrs[a.key]), height: 3, cursor: "pointer" }} />
                                    <span style={{ fontSize: 12, fontWeight: 800, color: getRatingColor(attrs[a.key]), width: 22, textAlign: "right" }}>{attrs[a.key]}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default function ScoutingPage() {
    const { adminData, isHeadCoach } = useAuth()
    const navigate = useNavigate()
    const [trials, setTrials] = useState([])
    const [club, setClub] = useState({ clubName: "Hub FC" })
    const [modal, setModal] = useState(null)
    const [filter, setFilter] = useState("active")
    const [confirmDelete, setConfirmDelete] = useState(null)
    const [converting, setConverting] = useState(null)

    useEffect(() => {
        const u1 = subscribeTrials(setTrials)
        const u2 = subscribeClubSettings(setClub)
        return () => { u1(); u2() }
    }, [])

    const filtered = useMemo(() => {
        let list = [...trials]
        if (filter === "active") list = list.filter(t => t.status === 'active')
        else if (filter === "signed") list = list.filter(t => t.status === 'signed')
        else if (filter === "rejected") list = list.filter(t => t.verdict === 'Reject')
        return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    }, [trials, filter])

    const handleSave = async (t) => { await saveTrial(t); setModal(null) }
    const handleDelete = async (id) => { await removeTrial(id); setConfirmDelete(null) }

    const handleConvert = async (trial) => {
        if (!confirm(`Sign ${trial.name}? This will create a full player profile from their trial ratings.`)) return
        setConverting(trial.id)
        try {
            await convertTrialToPlayer(trial)
        } catch (err) { console.error(err) }
        setConverting(null)
    }

    return (
        <div style={{ minHeight: "100vh", background: "#0a0a1a", padding: "20px 12px", fontFamily: "system-ui" }}>
            <div style={{ maxWidth: 900, margin: "0 auto" }}>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <button onClick={() => navigate('/admin')} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "7px 14px", color: "rgba(255,255,255,0.5)", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>← Back</button>
                        <h1 style={{ color: "#fff", fontSize: 22, fontWeight: 800, margin: 0 }}>{club.clubName} SCOUTING</h1>
                    </div>
                    <button onClick={() => setModal("new")} style={{ background: "linear-gradient(135deg,#1a6b1a,#2ecc40)", border: "none", borderRadius: 8, padding: "8px 18px", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>+ Trial Player</button>
                </div>

                {/* Filter */}
                <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
                    {[{ key: "active", label: "Active" }, { key: "signed", label: "Signed" }, { key: "rejected", label: "Rejected" }, { key: "all", label: "All" }].map(f => (
                        <button key={f.key} onClick={() => setFilter(f.key)} style={{
                            background: filter === f.key ? "rgba(52,152,219,0.2)" : "rgba(255,255,255,0.04)",
                            border: filter === f.key ? "1px solid #3498db" : "1px solid rgba(255,255,255,0.08)",
                            borderRadius: 6, padding: "5px 12px", color: filter === f.key ? "#3498db" : "rgba(255,255,255,0.3)",
                            fontSize: 10, fontWeight: 700, cursor: "pointer"
                        }}>{f.label} {f.key !== "all" ? `(${trials.filter(t => f.key === "active" ? t.status === 'active' : f.key === "signed" ? t.status === 'signed' : t.verdict === 'Reject').length})` : `(${trials.length})`}</button>
                    ))}
                </div>

                {/* Trial List */}
                <div style={{ background: "linear-gradient(145deg,#1a1a2e,#16213e)", borderRadius: 16, border: "1px solid rgba(255,255,255,0.08)", overflow: "hidden" }}>
                    {filtered.length === 0 && (
                        <div style={{ padding: "40px 20px", textAlign: "center" }}>
                            <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 14 }}>No trial players{filter !== "all" ? ` (${filter})` : ""}</p>
                            <p style={{ color: "rgba(255,255,255,0.15)", fontSize: 11, marginTop: 4 }}>Add a trial player to start scouting</p>
                        </div>
                    )}

                    {filtered.map(trial => {
                        const ovr = Math.round(calcOverall(trial))
                        const vc = VERDICT_COLORS[trial.verdict] || "rgba(255,255,255,0.3)"
                        const isSigned = trial.status === 'signed'
                        return (
                            <div key={trial.id} style={{ padding: "14px 20px", borderBottom: "1px solid rgba(255,255,255,0.03)", display: "flex", alignItems: "center", gap: 12, opacity: isSigned ? 0.5 : 1 }}>
                                <div style={{ width: 40, height: 40, borderRadius: 10, background: getOvrBg(ovr), display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 800, color: "#fff", flexShrink: 0 }}>{ovr}</div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ color: "#fff", fontSize: 14, fontWeight: 700 }}>{trial.name}</div>
                                    <div style={{ display: "flex", gap: 6, marginTop: 3, flexWrap: "wrap", alignItems: "center" }}>
                                        {(trial.positions || []).map(p => (
                                            <span key={p} style={{ fontSize: 8, fontWeight: 700, color: "rgba(255,255,255,0.2)" }}>{p}</span>
                                        ))}
                                        {trial.trialDate && <span style={{ color: "rgba(255,255,255,0.15)", fontSize: 9 }}>Trial: {new Date(trial.trialDate + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>}
                                        {trial.source && <span style={{ color: "rgba(255,255,255,0.12)", fontSize: 9 }}>via {trial.source}</span>}
                                        {trial.scoutedBy && <span style={{ color: "rgba(255,255,255,0.1)", fontSize: 9 }}>by {trial.scoutedBy}</span>}
                                    </div>
                                </div>

                                <span style={{ fontSize: 9, fontWeight: 700, padding: "3px 10px", borderRadius: 6, background: `${vc}18`, color: vc, letterSpacing: 0.5 }}>
                                    {isSigned ? "SIGNED ✓" : trial.verdict}
                                </span>

                                <div style={{ display: "flex", gap: 4 }}>
                                    {!isSigned && trial.verdict === "Sign" && (
                                        <button onClick={() => handleConvert(trial)} disabled={converting === trial.id}
                                            style={{ background: "rgba(46,204,64,0.1)", border: "1px solid rgba(46,204,64,0.2)", borderRadius: 6, padding: "5px 10px", color: "#2ecc40", fontSize: 9, fontWeight: 700, cursor: "pointer" }}>
                                            {converting === trial.id ? "..." : "Add to Squad"}
                                        </button>
                                    )}
                                    <button onClick={() => setModal(trial)} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 6, padding: "5px 10px", color: "rgba(255,255,255,0.4)", fontSize: 10, cursor: "pointer" }}>Edit</button>
                                    {isHeadCoach && (
                                        confirmDelete === trial.id ? (
                                            <div style={{ display: "flex", gap: 3 }}>
                                                <button onClick={() => handleDelete(trial.id)} style={{ background: "rgba(231,76,60,0.15)", border: "1px solid rgba(231,76,60,0.3)", borderRadius: 6, padding: "7px 10px", color: "#e74c3c", fontSize: 8, fontWeight: 700, cursor: "pointer" }}>Yes</button>
                                                <button onClick={() => setConfirmDelete(null)} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 6, padding: "7px 10px", color: "rgba(255,255,255,0.3)", fontSize: 8, cursor: "pointer" }}>No</button>
                                            </div>
                                        ) : (
                                            <button onClick={() => setConfirmDelete(trial.id)} style={{ background: "rgba(231,76,60,0.04)", border: "1px solid rgba(231,76,60,0.08)", borderRadius: 6, padding: "7px 10px", color: "rgba(231,76,60,0.4)", fontSize: 10, cursor: "pointer", minHeight: 36 }}>✕</button>
                                        )
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {modal && <TrialModal trial={modal === "new" ? null : modal} onSave={handleSave} onClose={() => setModal(null)} coachName={adminData?.name || "Coach"} />}
        </div>
    )
}
