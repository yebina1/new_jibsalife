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

function HealthResultDetailBox({ items }: HealthResultDetailBoxProps) {
  const consultItem = items.find((item) => item.variant === 'consult')
  const contentItems = items.filter((item) => item.variant !== 'consult')

  return (
    <div className="health_result_detail_boxes">
      <Link className="health_result_detail_consult_banner" to={consultItem?.to ?? '/health/result/actions'}>
        <div>
          <strong>{consultItem?.message ?? '궁금한 점이 있다면 수의사 상담을 받아보세요.'}</strong>
          <p>{consultItem?.description ?? '전문가 연결로 더 자세한 안내를 받을 수 있어요.'}</p>
        </div>
        <img src={aiChatImage} alt="" aria-hidden="true" />
      </Link>

      <div className="health_result_detail_card_grid">
        {contentItems.map((item) => (
          <section className={`health_result_detail_box ${item.variant}`} key={item.variant}>
            {item.badge ? <span className="health_result_detail_badge">{item.badge}</span> : null}
            <h2>{item.message}</h2>
            <div className="health_result_detail_description_group">
              {[item.description, ...(item.points ?? [])].filter(Boolean).map((description) => (
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
