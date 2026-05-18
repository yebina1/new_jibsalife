import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import StateBar from '../../components/StateBar'
import PetStoryFeedItem from '../../components/PetStoryFeedItem'
import { dailyPosts, knowledgeFeedItems } from './CommunityPetStory'
import { readCommunityCreatedPosts } from '../../utils/communityCreatedPosts'
import dailyThumbnail from '../../img/petstory/daily/daily_thumbnail.jpg'
import './CommunitySearch.css'

const RECENT_SEARCHES_KEY = 'jibsalife.community.recentSearches'
const MAX_RECENT = 10
const POPULAR_SEARCHES = ['#여행', '#산책', '#기록', '#관리법']

type MainTab = '전체' | '펫스토리' | '챌린지' | '투표'
type PetSubTab = '전체' | '일상' | '반려상식'
type SortType = '인기순' | '최신순'

const MAIN_TABS: MainTab[] = ['전체', '펫스토리', '챌린지', '투표']
const PET_SUB_TABS: PetSubTab[] = ['전체', '일상', '반려상식']

type SearchItem = {
  id: number | string
  tag: string
  title: string
  author: string
  time: string
  image: string | null
  likes: number
  comments: number
  views: number | string
  createdAt: string
  path: string
}

function readRecentSearches(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_SEARCHES_KEY)
    return raw ? (JSON.parse(raw) as string[]) : []
  } catch {
    return []
  }
}

function writeRecentSearches(searches: string[]): void {
  localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(searches))
}

