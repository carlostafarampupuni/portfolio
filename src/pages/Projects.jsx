import { Link } from 'react-router-dom'
import useReveal from '../components/useReveal'

function Reveal({ children, delay=0 }) {
  const ref = useReveal()
  return <div ref={ref} className="reveal" style={{ animationDelay:`${delay}ms` }}>{children}</div>
}

const SECTIONS = [
  { category:'Chemistry', items:[
    { to:'/projects/electrochemistry', live:true,
      title:'Electrochemistry', meta:'Daniell cell · Nernst equation · Li-ion intercalation',
      body:'3D interactive Daniell cell. Click the switch in the scene to run the reaction. Drag concentrations and watch the Nernst equation update live. Then intercalate lithium into graphite — layer by layer.' },
    { to:'/projects/equilibrium', live:true,
      title:'Chemical Equilibria', meta:'Le Chatelier · ICE tables · Kp vs Kc',
      body:'Start with a reaction that is not at equilibrium. Add reactants, remove products, change pressure, and watch the system respond in real time. Build ICE tables visually, track Q and K as they converge, and discover how Kp and Kc emerge naturally from the ideal gas law.' },
  ]},
  { category:'Mathematics', items:[
    { to:'/projects/ibp', live:true,
      title:'Integration by Parts', meta:'Geometric proof · LIATE · cyclic integrals',
      body:'Start from the product rule, not the formula. Drag a point on the curve and watch two areas always sum to the same rectangle. The formula stops looking arbitrary.' },
    { to:'/projects/complex', live:true,
      title:'Complex Numbers', meta:'Argand plane · polar form · De Moivre',
      body:'Rotate vectors on the Argand plane, see multiplication as rotation, and prove De Moivre\'s theorem visually.' },
  ]},
  { category:'Research & Analysis Tools', items:[
    { to:'/projects', live:false,
      title:'Battery Analysis Dashboard', meta:'Python · Streamlit · EIS · dQ/dV · capacity fade',
      body:'In development. Upload your battery cycling data and get automated dQ/dV peak tracking, EIS Nyquist plots, and capacity-fade diagnostics.' },
    { to:'/projects/blender', live:true,
      title:'Schematics', meta:'Coin cell · pouch · cylindrical',
      body:'Photorealistic 3D renders of electrochemical cell architectures for publication and teaching.' },
  ]},
]

export default function Projects() {
  return (
    <div>
      {/* Hero */}
      <section style={{ background:'var(--bg-dark-section)', minHeight:'45vh',
        display:'flex', alignItems:'flex-end',
        padding:'120px clamp(20px,5vw,56px) 64px' }}>
        <Reveal>
          <p className="t-label" style={{ color:'#6e6e73', marginBottom:16 }}>Projects</p>
          <h1 className="t-hero" style={{ color:'#f5f5f7', maxWidth:560, marginBottom:20 }}>
            Modules & tools.
          </h1>
          <p className="t-sub" style={{ color:'#a1a1a6', maxWidth:480 }}>
            Each module is one concept, fully understood.
          </p>
        </Reveal>
      </section>

      {SECTIONS.map(({ category, items }, si) => (
        <section key={category} style={{
          background: si%2===0 ? 'var(--bg)' : 'var(--bg-alt)',
          padding:'80px clamp(20px,5vw,56px)',
        }}>
          <div style={{ maxWidth:980, margin:'0 auto' }}>
            <Reveal>
              <p className="t-label" style={{ marginBottom:40 }}>{category}</p>
            </Reveal>
            <div style={{ display:'grid',
              gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))', gap:2 }}>
              {items.map(({ to, live, title, meta, body }, i) => (
                <Reveal key={title} delay={i*80}>
                  <Link to={live ? to : '#'} style={{
                    display:'block', textDecoration:'none',
                    padding:'40px 36px', minHeight:260,
                    background: live ? 'var(--bg-dark-section)' : 'var(--bg-card)',
                    opacity: live ? 1 : 0.5,
                    pointerEvents: live ? 'auto' : 'none',
                    transition:'opacity 0.2s',
                    borderRadius: 0,
                  }}>
                    <p style={{ fontSize:12, fontWeight:600, letterSpacing:'0.08em',
                      textTransform:'uppercase', marginBottom:12,
                      color: live ? 'var(--blue)' : 'var(--ink3)' }}>
                      {live ? 'Live' : 'In development'}
                    </p>
                    <p style={{ fontSize:22, fontWeight:700, letterSpacing:'-0.02em',
                      marginBottom:8, lineHeight:1.3,
                      color: live ? '#f5f5f7' : 'var(--ink)' }}>{title}</p>
                    <p style={{ fontSize:13, marginBottom:16,
                      color: live ? '#6e6e73' : 'var(--ink3)' }}>{meta}</p>
                    <p style={{ fontSize:15, lineHeight:1.65,
                      color: live ? '#a1a1a6' : 'var(--ink2)' }}>{body}</p>
                    {live && (
                      <p style={{ marginTop:24, fontSize:14, fontWeight:500,
                        color:'var(--blue)' }}>Open →</p>
                    )}
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      ))}
    </div>
  )
}
