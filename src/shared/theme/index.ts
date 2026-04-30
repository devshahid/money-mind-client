/**
 * Money Mind Theme Configuration
 * Centralized design system for consistent UI
 */

export * from './colors'
export * from './typography'
export * from './spacing'
export * from './breakpoints'
export * from './shadows'

import { ThemeOptions } from '@mui/material'
import { colors } from './colors'
import { fontFamily, fontWeight, fontSize } from './typography'
import { borderRadius } from './spacing'
import { breakpointValues } from './breakpoints'
import { zIndex } from './shadows'

/**
 * Light theme configuration
 */
export const lightTheme: ThemeOptions = {
  palette: {
    mode: 'light',
    primary: {
      main: colors.primary.blue,
      dark: colors.primary.darkBlue,
      light: colors.primary.lightBlue,
      contrastText: '#fff',
    },
    secondary: {
      main: colors.grayscale.dark,
      light: colors.grayscale.medium,
      dark: colors.grayscale.black,
      contrastText: '#fff',
    },
    success: {
      main: colors.semantic.success,
      light: colors.semantic.successLight,
      contrastText: '#fff',
    },
    error: {
      main: colors.semantic.error,
      light: colors.semantic.errorLight,
      contrastText: '#fff',
    },
    warning: {
      main: colors.semantic.warning,
      light: colors.semantic.warningLight,
      contrastText: '#fff',
    },
    info: {
      main: colors.semantic.info,
      light: colors.semantic.infoLight,
      contrastText: '#fff',
    },
    background: {
      default: colors.grayscale.white,
      paper: colors.grayscale.white,
    },
    text: {
      primary: colors.grayscale.black,
      secondary: colors.grayscale.medium,
      disabled: colors.grayscale.gray,
    },
    divider: colors.grayscale.lightGray,
  },
  typography: {
    fontFamily: fontFamily.primary,
    fontSize: 16,
    fontWeightLight: fontWeight.light,
    fontWeightRegular: fontWeight.regular,
    fontWeightMedium: fontWeight.medium,
    fontWeightBold: fontWeight.bold,
    h1: {
      fontSize: fontSize['5xl'],
      fontWeight: fontWeight.bold,
      lineHeight: 1.2,
    },
    h2: {
      fontSize: fontSize['4xl'],
      fontWeight: fontWeight.bold,
      lineHeight: 1.2,
    },
    h3: {
      fontSize: fontSize['3xl'],
      fontWeight: fontWeight.semibold,
      lineHeight: 1.3,
    },
    h4: {
      fontSize: fontSize['2xl'],
      fontWeight: fontWeight.semibold,
      lineHeight: 1.4,
    },
    h5: {
      fontSize: fontSize['2xl'],
      fontWeight: fontWeight.bold,
      lineHeight: 1.4,
    },
    h6: {
      fontSize: fontSize.xl,
      fontWeight: fontWeight.semibold,
      lineHeight: 1.5,
    },
    body1: {
      fontSize: fontSize.base,
      lineHeight: 1.6,
    },
    body2: {
      fontSize: fontSize.base,
      lineHeight: 1.6,
    },
    button: {
      textTransform: 'none',
      fontWeight: fontWeight.semibold,
      fontSize: fontSize.base,
    },
    caption: {
      fontSize: fontSize.sm,
      lineHeight: 1.5,
    },
  },
  breakpoints: {
    values: breakpointValues,
  },
  shape: {
    borderRadius: parseInt(borderRadius.base),
  },
  spacing: 4, // Base spacing unit (4px)
  zIndex: {
    mobileStepper: zIndex.base,
    speedDial: zIndex.fixed,
    appBar: zIndex.fixed,
    drawer: zIndex.modal,
    modal: zIndex.modal,
    snackbar: zIndex.notification,
    tooltip: zIndex.tooltip,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: borderRadius.base,
          textTransform: 'none',
          fontWeight: fontWeight.semibold,
          padding: '8px 16px',
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: borderRadius.md,
          boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.08), 0px 1px 2px rgba(0, 0, 0, 0.04)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: borderRadius.base,
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        rounded: {
          borderRadius: borderRadius.md,
        },
      },
    },
  },
}

/**
 * Dark theme configuration
 */
export const darkTheme: ThemeOptions = {
  ...lightTheme,
  palette: {
    mode: 'dark',
    primary: {
      main: colors.primary.lightBlue,
      dark: colors.primary.blue,
      light: '#90caf9',
      contrastText: '#000',
    },
    secondary: {
      main: colors.grayscale.paleGray,
      light: colors.grayscale.white,
      dark: colors.grayscale.lightGray,
      contrastText: '#000',
    },
    success: {
      main: '#66bb6a',
      light: colors.semantic.successLight,
      contrastText: '#000',
    },
    error: {
      main: '#f44336',
      light: colors.semantic.errorLight,
      contrastText: '#fff',
    },
    warning: {
      main: '#ffa726',
      light: colors.semantic.warningLight,
      contrastText: '#000',
    },
    info: {
      main: '#29b6f6',
      light: colors.semantic.infoLight,
      contrastText: '#000',
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
    text: {
      primary: '#ffffff',
      secondary: 'rgba(255, 255, 255, 0.7)',
      disabled: 'rgba(255, 255, 255, 0.5)',
    },
    divider: 'rgba(255, 255, 255, 0.12)',
  },
}
