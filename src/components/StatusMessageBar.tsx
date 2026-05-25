import { useEffect, useRef, useState } from 'react'
import './StatusMessageBar.css'
import {
  STATE_BAR_MESSAGE_EVENT,
  type StateBarMessageDetail,
  type StateBarMessagePlacement,
  type StateBarMessageVariant,
} from '../utils/stateBarMessage'

type ToastItem = {
  id: number
  message: string
  placement: StateBarMessagePlacement
  closeButton: boolean
  duration: number
  variant: StateBarMessageVariant
  actionLabel?: string
  onAction?: () => void
}

function getToastVariant(message: string): StateBarMessageVariant {
  if (/(오류|에러|실패|문제가)/.test(message)) {
    return 'error'
  }

  if (/(완료|성공|등록|저장|참여되었|참여되었습니다|발급)/.test(message)) {
    return 'success'
  }

  if (/(아직|주의|필요|확인|미참여)/.test(message)) {
    return 'warning'
  }

  return 'info'
}

function getToastIconName(variant: StateBarMessageVariant) {
  switch (variant) {
    case 'success':
      return 'check'
    case 'warning':
      return 'priority_high'
    case 'error':
      return 'close'
    default:
      return 'info'
  }
}

function StatusMessageBar() {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const nextIdRef = useRef(0)
  const processedEventIdsRef = useRef(new Set<number>())

  useEffect(() => {
    const removeToast = (id: number) => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id))
    }

    const handleMessage = (event: Event) => {
      const detail = (event as CustomEvent<StateBarMessageDetail>).detail
      if (!detail?.message) return

      if (typeof detail.eventId === 'number') {
        const globalWindow = window as typeof window & {
          __processedStateBarMessageIds?: Set<number>
        }
        const processedIds = globalWindow.__processedStateBarMessageIds ?? new Set<number>()
        globalWindow.__processedStateBarMessageIds = processedIds

        if (processedIds.has(detail.eventId) || processedEventIdsRef.current.has(detail.eventId)) {
          return
        }

        processedIds.add(detail.eventId)
        processedEventIdsRef.current.add(detail.eventId)

        window.setTimeout(() => {
          processedIds.delete(detail.eventId!)
          processedEventIdsRef.current.delete(detail.eventId!)
        }, Math.max(detail.duration ?? 3000, 1000))
      }

      const placement: StateBarMessagePlacement =
        detail.placement ?? (detail.message.includes('알림') ? 'notification' : 'footer')

      const id = nextIdRef.current++
      const duration = detail.duration ?? 3000

      setToasts((prev) => [
        ...prev,
        {
          id,
          message: detail.message,
          placement,
          closeButton: detail.closeButton ?? true,
          duration,
          variant: detail.variant ?? getToastVariant(detail.message),
          actionLabel: detail.actionLabel,
          onAction: detail.onAction,
        },
      ])

      window.setTimeout(() => removeToast(id), duration)
    }

    window.addEventListener(STATE_BAR_MESSAGE_EVENT, handleMessage)
    return () => window.removeEventListener(STATE_BAR_MESSAGE_EVENT, handleMessage)
  }, [])

  const remove = (id: number) => setToasts((prev) => prev.filter((toast) => toast.id !== id))

  const footerToasts = toasts.filter((toast) => toast.placement === 'footer')
  const notificationToasts = toasts.filter((toast) => toast.placement === 'notification')
  const sheetToasts = toasts.filter((toast) => toast.placement === 'sheet')

  const renderInner = (toast: ToastItem) => (
    <div
      key={toast.id}
      className={`status_message_bar_inner status_message_bar_inner_${toast.variant}`}
      style={{ ['--toast-duration' as string]: `${toast.duration}ms` }}
    >
      <span className="status_message_bar_icon" aria-hidden="true">
        <span className="material-icons status_message_bar_icon_glyph">
          {getToastIconName(toast.variant)}
        </span>
      </span>

      <div className="status_message_bar_content">
        <p className="status_message_bar_text">{toast.message}</p>
        {toast.actionLabel && toast.onAction ? (
          <button
            type="button"
            className="status_message_bar_badge"
            onClick={() => {
              toast.onAction?.()
              remove(toast.id)
            }}
          >
            {toast.actionLabel}
          </button>
        ) : null}
      </div>

      {toast.closeButton ? (
        <button
          type="button"
          className="status_message_bar_close"
          aria-label="닫기"
          onClick={() => remove(toast.id)}
        >
          <span className="material-icons" aria-hidden="true">
            close
          </span>
        </button>
      ) : null}

      <span className="status_message_bar_progress" aria-hidden="true" />
    </div>
  )

  return (
    <>
      {footerToasts.length > 0 ? (
        <div className="status_message_bar" role="status" aria-live="polite" aria-atomic="false">
          {footerToasts.map(renderInner)}
        </div>
      ) : null}

      {notificationToasts.map((toast) => (
        <div
          key={toast.id}
          className="status_message_bar status_message_bar_notification"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          {renderInner(toast)}
        </div>
      ))}

      {sheetToasts.map((toast) => (
        <div
          key={toast.id}
          className="status_message_bar status_message_bar_sheet"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          {renderInner(toast)}
        </div>
      ))}
    </>
  )
}

export default StatusMessageBar
