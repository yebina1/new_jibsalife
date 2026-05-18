import './CommunityShared.css'
import './CommunityPetStory.css'
import { useSwipeNav } from '../../hooks/useSwipeNav'
import Title from '../../components/Title'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router'
import PageHeader from '../../components/PageHeader'
import HeaderIcon from '../../components/HeaderIcon'
import Button from '../../components/html/Button'
import FloatingWriteButton from '../../components/FloatingWriteButton'
import LikeButton from '../../components/LikeButton'
import PetStoryFeedItem from '../../components/PetStoryFeedItem'
import knowledge1 from '../../img/petstory/Knowledge/knowledge1.png'
import knowledge2 from '../../img/petstory/Knowledge/knowledge2.png'
import knowledge3 from '../../img/petstory/Knowledge/knowledge3.png'
import knowledge4 from '../../img/petstory/Knowledge/knowledge4.png'
import dailyThumbnail from '../../img/petstory/daily/daily_thumbnail.jpg'
import life1 from '../../img/petstory/daily/daily_1.jpg'
import life2 from '../../img/petstory/daily/daily_2.png'
import life3 from '../../img/petstory/daily/daily_3.png'
import life4 from '../../img/petstory/daily/daily_4.png'
import life5 from '../../img/petstory/daily/daily_5.jpg'
import life6 from '../../img/petstory/daily/daily_6.jpg'
import { readMyProfileName } from '../../utils/myProfile'
import {
  readCommunityCreatedPosts,
  writeCommunityCreatedPosts,
} from '../../utils/communityCreatedPosts'
import { petStoryDetailCommentCount } from './CommunityPetStoryDetailData'
import VoteMissionBanner from '../../components/VoteMissionBanner'
import petstoryOverviewImg from '../../img/petstory/petstory_overview.png'
import petstoryDailyImg from '../../img/petstory/daily/petstory_daily.png'
import petstoryKnowledgeImg from '../../img/petstory/Knowledge/petstory_Knowledge.png'
import ConfirmDialog from '../../components/ConfirmDialog'

// eslint-disable-next-line react-refresh/only-export-components
export const dailyPosts = [
  { id: 2, tag: '일상', title: '강아지 산책하러 나가면 자는척 해요', author: '탬블러', createdAt: '2026-05-10T14:00:00', likes: 38, comments: 20, shares: 14, views: 980, image: life1 },
  { id: 3, tag: '일상', title: '냉전중', author: '장마', createdAt: '2026-05-09T10:00:00', likes: 7, comments: 3, shares: 2, views: 762, image: life2 },
  { id: 4, tag: '일상', title: '강아지 발사탕 스프레이 추천해주세요!', author: '파란꽃', createdAt: '2026-05-06T16:00:00', likes: 25, comments: 11, shares: 9, views: 524, image: life3 },
  { id: 5, tag: '일상', title: '뽀미랑 부산 여행기', author: '뽀직뽀직', createdAt: '2026-05-04T09:00:00', likes: 51, comments: 27, shares: 18, views: 318, image: life4 },
  { id: 6, tag: '일상', title: '말숙이랑 벚꽃', author: '말망', createdAt: '2026-04-27T12:00:00', likes: 16, comments: 5, shares: 3, views: 215, image: life5 },
  { id: 7, tag: '일상', title: '귀여우면 다야?', author: '크림빵', createdAt: '2026-04-11T18:00:00', likes: 44, comments: 15, shares: 11, views: 143, image: life6 },
]

type SortOption = '인기순' | '최신순' | '댓글순' | '공유순'
const likedPostsStorageKey = 'jibsalife.community.likedPostIds'

type CommunityPost = {
  id: number
  tag: string
  title: string
  content?: string
  author: string
  date: string
  timeText?: string
  likes: number
  comments: number
  shares?: number
  createdAt: string
  image: string | null
  images?: string[]
  tags?: string[]
}

