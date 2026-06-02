import { JSX, useState } from 'react'
import { Box } from '@mui/material'
import { Outlet } from 'react-router-dom'

import { Sidebar } from './Sidebar'
import { Header } from './Header'

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
    <Box sx={{ display: 'flex', flexDirection: 'row', flexGrow: 1 }}>
      <Box>
        <Sidebar />
      </Box>

      <Box
        component='main'
        sx={{
          display: 'flex',
          flexDirection: 'column',
          flexGrow: 1,
          transition: 'all 0.3s ease',
          minHeight: '100vh',
          overflowY: 'auto',
        }}
      >
        <Header
          heading={heading}
          subheading={subheading}
        />
        <Outlet context={{ setHeader }} />
      </Box>
    </Box>
  )
}
