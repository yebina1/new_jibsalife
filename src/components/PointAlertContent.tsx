import type { ReactNode } from 'react'
import './PointAlertContent.css'
import ConfettiEffect from './effect/ConfettiEffect'
import RewardHero from './RewardHero'
import RewardPointCard from './RewardPointCard'
import Button from './html/Button'

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
        <RewardHero rewardAmount={rewardAmount} title={heroTitle} subtitle={heroSubtitle} />
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
