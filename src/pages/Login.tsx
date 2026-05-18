import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import Button from '../components/html/Button'
import Input from '../components/html/Input'
import Title from '../components/Title'
import loginPetImg from '../img/illust_login_pet.png'
import helloIcon from '../svg/hello_icon.svg'
import xIcon from '../img/x-icon.png'
import eyeOnIcon from '../svg/eye.svg'
import eyeOffIcon from '../svg/eye_off.svg'
import { findAuthAccount, markLoggedIn, shouldShowProfileSetupForAccount } from '../utils/authAccounts'
import './Login.css'

function Login() {
  const [id, setId] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const navigate = useNavigate()

  const handleSubmit = () => {
    if (!id.trim() && !password.trim()) {
      setError('아이디와 비밀번호를 입력해 주세요.')
      return
    }
    const account = findAuthAccount(id, password)

    if (account) {
      setError('')
      markLoggedIn(account)
      navigate(shouldShowProfileSetupForAccount(account) ? '/onboarding?setup=profile' : '/home')
    } else {
      setError('아이디 또는 비밀번호가 잘못 입력되었습니다.')
    }
  }

  return (
    <div className="login_page">
      <div className="login_hero">
        <Title
          as="h2"
          className="login_hero_text"
          title={(
            <>
              집사인생에 오신 것을<br />환영해요 <img src={helloIcon} alt="" aria-hidden="true" width={28} height={28} style={{ verticalAlign: '-4px' }} />
            </>
          )}
        >
          <p>반려동물과 함께하는 소중한 순간을<br />기록하고 관리해 보세요.</p>
        </Title>
        <img src={loginPetImg} alt="반려동물 일러스트" className="login_hero_img" />
      </div>

      <div className="login_middle">
        <form
          className="login_form"
          onSubmit={(e) => { e.preventDefault(); handleSubmit() }}
        >
          <div className="login_inputs">
            <div className="login_input_wrap">
              <Input value={id} placeholder="아이디 입력" onChange={(v) => { setId(v); setError('') }} />
              {id && (
                <div className="login_input_actions">
                  <button type="button" className="login_input_clear" onClick={() => { setId(''); setError('') }}>
                    <img src={xIcon} alt="" width={12} height={12} />
                  </button>
                </div>
              )}
            </div>
            <div className="login_input_wrap">
              <Input value={password} placeholder="비밀번호 입력" type={showPassword ? 'text' : 'password'} onChange={(v) => { setPassword(v); setError('') }} />
              {password && (
                <div className="login_input_actions">
                  <button type="button" className="login_input_eye" onClick={() => setShowPassword((p) => !p)}>
                    <img src={showPassword ? eyeOnIcon : eyeOffIcon} alt="" width={showPassword ? 18 : 16} height={showPassword ? 18 : 16} />
                  </button>
                  {password && (
                    <button type="button" className="login_input_clear" onClick={() => { setPassword(''); setError('') }}>
                      <img src={xIcon} alt="" width={12} height={12} />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
          {error && <p className="login_error">{error}</p>}
          <Button
            type="submit"
            className={`purple_btn${!id.trim() && !password.trim() ? ' is_disabled' : ''}`}
            aria-disabled={!id.trim() && !password.trim()}
          >
            로그인
          </Button>
        </form>

        <Link to="#" className="login_guest_link" onClick={() => { setId('hello@jipsa.app'); setPassword('123456') }}>체험용 계정으로 둘러보기</Link>

        <div className="login_social">
          <div className="login_social_divider">
            <hr />
            <span>간편 로그인</span>
            <hr />
          </div>
          <div className="login_social_buttons">
            <Button className="social_btn kakao_btn" aria-label="카카오로 로그인">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 3C6.48 3 2 6.69 2 11.27c0 2.86 1.77 5.38 4.45 6.9l-.88 3.24 3.77-2.04c.86.19 1.75.29 2.66.29 5.52 0 10-3.69 10-8.27C22 6.69 17.52 3 12 3z" />
              </svg>
            </Button>
            <Button className="social_btn google_btn" aria-label="구글로 로그인">
              <svg viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            </Button>
            <Button className="social_btn naver_btn" aria-label="네이버로 로그인">
              <svg viewBox="0 0 24 24" fill="white">
                <path d="M16.273 12.845L7.376 0H0v24h7.727V11.155L16.624 24H24V0h-7.727z" />
              </svg>
            </Button>
            <Button className="social_btn apple_btn" aria-label="애플로 로그인">
              <svg viewBox="0 0 24 24" fill="white">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
              </svg>
            </Button>
          </div>
        </div>
      </div>

      <div className="login_bottom">
        <div className="login_links">
          <Link to="#">아이디 찾기</Link>
          <span>|</span>
          <Link to="#">비밀번호 찾기</Link>
          <span>|</span>
          <Link to="/signup">회원가입</Link>
        </div>
        <p className="login_promo">
          <span>지금 가입하면, </span>
          <strong>1000P 증정!</strong>
        </p>
      </div>
    </div>
  )
}

export default Login
