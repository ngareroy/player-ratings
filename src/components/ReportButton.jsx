import { useState, useEffect } from 'react'
import { subscribePlayerMatchStats, subscribePlayerHistory, subscribeClubSettings, subscribeSessions, subscribeAttendance } from '../firebase'
import { generatePlayerReport } from '../generateReport'

export default function ReportButton({ player, teamNames }) {
  const [generating, setGenerating] = useState(false)
  const [matchStats, setMatchStats] = useState([])
  const [history, setHistory] = useState([])
  const [club, setClub] = useState({ clubName: "Hub FC" })
  const [sessions, setSessions] = useState([])
  const [attendance, setAttendance] = useState({})
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (!player?.id) return
    let count = 0
    const check = () => { count++; if (count >= 5) setLoaded(true) }
    const u1 = subscribePlayerMatchStats(player.id, (d) => { setMatchStats(d); check() })
    const u2 = subscribePlayerHistory(player.id, (d) => { setHistory(d); check() })
    const u3 = subscribeClubSettings((d) => { setClub(d); check() })
    const u4 = subscribeSessions(d => { setSessions(d); check() })
    const u5 = subscribeAttendance(d => { setAttendance(d); check() })
    return () => { u1(); u2(); u3(); u4(); u5() }
  }, [player?.id])

  // Calculate attendance for this player
  const attendanceData = (() => {
    let total = 0, present = 0, late = 0
    sessions.forEach(s => {
      const a = attendance[s.id]?.players || {}
      if (a[player.id] !== undefined) {
        total++
        if (a[player.id] === "present") present++
        else if (a[player.id] === "late") late++
      }
    })
    return { total, present, late, absent: total - present - late, rate: total > 0 ? ((present + late) / total * 100) : 0 }
  })()

  const handleGenerate = async () => {
    setGenerating(true)
    try {
      await generatePlayerReport(player, club, teamNames, matchStats, history, attendanceData)
    } catch (err) {
      console.error("Report generation failed:", err)
      alert("Failed to generate report. Please try again.")
    }
    setGenerating(false)
  }

  return (
    <button onClick={handleGenerate} disabled={generating || !loaded}
      style={{
        background: generating ? "rgba(155,89,182,0.15)" : "rgba(155,89,182,0.1)",
        border: "1px solid rgba(155,89,182,0.25)",
        borderRadius: 8, padding: "8px 16px",
        color: "#9b59b6", fontSize: 11, fontWeight: 700,
        cursor: (generating || !loaded) ? "wait" : "pointer",
        display: "flex", alignItems: "center", gap: 6,
        letterSpacing: 0.5, transition: "all 0.2s",
        opacity: loaded ? 1 : 0.5,
      }}
      onMouseEnter={e => { if (!generating) e.currentTarget.style.background = "rgba(155,89,182,0.2)" }}
      onMouseLeave={e => { e.currentTarget.style.background = "rgba(155,89,182,0.1)" }}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </svg>
      {generating ? "Generating..." : !loaded ? "Loading..." : "Download Report"}
    </button>
  )
}