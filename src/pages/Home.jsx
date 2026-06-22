import { Link } from 'react-router-dom'
import useReveal from '../components/useReveal'
import { useSEO } from '../components/useSEO'

function Reveal({ children, delay=0 }) {
  const ref = useReveal()
  return <div ref={ref} className="reveal" style={{ animationDelay:`${delay}ms` }}>{children}</div>
}

const MODULES = [
  { to:'/projects/electrochemistry', live:true,  label:'Chemistry',
    title:'Electrochemistry',
    desc:'Daniell cell in 3D. Click the switch to run the reaction. Drag concentrations to shift the Nernst voltage live. Watch lithium ions intercalate layer by layer.',
    accent:'#0071e3' },
  { to:'/projects/ibp', live:true, label:'Mathematics',
    title:'Integration by Parts',
    desc:'Start from the product rule. Drag a point on the curve and watch two areas always sum to the same rectangle — the formula becomes obvious.',
    accent:'#30d158' },
  { to:'/projects/equilibrium', live:true, label:'Chemistry',
    title:'Chemical Equilibria',
    desc:'Le Chatelier\'s principle, ICE tables, Kp vs Kc. Drag the concentration to simulate the NH₃ production',
    accent:'#ff9f0a' },
  { to:'/projects/complex', live:true, label:'Mathematics',
    title:'Complex Numbers',
    desc:'Argand plane, polar form, De Moivre\'s theorem.',
    accent:'#bf5af2' },
]

const FOOTER_LINKS = [
  { to:'/about',    label:'About'    },
  { to:'/research', label:'Research' },
  { to:'/contact',  label:'Contact'  },
]

