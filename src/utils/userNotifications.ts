import { isDemoAccount } from './authAccounts'
import { readCurrentUserId } from './userScopedStorage'

const STORAGE_KEY = 'jibsalife.notifications.user'
export const USER_NOTIFICATIONS_CHANGE_EVENT = 'jibsalife.notifications.user.change'

export type UserNotificationItem = {
  id: number
  title: string
  content: string
  createdAt: string
  path: string
}

const demoNotificationItems: UserNotificationItem[] = [
  {
    id: 1,
    title: '오늘의 챌린지 참여하고 포인트 받자!',
    content: '챌린지 참여 시 포인트를 받을 수 있어요.',
    createdAt: '2026-05-18T00:08:00+09:00',
    path: '/community/challenge',
  },
  {
    id: 2,
    title: '커뮤니티',
    content: '게시글에 댓글이 달렸어요.',
    createdAt: '2026-05-17T15:08:00+09:00',
    path: '/community/petstory',
  },
  {
    id: 3,
    title: '커뮤니티',
    content: '게시글에 댓글이 달렸어요.',
    createdAt: '2026-05-17T18:08:00+09:00',
    path: '/community/petstory',
  },
  {
    id: 4,
    title: '커뮤니티',
    content: '게시글에 댓글이 달렸어요.',
    createdAt: '2026-05-15T23:08:00+09:00',
    path: '/community/petstory',
  },
]

function normalizeUserId(userId: string) {
  return userId.trim().toLowerCase()
}

function getNotificationsStorageKey(userId?: string | null) {
  const normalizedUserId =
    typeof userId === 'string' ? normalizeUserId(userId) : readCurrentUserId()

  return normalizedUserId ? `${STORAGE_KEY}.${normalizedUserId}` : STORAGE_KEY
}

function getDefaultNotifications(userId?: string | null) {
  const normalizedUserId =
    typeof userId === 'string' ? normalizeUserId(userId) : readCurrentUserId()

  return isDemoAccount(normalizedUserId) ? demoNotificationItems : []
}

export function readUserNotifications(): UserNotificationItem[] {
  if (typeof window === 'undefined') return []

  const defaults = getDefaultNotifications()

  try {
    const stored = window.localStorage.getItem(getNotificationsStorageKey())
    const parsed = stored ? (JSON.parse(stored) as UserNotificationItem[]) : []

    if (!Array.isArray(parsed)) {
      return defaults
    }

    if (defaults.length === 0) {
      return parsed
    }

    const mergedById = new Map<number, UserNotificationItem>()
    parsed.forEach((item) => mergedById.set(item.id, item))
    defaults.forEach((item) => mergedById.set(item.id, item))

    return [...mergedById.values()].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
  } catch {
    return defaults
  }
}

export function writeUserNotificationsForUser(userId: string, items: UserNotificationItem[]) {
  if (typeof window === 'undefined') return

  window.localStorage.setItem(
    getNotificationsStorageKey(userId),
    JSON.stringify(items),
  )
  window.dispatchEvent(new Event(USER_NOTIFICATIONS_CHANGE_EVENT))
}

export function seedSignupNotificationsForUser(userId: string) {
  if (typeof window === 'undefined') return

  const now = new Date()
  const justBeforeNow = new Date(now.getTime() - 60 * 1000)

  writeUserNotificationsForUser(userId, [
    {
      id: now.getTime(),
      title: '가입을 환영해요!',
      content: '가입 축하 포인트 1,000P가 지급됐어요.',
      createdAt: now.toISOString(),
      path: '/home',
    },
    {
      id: justBeforeNow.getTime(),
      title: '반려동물 정보를 입력해주세요!',
      content: '프로필을 완성하면 더 정확한 이상 신호 감지와 건강 리포트를 받을 수 있어요.',
      createdAt: justBeforeNow.toISOString(),
      path: '/onboarding?setup=profile',
    },
  ])
}

export function addUserNotification(item: Omit<UserNotificationItem, 'id' | 'createdAt'>) {
  if (typeof window === 'undefined') return

  const existing = readUserNotifications()
  const next = [
    { ...item, id: Date.now(), createdAt: new Date().toISOString() },
    ...existing,
  ]

  window.localStorage.setItem(getNotificationsStorageKey(), JSON.stringify(next))
  window.dispatchEvent(new Event(USER_NOTIFICATIONS_CHANGE_EVENT))
}

export function formatRelativeTime(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime()
  const minutes = Math.floor(diff / 60000)

  if (minutes < 1) return '방금 전'
  if (minutes < 60) return `${minutes}분 전`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}시간 전`

  const days = Math.floor(hours / 24)
  return `${days}일 전`
}
