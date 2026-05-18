import './MyPostsPage.css'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import PageHeader from '../../components/PageHeader'
import HeaderIcon from '../../components/HeaderIcon'
import BackButton from '../../components/html/BackButton'
import Button from '../../components/html/Button'
import FloatingWriteButton from '../../components/FloatingWriteButton'
import ConfirmDialog from '../../components/ConfirmDialog'
import PetStoryFeedItem from '../../components/PetStoryFeedItem'
import { readMyProfileName } from '../../utils/myProfile'
import {
  COMMUNITY_CREATED_POSTS_CHANGE_EVENT,
  readCommunityCreatedPosts,
  writeCommunityCreatedPosts,
  type CommunityCreatedPost,
} from '../../utils/communityCreatedPosts'
import emptyPostImage from '../../img/mypage/empty_post_.png'
import dailyThumbnail from '../../img/petstory/daily/daily_thumbnail.jpg'

const UI = {
  title: '내가 작성한 글',
  countSuffix: '개',
  intro: '내가 작성한 게시글만 모아볼 수 있어요.',
  listLabel: '내가 작성한 글 목록',
  emptyLabel: '작성한 글 없음',
  emptyTitle: '아직 작성한 게시글이 없어요.',
  totalPrefix: '게시글',
} as const

type MyPost = CommunityCreatedPost

type MyPostCard = MyPost & {
  dateLabel: string
  timeLabel: string
  commentCount: number
  viewCount: number
}

function readMyPosts(): MyPost[] {
  const profileName = readMyProfileName()

  return readCommunityCreatedPosts().map((post) => ({
    ...post,
    author: typeof post.author === 'string' && post.author.trim() ? post.author : profileName,
  }))
}

function readCommentCount(postId: number, fallback = 0) {
  if (typeof window === 'undefined') return fallback

  try {
    const saved = window.localStorage.getItem(`jibsalife.community.comments.${postId}`)
    const parsed = saved ? JSON.parse(saved) : null
    return Array.isArray(parsed) ? parsed.length : fallback
  } catch {
    return fallback
  }
}

function readViewCount(postId: number, fallback = 0) {
  if (typeof window === 'undefined') return fallback

  try {
    const saved = window.localStorage.getItem(`jibsalife.community.views.${postId}`)
    const parsed = saved ? parseInt(saved, 10) : fallback
    return Number.isFinite(parsed) ? Math.max(0, parsed) : fallback
  } catch {
    return fallback
  }
}

