/**
 * Color Palette for Money Mind Application
 * Following a consistent design system with primary, grayscale, and semantic colors
 */

export const primaryColors = {
  blue: '#1976d2', // Primary brand color
  darkBlue: '#115293',
  lightBlue: '#42a5f5',
}

export const grayscale = {
  black: '#141414', // 100% black for primary text
  dark: '#4F4F4F', // Hover states
  medium: '#727272', // Inactive/secondary text
  gray: '#959595', // Disabled states
  lightGray: '#d0d0d0', // Borders
  paleGray: '#e7e7e7', // Dividers
  background: '#f1f1f1', // Background secondary
  backgroundLight: '#f8f8f8', // Background tertiary
  white: '#FFFFFF', // Primary background
}

export const semanticColors = {
  success: '#2e7d32', // Green for success states
  successLight: '#d2f6e3',
  error: '#d32f2f', // Red for errors
  errorLight: '#ffefe9',
  warning: '#ed6c02', // Orange for warnings
  warningLight: '#fff4dc',
  info: '#0288d1', // Info blue
  infoLight: '#e3f2fd',
}

export const accentColors = {
  green: '#1ed273',
  red: '#ff5f28',
  orange: '#ffa023',
  yellow: '#ffe141',
  purple: '#9B7CFF', // Exact original purple for active states
  teal: '#009688',
}

export const backgroundColors = {
  blue: '#f3f6fe', // Light blue background
  green: '#e8fbf1', // Light green background
  red: '#ffefe9', // Light red background
  yellow: '#fffbf0', // Light yellow background
  purple: '#dcd6ff', // Light purple background - hover states
  lavender: '#f3f1fb', // Light lavender - sidebar background
}

/**
 * Chart colors for data visualization
 * Optimized for accessibility and distinction
 */
export const chartColors = {
  primary: ['#1976d2', '#42a5f5', '#64b5f6', '#90caf9', '#bbdefb'],
  income: ['#2e7d32', '#43a047', '#66bb6a', '#81c784', '#a5d6a7'],
  expense: ['#d32f2f', '#f44336', '#e57373', '#ef5350', '#e53935'],
  mixed: ['#1976d2', '#2e7d32', '#ed6c02', '#9c27b0', '#009688', '#f44336'],
}

export const colors = {
  primary: primaryColors,
  grayscale,
  semantic: semanticColors,
  accent: accentColors,
  background: backgroundColors,
  chart: chartColors,
}
