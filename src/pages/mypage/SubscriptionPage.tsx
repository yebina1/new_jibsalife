import { useState } from 'react'
import { useNavigate } from 'react-router'
import './SubscriptionPage.css'
import subscriptionPetImage from '../../img/illust_login_pet.jpg'
import managePetImage from '../../img/megaphone_dog.png'
import Title from '../../components/Title'
import Button from '../../components/html/Button'
import { isCurrentDemoUser } from '../../utils/userScopedStorage'

const manageBenefitItems = [
  { key: 'ai', icon: '🤖', label: 'AI 심화 분석', amount: '10,000원' },
  { key: 'consulting', icon: '👤', label: '전문가 상담 연결', amount: '2,500원' },
]

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
  const isDemoUser = isCurrentDemoUser()
  const [selectedPlan, setSelectedPlan] = useState<'yearly' | 'monthly'>('yearly')

  const [showBenefits, setShowBenefits] = useState(false)

  if (isDemoUser) {
    return (
      <main className="page subscription_page sub_manage_page">
        <button
          type="button"
          className="sub_manage_close"
          aria-label="닫기"
          onClick={() => navigate('/mypage')}
        >
          ×
        </button>

        <div className="sub_manage_top">
          <span className="sub_manage_badge">집사클럽 ✦</span>
          <h2 className="sub_manage_title">집사 인생이 더 편해져요 ✦</h2>
          <p className="sub_manage_subtitle">AI 분석부터 전문가 상담까지, 모든 혜택을 누려보세요</p>
        </div>

        <div className="sub_manage_hero_card">
          <div className="sub_manage_hero_body">
            <img src={managePetImage} alt="" aria-hidden="true" className="sub_manage_hero_img" />
            <div className="sub_manage_hero_text">
              <p className="sub_manage_hero_label">지금까지 받은 혜택</p>
              <strong className="sub_manage_hero_amount">12,500P</strong>
            </div>
          </div>
          <ul className="sub_manage_benefit_list">
            {manageBenefitItems.map(({ key, icon, label, amount }) => (
              <li key={key}>
                <span className="sub_manage_benefit_icon">{icon}</span>
                <span className="sub_manage_benefit_name">{label}</span>
                <span className="sub_manage_benefit_amount">{amount}</span>
              </li>
            ))}
          </ul>
        </div>

        <button type="button" className="sub_manage_more_btn" onClick={() => setShowBenefits(v => !v)}>
          전용 혜택 더 보기 <span>{showBenefits ? '∧' : '∨'}</span>
        </button>

        {showBenefits && (
          <ul className="subscription_benefits sub_manage_benefits_list">
            {benefits.map(({ key, node }) => (
              <li key={key}>
                <i className="bx bx-check-circle" aria-hidden="true" />
                <p>{node}</p>
              </li>
            ))}
          </ul>
        )}

        <section className="sub_manage_card">
          <div className="sub_manage_card_header">
            <span className="sub_manage_card_title">집사클럽</span>
            <em className="sub_manage_card_badge">이용 중</em>
          </div>
          <div className="sub_manage_card_row">
            <span className="sub_manage_row_left"><i className="bx bx-calendar" />구독 플랜</span>
            <span className="sub_manage_plan_tag">월간</span>
          </div>
          <div className="sub_manage_card_row">
            <span className="sub_manage_row_left"><i className="bx bx-time-five" />구독 기간</span>
            <span>2026년 5월 1일 ~ 6월 1일</span>
          </div>
          <div className="sub_manage_card_row">
            <span className="sub_manage_row_left"><i className="bx bx-credit-card" />다음 결제일</span>
            <span>2026년 6월 1일</span>
          </div>
          <div className="sub_manage_card_row">
            <span className="sub_manage_row_left"><i className="bx bx-purchase-tag" />결제금액</span>
            <span className="sub_manage_price_wrap">
              <span className="sub_manage_price_badge">혜택가</span>
              <del>₩58,800</del>
              <strong>49,800원</strong>
            </span>
          </div>
          <div className="sub_manage_card_row">
            <span className="sub_manage_row_left"><i className="bx bx-receipt" />결제내역</span>
            <span className="sub_manage_card_link">보기 ›</span>
          </div>
        </section>

        <section className="sub_manage_upgrade">
          <button type="button" className="sub_manage_upgrade_btn">
            연간으로 구독하기
          </button>
          <p className="sub_manage_upgrade_desc">연간 구독시 포인트 <strong>2배!</strong></p>
        </section>
      </main>
    )
  }

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
