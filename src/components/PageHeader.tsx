import { useLayoutEffect } from 'react'
import type { HeaderProps } from './Header'
import { useHeaderContext } from '../contexts/HeaderContext'

function PageHeader({ title, leftContent, rightContent }: HeaderProps) {
  const setHeader = useHeaderContext()

  useLayoutEffect(() => {
    setHeader({ title, leftContent, rightContent })

    return () => {
      setHeader(null)
    }
  }, [setHeader, title, leftContent, rightContent])

  return null
}

export default PageHeader
