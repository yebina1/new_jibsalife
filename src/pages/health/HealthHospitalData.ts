import hospitalPhoto1 from '../../img/hospital/hospital1.png'
import hospitalPhoto2 from '../../img/hospital/hospital2.png'
import hospitalPhoto3 from '../../img/hospital/hospital3.png'
import hospitalPhoto4 from '../../img/hospital/hospital4.png'
import hospitalPhoto5 from '../../img/hospital/hospital5.png'

export type HospitalProfile = {
  id: string
  name: string
  image: string
  rating: string
  reviewCount: number
  distanceKm: number
  tags: string[]
  open: string
  close: string
  address: string
  phone: string
  description: string
  services: string[]
  notice: string
}

export const hospitalProfiles: HospitalProfile[] = [
  {
    id: 'happy-24',
    name: '24시 행복 동물병원',
    image: hospitalPhoto1,
    rating: '4.8',
    reviewCount: 120,
    distanceKm: 1.2,
    tags: ['고양이 특화', '건강검진', '야간진료'],
    open: '00:00',
    close: '24:00',
    address: '서울 강남구 선릉로 214, 1~2층',
    phone: '02-555-2479',
    description: '24시간 응급 진료와 고양이·강아지 케어를 함께 운영하는 동물병원입니다.',
    services: ['24시간 응급진료', '건강검진', '고양이 특화', '야간진료'],
    notice: '주말 오후에는 대기 시간이 많을 수 있어요. 우선 예약을 추천합니다.',
  },
  {
    id: 'paws-care',
    name: 'PAWS&CARE 동물병원',
    image: hospitalPhoto2,
    rating: '4.5',
    reviewCount: 680,
    distanceKm: 0.7,
    tags: ['중성화수술', '건강검진', '야간진료'],
    open: '10:00',
    close: '19:00',
    address: '서울 강남구 강남대로 128, 3층',
    phone: '02-3446-1182',
    description: '수술 전후 안내가 꼼꼼하고 기본 검진 문의가 많은 동물병원입니다.',
    services: ['중성화수술', '기초 검진', '건강검진', '야간진료'],
    notice: '수술 일정이 있는 날은 사전 문의가 가장 정확합니다.',
  },
  {
    id: 'woori-banryeo',
    name: '우리반려 동물병원',
    image: hospitalPhoto3,
    rating: '4.3',
    reviewCount: 420,
    distanceKm: 2.1,
    tags: ['외과응급진료', '강아지치과', '야간진료'],
    open: '09:00',
    close: '18:00',
    address: '서울 동작구 상도로55길 18, 1층',
    phone: '02-812-0303',
    description: '치과와 외과 응급 진료에 강점이 있고, 상담 설명이 자세한 편입니다.',
    services: ['치과진료', '외과응급', '기초 검진', '야간진료'],
    notice: '치과 진료는 정기 예약이 많아 예약 시간 확인을 권장드려요.',
  },
  {
    id: 'sarang',
    name: '사랑 동물병원',
    image: hospitalPhoto4,
    rating: '4.6',
    reviewCount: 198,
    distanceKm: 1.8,
    tags: ['생활케어', '건강검진', '야간클리닉'],
    open: '11:00',
    close: '14:30',
    address: '서울 송파구 방이로 91, 2층',
    phone: '02-420-8575',
    description: '생활 케어와 예방 접종 관련 문의가 많은 친근한 분위기의 동물병원입니다.',
    services: ['생활케어', '예방접종', '건강검진', '야간클리닉'],
    notice: '마감 진료 접수는 14:00까지 진행됩니다.',
  },
  {
    id: 'nuri',
    name: '누리 동물병원',
    image: hospitalPhoto5,
    rating: '4.4',
    reviewCount: 310,
    distanceKm: 3.2,
    tags: ['생활케어', '건강검진', '야간진료'],
    open: '09:30',
    close: '20:30',
    address: '서울 마포구 월드컵로 37, 1층',
    phone: '02-332-9275',
    description: '야간진료와 강아지·고양이 기본 검진 문의가 꾸준한 동물병원입니다.',
    services: ['야간진료', '고양이 특화', '건강검진', '생활케어'],
    notice: '저녁 시간에는 대기 시간이 길어질 수 있어 예약을 추천합니다.',
  },
]

export type HospitalSearchItem = Pick<
  HospitalProfile,
  'id' | 'name' | 'image' | 'rating' | 'reviewCount' | 'distanceKm' | 'tags' | 'open' | 'close'
>

export const hospitalSearchItems: HospitalSearchItem[] = hospitalProfiles.map((item) => ({
  id: item.id,
  name: item.name,
  image: item.image,
  rating: item.rating,
  reviewCount: item.reviewCount,
  distanceKm: item.distanceKm,
  tags: item.tags,
  open: item.open,
  close: item.close,
}))

export function findHospitalById(id: string) {
  return hospitalProfiles.find((hospital) => hospital.id === id) ?? null
}

function toMinutes(value: string) {
  const [hour, minute] = value.split(':').map(Number)
  return hour * 60 + minute
}

export function getOperatingState(open: string, close: string) {
  const now = new Date()
  const currentMinutes = now.getHours() * 60 + now.getMinutes()
  const isOpen = currentMinutes >= toMinutes(open) && currentMinutes < toMinutes(close)

  return { isOpen }
}

function parseDistanceKm(distance: number | string) {
  if (typeof distance === 'number') return distance

  const parsed = parseFloat(distance.replace(/[^\d.]/g, ''))
  return Number.isFinite(parsed) ? parsed : Number.POSITIVE_INFINITY
}

type HospitalSortValues = {
  open: string
  close: string
  distance: number | string
}

export function sortHospitalsByStatusAndDistance<T>(
  items: readonly T[],
  getValues: (item: T) => HospitalSortValues,
) {
  return [...items].sort((a, b) => {
    const aValues = getValues(a)
    const bValues = getValues(b)
    const aIsOpen = getOperatingState(aValues.open, aValues.close).isOpen
    const bIsOpen = getOperatingState(bValues.open, bValues.close).isOpen

    if (aIsOpen !== bIsOpen) return aIsOpen ? -1 : 1

    return parseDistanceKm(aValues.distance) - parseDistanceKm(bValues.distance)
  })
}
