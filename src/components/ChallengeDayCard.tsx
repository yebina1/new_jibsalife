import { forwardRef, type ReactNode } from 'react'
import { Lock } from 'lucide-react'
import './ChallengeDayCard.css'
import stampImg from '../img/challenge/stamp.png'
import notCompletedStampImg from '../img/challenge/not_completed_stamp.png'

type ChallengeStatus = 'completed' | 'missed' | 'current' | 'locked'

type ChallengeDayCardProps = {
  day: number
  image?: string
  description: ReactNode
  status: ChallengeStatus
  isCurrent?: boolean
}

const ChallengeDayCard = forwardRef<HTMLDivElement, ChallengeDayCardProps>(
function ChallengeDayCard({ day, image, description, status, isCurrent = false }, ref) {
  return (
    <div ref={ref} className={`cdc_card${(status === 'current' || isCurrent) ? ' cdc_card_current' : ''}${status === 'completed' || status === 'missed' ? ' cdc_card_completed' : ''}`}>
      <span className="cdc_day">Day {day}</span>
      <div className="cdc_img_wrapper">
        {image && <img src={image} alt={`Day ${day} 챌린지 이미지`} className="cdc_img" />}
        {status === 'locked' && (
          <div className="cdc_lock_wrapper">
            <Lock size={32} />
          </div>
        )}
      </div>
      <p className="p_regular cdc_desc">{description}</p>
      {status === 'completed' && (
        <img src={stampImg} alt="완료 스탬프" className="cdc_stamp" />
      )}
      {status === 'missed' && (
        <img src={notCompletedStampImg} alt="미완료 스탬프" className="cdc_stamp" />
      )}
    </div>
  )
})

export default ChallengeDayCard
