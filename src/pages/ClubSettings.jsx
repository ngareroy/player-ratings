import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { subscribeClubSettings, saveClubSettings, subscribeNews, saveNewsPost, removeNewsPost } from '../firebase'
import { useAuth } from '../contexts/AuthContext'

const CATEGORIES = ["Announcement", "Match Report", "Training Update", "Event", "General"]
const LOGO_EMOJIS = ["⚽", "🏆", "🦁", "🦅", "⭐", "🔥", "💪", "🎯", "🏟️", "👑", "🐺", "🐯"]
const COLORS = [
    { id: "#2ecc40", label: "Green" },
    { id: "#3498db", label: "Blue" },
    { id: "#e74c3c", label: "Red" },
    { id: "#9b59b6", label: "Purple" },
    { id: "#e67e22", label: "Orange" },
    { id: "#1abc9c", label: "Teal" },
    { id: "#ffaa00", label: "Gold" },
    { id: "#e84393", label: "Pink" },
]

function NewsEditorModal({ post, onSave, onClose, authorName }) {
    const [title, setTitle] = useState(post?.title || "")
    const [summary, setSummary] = useState(post?.summary || "")
    const [content, setContent] = useState(post?.content || "")
    const [category, setCategory] = useState(post?.category || "General")
    const [published, setPublished] = useState(post?.published ?? true)
    const [date, setDate] = useState(post?.date || new Date().toISOString().split('T')[0])
    const isNew = !post

    return (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999, padding: 16 }} onClick={onClose}>
            <div onClick={e => e.stopPropagation()} style={{ background: "linear-gradient(145deg,#1a1a2e,#16213e)", borderRadius: 16, width: "100%", maxWidth: 560, maxHeight: "90vh", overflow: "auto", boxShadow: "0 16px 64px rgba(0,0,0,0.6)", border: "1px solid rgba(255,255,255,0.1)", padding: 24 }}>
                <h2 style={{ color: "#fff", fontSize: 18, fontWeight: 700, margin: "0 0 18px" }}>{isNew ? "New Post" : "Edit Post"}</h2>

                <div style={{ marginBottom: 14 }}>
                    <label style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, fontWeight: 600, display: "block", marginBottom: 6 }}>TITLE</label>
                    <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Post title..."
                        style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, padding: "11px 14px", color: "#fff", fontSize: 14, fontWeight: 700, outline: "none", boxSizing: "border-box" }} />
                </div>

                <div style={{ display: "flex", gap: 12, marginBottom: 14 }}>
                    <div style={{ flex: 1 }}>
                        <label style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, fontWeight: 600, display: "block", marginBottom: 6 }}>CATEGORY</label>
                        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                            {CATEGORIES.map(c => (
                                <button key={c} onClick={() => setCategory(c)} style={{
                                    background: category === c ? "rgba(155,89,182,0.15)" : "rgba(255,255,255,0.04)",
                                    border: category === c ? "1px solid #9b59b6" : "1px solid rgba(255,255,255,0.1)",
                                    borderRadius: 6, padding: "4px 8px", color: category === c ? "#9b59b6" : "rgba(255,255,255,0.35)",
                                    fontSize: 9, fontWeight: 700, cursor: "pointer"
                                }}>{c}</button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, fontWeight: 600, display: "block", marginBottom: 6 }}>DATE</label>
                        <input type="date" value={date} onChange={e => setDate(e.target.value)}
                            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, padding: "9px 12px", color: "#fff", fontSize: 12, outline: "none", colorScheme: "dark" }} />
                    </div>
                </div>

                <div style={{ marginBottom: 14 }}>
                    <label style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, fontWeight: 600, display: "block", marginBottom: 6 }}>SUMMARY (shown on homepage cards)</label>
                    <input value={summary} onChange={e => setSummary(e.target.value)} placeholder="Brief description..."
                        style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, padding: "11px 14px", color: "#fff", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
                </div>

                <div style={{ marginBottom: 14 }}>
                    <label style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, fontWeight: 600, display: "block", marginBottom: 6 }}>FULL CONTENT</label>
                    <textarea value={content} onChange={e => setContent(e.target.value)} placeholder="Write your post here... Use line breaks for paragraphs."
                        rows={8} style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, padding: "11px 14px", color: "#fff", fontSize: 13, outline: "none", boxSizing: "border-box", resize: "vertical", fontFamily: "system-ui", lineHeight: 1.6 }} />
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
                    <button onClick={() => setPublished(!published)} style={{
                        width: 40, height: 22, borderRadius: 11, border: "none", cursor: "pointer",
                        background: published ? "#2ecc40" : "rgba(255,255,255,0.15)", position: "relative", transition: "background 0.2s"
                    }}>
                        <div style={{ width: 18, height: 18, borderRadius: "50%", background: "#fff", position: "absolute", top: 2, left: published ? 20 : 2, transition: "left 0.2s" }} />
                    </button>
                    <span style={{ color: published ? "#2ecc40" : "rgba(255,255,255,0.35)", fontSize: 12, fontWeight: 600 }}>
                        {published ? "Published — visible on homepage" : "Draft — hidden from homepage"}
                    </span>
                </div>

                <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={onClose} style={{ flex: 1, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "10px", color: "rgba(255,255,255,0.5)", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Cancel</button>
                    <button onClick={() => {
                        if (!title.trim()) return
                        onSave({
                            id: post?.id || Date.now().toString(),
                            title: title.trim(), summary: summary.trim(), content,
                            category, published, date,
                            author: post?.author || authorName,
                            createdAt: post?.createdAt || new Date().toISOString(),
                            updatedAt: new Date().toISOString(),
                        })
                    }} style={{ flex: 1, background: "linear-gradient(135deg,#1a6b1a,#2ecc40)", border: "none", borderRadius: 10, padding: "10px", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", opacity: title.trim() ? 1 : 0.4 }}>
                        {isNew ? "Publish" : "Save"}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default function ClubSettings() {
    const navigate = useNavigate()
    const { adminData } = useAuth()
    const [club, setClub] = useState(null)
    const [news, setNews] = useState([])
    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)
    const [newsModal, setNewsModal] = useState(null)
    const [confirmDelete, setConfirmDelete] = useState(null)

    useEffect(() => {
        const u1 = subscribeClubSettings(setClub)
        const u2 = subscribeNews(setNews)
        return () => { u1(); u2() }
    }, [])

    const updateClub = (key, val) => setClub(prev => ({ ...prev, [key]: val }))

    const handleSaveClub = async () => {
        setSaving(true)
        await saveClubSettings(club)
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
        setSaving(false)
    }

    const handleSavePost = async (post) => {
        await saveNewsPost(post)
        setNewsModal(null)
    }

    const handleDeletePost = async (id) => {
        await removeNewsPost(id)
        setConfirmDelete(null)
    }

    const sortedNews = [...news].sort((a, b) => new Date(b.date) - new Date(a.date))

    if (!club) {
        return (
            <div style={{ minHeight: "100vh", background: "#0a0a1a", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <p style={{ color: "rgba(255,255,255,0.4)", fontFamily: "system-ui" }}>Loading...</p>
            </div>
        )
    }

    return (
        <div style={{ minHeight: "100vh", background: "#0a0a1a", padding: "20px 12px", fontFamily: "system-ui" }}>
            <div style={{ maxWidth: 800, margin: "0 auto" }}>

                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
                    <button onClick={() => navigate('/admin/manage')} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "7px 14px", color: "rgba(255,255,255,0.5)", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>← Back</button>
                    <h1 style={{ color: "#fff", fontSize: 22, fontWeight: 800, margin: 0 }}>CLUB & NEWS</h1>
                </div>

                {/* Club Settings */}
                <div style={{ background: "linear-gradient(145deg,#1a1a2e,#16213e)", borderRadius: 16, border: "1px solid rgba(255,255,255,0.08)", padding: 24, marginBottom: 20 }}>
                    <h2 style={{ color: "#fff", fontSize: 16, fontWeight: 700, margin: "0 0 18px" }}>Club Settings</h2>

                    <div style={{ display: "flex", gap: 16, marginBottom: 16, flexWrap: "wrap" }}>
                        <div style={{ flex: "1 1 200px" }}>
                            <label style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, fontWeight: 600, display: "block", marginBottom: 6 }}>CLUB NAME</label>
                            <input value={club.clubName || ""} onChange={e => updateClub('clubName', e.target.value)} placeholder="Club name"
                                style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, padding: "11px 14px", color: "#fff", fontSize: 14, fontWeight: 700, outline: "none", boxSizing: "border-box" }} />
                        </div>
                        <div style={{ flex: "1 1 200px" }}>
                            <label style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, fontWeight: 600, display: "block", marginBottom: 6 }}>MOTTO</label>
                            <input value={club.motto || ""} onChange={e => updateClub('motto', e.target.value)} placeholder="Club motto or slogan"
                                style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, padding: "11px 14px", color: "#fff", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
                        </div>
                    </div>

                    <div style={{ marginBottom: 16 }}>
                        <label style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, fontWeight: 600, display: "block", marginBottom: 6 }}>ABOUT</label>
                        <textarea value={club.about || ""} onChange={e => updateClub('about', e.target.value)} placeholder="Brief description of your club..."
                            rows={3} style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, padding: "11px 14px", color: "#fff", fontSize: 13, outline: "none", boxSizing: "border-box", resize: "vertical", fontFamily: "system-ui" }} />
                    </div>

                    <div style={{ marginBottom: 16 }}>
                        <label style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, fontWeight: 600, display: "block", marginBottom: 8 }}>LOGO ICON</label>
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                            {LOGO_EMOJIS.map(e => (
                                <button key={e} onClick={() => updateClub('logoEmoji', e)} style={{
                                    width: 40, height: 40, borderRadius: 10, fontSize: 20, cursor: "pointer",
                                    background: club.logoEmoji === e ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.04)",
                                    border: club.logoEmoji === e ? "1px solid rgba(255,255,255,0.3)" : "1px solid rgba(255,255,255,0.08)",
                                    display: "flex", alignItems: "center", justifyContent: "center"
                                }}>{e}</button>
                            ))}
                        </div>
                    </div>

                    <div style={{ marginBottom: 18 }}>
                        <label style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, fontWeight: 600, display: "block", marginBottom: 8 }}>PRIMARY COLOR</label>
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                            {COLORS.map(c => (
                                <button key={c.id} onClick={() => updateClub('primaryColor', c.id)} style={{
                                    width: 36, height: 36, borderRadius: 10, background: c.id, border: "none", cursor: "pointer",
                                    outline: club.primaryColor === c.id ? "2px solid #fff" : "2px solid transparent", outlineOffset: 2
                                }} />
                            ))}
                        </div>
                    </div>

                    <button onClick={handleSaveClub} disabled={saving} style={{
                        background: saved ? "rgba(46,204,64,0.2)" : "linear-gradient(135deg,#1a6b1a,#2ecc40)",
                        border: saved ? "1px solid #2ecc40" : "none", borderRadius: 10, padding: "11px 24px",
                        color: "#fff", fontSize: 13, fontWeight: 700, cursor: saving ? "wait" : "pointer"
                    }}>{saved ? "✓ Saved!" : saving ? "Saving..." : "Save Club Settings"}</button>
                </div>

                {/* News Posts */}
                <div style={{ background: "linear-gradient(145deg,#1a1a2e,#16213e)", borderRadius: 16, border: "1px solid rgba(255,255,255,0.08)", overflow: "hidden" }}>
                    <div style={{ padding: "18px 22px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div>
                            <h2 style={{ color: "#fff", fontSize: 16, fontWeight: 700, margin: "0 0 2px" }}>News & Updates</h2>
                            <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 11, margin: 0 }}>{news.length} post{news.length !== 1 ? 's' : ''}</p>
                        </div>
                        <button onClick={() => setNewsModal("new")} style={{ background: "linear-gradient(135deg,#1a6b1a,#2ecc40)", border: "none", borderRadius: 8, padding: "8px 16px", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>+ New Post</button>
                    </div>

                    {sortedNews.length === 0 && (
                        <div style={{ padding: "40px 22px", textAlign: "center" }}>
                            <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 13 }}>No news posts yet</p>
                            <p style={{ color: "rgba(255,255,255,0.2)", fontSize: 11 }}>Create your first post to appear on the homepage</p>
                        </div>
                    )}

                    {sortedNews.map(post => (
                        <div key={post.id} style={{ padding: "14px 22px", borderBottom: "1px solid rgba(255,255,255,0.03)", display: "flex", alignItems: "center", gap: 12 }}>
                            <div style={{
                                width: 8, height: 8, borderRadius: "50%", flexShrink: 0,
                                background: post.published ? "#2ecc40" : "rgba(255,255,255,0.15)"
                            }} />
                            <div style={{ flex: 1 }}>
                                <div style={{ color: "#fff", fontSize: 14, fontWeight: 700 }}>{post.title}</div>
                                <div style={{ display: "flex", gap: 8, marginTop: 3, alignItems: "center", flexWrap: "wrap" }}>
                                    <span style={{ fontSize: 9, fontWeight: 700, padding: "1px 6px", borderRadius: 3, background: "rgba(155,89,182,0.1)", color: "rgba(155,89,182,0.6)" }}>{post.category}</span>
                                    <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 10 }}>{new Date(post.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                    <span style={{ color: "rgba(255,255,255,0.15)", fontSize: 9 }}>{post.published ? "Published" : "Draft"}</span>
                                </div>
                            </div>
                            <button onClick={() => setNewsModal(post)} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 6, padding: "5px 10px", color: "rgba(255,255,255,0.4)", fontSize: 10, cursor: "pointer" }}>Edit</button>
                            {confirmDelete === post.id ? (
                                <div style={{ display: "flex", gap: 4 }}>
                                    <button onClick={() => handleDeletePost(post.id)} style={{ background: "rgba(231,76,60,0.15)", border: "1px solid rgba(231,76,60,0.3)", borderRadius: 6, padding: "5px 8px", color: "#e74c3c", fontSize: 9, fontWeight: 700, cursor: "pointer" }}>Confirm</button>
                                    <button onClick={() => setConfirmDelete(null)} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 6, padding: "5px 8px", color: "rgba(255,255,255,0.3)", fontSize: 9, cursor: "pointer" }}>Cancel</button>
                                </div>
                            ) : (
                                <button onClick={() => setConfirmDelete(post.id)} style={{ background: "rgba(231,76,60,0.06)", border: "1px solid rgba(231,76,60,0.1)", borderRadius: 6, padding: "5px 8px", color: "rgba(231,76,60,0.5)", fontSize: 10, cursor: "pointer" }}>✕</button>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {newsModal && <NewsEditorModal post={newsModal === "new" ? null : newsModal} onSave={handleSavePost} onClose={() => setNewsModal(null)} authorName={adminData?.name || "Coach"} />}
        </div>
    )
}