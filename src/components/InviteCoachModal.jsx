import { useState } from 'react'
import { createAccountWithoutSignIn, setAdminRole } from '../firebase'

export default function InviteCoachModal({ onClose, existingAdmins }) {
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [role, setRole] = useState("assistant_coach")
    const [error, setError] = useState("")
    const [success, setSuccess] = useState(false)
    const [submitting, setSubmitting] = useState(false)

    const handleInvite = async () => {
        if (!name.trim() || !email.trim() || !password.trim()) {
            setError("All fields are required.")
            return
        }
        if (password.length < 6) {
            setError("Password must be at least 6 characters.")
            return
        }
        // Check if email already exists
        if (existingAdmins.some(a => a.email?.toLowerCase() === email.toLowerCase())) {
            setError("This email is already a coach.")
            return
        }
        setError("")
        setSubmitting(true)
        try {
            // Create the Firebase auth account (without signing out the current user)
            const uid = await createAccountWithoutSignIn(email, password)
            // Set the admin role in Firestore
            await setAdminRole(uid, email, role, name.trim())
            setSuccess(true)
        } catch (err) {
            if (err.code === 'auth/email-already-in-use') {
                setError("This email already has an account. They need to log in and you can add them manually, or use a different email.")
            } else if (err.code === 'auth/invalid-email') {
                setError("Please enter a valid email address.")
            } else {
                setError(err.message)
            }
        }
        setSubmitting(false)
    }

    return (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999, padding: 16 }} onClick={onClose}>
            <div onClick={e => e.stopPropagation()} style={{ background: "linear-gradient(145deg,#1a1a2e,#16213e)", borderRadius: 16, width: "100%", maxWidth: 440, boxShadow: "0 16px 64px rgba(0,0,0,0.6)", border: "1px solid rgba(255,255,255,0.1)", overflow: "hidden" }}>

                <div style={{ padding: "22px 24px 14px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                    <h2 style={{ color: "#fff", fontSize: 18, fontWeight: 700, margin: "0 0 4px" }}>Invite a Coach</h2>
                    <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 12, margin: 0 }}>
                        Create an account for a new coaching staff member
                    </p>
                </div>

                <div style={{ padding: "18px 24px 24px" }}>
                    {success ? (
                        <div style={{ textAlign: "center", padding: "16px 0" }}>
                            <div style={{ width: 56, height: 56, borderRadius: 14, background: "rgba(46,204,64,0.15)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: 24 }}>✓</div>
                            <h3 style={{ color: "#fff", fontSize: 16, fontWeight: 700, margin: "0 0 6px" }}>Coach Added!</h3>
                            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, margin: "0 0 6px" }}>
                                <strong style={{ color: "#fff" }}>{name}</strong> has been added as {role === 'head_coach' ? 'a Head Coach' : 'an Assistant Coach'}.
                            </p>
                            <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 12, margin: "0 0 20px" }}>
                                They can sign in with:<br />
                                <strong style={{ color: "rgba(255,255,255,0.6)" }}>{email}</strong>
                            </p>
                            <div style={{ display: "flex", gap: 8 }}>
                                <button onClick={onClose}
                                    style={{ flex: 1, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "10px 16px", color: "rgba(255,255,255,0.6)", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                                    Done
                                </button>
                                <button onClick={() => { setSuccess(false); setName(""); setEmail(""); setPassword(""); setError("") }}
                                    style={{ flex: 1, background: "linear-gradient(135deg,#1a6b1a,#2ecc40)", border: "none", borderRadius: 10, padding: "10px 16px", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                                    Invite Another
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Name */}
                            <div style={{ marginBottom: 14 }}>
                                <label style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, fontWeight: 600, letterSpacing: 0.5, display: "block", marginBottom: 6 }}>COACH NAME</label>
                                <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Coach Sarah"
                                    style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, padding: "11px 14px", color: "#fff", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
                            </div>

                            {/* Email */}
                            <div style={{ marginBottom: 14 }}>
                                <label style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, fontWeight: 600, letterSpacing: 0.5, display: "block", marginBottom: 6 }}>EMAIL</label>
                                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="coach@school.com"
                                    style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, padding: "11px 14px", color: "#fff", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
                            </div>

                            {/* Password */}
                            <div style={{ marginBottom: 14 }}>
                                <label style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, fontWeight: 600, letterSpacing: 0.5, display: "block", marginBottom: 6 }}>TEMPORARY PASSWORD</label>
                                <input type="text" value={password} onChange={e => setPassword(e.target.value)} placeholder="Min 6 characters"
                                    style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, padding: "11px 14px", color: "#fff", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
                                <p style={{ color: "rgba(255,255,255,0.2)", fontSize: 10, margin: "4px 0 0" }}>
                                    Share this with the coach so they can sign in. They can change it later.
                                </p>
                            </div>

                            {/* Role Selection */}
                            <div style={{ marginBottom: 18 }}>
                                <label style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, fontWeight: 600, letterSpacing: 0.5, display: "block", marginBottom: 8 }}>ROLE</label>
                                <div style={{ display: "flex", gap: 8 }}>
                                    {[
                                        { value: "assistant_coach", label: "Assistant Coach", desc: "Edit ratings", color: "#3498db" },
                                        { value: "head_coach", label: "Head Coach", desc: "Full access", color: "#ffaa00" },
                                    ].map(r => (
                                        <button key={r.value} onClick={() => setRole(r.value)}
                                            style={{
                                                flex: 1, textAlign: "left", padding: "12px 14px", borderRadius: 10, cursor: "pointer",
                                                background: role === r.value ? (r.value === 'head_coach' ? "rgba(255,170,0,0.08)" : "rgba(52,152,219,0.08)") : "rgba(255,255,255,0.03)",
                                                border: role === r.value ? `1px solid ${r.color}44` : "1px solid rgba(255,255,255,0.06)",
                                            }}>
                                            <div style={{ color: role === r.value ? r.color : "rgba(255,255,255,0.5)", fontSize: 12, fontWeight: 700 }}>{r.label}</div>
                                            <div style={{ color: "rgba(255,255,255,0.25)", fontSize: 10, marginTop: 2 }}>{r.desc}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Error */}
                            {error && (
                                <div style={{ background: "rgba(231,76,60,0.1)", border: "1px solid rgba(231,76,60,0.2)", borderRadius: 8, padding: "8px 12px", marginBottom: 14 }}>
                                    <p style={{ color: "#e74c3c", fontSize: 12, fontWeight: 600, margin: 0 }}>{error}</p>
                                </div>
                            )}

                            {/* Actions */}
                            <div style={{ display: "flex", gap: 8 }}>
                                <button onClick={onClose}
                                    style={{ flex: 1, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "11px 16px", color: "rgba(255,255,255,0.5)", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                                    Cancel
                                </button>
                                <button onClick={handleInvite} disabled={submitting}
                                    style={{
                                        flex: 1, background: "linear-gradient(135deg,#1a6b1a,#2ecc40)",
                                        border: "none", borderRadius: 10, padding: "11px 16px",
                                        color: "#fff", fontSize: 13, fontWeight: 700, cursor: submitting ? "wait" : "pointer",
                                        opacity: submitting ? 0.6 : 1
                                    }}>
                                    {submitting ? "Creating..." : "Create Account"}
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}