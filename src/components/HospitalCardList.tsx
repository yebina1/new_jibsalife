import { Star } from 'lucide-react'
import LikeButton from './LikeButton'

export type HospitalCardItem = {
  id: string
  name: string
  image: string
  rating: number | string
  reviewCount: number
  distanceText: string
  tags: readonly string[]
  openTime: string
  closeTime: string
  statusLabelType?: 'hospital' | 'business'
}

type HospitalCardListProps = {
  items: readonly HospitalCardItem[]
  likedNames: readonly string[]
  onToggleLike: (hospitalName: string) => void
  onSelect?: (hospitalId: string) => void
}

function toMinutes(time: string) {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

function getClinicStatus(
  openTime: string,
  closeTime: string,
  statusLabelType: HospitalCardItem['statusLabelType'] = 'hospital',
) {
  const now = new Date()
  const currentMinutes = now.getHours() * 60 + now.getMinutes()
  const openMinutes = toMinutes(openTime)
  const closeMinutes = toMinutes(closeTime)
  const isOpen = currentMinutes >= openMinutes && currentMinutes < closeMinutes
  const label = statusLabelType === 'business' ? (isOpen ? '영업중' : '영업 마감') : isOpen ? '진료 중' : '진료 마감'

  return {
    label,
    timeText: `${openTime} ~ ${closeTime}`,
    color: isOpen ? '#22C55E' : '#767676',
  }
}

function HospitalCardList({ items, likedNames, onToggleLike, onSelect }: HospitalCardListProps) {
  return (
    <ul className="health_hospital_recommend_list">
      {items.map((item) => {
        const status = getClinicStatus(item.openTime, item.closeTime, item.statusLabelType)
        const isLiked = likedNames.includes(item.name)

        return (
          <li key={item.id} className="health_hospital_recommend_item">
            <button
              type="button"
              className={`health_hospital_recommend_card${onSelect ? ' is_clickable' : ''}`}
              onClick={onSelect ? () => onSelect(item.id) : undefined}
            >
              <div className="health_hospital_recommend_img" aria-hidden="true">
                <img src={item.image} alt="" />
              </div>

              <div className="health_hospital_recommend_info">
                <div className="health_hospital_recommend_text">
                  <div className="health_hospital_recommend_row">
                    <span className="health_hospital_recommend_name">{item.name}</span>
                    <LikeButton
                      type="button"
                      liked={isLiked}
                      className="health_hospital_recommend_like"
                      aria-label={isLiked ? `${item.name} 찜 해제` : `${item.name} 찜하기`}
                      onClick={(event) => {
                        event.stopPropagation()
                        onToggleLike(item.name)
                      }}
                    />
                  </div>

                  <div className="health_hospital_recommend_rating">
                    <Star size={16} color="#6D59F8" fill="#6D59F8" aria-hidden="true" />
                    <span>{item.rating}</span>
                    <span className="health_hospital_recommend_reviews">({item.reviewCount})</span>
                    <span className="health_hospital_recommend_sep" aria-hidden="true" />
                    <span>{item.distanceText}</span>
                  </div>

                  <div className="health_hospital_recommend_tags">
                    {item.tags.map((tag, index) => (
                      <span key={`${item.id}-${tag}`} className="health_hospital_recommend_tag_wrap">
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
            </button>
          </li>
        )
      })}
    </ul>
  )
}

export default HospitalCardList
