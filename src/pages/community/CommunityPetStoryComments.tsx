import './CommunityPetStoryComments.css'
import { useEffect, useRef, useState } from 'react'
import { incrementChallengeCommentCount } from '../../utils/challengeStatus'
import { useLocation } from 'react-router'
import Header from '../../components/Header'
import LikeButton from '../../components/LikeButton'
import StateBar from '../../components/StateBar'
import HomeIndicator from '../../components/HomeIndicator'
import Title from '../../components/Title'
import ConfirmDialog from '../../components/ConfirmDialog'
import PostMoreSheet from '../../components/PostMoreSheet'
import BackButton from '../../components/html/BackButton'
import CommentInputForm from '../../components/html/CommentInputForm'
import addIcon from '../../svg/add_icon.svg'
import emojiIcon from '../../svg/emoji.svg'
import commentIcon from '../../svg/nav_communicate.svg'
import { readMyProfileImage, readMyProfileName } from '../../utils/myProfile'
import { petStoryDetailComments } from './CommunityPetStoryDetailData'

const defaultLikedCommentIdsStorageKey = 'jibsalife.community.likedCommentIds'

type DetailComment = (typeof petStoryDetailComments)[number] & {
  time?: string
  createdAt?: string
  parentId?: number
}

function normalizeComments(value: unknown, fallback: DetailComment[]) {
  if (!Array.isArray(value)) return fallback

  return value.filter((comment): comment is DetailComment => {
    if (!comment || typeof comment !== 'object') return false

    const candidate = comment as Record<string, unknown>
    return (
      typeof candidate.id === 'number' &&
      typeof candidate.author === 'string' &&
      typeof candidate.text === 'string'
    )
  })
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
    return saved ? normalizeComments(JSON.parse(saved), fallback) : fallback
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

function AvatarIcon({ image, name }: { image: string; name: string }) {
  return (
    <span className="cpsdetail_avatar_box" aria-hidden="true">
      <img src={image} alt={`${name} 프로필 이미지`} />
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
  const shouldScrollToBottomRef = useRef(false)
  const currentProfileName = readMyProfileName()
  const currentProfileImage = readMyProfileImage()
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
  const [moreSheetOpen, setMoreSheetOpen] = useState<'own' | 'other' | false>(false)
  const [moreTarget, setMoreTarget] = useState<{ commentId: number } | null>(null)
  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false)
  const [editAlertOpen, setEditAlertOpen] = useState(false)
  const [pendingEditText, setPendingEditText] = useState('')
  const [editCommentId, setEditCommentId] = useState<number | null>(null)
  const [editMentionAuthor, setEditMentionAuthor] = useState<string | null>(null)
  const [editCommentInitialText, setEditCommentInitialText] = useState<string | undefined>(undefined)
  const editCommentText = editCommentId !== null ? editCommentInitialText : undefined

  const persistComments = (comments: DetailComment[]) => {
    const nextStorageKey = getCommentsStorageKey(postId, commentsStorageKey)

    if (nextStorageKey) {
      window.localStorage.setItem(nextStorageKey, JSON.stringify(comments))
    }
  }

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

  useEffect(() => {
    if (!shouldScrollToBottomRef.current) return
    shouldScrollToBottomRef.current = false

    const frameId = window.requestAnimationFrame(() => {
      pageRef.current?.scrollTo({
        top: pageRef.current.scrollHeight,
        behavior: 'smooth',
      })
    })

    return () => window.cancelAnimationFrame(frameId)
  }, [visibleComments.length])

  const toggleCommentLike = (commentId: number) => {
    const willLike = !likedCommentIds.includes(commentId)
    const nextLikedIds = willLike
      ? [...likedCommentIds, commentId]
      : likedCommentIds.filter((id) => id !== commentId)

    setLikedCommentIds(nextLikedIds)
    window.localStorage.setItem(likedCommentIdsStorageKey, JSON.stringify(nextLikedIds))
    setVisibleComments((current) =>
      {
        const nextComments = current.map((comment) =>
          comment.id === commentId
            ? { ...comment, likes: Math.max((comment.likes ?? 0) + (willLike ? 1 : -1), 0) }
            : comment,
        )
        persistComments(nextComments)
        return nextComments
      },
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
        author: currentProfileName,
        text,
        createdAt: new Date().toISOString(),
        likes: 0,
        replies: 0,
        parentId,
      },
    ]

    setVisibleComments(nextComments)
    setReplyTo(null)
    setEditCommentId(null)
    shouldScrollToBottomRef.current = true

    persistComments(nextComments)
    incrementChallengeCommentCount()
  }

  const startReply = (comment: DetailComment) => {
    setEditCommentId(null)
    setEditMentionAuthor(null)
    setEditCommentInitialText(undefined)
    setReplyTo({ author: comment.author, commentId: comment.parentId ?? comment.id })
  }

  const handleEditConfirm = () => {
    if (editCommentId !== null) {
      setVisibleComments((current) => {
        const nextComments = current.map((comment) =>
          comment.id === editCommentId ? { ...comment, text: pendingEditText } : comment,
        )
        persistComments(nextComments)
        return nextComments
      })
      setEditCommentId(null)
      setPendingEditText('')
      setEditMentionAuthor(null)
      setEditCommentInitialText(undefined)
    }
    setEditAlertOpen(false)
  }

  const handleDelete = () => {
    if (moreTarget) {
      setVisibleComments((current) => {
        const deletedComment = current.find((comment) => comment.id === moreTarget.commentId)
        const deletedIds = new Set([moreTarget.commentId])

        if (!deletedComment?.parentId) {
          current.forEach((comment) => {
            if (comment.parentId === moreTarget.commentId) {
              deletedIds.add(comment.id)
            }
          })
        }

        const nextComments = current.filter((comment) => !deletedIds.has(comment.id))
        persistComments(nextComments)
        return nextComments
      })
    }

    setDeleteAlertOpen(false)
    setMoreTarget(null)
  }

  const openMoreSheet = (comment: DetailComment) => {
    setMoreTarget({ commentId: comment.id })
    setMoreSheetOpen(comment.author === currentProfileName ? 'own' : 'other')
  }

  const startEdit = () => {
    setMoreSheetOpen(false)
    if (!moreTarget) return

    const editingComment = visibleComments.find((comment) => comment.id === moreTarget.commentId)
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

  const renderComment = (comment: DetailComment, isReply = false) => {
    const replyCount = repliesMap[comment.id]?.length ?? 0

    return (
      <article
        key={comment.id}
        className={`cpsdetail_comment${isReply ? ' cpsdetail_reply' : ''}${comment.author === currentProfileName ? ' cpsdetail_my_comment' : ''}`}
      >
        <AvatarIcon image={currentProfileImage} name={currentProfileName} />
        <div className="cpsdetail_comment_body">
          <div className="cpsdetail_comment_head">
            <Title as="h5" title={comment.author}>
              <p>{comment.createdAt ? formatRelativeTime(comment.createdAt) : (comment.time ?? '11시간 전')}</p>
            </Title>
            <button
              type="button"
              className="cpsdetail_more"
              aria-label="댓글 더보기"
              onClick={() => openMoreSheet(comment)}
            >
              <MoreIcon />
            </button>
          </div>
          <p>
            <CommentText text={comment.text} />
          </p>
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
          replyTo={editCommentId !== null ? editMentionAuthor : (replyTo?.author ?? null)}
          onClearReply={editCommentId !== null ? () => setEditMentionAuthor(null) : () => setReplyTo(null)}
          prefilledText={editCommentText}
          onSubmit={(text) => {
            if (editCommentId !== null) {
              setPendingEditText(text)
              setEditAlertOpen(true)
            } else {
              addComment(text)
            }
          }}
        />
        <HomeIndicator />
      </footer>

      {editAlertOpen && (
        <ConfirmDialog
          message="수정하시겠습니까?"
          cancelLabel="취소"
          confirmLabel="수정하기"
          onCancel={() => {
            setEditAlertOpen(false)
            setEditCommentId(null)
            setEditMentionAuthor(null)
            setEditCommentInitialText(undefined)
          }}
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
          onDelete={() => {
            setMoreSheetOpen(false)
            setDeleteAlertOpen(true)
          }}
          onEdit={startEdit}
        />
      ) : moreSheetOpen === 'other' ? (
        <PostMoreSheet
          type="other"
          onClose={() => setMoreSheetOpen(false)}
          onReport={() => setMoreSheetOpen(false)}
          onBlock={() => setMoreSheetOpen(false)}
        />
      ) : null}
    </>
  )
}

export default CommunityPetStoryComments
