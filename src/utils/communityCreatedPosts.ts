import { getUserScopedStorageKey, isCurrentDemoUser } from './userScopedStorage'

export const COMMUNITY_CREATED_POSTS_STORAGE_KEY = 'jibsalife.community.createdPosts'
export const COMMUNITY_CREATED_POSTS_CHANGE_EVENT = 'jibsalife.community.createdPosts.change'

export type CommunityCreatedPost = {
  id: number
  tag: string
  title: string
  content?: string
  author?: string
  date?: string
  likes?: number
  comments?: number
  shares?: number
  views?: number
  createdAt?: string
  image: string | null
  images?: string[]
  tags?: string[]
  place?: {
    name: string
    address: string
  }
}

export const demoCommunityCreatedPosts: CommunityCreatedPost[] = [
  {
    id: 900001,
    tag: '일상',
    title: '오늘 산책하다가 처음 본 루트가 너무 좋아요.',
    content:
      '주말 공원에 들렀다가 벤치도 햇살도 딱 좋아서 걷자마자 기분이 좋아졌어요. 다음에도 같은 코스로 가보려고요.',
    date: '2026.04.28',
    likes: 14,
    comments: 3,
    shares: 1,
    views: 0,
    createdAt: '2026-04-28T10:20:00',
    image: null,
    tags: ['산책', '일상'],
  },
  {
    id: 900002,
    tag: '일상',
    title: '식사량이 줄어서 체크해 본 것들 정리',
    content:
      '사료 종류, 급여 시간, 간식 여부까지 하나씩 체크해보니까 원인을 조금 더 빨리 찾을 수 있었어요.',
    date: '2026.04.22',
    likes: 22,
    comments: 5,
    shares: 4,
    views: 0,
    createdAt: '2026-04-22T18:05:00',
    image: null,
    tags: ['식사', '건강'],
  },
  {
    id: 900003,
    tag: '일상',
    title: '배변 기록 해두고 나서 달라진 점',
    content:
      '해두고 나서 보니까 상태 변화를 조금 더 빨리 알아챌 수 있었고 병원 상담할 때도 훨씬 수월했어요.',
    date: '2026.04.16',
    likes: 9,
    comments: 2,
    shares: 0,
    views: 0,
    createdAt: '2026-04-16T08:40:00',
    image: null,
    tags: ['배변', '기록'],
  },
]

export function getCommunityCreatedPostsStorageKey() {
  return getUserScopedStorageKey(COMMUNITY_CREATED_POSTS_STORAGE_KEY)
}

export function getDefaultCreatedPosts() {
  return isCurrentDemoUser() ? demoCommunityCreatedPosts : []
}

export function getDefaultCreatedPostCount() {
  return getDefaultCreatedPosts().length
}

export function readCommunityCreatedPosts(): CommunityCreatedPost[] {
  if (typeof window === 'undefined') return getDefaultCreatedPosts()

  const defaults = getDefaultCreatedPosts()

  try {
    const saved = window.localStorage.getItem(getCommunityCreatedPostsStorageKey())
    const parsed = saved ? JSON.parse(saved) : []
    const storedPosts = Array.isArray(parsed)
      ? parsed.filter(
          (post): post is CommunityCreatedPost =>
            typeof post?.id === 'number' && typeof post?.title === 'string',
        )
      : []

    if (defaults.length === 0) {
      return storedPosts.sort(
        (a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime(),
      )
    }

    if (saved !== null) {
      const normalizedDefaultsById = new Map(defaults.map((post) => [post.id, post]))

      return storedPosts
        .map((post) => {
          const defaultPost = normalizedDefaultsById.get(post.id)
          return defaultPost ? { ...defaultPost, ...post } : post
        })
        .sort(
          (a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime(),
        )
    }

    return [...defaults].sort(
      (a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime(),
    )
  } catch {
    return defaults
  }
}

export function writeCommunityCreatedPosts(posts: CommunityCreatedPost[]) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(getCommunityCreatedPostsStorageKey(), JSON.stringify(posts))
  window.dispatchEvent(new Event(COMMUNITY_CREATED_POSTS_CHANGE_EVENT))
}