function formatDateLabel(post: MyPost) {
  if (post.date) return post.date
  if (!post.createdAt) return ''

  const date = new Date(post.createdAt)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}.${month}.${day}`
}

function formatRelativeTimeText(createdAt?: string) {
  if (!createdAt) return ''

  const createdTime = new Date(createdAt).getTime()
  if (!Number.isFinite(createdTime)) return ''

  const diffSeconds = Math.max(0, Math.floor((Date.now() - createdTime) / 1000))
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

function MyPostsPage() {
  const navigate = useNavigate()
  const [posts, setPosts] = useState<MyPost[]>(readMyPosts)
  const [activeMorePostId, setActiveMorePostId] = useState<number | null>(null)
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)

  useEffect(() => {
    const syncPosts = () => {
      setPosts(readMyPosts())
    }

    window.addEventListener('focus', syncPosts)
    window.addEventListener('pageshow', syncPosts)
    window.addEventListener('storage', syncPosts)
    window.addEventListener(COMMUNITY_CREATED_POSTS_CHANGE_EVENT, syncPosts)

    return () => {
      window.removeEventListener('focus', syncPosts)
      window.removeEventListener('pageshow', syncPosts)
      window.removeEventListener('storage', syncPosts)
      window.removeEventListener(COMMUNITY_CREATED_POSTS_CHANGE_EVENT, syncPosts)
    }
  }, [])

  const postCards = useMemo<MyPostCard[]>(
    () =>
      posts.map((post) => ({
        ...post,
        dateLabel: formatDateLabel(post),
        timeLabel: formatRelativeTimeText(post.createdAt) || formatDateLabel(post),
        commentCount: readCommentCount(post.id, post.comments ?? 0),
        viewCount: readViewCount(post.id, post.views ?? 0),
      })),
    [posts],
  )

  const activeMorePost = postCards.find((post) => post.id === activeMorePostId) ?? null

  const openPost = (post: MyPostCard) => {
    navigate(`/community/petstory/detail/${post.id}`, {
      state: {
        returnTo: '/mypage/posts',
        post: {
          id: post.id,
          tag: post.tag,
          title: post.title,
          content: post.content,
          author: post.author ?? readMyProfileName(),
          date: post.dateLabel,
          image: post.image,
          images: post.images,
          tags: post.tags,
          likes: post.likes ?? 0,
          comments: post.commentCount,
          shares: post.shares ?? 0,
          views: post.viewCount,
          createdAt: post.createdAt,
          place: post.place,
        },
      },
    })
  }

  const closeMoreSheet = () => {
    setActiveMorePostId(null)
  }

  const handleEditPost = (post: MyPostCard) => {
    try {
      writeCommunityCreatedPosts(posts)
    } catch {
      // Ignore storage write failures and continue to the edit screen.
    }

    navigate('/community/petstory/write', {
      state: {
        editPost: post,
        returnTo: '/mypage/posts',
      },
    })
    closeMoreSheet()
  }

  const handleDeletePost = (post: MyPostCard) => {
    setActiveMorePostId(post.id)
    setIsDeleteConfirmOpen(true)
  }

  const confirmDeletePost = () => {
    if (!activeMorePost) return

    const nextPosts = readCommunityCreatedPosts().filter((post) => post.id !== activeMorePost.id)
    setPosts(nextPosts)

    try {
      writeCommunityCreatedPosts(nextPosts)
    } catch {
      // Ignore storage write failures and keep the UI in sync for this session.
    }

    setIsDeleteConfirmOpen(false)
    closeMoreSheet()
  }

  return (
    <>
      <PageHeader
        title={UI.title}
        leftContent={<BackButton to="/mypage" />}
        rightContent={
          <>
            <Button type="button" aria-label="캘린더" onClick={() => navigate('/mission')}>
              <HeaderIcon type="calendar" />
            </Button>
            <Button type="button" aria-label="알림" onClick={() => navigate('/notification')}>
              <HeaderIcon type="notification" />
            </Button>
          </>
        }
      />

      <main className="page myposts_page">
        <section className="myposts_intro">
          <strong>{`${UI.totalPrefix} ${postCards.length}${UI.countSuffix}`}</strong>
          <p>{UI.intro}</p>
        </section>

        {postCards.length > 0 ? (
          <section className="myposts_list" aria-label={UI.listLabel}>
            {postCards.map((post) => (
              <PetStoryFeedItem
                key={post.id}
                postId={post.id}
                tag={post.tag}
                title={post.title}
                author={post.author ?? readMyProfileName()}
                time={post.timeLabel}
                image={post.image ?? dailyThumbnail}
                likes={post.likes ?? 0}
                comments={post.commentCount}
                views={post.viewCount}
                isOwn
                onClick={() => openPost(post)}
                onEdit={() => handleEditPost(post)}
                onDelete={() => handleDeletePost(post)}
              />
            ))}
          </section>
        ) : (
          <section className="myposts_empty" aria-label={UI.emptyLabel}>
            <strong>{UI.emptyTitle}</strong>
            <img className="myposts_empty_img" src={emptyPostImage} alt="" aria-hidden="true" />
          </section>
        )}
      </main>
      {isDeleteConfirmOpen ? (
        <ConfirmDialog
          message="삭제하시겠습니까?"
          onCancel={() => setIsDeleteConfirmOpen(false)}
          onConfirm={confirmDeletePost}
          cancelLabel="아니요"
          confirmLabel="네"
        />
      ) : null}
      <FloatingWriteButton showMenu returnTo="/mypage/posts" />
    </>
  )
}

export default MyPostsPage
