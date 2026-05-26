import './Health.css'
import './HealthResultActions.css'
import PageHeader from '../../components/PageHeader'
import HeaderIcon from '../../components/HeaderIcon'
import ChevronIcon from '../../components/ChevronIcon'
import ContentSection from '../../components/ContentSection'
import BackButton from '../../components/html/BackButton'
import Button from '../../components/html/Button'
import { Link } from 'react-router'
import calendarIcon from '../../svg/calendar.svg'
import aiChatImage from '../../img/aichat.svg'
import consultImage from '../../img/clipboard_3d.png'
import { calculateHealthResult, readStoredHealthResultInput } from '../../utils/healthResultPolicy'
import { readPetProfiles, readSelectedPetProfileId } from '../../utils/petProfiles'

const HEALTHY_RESULT_INPUT = {
  stoolStatus: 'stable',
  activityStatus: 'stable',
  mealStatus: 'stable',
  weightStatus: 'stable',
  symptomStatus: 'stable',
  photoStatus: 'stable',
} as const

function getSummaryMessage(score: number) {
  if (score >= 75) {
    return '건강 양호 상태예요.'
  }

  if (score >= 60) {
    return '조금 더 지켜보면 좋을 것 같아요.'
  }

  if (score >= 40) {
    return '상태를 보며 주의 깊게 확인해 주세요.'
  }

  return '상담 또는 진료를 함께 고려해 주세요.'
}

function getGuideMessage(score: number) {
  if (score >= 75) {
    return '식사, 배변, 활동 기록이 전반적으로 안정적이에요. 지금처럼 꾸준히 기록하면서 컨디션만 가볍게 확인해 주세요.'
  }

  if (score >= 60) {
    return '조금 더 상태를 지켜보시고, 변화가 이어지면 전문가 상담이나 병원 방문을 고려해 주세요.'
  }

  if (score >= 40) {
    return '변화가 계속되면 상담 또는 병원 방문을 함께 고려해 주세요.'
  }

  return '현재 기록 기준으로 상담 또는 병원 방문을 우선적으로 고려해 주세요.'
}

function HealthResultActions() {
  const pets = readPetProfiles()
  const selectedPetId = readSelectedPetProfileId()
  const selectedPet = pets.find((pet) => pet.id === selectedPetId) ?? pets[0] ?? null
  const petName = selectedPet?.name ?? '반려동물'
  const petImage = selectedPet?.image ?? aiChatImage
  const result = calculateHealthResult(selectedPet?.id === 2 ? HEALTHY_RESULT_INPUT : readStoredHealthResultInput())

  return (
    <>
      <PageHeader
        title="AI 건강 체크"
        leftContent={<BackButton />}
        rightContent={
          <>
            <Button type="button" aria-label="캘린더">
              <img src={calendarIcon} alt="" />
            </Button>
            <Button type="button" aria-label="알림">
              <HeaderIcon type="notification" />
            </Button>
          </>
        }
      />

      <main className="page health_page health_result_actions_page">
        <section className="health_result_actions_summary">
          <div className="health_result_actions_summary_top">
            <img src={petImage} alt="" aria-hidden="true" />
            <div className="health_result_actions_summary_copy">
              <strong>{petName}의 상태는</strong>
              <strong>{getSummaryMessage(result.score)}</strong>
            </div>
            <span className="health_result_actions_check" aria-hidden="true">
              <i className="bx bx-check"></i>
            </span>
          </div>
          <div className="health_result_actions_summary_line" />
          <p>{getGuideMessage(result.score)}</p>
        </section>

        <ContentSection className="health_result_actions_choices" title="다음 행동을 선택해 주세요.">
          <div className="health_result_actions_cards">
            <Link className="health_result_actions_card is_qna" to="/health/qna">
              <div className="health_result_actions_chip_row">
                <span className="health_result_actions_chip">AI 상담</span>
                <span className="health_result_actions_arrow" aria-hidden="true">
                  <ChevronIcon direction="right" size="md" />
                </span>
              </div>
              <strong>Q&amp;A</strong>
              <p>AI가 빠르게 답변해 드려요.</p>
              <img src={aiChatImage} alt="" aria-hidden="true" />
            </Link>

            <Link className="health_result_actions_card is_consult" to="/health/hospitals">
              <div className="health_result_actions_chip_row">
                <span className="health_result_actions_chip">전문가 연결</span>
                <span className="health_result_actions_arrow" aria-hidden="true">
                  <ChevronIcon direction="right" size="md" />
                </span>
              </div>
              <strong>수의사 상담<br />병원 연결</strong>
              <p>전문가와 상담하고 병원 진료를 받아 보세요</p>
              <img src={consultImage} alt="" aria-hidden="true" />
            </Link>
          </div>
        </ContentSection>
      </main>
    </>
  )
}

export default HealthResultActions
