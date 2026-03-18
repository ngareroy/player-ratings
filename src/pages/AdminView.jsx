import { useState, useEffect, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { subscribePlayers, savePlayer, removePlayer, subscribeTeams, subscribeAssessments, saveRatingSnapshot, subscribeClubSettings } from '../firebase'
import { calcBestRating, calcOverall, calcCategories, CAT_ORDER, CAT_LABELS } from '../utils'
import PlayerCard from '../components/PlayerCard'
import Modal from '../components/Modal'
import PlayerDetailModal from '../components/PlayerDetailModal'
import CoachProfileModal, { getAvatarDisplay } from '../components/CoachProfileModal'
import ImproversLeaderboard from '../components/ImproversLeaderboard'

export default function AdminView() {
  const { user, adminData, isHeadCoach, isAssistant, logout } = useAuth()
  const navigate = useNavigate()
  const [players, setPlayers] = useState([])
  const [sortBy, setSortBy] = useState("total")
  const [search, setSearch] = useState("")
  const [filterTeam, setFilterTeam] = useState("all")
  const [teams, setTeams] = useState([])
  const [assessments, setAssessments] = useState([])
  const [club, setClub] = useState({ clubName: "Hub FC" })
  const [modal, setModal] = useState(null)
  const [loading, setLoading] = useState(true)
  const [detailPlayer, setDetailPlayer] = useState(null)
  const [showProfile, setShowProfile] = useState(false)
  const [showLeaderboard, setShowLeaderboard] = useState(false)

  useEffect(() => {
    const unsub = subscribePlayers((data) => {
      setPlayers(data)
      setLoading(false)
    })
    const unsub2 = subscribeTeams(setTeams)
    const unsub3 = subscribeAssessments(setAssessments)
    const unsub4 = subscribeClubSettings(setClub)
    return () => { unsub(); unsub2(); unsub3(); unsub4() }
  }, [])

  const activeAssessment = useMemo(() =>
    assessments.find(a => a.status === 'open') || null
    , [assessments])

  const enriched = useMemo(() =>
    players.map(p => {
      const positions = p.positions || []
      const best = positions.length > 0 ? calcBestRating(p) : calcOverall(p)
      return { ...p, cats: calcCategories(p), total: best }
    })
    , [players])

  const ranks = useMemo(() => {
    const s = [...enriched].sort((a, b) => b.total - a.total)
    const m = {}
    s.forEach((p, i) => m[p.id] = i + 1)
    return m
  }, [enriched])

  const sorted = useMemo(() => {
    let list = [...enriched]
    if (search) list = list.filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
    if (filterTeam === "unassigned") list = list.filter(p => !(p.teamIds?.length) && !p.teamId)
    else if (filterTeam !== "all") list = list.filter(p => (p.teamIds || (p.teamId ? [p.teamId] : [])).includes(filterTeam))
    if (sortBy === "total") list.sort((a, b) => b.total - a.total)
    else list.sort((a, b) => (b.cats[sortBy] || 0) - (a.cats[sortBy] || 0))
    return list
  }, [enriched, sortBy, search, filterTeam])

  const teamMap = useMemo(() => {
    const m = {}
    teams.forEach(t => m[t.id] = t.name)
    return m
  }, [teams])

  const getTeamNames = (p) => {
    const ids = p.teamIds || (p.teamId ? [p.teamId] : [])
    return ids.map(id => teamMap[id]).filter(Boolean)
  }

  const handleSave = useCallback(async (p) => {
    await savePlayer(p)
    // Save rating history snapshot if there's an active assessment
    if (activeAssessment) {
      await saveRatingSnapshot(p.id, p, activeAssessment.id, adminData?.name || "Unknown")
    }
    setModal(null)
  }, [activeAssessment, adminData])

  const handleDelete = useCallback(async (id) => {
    if (isAssistant) return // Assistants can't delete
    if (!confirm("Remove this learner?")) return
    await removePlayer(id)
  }, [isAssistant])

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const roleName = isHeadCoach ? "Head Coach" : "Assistant Coach"
  const av = getAvatarDisplay(adminData)

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a1a", padding: "20px 12px", fontFamily: "system-ui" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>

        {/* Top Bar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <h1 style={{ color: "#fff", fontSize: 22, fontWeight: 800, margin: 0, letterSpacing: 1 }}>{club.clubName || "Hub FC"} RATINGS</h1>
            <span style={{ background: "rgba(46,204,64,0.15)", color: "#2ecc40", fontSize: 9, fontWeight: 700, padding: "3px 8px", borderRadius: 6, letterSpacing: 1 }}>ADMIN</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {isHeadCoach && (
              <button onClick={() => navigate('/admin/manage')}
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "7px 12px", color: "rgba(255,255,255,0.5)", fontSize: 10, fontWeight: 700, cursor: "pointer", letterSpacing: 0.5 }}>
                Manage Team
              </button>
            )}
            <button onClick={() => navigate('/admin/matches')}
              style={{ background: "rgba(155,89,182,0.08)", border: "1px solid rgba(155,89,182,0.15)", borderRadius: 8, padding: "7px 12px", color: "rgba(155,89,182,0.7)", fontSize: 10, fontWeight: 700, cursor: "pointer", letterSpacing: 0.5 }}>
              Matches
            </button>
            <button onClick={() => navigate('/admin/attendance')}
              style={{ background: "rgba(52,152,219,0.08)", border: "1px solid rgba(52,152,219,0.15)", borderRadius: 8, padding: "7px 12px", color: "rgba(52,152,219,0.7)", fontSize: 10, fontWeight: 700, cursor: "pointer", letterSpacing: 0.5 }}>
              Attendance
            </button>
            <button onClick={() => navigate('/compare')}
              style={{ background: "rgba(255,170,0,0.08)", border: "1px solid rgba(255,170,0,0.15)", borderRadius: 8, padding: "7px 12px", color: "rgba(255,170,0,0.7)", fontSize: 10, fontWeight: 700, cursor: "pointer", letterSpacing: 0.5 }}>
              Compare
            </button>
            <button onClick={() => navigate('/admin/awards')}
              style={{ background: "rgba(255,170,0,0.06)", border: "1px solid rgba(255,170,0,0.12)", borderRadius: 8, padding: "7px 12px", color: "rgba(255,170,0,0.6)", fontSize: 10, fontWeight: 700, cursor: "pointer", letterSpacing: 0.5 }}>
              Awards
            </button>
            {/* Profile Avatar */}
            <button onClick={() => setShowProfile(true)}
              style={{
                display: "flex", alignItems: "center", gap: 10, padding: "4px 12px 4px 4px",
                background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 12, cursor: "pointer", transition: "background 0.2s",
              }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.08)"}
              onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.04)"}
            >
              <div style={{
                width: 34, height: 34, borderRadius: 9, background: av.bg,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: av.emoji ? 16 : 14, fontWeight: 800, color: "#fff", flexShrink: 0
              }}>
                {av.emoji || av.initial}
              </div>
              <div style={{ textAlign: "left" }}>
                <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 11, fontWeight: 600, lineHeight: 1.2 }}>
                  {adminData?.name || user?.email}
                </div>
                <div style={{ color: "rgba(255,255,255,0.25)", fontSize: 8, letterSpacing: 1, fontWeight: 600 }}>{roleName.toUpperCase()}</div>
              </div>
            </button>
            <button onClick={handleLogout}
              style={{ background: "rgba(231,76,60,0.1)", border: "1px solid rgba(231,76,60,0.15)", borderRadius: 8, padding: "7px 14px", color: "#e74c3c", fontSize: 10, fontWeight: 700, cursor: "pointer", letterSpacing: 0.5 }}>
              Logout
            </button>
          </div>
        </div>

        <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 11, textAlign: "center", margin: "0 0 8px", letterSpacing: 2 }}>
          {players.length} LEARNERS • EDIT MODE
        </p>

        {/* Active Assessment Indicator */}
        {activeAssessment ? (
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
            <div style={{ background: "rgba(46,204,64,0.08)", border: "1px solid rgba(46,204,64,0.15)", borderRadius: 8, padding: "6px 14px", display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#2ecc40", boxShadow: "0 0 6px rgba(46,204,64,0.4)", animation: "pulse 2s infinite" }} />
              <span style={{ color: "#2ecc40", fontSize: 11, fontWeight: 700 }}>Recording: {activeAssessment.name}</span>
              <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 9 }}>— ratings will be tracked</span>
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
            <button onClick={() => navigate('/admin/assessments')}
              style={{ background: "rgba(255,170,0,0.08)", border: "1px solid rgba(255,170,0,0.15)", borderRadius: 8, padding: "6px 14px", cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ color: "#ffaa00", fontSize: 11, fontWeight: 600 }}>No active assessment — ratings won't be tracked</span>
              <span style={{ color: "rgba(255,170,0,0.5)", fontSize: 9 }}>Open one →</span>
            </button>
          </div>
        )}

        {/* Leaderboard Toggle */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: showLeaderboard ? 0 : 8 }}>
          <button onClick={() => setShowLeaderboard(!showLeaderboard)}
            style={{ background: "rgba(255,170,0,0.04)", border: "1px solid rgba(255,170,0,0.1)", borderRadius: 8, padding: "5px 14px", color: "rgba(255,170,0,0.5)", fontSize: 10, fontWeight: 700, cursor: "pointer", letterSpacing: 0.5 }}>
            {showLeaderboard ? "Hide Improvers ▲" : "🏆 Biggest Improvers ▼"}
          </button>
        </div>

        {showLeaderboard && (
          <div style={{ maxWidth: 500, margin: "8px auto 16px", background: "linear-gradient(145deg,#1a1a2e,#16213e)", borderRadius: 14, border: "1px solid rgba(255,255,255,0.08)", padding: "14px 18px" }}>
            <ImproversLeaderboard limit={10} showTitle={true} />
          </div>
        )}

        {/* Filters */}
        <div style={{ display: "flex", justifyContent: "center", gap: 6, flexWrap: "wrap", marginBottom: 8, alignItems: "center" }}>
          <input type="text" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)}
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "7px 12px", color: "#fff", fontSize: 12, outline: "none", width: 140 }} />
          {[{ key: "total", label: "OVR" }, ...CAT_ORDER.map((c, i) => ({ key: c, label: CAT_LABELS[i] }))].map(o => (
            <button key={o.key} onClick={() => setSortBy(o.key)}
              style={{
                background: sortBy === o.key ? "rgba(46,204,64,0.2)" : "rgba(255,255,255,0.06)",
                border: sortBy === o.key ? "1px solid #2ecc40" : "1px solid rgba(255,255,255,0.1)",
                borderRadius: 8, padding: "6px 12px",
                color: sortBy === o.key ? "#2ecc40" : "rgba(255,255,255,0.5)",
                fontSize: 10, fontWeight: 700, cursor: "pointer", letterSpacing: .8
              }}>{o.label}</button>
          ))}
          <button onClick={() => setModal({ isNew: true, player: null })}
            style={{ background: "linear-gradient(135deg,#1a6b1a,#2ecc40)", border: "none", borderRadius: 8, padding: "7px 16px", color: "#fff", fontSize: 11, fontWeight: 700, cursor: "pointer", letterSpacing: .5, marginLeft: 4 }}>
            + ADD LEARNER
          </button>
        </div>

        {/* Team Filter */}
        {teams.length > 0 && (
          <div style={{ display: "flex", justifyContent: "center", gap: 6, flexWrap: "wrap", marginBottom: 20, alignItems: "center" }}>
            <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 9, fontWeight: 700, letterSpacing: 1 }}>TEAM:</span>
            {[{ id: "all", label: "All" }, { id: "unassigned", label: "Unassigned" }, ...teams.map(t => ({ id: t.id, label: t.name }))].map(t => (
              <button key={t.id} onClick={() => setFilterTeam(t.id)}
                style={{
                  background: filterTeam === t.id ? "rgba(52,152,219,0.2)" : "rgba(255,255,255,0.04)",
                  border: filterTeam === t.id ? "1px solid #3498db" : "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 6, padding: "5px 10px",
                  color: filterTeam === t.id ? "#3498db" : "rgba(255,255,255,0.35)",
                  fontSize: 10, fontWeight: 700, cursor: "pointer", letterSpacing: 0.3
                }}>{t.label}</button>
            ))}
          </div>
        )}

        {/* Player Cards */}
        {loading ? (
          <p style={{ color: "rgba(255,255,255,0.4)", textAlign: "center", marginTop: 60 }}>Loading players...</p>
        ) : (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 18, justifyContent: "center" }}>
            {sorted.map(p => (
              <PlayerCard key={p.id} player={p} rank={ranks[p.id]} isAdmin={true}
                teamNames={getTeamNames(p)}
                onEdit={pl => setModal({ isNew: false, player: pl })}
                onDelete={isHeadCoach ? handleDelete : null}
                onClick={setDetailPlayer} />
            ))}
            {sorted.length === 0 && <p style={{ color: "rgba(255,255,255,0.3)" }}>No learners found.</p>}
          </div>
        )}
      </div>

      {modal && <Modal player={modal.player} isNew={modal.isNew}
        onSave={handleSave} onClose={() => setModal(null)} allPlayers={players} />}

      {detailPlayer && (
        <PlayerDetailModal player={detailPlayer} rank={ranks[detailPlayer.id]}
          teamNames={getTeamNames(detailPlayer)}
          onClose={() => setDetailPlayer(null)} />
      )}

      {showProfile && (
        <CoachProfileModal
          adminData={adminData}
          user={user}
          onClose={() => setShowProfile(false)}
        />
      )}
    </div>
  )
}