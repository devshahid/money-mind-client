import { createTheme, PaletteMode, ThemeProvider } from '@mui/material'
import { createContext, JSX, useMemo, useState } from 'react'

import type { PropsWithChildren } from 'react'

export const ColorModeContext = createContext({
  toggleMode: () => {},
  mode: 'light',
})

export const ColorContextProvider = ({ children }: PropsWithChildren): JSX.Element => {
  const [mode, setMode] = useState<PaletteMode>('dark')

  const colorMode = useMemo(
    () => ({
      toggleMode: (): void => setMode(prevMode => (prevMode === 'light' ? 'dark' : 'light')),
      mode,
    }),
    [mode]
  )

  const theme = createTheme({
    typography: { fontFamily: 'Lufga, sans-serif' },
    palette: { mode },
  })

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </ColorModeContext.Provider>
  )
}
