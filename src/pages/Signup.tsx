import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import Input from '../components/html/Input'
import Button from '../components/html/Button'
import Title from '../components/Title'
import PageHeader from '../components/PageHeader'
import BackButton from '../components/html/BackButton'
import Alert from '../components/Alert'
import helloIcon from '../svg/hello_icon.svg'
import loginPetImg from '../img/illust_login_pet.png'
import xIcon from '../img/x-icon.png'
import eyeOnIcon from '../svg/eye.svg'
import eyeOffIcon from '../svg/eye_off.svg'
import grayCheckIcon from '../img/gray-check.png'
import blueCheckIcon from '../img/blue-check.png'
import { hasAuthAccount, saveAuthAccount } from '../utils/authAccounts'
import { markSignupWelcomeRewardPending } from '../utils/profilePoints'
import { seedSignupNotificationsForUser } from '../utils/userNotifications'
import './Signup.css'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PASSWORD_REGEX = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/

type Terms = {
  all: boolean
  age: boolean
  service: boolean
  privacy: boolean
  marketing: boolean
}

function Signup() {
  const navigate = useNavigate()
  const goingToTermsRef = useRef(false)
  const [email, setEmail] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem('signup_form') ?? '{}').email ?? '' } catch { return '' }
  })
  const [emailError, setEmailError] = useState('')
  const [emailChecked, setEmailChecked] = useState<boolean>(() => {
    try { return JSON.parse(sessionStorage.getItem('signup_form') ?? '{}').emailChecked ?? false } catch { return false }
  })
  const [password, setPassword] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem('signup_form') ?? '{}').password ?? '' } catch { return '' }
  })
  const [passwordError, setPasswordError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [passwordConfirm, setPasswordConfirm] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem('signup_form') ?? '{}').passwordConfirm ?? '' } catch { return '' }
  })
  const [passwordConfirmError, setPasswordConfirmError] = useState('')
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false)
  const [isSignupCompleteOpen, setIsSignupCompleteOpen] = useState(false)
  const [terms, setTerms] = useState<Terms>(() => {
    try {
      const saved = sessionStorage.getItem('signup_terms')
      if (saved) return JSON.parse(saved) as Terms
    } catch { /* */ }
    return { all: false, age: false, service: false, privacy: false, marketing: false }
  })

  useEffect(() => {
    sessionStorage.setItem('signup_form', JSON.stringify({ email, emailChecked, password, passwordConfirm }))
  }, [email, emailChecked, password, passwordConfirm])

  useEffect(() => {
    sessionStorage.setItem('signup_terms', JSON.stringify(terms))
  }, [terms])

  useEffect(() => {
    return () => {
      if (!goingToTermsRef.current) {
        sessionStorage.removeItem('signup_form')
        sessionStorage.removeItem('signup_terms')
      }
      goingToTermsRef.current = false
    }
  }, [])

  const handleEmailChange = (value: string) => {
    setEmail(value)
    setEmailError('')
    setEmailChecked(false)
  }

  const handleEmailBlur = () => {
    if (email.trim() === '') return
    if (!EMAIL_REGEX.test(email)) {
      setEmailError('올바른 이메일을 입력해 주세요.')
    }
  }

  const handleEmailCheck = () => {
    if (!EMAIL_REGEX.test(email)) {
      setEmailError('?щ컮瑜??대찓?쇱쓣 ?낅젰??二쇱꽭??')
      setEmailChecked(false)
      return
    }

    if (hasAuthAccount(email)) {
      setEmailError('이미 가입된 이메일입니다.')
      setEmailChecked(false)
      return
    }

    setEmailError('')
    setEmailChecked(true)
  }

  const handlePasswordChange = (value: string) => {
    setPassword(value)
    setPasswordError('')
  }

  const handlePasswordBlur = () => {
    if (password === '') return
    if (!PASSWORD_REGEX.test(password)) {
      setPasswordError('숫자, 영문, 특수문자 조합 최소 8자를 입력해 주세요.')
    }
  }

  const handlePasswordConfirmChange = (value: string) => {
    setPasswordConfirm(value)
    setPasswordConfirmError('')
  }

  const handlePasswordConfirmBlur = () => {
    if (passwordConfirm === '') return
    if (password !== passwordConfirm) {
      setPasswordConfirmError('비밀번호가 일치하지 않습니다.')
    }
  }

  const allRequiredChecked = terms.age && terms.service && terms.privacy
  const isFormValid =
    email.trim() !== '' &&
    emailChecked &&
    password.length >= 8 &&
    password === passwordConfirm &&
    allRequiredChecked

  const handleTermToggle = (key: keyof Terms) => {
    if (key === 'all') {
      const next = !terms.all
      setTerms({ all: next, age: next, service: next, privacy: next, marketing: next })
    } else {
      setTerms((prev) => {
        const next = { ...prev, [key]: !prev[key] }
        next.all = next.age && next.service && next.privacy && next.marketing
        return next
      })
    }
  }

  const handleSubmit = (e: { preventDefault(): void }) => {
    e.preventDefault()
    if (!isFormValid) return
    if (hasAuthAccount(email)) {
      setEmailError('이미 가입된 이메일입니다.')
      setEmailChecked(false)
      return
    }

    saveAuthAccount({
      id: email,
      password,
    })
    markSignupWelcomeRewardPending(email)
    seedSignupNotificationsForUser(email)
    sessionStorage.removeItem('signup_terms')
    sessionStorage.removeItem('signup_form')
    setIsSignupCompleteOpen(true)
  }

  return (
    <>
      <PageHeader title="회원가입" leftContent={<BackButton to="/login" />} />
      <div className="signup_wrapper">
      <div className="signup_page">
      <div className="signup_hero">
        <Title
          as="h2"
          className="signup_hero_copy"
          title={(
            <>
              집사인생에 오신 것을<br />환영해요{' '}
              <img src={helloIcon} alt="" aria-hidden="true" width={24} height={24} className="signup_hello_icon" />
            </>
          )}
        >
          <p className="signup_hero_sub">
            반려동물과 함께하는 소중한 순간을<br />기록하고 관리해 보세요.
          </p>
        </Title>
        <img src={loginPetImg} alt="반려동물 일러스트" className="signup_hero_img" />
      </div>

      <form className="signup_form" onSubmit={handleSubmit}>
        {/* 이메일 */}
        <div className="signup_section">
          <span className="signup_label">이메일</span>
          <div className="signup_email_field">
            <div className="signup_email_row">
              <Input
                value={email}
                type="email"
                placeholder="이메일을 입력해 주세요"
                ariaLabel="이메일"
                className={`signup_input${email ? ' signup_input_filled' : ''}`}
                onChange={handleEmailChange}
                onBlur={handleEmailBlur}
              />
              <button
                type="button"
                className={`signup_check_btn${emailChecked ? ' is_checked' : ''}`}
                onClick={handleEmailCheck}
                disabled={emailError !== '' || email.trim() === ''}
              >
                중복확인
              </button>
            </div>
            {emailError && <span className="signup_email_error">{emailError}</span>}
            {emailChecked && <span className="signup_email_success">사용 가능한 이메일입니다.</span>}
          </div>
        </div>

        {/* 비밀번호 */}
        <div className="signup_section">
          <span className="signup_label">비밀번호</span>
          <div className="signup_inputs">
            <div className="signup_pw_field_wrap">
              <div className="signup_pw_field">
                <Input
                  value={password}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="숫자, 영문, 특수문자 조합 최소 8자"
                  ariaLabel="비밀번호"
                  className="signup_input"
                  onChange={handlePasswordChange}
                  onBlur={handlePasswordBlur}
                />
                {password && (
                  <div className="signup_pw_icons">
                    <button
                      type="button"
                      className="signup_pw_icon_btn"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
                    >
                      <img src={showPassword ? eyeOnIcon : eyeOffIcon} alt="" width={showPassword ? 18 : 16} height={showPassword ? 18 : 16} />
                    </button>
                    <button
                      type="button"
                      className="signup_pw_icon_btn"
                      onClick={() => setPassword('')}
                      aria-label="비밀번호 지우기"
                    >
                      <img src={xIcon} alt="" width={12} height={12} />
                    </button>
                  </div>
                )}
              </div>
              {passwordError && <span className="signup_pw_error">{passwordError}</span>}
            </div>

            <div className="signup_pw_field_wrap">
              <div className="signup_pw_field">
                <Input
                  value={passwordConfirm}
                  type={showPasswordConfirm ? 'text' : 'password'}
                  placeholder="비밀번호 재입력"
                  ariaLabel="비밀번호 재입력"
                  className="signup_input"
                  onChange={handlePasswordConfirmChange}
                  onBlur={handlePasswordConfirmBlur}
                />
                {passwordConfirm && (
                  <div className="signup_pw_icons">
                    <button
                      type="button"
                      className="signup_pw_icon_btn"
                      onClick={() => setShowPasswordConfirm((v) => !v)}
                      aria-label={showPasswordConfirm ? '비밀번호 재입력 숨기기' : '비밀번호 재입력 보기'}
                    >
                      <img src={showPasswordConfirm ? eyeOnIcon : eyeOffIcon} alt="" width={showPasswordConfirm ? 18 : 16} height={showPasswordConfirm ? 18 : 16} />
                    </button>
                    <button
                      type="button"
                      className="signup_pw_icon_btn"
                      onClick={() => setPasswordConfirm('')}
                      aria-label="비밀번호 재입력 지우기"
                    >
                      <img src={xIcon} alt="" width={12} height={12} />
                    </button>
                  </div>
                )}
              </div>
              {passwordConfirmError && <span className="signup_pw_error">{passwordConfirmError}</span>}
            </div>
          </div>
        </div>


        {/* 약관동의 */}
        <div className="signup_section">
          <span className="signup_label">약관동의</span>
          <div className="signup_terms_card">
            <button
              type="button"
              className="signup_terms_row signup_terms_all"
              onClick={() => handleTermToggle('all')}
            >
              <span className={`signup_terms_check${terms.all ? ' is_active' : ''}`} aria-hidden="true">
                <img src={grayCheckIcon} className="signup_terms_icon signup_terms_icon_gray" alt="" width={32} height={32} />
                <img src={blueCheckIcon} className="signup_terms_icon signup_terms_icon_blue" alt="" width={32} height={32} />
              </span>
              <span className="signup_terms_text signup_terms_text_bold">모두 동의합니다.</span>
            </button>

            <div className="signup_terms_divider" />

            <button
              type="button"
              className="signup_terms_row"
              onClick={() => handleTermToggle('age')}
            >
              <span className={`signup_terms_check${terms.age ? ' is_active' : ''}`} aria-hidden="true">
                <img src={grayCheckIcon} className="signup_terms_icon signup_terms_icon_gray" alt="" width={32} height={32} />
                <img src={blueCheckIcon} className="signup_terms_icon signup_terms_icon_blue" alt="" width={32} height={32} />
              </span>
              <span className="signup_terms_text">
                만 14세 이상입니다.{' '}
                <span className="signup_terms_required">(필수)</span>
              </span>
            </button>

            <button
              type="button"
              className="signup_terms_row"
              onClick={() => handleTermToggle('service')}
            >
              <span className={`signup_terms_check${terms.service ? ' is_active' : ''}`} aria-hidden="true">
                <img src={grayCheckIcon} className="signup_terms_icon signup_terms_icon_gray" alt="" width={32} height={32} />
                <img src={blueCheckIcon} className="signup_terms_icon signup_terms_icon_blue" alt="" width={32} height={32} />
              </span>
              <span className="signup_terms_text">
                서비스 이용약관에 동의합니다.{' '}
                <span className="signup_terms_required">(필수)</span>
              </span>
              <button
                type="button"
                className="signup_terms_chevron_btn"
                onClick={(e) => { e.stopPropagation(); goingToTermsRef.current = true; navigate('/signup/terms/service') }}
                aria-label="서비스 이용약관 상세 보기"
              >
                <i className="bx bx-chevron-right signup_terms_chevron" aria-hidden="true" />
              </button>
            </button>

            <button
              type="button"
              className="signup_terms_row"
              onClick={() => handleTermToggle('privacy')}
            >
              <span className={`signup_terms_check${terms.privacy ? ' is_active' : ''}`} aria-hidden="true">
                <img src={grayCheckIcon} className="signup_terms_icon signup_terms_icon_gray" alt="" width={32} height={32} />
                <img src={blueCheckIcon} className="signup_terms_icon signup_terms_icon_blue" alt="" width={32} height={32} />
              </span>
              <span className="signup_terms_text">
                개인정보 수집 이용에 동의합니다.{' '}
                <span className="signup_terms_required">(필수)</span>
              </span>
              <button
                type="button"
                className="signup_terms_chevron_btn"
                onClick={(e) => { e.stopPropagation(); goingToTermsRef.current = true; navigate('/signup/terms/privacy') }}
                aria-label="개인정보 수집 이용 상세 보기"
              >
                <i className="bx bx-chevron-right signup_terms_chevron" aria-hidden="true" />
              </button>
            </button>

            <button
              type="button"
              className="signup_terms_row"
              onClick={() => handleTermToggle('marketing')}
            >
              <span className={`signup_terms_check${terms.marketing ? ' is_active' : ''}`} aria-hidden="true">
                <img src={grayCheckIcon} className="signup_terms_icon signup_terms_icon_gray" alt="" width={32} height={32} />
                <img src={blueCheckIcon} className="signup_terms_icon signup_terms_icon_blue" alt="" width={32} height={32} />
              </span>
              <span className="signup_terms_text">
                이벤트 할인 혜택 알림 수신에 동의합니다.{' '}
                <span className="signup_terms_optional">(선택)</span>
              </span>
            </button>
          </div>
        </div>

        <Button
          type="submit"
          className="purple_btn"
          disabled={!isFormValid}
        >
          회원가입 하기
        </Button>
      </form>
    </div>
    </div>
    {isSignupCompleteOpen && (
      <Alert dialogClassName="signup_complete_dialog" onClose={() => navigate('/login')}>
        <Title as="h3" title="회원가입이 완료되었습니다." className="signup_complete_title">
          <p className="h4_regular">로그인 후 서비스를 이용해보세요.</p>
        </Title>
        <button type="button" className="purple_btn" onClick={() => navigate('/login')}>
          로그인하기
        </button>
      </Alert>
    )}
    </>
  )
}

export default Signup
