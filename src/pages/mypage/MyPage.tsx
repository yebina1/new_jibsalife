import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import './MyPage.css'
import PageHeader from '../../components/PageHeader'
import HeaderIcon from '../../components/HeaderIcon'
import ChevronIcon from '../../components/ChevronIcon'
import ContentSection from '../../components/ContentSection'
import SummaryProfileCard from '../../components/SummaryProfileCard'
import BackButton from '../../components/html/BackButton'
import Button from '../../components/html/Button'
import { readProfilePoints } from '../../utils/profilePoints'
import {
  MY_PROFILE_CHANGE_EVENT,
  readMyProfileImage,
  readMyProfileName,
} from '../../utils/myProfile'
import { isCurrentDemoUser } from '../../utils/userScopedStorage'
import {
  COMMUNITY_CREATED_POSTS_CHANGE_EVENT,
  readCommunityCreatedPosts,
} from '../../utils/communityCreatedPosts'
import dogBadgeImage from '../../img/badge/dogbadge2.png'
const activityItems = [
  { label: '활동 내역', icon: 'activity' },
  { label: '저장한 장소', icon: 'pin' },
  { label: '저장한 게시글', icon: 'bookmark' },
  { label: '미션 수행 내역', icon: 'paw' },
  { label: '뱃지 획득 내역', icon: 'badge' },
  { label: '구독 관리', icon: 'diamond' },
] as const

const supportItems = [
  { label: '공지사항', icon: 'megaphone' },
  { label: '고객센터', icon: 'headset' },
  { label: '자주 묻는 질문(FAQ)', icon: 'help' },
  { label: '앱 설정', icon: 'gear' },
] as const

const myProfileStatTemplate = [
  { label: '게시글' },
  { label: '댓글', value: '23' },
  { label: '뱃지', value: '8' },
  { label: '쿠폰', value: '1장' },
] as const

const clickableMyProfileStatLabels = ['게시글'] as const
const disabledMyProfileStatLabels = ['댓글', '뱃지', '쿠폰'] as const

const LOCATION_STORAGE_KEY = 'mypage-location'
const DEFAULT_LOCATION_MESSAGE = '위치 정보를 등록하고\n맞춤 서비스를 받아 보세요.'

type SavedLocation = {
  latitude: number
  longitude: number
  savedAt: string
  address?: string
}

function formatCoordinateLocation(latitude: number, longitude: number) {
  return `현재 위치 ${latitude.toFixed(5)}, ${longitude.toFixed(5)}`
}

function formatAddressLocation(address: string) {
  return `현재 위치 ${address}`
}

function pickAddressPart(...values: Array<string | undefined>) {
  return values.find((value) => typeof value === 'string' && value.trim().length > 0)?.trim()
}

function readCreatedPostCount() {
  return readCommunityCreatedPosts().length
}

