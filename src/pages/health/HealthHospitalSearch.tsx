import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import './Health.css'
import './HealthHospitalSearch.css'
import PageHeader from '../../components/PageHeader'
import HeaderIcon from '../../components/HeaderIcon'
import ChevronIcon from '../../components/ChevronIcon'
import ContentSection from '../../components/ContentSection'
import BackButton from '../../components/html/BackButton'
import Button from '../../components/html/Button'
import LikeButton from '../../components/LikeButton'
import calendarIcon from '../../svg/calendar.svg'
import hospital3d from '../../img/hospital_3d.png'
import message3d from '../../img/message_3d.png'
import { getOperatingState, hospitalSearchItems, sortHospitalsByStatusAndDistance } from './HealthHospitalData'

type ServiceCard = {
  title: string
  description: string
  image: string
  to: string
}

const serviceCards: ServiceCard[] = [
  {
    title: '병원 찾기',
    description: '내 주변 병원 검색\n및 정보 확인',
    image: hospital3d,
    to: '/health/hospitals/list',
  },
  {
    title: '수의사 상담',
    description: '실시간 상담으로\n전문가와 대화',
    image: message3d,
    to: '/health/vet-chat',
  },
]

function HealthHospitalSearch() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [favoriteNames, setFavoriteNames] = useState<string[]>([])
  const isPlaceFlow = pathname.startsWith('/place/')
  const hospitalListPath = isPlaceFlow ? '/place/hospitals/list' : '/health/hospitals/list'
  const hospitalDetailBasePath = isPlaceFlow ? '/place/hospitals' : '/health/hospitals'
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

      <main className="page health_page health_hospital_search_page">
        <ContentSection className="health_hospital_search_services" title="어떤 서비스를 원하시나요?">
          <div className="health_hospital_search_service_grid">
            {serviceCards.map((item) => (
              <Link
                key={item.title}
                className="health_hospital_search_service_card"
                to={item.to === '/health/hospitals/list' ? hospitalListPath : item.to}
              >
                <img src={item.image} alt={`${item.title} 이미지`} aria-hidden="true" />
                <strong>{item.title}</strong>
                <p>{item.description}</p>
              </Link>
            ))}
          </div>
        </ContentSection>

        <ContentSection
          className="health_hospital_search_nearby"
          title="내 주변 병원 목록"
          action={
            <Link className="content_section_text_action" to={hospitalListPath}>
              더보기
              <ChevronIcon direction="right" size="md" />
            </Link>
          }
        >
          <ul className="health_hospital_search_list">
            {sortedHospitalItems.map((item) => {
              const operatingState = getOperatingState(item.open, item.close)
              const isFavorite = favoriteNames.includes(item.name)

              return (
                <li key={item.id}>
                  <button
                    type="button"
                    className="health_hospital_search_item"
                    onClick={() => navigate(`${hospitalDetailBasePath}/${item.id}`)}
                  >
                    <img src={item.image} alt={`${item.name} 이미지`} aria-hidden="true" />
                    <div className="health_hospital_search_item_body">
                      <div className="health_hospital_search_item_top">
                        <strong>{item.name}</strong>
                      </div>

                      <p className="health_hospital_search_rating">
                        <i className="bx bxs-star" aria-hidden="true"></i>
                        {item.rating} ({item.reviewCount})
                        <span>{item.distanceKm.toFixed(1)} KM</span>
                      </p>

                      <p className="health_hospital_search_tags">{item.tags.join(' · ')}</p>

                      <span
                        className={`health_hospital_search_hours ${operatingState.isOpen ? 'is_open' : ''}`}
                      >
                        {operatingState.isOpen ? '진료중' : '진료 마감'} {item.open} ~ {item.close}
                      </span>
                    </div>

                    <LikeButton
                      type="button"
                      liked={isFavorite}
                      className="health_hospital_search_favorite"
                      aria-label={isFavorite ? `${item.name} 찜 해제` : `${item.name} 찜`}
                      onClick={(event) => {
                        event.stopPropagation()
                        handleFavoriteToggle(item.name)
                      }}
                    />
                  </button>
                </li>
              )
            })}
          </ul>
        </ContentSection>
      </main>
    </>
  )
}

export default HealthHospitalSearch
