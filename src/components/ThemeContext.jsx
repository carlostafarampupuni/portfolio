import { createContext, useContext, useEffect, useState } from 'react'

const Ctx = createContext(null)

const isBrowser = typeof window !== 'undefined'

export function ThemeProvider({ children }) {
  const [dark, setDark] = useState(() => {
    if (!isBrowser) return false
    const saved = localStorage.getItem('theme')
    if (saved) return saved === 'dark'
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  useEffect(() => {
    if (!isBrowser) return
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light')
    localStorage.setItem('theme', dark ? 'dark' : 'light')
  }, [dark])

  return (
    <Ctx.Provider value={{ dark, toggle: () => setDark(d => !d) }}>
      {children}
    </Ctx.Provider>
  )
}

export function useTheme() { return useContext(Ctx) }
