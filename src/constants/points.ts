export const TOTAL_REWARD_POINTS = 1260
export const CHALLENGE_REWARD_CLAIMED_STORAGE_KEY = 'jibsalife.community.challengeRewardClaimed'
export const CURRENT_POINTS_STORAGE_KEY = 'jibsalife.points.current'
export const APPLIED_REWARD_EVENTS_STORAGE_KEY = 'jibsalife.points.appliedRewardEvents'
export const COMPLETED_CHALLENGE_CARD_IDS_STORAGE_KEY = 'jibsalife.community.completedChallengeCardIds'

export function formatPointValue(value: number) {
  return value.toLocaleString('ko-KR')
}

export function formatPointWithSuffix(value: number) {
  return `${formatPointValue(value)}P`
}

export function formatProfilePointDetails(value: number) {
  return `포인트: ${formatPointValue(value)}`
}

export function getCurrentPoints() {
  if (typeof window === 'undefined') return TOTAL_REWARD_POINTS

  const savedValue = window.localStorage.getItem(CURRENT_POINTS_STORAGE_KEY)
  const parsedValue = savedValue ? Number(savedValue) : Number.NaN

  return Number.isFinite(parsedValue) ? parsedValue : TOTAL_REWARD_POINTS
}

export function setCurrentPoints(value: number) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(CURRENT_POINTS_STORAGE_KEY, String(value))
}

function getAppliedRewardEvents() {
  if (typeof window === 'undefined') return []

  try {
    const savedValue = window.localStorage.getItem(APPLIED_REWARD_EVENTS_STORAGE_KEY)
    const parsedValue = savedValue ? JSON.parse(savedValue) : []
    return Array.isArray(parsedValue) ? parsedValue.filter((item) => typeof item === 'string') : []
  } catch {
    return []
  }
}

function setAppliedRewardEvents(events: string[]) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(APPLIED_REWARD_EVENTS_STORAGE_KEY, JSON.stringify(events.slice(-30)))
}

export function applyRewardPoints(amount: number, rewardEventId?: string) {
  const currentPoints = getCurrentPoints()

  if (!rewardEventId) {
    return currentPoints
  }

  const appliedEvents = getAppliedRewardEvents()

  if (appliedEvents.includes(rewardEventId)) {
    return currentPoints
  }

  const nextPoints = currentPoints + Math.max(0, amount)
  setCurrentPoints(nextPoints)
  setAppliedRewardEvents([...appliedEvents, rewardEventId])
  return nextPoints
}

export function getCompletedChallengeCardIds() {
  if (typeof window === 'undefined') return []

  try {
    const savedValue = window.localStorage.getItem(COMPLETED_CHALLENGE_CARD_IDS_STORAGE_KEY)
    const parsedValue = savedValue ? JSON.parse(savedValue) : []
    return Array.isArray(parsedValue)
      ? parsedValue.filter((item) => Number.isFinite(Number(item))).map((item) => Number(item))
      : []
  } catch {
    return []
  }
}

export function addCompletedChallengeCardId(cardId: number) {
  if (typeof window === 'undefined') return

  const currentIds = getCompletedChallengeCardIds()

  if (currentIds.includes(cardId)) return

  window.localStorage.setItem(
    COMPLETED_CHALLENGE_CARD_IDS_STORAGE_KEY,
    JSON.stringify([...currentIds, cardId]),
  )
}
