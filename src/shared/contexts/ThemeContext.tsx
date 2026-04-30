import { createTheme, PaletteMode, ThemeProvider } from '@mui/material'
import { createContext, JSX, useMemo, useState } from 'react'

import type { PropsWithChildren } from 'react'
import { lightTheme, darkTheme } from '../theme'

export const ColorModeContext = createContext({
  toggleMode: () => {},
  mode: 'light',
})

export const ColorContextProvider = ({ children }: PropsWithChildren): JSX.Element => {
  const [mode, setMode] = useState<PaletteMode>('light')

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
