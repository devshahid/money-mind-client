import { createTheme, PaletteMode, ThemeProvider } from '@mui/material'
import { createContext, JSX, useMemo, useState, useEffect } from 'react'

import type { PropsWithChildren } from 'react'
import { lightTheme, darkTheme } from '../theme'

export const ColorModeContext = createContext({
  toggleMode: () => {},
  mode: 'light',
})

const THEME_STORAGE_KEY = 'app-theme-mode'

export const ColorContextProvider = ({ children }: PropsWithChildren): JSX.Element => {
  // Read from localStorage on initialization
  const [mode, setMode] = useState<PaletteMode>(() => {
    const savedMode = localStorage.getItem(THEME_STORAGE_KEY)
    return savedMode === 'dark' || savedMode === 'light' ? savedMode : 'light'
  })

  // Save to localStorage whenever mode changes
  useEffect(() => {
    localStorage.setItem(THEME_STORAGE_KEY, mode)
  }, [mode])

  const colorMode = useMemo(
    () => ({
      toggleMode: (): void => setMode(prevMode => (prevMode === 'light' ? 'dark' : 'light')),
      mode,
    }),
    [mode]
  )

  const theme = useMemo(() => createTheme(mode === 'light' ? lightTheme : darkTheme), [mode])

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </ColorModeContext.Provider>
  )
}
