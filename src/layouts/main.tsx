import { JSX, useState } from 'react'
import { Box } from '@mui/material'
import { Outlet } from 'react-router-dom'

import { ResponsiveSidebar } from './ResponsiveSidebar'
import { Header } from './Header'
import { NavigationProvider } from '../shared/contexts/NavigationContext'
import { LAYOUT } from '../shared/constants/layout'

export type LayoutContextType = {
  setHeader: (heading: string, subheading: string) => void
}

export const Layout = (): JSX.Element => {
  const [heading, setHeading] = useState('Welcome Back')
  const [subheading, setSubheading] = useState('It is the best time to manage your finances')

  const setHeader = (h: string, s: string): void => {
    setHeading(h)
    setSubheading(s)
  }

  return (
    <NavigationProvider>
      <Box sx={{ display: 'flex', flexDirection: 'row', flexGrow: 1 }}>
        <ResponsiveSidebar />

        <Box
          component='main'
          sx={{
            display: 'flex',
            flexDirection: 'column',
            flexGrow: 1,
            minHeight: '100vh',
            width: { xs: '100%', md: 'auto' },
            px: {
              xs: `${LAYOUT.padding.mobile}px`,
              sm: `${LAYOUT.padding.tablet}px`,
              md: `${LAYOUT.padding.desktop}px`,
            },
            overflowX: 'hidden',
            overflowY: 'auto',
            transition: `padding ${LAYOUT.transition.duration} ${LAYOUT.transition.easing}`,
          }}
        >
          <Header
            heading={heading}
            subheading={subheading}
          />
          <Outlet context={{ setHeader }} />
        </Box>
      </Box>
    </NavigationProvider>
  )
}
