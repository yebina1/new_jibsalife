import './Home.css'
import { useEffect, useMemo, useRef, useState, type ChangeEvent, type MouseEvent } from 'react'
import { useLocation, useNavigate } from 'react-router'
import ChevronIcon from '../components/ChevronIcon'
import PageHeader from '../components/PageHeader'
import HeaderIcon from '../components/HeaderIcon'
import ContentSection from '../components/ContentSection'
import HomeSummaryBanner from '../components/HomeSummaryBanner'
import SummaryProfileCard, { SummaryProfileAddCard } from '../components/SummaryProfileCard'
import Button from '../components/html/Button'
import Alert from '../components/Alert'
import ConfirmDialog from '../components/ConfirmDialog'
import ConfettiEffect from '../components/effect/ConfettiEffect'
import { TextType } from '../components/effect/TextType'
import useEmblaCarousel from 'embla-carousel-react'
import { useSwipeNav } from '../hooks/useSwipeNav'
import PointAlertContent from '../components/PointAlertContent'
import RewardHero from '../components/RewardHero'
import RewardPointCard from '../components/RewardPointCard'
import {
  MISSION_ACTIVITY_RECORDS_CHANGE_EVENT,
  readMissionActivityRecords,
} from '../utils/missionActivityRecords'
import {
  MISSION_HISTORY_RECORDS_CHANGE_EVENT,
  readMissionHistoryRecordsWithDefaults,
  toMissionHistoryRecord,
  type MissionHistoryRecord,
} from '../utils/missionHistoryRecords'
import {
  defaultPetProfiles,
  readPetProfiles,
  writePetProfiles,
  writeSelectedPetProfileId,
  type PetProfileSummary,
} from '../utils/petProfiles'
import { voteDetails } from './community/CommunityVoteData'
import { writeVotedCandidate, writeVotedMissionId } from '../utils/communityVoteStatus'
import { isChallengeDayClaimed, markChallengeVoteCompleted, readCurrentDay } from '../utils/challengeStatus'
import { consumeSignupWelcomeReward, readProfilePoints } from '../utils/profilePoints'
import { showStateBarMessage } from '../utils/stateBarMessage'
import { addUserNotification } from '../utils/userNotifications'
import LazyImage from '../components/LazyImage'
import { dailyPosts, knowledgeFeedItems } from './community/CommunityPetStory'
import knowledge1 from '../img/petstory/Knowledge/knowledge1.png'
import knowledge3 from '../img/petstory/Knowledge/knowledge3.png'
import knowledge4 from '../img/petstory/Knowledge/knowledge4.png'
import footImg from '../img/home/foot-img.png'
import animalCardImage from '../img/animal_card.png'
import homeRank1Photo from '../img/home/1st_photo.png'
import homeRank2Photo from '../img/home/2nd_photo.png'
import homeRank3Photo from '../img/home/3rd-photo.png'
import homeRank1Icon from '../img/home/1st-icon.png'
import homeRank2Icon from '../img/home/2nd-icon.png'
import homeRank3Icon from '../img/home/3rd-icon.png'
import lankingIconImg from '../img/home/lanking-icon.png'
import careIconImg from '../img/home/care-icon.png'

type PetIdCardForm = {
  name: string
  birthDate: string
  breed: string
  weight: string
  registrationNumber: string
  sex: string
  neutered: string
}

const emptyPetIdForm: PetIdCardForm = {
  name: '',
  birthDate: '',
  breed: '',
  weight: '',
  registrationNumber: '',
  sex: '',
  neutered: '',
}

const bestPoseVoteItems = voteDetails.find((voteDetail) => voteDetail.id === 'best-pose')?.candidates ?? []
const BEST_POSE_VOTE_ID = 'best-pose'
const VOTE_REWARD_AMOUNT = 60
const TARGET_CURSOR_EFFECT_DURATION_MS = 860


const contentItems = [
  {
    id: 1,
    title: '강아지 산책 안 하면\n생기는 문제점',
    image: knowledge1,
    objectPosition: '61% center',
    chip: '반려상식',
    path: '/community/petstory/knowledge/walkproblems',
  },
  {
    id: 2,
    title: '강아지 발사탕 스프레이\n추천해주세요!',
    image: footImg,
    objectPosition: '64% center',
    chip: '일상',
    path: '/community/petstory/detail/4',
  },
  {
    id: 3,
    title: '강아지에게 절대 주면\n안되는 음식 7가지',
    image: knowledge3,
    objectPosition: '43% center',
    chip: '반려상식',
    path: '/community/petstory/knowledge/forbiddenfoods',
  },
  {
    id: 4,
    title: '봄철 강아지\n알레르기 증상과 관리법',
    image: knowledge4,
    objectPosition: '48% center',
    chip: '반려상식',
    path: '/community/petstory/knowledge/springallergy',
  },
] as const

export const homeCriticalImageSources = [
  homeRank1Photo,
  homeRank2Photo,
  homeRank3Photo,
  homeRank1Icon,
  homeRank2Icon,
  homeRank3Icon,
  lankingIconImg,
  careIconImg,
  ...bestPoseVoteItems.slice(0, 3).map((item) => item.image),
  ...contentItems.slice(0, 2).map((item) => item.image),
] as const

const homeDeferredImageSources = [
  ...bestPoseVoteItems.slice(3).map((item) => item.image),
  ...contentItems.slice(2).map((item) => item.image),
] as const

