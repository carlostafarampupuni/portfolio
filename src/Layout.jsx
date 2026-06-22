import { Suspense } from 'react'
import { Outlet } from 'react-router-dom'
import { ThemeProvider } from './components/ThemeContext'
import Nav from './components/Nav'

function Loading() {
  return (
    <div style={{ height:'80vh', display:'flex', alignItems:'center',
      justifyContent:'center', color:'var(--ink3)', fontSize:14, fontWeight:500 }}>
      Loading…
    </div>
  )
}

export default function Layout() {
  return (
    <ThemeProvider>
      <Nav/>
      <Suspense fallback={<Loading/>}>
        <Outlet/>
      </Suspense>
    </ThemeProvider>
  )
}
