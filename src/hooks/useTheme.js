import { useState, useEffect } from 'react'

// Custom hook that manages the app theme (dark/light)
// Persists the user preference in localStorage
const useTheme = () => {

  const [theme, setTheme] = useState(() => {
    // Read saved preference on first render
    return localStorage.getItem('theme') || 'dark'
  })

  useEffect(() => {
    // Apply the theme attribute to the root element
    // CSS variables react to [data-theme="light"] selector in index.css
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))
  }

  return { theme, toggleTheme }
}

export default useTheme