type PetStoryFeedPost = {
  id: number
  tag: string
  title: string
  content?: string
  author: string
  time?: string
  image: string | null
  images?: string[]
  tags?: string[]
  likes: number
  comments: number
  shares?: number
  views?: number
  createdAt?: string
  isCreated?: boolean
  path?: string
  viewsText?: string
  objectPosition?: string
}

function loadCreatedPosts(): CommunityPost[] {
  const profileName = readMyProfileName()

  return readCommunityCreatedPosts().map((post) => ({
    ...post,
    date: post.date ?? '',
    likes: post.likes ?? 0,
    comments: post.comments ?? 0,
    shares: post.shares ?? 0,
    createdAt: post.createdAt ?? new Date(0).toISOString(),
    author: post.author === '나' || !post.author ? profileName : post.author,
  }))
}

function loadLikedPostIds(): number[] {
  if (typeof window === 'undefined') return []
  try {
    const saved = window.localStorage.getItem(likedPostsStorageKey)
    const parsed = saved ? JSON.parse(saved) : []
    return Array.isArray(parsed) ? parsed.filter((id): id is number => typeof id === 'number') : []
  } catch {
    return []
  }
}

const postData: CommunityPost[] = [
  { id: 1, tag: '일상', title: '강아지 산책하러 나가면 자는척 해요', author: '뿌직뿌직', date: '2026.04.30', timeText: '3시간 전', likes: 31, comments: 12, shares: 9, createdAt: '2026-04-30T09:00:00', image: life1 },
  { id: 2, tag: '일상', title: '냉전중', author: '뿌직뿌직', date: '2026.04.30', timeText: '3시간 전', likes: 8, comments: 5, shares: 3, createdAt: '2026-04-30T18:20:00', image: life2 },
  { id: 3, tag: '일상', title: '강아지 발사탕 스프레이 추천해주세요!', author: '뿌직뿌직', date: '2026.04.30', timeText: '3시간 전', likes: 24, comments: 9, shares: 7, createdAt: '2026-04-30T14:10:00', image: life3 },
  { id: 4, tag: '일상', title: '뽀미랑 부산 여행기', author: '뿌직뿌직', date: '2026.04.30', timeText: '3시간 전', likes: 15, comments: 7, shares: 4, createdAt: '2026-04-30T11:00:00', image: life4 },
  { id: 5, tag: '일상', title: '말숙이랑 벚꽃 구경 다녀왔어요', author: '말숙이맘', date: '2026.04.30', timeText: '3시간 전', likes: 43, comments: 18, shares: 13, createdAt: '2026-04-30T10:20:00', image: life5 },
  { id: 6, tag: '일상', title: '귀여우면 다야?', author: '크림빵', date: '2026.04.30', timeText: '3시간 전', likes: 19, comments: 6, shares: 5, createdAt: '2026-04-30T08:40:00', image: life6 },
]

// eslint-disable-next-line react-refresh/only-export-components
export const knowledgeFeedItems = [
  { id: 1, tag: '산책', title: '강아지 산책 안 하면 생기는 문제점', image: knowledge1, likes: 8, comments: 3, viewsText: '1201', objectPosition: '61% center', path: '/community/petstory/knowledge/walkproblems', createdAt: '2026-05-02T09:00:00' },
  { id: 2, tag: '건강', title: '고양이 점프의 숨겨진 비밀', image: knowledge2, likes: 8, comments: 3, viewsText: '968', objectPosition: '64% center', path: '/community/petstory/knowledge/catjumpsecret', createdAt: '2026-05-01T10:00:00' },
  { id: 3, tag: '일상', title: '고양이에게 절대 주면 안 되는 음식 7가지', titleLines: ['고양이에게 절대 주면', '안 되는 음식 7가지'], image: knowledge3, likes: 8, comments: 3, viewsText: '860', objectPosition: '43% center', path: '/community/petstory/knowledge/forbiddenfoods', createdAt: '2026-04-30T11:00:00' },
  { id: 4, tag: '일상', title: '봄철 강아지 알레르기 증상과 관리법', titleLines: ['봄철 강아지 알레르기', '증상과 관리법'], image: knowledge4, likes: 8, comments: 3, viewsText: '482', objectPosition: '48% center', path: '/community/petstory/knowledge/springallergy', createdAt: '2026-04-29T12:00:00' },
] as const

