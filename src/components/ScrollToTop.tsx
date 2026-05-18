import { useEffect } from 'react'
import { useLocation } from 'react-router'

function ScrollToTop() {
  const { pathname, search } = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })

    document.querySelectorAll<HTMLElement>('.layout_content, .page').forEach((element) => {
      element.scrollTo({ top: 0, left: 0, behavior: 'auto' })
    })
  }, [pathname, search])

  return null
}

export default ScrollToTop