async function reverseGeocodeLocation(latitude: number, longitude: number) {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&accept-language=ko`,
    {
      headers: {
        Accept: 'application/json',
      },
    },
  )

  if (!response.ok) {
    throw new Error('Failed to reverse geocode location')
  }

  const data = (await response.json()) as {
    address?: {
      city?: string
      province?: string
      state?: string
      borough?: string
      suburb?: string
      town?: string
      village?: string
      county?: string
      city_district?: string
      quarter?: string
      neighbourhood?: string
    }
  }

  const city = pickAddressPart(
    data.address?.city,
    data.address?.town,
    data.address?.village,
    data.address?.county,
    data.address?.state,
    data.address?.province,
  )
  const district = pickAddressPart(data.address?.borough, data.address?.city_district, data.address?.suburb)
  const dong = pickAddressPart(data.address?.quarter, data.address?.neighbourhood)
  const formattedAddress = [city, district, dong].filter(Boolean).join(' ')

  return formattedAddress || null
}

function MyPageIcon({ type }: { type: string }) {
  if (type === 'activity') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M3 12h4l2-6 4 12 2-6h6" />
      </svg>
    )
  }

  if (type === 'pin') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 21c-3.4-3.6-7-7.2-7-11.5A7 7 0 1 1 19 9.5C19 13.8 15.4 17.4 12 21Z" />
        <circle cx="12" cy="9.5" r="2.5" />
      </svg>
    )
  }

  if (type === 'bookmark') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M6 4h12v17l-6-4-6 4Z" />
      </svg>
    )
  }

  if (type === 'paw') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="6.8" cy="8.2" r="1.8" />
        <circle cx="11.2" cy="6.2" r="1.8" />
        <circle cx="15.8" cy="8.2" r="1.8" />
        <circle cx="18.4" cy="12.2" r="1.8" />
        <path d="M7.8 15.3c.8-2.5 2.4-4 4.3-4s3.4 1.5 4.2 4c.5 1.7-.8 3.1-2.4 2.5-.8-.3-1.2-.7-1.8-.7s-1 .4-1.8.7c-1.6.6-3-.8-2.5-2.5Z" />
      </svg>
    )
  }

  if (type === 'badge') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="9" r="5.5" />
        <path d="M8.5 14 7 21l5-2.5L17 21l-1.5-7" />
      </svg>
    )
  }

  if (type === 'diamond') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M6 3h12l4 6-10 12L2 9Z" />
        <path d="M2 9h20M6 3l6 15M18 3l-6 15M9 3l3 6 3-6" />
      </svg>
    )
  }

  if (type === 'megaphone') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 13h4l9 4V7l-9 4H4Z" />
        <path d="M8 13v5M19 10a4 4 0 0 1 0 4" />
      </svg>
    )
  }

  if (type === 'headset') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 13a8 8 0 0 1 16 0v4a3 3 0 0 1-3 3h-3" />
        <path d="M6 13h3v5H6a2 2 0 0 1-2-2v-1a2 2 0 0 1 2-2ZM18 13h-3v5h3a2 2 0 0 0 2-2v-1a2 2 0 0 0-2-2Z" />
      </svg>
    )
  }

  if (type === 'help') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="8" />
        <path d="M9.8 9.4a2.3 2.3 0 0 1 4.4 1c0 1.8-2.2 2-2.2 3.6M12 17h.1" />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 8a4 4 0 1 1 0 8 4 4 0 0 1 0-8Z" />
      <path d="m19.4 13 .1-1-.1-1 2-1.6-2-3.4-2.4 1a7.8 7.8 0 0 0-1.7-1l-.4-2.6h-4l-.4 2.6a7.8 7.8 0 0 0-1.7 1l-2.4-1-2 3.4 2 1.6-.1 1 .1 1-2 1.6 2 3.4 2.4-1a7.8 7.8 0 0 0 1.7 1l.4 2.6h4l.4-2.6a7.8 7.8 0 0 0 1.7-1l2.4 1 2-3.4Z" />
    </svg>
  )
}

function MyPage() {
  const navigate = useNavigate()
  const isDemoUser = isCurrentDemoUser()
  const [savedLocation, setSavedLocation] = useState<SavedLocation | null>(null)
  const [locationMessage, setLocationMessage] = useState(DEFAULT_LOCATION_MESSAGE)
  const [isLocating, setIsLocating] = useState(false)
  const [profilePoints, setProfilePoints] = useState(() => readProfilePoints())
  const [profileName, setProfileName] = useState(() => readMyProfileName())
  const [profileImage, setProfileImage] = useState(() => readMyProfileImage())
  const [createdPostCount, setCreatedPostCount] = useState(readCreatedPostCount)

  useEffect(() => {
    const savedValue = window.localStorage.getItem(LOCATION_STORAGE_KEY)

    if (!savedValue) return

    try {
      const parsedValue = JSON.parse(savedValue) as SavedLocation
      setSavedLocation(parsedValue)
      setLocationMessage(
        parsedValue.address
          ? formatAddressLocation(parsedValue.address)
          : formatCoordinateLocation(parsedValue.latitude, parsedValue.longitude),
      )
    } catch {
      window.localStorage.removeItem(LOCATION_STORAGE_KEY)
    }
  }, [])

  useEffect(() => {
    const handleProfilePointsChange = () => {
      setProfilePoints(readProfilePoints())
    }

    window.addEventListener('profile-points-change', handleProfilePointsChange)
    window.addEventListener('storage', handleProfilePointsChange)

    return () => {
      window.removeEventListener('profile-points-change', handleProfilePointsChange)
      window.removeEventListener('storage', handleProfilePointsChange)
    }
  }, [])

  useEffect(() => {
    const handleMyProfileChange = () => {
      setProfileName(readMyProfileName())
      setProfileImage(readMyProfileImage())
    }

    window.addEventListener(MY_PROFILE_CHANGE_EVENT, handleMyProfileChange)
    window.addEventListener('storage', handleMyProfileChange)

    return () => {
      window.removeEventListener(MY_PROFILE_CHANGE_EVENT, handleMyProfileChange)
      window.removeEventListener('storage', handleMyProfileChange)
    }
  }, [])

  useEffect(() => {
    const syncCreatedPostCount = () => {
      setCreatedPostCount(readCreatedPostCount())
    }

    window.addEventListener('focus', syncCreatedPostCount)
    window.addEventListener('pageshow', syncCreatedPostCount)
    window.addEventListener('storage', syncCreatedPostCount)
    window.addEventListener(COMMUNITY_CREATED_POSTS_CHANGE_EVENT, syncCreatedPostCount)

    return () => {
      window.removeEventListener('focus', syncCreatedPostCount)
      window.removeEventListener('pageshow', syncCreatedPostCount)
      window.removeEventListener('storage', syncCreatedPostCount)
      window.removeEventListener(COMMUNITY_CREATED_POSTS_CHANGE_EVENT, syncCreatedPostCount)
    }
  }, [])

  const myProfileStats = myProfileStatTemplate.map((stat) => {
    if (stat.label === '게시글') {
      return { label: stat.label, value: String(createdPostCount) }
    }

    if (!isDemoUser) {
      if (stat.label === '쿠폰') {
        return { label: stat.label, value: '0장' }
      }

      return { label: stat.label, value: '0' }
    }

    return stat
  })

  const handleLocationSetting = () => {
    if (!navigator.geolocation) {
      setLocationMessage('이 브라우저에서는 위치 기능을 지원하지 않아요.')
      return
    }

    setIsLocating(true)
    setLocationMessage('GPS로 현재 위치를 확인하고 있어요...')

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const nextLocation: SavedLocation = {
          latitude: coords.latitude,
          longitude: coords.longitude,
          savedAt: new Date().toISOString(),
        }

        reverseGeocodeLocation(nextLocation.latitude, nextLocation.longitude)
          .then((address) => {
            const nextSavedLocation = address ? { ...nextLocation, address } : nextLocation

            window.localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(nextSavedLocation))
            setSavedLocation(nextSavedLocation)
            setLocationMessage(
              address
                ? formatAddressLocation(address)
                : formatCoordinateLocation(nextLocation.latitude, nextLocation.longitude),
            )
          })
          .catch(() => {
            window.localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(nextLocation))
            setSavedLocation(nextLocation)
            setLocationMessage(formatCoordinateLocation(nextLocation.latitude, nextLocation.longitude))
          })
          .finally(() => {
            setIsLocating(false)
          })
      },
      (error) => {
        setLocationMessage(
          error.code === error.PERMISSION_DENIED
            ? '위치 권한이 거부됐어요. 브라우저 권한을 확인해 주세요.'
            : '위치를 가져오지 못했어요. 잠시 후 다시 시도해 주세요.',
        )
        setIsLocating(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
    )
  }

  return (
    <>
      <PageHeader
        title="마이페이지"
        leftContent={<BackButton to="/home" />}
        rightContent={
          <>
            <Button type="button" aria-label="캘린더" onClick={() => navigate('/mission')}>
              <HeaderIcon type="calendar" />
            </Button>
            <Button type="button" aria-label="알림" onClick={() => navigate('/notification')}>
              <HeaderIcon type="notification" />
            </Button>
            <Button type="button" aria-label="설정" className="mypage_header_gear">
              <HeaderIcon type="settings" />
            </Button>
          </>
        }
      />

      <main className="page mypage_page">
        <section className="mypage_location_card">
          <p>
            {locationMessage.split('\n').map((line) => (
              <span key={line}>{line}</span>
            ))}
            {savedLocation ? <small>위치 저장 완료</small> : null}
          </p>
          <button className="s_white_radius_btn" type="button" onClick={handleLocationSetting} disabled={isLocating}>
            {isLocating ? '확인 중...' : '위치설정'}
            <MyPageIcon type="pin" />
          </button>
        </section>

        <section className="mypage_profile_section">
          <div className="mypage_profile_heading">
            <h3>집사 프로필</h3>
            {isDemoUser ? <span className="mypage_subscription_badge">구독중</span> : null}
          </div>

          <div className="mypage_profile_card_wrap">
            <SummaryProfileCard
              image={profileImage}
              imageAlt="프로필 이미지"
              name={profileName}
              breed=""
              details={`포인트: ${profilePoints.toLocaleString()}`}
              careGuideLabel={
                isDemoUser ? (
                  <span className="mypage_profile_badges">
                    <span>보유 뱃지</span>
                    <img src={dogBadgeImage} alt="" aria-hidden="true" />
                  </span>
                ) : undefined
              }
              stats={myProfileStats}
              clickableStatLabels={clickableMyProfileStatLabels}
              disabledStatLabels={disabledMyProfileStatLabels}
              onStatClick={(label) => {
                if (label === '게시글') {
                  navigate('/mypage/posts')
                }
              }}
            />
          </div>
        </section>

        <ContentSection className="mypage_menu_section mypage_activity_section" title="내 활동">
          <ul>
            {activityItems.map((item) => (
              <li key={item.label}>
                <button
                  type="button"
                  className="mypage_menu_button"
                  disabled={item.label !== '구독 관리'}
                  onClick={item.label === '구독 관리' ? () => navigate('/mypage/subscription') : undefined}
                >
                  <span className="mypage_menu_left">
                    {item.label}
                  </span>
                  <ChevronIcon direction="right" size="md" />
                </button>
              </li>
            ))}
          </ul>
        </ContentSection>

        <ContentSection className="mypage_menu_section" title="고객 지원">
          <ul>
            {supportItems.map((item) => (
              <li key={item.label}>
                <button type="button" className="mypage_menu_button" disabled>
                  <span className="mypage_menu_left">
                    {item.label}
                  </span>
                  <ChevronIcon direction="right" size="md" />
                </button>
              </li>
            ))}
          </ul>
        </ContentSection>
      </main>
    </>
  )
}

export default MyPage
