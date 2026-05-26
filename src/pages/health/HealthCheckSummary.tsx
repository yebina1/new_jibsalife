import { useNavigate } from 'react-router'
import './Health.css'
import './HealthCheckSummary.css'
import PageHeader from '../../components/PageHeader'
import ContentSection from '../../components/ContentSection'
import ActionOptionList from '../../components/ActionOptionList'
import type { ActionOptionItem } from '../../components/ActionOptionList'
import CloseButton from '../../components/html/CloseButton'
import BackButton from '../../components/html/BackButton'
import checkMarkIcon from '../../svg/Check_Mark.svg'
import { readPetProfiles, readSelectedPetProfileId } from '../../utils/petProfiles'

function HealthCheckSummary() {
  const navigate = useNavigate()
  const pets = readPetProfiles()
  const selectedPetId = readSelectedPetProfileId()
  const selectedPet = pets.find((pet) => pet.id === selectedPetId) ?? pets[0] ?? null
  const petName = selectedPet?.name ?? '반려동물'
  const actionOptions: ActionOptionItem[] = [
    {
      title: '간단히 물어보기(Q&A)',
      description: 'AI가 빠르게 답변해 드려요.',
      onClick: () => navigate('/health/qna'),
    },
    {
      title: '수의사 상담/병원 연결',
      description: '전문가와 상담하고 병원 진료를 받아 보세요.',
      onClick: () => navigate('/health/connect'),
    },
  ]

  return (
    <>
      <PageHeader
        title="AI 건강 체크"
        leftContent={<BackButton />}
        rightContent={<CloseButton />}
      />
      <main className="page health_page health_check_summary_page">
        <ContentSection
          className="health_check_summary_intro"
          titleAs="h2"
          beforeTitle={
            <img
              className="health_check_summary_icon"
              src={checkMarkIcon}
              alt="확인 완료"
            />
          }
            title={
              <>
                {petName}의 상태는
                <br />건강 양호예요.
              </>
            }
          subtitle={
            <>
              식사, 배변, 활동 기록이 안정적으로 유지되고 있어요. 지금처럼 꾸준히 관찰해 주세요.
            </>
          }
        />

        <ContentSection className="health_check_summary_actions" titleAs="h3" title="다음 행동을 선택해 주세요.">
          <ActionOptionList items={actionOptions} />
        </ContentSection>

        <ContentSection className="health_check_summary_today" titleAs="h3" title="오늘의 요약">
          <div>
            <p>{petName}는 오늘도 평소와 비슷한 컨디션을 보여주고 있어요.</p>
          </div>
        </ContentSection>
      </main>
    </>
  )
}

export default HealthCheckSummary
