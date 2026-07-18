import { createContext, useContext, useState, useEffect, useCallback, useMemo, type JSX } from 'react'
import type { ReactNode } from 'react'

import { useResponsive } from '../hooks/useResponsive'

type DrawerMode = 'temporary' | 'permanent'

type NavigationState = {
  isDrawerOpen: boolean
  isCollapsed: boolean
  drawerMode: DrawerMode
}

type NavigationActions = {
  openDrawer: () => void
  closeDrawer: () => void
  toggleCollapse: () => void
}

type NavigationContextValue = NavigationState & NavigationActions

const COLLAPSED_STORAGE_KEY = 'money-mind-sidebar-collapsed'

const getPersistedCollapsed = (): boolean => {
  try {
    const stored = localStorage.getItem(COLLAPSED_STORAGE_KEY)
    return stored === 'true'
  } catch {
    return false
  }
}

const NavigationContext = createContext<NavigationContextValue | null>(null)

type NavigationProviderProps = {
  children: ReactNode
}

export const NavigationProvider = ({ children }: NavigationProviderProps): JSX.Element => {
  const { isDesktop } = useResponsive()
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(getPersistedCollapsed)

  const drawerMode: DrawerMode = isDesktop ? 'permanent' : 'temporary'

  useEffect(() => {
    if (isDesktop && isDrawerOpen) {
      setIsDrawerOpen(false)
    }
  }, [isDesktop, isDrawerOpen])

  const openDrawer = useCallback(() => setIsDrawerOpen(true), [])
  const closeDrawer = useCallback(() => setIsDrawerOpen(false), [])

  const toggleCollapse = useCallback(() => {
    setIsCollapsed(prev => {
      const next = !prev
      try {
        localStorage.setItem(COLLAPSED_STORAGE_KEY, String(next))
      } catch {
        // localStorage unavailable — silently ignore
      }
      return next
    })
  }, [])

  const value = useMemo<NavigationContextValue>(
    () => ({
      isDrawerOpen,
      isCollapsed,
      drawerMode,
      openDrawer,
      closeDrawer,
      toggleCollapse,
    }),
    [isDrawerOpen, isCollapsed, drawerMode, openDrawer, closeDrawer, toggleCollapse]
  )

  return <NavigationContext.Provider value={value}>{children}</NavigationContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export const useNavigation = (): NavigationContextValue => {
  const context = useContext(NavigationContext)

  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider')
  }

  return context
}
