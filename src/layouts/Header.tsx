import React, { useContext, useState } from 'react'
import {
  Box,
  Typography,
  IconButton,
  Badge,
  Avatar,
  Stack,
  Paper,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Dialog,
  DialogTitle,
  DialogActions,
  Button,
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone'
import MenuIcon from '@mui/icons-material/Menu'
import DarkModeIcon from '@mui/icons-material/DarkMode'
import WbSunnyIcon from '@mui/icons-material/WbSunny'
import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import LogoutIcon from '@mui/icons-material/Logout'
import { useNavigate } from 'react-router-dom'

import { useAppSelector } from '../shared/hooks/slice-hooks'
import { RootState } from '../store'
import { stringAvatar } from '../shared/utils/common'
import { colors, spacing } from '../shared/theme'
import { useResponsive } from '../shared/hooks/useResponsive'
import { useNavigation } from '../shared/contexts/NavigationContext'
import { ColorModeContext } from '../shared/contexts/ThemeContext'

type HeaderProps = {
  heading: string
  subheading: string
  notifications?: number
}

const Header = ({ heading, subheading, notifications = 0 }: HeaderProps): React.ReactElement => {
  const { isTouch, isMobile } = useResponsive()
  const { openDrawer, isDrawerOpen } = useNavigation()
  const { mode, toggleMode } = useContext(ColorModeContext)
  const { userData } = useAppSelector((state: RootState) => state.auth)
  const navigate = useNavigate()

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false)
  const menuOpen = Boolean(anchorEl)

  const handleAvatarClick = (event: React.MouseEvent<HTMLElement>): void => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = (): void => {
    setAnchorEl(null)
  }

  const handleAccount = (): void => {
    handleMenuClose()
    navigate('/account')
  }

  const handleLogout = (): void => {
    handleMenuClose()
    setLogoutDialogOpen(true)
  }

  const confirmLogout = (): void => {
    setLogoutDialogOpen(false)
    localStorage.clear()
    navigate('/login')
  }

  return (
    <Paper
      component='header'
      elevation={0}
      sx={{ p: spacing[3], pt: spacing[4], display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
    >
      {/* Left: Hamburger + Title */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: spacing[2], minWidth: 0, flex: 1 }}>
        {isTouch && (
          <IconButton
            onClick={openDrawer}
            aria-label='Open navigation menu'
            aria-expanded={isDrawerOpen}
          >
            <MenuIcon />
          </IconButton>
        )}
        <Box sx={{ minWidth: 0 }}>
          <Typography
            variant='h5'
            fontWeight='bold'
            sx={{
              ...(isMobile && {
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                fontSize: '1.1rem',
              }),
            }}
          >
            {heading}
          </Typography>
          {!isMobile && (
            <Typography
              variant='body2'
              color='text.secondary'
            >
              {subheading}
            </Typography>
          )}
        </Box>
      </Box>

      {/* Right: Theme Toggle + Icons + User Avatar */}
      <Stack
        direction='row'
        spacing={1}
        alignItems='center'
      >
        {/* Theme Toggle */}
        <IconButton
          onClick={toggleMode}
          size='small'
          aria-label={mode === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
          sx={{ color: colors.accent.purple, width: 36, height: 36 }}
        >
          {mode === 'light' ? <DarkModeIcon sx={{ fontSize: 20 }} /> : <WbSunnyIcon sx={{ fontSize: 20 }} />}
        </IconButton>

        <IconButton size='small'>
          <SearchIcon />
        </IconButton>
        <IconButton size='small'>
          <Badge
            badgeContent={notifications}
            color='error'
          >
            <NotificationsNoneIcon />
          </Badge>
        </IconButton>

        {/* User Avatar — always visible, expands to menu on click */}
        {isMobile ? (
          /* Mobile/Tablet: avatar only */
          <IconButton
            onClick={handleAvatarClick}
            aria-label='User menu'
            aria-controls={menuOpen ? 'user-menu' : undefined}
            aria-haspopup='true'
            aria-expanded={menuOpen ? 'true' : undefined}
            sx={{ p: 0.5 }}
          >
            <Avatar
              {...stringAvatar(userData.fullName || 'Test User')}
              sx={{ width: 32, height: 32 }}
            />
          </IconButton>
        ) : (
          /* Desktop: avatar pill with name */
          <Box
            onClick={handleAvatarClick}
            sx={{
              display: 'flex',
              alignItems: 'center',
              border: `1px solid ${colors.grayscale.lightGray}`,
              borderRadius: '999px',
              p: spacing[1],
              cursor: 'pointer',
              '&:hover': { backgroundColor: mode === 'light' ? colors.grayscale.background : 'rgba(255,255,255,0.04)' },
            }}
          >
            <Avatar
              {...stringAvatar(userData.fullName || 'Test User')}
              sx={{ width: 32, height: 32, mr: 1 }}
            />
            <Box>
              <Typography
                variant='body2'
                fontWeight={500}
                fontSize='0.8rem'
              >
                {userData.fullName || 'Test User'}
              </Typography>
              <Typography
                variant='caption'
                color='text.secondary'
                fontSize='0.7rem'
              >
                {userData.email}
              </Typography>
            </Box>
          </Box>
        )}

        {/* User Menu Dropdown */}
        <Menu
          id='user-menu'
          anchorEl={anchorEl}
          open={menuOpen}
          onClose={handleMenuClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          slotProps={{
            paper: {
              sx: { mt: 1, minWidth: 200, borderRadius: '12px' },
            },
          }}
        >
          {/* User info */}
          <Box sx={{ px: spacing[3], py: spacing[2] }}>
            <Typography
              variant='body2'
              fontWeight={600}
            >
              {userData.fullName || 'Test User'}
            </Typography>
            <Typography
              variant='caption'
              color='text.secondary'
            >
              {userData.email}
            </Typography>
          </Box>
          <Divider />

          {/* Account */}
          <MenuItem onClick={handleAccount}>
            <ListItemIcon>
              <AccountCircleIcon fontSize='small' />
            </ListItemIcon>
            <ListItemText primaryTypographyProps={{ fontSize: '0.875rem' }}>Account</ListItemText>
          </MenuItem>

          {/* Logout */}
          <MenuItem onClick={handleLogout}>
            <ListItemIcon>
              <LogoutIcon
                fontSize='small'
                sx={{ color: colors.semantic.error }}
              />
            </ListItemIcon>
            <ListItemText primaryTypographyProps={{ fontSize: '0.875rem', color: colors.semantic.error }}>
              Logout
            </ListItemText>
          </MenuItem>
        </Menu>
      </Stack>

      {/* Logout Confirmation Dialog */}
      <Dialog
        open={logoutDialogOpen}
        onClose={() => setLogoutDialogOpen(false)}
      >
        <DialogTitle>Are you sure you want to logout?</DialogTitle>
        <DialogActions>
          <Button onClick={() => setLogoutDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={confirmLogout}
            color='error'
            variant='contained'
          >
            Logout
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  )
}

export { Header }
