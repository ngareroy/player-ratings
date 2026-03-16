import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { subscribeNews, subscribeClubSettings } from '../firebase'

export default function NewsDetail() {
    const { postId } = useParams()
    const navigate = useNavigate()
    const [post, setPost] = useState(null)
    const [club, setClub] = useState({ clubName: "Hub FC", logoEmoji: "⚽" })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const u1 = subscribeNews(list => {
            const found = list.find(p => p.id === postId)
            setPost(found || null)
            setLoading(false)
        })
        const u2 = subscribeClubSettings(setClub)
        return () => { u1(); u2() }
    }, [postId])

    if (loading) {
        return (
            <div style={{ minHeight: "100vh", background: "#0a0a1a", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <p style={{ color: "rgba(255,255,255,0.4)", fontFamily: "system-ui", fontSize: 14 }}>Loading...</p>
            </div>
        )
    }

    if (!post) {
        return (
            <div style={{ minHeight: "100vh", background: "#0a0a1a", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16, fontFamily: "system-ui" }}>
                <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 16 }}>Post not found</p>
                <button onClick={() => navigate('/')} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "8px 20px", color: "rgba(255,255,255,0.5)", fontSize: 13, cursor: "pointer" }}>← Back to Home</button>
            </div>
        )
    }

    const pc = club.primaryColor || "#2ecc40"

    return (
        <div style={{ minHeight: "100vh", background: "#0a0a1a", fontFamily: "system-ui" }}>
            {/* Nav */}
            <div style={{ padding: "12px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.04)", maxWidth: 800, margin: "0 auto" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }} onClick={() => navigate('/')}>
                    <span style={{ fontSize: 20 }}>{club.logoEmoji}</span>
                    <span style={{ color: "#fff", fontSize: 14, fontWeight: 800 }}>{club.clubName}</span>
                </div>
                <button onClick={() => navigate('/')} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: "6px 14px", color: "rgba(255,255,255,0.4)", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>← Back</button>
            </div>

            {/* Article */}
            <div style={{ maxWidth: 700, margin: "0 auto", padding: "40px 20px 60px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                    {post.category && (
                        <span style={{
                            fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 4, letterSpacing: 0.8,
                            background: post.category === "Match Report" ? "rgba(155,89,182,0.12)" : post.category === "Announcement" ? "rgba(52,152,219,0.12)" : `${pc}18`,
                            color: post.category === "Match Report" ? "#9b59b6" : post.category === "Announcement" ? "#3498db" : pc,
                        }}>{post.category.toUpperCase()}</span>
                    )}
                    <span style={{ color: "rgba(255,255,255,0.25)", fontSize: 11 }}>
                        {new Date(post.date).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                </div>

                <h1 style={{ color: "#fff", fontSize: 30, fontWeight: 800, margin: "0 0 12px", lineHeight: 1.3 }}>{post.title}</h1>

                {post.author && (
                    <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 13, margin: "0 0 30px" }}>by {post.author}</p>
                )}

                {/* Content */}
                <div style={{ color: "rgba(255,255,255,0.55)", fontSize: 15, lineHeight: 1.8 }}>
                    {(post.content || "").split('\n').map((para, i) => (
                        para.trim() ? <p key={i} style={{ margin: "0 0 16px" }}>{para}</p> : <br key={i} />
                    ))}
                </div>
            </div>
        </div>
    )
}