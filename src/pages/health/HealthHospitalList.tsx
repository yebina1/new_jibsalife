import { useState } from 'react'
import { useNavigate } from 'react-router'
import './Health.css'
import './HealthHospitalList.css'
import './HealthHospitalRecommend.css'
import PageHeader from '../../components/PageHeader'
import HeaderIcon from '../../components/HeaderIcon'
import ContentSection from '../../components/ContentSection'
import HospitalCardList, { type HospitalCardItem } from '../../components/HospitalCardList'
import BackButton from '../../components/html/BackButton'
import Button from '../../components/html/Button'
import { hospitalSearchItems, sortHospitalsByStatusAndDistance } from './HealthHospitalData'

function HealthHospitalList() {
  const navigate = useNavigate()
  const [favoriteNames, setFavoriteNames] = useState<string[]>([])
  const sortedHospitalItems = sortHospitalsByStatusAndDistance(hospitalSearchItems, (item) => ({
    open: item.open,
    close: item.close,
    distance: item.distanceKm,
  }))
  const hospitalCardItems: HospitalCardItem[] = sortedHospitalItems.map((item) => ({
    name: item.name,
    image: item.image,
    rating: item.rating,
    reviewCount: item.reviewCount,
    distanceText: `${item.distanceKm.toFixed(1)} KM`,
    tags: item.tags,
    openTime: item.open,
    closeTime: item.close,
  }))

  const handleFavoriteToggle = (hospitalName: string) => {
    setFavoriteNames((current) =>
      current.includes(hospitalName)
        ? current.filter((name) => name !== hospitalName)
        : [...current, hospitalName],
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

      <main className="page health_page health_hospital_list_page">
        <ContentSection
          className="health_hospital_list_section"
          title="병원 목록"
          subtitle="내 주변 병원 목록을 한눈에 확인해보세요"
        >
          <HospitalCardList
            items={hospitalCardItems}
            likedNames={favoriteNames}
            onToggleLike={handleFavoriteToggle}
          />
        </ContentSection>
      </main>
    </>
  )
}

export default HealthHospitalList
