import { useState } from 'react'
import { Star } from 'lucide-react'
import './Health.css'
import './HealthHospitalList.css'
import './HealthHospitalRecommend.css'
import PageHeader from '../../components/PageHeader'
import HeaderIcon from '../../components/HeaderIcon'
import ContentSection from '../../components/ContentSection'
import BackButton from '../../components/html/BackButton'
import Button from '../../components/html/Button'
import LikeButton from '../../components/LikeButton'
import calendarIcon from '../../svg/calendar.svg'
import { hospitalSearchItems, sortHospitalsByStatusAndDistance } from './HealthHospitalData'

function toMinutes(time: string) {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

function getClinicStatus(openTime: string, closeTime: string) {
  const now = new Date()
  const currentMinutes = now.getHours() * 60 + now.getMinutes()
  const openMinutes = toMinutes(openTime)
  const closeMinutes = toMinutes(closeTime)
  const isOpen = currentMinutes >= openMinutes && currentMinutes < closeMinutes

  return {
    isOpen,
    label: isOpen ? '진료 중' : '진료 종료',
    timeText: `${openTime} ~ ${closeTime}`,
    color: isOpen ? '#22C55E' : '#767676',
  }
}

function HealthHospitalList() {
  const [favoriteNames, setFavoriteNames] = useState<string[]>([])
  const sortedHospitalItems = sortHospitalsByStatusAndDistance(hospitalSearchItems, (item) => ({
    open: item.open,
    close: item.close,
    distance: item.distanceKm,
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
            <Button type="button" aria-label="캘린더">
              <img src={calendarIcon} alt="" />
            </Button>
            <Button type="button" aria-label="알림">
              <HeaderIcon type="notification" />
            </Button>
          </>
        }
      />

      <main className="page health_page health_hospital_list_page">
        <ContentSection
          className="health_hospital_list_section"
          title="병원 목록"
          subtitle="내 주변 병원 목록을 한눈에 확인해 보세요."
        >
          <ul className="health_hospital_list">
            {sortedHospitalItems.map((item) => {
              const status = getClinicStatus(item.open, item.close)
              const isFavorite = favoriteNames.includes(item.name)

              return (
                <li key={item.name} className="health_hospital_recommend_item">
                  <div className="health_hospital_recommend_img" aria-hidden="true">
                    <img src={item.image} alt="" />
                  </div>

                  <div className="health_hospital_recommend_info">
                    <div className="health_hospital_recommend_text">
                      <div className="health_hospital_recommend_row">
                        <span className="health_hospital_recommend_name">{item.name}</span>
                        <LikeButton
                          type="button"
                          liked={isFavorite}
                          className="health_hospital_recommend_like"
                          aria-label={isFavorite ? `${item.name} 찜 해제` : `${item.name} 찜`}
                          onClick={() => handleFavoriteToggle(item.name)}
                        />
                      </div>

                      <div className="health_hospital_recommend_rating">
                        <Star size={16} color="#6D59F8" fill="#6D59F8" aria-hidden="true" />
                        <span>{item.rating}</span>
                        <span className="health_hospital_recommend_reviews">({item.reviewCount})</span>
                        <span className="health_hospital_recommend_sep" aria-hidden="true" />
                        <span>{item.distanceKm.toFixed(1)} KM</span>
                      </div>

                      <div className="health_hospital_recommend_tags">
                        {item.tags.map((tag, index) => (
                          <span key={`${item.name}-${tag}`} className="health_hospital_recommend_tag_wrap">
                            {index > 0 && <span className="health_hospital_recommend_dot" aria-hidden="true" />}
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    <span className="health_hospital_recommend_status">
                      <span style={{ color: status.color }}>{status.label}</span>
                      <span style={{ color: '#505050' }}>{status.timeText}</span>
                    </span>
                  </div>
                </li>
              )
            })}
          </ul>
        </ContentSection>
      </main>
    </>
  )
}

export default HealthHospitalList
