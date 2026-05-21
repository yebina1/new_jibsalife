import { createContext, useContext } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import type { HeaderProps } from '../components/Header'

export type HeaderConfig = HeaderProps | null

export const HeaderContext = createContext<Dispatch<SetStateAction<HeaderConfig>> | null>(null)

export function useHeaderContext() {
  const setHeader = useContext(HeaderContext)

  if (!setHeader) {
    throw new Error('useHeaderContext must be used inside HeaderContext.Provider')
  }

  return setHeader
}
