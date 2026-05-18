import { useEffect, useRef, useState } from 'react'
import './StatusMessageBar.css'
import {
  STATE_BAR_MESSAGE_EVENT,
  type StateBarMessageDetail,
  type StateBarMessagePlacement,
} from '../utils/stateBarMessage'

type ToastItem = {
  id: number
  message: string
  placement: StateBarMessagePlacement
  closeButton: boolean
  actionLabel?: string
  onAction?: () => void
}

function StatusMessageBar() {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const nextIdRef = useRef(0)
  const processedEventIdsRef = useRef(new Set<number>())

  useEffect(() => {
    const removeToast = (id: number) => {
      setToasts(prev => prev.filter(t => t.id !== id))
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
      setToasts(prev => [
        ...prev,
        {
          id,
          message: detail.message,
          placement,
          closeButton: detail.closeButton ?? true,
          actionLabel: detail.actionLabel,
          onAction: detail.onAction,
        },
      ])

      window.setTimeout(() => removeToast(id), detail.duration ?? 3000)
    }

    window.addEventListener(STATE_BAR_MESSAGE_EVENT, handleMessage)
    return () => window.removeEventListener(STATE_BAR_MESSAGE_EVENT, handleMessage)
  }, [])

  const remove = (id: number) => setToasts(prev => prev.filter(t => t.id !== id))

  const footerToasts = toasts.filter(t => t.placement === 'footer')
  const notificationToasts = toasts.filter(t => t.placement === 'notification')
  const sheetToasts = toasts.filter(t => t.placement === 'sheet')

  const renderInner = (toast: ToastItem) => (
    <div key={toast.id} className="status_message_bar_inner">
      <p className="status_message_bar_text">{toast.message}</p>
      {toast.actionLabel && toast.onAction && (
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
      )}
      {toast.closeButton && (
        <button
          type="button"
          className="status_message_bar_close"
          aria-label="닫기"
          onClick={() => remove(toast.id)}
        >
          ×
        </button>
      )}
    </div>
  )

  return (
    <>
      {footerToasts.length > 0 && (
        <div className="status_message_bar" role="status" aria-live="polite" aria-atomic="false">
          {footerToasts.map(renderInner)}
        </div>
      )}
      {notificationToasts.map(toast => (
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
      {sheetToasts.map(toast => (
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
