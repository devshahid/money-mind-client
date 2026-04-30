/**
 * Global styles for Money Mind Application
 * These styles are applied globally to the entire application
 */

export const globalStyles = `
  html, body, #root {
    height: 100%;
    width: 100%;
    margin: 0;
    padding: 0;
  }
  
  * {
    box-sizing: border-box;
  }

  /* Custom scrollbar styling */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    background: #f0f0f0;
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb {
    background-color: #c1c1c1;
    border-radius: 4px;
    border: 2px solid transparent;
    background-clip: content-box;
  }

  ::-webkit-scrollbar-thumb:hover {
    background-color: #a0a0a0;
  }

  /* Firefox scrollbar */
  * {
    scrollbar-width: thin;
    scrollbar-color: #c1c1c1 #f0f0f0;
  }

  /* Disable text selection on buttons and interactive elements */
  button,
  a {
    -webkit-tap-highlight-color: transparent;
    user-select: none;
  }

  /* Smooth scrolling */
  html {
    scroll-behavior: smooth;
  }

  /* Remove default focus outline and add custom one */
  *:focus-visible {
    outline: 2px solid #1976d2;
    outline-offset: 2px;
  }

  /* Prevent horizontal scrollbar */
  body {
    overflow-x: hidden;
  }
`
