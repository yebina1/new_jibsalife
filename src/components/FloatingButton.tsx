import type { ButtonHTMLAttributes, ReactNode } from 'react'
import './FloatingButton.css'

type FloatingButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  placement?: 'ai' | 'community'
  children: ReactNode
}

function FloatingButton({
  placement = 'ai',
  className,
  children,
  ...props
}: FloatingButtonProps) {
  const classNames = className
    ? `floating_button floating_button_${placement} ${className}`
    : `floating_button floating_button_${placement}`

  return (
    <button type="button" className={classNames} {...props}>
      {children}
    </button>
  )
}

export default FloatingButton
