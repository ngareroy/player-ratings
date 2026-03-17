import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { subscribeMatches, subscribeTeams, subscribeClubSettings, subscribeMatchStats, subscribePlayers } from '../firebase'

function MatchDetailModal({ match, club, teamMap, onClose }) {
  const [stats, setStats] = useState([])
  const [players, setPlayers] = useState([])

  useEffect(() => {
    const u1 = subscribeMatchStats(match.id, setStats)
    const u2 = subscribePlayers(setPlayers)
    return () => { u1(); u2() }
  }, [match.id])

  const playerMap = useMemo(() => { const m = {}; players.forEach(p => m[p.id] = p); return m }, [players])
  const sortedStats = [...stats].sort((a, b) => (b.goals || 0) - (a.goals || 0) || (b.assists || 0) - (a.assists || 0))
  const hasScore = match.goalsFor !== null && match.goalsFor !== undefined
  const team = teamMap[match.teamId]
  const motmPlayer = match.motm ? playerMap[match.motm] : null

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999, padding: 16 }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: "linear-gradient(145deg,#1a1a2e 0%,#16213e 40%,#0f3460 100%)", borderRadius: 20, width: "100%", maxWidth: 500, maxHeight: "85vh", overflow: "auto", boxShadow: "0 24px 80px rgba(0,0,0,0.7)", border: "1px solid rgba(255,255,255,0.1)" }}>

        {/* Header */}
        <div style={{ padding: "24px 24px 18px", borderBottom: "1px solid rgba(255,255,255,0.06)", position: "relative" }}>
          <button onClick={onClose} style={{ position: "absolute", top: 16, right: 16, background: "rgba(255,255,255,0.08)", border: "none", borderRadius: 8, width: 32, height: 32, cursor: "pointer", color: "rgba(255,255,255,0.5)", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>

          <div style={{ textAlign: "center" }}>
            <div style={{ color: "#fff", fontSize: hasScore ? 32 : 20, fontWeight: 800, fontFamily: "system-ui" }}>
              {hasScore ? `${match.goalsFor} — ${match.goalsAgainst}` : "vs"}
            </div>
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 16, marginTop: 8 }}>
              <span style={{ color: "#fff", fontSize: 14, fontWeight: 700 }}>{club.clubName}</span>
              <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 12 }}>vs</span>
              <span style={{ color: "#fff", fontSize: 14, fontWeight: 700 }}>{match.opponent}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
              <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 11 }}>
                {new Date(match.date + 'T00:00:00').toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })} · {match.time}
              </span>
              <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 8px", borderRadius: 4, background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.3)" }}>{match.venue}</span>
              <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 8px", borderRadius: 4, background: "rgba(155,89,182,0.1)", color: "rgba(155,89,182,0.6)" }}>{match.matchType}</span>
              {team && <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 8px", borderRadius: 4, background: "rgba(52,152,219,0.1)", color: "#3498db" }}>{team.name}</span>}
            </div>
          </div>
        </div>

        {/* MOTM */}
        {motmPlayer && (
          <div style={{ padding: "12px 24px", borderBottom: "1px solid rgba(255,255,255,0.04)", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <span style={{ fontSize: 16 }}>⭐</span>
            <span style={{ color: "#ffaa00", fontSize: 13, fontWeight: 700 }}>Man of the Match: {motmPlayer.name}</span>
          </div>
        )}

        {/* Match Report */}
        {match.report && (
          <div style={{ padding: "14px 24px", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.2)", letterSpacing: 1.5, marginBottom: 6 }}>MATCH REPORT</div>
            <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 13, margin: 0, lineHeight: 1.6 }}>{match.report}</p>
          </div>
        )}

        {/* Player Stats */}
        {sortedStats.length > 0 && (
          <div style={{ padding: "14px 24px 20px" }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.2)", letterSpacing: 1.5, marginBottom: 10 }}>PLAYER STATS</div>
            {sortedStats.map(s => {
              const player = playerMap[s.playerId]
              if (!player) return null
              const isMotm = match.motm === s.playerId
              return (
                <div key={s.playerId} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ color: "#fff", fontSize: 13, fontWeight: 700 }}>{player.name}</span>
                      {isMotm && <span style={{ fontSize: 10 }}>⭐</span>}
                    </div>
                    <div style={{ display: "flex", gap: 3, marginTop: 2 }}>
                      {(player.positions || []).slice(0, 2).map(p => (
                        <span key={p} style={{ fontSize: 8, fontWeight: 700, color: p === "GK" ? "#ffaa00" : "rgba(255,255,255,0.25)" }}>{p}</span>
                      ))}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    {s.minutes && <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>{s.minutes}'</span>}
                    {(s.goals || 0) > 0 && <span style={{ fontSize: 11, fontWeight: 800, color: "#2ecc40" }}>{s.goals > 1 ? `${s.goals}G` : "G"}</span>}
                    {(s.assists || 0) > 0 && <span style={{ fontSize: 11, fontWeight: 800, color: "#3498db" }}>{s.assists > 1 ? `${s.assists}A` : "A"}</span>}
                    {(s.saves || 0) > 0 && <span style={{ fontSize: 11, fontWeight: 800, color: "#1abc9c" }}>{s.saves}S</span>}
                    {s.cleanSheet && <span style={{ fontSize: 8, fontWeight: 700, color: "#2ecc40", background: "rgba(46,204,64,0.1)", padding: "1px 4px", borderRadius: 3 }}>CS</span>}
                    {(s.yellowCards || 0) > 0 && <div style={{ width: 10, height: 14, borderRadius: 2, background: "#e8b930" }} />}
                    {s.redCard && <div style={{ width: 10, height: 14, borderRadius: 2, background: "#e74c3c" }} />}
                    {s.rating && <span style={{ fontSize: 13, fontWeight: 800, color: s.rating >= 8 ? "#2ecc40" : s.rating >= 6 ? "#e8b930" : "#e74c3c", minWidth: 18, textAlign: "right" }}>{s.rating}</span>}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {sortedStats.length === 0 && (
          <div style={{ padding: "24px", textAlign: "center" }}>
            <p style={{ color: "rgba(255,255,255,0.25)", fontSize: 12 }}>No player stats recorded for this match</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function PublicFixtures() {
  const navigate = useNavigate()
  const [matches, setMatches] = useState([])
  const [teams, setTeams] = useState([])
  const [club, setClub] = useState({ clubName: "Hub FC", logoEmoji: "⚽", primaryColor: "#2ecc40" })
  const [filterTeam, setFilterTeam] = useState("all")
  const [selectedMatch, setSelectedMatch] = useState(null)

  useEffect(() => {
    const u1 = subscribeMatches(setMatches)
    const u2 = subscribeTeams(setTeams)
    const u3 = subscribeClubSettings(setClub)
    return () => { u1(); u2(); u3() }
  }, [])

  const teamMap = useMemo(() => { const m = {}; teams.forEach(t => m[t.id] = t); return m }, [teams])
  const todayStr = new Date().toISOString().slice(0, 10)

  const filtered = useMemo(() => {
    let list = [...matches]
    if (filterTeam !== "all") list = list.filter(m => m.teamId === filterTeam)
    return list.sort((a, b) => b.date.localeCompare(a.date))
  }, [matches, filterTeam])

  const upcoming = filtered.filter(m => m.date >= todayStr && (m.goalsFor === null || m.goalsFor === undefined))
  const results = filtered.filter(m => m.date < todayStr || (m.goalsFor !== null && m.goalsFor !== undefined))

  const getResult = (m) => {
    if (m.goalsFor === null || m.goalsFor === undefined) return null
    if (m.goalsFor > m.goalsAgainst) return { r: "W", c: "#2ecc40" }
    if (m.goalsFor < m.goalsAgainst) return { r: "L", c: "#e74c3c" }
    return { r: "D", c: "#e8b930" }
  }

  const pc = club.primaryColor || "#2ecc40"

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a1a", fontFamily: "system-ui" }}>
      {/* Nav */}
      <div style={{ padding: "12px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.04)", maxWidth: 900, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }} onClick={() => navigate('/')}>
          <span style={{ fontSize: 20 }}>{club.logoEmoji}</span>
          <span style={{ color: "#fff", fontSize: 14, fontWeight: 800 }}>{club.clubName}</span>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <button onClick={() => navigate('/players')} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: "6px 14px", color: "rgba(255,255,255,0.4)", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>Player Ratings</button>
          <button onClick={() => navigate('/login')} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 8, padding: "6px 14px", color: "rgba(255,255,255,0.2)", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>Coach Login</button>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px 20px 60px" }}>
        <h1 style={{ color: "#fff", fontSize: 28, fontWeight: 800, margin: "0 0 4px", textAlign: "center", letterSpacing: 1 }}>FIXTURES & RESULTS</h1>
        <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 11, textAlign: "center", margin: "0 0 20px", letterSpacing: 2 }}>
          {matches.length} MATCH{matches.length !== 1 ? "ES" : ""}
        </p>

        {/* Team Filter */}
        {teams.length > 0 && (
          <div style={{ display: "flex", justifyContent: "center", gap: 6, flexWrap: "wrap", marginBottom: 20 }}>
            <button onClick={() => setFilterTeam("all")} style={{
              background: filterTeam === "all" ? `${pc}33` : "rgba(255,255,255,0.04)",
              border: filterTeam === "all" ? `1px solid ${pc}` : "1px solid rgba(255,255,255,0.08)",
              borderRadius: 6, padding: "5px 12px", color: filterTeam === "all" ? pc : "rgba(255,255,255,0.35)",
              fontSize: 11, fontWeight: 700, cursor: "pointer"
            }}>All</button>
            {teams.map(t => (
              <button key={t.id} onClick={() => setFilterTeam(t.id)} style={{
                background: filterTeam === t.id ? `${pc}33` : "rgba(255,255,255,0.04)",
                border: filterTeam === t.id ? `1px solid ${pc}` : "1px solid rgba(255,255,255,0.08)",
                borderRadius: 6, padding: "5px 12px", color: filterTeam === t.id ? pc : "rgba(255,255,255,0.35)",
                fontSize: 11, fontWeight: 700, cursor: "pointer"
              }}>{t.name}</button>
            ))}
          </div>
        )}

        {/* Upcoming */}
        {upcoming.length > 0 && (
          <div style={{ background: "linear-gradient(145deg,#1a1a2e,#16213e)", borderRadius: 16, border: "1px solid rgba(255,255,255,0.08)", overflow: "hidden", marginBottom: 16 }}>
            <div style={{ padding: "14px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <h2 style={{ color: "#fff", fontSize: 15, fontWeight: 700, margin: 0 }}>Upcoming ({upcoming.length})</h2>
            </div>
            {upcoming.map(m => {
              const team = teamMap[m.teamId]
              return (
                <div key={m.id} onClick={() => setSelectedMatch(m)} style={{ padding: "14px 20px", borderBottom: "1px solid rgba(255,255,255,0.03)", display: "flex", alignItems: "center", gap: 12, cursor: "pointer", transition: "background 0.2s" }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.02)"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <div style={{ width: 38, height: 38, borderRadius: 8, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, flexDirection: "column" }}>
                    <span style={{ fontSize: 13, fontWeight: 800, color: "rgba(255,255,255,0.5)", lineHeight: 1 }}>{new Date(m.date + 'T00:00:00').getDate()}</span>
                    <span style={{ fontSize: 8, fontWeight: 700, color: "rgba(255,255,255,0.2)", textTransform: "uppercase" }}>{new Date(m.date + 'T00:00:00').toLocaleDateString('en-GB', { month: 'short' })}</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: "#fff", fontSize: 14, fontWeight: 700 }}>{club.clubName} vs {m.opponent}</div>
                    <div style={{ display: "flex", gap: 8, marginTop: 3, flexWrap: "wrap" }}>
                      <span style={{ color: "rgba(255,255,255,0.25)", fontSize: 10 }}>{m.time} · {m.venue}</span>
                      {team && <span style={{ fontSize: 9, fontWeight: 700, color: "#3498db" }}>{team.name}</span>}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Results */}
        <div style={{ background: "linear-gradient(145deg,#1a1a2e,#16213e)", borderRadius: 16, border: "1px solid rgba(255,255,255,0.08)", overflow: "hidden" }}>
          <div style={{ padding: "14px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <h2 style={{ color: "#fff", fontSize: 15, fontWeight: 700, margin: 0 }}>
              {results.length > 0 ? `Results (${results.length})` : "No results yet"}
            </h2>
          </div>
          {results.length === 0 && filtered.length === 0 && (
            <div style={{ padding: "40px 20px", textAlign: "center" }}>
              <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 13 }}>No matches yet</p>
            </div>
          )}
          {results.map(m => {
            const res = getResult(m)
            const team = teamMap[m.teamId]
            const hasScore = m.goalsFor !== null && m.goalsFor !== undefined
            return (
              <div key={m.id} onClick={() => setSelectedMatch(m)} style={{ padding: "12px 20px", borderBottom: "1px solid rgba(255,255,255,0.03)", display: "flex", alignItems: "center", gap: 12, cursor: "pointer", transition: "background 0.2s" }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.02)"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                <div style={{
                  width: 34, height: 34, borderRadius: 8, flexShrink: 0,
                  background: res ? `${res.c}15` : "rgba(255,255,255,0.04)",
                  border: res ? `1px solid ${res.c}33` : "1px solid rgba(255,255,255,0.08)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 12, fontWeight: 800, color: res ? res.c : "rgba(255,255,255,0.15)"
                }}>{res ? res.r : "—"}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ color: "#fff", fontSize: 13, fontWeight: 700 }}>
                    {hasScore ? (
                      <><span style={{ color: res?.c }}>{club.clubName} {m.goalsFor}</span> <span style={{ color: "rgba(255,255,255,0.2)" }}>—</span> {m.goalsAgainst} {m.opponent}</>
                    ) : (
                      <>{club.clubName} vs {m.opponent}</>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: 6, marginTop: 3, flexWrap: "wrap" }}>
                    <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 10 }}>
                      {new Date(m.date + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} · {m.venue}
                    </span>
                    <span style={{ fontSize: 9, fontWeight: 700, color: "rgba(155,89,182,0.5)" }}>{m.matchType}</span>
                    {team && <span style={{ fontSize: 9, fontWeight: 700, color: "rgba(52,152,219,0.5)" }}>{team.name}</span>}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {selectedMatch && (
        <MatchDetailModal match={selectedMatch} club={club} teamMap={teamMap} onClose={() => setSelectedMatch(null)} />
      )}
    </div>
  )
}