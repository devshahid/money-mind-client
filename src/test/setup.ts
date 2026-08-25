/**
 * Vitest global setup
 *
 * - Registers @testing-library/jest-dom matchers for the jsdom-based
 *   component tests.
 * - Polyfills window.matchMedia, which jsdom does not implement but MUI's
 *   useMediaQuery relies on.
 */
import '@testing-library/jest-dom/vitest'

if (typeof window !== 'undefined' && typeof window.matchMedia !== 'function') {
  window.matchMedia = (query: string): MediaQueryList =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }) as unknown as MediaQueryList
}
