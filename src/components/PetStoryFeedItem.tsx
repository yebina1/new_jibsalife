import './PetStoryFeedItem.css'
import type { MouseEvent } from 'react'
import { useState } from 'react'
import { Eye, MoreVertical } from 'lucide-react'
import { useNavigate } from 'react-router'
import Title from './Title'
import LikeButton from './LikeButton'
import PostMoreSheet from './PostMoreSheet'
import commentIcon from '../svg/nav_communicate.svg'

type PetStoryFeedItemProps = {
  postId?: number | string
  tag: string
  title: string
  author: string
  time?: string
  image?: string | null
  imageAlt?: string
  imageObjectPosition?: string
  likes: number
  comments: number
  views: number | string
  liked?: boolean
  isOwn?: boolean
  onClick?: () => void
  onLikeClick?: (event: MouseEvent<HTMLButtonElement>) => void
  onDelete?: () => void
  onEdit?: () => void
  onReport?: () => void
  onBlock?: () => void
}

function PetStoryFeedItem({
  postId,
  tag,
  title,
  author,
  time,
  image,
  imageAlt,
  imageObjectPosition,
  likes,
  comments,
  views,
  liked = false,
  isOwn = false,
  onClick,
  onLikeClick,
  onDelete,
  onEdit,
  onReport,
  onBlock,
}: PetStoryFeedItemProps) {
  const navigate = useNavigate()
  const viewText = typeof views === 'number'
    ? views.toLocaleString('ko-KR')
    : /^\d+$/.test(String(views))
      ? parseInt(views as string, 10).toLocaleString('ko-KR')
      : views
  const [sheetOpen, setSheetOpen] = useState(false)

  return (
    <article className="cpsd_item pet_story_feed_item">
      <div className="pet_story_feed_item_content" onClick={onClick}>
          <span className={`pet_story_feed_item_tag${tag === '반려상식' ? ' pet_story_feed_item_tag--knowledge' : ''}`}>{tag}</span>
        <div className="pet_story_feed_item_body">
          <Title
            as="h5"
            className="pet_story_feed_item_text"
            headingClassName="pet_story_feed_item_title"
            title={title}
            author={<p className="pet_story_feed_item_author">{author}</p>}
            time={time ? <p className="pet_story_feed_item_time">{time}</p> : null}
            metaClassName="pet_story_feed_item_meta"
          />
          {image && (
            <img
              src={image}
              alt={imageAlt ?? title}
              className="pet_story_feed_item_thumb"
              style={imageObjectPosition ? { objectPosition: imageObjectPosition } : undefined}
            />
          )}
        </div>
      </div>

      <div className="pet_story_feed_item_bottom">
        <div className="pet_story_feed_item_actions">
          <LikeButton
            className="pet_story_feed_item_action pet_story_feed_item_like"
            liked={liked}
            aria-label={liked ? 'Unlike' : 'Like'}
            onClick={onLikeClick}
          >
            {likes}
          </LikeButton>
          <button
            type="button"
            className="pet_story_feed_item_action"
            aria-label={`댓글 ${comments}`}
            onClick={(event) => {
              event.stopPropagation()
              if (postId != null) navigate(`/community/petstory/detail/${postId}/comments`)
            }}
          >
            <img src={commentIcon} alt="" aria-hidden="true" style={{ width: 20, height: 20 }} />
            <span>{comments}</span>
          </button>
          <span className="pet_story_feed_item_action">
            <Eye aria-hidden="true" />
            <span>{viewText}</span>
          </span>
        </div>
        <button
          type="button"
          className="pet_story_feed_item_more"
          aria-label="More"
          onClick={(e) => { e.stopPropagation(); setSheetOpen(true) }}
        >
          <MoreVertical aria-hidden="true" />
        </button>
      </div>

      {sheetOpen && (
        isOwn ? (
          <PostMoreSheet
            type="own"
            onClose={() => setSheetOpen(false)}
            onDelete={() => { setSheetOpen(false); onDelete?.() }}
            onEdit={() => { setSheetOpen(false); onEdit?.() }}
          />
        ) : (
          <PostMoreSheet
            type="other"
            onClose={() => setSheetOpen(false)}
            onReport={() => { setSheetOpen(false); onReport?.() }}
            onBlock={() => { setSheetOpen(false); onBlock?.() }}
          />
        )
      )}
    </article>
  )
}

export default PetStoryFeedItem
