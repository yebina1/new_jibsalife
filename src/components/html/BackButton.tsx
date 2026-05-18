import { type CSSProperties } from 'react'
import { useNavigate } from 'react-router'
import ChevronIcon from '../ChevronIcon'
import Button from './Button'

type BackButtonProps = {
  to?: number | string
  replace?: boolean
  bgColor?: string
  iconColor?: string
  size?: number
  icon?: React.ReactNode
  className?: string
  style?: CSSProperties
  state?: unknown
  'aria-label'?: string
  onClick?: () => void
}

export default function BackButton({
  to = -1,
  replace = false,
  bgColor,
  iconColor,
  size,
  icon,
  className,
  style,
  state,
  'aria-label': ariaLabel,
  onClick,
}: BackButtonProps) {
  const navigate = useNavigate()

  const handleClick = () => {
    if (onClick) {
      onClick()
      return
    }

    if (typeof to === 'number') {
      navigate(to)
      return
    }

    navigate(to, { replace, state })
  }

  const computedStyle: CSSProperties = {
    ...(bgColor !== undefined ? { backgroundColor: bgColor } : {}),
    ...(iconColor !== undefined ? { color: iconColor } : {}),
    ...(size !== undefined ? { width: size, height: size } : {}),
    ...style,
  }

  return (
    <Button
      type="button"
      aria-label={ariaLabel}
      className={['back_btn', className].filter(Boolean).join(' ')}
      style={Object.keys(computedStyle).length > 0 ? computedStyle : undefined}
      onClick={handleClick}
      icon={icon ?? <ChevronIcon direction="left" size="lg" />}
    />
  )
}
