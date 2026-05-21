import { useEffect } from 'react'
import { useNavigate } from 'react-router'
import { AUTH_LOGGED_IN_STORAGE_KEY } from '../utils/authAccounts'
import { homeCriticalImageSources } from './Home'
import './Splash.css'

const SPLASH_SEEN_KEY = 'jibsalife.splash.seen'
const MIN_SPLASH_MS = 1500

function preloadImage(src: string): Promise<void> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => resolve()
    img.onerror = () => resolve()
    img.src = src
  })
}

function Splash() {
  const navigate = useNavigate()

  useEffect(() => {
    const isLoggedIn = localStorage.getItem(AUTH_LOGGED_IN_STORAGE_KEY) === 'true'
    const destination = isLoggedIn ? '/home' : '/onboarding'

    const minTimer = new Promise<void>((resolve) => setTimeout(resolve, MIN_SPLASH_MS))
    const imageLoads = Promise.all(homeCriticalImageSources.map(preloadImage))

    let cancelled = false

    Promise.all([minTimer, imageLoads]).then(() => {
      if (cancelled) return
      sessionStorage.setItem(SPLASH_SEEN_KEY, 'true')
      navigate(destination, { replace: true })
    })

    return () => { cancelled = true }
  }, [navigate])

  return (
    <main className="splash_page" aria-label="집사인생 시작 화면">
      <img className="splash_icon" src="/icon-512.png" alt="집사인생" />
    </main>
  )
}

export default Splash
