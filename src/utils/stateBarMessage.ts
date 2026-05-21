export const STATE_BAR_MESSAGE_EVENT = 'state-bar-message'

export type StateBarMessagePlacement = 'footer' | 'notification' | 'sheet' | 'top'

export type StateBarMessageDetail = {
  eventId?: number
  message: string
  duration?: number
  placement?: StateBarMessagePlacement
  closeButton?: boolean
  actionLabel?: string
  onAction?: () => void
}

export type StateBarMessageOptions = {
  placement?: StateBarMessagePlacement
  closeButton?: boolean
  actionLabel?: string
  onAction?: () => void
}

export function showStateBarMessage(
  message: string,
  duration = 3000,
  options: StateBarMessageOptions = {},
) {
  if (typeof window === 'undefined') return

  const globalWindow = window as typeof window & {
    __stateBarMessageEventId?: number
    __stateBarLastMessageSignature?: string
    __stateBarLastMessageAt?: number
  }

  const signature = JSON.stringify({
    message,
    duration,
    placement: options.placement,
    closeButton: options.closeButton,
    actionLabel: options.actionLabel,
  })
  const now = Date.now()
  const lastAt = globalWindow.__stateBarLastMessageAt ?? 0

  if (globalWindow.__stateBarLastMessageSignature === signature && now - lastAt < 400) {
    return
  }

  globalWindow.__stateBarLastMessageSignature = signature
  globalWindow.__stateBarLastMessageAt = now
  globalWindow.__stateBarMessageEventId = (globalWindow.__stateBarMessageEventId ?? 0) + 1

  window.dispatchEvent(
    new CustomEvent<StateBarMessageDetail>(STATE_BAR_MESSAGE_EVENT, {
      detail: {
        eventId: globalWindow.__stateBarMessageEventId,
        message,
        duration,
        placement: options.placement,
        closeButton: options.closeButton,
        actionLabel: options.actionLabel,
        onAction: options.onAction,
      },
    }),
  )
}
