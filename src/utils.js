export const ATTRS = [
    { key: "firstTouch", label: "First Touch", cat: "tec" },
    { key: "dribbling", label: "Dribbling", cat: "tec" },
    { key: "ballProtection", label: "Ball Protection", cat: "tec" },
    { key: "balance", label: "Balance", cat: "tec" },
    { key: "passAccuracy", label: "Passing Accuracy", cat: "pas" },
    { key: "shootingTechnique", label: "Shooting Technique", cat: "att" },
    { key: "weakFoot", label: "Weak Foot", cat: "att" },
    { key: "position", label: "Positioning", cat: "att" },
    { key: "tackling", label: "Tackling", cat: "def" },
    { key: "speed", label: "Speed", cat: "phy" },
    { key: "agility", label: "Agility", cat: "phy" },
    { key: "strength", label: "Strength", cat: "phy" },
    { key: "stamina", label: "Stamina", cat: "phy" },
    { key: "decisionMaking", label: "Decision Making", cat: "ment" },
    { key: "communication", label: "Communication", cat: "ment" },
    { key: "workRate", label: "Work Rate", cat: "ment" },
    { key: "coachability", label: "Coachability", cat: "ment" },
    { key: "discipline", label: "Discipline", cat: "ment" },
    { key: "leadershipPotential", label: "Leadership Potential", cat: "ment" },
]

export const GK_ATTRS = [
    { key: "diving", label: "Diving" },
    { key: "handling", label: "Handling" },
    { key: "kicking", label: "Kicking" },
    { key: "reflexes", label: "Reflexes" },
    { key: "gkPositioning", label: "GK Positioning" },
]

export const CAT_FORMULAS = {
    tec: { label: "TEC", full: "Technical", keys: ["firstTouch", "dribbling", "ballProtection", "balance"] },
    pas: { label: "PAS", full: "Passing", keys: ["passAccuracy", "firstTouch", "decisionMaking"] },
    att: { label: "ATT", full: "Attacking", keys: ["shootingTechnique", "weakFoot", "position"] },
    phy: { label: "PHY", full: "Physical", keys: ["speed", "agility", "strength", "stamina"] },
    def: { label: "DEF", full: "Defense", keys: ["tackling", "ballProtection", "strength"] },
    ment: { label: "MENT", full: "Mentality", keys: ["decisionMaking", "communication", "workRate", "coachability", "discipline", "leadershipPotential"] },
}

export const CAT_ORDER = ["tec", "pas", "att", "phy", "def", "ment"]
export const CAT_LABELS = CAT_ORDER.map(c => CAT_FORMULAS[c].label)

export const POSITIONS = [
    "GK", "CB", "LB", "RB", "LWB", "RWB",
    "CDM", "CM", "CAM", "LM", "RM",
    "LW", "RW", "CF", "ST"
]

export const POS_GROUPS = {
    "GK": ["GK"],
    "DEF": ["CB", "LB", "RB", "LWB", "RWB"],
    "MID": ["CDM", "CM", "CAM", "LM", "RM"],
    "ATT": ["LW", "RW", "CF", "ST"],
}

// Position-weighted category importance (must sum to 1.0)
const POS_WEIGHTS = {
    GK: { tec: 0.04, pas: 0.04, att: 0.02, phy: 0.16, def: 0.10, ment: 0.14, gk: 0.50 },
    CB: { tec: 0.08, pas: 0.10, att: 0.02, phy: 0.22, def: 0.33, ment: 0.25, gk: 0 },
    LB: { tec: 0.12, pas: 0.12, att: 0.05, phy: 0.22, def: 0.27, ment: 0.22, gk: 0 },
    RB: { tec: 0.12, pas: 0.12, att: 0.05, phy: 0.22, def: 0.27, ment: 0.22, gk: 0 },
    LWB: { tec: 0.14, pas: 0.14, att: 0.10, phy: 0.22, def: 0.20, ment: 0.20, gk: 0 },
    RWB: { tec: 0.14, pas: 0.14, att: 0.10, phy: 0.22, def: 0.20, ment: 0.20, gk: 0 },
    CDM: { tec: 0.12, pas: 0.18, att: 0.04, phy: 0.20, def: 0.26, ment: 0.20, gk: 0 },
    CM: { tec: 0.18, pas: 0.24, att: 0.08, phy: 0.15, def: 0.12, ment: 0.23, gk: 0 },
    CAM: { tec: 0.23, pas: 0.23, att: 0.18, phy: 0.12, def: 0.04, ment: 0.20, gk: 0 },
    LM: { tec: 0.20, pas: 0.18, att: 0.15, phy: 0.18, def: 0.08, ment: 0.21, gk: 0 },
    RM: { tec: 0.20, pas: 0.18, att: 0.15, phy: 0.18, def: 0.08, ment: 0.21, gk: 0 },
    LW: { tec: 0.24, pas: 0.14, att: 0.26, phy: 0.17, def: 0.02, ment: 0.17, gk: 0 },
    RW: { tec: 0.24, pas: 0.14, att: 0.26, phy: 0.17, def: 0.02, ment: 0.17, gk: 0 },
    CF: { tec: 0.20, pas: 0.13, att: 0.30, phy: 0.17, def: 0.02, ment: 0.18, gk: 0 },
    ST: { tec: 0.17, pas: 0.10, att: 0.33, phy: 0.20, def: 0.02, ment: 0.18, gk: 0 },
}

