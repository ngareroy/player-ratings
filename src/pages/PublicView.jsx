import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { subscribePlayers } from '../firebase'
import { calcBestRating, calcOverall, calcCategories, CAT_ORDER, CAT_LABELS } from '../utils'
import PlayerCard from '../components/PlayerCard'
import PlayerDetailModal from '../components/PlayerDetailModal'

export default function PublicView() {
    const [players, setPlayers] = useState([])
    const [sortBy, setSortBy] = useState("total")
    const [search, setSearch] = useState("")
    const [loading, setLoading] = useState(true)
    const [detailPlayer, setDetailPlayer] = useState(null)

    useEffect(() => {
        const unsub = subscribePlayers((data) => {
            setPlayers(data)
            setLoading(false)
        })
        return () => unsub()
    }, [])

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
        if (sortBy === "total") list.sort((a, b) => b.total - a.total)
        else list.sort((a, b) => (b.cats[sortBy] || 0) - (a.cats[sortBy] || 0))
        return list
    }, [enriched, sortBy, search])

    const navigate = useNavigate()

    return (
        <div style={{ minHeight: "100vh", background: "#0a0a1a", padding: "20px 12px", fontFamily: "system-ui" }}>
            <div style={{ maxWidth: 1280, margin: "0 auto" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", position: "relative", marginBottom: 2 }}>
                    <h1 style={{ color: "#fff", fontSize: 26, fontWeight: 800, textAlign: "center", margin: 0, letterSpacing: 1 }}>PLAYER RATINGS</h1>
                    <button onClick={() => navigate('/login')}
                        style={{ position: "absolute", right: 0, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: "6px 14px", color: "rgba(255,255,255,0.25)", fontSize: 10, fontWeight: 600, cursor: "pointer", letterSpacing: 0.5 }}>
                        Coach Login
                    </button>
                </div>
                <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 11, textAlign: "center", margin: "0 0 18px", letterSpacing: 2 }}>{players.length} LEARNERS</p>

                <div style={{ display: "flex", justifyContent: "center", gap: 6, flexWrap: "wrap", marginBottom: 20, alignItems: "center" }}>
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
                </div>

                {loading ? (
                    <p style={{ color: "rgba(255,255,255,0.4)", textAlign: "center", marginTop: 60 }}>Loading players...</p>
                ) : (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 18, justifyContent: "center" }}>
                        {sorted.map(p => (
                            <PlayerCard key={p.id} player={p} rank={ranks[p.id]} isAdmin={false} onClick={setDetailPlayer} />
                        ))}
                        {sorted.length === 0 && <p style={{ color: "rgba(255,255,255,0.3)" }}>No learners found.</p>}
                    </div>
                )}
            </div>

            {detailPlayer && (
                <PlayerDetailModal player={detailPlayer} rank={ranks[detailPlayer.id]} onClose={() => setDetailPlayer(null)} />
            )}
        </div>
    )
}