import { useEffect, useRef, useState } from 'react'
import batteryIcon from '../svg/Battery.svg'
import cellularIcon from '../svg/Combined_Shape.svg'
import wifiIcon from '../svg/Wi-Fi.svg'
import './StateBar.css'
import Time from './Time'
import { STATE_BAR_MESSAGE_EVENT, type StateBarMessageDetail } from '../utils/stateBarMessage'

function StateBar() {
  const [topMessage, setTopMessage] = useState<string | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<StateBarMessageDetail>).detail
      if (!detail?.message || detail.placement !== 'top') return

      if (timerRef.current) clearTimeout(timerRef.current)
      setTopMessage(detail.message)
      timerRef.current = setTimeout(() => setTopMessage(null), detail.duration ?? 3000)
    }

    window.addEventListener(STATE_BAR_MESSAGE_EVENT, handler)
    return () => {
      window.removeEventListener(STATE_BAR_MESSAGE_EVENT, handler)
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  return (
    <>
      <div className="state_bar" aria-label="status bar">
        <Time />
        <div className="state_bar_icons">
          <img className="state_bar_cellular" src={cellularIcon} alt="셀룰러 신호" />
          <img className="state_bar_wifi" src={wifiIcon} alt="와이파이" />
          <img className="state_bar_battery" src={batteryIcon} alt="배터리" />
        </div>
      </div>
      {topMessage && (
        <div className="state_bar_top_toast" role="status" aria-live="polite">
          {topMessage}
        </div>
      )}
    </>
  )
}

export default StateBar
