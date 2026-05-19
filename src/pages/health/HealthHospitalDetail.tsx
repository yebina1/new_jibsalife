import { MapPin, Phone, Star } from 'lucide-react'
import { Navigate, useNavigate, useParams } from 'react-router'
import './Health.css'
import './HealthHospitalDetail.css'
import PageHeader from '../../components/PageHeader'
import HeaderIcon from '../../components/HeaderIcon'
import ContentSection from '../../components/ContentSection'
import BackButton from '../../components/html/BackButton'
import Button from '../../components/html/Button'
import { findHospitalById, getOperatingState } from './HealthHospitalData'

function HealthHospitalDetail() {
  const navigate = useNavigate()
  const { hospitalId } = useParams()
  const hospital = hospitalId ? findHospitalById(hospitalId) : null

  if (!hospital) {
    return <Navigate to="/health/hospitals/list" replace />
  }

  const operatingState = getOperatingState(hospital.open, hospital.close)

  return (
    <>
      <PageHeader
        title="병원 상세"
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

      <main className="page health_page health_hospital_detail_page">
        <section className="health_hospital_detail_hero">
          <img src={hospital.image} alt={hospital.name} className="health_hospital_detail_image" />
          <div className="health_hospital_detail_intro">
            <div className="health_hospital_detail_title_wrap">
              <h1>{hospital.name}</h1>
              <span className={`health_hospital_detail_hours${operatingState.isOpen ? ' is_open' : ''}`}>
                {operatingState.isOpen ? '진료중' : '진료 마감'} {hospital.open} ~ {hospital.close}
              </span>
            </div>

            <div className="health_hospital_detail_rating">
              <Star size={16} color="#6D59F8" fill="#6D59F8" aria-hidden="true" />
              <span>{hospital.rating}</span>
              <span>({hospital.reviewCount})</span>
              <span className="health_hospital_detail_rating_sep" aria-hidden="true" />
              <span>{hospital.distanceKm.toFixed(1)} KM</span>
            </div>

            <p className="health_hospital_detail_description">{hospital.description}</p>

            <div className="health_hospital_detail_meta">
              <div className="health_hospital_detail_meta_item">
                <MapPin size={16} aria-hidden="true" />
                <span>{hospital.address}</span>
              </div>
              <div className="health_hospital_detail_meta_item">
                <Phone size={16} aria-hidden="true" />
                <a href={`tel:${hospital.phone.replaceAll('-', '')}`}>{hospital.phone}</a>
              </div>
            </div>
          </div>
        </section>

        <ContentSection
          className="health_hospital_detail_section"
          title="진료 항목"
          subtitle="기존 병원 목록과 동일한 톤으로 필요한 정보를 빠르게 확인할 수 있어요."
        >
          <div className="health_hospital_detail_services">
            {hospital.services.map((service) => (
              <span key={`${hospital.id}-${service}`} className="health_hospital_detail_service">
                {service}
              </span>
            ))}
          </div>
        </ContentSection>

        <ContentSection
          className="health_hospital_detail_section"
          title="안내"
          subtitle={hospital.notice}
        >
          <div className="health_hospital_detail_notice_card">
            <strong>방문 전 체크</strong>
            <p>진료 시간과 접수 마감 시간을 한 번 더 확인해 주세요.</p>
            <p>아이 상태 메모를 함께 가져가면 상담이 더 수월해집니다.</p>
          </div>
        </ContentSection>
      </main>
    </>
  )
}

export default HealthHospitalDetail
