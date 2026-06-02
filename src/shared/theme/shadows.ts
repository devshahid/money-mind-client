/**
 * Shadow tokens for elevation
 */

export const shadows = {
  none: 'none',
  sm: '0px 1px 2px 0px rgba(0, 0, 0, 0.05)',
  base: '0px 1px 3px 0px rgba(0, 0, 0, 0.1), 0px 1px 2px 0px rgba(0, 0, 0, 0.06)',
  md: '0px 4px 6px -1px rgba(0, 0, 0, 0.1), 0px 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0px 10px 15px -3px rgba(0, 0, 0, 0.1), 0px 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0px 20px 25px -5px rgba(0, 0, 0, 0.1), 0px 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0px 25px 50px -12px rgba(0, 0, 0, 0.25)',
  card: '0px 2px 4px rgba(0, 0, 0, 0.08), 0px 1px 2px rgba(0, 0, 0, 0.04)',
  dialog:
    '0px 24px 38px 0px rgba(17, 22, 26, 0.04), 0px 9px 46px 0px rgba(17, 22, 26, 0.06), 0px 11px 15px 0px rgba(17, 22, 26, 0.10)',
}

/**
 * Z-index management for layering
 * Keep all z-index values in one place for easy maintenance
 */
export const zIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
  notification: 1080,
}
