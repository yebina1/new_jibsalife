import './CommunityPetStoryDetails.css'
import { createPortal } from 'react-dom'
import { type TouchEvent, useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router'
import PageHeader from '../../components/PageHeader'
import HeaderIcon from '../../components/HeaderIcon'
import Title from '../../components/Title'
import BackButton from '../../components/html/BackButton'
import ConfirmDialog from '../../components/ConfirmDialog'
import PostMoreSheet from '../../components/PostMoreSheet'
import Button from '../../components/html/Button'
import CommentInputForm from '../../components/html/CommentInputForm'
import LikeButton from '../../components/LikeButton'
import life1 from '../../img/petstory/daily/daily_1.jpg'
import life2 from '../../img/petstory/daily/daily_2.png'
import life3 from '../../img/petstory/daily/daily_3.png'
import life4 from '../../img/petstory/daily/daily_4.png'
import life5 from '../../img/petstory/daily/daily_5.jpg'
import life6 from '../../img/petstory/daily/daily_6.jpg'
import addIcon from '../../svg/add_icon.svg'
import emojiIcon from '../../svg/emoji.svg'
import commentIcon from '../../svg/nav_communicate.svg'
import { MY_PROFILE_IMAGE, MY_PROFILE_NAME, readMyProfileName } from '../../utils/myProfile'
import { readCommunityCreatedPosts, writeCommunityCreatedPosts } from '../../utils/communityCreatedPosts'
import { useActionRowSlot } from '../../contexts/ActionRowContext'
import { petStoryDetailComments } from './CommunityPetStoryDetailData'
import { dailyPosts } from './CommunityPetStory'
const likedPostsStorageKey = 'jibsalife.community.likedPostIds'
const likedCommentIdsStorageKey = 'jibsalife.community.likedCommentIds'
const DETAIL_SWIPE_THRESHOLD = 72

function readViewCount(postId: number, initialViews = 0): number {
  try {
    const saved = window.localStorage.getItem(`jibsalife.community.views.${postId}`)
    return saved ? Math.max(0, parseInt(saved, 10)) : initialViews
  } catch {
    return initialViews
  }
}
type DetailPost = {
  id: number
  tag: string
  title: string
  content?: string
  author: string
  time?: string
  date?: string
  image: string | null
  images?: string[]
  tags?: string[]
  likes: number
  comments: number
  shares?: number
  views?: number
  createdAt?: string
  place?: {
    name: string
    address: string
  }
}

type DetailComment = (typeof petStoryDetailComments)[number] & {
  time?: string
  createdAt?: string
  parentId?: number
}

const fallbackPosts: DetailPost[] = [
  {
    id: 1,
    tag: '일상',
    title: '강아지 산책하러 나가면 자는척 해요',
    content: '산책 가자고 하면 신나하다가 막상 나가려면 졸린 척을 해요. 그래도 현관문 열리면 제일 먼저 뛰어나갑니다.',
    author: '탬블러',
    createdAt: '2026-05-11T09:00:00',
    image: null,
    likes: 20,
    comments: 0,
    views: 1340,
  },
  {
    id: 2,
    tag: '일상',
    title: '강아지 산책하러 나가면 자는척 해요',
    content: '오늘도 산책 전에는 세상 귀찮은 표정이었는데, 공원 도착하자마자 꼬리가 멈추질 않았어요.',
    author: '탬블러',
    createdAt: '2026-05-10T14:00:00',
    image: life1,
    images: [life1, life5],
    likes: 20,
    comments: 4,
    views: 980,
  },
  {
    id: 3,
    tag: '일상',
    title: '냉전중',
    content: '간식을 늦게 줬더니 하루 종일 눈도 안 마주쳐요. 그래도 이름 부르면 귀는 살짝 움직입니다.',
    author: '장마',
    createdAt: '2026-05-09T10:00:00',
    image: life2,
    images: [life2, life6],
    likes: 20,
    comments: 4,
    views: 762,
  },
  {
    id: 4,
    tag: '일상',
    title: '강아지 발사탕 스프레이 추천해주세요!',
    content: '요즘 발을 자주 핥아서 순한 스프레이를 찾고 있어요. 써보고 괜찮았던 제품 있으면 추천 부탁드려요.',
    author: '파란꽃',
    createdAt: '2026-05-06T16:00:00',
    image: life3,
    images: [life3, life1],
    likes: 16,
    comments: 4,
    views: 524,
  },
  {
    id: 5,
    tag: '일상',
    title: '뽀미랑 부산 여행기',
    content: '연휴에 맞춰 급으로 가게 되었는데 뽀미랑 좋은 추억을 만들 수 있어서 너무 좋았어요. 숙소는 애견 동반 풀빌라였는데 추천합니다!',
    author: '뽀직뽀직',
    createdAt: '2026-05-04T09:00:00',
    image: life4,
    images: [life4, life5],
    likes: 7,
    comments: 4,
    views: 318,
    place: {
      name: '우다다 애견풀빌라',
      address: '부산광역시 금정구',
    },
  },
  {
    id: 6,
    tag: '일상',
    title: '말숙이랑 벚꽃',
    content: '벚꽃 아래에서 사진을 찍었는데 바람이 많이 불어서 귀가 계속 팔랑거렸어요.',
    author: '말망',
    createdAt: '2026-04-27T12:00:00',
    image: life5,
    images: [life5, life4],
    likes: 4,
    comments: 4,
    views: 215,
  },
  {
    id: 7,
    tag: '일상',
    title: '귀여우면 다야?',
    content: '사고는 크게 쳤지만 얼굴 보자마자 혼낼 마음이 사라졌어요. 귀여움은 정말 반칙입니다.',
    author: '크림빵',
    createdAt: '2026-04-11T18:00:00',
    image: life6,
    images: [life6, life3],
    likes: 4,
    comments: 4,
    views: 143,
  },
]

function readCreatedPosts() {
  const profileName = readMyProfileName()

  return readCommunityCreatedPosts().map((post) => ({
    ...post,
    author: post.author === '나' || !post.author ? profileName : post.author,
    date: post.date ?? '',
    likes: post.likes ?? 0,
    comments: post.comments ?? 0,
    shares: post.shares ?? 0,
  }))
}

function readLikedPostIds() {
  if (typeof window === 'undefined') return []

  try {
    const saved = window.localStorage.getItem(likedPostsStorageKey)
    const parsed = saved ? JSON.parse(saved) : []
    return Array.isArray(parsed) ? parsed.filter((id): id is number => typeof id === 'number') : []
  } catch {
    return []
  }
}

function readLikedCommentIds() {
  if (typeof window === 'undefined') return []

  try {
    const saved = window.localStorage.getItem(likedCommentIdsStorageKey)
    const parsed = saved ? JSON.parse(saved) : []
    return Array.isArray(parsed) ? parsed.filter((id): id is number => typeof id === 'number') : []
  } catch {
    return []
  }
}

function readComments(postId: number, fallback: DetailComment[]): DetailComment[] {
  if (typeof window === 'undefined') return fallback

  try {
    const saved = window.localStorage.getItem(`jibsalife.community.comments.${postId}`)
    return saved ? JSON.parse(saved) : fallback
  } catch {
    return fallback
  }
}

function findFallbackPost(postId: string | undefined) {
  const numericId = Number(postId)
  if (!Number.isFinite(numericId)) return fallbackPosts[4]

  return (
    readCreatedPosts().find((post) => post.id === numericId) ??
    fallbackPosts.find((post) => post.id === numericId) ??
    fallbackPosts[4]
  )
}

function formatRelativeTime(createdAt: string): string {
  const diff = Date.now() - new Date(createdAt).getTime()
  const minutes = Math.floor(diff / 60_000)
  if (minutes < 1) return '방금 전'
  if (minutes < 60) return `${minutes}분 전`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}시간 전`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}일 전`
  const weeks = Math.floor(days / 7)
  if (weeks < 5) return `${weeks}주 전`
  const months = Math.floor(days / 30)
  if (months < 12) return `${months}개월 전`
  return `${Math.floor(days / 365)}년 전`
}

function BookmarkIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M7 4.5h10a1.5 1.5 0 0 1 1.5 1.5v13.2l-6.5-3.6-6.5 3.6V6A1.5 1.5 0 0 1 7 4.5Z" />
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



function CommentText({ text }: { text: string }) {
  const parts = text.split(/(@\S+)/g)
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith('@') ? (
          <span key={i} className="cpsdetail_mention">{part}</span>
        ) : (
          part
        )
      )}
    </>
  )
}

function AvatarIcon() {
  return (
    <span className="cpsdetail_avatar_box" aria-hidden="true">
      <img src={MY_PROFILE_IMAGE} alt={`${MY_PROFILE_NAME} 프로필 이미지`} />
    </span>
  )
}

function CommunityPetStoryDetails() {
  const navigate = useNavigate()
  const { postId } = useParams()
  const location = useLocation()
  const actionRowSlot = useActionRowSlot()
  const detailState = (location.state as { post?: DetailPost; previousPage?: string; returnTo?: string; restoreScrollY?: number } | null) ?? null
  const statePost = detailState?.post
  const fallbackPost = findFallbackPost(postId)
  const post: DetailPost = statePost
    ? { ...statePost, place: statePost.place ?? fallbackPost.place }
    : fallbackPost
  const backDestination = detailState?.returnTo ?? (detailState?.previousPage === 'home' ? '/home' : '/community/petstory')
  const backState =
    detailState?.previousPage === 'home' && typeof detailState?.restoreScrollY === 'number'
      ? { restoreScrollY: detailState.restoreScrollY }
      : undefined
  const timeText = post.createdAt ? formatRelativeTime(post.createdAt) : (post.time ?? post.date ?? '방금 전')
  const fallbackSideImage = post.image === life5 ? life4 : life5
  const galleryImages = post.images?.length
    ? post.images
    : post.image
      ? post.createdAt
        ? [post.image]
        : [post.image, fallbackSideImage]
      : []
  const [activeGalleryIndex, setActiveGalleryIndex] = useState(0)
  const [visibleComments, setVisibleComments] = useState<DetailComment[]>(() =>
    readComments(post.id, petStoryDetailComments.slice(0, post.comments))
  )
  const [likedPostIds, setLikedPostIds] = useState<number[]>(readLikedPostIds)
  const [likedCommentIds, setLikedCommentIds] = useState<number[]>(readLikedCommentIds)
  const [replyTo, setReplyTo] = useState<{ author: string; commentId: number } | null>(null)
  const [moreSheetOpen, setMoreSheetOpen] = useState<'own' | 'other' | false>(false)
  const [moreTarget, setMoreTarget] = useState<'post' | { commentId: number } | null>(null)
  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false)
  const [viewCount, setViewCount] = useState(() => readViewCount(post.id, post.views ?? 0))
  const [editAlertOpen, setEditAlertOpen] = useState(false)
  const [pendingEditText, setPendingEditText] = useState('')
  const [editCommentId, setEditCommentId] = useState<number | null>(null)
  const [editMentionAuthor, setEditMentionAuthor] = useState<string | null>(null)
  const [editCommentInitialText, setEditCommentInitialText] = useState<string | undefined>(undefined)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [isPhotoSheetOpen, setIsPhotoSheetOpen] = useState(false)
  const galleryRef = useRef<HTMLDivElement>(null)
  const footerRef = useRef<HTMLDivElement>(null)
  const pageRef = useRef<HTMLElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const viewIncrementedForRef = useRef<number | null>(null)
  const lastScrollTopRef = useRef(0)
  const touchStartRef = useRef<{ x: number; y: number } | null>(null)
  const currentProfileName = readMyProfileName()
  const content = post.content?.trim() || fallbackPost.content || '함께 나누고 싶은 반려 생활 이야기를 남겼어요.'
  const isLiked = likedPostIds.includes(post.id)
  const activeDailyIndex = dailyPosts.findIndex((dailyPost) => dailyPost.id === post.id)
  const likeCount = (post.likes ?? 0) + (isLiked ? 1 : 0)
  const topLevelCommentCount = visibleComments.filter((comment) => !comment.parentId).length
  const editCommentText = editCommentId !== null ? editCommentInitialText : undefined

  useEffect(() => {
    setVisibleComments(readComments(post.id, petStoryDetailComments.slice(0, post.comments)))
    setActiveGalleryIndex(0)
    galleryRef.current?.scrollTo({ left: 0 })
  }, [post.id, post.comments])

  useEffect(() => {
    if (viewIncrementedForRef.current === post.id) return
    viewIncrementedForRef.current = post.id
    const next = readViewCount(post.id, post.views ?? 0) + 1
    window.localStorage.setItem(`jibsalife.community.views.${post.id}`, String(next))
    setViewCount(next)
  }, [post.id, post.views])

  useEffect(() => {
    window.localStorage.setItem(`jibsalife.community.comments.${post.id}`, JSON.stringify(visibleComments))
  }, [visibleComments, post.id])

  useEffect(() => {
    window.localStorage.setItem(likedPostsStorageKey, JSON.stringify(likedPostIds))
  }, [likedPostIds])

  useEffect(() => {
    window.localStorage.setItem(likedCommentIdsStorageKey, JSON.stringify(likedCommentIds))
  }, [likedCommentIds])

  useEffect(() => {
    const footer = footerRef.current
    const page = pageRef.current
    if (!footer || !page) return
    const updatePagePadding = () => {
      page.style.paddingBottom = `${footer.offsetHeight}px`
    }
    const observer = new ResizeObserver(updatePagePadding)
    updatePagePadding()
    observer.observe(footer)
    return () => observer.disconnect()
  }, [actionRowSlot])


  const handleEditConfirm = () => {
    if (editCommentId !== null) {
      setVisibleComments((current) =>
        current.map((c) => (c.id === editCommentId ? { ...c, text: pendingEditText } : c))
      )
      setEditCommentId(null)
      setPendingEditText('')
      setEditMentionAuthor(null)
      setEditCommentInitialText(undefined)
    }
    setEditAlertOpen(false)
  }

  const handleDelete = () => {
    if (moreTarget === 'post') {
      try {
        writeCommunityCreatedPosts(
          readCommunityCreatedPosts().filter((createdPost) => createdPost.id !== post.id),
        )
      } catch {
        // Ignore localStorage write failures and continue navigation.
      }
      navigate(backDestination)
    } else if (moreTarget && typeof moreTarget === 'object') {
      setVisibleComments((current) => current.filter((c) => c.id !== moreTarget.commentId))
    }
    setDeleteAlertOpen(false)
    setMoreTarget(null)
  }

  const toggleLike = () => {
    setLikedPostIds((current) =>
      current.includes(post.id) ? current.filter((id) => id !== post.id) : [...current, post.id],
    )
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
    const parentId = replyTo?.commentId
    setVisibleComments((current) => [
      ...current,
      {
        id: Date.now(),
        author: currentProfileName,
        text,
        createdAt: new Date().toISOString(),
        likes: 0,
        replies: 0,
        parentId,
      },
    ])
    scrollToCommentBottom()
  }

  const toggleCommentLike = (commentId: number) => {
    const willLike = !likedCommentIds.includes(commentId)

    setLikedCommentIds((current) =>
      willLike ? [...current, commentId] : current.filter((id) => id !== commentId),
    )
    setVisibleComments((current) =>
      current.map((comment) =>
        comment.id === commentId
          ? { ...comment, likes: Math.max((comment.likes ?? 0) + (willLike ? 1 : -1), 0) }
          : comment,
      ),
    )
  }

  const startReply = (comment: DetailComment) => {
    const nextReplyTo = { author: comment.author, commentId: comment.parentId ?? comment.id }

    if (topLevelCommentCount > 8) {
      navigate(`/community/petstory/detail/${post.id}/comments`, {
        state: { replyTo: nextReplyTo },
      })
      return
    }

    setReplyTo(nextReplyTo)
    setEditCommentId(null)
  }

  const handleGalleryScroll = () => {
    const gallery = galleryRef.current
    if (!gallery) return

    const maxScrollLeft = Math.max(gallery.scrollWidth - gallery.clientWidth, 0)
    const progress = maxScrollLeft > 0 ? gallery.scrollLeft / maxScrollLeft : 0
    const nextIndex = Math.round(progress * (galleryImages.length - 1))
    setActiveGalleryIndex(Math.min(Math.max(nextIndex, 0), galleryImages.length - 1))
  }

  const moveGallery = (index: number) => {
    const gallery = galleryRef.current
    if (!gallery) return
    const target = gallery.children[index] as HTMLElement | undefined
    if (!target) return
    const maxScrollLeft = Math.max(gallery.scrollWidth - gallery.clientWidth, 0)

    gallery.scrollTo({
      left: Math.min(target.offsetLeft, maxScrollLeft),
      behavior: 'smooth',
    })
    setActiveGalleryIndex(index)
  }

  const navigateDailyByOffset = (offset: -1 | 1) => {
    if (activeDailyIndex < 0) return

    const nextIndex = activeDailyIndex + offset
    if (nextIndex < 0 || nextIndex >= dailyPosts.length) return

    const nextPost = dailyPosts[nextIndex]
    navigate(`/community/petstory/detail/${nextPost.id}`, {
      replace: true,
      state: {
        ...detailState,
        post: nextPost,
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

    navigateDailyByOffset(diffX < 0 ? 1 : -1)
  }

  return (
    <>
      <PageHeader
        title=""
        leftContent={<BackButton to={backDestination} state={backState} />}
        rightContent={
          <>
            <Button
              type="button"
              aria-label={isBookmarked ? '북마크 해제' : '북마크'}
              className={isBookmarked ? 'cpsdetail_bookmark_btn active' : 'cpsdetail_bookmark_btn'}
              onClick={() => setIsBookmarked((v) => !v)}
            >
              <BookmarkIcon />
            </Button>
            <Button type="button" aria-label="알림" onClick={() => navigate('/notification')}>
              <HeaderIcon type="notification" />
            </Button>
          </>
        }
      />

      <main
        className="page cpsdetail_page"
        ref={pageRef}
        onTouchStart={handleDetailTouchStart}
        onTouchEnd={handleDetailTouchEnd}
      >
        <article className="cpsdetail_post">
          <header className="cpsdetail_author_row">
            <AvatarIcon />
            <div className="cpsdetail_author_text">
              <Title as="h5" title={post.author}>
                <p>
                  <span>{timeText}</span>
                  <span>조회수 {viewCount.toLocaleString()}</span>
                </p>
              </Title>
            </div>
            <button type="button" className="cpsdetail_more" aria-label="더보기" onClick={() => { setMoreTarget('post'); setMoreSheetOpen(post.author === currentProfileName ? 'own' : 'other') }}>
              <MoreIcon />
            </button>
          </header>

          <div className="cpsdetail_post_body">
            <Title as="h4" className="cpsdetail_post_title" title={post.title} />
            <p className="cpsdetail_content p_regular">{content}</p>

            {post.tags?.length ? (
              <div className="cpsdetail_post_tags">
                {post.tags.map((tag) => (
                  <span key={tag} className="cpsdetail_post_tag">#{tag}</span>
                ))}
              </div>
            ) : null}

            {galleryImages.length > 0 ? (
              galleryImages.length > 1 ? (
                <div className="cpsdetail_gallery_wrap">
                  <div
                    ref={galleryRef}
                    className="cpsdetail_gallery"
                    aria-label="게시글 사진"
                    onScroll={handleGalleryScroll}
                  >
                    {galleryImages.map((image, index) => (
                      <img
                        key={`${image}-${index}`}
                        src={image}
                        alt={index === 0 ? post.title : ''}
                        className="cpsdetail_gallery_image"
                        aria-hidden={index === 0 ? undefined : true}
                      />
                    ))}
                  </div>
                  <div className="cpsdetail_gallery_dots">
                    {galleryImages.map((image, index) => (
                      <button
                        key={`${image}-dot-${index}`}
                        type="button"
                        className={activeGalleryIndex === index ? 'active' : undefined}
                        aria-label={`${index + 1}번 사진 보기`}
                        onClick={() => moveGallery(index)}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <div
                  ref={galleryRef}
                  className="cpsdetail_gallery"
                  aria-label="게시글 사진"
                  onScroll={handleGalleryScroll}
                >
                  {galleryImages.map((image, index) => (
                    <img
                      key={`${image}-${index}`}
                      src={image}
                      alt={index === 0 ? post.title : ''}
                      className="cpsdetail_gallery_image"
                      aria-hidden={index === 0 ? undefined : true}
                    />
                  ))}
                </div>
              )
            ) : null}
          </div>

          {galleryImages.length > 0 && post.place ? (
            <Button type="button" className="white_btn cpsdetail_place_card" onClick={() => navigate('/place')}>
              <img src={galleryImages[1] ?? galleryImages[0]} alt="" className="cpsdetail_place_thumb" aria-hidden="true" />
              <Title as="h5" className="cpsdetail_place_text" title={post.place.name}>
                <span className="cpsdetail_place_address">{post.place.address}</span>
              </Title>
              <span className="cpsdetail_place_chevron" aria-hidden="true"><i className="bx bx-chevron-right" /></span>
            </Button>
          ) : null}

          <div className="cpsdetail_recommend_tags">
            <span className="cpsdetail_sympathy_text">{likeCount}명이 공감했어요.</span>
            <LikeButton
              className="white_btn cpsdetail_like_tag_btn"
              liked={isLiked}
              iconClassName="cpsdetail_like_tag_icon"
              countClassName="cpsdetail_like_tag_count"
              aria-label={`좋아요 ${likeCount}`}
              onClick={toggleLike}
            >
              {likeCount}
            </LikeButton>
          </div>

          <div className="cpsdetail_reaction_row">
            <span>{likeCount}명이 공감 했어요</span>
            <LikeButton
              aria-label={`좋아요 ${likeCount}`}
              className="cpsdetail_like_btn"
              liked={isLiked}
              onClick={toggleLike}
            >
              <strong>{likeCount}</strong>
            </LikeButton>
          </div>
        </article>

        <section className="cpsdetail_comments" aria-label="댓글">
          <Title as="h5" className="cpsdetail_comments_title" title={`댓글 ${topLevelCommentCount}`} />
          {(() => {
            const topLevel = visibleComments.filter((c) => !c.parentId)
            const repliesMap = visibleComments.reduce<Record<number, DetailComment[]>>((acc, c) => {
              if (c.parentId) {
                acc[c.parentId] = [...(acc[c.parentId] ?? []), c]
              }
              return acc
            }, {})

            const renderComment = (comment: DetailComment, isReply = false) => {
              const replyCount = repliesMap[comment.id]?.length ?? 0
              return (
              <article key={comment.id} className={`cpsdetail_comment${isReply ? ' cpsdetail_reply' : ''}${comment.author === currentProfileName ? ' cpsdetail_my_comment' : ''}`}>
                <AvatarIcon />
                <div className="cpsdetail_comment_body">
                  <div className="cpsdetail_comment_head">
                    <Title as="h5" title={
                      <>
                        {comment.author}
                        {comment.author === post.author && <span className="cpsdetail_author_badge">작성자</span>}
                      </>
                    }>
                      <p>{comment.createdAt ? formatRelativeTime(comment.createdAt) : (comment.time ?? '11시간 전')}</p>
                    </Title>
                    <button type="button" className="cpsdetail_more" aria-label="댓글 더보기" onClick={() => { setMoreTarget({ commentId: comment.id }); setMoreSheetOpen(comment.author === currentProfileName ? 'own' : 'other') }}>
                      <MoreIcon />
                    </button>
                  </div>
                  <p><CommentText text={comment.text} /></p>
                  <div className="cpsdetail_comment_actions">
                    <LikeButton
                      type="button"
                      liked={likedCommentIds.includes(comment.id)}
                      className="cpsdetail_comment_like"
                      iconClassName="cpsdetail_comment_like_icon"
                      countClassName="cpsdetail_comment_like_text"
                      onClick={() => toggleCommentLike(comment.id)}
                    >
                      좋아요 {comment.likes || ''}
                    </LikeButton>
                  <button type="button" onClick={() => startReply(comment)}>
                    <img src={commentIcon} alt="" aria-hidden="true" />
                    <span>답글쓰기{replyCount > 0 ? ` ${replyCount}` : ''}</span>
                  </button>
                  </div>
                </div>
              </article>
              )
            }

            return topLevel.slice(0, 8).map((comment) => {
              const replies = repliesMap[comment.id] ?? []

              return (
                <div key={comment.id} className="cpsdetail_comment_group">
                  {renderComment(comment)}
                  {replies.map((reply) => renderComment(reply, true))}
                </div>
              )
            })
          })()}
          {topLevelCommentCount > 8 ? (
            <Button
              type="button"
              className="s_white_radius_btn cpsdetail_comments_more_btn"
              onClick={() => navigate(`/community/petstory/detail/${post.id}/comments`)}
            >
              답글 더보기
            </Button>
          ) : null}
        </section>

      </main>

      {actionRowSlot && createPortal(
        <div className="cpsdetail_footer" aria-label="댓글 작성 및 반응" ref={footerRef}>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
          />
          <CommentInputForm
            className="cpsdetail_comment_form"
            iconButtonClassName="cpsdetail_form_icon"
            inputWrapClassName="cpsdetail_comment_input"
            placeholder="메시지를 입력해 주세요."
            addIcon={addIcon}
            emojiIcon={emojiIcon}
            replyTo={editCommentId !== null ? editMentionAuthor : (replyTo?.author ?? null)}
            onClearReply={editCommentId !== null ? () => setEditMentionAuthor(null) : () => setReplyTo(null)}
            prefilledText={editCommentText}
            onAddPhoto={() => setIsPhotoSheetOpen(true)}
            onSubmit={(text) => {
              if (editCommentId !== null) {
                setPendingEditText(text)
                setEditAlertOpen(true)
              } else {
                addComment(text)
              }
            }}
          />
        </div>,
        actionRowSlot
      )}

      {editAlertOpen && (
        <ConfirmDialog
          message="수정하시겠습니까?"
          cancelLabel="취소"
          confirmLabel="수정하기"
          onCancel={() => { setEditAlertOpen(false); setEditCommentId(null); setEditMentionAuthor(null); setEditCommentInitialText(undefined) }}
          onConfirm={handleEditConfirm}
        />
      )}

      {deleteAlertOpen && (
        <ConfirmDialog
          message="삭제하시겠습니까?"
          onCancel={() => setDeleteAlertOpen(false)}
          onConfirm={handleDelete}
        />
      )}

      {moreSheetOpen === 'own' ? (
        <PostMoreSheet
          type="own"
          onClose={() => setMoreSheetOpen(false)}
          onDelete={() => { setMoreSheetOpen(false); setDeleteAlertOpen(true) }}
          onEdit={() => {
            setMoreSheetOpen(false)
            if (moreTarget === 'post') {
              navigate('/community/petstory/write', { state: { editPost: post, returnTo: backDestination } })
            } else if (moreTarget && typeof moreTarget === 'object') {
              const editingComment = visibleComments.find((c) => c.id === moreTarget.commentId)
              const mentionMatch = editingComment?.parentId ? editingComment.text.match(/^@(\S+)\s*/) : null
              const mentionAuthor = mentionMatch ? mentionMatch[1] : null
              const initialText = mentionAuthor
                ? (editingComment?.text.replace(/^@\S+\s*/, '') ?? '')
                : (editingComment?.text ?? '')
              setEditMentionAuthor(mentionAuthor)
              setEditCommentInitialText(initialText)
              setReplyTo(null)
              setEditCommentId(moreTarget.commentId)
            }
          }}
        />
      ) : moreSheetOpen === 'other' ? (
        <PostMoreSheet
          type="other"
          onClose={() => setMoreSheetOpen(false)}
          onReport={() => setMoreSheetOpen(false)}
          onBlock={() => setMoreSheetOpen(false)}
        />
      ) : null}

      {isPhotoSheetOpen && (
        <PostMoreSheet
          type="photo"
          onClose={() => setIsPhotoSheetOpen(false)}
          onCamera={() => {
            setIsPhotoSheetOpen(false)
            if (fileInputRef.current) {
              fileInputRef.current.setAttribute('capture', 'environment')
              fileInputRef.current.click()
            }
          }}
          onAlbum={() => {
            setIsPhotoSheetOpen(false)
            if (fileInputRef.current) {
              fileInputRef.current.removeAttribute('capture')
              fileInputRef.current.click()
            }
          }}
        />
      )}
    </>
  )
}

export default CommunityPetStoryDetails
