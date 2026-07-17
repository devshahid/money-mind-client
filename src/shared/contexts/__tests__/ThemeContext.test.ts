/**
 * @vitest-environment jsdom
 */
import { describe, test, expect, beforeEach, vi } from 'vitest'

/**
 * Theme Context Tests
 * Tests for: theme persistence to localStorage
 */

const THEME_STORAGE_KEY = 'money-mind-theme-mode'

// Replicate the getStoredMode logic from ThemeContext.tsx
function getStoredMode(): 'light' | 'dark' {
  const stored = localStorage.getItem(THEME_STORAGE_KEY)
  if (stored === 'dark' || stored === 'light') return stored
  return 'light'
}

describe('Theme persistence', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  test('should default to light mode when localStorage is empty', () => {
    expect(getStoredMode()).toBe('light')
  })

  test('should return dark when localStorage has dark', () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'dark')
    expect(getStoredMode()).toBe('dark')
  })

  test('should return light when localStorage has light', () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'light')
    expect(getStoredMode()).toBe('light')
  })

  test('should default to light for invalid stored value', () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'invalid')
    expect(getStoredMode()).toBe('light')
  })

  test('should default to light for empty string', () => {
    localStorage.setItem(THEME_STORAGE_KEY, '')
    expect(getStoredMode()).toBe('light')
  })

  test('toggle should persist new mode to localStorage', () => {
    // Simulate toggle: light → dark
    const prevMode = 'light'
    const newMode = prevMode === 'light' ? 'dark' : 'light'
    localStorage.setItem(THEME_STORAGE_KEY, newMode)

    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark')
    expect(getStoredMode()).toBe('dark')
  })

  test('toggle should persist back to light', () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'dark')

    // Simulate toggle: dark → light
    const prevMode = 'dark'
    const newMode = prevMode === 'light' ? 'dark' : 'light'
    localStorage.setItem(THEME_STORAGE_KEY, newMode)

    expect(getStoredMode()).toBe('light')
  })
})
