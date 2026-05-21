import { isValidElement, useEffect, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router'
import './Button.css'
import {
  MISSION_ACTIVITY_RECORDS_CHANGE_EVENT,
  MISSION_HISTORY_RECORDS_CHANGE_EVENT,
  NOTIFICATION_READ_CHANGE_EVENT,
  shouldShowNotificationDot,
} from '../../utils/notificationState'

type Buttonprops = React.ComponentPropsWithRef<'button'> & {
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
  iconWrapper?: boolean
  buttonVariant?: 'default' | 'icon' | 'challenge'
}

function hasNotificationIcon(node: ReactNode): boolean {
  if (Array.isArray(node)) {
    return node.some(hasNotificationIcon)
  }

  if (!isValidElement(node)) {
    return false
  }

  const props = node.props as { type?: unknown; children?: ReactNode }

  return props.type === 'notification' || hasNotificationIcon(props.children)
}

export default function Button(props: Buttonprops) {
  const navigate = useNavigate()
  const {
    children,
    className,
    icon,
    iconPosition = 'left',
    iconWrapper = true,
    buttonVariant = 'default',
    disabled,
    onClick,
    ...rest
  } = props

  const ariaLabel = String(rest['aria-label'] ?? '')
  const notificationSignature = `${ariaLabel} ${className ?? ''}`.toLowerCase()
  const isNotificationButton =
    notificationSignature.includes('notification') ||
    notificationSignature.includes('\uC54C\uB9BC') ||
    notificationSignature.includes('알림') ||
    notificationSignature.includes('알림')

  const isNotificationIconButton =
    isNotificationButton || hasNotificationIcon(children) || hasNotificationIcon(icon)

  const [shouldShowNotification, setShouldShowNotification] = useState(
    () => (isNotificationIconButton ? shouldShowNotificationDot() : false),
  )

  useEffect(() => {
    if (!isNotificationIconButton) return

    const syncNotificationState = () => {
      setShouldShowNotification(shouldShowNotificationDot())
    }

    window.addEventListener(MISSION_ACTIVITY_RECORDS_CHANGE_EVENT, syncNotificationState)
    window.addEventListener(MISSION_HISTORY_RECORDS_CHANGE_EVENT, syncNotificationState)
    window.addEventListener(NOTIFICATION_READ_CHANGE_EVENT, syncNotificationState)
    window.addEventListener('storage', syncNotificationState)

    return () => {
      window.removeEventListener(MISSION_ACTIVITY_RECORDS_CHANGE_EVENT, syncNotificationState)
      window.removeEventListener(MISSION_HISTORY_RECORDS_CHANGE_EVENT, syncNotificationState)
      window.removeEventListener(NOTIFICATION_READ_CHANGE_EVENT, syncNotificationState)
      window.removeEventListener('storage', syncNotificationState)
    }
  }, [isNotificationIconButton])

  const classNames = [
    className,
    isNotificationIconButton ? 'header_notification_button' : null,
    isNotificationIconButton && shouldShowNotification ? 'is_active' : null,
    disabled && buttonVariant !== 'icon' ? 'is_disabled' : null,
    buttonVariant === 'icon' ? 'button_icon' : null,
    buttonVariant === 'challenge' ? 'button_challenge' : null,
  ]
    .filter(Boolean)
    .join(' ')

  const needsSmallRadiusLabel = classNames.split(' ').includes('s_white_radius_btn')
  const content = needsSmallRadiusLabel ? (
    <span className="s_white_radius_btn_label">{children}</span>
  ) : (
    children
  )
  const iconContent = iconWrapper ? (
    <span className="button_icon_asset" aria-hidden="true">
      {icon}
    </span>
  ) : (
    icon
  )

  return (
    <button
      {...rest}
      disabled={disabled}
      className={classNames}
      onClick={(event) => {
        onClick?.(event)
        if (!event.defaultPrevented && isNotificationIconButton && !onClick) {
          navigate('/notification')
        }
      }}
    >
      {icon && iconPosition === 'left' ? iconContent : null}
      <span className="button_label">{content}</span>
      {icon && iconPosition === 'right' ? iconContent : null}
    </button>
  )
}
