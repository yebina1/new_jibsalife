import { MISSION_ACTIVITY_RECORDS_CHANGE_EVENT } from './missionActivityRecords'
import {
  MISSION_HISTORY_RECORDS_CHANGE_EVENT,
} from './missionHistoryRecords'
import { readCurrentUserId } from './userScopedStorage'
import { readUserNotifications } from './userNotifications'

export { MISSION_ACTIVITY_RECORDS_CHANGE_EVENT, MISSION_HISTORY_RECORDS_CHANGE_EVENT }

export const NOTIFICATION_READ_STORAGE_KEY = 'notification_read'
export const NOTIFICATION_READ_CHANGE_EVENT = 'jibsalife.notification.readChange'

function getNotificationReadStorageKey() {
  const currentUserId = readCurrentUserId()
  return currentUserId ? `${NOTIFICATION_READ_STORAGE_KEY}.${currentUserId}` : NOTIFICATION_READ_STORAGE_KEY
}

export function readNotificationReadIds(): Set<number> {
  if (typeof window === 'undefined') return new Set<number>()

  try {
    const stored = window.sessionStorage.getItem(getNotificationReadStorageKey())
    const fromStorage: number[] = stored ? JSON.parse(stored) : []
    return new Set(fromStorage)
  } catch {
    return new Set<number>()
  }
}

export function saveNotificationReadIds(ids: Set<number>) {
  if (typeof window === 'undefined') return

  try {
    window.sessionStorage.setItem(getNotificationReadStorageKey(), JSON.stringify([...ids]))
    window.dispatchEvent(new Event(NOTIFICATION_READ_CHANGE_EVENT))
  } catch {
    // ignore storage errors
  }
}

export function shouldShowNotificationDot() {
  if (typeof window === 'undefined') return false

  const readIds = readNotificationReadIds()
  return readUserNotifications().some((notification) => !readIds.has(notification.id))
}
