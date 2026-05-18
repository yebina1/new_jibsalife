import { useNavigate } from 'react-router'
import PageHeader from '../components/PageHeader'
import BackButton from '../components/html/BackButton'
import './TermsDetail.css'

const articles = [
  {
    title: '제1조 목적',
    body: '본 약관은 집사인생(이하 "서비스")이 제공하는 반려동물 기록 및 커뮤니티 서비스의 이용과 관련하여 서비스와 이용자 간의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.',
  },
  {
    title: '제2조 서비스 소개',
    subtitle: '서비스는 다음 기능을 제공합니다.',
    list: [
      '반려동물 건강 기록 관리',
      '식사, 배변, 활동 등 캘린더 기록',
      'AI 기반 기록 보조 및 가이드',
      '커뮤니티 및 투표 기능',
      '콘텐츠 및 케어 정보 제공',
    ],
    body2: '(서비스는 지속적인 개선을 위해 기능이 변경되거나 추가될 수 있습니다.)',
  },
  {
    title: '제3조 회원가입 및 계정 관리',
    list: [
      '이용자는 카카오, 구글, 애플 또는 이메일 기반 회원가입을 통해 서비스를 이용할 수 있습니다.',
      '이용자는 정확한 정보를 입력해야 하며, 타인의 정보를 도용하거나 허위 정보를 입력해서는 안 됩니다.',
      '이용자는 자신의 계정 정보를 안전하게 관리할 책임이 있습니다.',
    ],
  },
  {
    title: '제4조 이용자의 의무',
    subtitle: '이용자는 다음 행위를 해서는 안 됩니다.',
    list: [
      '타인의 개인정보 도용',
      '서비스 운영 방해 행위',
      '욕설, 혐오, 음란성 게시물 작성',
      '허위 정보 등록',
      '저작권 및 기타 권리 침해 행위',
    ],
    body2: '(서비스는 위 행위 발생 시 사전 통보 없이 이용 제한 조치를 할 수 있습니다.)',
  },
  {
    title: '제5조 AI 기능 및 면책사항',
    list: [
      '서비스에서 제공하는 AI 기반 정보 및 콘텐츠는 반려동물 건강 기록을 기반으로 한 참고용 가이드이며, 수의학적 진단 또는 의료 행위를 대체하지 않습니다.',
      '이용자는 반려동물의 이상 증상 발생 시 전문 수의사 상담 및 병원 진료를 우선적으로 진행해야 합니다.',
      '서비스는 AI 응답 또는 사용자 입력 정보로 인해 발생한 직접적·간접적 손해에 대해 책임을 지지 않습니다.',
    ],
  },
  {
    title: '제6조 서비스 이용 제한',
    subtitle: '서비스는 아래 사유 발생 시 이용 제한 또는 계정 삭제 조치를 할 수 있습니다.',
    list: [
      '약관 위반',
      '비정상적 접근 시도',
      '서비스 운영 방해',
      '불법 행위 또는 악용 사례',
    ],
  },
  {
    title: '제7조 서비스 변경 및 종료',
    list: [
      '서비스는 운영상 필요에 따라 일부 기능을 변경하거나 종료할 수 있습니다.',
      '중대한 변경 사항이 발생할 경우 서비스 내 공지사항을 통해 안내합니다.',
    ],
  },
  {
    title: '제8조 개인정보 보호',
    list: [
      '서비스는 관련 법령에 따라 이용자의 개인정보를 보호하며, 개인정보 처리와 관련된 사항은 개인정보 처리방침에 따릅니다.',
    ],
  },
  {
    title: '제9조 문의',
    subtitle: '서비스 이용 중 문의사항이 있을 경우 아래 이메일로 문의할 수 있습니다.',
    email: 'support@example.com',
  },
]

function TermsDetail() {
  const navigate = useNavigate()

  const handleConfirm = () => {
    try {
      const saved = sessionStorage.getItem('signup_terms')
      const current = saved ? JSON.parse(saved) : { all: false, age: false, service: false, privacy: false, marketing: false }
      const next = { ...current, service: true }
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
        <h1 className="terms_main_title">집사인생 이용약관</h1>
        <p className="terms_effective_date">(2026. 05. 12 시행)</p>

        <div className="terms_articles">
          {articles.map((article) => (
            <article key={article.title} className="terms_article">
              <h2 className="terms_article_title">{article.title}</h2>
              {article.body && (
                <p className="terms_article_body">{article.body}</p>
              )}
              {article.subtitle && (
                <p style={{ fontSize: '16px', fontWeight: 500, color: '#111111', lineHeight: '1.5', margin: 0 }}>
                  {article.subtitle}
                </p>
              )}
              {article.list && (
                <ol className="terms_article_list">
                  {article.list.map((item) => (
                    <li key={item} className="terms_article_list_item">{item}</li>
                  ))}
                </ol>
              )}
              {article.body2 && (
                <p className="terms_article_body">{article.body2}</p>
              )}
              {article.email && (
                <p style={{ fontSize: '14px', fontWeight: 600, color: '#111111', margin: 0 }}>
                  {article.email}
                </p>
              )}
            </article>
          ))}
        </div>
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

export default TermsDetail
