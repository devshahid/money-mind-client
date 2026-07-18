import { unitless } from '../theme/spacing'

export const LAYOUT = {
  sidebar: {
    expandedWidth: unitless(60), // 240px
    collapsedWidth: unitless(25), // 100px
    mobileWidth: unitless(70), // 280px
  },
  padding: {
    mobile: unitless(4), // 16px
    tablet: unitless(5), // 20px
    desktop: unitless(6), // 24px
  },
  header: {
    height: unitless(16), // 64px
  },
  transition: {
    duration: '0.3s',
    easing: 'ease',
  },
} as const