function getRelativeTime(createdAt: string): string {
  const diff = Math.max(0, Math.floor((Date.now() - new Date(createdAt).getTime()) / 1000))
  if (diff < 60) return '방금 전'
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`
  const days = Math.floor(diff / 86400)
  if (days <= 31) return `${days}일 전`
  const months = Math.floor(days / 30)
  if (months <= 12) return `${months}달 전`
  return `${Math.floor(months / 12)}년 전`
}

function CommunitySearch() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<MainTab>('펫스토리')
  const [petSubTab, setPetSubTab] = useState<PetSubTab>('전체')
  const [sortBy, setSortBy] = useState<SortType>('인기순')
  const [isSortOpen, setIsSortOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [recentSearches, setRecentSearches] = useState<string[]>(readRecentSearches)
  const [isMoreOpen, setIsMoreOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const moreRef = useRef<HTMLDivElement>(null)
  const sortRef = useRef<HTMLDivElement>(null)

  const hasSearched = query.trim().length > 0

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    if (!isMoreOpen && !isSortOpen) return
    const handle = (e: MouseEvent) => {
      if (isMoreOpen && moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setIsMoreOpen(false)
      }
      if (isSortOpen && sortRef.current && !sortRef.current.contains(e.target as Node)) {
        setIsSortOpen(false)
      }
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [isMoreOpen, isSortOpen])

  const { dailyItems, knowledgeItems } = useMemo(() => {
    const createdPosts = readCommunityCreatedPosts()
    return {
      dailyItems: [
        ...dailyPosts.map((p): SearchItem => ({
          id: p.id,
          tag: p.tag,
          title: p.title,
          author: p.author,
          time: getRelativeTime(p.createdAt),
          image: p.image,
          likes: p.likes,
          comments: p.comments,
          views: p.views,
          createdAt: p.createdAt,
          path: `/community/petstory/detail/${p.id}`,
        })),
        ...createdPosts.map((p): SearchItem => ({
          id: p.id,
          tag: p.tag ?? '일상',
          title: p.title,
          author: p.author ?? '나',
          time: getRelativeTime(p.createdAt ?? new Date().toISOString()),
          image: p.image ?? dailyThumbnail,
          likes: p.likes ?? 0,
          comments: p.comments ?? 0,
          views: p.views ?? 0,
          createdAt: p.createdAt ?? new Date().toISOString(),
          path: `/community/petstory/detail/${p.id}`,
        })),
      ],
      knowledgeItems: knowledgeFeedItems.map((k): SearchItem => ({
        id: k.id,
        tag: '반려상식',
        title: k.title,
        author: '집사인생',
        time: getRelativeTime(k.createdAt),
        image: k.image,
        likes: k.likes,
        comments: k.comments,
        views: k.viewsText,
        createdAt: k.createdAt,
        path: k.path,
      })),
    }
  }, [])

  const filteredResults = useMemo((): SearchItem[] => {
    if (!hasSearched) return []
    const q = query.toLowerCase()

    const matchDaily = dailyItems.filter(
      (p) => p.title.toLowerCase().includes(q) || p.tag.toLowerCase().includes(q),
    )
    const matchKnowledge = knowledgeItems.filter(
      (k) => k.title.toLowerCase().includes(q) || k.tag.toLowerCase().includes(q),
    )

    let items: SearchItem[]
    if (activeTab === '전체') {
      items = [...matchDaily, ...matchKnowledge]
    } else if (activeTab === '펫스토리') {
      if (petSubTab === '일상') items = matchDaily
      else if (petSubTab === '반려상식') items = matchKnowledge
      else items = [...matchDaily, ...matchKnowledge]
    } else {
      items = []
    }

    return sortBy === '인기순'
      ? [...items].sort((a, b) => (b.likes as number) - (a.likes as number))
      : [...items].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )
  }, [query, activeTab, petSubTab, sortBy, dailyItems, knowledgeItems, hasSearched])

  const addRecentSearch = (term: string) => {
    const trimmed = term.trim()
    if (!trimmed) return
    const next = [trimmed, ...recentSearches.filter((s) => s !== trimmed)].slice(0, MAX_RECENT)
    setRecentSearches(next)
    writeRecentSearches(next)
  }

  const removeRecentSearch = (term: string) => {
    const next = recentSearches.filter((s) => s !== term)
    setRecentSearches(next)
    writeRecentSearches(next)
  }

  const clearAll = () => {
    setRecentSearches([])
    writeRecentSearches([])
    setIsMoreOpen(false)
  }

  const handleSearch = (term: string) => {
    const trimmed = term.trim()
    if (!trimmed) return
    addRecentSearch(trimmed)
    setQuery(trimmed)
  }

  const showSubControls = hasSearched && activeTab === '펫스토리'

  return (
    <div className="cs_page">
      <StateBar />
      <div className={`cs_sticky_header${hasSearched ? ' cs_sticky_header--active' : ''}`}>
        <div className="cs_header">
          <button
            type="button"
            className="cs_back_btn"
            aria-label="뒤로가기"
            onClick={() => navigate(-1)}
          >
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M15 18l-6-6 6-6"
                stroke="#111111"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <div className="cs_input_wrap">
            <input
              ref={inputRef}
              className="cs_input"
              type="search"
              placeholder="검색어를 입력해주세요"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSearch(query)
              }}
            />
            <button
              type="button"
              className="cs_search_icon_btn"
              aria-label="검색"
              onClick={() => handleSearch(query)}
            >
              <svg viewBox="0 0 28 28" fill="none" aria-hidden="true">
                <circle cx="12.25" cy="12.25" r="6.75" stroke="#111111" strokeWidth="1.5" />
                <path
                  d="m17.25 17.25 5.25 5.25"
                  stroke="#111111"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
        </div>

        {hasSearched && (
          <div className="cs_tabs" role="tablist">
            {MAIN_TABS.map((tab) => (
              <button
                key={tab}
                type="button"
                role="tab"
                className={`cs_tab${activeTab === tab ? ' is_active' : ''}`}
                aria-selected={activeTab === tab}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>
        )}
      </div>

      <main className="cs_content">
        {hasSearched ? (
          <>
            {showSubControls && (
              <div className="cs_sub_controls">
                <div className="cs_sort_wrap" ref={sortRef}>
                  <button
                    type="button"
                    className="cs_sort_btn"
                    onClick={() => setIsSortOpen((p) => !p)}
                  >
                    {sortBy}
                    <svg
                      className="cs_sort_chevron"
                      viewBox="0 0 16 16"
                      fill="none"
                      aria-hidden="true"
                    >
                      <path
                        d="M4 6l4 4 4-4"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                  {isSortOpen && (
                    <div className="cs_sort_dropdown">
                      {(['인기순', '최신순'] as SortType[]).map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          className={`cs_sort_option${sortBy === opt ? ' is_active' : ''}`}
                          onClick={() => {
                            setSortBy(opt)
                            setIsSortOpen(false)
                          }}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="cs_sub_tabs">
                  {PET_SUB_TABS.map((sub) => (
                    <button
                      key={sub}
                      type="button"
                      className={`cs_sub_tab${petSubTab === sub ? ' is_active' : ''}`}
                      onClick={() => setPetSubTab(sub)}
                    >
                      {sub}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {filteredResults.length > 0 ? (
              <ul className="cs_results">
                {filteredResults.map((item) => (
                  <li key={`${item.tag}-${item.id}`}>
                    <PetStoryFeedItem
                      postId={item.id}
                      tag={item.tag}
                      title={item.title}
                      author={item.author}
                      time={item.time}
                      image={item.image}
                      likes={item.likes}
                      comments={item.comments}
                      views={item.views}
                      onClick={() => navigate(item.path)}
                    />
                  </li>
                ))}
              </ul>
            ) : (
              <div className="cs_empty">
                <p className="cs_empty_text">검색 결과가 없어요</p>
              </div>
            )}
          </>
        ) : (
          <>
            <section className="cs_section">
              <h2 className="cs_section_title">인기 검색어</h2>
              <div className="cs_popular_chips">
                {POPULAR_SEARCHES.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    className="cs_chip"
                    onClick={() => {
                      const term = tag.replace(/^#/, '')
                      setQuery(term)
                      handleSearch(term)
                    }}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </section>

            <section className="cs_section">
              <div className="cs_recent_header">
                <h2 className="cs_section_title">최근 검색어</h2>
                <div className="cs_more_wrap" ref={moreRef}>
                  <button
                    type="button"
                    className="cs_more_btn"
                    aria-label="최근 검색어 전체 삭제"
                    aria-expanded={isMoreOpen}
                    onClick={() => setIsMoreOpen((p) => !p)}
                  >
                    •••
                  </button>
                  {isMoreOpen && (
                    <div className="cs_dropdown">
                      <button type="button" className="cs_dropdown_item" onClick={clearAll}>
                        전체 삭제
                      </button>
                    </div>
                  )}
                </div>
              </div>
              {recentSearches.length > 0 && (
                <ul className="cs_recent_list">
                  {recentSearches.map((term) => (
                    <li key={term} className="cs_recent_item">
                      <button
                        type="button"
                        className="cs_recent_text_btn"
                        onClick={() => {
                          setQuery(term)
                          handleSearch(term)
                        }}
                      >
                        <svg
                          className="cs_clock_icon"
                          viewBox="0 0 20 20"
                          fill="none"
                          aria-hidden="true"
                        >
                          <circle cx="10" cy="10" r="7.5" stroke="#999999" strokeWidth="1.3" />
                          <path
                            d="M10 6.5V10l2.5 2"
                            stroke="#999999"
                            strokeWidth="1.3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <span>{term}</span>
                      </button>
                      <button
                        type="button"
                        className="cs_delete_btn"
                        aria-label={`${term} 삭제`}
                        onClick={() => removeRecentSearch(term)}
                      >
                        <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
                          <path
                            d="M5 5l10 10M15 5L5 15"
                            stroke="#999999"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                          />
                        </svg>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  )
}

export default CommunitySearch
