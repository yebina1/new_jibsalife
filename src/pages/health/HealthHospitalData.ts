import hospitalPhoto1 from '../../img/hospital/hospital1.png'
import hospitalPhoto2 from '../../img/hospital/hospital2.png'
import hospitalPhoto3 from '../../img/hospital/hospital3.png'
import hospitalPhoto4 from '../../img/hospital/hospital4.png'

export type HospitalSearchItem = {
  name: string
  image: string
  rating: string
  reviewCount: number
  distanceKm: number
  tags: string[]
  open: string
  close: string
}

export const hospitalSearchItems: HospitalSearchItem[] = [
  {
    name: '24시 행복 동물병원',
    image: hospitalPhoto1,
    rating: '4.8',
    reviewCount: 120,
    distanceKm: 1.2,
    tags: ['고양이친화', '건강검진', '스케일링'],
    open: '00:00',
    close: '24:00',
  },
  {
    name: 'PAWS&CARE 동물병원',
    image: hospitalPhoto2,
    rating: '4.5',
    reviewCount: 680,
    distanceKm: 0.7,
    tags: ['중성화수술', '건강검진', '스케일링'],
    open: '10:00',
    close: '19:00',
  },
  {
    name: '우리반려 동물병원',
    image: hospitalPhoto3,
    rating: '4.3',
    reviewCount: 420,
    distanceKm: 2.1,
    tags: ['외과응급진료', '강아지치과', '스케일링'],
    open: '09:00',
    close: '18:00',
  },
  {
    name: '사랑 동물병원',
    image: hospitalPhoto4,
    rating: '4.6',
    reviewCount: 198,
    distanceKm: 1.8,
    tags: ['생활케어', '건강검진', '스케일링'],
    open: '11:00',
    close: '14:30',
  },
]

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
