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

type LoadingCardStatus = 'waiting' | 'active' | 'done'

const loadingStages = [
  {
    image: healthImage,
    label: '건강 기록',
    centerTitle: '건강 기록',
    centerSubtitle: '확인 중',
    threshold: 25,
  },
  {
    image: moveImage,
    label: '활동량 확인',
    centerTitle: '활동량',
    centerSubtitle: '분석 중',
    threshold: 50,
  },
  {
    image: eatImage,
    label: '식사 변화',
    centerTitle: '식사/배변',
    centerSubtitle: '확인 중',
    threshold: 75,
  },
  {
    image: reportImage,
    label: 'AI 리포트',
    centerTitle: 'AI 리포트',
    centerSubtitle: '생성 중',
    threshold: 100,
  },
] as const

const statusLabelMap: Record<LoadingCardStatus, string> = {
  waiting: '대기',
  active: '진행중',
  done: '완료',
}

const stageAngles = [-135, -45, 45, 135] as const
const ringCenter = 50
const ringOrbitRadius = 31.5

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

function lerp(start: number, end: number, ratio: number) {
  return start + (end - start) * ratio
}

function getStageAnchor(angle: number) {
  const radian = (angle * Math.PI) / 180

  return {
    x: ringCenter + Math.cos(radian) * ringOrbitRadius,
    y: ringCenter + Math.sin(radian) * ringOrbitRadius,
  }
}

function getStageStatus(index: number, progress: number): LoadingCardStatus {
  const stage = loadingStages[index]
  if (!stage) return 'waiting'

  const prevThreshold = index === 0 ? 0 : loadingStages[index - 1]?.threshold ?? 0

  if (progress >= stage.threshold) return 'done'
  if (progress >= prevThreshold) return 'active'
  return 'waiting'
}

function getActiveStageIndex(progress: number) {
  const activeIndex = loadingStages.findIndex((stage) => progress < stage.threshold)
  return activeIndex === -1 ? loadingStages.length - 1 : activeIndex
}

