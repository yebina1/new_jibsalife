import './CommunityKnowledgeDetail.css'
import { createPortal } from 'react-dom'
import { type ReactNode, type TouchEvent, useEffect, useRef, useState } from 'react'
import { markKnowledgeLiked } from '../../utils/challengeStatus'
import { Outlet, useLocation, useNavigate, useParams } from 'react-router'
import PageHeader from '../../components/PageHeader'
import Title from '../../components/Title'
import CommentInputForm from '../../components/html/CommentInputForm'
import Button from '../../components/html/Button'
import LikeButton from '../../components/LikeButton'
import knowledge1 from '../../img/petstory/Knowledge/knowledge1.png'
import knowledge2 from '../../img/petstory/Knowledge/knowledge2.png'
import knowledge3 from '../../img/petstory/Knowledge/knowledge3.png'
import knowledge4 from '../../img/petstory/Knowledge/knowledge4.png'
import dogWalk1 from '../../img/petstory/Knowledge/dog_Walk_1_increased_stress.png'
import dogWalk2 from '../../img/petstory/Knowledge/dog_Walk_2_obesity.png'
import dogWalk3 from '../../img/petstory/Knowledge/dog_Walk_3_a_lack_of_social_skills.png'
import catJumpSecret1 from '../../img/petstory/Knowledge/cat_jump_secret_1.png'
import catJumpSecret2 from '../../img/petstory/Knowledge/cat_jump_secret_2.png'
import catJumpSecret3 from '../../img/petstory/Knowledge/cat_jump_secret_3.png'
import forbiddenFoods1 from '../../img/petstory/Knowledge/forbidden_foods_1.png'
import forbiddenFoods2 from '../../img/petstory/Knowledge/forbidden_foods_2.png'
import forbiddenFoods3 from '../../img/petstory/Knowledge/forbidden_foods_3.png'
import forbiddenFoods4 from '../../img/petstory/Knowledge/forbidden_foods_4.png'
import forbiddenFoods5 from '../../img/petstory/Knowledge/forbidden_foods_5.png'
import springAllergy1 from '../../img/petstory/Knowledge/spring_allergy_1.png'
import springAllergy2 from '../../img/petstory/Knowledge/spring_allergy_2.png'
import springAllergy3 from '../../img/petstory/Knowledge/spring_allergy_3.png'
import springAllergy4 from '../../img/petstory/Knowledge/spring_allergy_4.png'
import profileImage from '../../img/pink_dog_profile.jpg'
import addIcon from '../../svg/add_icon.svg'
import emojiIcon from '../../svg/emoji.svg'
import commentIcon from '../../svg/nav_communicate.svg'
import { useActionRowSlot } from '../../contexts/ActionRowContext'
import { MY_PROFILE_NAME } from '../../utils/myProfile'
import { petStoryDetailComments } from './CommunityPetStoryDetailData'
import { knowledgeFeedItems } from './CommunityPetStory'

type KnowledgeDetailState = {
  item?: {
    id?: number
    title: string
    image: string
    viewsText?: string
    likes?: number
    comments?: number
    createdAt?: string
  }
  previousPage?: string
  returnTo?: string
  restoreScrollY?: number
}

type KnowledgeComment = (typeof petStoryDetailComments)[number] & {
  time?: string
  parentId?: number
}

type DetailItem = {
  id: number
  title: string
  description: ReactNode
  image: string
}

const defaultKnowledgeId = 'walkproblems'
const DETAIL_SWIPE_THRESHOLD = 72

