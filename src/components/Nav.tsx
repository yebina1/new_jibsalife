import type { CSSProperties } from 'react'
import './Nav.css'
import { NavLink, useLocation, useNavigate } from 'react-router'
import navCommunicateOffIcon from '../svg/nav_communicate off.svg'
import navHealthOffIcon from '../svg/nav_health off.svg'
import navHomeActiveIcon from '../svg/nav_home active.svg'
import navHomeOffIcon from '../svg/nav_home off.svg'
import navMypageIcon from '../svg/nav_mypage.svg'
import navMypageOffIcon from '../svg/nav_mypage off.svg'

const navItems = [
  { path: '/health/cam', label: '건강', icon: 'health' },
  { path: '/community', label: '커뮤니티', icon: 'community' },
  { path: '/home', label: '홈', icon: 'home' },
  { path: '/place', label: '장소', icon: 'place' },
  { path: '/mypage', label: '마이페이지', icon: 'mypage' },
] as const

const navIconMap = {
  home: {
    active: navHomeActiveIcon,
    inactive: navHomeOffIcon,
  },
  health: navHealthOffIcon,
  community: navCommunicateOffIcon,
  mypage: {
    active: navMypageIcon,
    inactive: navMypageOffIcon,
  },
} as const

function NavIcon({ type, active }: { type: (typeof navItems)[number]['icon']; active: boolean }) {
  const className = active ? 'layout_nav_icon active' : 'layout_nav_icon'

  if (active && type === 'health') {
    return (
      <svg viewBox="0 0 28 28" className={className} aria-hidden="true" fill="currentColor">
        <path d="M15 3C16.6569 3 18 4.34315 18 6V10H22C23.6569 10 25 11.3431 25 13V15C25 16.6569 23.6569 18 22 18H18V22C18 23.6569 16.6569 25 15 25H13C11.3431 25 10 23.6569 10 22V18H6C4.34315 18 3 16.6569 3 15V13C3 11.3431 4.34315 10 6 10H10V6C10 4.34315 11.3431 3 13 3H15Z" />
      </svg>
    )
  }

  if (active && type === 'community') {
    return (
      <svg viewBox="0 0 28 28" className={className} aria-hidden="true" fill="currentColor">
        <path d="M14 4.2c5.9 0 10.8 4.4 10.8 9.8 0 5.5-4.9 9.9-10.8 9.9-1.6 0-3.2-.3-4.6-.9L5 24.5l1.5-4.4c-1.5-1.7-2.3-3.8-2.3-6.1 0-5.4 4.9-9.8 10.8-9.8Z" />
        <circle cx="13.9999" cy="14" r="1.16667" fill="#ffffff" />
        <circle cx="18.6667" cy="14" r="1.16667" fill="#ffffff" />
        <circle cx="9.33342" cy="14" r="1.16667" fill="#ffffff" />
      </svg>
    )
  }

  if (active && type === 'mypage') {
    return (
      <svg viewBox="0 0 28 28" className={`${className} layout_nav_icon_mypage_active`} aria-hidden="true">
        <circle className="layout_nav_icon_mypage_active_bg" cx="14" cy="14" r="11" strokeWidth="1.5" />
        <circle className="layout_nav_icon_mypage_active_face" cx="14" cy="11.5" r="3.5" strokeWidth="1.5" />
        <path
          className="layout_nav_icon_mypage_active_body"
          d="M23.0283 21.4718C21.8427 20.2862 20.4352 19.3457 18.8861 18.7041C17.3371 18.0625 15.6768 17.7322 14.0001 17.7322C12.3234 17.7322 10.6631 18.0625 9.11409 18.7041C7.56503 19.3457 6.15752 20.2862 4.97192 21.4718"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    )
  }

  if (type === 'place') {
    if (active) {
      return (
        <svg
          viewBox="0 0 24 24"
          className={`${className} layout_nav_icon_place`}
          aria-hidden="true"
          fill="currentColor"
        >
          <path d="M12 3.6 19.2 18a1.5 1.5 0 0 1-2.1 2L12 17.2 6.9 20a1.5 1.5 0 0 1-2.1-2L12 3.6Z" />
        </svg>
      )
    }

    return (
      <svg
        viewBox="0 0 24 24"
        className={`${className} layout_nav_icon_place`}
        aria-hidden="true"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 4.2 18.7 18a1.45 1.45 0 0 1-2 1.9L12 17.3l-4.7 2.6a1.45 1.45 0 0 1-2-1.9L12 4.2Z" />
      </svg>
    )
  }

  const icon =
    type === 'home' || type === 'mypage'
      ? active
        ? navIconMap[type].active
        : navIconMap[type].inactive
      : navIconMap[type]

  return (
    <span
      className={`${className} layout_nav_icon_mask`}
      aria-hidden="true"
      style={{ '--layout-nav-icon-url': `url("${icon}")` } as CSSProperties}
    />
  )
}

function Nav() {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  return (
    <nav className="layout_nav" aria-label="주요 메뉴">
      <div className="layout_nav_inner">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.icon === 'community' ? '/community/overview' : item.path}
            onClick={(event) => {
              if (item.icon !== 'community') return

              event.preventDefault()
              navigate('/community/overview', {
                replace: true,
                state: {
                  resetCommunityTabAt: Date.now(),
                },
              })
            }}
            className={({ isActive }) =>
              isActive ||
              (item.icon === 'community' && pathname.startsWith('/community')) ||
              (item.icon === 'health' && pathname.startsWith('/health'))
                ? 'layout_nav_link active'
                : 'layout_nav_link'
            }
          >
            {({ isActive }) => (
              <>
                <NavIcon
                  type={item.icon}
                  active={
                    isActive ||
                    (item.icon === 'community' && pathname.startsWith('/community')) ||
                    (item.icon === 'health' && pathname.startsWith('/health'))
                  }
                />
                <span className="layout_nav_label">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}

export default Nav