function getHomePetStoryNavigationState(path: string) {
  if (path.includes('/knowledge/')) {
    const currentItem = knowledgeFeedItems.find((item) => item.path === path)

    return currentItem
      ? {
          item: {
            id: currentItem.id,
            title: currentItem.title,
            image: currentItem.image,
            viewsText: currentItem.viewsText,
            likes: currentItem.likes,
            comments: currentItem.comments,
            createdAt: currentItem.createdAt,
          },
          storyCategory: 'knowledge' as const,
        }
      : { storyCategory: 'knowledge' as const }
  }

  const detailId = Number(path.split('/').pop())
  const currentPost = dailyPosts.find((post) => post.id === detailId)

  return currentPost
    ? {
        post: currentPost,
        storyCategory: 'daily' as const,
      }
    : { storyCategory: 'daily' as const }
}

const preloadedHomeImages = new Set<string>()

function preloadHomeImages(srcs: readonly string[], highPriority = false) {
  if (typeof window === 'undefined') return

  srcs.forEach((src) => {
    if (!src || preloadedHomeImages.has(src)) return
    preloadedHomeImages.add(src)

    const link = document.createElement('link')
    link.rel = 'preload'
    link.as = 'image'
    link.href = src
    if (highPriority) {
      link.setAttribute('fetchpriority', 'high')
    }
    document.head.appendChild(link)

    const image = new Image()
    image.decoding = 'async'
    image.src = src
    image.decode?.().catch(() => {
      // Warming the browser cache is still useful even if decode is skipped.
    })
  })
}

type SummaryStat = {
  label: string
  value: string
}

type ProfileSummarySlide = PetProfileSummary

type AddSummarySlide = {
  id: number
  type: 'add'
}

function getInitialSummarySlideIndex() {
  return 0
}

function getTodayDateKey() {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function getInitialVoteState(): { votedCardId: number | null; hasModified: boolean } {
  try {
    const raw = localStorage.getItem('weekly-vote-state')
    if (!raw) return { votedCardId: null, hasModified: false }
    const parsed = JSON.parse(raw) as { votedCardId?: number; hasModified?: boolean; votedDate?: string }
    if (parsed.votedDate !== getTodayDateKey()) return { votedCardId: null, hasModified: false }
    return {
      votedCardId: parsed.votedCardId ?? null,
      hasModified: parsed.hasModified ?? false,
    }
  } catch {
    return { votedCardId: null, hasModified: false }
  }
}

function readCalendarRecords(petId?: number) {
  return [
    ...readMissionActivityRecords().map(toMissionHistoryRecord),
    ...readMissionHistoryRecordsWithDefaults(petId),
  ]
}

function isMealRecord(record: MissionHistoryRecord) {
  return record.title.includes('식사') || record.color.toLowerCase() === '#ffd1a8'
}

function isPoopRecord(record: MissionHistoryRecord) {
  return record.title.includes('배변') || record.color.toLowerCase() === '#527ca3'
}

function parseWalkMinutes(detail: string) {
  const normalizedDetail = detail.replace(/\s+/g, ' ').trim()
  if (!normalizedDetail.includes('산책')) return 0

  const hourMinuteMatch = normalizedDetail.match(/(\d+)\s*시간\s*(\d+)?\s*분?/)
  if (hourMinuteMatch) {
    return Number(hourMinuteMatch[1]) * 60 + (hourMinuteMatch[2] ? Number(hourMinuteMatch[2]) : 0)
  }

  const minuteMatch = normalizedDetail.match(/(\d+)\s*분/)
  if (minuteMatch) {
    return Number(minuteMatch[1])
  }

  return 0
}

function createSummaryStats(records: MissionHistoryRecord[]): SummaryStat[] {
  const todayDateKey = getTodayDateKey()
  const todayRecords = records.filter((record) => record.date === todayDateKey)
  const mealCount = todayRecords.filter(isMealRecord).length
  const poopCount = todayRecords.filter(isPoopRecord).length
  const walkMinutes = todayRecords.reduce((sum, record) => sum + parseWalkMinutes(record.detail), 0)

  return [
    { label: '식사', value: `${mealCount}회` },
    { label: '배변', value: `${poopCount}회` },
    { label: '산책', value: `${walkMinutes}분` },
  ]
}

function formatTodaySummaryDate() {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')

  return `${year}년 ${month}월 ${day}일`
}

function formatBirthDate(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 8)
  const year = digits.slice(0, 4)
  const month = digits.slice(4, 6)
  const day = digits.slice(6, 8)

  return [year, month, day].filter(Boolean).join('.')
}

function formatWeightValue(value: string) {
  const normalized = value.replace(/[^\d.]/g, '')
  const [integerPart, ...decimalParts] = normalized.split('.')
  const decimalPart = decimalParts.join('').slice(0, 2)

  return decimalParts.length > 0 ? `${integerPart}.${decimalPart}` : integerPart
}

function calculateAgeFromBirthDate(birthDate: string) {
  const match = birthDate.match(/^(\d{4})\.(\d{2})\.(\d{2})$/)

  if (!match) return ''

  const birthYear = Number(match[1])
  const birthMonth = Number(match[2])
  const birthDay = Number(match[3])
  const today = new Date()
  let age = today.getFullYear() - birthYear
  const hasBirthdayPassed =
    today.getMonth() + 1 > birthMonth ||
    (today.getMonth() + 1 === birthMonth && today.getDate() >= birthDay)

  if (!hasBirthdayPassed) {
    age -= 1
  }

  return `${Math.max(age, 0)}살`
}

function createProfileDetails(profile: ProfileSummarySlide) {
  const age = calculateAgeFromBirthDate(profile.birthDate)
  const sexLabel = profile.sex
  const weightLabel = profile.weight ? `${profile.weight} kg` : '-'

  return `나이: ${age || '-'} · 몸무게: ${weightLabel} · 성별: ${sexLabel || '-'}`
}

