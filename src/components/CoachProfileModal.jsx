import { useState } from 'react'
import { setAdminRole } from '../firebase'
import { useAuth } from '../contexts/AuthContext'

const AVATARS = [
    { id: "coach1", emoji: "⚽" },
    { id: "coach2", emoji: "🏆" },
    { id: "coach3", emoji: "📋" },
    { id: "coach4", emoji: "🎯" },
    { id: "coach5", emoji: "🦁" },
    { id: "coach6", emoji: "🦅" },
    { id: "coach7", emoji: "⭐" },
    { id: "coach8", emoji: "🔥" },
    { id: "coach9", emoji: "💪" },
    { id: "coach10", emoji: "🎽" },
    { id: "coach11", emoji: "🥇" },
    { id: "coach12", emoji: "⚡" },
]

const AVATAR_COLORS = [
    { id: "green", bg: "linear-gradient(135deg,#1a6b1a,#2ecc40)" },
    { id: "blue", bg: "linear-gradient(135deg,#1a4a8a,#3498db)" },
    { id: "amber", bg: "linear-gradient(135deg,#8a6b00,#ffaa00)" },
    { id: "purple", bg: "linear-gradient(135deg,#5b2d8e,#9b59b6)" },
    { id: "coral", bg: "linear-gradient(135deg,#8a3a1a,#e67e22)" },
    { id: "red", bg: "linear-gradient(135deg,#8a1a1a,#e74c3c)" },
    { id: "teal", bg: "linear-gradient(135deg,#0a5c5c,#1abc9c)" },
    { id: "pink", bg: "linear-gradient(135deg,#8a1a5c,#e84393)" },
]

export function getAvatarDisplay(adminData) {
    const emoji = AVATARS.find(a => a.id === adminData?.avatar)?.emoji || null
    const colorObj = AVATAR_COLORS.find(c => c.id === adminData?.avatarColor) || AVATAR_COLORS[0]
    const initial = (adminData?.name || adminData?.email || "?")[0].toUpperCase()
    return { emoji, bg: colorObj.bg, initial }
}