function getKnowledgeTitleLines(item: (typeof knowledgeFeedItems)[number]) {
  return 'titleLines' in item ? [...item.titleLines] : [item.title]
}

function getKnowledgeIdFromPath(path: string): string {
  return path.split('/').pop() ?? ''
}

function readKnowledgeViewCount(knowledgeId: string): number | null {
  try {
    const saved = window.localStorage.getItem(`jibsalife.community.knowledge.${knowledgeId}.views`)
    if (saved !== null) {
      const parsed = parseInt(saved, 10)
      if (Number.isFinite(parsed)) return parsed
    }
  } catch { /* noop */ }
  return null
}

function buildKnowledgeViewCountMap(): Record<string, number | null> {
  const map: Record<string, number | null> = {}
  knowledgeFeedItems.forEach(item => {
    const id = getKnowledgeIdFromPath(item.path)
    map[id] = readKnowledgeViewCount(id)
  })
  return map
}

function buildDailyViewCountMap(): Record<number, number | null> {
  const map: Record<number, number | null> = {}
  dailyPosts.forEach(post => {
    try {
      const saved = window.localStorage.getItem(`jibsalife.community.views.${post.id}`)
      map[post.id] = saved !== null ? parseInt(saved, 10) : null
    } catch {
      map[post.id] = null
    }
  })
  return map
}

const sortByParam: Record<string, SortOption> = {
  popular: '인기순',
  latest: '최신순',
  comments: '댓글순',
  shares: '공유순',
}

function toFeedPost(post: CommunityPost): PetStoryFeedPost {
  return {
    id: post.id,
    tag: post.tag,
    title: post.title,
    content: post.content,
    author: post.author,
    time: post.timeText ?? post.date,
    image: post.image,
    images: post.images,
    tags: post.tags,
    likes: post.likes,
    comments: post.comments,
    shares: post.shares ?? 0,
    createdAt: post.createdAt,
    isCreated: true,
  }
}

function getRelativeTimeText(createdAt: string, nowTime: number) {
  const createdTime = new Date(createdAt).getTime()
  const diffSeconds = Math.max(0, Math.floor((nowTime - createdTime) / 1000))
  const diffMinutes = Math.floor(diffSeconds / 60)
  const diffHours = Math.floor(diffMinutes / 60)
  const diffDays = Math.floor(diffHours / 24)
  const diffMonths = Math.floor(diffDays / 30)
  const diffYears = Math.floor(diffMonths / 12)

  if (diffSeconds < 60) return '방금 전'
  if (diffMinutes < 60) return `${diffMinutes}분 전`
  if (diffHours <= 23) return `${diffHours}시간 전`
  if (diffDays <= 31) return `${diffDays}일 전`
  if (diffMonths <= 12) return `${Math.max(1, diffMonths)}달 전`
  return `${Math.max(1, diffYears)}년 전`
}