export function calcCategories(attrs) {
    const cats = {}
    for (const c of CAT_ORDER) {
        const vals = CAT_FORMULAS[c].keys.map(k => attrs[k] || 0)
        cats[c] = vals.reduce((a, b) => a + b, 0) / vals.length
    }
    return cats
}

export function calcGkCategory(attrs) {
    const vals = GK_ATTRS.map(a => attrs[a.key] || 0)
    return vals.reduce((a, b) => a + b, 0) / vals.length
}

export function calcOverall(attrs) {
    const vals = ATTRS.map(a => attrs[a.key] || 0)
    return vals.reduce((a, b) => a + b, 0) / vals.length
}

export function calcPositionRating(cats, gkScore, pos) {
    const w = POS_WEIGHTS[pos]
    if (!w) return calcOverallFromCats(cats)
    return cats.tec * w.tec + cats.pas * w.pas + cats.att * w.att +
        cats.phy * w.phy + cats.def * w.def + cats.ment * w.ment +
        gkScore * (w.gk || 0)
}

function calcOverallFromCats(cats) {
    const vals = CAT_ORDER.map(c => cats[c])
    return vals.reduce((a, b) => a + b, 0) / vals.length
}

export function calcBestRating(player) {
    const cats = calcCategories(player)
    const gk = calcGkCategory(player)
    const positions = player.positions || []
    if (positions.length === 0) return calcOverall(player)
    const ratings = positions.map(p => calcPositionRating(cats, gk, p))
    return Math.max(...ratings)
}

export function calcAllPositionRatings(player) {
    const cats = calcCategories(player)
    const gk = calcGkCategory(player)
    const positions = player.positions || []
    return positions.map(p => ({ pos: p, rating: calcPositionRating(cats, gk, p) }))
        .sort((a, b) => b.rating - a.rating)
}

export function getAllUsedJerseyNumbers(players, excludePlayerId) {
    const used = new Set()
    players.forEach(p => {
        if (p.id === excludePlayerId) return
        if (p.jerseyNumber) used.add(String(p.jerseyNumber))
        if (p.gkJerseyNumber) used.add(String(p.gkJerseyNumber))
    })
    return used
}

export function calcAge(dob) {
    if (!dob) return null
    const birth = new Date(dob)
    const today = new Date()
    let age = today.getFullYear() - birth.getFullYear()
    const m = today.getMonth() - birth.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
    return age
}

export function suggestTeam(dob, teams) {
    const age = calcAge(dob)
    if (age === null || !teams || teams.length === 0) return []
    const ageGroups = teams.map(t => {
        const match = t.ageGroup?.match(/^U(\d+)$/)
        if (!match) return { team: t, maxAge: 99 }
        return { team: t, maxAge: parseInt(match[1]) }
    }).filter(t => t.maxAge !== 99)
        .sort((a, b) => a.maxAge - b.maxAge)
    for (const ag of ageGroups) {
        if (age < ag.maxAge) return [ag.team.id]
    }
    if (ageGroups.length > 0) return [ageGroups[ageGroups.length - 1].team.id]
    return []
}

export function getRatingColor(v) {
    if (v >= 80) return "#2ecc40"
    if (v >= 70) return "#7bc74d"
    if (v >= 60) return "#e8b930"
    if (v >= 50) return "#e67e22"
    return "#e74c3c"
}

export function getOvrBg(v) {
    if (v >= 75) return "linear-gradient(135deg,#1a6b1a,#2ecc40)"
    if (v >= 65) return "linear-gradient(135deg,#3a7a1a,#7bc74d)"
    if (v >= 55) return "linear-gradient(135deg,#8a6b00,#e8b930)"
    if (v >= 45) return "linear-gradient(135deg,#8a4500,#e67e22)"
    return "linear-gradient(135deg,#8a1a1a,#e74c3c)"
}