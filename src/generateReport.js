import { jsPDF } from 'jspdf'
import { ATTRS, GK_ATTRS, CAT_ORDER, CAT_FORMULAS, calcCategories, calcGkCategory,
         calcOverall, calcBestRating, calcAllPositionRatings, calcAge } from './utils'

const IMPROVEMENT_TIPS = {
  firstTouch: ["Wall passing drills with varied speed", "Cushion control exercises with both feet", "Receiving under pressure drills"],
  dribbling: ["Cone weaving at increasing speed", "1v1 dribbling challenges", "Close control in tight spaces"],
  ballProtection: ["Shielding drills with passive then active defenders", "Back-to-goal receiving practice", "Strength-based body positioning exercises"],
  balance: ["Single-leg stability exercises", "Agility ladder with balance holds", "Turning drills under pressure"],
  passAccuracy: ["Short passing accuracy targets", "Switching play over distance", "First-time passing under pressure"],
  shootingTechnique: ["Finishing drills from various angles", "Volley and half-volley practice", "Placement over power exercises"],
  weakFoot: ["Dedicated weak foot passing and shooting sessions", "Juggling with weak foot only", "Game scenarios forcing weak foot use"],
  position: ["Positional awareness exercises with cones", "Shadow play and tactical walkthroughs", "Video analysis of positioning"],
  tackling: ["1v1 jockeying and timing drills", "Recovery tackle practice", "Reading the play — interception exercises"],
  speed: ["Sprint interval training", "Acceleration drills (0-20m)", "Speed endurance circuits"],
  agility: ["Agility ladder variations", "Cone reaction drills", "Change of direction exercises"],
  strength: ["Bodyweight strength circuits", "Core stability program", "Resistance band exercises"],
  stamina: ["Interval running (high intensity)", "Small-sided games for endurance", "Progressive distance running"],
  decisionMaking: ["Small-sided games with quick transitions", "Scenario-based tactical exercises", "Video analysis and discussion"],
  communication: ["Encourage vocal leadership in training", "Set piece organization roles", "Partner drills requiring verbal cues"],
  workRate: ["High-intensity pressing drills", "Box-to-box running exercises", "Competitive fitness challenges"],
  coachability: ["Set personal improvement goals each week", "Reflective journals after sessions", "Peer feedback exercises"],
  discipline: ["Focus and concentration drills", "Pressure situation simulations", "Team rules and accountability exercises"],
  leadershipPotential: ["Captain responsibilities in training", "Mentoring younger players", "Leading warm-ups and cool-downs"],
  diving: ["Diving technique from standing and kneeling", "Reaction saves with deflection", "Low and high dive repetitions"],
  handling: ["Catching drills with varied pace", "Wet ball handling practice", "Cross collection under pressure"],
  kicking: ["Goal kick distance and accuracy", "Distribution under pressure", "Half-volley clearance technique"],
  reflexes: ["Close-range rapid fire shots", "Reaction ball exercises", "1v1 save scenarios"],
  gkPositioning: ["Angle narrowing exercises", "Movement off the line drills", "Set piece positioning walkthroughs"],
}

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return [r, g, b]
}

function ratingToColor(val) {
  if (val >= 80) return [46, 204, 64]
  if (val >= 70) return [123, 199, 77]
  if (val >= 60) return [232, 185, 48]
  if (val >= 50) return [230, 126, 34]
  return [231, 76, 60]
}

