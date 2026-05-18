import { useEffect, useMemo } from 'react'
import { Dog } from 'lucide-react'
import { useNavigate } from 'react-router'
import './HealthReport.css'
import { markHealthReportViewed } from '../../utils/challengeStatus'
import PageHeader from '../../components/PageHeader'
import HeaderIcon from '../../components/HeaderIcon'
import ChevronIcon from '../../components/ChevronIcon'
import BackButton from '../../components/html/BackButton'
import Button from '../../components/html/Button'
import hospitalImage from '../../img/hospital_3d.png'
import consultImage from '../../img/consult_3d.png'
import iconMeal from '../../img/icon_meal.png'
import iconPoop from '../../img/icon_poop.png'
import healthShield from '../../img/health_shield.png'
import blueCheckIcon from '../../img/blue-check-icon.png'
import checkIcon from '../../img/check-icon.png'
import dailyThumbnail from '../../img/petstory/daily/daily_thumbnail.jpg'
import { readSelectedPetProfile } from '../../utils/petProfiles'
import {
  readMissionHistoryRecordsWithDefaults,
  toMissionHistoryRecord,
  type MissionHistoryRecord,
} from '../../utils/missionHistoryRecords'
import { readMissionActivityRecords } from '../../utils/missionActivityRecords'
import { isCurrentDemoUser } from '../../utils/userScopedStorage'

const criteriaLeft = ['2일 이상 지속', '식사량 급감'] as const
const criteriaRight = ['활동량 급감', '구토, 설사 반복'] as const
const DEFAULT_CHART_MAX = 60