const rankingCardsData = [
  { rank: 1, photo: homeRank1Photo, icon: homeRank1Icon, photoAlt: '1위 반려동물', iconAlt: '1위', rankClass: 'rank_1' },
  { rank: 2, photo: homeRank2Photo, icon: homeRank2Icon, photoAlt: '2위 반려동물', iconAlt: '2위', rankClass: 'rank_2' },
  { rank: 3, photo: homeRank3Photo, icon: homeRank3Icon, photoAlt: '3위 반려동물', iconAlt: '3위', rankClass: 'rank_3' },
] as const

function getRankingCardPositionClass(cardIdx: number, activeIdx: number) {
  const diff = (cardIdx - activeIdx + 3) % 3
  if (diff === 0) return 'is_center'
  if (diff === 1) return 'is_right'
  return 'is_left'
}

function VoteHeartIcon({ active }: { active: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={active ? 'best_pose_vote_card_heart is_active' : 'best_pose_vote_card_heart'}
    >
      <path d="M12 20.25 4.875 13.125A4.545 4.545 0 0 1 11.303 6.7L12 7.398l.697-.697a4.545 4.545 0 1 1 6.428 6.428Z" />
    </svg>
  )
}

type VoteTargetCursorEffect = {
  id: number
  itemId: number
  x: number
  y: number
}

