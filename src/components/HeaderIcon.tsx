import { useEffect, useState } from 'react'
import {
  NOTIFICATION_READ_CHANGE_EVENT,
  readUnreadNotificationCount,
} from '../utils/notificationState'
import { USER_NOTIFICATIONS_CHANGE_EVENT } from '../utils/userNotifications'

type HeaderIconType = 'calendar' | 'notification' | 'search' | 'settings'

type HeaderIconProps = {
  type: HeaderIconType
  size?: number
}

function NotificationBellIcon({ size }: { size?: number }) {
  const [unreadCount, setUnreadCount] = useState(() => readUnreadNotificationCount())

  useEffect(() => {
    const update = () => setUnreadCount(readUnreadNotificationCount())
    window.addEventListener(NOTIFICATION_READ_CHANGE_EVENT, update)
    window.addEventListener(USER_NOTIFICATIONS_CHANGE_EVENT, update)
    return () => {
      window.removeEventListener(NOTIFICATION_READ_CHANGE_EVENT, update)
      window.removeEventListener(USER_NOTIFICATIONS_CHANGE_EVENT, update)
    }
  }, [])

  const hasUnread = unreadCount > 0
  const badgeLabel = unreadCount > 99 ? '99+' : String(unreadCount)
  const sizeStyle = size ? { width: size, height: size } : undefined

  return (
    <span className={`header_notification_icon_wrap${hasUnread ? ' is_unread' : ''}`}>
      <svg
        className="header_icon"
        viewBox="0 0 28 28"
        fill="none"
        aria-hidden="true"
        style={sizeStyle}
      >
        <path d="M18.65 20c0 2.57-2.08 4.65-4.65 4.65S9.35 22.57 9.35 20" />
        <path d="M14 4.55c2.1 0 4.1.9 5.55 2.45 1.3 1.4 2 4.05 2.43 6.75.34 2.12.58 4.25.72 5.5.06.58-.4 1.05-1 1.05H6.3c-.6 0-1.06-.47-1-1.05.14-1.25.38-3.38.72-5.5C6.45 11.05 7.15 8.4 8.45 7A7.55 7.55 0 0 1 14 4.55Z" />
      </svg>
      {hasUnread && (
        <span
          className="header_notification_badge"
          aria-label={`읽지 않은 알림 ${unreadCount}개`}
        >
          {badgeLabel}
        </span>
      )}
    </span>
  )
}

function HeaderIcon({ type, size }: HeaderIconProps) {
  const sizeStyle = size ? { width: size, height: size } : undefined

  if (type === 'calendar') {
    return (
      <svg className="header_icon" viewBox="0 0 28 28" fill="none" aria-hidden="true" style={sizeStyle}>
        <rect x="4.75" y="5.75" width="18.5" height="17.5" rx="2.25" />
        <path d="M4.75 10.25h18.5" />
        <path d="M19.75 3.5v3" />
        <path d="M8.25 3.5v3" />
      </svg>
    )
  }

  if (type === 'search') {
    return (
      <svg className="header_icon" viewBox="0 0 28 28" fill="none" aria-hidden="true" style={sizeStyle}>
        <circle cx="12.25" cy="12.25" r="6.75" />
        <path d="m17.25 17.25 5.25 5.25" />
      </svg>
    )
  }

  if (type === 'settings') {
    return (
      <svg className="header_icon" viewBox="0 0 28 28" fill="none" aria-hidden="true" style={sizeStyle}>
        <path d="M15.8 4.25h-3.6l-.55 2.65a7.9 7.9 0 0 0-1.85.76L7.55 6.2 5 8.75l1.46 2.25a8 8 0 0 0-.77 1.86L3.1 13.45v3.6l2.59.59c.19.65.45 1.27.77 1.86L5 21.75l2.55 2.55 2.25-1.46c.58.32 1.2.58 1.85.76l.55 2.65h3.6l.55-2.65a7.9 7.9 0 0 0 1.85-.76l2.25 1.46L23 21.75l-1.46-2.25c.32-.59.58-1.21.77-1.86l2.59-.59v-3.6l-2.59-.59A8 8 0 0 0 21.54 11L23 8.75 20.45 6.2 18.2 7.66a7.9 7.9 0 0 0-1.85-.76l-.55-2.65Z" />
        <circle cx="14" cy="15.25" r="4.15" />
      </svg>
    )
  }

  return <NotificationBellIcon size={size} />
}

export default HeaderIcon
