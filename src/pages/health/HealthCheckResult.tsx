import { useEffect, useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router'
import './Health.css'
import './HealthCheckResult.css'
import PageHeader from '../../components/PageHeader'
import BackButton from '../../components/html/BackButton'
import HeaderIcon from '../../components/HeaderIcon'
import Button from '../../components/html/Button'
import dogSittingImage from '../../img/dog_sitting.png'
import mealIcon from '../../img/icon_meal.png'
import poopIcon from '../../img/icon_poop.png'
import healthShieldIcon from '../../img/health_shield.png'
import hospital3dImage from '../../img/hospital_3d.png'
import consult3dImage from '../../img/consult_3d.png'
import { readPetProfiles, readSelectedPetProfileId } from '../../utils/petProfiles'
import { calculateHealthResult, readStoredHealthResultInput } from '../../utils/healthResultPolicy'
import {
  readMissionHistoryRecordsWithDefaults,
  toMissionHistoryRecord,
  type MissionHistoryRecord,
} from '../../utils/missionHistoryRecords'
import { readMissionActivityRecords } from '../../utils/missionActivityRecords'
import { markHealthReportViewed } from '../../utils/challengeStatus'

const activityMinutes = [48, 55, 46, 50, 44, 56, 38] as const
const CHART_MAX = 60
const hospitalGuideItems = ['2일 이상 지속', '활동량 급감', '식사량 급감', '구토, 설사 반복']
const hospitalGuideColumns = [
  [hospitalGuideItems[0], hospitalGuideItems[2]],
  [hospitalGuideItems[1], hospitalGuideItems[3]],
] as const

function getTodayDateKey() {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function isMealRecord(record: MissionHistoryRecord) {
  const normalizedColor = record.color.toLowerCase()
  return record.title.includes('식사') || normalizedColor === '#ffd1a8' || normalizedColor === '#f2b472'
}

function isPoopRecord(record: MissionHistoryRecord) {
  const normalizedColor = record.color.toLowerCase()
  return (
    record.title.includes('배변') ||
    record.title.includes('배뇨') ||
    normalizedColor === '#527ca3' ||
    normalizedColor === '#bee3f8'
  )
}

function countRecordedDays(records: MissionHistoryRecord[]) {
  return new Set(
    records
      .map((record) => record.date)
      .filter((date) => typeof date === 'string' && date.trim().length > 0),
  ).size
}

function HealthCheckResult() {
  const navigate = useNavigate()
  const location = useLocation()
  const resultState = (location.state as { returnTo?: string } | null) ?? null
  const backTarget = resultState?.returnTo ?? '/health/cam'

  const activityData = useMemo(() => {
    const today = new Date()

    return activityMinutes.map((minutes, index) => {
      const date = new Date(today)
      const dayOffset = activityMinutes.length - 1 - index
      date.setDate(today.getDate() - dayOffset)

      return {
        label: dayOffset === 0 ? '오늘' : `${date.getMonth() + 1}/${date.getDate()}`,
        minutes,
        isToday: dayOffset === 0,
      }
    })
  }, [])

  const pets = useMemo(() => readPetProfiles(), [])
  const selectedPetId = useMemo(() => readSelectedPetProfileId(), [])
  const selectedPet = useMemo(
    () => pets.find((pet) => pet.id === selectedPetId) ?? pets[0] ?? null,
    [pets, selectedPetId],
  )
  const petName = selectedPet?.name ?? '반려동물'
  const petImage = selectedPet?.image || dogSittingImage

  const result = useMemo(() => calculateHealthResult(readStoredHealthResultInput()), [])
  const isPositive =
    result.status.tone === 'excellent' ||
    result.status.tone === 'good' ||
    result.status.tone === 'normal'

  const calendarRecords = useMemo(
    () => [
      ...readMissionActivityRecords().map(toMissionHistoryRecord),
      ...readMissionHistoryRecordsWithDefaults(),
    ],
    [],
  )
  const recordedDayCount = useMemo(() => countRecordedDays(calendarRecords), [calendarRecords])
  const todayDateKey = getTodayDateKey()
  const todayRecords = useMemo(
    () => calendarRecords.filter((record) => record.date === todayDateKey),
    [calendarRecords, todayDateKey],
  )
  const isCollectingReport = recordedDayCount < 7
  const hasMealRecordToday = useMemo(() => todayRecords.some(isMealRecord), [todayRecords])
  const hasPoopRecordToday = useMemo(() => todayRecords.some(isPoopRecord), [todayRecords])

  useEffect(() => {
    markHealthReportViewed()
  }, [])

  const visibleStatusCards = [
    hasMealRecordToday ? { key: 'meal', image: mealIcon, label: '식욕' } : null,
    hasPoopRecordToday ? { key: 'poop', image: poopIcon, label: '배변·배뇨' } : null,
  ].filter(Boolean) as Array<{ key: string; image: string; label: string }>

  const statusCards = isCollectingReport
    ? visibleStatusCards
    : [
        { key: 'meal', image: mealIcon, label: '식욕' },
        { key: 'poop', image: poopIcon, label: '배변' },
      ]

  return (
    <>
      <PageHeader
        title="AI 건강 리포트"
        leftContent={<BackButton to={backTarget} replace />}
        rightContent={
          <>
            <Button type="button" aria-label="calendar" onClick={() => navigate('/mission')}>
              <HeaderIcon type="calendar" />
            </Button>
            <Button type="button" aria-label="notification">
              <HeaderIcon type="notification" />
            </Button>
          </>
        }
      />
      <main className="page health_page health_check_result_page">
        <section className="hcr_card hcr_pet_card">
          <img className="hcr_pet_img" src={petImage} alt={petName} />
          <p className="hcr_pet_msg">
            {isCollectingReport ? (
              <>
                <strong>{petName}</strong>의 기록이 쌓일수록
                <br />
                더 정확한 상태를 알 수 있어요.
              </>
            ) : (
              <>
                <strong>{petName}</strong>의 상태는
                <br />
                <span className="hcr_pet_msg_emphasis">활동량이 평소보다 줄었어요.</span>
                <br />
                조금 더 살펴봐 주세요.
              </>
            )}
          </p>
          {!isCollectingReport ? (
            <span className={`hcr_pet_check${isPositive ? ' is_positive' : ''}`} aria-hidden="true">
              <i className="bx bxs-check-circle" />
            </span>
          ) : null}
        </section>

        <section className="hcr_card hcr_chart_card">
          <div className="hcr_chart_header">
            <div>
              <h2 className="hcr_chart_title">최근 7일 활동량</h2>
              {!isCollectingReport ? <p className="hcr_chart_subtitle">평균보다 15% 감소</p> : null}
            </div>
            <span className={`hcr_badge${isCollectingReport ? '' : ' hcr_badge_observation'}`}>
              {isCollectingReport ? '기록중' : '관찰 필요'}
            </span>
          </div>
          <div className="hcr_chart" aria-hidden="true">
            <div className="hcr_chart_yaxis">
              <span>60분</span>
              <span>40분</span>
              <span>20분</span>
              <span>0분</span>
            </div>
            <div className="hcr_chart_plot">
              <div className="hcr_chart_grid">
                <span />
                <span />
                <span />
                <span />
              </div>
              <div className="hcr_chart_bars">
                {activityData.map((item) => (
                  <div key={item.label} className="hcr_chart_bar_col">
                    <div
                      className={`hcr_chart_bar${item.isToday ? ' is_today' : ''}${isCollectingReport && !item.isToday ? ' is_hidden' : ''}`}
                      style={{ height: `${(item.minutes / CHART_MAX) * 100}%` }}
                    />
                  </div>
                ))}
              </div>
              <div className="hcr_chart_xlabels">
                {activityData.map((item) => (
                  <span
                    key={item.label}
                    className={`hcr_chart_xlabel${item.isToday ? ' is_today' : ''}`}
                  >
                    {item.label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {statusCards.length > 0 ? (
          <section
            className={`hcr_card hcr_status_pair_card${
              isCollectingReport && statusCards.length === 1 ? ' is_single' : ''
            }`}
          >
            {statusCards.map((item, index) => (
              <>
                <div key={item.key} className="hcr_status_pair_item">
                  <img src={item.image} alt="" aria-hidden="true" className="hcr_status_pair_img" />
                  <strong className="hcr_status_pair_label">{item.label}</strong>
                  <span className="hcr_badge">{isCollectingReport ? '기록중' : '정상'}</span>
                </div>
                {index < statusCards.length - 1 ? (
                  <div key={`${item.key}-divider`} className="hcr_status_pair_divider" aria-hidden="true" />
                ) : null}
              </>
            ))}
          </section>
        ) : null}

        {!isCollectingReport ? (
          <section className="hcr_card hcr_guide_card">
            <div className="hcr_guide_header">
              <img src={healthShieldIcon} alt="" aria-hidden="true" className="hcr_guide_icon_img" />
              <h2 className="hcr_guide_title">병원 방문 권장 기준</h2>
            </div>
            <div className="hcr_guide_grid">
              {hospitalGuideColumns.map((column, columnIndex) => (
                <div key={`guide-column-${columnIndex}`} className="hcr_guide_column">
                  {column.map((item) => (
                    <div key={item} className="hcr_guide_item">
                      <i className="bx bxs-check-circle hcr_guide_check" aria-hidden="true" />
                      <span className={item === '활동량 급감' ? 'hcr_guide_warning_text' : undefined}>
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </section>
        ) : null}

        <div className="hcr_actions">
          <button
            type="button"
            className="hcr_action hcr_action_hospital"
            onClick={() => navigate('/health/hospitals/list')}
          >
            <img src={hospital3dImage} alt="" aria-hidden="true" className="hcr_action_img" />
            <div className="hcr_action_content">
              <span className="hcr_action_title">병원 찾기 &gt;</span>
              <span className="hcr_action_desc">내 주변 병원 검색<br />및 정보 확인</span>
            </div>
          </button>
          <button type="button" className="hcr_action hcr_action_vet" disabled>
            <img src={consult3dImage} alt="" aria-hidden="true" className="hcr_action_img" />
            <div className="hcr_action_content">
              <span className="hcr_action_title">수의사 상담 &gt;</span>
              <span className="hcr_action_desc">실시간 상담으로<br />전문가와 대화</span>
            </div>
          </button>
        </div>

        <p className="hcr_notice">
          본 AI 결과는 참고용이며
          <br />
          정확한 진단은 수의사 상담을 통해 확인해주세요.
        </p>
      </main>
    </>
  )
}

export default HealthCheckResult
