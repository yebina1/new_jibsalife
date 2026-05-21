import { useEffect, useLayoutEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router'
import PageHeader from './PageHeader'
import HeaderIcon from './HeaderIcon'
import ContentSection from './ContentSection'
import FloatingWriteButton from './FloatingWriteButton'
import Button from './html/Button'
import contents1 from '../img/contents1.png'
import contents2 from '../img/contents2.png'
import contents3 from '../img/contents3.png'
import contents4 from '../img/contents4.png'
import challenge1Image from '../img/challenge1.jpg'
import challenge2Image from '../img/challenge2.png'
import challenge3Image from '../img/challenge3.png'
import challenge4Image from '../img/challenge4.png'
import challenge5Image from '../img/challenge5.png'
import challenge6Image from '../img/challenge6.png'
import challengeHeadingImage from '../img/illust_login_pet.jpg'
import {
  CHALLENGE_REWARD_CLAIMED_STORAGE_KEY,
  getCompletedChallengeCardIds,
} from '../constants/points'

const challengeItems = [
  {
    id: 1,
    title: '오늘의 미션',
    description: '밥 먹는 사진 중 BEST를 골라주세요!',
    date: '2026.04.30',
    participants: 8,
  },
  {
    id: 2,
    title: '산책 인증 챌린지',
    description: '우리아이 즐겁게 산책하는 순간을 자랑해보세요',
    date: '2026.04.30',
    participants: 8,
  },
  {
    id: 3,
    title: '비포 애프터 콘텐츠',
    description: '우리아이 미용 전과 후 사진을 올려주세요',
    date: '2026.04.30',
    participants: 8,
  },
  {
    id: 4,
    title: '코앞샷 챌린지',
    description: '우리아이 잠든 모습 자랑해보세요',
    date: '2026.04.30',
    participants: 8,
  },
] as const

const challengeCardItems = [
  {
    id: 1,
    title: '제일 귀엽게 밥을 먹는 귀염둥이는?',
    participants: 22,
    deadline: '05.10 마감',
    image: challenge1Image,
    status: 'active',
  },
  {
    id: 2,
    title: '가장 말썽꾸러기 같은 아이는?',
    participants: 17,
    deadline: '05.10 마감',
    image: challenge2Image,
    status: 'active',
  },
  {
    id: 3,
    title: '제일 웃는 얼굴이 예쁜 아이는?',
    participants: 31,
    deadline: '05.10 마감',
    image: challenge3Image,
    status: 'active',
  },
  {
    id: 4,
    title: '제일 호기심 많아 보이는 아이는?',
    participants: 14,
    deadline: '05.10 마감',
    image: challenge4Image,
    status: 'active',
  },
  {
    id: 5,
    title: '제일 반갑게 맞아주는 아이는?',
    participants: 26,
    deadline: '05.10 마감',
    image: challenge5Image,
    status: 'active',
  },
  {
    id: 6,
    title: '하루 종일 뛰어놀 것 같은 아이는?',
    participants: 19,
    deadline: '05.10 마감',
    image: challenge6Image,
    status: 'complete',
  },
] as const

const voteListItems = [
  {
    id: 1,
    title: '오늘의 미션 투표',
    description: '밥 먹는 사진 중 BEST를 골라주세요!',
    deadline: '마감시간 23:59',
  },
  {
    id: 2,
    title: '투표2.',
    description: '',
    deadline: '',
  },
  {
    id: 3,
    title: '투표3.',
    description: '',
    deadline: '',
  },
  {
    id: 4,
    title: '투표4.',
    description: '',
    deadline: '',
  },
  {
    id: 5,
    title: '투표5.',
    description: '',
    deadline: '',
  },
] as const

const voteCandidateItems = [
  { id: 1, badge: '챌린지 인증', title: '맛있는 밥시간!', author: '버찌부찌' },
  { id: 2, badge: '챌린지 인증', title: '남남 잘 먹는 우리 댕댕이', author: '초코송이' },
  { id: 3, badge: '챌린지 인증', title: '밥이 제일 좋아!', author: '코코애나' },
  { id: 4, badge: '챌린지 인증', title: '오늘도 클리어', author: '콩이맘' },
] as const

const voteResultItems = [
  { id: 1, badge: '챌린지 인증', title: '밥 먹는 사진 중 BEST를 골라주세요!' },
  { id: 2, badge: '산책 인증', title: '산책 인증 사진 중 BEST를 골라주세요!' },
  { id: 3, badge: '산책 인증', title: '산책 인증 사진 중 BEST를 골라주세요!' },
] as const

const voteResultRankings = [
  { id: 1, rank: '2위', name: '초코송이', votes: '53표' },
  { id: 2, rank: '1위', name: '버찌부찌', votes: '88표' },
  { id: 3, rank: '3위', name: '코코아빠', votes: '32표' },
] as const

const topTabs = ['전체', '커뮤니티', '챌린지 인증', '투표'] as const
const communitySubTabs = ['전체', '자랑하기', '일상', '반려상식'] as const
const voteSubTabs = ['전체', '목록', '투표결과'] as const
const sortOptions = ['인기순', '최신순', '댓글순', '공유순'] as const
const createdPostsStorageKey = 'jibsalife.community.createdPosts'

type TopTab = (typeof topTabs)[number]
const topTabLabels = ['전체', '펫스토리', '챌린지', '투표'] as const
const communitySubTabLabels = ['전체', '자랑하기', '일상', '반려상식'] as const
const communityRouteByTopTab: Record<TopTab, string> = {
  전체: '/community/overview',
  커뮤니티: '/community/pet-story',
  '챌린지 인증': '/community/challenge',
  투표: '/community/vote',
}
type CommunitySubTab = (typeof communitySubTabs)[number]
type VoteSubTab = (typeof voteSubTabs)[number]
export type CommunitySection = 'overview' | 'pet-story' | 'challenge' | 'vote'

const communitySubTabByParam: Record<string, CommunitySubTab> = {
  all: communitySubTabs[0],
  brag: communitySubTabs[1],
  daily: communitySubTabs[2],
  knowledge: communitySubTabs[3],
}

const voteSubTabByParam: Record<string, VoteSubTab> = {
  all: voteSubTabs[0],
  list: voteSubTabs[1],
  result: voteSubTabs[2],
}

const sortByParam: Record<string, (typeof sortOptions)[number]> = {
  popular: sortOptions[0],
  latest: sortOptions[1],
  comments: sortOptions[2],
  shares: sortOptions[3],
}

type CommunityPost = {
  id: number
  tag: string
  title: string
  author: string
  date: string
  timeText?: string
  likes: number
  comments: number
  shares: number
  createdAt: string
  image: string
}

function loadCreatedPosts(): CommunityPost[] {
  if (typeof window === 'undefined') return []

  try {
    const savedPosts = window.localStorage.getItem(createdPostsStorageKey)
    const parsedPosts = savedPosts ? JSON.parse(savedPosts) : []

    return Array.isArray(parsedPosts) ? (parsedPosts as CommunityPost[]) : []
  } catch {
    return []
  }
}

const postData: CommunityPost[] = [
  {
    id: 1,
    tag: '일상',
    title: '강아지 산책하러 나가면 자는척 해요',
    author: '뿌직뿌직',
    date: '2026.04.30',
    timeText: '3시간 전',
    likes: 4,
    comments: 4,
    shares: 4,
    createdAt: '2026-04-30T09:00:00',
    image: contents4,
  },
  {
    id: 2,
    tag: '일상',
    title: '냉전중',
    author: '뿌직뿌직',
    date: '2026.04.30',
    timeText: '3시간 전',
    likes: 4,
    comments: 4,
    shares: 2,
    createdAt: '2026-04-30T18:20:00',
    image: contents2,
  },
  {
    id: 3,
    tag: '일상',
    title: '강아지 발사탕 스프레이 추천해주세요!',
    author: '뿌직뿌직',
    date: '2026.04.30',
    timeText: '3시간 전',
    likes: 4,
    comments: 4,
    shares: 6,
    createdAt: '2026-04-30T14:10:00',
    image: contents1,
  },
  {
    id: 4,
    tag: '일상',
    title: '뽀미랑 부산 여행기',
    author: '뿌직뿌직',
    date: '2026.04.30',
    timeText: '3시간 전',
    likes: 4,
    comments: 4,
    shares: 1,
    createdAt: '2026-04-30T11:00:00',
    image: contents3,
  },
]

const braggingPostData: CommunityPost[] = [
  {
    id: 101,
    tag: '자랑하기',
    title: '우리 집 막내 미모 좀 봐주세요',
    author: '몽실엄마',
    date: '2026.04.30',
    timeText: '1시간 전',
    likes: 18,
    comments: 7,
    shares: 9,
    createdAt: '2026-04-30T20:10:00',
    image: contents1,
  },
  {
    id: 102,
    tag: '자랑하기',
    title: '오늘 미용하고 산책 나왔어요',
    author: '코코산책',
    date: '2026.04.30',
    timeText: '2시간 전',
    likes: 14,
    comments: 4,
    shares: 5,
    createdAt: '2026-04-30T17:00:00',
    image: contents2,
  },
  {
    id: 103,
    tag: '자랑하기',
    title: '간식 앞에서 반짝이는 눈빛',
    author: '복실누나',
    date: '2026.04.30',
    timeText: '5시간 전',
    likes: 20,
    comments: 9,
    shares: 7,
    createdAt: '2026-04-30T15:20:00',
    image: contents3,
  },
]

const knowledgeFeedItems = [
  { id: 1, tag: '산책', title: '초보 집사를 위한 산책법 TOP3', image: contents2, likes: 8, comments: 3 },
  { id: 2, tag: '건강', title: '자세하게 케어해봐요', image: contents3, likes: 8, comments: 3 },
  { id: 3, tag: '일상', title: '고양이의 낮잠 비밀', image: contents1, likes: 8, comments: 3 },
  { id: 4, tag: '일상', title: '수면 패턴 꼭 체크해봐야 할까요?', image: contents4, likes: 8, comments: 3 },
] as const

function getTopTabFromRoute(pathname: string, tabParam: string | null): TopTab {
  if (pathname.endsWith('/pet-story') || tabParam === 'knowledge') return '커뮤니티'
  if (pathname.endsWith('/challenge')) return '챌린지 인증'
  if (pathname.endsWith('/vote')) return '투표'
  return '전체'
}

function getTopTabFromSection(section?: CommunitySection): TopTab | null {
  if (section === 'overview') return '전체'
  if (section === 'pet-story') return '커뮤니티'
  if (section === 'challenge') return '챌린지 인증'
  if (section === 'vote') return '투표'
  return null
}

type CommunityPageProps = {
  section?: CommunitySection
  dependencies?: unknown
}

function CommunityPage({ section, dependencies }: CommunityPageProps) {
  void dependencies

  const navigate = useNavigate()
  const location = useLocation()
  const currentSearchParams = new URLSearchParams(location.search)
  const currentTabParam = currentSearchParams.get('tab')
  const currentSubParam = currentSearchParams.get('sub')
  const currentSortParam = currentSearchParams.get('sort')
  const routeTopTab = getTopTabFromSection(section) ?? getTopTabFromRoute(location.pathname, currentTabParam)
  const initialKnowledgeView = currentTabParam === 'knowledge'
  const initialCommunitySubTab =
    communitySubTabByParam[currentSubParam ?? ''] ??
    (initialKnowledgeView ? communitySubTabs[3] : communitySubTabs[0])
  void initialCommunitySubTab

  const [selectedTopTab, setSelectedTopTab] = useState<TopTab>(
    routeTopTab
  )
  const [selectedCommunitySubTab, setSelectedCommunitySubTab] = useState<CommunitySubTab>(
    initialKnowledgeView ? '반려상식' : '전체'
  )
  const [selectedVoteSubTab, setSelectedVoteSubTab] = useState<VoteSubTab>('투표결과')
  const [selectedSort, setSelectedSort] = useState<(typeof sortOptions)[number]>('인기순')
  const [isSortOpen, setIsSortOpen] = useState(false)
  const [isCommunitySubTabOpen, setIsCommunitySubTabOpen] = useState(false)
  const [searchTerm] = useState('')
  const [likedPostIds, setLikedPostIds] = useState<number[]>([])
  const [selectedChallengeId, setSelectedChallengeId] = useState<number | null>(null)
  const [isChallengeRewardClaimed, setIsChallengeRewardClaimed] = useState(false)
  const [completedChallengeCardIds, setCompletedChallengeCardIds] = useState<number[]>([])
  const [selectedVoteListId, setSelectedVoteListId] = useState<number | null>(null)
  const [selectedVoteResultId, setSelectedVoteResultId] = useState<number | null>(null)
  const [createdPosts, setCreatedPosts] = useState<CommunityPost[]>(loadCreatedPosts)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [draftTag, setDraftTag] = useState<CommunitySubTab>(communitySubTabs[1])
  const [draftTitle, setDraftTitle] = useState('')
  const [draftContent, setDraftContent] = useState('')
  const [draftImage, setDraftImage] = useState('')

  const resetToOverview = () => {
    setSelectedTopTab('전체')
    setSelectedCommunitySubTab('전체')
    setSelectedVoteSubTab('전체')
    setSelectedChallengeId(null)
    setSelectedVoteListId(null)
    setSelectedVoteResultId(null)
    setIsSortOpen(false)
    setIsCommunitySubTabOpen(false)
  }

  useLayoutEffect(() => {
    if (routeTopTab === '전체') {
      resetToOverview()
      return
    }

    setSelectedTopTab(routeTopTab)
    setIsSortOpen(false)
    setIsCommunitySubTabOpen(false)
    setSelectedChallengeId(null)
    setSelectedVoteListId(null)
    setSelectedVoteResultId(null)

    if (routeTopTab === '커뮤니티') {
      setSelectedTopTab('커뮤니티')
      setSelectedCommunitySubTab(currentTabParam === 'knowledge' ? '반려상식' : '전체')
      return
    }

    if (routeTopTab === '투표') {
      setSelectedVoteSubTab('투표결과')
      return
    }

    setSelectedCommunitySubTab('전체')
    setSelectedVoteSubTab('전체')
  }, [currentTabParam, location.key, location.state, routeTopTab])

  useLayoutEffect(() => {
    if (routeTopTab === topTabs[1]) {
      setSelectedCommunitySubTab(
        communitySubTabByParam[currentSubParam ?? ''] ??
          (currentTabParam === 'knowledge' ? communitySubTabs[3] : communitySubTabs[0]),
      )
      return
    }

    if (routeTopTab === topTabs[3]) {
      setSelectedVoteSubTab(voteSubTabByParam[currentSubParam ?? ''] ?? voteSubTabs[2])
    }
  }, [currentSubParam, currentTabParam, routeTopTab])

  useLayoutEffect(() => {
    setSelectedSort(sortByParam[currentSortParam ?? ''] ?? sortOptions[0])
  }, [currentSortParam])

  useEffect(() => {
    window.localStorage.setItem(createdPostsStorageKey, JSON.stringify(createdPosts))
  }, [createdPosts])

  useEffect(() => {
    if (typeof window === 'undefined') return
    setIsChallengeRewardClaimed(window.localStorage.getItem(CHALLENGE_REWARD_CLAIMED_STORAGE_KEY) === 'true')
    setCompletedChallengeCardIds(getCompletedChallengeCardIds())
  }, [location.key])

  const isOverviewTab = selectedTopTab === '전체'
  const isCommunityTab = selectedTopTab === '커뮤니티'
  const isChallengeTab = selectedTopTab === '챌린지 인증'
  const isVoteTab = selectedTopTab === '투표'

  const isBraggingView = isCommunityTab && selectedCommunitySubTab === '자랑하기'
  const isKnowledgeView = isCommunityTab && selectedCommunitySubTab === '반려상식'
  const isCommunityOverview = isCommunityTab && selectedCommunitySubTab === '전체'
  const visibleCreatedPosts =
    isCommunityTab && !isKnowledgeView
      ? createdPosts.filter(
          (post) => selectedCommunitySubTab === communitySubTabs[0] || post.tag === selectedCommunitySubTab
        )
      : []
  const activePostData = isBraggingView
    ? [...visibleCreatedPosts, ...braggingPostData]
    : [...visibleCreatedPosts, ...postData]
  const selectedChallenge = challengeItems.find((item) => item.id === selectedChallengeId) ?? null
  const sortedChallengeCardItems = useMemo(() => {
    const activeItems = challengeCardItems.filter(
      (item) => item.status !== 'complete' && !completedChallengeCardIds.includes(item.id),
    )
    const completeItems = challengeCardItems.filter(
      (item) => item.status === 'complete' || completedChallengeCardIds.includes(item.id),
    )

    return [...activeItems, ...completeItems]
  }, [completedChallengeCardIds])
  const challengeCompletedCount = useMemo(
    () =>
      challengeCardItems.filter(
        (item) => item.status === 'complete' || completedChallengeCardIds.includes(item.id),
      ).length,
    [completedChallengeCardIds],
  )
  const challengeProgressPercent = Math.round((challengeCompletedCount / challengeCardItems.length) * 100)
  const isChallengeRewardAvailable = challengeProgressPercent === 100
  const isChallengeRewardButtonDisabled = isChallengeRewardClaimed || !isChallengeRewardAvailable
  const posts = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase()
    const filtered = activePostData.filter((post) =>
      [post.title, post.author, post.tag].some((value) =>
        !keyword || value.toLowerCase().includes(keyword)
      )
    )

    return [...filtered].sort((a, b) => {
      const aLikes = a.likes + (likedPostIds.includes(a.id) ? 1 : 0)
      const bLikes = b.likes + (likedPostIds.includes(b.id) ? 1 : 0)

      if (selectedSort === '인기순') {
        if (bLikes !== aLikes) return bLikes - aLikes
        return b.comments - a.comments
      }

      if (selectedSort === '댓글순') {
        if (b.comments !== a.comments) return b.comments - a.comments
        return bLikes - aLikes
      }

      if (selectedSort === '공유순') {
        if (b.shares !== a.shares) return b.shares - a.shares
        return bLikes - aLikes
      }

      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })
  }, [activePostData, likedPostIds, searchTerm, selectedSort])

  const toggleLike = (postId: number) => {
    setLikedPostIds((prev) =>
      prev.includes(postId) ? prev.filter((id) => id !== postId) : [...prev, postId]
    )
  }

  const openCreatePost = () => {
    setDraftTag(isBraggingView ? communitySubTabs[1] : communitySubTabs[2])
    setDraftTitle('')
    setDraftContent('')
    setDraftImage('')
    setIsCreateOpen(true)
  }

  const closeCreatePost = () => {
    setIsCreateOpen(false)
  }

  const createPost = () => {
    const title = draftTitle.trim()
    const content = draftContent.trim()

    if (!title) return

    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')

    setCreatedPosts((prev) => [
      {
        id: Date.now(),
        tag: draftTag,
        title,
        author: '나',
        date: `${year}.${month}.${day}`,
        timeText: '방금 전',
        likes: 0,
        comments: content ? 1 : 0,
        shares: 0,
        createdAt: now.toISOString(),
        image: draftImage || contents4,
      },
      ...prev,
    ])
    navigate('/community/pet-story')
    setSelectedTopTab(topTabs[1])
    setSelectedCommunitySubTab(draftTag)
    setSelectedSort(sortOptions[1])
    closeCreatePost()
  }

  const sectionTitle = isOverviewTab
    ? '전체'
    : isKnowledgeView
      ? '반려상식'
      : isVoteTab
        ? '투표'
        : isChallengeTab
          ? '챌린지 인증'
          : '커뮤니티'

  const showCommunitySubTabs = isCommunityTab
  const showVoteSubTabs = isVoteTab
  const showSort = !isOverviewTab && !isKnowledgeView && !isChallengeTab
  const pageSectionClassName = `community_page_${section ?? 'overview'}`

  return (
    <>
      <PageHeader
        title="집사인생"
        rightContent={
          <>
            <Button type="button" aria-label="검색" className="community_header_search">
              <HeaderIcon type="search" />
            </Button>
            <Button type="button" aria-label="calendar" onClick={() => navigate('/mission')}>
              <HeaderIcon type="calendar" />
            </Button>
            <Button
              type="button"
              aria-label="notification"
              className="community_header_notification"
            >
              <HeaderIcon type="notification" />
            </Button>
          </>
        }
      />

      <main className={`page community_page ${pageSectionClassName}`}>
        <section className="community_tab_bar" aria-label="커뮤니티 상위 카테고리">
          {topTabs.map((tab, index) => (
            <button
              key={tab}
              type="button"
              className={selectedTopTab === tab ? 'active' : ''}
              onClick={() => {
                navigate(communityRouteByTopTab[tab])
                setSelectedTopTab(tab)
                setIsSortOpen(false)
                setIsCommunitySubTabOpen(false)
                setSelectedCommunitySubTab('전체')
                setSelectedVoteSubTab('전체')
                setSelectedChallengeId(null)
                setSelectedVoteListId(null)
                setSelectedVoteResultId(null)
              }}
            >
              {topTabLabels[index]}
            </button>
          ))}
        </section>

        {showCommunitySubTabs ? (
          <section className="community_subtab_bar" aria-label="커뮤니티 하위 카테고리">
            <div className={`community_subtab_dropdown ${isCommunitySubTabOpen ? 'open' : ''}`}>
              <button
                type="button"
                className="community_subtab_toggle active"
                onClick={() => setIsCommunitySubTabOpen((prev) => !prev)}
              >
                {communitySubTabLabels[communitySubTabs.indexOf(selectedCommunitySubTab)]}
              </button>
              {isCommunitySubTabOpen ? (
                <div className="community_subtab_menu">
                  {communitySubTabs.map((tab, index) => (
                    <button
                      key={tab}
                      type="button"
                      className={selectedCommunitySubTab === tab ? 'active' : ''}
                      style={{ fontWeight: 400 }}
                      onClick={() => {
                        setSelectedCommunitySubTab(tab)
                        setIsCommunitySubTabOpen(false)
                      }}
                    >
                      <span
                        style={{
                          color: selectedCommunitySubTab === tab ? '#6D59F8' : '#111111',
                          WebkitTextFillColor: selectedCommunitySubTab === tab ? '#6D59F8' : '#111111',
                        }}
                      >
                        {communitySubTabLabels[index]}
                      </span>
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          </section>
        ) : null}

        {showVoteSubTabs ? (
          <section className="community_subtab_bar" aria-label="투표 하위 카테고리">
            {voteSubTabs.map((tab) => (
              <button
                key={tab}
                type="button"
                className={selectedVoteSubTab === tab ? 'active' : ''}
                onClick={() => setSelectedVoteSubTab(tab)}
              >
                {tab}
              </button>
            ))}
          </section>
        ) : null}

        {!isKnowledgeView && !isOverviewTab && !isChallengeTab ? (
          <section
            className={`community_list_header ${isChallengeTab ? 'community_list_header_challenge' : ''}`}
          >
            <h2>{sectionTitle}</h2>
            {showSort ? (
              <div className={`community_sort_dropdown ${isSortOpen ? 'open' : ''}`}>
                <button
                  type="button"
                  className="community_sort_toggle"
                  onClick={() => setIsSortOpen((prev) => !prev)}
                >
                  <span className="community_sort_toggle_label">{selectedSort}</span>
                  <span className="community_sort_toggle_icon" aria-hidden="true" />
                </button>
                {isSortOpen ? (
                  <div className="community_sort_menu">
                    {sortOptions.map((option) => (
                    <button
                      key={option}
                      type="button"
                      className={
                        option === selectedSort
                          ? 'community_sort_option active'
                          : 'community_sort_option'
                      }
                      style={{ fontWeight: 400 }}
                      onClick={() => {
                        setSelectedSort(option)
                        setIsSortOpen(false)
                      }}
                    >
                      <span
                        style={{
                          color: option === selectedSort ? '#6D59F8' : '#111111',
                          WebkitTextFillColor: option === selectedSort ? '#6D59F8' : '#111111',
                        }}
                      >
                        {option}
                      </span>
                    </button>
                  ))}
                </div>
              ) : null}
              </div>
            ) : null}
          </section>
        ) : null}

        {isOverviewTab ? (
          <section className="community_overview">
            <ContentSection
              className="community_overview_section"
              title="커뮤니티"
              action={
                <button
                  type="button"
                  onClick={() => {
                    navigate('/community/pet-story')
                    setSelectedTopTab('커뮤니티')
                    setSelectedCommunitySubTab('전체')
                  }}
                >
                  바로가기
                </button>
              }
            >
              <div className="community_overview_post_list">
                {[braggingPostData[0], postData[0]].map((post) => (
                  <article key={post.id} className="community_post">
                    <img className="community_post_image" src={post.image} alt={post.title} />
                    <div className="community_post_body">
                      <div className="community_post_header">
                        <span className="community_post_tag">{post.tag}</span>
                        <h2>{post.title}</h2>
                      </div>
                      <div className="community_post_meta">
                        <span className="community_post_author">{post.author}</span>
                      </div>
                      <p className="community_post_date">
                        {post.timeText ? <span>{post.timeText}</span> : null}
                        <span>{post.date}</span>
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            </ContentSection>

            <ContentSection
              className="community_overview_section"
              title="챌린지 인증"
              action={
                <button
                  type="button"
                  onClick={() => {
                    navigate('/community/challenge')
                    setSelectedTopTab('챌린지 인증')
                    setSelectedChallengeId(null)
                  }}
                >
                  바로가기
                </button>
              }
            >
              <div className="community_challenge_simple_list">
                {challengeItems.slice(0, 2).map((item) => (
                  <article key={item.id} className="community_challenge_simple_item">
                    <div className="community_challenge_simple_copy">
                      <h3>{item.title}</h3>
                      <p>{item.description}</p>
                      <span>{item.date}</span>
                      <strong>참여자 수 {item.participants}</strong>
                    </div>
                    <button type="button" className="community_challenge_simple_join">
                      참여하기
                    </button>
                  </article>
                ))}
              </div>
            </ContentSection>

            <ContentSection
              className="community_overview_section"
              title="투표"
              action={
                <button
                  type="button"
                  onClick={() => {
                    navigate('/community/vote')
                    setSelectedTopTab('투표')
                    setSelectedVoteSubTab('전체')
                    setSelectedVoteListId(null)
                    setSelectedVoteResultId(null)
                  }}
                >
                  바로가기
                </button>
              }
            >
              <div className="community_vote_result_screen community_overview_vote_preview">
                {voteResultItems.slice(0, 2).map((item) => (
                  <article key={item.id} className="community_vote_result_entry">
                    <div className="community_vote_result_placeholder">
                      투표가
                      <br />
                      종료되었습니다.
                    </div>
                    <div className="community_vote_result_panel">
                      <span className="community_vote_result_label">{item.badge}</span>
                      <h3>{item.title}</h3>
                      <button type="button" className="community_vote_result_action">
                        결과보기
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </ContentSection>
          </section>
        ) : isChallengeTab ? (
          <section className="community_challenge_screen">
            <section className="community_challenge_redesign">
              <article className="community_challenge_feature_card">
                <div className="community_challenge_feature_copy content_section_copy">
                  <h2>이번주 특별 챌린지</h2>
                  <p>이번 주 미션 참여하고, 특별한 보상을 받아보세요.</p>
                </div>
                <div className="community_challenge_feature_progress">
                  <div
                    className="community_challenge_feature_ring"
                    style={{
                      background: `conic-gradient(#6d59f8 0 ${challengeProgressPercent}%, #d8e6f2 ${challengeProgressPercent}% 100%)`,
                    }}
                  >
                    <div className="community_challenge_feature_ring_inner">
                      <span>진행률</span>
                      <strong>{challengeProgressPercent}%</strong>
                    </div>
                  </div>
                </div>
                <Button
                  type="button"
                  className={[
                    'community_challenge_reward_button',
                    isChallengeRewardButtonDisabled ? 'button_disabled_outline' : null,
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  buttonVariant="icon"
                  disabled={isChallengeRewardButtonDisabled}
                  onClick={() => {
                    if (isChallengeRewardButtonDisabled) return
                    navigate('/community/challenge/reward?amount=60', {
                      state: { rewardEventId: `community-challenge-main-${Date.now()}` },
                    })
                  }}
                >
                  {isChallengeRewardClaimed ? '포인트 받기 완료' : '60포인트 받기'}
                </Button>
              </article>

              <section className="content_section community_challenge_list_section">
                <div className="content_section_header community_challenge_heading">
                  <div className="content_section_copy">
                    <h2>챌린지 목록</h2>
                    <p>미션을 완료할수록 더 많은 포인트를 드려요.</p>
                  </div>
                  <img src={challengeHeadingImage} alt="" />
                </div>

                <div className="community_challenge_cards">
                  {sortedChallengeCardItems.map((item) => {
                    const isJoined = selectedChallengeId === item.id
                    const isComplete = item.status === 'complete' || completedChallengeCardIds.includes(item.id)

                    return (
                      <article key={item.id} className="community_challenge_card">
                        <img src={item.image} alt={item.title} className="community_challenge_card_image" />
                        <div className="community_challenge_card_body">
                          <h3>{item.title}</h3>
                          <div className="community_challenge_card_meta">
                            <span>
                              <svg viewBox="0 0 24 24" aria-hidden="true">
                                <circle cx="8.5" cy="9" r="2.5" />
                                <circle cx="15.5" cy="9.5" r="3" />
                                <path d="M3.5 18.5c0-2.4 2.2-4.3 5-4.3 1.3 0 2.4.4 3.3 1.1" />
                                <path d="M10.5 18.5c0-2.7 2.3-4.8 5.1-4.8s4.9 2.1 4.9 4.8" />
                              </svg>
                              {item.participants}명
                            </span>
                            <span>
                              <svg viewBox="0 0 24 24" aria-hidden="true">
                                <rect x="3.5" y="4.5" width="17" height="16" rx="2.5" />
                                <path d="M8 2.8v3.8" />
                                <path d="M16 2.8v3.8" />
                                <path d="M3.5 8.5h17" />
                              </svg>
                              {item.deadline}
                            </span>
                          </div>
                          <Button
                            type="button"
                            buttonVariant="challenge"
                            className={[
                              'community_challenge_card_button',
                              isComplete ? 'is_complete' : item.status === 'active' || isJoined ? 'is_filled' : null,
                            ]
                              .filter(Boolean)
                              .join(' ')}
                            onClick={() => {
                              if (!isComplete) {
                                navigate('/community/challenge/reward?amount=10', {
                                  state: {
                                    rewardEventId: `community-challenge-card-${item.id}-${Date.now()}`,
                                    rewardSourceItemId: item.id,
                                  },
                                })
                              }
                            }}
                          >
                            {isComplete ? '참여완료' : '참여하기'}
                          </Button>
                        </div>
                      </article>
                    )
                  })}
                </div>
              </section>
            </section>

            <article className="community_challenge_summary_card">
              <h3>이번주 특별 상금 챌린지</h3>
              <div className="community_challenge_summary_progress">
                <div className="community_challenge_summary_fill" />
                <span>30% 달성</span>
              </div>
              <strong>60</strong>
              <button type="button">특별 포인트 받기</button>
            </article>

            <div className="community_challenge_section_title">
              <h2>챌린지</h2>
            </div>

            {selectedChallenge ? (
              <article className="community_challenge_join_detail">
                <button
                  type="button"
                  className="community_detail_back_button"
                  onClick={() => setSelectedChallengeId(null)}
                >
                  이전
                </button>
                <div className="community_challenge_join_copy">
                  <h3>{selectedChallenge.title}</h3>
                  <p>{selectedChallenge.description}</p>
                  <span>{selectedChallenge.date}</span>
                  <strong>참여자 수 {selectedChallenge.participants}</strong>
                </div>
                <button type="button" className="community_challenge_upload_cta">
                  사진 업로드하기
                </button>
              </article>
            ) : (
              <div className="community_challenge_simple_list">
                {challengeItems.map((item) => (
                  <article key={item.id} className="community_challenge_simple_item">
                    <div className="community_challenge_simple_copy">
                      <h3>{item.title}</h3>
                      <p>{item.description}</p>
                      <span>{item.date}</span>
                      <strong>참여자 수 {item.participants}</strong>
                    </div>
                    <button
                      type="button"
                      className="community_challenge_simple_join"
                      onClick={() => setSelectedChallengeId(item.id)}
                    >
                      참여하기
                    </button>
                  </article>
                ))}
              </div>
            )}
          </section>
        ) : isVoteTab ? (
          selectedVoteSubTab === '목록' ? (
            selectedVoteListId ? (
              <section className="community_vote_candidate_screen">
                <button
                  type="button"
                  className="community_detail_back_button"
                  onClick={() => setSelectedVoteListId(null)}
                >
                  이전
                </button>
                {voteCandidateItems.map((item, index) => (
                  <article key={item.id} className="community_vote_candidate_entry">
                    <div className="community_vote_candidate_placeholder">후보 {index + 1}</div>
                    <div className="community_vote_candidate_panel">
                      <span className="community_vote_candidate_label">{item.badge}</span>
                      <h3>{item.title}</h3>
                      <div className="community_vote_candidate_meta_row">
                        <span>프로필 이미지</span>
                        <span>{item.author}</span>
                      </div>
                      <button type="button" className="community_vote_candidate_action">
                        투표하기
                      </button>
                    </div>
                  </article>
                ))}
              </section>
            ) : (
              <section className="community_vote_list_screen">
                {voteListItems.map((item) => (
                  <article key={item.id} className="community_vote_list_item">
                    <div className="community_vote_list_header">
                      <h3>{item.title}</h3>
                      {item.deadline ? <span>{item.deadline}</span> : null}
                    </div>
                    {item.description ? <p>{item.description}</p> : null}
                    <div className="community_vote_list_meta">
                      <span>프로필 이미지</span>
                      <span>운영팀</span>
                    </div>
                    <div className="community_vote_list_actions">
                      <button type="button" aria-label="좋아요">
                        <span className="community_like_icon" aria-hidden="true">
                          <svg viewBox="0 0 24 24">
                            <path d="M12 20.2 4.9 13.6a4.8 4.8 0 0 1 6.8-6.8L12 7.9l.3-.3a4.8 4.8 0 1 1 6.8 6.8Z" />
                          </svg>
                        </span>
                        <span>좋아요 8</span>
                      </button>
                      <button type="button" aria-label="댓글">
                        <span className="community_comment_icon" aria-hidden="true">
                          <svg viewBox="0 0 24 24">
                            <path d="M12 4.8c-4.4 0-8 2.9-8 6.6 0 2.1 1.2 4 3.1 5.2l-.8 3 3.3-1.8c.8.2 1.6.3 2.4.3 4.4 0 8-2.9 8-6.7s-3.6-6.6-8-6.6Z" />
                            <circle cx="9" cy="11.4" r="0.8" />
                            <circle cx="12" cy="11.4" r="0.8" />
                            <circle cx="15" cy="11.4" r="0.8" />
                          </svg>
                        </span>
                        <span>댓글 3</span>
                      </button>
                      <button type="button" aria-label="공유하기">
                        <span className="community_share_icon" aria-hidden="true">
                          <svg viewBox="0 0 24 24">
                            <path d="M20 4 9.4 14.6" />
                            <path d="m20 4-6.7 15-3.3-6.7L3.3 9 20 4Z" />
                          </svg>
                        </span>
                        <span>공유하기</span>
                      </button>
                    </div>
                    <button
                      type="button"
                      className="community_vote_list_cta"
                      onClick={() => setSelectedVoteListId(item.id)}
                    >
                      투표하러 가기(참여 시+10)
                    </button>
                  </article>
                ))}
              </section>
            )
          ) : selectedVoteSubTab === '투표결과' ? (
            selectedVoteResultId ? (
              <section className="community_vote_result_detail_screen">
                <button
                  type="button"
                  className="community_detail_back_button"
                  onClick={() => setSelectedVoteResultId(null)}
                >
                  이전
                </button>
                <h3>미션 투표 결과</h3>
                <div className="community_vote_result_podium">
                  {voteResultRankings.map((item) => (
                    <article
                      key={item.id}
                      className={`community_vote_result_podium_item ${
                        item.rank === '1위' ? 'is-winner' : ''
                      }`}
                    >
                      <div className="community_vote_result_podium_box">{item.rank}</div>
                      <strong>{item.name}</strong>
                      <span>{item.votes}</span>
                    </article>
                  ))}
                </div>
              </section>
            ) : (
              <section className="community_vote_result_screen">
                {voteResultItems.map((item) => (
                  <article key={item.id} className="community_vote_result_entry">
                    <div className="community_vote_result_placeholder">
                      투표가
                      <br />
                      종료되었습니다.
                    </div>
                    <div className="community_vote_result_panel">
                      <span className="community_vote_result_label">{item.badge}</span>
                      <h3>{item.title}</h3>
                      <button
                        type="button"
                        className="community_vote_result_action"
                        onClick={() => setSelectedVoteResultId(item.id)}
                      >
                        결과보기
                      </button>
                    </div>
                  </article>
                ))}
              </section>
            )
          ) : (
            <section className="community_feed">
              <div className="community_empty_state">투표 콘텐츠 준비중이에요.</div>
            </section>
          )
        ) : isKnowledgeView ? (
          <section className="community_knowledge_feed">
            <div className="community_knowledge_list">
              {knowledgeFeedItems.map((item) => (
                <article key={item.id} className="community_knowledge_feed_card">
                  <img
                    className="community_knowledge_feed_image"
                    src={item.image}
                    alt={item.title}
                  />
                  <div className="community_knowledge_feed_body">
                    <div className="community_knowledge_feed_title_row">
                      <span className="community_knowledge_feed_tag">{item.tag}</span>
                      <h3>{item.title}</h3>
                    </div>
                    <div className="community_knowledge_feed_actions">
                      <button type="button" aria-label="좋아요">
                        <span className="community_like_icon" aria-hidden="true">
                          <svg viewBox="0 0 24 24">
                            <path d="M12 20.2 4.9 13.6a4.8 4.8 0 0 1 6.8-6.8L12 7.9l.3-.3a4.8 4.8 0 1 1 6.8 6.8Z" />
                          </svg>
                        </span>
                        <span>좋아요 {item.likes}</span>
                      </button>
                      <button type="button" aria-label="댓글">
                        <span className="community_comment_icon" aria-hidden="true">
                          <svg viewBox="0 0 24 24">
                            <path d="M12 4.8c-4.4 0-8 2.9-8 6.6 0 2.1 1.2 4 3.1 5.2l-.8 3 3.3-1.8c.8.2 1.6.3 2.4.3 4.4 0 8-2.9 8-6.7s-3.6-6.6-8-6.6Z" />
                            <circle cx="9" cy="11.4" r="0.8" />
                            <circle cx="12" cy="11.4" r="0.8" />
                            <circle cx="15" cy="11.4" r="0.8" />
                          </svg>
                        </span>
                        <span>댓글 {item.comments}</span>
                      </button>
                      <button type="button" aria-label="공유하기">
                        <span className="community_share_icon" aria-hidden="true">
                          <svg viewBox="0 0 24 24">
                            <path d="M20 4 9.4 14.6" />
                            <path d="m20 4-6.7 15-3.3-6.7L3.3 9 20 4Z" />
                          </svg>
                        </span>
                        <span>공유하기</span>
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ) : isCommunityOverview ? (
          <section className="community_overview">
            <section className="community_overview_section">
              <div className="community_overview_heading">
                <h2>자랑하기</h2>
                <button type="button" onClick={() => setSelectedCommunitySubTab('자랑하기')}>
                  바로가기
                </button>
              </div>
              <div className="community_overview_post_list">
                {braggingPostData.slice(0, 2).map((post) => (
                  <article key={post.id} className="community_post">
                    <img className="community_post_image" src={post.image} alt={post.title} />
                    <div className="community_post_body">
                      <div className="community_post_header">
                        <span className="community_post_tag">{post.tag}</span>
                        <h2>{post.title}</h2>
                      </div>
                      <div className="community_post_meta">
                        <span className="community_post_author">{post.author}</span>
                      </div>
                      <p className="community_post_date">
                        {post.timeText ? <span>{post.timeText}</span> : null}
                        <span>{post.date}</span>
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section className="community_overview_section">
              <div className="community_overview_heading">
                <h2>일상</h2>
                <button type="button" onClick={() => setSelectedCommunitySubTab('일상')}>
                  바로가기
                </button>
              </div>
              <div className="community_overview_post_list">
                {postData.slice(0, 2).map((post) => (
                  <article key={post.id} className="community_post">
                    <img className="community_post_image" src={post.image} alt={post.title} />
                    <div className="community_post_body">
                      <div className="community_post_header">
                        <span className="community_post_tag">{post.tag}</span>
                        <h2>{post.title}</h2>
                      </div>
                      <div className="community_post_meta">
                        <span className="community_post_author">{post.author}</span>
                      </div>
                      <p className="community_post_date">
                        {post.timeText ? <span>{post.timeText}</span> : null}
                        <span>{post.date}</span>
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section className="community_overview_section">
              <div className="community_overview_heading">
                <h2>반려상식</h2>
                <button type="button" onClick={() => setSelectedCommunitySubTab('반려상식')}>
                  바로가기
                </button>
              </div>
              <div className="community_overview_post_list">
                {knowledgeFeedItems.slice(0, 2).map((item) => (
                  <article key={item.id} className="community_post">
                    <img className="community_post_image" src={item.image} alt={item.title} />
                    <div className="community_post_body">
                      <div className="community_post_header">
                        <span className="community_post_tag">{item.tag}</span>
                        <h3>{item.title}</h3>
                      </div>
                      <div className="community_post_meta">
                        <span className="community_post_author">운영팀</span>
                      </div>
                      <p className="community_post_date">
                        <span>2026.04.30</span>
                      </p>
                      <div className="community_post_actions">
                        <button type="button" aria-label="좋아요">
                          <span className="community_like_icon" aria-hidden="true">
                            <svg viewBox="0 0 24 24">
                              <path d="M12 20.2 4.9 13.6a4.8 4.8 0 0 1 6.8-6.8L12 7.9l.3-.3a4.8 4.8 0 1 1 6.8 6.8Z" />
                            </svg>
                          </span>
                          <span className="community_action_count">{item.likes}</span>
                        </button>
                        <button type="button" aria-label="댓글">
                          <span className="community_comment_icon" aria-hidden="true">
                            <svg viewBox="0 0 24 24">
                              <path d="M12 4.8c-4.4 0-8 2.9-8 6.6 0 2.1 1.2 4 3.1 5.2l-.8 3 3.3-1.8c.8.2 1.6.3 2.4.3 4.4 0 8-2.9 8-6.7s-3.6-6.6-8-6.6Z" />
                              <circle cx="9" cy="11.4" r="0.8" />
                              <circle cx="12" cy="11.4" r="0.8" />
                              <circle cx="15" cy="11.4" r="0.8" />
                            </svg>
                          </span>
                          <span className="community_action_count">{item.comments}</span>
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </section>
        ) : (
          <section className="community_feed">
            {posts.length > 0 ? (
              posts.map((post) => (
                <article key={post.id} className="community_post">
                  <img className="community_post_image" src={post.image} alt={post.title} />
                  <div className="community_post_body">
                    <div className="community_post_header">
                      <span className="community_post_tag">{post.tag}</span>
                      <h2>{post.title}</h2>
                    </div>
                    <div className="community_post_meta">
                      <span className="community_post_author">{post.author}</span>
                    </div>
                    <p className="community_post_date">
                      {post.timeText ? <span>{post.timeText}</span> : null}
                      <span>{post.date}</span>
                    </p>
                    <div className="community_post_actions">
                      <button
                        type="button"
                        className={likedPostIds.includes(post.id) ? 'active' : ''}
                        onClick={() => toggleLike(post.id)}
                      >
                        <span className="community_like_icon" aria-hidden="true">
                          <svg viewBox="0 0 24 24">
                            <path d="M12 20.2 4.9 13.6a4.8 4.8 0 0 1 6.8-6.8L12 7.9l.3-.3a4.8 4.8 0 1 1 6.8 6.8Z" />
                          </svg>
                        </span>
                        <span className="community_action_count">
                          {post.likes + (likedPostIds.includes(post.id) ? 1 : 0)}
                        </span>
                      </button>
                      <button type="button" aria-label="댓글">
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
                      <button type="button" aria-label="공유">
                        <span className="community_share_icon" aria-hidden="true">
                          <svg viewBox="0 0 24 24">
                            <path d="M20 4 9.4 14.6" />
                            <path d="m20 4-6.7 15-3.3-6.7L3.3 9 20 4Z" />
                          </svg>
                        </span>
                        <span className="community_action_count">{post.shares}</span>
                      </button>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <div className="community_empty_state">검색 결과가 없어요.</div>
            )}
          </section>
        )}
        {isCreateOpen ? (
          <section className="community_create_sheet" role="dialog" aria-modal="true" aria-label="글쓰기">
            <form
              className="community_create_form"
              onSubmit={(event) => {
                event.preventDefault()
                createPost()
              }}
            >
              <div className="community_create_header">
                <h2>글쓰기</h2>
                <button type="button" onClick={closeCreatePost} aria-label="닫기">
                  ×
                </button>
              </div>

              <label className="community_create_field">
                <span>카테고리</span>
                <select
                  value={draftTag}
                  onChange={(event) => setDraftTag(event.target.value as CommunitySubTab)}
                >
                  {communitySubTabs.slice(1, 3).map((tab) => (
                    <option key={tab} value={tab}>
                      {tab}
                    </option>
                  ))}
                </select>
              </label>

              <label className="community_create_field">
                <span>제목</span>
                <input
                  value={draftTitle}
                  onChange={(event) => setDraftTitle(event.target.value)}
                  placeholder="제목을 입력해 주세요"
                  maxLength={40}
                />
              </label>

              <label className="community_create_field">
                <span>내용</span>
                <textarea
                  value={draftContent}
                  onChange={(event) => setDraftContent(event.target.value)}
                  placeholder="내용을 입력해 주세요"
                  rows={5}
                />
              </label>

              <label className="community_create_upload">
                <span>사진</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) => {
                    const file = event.target.files?.[0]
                    if (!file) return

                    const reader = new FileReader()
                    reader.addEventListener('load', () => {
                      if (typeof reader.result === 'string') {
                        setDraftImage(reader.result)
                      }
                    })
                    reader.readAsDataURL(file)
                  }}
                />
                {draftImage ? (
                  <img src={draftImage} alt="업로드한 사진 미리보기" />
                ) : (
                  <strong>사진 업로드</strong>
                )}
              </label>

              <button type="submit" className="community_create_submit" disabled={!draftTitle.trim()}>
                등록하기
              </button>
            </form>
          </section>
        ) : null}
        <FloatingWriteButton onClick={openCreatePost} />
      </main>
    </>
  )
}

export default CommunityPage
