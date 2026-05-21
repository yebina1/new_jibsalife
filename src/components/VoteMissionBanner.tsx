import Title from './Title'
import defaultBannerImage from '../img/2026_05_3weeks_vote/2026_05_3_weeks_dog_star_vote.png'
import './VoteMissionBanner.css'

type VoteMissionBannerProps = {
  timeText?: string
  title?: React.ReactNode
  description?: React.ReactNode
  backgroundColor?: string
  imageSrc?: string
  className?: string
  timerColor?: string
}

function VoteMissionBanner({
  timeText,
  title = (
    <>
      5월 3주차
      <br />
      멍스타 미션 투표
    </>
  ),
  description = '밥 먹는 사진 중 BEST를 골라주세요!',
  backgroundColor,
  imageSrc = defaultBannerImage,
  className,
  timerColor,
}: VoteMissionBannerProps) {
  return (
    <section
      className={`vote_mission_banner${className ? ` ${className}` : ''}`}
      style={backgroundColor ? { backgroundColor } : undefined}
    >
      <Title
        as="h2"
        className="vote_mission_banner_title"
        beforeTitle={
          timeText ? (
            <span
              className="vote_mission_banner_timer"
              style={timerColor ? { color: timerColor } : undefined}
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                <circle cx="9" cy="9.75" r="5.25" stroke="currentColor" strokeWidth="1.5" />
                <path d="M7.5 2.25L10.5 2.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M14.25 4.5L12.75 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M9 6.75V9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              {timeText}
            </span>
          ) : undefined
        }
        title={title}
      >
        <p>{description}</p>
      </Title>
      <img className="vote_mission_banner_img" src={imageSrc} alt="" aria-hidden="true" />
    </section>
  )
}

export default VoteMissionBanner
