import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import './Place.css'
import './health/HealthHospitalRecommend.css'
import PageHeader from '../components/PageHeader'
import HeaderIcon from '../components/HeaderIcon'
import HospitalCardList, { type HospitalCardItem } from '../components/HospitalCardList'
import BackButton from '../components/html/BackButton'
import Button from '../components/html/Button'
import { showStateBarMessage } from '../utils/stateBarMessage'
import { hospitalProfiles, sortHospitalsByStatusAndDistance } from './health/HealthHospitalData'

type PlaceCategory = 'all' | 'care' | 'outing' | 'travel' | 'shopping'
type PlaceSubcategory =
  | 'all'
  | 'hospital'
  | 'grooming'
  | 'training'
  | 'hotel-care'
  | 'cafe'
  | 'restaurant'
  | 'walk-course'
  | 'pension'
  | 'supplies'
  | 'food'
  | 'clothing'
type PlaceSort = 'popular' | 'latest' | 'distance'

type PlaceListItem = HospitalCardItem & {
  category: Exclude<PlaceCategory, 'all'>
  subcategory: Exclude<PlaceSubcategory, 'all'>
  createdAt: string
  popularity: number
  routePath?: string
}

const hospitalPlaceItems: PlaceListItem[] = hospitalProfiles.map((hospital, index) => ({
  id: hospital.id,
  name: hospital.name,
  image: hospital.image,
  rating: hospital.rating,
  reviewCount: hospital.reviewCount,
  distanceText: `${hospital.distanceKm.toFixed(1)} KM`,
  tags: hospital.tags,
  openTime: hospital.open,
  closeTime: hospital.close,
  category: 'care',
  subcategory: 'hospital',
  createdAt: `2026-05-${String(18 - index).padStart(2, '0')}T10:00:00`,
  popularity: 98 - index * 4,
  routePath: `/health/hospitals/${hospital.id}`,
}))

const otherPlaceItems: PlaceListItem[] = [
  {
    id: 'grooming-bom',
    name: '봄날 펫 미용실',
    image: hospitalProfiles[2]?.image ?? hospitalProfiles[0].image,
    rating: '4.7',
    reviewCount: 58,
    distanceText: '1.4 KM',
    tags: ['소형견 전문', '탄산 스파', '부분 미용'],
    openTime: '10:00',
    closeTime: '20:00',
    category: 'care',
    subcategory: 'grooming',
    createdAt: '2026-05-17T14:00:00',
    popularity: 88,
  },
  {
    id: 'training-manner',
    name: '매너독 훈련소',
    image: hospitalProfiles[3]?.image ?? hospitalProfiles[0].image,
    rating: '4.5',
    reviewCount: 41,
    distanceText: '2.3 KM',
    tags: ['기초 교육', '사회화', '문제행동 교정'],
    openTime: '09:00',
    closeTime: '18:00',
    category: 'care',
    subcategory: 'training',
    createdAt: '2026-05-12T11:00:00',
    popularity: 79,
  },
  {
    id: 'hotel-cozy',
    name: '코지 펫 호텔',
    image: hospitalProfiles[4]?.image ?? hospitalProfiles[0].image,
    rating: '4.9',
    reviewCount: 73,
    distanceText: '3.1 KM',
    tags: ['1:1 돌봄', '산책 포함', '실시간 사진'],
    openTime: '08:00',
    closeTime: '22:00',
    category: 'care',
    subcategory: 'hotel-care',
    createdAt: '2026-05-11T13:30:00',
    popularity: 94,
  },
  {
    id: 'cafe-tail',
    name: '테일하우스 카페',
    image: hospitalProfiles[1]?.image ?? hospitalProfiles[0].image,
    rating: '4.6',
    reviewCount: 132,
    distanceText: '0.9 KM',
    tags: ['실내 동반', '포토존', '펫 메뉴'],
    openTime: '11:00',
    closeTime: '21:00',
    category: 'outing',
    subcategory: 'cafe',
    createdAt: '2026-05-19T08:30:00',
    popularity: 96,
  },
  {
    id: 'restaurant-garden',
    name: '가든 동반 식당',
    image: hospitalProfiles[0]?.image ?? hospitalProfiles[1].image,
    rating: '4.4',
    reviewCount: 64,
    distanceText: '1.6 KM',
    tags: ['테라스석', '대형견 가능', '주차 가능'],
    openTime: '11:30',
    closeTime: '21:30',
    category: 'outing',
    subcategory: 'restaurant',
    createdAt: '2026-05-14T18:00:00',
    popularity: 84,
  },
  {
    id: 'walk-river',
    name: '한강 산책 코스',
    image: hospitalProfiles[2]?.image ?? hospitalProfiles[0].image,
    rating: '4.8',
    reviewCount: 205,
    distanceText: '2.0 KM',
    tags: ['잔디광장', '야간 산책', '포토 스팟'],
    openTime: '00:00',
    closeTime: '24:00',
    category: 'outing',
    subcategory: 'walk-course',
    createdAt: '2026-05-10T07:00:00',
    popularity: 97,
  },
  {
    id: 'pension-forest',
    name: '포레스트 펜션숙소',
    image: hospitalProfiles[3]?.image ?? hospitalProfiles[0].image,
    rating: '4.7',
    reviewCount: 37,
    distanceText: '8.2 KM',
    tags: ['마당 있음', '바비큐', '동반 객실'],
    openTime: '15:00',
    closeTime: '22:00',
    category: 'travel',
    subcategory: 'pension',
    createdAt: '2026-05-08T15:00:00',
    popularity: 82,
  },
  {
    id: 'shop-paw',
    name: '포우 용품샵',
    image: hospitalProfiles[4]?.image ?? hospitalProfiles[0].image,
    rating: '4.5',
    reviewCount: 53,
    distanceText: '1.1 KM',
    tags: ['장난감', '하네스', '리빙 용품'],
    openTime: '10:30',
    closeTime: '20:30',
    category: 'shopping',
    subcategory: 'supplies',
    createdAt: '2026-05-15T12:00:00',
    popularity: 86,
  },
  {
    id: 'food-bowl',
    name: '보울 사료전문점',
    image: hospitalProfiles[1]?.image ?? hospitalProfiles[0].image,
    rating: '4.8',
    reviewCount: 92,
    distanceText: '2.4 KM',
    tags: ['처방식', '샘플 제공', '상담 가능'],
    openTime: '10:00',
    closeTime: '20:00',
    category: 'shopping',
    subcategory: 'food',
    createdAt: '2026-05-13T16:00:00',
    popularity: 90,
  },
  {
    id: 'clothing-buddy',
    name: '버디 의류샵',
    image: hospitalProfiles[0]?.image ?? hospitalProfiles[1].image,
    rating: '4.3',
    reviewCount: 29,
    distanceText: '1.9 KM',
    tags: ['계절 의류', '맞춤 사이즈', '소품'],
    openTime: '11:00',
    closeTime: '20:00',
    category: 'shopping',
    subcategory: 'clothing',
    createdAt: '2026-05-09T17:00:00',
    popularity: 74,
  },
]

