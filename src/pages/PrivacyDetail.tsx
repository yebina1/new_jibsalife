import { useNavigate } from 'react-router'
import PageHeader from '../components/PageHeader'
import BackButton from '../components/html/BackButton'
import './TermsDetail.css'
import './PrivacyDetail.css'

const sections = [
  {
    title: '수집하는 정보',
    subtitle: '서비스는 다음 정보를 수집할 수 있습니다.',
    list: [
      '이메일',
      '닉네임',
      '프로필 이미지',
      '반려동물 정보',
      '건강 기록 데이터',
      '서비스 이용 로그',
    ],
  },
  {
    title: '개인정보 수집 목적',
    subtitle: '수집한 정보는 아래 목적에 사용됩니다.',
    list: [
      '회원 식별 및 로그인 처리',
      '반려동물 기록 저장',
      'AI 기반 맞춤 기능 제공',
      '서비스 개선 및 통계 분석',
      '커뮤니티 운영 및 관리',
    ],
  },
  {
    title: '개인정보 보관 기간',
    subtitle: '이용자의 개인정보는 회원 탈퇴 시 즉시 삭제됩니다.',
    body: '(단, 관련 법령에 따라 일정 기간 보관이 필요한 경우 해당 기간 동안 보관될 수 있습니다.)',
  },
  {
    title: '개인정보 제3자 제공',
    subtitle: '서비스는 이용자의 개인정보를 외부에 판매하거나 제공하지 않습니다.',
    body: '(단, 법령에 따른 요청이 있는 경우 예외로 할 수 있습니다.)',
  },
  {
    title: '이용자의 권리',
    subtitle: '이용자는 언제든지 자신의 개인정보를 조회, 수정 또는 삭제할 수 있습니다.',
    body: '(회원 탈퇴 시 개인정보는 관련 법령에 따라 처리됩니다.)',
  },
  {
    title: '개인정보 보호',
    list: [
      '서비스는 개인정보 보호를 위해 보안 조치를 적용하며, 이용자의 정보를 안전하게 관리하기 위해 노력합니다.',
    ],
  },
  {
    title: '문의',
    subtitle: '서비스 이용 중 문의사항이 있을 경우 아래 이메일로 문의할 수 있습니다.',
    email: 'support@example.com',
  },
]

function PrivacyDetail() {
  const navigate = useNavigate()

  const handleConfirm = () => {
    try {
      const saved = sessionStorage.getItem('signup_terms')
      const current = saved ? JSON.parse(saved) : { all: false, age: false, service: false, privacy: false, marketing: false }
      const next = { ...current, privacy: true }
      next.all = next.age && next.service && next.privacy && next.marketing
      sessionStorage.setItem('signup_terms', JSON.stringify(next))
    } catch { /* */ }
    navigate(-1)
  }

  return (
    <>
      <PageHeader title="약관/동의서 상세" leftContent={<BackButton />} />
      <div className="terms_wrapper">
      <div className="terms_body">
        <h1 className="terms_main_title">개인정보 처리 방침</h1>
        <p className="terms_effective_date">(2026. 05. 12 시행)</p>

        <ol className="privacy_articles">
          {sections.map((section) => (
            <li key={section.title} className="privacy_article">
              <span className="privacy_article_title">{section.title}</span>
              {section.subtitle && (
                <p className="privacy_article_subtitle">{section.subtitle}</p>
              )}
              {section.list && (
                <ol className="privacy_article_list">
                  {section.list.map((item) => (
                    <li key={item} className="privacy_article_list_item">{item}</li>
                  ))}
                </ol>
              )}
              {section.body && (
                <p className="privacy_article_body">{section.body}</p>
              )}
              {section.email && (
                <p style={{ fontSize: '14px', fontWeight: 600, color: '#111111', margin: 0 }}>
                  {section.email}
                </p>
              )}
            </li>
          ))}
        </ol>
      </div>

      <div className="terms_footer">
        <button
          type="button"
          className="terms_confirm_btn"
          onClick={handleConfirm}
        >
          확인
        </button>
      </div>
    </div>
    </>
  )
}

export default PrivacyDetail
