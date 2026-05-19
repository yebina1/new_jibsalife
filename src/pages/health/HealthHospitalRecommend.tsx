import { useState } from 'react'
import { useNavigate } from 'react-router'
import { ChevronRight } from 'lucide-react'
import './HealthHospitalRecommend.css'
import PageHeader from '../../components/PageHeader'
import HeaderIcon from '../../components/HeaderIcon'
import HospitalCardList, { type HospitalCardItem } from '../../components/HospitalCardList'
import BackButton from '../../components/html/BackButton'
import Button from '../../components/html/Button'
import hospitalImage1 from '../../img/hospital/hospital1.png'
import hospitalImage2 from '../../img/hospital/hospital2.png'
import hospitalImage3 from '../../img/hospital/hospital3.png'
import hospitalImage4 from '../../img/hospital/hospital4.png'
import hospitalImage5 from '../../img/hospital/hospital5.png'
import { sortHospitalsByStatusAndDistance } from './HealthHospitalData'

const hospitals: HospitalCardItem[] = [
  {
    name: '24시 행복 동물병원',
    image: hospitalImage1,
    rating: 4.8,
    reviewCount: 120,
    distanceText: '1.2 KM',
    tags: ['예방접종', '건강검진', '야간진료'],
    openTime: '09:00',
    closeTime: '21:00',
  },
  {
    name: '보리 동물병원',
    image: hospitalImage2,
    rating: 4.5,
    reviewCount: 680,
    distanceText: '0.7 KM',
    tags: ['중성화수술', '건강검진', '야간진료'],
    openTime: '10:00',
    closeTime: '19:00',
  },
  {
    name: '사랑 동물병원',
    image: hospitalImage3,
    rating: 4.3,
    reviewCount: 420,
    distanceText: '2.1 KM',
    tags: ['응급진료', '치과진료', '야간진료'],
    openTime: '09:00',
    closeTime: '18:00',
  },
  {
    name: '누리 동물병원',
    image: hospitalImage4,
    rating: 4.6,
    reviewCount: 198,
    distanceText: '1.8 KM',
    tags: ['생활케어', '건강검진', '야간진료'],
    openTime: '11:00',
    closeTime: '20:00',
  },
  {
    name: '행복 동물병원',
    image: hospitalImage5,
    rating: 4.4,
    reviewCount: 310,
    distanceText: '3.2 KM',
    tags: ['생활케어', '건강검진', '야간진료'],
    openTime: '00:00',
    closeTime: '24:00',
  },
]

function HealthHospitalRecommend() {
  const navigate = useNavigate()
  const [likedNames, setLikedNames] = useState<string[]>([])
  const sortedHospitals = sortHospitalsByStatusAndDistance(hospitals, (hospital) => ({
    open: hospital.openTime,
    close: hospital.closeTime,
    distance: hospital.distanceText,
  }))

  const toggleLike = (name: string) => {
    setLikedNames((prev) =>
      prev.includes(name) ? prev.filter((likedName) => likedName !== name) : [...prev, name],
    )
  }

  return (
    <>
      <PageHeader
        title="AI 건강 체크"
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
      <main className="page health_hospital_recommend_page">
        <div className="health_hospital_recommend_header">
          <span className="health_hospital_recommend_title">내 주변 병원 목록</span>
          <button type="button" className="health_hospital_recommend_more">
            더보기
            <ChevronRight size={16} color="#505050" aria-hidden="true" />
          </button>
        </div>

        <HospitalCardList
          items={sortedHospitals}
          likedNames={likedNames}
          onToggleLike={toggleLike}
        />
      </main>
    </>
  )
}

export default HealthHospitalRecommend
