import { useState, useEffect } from 'react'

export type UseKeyboardHeightReturn = {
  keyboardHeight: number
  isKeyboardVisible: boolean
}

export const useKeyboardHeight = (): UseKeyboardHeightReturn => {
  const [keyboardHeight, setKeyboardHeight] = useState(0)

  useEffect(() => {
    const viewport = window.visualViewport

    if (!viewport) {
      return
    }

    const handleResize = (): void => {
      const heightDiff = window.innerHeight - viewport.height
      setKeyboardHeight(Math.max(0, heightDiff))
    }

    viewport.addEventListener('resize', handleResize)

    return (): void => {
      viewport.removeEventListener('resize', handleResize)
    }
  }, [])

  return { keyboardHeight, isKeyboardVisible: keyboardHeight > 0 }
}
