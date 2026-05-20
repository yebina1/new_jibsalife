import { isDemoAccount } from './authAccounts'
import { checkChallengeDayDone, readCurrentDay } from './challengeStatus'
import { demoCommunityCreatedPosts } from './communityCreatedPosts'
import { readCurrentUserId } from './userScopedStorage'

const STORAGE_KEY = 'jibsalife.notifications.user'
export const USER_NOTIFICATIONS_CHANGE_EVENT = 'jibsalife.notifications.user.change'

export type UserNotificationItem = {
  id: number
  title: string
  content: string
  createdAt: string
  path: string
  state?: unknown
}

const demoReplyComments = [
  {
    id: 1001,
    author: '뿌직뿌직',
    text: '저도 이 부분이 제일 궁금했어요!',
    likes: 2,
    replies: 1,
    createdAt: '2026-05-17T17:40:00+09:00',
  },
  {
    id: 1002,
    author: '말숙이맘',
    text: '@뿌직뿌직 저희 아이는 산책 전에 간식 조금 주니까 훨씬 안정적이었어요.',
    likes: 1,
    replies: 0,
    parentId: 1001,
    createdAt: '2026-05-17T18:05:00+09:00',
  },
]

const staticDemoNotificationItems: UserNotificationItem[] = [
  {
    id: 2,
    title: '커뮤니티',
    content: '내 게시글에 새로운 반응이 달렸어요.',
    createdAt: '2026-05-17T15:08:00+09:00',
    path: `/community/petstory/detail/${demoCommunityCreatedPosts[0]?.id ?? 900001}`,
    state: {
      returnTo: '/notification',
    },
  },
  {
    id: 3,
    title: '커뮤니티',
    content: '내 댓글에 새로운 답글이 달렸어요.',
    createdAt: '2026-05-17T18:08:00+09:00',
    path: `/community/petstory/detail/${demoCommunityCreatedPosts[1]?.id ?? 900002}/comments`,
    state: {
      returnTo: '/notification',
      initialComments: demoReplyComments,
      replyTo: {
        author: '뿌직뿌직',
        commentId: 1001,
      },
      storageKey: 'jibsalife.community.comments.notification.reply',
    },
  },
  {
    id: 4,
    title: '캘린더',
    content: '건강 기록이 등록 완료되었어요.\n캘린더에서 확인해보세요.',
    createdAt: '2026-05-15T23:08:00+09:00',
    path: '/mission',
    state: {
      returnTo: '/notification',
    },
  },
]

const challengeReminderContentByDay: Record<number, string> = {
  0: '오늘의 챌린지로 산책 기록을 남겨보세요.',
  1: '오늘의 챌린지로 커뮤니티 댓글 3개를 남겨보세요.',
  2: '오늘의 챌린지인 투표 참여를 아직 하지 않았어요.\n지금 참여해보세요.',
  3: '오늘의 챌린지로 건강 리포트를 확인해보세요.',
  4: '오늘의 챌린지로 반려 지식 글에 좋아요를 눌러보세요.',
  5: '오늘의 챌린지로 식사 기록을 남겨보세요.',
  6: '오늘의 챌린지로 커뮤니티 게시글을 작성해보세요.',
}

function normalizeUserId(userId: string) {
  return userId.trim().toLowerCase()
}

function getNotificationsStorageKey(userId?: string | null) {
  const normalizedUserId =
    typeof userId === 'string' ? normalizeUserId(userId) : readCurrentUserId()

  return normalizedUserId ? `${STORAGE_KEY}.${normalizedUserId}` : STORAGE_KEY
}

function buildChallengeReminderNotification(): UserNotificationItem | null {
  if (typeof window === 'undefined') return null

  const currentDay = readCurrentDay()
  if (checkChallengeDayDone(currentDay)) return null

  return {
    id: 1,
    title: '챌린지',
    content:
      challengeReminderContentByDay[currentDay] ??
      '오늘의 챌린지에 아직 참여하지 않았어요.\n지금 참여해보세요.',
    createdAt: '2026-05-18T00:08:00+09:00',
    path: '/community/vote',
    state: {
      returnTo: '/notification',
    },
  }
}

function getDefaultNotifications(userId?: string | null) {
  const normalizedUserId =
    typeof userId === 'string' ? normalizeUserId(userId) : readCurrentUserId()

  if (!isDemoAccount(normalizedUserId)) return []

  const challengeReminder = buildChallengeReminderNotification()
  return challengeReminder
    ? [challengeReminder, ...staticDemoNotificationItems]
    : staticDemoNotificationItems
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
      content: '가입 축하 사인업 1,000P가 지급되었어요.',
      createdAt: now.toISOString(),
      path: '/home',
    },
    {
      id: justBeforeNow.getTime(),
      title: '반려동물 정보를 입력해 주세요.',
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