export default function CoachProfileModal({ onClose, adminData, user }) {
    const { refreshRole } = useAuth()
    const [name, setName] = useState(adminData?.name || "")
    const [avatar, setAvatar] = useState(adminData?.avatar || "")
    const [avatarColor, setAvatarColor] = useState(adminData?.avatarColor || "green")
    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)

    const isHead = adminData?.role === 'head_coach'
    const currentEmoji = AVATARS.find(a => a.id === avatar)?.emoji || null
    const currentBg = AVATAR_COLORS.find(c => c.id === avatarColor)?.bg || AVATAR_COLORS[0].bg
    const initial = (name || adminData?.email || "?")[0].toUpperCase()

    const handleSave = async () => {
        if (!name.trim()) return
        setSaving(true)
        try {
            await setAdminRole(user.uid, adminData.email, adminData.role, name.trim(), avatar, avatarColor)
            await refreshRole()
            setSaved(true)
            setTimeout(() => setSaved(false), 2000)
        } catch (err) {
            console.error("Failed to save profile:", err)
        }
        setSaving(false)
    }

    return (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999, padding: 16 }} onClick={onClose}>
            <div onClick={e => e.stopPropagation()} style={{ background: "linear-gradient(145deg,#1a1a2e,#16213e)", borderRadius: 16, width: "100%", maxWidth: 420, boxShadow: "0 16px 64px rgba(0,0,0,0.6)", border: "1px solid rgba(255,255,255,0.1)", overflow: "hidden" }}>

                {/* Header with avatar preview */}
                <div style={{ padding: "28px 24px 20px", background: "linear-gradient(180deg, rgba(46,204,64,0.06) 0%, transparent 100%)", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", flexDirection: "column", alignItems: "center", position: "relative" }}>
                    <button onClick={onClose} style={{ position: "absolute", top: 14, right: 14, background: "rgba(255,255,255,0.08)", border: "none", borderRadius: 8, width: 30, height: 30, cursor: "pointer", color: "rgba(255,255,255,0.5)", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>

                    {/* Avatar Preview */}
                    <div style={{
                        width: 72, height: 72, borderRadius: 18, background: currentBg,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: currentEmoji ? 32 : 28, fontWeight: 800, color: "#fff",
                        boxShadow: "0 4px 16px rgba(0,0,0,0.3)", marginBottom: 12
                    }}>
                        {currentEmoji || initial}
                    </div>

                    <div style={{ color: "#fff", fontSize: 18, fontWeight: 700, textAlign: "center" }}>
                        {name || "Coach"}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
                        <span style={{
                            fontSize: 9, fontWeight: 700, letterSpacing: 1, padding: "3px 10px", borderRadius: 6,
                            background: isHead ? "rgba(255,170,0,0.12)" : "rgba(52,152,219,0.12)",
                            color: isHead ? "#ffaa00" : "#3498db",
                        }}>{isHead ? "HEAD COACH" : "ASSISTANT COACH"}</span>
                    </div>
                    <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 12, marginTop: 6 }}>{adminData?.email}</div>
                </div>

                <div style={{ padding: "18px 24px 24px" }}>
                    {/* Name */}
                    <div style={{ marginBottom: 16 }}>
                        <label style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, fontWeight: 600, letterSpacing: 0.5, display: "block", marginBottom: 6 }}>DISPLAY NAME</label>
                        <input value={name} onChange={e => setName(e.target.value)} placeholder="Your name..."
                            style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, padding: "11px 14px", color: "#fff", fontSize: 14, fontWeight: 600, outline: "none", boxSizing: "border-box" }} />
                    </div>

                    {/* Avatar Color */}
                    <div style={{ marginBottom: 16 }}>
                        <label style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, fontWeight: 600, letterSpacing: 0.5, display: "block", marginBottom: 8 }}>AVATAR COLOR</label>
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                            {AVATAR_COLORS.map(c => (
                                <button key={c.id} onClick={() => setAvatarColor(c.id)}
                                    style={{
                                        width: 36, height: 36, borderRadius: 10, background: c.bg, border: "none",
                                        cursor: "pointer", position: "relative",
                                        outline: avatarColor === c.id ? "2px solid #fff" : "2px solid transparent",
                                        outlineOffset: 2, transition: "outline 0.2s"
                                    }} />
                            ))}
                        </div>
                    </div>

                    {/* Avatar Icon */}
                    <div style={{ marginBottom: 20 }}>
                        <label style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, fontWeight: 600, letterSpacing: 0.5, display: "block", marginBottom: 8 }}>
                            AVATAR ICON
                            <span style={{ color: "rgba(255,255,255,0.2)", fontWeight: 400, marginLeft: 6 }}>optional — shows initial if none selected</span>
                        </label>
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                            {/* None option */}
                            <button onClick={() => setAvatar("")}
                                style={{
                                    width: 40, height: 40, borderRadius: 10, cursor: "pointer",
                                    background: avatar === "" ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.04)",
                                    border: avatar === "" ? "1px solid rgba(255,255,255,0.3)" : "1px solid rgba(255,255,255,0.08)",
                                    color: "rgba(255,255,255,0.4)", fontSize: 14, fontWeight: 800,
                                    display: "flex", alignItems: "center", justifyContent: "center"
                                }}>
                                {initial}
                            </button>
                            {AVATARS.map(a => (
                                <button key={a.id} onClick={() => setAvatar(a.id)}
                                    style={{
                                        width: 40, height: 40, borderRadius: 10, cursor: "pointer",
                                        background: avatar === a.id ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.04)",
                                        border: avatar === a.id ? "1px solid rgba(255,255,255,0.3)" : "1px solid rgba(255,255,255,0.08)",
                                        fontSize: 20, display: "flex", alignItems: "center", justifyContent: "center"
                                    }}>
                                    {a.emoji}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Info Row */}
                    <div style={{ background: "rgba(255,255,255,0.02)", borderRadius: 10, padding: "12px 14px", marginBottom: 18, border: "1px solid rgba(255,255,255,0.04)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0" }}>
                            <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 11 }}>Email</span>
                            <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 11, fontWeight: 600 }}>{adminData?.email}</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0" }}>
                            <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 11 }}>Role</span>
                            <span style={{ color: isHead ? "#ffaa00" : "#3498db", fontSize: 11, fontWeight: 600 }}>{isHead ? "Head Coach" : "Assistant Coach"}</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0" }}>
                            <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 11 }}>Member since</span>
                            <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 11, fontWeight: 600 }}>
                                {adminData?.createdAt ? new Date(adminData.createdAt).toLocaleDateString() : "—"}
                            </span>
                        </div>
                    </div>

                    {/* Save */}
                    <button onClick={handleSave} disabled={saving || !name.trim()}
                        style={{
                            width: "100%",
                            background: saved ? "linear-gradient(135deg,#1a6b1a,#2ecc40)" : "linear-gradient(135deg,#1a6b1a,#2ecc40)",
                            border: "none", borderRadius: 10, padding: "12px 20px",
                            color: "#fff", fontSize: 14, fontWeight: 700,
                            cursor: (saving || !name.trim()) ? "wait" : "pointer",
                            opacity: (saving || !name.trim()) ? 0.5 : 1,
                        }}>
                        {saved ? "✓ Saved!" : saving ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </div>
        </div>
    )
}