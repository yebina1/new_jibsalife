import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router'
import Header from '../components/Header'
import Button from '../components/html/Button'
import FloatingAiButton from '../components/FloatingAiButton'
import HomeIndicator from '../components/HomeIndicator'
import Nav from '../components/Nav'
import StateBar from '../components/StateBar'
import StatusMessageBar from '../components/StatusMessageBar'
import { HeaderContext, type HeaderConfig } from '../contexts/HeaderContext'
import { ActionRowContext } from '../contexts/ActionRowContext'
import { HeaderSlotContext } from '../contexts/HeaderSlotContext'

type LayoutProps = {
  showHeader?: boolean
  showNav?: boolean
  showFooter?: boolean
  hasContentPadding?: boolean
}

const communityTabs = [
  { label: '전체', to: '/community/overview' },
  { label: '펫스토리', to: '/community/petstory' },
  { label: '챌린지', to: '/community/challenge' },
  { label: '투표', to: '/community/vote' },
] as const

const petStorySubTabs: { label: string; to: string; disabled?: boolean }[] = [
  { label: '전체', to: '/community/petstory' },
  { label: '일상', to: '/community/petstory/daily' },
  { label: '반려상식', to: '/community/petstory/knowledge' },
  { label: '자랑하기', to: '/community/petstory/brag', disabled: true },
]

const voteSubTabs = [
  { label: '전체', to: '/community/vote?sub=all' },
  { label: '멍스타', to: '/community/vote?sub=mission' },
  { label: '집사투표', to: '/community/vote?sub=regular' },
  { label: '투표결과', to: '/community/vote?sub=result' },
] as const

const communitySortOptions = [
  { label: '최신순', value: 'latest' },
  { label: '인기순', value: 'popular' },
  { label: '댓글순', value: 'comments' },
  { label: '공유순', value: 'shares' },
] as const

const voteSortOptions = [
  { label: '최신순', value: 'latest' },
  { label: '인기순', value: 'popular' },
  { label: '임박순', value: 'deadline' },
] as const

const placeTabs = [
  { label: '전체', to: '/place?category=all' },
  { label: '케어', to: '/place?category=care' },
  { label: '동반외출', to: '/place?category=outing' },
  { label: '여행', to: '/place?category=travel' },
  { label: '쇼핑', to: '/place?category=shopping' },
] as const

const placeSubTabsByCategory: Record<string, { label: string; value: string }[]> = {
  all: [{ label: '전체', value: 'all' }],
  care: [
    { label: '병원', value: 'hospital' },
    { label: '미용실', value: 'grooming' },
    { label: '훈련소', value: 'training' },
    { label: '호텔/돌봄', value: 'hotel-care' },
  ],
  outing: [
    { label: '카페', value: 'cafe' },
    { label: '동반 식당', value: 'restaurant' },
    { label: '산책 코스', value: 'walk-course' },
  ],
  travel: [{ label: '펜션숙소', value: 'pension' }],
  shopping: [
    { label: '용품샵', value: 'supplies' },
    { label: '사료전문점', value: 'food' },
    { label: '의류샵', value: 'clothing' },
  ],
}

const placeDefaultSubByCategory: Record<string, string> = {
  all: 'all',
  care: 'hospital',
  outing: 'cafe',
  travel: 'pension',
  shopping: 'supplies',
}

const placeSortOptions = [
  { label: '인기순', value: 'popular' },
  { label: '최신순', value: 'latest' },
  { label: '거리순', value: 'distance' },
] as const

const enabledPlaceCategories = new Set(['all', 'care'])
const enabledPlaceCareSubTabs = new Set(['hospital'])

function getSubParam(to: string) {
  return new URLSearchParams(to.split('?')[1]).get('sub')
}

