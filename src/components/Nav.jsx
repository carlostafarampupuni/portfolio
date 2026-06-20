import { useState, useEffect } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { useTheme } from './ThemeContext'

const LINKS = [
  { to:'/about',    label:'About'    },
  { to:'/projects', label:'Projects' },
  { to:'/research', label:'Research' },
  { to:'/contact',  label:'Contact'  },
]

export default function Nav() {
  const { dark, toggle } = useTheme()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const { pathname } = useLocation()

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  // Close menu on route change
  useEffect(() => { setMenuOpen(false) }, [pathname])

  const navBg = scrolled || menuOpen
    ? 'var(--nav-bg)'
    : 'transparent'

  return (
    <nav style={{
      position:'fixed', top:0, left:0, right:0, zIndex:1000,
      background: navBg,
      backdropFilter: scrolled || menuOpen ? 'saturate(180%) blur(20px)' : 'none',
      borderBottom: scrolled || menuOpen ? '1px solid var(--border)' : 'none',
      transition:'background 0.3s, border-color 0.3s',
    }}>
      <div style={{
        height:48, display:'flex', alignItems:'center',
        justifyContent:'space-between',
        padding:'0 clamp(16px,5vw,52px)',
      }}>
        {/* Logo */}
        <NavLink to="/" style={{ textDecoration:'none' }}>
          <span style={{ fontSize:15, fontWeight:600, color:'var(--ink)',
            letterSpacing:'-0.01em' }}>Carlos Tafara Mpupuni</span>
        </NavLink>

        {/* Desktop links */}
        <div style={{ display:'flex', gap:'clamp(20px,3vw,36px)',
          alignItems:'center' }} className="nav-links">
          {LINKS.map(({ to, label }) => (
            <NavLink key={to} to={to} style={({ isActive }) => ({
              textDecoration:'none', fontSize:13, fontWeight:400,
              color: isActive ? 'var(--ink)' : 'var(--ink2)',
              transition:'color 0.15s',
            })}>
              {label}
            </NavLink>
          ))}

          {/* Dark mode toggle */}
          <button onClick={toggle} aria-label="Toggle dark mode" style={{
            width:32, height:20, borderRadius:10, padding:2,
            background: dark ? 'var(--blue)' : 'var(--border)',
            border:'none', cursor:'pointer', position:'relative',
            transition:'background 0.3s', flexShrink:0,
          }}>
            <span style={{
              display:'block', width:16, height:16, borderRadius:'50%',
              background:'#fff',
              transform: dark ? 'translateX(12px)' : 'translateX(0)',
              transition:'transform 0.3s',
              boxShadow:'0 1px 3px rgba(0,0,0,0.2)',
            }}/>
          </button>
        </div>

        {/* Mobile: toggle + hamburger */}
        <div style={{ display:'flex', gap:12, alignItems:'center' }}
          className="mobile-controls">
          <button onClick={toggle} aria-label="Toggle dark mode" style={{
            width:32, height:20, borderRadius:10, padding:2,
            background: dark ? 'var(--blue)' : 'var(--border)',
            border:'none', cursor:'pointer', position:'relative',
            transition:'background 0.3s',
          }}>
            <span style={{
              display:'block', width:16, height:16, borderRadius:'50%',
              background:'#fff',
              transform: dark ? 'translateX(12px)' : 'translateX(0)',
              transition:'transform 0.3s',
            }}/>
          </button>

          <button onClick={() => setMenuOpen(o => !o)}
            aria-label="Menu"
            style={{ display:'none', flexDirection:'column', gap:5,
              padding:4, background:'none', border:'none', cursor:'pointer' }}
            className="hamburger">
            {[0,1,2].map(i => (
              <span key={i} style={{
                display:'block', width:22, height:1.5, borderRadius:1,
                background:'var(--ink)',
                transformOrigin:'center',
                transition:'transform 0.2s, opacity 0.2s',
                transform: menuOpen
                  ? i===0 ? 'translateY(6.5px) rotate(45deg)'
                  : i===2 ? 'translateY(-6.5px) rotate(-45deg)'
                  : 'scaleX(0)'
                  : 'none',
                opacity: menuOpen && i===1 ? 0 : 1,
              }}/>
            ))}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div style={{
        overflow:'hidden',
        maxHeight: menuOpen ? 300 : 0,
        transition:'max-height 0.35s cubic-bezier(0.4,0,0.2,1)',
        borderTop: menuOpen ? '1px solid var(--border)' : 'none',
        background:'var(--nav-bg)',
        backdropFilter:'saturate(180%) blur(20px)',
      }}>
        <div style={{ padding:'16px clamp(16px,5vw,52px) 24px',
          display:'flex', flexDirection:'column', gap:0 }}>
          {LINKS.map(({ to, label }) => (
            <NavLink key={to} to={to} style={({ isActive }) => ({
              textDecoration:'none', fontSize:17, fontWeight:500,
              color: isActive ? 'var(--ink)' : 'var(--ink2)',
              padding:'12px 0',
              borderBottom:'1px solid var(--border)',
            })}>
              {label}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  )
}
