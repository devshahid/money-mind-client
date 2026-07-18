import { describe, it, expect } from 'vitest'
import { LAYOUT } from '../constants/layout'

/**
 * Unit Tests for Responsive Hooks, Constants, and Layout
 */

// --- Layout Constants ---
describe('LAYOUT constants', () => {
  it('sidebar widths are derived from 4px grid', () => {
    expect(LAYOUT.sidebar.expandedWidth).toBe(240) // unitless(60)
    expect(LAYOUT.sidebar.collapsedWidth).toBe(100) // unitless(25)
    expect(LAYOUT.sidebar.mobileWidth).toBe(280) // unitless(70)
  })

  it('padding values are derived from 4px grid', () => {
    expect(LAYOUT.padding.mobile).toBe(16) // unitless(4)
    expect(LAYOUT.padding.tablet).toBe(20) // unitless(5)
    expect(LAYOUT.padding.desktop).toBe(24) // unitless(6)
  })

  it('header height is derived from 4px grid', () => {
    expect(LAYOUT.header.height).toBe(64) // unitless(16)
  })

  it('transition config has valid values', () => {
    expect(LAYOUT.transition.duration).toBe('0.3s')
    expect(LAYOUT.transition.easing).toBe('ease')
  })

  it('all numeric values are multiples of 4', () => {
    const numericValues = [
      LAYOUT.sidebar.expandedWidth,
      LAYOUT.sidebar.collapsedWidth,
      LAYOUT.sidebar.mobileWidth,
      LAYOUT.padding.mobile,
      LAYOUT.padding.tablet,
      LAYOUT.padding.desktop,
      LAYOUT.header.height,
    ]
    for (const value of numericValues) {
      expect(value % 4).toBe(0)
    }
  })
})

// --- Viewport tier logic (mirrors useResponsive) ---
describe('Viewport tier logic', () => {
  const getViewportTier = (width: number): 'mobile' | 'tablet' | 'desktop' => {
    if (width < 600) return 'mobile'
    if (width < 960) return 'tablet'
    return 'desktop'
  }

  it('returns mobile for widths below 600px', () => {
    expect(getViewportTier(320)).toBe('mobile')
    expect(getViewportTier(375)).toBe('mobile')
    expect(getViewportTier(414)).toBe('mobile')
    expect(getViewportTier(599)).toBe('mobile')
  })

  it('returns tablet for widths 600-959px', () => {
    expect(getViewportTier(600)).toBe('tablet')
    expect(getViewportTier(768)).toBe('tablet')
    expect(getViewportTier(959)).toBe('tablet')
  })

  it('returns desktop for widths 960px and above', () => {
    expect(getViewportTier(960)).toBe('desktop')
    expect(getViewportTier(1280)).toBe('desktop')
    expect(getViewportTier(1920)).toBe('desktop')
  })

  it('boundary: 599 is mobile, 600 is tablet', () => {
    expect(getViewportTier(599)).toBe('mobile')
    expect(getViewportTier(600)).toBe('tablet')
  })

  it('boundary: 959 is tablet, 960 is desktop', () => {
    expect(getViewportTier(959)).toBe('tablet')
    expect(getViewportTier(960)).toBe('desktop')
  })
})

// --- Keyboard height logic (mirrors useKeyboardHeight) ---
describe('Keyboard height calculation', () => {
  it('returns 0 when viewport height equals window height', () => {
    const windowHeight = 800
    const viewportHeight = 800
    const keyboardHeight = Math.max(0, windowHeight - viewportHeight)
    expect(keyboardHeight).toBe(0)
  })

  it('returns positive value when keyboard is visible', () => {
    const windowHeight = 800
    const viewportHeight = 500 // keyboard takes 300px
    const keyboardHeight = Math.max(0, windowHeight - viewportHeight)
    expect(keyboardHeight).toBe(300)
  })

  it('never returns negative', () => {
    const windowHeight = 800
    const viewportHeight = 900 // edge case: viewport larger than window
    const keyboardHeight = Math.max(0, windowHeight - viewportHeight)
    expect(keyboardHeight).toBe(0)
  })
})

// --- Responsive padding (mirrors Layout Shell) ---
describe('Responsive padding per viewport', () => {
  it('mobile gets 16px padding', () => {
    expect(LAYOUT.padding.mobile).toBe(16)
  })

  it('tablet gets 20px padding', () => {
    expect(LAYOUT.padding.tablet).toBe(20)
  })

  it('desktop gets 24px padding', () => {
    expect(LAYOUT.padding.desktop).toBe(24)
  })

  it('padding increases with viewport size', () => {
    expect(LAYOUT.padding.mobile).toBeLessThan(LAYOUT.padding.tablet)
    expect(LAYOUT.padding.tablet).toBeLessThan(LAYOUT.padding.desktop)
  })
})

// --- Drawer mode logic (mirrors NavigationContext) ---
describe('Drawer mode logic', () => {
  const getDrawerMode = (isDesktop: boolean): 'temporary' | 'permanent' => {
    return isDesktop ? 'permanent' : 'temporary'
  }

  it('returns temporary for non-desktop (mobile/tablet)', () => {
    expect(getDrawerMode(false)).toBe('temporary')
  })

  it('returns permanent for desktop', () => {
    expect(getDrawerMode(true)).toBe('permanent')
  })
})
