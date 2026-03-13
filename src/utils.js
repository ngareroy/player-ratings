export const ATTRS = [
    { key: "firstTouch", label: "First Touch", cat: "tec" },
    { key: "dribbling", label: "Dribbling", cat: "tec" },
    { key: "ballProtection", label: "Ball Protection", cat: "tec" },
    { key: "balance", label: "Balance", cat: "tec" },
    { key: "passAccuracy", label: "Passing Accuracy", cat: "pas" },
    { key: "shootingTechnique", label: "Shooting Technique", cat: "att" },
    { key: "weakFoot", label: "Weak Foot", cat: "att" },
    { key: "position", label: "Position", cat: "att" },
    { key: "tackling", label: "Tackling", cat: "def" },
    { key: "speed", label: "Speed", cat: "phy" },
    { key: "agility", label: "Agility", cat: "phy" },
    { key: "strength", label: "Strength", cat: "phy" },
    { key: "stamina", label: "Stamina", cat: "phy" },
    { key: "decisionMaking", label: "Decision Making", cat: "men" },
    { key: "communication", label: "Communication", cat: "men" },
    { key: "workRate", label: "Work Rate", cat: "men" },
    { key: "coachability", label: "Coachability", cat: "men" },
    { key: "discipline", label: "Discipline", cat: "men" },
    { key: "leadershipPotential", label: "Leadership Potential", cat: "men" },
]

export const CAT_FORMULAS = {
    tec: { label: "TEC", full: "Technical", keys: ["firstTouch", "dribbling", "ballProtection", "balance"] },
    pas: { label: "PAS", full: "Passing", keys: ["passAccuracy", "firstTouch", "decisionMaking"] },
    att: { label: "ATT", full: "Attacking", keys: ["shootingTechnique", "weakFoot", "position"] },
    phy: { label: "PHY", full: "Physical", keys: ["speed", "agility", "strength", "stamina"] },
    def: { label: "DEF", full: "Defense", keys: ["tackling", "ballProtection", "strength"] },
    men: { label: "MEN", full: "Mental", keys: ["decisionMaking", "communication", "workRate", "coachability", "discipline", "leadershipPotential"] },
}

export const CAT_ORDER = ["tec", "pas", "att", "phy", "def", "men"]
export const CAT_LABELS = CAT_ORDER.map(c => CAT_FORMULAS[c].label)

export function calcCategories(attrs) {
    const cats = {}
    for (const c of CAT_ORDER) {
        const vals = CAT_FORMULAS[c].keys.map(k => attrs[k] || 0)
        cats[c] = vals.reduce((a, b) => a + b, 0) / vals.length
    }
    return cats
}

export function calcOverall(attrs) {
    const vals = ATTRS.map(a => attrs[a.key] || 0)
    return vals.reduce((a, b) => a + b, 0) / vals.length
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