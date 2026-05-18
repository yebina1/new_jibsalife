import './CommunityPetStoryComments.css'
import { useEffect, useRef, useState } from 'react'
import { incrementChallengeCommentCount } from '../../utils/challengeStatus'
import { useLocation } from 'react-router'
import Header from '../../components/Header'
import StateBar from '../../components/StateBar'
import HomeIndicator from '../../components/HomeIndicator'
import Title from '../../components/Title'
import BackButton from '../../components/html/BackButton'
import CommentInputForm from '../../components/html/CommentInputForm'
import addIcon from '../../svg/add_icon.svg'
import emojiIcon from '../../svg/emoji.svg'
import commentIcon from '../../svg/nav_communicate.svg'
import { MY_PROFILE_IMAGE, MY_PROFILE_NAME } from '../../utils/myProfile'
import { petStoryDetailComments } from './CommunityPetStoryDetailData'

const defaultLikedCommentIdsStorageKey = 'jibsalife.community.likedCommentIds'

type DetailComment = (typeof petStoryDetailComments)[number] & {
  time?: string
  createdAt?: string
  parentId?: number
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

type CommentsPageState = {
  initialComments?: DetailComment[]
  replyTo?: {
    author: string
    commentId: number
  }
  storageKey?: string
}

function readLikedCommentIds(storageKey = defaultLikedCommentIdsStorageKey) {
  if (typeof window === 'undefined') return []

  try {
    const saved = window.localStorage.getItem(storageKey)
    const parsed = saved ? JSON.parse(saved) : []
    return Array.isArray(parsed) ? parsed.filter((id): id is number => typeof id === 'number') : []
  } catch {
    return []
  }
}

function getCommentsStorageKey(postId: string | undefined, storageKey?: string) {
  return storageKey ?? (postId ? `jibsalife.community.comments.${postId}` : null)
}

function readComments(
  postId: string | undefined,
  fallback: DetailComment[],
  storageKey?: string,
): DetailComment[] {
  const commentsStorageKey = getCommentsStorageKey(postId, storageKey)

  if (typeof window === 'undefined' || !commentsStorageKey) return fallback

  try {
    const saved = window.localStorage.getItem(commentsStorageKey)
    return saved ? JSON.parse(saved) : fallback
  } catch {
    return fallback
  }
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

function HeartIcon() {
  return (
    <svg viewBox="0 1.8 24 24" aria-hidden="true">
      <path d="M12 20.2 5.2 13.8a4.55 4.55 0 0 1 6.43-6.43L12 7.74l.37-.37a4.55 4.55 0 1 1 6.43 6.43Z" />
    </svg>
  )
}

function AvatarIcon() {
  return (
    <span className="cpsdetail_avatar_box" aria-hidden="true">
      <img src={MY_PROFILE_IMAGE} alt={`${MY_PROFILE_NAME} 프로필 이미지`} />
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

function CommunityPetStoryComments() {
  const location = useLocation()
  const footerRef = useRef<HTMLElement>(null)
  const pageRef = useRef<HTMLElement>(null)
  const postId = location.pathname.match(/\/petstory\/detail\/([^/]+)\/comments/)?.[1]
  const knowledgeId = location.pathname.match(/\/petstory\/knowledge\/([^/]+)\/comments/)?.[1]
  const commentsPageState = location.state as CommentsPageState | null
  const initialReplyTo = commentsPageState?.replyTo ?? null
  const commentsFallback = commentsPageState?.initialComments ?? petStoryDetailComments
  const commentsStorageKey =
    commentsPageState?.storageKey ??
    (knowledgeId ? `jibsalife.community.knowledge.${knowledgeId}.comments` : undefined)
  const likedCommentIdsStorageKey = commentsStorageKey
    ? `${commentsStorageKey}.likedCommentIds`
    : defaultLikedCommentIdsStorageKey
  const [visibleComments, setVisibleComments] = useState(() =>
    readComments(postId, commentsFallback, commentsStorageKey),
  )
  const [likedCommentIds, setLikedCommentIds] = useState<number[]>(() =>
    readLikedCommentIds(likedCommentIdsStorageKey),
  )
  const [replyTo, setReplyTo] = useState<{ author: string; commentId: number } | null>(initialReplyTo)

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
  }, [])

  const toggleCommentLike = (commentId: number) => {
    const willLike = !likedCommentIds.includes(commentId)
    const nextLikedIds = willLike
      ? [...likedCommentIds, commentId]
      : likedCommentIds.filter((id) => id !== commentId)

    setLikedCommentIds(nextLikedIds)
    window.localStorage.setItem(likedCommentIdsStorageKey, JSON.stringify(nextLikedIds))
    setVisibleComments((current) =>
      current.map((comment) =>
        comment.id === commentId
          ? { ...comment, likes: Math.max((comment.likes ?? 0) + (willLike ? 1 : -1), 0) }
          : comment,
      ),
    )
  }

  const topLevel = visibleComments.filter((comment) => !comment.parentId)
  const repliesMap = visibleComments.reduce<Record<number, DetailComment[]>>((acc, comment) => {
    if (comment.parentId) {
      acc[comment.parentId] = [...(acc[comment.parentId] ?? []), comment]
    }
    return acc
  }, {})

  const addComment = (text: string) => {
    const parentId = replyTo?.commentId
    const nextComments = [
      ...visibleComments,
      {
        id: Date.now(),
        author: MY_PROFILE_NAME,
        text,
        createdAt: new Date().toISOString(),
        likes: 0,
        replies: 0,
        parentId,
      },
    ]

    setVisibleComments(nextComments)
    setReplyTo(null)

    const nextStorageKey = getCommentsStorageKey(postId, commentsStorageKey)

    if (nextStorageKey) {
      window.localStorage.setItem(nextStorageKey, JSON.stringify(nextComments))
    }
    incrementChallengeCommentCount()
  }

  const startReply = (comment: DetailComment) => {
    setReplyTo({ author: comment.author, commentId: comment.parentId ?? comment.id })
  }

  const renderComment = (comment: DetailComment, isReply = false) => {
    const replyCount = repliesMap[comment.id]?.length ?? 0

    return (
      <article key={comment.id} className={`cpsdetail_comment${isReply ? ' cpsdetail_reply' : ''}`}>
        <AvatarIcon />
        <div className="cpsdetail_comment_body">
          <div className="cpsdetail_comment_head">
            <Title as="h5" title={comment.author}>
              <p>{comment.createdAt ? formatRelativeTime(comment.createdAt) : (comment.time ?? '11시간 전')}</p>
            </Title>
            <button type="button" className="cpsdetail_more" aria-label="댓글 더보기">
              <MoreIcon />
            </button>
          </div>
          <p>
            <CommentText text={comment.text} />
          </p>
          <div className="cpsdetail_comment_actions">
            <button
              type="button"
              className={likedCommentIds.includes(comment.id) ? 'active' : undefined}
              onClick={() => toggleCommentLike(comment.id)}
            >
              <HeartIcon />
              <span>좋아요 {comment.likes || ''}</span>
            </button>
            <button type="button" onClick={() => startReply(comment)}>
              <img src={commentIcon} className="cpscomments_reply_icon" alt="" aria-hidden="true" />
              <span>답글쓰기{replyCount > 0 ? ` ${replyCount}` : ''}</span>
            </button>
          </div>
        </div>
      </article>
    )
  }

  return (
    <>
      <main className="page cpscomments_page" ref={pageRef}>
        <div className="cpscomments_header">
          <StateBar />
          <Header title="댓글" leftContent={<BackButton />} />
        </div>
        <section className="cpsdetail_comments" aria-label="댓글">
          <Title as="h4" className="cpsdetail_comments_title" title={`댓글 ${visibleComments.length}`} />
          {topLevel.map((comment) => (
            <div key={comment.id} className="cpsdetail_comment_group">
              {renderComment(comment)}
              {(repliesMap[comment.id] ?? []).map((reply) => renderComment(reply, true))}
            </div>
          ))}
        </section>
      </main>

      <footer className="cpscomments_footer" aria-label="댓글 작성" ref={footerRef}>
        <CommentInputForm
          className="cpsdetail_comment_form is_visible"
          iconButtonClassName="cpsdetail_form_icon"
          inputWrapClassName="cpsdetail_comment_input"
          placeholder="메시지를 입력해 주세요."
          addIcon={addIcon}
          emojiIcon={emojiIcon}
          replyTo={replyTo?.author ?? null}
          onClearReply={() => setReplyTo(null)}
          onSubmit={addComment}
        />
        <HomeIndicator />
      </footer>
    </>
  )
}

export default CommunityPetStoryComments
