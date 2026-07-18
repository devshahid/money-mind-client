import React, { useContext, useState } from 'react'
import {
  Box,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Typography,
  Avatar,
  Dialog,
  DialogTitle,
  DialogActions,
  Button,
} from '@mui/material'
import {
  Dashboard,
  AccountBalanceWallet,
  TrendingUp,
  Settings,
  PieChart,
  AccountBalance,
  AccountTree,
  AccountCircle,
  Logout,
  SmartToy,
} from '@mui/icons-material'
import { NavLink, useNavigate } from 'react-router-dom'

import AppLogo from '../assets/images/money-mind-logo.png'
import { useNavigation } from '../shared/contexts/NavigationContext'
import { ColorModeContext } from '../shared/contexts/ThemeContext'
import { colors, spacing } from '../shared/theme'

type NavItem = {
  label: string
  icon: React.ReactNode
  path: string
}

const navItems: NavItem[] = [
  { label: 'Dashboard', icon: <Dashboard />, path: '/' },
  { label: 'Transactions', icon: <AccountTree />, path: '/transactions' },
  { label: 'Debts', icon: <AccountBalanceWallet />, path: '/debts' },
  { label: 'Goals', icon: <TrendingUp />, path: '/goals' },
  { label: 'Budget', icon: <AccountBalance />, path: '/budget' },
  { label: 'Analytics', icon: <PieChart />, path: '/analytics' },
  { label: 'AI Assistant', icon: <SmartToy />, path: '/ai-chat' },
  { label: 'Settings', icon: <Settings />, path: '/settings' },
  { label: 'Account', icon: <AccountCircle />, path: '/account' },
]

type SidebarContentProps = {
  onNavItemClick?: () => void
}

const SidebarContent = ({ onNavItemClick }: SidebarContentProps): React.ReactElement => {
  const { isCollapsed, drawerMode } = useNavigation()
  const { mode } = useContext(ColorModeContext)
  const navigate = useNavigate()
  const [openLogout, setOpenLogout] = useState(false)

  const collapsed = drawerMode === 'permanent' && isCollapsed

  const handleLogout = (): void => {
    localStorage.clear()
    setOpenLogout(false)
    navigate('/login')
  }

  const handleNavClick = (): void => {
    if (onNavItemClick) {
      onNavItemClick()
    }
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: mode === 'light' ? colors.background.lavender : colors.grayscale.black,
        overflowY: 'auto',
        overflowX: 'hidden',
        scrollbarWidth: 'none',
        '&::-webkit-scrollbar': { display: 'none' },
      }}
    >
      {/* Logo Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'flex-start',
          px: spacing[3],
          py: spacing[3],
          width: '100%',
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          minHeight: 64,
        }}
      >
        <Box
          onClick={() => {
            navigate('/')
            handleNavClick()
          }}
          sx={{ display: 'flex', gap: spacing[2], alignItems: 'center', cursor: 'pointer', overflow: 'hidden' }}
        >
          <Avatar
            src={AppLogo}
            sx={{ bgcolor: 'black', width: 36, height: 36, flexShrink: 0 }}
          />
          {!collapsed && (
            <Typography
              variant='h6'
              fontWeight='bold'
              fontSize='0.95rem'
              sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
            >
              Money Mind
            </Typography>
          )}
        </Box>
      </Box>

      <Divider sx={{ mx: spacing[2] }} />

      {/* Navigation Items */}
      <List
        component='nav'
        sx={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          px: spacing[2],
          py: spacing[2],
        }}
      >
        {navItems.map((item, index) => (
          <Tooltip
            key={index}
            title={collapsed ? item.label : ''}
            placement='right'
          >
            <ListItem
              disablePadding
              sx={{ mb: spacing[1] }}
            >
              <NavLink
                to={item.path}
                onClick={handleNavClick}
                style={({ isActive }) => ({
                  textDecoration: 'none',
                  color: isActive
                    ? colors.grayscale.white
                    : mode === 'light'
                      ? colors.grayscale.black
                      : colors.grayscale.white,
                  width: '100%',
                  display: 'flex',
                  borderRadius: '12px',
                  backgroundColor: isActive ? colors.accent.purple : 'transparent',
                  transition: 'background-color 0.2s ease',
                })}
              >
                <ListItemButton
                  sx={{
                    height: 44,
                    justifyContent: collapsed ? 'center' : 'flex-start',
                    px: spacing[3],
                    gap: spacing[2],
                    borderRadius: '12px',
                    '&:hover': {
                      backgroundColor: mode === 'light' ? colors.background.purple : 'rgba(71, 71, 78, 0.15)',
                    },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 0, justifyContent: 'center' }}>{item.icon}</ListItemIcon>
                  {!collapsed && (
                    <ListItemText
                      primary={item.label}
                      primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: 500, whiteSpace: 'nowrap' }}
                    />
                  )}
                </ListItemButton>
              </NavLink>
            </ListItem>
          </Tooltip>
        ))}
      </List>

      {/* Bottom Section — Logout only */}
      <Box
        sx={{
          mt: 'auto',
          width: '100%',
          px: spacing[2],
          pb: spacing[3],
        }}
      >
        <Divider sx={{ mb: spacing[2] }} />

        <Tooltip
          title={collapsed ? 'Logout' : ''}
          placement='right'
        >
          <ListItem disablePadding>
            <ListItemButton
              onClick={() => setOpenLogout(true)}
              sx={{
                height: 44,
                justifyContent: collapsed ? 'center' : 'flex-start',
                px: spacing[3],
                gap: spacing[2],
                borderRadius: '12px',
                color: colors.semantic.error,
                '&:hover': {
                  backgroundColor: mode === 'light' ? colors.background.red : 'rgba(211, 47, 47, 0.08)',
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 0, justifyContent: 'center', color: colors.semantic.error }}>
                <Logout />
              </ListItemIcon>
              {!collapsed && (
                <ListItemText
                  primary='Logout'
                  primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: 500, color: colors.semantic.error }}
                />
              )}
            </ListItemButton>
          </ListItem>
        </Tooltip>
      </Box>

      {/* Logout Dialog */}
      <Dialog
        open={openLogout}
        onClose={() => setOpenLogout(false)}
      >
        <DialogTitle>Are you sure you want to logout?</DialogTitle>
        <DialogActions>
          <Button onClick={() => setOpenLogout(false)}>Cancel</Button>
          <Button
            onClick={handleLogout}
            color='error'
            variant='contained'
          >
            Logout
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export { SidebarContent }
