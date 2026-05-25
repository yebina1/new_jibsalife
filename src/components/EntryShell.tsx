import { forwardRef } from 'react'
import type { HTMLAttributes, ReactNode } from 'react'
import './EntryShell.css'

type EntryShellProps = HTMLAttributes<HTMLElement> & {
  as?: 'div' | 'main' | 'section'
  children: ReactNode
}

const EntryShell = forwardRef<HTMLElement, EntryShellProps>(function EntryShell(
  {
    as: Component = 'div',
    className,
    children,
    ...props
  },
  ref,
) {
  const shellClassName = className ? `entry_shell ${className}` : 'entry_shell'

  return (
    <Component ref={ref as never} className={shellClassName} {...props}>
      {children}
    </Component>
  )
})

export default EntryShell
