import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import './Place.css'
import '../health/HealthHospitalRecommend.css'
import PageHeader from '../../components/PageHeader'
import HeaderIcon from '../../components/HeaderIcon'
import HospitalCardList, { type HospitalCardItem } from '../../components/HospitalCardList'
import BackButton from '../../components/html/BackButton'
import Button from '../../components/html/Button'
import { showStateBarMessage } from '../../utils/stateBarMessage'
import { hospitalProfiles, sortHospitalsByStatusAndDistance } from '../health/HealthHospitalData'

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
  statusLabelType: 'hospital',
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
    id: 'pension-lake',
    name: '레이크 펜션숙소',
    image: hospitalProfiles[0]?.image ?? hospitalProfiles[1].image,
    rating: '4.8',
    reviewCount: 61,
    distanceText: '7.4 KM',
    tags: ['호수 뷰', '잔디 마당', '동반 객실'],
    openTime: '15:00',
    closeTime: '22:00',
    category: 'travel',
    subcategory: 'pension',
    createdAt: '2026-05-07T14:20:00',
    popularity: 91,
  },
  {
    id: 'pension-sunset',
    name: '선셋 펜션숙소',
    image: hospitalProfiles[1]?.image ?? hospitalProfiles[0].image,
    rating: '4.6',
    reviewCount: 49,
    distanceText: '9.1 KM',
    tags: ['노을 뷰', '바비큐', '산책로'],
    openTime: '15:00',
    closeTime: '22:00',
    category: 'travel',
    subcategory: 'pension',
    createdAt: '2026-05-06T16:10:00',
    popularity: 85,
  },
  {
    id: 'pension-valley',
    name: '밸리 펜션숙소',
    image: hospitalProfiles[2]?.image ?? hospitalProfiles[0].image,
    rating: '4.5',
    reviewCount: 33,
    distanceText: '11.3 KM',
    tags: ['계곡 근처', '대형 마당', '반려견 샤워'],
    openTime: '14:30',
    closeTime: '21:30',
    category: 'travel',
    subcategory: 'pension',
    createdAt: '2026-05-05T13:00:00',
    popularity: 78,
  },
  {
    id: 'pension-garden',
    name: '가든 펜션숙소',
    image: hospitalProfiles[3]?.image ?? hospitalProfiles[1].image,
    rating: '4.9',
    reviewCount: 74,
    distanceText: '6.8 KM',
    tags: ['정원 포토존', '실내 놀이', '조식 포함'],
    openTime: '15:00',
    closeTime: '22:00',
    category: 'travel',
    subcategory: 'pension',
    createdAt: '2026-05-04T11:45:00',
    popularity: 95,
  },
  {
    id: 'pension-morning',
    name: '모닝 펜션숙소',
    image: hospitalProfiles[4]?.image ?? hospitalProfiles[0].image,
    rating: '4.4',
    reviewCount: 27,
    distanceText: '10.5 KM',
    tags: ['조용한 위치', '소형견 추천', '주차 가능'],
    openTime: '15:00',
    closeTime: '21:00',
    category: 'travel',
    subcategory: 'pension',
    createdAt: '2026-05-03T09:40:00',
    popularity: 72,
  },
  {
    id: 'pension-hill',
    name: '힐사이드 펜션숙소',
    image: hospitalProfiles[0]?.image ?? hospitalProfiles[2].image,
    rating: '4.7',
    reviewCount: 56,
    distanceText: '12.0 KM',
    tags: ['언덕 뷰', '개별 테라스', '동반 침구'],
    openTime: '15:00',
    closeTime: '22:30',
    category: 'travel',
    subcategory: 'pension',
    createdAt: '2026-05-02T17:30:00',
    popularity: 87,
  },
  {
    id: 'pension-cloud',
    name: '클라우드 펜션숙소',
    image: hospitalProfiles[1]?.image ?? hospitalProfiles[3].image,
    rating: '4.8',
    reviewCount: 68,
    distanceText: '8.9 KM',
    tags: ['루프탑', '야외 운동장', '펫 어메니티'],
    openTime: '15:00',
    closeTime: '22:00',
    category: 'travel',
    subcategory: 'pension',
    createdAt: '2026-05-01T12:15:00',
    popularity: 89,
  },
  {
    id: 'pension-river',
    name: '리버 펜션숙소',
    image: hospitalProfiles[2]?.image ?? hospitalProfiles[4].image,
    rating: '4.5',
    reviewCount: 44,
    distanceText: '13.2 KM',
    tags: ['강변 산책', '바비큐', '넓은 객실'],
    openTime: '14:00',
    closeTime: '21:30',
    category: 'travel',
    subcategory: 'pension',
    createdAt: '2026-04-30T15:50:00',
    popularity: 80,
  },
  {
    id: 'pension-wood',
    name: '우드 펜션숙소',
    image: hospitalProfiles[3]?.image ?? hospitalProfiles[2].image,
    rating: '4.6',
    reviewCount: 39,
    distanceText: '9.7 KM',
    tags: ['숲속 숙소', '반려묘 가능', '실내 놀이존'],
    openTime: '15:00',
    closeTime: '22:00',
    category: 'travel',
    subcategory: 'pension',
    createdAt: '2026-04-29T10:10:00',
    popularity: 83,
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

const placeItems: PlaceListItem[] = [
  ...hospitalPlaceItems,
  ...otherPlaceItems.map((item) => ({
    ...item,
    statusLabelType: 'business' as const,
  })),
]

const placeCategorySections: Array<{
  id: Exclude<PlaceCategory, 'all'>
  title: string
}> = [
  { id: 'care', title: '케어' },
  { id: 'outing', title: '동반외출' },
  { id: 'travel', title: '여행' },
  { id: 'shopping', title: '쇼핑' },
]

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

  const visiblePlaceSections = useMemo(() => {
    const activeSectionIds =
      selectedCategory === 'all'
        ? placeCategorySections.map((section) => section.id)
        : placeCategorySections
            .filter((section) => section.id === selectedCategory)
            .map((section) => section.id)

    return activeSectionIds
      .map((sectionId) => {
        const section = placeCategorySections.find((item) => item.id === sectionId)
        if (!section) return null

        return {
          ...section,
          items: visiblePlaces.filter((item) => item.category === section.id),
        }
      })
      .filter((section): section is { id: Exclude<PlaceCategory, 'all'>; title: string; items: PlaceListItem[] } => {
        if (!section) return false
        return section.items.length > 0
      })
  }, [selectedCategory, visiblePlaces])

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

  const handleMoveToCategory = (category: Exclude<PlaceCategory, 'all'>) => {
    navigate(`/place?category=${category}&sub=all&sort=${selectedSort}`)
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
        {visiblePlaceSections.length > 0 ? (
          <div className="place_sections">
            {visiblePlaceSections.map((section) => (
              <section key={section.id} className="place_section">
                <div className="place_section_header">
                  <h2>{section.title}</h2>
                  {selectedCategory === 'all' ? (
                    <button
                      type="button"
                      className="place_section_more"
                      onClick={() => handleMoveToCategory(section.id)}
                    >
                      더보기 &gt;
                    </button>
                  ) : null}
                </div>
                <HospitalCardList
                  items={selectedCategory === 'all' ? section.items.slice(0, 2) : section.items}
                  likedNames={likedNames}
                  onToggleLike={toggleLike}
                  onSelect={handleSelectPlace}
                />
              </section>
            ))}
          </div>
        ) : (
          <div className="place_empty_state">아직 등록된 장소가 없어요.</div>
        )}
      </main>
    </>
  )
}

export default Place
