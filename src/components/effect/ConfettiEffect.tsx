import { useEffect, useRef, useState } from 'react'
import Confetti from 'react-confetti'

type Props = {
  contained?: boolean
}

function ConfettiEffect({ contained = false }: Props) {
  const [size, setSize] = useState({ width: 0, height: 0 })
  const [numberOfPieces, setNumberOfPieces] = useState(50)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (contained) {
      const el = wrapperRef.current
      if (el) {
        const rect = el.getBoundingClientRect()
        setSize({ width: rect.width, height: rect.height })
      }
      return
    }

    const updateViewport = () => setSize({ width: window.innerWidth, height: window.innerHeight })
    updateViewport()
    window.addEventListener('resize', updateViewport)
    return () => window.removeEventListener('resize', updateViewport)
  }, [contained])

  useEffect(() => {
    const timer = window.setTimeout(() => setNumberOfPieces(0), 10000)
    return () => window.clearTimeout(timer)
  }, [])

  if (contained) {
    return (
      <div
        ref={wrapperRef}
        style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1 }}
      >
        <Confetti
          width={size.width}
          height={size.height}
          numberOfPieces={numberOfPieces}
          opacity={0.7}
          colors={['#F1C93A', '#9C78F0', '#6FCDF0', '#E57DC3']}
        />
      </div>
    )
  }

  return (
    <Confetti
      width={size.width}
      height={size.height}
      numberOfPieces={numberOfPieces}
      opacity={0.7}
      colors={['#F1C93A', '#9C78F0', '#6FCDF0', '#E57DC3']}
      style={{ pointerEvents: 'none', zIndex: 20, position: 'fixed' }}
    />
  )
}

export default ConfettiEffect
