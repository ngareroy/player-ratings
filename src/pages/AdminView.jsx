import { useState, useEffect, useMemo, useCallback } from 'react'
import { useParams, Navigate } from 'react-router-dom'
import { subscribePlayers, savePlayer, removePlayer, ADMIN_SECRET } from '../firebase'
import { calcBestRating, calcOverall, calcCategories, CAT_ORDER, CAT_LABELS } from '../utils'
import PlayerCard from '../components/PlayerCard'
import Modal from '../components/Modal'
import PlayerDetailModal from '../components/PlayerDetailModal'

export default function AdminView() {
    const { secretKey } = useParams()
    const [players, setPlayers] = useState([])
    const [sortBy, setSortBy] = useState("total")
    const [search, setSearch] = useState("")
    const [modal, setModal] = useState(null)
    const [loading, setLoading] = useState(true)
    const [detailPlayer, setDetailPlayer] = useState(null)

    if (secretKey !== ADMIN_SECRET) return <Navigate to="/" replace />

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

    const handleSave = useCallback(async (p) => {
        await savePlayer(p)
        setModal(null)
    }, [])

    const handleDelete = useCallback(async (id) => {
        if (!confirm("Remove this learner?")) return
        await removePlayer(id)
    }, [])

    return (
        <div style={{ minHeight: "100vh", background: "#0a0a1a", padding: "20px 12px", fontFamily: "system-ui" }}>
            <div style={{ maxWidth: 1280, margin: "0 auto" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 2 }}>
                    <h1 style={{ color: "#fff", fontSize: 26, fontWeight: 800, textAlign: "center", margin: 0, letterSpacing: 1 }}>PLAYER RATINGS</h1>
                    <span style={{ background: "rgba(46,204,64,0.15)", color: "#2ecc40", fontSize: 9, fontWeight: 700, padding: "3px 8px", borderRadius: 6, letterSpacing: 1 }}>ADMIN</span>
                </div>
                <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 11, textAlign: "center", margin: "0 0 18px", letterSpacing: 2 }}>{players.length} LEARNERS • EDIT MODE</p>

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
                    <button onClick={() => setModal({ isNew: true, player: null })}
                        style={{ background: "linear-gradient(135deg,#1a6b1a,#2ecc40)", border: "none", borderRadius: 8, padding: "7px 16px", color: "#fff", fontSize: 11, fontWeight: 700, cursor: "pointer", letterSpacing: .5, marginLeft: 4 }}>+ ADD LEARNER</button>
                </div>

                {loading ? (
                    <p style={{ color: "rgba(255,255,255,0.4)", textAlign: "center", marginTop: 60 }}>Loading players...</p>
                ) : (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 18, justifyContent: "center" }}>
                        {sorted.map(p => (
                            <PlayerCard key={p.id} player={p} rank={ranks[p.id]} isAdmin={true}
                                onEdit={pl => setModal({ isNew: false, player: pl })}
                                onDelete={handleDelete} onClick={setDetailPlayer} />
                        ))}
                        {sorted.length === 0 && <p style={{ color: "rgba(255,255,255,0.3)" }}>No learners found.</p>}
                    </div>
                )}
            </div>

            {modal && <Modal player={modal.player} isNew={modal.isNew}
                onSave={handleSave} onClose={() => setModal(null)} allPlayers={players} />}

            {detailPlayer && (
                <PlayerDetailModal player={detailPlayer} rank={ranks[detailPlayer.id]}
                    onClose={() => setDetailPlayer(null)} />
            )}
        </div>
    )
}