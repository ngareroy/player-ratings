import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { loginWithEmail, registerWithEmail, loginWithGoogle, getAdminCount, setAdminRole } from '../firebase'

export default function LoginPage() {
  const { user, isAdmin, loading } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [error, setError] = useState("")
  const [isSetup, setIsSetup] = useState(false)
  const [checkingSetup, setCheckingSetup] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  // "idle" = show form, "authenticating" = show spinner, "denied" = show denied
  const [stage, setStage] = useState("idle")

  useEffect(() => {
    (async () => {
      try {
        const count = await getAdminCount()
        setIsSetup(count === 0)
      } catch (err) {
        setIsSetup(false)
      }
      setCheckingSetup(false)
    })()
  }, [])

  // Core routing logic
  useEffect(() => {
    if (loading) return
    if (user && isAdmin) {
      navigate('/admin', { replace: true })
      return
    }
    if (user && !isAdmin && stage === "authenticating") {
      // We just logged in but no role found — wait 3s then show denied
      const timer = setTimeout(() => setStage("denied"), 3000)
      return () => clearTimeout(timer)
    }
    // If user was already logged in without admin (e.g. page refresh)
    if (user && !isAdmin && stage === "idle") {
      setStage("denied")
    }
  }, [user, isAdmin, loading, stage, navigate])

  const handleEmailLogin = async () => {
    if (!email.trim() || !password.trim()) return
    setError("")
    setSubmitting(true)
    setStage("authenticating")
    try {
      if (isSetup) {
        if (!name.trim()) { setError("Please enter your name."); setSubmitting(false); setStage("idle"); return }
        const cred = await registerWithEmail(email, password)
        await setAdminRole(cred.user.uid, email, 'head_coach', name.trim())
        window.location.reload()
        return
      }
      await loginWithEmail(email, password)
    } catch (err) {
      setStage("idle")
      if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        setError("Invalid email or password.")
      } else if (err.code === 'auth/email-already-in-use') {
        setError("This email is already registered. Try signing in.")
      } else if (err.code === 'auth/weak-password') {
        setError("Password must be at least 6 characters.")
      } else {
        setError(err.message)
      }
    }
    setSubmitting(false)
  }

  const handleGoogleLogin = async () => {
    setError("")
    setSubmitting(true)
    setStage("authenticating")
    try {
      const cred = await loginWithGoogle()
      if (isSetup) {
        await setAdminRole(cred.user.uid, cred.user.email, 'head_coach', cred.user.displayName || 'Head Coach')
        window.location.reload()
        return
      }
    } catch (err) {
      setStage("idle")
      if (err.code !== 'auth/popup-closed-by-user') {
        setError(err.message)
      }
    }
    setSubmitting(false)
  }

  const handleTryAnother = async () => {
    setStage("idle")
    const { logout } = await import('../firebase')
    await logout()
  }

  // Show spinner during: initial load, setup check, or active authentication
  if (loading || checkingSetup || stage === "authenticating") {
    return (
      <div style={{ minHeight: "100vh", background: "#0a0a1a", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12 }}>
        <div style={{ width: 36, height: 36, border: "3px solid rgba(255,255,255,0.08)", borderTopColor: "#2ecc40", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        <p style={{ color: "rgba(255,255,255,0.4)", fontFamily: "system-ui", fontSize: 13 }}>
          {stage === "authenticating" ? "Signing in..." : "Loading..."}
        </p>
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    )
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a1a", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, fontFamily: "system-ui" }}>
      <div style={{ width: "100%", maxWidth: 400 }}>

        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <h1 style={{ color: "#fff", fontSize: 28, fontWeight: 800, margin: "0 0 4px", letterSpacing: 1 }}>PLAYER RATINGS</h1>
          <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 12, letterSpacing: 2, margin: 0 }}>
            {isSetup ? "FIRST TIME SETUP" : "COACH LOGIN"}
          </p>
        </div>

        <div style={{
          background: "linear-gradient(145deg,#1a1a2e,#16213e)",
          borderRadius: 16, padding: 28,
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.4)"
        }}>

          {stage === "denied" ? (
            <div style={{ textAlign: "center" }}>
              <div style={{ width: 56, height: 56, borderRadius: 14, background: "rgba(231,76,60,0.15)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: 24 }}>🚫</div>
              <h2 style={{ color: "#fff", fontSize: 18, fontWeight: 700, margin: "0 0 8px" }}>Access Denied</h2>
              <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, margin: "0 0 20px", lineHeight: 1.5 }}>
                Your account doesn't have admin access. Contact your Head Coach to get an invite.
              </p>
              <p style={{ color: "rgba(255,255,255,0.25)", fontSize: 11, margin: "0 0 16px" }}>
                Signed in as {user?.email}
              </p>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={handleTryAnother}
                  style={{ flex: 1, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "10px 16px", color: "rgba(255,255,255,0.6)", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                  Try Another Account
                </button>
                <button onClick={() => navigate('/')}
                  style={{ flex: 1, background: "rgba(46,204,64,0.1)", border: "1px solid rgba(46,204,64,0.2)", borderRadius: 10, padding: "10px 16px", color: "#2ecc40", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                  Go to Home
                </button>
              </div>
            </div>
          ) : (
            <>
              {isSetup && (
                <div style={{ background: "rgba(46,204,64,0.08)", border: "1px solid rgba(46,204,64,0.15)", borderRadius: 10, padding: "12px 14px", marginBottom: 20 }}>
                  <p style={{ color: "#2ecc40", fontSize: 12, fontWeight: 600, margin: 0, lineHeight: 1.5 }}>
                    Welcome! No admin accounts exist yet. Create your Head Coach account below to get started.
                  </p>
                </div>
              )}

              {isSetup && (
                <div style={{ marginBottom: 12 }}>
                  <label style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, fontWeight: 600, letterSpacing: 0.5, display: "block", marginBottom: 6 }}>YOUR NAME</label>
                  <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Coach Roy"
                    style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, padding: "11px 14px", color: "#fff", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
                </div>
              )}

              <div style={{ marginBottom: 12 }}>
                <label style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, fontWeight: 600, letterSpacing: 0.5, display: "block", marginBottom: 6 }}>EMAIL</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="coach@school.com"
                  style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, padding: "11px 14px", color: "#fff", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, fontWeight: 600, letterSpacing: 0.5, display: "block", marginBottom: 6 }}>PASSWORD</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Min 6 characters"
                  onKeyDown={e => { if (e.key === 'Enter') handleEmailLogin() }}
                  style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, padding: "11px 14px", color: "#fff", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
              </div>

              {error && (
                <div style={{ background: "rgba(231,76,60,0.1)", border: "1px solid rgba(231,76,60,0.2)", borderRadius: 8, padding: "8px 12px", marginBottom: 14 }}>
                  <p style={{ color: "#e74c3c", fontSize: 12, fontWeight: 600, margin: 0 }}>{error}</p>
                </div>
              )}

              <button onClick={handleEmailLogin} disabled={submitting}
                style={{
                  width: "100%", background: "linear-gradient(135deg,#1a6b1a,#2ecc40)",
                  border: "none", borderRadius: 10, padding: "12px 20px",
                  color: "#fff", fontSize: 14, fontWeight: 700, cursor: submitting ? "wait" : "pointer",
                  marginBottom: 12, opacity: submitting ? 0.6 : 1
                }}>
                {isSetup ? "Create Head Coach Account" : "Sign In"}
              </button>

              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.08)" }} />
                <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 11, fontWeight: 600 }}>OR</span>
                <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.08)" }} />
              </div>

              <button onClick={handleGoogleLogin} disabled={submitting}
                style={{
                  width: "100%", background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10,
                  padding: "11px 20px", color: "#fff", fontSize: 13, fontWeight: 600,
                  cursor: submitting ? "wait" : "pointer", display: "flex",
                  alignItems: "center", justifyContent: "center", gap: 10,
                  opacity: submitting ? 0.6 : 1
                }}>
                <svg width="18" height="18" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                </svg>
                {isSetup ? "Set Up with Google" : "Sign In with Google"}
              </button>

              <button onClick={() => navigate('/')}
                style={{
                  width: "100%", background: "transparent", border: "none",
                  padding: "12px 20px", color: "rgba(255,255,255,0.3)",
                  fontSize: 12, fontWeight: 600, cursor: "pointer", marginTop: 8,
                  letterSpacing: 0.5
                }}>
                ← Back to Home
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}