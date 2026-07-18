import React from 'react'
import { Drawer } from '@mui/material'

import { useNavigation } from '../shared/contexts/NavigationContext'
import { LAYOUT } from '../shared/constants/layout'
import { SidebarContent } from './SidebarContent'

const ResponsiveSidebar = (): React.ReactElement => {
  const { drawerMode, isDrawerOpen, closeDrawer, isCollapsed } = useNavigation()

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
        },
      }}
    >
      <SidebarContent />
    </Drawer>
  )
}

export { ResponsiveSidebar }