export async function generatePlayerReport(player, clubSettings, teamNames, matchStats, history) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const w = 210, h = 297
  const margin = 16
  const cw = w - margin * 2
  let y = 0

  const cats = calcCategories(player)
  const gkScore = calcGkCategory(player)
  const ovr = calcOverall(player)
  const positions = player.positions || []
  const posRatings = calcAllPositionRatings(player)
  const bestRating = positions.length > 0 ? calcBestRating(player) : ovr
  const age = calcAge(player.dob)
  const hasGK = positions.includes("GK")
  const clubName = clubSettings?.clubName || "Hub FC"

  // ========== HEADER ==========
  doc.setFillColor(10, 10, 26)
  doc.rect(0, 0, w, 50, 'F')

  doc.setFillColor(...ratingToColor(bestRating))
  doc.roundedRect(margin, 10, 30, 30, 4, 4, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(22)
  doc.setFont("helvetica", "bold")
  doc.text(String(Math.round(bestRating)), margin + 15, 29, { align: "center" })

  doc.setFontSize(20)
  doc.text(player.name, margin + 38, 22)

  doc.setFontSize(9)
  doc.setTextColor(180, 180, 180)
  let infoLine = []
  if (age !== null) infoLine.push(`Age ${age}`)
  if (teamNames?.length) infoLine.push(teamNames.join(", "))
  if (positions.length) infoLine.push(positions.join(" · "))
  if (player.jerseyNumber) infoLine.push(`Jersey #${player.jerseyNumber}`)
  doc.text(infoLine.join("  |  "), margin + 38, 32)

  doc.setFontSize(8)
  doc.setTextColor(120, 120, 120)
  doc.text(`${clubName} Player Report  •  Generated ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}`, margin + 38, 40)

  y = 58

  // ========== POSITION RATINGS ==========
  if (posRatings.length > 0) {
    doc.setFontSize(8)
    doc.setTextColor(150, 150, 150)
    doc.text("POSITION RATINGS", margin, y)
    y += 6
    posRatings.forEach((pr, i) => {
      const x = margin + i * 28
      doc.setFillColor(...ratingToColor(pr.rating))
      doc.roundedRect(x, y, 25, 12, 2, 2, 'F')
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(10)
      doc.setFont("helvetica", "bold")
      doc.text(String(Math.round(pr.rating)), x + 3, y + 8)
      doc.setFontSize(7)
      doc.text(pr.pos, x + 16, y + 8)
    })
    y += 20
  }

  // ========== CATEGORY RATINGS ==========
  doc.setFontSize(8)
  doc.setTextColor(150, 150, 150)
  doc.text("CATEGORY RATINGS", margin, y)
  y += 6

  const catBoxW = (cw - 10) / 3
  CAT_ORDER.forEach((c, i) => {
    const col = i % 3
    const row = Math.floor(i / 3)
    const x = margin + col * (catBoxW + 5)
    const by = y + row * 16

    doc.setFillColor(25, 30, 50)
    doc.roundedRect(x, by, catBoxW, 13, 2, 2, 'F')

    doc.setFontSize(12)
    doc.setFont("helvetica", "bold")
    doc.setTextColor(...ratingToColor(cats[c]))
    doc.text(String(Math.round(cats[c])), x + 4, by + 9)

    doc.setFontSize(7)
    doc.setTextColor(180, 180, 180)
    doc.text(CAT_FORMULAS[c].full.toUpperCase(), x + 18, by + 9)
  })
  y += 38

  if (hasGK) {
    doc.setFillColor(40, 35, 15)
    doc.roundedRect(margin, y - 4, catBoxW, 13, 2, 2, 'F')
    doc.setFontSize(12)
    doc.setFont("helvetica", "bold")
    doc.setTextColor(...ratingToColor(gkScore))
    doc.text(String(Math.round(gkScore)), margin + 4, y + 5)
    doc.setFontSize(7)
    doc.setTextColor(255, 170, 0)
    doc.text("GOALKEEPING", margin + 18, y + 5)
    y += 16
  }

  // ========== ALL ATTRIBUTES ==========
  doc.setFontSize(8)
  doc.setTextColor(150, 150, 150)
  doc.text("ALL ATTRIBUTES", margin, y)
  y += 6

  const allAttrs = [...ATTRS, ...(hasGK ? GK_ATTRS.map(a => ({ ...a, cat: "gk" })) : [])]
  const colW = cw / 2

  allAttrs.forEach((attr, i) => {
    const col = i % 2
    const x = margin + col * colW
    if (col === 0 && i > 0) y += 7
    if (i === 0) y += 0

    const val = player[attr.key] || 0
    const [cr, cg, cb] = ratingToColor(val)

    // Attribute name
    doc.setFontSize(8)
    doc.setTextColor(160, 160, 160)
    doc.text(attr.label, x, y + 4)

    // Progress bar background
    doc.setFillColor(35, 35, 55)
    doc.roundedRect(x + 42, y, 35, 5, 1, 1, 'F')

    // Progress bar fill
    doc.setFillColor(cr, cg, cb)
    const barW = Math.max(1, (val / 100) * 35)
    doc.roundedRect(x + 42, y, barW, 5, 1, 1, 'F')

    // Value
    doc.setFontSize(9)
    doc.setFont("helvetica", "bold")
    doc.setTextColor(cr, cg, cb)
    doc.text(String(val), x + 80, y + 4)
  })

  if (allAttrs.length % 2 !== 0) y += 7
  y += 10

  // ========== MATCH STATS ==========
  if (matchStats && matchStats.length > 0) {
    if (y > 240) { doc.addPage(); y = 20 }

    doc.setFontSize(8)
    doc.setTextColor(150, 150, 150)
    doc.text("MATCH STATS SUMMARY", margin, y)
    y += 8

    const apps = matchStats.length
    const goals = matchStats.reduce((s, m) => s + (m.goals || 0), 0)
    const assists = matchStats.reduce((s, m) => s + (m.assists || 0), 0)
    const saves = matchStats.reduce((s, m) => s + (m.saves || 0), 0)
    const cs = matchStats.filter(m => m.cleanSheet).length
    const yellows = matchStats.reduce((s, m) => s + (m.yellowCards || 0), 0)
    const reds = matchStats.filter(m => m.redCard).length
    const rated = matchStats.filter(m => m.rating)
    const avgRating = rated.length > 0 ? (rated.reduce((s, m) => s + m.rating, 0) / rated.length) : 0
    const totalMins = matchStats.reduce((s, m) => s + (m.minutes || 0), 0)

    const statItems = [
      { label: "Appearances", value: apps },
      { label: "Goals", value: goals },
      { label: "Assists", value: assists },
      { label: "Avg Rating", value: avgRating ? avgRating.toFixed(1) : "—" },
      { label: "Minutes", value: totalMins },
    ]
    if (saves > 0) statItems.push({ label: "Saves", value: saves })
    if (cs > 0) statItems.push({ label: "Clean Sheets", value: cs })
    if (yellows > 0) statItems.push({ label: "Yellow Cards", value: yellows })
    if (reds > 0) statItems.push({ label: "Red Cards", value: reds })

    const statBoxW = 30
    statItems.forEach((s, i) => {
      const col = i % 5
      const row = Math.floor(i / 5)
      const x = margin + col * (statBoxW + 6)
      const sy = y + row * 16

      doc.setFillColor(25, 30, 50)
      doc.roundedRect(x, sy, statBoxW, 13, 2, 2, 'F')
      doc.setFontSize(11)
      doc.setFont("helvetica", "bold")
      doc.setTextColor(255, 255, 255)
      doc.text(String(s.value), x + 3, sy + 8)
      doc.setFontSize(5)
      doc.setTextColor(120, 120, 120)
      doc.text(s.label.toUpperCase(), x + 3, sy + 12)
    })
    y += Math.ceil(statItems.length / 5) * 16 + 6
  }

  // ========== IMPROVEMENT PLAN ==========
  if (y > 220) { doc.addPage(); y = 20 }

  doc.setFontSize(8)
  doc.setTextColor(150, 150, 150)
  doc.text("IMPROVEMENT PLAN", margin, y)
  y += 8

  // Find weakest attributes relative to position
  const weakAttrs = ATTRS
    .map(a => ({ ...a, val: player[a.key] || 0 }))
    .sort((a, b) => a.val - b.val)
    .slice(0, 5)

  weakAttrs.forEach(attr => {
    if (y > 275) { doc.addPage(); y = 20 }

    const val = attr.val
    const [cr, cg, cb] = ratingToColor(val)
    const tips = IMPROVEMENT_TIPS[attr.key] || ["Focus on dedicated training sessions for this skill"]

    // Attribute header
    doc.setFillColor(30, 25, 45)
    doc.roundedRect(margin, y, cw, 7, 1.5, 1.5, 'F')
    doc.setFontSize(8)
    doc.setFont("helvetica", "bold")
    doc.setTextColor(cr, cg, cb)
    doc.text(`${attr.label}: ${val}`, margin + 3, y + 5)

    doc.setFontSize(7)
    doc.setTextColor(200, 200, 200)
    doc.text("→ " + (val < 50 ? "Priority improvement area" : val < 60 ? "Needs development" : "Room for growth"), margin + 60, y + 5)
    y += 10

    // Tips
    tips.forEach(tip => {
      doc.setFontSize(7)
      doc.setTextColor(160, 160, 160)
      doc.text("•  " + tip, margin + 4, y)
      y += 5
    })
    y += 3
  })

  // ========== PROGRESS NOTE ==========
  if (y > 260) { doc.addPage(); y = 20 }

  if (history && history.length > 1) {
    y += 4
    doc.setFontSize(8)
    doc.setTextColor(150, 150, 150)
    doc.text("PROGRESS SNAPSHOT", margin, y)
    y += 8

    const first = history[0]
    const last = history[history.length - 1]
    const firstOvr = calcOverall(first)
    const lastOvr = calcOverall(last)
    const diff = lastOvr - firstOvr

    doc.setFontSize(9)
    doc.setTextColor(255, 255, 255)
    doc.text(`Overall rating changed from ${Math.round(firstOvr)} to ${Math.round(lastOvr)}`, margin, y)

    doc.setFontSize(10)
    doc.setFont("helvetica", "bold")
    const [dr, dg, db] = diff > 0 ? [46, 204, 64] : diff < 0 ? [231, 76, 60] : [180, 180, 180]
    doc.setTextColor(dr, dg, db)
    doc.text(`${diff > 0 ? "+" : ""}${diff.toFixed(1)}`, margin + 90, y)

    y += 6
    doc.setFontSize(7)
    doc.setTextColor(120, 120, 120)
    doc.text(`Based on ${history.length} assessment${history.length !== 1 ? 's' : ''} from ${new Date(first.timestamp).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })} to ${new Date(last.timestamp).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}`, margin, y)
  }

  // ========== FOOTER ==========
  const pages = doc.getNumberOfPages()
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i)
    doc.setFillColor(10, 10, 26)
    doc.rect(0, h - 12, w, 12, 'F')
    doc.setFontSize(6)
    doc.setTextColor(80, 80, 80)
    doc.text(`${clubName} Player Report  •  ${player.name}  •  Page ${i} of ${pages}`, margin, h - 5)
    doc.text(`Confidential  •  Generated ${new Date().toLocaleDateString('en-GB')}`, w - margin, h - 5, { align: "right" })
  }

  // Save
  doc.save(`${player.name.replace(/\s+/g, '_')}_Report_${new Date().toISOString().slice(0, 10)}.pdf`)
}