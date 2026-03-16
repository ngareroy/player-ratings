import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { subscribeAdmins, removeAdmin, subscribePlayers } from '../firebase'
import InviteCoachModal from '../components/InviteCoachModal'
import { getAvatarDisplay } from '../components/CoachProfileModal'

export default function ManageTeam() {
    const { user, isHeadCoach, adminData, logout } = useAuth()
    const navigate = useNavigate()
    const [admins, setAdmins] = useState([])
    const [playerCount, setPlayerCount] = useState(0)
    const [showInvite, setShowInvite] = useState(false)
    const [confirmRemove, setConfirmRemove] = useState(null)

    useEffect(() => {
        const unsub1 = subscribeAdmins(setAdmins)
        const unsub2 = subscribePlayers(p => setPlayerCount(p.length))
        return () => { unsub1(); unsub2() }
    }, [])

    const handleRemove = useCallback(async (uid) => {
        if (uid === user.uid) return
        await removeAdmin(uid)
        setConfirmRemove(null)
    }, [user])

    const handleLogout = async () => {
        await logout()
        navigate('/')
    }

    const headCoaches = admins.filter(a => a.role === 'head_coach')
    const assistants = admins.filter(a => a.role === 'assistant_coach')

    return (
        <div style={{ minHeight: "100vh", background: "#0a0a1a", padding: "20px 12px", fontFamily: "system-ui" }}>
            <div style={{ maxWidth: 800, margin: "0 auto" }}>

                {/* Top Bar */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <button onClick={() => navigate('/admin')}
                            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "7px 14px", color: "rgba(255,255,255,0.5)", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>
                            ← Back
                        </button>
                        <h1 style={{ color: "#fff", fontSize: 22, fontWeight: 800, margin: 0, letterSpacing: 1 }}>MANAGE TEAM</h1>
                    </div>
                    <button onClick={handleLogout}
                        style={{ background: "rgba(231,76,60,0.1)", border: "1px solid rgba(231,76,60,0.15)", borderRadius: 8, padding: "7px 14px", color: "#e74c3c", fontSize: 10, fontWeight: 700, cursor: "pointer" }}>
                        Logout
                    </button>
                </div>

                {/* Stats Overview */}
                <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
                    {[
                        { label: "PLAYERS", value: playerCount, color: "#2ecc40" },
                        { label: "COACHES", value: admins.length, color: "#3498db" },
                        { label: "HEAD COACHES", value: headCoaches.length, color: "#ffaa00" },
                        { label: "ASSISTANTS", value: assistants.length, color: "#9b59b6" },
                    ].map(s => (
                        <div key={s.label} style={{ flex: "1 1 140px", background: "rgba(255,255,255,0.03)", borderRadius: 12, padding: "16px 18px", border: "1px solid rgba(255,255,255,0.06)" }}>
                            <div style={{ fontSize: 24, fontWeight: 800, color: s.color, fontFamily: "system-ui" }}>{s.value}</div>
                            <div style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.3)", letterSpacing: 1.5, marginTop: 2 }}>{s.label}</div>
                        </div>
                    ))}
                </div>

                {/* Coaching Staff Section */}
                <div style={{ background: "linear-gradient(145deg,#1a1a2e,#16213e)", borderRadius: 16, border: "1px solid rgba(255,255,255,0.08)", overflow: "hidden", marginBottom: 20 }}>

                    <div style={{ padding: "18px 22px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div>
                            <h2 style={{ color: "#fff", fontSize: 16, fontWeight: 700, margin: "0 0 2px" }}>Coaching Staff</h2>
                            <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 11, margin: 0 }}>{admins.length} member{admins.length !== 1 ? 's' : ''}</p>
                        </div>
                        <button onClick={() => setShowInvite(true)}
                            style={{ background: "linear-gradient(135deg,#1a6b1a,#2ecc40)", border: "none", borderRadius: 8, padding: "8px 18px", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", letterSpacing: 0.5 }}>
                            + Invite Coach
                        </button>
                    </div>

                    {/* Admin List */}
                    <div style={{ padding: "8px 0" }}>
                        {admins.length === 0 && (
                            <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 13, textAlign: "center", padding: 20 }}>No coaching staff found.</p>
                        )}
                        {admins.map(admin => {
                            const isYou = admin.uid === user.uid
                            const isHead = admin.role === 'head_coach'
                            return (
                                <div key={admin.uid} style={{
                                    padding: "14px 22px", display: "flex", alignItems: "center", gap: 14,
                                    borderBottom: "1px solid rgba(255,255,255,0.03)",
                                    transition: "background 0.2s",
                                }}>
                                    {/* Avatar */}
                                    {(() => {
                                        const av = getAvatarDisplay(admin)
                                        return (
                                            <div style={{
                                                width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                                                background: av.bg,
                                                display: "flex", alignItems: "center", justifyContent: "center",
                                                fontSize: av.emoji ? 18 : 16, fontWeight: 800, color: "#fff",
                                            }}>
                                                {av.emoji || av.initial}
                                            </div>
                                        )
                                    })()}

                                    {/* Info */}
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                            <span style={{ color: "#fff", fontSize: 14, fontWeight: 700 }}>
                                                {admin.name || "Unknown"}
                                            </span>
                                            {isYou && (
                                                <span style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.3)", background: "rgba(255,255,255,0.06)", padding: "2px 6px", borderRadius: 4 }}>YOU</span>
                                            )}
                                        </div>
                                        <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 12, marginTop: 1 }}>{admin.email}</div>
                                    </div>

                                    {/* Role Badge */}
                                    <span style={{
                                        fontSize: 9, fontWeight: 700, letterSpacing: 1,
                                        padding: "4px 10px", borderRadius: 6,
                                        background: isHead ? "rgba(255,170,0,0.12)" : "rgba(52,152,219,0.12)",
                                        color: isHead ? "#ffaa00" : "#3498db",
                                    }}>
                                        {isHead ? "HEAD COACH" : "ASSISTANT"}
                                    </span>

                                    {/* Actions */}
                                    {!isYou && isHeadCoach && (
                                        <div style={{ display: "flex", gap: 6 }}>
                                            {confirmRemove === admin.uid ? (
                                                <>
                                                    <button onClick={() => handleRemove(admin.uid)}
                                                        style={{ background: "rgba(231,76,60,0.15)", border: "1px solid rgba(231,76,60,0.3)", borderRadius: 6, padding: "5px 10px", color: "#e74c3c", fontSize: 10, fontWeight: 700, cursor: "pointer" }}>
                                                        Confirm
                                                    </button>
                                                    <button onClick={() => setConfirmRemove(null)}
                                                        style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, padding: "5px 10px", color: "rgba(255,255,255,0.4)", fontSize: 10, fontWeight: 600, cursor: "pointer" }}>
                                                        Cancel
                                                    </button>
                                                </>
                                            ) : (
                                                <button onClick={() => setConfirmRemove(admin.uid)}
                                                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 6, padding: "5px 10px", color: "rgba(255,255,255,0.3)", fontSize: 10, fontWeight: 600, cursor: "pointer" }}>
                                                    Remove
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Quick Links */}
                <div style={{ background: "linear-gradient(145deg,#1a1a2e,#16213e)", borderRadius: 16, border: "1px solid rgba(255,255,255,0.08)", overflow: "hidden", marginBottom: 20 }}>
                    <div style={{ padding: "18px 22px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                        <h2 style={{ color: "#fff", fontSize: 16, fontWeight: 700, margin: 0 }}>Management</h2>
                    </div>
                    <button onClick={() => navigate('/admin/teams')}
                        style={{ width: "100%", padding: "16px 22px", background: "transparent", border: "none", borderBottom: "1px solid rgba(255,255,255,0.03)", cursor: "pointer", display: "flex", alignItems: "center", gap: 14, textAlign: "left" }}>
                        <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(52,152,219,0.1)", border: "1px solid rgba(52,152,219,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>⚽</div>
                        <div style={{ flex: 1 }}>
                            <div style={{ color: "#fff", fontSize: 14, fontWeight: 700 }}>Teams & Seasons</div>
                            <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 11, marginTop: 2 }}>Create age groups, manage seasons, organize squads</div>
                        </div>
                        <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 16 }}>→</span>
                    </button>
                    <button onClick={() => navigate('/admin/assessments')}
                        style={{ width: "100%", padding: "16px 22px", background: "transparent", border: "none", borderBottom: "1px solid rgba(255,255,255,0.03)", cursor: "pointer", display: "flex", alignItems: "center", gap: 14, textAlign: "left" }}>
                        <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(155,89,182,0.1)", border: "1px solid rgba(155,89,182,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>📊</div>
                        <div style={{ flex: 1 }}>
                            <div style={{ color: "#fff", fontSize: 14, fontWeight: 700 }}>Assessments</div>
                            <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 11, marginTop: 2 }}>Create evaluation periods, track rating progress over time</div>
                        </div>
                        <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 16 }}>→</span>
                    </button>
                </div>

                {/* Role Permissions Info */}
                <div style={{ background: "rgba(255,255,255,0.02)", borderRadius: 14, padding: "20px 22px", border: "1px solid rgba(255,255,255,0.05)" }}>
                    <h3 style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, fontWeight: 700, letterSpacing: 1.5, margin: "0 0 14px" }}>ROLE PERMISSIONS</h3>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                        <div style={{ background: "rgba(255,170,0,0.04)", borderRadius: 10, padding: "14px 16px", border: "1px solid rgba(255,170,0,0.08)" }}>
                            <div style={{ color: "#ffaa00", fontSize: 12, fontWeight: 700, marginBottom: 8 }}>Head Coach</div>
                            {["Add & edit players", "Delete players", "Invite & remove coaches", "Full admin access"].map(p => (
                                <div key={p} style={{ display: "flex", alignItems: "center", gap: 6, padding: "3px 0" }}>
                                    <span style={{ color: "#2ecc40", fontSize: 11 }}>✓</span>
                                    <span style={{ color: "rgba(255,255,255,0.45)", fontSize: 11 }}>{p}</span>
                                </div>
                            ))}
                        </div>
                        <div style={{ background: "rgba(52,152,219,0.04)", borderRadius: 10, padding: "14px 16px", border: "1px solid rgba(52,152,219,0.08)" }}>
                            <div style={{ color: "#3498db", fontSize: 12, fontWeight: 700, marginBottom: 8 }}>Assistant Coach</div>
                            {[
                                { text: "Add & edit players", ok: true },
                                { text: "Delete players", ok: false },
                                { text: "Invite & remove coaches", ok: false },
                                { text: "View admin panel", ok: true },
                            ].map(p => (
                                <div key={p.text} style={{ display: "flex", alignItems: "center", gap: 6, padding: "3px 0" }}>
                                    <span style={{ color: p.ok ? "#2ecc40" : "#e74c3c", fontSize: 11 }}>{p.ok ? "✓" : "✕"}</span>
                                    <span style={{ color: "rgba(255,255,255,0.45)", fontSize: 11 }}>{p.text}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {showInvite && <InviteCoachModal onClose={() => setShowInvite(false)} existingAdmins={admins} />}
        </div>
    )
}