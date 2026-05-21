import { useState } from 'react'
import { useNavigate } from 'react-router'
import { ChevronRight } from 'lucide-react'
import './HealthHospitalRecommend.css'
import PageHeader from '../../components/PageHeader'
import HeaderIcon from '../../components/HeaderIcon'
import HospitalCardList, { type HospitalCardItem } from '../../components/HospitalCardList'
import BackButton from '../../components/html/BackButton'
import Button from '../../components/html/Button'
import { hospitalProfiles, sortHospitalsByStatusAndDistance } from './HealthHospitalData'

function HealthHospitalRecommend() {
  const navigate = useNavigate()
  const [likedNames, setLikedNames] = useState<string[]>([])
  const sortedHospitals: HospitalCardItem[] = sortHospitalsByStatusAndDistance(hospitalProfiles, (hospital) => ({
    open: hospital.open,
    close: hospital.close,
    distance: hospital.distanceKm,
  })).map((hospital) => ({
    id: hospital.id,
    name: hospital.name,
    image: hospital.image,
    rating: hospital.rating,
    reviewCount: hospital.reviewCount,
    distanceText: `${hospital.distanceKm.toFixed(1)} KM`,
    tags: hospital.tags,
    openTime: hospital.open,
    closeTime: hospital.close,
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
          onSelect={(hospitalId) => navigate(`/health/hospitals/${hospitalId}`)}
        />
      </main>
    </>
  )
}

export default HealthHospitalRecommend
