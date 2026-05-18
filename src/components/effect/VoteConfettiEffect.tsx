import { useEffect, useRef, useState } from 'react'
import Confetti from 'react-confetti'

const COLORS = ['#7BD8C8', '#FFC94C', '#FF8FA4', '#9ED9EA', '#B78DE4', '#FF9A87']

function drawPiece(ctx: CanvasRenderingContext2D) {
  const w = 7, h = 14, r = 2
  ctx.beginPath()
  if (ctx.roundRect) {
    ctx.roundRect(-w / 2, -h / 2, w, h, r)
  } else {
    ctx.rect(-w / 2, -h / 2, w, h)
  }
  ctx.fill()
}

function VoteConfettiEffect() {
  const [size, setSize] = useState({ width: 0, height: 0 })
  const [numberOfPieces, setNumberOfPieces] = useState(60)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = wrapperRef.current
    if (el) {
      const rect = el.getBoundingClientRect()
      setSize({ width: rect.width, height: rect.height })
    }
  }, [])

  useEffect(() => {
    const timer = window.setTimeout(() => setNumberOfPieces(0), 3000)
    return () => window.clearTimeout(timer)
  }, [])

  return (
    <div
      ref={wrapperRef}
      style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1 }}
    >
      <Confetti
        width={size.width}
        height={size.height}
        numberOfPieces={numberOfPieces}
        colors={COLORS}
        drawShape={drawPiece}
        opacity={0.9}
      />
    </div>
  )
}

export default VoteConfettiEffect
