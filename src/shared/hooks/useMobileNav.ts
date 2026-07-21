import { useState, useEffect, useCallback } from 'react'

import { useResponsive } from './useResponsive'

export type UseMobileNavReturn = {
  isOpen: boolean
  open: () => void
  close: () => void
  toggle: () => void
}

export const useMobileNav = (): UseMobileNavReturn => {
  const [isOpen, setIsOpen] = useState(false)
  const { isDesktop } = useResponsive()

  useEffect(() => {
    if (isDesktop) {
      setIsOpen(false)
    }
  }, [isDesktop])

  const open = useCallback(() => setIsOpen(true), [])
  const close = useCallback(() => setIsOpen(false), [])
  const toggle = useCallback(() => setIsOpen(prev => !prev), [])

  return { isOpen, open, close, toggle }
}
