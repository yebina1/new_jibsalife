import './HealthResultDetailBox.css'
import { Link } from 'react-router'
import aiChatImage from '../img/aichat.svg'

export type HealthResultDetailItem = {
  variant: 'warning' | 'cause' | 'symptom' | 'action' | 'consult'
  title: string
  badge?: string
  message: string
  description?: string
  points?: string[]
  to?: string
}

type HealthResultDetailBoxProps = {
  items: HealthResultDetailItem[]
}

const detailCards = [
  {
    variant: 'warning',
    badge: '경미한 변화 감지',
    title: '활동량이 15% 감소했어요.',
    descriptions: ['활동 시간: 평소 42분 → 오늘 36분', '식욕, 배변 등은 정상 범위예요.'],
  },
  {
    variant: 'cause',
    badge: '스트레스 가능성 있음',
    title: '스트레스 가능성이 있어요.',
    descriptions: ['최근 환경 변화가 있었나요?', '산책 시간이나 놀이 시간이 줄었나요?'],
  },
  {
    variant: 'symptom',
    badge: '소화 불량 가능성',
    title: '구토나 설사는 없었나요?',
    descriptions: ['식사 후 헛구역질을 한 적이 있었나요?', '변 상태가 묽거나 무르지 않았나요?'],
  },
  {
    variant: 'action',
    badge: '지켜 보고 필요 시 방문',
    title: '아래 증상 시 병원 방문을 권장드립니다.',
    descriptions: ['증상이 2일 이상 지속될 경우', '식사나 활동량이 급격히 줄어든 경우', '구토, 설사 등이 반복되는 경우'],
  },
] as const

function HealthResultDetailBox({ items }: HealthResultDetailBoxProps) {
  void items

  return (
    <div className="health_result_detail_boxes">
      <Link className="health_result_detail_consult_banner" to="/health/result/actions">
        <div>
          <strong>
            궁금한 점이 있으시다면
            <br />
            수의사와 상담해 보세요
          </strong>
          <p>전문가의 의견으로 더 안심할 수 있어요.</p>
        </div>
        <img src={aiChatImage} alt="" aria-hidden="true" />
      </Link>

      <div className="health_result_detail_card_grid">
        {detailCards.map((item) => (
          <section className={`health_result_detail_box ${item.variant}`} key={item.variant}>
            <span className="health_result_detail_badge">{item.badge}</span>
            <h2>{item.title}</h2>
            <div className="health_result_detail_description_group">
              {item.descriptions.map((description) => (
                <p key={description}>{description}</p>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}

export default HealthResultDetailBox
