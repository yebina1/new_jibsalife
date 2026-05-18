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

function HealthCheckSummary() {
  const navigate = useNavigate()
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
                뿡뿡이의 상태는
                <br />지켜보면 괜찮을 것 같아요.
              </>
            }
          subtitle={
            <>
              지금 당장 병원 방문이 필요해 보이지는 않으나, 필요 시 전문가와 상담 또는 병원을 방문해 주세요.
            </>
          }
        />

        <ContentSection className="health_check_summary_actions" titleAs="h3" title="다음 행동을 선택해 주세요.">
          <ActionOptionList items={actionOptions} />
        </ContentSection>

        <ContentSection className="health_check_summary_today" titleAs="h3" title="오늘의 요약">
          <div>
            <p>요약 내용...</p>
          </div>
        </ContentSection>
      </main>
    </>
  )
}

export default HealthCheckSummary
