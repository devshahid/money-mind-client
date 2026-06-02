/**
 * Responsive breakpoints for Money Mind Application
 * Mobile-first approach
 */

export const breakpointValues = {
  xs: 0, // Extra small devices (phones, portrait)
  sm: 600, // Small devices (phones, landscape)
  md: 960, // Medium devices (tablets)
  lg: 1280, // Large devices (desktops)
  xl: 1920, // Extra large devices (large desktops)
}

/**
 * Media query helpers
 */
export const mediaQuery = {
  // Min-width queries (mobile-first)
  up: {
    xs: `@media (min-width: ${breakpointValues.xs}px)`,
    sm: `@media (min-width: ${breakpointValues.sm}px)`,
    md: `@media (min-width: ${breakpointValues.md}px)`,
    lg: `@media (min-width: ${breakpointValues.lg}px)`,
    xl: `@media (min-width: ${breakpointValues.xl}px)`,
  },
  // Max-width queries
  down: {
    xs: `@media (max-width: ${breakpointValues.xs - 1}px)`,
    sm: `@media (max-width: ${breakpointValues.sm - 1}px)`,
    md: `@media (max-width: ${breakpointValues.md - 1}px)`,
    lg: `@media (max-width: ${breakpointValues.lg - 1}px)`,
    xl: `@media (max-width: ${breakpointValues.xl - 1}px)`,
  },
  // Between queries
  between: (min: keyof typeof breakpointValues, max: keyof typeof breakpointValues) =>
    `@media (min-width: ${breakpointValues[min]}px) and (max-width: ${breakpointValues[max] - 1}px)`,
}

export const breakpoints = {
  values: breakpointValues,
  ...mediaQuery,
}
