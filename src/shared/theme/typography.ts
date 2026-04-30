/**
 * Typography system for Money Mind Application
 * Using Lufga as primary font with fallbacks
 */

export const fontFamily = {
  primary: "'Lufga', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif",
  monospace: "'Courier New', monospace",
}

export const fontWeight = {
  light: 300,
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
}

export const fontSize = {
  xs: '0.75rem', // 12px
  sm: '0.875rem', // 14px
  base: '1rem', // 16px
  lg: '1.125rem', // 18px
  xl: '1.25rem', // 20px
  '2xl': '1.5rem', // 24px
  '3xl': '1.875rem', // 30px
  '4xl': '2.25rem', // 36px
  '5xl': '3rem', // 48px
}

export const lineHeight = {
  tight: 1.2,
  normal: 1.5,
  relaxed: 1.75,
}

export const typography = {
  fontFamily,
  fontWeight,
  fontSize,
  lineHeight,
}
