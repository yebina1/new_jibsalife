import { AUTH_CURRENT_USER_STORAGE_KEY, isDemoAccount } from './authAccounts'

export function readCurrentUserId() {
  if (typeof window === 'undefined') return null
  return window.localStorage.getItem(AUTH_CURRENT_USER_STORAGE_KEY)
}

export function getUserScopedStorageKey(baseKey: string) {
  const currentUserId = readCurrentUserId()
  return currentUserId ? `${baseKey}.${currentUserId}` : baseKey
}

export function isCurrentDemoUser() {
  return isDemoAccount(readCurrentUserId())
}
