import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { subscribeClubSettings, subscribeNews, subscribeMatches, subscribeTeams, subscribePlayers } from '../firebase'

export default function HomePage() {
  const navigate = useNavigate()
  const [club, setClub] = useState({ clubName: "Hub FC", motto: "", about: "", primaryColor: "#2ecc40", logoEmoji: "⚽" })
  const [news, setNews] = useState([])
  const [matches, setMatches] = useState([])
  const [teams, setTeams] = useState([])
  const [players, setPlayers] = useState([])

  useEffect(() => {
    const u1 = subscribeClubSettings(setClub)
    const u2 = subscribeNews(setNews)
    const u3 = subscribeMatches(setMatches)
    const u4 = subscribeTeams(setTeams)
    const u5 = subscribePlayers(setPlayers)
    return () => { u1(); u2(); u3(); u4(); u5() }
  }, [])

  const todayStr = new Date().toISOString().slice(0, 10)

  const publishedNews = useMemo(() =>
    [...news].filter(n => n.published).sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 6)
  , [news])

  const recentResults = useMemo(() =>
    [...matches]
      .filter(m => m.goalsFor !== null && m.goalsFor !== undefined)
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 5)
  , [matches])

  const upcomingMatches = useMemo(() =>
    [...matches]
      .filter(m => m.date >= todayStr && (m.goalsFor === null || m.goalsFor === undefined))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 3)
  , [matches, todayStr])

  const teamMap = useMemo(() => { const m = {}; teams.forEach(t => m[t.id] = t); return m }, [teams])

  const getResult = (m) => {
    if (m.goalsFor > m.goalsAgainst) return { r: "W", c: "#2ecc40" }
    if (m.goalsFor < m.goalsAgainst) return { r: "L", c: "#e74c3c" }
    return { r: "D", c: "#e8b930" }
  }

  const pc = club.primaryColor || "#2ecc40"

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a1a", fontFamily: "system-ui" }}>

      {/* Nav Bar */}
      <div style={{ padding: "12px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.04)", maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }} onClick={() => navigate('/')}>
          <span style={{ fontSize: 24 }}>{club.logoEmoji || "⚽"}</span>
          <span style={{ color: "#fff", fontSize: 16, fontWeight: 800, letterSpacing: 0.5 }}>{club.clubName}</span>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <button onClick={() => navigate('/players')} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: "7px 14px", color: "rgba(255,255,255,0.5)", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>Player Ratings</button>
          <button onClick={() => navigate('/login')} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 8, padding: "7px 14px", color: "rgba(255,255,255,0.2)", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>Coach Login</button>
        </div>
      </div>

      {/* Hero Section */}
      <div style={{ padding: "60px 20px 50px", textAlign: "center", background: `linear-gradient(180deg, ${pc}08 0%, transparent 100%)` }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>{club.logoEmoji || "⚽"}</div>
        <h1 style={{ color: "#fff", fontSize: 42, fontWeight: 800, margin: "0 0 8px", letterSpacing: 1 }}>{club.clubName}</h1>
        {club.motto && (
          <p style={{ color: `${pc}cc`, fontSize: 16, fontWeight: 600, margin: "0 0 24px", fontStyle: "italic", letterSpacing: 0.5 }}>"{club.motto}"</p>
        )}
        {club.about && (
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, margin: "0 auto 28px", maxWidth: 600, lineHeight: 1.7 }}>{club.about}</p>
        )}
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <button onClick={() => navigate('/players')}
            style={{ background: `linear-gradient(135deg, ${pc}88, ${pc})`, border: "none", borderRadius: 10, padding: "12px 28px", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", letterSpacing: 0.5 }}>
            View Player Ratings
          </button>
          {matches.length > 0 && (
            <button onClick={() => navigate('/fixtures')}
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "12px 28px", color: "rgba(255,255,255,0.6)", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
              Fixtures & Results
            </button>
          )}
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 20px 60px" }}>

        {/* Quick Stats Bar */}
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginBottom: 40 }}>
          {[
            { label: "Players", value: players.length, icon: "👤" },
            { label: "Teams", value: teams.length, icon: "🏆" },
            { label: "Matches", value: matches.length, icon: "⚽" },
            { label: "Goals", value: matches.reduce((s, m) => s + (m.goalsFor || 0), 0), icon: "🥅" },
          ].map(s => (
            <div key={s.label} style={{ background: "rgba(255,255,255,0.03)", borderRadius: 12, padding: "16px 24px", textAlign: "center", border: "1px solid rgba(255,255,255,0.05)", minWidth: 110 }}>
              <div style={{ fontSize: 20, marginBottom: 4 }}>{s.icon}</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: "#fff" }}>{s.value}</div>
              <div style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.25)", letterSpacing: 1, marginTop: 2 }}>{s.label.toUpperCase()}</div>
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 20 }}>

          {/* News Section */}
          <div>
            <h2 style={{ color: "#fff", fontSize: 18, fontWeight: 800, margin: "0 0 14px", letterSpacing: 0.5 }}>Latest News</h2>
            {publishedNews.length === 0 && (
              <div style={{ background: "rgba(255,255,255,0.02)", borderRadius: 14, padding: "30px 20px", textAlign: "center", border: "1px solid rgba(255,255,255,0.04)" }}>
                <p style={{ color: "rgba(255,255,255,0.2)", fontSize: 13 }}>No news posted yet</p>
              </div>
            )}
            {publishedNews.map(post => (
              <div key={post.id} style={{
                background: "linear-gradient(145deg,#1a1a2e,#16213e)", borderRadius: 14,
                border: "1px solid rgba(255,255,255,0.06)", padding: "18px 20px", marginBottom: 12,
                cursor: post.content ? "pointer" : "default",
                transition: "border-color 0.2s",
              }}
                onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"}
                onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"}
                onClick={() => post.content && navigate(`/news/${post.id}`)}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  {post.category && (
                    <span style={{
                      fontSize: 9, fontWeight: 700, padding: "2px 8px", borderRadius: 4, letterSpacing: 0.8,
                      background: post.category === "Match Report" ? "rgba(155,89,182,0.12)" : post.category === "Announcement" ? "rgba(52,152,219,0.12)" : "rgba(46,204,64,0.12)",
                      color: post.category === "Match Report" ? "#9b59b6" : post.category === "Announcement" ? "#3498db" : pc,
                    }}>{post.category.toUpperCase()}</span>
                  )}
                  <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 10 }}>
                    {new Date(post.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
                <h3 style={{ color: "#fff", fontSize: 15, fontWeight: 700, margin: "0 0 6px", lineHeight: 1.3 }}>{post.title}</h3>
                {post.summary && (
                  <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 12, margin: 0, lineHeight: 1.6 }}>{post.summary}</p>
                )}
                {post.author && (
                  <div style={{ color: "rgba(255,255,255,0.15)", fontSize: 10, marginTop: 8 }}>by {post.author}</div>
                )}
              </div>
            ))}
          </div>

          {/* Matches Column */}
          <div>
            {/* Upcoming */}
            {upcomingMatches.length > 0 && (
              <>
                <h2 style={{ color: "#fff", fontSize: 18, fontWeight: 800, margin: "0 0 14px", letterSpacing: 0.5, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span>Upcoming Fixtures</span>
                  {matches.length > 3 && <button onClick={() => navigate('/fixtures')} style={{ background: "none", border: "none", color: pc, fontSize: 11, fontWeight: 600, cursor: "pointer" }}>View all →</button>}
                </h2>
                {upcomingMatches.map(m => {
                  const team = teamMap[m.teamId]
                  return (
                    <div key={m.id} style={{
                      background: "linear-gradient(145deg,#1a1a2e,#16213e)", borderRadius: 14,
                      border: "1px solid rgba(255,255,255,0.06)", padding: "16px 20px", marginBottom: 12,
                    }}>
                      <div style={{ color: "#fff", fontSize: 15, fontWeight: 700 }}>
                        {club.clubName} vs {m.opponent}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6, flexWrap: "wrap" }}>
                        <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 11 }}>
                          {new Date(m.date).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })} · {m.time}
                        </span>
                        <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 3, background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.25)" }}>{m.venue}</span>
                        {team && <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 3, background: "rgba(52,152,219,0.1)", color: "#3498db" }}>{team.name}</span>}
                      </div>
                    </div>
                  )
                })}
              </>
            )}

            {/* Recent Results */}
            {recentResults.length > 0 && (
              <>
                <h2 style={{ color: "#fff", fontSize: 18, fontWeight: 800, margin: "20px 0 14px", letterSpacing: 0.5, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span>Recent Results</span>
                  <button onClick={() => navigate('/fixtures')} style={{ background: "none", border: "none", color: pc, fontSize: 11, fontWeight: 600, cursor: "pointer" }}>View all →</button>
                </h2>
                {recentResults.map(m => {
                  const { r, c } = getResult(m)
                  const team = teamMap[m.teamId]
                  return (
                    <div key={m.id} style={{
                      background: "linear-gradient(145deg,#1a1a2e,#16213e)", borderRadius: 12,
                      border: "1px solid rgba(255,255,255,0.06)", padding: "12px 16px", marginBottom: 8,
                      display: "flex", alignItems: "center", gap: 12
                    }}>
                      <div style={{
                        width: 34, height: 34, borderRadius: 8, flexShrink: 0,
                        background: `${c}15`, border: `1px solid ${c}33`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 12, fontWeight: 800, color: c
                      }}>{r}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ color: "#fff", fontSize: 13, fontWeight: 700 }}>
                          <span style={{ color: c }}>{club.clubName} {m.goalsFor}</span>
                          <span style={{ color: "rgba(255,255,255,0.2)" }}> — </span>
                          <span>{m.goalsAgainst} {m.opponent}</span>
                        </div>
                        <div style={{ display: "flex", gap: 6, marginTop: 3 }}>
                          <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 10 }}>
                            {new Date(m.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                          </span>
                          {team && <span style={{ fontSize: 9, color: "rgba(52,152,219,0.5)" }}>{team.name}</span>}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </>
            )}

            {/* Teams List */}
            {teams.length > 0 && (
              <>
                <h2 style={{ color: "#fff", fontSize: 18, fontWeight: 800, margin: "20px 0 14px", letterSpacing: 0.5 }}>Our Teams</h2>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  {teams.map(t => {
                    const count = players.filter(p => (p.teamIds || (p.teamId ? [p.teamId] : [])).includes(t.id)).length
                    return (
                      <button key={t.id} onClick={() => navigate('/players')}
                        style={{
                          background: "linear-gradient(145deg,#1a1a2e,#16213e)", borderRadius: 12,
                          border: "1px solid rgba(255,255,255,0.06)", padding: "14px 18px",
                          cursor: "pointer", textAlign: "left", flex: "1 1 140px",
                          transition: "border-color 0.2s"
                        }}
                        onMouseEnter={e => e.currentTarget.style.borderColor = `${pc}44`}
                        onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"}
                      >
                        <div style={{ color: pc, fontSize: 12, fontWeight: 800, letterSpacing: 0.5 }}>{t.ageGroup}</div>
                        <div style={{ color: "#fff", fontSize: 14, fontWeight: 700, marginTop: 2 }}>{t.name}</div>
                        <div style={{ color: "rgba(255,255,255,0.25)", fontSize: 10, marginTop: 4 }}>{count} player{count !== 1 ? 's' : ''}</div>
                      </button>
                    )
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.04)", padding: "20px", textAlign: "center" }}>
        <p style={{ color: "rgba(255,255,255,0.15)", fontSize: 11, margin: 0 }}>
          {club.clubName} · Powered by Player Ratings
        </p>
      </div>
    </div>
  )
}