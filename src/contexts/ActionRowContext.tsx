import { createContext, useContext } from 'react'

export const ActionRowContext = createContext<HTMLElement | null>(null)

export function useActionRowSlot() {
  return useContext(ActionRowContext)
}
