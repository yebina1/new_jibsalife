import { useEffect, useMemo, useState, type CSSProperties } from 'react'
import { useLocation, useNavigate } from 'react-router'
import './Health.css'
import './HealthCheckLoading.css'
import PageHeader from '../../components/PageHeader'
import BackButton from '../../components/html/BackButton'
import healthImage from '../../img/health/health.png'
import moveImage from '../../img/health/move.png'
import eatImage from '../../img/health/eat.png'
import reportImage from '../../img/health/report.png'

type LoadingCardStatus = 'waiting' | 'done'

type ProgressMarkerStep = 0 | 1 | 2 | 3

const loadingCards = [
  { image: healthImage, label: '건강 기록' },
  { image: moveImage, label: '활동량 확인' },
  { image: eatImage, label: '식사 변화' },
  { image: reportImage, label: 'AI 리포트' },
] as const

const completedProgressCopy = {
  title: 'AI 리포트',
  subtitle: '작성 완료',
} as const

const statusLabelMap: Record<LoadingCardStatus, string> = {
  waiting: '대기',
  done: '완료',
}

const progressStepCopy = [
  { title: '건강 기록', subtitle: '확인 중' },
  { title: '활동량', subtitle: '확인 중' },
  { title: '식사 변화', subtitle: '확인 중' },
  { title: 'AI 리포트', subtitle: '확인 중' },
] as const

function getCardStatus(index: number, progress: number): LoadingCardStatus {
  const start = index * 25
  if (progress > start) return 'done'
  return 'waiting'
}

function getActiveMarkerStep(progress: number): ProgressMarkerStep {
  if (progress >= 75) return 3
  if (progress >= 50) return 2
  if (progress >= 25) return 1
  return 0
}

function HealthCheckLoading() {
  const navigate = useNavigate()
  const location = useLocation()
  const loadingState = (location.state as { returnTo?: string } | null) ?? null
  const [progress, setProgress] = useState(0)
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    let frameId = 0
    const startProgress = 0
    const endProgress = 100
    const duration = 3200
    const startTime = performance.now()

    const animate = (now: number) => {
      const elapsed = Math.min(now - startTime, duration)
      const nextProgress = startProgress + (elapsed / duration) * (endProgress - startProgress)

      setProgress(nextProgress)

      if (elapsed < duration) {
        frameId = window.requestAnimationFrame(animate)
        return
      }

      setProgress(endProgress)
      setIsComplete(true)
    }

    frameId = window.requestAnimationFrame(animate)

    return () => {
      window.cancelAnimationFrame(frameId)
    }
  }, [])

  useEffect(() => {
    if (!isComplete) return

    const timeoutId = window.setTimeout(() => {
      navigate('/health/result', {
        replace: true,
        state: loadingState?.returnTo ? { returnTo: loadingState.returnTo } : undefined,
      })
    }, 250)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [isComplete, loadingState?.returnTo, navigate])

  const roundedProgress = Math.round(progress)
  const activeMarkerStep = getActiveMarkerStep(progress)
  const activeCopy =
    roundedProgress >= 100 ? completedProgressCopy : progressStepCopy[activeMarkerStep]

  const cardStatuses = useMemo(
    () => loadingCards.map((_, index) => getCardStatus(index, progress)),
    [progress],
  )

  return (
    <>
      <PageHeader
        title="AI 건강 체크"
        leftContent={<BackButton />}
      />
      <main className="page health_page health_check_loading_page">
        <section className="health_check_loading" aria-label="AI 건강 체크 로딩">
          <header className="health_check_loading_intro">
            <h1>AI가 정보를 확인 중이에요</h1>
            <p>잠시만 기다려 주세요...</p>
          </header>

          <section className="health_check_loading_progress" aria-label="검사 진행 상황">
            <div
              className={`health_check_loading_ring${roundedProgress >= 100 ? ' is_complete' : ''}`}
              style={{ '--health-progress-value': progress } as CSSProperties}
              aria-hidden="true"
            >
              <div className="health_check_loading_ring_visual">
                <img
                  className="health_check_loading_ring_icon is_top_left"
                  src={healthImage}
                  alt=""
                />
                <img
                  className="health_check_loading_ring_icon is_top_right"
                  src={moveImage}
                  alt=""
                />
                <img
                  className="health_check_loading_ring_icon is_bottom_right"
                  src={eatImage}
                  alt=""
                />
                <img
                  className="health_check_loading_ring_icon is_bottom_left"
                  src={reportImage}
                  alt=""
                />

                <div className="health_check_loading_marker_orbit" aria-hidden="true">
                  <span className="health_check_loading_marker" />
                </div>

                <div className="health_check_loading_center">
                  <strong>{roundedProgress}%</strong>
                  <span>{activeCopy.title}</span>
                  <span>{activeCopy.subtitle}</span>
                </div>
              </div>
            </div>
          </section>

          <ul className="health_check_loading_cards" aria-label="AI 건강 체크 진행 단계">
            {loadingCards.map((card, index) => (
              <li
                key={card.label}
                className={`health_check_loading_card health_check_loading_card_${cardStatuses[index]}`}
              >
                <img src={card.image} alt="" aria-hidden="true" />
                <strong>{card.label}</strong>
                <span className="health_check_loading_card_status">
                  {statusLabelMap[cardStatuses[index]]}
                </span>
              </li>
            ))}
          </ul>

          <p className="health_check_loading_notice">
            ※ 이 결과는 참고용이며,
            <br />
            정확한 진단은 수의사 상담을 통해 확인해주세요.
          </p>
        </section>
      </main>
    </>
  )
}

export default HealthCheckLoading
