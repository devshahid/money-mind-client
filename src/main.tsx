import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { QueryClientProvider } from '@tanstack/react-query'
import CssBaseline from '@mui/material/CssBaseline'
import { GlobalStyles } from '@mui/material'

import { App } from './App'
import { store } from './store'
import { LayoutProvider } from './shared/contexts/LayoutContext'
import { SnackbarProvider } from './shared/contexts/SnackBarContext'
import { GlobalSnackbar } from './shared/components/GlobalSnackbar'
import { ColorContextProvider } from './shared/contexts/ThemeContext'
import { globalStyles } from './shared/styles'
import { queryClient } from './shared/services/queryClient'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SnackbarProvider>
      <LayoutProvider>
        <ColorContextProvider>
          <Provider store={store}>
            <QueryClientProvider client={queryClient}>
              <CssBaseline />
              <GlobalStyles styles={globalStyles} />
              <App />
              <GlobalSnackbar />
            </QueryClientProvider>
          </Provider>
        </ColorContextProvider>
      </LayoutProvider>
    </SnackbarProvider>
  </StrictMode>
)
