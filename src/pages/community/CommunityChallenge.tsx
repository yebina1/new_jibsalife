import './CommunityShared.css'
import './CommunityChallenge.css'
import { useEffect, useRef, useState } from 'react'
import { useSwipeNav } from '../../hooks/useSwipeNav'
import { checkChallengeDayDone, CHALLENGE_STATUS_CHANGED_EVENT, isDemoChallengeAccount, readCurrentDay, saveCurrentDay } from '../../utils/challengeStatus'
import { useNavigate } from 'react-router'
import { addUserNotification } from '../../utils/userNotifications'
import { AUTH_CURRENT_USER_STORAGE_KEY } from '../../utils/authAccounts'
import CommunityPageHeader from '../../components/CommunityPageHeader'
import Title from '../../components/Title'
import ContentSection from '../../components/ContentSection'
import WeeklyChallengeCard from '../../components/WeeklyChallengeCard'
import ChallengeDayCard from '../../components/ChallengeDayCard'
import day1Img from '../../img/challenge/challenge_day1.png'
import day2Img from '../../img/challenge/challenge_day2.png'
import day3Img from '../../img/challenge/challenge_day3.png'
import day4Img from '../../img/challenge/challenge_day4.png'
import day5Img from '../../img/challenge/challenge_day5.png'
import day6Img from '../../img/challenge/challenge_day6.png'
import day7Img from '../../img/challenge/challenge_day7.png'
import cheerGroupImg from '../../img/challenge/challenge_cheer_group.png'
import arrowIcon from '../../svg/arrow.svg'
import footprintsIcon from '../../svg/footprints.svg'
import lockIcon from '../../svg/lock.svg'
import pointIcon from '../../svg/point.svg'

// eslint-disable-next-line react-refresh/only-export-components
export const challengeCardItems = [
  { id: 1, title: '가장 크게 밥을 먹는 반려동물은?', participants: 22, deadline: '05.10 마감', image: day1Img, status: 'active' },
  { id: 2, title: '가장 말썽꾸러기 같은 아이는?', participants: 17, deadline: '05.10 마감', image: day2Img, status: 'active' },
  { id: 3, title: '제일 웃는 얼굴이 예쁜 아이는?', participants: 31, deadline: '05.10 마감', image: day3Img, status: 'active' },
  { id: 4, title: '제일 인기 많아 보이는 아이는?', participants: 14, deadline: '05.10 마감', image: day4Img, status: 'active' },
  { id: 5, title: '제일 반갑게 맞아주는 아이는?', participants: 26, deadline: '05.10 마감', image: day5Img, status: 'active' },
  { id: 6, title: '하루 종일 놀아도 즐거운 아이는?', participants: 19, deadline: '05.10 마감', image: day6Img, status: 'complete' },
] as const

type CommunityChallengePreviewProps = {
  onNavigate: () => void
}

