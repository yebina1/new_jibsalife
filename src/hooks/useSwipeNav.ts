import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router'

function isInsideHorizontalScroll(target: EventTarget | null): boolean {
  let node = target instanceof Element ? target : null
  while (node && node !== document.body) {
    if (node.hasAttribute('data-no-swipe-nav')) return true
    if (node.scrollWidth > node.clientWidth) {
      const overflow = window.getComputedStyle(node).overflowX
      if (overflow === 'auto' || overflow === 'scroll') return true
    }
    node = node.parentElement
  }
  return false
}

export function useSwipeNav(leftSwipe?: string, rightSwipe?: string) {
  const navigate = useNavigate()
  const startX = useRef<number | null>(null)
  const startY = useRef<number | null>(null)

  useEffect(() => {
    if (!leftSwipe && !rightSwipe) return

    const onStart = (e: TouchEvent) => {
      if (isInsideHorizontalScroll(e.target)) return
      startX.current = e.touches[0].clientX
      startY.current = e.touches[0].clientY
    }

    const onEnd = (e: TouchEvent) => {
      if (startX.current === null || startY.current === null) return
      const dx = e.changedTouches[0].clientX - startX.current
      const dy = e.changedTouches[0].clientY - startY.current
      startX.current = null
      startY.current = null

      if (Math.abs(dx) < 60 || Math.abs(dx) < Math.abs(dy)) return

      if (dx < 0 && leftSwipe) navigate(leftSwipe)
      else if (dx > 0 && rightSwipe) navigate(rightSwipe)
    }

    document.addEventListener('touchstart', onStart, { passive: true })
    document.addEventListener('touchend', onEnd, { passive: true })
    return () => {
      document.removeEventListener('touchstart', onStart)
      document.removeEventListener('touchend', onEnd)
    }
  }, [navigate, leftSwipe, rightSwipe])
}
