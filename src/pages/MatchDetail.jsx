import { useState, useEffect, useMemo, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { subscribeMatches, subscribePlayers, subscribeMatchStats, subscribeTeams, saveMatchStat, saveMatch, subscribeClubSettings } from '../firebase'
import { getRatingColor } from '../utils'

const STAT_FIELDS = [
  { key: "minutes", label: "Min", type: "number", max: 120, w: 48 },
  { key: "goals", label: "Goals", type: "number", max: 20, w: 48 },
  { key: "assists", label: "Assists", type: "number", max: 20, w: 48 },
  { key: "saves", label: "Saves", type: "number", max: 30, w: 48, gkOnly: true },
  { key: "cleanSheet", label: "CS", type: "toggle", w: 36, gkOnly: true },
  { key: "yellowCards", label: "YC", type: "number", max: 2, w: 36 },
  { key: "redCard", label: "RC", type: "toggle", w: 36 },
  { key: "rating", label: "Rating", type: "rating", w: 48 },
]

export default function MatchDetail() {
  const { matchId } = useParams()
  const navigate = useNavigate()
  const [match, setMatch] = useState(null)
  const [players, setPlayers] = useState([])
  const [teams, setTeams] = useState([])
  const [stats, setStats] = useState({})
  const [squad, setSquad] = useState(new Set())
  const [motm, setMotm] = useState("")
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [club, setClub] = useState({ clubName: "Hub FC" })

  useEffect(() => {
    const u1 = subscribeMatches(list => {
      const m = list.find(x => x.id === matchId)
      if (m) { setMatch(m); setMotm(m.motm || "") }
    })
    const u2 = subscribePlayers(setPlayers)
    const u3 = subscribeTeams(setTeams)
    const u4 = subscribeMatchStats(matchId, (list) => {
      const map = {}
      const sq = new Set()
      list.forEach(s => { map[s.playerId] = s; sq.add(s.playerId) })
      setStats(map)
      setSquad(sq)
    })
    const u5 = subscribeClubSettings(setClub)
    return () => { u1(); u2(); u3(); u4(); u5() }
  }, [matchId])

  const teamPlayers = useMemo(() => {
    if (!match) return []
    return players.filter(p => {
      const ids = p.teamIds || (p.teamId ? [p.teamId] : [])
      return ids.includes(match.teamId)
    }).sort((a, b) => a.name.localeCompare(b.name))
  }, [players, match])

  const otherPlayers = useMemo(() => {
    if (!match) return []
    const teamSet = new Set(teamPlayers.map(p => p.id))
    return players.filter(p => squad.has(p.id) && !teamSet.has(p.id))
  }, [players, teamPlayers, squad, match])

  const allSquadPlayers = useMemo(() => [...teamPlayers, ...otherPlayers], [teamPlayers, otherPlayers])

  const toggleSquad = (pid) => {
    setSquad(prev => {
      const next = new Set(prev)
      if (next.has(pid)) next.delete(pid)
      else next.add(pid)
      return next
    })
  }

  const updateStat = (pid, key, val) => {
    setStats(prev => ({
      ...prev,
      [pid]: { ...prev[pid], matchId, playerId: pid, [key]: val }
    }))
  }

  const handleSaveAll = useCallback(async () => {
    setSaving(true)
    try {
      const promises = []
      squad.forEach(pid => {
        const s = stats[pid] || {}
        promises.push(saveMatchStat({ ...s, matchId, playerId: pid, id: `${matchId}_${pid}` }))
      })
      if (motm !== (match?.motm || "")) {
        promises.push(saveMatch({ ...match, motm }))
      }
      await Promise.all(promises)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) { console.error(err) }
    setSaving(false)
  }, [squad, stats, matchId, motm, match])

  if (!match) {
    return (
      <div style={{ minHeight: "100vh", background: "#0a0a1a", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "rgba(255,255,255,0.4)", fontFamily: "system-ui" }}>Loading match...</p>
      </div>
    )
  }

  const teamInfo = teams.find(t => t.id === match.teamId)
  const hasScore = match.goalsFor !== null && match.goalsAgainst !== null

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a1a", padding: "20px 12px", fontFamily: "system-ui" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <button onClick={() => navigate('/admin/matches')}
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "7px 14px", color: "rgba(255,255,255,0.5)", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>
            ← Back
          </button>
        </div>

        {/* Match Info Card */}
        <div style={{ background: "linear-gradient(145deg,#1a1a2e,#16213e)", borderRadius: 16, border: "1px solid rgba(255,255,255,0.08)", padding: "20px 24px", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <div>
              <div style={{ color: "#fff", fontSize: 22, fontWeight: 800 }}>
                {hasScore ? `${club.clubName} ${match.goalsFor} — ${match.goalsAgainst} ${match.opponent}` : `${club.clubName} vs ${match.opponent}`}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6, flexWrap: "wrap" }}>
                <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 12 }}>
                  {new Date(match.date).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} · {match.time}
                </span>
                <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 4, background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.3)" }}>{match.venue}</span>
                <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 4, background: "rgba(155,89,182,0.1)", color: "rgba(155,89,182,0.6)" }}>{match.matchType}</span>
                {teamInfo && <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 4, background: "rgba(52,152,219,0.1)", color: "#3498db" }}>{teamInfo.name}</span>}
              </div>
              {match.report && <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 12, marginTop: 10, lineHeight: 1.6 }}>{match.report}</p>}
            </div>
          </div>
        </div>

        {/* MOTM */}
        <div style={{ background: "linear-gradient(145deg,#1a1a2e,#16213e)", borderRadius: 12, border: "1px solid rgba(255,255,255,0.08)", padding: "14px 20px", marginBottom: 16, display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 18 }}>⭐</span>
          <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, fontWeight: 600 }}>Man of the Match:</span>
          <select value={motm} onChange={e => setMotm(e.target.value)}
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, padding: "6px 12px", color: motm ? "#ffaa00" : "rgba(255,255,255,0.3)", fontSize: 12, fontWeight: 700, outline: "none", cursor: "pointer" }}>
            <option value="" style={{ background: "#1a1a2e" }}>Select player...</option>
            {allSquadPlayers.filter(p => squad.has(p.id)).map(p => (
              <option key={p.id} value={p.id} style={{ background: "#1a1a2e" }}>{p.name}</option>
            ))}
          </select>
        </div>

        {/* Squad Selection + Stats Table */}
        <div style={{ background: "linear-gradient(145deg,#1a1a2e,#16213e)", borderRadius: 16, border: "1px solid rgba(255,255,255,0.08)", overflow: "hidden", marginBottom: 16 }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <h2 style={{ color: "#fff", fontSize: 16, fontWeight: 700, margin: "0 0 2px" }}>Player Stats</h2>
              <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 11, margin: 0 }}>
                Click players to add to squad, then fill in their stats
              </p>
            </div>
            <button onClick={handleSaveAll} disabled={saving}
              style={{ background: saved ? "rgba(46,204,64,0.2)" : "linear-gradient(135deg,#1a6b1a,#2ecc40)", border: saved ? "1px solid #2ecc40" : "none", borderRadius: 8, padding: "8px 20px", color: "#fff", fontSize: 12, fontWeight: 700, cursor: saving ? "wait" : "pointer", opacity: saving ? 0.6 : 1 }}>
              {saved ? "✓ Stats Saved!" : saving ? "Saving..." : "Save All Stats"}
            </button>
          </div>

          {/* Stat Table — horizontally scrollable on mobile */}
          <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
          {/* Stat Headers */}
          <div style={{ display: "flex", alignItems: "center", padding: "8px 20px", borderBottom: "1px solid rgba(255,255,255,0.04)", gap: 4, minWidth: 560 }}>
            <div style={{ width: 28 }} />
            <div style={{ width: 120, color: "rgba(255,255,255,0.2)", fontSize: 9, fontWeight: 700, letterSpacing: 1 }}>PLAYER</div>
            {STAT_FIELDS.map(f => (
              <div key={f.key} style={{ width: f.w, textAlign: "center", color: "rgba(255,255,255,0.2)", fontSize: 8, fontWeight: 700, letterSpacing: 0.5 }}>{f.label}</div>
            ))}
          </div>

          {/* Players */}
          {teamPlayers.map(player => {
            const inSquad = squad.has(player.id)
            const ps = stats[player.id] || {}
            const isGK = (player.positions || []).includes("GK")
            return (
              <div key={player.id} style={{
                display: "flex", alignItems: "center", padding: "8px 20px", gap: 4,
                borderBottom: "1px solid rgba(255,255,255,0.02)",
                opacity: inSquad ? 1 : 0.4, transition: "opacity 0.2s",
                background: inSquad ? "rgba(255,255,255,0.01)" : "transparent",
                minWidth: 560
              }}>
                {/* Toggle */}
                <button onClick={() => toggleSquad(player.id)}
                  style={{ width: 24, height: 24, borderRadius: 6, border: inSquad ? "1px solid #2ecc40" : "1px solid rgba(255,255,255,0.15)", background: inSquad ? "rgba(46,204,64,0.15)" : "transparent", color: inSquad ? "#2ecc40" : "transparent", fontSize: 12, fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {inSquad ? "✓" : ""}
                </button>

                {/* Name */}
                <div style={{ width: 120, flexShrink: 0 }}>
                  <div style={{ color: "#fff", fontSize: 12, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{player.name}</div>
                  <div style={{ display: "flex", gap: 3, marginTop: 1 }}>
                    {(player.positions || []).slice(0, 2).map(p => (
                      <span key={p} style={{ fontSize: 7, fontWeight: 700, color: p === "GK" ? "#ffaa00" : "rgba(255,255,255,0.25)", letterSpacing: 0.3 }}>{p}</span>
                    ))}
                  </div>
                </div>

                {/* Stat Inputs */}
                {STAT_FIELDS.map(f => {
                  if (f.gkOnly && !isGK) return <div key={f.key} style={{ width: f.w }} />
                  if (!inSquad) return <div key={f.key} style={{ width: f.w }} />

                  if (f.type === "toggle") {
                    const val = ps[f.key] || false
                    return (
                      <button key={f.key} onClick={() => updateStat(player.id, f.key, !val)}
                        style={{ width: f.w, height: 28, borderRadius: 6, border: val ? "1px solid #2ecc40" : "1px solid rgba(255,255,255,0.1)", background: val ? "rgba(46,204,64,0.15)" : "rgba(255,255,255,0.03)", color: val ? "#2ecc40" : "rgba(255,255,255,0.15)", fontSize: 10, fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {val ? "✓" : "—"}
                      </button>
                    )
                  }
                  if (f.type === "rating") {
                    const val = ps[f.key] || ""
                    return (
                      <input key={f.key} type="number" min={1} max={10} value={val}
                        onChange={e => updateStat(player.id, f.key, e.target.value === "" ? "" : Math.min(10, Math.max(1, parseInt(e.target.value) || 0)))}
                        placeholder="—"
                        style={{ width: f.w, height: 28, borderRadius: 6, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.06)", color: val ? getRatingColor(val * 10) : "rgba(255,255,255,0.2)", fontSize: 14, fontWeight: 800, textAlign: "center", outline: "none", padding: 0 }} />
                    )
                  }
                  // number
                  const val = ps[f.key] ?? ""
                  return (
                    <input key={f.key} type="number" min={0} max={f.max} value={val}
                      onChange={e => updateStat(player.id, f.key, e.target.value === "" ? "" : parseInt(e.target.value) || 0)}
                      placeholder="—"
                      style={{ width: f.w, height: 28, borderRadius: 6, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.06)", color: val ? "#fff" : "rgba(255,255,255,0.15)", fontSize: 12, fontWeight: 700, textAlign: "center", outline: "none", padding: 0 }} />
                  )
                })}
              </div>
            )
          })}

          {teamPlayers.length === 0 && (
            <div style={{ padding: "30px 20px", textAlign: "center" }}>
              <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 12 }}>No players assigned to this team yet. Assign players via the admin panel.</p>
            </div>
          )}
          </div>{/* end overflow-x scroll wrapper */}
        </div>

        {/* Squad Summary */}
        {squad.size > 0 && (
          <div style={{ background: "rgba(255,255,255,0.02)", borderRadius: 12, padding: "14px 20px", border: "1px solid rgba(255,255,255,0.04)" }}>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
              <div><span style={{ color: "rgba(255,255,255,0.3)", fontSize: 10 }}>Squad: </span><span style={{ color: "#fff", fontSize: 12, fontWeight: 800 }}>{squad.size}</span></div>
              <div><span style={{ color: "rgba(255,255,255,0.3)", fontSize: 10 }}>Goals: </span><span style={{ color: "#2ecc40", fontSize: 12, fontWeight: 800 }}>{Object.values(stats).reduce((s, p) => s + (p.goals || 0), 0)}</span></div>
              <div><span style={{ color: "rgba(255,255,255,0.3)", fontSize: 10 }}>Assists: </span><span style={{ color: "#3498db", fontSize: 12, fontWeight: 800 }}>{Object.values(stats).reduce((s, p) => s + (p.assists || 0), 0)}</span></div>
              {motm && <div><span style={{ color: "rgba(255,255,255,0.3)", fontSize: 10 }}>MOTM: </span><span style={{ color: "#ffaa00", fontSize: 12, fontWeight: 800 }}>{allSquadPlayers.find(p => p.id === motm)?.name || "—"}</span></div>}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}