export function CommunityChallengePreview({ onNavigate }: CommunityChallengePreviewProps) {
  return (
    <ContentSection
      className="community_overview_section"
      title="챌린지 인증"
      action={
        <button type="button" onClick={onNavigate}>
          바로가기
        </button>
      }
    >
      <div className="community_overview_challenge_grid">
        {challengeCardItems.slice(0, 2).map((item) => (
          <article key={item.id} className="community_challenge_card">
            <img src={item.image} alt={item.title} className="community_challenge_card_image" />
            <div className="community_challenge_card_body">
              <h3>{item.title}</h3>
              <div className="community_challenge_card_meta">
                <span>{item.participants}명</span>
                <span>{item.deadline}</span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </ContentSection>
  )
}

const TOTAL_DAYS = 7
const PARTICIPATED_DAYS_KEY = 'jibsalife.challenge.participatedDays'

function getParticipatedDaysStorageKey() {
  const currentUserId = localStorage.getItem(AUTH_CURRENT_USER_STORAGE_KEY)
  return currentUserId ? `${PARTICIPATED_DAYS_KEY}.${currentUserId}` : PARTICIPATED_DAYS_KEY
}

function readParticipatedDays(): Set<number> {
  try {
    const stored = localStorage.getItem(getParticipatedDaysStorageKey())
    if (!stored) return new Set()
    const parsed = JSON.parse(stored)
    if (Array.isArray(parsed)) return new Set(parsed.filter((n): n is number => typeof n === 'number'))
    return new Set()
  } catch { return new Set() }
}

function saveParticipatedDays(days: Set<number>) {
  localStorage.setItem(getParticipatedDaysStorageKey(), JSON.stringify([...days]))
}

// eslint-disable-next-line react-refresh/only-export-components
export const challengeDays = [
  { day: 1, image: day1Img, description: <>우리 반려동물<br />산책을 기록해주세요</> },
  { day: 2, image: day2Img, description: <>커뮤니티 댓글을<br />3개 이상 남겨주세요</> },
  { day: 3, image: day3Img, description: <>1개 이상<br />투표에 참여해보세요</> },
  { day: 4, image: day4Img, description: <>우리 반려동물<br />건강 리포트를 확인해주세요</> },
  { day: 5, image: day5Img, description: <>반려 지식 글에<br />좋아요를 눌러주세요</> },
  { day: 6, image: day6Img, description: <>우리 반려동물<br />식사량을 기록해주세요</> },
  { day: 7, image: day7Img, description: <>커뮤니티에<br />게시글을 작성해주세요</> },
]

function CommunityChallenge() {
  useSwipeNav('/community/vote', '/community/petstory')
  const navigate = useNavigate()
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const cardRefs = useRef<(HTMLDivElement | null)[]>([])
  const [participatedDays, setParticipatedDays] = useState<Set<number>>(() => readParticipatedDays())
  // 기본 시작일은 계정 종류에 따라 달라진다. 더미 계정은 Day 3, 일반 계정은 Day 1부터 시작한다.
  const [currentDay, setCurrentDay] = useState<number>(() => readCurrentDay())
  const visibleIndexRef = useRef(currentDay)
  const [visibleIndex, setVisibleIndex] = useState(currentDay)
  const [missionDone, setMissionDone] = useState(() => checkChallengeDayDone(currentDay))
  const defaultCompletedDayCutoff = isDemoChallengeAccount() ? 2 : 0

  // 처음 진입하면 현재 챌린지 카드가 가운데 보이도록 이동한다.
  useEffect(() => {
    const card = cardRefs.current[currentDay]
    const container = scrollContainerRef.current
    if (!card || !container) return
    const targetLeft = card.offsetLeft - (container.clientWidth - card.offsetWidth) / 2
    container.scrollTo({ left: targetLeft, behavior: 'instant' })
    visibleIndexRef.current = currentDay
    setVisibleIndex(currentDay)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 스크롤 위치와 가장 가까운 카드를 기준으로 dot 상태를 갱신한다.
  useEffect(() => {
    const el = scrollContainerRef.current
    if (!el) return
    const onScroll = () => {
      const center = el.scrollLeft + el.clientWidth / 2
      let closestIdx = 0
      let minDist = Infinity
      cardRefs.current.forEach((card, i) => {
        if (!card) return
        const dist = Math.abs(card.offsetLeft + card.offsetWidth / 2 - center)
        if (dist < minDist) { minDist = dist; closestIdx = i }
      })
      if (closestIdx !== visibleIndexRef.current) {
        visibleIndexRef.current = closestIdx
        setVisibleIndex(closestIdx)
      }
    }
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [])

  // 데스크톱 마우스 드래그 스크롤을 지원하고, 놓으면 가장 가까운 카드로 스냅한다.
  useEffect(() => {
    const el = scrollContainerRef.current
    if (!el) return
    let startX = 0
    let startScrollLeft = 0
    let dragging = false

    const snapToNearest = () => {
      const center = el.scrollLeft + el.clientWidth / 2
      let closestIdx = 0
      let minDist = Infinity
      cardRefs.current.forEach((card, i) => {
        if (!card) return
        const dist = Math.abs(card.offsetLeft + card.offsetWidth / 2 - center)
        if (dist < minDist) { minDist = dist; closestIdx = i }
      })
      const target = cardRefs.current[closestIdx]
      if (!target) return
      // 부드러운 스크롤이 끝나면 CSS snap을 복원한다. scrollend 미지원 브라우저는 타이머로 보정한다.
      const restore = () => {
        el.style.scrollSnapType = ''
        el.removeEventListener('scrollend', restore)
        clearTimeout(timer)
      }
      el.addEventListener('scrollend', restore, { once: true })
      const timer = window.setTimeout(restore, 500)
      el.scrollTo({ left: target.offsetLeft - (el.clientWidth - target.offsetWidth) / 2, behavior: 'smooth' })
    }

    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return
      dragging = true
      startX = e.clientX
      startScrollLeft = el.scrollLeft
      el.style.scrollSnapType = 'none'
      el.style.cursor = 'grabbing'
    }
    const onPointerMove = (e: PointerEvent) => {
      if (!dragging) return
      el.scrollLeft = startScrollLeft + (startX - e.clientX)
    }
    const onPointerUp = () => {
      if (!dragging) return
      dragging = false
      el.style.cursor = ''
      snapToNearest()
    }

    el.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)
    window.addEventListener('pointercancel', onPointerUp)
    return () => {
      el.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)
      window.removeEventListener('pointercancel', onPointerUp)
    }
  }, [])

  // 보상 계산에 사용할 연속 참여 일수를 계산한다.
  let consecutive = 0
  for (let i = currentDay - 1; i >= 0; i--) {
    if (i < defaultCompletedDayCutoff || participatedDays.has(i)) consecutive++
    else break
  }

  const activeStampCount = defaultCompletedDayCutoff + [...participatedDays].filter(d => d >= defaultCompletedDayCutoff).length

  const hasMissed =
    currentDay > defaultCompletedDayCutoff &&
    Array.from({ length: currentDay - defaultCompletedDayCutoff }, (_, i) => i + defaultCompletedDayCutoff).some((i) => !participatedDays.has(i))

  const rewardTitle = hasMissed ? '집사 챌린지 다시 시작!' : `${activeStampCount}일 연속 성공 중`

  const rewardDesc =
    activeStampCount === 2 ? (
      <>오늘 완료시 보상 <span className="cc_reward_point">+100P</span></>
    ) : activeStampCount === 6 ? (
      <>오늘 완료시 보상 <span className="cc_reward_point">+300P</span></>
    ) : activeStampCount >= 3 && activeStampCount <= 5 ? (
      <>7일 연속 완료시 보상 <span className="cc_reward_point">+300P</span></>
    ) : (
      <>3일 연속 보상에 도전해보세요!</>
    )

  const getStampClass = (i: number) => {
    if (i < defaultCompletedDayCutoff) return 'cc_stamp_active'
    if (participatedDays.has(i)) return 'cc_stamp_active'
    if (i === currentDay) return 'cc_stamp_today'
    return ''
  }

  // currentDay가 바뀔 때마다 해당 일차의 미션 완료 여부를 다시 계산한다.
  useEffect(() => {
    setMissionDone(checkChallengeDayDone(currentDay))
  }, [currentDay])

  // 다른 페이지에서 미션이 완료되면 storage/focus/custom event로 상태를 동기화한다.
  useEffect(() => {
    const refresh = () => setMissionDone(checkChallengeDayDone(currentDay))
    window.addEventListener(CHALLENGE_STATUS_CHANGED_EVENT, refresh)
    window.addEventListener('storage', refresh)
    window.addEventListener('focus', refresh)
    return () => {
      window.removeEventListener(CHALLENGE_STATUS_CHANGED_EVENT, refresh)
      window.removeEventListener('storage', refresh)
      window.removeEventListener('focus', refresh)
    }
  }, [currentDay])

  const handleComplete = () => {
    const completingDay = consecutive + 1
    const points = completingDay === 7 ? 360 : completingDay === 3 ? 160 : 60
    const next = new Set([...participatedDays, currentDay])
    setParticipatedDays(next)
    saveParticipatedDays(next)
    addUserNotification({ title: '챌린지', content: '오늘의 챌린지가 참여되었습니다. 포인트 받아주세요.', path: '/community/challenge' })
    navigate(`/community/challenge/reward?amount=${points}`)
  }

  const handleDayEnd = () => {
    setCurrentDay((prev) => {
      const next = Math.min(prev + 1, TOTAL_DAYS)
      saveCurrentDay(next)
      return next
    })
  }

  return (
    <>
      <CommunityPageHeader />

      <main className="page cc_page">
        <section className="cc_progress_section">
          <strong className="cc_title">7일 챌린지 완주까지 D-{Math.max(1, TOTAL_DAYS - activeStampCount)}</strong>
          <img src={cheerGroupImg} alt="" className="cc_cheer_img" />
          <div className="cc_stamp_row">
            {Array.from({ length: TOTAL_DAYS }).map((_, i) => (
              <div key={i} className="cc_stamp_wrapper">
                <span className={`cc_stamp_item ${getStampClass(i)}`}>
                  <img src={i > currentDay ? lockIcon : footprintsIcon} alt="" className="cc_stamp_icon" />
                </span>
                {i === currentDay && <img src={arrowIcon} alt="" className="cc_stamp_today_arrow" />}
              </div>
            ))}
          </div>
          <div className="cc_reward_card">
            <Title as="h5" title={rewardTitle}>
              <p className="cc_reward_desc">{rewardDesc}</p>
            </Title>
            <img src={pointIcon} alt="" className="cc_point_icon" />
          </div>
        </section>
        <WeeklyChallengeCard
          onComplete={handleComplete}
          onDayEnd={handleDayEnd}
          day={challengeDays[Math.min(currentDay, TOTAL_DAYS - 1)].day}
          imageSrc={challengeDays[Math.min(currentDay, TOTAL_DAYS - 1)].image}
          description={challengeDays[Math.min(currentDay, TOTAL_DAYS - 1)].description}
          missionDone={missionDone}
          completed={participatedDays.has(currentDay)}
        />
        <section className="cc_day_list_section">
          <Title as="h4" title="챌린지 목록">
            <p>Tip! 매일 자정에 새로운 챌린지가 열려요</p>
          </Title>
          <div className="cc_day_scroll_wrapper">
          <div className="cc_day_scroll" ref={scrollContainerRef}>
            {challengeDays.map((item, i) => {
              const status =
                i < defaultCompletedDayCutoff
                  ? 'completed'
                  : participatedDays.has(i)
                    ? 'completed'
                    : i < currentDay
                      ? 'missed'
                      : i === currentDay ? 'current' : 'locked'
              return (
                <ChallengeDayCard
                  key={item.day}
                  ref={(el) => {
                    cardRefs.current[i] = el
                  }}
                  day={item.day}
                  image={item.image}
                  description={item.description}
                  status={status}
                  isCurrent={i === currentDay}
                />
              )
            })}
          </div>
          <div className="cc_day_dots">
            {Array.from({ length: TOTAL_DAYS }).map((_, i) => (
              <span key={i} className={`cc_day_dot${i === visibleIndex ? ' cc_day_dot_active' : ''}`} />
            ))}
          </div>
          </div>
        </section>
      </main>
    </>
  )
}

export default CommunityChallenge
