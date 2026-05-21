import { useEffect, useState } from 'react'

export function useTypingPlaceholder(text: string, speed = 75) {
  const [displayed, setDisplayed] = useState('')

  useEffect(() => {
    setDisplayed('')
    let i = 0
    let timeout: ReturnType<typeof setTimeout>

    function typeNext() {
      i++
      setDisplayed(text.slice(0, i))
      if (i < text.length) {
        timeout = setTimeout(typeNext, speed)
      } else {
        timeout = setTimeout(() => {
          i = 0
          setDisplayed('')
          timeout = setTimeout(typeNext, speed)
        }, 2800)
      }
    }

    timeout = setTimeout(typeNext, speed)
    return () => clearTimeout(timeout)
  }, [text, speed])

  return displayed
}
