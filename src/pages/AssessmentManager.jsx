import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { subscribeAssessments, saveAssessment, removeAssessment, subscribeSeasons } from '../firebase'

export default function AssessmentManager() {
    const { adminData } = useAuth()
    const navigate = useNavigate()
    const [assessments, setAssessments] = useState([])
    const [seasons, setSeasons] = useState([])
    const [modal, setModal] = useState(null)
    const [confirmDelete, setConfirmDelete] = useState(null)

    useEffect(() => {
        const u1 = subscribeAssessments(setAssessments)
        const u2 = subscribeSeasons(setSeasons)
        return () => { u1(); u2() }
    }, [])

    const sorted = useMemo(() =>
        [...assessments].sort((a, b) => {
            if (a.status === 'open' && b.status !== 'open') return -1
            if (b.status === 'open' && a.status !== 'open') return 1
            return new Date(b.createdAt) - new Date(a.createdAt)
        })
        , [assessments])

    const seasonMap = useMemo(() => {
        const m = {}
        seasons.forEach(s => m[s.id] = s.name)
        return m
    }, [seasons])

    const handleSave = async (a) => {
        await saveAssessment(a)
        setModal(null)
    }

    const handleFinalize = async (a) => {
        if (!confirm(`Finalize "${a.name}"? This marks it as complete. Ratings saved during this period will appear on progress charts.`)) return
        await saveAssessment({ ...a, status: 'finalized', finalizedAt: new Date().toISOString() })
    }

    const handleReopen = async (a) => {
        await saveAssessment({ ...a, status: 'open', finalizedAt: "" })
    }

    const handleDelete = async (id) => {
        await removeAssessment(id)
        setConfirmDelete(null)
    }

    return (
        <div style={{ minHeight: "100vh", background: "#0a0a1a", padding: "20px 12px", fontFamily: "system-ui" }}>
            <div style={{ maxWidth: 800, margin: "0 auto" }}>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <button onClick={() => navigate('/admin/manage')}
                            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "7px 14px", color: "rgba(255,255,255,0.5)", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>
                            ← Back
                        </button>
                        <h1 style={{ color: "#fff", fontSize: 22, fontWeight: 800, margin: 0, letterSpacing: 1 }}>ASSESSMENTS</h1>
                    </div>
                    <button onClick={() => setModal("new")}
                        style={{ background: "linear-gradient(135deg,#1a6b1a,#2ecc40)", border: "none", borderRadius: 8, padding: "8px 18px", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                        + New Assessment
                    </button>
                </div>

                {/* Info Card */}
                <div style={{ background: "rgba(52,152,219,0.06)", border: "1px solid rgba(52,152,219,0.12)", borderRadius: 12, padding: "16px 20px", marginBottom: 20 }}>
                    <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, margin: 0, lineHeight: 1.6 }}>
                        Assessments are evaluation periods. Open an assessment, rate your players during that window, then finalize it. Only ratings saved during an active assessment appear on progress charts — giving you clean data points instead of noisy daily edits.
                    </p>
                </div>

                {/* Assessment List */}
                <div style={{ background: "linear-gradient(145deg,#1a1a2e,#16213e)", borderRadius: 16, border: "1px solid rgba(255,255,255,0.08)", overflow: "hidden" }}>
                    {sorted.length === 0 && (
                        <div style={{ padding: "40px 22px", textAlign: "center" }}>
                            <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 14, margin: "0 0 6px" }}>No assessments yet</p>
                            <p style={{ color: "rgba(255,255,255,0.2)", fontSize: 12, margin: 0 }}>Create your first assessment to start tracking player progress</p>
                        </div>
                    )}

                    {sorted.map(a => {
                        const isOpen = a.status === 'open'
                        const isFinal = a.status === 'finalized'
                        return (
                            <div key={a.id} style={{ padding: "16px 22px", borderBottom: "1px solid rgba(255,255,255,0.03)", display: "flex", alignItems: "center", gap: 14 }}>
                                <div style={{
                                    width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                                    background: isOpen ? "rgba(46,204,64,0.1)" : "rgba(155,89,182,0.1)",
                                    border: isOpen ? "1px solid rgba(46,204,64,0.2)" : "1px solid rgba(155,89,182,0.2)",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    fontSize: 18
                                }}>{isOpen ? "📝" : "✅"}</div>

                                <div style={{ flex: 1 }}>
                                    <div style={{ color: "#fff", fontSize: 15, fontWeight: 700 }}>{a.name}</div>
                                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 3, flexWrap: "wrap" }}>
                                        {a.seasonId && seasonMap[a.seasonId] && (
                                            <span style={{ color: "rgba(255,255,255,0.25)", fontSize: 10 }}>{seasonMap[a.seasonId]}</span>
                                        )}
                                        <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 10 }}>
                                            Created {new Date(a.createdAt).toLocaleDateString()}
                                        </span>
                                        {isFinal && a.finalizedAt && (
                                            <span style={{ color: "rgba(155,89,182,0.6)", fontSize: 10 }}>
                                                Finalized {new Date(a.finalizedAt).toLocaleDateString()}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <span style={{
                                    fontSize: 9, fontWeight: 700, letterSpacing: 1, padding: "4px 10px", borderRadius: 6,
                                    background: isOpen ? "rgba(46,204,64,0.1)" : "rgba(155,89,182,0.1)",
                                    color: isOpen ? "#2ecc40" : "#9b59b6",
                                }}>{isOpen ? "OPEN" : "FINALIZED"}</span>

                                <div style={{ display: "flex", gap: 6 }}>
                                    {isOpen && (
                                        <button onClick={() => handleFinalize(a)}
                                            style={{ background: "rgba(155,89,182,0.1)", border: "1px solid rgba(155,89,182,0.2)", borderRadius: 6, padding: "5px 10px", color: "#9b59b6", fontSize: 10, fontWeight: 700, cursor: "pointer" }}>
                                            Finalize
                                        </button>
                                    )}
                                    {isFinal && (
                                        <button onClick={() => handleReopen(a)}
                                            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 6, padding: "5px 10px", color: "rgba(255,255,255,0.35)", fontSize: 10, fontWeight: 600, cursor: "pointer" }}>
                                            Reopen
                                        </button>
                                    )}
                                    <button onClick={() => setModal(a)}
                                        style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 6, padding: "5px 10px", color: "rgba(255,255,255,0.4)", fontSize: 10, cursor: "pointer" }}>
                                        Edit
                                    </button>
                                    {confirmDelete === a.id ? (
                                        <div style={{ display: "flex", gap: 4 }}>
                                            <button onClick={() => handleDelete(a.id)} style={{ background: "rgba(231,76,60,0.15)", border: "1px solid rgba(231,76,60,0.3)", borderRadius: 6, padding: "5px 8px", color: "#e74c3c", fontSize: 9, fontWeight: 700, cursor: "pointer" }}>Confirm</button>
                                            <button onClick={() => setConfirmDelete(null)} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 6, padding: "5px 8px", color: "rgba(255,255,255,0.3)", fontSize: 9, cursor: "pointer" }}>Cancel</button>
                                        </div>
                                    ) : (
                                        <button onClick={() => setConfirmDelete(a.id)}
                                            style={{ background: "rgba(231,76,60,0.06)", border: "1px solid rgba(231,76,60,0.1)", borderRadius: 6, padding: "5px 8px", color: "rgba(231,76,60,0.5)", fontSize: 10, cursor: "pointer" }}>✕</button>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {modal && <AssessmentModal assessment={modal === "new" ? null : modal} seasons={seasons} onSave={handleSave} onClose={() => setModal(null)} createdBy={adminData?.name || "Unknown"} />}
        </div>
    )
}

