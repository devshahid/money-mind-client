/* eslint-disable react-refresh/only-export-components */
import { createContext, JSX, useState, useContext } from 'react'
import type { AlertColor } from '@mui/material/Alert'
import type { PropsWithChildren } from 'react'

type SnackbarState = {
  open: boolean
  message: string
  severity: AlertColor | undefined
}

type SnackbarContextValue = {
  snackbar: SnackbarState
  showSnackbar: (message: string, severity?: AlertColor) => void
  hideSnackbar: () => void
  showSuccessSnackbar: (message: string) => void
  showWarningSnackbar: (message: string) => void
  showErrorSnackbar: (message: string) => void
}

const SnackbarContext = createContext<SnackbarContextValue | undefined>(undefined)

export const useSnackbar = (): SnackbarContextValue => {
  const context = useContext(SnackbarContext)
  if (!context) {
    throw new Error('useSnackbar must be used within a SnackbarProvider')
  }
  return context
}

export const SnackbarProvider = ({ children }: PropsWithChildren): JSX.Element => {
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: '',
    severity: undefined,
  })

  const showSnackbar = (message: string, severity: AlertColor = 'success'): void => {
    setSnackbar({ open: true, message, severity })
  }

  const hideSnackbar = (): void => {
    setSnackbar({ ...snackbar, open: false })
  }

  const showSuccessSnackbar = (message: string): void => showSnackbar(message, 'success')
  const showWarningSnackbar = (message: string): void => showSnackbar(message, 'warning')
  const showErrorSnackbar = (message: string): void => showSnackbar(message, 'error')

  return (
    <SnackbarContext.Provider
      value={{ snackbar, showSnackbar, hideSnackbar, showSuccessSnackbar, showWarningSnackbar, showErrorSnackbar }}
    >
      {children}
    </SnackbarContext.Provider>
  )
}
