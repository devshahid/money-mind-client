import React from 'react'
import { Box, Typography, IconButton, Badge, Avatar, Stack, Paper } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone'
import MenuIcon from '@mui/icons-material/Menu'

import { useAppSelector } from '../shared/hooks/slice-hooks'
import { RootState } from '../store'
import { stringAvatar } from '../shared/utils/common'
import { colors, spacing } from '../shared/theme'
import { useResponsive } from '../shared/hooks/useResponsive'
import { useNavigation } from '../shared/contexts/NavigationContext'

type HeaderProps = {
  heading: string
  subheading: string
  notifications?: number
}

const Header: React.FC<HeaderProps> = ({ heading, subheading, notifications = 0 }) => {
  const { isTouch, isMobile } = useResponsive()
  const { openDrawer, isDrawerOpen } = useNavigation()
  const { userData } = useAppSelector((state: RootState) => state.auth)

  return (
    <Paper
      elevation={0}
      sx={{ p: spacing[2], display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
    >
      {/* Left: Hamburger + Title */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: spacing[2], minWidth: 0, flex: 1 }}>
        {isTouch && (
          <IconButton
            onClick={openDrawer}
            aria-label='Open navigation menu'
            aria-expanded={isDrawerOpen}
            sx={{ color: colors.grayscale.black }}
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

      {/* Right: Icons and User Info */}
      <Stack
        direction='row'
        spacing={spacing[2]}
        alignItems='center'
      >
        <IconButton>
          <SearchIcon />
        </IconButton>
        <IconButton>
          <Badge
            badgeContent={notifications}
            color='error'
          >
            <NotificationsNoneIcon />
          </Badge>
        </IconButton>
        {!isMobile && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              border: `1px solid ${colors.grayscale.lightGray}`,
              borderRadius: '999px',
              p: spacing[1],
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
          </Box>
        )}
      </Stack>
    </Paper>
  )
}

export { Header }
