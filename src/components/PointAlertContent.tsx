import type { ReactNode } from 'react'
import './PointAlertContent.css'
import ConfettiEffect from './effect/ConfettiEffect'
import RewardPointCard from './RewardPointCard'
import Button from './html/Button'
import pointImage from '../img/point_img.jpg'

type PointAlertContentProps = {
  currentPoints: number
  rewardAmount: number
  onRewardCardClick: () => void
  onConfirm: () => void
  heroTitle?: ReactNode
  heroSubtitle?: ReactNode
  messageTitle?: ReactNode
  messageBody?: ReactNode
}

function PointAlertContent({
  currentPoints,
  rewardAmount,
  onRewardCardClick,
  onConfirm,
  heroTitle,
  heroSubtitle,
  messageTitle,
  messageBody,
}: PointAlertContentProps) {
  return (
    <>
      <ConfettiEffect contained />
      <div className="point_alert_content">
        <div className="point_alert_hero">
          <strong className="point_alert_title">{heroTitle ?? '챌린지 참여 완료!'}</strong>
          <p className="point_alert_reward_text">
            {heroSubtitle ?? (
              <>
                <span>{rewardAmount.toLocaleString()}포인트</span>를 받았어요.
              </>
            )}
          </p>
          <img src={pointImage} alt="" className="point_alert_img" />
        </div>
        <RewardPointCard
          currentPoints={currentPoints}
          rewardAmount={rewardAmount}
          rewardAlreadyApplied
          onClick={onRewardCardClick}
        />
        {messageTitle || messageBody ? (
          <div className="point_alert_message">
            {messageTitle ? <strong className="point_alert_message_title">{messageTitle}</strong> : null}
            {messageBody ? <p className="point_alert_message_body">{messageBody}</p> : null}
          </div>
        ) : null}
        <Button type="button" className="purple_btn point_alert_confirm" onClick={onConfirm}>
          확인
        </Button>
      </div>
    </>
  )
}

export default PointAlertContent