function AssessmentModal({ assessment, seasons, onSave, onClose, createdBy }) {
    const [name, setName] = useState(assessment?.name || "")
    const [seasonId, setSeasonId] = useState(assessment?.seasonId || "")
    const isNew = !assessment

    return (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999, padding: 16 }} onClick={onClose}>
            <div onClick={e => e.stopPropagation()} style={{ background: "linear-gradient(145deg,#1a1a2e,#16213e)", borderRadius: 16, width: "100%", maxWidth: 400, boxShadow: "0 16px 64px rgba(0,0,0,0.6)", border: "1px solid rgba(255,255,255,0.1)", padding: 24 }}>
                <h2 style={{ color: "#fff", fontSize: 18, fontWeight: 700, margin: "0 0 18px" }}>{isNew ? "New Assessment" : "Edit Assessment"}</h2>

                <div style={{ marginBottom: 14 }}>
                    <label style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, fontWeight: 600, letterSpacing: 0.5, display: "block", marginBottom: 6 }}>ASSESSMENT NAME</label>
                    <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Week 3 Evaluation, End of Term 1"
                        style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, padding: "11px 14px", color: "#fff", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
                </div>

                <div style={{ marginBottom: 18 }}>
                    <label style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, fontWeight: 600, letterSpacing: 0.5, display: "block", marginBottom: 6 }}>SEASON (optional)</label>
                    <select value={seasonId} onChange={e => setSeasonId(e.target.value)}
                        style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, padding: "11px 14px", color: "#fff", fontSize: 13, outline: "none", cursor: "pointer", boxSizing: "border-box" }}>
                        <option value="" style={{ background: "#1a1a2e" }}>No season</option>
                        {seasons.map(s => (
                            <option key={s.id} value={s.id} style={{ background: "#1a1a2e" }}>{s.name}</option>
                        ))}
                    </select>
                </div>

                <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={onClose} style={{ flex: 1, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "10px", color: "rgba(255,255,255,0.5)", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Cancel</button>
                    <button onClick={() => {
                        if (!name.trim()) return
                        onSave({
                            id: assessment?.id || Date.now().toString(),
                            name: name.trim(), seasonId,
                            status: assessment?.status || 'open',
                            createdBy: assessment?.createdBy || createdBy,
                            createdAt: assessment?.createdAt || new Date().toISOString(),
                            finalizedAt: assessment?.finalizedAt || "",
                        })
                    }} style={{ flex: 1, background: "linear-gradient(135deg,#1a6b1a,#2ecc40)", border: "none", borderRadius: 10, padding: "10px", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", opacity: name.trim() ? 1 : 0.4 }}>
                        {isNew ? "Create" : "Save"}
                    </button>
                </div>
            </div>
        </div>
    )
}