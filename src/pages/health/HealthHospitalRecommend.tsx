import { useState } from 'react'
import { useNavigate } from 'react-router'
import { ChevronRight, Star } from 'lucide-react'
import './HealthHospitalRecommend.css'
import PageHeader from '../../components/PageHeader'
import HeaderIcon from '../../components/HeaderIcon'
import BackButton from '../../components/html/BackButton'
import Button from '../../components/html/Button'
import LikeButton from '../../components/LikeButton'
import hospitalImage1 from '../../img/hospital/hospital1.png'
import hospitalImage2 from '../../img/hospital/hospital2.png'
import hospitalImage3 from '../../img/hospital/hospital3.png'
import hospitalImage4 from '../../img/hospital/hospital4.png'
import hospitalImage5 from '../../img/hospital/hospital5.png'
import { sortHospitalsByStatusAndDistance } from './HealthHospitalData'

type Hospital = {
  name: string
  rating: number
  reviews: number
  distance: string
  tags: readonly string[]
  openTime: string
  closeTime: string
}

const hospitals: Hospital[] = [
  {
    name: '24시 행복 동물병원',
    rating: 4.8,
    reviews: 120,
    distance: '1.2 KM',
    tags: ['예방케어', '건강검진', '스케일링'],
    openTime: '09:00',
    closeTime: '21:00',
  },
  {
    name: '우리반려 동물병원',
    rating: 4.5,
    reviews: 680,
    distance: '0.7 KM',
    tags: ['중성화수술', '건강검진', '스케일링'],
    openTime: '10:00',
    closeTime: '19:00',
  },
  {
    name: '사랑 동물병원',
    rating: 4.3,
    reviews: 420,
    distance: '2.1 KM',
    tags: ['슬개골탈구', '강아지친화', '스케일링'],
    openTime: '09:00',
    closeTime: '18:00',
  },
  {
    name: '우리 동물병원',
    rating: 4.6,
    reviews: 198,
    distance: '1.8 KM',
    tags: ['생활케어', '건강검진', '스케일링'],
    openTime: '11:00',
    closeTime: '20:00',
  },
  {
    name: '행복 동물병원',
    rating: 4.4,
    reviews: 310,
    distance: '3.2 KM',
    tags: ['생활케어', '건강검진', '스케일링'],
    openTime: '00:00',
    closeTime: '24:00',
  },
]

const hospitalImages = [
  hospitalImage1,
  hospitalImage2,
  hospitalImage3,
  hospitalImage4,
  hospitalImage5,
]

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

function HealthHospitalRecommend() {
  const navigate = useNavigate()
  const [likedNames, setLikedNames] = useState<string[]>([])
  const sortedHospitals = sortHospitalsByStatusAndDistance(
    hospitals.map((hospital, index) => ({ hospital, image: hospitalImages[index % hospitalImages.length] })),
    ({ hospital }) => ({
      open: hospital.openTime,
      close: hospital.closeTime,
      distance: hospital.distance,
    }),
  )

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
            <Button type="button" aria-label="알림">
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

        <ul className="health_hospital_recommend_list">
          {sortedHospitals.map(({ hospital, image }) => {
            const status = getClinicStatus(hospital.openTime, hospital.closeTime)
            const isLiked = likedNames.includes(hospital.name)

            return (
              <li key={hospital.name} className="health_hospital_recommend_item">
                <div className="health_hospital_recommend_img" aria-hidden="true">
                  <img src={image} alt="" />
                </div>

                <div className="health_hospital_recommend_info">
                  <div className="health_hospital_recommend_text">
                  <div className="health_hospital_recommend_row">
                    <span className="health_hospital_recommend_name">{hospital.name}</span>
                    <LikeButton
                      liked={isLiked}
                      className="health_hospital_recommend_like"
                      aria-label={isLiked ? `${hospital.name} 찜 해제` : `${hospital.name} 찜하기`}
                      onClick={() => toggleLike(hospital.name)}
                    />
                  </div>

                  <div className="health_hospital_recommend_rating">
                    <Star size={16} color="#6D59F8" fill="#6D59F8" aria-hidden="true" />
                    <span>{hospital.rating}</span>
                    <span className="health_hospital_recommend_reviews">({hospital.reviews})</span>
                    <span className="health_hospital_recommend_sep" aria-hidden="true" />
                    <span>{hospital.distance}</span>
                  </div>

                  <div className="health_hospital_recommend_tags">
                    {hospital.tags.map((tag, index) => (
                      <span key={tag} className="health_hospital_recommend_tag_wrap">
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
      </main>
    </>
  )
}

export default HealthHospitalRecommend