function HealthCheckLoading() {
  const navigate = useNavigate()
  const location = useLocation()
  const loadingState = (location.state as { returnTo?: string } | null) ?? null
  const [progress, setProgress] = useState(0)
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    let frameId = 0
    const duration = 4200
    const startTime = performance.now()

    const easeInOut = (value: number) => 0.5 - Math.cos(value * Math.PI) / 2

    const animate = (now: number) => {
      const elapsed = Math.min(now - startTime, duration)
      const ratio = elapsed / duration
      const nextProgress = easeInOut(ratio) * 100

      setProgress(nextProgress)

      if (elapsed < duration) {
        frameId = window.requestAnimationFrame(animate)
        return
      }

      setProgress(100)
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
    }, 500)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [isComplete, loadingState?.returnTo, navigate])

  const roundedProgress = Math.round(progress)
  const activeStageIndex = getActiveStageIndex(progress)
  const activeStage = loadingStages[activeStageIndex] ?? loadingStages[0]
  const cardStatuses = useMemo(
    () => loadingStages.map((_, index) => getStageStatus(index, progress)),
    [progress],
  )
  const transitionStartIndex = activeStageIndex > 0 ? activeStageIndex - 1 : 0
  const transitionEndIndex = activeStageIndex
  const transitionStartThreshold =
    activeStageIndex > 0 ? loadingStages[activeStageIndex - 1]?.threshold ?? 0 : 0
  const transitionEndThreshold = loadingStages[activeStageIndex]?.threshold ?? 100
  const transitionProgress =
    activeStageIndex === 0
      ? 0
      : clamp(
          (progress - transitionStartThreshold) / Math.max(transitionEndThreshold - transitionStartThreshold, 1),
          0,
          1,
        )
  const transitionStartAngle = stageAngles[transitionStartIndex] ?? stageAngles[0]
  const transitionEndAngle = stageAngles[transitionEndIndex] ?? stageAngles[0]
  const transitionAngle = lerp(transitionStartAngle, transitionEndAngle, transitionProgress)
  const transitionAnchor = getStageAnchor(transitionAngle)

  return (
    <>
      <PageHeader title="AI 건강 체크" leftContent={<BackButton />} />
      <main className="page health_page health_check_loading_page">
        <section className="health_check_loading" aria-label="AI 건강 체크 로딩">
          <header className="health_check_loading_intro">
            <h1>AI가 정보를 확인 중이에요</h1>
            <p>잠시만 기다려 주세요.</p>
          </header>

          <section className="health_check_loading_progress" aria-label="검사 진행 상황">
            <div
              className={`health_check_loading_ring${roundedProgress >= 100 ? ' is_complete' : ''}`}
              style={
                {
                  '--health-progress-value': progress,
                  '--health-active-angle': `${stageAngles[activeStageIndex] ?? stageAngles[0]}deg`,
                } as CSSProperties
              }
              aria-hidden="true"
            >
              <div className="health_check_loading_ring_visual">
                <div className="health_check_loading_ring_backdrop" />
                <div className="health_check_loading_ring_glow" />
                <div className="health_check_loading_ring_focus" />
                <div className="health_check_loading_ring_ripple" />
                <div className="health_check_loading_ring_sweep" />
                <div className="health_check_loading_ring_orbit" />
                <div className="health_check_loading_ring_particles">
                  <span className="health_check_loading_ring_particle particle_1" />
                  <span className="health_check_loading_ring_particle particle_2" />
                  <span className="health_check_loading_ring_particle particle_3" />
                </div>

                {activeStageIndex > 0 && roundedProgress < 100 ? (
                  <div
                    className="health_check_loading_transition"
                    style={
                      {
                        '--health-transition-x': `${transitionAnchor.x}%`,
                        '--health-transition-y': `${transitionAnchor.y}%`,
                        '--health-transition-progress': transitionProgress,
                      } as CSSProperties
                    }
                  >
                    <div className="health_check_loading_transition_badge">
                      <img
                        className="health_check_loading_transition_icon is_prev"
                        src={loadingStages[transitionStartIndex]?.image ?? loadingStages[0].image}
                        alt=""
                      />
                      <img
                        className="health_check_loading_transition_icon is_next"
                        src={loadingStages[transitionEndIndex]?.image ?? loadingStages[0].image}
                        alt=""
                      />
                    </div>
                  </div>
                ) : null}

                {loadingStages.map((stage, index) => {
                  const anchor = getStageAnchor(stageAngles[index] ?? stageAngles[0])
                  const isCurrentStage = activeStageIndex === 0 && index === 0
                  const isTransitionFrom = activeStageIndex > 0 && index === transitionStartIndex
                  const isTransitionTo = activeStageIndex > 0 && index === transitionEndIndex

                  let opacity = 0
                  let scale = 0.82

                  if (roundedProgress >= 100 && index === loadingStages.length - 1) {
                    opacity = 1
                    scale = 1
                  } else if (isCurrentStage) {
                    opacity = 1
                    scale = 1
                  } else if (isTransitionFrom) {
                    opacity = 0
                    scale = lerp(0.98, 0.82, transitionProgress)
                  } else if (isTransitionTo) {
                    opacity = 0
                    scale = lerp(0.82, 0.96, transitionProgress)
                  }

                  return (
                    <div
                      key={stage.label}
                      className="health_check_loading_ring_stage"
                      style={
                        {
                          left: `${anchor.x}%`,
                          top: `${anchor.y}%`,
                          '--health-stage-opacity': opacity,
                          '--health-stage-scale': scale,
                        } as CSSProperties
                      }
                    >
                      <img
                        className="health_check_loading_ring_icon"
                        src={stage.image}
                        alt=""
                      />
                    </div>
                  )
                })}

                <div className="health_check_loading_center">
                  <strong>{roundedProgress}%</strong>
                  <span>{activeStage.centerTitle}</span>
                  <span>{roundedProgress >= 100 ? '완료' : activeStage.centerSubtitle}</span>
                </div>
              </div>
            </div>
          </section>

          <ul className="health_check_loading_cards" aria-label="AI 건강 체크 진행 단계">
            {loadingStages.map((card, index) => (
              <li
                key={card.label}
                className={`health_check_loading_card health_check_loading_card_${cardStatuses[index]}`}
              >
                <div className="health_check_loading_card_icon_wrap">
                  <img src={card.image} alt="" aria-hidden="true" />
                </div>
                <strong>{card.label}</strong>
                <span className="health_check_loading_card_status">
                  {statusLabelMap[cardStatuses[index]]}
                </span>
              </li>
            ))}
          </ul>

          <p className="health_check_loading_notice">
            본 AI 결과는 참고용이며,
            <br />
            정확한 진단은 수의사 상담을 통해 확인해 주세요.
          </p>
        </section>
      </main>
    </>
  )
}

export default HealthCheckLoading