const knowledgeDetailFallbackItems: Record<string, NonNullable<KnowledgeDetailState['item']>> = {
  walkproblems: {
    id: 1,
    title: '강아지 산책 안 하면 생기는 문제점',
    image: knowledge1,
    viewsText: '1201',
    likes: 8,
    comments: 3,
    createdAt: '2026-05-02T09:00:00',
  },
  catjumpsecret: {
    id: 2,
    title: '고양이 점프의 숨겨진 비밀',
    image: knowledge2,
    viewsText: '968',
    likes: 8,
    comments: 3,
    createdAt: '2026-05-01T10:00:00',
  },
  forbiddenfoods: {
    id: 3,
    title: '고양이에게 절대 주면 안 되는 음식 7가지',
    image: knowledge3,
    viewsText: '860',
    likes: 8,
    comments: 3,
    createdAt: '2026-04-30T11:00:00',
  },
  springallergy: {
    id: 4,
    title: '봄철 강아지 알레르기 증상과 관리법',
    image: knowledge4,
    viewsText: '482',
    likes: 8,
    comments: 3,
    createdAt: '2026-04-29T12:00:00',
  },
}

function getKnowledgeCommentsPagePath(knowledgeId: string) {
  return `/community/petstory/knowledge/${knowledgeId}/comments`
}

function getKnowledgeCommentsStorageKey(knowledgeId: string) {
  return `jibsalife.community.knowledge.${knowledgeId}.comments`
}

function readKnowledgeComments(storageKey: string): KnowledgeComment[] {
  const fallback = petStoryDetailComments.slice(0, 3)

  if (typeof window === 'undefined') return fallback

  try {
    const saved = window.localStorage.getItem(storageKey)
    const parsed = saved ? JSON.parse(saved) : fallback
    return Array.isArray(parsed) ? parsed : fallback
  } catch {
    return fallback
  }
}

const detailItems: DetailItem[] = [
  {
    id: 1,
    title: '스트레스 증가',
    description:
      '산책은 강아지의 에너지를 해소하고 외부 자극을 통해 심리적 안정감을 주는 중요한 활동이에요. 산책이 부족하면 에너지가 쌓이면서 짖음, 물건 파손, 과도한 흥분 같은 문제 행동으로 이어질 수 있어요.',
    image: dogWalk1,
  },
  {
    id: 2,
    title: '비만 및 건강 문제',
    description:
      '운동량이 부족한 강아지는 체중이 쉽게 증가하고 비만으로 이어질 가능성이 높아요. 비만은 관절 질환, 심장 질환 등 다양한 건강 문제의 원인이 될 수 있어요.',
    image: dogWalk2,
  },
  {
    id: 3,
    title: '사회성 부족',
    description:
      '운동량이 부족한 강아지는 체중이 쉽게 증가하고 비만으로 이어질 가능성이 높아요. 비만은 관절 질환, 심장 질환 등 다양한 건강 문제의 원인이 될 수 있어요.',
    image: dogWalk3,
  },
]

const catJumpSecretItems: DetailItem[] = [
  {
    id: 1,
    title: '강한 뒷다리 근육',
    description: (
      <>
        고양이는 뒷다리 근육이 매우 발달해 있어
        <br />
        순간적으로 강한 힘을 낼 수 있어요.
        <br />
        이 힘 덕분에 자신의 키보다
        <br />
        몇 배 높은 곳까지 점프할 수 있어요.
      </>
    ),
    image: catJumpSecret1,
  },
  {
    id: 2,
    title: '유연한 척추 구조',
    description: (
      <>
        고양이의 척추는 매우 유연해서
        <br />
        점프할 때 몸을 길게 늘리거나
        <br />
        빠르게 접을 수 있어요. 이 유연성이 점프 높이와
        <br />
        거리 모두에 큰 영향을 줘요.
      </>
    ),
    image: catJumpSecret2,
  },
  {
    id: 3,
    title: '균형 감각과 착지 능력',
    description: (
      <>
        고양이는 뛰어난 균형 감각을 가지고 있어
        <br />
        공중에서도 자세를 빠르게 조절할 수 있어요.
        <br />
        그래서 높은 곳에서 떨어져도
        <br />
        발부터 안전하게 착지할 수 있는 거예요.
      </>
    ),
    image: catJumpSecret3,
  },
]

