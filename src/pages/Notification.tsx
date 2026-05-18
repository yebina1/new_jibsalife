import { useMemo, useState } from 'react'
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
} from '../utils/userNotifications'

type NotificationItem = {
  id: number
  title: string
  content: string
  time: string
  path: string
}

function toNotificationItem(item: UserNotificationItem): NotificationItem {
  return {
    id: item.id,
    title: item.title,
    content: item.content,
    time: formatRelativeTime(item.createdAt),
    path: item.path,
  }
}

function readInitialReadIds(): Set<number> {
  return readNotificationReadIds()
}

function Notification() {
  const navigate = useNavigate()
  const [readIds, setReadIds] = useState<Set<number>>(readInitialReadIds)
  const notificationItems = useMemo(
    () => readUserNotifications().map(toNotificationItem),
    [],
  )

  const handleItemClick = (item: NotificationItem) => {
    setReadIds((prev) => {
      if (prev.has(item.id)) return prev
      const next = new Set(prev)
      next.add(item.id)
      saveNotificationReadIds(next)
      return next
    })
    navigate(item.path)
  }

  return (
    <div className="notification_page">
      <div className="notification_header">
        <BackButton aria-label="뒤로가기" />
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
