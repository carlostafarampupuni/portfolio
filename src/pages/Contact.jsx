import useReveal from '../components/useReveal'

function Reveal({ children, delay=0 }) {
  const ref = useReveal()
  return <div ref={ref} className="reveal" style={{ animationDelay:`${delay}ms` }}>{children}</div>
}

// ── Replace with your real details ───────────────────────────────────
const LINKS = [
  { label:'Email',        value:'carlostafarampupuni@gmail.com',
    href:'mailto:carlostafarampupuni@gmail.com' },
  { label:'GitHub',       value:'@Carlostafara',
    href:'https://github.com/carlostafarampupuni' },
  { label:'LinkedIn',     value:'Carlos Tafara Mpupuni',
    href:'https://www.linkedin.com/in/carlos-mpupuni-89765733a/' },
  { label:'Google Scholar', value:'Research Profile',
    href:'https://scholar.google.com/citations?user=xR96gaYAAAAJ&hl=en' },
  { label:'ResearchGate', value:'Carlos Tafara Mpupuni',
    href:'https://www.researchgate.net/profile/Carlos-Mpupuni?ev=hdr_xprf' },
]

export default function Contact() {
  return (
    <div>
      {/* Hero */}
      <section style={{ background:'var(--bg-dark-section)', minHeight:'45vh',
        display:'flex', alignItems:'flex-end',
        padding:'120px clamp(20px,5vw,56px) 64px' }}>
        <Reveal>
          <p className="t-label" style={{ color:'#6e6e73', marginBottom:16 }}>Contact</p>
          <h1 className="t-hero" style={{ color:'#f5f5f7', maxWidth:480, marginBottom:20 }}>
            Get in touch.
          </h1>
          <p className="t-sub" style={{ color:'#a1a1a6', maxWidth:480 }}>
            Whether you’re interested in battery research, engineering, STEM education,
            scientific visualization, or collaborative projects, I would be glad to connect.
          </p>
        </Reveal>
      </section>

      {/* Links */}
      <section style={{ background:'var(--bg)', padding:'80px clamp(20px,5vw,56px)' }}>
        <div style={{ maxWidth:640, margin:'0 auto' }}>
          {LINKS.map(({ label, value, href }, i) => (
            <Reveal key={label} delay={i*60}>
              <a href={href} target="_blank" rel="noopener noreferrer" style={{
                display:'flex', justifyContent:'space-between', alignItems:'center',
                padding:'22px 0',
                borderBottom:'1px solid var(--border)',
                textDecoration:'none',
                transition:'opacity 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.opacity='0.6'}
              onMouseLeave={e => e.currentTarget.style.opacity='1'}>
                <span style={{ fontWeight:600, fontSize:17, color:'var(--ink)' }}>{label}</span>
                <span style={{ fontSize:14, color:'var(--ink3)' }}>{value} →</span>
              </a>
            </Reveal>
          ))}

          <Reveal delay={400}>
            <p style={{ marginTop:48, fontSize:14, color:'var(--ink3)', lineHeight:1.8 }}>
              Chungnam National University<br/>
              Department of Energy Science and Technology<br/>
              Daejeon, Republic of Korea
            </p>
          </Reveal>
        </div>
      </section>
    </div>
  )
}
