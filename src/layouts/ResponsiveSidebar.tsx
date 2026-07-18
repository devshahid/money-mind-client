import { Box, Drawer, IconButton } from '@mui/material'
import { ArrowBackIosNew, ArrowForwardIos } from '@mui/icons-material'
import React, { useContext } from 'react'

import { useNavigation } from '../shared/contexts/NavigationContext'
import { ColorModeContext } from '../shared/contexts/ThemeContext'
import { LAYOUT } from '../shared/constants/layout'
import { SidebarContent } from './SidebarContent'
import { colors } from '../shared/theme'

const ResponsiveSidebar = (): React.ReactElement => {
  const { drawerMode, isDrawerOpen, closeDrawer, isCollapsed, toggleCollapse } = useNavigation()
  const { mode } = useContext(ColorModeContext)

  if (drawerMode === 'temporary') {
    return (
      <Drawer
        variant='temporary'
        open={isDrawerOpen}
        onClose={closeDrawer}
        ModalProps={{ keepMounted: true }}
        sx={{
          '& .MuiDrawer-paper': {
            width: LAYOUT.sidebar.mobileWidth,
            transition: `transform ${LAYOUT.transition.duration} ${LAYOUT.transition.easing}`,
          },
        }}
      >
        <SidebarContent onNavItemClick={closeDrawer} />
      </Drawer>
    )
  }

  const drawerWidth = isCollapsed ? LAYOUT.sidebar.collapsedWidth : LAYOUT.sidebar.expandedWidth

  return (
    <Box sx={{ position: 'relative', flexShrink: 0 }}>
      <Drawer
        variant='permanent'
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            transition: `width ${LAYOUT.transition.duration} ${LAYOUT.transition.easing}`,
            overflowX: 'hidden',
            borderRight: `1px solid ${mode === 'light' ? colors.grayscale.lightGray : 'rgba(255,255,255,0.08)'}`,
          },
        }}
      >
        <SidebarContent />
      </Drawer>

      {/* Collapse/Expand toggle — positioned on the edge of the sidebar */}
      <IconButton
        onClick={toggleCollapse}
        size='small'
        aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        sx={{
          position: 'fixed',
          top: 20,
          left: drawerWidth - 14,
          zIndex: theme => theme.zIndex.drawer + 1,
          width: 28,
          height: 28,
          border: `1px solid ${colors.grayscale.lightGray}`,
          borderRadius: '50%',
          background: mode === 'light' ? colors.grayscale.white : colors.grayscale.black,
          color: mode === 'light' ? colors.grayscale.black : colors.grayscale.white,
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          transition: `left ${LAYOUT.transition.duration} ${LAYOUT.transition.easing}`,
          '&:hover': {
            backgroundColor: mode === 'light' ? colors.grayscale.background : colors.grayscale.dark,
          },
        }}
      >
        {isCollapsed ? <ArrowForwardIos sx={{ fontSize: 12 }} /> : <ArrowBackIosNew sx={{ fontSize: 12 }} />}
      </IconButton>
    </Box>
  )
}

export { ResponsiveSidebar }