const placeItems: PlaceListItem[] = [...hospitalPlaceItems, ...otherPlaceItems]

function parseDistance(distanceText: string) {
  const parsed = Number.parseFloat(distanceText.replace(/[^\d.]/g, ''))
  return Number.isFinite(parsed) ? parsed : Number.POSITIVE_INFINITY
}

function Place() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [likedNames, setLikedNames] = useState<string[]>([])

  const selectedCategory = (searchParams.get('category') ?? 'all') as PlaceCategory
  const selectedSub = (searchParams.get('sub') ?? 'all') as PlaceSubcategory
  const selectedSort = (searchParams.get('sort') ?? 'popular') as PlaceSort

  const visiblePlaces = useMemo(() => {
    let filtered = [...placeItems]

    if (selectedCategory !== 'all') {
      filtered = filtered.filter((item) => item.category === selectedCategory)
    }

    if (selectedSub !== 'all') {
      filtered = filtered.filter((item) => item.subcategory === selectedSub)
    }

    if (selectedSort === 'latest') {
      filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      return filtered
    }

    if (selectedSort === 'distance') {
      return sortHospitalsByStatusAndDistance(filtered, (item) => ({
        open: item.openTime,
        close: item.closeTime,
        distance: item.distanceText,
      }))
    }

    filtered.sort((a, b) => {
      if (b.popularity !== a.popularity) return b.popularity - a.popularity
      return parseDistance(a.distanceText) - parseDistance(b.distanceText)
    })
    return filtered
  }, [selectedCategory, selectedSort, selectedSub])

  const toggleLike = (name: string) => {
    setLikedNames((prev) => {
      const isLiked = prev.includes(name)
      showStateBarMessage(isLiked ? '찜한 장소에서 제거되었어요' : '찜한 장소에 추가되었어요', 3000, {
        placement: 'footer',
      })

      return isLiked ? prev.filter((likedName) => likedName !== name) : [...prev, name]
    })
  }

  const handleSelectPlace = (placeId: string) => {
    const target = placeItems.find((item) => item.id === placeId)
    if (!target) return

    if (target.routePath) {
      navigate(target.routePath)
      return
    }

    showStateBarMessage('상세 페이지는 준비 중이에요', 2500, {
      placement: 'footer',
    })
  }

  return (
    <>
      <PageHeader
        title="내 주변 장소"
        leftContent={<BackButton />}
        rightContent={
          <>
            <Button type="button" aria-label="캘린더" onClick={() => navigate('/mission')}>
              <HeaderIcon type="calendar" />
            </Button>
            <Button type="button" aria-label="알림" onClick={() => navigate('/notification')}>
              <HeaderIcon type="notification" />
            </Button>
          </>
        }
      />

      <main className="page place_page health_hospital_recommend_page">
        {visiblePlaces.length > 0 ? (
          <HospitalCardList
            items={visiblePlaces}
            likedNames={likedNames}
            onToggleLike={toggleLike}
            onSelect={handleSelectPlace}
          />
        ) : (
          <div className="place_empty_state">아직 등록된 장소가 없어요.</div>
        )}
      </main>
    </>
  )
}

export default Place
