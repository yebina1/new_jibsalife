import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import './HealthCheckAnalysis.css'
import StateBar from '../../components/StateBar'
import HomeIndicator from '../../components/HomeIndicator'
import HeaderIcon from '../../components/HeaderIcon'
import BackButton from '../../components/html/BackButton'
import Button from '../../components/html/Button'
import dogSittingImage from '../../img/dog_sitting.png'
import foodBowlImage from '../../img/food_bowl.png'
import dogBarkingImage from '../../img/dog_barking.png'
import reportMemoImage from '../../img/report_memo.png'

const CIRCUMFERENCE = 2 * Math.PI * 28

type CardStatus = 'pending' | 'processing' | 'done'

const STATUS_TEXT: Record<CardStatus, string> = {
  pending: '확인 대기...',
  processing: '확인 중...',
  done: '확인 완료',
}

const cards = [
  { image: dogSittingImage, label: '건강 기록' },
  { image: foodBowlImage, label: '식사 변화' },
  { image: dogBarkingImage, label: '활동량' },
  { image: reportMemoImage, label: 'AI 리포트' },
] as const

function getCardStatus(index: number, progress: number): CardStatus {
  if (progress >= (index + 1) * 25) return 'done'
  if (progress >= index * 25) return 'processing'
  return 'pending'
}

function AnalysisCard({
  image,
  label,
  status,
}: {
  image: string
  label: string
  status: CardStatus
}) {
  return (
    <div className={`hca_card${status === 'done' ? ' hca_card_done' : ''}`}>
      <img
        src={image}
        width={64}
        height={64}
        style={{ objectFit: 'cover' }}
        alt={`${label} 이미지`}
        aria-hidden="true"
      />
      <p className="hca_card_label">
        {label}
        <br />
        {STATUS_TEXT[status]}
      </p>
    </div>
  )
}

function HealthCheckAnalysis() {
  const navigate = useNavigate()
  // 건강 기록(index 0)은 진입 시점에 이미 완료 → progress 25에서 시작
  const [progress, setProgress] = useState(25)
  const [displayProgress, setDisplayProgress] = useState(0)
  const displayProgressRef = useRef(0)

  useEffect(() => {
    const timers = [50, 75, 100].map((target, i) =>
      setTimeout(() => setProgress(target), (i + 1) * 800)
    )
    return () => timers.forEach(clearTimeout)
  }, [])

  useEffect(() => {
    const start = displayProgressRef.current
    const target = progress
    const duration = 400
    const startTime = Date.now()
    let rafId: number
    const tick = () => {
      const elapsed = Date.now() - startTime
      const t = Math.min(elapsed / duration, 1)
      const eased = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
      const current = Math.round(start + (target - start) * eased)
      displayProgressRef.current = current
      setDisplayProgress(current)
      if (t < 1) rafId = requestAnimationFrame(tick)
    }
    rafId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId)
  }, [progress])

  useEffect(() => {
    if (progress >= 100) {
      const timer = setTimeout(() => navigate('/health/result', { replace: true }), 800)
      return () => clearTimeout(timer)
    }
  }, [progress, navigate])

  return (
    <div className="hca_page">
      <StateBar />
      <div className="hca_titlebar">
        <div className="hca_titlebar_start">
          <BackButton to="/health/cam" replace />
          <span className="hca_title">AI 건강 체크</span>
        </div>
        <div className="hca_actions">
          <Button type="button" aria-label="calendar" onClick={() => navigate('/mission')}>
            <HeaderIcon type="calendar" />
          </Button>
          <Button type="button" aria-label="notification">
            <HeaderIcon type="notification" />
          </Button>
        </div>
      </div>
      <main className="hca_main">
        <div className="hca_top">
          <div className="hca_text">
            <p className="hca_title_text">AI 가 정보를 확인 중이에요</p>
            <p className="hca_sub_text">잠시만 기다려 주세요...</p>
          </div>
          <div className="hca_progress">
            <svg viewBox="0 0 70 70" aria-hidden="true">
              <circle cx="35" cy="35" r="28" fill="none" stroke="#e5e5ec" strokeWidth="5" />
              <circle
                cx="35" cy="35" r="28"
                fill="none"
                stroke="#6d59f8"
                strokeWidth="5"
                strokeLinecap="round"
                strokeDasharray={CIRCUMFERENCE}
                strokeDashoffset={CIRCUMFERENCE * (1 - progress / 100)}
                transform="rotate(-90 35 35)"
                style={{ transition: 'stroke-dashoffset 0.4s cubic-bezier(0.45,0,0.55,1)' }}
              />
            </svg>
            <span className="hca_progress_text">{displayProgress}%</span>
          </div>
        </div>

        <div className="hca_grid">
          {cards.map((card, index) => (
            <AnalysisCard
              key={card.label}
              image={card.image}
              label={card.label}
              status={getCardStatus(index, progress)}
            />
          ))}
        </div>

        <p className="hca_notice">
          ※ 이 결과는 참고용이며,
          <br />
          정확한 진단은 수의사 상담을 통해 확인해주세요.
        </p>
      </main>
      <HomeIndicator />
    </div>
  )
}

export default HealthCheckAnalysis
