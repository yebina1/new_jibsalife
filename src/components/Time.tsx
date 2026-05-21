import { useEffect, useState } from 'react'

function Time() {
  const [currentTime, setCurrentTime] = useState(() => new Date())

  useEffect(() => {
    const timerId = window.setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => window.clearInterval(timerId)
  }, [])

  const formattedTime = currentTime.toLocaleTimeString('ko-KR', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: false,
  })

  return <time className="state_bar_time">{formattedTime}</time>
}

export default Time