function getTodayDateKey() {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function parseWalkMinutes(detail: string) {
  const normalizedDetail = detail.replace(/\s+/g, ' ').trim()
  if (!normalizedDetail.includes('산책')) return 0

  const hourMinuteMatch = normalizedDetail.match(/(\d+)\s*시간\s*(\d+)?\s*분?/)
  if (hourMinuteMatch) {
    return Number(hourMinuteMatch[1]) * 60 + (hourMinuteMatch[2] ? Number(hourMinuteMatch[2]) : 0)
  }

  const minuteMatch = normalizedDetail.match(/(\d+)\s*분?/)
  if (minuteMatch) {
    return Number(minuteMatch[1])
  }

  return 0
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

function hasCustomPetImage(image: string) {
  return image.startsWith('data:image/') || /^https?:\/\//.test(image)
}

function buildRecentChart(records: MissionHistoryRecord[]) {
  const today = new Date()

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today)
    const dayOffset = 6 - index
    date.setDate(today.getDate() - dayOffset)

    const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
      date.getDate(),
    ).padStart(2, '0')}`

    const minutes = records
      .filter((record) => record.date === dateKey)
      .reduce((sum, record) => sum + parseWalkMinutes(record.detail), 0)

    return {
      label: dayOffset === 0 ? '오늘' : `${date.getMonth() + 1}/${date.getDate()}`,
      minutes,
      isToday: dayOffset === 0,
    }
  })
}

function HealthReport() {
  const navigate = useNavigate()
  const pet = readSelectedPetProfile()
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
  const todayRecordCount = todayRecords.length
  const hasMealRecordToday = useMemo(() => todayRecords.some(isMealRecord), [todayRecords])
  const hasPoopRecordToday = useMemo(() => todayRecords.some(isPoopRecord), [todayRecords])
  const isCollectingReport = recordedDayCount < 7

  const chartBars = useMemo(() => buildRecentChart(calendarRecords), [calendarRecords])
  const chartMax = useMemo(
    () => Math.max(DEFAULT_CHART_MAX, ...chartBars.map((bar) => bar.minutes)),
    [chartBars],
  )

  const petName = pet.name?.trim() || '반려동물'
  const petImage = isCurrentDemoUser()
    ? pet.image || dailyThumbnail
    : hasCustomPetImage(pet.image)
      ? pet.image
      : dailyThumbnail

  const petStatusMessage =
    isCollectingReport && todayRecordCount <= 1
      ? `${petName}의 기록이 쌓일수록 더 정확한 상태를 알 수 있어요.`
      : '전반적으로 좋은 상태예요.'

  useEffect(() => {
    markHealthReportViewed()
  }, [])

  return (
    <>
      <PageHeader
        title="AI 건강 체크"
        leftContent={<BackButton to="/health/cam" replace />}
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
      <main className="page hr_page">
        <div className="hr_card hr_card_pet">
          <div className="hr_pet">
            <div className="hr_pet_avatar">
              {petImage ? (
                <img src={petImage} alt={petName} />
              ) : (
                <Dog size={32} color="#505050" />
              )}
            </div>
            <div className="hr_pet_text">
              <p className="hr_pet_name">{petName}의 상태는</p>
              <p className="hr_pet_status">
                {petStatusMessage}
                <img src={checkIcon} alt="" aria-hidden="true" className="hr_pet_check_icon" />
              </p>
            </div>
          </div>
        </div>

        <div className="hr_card hr_card_chart">
          <div className="hr_chart_header">
            <div className="hr_chart_header_left">
              <span className="hr_chart_title">최근 7일 활동량</span>
              {!isCollectingReport ? (
                <span className="hr_chart_subtitle">평균보다 15% 감소</span>
              ) : null}
            </div>
            <span className="hr_badge">{isCollectingReport ? '기록중' : '정상'}</span>
          </div>

          <div className="hr_chart_inner">
            <span className="hr_y_label" style={{ top: 'var(--hr-plot-top)' }}>60분</span>
            <span className="hr_y_label" style={{ top: '32%' }}>40분</span>
            <span className="hr_y_label" style={{ top: '57%' }}>20분</span>
            <span className="hr_y_label" style={{ top: 'calc(var(--hr-plot-top) + var(--hr-plot-height))' }}>0분</span>

            {(['32%', '57%'] as const).map((top) => (
              <div key={top} className="hr_h_line hr_h_line_dashed" style={{ top }} />
            ))}
            <div className="hr_h_line hr_h_line_solid" style={{ top: 'calc(var(--hr-plot-top) + var(--hr-plot-height))' }} />

            <div className="hr_bars">
              {chartBars.map((bar) => (
                <div key={bar.label} className="hr_bar_group">
                  <div
                    className="hr_bar"
                    style={{
                      height: `${chartMax > 0 ? (bar.minutes / chartMax) * 100 : 0}%`,
                      backgroundColor: bar.isToday ? '#6D59F8' : '#C4B5FD',
                    }}
                  />
                  <span className={`hr_bar_label${bar.isToday ? ' today' : ''}`}>
                    {bar.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="hr_card hr_card_appetite">
          <div className="hr_appetite_col">
            <div className="hr_appetite_icon_wrap">
              <img src={iconMeal} alt="" aria-hidden="true" style={{ objectFit: 'cover' }} />
            </div>
            <div className="hr_appetite_label_row">
              <span className="hr_appetite_label">식욕</span>
              <span className="hr_badge">{isCollectingReport && hasMealRecordToday ? '기록중' : '정상'}</span>
            </div>
          </div>
          <div className="hr_appetite_divider" aria-hidden="true" />
          <div className="hr_appetite_col">
            <div className="hr_appetite_icon_wrap">
              <img src={iconPoop} alt="" aria-hidden="true" style={{ objectFit: 'contain' }} />
            </div>
            <div className="hr_appetite_label_row">
              <span className="hr_appetite_label">배변</span>
              <span className="hr_badge">{isCollectingReport && hasPoopRecordToday ? '기록중' : '정상'}</span>
            </div>
          </div>
        </div>

        {!isCollectingReport ? (
          <div className="hr_card hr_card_criteria">
            <div className="hr_criteria_header">
              <div className="hr_criteria_shield_wrap">
                <img src={healthShield} alt="" aria-hidden="true" />
              </div>
              <span className="hr_criteria_title">병원 방문 권장 기준</span>
            </div>
            <div className="hr_criteria_grid">
              <div className="hr_criteria_col">
                {criteriaLeft.map((text) => (
                  <div key={text} className="hr_criteria_item">
                    <img src={blueCheckIcon} alt="" aria-hidden="true" className="hr_criteria_check" />
                    <span className="hr_criteria_text">{text}</span>
                  </div>
                ))}
              </div>
              <div className="hr_criteria_col">
                {criteriaRight.map((text) => (
                  <div key={text} className="hr_criteria_item">
                    <img src={blueCheckIcon} alt="" aria-hidden="true" className="hr_criteria_check" />
                    <span className="hr_criteria_text">{text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}

        <div className="hr_actions">
          <button
            type="button"
            className="hr_action_card hr_action_hospital"
            onClick={() => navigate('/health/hospitals/list')}
          >
            <img src={hospitalImage} alt="" aria-hidden="true" className="hr_action_img" />
            <div className="hr_action_text">
              <span className="hr_action_title_row">
                <p className="hr_action_title">병원 찾기</p>
                <span className="hr_action_arrow" aria-hidden="true">
                  <ChevronIcon direction="right" size="md" />
                </span>
              </span>
              <p className="hr_action_desc">{'내 주변 병원 검색\n및 정보 확인'}</p>
            </div>
          </button>
          <button
            type="button"
            aria-disabled="true"
            className="hr_action_card hr_action_consult"
          >
            <img
              src={consultImage}
              alt=""
              aria-hidden="true"
              className="hr_action_img hr_action_img_disabled"
            />
            <div className="hr_action_text">
              <span className="hr_action_title_row">
                <p className="hr_action_title hr_action_title_disabled">수의사 상담</p>
                <span className="hr_action_arrow hr_action_arrow_disabled" aria-hidden="true">
                  <ChevronIcon direction="right" size="md" />
                </span>
              </span>
              <p className="hr_action_desc hr_action_desc_disabled">{'실시간 상담으로\n전문가와 대화'}</p>
            </div>
          </button>
        </div>
      </main>
    </>
  )
}

export default HealthReport