function Home() {
  const navigate = useNavigate()
  const location = useLocation()
  const [profileSlides, setProfileSlides] = useState<ProfileSummarySlide[]>(readPetProfiles)
  const [summarySlideIndex, setSummarySlideIndex] = useState(getInitialSummarySlideIndex)
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false, align: 'center' })
  const [selectedCardId, setSelectedCardId] = useState<number | null>(
    () => getInitialVoteState().votedCardId,
  )
  const [votedCardId, setVotedCardId] = useState<number | null>(
    () => getInitialVoteState().votedCardId,
  )
  const [hasModified, setHasModified] = useState<boolean>(
    () => getInitialVoteState().hasModified,
  )
  const [rankingIndex, setRankingIndex] = useState(0)
  const [isRankingAutoPlayEnabled, setIsRankingAutoPlayEnabled] = useState(true)
  const [isVoteRewardOpen, setIsVoteRewardOpen] = useState(false)
  const [voteTargetCursorEffects, setVoteTargetCursorEffects] = useState<VoteTargetCursorEffect[]>([])
  const [isSignupWelcomeOpen, setIsSignupWelcomeOpen] = useState(false)
  const [currentPoints, setCurrentPoints] = useState(readProfilePoints)
  const [confirmAction, setConfirmAction] = useState<'profile-edit' | 'profile-delete' | 'vote-edit' | null>(null)
  const [isPetIdModalOpen, setIsPetIdModalOpen] = useState(false)
  const [editingProfileId, setEditingProfileId] = useState<number | null>(null)
  const [petIdPhoto, setPetIdPhoto] = useState<string | null>(null)
  const [petIdForm, setPetIdForm] = useState<PetIdCardForm>(emptyPetIdForm)
  const [calendarRecords, setCalendarRecords] = useState<MissionHistoryRecord[]>(readCalendarRecords)
  const rankingPointerRef = useRef({ startX: 0, startY: 0, isActive: false })
  const rankingResumeTimeoutRef = useRef<number | null>(null)
  const summarySlides = [
    ...profileSlides,
    {
      id: -1,
      type: 'add',
    },
  ] satisfies (ProfileSummarySlide | AddSummarySlide)[]

  const todaySummaryDate = formatTodaySummaryDate()
  const summaryStatsByProfileId = useMemo(() => (
    new Map(
      profileSlides.map((profile) => [profile.id, createSummaryStats(readCalendarRecords(profile.id))]),
    )
  ), [profileSlides, calendarRecords])
  useEffect(() => {
    return () => {
      if (petIdPhoto?.startsWith('blob:')) {
        URL.revokeObjectURL(petIdPhoto)
      }
    }
  }, [petIdPhoto])

  useEffect(() => {
    const syncCalendarRecords = () => {
      setCalendarRecords(readCalendarRecords())
    }

    window.addEventListener(MISSION_ACTIVITY_RECORDS_CHANGE_EVENT, syncCalendarRecords)
    window.addEventListener(MISSION_HISTORY_RECORDS_CHANGE_EVENT, syncCalendarRecords)
    window.addEventListener('storage', syncCalendarRecords)

    return () => {
      window.removeEventListener(MISSION_ACTIVITY_RECORDS_CHANGE_EVENT, syncCalendarRecords)
      window.removeEventListener(MISSION_HISTORY_RECORDS_CHANGE_EVENT, syncCalendarRecords)
      window.removeEventListener('storage', syncCalendarRecords)
    }
  }, [])

  useEffect(() => {
    const reward = consumeSignupWelcomeReward()
    if (!reward) return

    setCurrentPoints(reward.currentPoints)
    setIsSignupWelcomeOpen(true)
  }, [])

  useEffect(() => {
    const handleProfilePointsChange = (event: Event) => {
      const nextPoints = (event as CustomEvent<number>).detail
      setCurrentPoints(typeof nextPoints === 'number' ? nextPoints : readProfilePoints())
    }

    window.addEventListener('profile-points-change', handleProfilePointsChange)
    return () => window.removeEventListener('profile-points-change', handleProfilePointsChange)
  }, [])

  useEffect(() => {
    preloadHomeImages(homeCriticalImageSources, true)

    const deferredTimer = window.setTimeout(() => {
      preloadHomeImages(homeDeferredImageSources)
    }, 250)

    return () => window.clearTimeout(deferredTimer)
  }, [])

  useEffect(() => {
    writePetProfiles(profileSlides)

    const selectedProfile = profileSlides[summarySlideIndex]
    if (selectedProfile) {
      writeSelectedPetProfileId(selectedProfile.id)
    }
  }, [profileSlides, summarySlideIndex])

  useEffect(() => {
    if (!isPetIdModalOpen) return

    const scrollY = window.scrollY
    const previousOverflow = document.body.style.overflow
    const previousHtmlOverflow = document.documentElement.style.overflow
    const previousPosition = document.body.style.position
    const previousTop = document.body.style.top
    const previousWidth = document.body.style.width

    document.documentElement.style.overflow = 'hidden'
    document.body.style.overflow = 'hidden'
    document.body.style.position = 'fixed'
    document.body.style.top = `-${scrollY}px`
    document.body.style.width = '100%'

    return () => {
      document.documentElement.style.overflow = previousHtmlOverflow
      document.body.style.overflow = previousOverflow
      document.body.style.position = previousPosition
      document.body.style.top = previousTop
      document.body.style.width = previousWidth
      window.scrollTo(0, scrollY)
    }
  }, [isPetIdModalOpen])

  useEffect(() => {
    if (!isRankingAutoPlayEnabled) return

    const timer = window.setInterval(() => {
      setRankingIndex((prev) => (prev + 1) % 3)
    }, 2500)

    return () => window.clearInterval(timer)
  }, [isRankingAutoPlayEnabled])

  useEffect(() => {
    return () => {
      if (rankingResumeTimeoutRef.current !== null) {
        window.clearTimeout(rankingResumeTimeoutRef.current)
      }
    }
  }, [])

  useEffect(() => {
    const handleScrollResume = () => {
      if (rankingPointerRef.current.isActive) return
      if (rankingResumeTimeoutRef.current !== null) {
        window.clearTimeout(rankingResumeTimeoutRef.current)
        rankingResumeTimeoutRef.current = null
      }
      setIsRankingAutoPlayEnabled(true)
    }

    window.addEventListener('scroll', handleScrollResume, { passive: true })
    return () => window.removeEventListener('scroll', handleScrollResume)
  }, [])

  useEffect(() => {
    const carousel = document.querySelector('.home_ranking_carousel')

    if (!(carousel instanceof HTMLElement)) return

    const handlePointerDown = (event: PointerEvent) => {
      handleRankingPointerDown(event.clientX, event.clientY)
    }

    const handlePointerUp = (event: PointerEvent) => {
      handleRankingPointerUp(event.clientX, event.clientY)
    }

    const handlePointerCancel = () => {
      handleRankingPointerCancel()
    }

    carousel.addEventListener('pointerdown', handlePointerDown)
    window.addEventListener('pointerup', handlePointerUp)
    window.addEventListener('pointercancel', handlePointerCancel)

    return () => {
      carousel.removeEventListener('pointerdown', handlePointerDown)
      window.removeEventListener('pointerup', handlePointerUp)
      window.removeEventListener('pointercancel', handlePointerCancel)
    }
  }, [])

  useEffect(() => {
    const restoreScrollY = (location.state as { restoreScrollY?: number } | null)?.restoreScrollY

    if (typeof restoreScrollY !== 'number') return

    requestAnimationFrame(() => {
      window.scrollTo({ top: restoreScrollY, behavior: 'auto' })
      navigate(location.pathname, { replace: true, state: null })
    })
  }, [location.pathname, location.state, navigate])

  useSwipeNav('/place', '/community/overview')

  useEffect(() => {
    if (!emblaApi) return
    const onSelect = () => setSummarySlideIndex(emblaApi.selectedScrollSnap())
    emblaApi.on('select', onSelect)
    return () => { emblaApi.off('select', onSelect) }
  }, [emblaApi])

  const scheduleRankingAutoPlayResume = () => {
    if (rankingResumeTimeoutRef.current !== null) {
      window.clearTimeout(rankingResumeTimeoutRef.current)
    }

    rankingResumeTimeoutRef.current = window.setTimeout(() => {
      setIsRankingAutoPlayEnabled(true)
      rankingResumeTimeoutRef.current = null
    }, 2200)
  }

  const handleRankingPointerDown = (clientX: number, clientY: number) => {
    rankingPointerRef.current = {
      startX: clientX,
      startY: clientY,
      isActive: true,
    }

    if (rankingResumeTimeoutRef.current !== null) {
      window.clearTimeout(rankingResumeTimeoutRef.current)
      rankingResumeTimeoutRef.current = null
    }

    setIsRankingAutoPlayEnabled(false)
  }

  const handleRankingPointerUp = (clientX: number, clientY: number) => {
    if (!rankingPointerRef.current.isActive) return

    const deltaX = clientX - rankingPointerRef.current.startX
    const deltaY = clientY - rankingPointerRef.current.startY
    const isHorizontalSwipe = Math.abs(deltaX) > 36 && Math.abs(deltaX) > Math.abs(deltaY)

    if (isHorizontalSwipe) {
      setRankingIndex((prev) => {
        if (deltaX < 0) return (prev + 1) % rankingCardsData.length
        return (prev - 1 + rankingCardsData.length) % rankingCardsData.length
      })
    }

    rankingPointerRef.current.isActive = false
    scheduleRankingAutoPlayResume()
  }

  const handleRankingPointerCancel = () => {
    if (!rankingPointerRef.current.isActive) return
    rankingPointerRef.current.isActive = false
    scheduleRankingAutoPlayResume()
  }

  const handlePetIdInputChange = (field: keyof PetIdCardForm, value: string) => {
    setPetIdForm((prev) => ({
      ...prev,
      [field]:
        field === 'birthDate'
          ? formatBirthDate(value)
          : field === 'weight'
            ? formatWeightValue(value)
            : field === 'registrationNumber'
              ? value.replace(/\D/g, '').slice(0, 15)
            : value,
    }))
  }

  const handlePetIdPhotoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setPetIdPhoto(reader.result)
      }
    }
    reader.readAsDataURL(file)
  }

  const openPetIdModal = (profile?: ProfileSummarySlide) => {
    setEditingProfileId(profile?.id ?? null)
    setPetIdForm({
      ...emptyPetIdForm,
      name: profile?.name ?? '',
      breed: profile?.breed ?? '',
      birthDate: profile?.birthDate ?? '',
      weight: formatWeightValue(profile?.weight ?? ''),
      sex: profile?.sex ?? '',
    })
    setPetIdPhoto((prev) => {
      if (prev?.startsWith('blob:')) {
        URL.revokeObjectURL(prev)
      }
      return profile?.image ?? null
    })
    setIsPetIdModalOpen(true)
  }

  const closePetIdModal = () => {
    setIsPetIdModalOpen(false)
    setEditingProfileId(null)
  }

  const submitPetIdModal = () => {
    if (editingProfileId !== null) {
      setConfirmAction('profile-edit')
      return
    }

    savePetIdProfile()
  }

  const savePetIdProfile = () => {
    if (editingProfileId !== null) {
      setProfileSlides((current) =>
        current.map((profile) =>
          profile.id === editingProfileId
            ? {
                ...profile,
                name: petIdForm.name || profile.name,
                breed: petIdForm.breed || profile.breed,
                birthDate: petIdForm.birthDate,
                weight: petIdForm.weight,
                sex: petIdForm.sex,
                image: petIdPhoto || profile.image,
              }
            : profile,
        ),
      )
      showStateBarMessage('프로필이 수정되었습니다.', 3000)
    } else {
      const nextProfile: ProfileSummarySlide = {
        id: Date.now(),
        type: 'profile',
        name: petIdForm.name || '이름',
        breed: petIdForm.breed || '품종',
        image: petIdPhoto || defaultPetProfiles[1].image,
        birthDate: petIdForm.birthDate,
        weight: petIdForm.weight,
        sex: petIdForm.sex,
      }

      setProfileSlides((current) => {
        const nextProfiles = [...current, nextProfile]
        setSummarySlideIndex(nextProfiles.length - 1)
        return nextProfiles
      })
    }

    closePetIdModal()
  }

  const deletePetIdProfile = () => {
    if (editingProfileId !== null) {
      setConfirmAction('profile-delete')
      return
    }

    closePetIdModal()
  }

  const confirmDeletePetIdProfile = () => {
    if (editingProfileId === null) {
      closePetIdModal()
      return
    }

    setProfileSlides((current) => {
      const deletedProfileIndex = current.findIndex((profile) => profile.id === editingProfileId)
      const nextProfiles = current.filter((profile) => profile.id !== editingProfileId)
      const nextProfileIndex =
        nextProfiles.length > 0 ? Math.min(Math.max(deletedProfileIndex, 0), nextProfiles.length - 1) : 0

      setSummarySlideIndex(nextProfileIndex)
      return nextProfiles
    })
    closePetIdModal()
  }

  const selectBestPoseVote = (id: number) => {
    if (votedCardId !== null && hasModified) return
    setSelectedCardId((prev) => (prev === id ? null : id))
  }

  const spawnVoteTargetCursorEffect = (itemId: number, x: number, y: number) => {
    const effectId = Date.now() + Math.floor(Math.random() * 1000)
    setVoteTargetCursorEffects((prev) => [...prev, { id: effectId, itemId, x, y }])
    window.setTimeout(() => {
      setVoteTargetCursorEffects((prev) => prev.filter((effect) => effect.id !== effectId))
    }, TARGET_CURSOR_EFFECT_DURATION_MS)
  }

  const handleBestPoseVoteSelect = (id: number, event: MouseEvent<HTMLElement>) => {
    if (votedCardId !== null && hasModified) return

    if (selectedCardId !== id) {
      const mediaElement = event.currentTarget.closest('.best_pose_vote_card_media')
      const rect = mediaElement?.getBoundingClientRect() ?? event.currentTarget.getBoundingClientRect()
      spawnVoteTargetCursorEffect(id, rect.width / 2, rect.height / 2)
    }

    selectBestPoseVote(id)
  }

  const openBestPoseVoteReward = () => {
    if (selectedCardId === null) return
    if (votedCardId !== null) {
      setConfirmAction('vote-edit')
      return
    }

    setIsVoteRewardOpen(true)
  }

  const confirmBestPoseVoteEdit = () => {
    if (selectedCardId === null) return
    writeVotedMissionId(BEST_POSE_VOTE_ID)
    writeVotedCandidate(BEST_POSE_VOTE_ID, selectedCardId)
    localStorage.setItem('weekly-vote-state', JSON.stringify({
      votedCardId: selectedCardId,
      hasModified: true,
      votedDate: getTodayDateKey(),
    }))
    setVotedCardId(selectedCardId)
    setHasModified(true)
    showStateBarMessage('투표가 수정되었습니다.', 3000)
  }

  const handleConfirmAction = () => {
    if (confirmAction === 'profile-edit') {
      savePetIdProfile()
    }

    if (confirmAction === 'profile-delete') {
      confirmDeletePetIdProfile()
    }

    if (confirmAction === 'vote-edit') {
      confirmBestPoseVoteEdit()
    }

    setConfirmAction(null)
  }

  const confirmBestPoseVote = () => {
    if (selectedCardId === null) return
    writeVotedMissionId(BEST_POSE_VOTE_ID)
    writeVotedCandidate(BEST_POSE_VOTE_ID, selectedCardId)
    localStorage.setItem('weekly-vote-state', JSON.stringify({
      votedCardId: selectedCardId,
      hasModified: false,
      votedDate: getTodayDateKey(),
    }))
    setVotedCardId(selectedCardId)
    setIsVoteRewardOpen(false)

    const currentDay = readCurrentDay()
    if (markChallengeVoteCompleted() && currentDay === 2 && !isChallengeDayClaimed(currentDay)) {
      addUserNotification({
        title: '챌린지',
        content: '오늘의 챌린지가 참여되었습니다. 포인트 받아주세요.',
        path: '/community/challenge',
      })
      showStateBarMessage('오늘의 챌린지가 참여되었습니다.\n포인트 받아주세요.', 5000, {
        actionLabel: '이동하기',
        onAction: () => navigate('/community/challenge'),
        closeButton: false,
      })
    }
  }

  const handleHealthReportClick = () => {
    const records = readCalendarRecords()
    const uniqueDays = new Set(records.map((r) => r.date)).size

    if (uniqueDays === 0) {
      showStateBarMessage('아직 기록이 없어요', 3000, { placement: 'footer' })
      return
    }
    if (uniqueDays < 7) {
      showStateBarMessage('리포트는 7일 이상 기록 후 확인할 수 있어요', 3000, { placement: 'footer' })
      return
    }
    navigate('/health/result', {
      state: {
        returnTo: '/home',
      },
    })
  }

  const handleVetConsultBannerClick = () => {
    showStateBarMessage('준비 중인 기능이에요, 조금만 기다려 주세요!', 3000, { placement: 'footer' })
  }

  return (
    <>
      <PageHeader
        title="집사인생"
        rightContent={
          <>
            <Button type="button" aria-label="캘린더" onClick={() => navigate('/mission')}>
              <HeaderIcon type="calendar" />
            </Button>
            <Button
              type="button"
              aria-label="알림"
              onClick={() => navigate('/notification')}
            >
              <HeaderIcon type="notification" />
            </Button>
          </>
        }
      />

      <main className="page home_page">
        <ContentSection
          className="home_section home_summary_section"
          headerClassName="home_summary_header"
          title="오늘의 요약"
          subtitle={todaySummaryDate}
        >
          <div className="summary_slider_viewport" aria-label="오늘의 요약 슬라이드" data-no-swipe-nav>
          <div
            ref={emblaRef}
            className="summary_slider"
          >
            <div className="summary_slider_track">
              {summarySlides.map((slide) =>
                slide.type === 'add' ? (
                  <SummaryProfileAddCard
                    key={slide.id}
                    className="home_summary_profile_add_card"
                    onClick={openPetIdModal}
                  />
                ) : (
                  <SummaryProfileCard
                    key={slide.id}
                    image={slide.image}
                    name={slide.name}
                    breed={slide.breed || '-'}
                    details={createProfileDetails(slide)}
                    stats={summaryStatsByProfileId.get(slide.id) ?? createSummaryStats(readCalendarRecords(slide.id))}
                    onEdit={() => openPetIdModal(slide)}
                    onStatEdit={() => navigate('/mission')}
                    onCareGuideClick={handleHealthReportClick}
                  />
                ),
              )}
            </div>

            <div className="summary_slider_dots" aria-label="요약 슬라이드 페이지">
              {summarySlides.map((slide, index) => (
                <button
                  key={slide.id}
                  type="button"
                  className={index === summarySlideIndex ? 'active' : ''}
                  aria-label={`${index + 1}번 요약 보기`}
                  aria-pressed={index === summarySlideIndex}
                  onClick={() => emblaApi?.scrollTo(index)}
                />
              ))}
            </div>
          </div>
          </div>
        </ContentSection>

        <ContentSection
          className="home_section home_weekly_ranking_section"
          title="이번주 주인공은 나야 나!"
          subtitle="지난주 가장 많은 사랑을 받은 아이들을 만나보세요 💜"
        >
          <div className="home_ranking_carousel" aria-label="주간 인기 반려동물 랭킹">
            {rankingCardsData.map((card, i) => (
              <div key={card.rank} className={`home_ranking_card ${card.rankClass} ${getRankingCardPositionClass(i, rankingIndex)}`}>
                <LazyImage
                  src={card.photo}
                  alt={card.photoAlt}
                  className="home_ranking_card_photo"
                  rootStyle={{ height: '100%' }}
                  priority
                />
                <img
                  src={card.icon}
                  alt={card.iconAlt}
                  className="home_ranking_badge_icon"
                  width={57}
                  height={58}
                  loading="eager"
                  fetchPriority="high"
                  decoding="async"
                />
              </div>
            ))}
          </div>

          <div className="home_ranking_banner">
            <img
              src={lankingIconImg}
              alt=""
              aria-hidden="true"
              className="home_ranking_banner_icon"
              loading="eager"
              fetchPriority="high"
              decoding="async"
            />
            <div className="home_ranking_banner_copy">
              <p><TextType text="이번주엔 루루가 제일 인기 많았대!" typingSpeed={90} pauseDuration={2200} /></p>
              <span>(다들 너무 귀여워서 고르기 힘들어요…)</span>
            </div>
          </div>

          <Button
            type="button"
            className="home_ranking_btn"
            onClick={() => navigate('/community/vote/result')}
          >
            전체 랭킹 보기
          </Button>
        </ContentSection>

        <ContentSection
          className="home_section"
          title="사진찍냥? BEST 포즈 투표하개!"
          subtitle="투표 기간에는 결과는 비공개 처리돼요."
        >
          <div className="best_pose_vote_strip" aria-label="오늘의 베스트 포즈 투표 목록">
            {bestPoseVoteItems.map((item, index) => {
              const isLiked = selectedCardId === item.id
              const displayName = item.name

              return (
                <article key={item.id} className="best_pose_vote_card">
                  <div
                    className="best_pose_vote_card_media"
                    onClick={(event) => handleBestPoseVoteSelect(item.id, event)}
                  >
                    <LazyImage
                      src={item.image}
                      alt={`${displayName} 포즈 사진`}
                      objectPosition={item.objectPosition}
                      objectFit="cover"
                      rootStyle={{ height: '100%' }}
                      priority={index < 3}
                    />
                    <span className="best_pose_vote_card_target_effect" aria-hidden="true">
                      {voteTargetCursorEffects
                        .filter((effect) => effect.itemId === item.id)
                        .map((effect) => (
                          <span
                            key={effect.id}
                            className="best_pose_vote_target_cursor"
                            style={{
                              left: `${effect.x}px`,
                              top: `${effect.y}px`,
                            }}
                          >
                            <span className="best_pose_vote_target_cursor_ring best_pose_vote_target_cursor_ring_outer" />
                            <span className="best_pose_vote_target_cursor_ring best_pose_vote_target_cursor_ring_inner" />
                            <span className="best_pose_vote_target_cursor_cross best_pose_vote_target_cursor_cross_h" />
                            <span className="best_pose_vote_target_cursor_cross best_pose_vote_target_cursor_cross_v" />
                          </span>
                        ))}
                    </span>
                    <button
                      type="button"
                      className={`best_pose_vote_card_like${isLiked ? ' is_active' : ''}`}
                      aria-label={`${displayName} 선택`}
                      aria-pressed={isLiked}
                      onClick={(event) => {
                        event.stopPropagation()
                        handleBestPoseVoteSelect(item.id, event)
                      }}
                    >
                      <VoteHeartIcon active={isLiked} />
                    </button>
                  </div>
                  <p className="p_semibold">{displayName}</p>
                </article>
              )
            })}
          </div>

          <Button
            type="button"
            className="home_vote_btn"
            disabled={
              selectedCardId === null ||
              (votedCardId !== null && (selectedCardId === votedCardId || hasModified))
            }
            onClick={openBestPoseVoteReward}
          >
            {votedCardId !== null ? '수정하기' : '투표하기'}
          </Button>
        </ContentSection>

        <HomeSummaryBanner
          text={`궁금한 점이 있다면\n수의사와 상담해 보세요.`}
          imageSrc={careIconImg}
          imagePriority
          backgroundColor="#EDE9FE"
          ariaLabel="수의사 상담 배너"
          rotateImage={false}
          imageWidth={81}
          imageHeight={65}
          imageTop={5}
          imageRight={50}
          onClick={handleVetConsultBannerClick}
        />

        <ContentSection className="home_section home_content_section" title="펫스토리">
          <div className="content_grid">
            {contentItems.map((item) => (
              <button
                key={item.id}
                type="button"
                className="content_card"
                onClick={() =>
                  navigate(item.path, {
                    state: {
                      ...getHomePetStoryNavigationState(item.path),
                      previousPage: 'home',
                      restoreScrollY: window.scrollY,
                    },
                  })
                }
              >
                <LazyImage
                  src={item.image}
                  alt={item.title}
                  objectPosition={item.objectPosition}
                  objectFit="cover"
                  priority={item.id <= 2}
                />
                <span className={`content_card_chip ${
                  item.path.includes('/knowledge/') ? 'content_card_chip--knowledge' : 'content_card_chip--daily'
                }`}>
                  {item.chip}
                </span>
                <div className="content_overlay">
                  <p className="p_semibold">{item.title}</p>
                </div>
              </button>
            ))}
          </div>

          <Button
            type="button"
            className="home_more_btn"
            onClick={() => navigate('/community/petstory')}
          >
            더보기
            <ChevronIcon direction="right" size="md" />
          </Button>
        </ContentSection>

        {isPetIdModalOpen ? (
          <Alert onClose={closePetIdModal}>
            <div
              className="pet_id_modal_alert_content"
              role="document"
              aria-label={editingProfileId !== null ? '반려동물 프로필 수정하기' : '반려동물 프로필 등록하기'}
            >
              <div className="pet_id_modal_header">
                <h2>{editingProfileId !== null ? '반려동물 프로필 수정하기' : '반려동물 프로필 등록하기'}</h2>
                <button type="button" aria-label="닫기" onClick={closePetIdModal}>
                  ×
                </button>
              </div>

              <div className="pet_id_modal_body">
                <div
                  className="pet_id_card_preview"
                  style={{ backgroundImage: `url(${animalCardImage})` }}
                >
                  <div className="pet_id_card_title">동물등록증</div>
                  <input
                    id="pet-id-photo-upload"
                    className="pet_id_card_photo_input"
                    type="file"
                    accept="image/*"
                    onChange={handlePetIdPhotoChange}
                  />
                  <label
                    className={`pet_id_card_photo_upload${petIdPhoto ? ' has_photo' : ''}`}
                    htmlFor="pet-id-photo-upload"
                  >
                    {petIdPhoto ? (
                      <img
                        className="pet_id_card_photo"
                        src={petIdPhoto}
                        alt={petIdForm.name || '업로드한 반려동물 사진'}
                      />
                    ) : (
                      <span className="pet_id_card_photo_placeholder">
                        <strong>사진 업로드</strong>
                        <span>
                          클릭해서
                          <br />
                          이미지를
                          <br />
                          추가하세요
                        </span>
                      </span>
                    )}
                  </label>
                  <div className="pet_id_card_copy">
                    <div className="pet_id_card_field">
                      <span>이름 :</span>
                      <input
                        value={petIdForm.name}
                        onChange={(event) => handlePetIdInputChange('name', event.target.value)}
                        placeholder="이름"
                      />
                    </div>
                    <div className="pet_id_card_field_row">
                      <div className="pet_id_card_field">
                        <span>생년월일 :</span>
                        <input
                          value={petIdForm.birthDate}
                          onChange={(event) => handlePetIdInputChange('birthDate', event.target.value)}
                          placeholder="0000.00.00"
                          inputMode="numeric"
                          maxLength={10}
                        />
                      </div>
                      <div className="pet_id_card_field pet_id_card_weight_field">
                        <span>몸무게 :</span>
                        <div className={`pet_id_card_weight_input${petIdForm.weight ? '' : ' is_empty'}`}>
                          <input
                            value={petIdForm.weight}
                            onChange={(event) => handlePetIdInputChange('weight', event.target.value)}
                            placeholder="0"
                            inputMode="decimal"
                            style={{ width: `${Math.max(petIdForm.weight.length || 1, 1)}ch` }}
                          />
                          <span>kg</span>
                        </div>
                      </div>
                    </div>
                    <div className="pet_id_card_field">
                      <span>품종 :</span>
                      <input
                        value={petIdForm.breed}
                        onChange={(event) => handlePetIdInputChange('breed', event.target.value)}
                        placeholder="품종"
                      />
                    </div>
                    <div className="pet_id_card_field">
                      <span>등록번호 :</span>
                      <input
                        value={petIdForm.registrationNumber}
                        onChange={(event) =>
                          handlePetIdInputChange('registrationNumber', event.target.value)
                        }
                        placeholder="등록번호"
                        inputMode="numeric"
                        maxLength={15}
                      />
                    </div>
                    <div className="pet_id_card_field">
                      <span>성별 :</span>
                      <div className="pet_id_card_radio_group" role="radiogroup" aria-label="성별">
                        {['남', '여'].map((option) => (
                          <label key={option} className="pet_id_card_radio">
                            <input
                              type="radio"
                              name="pet-id-sex"
                              value={option}
                              checked={petIdForm.sex === option}
                              onChange={(event) => handlePetIdInputChange('sex', event.target.value)}
                            />
                            <span>{option}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div className="pet_id_card_field">
                      <span>중성화 여부 :</span>
                      <div className="pet_id_card_radio_group" role="radiogroup" aria-label="중성화 여부">
                        {['O', 'X'].map((option) => (
                          <label key={option} className="pet_id_card_radio">
                            <input
                              type="radio"
                              name="pet-id-neutered"
                              value={option}
                              checked={petIdForm.neutered === option}
                              onChange={(event) => handlePetIdInputChange('neutered', event.target.value)}
                            />
                            <span>{option}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <form
                  className="pet_id_form"
                  onSubmit={(event) => {
                    event.preventDefault()
                    submitPetIdModal()
                  }}
                >
                  <div className="pet_id_form_actions">
                    <Button
                      type="button"
                      className="white_btn pet_id_form_cancel"
                      onClick={editingProfileId !== null ? deletePetIdProfile : closePetIdModal}
                    >
                      {editingProfileId !== null ? '삭제하기' : '이전'}
                    </Button>
                    <Button type="submit" className="purple_btn pet_id_form_submit">
                      확인
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </Alert>
        ) : null}

        {isVoteRewardOpen ? (
          <Alert onClose={() => setIsVoteRewardOpen(false)}>
            <ConfettiEffect contained />
            <div className="cvd_reward_alert">
              <RewardHero rewardAmount={VOTE_REWARD_AMOUNT} />
              <RewardPointCard
                currentPoints={currentPoints}
                rewardAmount={VOTE_REWARD_AMOUNT}
                onClick={() => {}}
              />
              <Button
                type="button"
                className="purple_btn cvd_reward_confirm"
                onClick={confirmBestPoseVote}
              >
                확인
              </Button>
            </div>
          </Alert>
        ) : null}

        {isSignupWelcomeOpen ? (
          <Alert onClose={() => setIsSignupWelcomeOpen(false)}>
            <PointAlertContent
              currentPoints={currentPoints}
              rewardAmount={1000}
              onRewardCardClick={() => navigate('/mypage')}
              onConfirm={() => setIsSignupWelcomeOpen(false)}
              heroTitle={'\u{1F389} 가입을 환영해요!'} 
              heroSubtitle={
                <>
                  <span>1,000 포인트</span> 지급됐어요.
                </>
              }
              messageBody={
                '매일 건강을 기록하면\n이상 신호 감지와 건강 리포트를 받을 수 있어요.\n프로필에서 반려동물 정보를 추가 입력해보세요!'
              }
            />
          </Alert>
        ) : null}

        {confirmAction ? (
          <ConfirmDialog
            message={
              confirmAction === 'profile-delete'
                ? '삭제하시겠습니까?'
                : confirmAction === 'vote-edit'
                  ? '투표를 수정할까요?'
                  : '수정하시겠습니까?'
            }
            description={
              confirmAction === 'vote-edit' ? (
                <>
                  투표는 기간 내 1회만 수정할 수 있어요.
                  <br />
                  정말 수정하시겠어요?
                </>
              ) : undefined
            }
            cancelLabel={confirmAction === 'vote-edit' ? '취소' : '아니요'}
            confirmLabel={confirmAction === 'vote-edit' ? '수정하기' : '네'}
            accentColor={confirmAction === 'vote-edit' ? '#FF88C5' : undefined}
            cancelButtonStyle={
              confirmAction === 'vote-edit'
                ? { backgroundColor: '#D9D9D9', border: 'none', color: '#111111' }
                : undefined
            }
            dialogClassName={confirmAction === 'vote-edit' ? 'confirm_dialog_vote_edit' : undefined}
            onCancel={() => setConfirmAction(null)}
            onConfirm={handleConfirmAction}
          />
        ) : null}
      </main>
    </>
  )
}

export default Home
