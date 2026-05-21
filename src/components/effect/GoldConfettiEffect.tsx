import { useEffect, useState, type CSSProperties } from 'react'
import './GoldConfettiEffect.css'

function s(seed: number) {
  const x = Math.sin(seed) * 10000
  return x - Math.floor(x)
}

const COLORS = ['#FFD700', '#FFC200', '#FFE066', '#F4B800', '#FFD84D']

const pieces = Array.from({ length: 40 }, (_, i) => ({
  id: i,
  left: `${(i / 40) * 96 + s(i * 5 + 1) * (96 / 40) + 2}%`,
  delay: `${s(i * 5 + 2) * 3}s`,
  duration: `${2.2 + s(i * 5 + 3) * 1.5}s`,
  width: s(i * 5 + 8) > 0.5
    ? `${5 + Math.floor(s(i * 5 + 4) * 4)}px`
    : `${14 + Math.floor(s(i * 5 + 4) * 8)}px`,
  height: s(i * 5 + 8) > 0.5
    ? `${16 + Math.floor(s(i * 5 + 5) * 8)}px`
    : `${5 + Math.floor(s(i * 5 + 5) * 4)}px`,
  color: COLORS[Math.floor(s(i * 5 + 6) * COLORS.length)],
  rot: `${s(i * 5 + 7) * 360}deg`,
  spin: `${(s(i * 5 + 8) > 0.5 ? 1 : -1) * (300 + s(i * 5 + 9) * 300)}deg`,
}))

function GoldConfettiEffect() {
  const [visible, setVisible] = useState(true)
  const [stopping, setStopping] = useState(false)

  useEffect(() => {
    const t1 = window.setTimeout(() => setStopping(true), 10000)
    const t2 = window.setTimeout(() => setVisible(false), 12500)
    return () => { window.clearTimeout(t1); window.clearTimeout(t2) }
  }, [])

  if (!visible) return null

  return (
    <div
      className="gold_confetti_wrap"
      aria-hidden="true"
      style={{ opacity: stopping ? 0 : 1, transition: stopping ? 'opacity 2.5s ease' : 'none' }}
    >
      {pieces.map((p) => (
        <span
          key={p.id}
          className="gold_confetti_piece"
          style={{
            left: p.left,
            width: p.width,
            height: p.height,
            background: p.color,
            animationDelay: p.delay,
            animationDuration: p.duration,
            '--rot': p.rot,
            '--spin': p.spin,
          } as CSSProperties}
        />
      ))}
    </div>
  )
}

export default GoldConfettiEffect
