import { createTheme, PaletteMode, ThemeProvider } from '@mui/material'
import { createContext, JSX, useMemo, useState } from 'react'

import type { PropsWithChildren } from 'react'
import { lightTheme, darkTheme } from '../theme'

const THEME_STORAGE_KEY = 'money-mind-theme-mode'

const getStoredMode = (): PaletteMode => {
  const stored = localStorage.getItem(THEME_STORAGE_KEY)
  if (stored === 'dark' || stored === 'light') return stored
  return 'light'
}

export const ColorModeContext = createContext({
  toggleMode: () => {},
  mode: 'light',
})

export const ColorContextProvider = ({ children }: PropsWithChildren): JSX.Element => {
  const [mode, setMode] = useState<PaletteMode>(getStoredMode)

  const colorMode = useMemo(
    () => ({
      toggleMode: (): void =>
        setMode(prevMode => {
          const newMode = prevMode === 'light' ? 'dark' : 'light'
          localStorage.setItem(THEME_STORAGE_KEY, newMode)
          return newMode
        }),
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
