import React, { useContext, useState } from 'react'
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Typography,
  Avatar,
  IconButton,
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
  ArrowBackIosNew,
  ArrowForwardIos,
  AccountBalance,
  AccountTree,
  AccountCircle,
  DarkMode,
  WbSunny,
  Logout,
  SmartToy,
} from '@mui/icons-material'
import { NavLink, useNavigate } from 'react-router-dom'

import AppLogo from '../assets/images/money-mind-logo.png'
import { ColorModeContext } from '../shared/contexts/ThemeContext'
import { useNavigation } from '../shared/contexts/NavigationContext'
import { colors, spacing } from '../shared/theme'

type NavItem = {
  label: string
  icon: React.ReactNode
  path: string
  variant?: 'default' | 'danger'
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
  const { isCollapsed, toggleCollapse, drawerMode } = useNavigation()
  const { mode, toggleMode } = useContext(ColorModeContext)
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
        scrollbarWidth: 'none',
        '&::-webkit-scrollbar': { display: 'none' },
      }}
    >
      {/* Logo Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: spacing[2],
          py: spacing[2],
          borderBottom: `1px solid ${colors.grayscale.lightGray}`,
          width: '100%',
        }}
      >
        <Box
          onClick={() => {
            navigate('/')
            handleNavClick()
          }}
          sx={{ display: 'flex', gap: spacing[1], alignItems: 'center', cursor: 'pointer' }}
        >
          <Avatar
            src={AppLogo}
            sx={{ bgcolor: 'black', width: 40, height: 40 }}
          />
          {!collapsed && (
            <Typography
              variant='h6'
              fontWeight='bold'
              fontSize='1rem'
            >
              Money Mind
            </Typography>
          )}
        </Box>
        {drawerMode === 'permanent' && (
          <IconButton
            onClick={toggleCollapse}
            sx={{
              border: `1px solid ${colors.grayscale.lightGray}`,
              background: mode === 'light' ? colors.grayscale.white : colors.grayscale.black,
              color: mode === 'light' ? colors.grayscale.black : colors.grayscale.white,
              '&:hover': {
                backgroundColor: mode === 'light' ? colors.grayscale.background : colors.grayscale.dark,
              },
            }}
          >
            {collapsed ? (
              <ArrowForwardIos
                fontSize='small'
                sx={{ width: '10px', height: '10px' }}
              />
            ) : (
              <ArrowBackIosNew
                fontSize='small'
                sx={{ width: '10px', height: '10px' }}
              />
            )}
          </IconButton>
        )}
      </Box>

      {/* Navigation Items */}
      <List
        component='nav'
        sx={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: spacing[1],
          flex: 1,
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
              sx={{
                mx: 1,
                my: 0.5,
                borderRadius: '30px',
                width: '100%',
                justifyContent: 'center',
              }}
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
                  width: collapsed ? 'auto' : '100%',
                  display: 'flex',
                  justifyContent: 'center',
                  borderRadius: '30px',
                  backgroundColor: isActive ? colors.accent.purple : 'transparent',
                  transition: 'background-color 0.3s ease',
                })}
              >
                <ListItemButton
                  sx={{
                    minHeight: 48,
                    justifyContent: collapsed ? 'center' : 'flex-start',
                    px: spacing[2],
                    gap: collapsed ? 0 : spacing[1],
                    width: '100%',
                    borderRadius: '30px',
                    '&:hover': {
                      backgroundColor: mode === 'light' ? colors.background.purple : 'rgba(71, 71, 78, 0.1)',
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: collapsed ? 0 : 3,
                      justifyContent: 'center',
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  {!collapsed && <ListItemText primary={item.label} />}
                </ListItemButton>
              </NavLink>
            </ListItem>
          </Tooltip>
        ))}

        {/* Logout Item — styled like a nav item with error color */}
        <Tooltip
          title={collapsed ? 'Logout' : ''}
          placement='right'
        >
          <ListItem
            disablePadding
            sx={{
              mx: 1,
              my: 0.5,
              borderRadius: '30px',
              width: '100%',
              justifyContent: 'center',
            }}
          >
            <ListItemButton
              onClick={() => setOpenLogout(true)}
              sx={{
                minHeight: 48,
                justifyContent: collapsed ? 'center' : 'flex-start',
                px: spacing[2],
                gap: collapsed ? 0 : spacing[1],
                width: '100%',
                borderRadius: '30px',
                color: colors.semantic.error,
                '&:hover': {
                  backgroundColor: mode === 'light' ? colors.background.red : 'rgba(211, 47, 47, 0.08)',
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: collapsed ? 0 : 3,
                  justifyContent: 'center',
                  color: colors.semantic.error,
                }}
              >
                <Logout />
              </ListItemIcon>
              {!collapsed && (
                <ListItemText
                  primary='Logout'
                  sx={{ color: colors.semantic.error }}
                />
              )}
            </ListItemButton>
          </ListItem>
        </Tooltip>
      </List>

      {/* Theme Toggle — positioned right after nav list */}
      <Box
        sx={{
          py: spacing[2],
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <Box
          sx={{
            border: '1px solid grey',
            borderRadius: '50px',
            padding: collapsed ? '4px' : '4px 8px',
            display: 'flex',
            alignItems: 'center',
            gap: collapsed ? 0 : 1,
            transition: 'all 0.3s ease-in-out',
          }}
        >
          {collapsed ? (
            <Tooltip
              title={mode === 'light' ? 'Light mode' : 'Dark mode'}
              placement='right'
            >
              <IconButton
                size='large'
                disableRipple
                onClick={toggleMode}
                sx={{
                  backgroundColor: colors.accent.purple,
                  color: colors.grayscale.white,
                  '&:hover': { backgroundColor: colors.accent.purple },
                }}
              >
                {mode === 'light' ? <WbSunny /> : <DarkMode />}
              </IconButton>
            </Tooltip>
          ) : (
            <>
              <IconButton
                size='large'
                disableRipple
                onClick={() => mode !== 'light' && toggleMode()}
                sx={{
                  backgroundColor: mode === 'light' ? colors.accent.purple : 'transparent',
                  color: mode === 'light' ? colors.grayscale.white : colors.accent.purple,
                  '&:hover': { backgroundColor: mode === 'light' ? colors.accent.purple : 'transparent' },
                  transform: mode === 'light' ? 'rotate(0deg)' : 'rotate(-20deg)',
                  transition: 'all 0.3s ease-in-out',
                }}
              >
                <WbSunny />
              </IconButton>
              <IconButton
                size='large'
                disableRipple
                onClick={() => mode !== 'dark' && toggleMode()}
                sx={{
                  backgroundColor: mode === 'dark' ? colors.accent.purple : 'transparent',
                  color: mode === 'dark' ? colors.grayscale.white : colors.accent.purple,
                  '&:hover': { backgroundColor: mode === 'dark' ? colors.accent.purple : 'transparent' },
                  transform: mode === 'dark' ? 'rotate(0deg)' : 'rotate(20deg)',
                  transition: 'all 0.3s ease-in-out',
                }}
              >
                <DarkMode />
              </IconButton>
            </>
          )}
        </Box>
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
