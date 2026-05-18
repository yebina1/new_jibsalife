import { useNavigate } from 'react-router'
import './Health.css'
import './HealthConnect.css'
import PageHeader from '../../components/PageHeader'
import ChevronIcon from '../../components/ChevronIcon'
import ContentSection from '../../components/ContentSection'
import CloseButton from '../../components/html/CloseButton'
import BackButton from '../../components/html/BackButton'
import NoticeText from '../../components/NoticeText'
import ConnectServiceList from '../../components/ConnectServiceList'
import type { ConnectServiceItem } from '../../components/ConnectServiceList'
import HospitalList from '../../components/HospitalList'
import type { HospitalListItem } from '../../components/HospitalList'

function HealthConnect() {
  const navigate = useNavigate()

  const serviceItems: ConnectServiceItem[] = [
    {
      title: '병원 찾기',
      description: '내 주변 병원 검색 및 정보 확인',
      onClick: () => navigate('/health/hospitals/list'),
    },
    {
      title: '수의사 상담',
      description: '실시간 상담으로 전문가와 대화',
      onClick: () => navigate('/health/vet-chat'),
    },
  ]

  const hospitalItems: HospitalListItem[] = [
    {
      name: '24시 행복 동물병원',
      rating: '4.8 (120)',
      distance: '1.2KM',
    },
    {
      name: '우리 동물병원',
      rating: '4.6 (98)',
      distance: '1.8KM',
    },
  ]

  return (
    <>
      <PageHeader
        title="AI 건강 체크"
        leftContent={<BackButton />}
        rightContent={<CloseButton />}
      />
      <main className="page health_page health_connect_page">
        <ContentSection className="health_connect_services" title="어떤 서비스를 원하시나요?">
          <ConnectServiceList items={serviceItems} />
        </ContentSection>

        <ContentSection
          className="health_connect_hospitals"
          title="내 주변 병원 목록"
          action={
            <button
              type="button"
              className="content_section_text_action"
              onClick={() => navigate('/health/hospitals/list')}
            >
              더보기
              <ChevronIcon direction="right" size="md" />
            </button>
          }
        >
          <HospitalList items={hospitalItems} />
        </ContentSection>

        <NoticeText>
          <p>
            건강 체크 결과는 참고용이며 정확한 진단은
            <br />
            수의사 상담을 통해 확인해 주세요.
          </p>
        </NoticeText>
      </main>
    </>
  )
}

export default HealthConnect