const cforbiddenFoodsItems: DetailItem[] = [
  {
    id: 1,
    title: '초콜릿',
    description: (
      <>
        초콜릿에 들어있는 테오브로민 성분은
        <br />
        고양이에게 중독을 일으킬 수 있어요.
        <br />
        소량만 섭취해도 구토, 경련 등의
        <br />
        증상이 나타날 수 있어요.
      </>
    ),
    image: forbiddenFoods1,
  },
  {
    id: 2,
    title: '양파 & 마늘',
    description: (
      <>
        양파와 마늘은 적혈구를 파괴해
        <br />
        빈혈을 유발할 수 있어요.
        <br />
        익힌 음식에도 포함될 수 있어
        <br />
        특히 주의가 필요해요.
      </>
    ),
    image: forbiddenFoods2,
  },
  {
    id: 3,
    title: '포도 & 건포도',
    description: (
      <>
        포도는 원인은 정확히 밝혀지지 않았지만
        <br />
        신장 기능에 심각한 영향을 줄 수 있어요.
        <br />
        소량 섭취도 위험할 수 있어요.
      </>
    ),
    image: forbiddenFoods3,
  },
  {
    id: 4,
    title: '알코올',
    description: (
      <>
        아주 소량이라도 신경계와 호흡에
        <br />
        치명적인 영향을 줄 수 있어요.
        <br />
        절대 먹지 않도록 주의해야 해요.
      </>
    ),
    image: forbiddenFoods4,
  },
  {
    id: 5,
    title: '날생선 (과다 섭취)',
    description: (
      <>
        날생선을 자주 먹으면
        <br />
        비타민 B1 결핍을 일으킬 수 있어요.
        <br />
        장기적으로 건강 문제로 이어질 수 있어요.
      </>
    ),
    image: forbiddenFoods5,
  },
]

const springAllergyItems: DetailItem[] = [
  {
    id: 1,
    title: '가려움증',
    description: (
      <>
        강아지가 몸을 자주 긁거나 핥는다면
        <br />
        알레르기 신호일 수 있어요.
        <br />
        특히 발, 귀, 배 부분을 집중적으로 긁는
        <br />
        경우가 많아요.
      </>
    ),
    image: springAllergy1,
  },
  {
    id: 2,
    title: '피부 발진',
    description: (
      <>
        피부가 붉어지거나 작은 트러블이 생기는 경우
        <br />
        알레르기를 의심해볼 수 있어요.
        <br />
        심해지면 염증으로 이어질 수 있어
        <br />
        빠른 관리가 중요해요.
      </>
    ),
    image: springAllergy2,
  },
  {
    id: 3,
    title: '귀 염증',
    description: (
      <>
        귀를 자주 긁거나 냄새가 난다면
        <br />
        알레르기로 인한 염증일 수 있어요.
        <br />
        방치하면 상태가 더 악화될 수 있어요.
      </>
    ),
    image: springAllergy3,
  },
  {
    id: 4,
    title: '관리 방법',
    description: (
      <>
        외출 후에는 발과 털을 깨끗하게 닦아주고
        <br />
        실내 청결을 유지하는 것이 중요해요.
        <br />
        증상이 지속되면 의사 상담을 받는 것이 좋아요.
      </>
    ),
    image: springAllergy4,
  },
]

function BookmarkIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M7 4.5h10a1.5 1.5 0 0 1 1.5 1.5v13.2l-6.5-3.6-6.5 3.6V6A1.5 1.5 0 0 1 7 4.5Z" />
    </svg>
  )
}

function BackIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="m15 5-7 7 7 7" />
    </svg>
  )
}

function HeartIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 20.2 4.9 13.6a4.8 4.8 0 0 1 6.8-6.8L12 7.9l.3-.3a4.8 4.8 0 1 1 6.8 6.8Z" />
    </svg>
  )
}

function CommentIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 4.8c-4.4 0-8 2.9-8 6.6 0 2.1 1.2 4 3.1 5.2l-.8 3 3.3-1.8c.8.2 1.6.3 2.4.3 4.4 0 8-2.9 8-6.7s-3.6-6.6-8-6.6Z" />
    </svg>
  )
}

function MoreIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="5" r="1.8" />
      <circle cx="12" cy="12" r="1.8" />
      <circle cx="12" cy="19" r="1.8" />
    </svg>
  )
}

function AvatarIcon() {
  return (
    <span className="cpsdetail_avatar_box" aria-hidden="true">
      <img src={profileImage} alt="프로필 이미지" />
    </span>
  )
}

function CommentText({ text }: { text: string }) {
  const parts = text.split(/(@\S+)/g)

  return (
    <>
      {parts.map((part, index) =>
        part.startsWith('@') ? (
          <span key={`${part}-${index}`} className="cpsdetail_mention">
            {part}
          </span>
        ) : (
          part
        ),
      )}
    </>
  )
}

function getRelativeTimeText(createdAt: string) {
  const createdTime = new Date(createdAt).getTime()
  const diffSeconds = Math.max(0, Math.floor((Date.now() - createdTime) / 1000))
  const diffMinutes = Math.floor(diffSeconds / 60)
  const diffHours = Math.floor(diffMinutes / 60)
  const diffDays = Math.floor(diffHours / 24)
  const diffMonths = Math.floor(diffDays / 30)
  const diffYears = Math.floor(diffMonths / 12)

  if (diffSeconds < 60) return '방금 전'
  if (diffMinutes < 60) return `${diffMinutes}분 전`
  if (diffHours < 24) return `${diffHours}시간 전`
  if (diffDays < 31) return `${diffDays}일 전`
  if (diffMonths < 12) return `${Math.max(1, diffMonths)}개월 전`
  return `${Math.max(1, diffYears)}년 전`
}

function parseInitialViews(viewsText?: string): number {
  if (!viewsText) return 1240
  if (viewsText.toLowerCase().endsWith('k')) {
    const n = Number(viewsText.slice(0, -1))
    if (!Number.isNaN(n)) return Math.round(n * 1000)
  }
  const n = parseInt(viewsText.replace(/,/g, ''), 10)
  return Number.isNaN(n) ? 1240 : n
}

function getViewsStorageKey(id: string) {
  return `jibsalife.community.knowledge.${id}.views`
}

function readStoredViewCount(knowledgeId: string, fallback: number): number {
  try {
    const stored = window.localStorage.getItem(getViewsStorageKey(knowledgeId))
    if (stored !== null) {
      const parsed = parseInt(stored, 10)
      if (Number.isFinite(parsed)) return parsed
    }
  } catch { /* noop */ }
  return fallback
}