function Layout({
  showHeader = true,
  showNav = true,
  showFooter = true,
  hasContentPadding = true,
}: LayoutProps) {
  const [header, setHeader] = useState<HeaderConfig>(null)
  const [actionRowSlot, setActionRowSlot] = useState<HTMLElement | null>(null)
  const [headerSlot, setHeaderSlot] = useState<HTMLElement | null>(null)
  const [isCommunitySortOpen, setIsCommunitySortOpen] = useState(false)
  const [isPlaceSortOpen, setIsPlaceSortOpen] = useState(false)
  const navigate = useNavigate()
  const [isFloatingAiHiddenByScroll, setIsFloatingAiHiddenByScroll] = useState(false)
  const headerRef = useRef<HTMLElement>(null)
  const layoutRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const { pathname, search } = useLocation()
  const searchParams = new URLSearchParams(search)
  const communitySubParam = searchParams.get('sub')
  const communitySortParam = searchParams.get('sort') ?? 'latest'
  const placeCategoryParam = searchParams.get('category') ?? 'all'
  const placeSubParam = searchParams.get('sub') ?? 'all'
  const placeSortParam = searchParams.get('sort') ?? 'popular'
  const isCameraPage = pathname === '/health/camera/capture' || pathname === '/health/cam'
  const isSplashPage = pathname === '/splash'
  const isNoLayoutPage = isCameraPage || isSplashPage
  const isSignupPage = pathname === '/signup'  // ← 추가
  const isLoginPage = pathname === '/login'
  const isOnboardingPage = pathname === '/onboarding'
  const isCommunityPath = pathname.startsWith('/community')
  const isPetStoryDetailPage = pathname.startsWith('/community/petstory/detail/')
  const isPetStoryWritePage = pathname === '/community/petstory/write'
  const isKnowledgeDetailPage = pathname.startsWith('/community/petstory/knowledge/')
  const isVoteDetailPage = pathname === '/community/vote/detail'
  const isVoteResultPage = pathname === '/community/vote/result'
  const isVoteWritePage = pathname === '/community/vote/write'
  const isRewardPage = pathname.startsWith('/community/challenge/reward')
  const isSearchPage = pathname === '/community/search'
  const isHomePage = pathname === '/home'
  const isPlacePath = pathname === '/place'
  const isPlaceFlowPath = pathname.startsWith('/place')
  const showCommunityChrome =
    isCommunityPath && !isPetStoryDetailPage && !isPetStoryWritePage && !isKnowledgeDetailPage && !isVoteDetailPage && !isVoteResultPage && !isVoteWritePage && !isRewardPage && !isSearchPage
  const showPlaceChrome = isPlacePath
  const communitySubTabs = !isPetStoryDetailPage && !isPetStoryWritePage && !isKnowledgeDetailPage && pathname.startsWith('/community/petstory')
    ? petStorySubTabs
    : !isPetStoryDetailPage && !isKnowledgeDetailPage && pathname.startsWith('/community/vote') && pathname !== '/community/vote/detail' && !isVoteResultPage
      ? voteSubTabs
      : null
  const placeSubTabs = placeSubTabsByCategory[placeCategoryParam] ?? placeSubTabsByCategory.all
  const showCommunitySort =
    !isPetStoryDetailPage &&
    !isKnowledgeDetailPage &&
    !pathname.startsWith('/community/vote') &&
    pathname.startsWith('/community/petstory')
  const showPlaceSort = showPlaceChrome
  const activeCommunitySortOptions = pathname.startsWith('/community/vote') ? voteSortOptions : communitySortOptions
  const activeCommunitySort =
    activeCommunitySortOptions.find((option) => option.value === communitySortParam) ?? activeCommunitySortOptions[0]
  const activePlaceSort =
    placeSortOptions.find((option) => option.value === placeSortParam) ?? placeSortOptions[0]
  const contentClassName =
    hasContentPadding ? 'layout_content' : 'layout_content layout_content_no_padding'
  const hideFloatingAiButtonPaths = [
    '/splash',
    '/onboarding',
    '/login',
    '/signup',
    '/place',
    '/mypage',
    '/mypage/posts',
    '/community',
    '/mission',
    '/health',
    '/health/cam',
    '/health/camera',
    '/health/camera/capture',
    '/health/qna',
    '/health/vet-chat',
    '/health/check',
    '/health/report',
    '/health/hospital',
    '/mypage/subscription',
    '/signup/terms/service',
    '/signup/terms/privacy',
    '/notification',
  ]
  const hideFloatingAiButton = hideFloatingAiButtonPaths.includes(pathname) || isCommunityPath || isPlaceFlowPath
  const floatingAiButtonClassName = [
    isFloatingAiHiddenByScroll ? 'is_scroll_hidden' : null,
    isHomePage ? 'floating_button_ai_chat_home' : null,
  ]
    .filter(Boolean)
    .join(' ') || undefined

  const isCommunityTopTabActive = (to: string, isActive: boolean) => {
    if (pathname === '/community' && to === '/community/overview') return true
    if (to === '/community/overview') return isActive
    return pathname === to || pathname.startsWith(`${to}/`)
  }

  const isCommunitySubTabActive = (to: string) => {
    if (to === '/community/petstory') {
      return pathname === '/community/petstory' || pathname === '/community/petstory/'
    }

    if (to.includes('?')) {
      const tabPathname = to.split('?')[0]
      const tabSubParam = getSubParam(to)
      return (
        pathname === tabPathname &&
        (communitySubParam === tabSubParam || (!communitySubParam && tabSubParam === 'all'))
      )
    }

    return pathname === to
  }

  const buildCommunitySortTo = (sortValue: string) => {
    const nextParams = new URLSearchParams(search)
    nextParams.set('sort', sortValue)
    return `${pathname}?${nextParams.toString()}`
  }

  const buildPlaceTabTo = (categoryValue: string) => {
    const nextParams = new URLSearchParams(search)
    nextParams.set('category', categoryValue)
    nextParams.set('sub', placeDefaultSubByCategory[categoryValue] ?? 'all')
    if (!nextParams.get('sort')) nextParams.set('sort', 'popular')
    return `/place?${nextParams.toString()}`
  }

  const buildPlaceSubTabTo = (subValue: string) => {
    const nextParams = new URLSearchParams(search)
    nextParams.set('category', placeCategoryParam)
    nextParams.set('sub', subValue)
    if (!nextParams.get('sort')) nextParams.set('sort', 'popular')
    return `/place?${nextParams.toString()}`
  }

  const buildPlaceSortTo = (sortValue: string) => {
    const nextParams = new URLSearchParams(search)
    nextParams.set('category', placeCategoryParam)
    nextParams.set('sub', placeSubParam)
    nextParams.set('sort', sortValue)
    return `/place?${nextParams.toString()}`
  }

  const isMinimal = !showHeader && !showNav && !showFooter
  const isIndicatorOnlyLayout = (!showNav && showFooter) || isPetStoryDetailPage || isKnowledgeDetailPage || isVoteResultPage || isPetStoryWritePage || isVoteWritePage
  const layoutClassName = isCameraPage
    ? 'layout layout_camera'
    : isSplashPage
      ? 'layout layout_splash'
      : isMinimal
      ? `layout layout_minimal ${isLoginPage ? 'layout_login' : ''} ${isSignupPage ? 'layout_signup' : ''} ${
          isOnboardingPage && !hasContentPadding ? 'layout_minimal_no_header_space' : ''
        }`
      : showPlaceChrome
        ? 'layout layout_community layout_community_with_subtabs'
      : showCommunityChrome
        ? `layout layout_community ${communitySubTabs ? 'layout_community_with_subtabs' : ''}`
        : `layout ${!showFooter ? 'layout_no_footer' : ''} ${
            isIndicatorOnlyLayout ? 'layout_indicator_only' : ''
          } ${isKnowledgeDetailPage ? 'layout_knowledge_detail' : ''}`

  useEffect(() => {
    setIsCommunitySortOpen(false)
  }, [pathname])

  useEffect(() => {
    document.body.style.position = ''
    document.body.style.top = ''
    document.body.style.width = ''
  }, [pathname])

  useEffect(() => {
    setIsPlaceSortOpen(false)
  }, [pathname, search])

  useLayoutEffect(() => {
    const headerEl = headerRef.current
    const layoutEl = layoutRef.current
    if (!headerEl || !layoutEl) return
    const updateHeaderHeight = () => {
      const statusBarHeight =
        headerEl.querySelector<HTMLElement>('.state_bar')?.getBoundingClientRect().height ?? 0
      const pageHeaderHeight =
        headerEl.querySelector<HTMLElement>('.header')?.getBoundingClientRect().height ?? 0
      const minimumHeaderHeight = statusBarHeight + pageHeaderHeight
      const headerHeight = Math.max(headerEl.offsetHeight, minimumHeaderHeight)

      layoutEl.style.setProperty('--layout-header-height', `${headerHeight}px`)
    }
    const observer = new ResizeObserver(updateHeaderHeight)
    updateHeaderHeight()
    observer.observe(headerEl)
    return () => observer.disconnect()
  }, [header, showHeader, showCommunityChrome, showPlaceChrome, communitySubTabs, placeSubTabs])

  useEffect(() => {
    if (pathname !== '/mypage/posts' || typeof window === 'undefined') {
      setIsFloatingAiHiddenByScroll(false)
      return
    }

    let scrollEndTimerId: number | undefined

    const handleScroll = () => {
      setIsFloatingAiHiddenByScroll(true)
      window.clearTimeout(scrollEndTimerId)
      scrollEndTimerId = window.setTimeout(() => {
        setIsFloatingAiHiddenByScroll(false)
      }, 180)
    }

    const el = contentRef.current
    el?.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      window.clearTimeout(scrollEndTimerId)
      setIsFloatingAiHiddenByScroll(false)
      el?.removeEventListener('scroll', handleScroll)
      window.removeEventListener('scroll', handleScroll)
    }
  }, [pathname])

  return (
    <ActionRowContext.Provider value={actionRowSlot}>
    <HeaderSlotContext.Provider value={headerSlot}>
    <HeaderContext.Provider value={setHeader}>
      <div className={layoutClassName} ref={layoutRef}>
        {!isNoLayoutPage ? (
          <header ref={headerRef}>
            <StateBar />
            <div ref={setHeaderSlot} />
            {/* 회원가입 페이지는 StateBar만, Header(집사인생 타이틀)는 표시 안 함 */}
            {showHeader && header && <Header {...header} />}
            {showCommunityChrome ? (
              <>
                <nav className="layout_community_tabs" aria-label="커뮤니티 카테고리">
                  {communityTabs.map((tab) => (
                    <NavLink
                      key={tab.to}
                      to={tab.to}
                      className={({ isActive }) =>
                        `layout_community_tab ${
                          isCommunityTopTabActive(tab.to, isActive) ? 'active' : ''
                        }`
                      }
                      end={tab.to === '/community/overview'}
                    >
                      {tab.label}
                    </NavLink>
                  ))}
                </nav>
                {communitySubTabs ? (
                  <div className="layout_community_controls">
                    {showCommunitySort ? (
                      <div className={`layout_community_sort_dropdown ${isCommunitySortOpen ? 'open' : ''}`}>
                        <Button
                          type="button"
                          className="s_white_radius_btn"
                          icon={<span className="layout_community_sort_icon" />}
                          iconPosition="right"
                          onClick={() => setIsCommunitySortOpen((prev) => !prev)}
                        >
                          {activeCommunitySort.label}
                        </Button>
                        {isCommunitySortOpen ? (
                          <div className="layout_community_sort_menu">
                            {activeCommunitySortOptions.map((option) => (
                              <NavLink
                                key={option.value}
                                to={buildCommunitySortTo(option.value)}
                                className={`layout_community_sort_option ${
                                  option.value === activeCommunitySort.value ? 'active' : ''
                                }`}
                                style={{
                                  color: option.value === activeCommunitySort.value ? '#6D59F8' : '#111111',
                                  WebkitTextFillColor:
                                    option.value === activeCommunitySort.value ? '#6D59F8' : '#111111',
                                  fontWeight: option.value === activeCommunitySort.value ? 600 : 400,
                                }}
                                onClick={() => setIsCommunitySortOpen(false)}
                              >
                                <span
                                  style={{
                                    color: option.value === activeCommunitySort.value ? '#6D59F8' : '#111111',
                                    WebkitTextFillColor:
                                      option.value === activeCommunitySort.value ? '#6D59F8' : '#111111',
                                    fontWeight: option.value === activeCommunitySort.value ? 600 : 400,
                                  }}
                                >
                                  {option.label}
                                </span>
                              </NavLink>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    ) : null}

                    <div
                      className={`layout_community_subtab_scroll${
                        pathname.startsWith('/community/vote') ? ' layout_community_vote_subtab_scroll' : ''
                      }`}
                    >
                      {communitySubTabs.map((tab) => {
                        const isActive = isCommunitySubTabActive(tab.to)
                        const isSmallRadiusSubtab =
                          pathname.startsWith('/community/vote') || pathname.startsWith('/community/petstory')
                        const subtabButtonClassName = isSmallRadiusSubtab
                          ? 's_white_radius_btn'
                          : 'white_radius_btn'

                        return (
                          <Button
                            key={tab.to}
                            type="button"
                            className={`${subtabButtonClassName}${isActive ? ' layout_community_subtab_active' : ''}${'disabled' in tab && tab.disabled ? ' is_disabled' : ''}`}
                            disabled={'disabled' in tab && tab.disabled}
                            onClick={('disabled' in tab && tab.disabled) ? undefined : () => { navigate(tab.to); setIsCommunitySortOpen(false) }}
                          >
                            {tab.label}
                          </Button>
                        )
                      })}
                    </div>
                  </div>
                ) : null}
              </>
            ) : showPlaceChrome ? (
              <>
                <nav className="layout_community_tabs layout_place_tabs" aria-label="장소 카테고리">
                  {placeTabs.map((tab) => {
                    const categoryValue = new URLSearchParams(tab.to.split('?')[1]).get('category') ?? 'all'
                    const isDisabledTab = !enabledPlaceCategories.has(categoryValue)

                    if (isDisabledTab) {
                      return (
                        <button
                          key={tab.to}
                          type="button"
                          className="layout_community_tab is_disabled"
                          disabled
                        >
                          {tab.label}
                        </button>
                      )
                    }

                    return (
                      <NavLink
                        key={tab.to}
                        to={buildPlaceTabTo(categoryValue)}
                        className={() =>
                          `layout_community_tab ${placeCategoryParam === categoryValue ? 'active' : ''}`
                        }
                        end
                      >
                        {tab.label}
                      </NavLink>
                    )
                  })}
                </nav>
                <div className="layout_community_controls">
                  {showPlaceSort ? (
                    <div className={`layout_community_sort_dropdown ${isPlaceSortOpen ? 'open' : ''}`}>
                      <Button
                        type="button"
                        className="s_white_radius_btn"
                        icon={<span className="layout_community_sort_icon" />}
                        iconPosition="right"
                        onClick={() => setIsPlaceSortOpen((prev) => !prev)}
                      >
                        {activePlaceSort.label}
                      </Button>
                      {isPlaceSortOpen ? (
                        <div className="layout_community_sort_menu">
                          {placeSortOptions.map((option) => (
                            <NavLink
                              key={option.value}
                              to={buildPlaceSortTo(option.value)}
                              className={`layout_community_sort_option ${
                                option.value === activePlaceSort.value ? 'active' : ''
                              }`}
                              style={{
                                color: option.value === activePlaceSort.value ? '#6D59F8' : '#111111',
                                WebkitTextFillColor:
                                  option.value === activePlaceSort.value ? '#6D59F8' : '#111111',
                                fontWeight: option.value === activePlaceSort.value ? 600 : 400,
                              }}
                              onClick={() => setIsPlaceSortOpen(false)}
                            >
                              <span
                                style={{
                                  color: option.value === activePlaceSort.value ? '#6D59F8' : '#111111',
                                  WebkitTextFillColor:
                                    option.value === activePlaceSort.value ? '#6D59F8' : '#111111',
                                  fontWeight: option.value === activePlaceSort.value ? 600 : 400,
                                }}
                              >
                                {option.label}
                              </span>
                            </NavLink>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  ) : null}

                  <div className="layout_community_subtab_scroll">
                    {placeSubTabs.map((tab) => {
                      const effectiveSub = placeSubTabs.some((t) => t.value === placeSubParam)
                        ? placeSubParam
                        : (placeDefaultSubByCategory[placeCategoryParam] ?? 'all')
                      const isDisabledTab =
                        placeCategoryParam === 'care' && !enabledPlaceCareSubTabs.has(tab.value)
                      const isActive =
                        placeCategoryParam === 'all'
                          ? tab.value === 'all'
                          : effectiveSub === tab.value

                      return (
                        <Button
                          key={tab.value}
                          type="button"
                          className={`s_white_radius_btn${isActive ? ' layout_community_subtab_active' : ''}${isDisabledTab ? ' is_disabled' : ''}`}
                          disabled={isDisabledTab}
                          onClick={isDisabledTab ? undefined : () => {
                            navigate(buildPlaceSubTabTo(tab.value))
                            setIsPlaceSortOpen(false)
                          }}
                        >
                          {tab.label}
                        </Button>
                      )
                    })}
                  </div>
                </div>
              </>
            ) : null}
          </header>
        ) : null}
        <div className={contentClassName} ref={contentRef}>
          <Outlet />
        </div>
        {!isNoLayoutPage ? <StatusMessageBar /> : null}
        {!hideFloatingAiButton ? (
          <FloatingAiButton className={floatingAiButtonClassName} />
        ) : null}
        {!isNoLayoutPage && showFooter ? (
          <footer>
            <div ref={setActionRowSlot} />
            {showNav && !isPetStoryDetailPage && !isKnowledgeDetailPage && !isVoteDetailPage && !isVoteResultPage && !isPetStoryWritePage && !isVoteWritePage && <Nav />}
            <HomeIndicator />
          </footer>
        ) : null}
      </div>
    </HeaderContext.Provider>
    </HeaderSlotContext.Provider>
    </ActionRowContext.Provider>
  )
}

export default Layout
