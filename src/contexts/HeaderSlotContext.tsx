import { createContext, useContext } from 'react'

export const HeaderSlotContext = createContext<HTMLElement | null>(null)

export function useHeaderSlot() {
  return useContext(HeaderSlotContext)
}