function CommunityKnowledgeDetail() {
  const navigate = useNavigate()
  const actionRowSlot = useActionRowSlot()
  const location = useLocation()
  const { knowledgeId = defaultKnowledgeId } = useParams()
  const knowledgeCommentsPagePath = getKnowledgeCommentsPagePath(knowledgeId)
  const knowledgeCommentsStorageKey = getKnowledgeCommentsStorageKey(knowledgeId)
  const [isCommentFormVisible, setIsCommentFormVisible] = useState(true)
  const [visibleComments, setVisibleComments] = useState<KnowledgeComment[]>(() =>
    readKnowledgeComments(knowledgeCommentsStorageKey),
  )
  const lastScrollTopRef = useRef(0)
  const detailState = (location.state as KnowledgeDetailState | null) ?? null
  const touchStartRef = useRef<{ x: number; y: number } | null>(null)
  const stateItem = detailState?.item
  const item = stateItem ?? knowledgeDetailFallbackItems[knowledgeId] ?? knowledgeDetailFallbackItems[defaultKnowledgeId]
  const activeKnowledgeIndex = knowledgeFeedItems.findIndex((feedItem) => feedItem.path.endsWith(`/${knowledgeId}`))
  const knowledgeLikeKey = String(item?.id ?? knowledgeId)
  const [likedKnowledgeKeys, setLikedKnowledgeKeys] = useState<string[]>([])
  const detailTitle = item?.title ?? '강아지 산책 안 하면 생기는 문제점'
  const detailTitleLines =
    detailTitle === '강아지 산책 안 하면 생기는 문제점'
      ? ['강아지 산책', '안 하면 생기는 문제점']
      : [detailTitle]
  const isCatJumpSecret = knowledgeId === 'catjumpsecret'
  const isCforbiddenFoods = knowledgeId === 'forbiddenfoods'
  const isSpringAllergy = knowledgeId === 'springallergy'
  const activeDetailItems = isCatJumpSecret
    ? catJumpSecretItems
    : isCforbiddenFoods
      ? cforbiddenFoodsItems
      : isSpringAllergy
        ? springAllergyItems
        : detailItems
  const postedTimeText = getRelativeTimeText(item?.createdAt ?? '2026-05-02T09:00:00')
  const [viewCount, setViewCount] = useState<number>(() =>
    readStoredViewCount(knowledgeId, parseInitialViews(item?.viewsText))
  )
  const commentCount = visibleComments.length
  const isKnowledgeLiked = likedKnowledgeKeys.includes(knowledgeLikeKey)
  const knowledgeLikeCount = (item?.likes ?? 128) + (isKnowledgeLiked ? 1 : 0)

  const navigateKnowledgeByOffset = (offset: -1 | 1) => {
    if (activeKnowledgeIndex < 0) return

    const nextIndex = activeKnowledgeIndex + offset
    if (nextIndex < 0 || nextIndex >= knowledgeFeedItems.length) return

    const nextItem = knowledgeFeedItems[nextIndex]
    navigate(nextItem.path, {
      replace: true,
      state: {
        ...detailState,
        item: {
          id: nextItem.id,
          title: nextItem.title,
          image: nextItem.image,
          viewsText: nextItem.viewsText,
          likes: nextItem.likes,
          comments: nextItem.comments,
          createdAt: nextItem.createdAt,
        },
      },
    })
  }

  const handleDetailTouchStart = (event: TouchEvent<HTMLElement>) => {
    const touch = event.touches[0]
    if (!touch) return
    touchStartRef.current = { x: touch.clientX, y: touch.clientY }
  }

  const handleDetailTouchEnd = (event: TouchEvent<HTMLElement>) => {
    const touch = event.changedTouches[0]
    const start = touchStartRef.current
    touchStartRef.current = null

    if (!touch || !start) return

    const diffX = touch.clientX - start.x
    const diffY = touch.clientY - start.y

    if (Math.abs(diffX) < DETAIL_SWIPE_THRESHOLD || Math.abs(diffX) <= Math.abs(diffY) * 1.2) {
      return
    }

    navigateKnowledgeByOffset(diffX < 0 ? 1 : -1)
  }

  const toggleKnowledgeLike = () => {
    if (!isKnowledgeLiked) {
      markKnowledgeLiked()
    }

    setLikedKnowledgeKeys((current) =>
      current.includes(knowledgeLikeKey)
        ? current.filter((key) => key !== knowledgeLikeKey)
        : [...current, knowledgeLikeKey],
    )
  }

  const openCommentsPage = () => {
    navigate(knowledgeCommentsPagePath, {
      state: {
        initialComments: visibleComments,
        storageKey: knowledgeCommentsStorageKey,
      },
    })
  }

  const scrollToCommentBottom = () => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const scrollContainer = document.querySelector('.layout_content') as HTMLElement | null

        if (!scrollContainer) {
          window.scrollTo(0, document.documentElement.scrollHeight)
          lastScrollTopRef.current = window.scrollY
          return
        }

        scrollContainer.scrollTop = scrollContainer.scrollHeight
        lastScrollTopRef.current = scrollContainer.scrollTop
      })
    })
  }

  const addComment = (text: string) => {
    setVisibleComments((current) => {
      const nextComments = [
        ...current,
        {
          id: Date.now(),
          author: MY_PROFILE_NAME,
          text,
          time: '방금 전',
          likes: 0,
          replies: 0,
        },
      ]

      window.localStorage.setItem(knowledgeCommentsStorageKey, JSON.stringify(nextComments))
      return nextComments
    })
    scrollToCommentBottom()
  }

  useEffect(() => {
    setViewCount((prev) => {
      const next = prev + 1
      window.localStorage.setItem(getViewsStorageKey(knowledgeId), String(next))
      return next
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    setVisibleComments(readKnowledgeComments(knowledgeCommentsStorageKey))
  }, [knowledgeCommentsStorageKey])

  useEffect(() => {
    const scrollContainer = document.querySelector('.layout_content') as HTMLElement | null

    lastScrollTopRef.current = scrollContainer ? scrollContainer.scrollTop : window.scrollY

    const handleScroll = () => {
      const currentScrollTop = scrollContainer ? scrollContainer.scrollTop : window.scrollY
      const scrollDelta = currentScrollTop - lastScrollTopRef.current

      if (Math.abs(scrollDelta) < 8) {
        return
      }

      setIsCommentFormVisible(currentScrollTop <= 8 || scrollDelta < 0)
      lastScrollTopRef.current = currentScrollTop
    }

    const scrollTarget: HTMLElement | Window = scrollContainer ?? window
    scrollTarget.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      scrollTarget.removeEventListener('scroll', handleScroll)
    }
  }, [])

  return (
    <>
      <main
        className={`page community_knowledge_detail_page ${
          isCommentFormVisible ? 'is_comment_form_visible' : 'is_comment_form_hidden'
        }`}
        onTouchStart={handleDetailTouchStart}
        onTouchEnd={handleDetailTouchEnd}
      >
        <PageHeader
          title=""
          leftContent={
            <button
              type="button"
              className="community_knowledge_detail_header_btn"
              aria-label="이전"
              onClick={() => navigate(-1)}
            >
              <BackIcon />
            </button>
          }
          rightContent={
            <button
              type="button"
              className="community_knowledge_detail_header_btn"
              aria-label="북마크"
            >
              <BookmarkIcon />
            </button>
          }
        />
        <section className="community_knowledge_detail_hero_wrap">
          <img
            className="community_knowledge_detail_hero"
            src={item?.image ?? knowledge1}
            alt={detailTitle}
          />
        </section>

      <section className="community_knowledge_detail_content">
        <Title
          as="h1"
          className="community_knowledge_detail_title"
          title={
            <>
              {detailTitleLines.map((line, index) => (
                <span key={line}>
                  {index > 0 ? <br /> : null}
                  {line}
                </span>
              ))}
            </>
          }
        >
          <div className="community_knowledge_detail_meta">
            <span>{postedTimeText}</span>
            <span>조회수 {viewCount.toLocaleString('ko-KR')}</span>
          </div>
        </Title>

        {isCatJumpSecret ? (
          <p className="community_knowledge_detail_intro">
            고양이가 높이 점프하는 모습,
            <br />
            한 번쯤 신기하게 본 적 있지 않나요?
            <br />
            사실 고양이는 몸 구조 자체가 점프에 최적화되어 있어요.
          </p>
        ) : isCforbiddenFoods ? (
          <p className="community_knowledge_detail_intro">
            사람이 먹는 음식 중에는
            <br />
            고양이에게 위험한 것들이 생각보다 많아요.
            <br />
            건강을 위해 꼭 피해야 할 음식들을 간단히 정리해봤어요.
          </p>
        ) : isSpringAllergy ? (
          <p className="community_knowledge_detail_intro">
            따뜻한 봄이 되면 꽃가루, 먼지 등으로 인해
            <br />
            강아지에게 알레르기 증상이 나타날 수 있어요.
            <br />
            미리 증상을 알고 관리해주면 불편함을 크게 줄일 수 있어요.
          </p>
        ) : (
          <p className="community_knowledge_detail_intro">
            산책은 강아지의 신체 건강뿐만 아니라
            <br />
            정서 건강에도 매우 중요한 영향을 줍니다.
            <br />
            산책이 부족하면 다양한 문제가 생길 수 있어요.
          </p>
        )}

        <div className="community_knowledge_detail_cards">
          {activeDetailItems.map((item) => (
            <article key={item.id} className="community_knowledge_detail_card">
              <div className="community_knowledge_detail_card_icon" aria-hidden="true">
                <img src={item.image} alt={`${item.title} 일러스트`} />
              </div>
              <Title
                as="h5"
                className="community_knowledge_detail_card_copy"
                title={
                  <>
                    <span className="community_knowledge_detail_card_badge">{item.id}</span>
                    {item.title}
                  </>
                }
              >
                <p>{item.description}</p>
              </Title>
            </article>
          ))}
        </div>

        <section className="cpsdetail_comments" aria-label="댓글">
          <Title as="h5" className="cpsdetail_comments_title" title={`댓글 ${commentCount}`} />
          {visibleComments.slice(0, 8).map((comment) => (
            <article key={comment.id} className="cpsdetail_comment">
              <AvatarIcon />
              <div className="cpsdetail_comment_body">
                <div className="cpsdetail_comment_head">
                  <Title as="h5" title={comment.author}>
                    <p>{comment.time ?? '11시간 전'}</p>
                  </Title>
                  <button type="button" className="cpsdetail_more" aria-label="댓글 더보기">
                    <MoreIcon />
                  </button>
                </div>
                <p>
                  <CommentText text={comment.text} />
                </p>
                <div className="cpsdetail_comment_actions">
                  <button type="button">
                    <HeartIcon />
                    <span>좋아요 {comment.likes || ''}</span>
                  </button>
                  <button type="button" onClick={() => setIsCommentFormVisible(true)}>
                    <img src={commentIcon} alt="" aria-hidden="true" />
                    <span>답글쓰기</span>
                  </button>
                </div>
              </div>
            </article>
          ))}
          {commentCount > 8 ? (
            <Button
              type="button"
              className="s_white_radius_btn cpsdetail_comments_more_btn"
              onClick={openCommentsPage}
            >
              댓글 더보기
            </Button>
          ) : null}
        </section>
      </section>

      </main>

      {actionRowSlot && createPortal(
        <div className="community_knowledge_detail_footer" aria-label="댓글 작성 및 반응">
          <CommentInputForm
            className={`cpsdetail_comment_form ${isCommentFormVisible ? 'is_visible' : 'is_hidden'}`}
            iconButtonClassName="cpsdetail_form_icon"
            inputWrapClassName="cpsdetail_comment_input"
            placeholder="메시지를 입력해 주세요."
            addIcon={addIcon}
            emojiIcon={emojiIcon}
            onSubmit={addComment}
          />
          <div className="community_knowledge_detail_actions">
            <div className="community_knowledge_detail_reactions">
              <LikeButton
                type="button"
                liked={isKnowledgeLiked}
                className="community_knowledge_detail_like"
                iconClassName="community_knowledge_detail_like_icon"
                countClassName="community_knowledge_detail_like_count"
                aria-label="좋아요"
                onClick={toggleKnowledgeLike}
              >
                {knowledgeLikeCount}
              </LikeButton>
              <button type="button" aria-label="댓글" onClick={openCommentsPage}>
                <CommentIcon />
                {commentCount}
              </button>
            </div>
            <button
              type="button"
              className="community_knowledge_detail_cta"
              onClick={() => navigate('/community/petstory')}
            >
              관련 제품 보기
            </button>
          </div>
        </div>,
        actionRowSlot
      )}
      <Outlet />
    </>
  )
}

export default CommunityKnowledgeDetail
