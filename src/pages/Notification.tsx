import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import './Notification.css'
import BackButton from '../components/html/BackButton'
import bellIconImg from '../img/bell-icon.png'
import waitImg from '../img/wait-img.png'
import {
  readNotificationReadIds,
  saveNotificationReadIds,
} from '../utils/notificationState'
import {
  readUserNotifications,
  formatRelativeTime,
  type UserNotificationItem,
  USER_NOTIFICATIONS_CHANGE_EVENT,
} from '../utils/userNotifications'
import { CHALLENGE_STATUS_CHANGED_EVENT } from '../utils/challengeStatus'

type NotificationItem = {
  id: number
  title: string
  content: string
  time: string
  path: string
  state?: unknown
}

function toNotificationItem(item: UserNotificationItem): NotificationItem {
  return {
    id: item.id,
    title: item.title,
    content: item.content,
    time: formatRelativeTime(item.createdAt),
    path: item.path,
    state: item.state,
  }
}

function readInitialReadIds(): Set<number> {
  return readNotificationReadIds()
}

function Notification() {
  const navigate = useNavigate()
  const [readIds, setReadIds] = useState<Set<number>>(readInitialReadIds)
  const [notificationsVersion, setNotificationsVersion] = useState(0)
  const notificationItems = useMemo(
    () => readUserNotifications().map(toNotificationItem),
    [notificationsVersion],
  )

  useEffect(() => {
    const refresh = () => setNotificationsVersion((prev) => prev + 1)

    window.addEventListener(USER_NOTIFICATIONS_CHANGE_EVENT, refresh)
    window.addEventListener(CHALLENGE_STATUS_CHANGED_EVENT, refresh)
    window.addEventListener('storage', refresh)

    return () => {
      window.removeEventListener(USER_NOTIFICATIONS_CHANGE_EVENT, refresh)
      window.removeEventListener(CHALLENGE_STATUS_CHANGED_EVENT, refresh)
      window.removeEventListener('storage', refresh)
    }
  }, [])

  const handleItemClick = (item: NotificationItem) => {
    setReadIds((prev) => {
      if (prev.has(item.id)) return prev
      const next = new Set(prev)
      next.add(item.id)
      saveNotificationReadIds(next)
      return next
    })
    const nextState =
      item.state !== undefined
        ? { ...(typeof item.state === 'object' && item.state !== null ? item.state : {}), returnTo: '/notification' }
        : { returnTo: '/notification' }

    navigate(item.path, { state: nextState })
  }

  return (
    <div className="notification_page">
      <div className="notification_header">
        <BackButton aria-label="뒤로가기" to="/home" />
        <h1 className="notification_title">알림</h1>
      </div>

      <ul className="notification_list">
        {notificationItems.map((item) => (
          <li
            key={item.id}
            className={`notification_item${readIds.has(item.id) ? '' : ' is_unread'}`}
            onClick={() => handleItemClick(item)}
          >
            <img
              src={bellIconImg}
              alt=""
              aria-hidden="true"
              className="notification_icon"
            />
            <div className="notification_body">
              <p className="notification_item_title">{item.title}</p>
              <p className="notification_item_content">{item.content}</p>
            </div>
            <span className="notification_time">{item.time}</span>
          </li>
        ))}
      </ul>

      <div className="notification_empty">
        <p className="notification_empty_text">오늘도 반가운 소식을 기다리는 중!</p>
        <img
          src={waitImg}
          alt=""
          aria-hidden="true"
          className="notification_empty_img"
        />
      </div>
    </div>
  )
}

export default Notification
