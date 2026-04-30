/**
 * Spacing utilities based on 4px baseline grid
 * Similar to Tailwind's spacing scale
 */

const BASELINE_GRID = 4

/**
 * Returns spacing value as a number (in px)
 * @param value - Multiplier for baseline grid (4px)
 * @example unitless(2) // returns 8
 */
export const unitless = (value: number): number => BASELINE_GRID * value

/**
 * Returns spacing value as a string with px unit
 * @param value - Multiplier for baseline grid (4px)
 * @example unit(2) // returns "8px"
 */
export const unit = (value: number): string => `${unitless(value)}px`

/**
 * Predefined spacing scale
 * Usage: spacing[4] // "16px"
 */
export const spacing = {
  0: '0',
  1: unit(1), // 4px
  2: unit(2), // 8px
  3: unit(3), // 12px
  4: unit(4), // 16px
  5: unit(5), // 20px
  6: unit(6), // 24px
  8: unit(8), // 32px
  10: unit(10), // 40px
  12: unit(12), // 48px
  16: unit(16), // 64px
  20: unit(20), // 80px
  24: unit(24), // 96px
  32: unit(32), // 128px
}

/**
 * Border radius scale
 */
export const borderRadius = {
  none: '0',
  sm: unit(1), // 4px
  base: unit(2), // 8px
  md: unit(3), // 12px
  lg: unit(4), // 16px
  xl: unit(6), // 24px
  full: '9999px',
}
