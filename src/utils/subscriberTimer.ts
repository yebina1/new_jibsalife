export const SUBSCRIBER_TIMER_DURATION = 12 * 60 * 60
const SUBSCRIBER_TIMER_KEY = 'jibsalife.subscriber.timer.endTime'

export function getOrCreateEndTime(): number {
  if (typeof window === 'undefined') return Date.now() + SUBSCRIBER_TIMER_DURATION * 1000
  const stored = localStorage.getItem(SUBSCRIBER_TIMER_KEY)
  if (stored) {
    const endTime = Number(stored)
    if (!isNaN(endTime) && endTime > Date.now()) return endTime
  }
  return resetEndTime()
}

export function resetEndTime(): number {
  const newEndTime = Date.now() + SUBSCRIBER_TIMER_DURATION * 1000
  if (typeof window !== 'undefined') {
    localStorage.setItem(SUBSCRIBER_TIMER_KEY, String(newEndTime))
  }
  return newEndTime
}

export function getRemainingSeconds(endTime: number): number {
  return Math.max(0, Math.ceil((endTime - Date.now()) / 1000))
}

export function formatTimer(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')} 남음`
}
