/* eslint-disable react-refresh/only-export-components */
import { createContext, JSX, useContext, useState } from 'react'

import type { PropsWithChildren } from 'react'

const LayoutContext = createContext<{
  headerHeight: number
  setHeaderHeight: (height: number) => void
}>({
  headerHeight: 0,
  setHeaderHeight: () => {},
})

export const LayoutProvider = ({ children }: PropsWithChildren): JSX.Element => {
  const [headerHeight, setHeaderHeight] = useState(0)

  return <LayoutContext.Provider value={{ headerHeight, setHeaderHeight }}>{children}</LayoutContext.Provider>
}

export const useLayout = (): {
  headerHeight: number
  setHeaderHeight: (height: number) => void
} => useContext(LayoutContext)
