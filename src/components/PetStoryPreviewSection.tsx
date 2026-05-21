import { useState } from 'react'
import { useNavigate } from 'react-router'
import { dailyPosts } from '../pages/community/CommunityPetStory'
import { MY_PROFILE_NAME } from '../utils/myProfile'
import { getCommunityCreatedPostsStorageKey } from '../utils/communityCreatedPosts'
import PetStoryFeedItem from './PetStoryFeedItem'
import dailyThumbnail from '../img/petstory/daily/daily_thumbnail.jpg'

type CreatedPost = {
  id: number
  tag: string
  title: string
  content?: string
  author: string
  createdAt: string
  likes: number
  comments: number
  shares?: number
  views?: number
  image: string | null
  images?: string[]
  tags?: string[]
}

type PreviewPost = {
  id: number
  tag: string
  title: string
  content?: string
  author: string
  createdAt: string
  likes: number
  comments: number
  shares?: number
  views?: number
  image: string | null
  images?: string[]
  tags?: string[]
}

function loadCreatedPosts(): CreatedPost[] {
  if (typeof window === 'undefined') return []
  try {
    const saved = window.localStorage.getItem(getCommunityCreatedPostsStorageKey())
    const parsed = saved ? JSON.parse(saved) : []
    return Array.isArray(parsed)
      ? (parsed as CreatedPost[])
          .filter((post) => post.tag === '일상')
          .map((post) => ({
            ...post,
            author: post.author === '나' ? MY_PROFILE_NAME : post.author,
          }))
      : []
  } catch {
    return []
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

function PetStoryPreviewSection() {
  const navigate = useNavigate()
  const [nowTime] = useState(() => Date.now())
  const [createdPosts] = useState<CreatedPost[]>(loadCreatedPosts)

  const latestPosts: PreviewPost[] = [...createdPosts, ...dailyPosts]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 4)

  const handleClick = (post: PreviewPost) => {
    navigate(`/community/petstory/detail/${post.id}`, {
      state: {
        post: {
          id: post.id,
          tag: post.tag,
          title: post.title,
          content: post.content,
          author: post.author,
          time: getRelativeTimeText(post.createdAt, nowTime),
          image: post.image,
          images: post.images,
          tags: post.tags,
          likes: post.likes,
          comments: post.comments,
          shares: post.shares ?? 10,
          views: post.views ?? 0,
          createdAt: post.createdAt,
        },
      },
    })
  }

  return (
    <div>
      {latestPosts.map((post) => (
        <PetStoryFeedItem
          key={post.id}
          postId={post.id}
          tag={post.tag}
          title={post.title}
          author={post.author}
          time={getRelativeTimeText(post.createdAt, nowTime)}
          image={post.image ?? dailyThumbnail}
          likes={post.likes}
          comments={post.comments}
          views={post.views ?? 120}
          onClick={() => handleClick(post)}
        />
      ))}
    </div>
  )
}

export default PetStoryPreviewSection
