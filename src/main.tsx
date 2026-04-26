import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import CssBaseline from '@mui/material/CssBaseline'

import { App } from './App'
import { store } from './store'
import { LayoutProvider } from './shared/contexts/LayoutContext'
import { SnackbarProvider } from './shared/contexts/SnackBarContext'
import { GlobalSnackbar } from './shared/components/GlobalSnackbar'
import { ColorContextProvider } from './shared/contexts/ThemeContext'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SnackbarProvider>
      <LayoutProvider>
        <ColorContextProvider>
          <Provider store={store}>
            <CssBaseline />
            <App />
            <GlobalSnackbar />
          </Provider>
        </ColorContextProvider>
      </LayoutProvider>
    </SnackbarProvider>
  </StrictMode>
)
