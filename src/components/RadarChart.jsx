import { CAT_ORDER, CAT_LABELS } from '../utils'

export default function RadarChart({ cats, size = 200 }) {
    const cx = size / 2, cy = size / 2, r = size * 0.37, n = 6
    const step = (2 * Math.PI) / n, start = -Math.PI / 2
    const pt = (i, v) => {
        const a = start + i * step, d = (v / 100) * r
        return [cx + d * Math.cos(a), cy + d * Math.sin(a)]
    }
    const vals = CAT_ORDER.map(c => cats[c])
    const poly = vals.map((v, i) => pt(i, v).join(",")).join(" ")

    return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            {[20, 40, 60, 80, 100].map(lv => (
                <polygon key={lv}
                    points={Array.from({ length: n }, (_, i) => pt(i, lv).join(",")).join(" ")}
                    fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
            ))}
            {Array.from({ length: n }, (_, i) => {
                const [x, y] = pt(i, 100)
                return <line key={i} x1={cx} y1={cy} x2={x} y2={y}
                    stroke="rgba(255,255,255,0.07)" strokeWidth="1" />
            })}
            <polygon points={poly} fill="rgba(46,204,64,0.25)"
                stroke="#2ecc40" strokeWidth="2" />
            {vals.map((v, i) => {
                const [x, y] = pt(i, v)
                return <circle key={i} cx={x} cy={y} r="3"
                    fill="#2ecc40" stroke="#fff" strokeWidth="1" />
            })}
            {Array.from({ length: n }, (_, i) => {
                const [x, y] = pt(i, 115)
                return <text key={i} x={x} y={y} textAnchor="middle"
                    dominantBaseline="central" fontSize="9" fontWeight="700"
                    fill="rgba(255,255,255,0.6)" fontFamily="system-ui">
                    {CAT_LABELS[i]}
                </text>
            })}
        </svg>
    )
}