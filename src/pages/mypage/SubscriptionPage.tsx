import { useState } from 'react'
import { useNavigate } from 'react-router'
import './SubscriptionPage.css'
import subscriptionPetImage from '../../img/illust_login_pet.jpg'
import Title from '../../components/Title'
import Button from '../../components/html/Button'

const benefits = [
  { key: 'ai', node: <><strong>AI 심화 분석</strong>으로 건강 변화를 더 정확하게 확인</> },
  { key: 'consulting', node: <>이상 신호 시 <strong>전문가 상담 연결 지원</strong></> },
  { key: 'discount', node: <>다양한 <strong>제휴 할인 혜택</strong> 제공</> },
  { key: 'auto', node: <><strong>자동 기록 & 알림</strong>으로 편리한 관리</> },
  { key: 'vote', node: <><strong>프리미엄 투표 참여</strong>로 추가 포인트와 보상 제공</> },
  { key: 'badge', node: <><strong>프리미엄 뱃지</strong>로 특별한 경험</> },
]

function SubscriptionPage() {
  const navigate = useNavigate()
  const [selectedPlan, setSelectedPlan] = useState<'yearly' | 'monthly'>('yearly')

  return (
    <main className="page subscription_page">
      <button
        type="button"
        className="subscription_close"
        aria-label="닫기"
        onClick={() => navigate('/mypage')}
      >
        ×
      </button>

      <section className="subscription_hero title">
        <strong>
          1개월 무료로
          <br />
          더 똑똑한 반려생활 시작
        </strong>
        <p>무료체험 기간 중에는 결제되지 않아요</p>
        <img src={subscriptionPetImage} alt="" aria-hidden="true" />
      </section>

      <section className="subscription_plans" aria-label="구독 플랜 선택">
        <button type="button" className={`subscription_plan${selectedPlan === 'yearly' ? ' subscription_plan_active' : ''}`} onClick={() => setSelectedPlan('yearly')}>
          <span className="subscription_plan_check" aria-hidden="true" />
          <span className="subscription_plan_body">
            <span className="subscription_plan_top">
              <Title as="h3" title="연간" />
              <b>₩49,800</b>
            </span>
            <span className="subscription_plan_bottom">
              <span>1개월 무료 체험 / 1년마다 결제</span>
              <del>₩58,800</del>
            </span>
          </span>
          <span className="subscription_badge subscription_badge_discount">15% 할인</span>
          <span className="subscription_badge subscription_badge_popular">가장 인기</span>
        </button>

        <button type="button" className={`subscription_plan${selectedPlan === 'monthly' ? ' subscription_plan_active' : ''}`} onClick={() => setSelectedPlan('monthly')}>
          <span className="subscription_plan_check" aria-hidden="true" />
          <span className="subscription_plan_body">
            <span className="subscription_plan_top">
              <Title as="h3" title="월간" />
              <b>₩4,900</b>
            </span>
            <span className="subscription_plan_bottom">
              <span>1개월 마다 결제</span>
            </span>
          </span>
        </button>
      </section>

      <ul className="subscription_benefits">
        {benefits.map(({ key, node }) => (
          <li key={key}>
            <i className="bx bx-check-circle" aria-hidden="true" />
            <p>{node}</p>
          </li>
        ))}
      </ul>

      <div className="subscription_actions">
        <Button type="button" className="purple_btn" disabled>1개월 무료로 시작하기</Button>
        <div className="subscription_actions_links">
          <a href="#" aria-label="이용약관 및 개인정보처리방침 보기">
            이용약관 및 개인정보처리방침
          </a>
          <a href="#" aria-label="구입 내역 복원하기" className="subscription_link_disabled" aria-disabled="true">
            구입 내역 복원하기
          </a>
        </div>
      </div>
    </main>
  )
}

export default SubscriptionPage
