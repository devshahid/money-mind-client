import { useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'

export type ViewportTier = 'mobile' | 'tablet' | 'desktop'

export type UseResponsiveReturn = {
  tier: ViewportTier
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  isTouch: boolean
}

export const useResponsive = (): UseResponsiveReturn => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'))
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'))

  const tier: ViewportTier = isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop'

  return { tier, isMobile, isTablet, isDesktop, isTouch: isMobile || isTablet }
}
