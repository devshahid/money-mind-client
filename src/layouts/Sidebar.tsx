import React, { useContext, useState } from 'react'
import {
  Box,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Typography,
  Avatar,
  ListItemButton,
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
import AppLogo from '../assets/images/money-mind-logo.png'
import { NavLink, useNavigate } from 'react-router-dom'
import { ColorModeContext } from '../shared/contexts/ThemeContext'
import { colors, spacing } from '../shared/theme'

const drawerWidth = 240

const navItems = [
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

const Sidebar: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false)
  const { mode, toggleMode } = useContext(ColorModeContext)
  const navigate = useNavigate()
  const toggleSidebar = (): void => setCollapsed(!collapsed)
  const [openLogout, setOpenLogout] = useState(false)

  const handleLogout = (): void => {
    // clear auth tokens/session
    localStorage.clear() // or your logout logic
    setOpenLogout(false)
    navigate('/login')
  }

  return (
    <Drawer
      variant='permanent'
      sx={{
        width: collapsed ? 100 : drawerWidth,
        flexShrink: 0,
        overflowX: 'hidden', // Prevent horizontal scrollbar when collapsed
        '& .MuiDrawer-paper': {
          width: collapsed ? 100 : drawerWidth,
          boxSizing: 'border-box',
          background: mode === 'light' ? colors.background.lavender : colors.grayscale.black,
          display: 'flex',
          flexDirection: 'column', // Ensure items stack vertically
          alignItems: 'center', // Center items horizontally
          overflowY: 'auto', // Allow vertical scroll
          scrollbarWidth: 'none', // Firefox
          '&::-webkit-scrollbar': {
            display: 'none', // Chrome, Safari, Edge
          },
        },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: spacing[2],
          py: spacing[2],
          borderBottom: `1px solid ${colors.grayscale.lightGray}`,
          cursor: 'pointer',
          width: '100%',
        }}
      >
        <Box
          onClick={() => navigate('/')}
          sx={{ display: 'flex', gap: spacing[1], alignItems: 'center' }}
        >
          <Avatar
            src={AppLogo}
            sx={{
              bgcolor: 'black',
              width: 40,
              height: 40,
            }}
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
        <Box>
          <IconButton
            onClick={toggleSidebar}
            sx={{
              ml: collapsed ? 0 : spacing[1],
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
        </Box>
      </Box>
      <List
        sx={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: spacing[1],
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
                style={({ isActive }) => ({
                  textDecoration: 'none',
                  color: isActive
                    ? colors.grayscale.white
                    : mode === 'light'
                      ? colors.grayscale.black
                      : colors.grayscale.white,
                  width: collapsed ? 0 : '100%',
                  display: 'flex',
                  justifyContent: 'center',
                  borderRadius: '30px',
                  backgroundColor: isActive ? colors.accent.purple : 'rgba(71, 71, 78, 0)',
                  transition: 'background-color 0.3s ease',
                })}
              >
                <ListItemButton
                  sx={{
                    minHeight: 48,
                    justifyContent: 'center',
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
                      mr: collapsed ? 'auto' : 3,
                      justifyContent: 'center',
                      '&:hover': {
                        backgroundColor: 'transparent', // Disable icon hover effect
                      },
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
        <IconButton
          onClick={() => setOpenLogout(true)}
          sx={{
            width: collapsed ? 48 : 'calc(100% - 16px)',
            transition: 'all 0.3s ease',
            borderRadius: '30px',
            color: colors.grayscale.white,
            minWidth: 0,
            backgroundColor: colors.semantic.error,
            display: 'flex',
            gap: spacing[1],
          }}
        >
          <Logout />
          {!collapsed && <Typography component='span'>Logout</Typography>}
        </IconButton>
      </List>

      <Box
        sx={{
          my: spacing[2],
          py: spacing[1],
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
            <IconButton
              size='large'
              disableRipple
              disableFocusRipple
              onClick={toggleMode}
              sx={{
                backgroundColor: colors.accent.purple,
                color: colors.grayscale.white,
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  backgroundColor: colors.accent.purple,
                },
              }}
            >
              {mode === 'light' ? <WbSunny /> : <DarkMode />}
            </IconButton>
          ) : (
            <>
              <IconButton
                size='large'
                disableRipple
                disableFocusRipple
                onClick={() => mode !== 'light' && toggleMode()}
                sx={{
                  backgroundColor: mode === 'light' ? colors.accent.purple : 'transparent',
                  color: mode === 'light' ? colors.grayscale.white : colors.accent.purple,
                  transition: 'all 0.3s ease-in-out',
                  '&:hover': {
                    backgroundColor: mode === 'light' ? colors.accent.purple : 'transparent',
                  },
                  transform: mode === 'light' ? 'rotate(0deg)' : 'rotate(-20deg)',
                }}
              >
                <WbSunny />
              </IconButton>
              <IconButton
                size='large'
                disableRipple
                disableFocusRipple
                onClick={() => mode !== 'dark' && toggleMode()}
                sx={{
                  backgroundColor: mode === 'dark' ? colors.accent.purple : 'transparent',
                  color: mode === 'dark' ? colors.grayscale.white : colors.accent.purple,
                  transition: 'all 0.3s ease-in-out',
                  '&:hover': {
                    backgroundColor: mode === 'dark' ? colors.accent.purple : 'transparent',
                  },
                  transform: mode === 'dark' ? 'rotate(0deg)' : 'rotate(20deg)',
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
    </Drawer>
  )
}

export { Sidebar }