export default function Home() {
  useSEO(
    null,
    'Interactive learning modules in chemistry and mathematics, built by battery researcher and educator Carlos Tafara Mpupuni.',
    '/'
  )
  return (
    <div>

      {/* ── Hero ── */}
      <section style={{
        minHeight:'100svh',
        background:'var(--bg-dark-section)',
        display:'flex', flexDirection:'column',
        alignItems:'center', justifyContent:'center',
        padding:'80px clamp(20px,5vw,56px) 64px',
        textAlign:'center', position:'relative',
      }}>
        <div style={{
          position:'absolute', inset:0, pointerEvents:'none',
          background:'radial-gradient(ellipse 80% 60% at 50% 55%, rgba(0,112,227,0.14) 0%, transparent 70%)',
        }}/>
        <div style={{ position:'relative', maxWidth:760 }}>
          <p className="t-label" style={{ color:'#6e6e73', marginBottom:20 }}>
            Learning Design Portfolio
          </p>
          <h1 className="t-hero" style={{ color:'#f5f5f7', marginBottom:24 }}>
            Interactive modules<br/>that make ideas click.
          </h1>
          <p className="t-sub" style={{ color:'#a1a1a6', marginBottom:48 }}>
            Built by Carlos Tafara Mpupuni — Researcher, Educator, and Engineer.
            Each module builds intuition before formalism.
          </p>
          <div style={{ display:'flex', gap:16, justifyContent:'center', flexWrap:'wrap' }}>
            <Link to="/projects" className="btn-blue">Explore modules</Link>
            <Link to="/about" className="btn-ghost" style={{ color:'#f5f5f7' }}>About me →</Link>
          </div>
        </div>
        {/* Scroll cue */}
        <div style={{ position:'absolute', bottom:36, left:'50%', transform:'translateX(-50%)',
          display:'flex', flexDirection:'column', alignItems:'center', gap:8 }}>
          <span style={{ fontSize:12, color:'#6e6e73', fontWeight:500, letterSpacing:'0.04em' }}>Scroll</span>
          <div style={{ width:1, height:36, background:'linear-gradient(to bottom,#6e6e73,transparent)' }}/>
        </div>
      </section>

      {/* ── Tagline ── */}
      <section style={{ background:'var(--bg-alt)',
        padding:'80px clamp(20px,5vw,56px)', textAlign:'center' }}>
        <Reveal>
          <p className="t-section" style={{ maxWidth:660, margin:'0 auto', lineHeight:1.2 }}>
            Every session is a{' '}
            <em style={{ fontStyle:'italic', fontWeight:300 }}>concept</em>,
            not a lecture.
          </p>
        </Reveal>
      </section>

      {/* ── Module grid ── */}
      <section style={{ background:'var(--bg)', padding:'0 clamp(20px,5vw,56px) 2px' }}>
        <div style={{ maxWidth:980, margin:'0 auto',
          display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))', gap:2 }}>
          {MODULES.map(({ to, live, label, title, desc, accent }, i) => (
            <Reveal key={title} delay={i*80}>
              <Link to={live ? to : '#'} style={{
                display:'block', textDecoration:'none',
                background:'var(--bg-card)',
                padding:'48px 40px', minHeight:300,
                opacity: live ? 1 : 0.45,
                pointerEvents: live ? 'auto' : 'none',
                transition:'transform 0.3s',
                cursor: live ? 'pointer' : 'default',
              }}
              onMouseEnter={e => { if(live) e.currentTarget.style.transform='scale(1.015)' }}
              onMouseLeave={e => { e.currentTarget.style.transform='scale(1)' }}>
                <p style={{ fontSize:12, fontWeight:600, letterSpacing:'0.08em',
                  textTransform:'uppercase', color:accent, marginBottom:16 }}>
                  {label}
                </p>
                <p style={{ fontSize:24, fontWeight:700, color:'var(--ink)',
                  letterSpacing:'-0.02em', marginBottom:14, lineHeight:1.2 }}>
                  {title}
                </p>
                <p style={{ fontSize:15, color:'var(--ink2)', lineHeight:1.65, marginBottom:24 }}>
                  {desc}
                </p>
                {live && (
                  <span style={{ fontSize:14, fontWeight:500, color:accent }}>
                    Open module →
                  </span>
                )}
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── About strip ── */}
      <section style={{ background:'var(--bg-alt)',
        padding:'100px clamp(20px,5vw,56px)' }}>
        <div style={{ maxWidth:980, margin:'0 auto',
          display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))',
          gap:64, alignItems:'start' }}>
          <Reveal>
            <p className="t-label" style={{ marginBottom:16 }}>About</p>
            <h2 className="t-section" style={{ marginBottom:24 }}>
              Researcher.<br/>Educator.<br/>Engineer.
            </h2>
            <Link to="/about" className="btn-ghost">Learn more →</Link>
          </Reveal>
          <Reveal delay={120}>
            <div style={{ display:'flex', flexDirection:'column', gap:24 }}>
              {[
                ['Research',    '2 papers · 2 patents · Li metal anode · Chungnam National University, Korea'],
                ['Teaching',    'A-Level Maths & Chemistry · Zimbabwe · ~10 years'],
                ['Engineering', 'BEng Chemical Engineering · Python · React · Blender · LaTeX'],
                ['Music',       '4 albums · composer · keyboard · Logic Pro · LilyPond'],
              ].map(([head, body]) => (
                <div key={head}>
                  <p style={{ fontWeight:600, fontSize:15, color:'var(--ink)', marginBottom:4 }}>{head}</p>
                  <p className="t-small">{body}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ background:'var(--bg-dark-section)',
        padding:'100px clamp(20px,5vw,56px)', textAlign:'center' }}>
        <Reveal>
          <h2 className="t-section" style={{ color:'#f5f5f7', marginBottom:20 }}>
            Ready to explore?
          </h2>
          <p className="t-sub" style={{ color:'#a1a1a6', marginBottom:40 }}>
            Start with any module. Each one stands alone.
          </p>
          <div style={{ display:'flex', gap:16, justifyContent:'center', flexWrap:'wrap' }}>
            <Link to="/projects/electrochemistry" className="btn-blue">Electrochemistry</Link>
            <Link to="/projects/ibp" className="btn-ghost" style={{ color:'#f5f5f7' }}>
              Integration by Parts →
            </Link>
          </div>
        </Reveal>
      </section>

      {/* ── Footer ── */}
      <footer style={{ background:'var(--bg-alt)',
        padding:'36px clamp(20px,5vw,56px)',
        borderTop:'1px solid var(--border)' }}>
        <div style={{ maxWidth:980, margin:'0 auto',
          display:'flex', justifyContent:'space-between',
          alignItems:'center', flexWrap:'wrap', gap:16 }}>
          <p style={{ fontSize:13, color:'var(--ink3)' }}>
            © {new Date().getFullYear()} Carlos Tafara Mpupuni · Daejeon, Korea
          </p>
          <div style={{ display:'flex', gap:24 }}>
            {FOOTER_LINKS.map(({ to, label }) => (
              <Link key={to} to={to} style={{ fontSize:13, color:'var(--ink3)',
                textDecoration:'none' }}>{label}</Link>
            ))}
          </div>
        </div>
      </footer>

    </div>
  )
}