function CommunityPetStory() {
  useSwipeNav('/community/challenge', '/community/overview')
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [searchParams] = useSearchParams()
  const sortParam = searchParams.get('sort') ?? 'latest'
  const selectedSort = sortByParam[sortParam] ?? '최신순'

  const [likedPostIds, setLikedPostIds] = useState<number[]>(loadLikedPostIds)
  const [createdPosts, setCreatedPosts] = useState<CommunityPost[]>(loadCreatedPosts)
  const [nowTime, setNowTime] = useState(() => Date.now())
  const [knowledgeViewCounts, setKnowledgeViewCounts] = useState<Record<string, number | null>>(buildKnowledgeViewCountMap)
  const [dailyViewCounts, setDailyViewCounts] = useState<Record<number, number | null>>(buildDailyViewCountMap)
  const [deleteTargetPostId, setDeleteTargetPostId] = useState<number | null>(null)

  const isOverview = pathname === '/community/petstory'
  const isKnowledge = pathname === '/community/petstory/knowledge'
  const isDaily = pathname === '/community/petstory/daily'

  useEffect(() => {
    window.localStorage.setItem(likedPostsStorageKey, JSON.stringify(likedPostIds))
  }, [likedPostIds])

  useEffect(() => {
    const sync = () => {
      setLikedPostIds(loadLikedPostIds())
      setCreatedPosts(loadCreatedPosts())
      setKnowledgeViewCounts(buildKnowledgeViewCountMap())
      setDailyViewCounts(buildDailyViewCountMap())
    }
    window.addEventListener('focus', sync)
    window.addEventListener('pageshow', sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener('focus', sync)
      window.removeEventListener('pageshow', sync)
      window.removeEventListener('storage', sync)
    }
  }, [])

  useEffect(() => {
    const timerId = window.setInterval(() => {
      setNowTime(Date.now())
    }, 30000)

    return () => window.clearInterval(timerId)
  }, [])

  const visibleCreatedPosts = useMemo(
    () => createdPosts.filter((post) => post.tag === '일상'),
    [createdPosts],
  )
  const currentProfileName = readMyProfileName()
  const isOwnPost = useCallback(
    (postAuthor: string) => postAuthor === currentProfileName,
    [currentProfileName],
  )
  const handleEditCreatedPost = useCallback(
    (post: PetStoryFeedPost) => {
      navigate('/community/petstory/write', {
        state: {
          editPost: post,
          returnTo: pathname,
        },
      })
    },
    [navigate, pathname],
  )
  const handleRequestDeleteCreatedPost = useCallback((postId: number) => {
    setDeleteTargetPostId(postId)
  }, [])
  const confirmDeleteCreatedPost = useCallback(() => {
    if (deleteTargetPostId === null) return

    const nextPosts = readCommunityCreatedPosts().filter((post) => post.id !== deleteTargetPostId)
    writeCommunityCreatedPosts(nextPosts)
    setCreatedPosts(loadCreatedPosts())
    setDeleteTargetPostId(null)
  }, [deleteTargetPostId])
  const isCreatedPost = useCallback(
    (postId: number) => visibleCreatedPosts.some((post) => post.id === postId),
    [visibleCreatedPosts],
  )
  const getPostTimeText = (post: { id: number; createdAt?: string; time?: string; timeText?: string }) => {
    if (post.createdAt) {
      return getRelativeTimeText(post.createdAt, nowTime)
    }
    return post.time ?? post.timeText
  }
  const getPostCommentCount = (post: { id: number; image: string | null }) => {
    try {
      const saved = window.localStorage.getItem(`jibsalife.community.comments.${post.id}`)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed)) return parsed.length
      }
    } catch {
      // Ignore malformed localStorage data and fall back to the default count.
    }
    if (isCreatedPost(post.id)) return 0
    return post.image ? petStoryDetailCommentCount : 0
  }
  const openPostDetail = (post: {
    id: number
    tag: string
    title: string
    content?: string
    author: string
    time?: string
    timeText?: string
    date?: string
    image: string | null
    images?: string[]
    tags?: string[]
    likes: number
    comments: number
    shares?: number
    views?: number
    createdAt?: string
  }) => {
    navigate(`/community/petstory/detail/${post.id}`, {
      state: {
        post: {
          id: post.id,
          tag: post.tag,
          title: post.title,
          content: post.content,
          author: post.author,
          time: getPostTimeText(post),
          date: post.date,
          image: post.image,
          images: post.images,
          tags: post.tags,
          likes: post.likes,
          comments: getPostCommentCount(post),
          shares: post.shares ?? 10,
          views: post.views,
          createdAt: post.createdAt,
        },
      },
    })
  }

  const openKnowledgeDetail = (item: {
    id: number
    tag: string
    title: string
    image: string
    likes: number
    comments: number
    viewsText?: string
    objectPosition?: string
    path?: string
    createdAt?: string
  }) => {
    navigate(item.path ?? `/community/petstory/knowledge/${item.id}`, {
      state: {
        item,
      },
    })
  }

  const posts = useMemo(() => {
    const activePostData = [...visibleCreatedPosts, ...postData]

    return [...activePostData].sort((a, b) => {
      if (selectedSort === '인기순') {
        if (b.likes !== a.likes) return b.likes - a.likes
        return b.comments - a.comments
      }
      if (selectedSort === '댓글순') {
        if (b.comments !== a.comments) return b.comments - a.comments
        return b.likes - a.likes
      }
      if (selectedSort === '공유순') {
        return (b.shares ?? 0) - (a.shares ?? 0)
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })
  }, [selectedSort, visibleCreatedPosts])

  const dailyFeedPosts = useMemo(() => {
    const combined: PetStoryFeedPost[] = [
      ...visibleCreatedPosts.map(toFeedPost),
      ...dailyPosts.map((post) => ({
        id: post.id,
        tag: post.tag,
        title: post.title,
        author: post.author,
        image: post.image as string | null,
        likes: post.likes,
        comments: post.comments,
        shares: post.shares,
        views: post.views,
        createdAt: post.createdAt,
      })),
    ]

    return combined.sort((a, b) => {
      if (selectedSort === '인기순') {
        if (b.likes !== a.likes) return b.likes - a.likes
        return b.comments - a.comments
      }
      if (selectedSort === '댓글순') {
        if (b.comments !== a.comments) return b.comments - a.comments
        return b.likes - a.likes
      }
      if (selectedSort === '공유순') {
        return (b.shares ?? 0) - (a.shares ?? 0)
      }
      return new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime()
    })
  }, [selectedSort, visibleCreatedPosts])

  const sortedKnowledgeItems = useMemo(() => {
    return [...knowledgeFeedItems].sort((a, b) => {
      if (selectedSort === '인기순') {
        if (b.likes !== a.likes) return b.likes - a.likes
        return b.comments - a.comments
      }
      if (selectedSort === '댓글순') {
        if (b.comments !== a.comments) return b.comments - a.comments
        return b.likes - a.likes
      }
      if (selectedSort === '공유순') return 0
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })
  }, [selectedSort])

  const overviewPosts = useMemo(() => {
    const combined: PetStoryFeedPost[] = [
      ...dailyFeedPosts,
      ...knowledgeFeedItems.map((item) => ({
        id: item.id + 1000,
        tag: '반려상식' as string,
        title: item.title,
        author: '운영팀',
        time: undefined as string | undefined,
        image: item.image as string | null,
        likes: item.likes,
        comments: item.comments,
        path: item.path,
        viewsText: item.viewsText,
        objectPosition: item.objectPosition,
        createdAt: item.createdAt,
      })),
    ]
    return combined.sort((a, b) => {
      if (selectedSort === '인기순') {
        if (b.likes !== a.likes) return b.likes - a.likes
        return b.comments - a.comments
      }
      if (selectedSort === '댓글순') {
        if (b.comments !== a.comments) return b.comments - a.comments
        return b.likes - a.likes
      }
      if (selectedSort === '공유순') {
        return (b.shares ?? 0) - (a.shares ?? 0)
      }
      return new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime()
    })
  }, [dailyFeedPosts, selectedSort])

  const toggleLike = (postId: number) => {
    setLikedPostIds((prev) =>
      prev.includes(postId) ? prev.filter((id) => id !== postId) : [...prev, postId]
    )
  }

  return (
    <>
      <PageHeader
        title="집사인생"
        rightContent={
          <>
            <Button type="button" aria-label="검색" className="community_header_search" onClick={() => navigate('/community/search')}>
              <HeaderIcon type="search" />
            </Button>
            <Button type="button" aria-label="캘린더" onClick={() => navigate('/mission')}>
              <HeaderIcon type="calendar" />
            </Button>
            <Button type="button" aria-label="알림" onClick={() => navigate('/notification')}>
              <HeaderIcon type="notification" />
            </Button>
          </>
        }
      />

      <main className={isDaily ? 'page cpsd_page' : 'page community_page community_page_petstory'}>
        {isOverview ? (
          <VoteMissionBanner
            className="cps_section_banner cps_section_banner_overview"
            backgroundColor="#FFB62E"
            imageSrc={petstoryOverviewImg}
            title={<>펫스토리,<br />이야기가 모이는 곳</>}
            description="집사들의 반려생활 커뮤니티"
          />
        ) : isDaily ? (
          <VoteMissionBanner
            className="cps_section_banner cps_section_banner_daily"
            backgroundColor="#B8D7AE"
            imageSrc={petstoryDailyImg}
            title={<>일상</>}
            description={<>반려동물과 함께한 순간을<br />자유롭게 공유해보세요</>}
          />
        ) : isKnowledge ? (
          <VoteMissionBanner
            className="cps_section_banner cps_section_banner_knowledge"
            backgroundColor="#A3D7FD"
            imageSrc={petstoryKnowledgeImg}
            title={<>반려상식</>}
            description={<>건강부터 행동까지,<br/>집사인생이 전하는 반려 이야기</>}
          />
        ) : (
          <VoteMissionBanner
            className="cps_vote_banner"
            backgroundColor="#FFD6D9"
            timerColor="#BB0600"
            timeText="02:18:35 남음"
            title={<>멍스타 모델 도전</>}
            description="내 반려동물을 스타로!"
          />
        )}
        {isDaily ? (
          <div className="cpsd_feed">
              {dailyFeedPosts.map((post) => (
                <PetStoryFeedItem
                  key={post.id}
                  postId={post.id}
                  tag={post.tag}
                  title={post.title}
                  author={post.author}
                  time={getPostTimeText(post)}
                  image={post.image ?? dailyThumbnail}
                  likes={post.likes + (likedPostIds.includes(post.id) ? 1 : 0)}
                  comments={getPostCommentCount(post)}
                  views={dailyViewCounts[post.id] ?? post.views ?? post.viewsText ?? 120}
                  liked={likedPostIds.includes(post.id)}
                  isOwn={isOwnPost(post.author)}
                  onClick={() => openPostDetail(post)}
                  onLikeClick={(event) => {
                    event.stopPropagation()
                    toggleLike(post.id)
                  }}
                  onEdit={() => handleEditCreatedPost(post)}
                  onDelete={() => handleRequestDeleteCreatedPost(post.id)}
                />
              ))}
            </div>
        ) : isKnowledge ? (
          <section className="community_knowledge_feed">
              <div className="community_knowledge_list">
                {sortedKnowledgeItems.map((item) => (
                  <article
                    key={item.id}
                    className="community_knowledge_feed_card community_knowledge_feed_card_clickable"
                    onClick={() => openKnowledgeDetail(item)}
                  >
                    <img
                      className="community_knowledge_feed_image"
                      src={item.image}
                      alt={item.title}
                      style={{ objectPosition: item.objectPosition }}
                    />
                    <Title
                      as="h5"
                      className="community_knowledge_feed_overlay"
                      title={
                        <>
                          {getKnowledgeTitleLines(item).map((line) => (
                            <span key={line}>{line}</span>
                          ))}
                        </>
                      }
                    >
                      <p className="community_knowledge_feed_views">
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                        <span>{(() => { const c = knowledgeViewCounts[getKnowledgeIdFromPath(item.path)]; return c != null ? c.toLocaleString('ko-KR') : item.viewsText })()}</span>
                      </p>
                    </Title>
                  </article>
                ))}
              </div>
            </section>
        ) : isOverview ? (
          <section className="community_feed">
              {overviewPosts.map((post) => (
                <PetStoryFeedItem
                  key={post.id}
                  postId={post.id}
                  tag={post.tag}
                  title={post.title}
                  author={post.author}
                  time={getPostTimeText(post)}
                  image={post.image ?? dailyThumbnail}
                  imageObjectPosition={post.objectPosition}
                  likes={post.likes + (likedPostIds.includes(post.id) ? 1 : 0)}
                  comments={getPostCommentCount(post)}
                  views={dailyViewCounts[post.id] ?? post.views ?? post.viewsText ?? 120}
                  liked={likedPostIds.includes(post.id)}
                  isOwn={post.path ? false : isOwnPost(post.author)}
                  onClick={() => {
                    if (post.path) {
                      openKnowledgeDetail({
                        id: post.id,
                        tag: post.tag,
                        title: post.title,
                        image: post.image ?? knowledge1,
                        likes: post.likes,
                        comments: post.comments,
                        viewsText: post.viewsText,
                        objectPosition: post.objectPosition,
                        path: post.path,
                        createdAt: post.createdAt,
                      })
                      return
                    }
                    openPostDetail(post)
                  }}
                  onLikeClick={(event) => {
                    event.stopPropagation()
                    toggleLike(post.id)
                  }}
                  onEdit={() => handleEditCreatedPost(post)}
                  onDelete={() => handleRequestDeleteCreatedPost(post.id)}
                />
              ))}
            </section>
        ) : (
          <section className="community_feed">
            {posts.length > 0 ? (
              posts.map((post) => (
                <article
                  key={post.id}
                  className="community_post"
                  onClick={() => openPostDetail(post)}
                >
                  <img className="community_post_image" src={post.image ?? dailyThumbnail} alt={post.title} />
                  <div className="community_post_body">
                    <div className="community_post_header">
                      <span className="community_post_tag">{post.tag}</span>
                      <h2>{post.title}</h2>
                    </div>
                    <div className="community_post_meta">
                      <span className="community_post_author">{post.author}</span>
                    </div>
                    <p className="community_post_date">
                      {getPostTimeText(post) ? <span>{getPostTimeText(post)}</span> : null}
                      <span>{post.date}</span>
                    </p>
                    <div className="community_post_actions">
                      <LikeButton
                        type="button"
                        liked={likedPostIds.includes(post.id)}
                        onClick={(event) => {
                          event.stopPropagation()
                          toggleLike(post.id)
                        }}
                        iconClassName="community_like_icon"
                        countClassName="community_action_count"
                        aria-label="좋아요"
                      >
                        {post.likes + (likedPostIds.includes(post.id) ? 1 : 0)}
                      </LikeButton>
                      <button type="button" aria-label="댓글" onClick={(event) => event.stopPropagation()}>
                        <span className="community_comment_icon" aria-hidden="true">
                          <svg viewBox="0 0 24 24">
                            <path d="M12 4.8c-4.4 0-8 2.9-8 6.6 0 2.1 1.2 4 3.1 5.2l-.8 3 3.3-1.8c.8.2 1.6.3 2.4.3 4.4 0 8-2.9 8-6.7s-3.6-6.6-8-6.6Z" />
                            <circle cx="9" cy="11.4" r="0.8" />
                            <circle cx="12" cy="11.4" r="0.8" />
                            <circle cx="15" cy="11.4" r="0.8" />
                          </svg>
                        </span>
                        <span className="community_action_count">{post.comments}</span>
                      </button>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <div className="community_empty_state">게시글이 없어요.</div>
            )}
          </section>
        )}

        {!isKnowledge && <FloatingWriteButton showMenu />}
      </main>
      {deleteTargetPostId !== null ? (
        <ConfirmDialog
          message="삭제하시겠습니까?"
          onCancel={() => setDeleteTargetPostId(null)}
          onConfirm={confirmDeleteCreatedPost}
          cancelLabel="아니요"
          confirmLabel="네"
        />
      ) : null}
    </>
  )
}

export default CommunityPetStory
