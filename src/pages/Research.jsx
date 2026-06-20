import useReveal from '../components/useReveal'

function Reveal({ children, delay=0 }) {
  const ref = useReveal()
  return <div ref={ref} className="reveal" style={{ animationDelay:`${delay}ms` }}>{children}</div>
}

// ── Replace with your real details ──────────────────────────────────
const PAPERS = [
  { title:'Revolutionizing lithium–metal batteries: a synergistic effect of P₂O₅ and LiNO₃ composite protection layer in stabilizing the li-metal anode electrode',
    authors:'Mpupuni. C, et al.',
    journal:'ACS Appl. Energy Mater. 2024, 7, 13, 5408–5417',
    doi:'https://doi.org/10.1021/acsaem.4c00667',
    tags:['Lithium metal anode','Electrochemistry','P₂O₅', 'LiNO₃', 'Protective coating'] },
  { title:'A Bifunctional Carbon-LiNO₃ Composite Interlayer for Stable Lithium Metal Powder Electrodes as High Energy Density Anode Material in Lithium Batteries',
    authors:'Mpupuni. C, et al.',
    journal:'Journal of The Electrochemical Society, 2024 171 090508',
    doi:'https://doi.org/10.1149/1945-7111/ad7295',
    tags:['Li metal powder','Battery materials', 'vapor grown fibre', 'LiNO₃'] },
  { title:'Keeping it simple: free-standing, flexible cathodic electrodes for high rate, long cycling lithium batteries',
    authors:'Isheunesu Phiri, Jungmin Kim, Carlos Tafara Mpupuni, Kennedy Ssendagire, Jeong-Tae Kim, Yongmin Lee, Sun-Yul Ryou',
    journal:'ACS Appl. Energy Mater. 2022, 5, 11, 13535–13543',
    doi:'https://doi.org/10.1021/acsaem.2c02211',
    tags:['Li metal powder','Battery materials', 'vapor grown fibre', 'LiNO₃', 'cathode'] },
  { title:'The impact of volume expansion on thermodynamic and kinetic properties of graphite/Si alloy composite anodes',
    authors:'Min-ho Lee, Orynbassar Mukhan, Carlos Tafara Mpupuni, Batukhan Tatykayev, Zhumabay Bakenov, Sung Soo Kim',
    journal:'RSC Adv., 2025, 15, 47790-47802',
    doi:'https://doi.org/10.1039/D5RA07317K',
    tags:['Silicon','Battery materials', 'graphite', 'blending', 'volume expansion', 'Dilation'] },
]

const PATENTS = [
  { title:'Revolutionizing lithium–metal batteries: a synergistic effect of P₂O₅ and LiNO₃ composite protection layer in stabilizing the li-metal anode electrode',
    number:'2024-1-160-KR_명세서_초안', year:'2024',
    note:'Filed. Chungnam National University.' },
  { title:'A Bifunctional Carbon-LiNO₃ Composite Interlayer for Stable Lithium Metal Powder Electrodes as High Energy Density Anode Material in Lithium Batteries',
    number:'2024-1-159-KR_명세서_초안', year:'2025',
    note:'Filed. Chungnam National University.' },
]

export default function Research() {
  return (
    <div>
      {/* Hero */}
      <section style={{ background:'var(--bg-dark-section)', minHeight:'45vh',
        display:'flex', alignItems:'flex-end',
        padding:'120px clamp(20px,5vw,56px) 64px' }}>
        <Reveal>
          <p className="t-label" style={{ color:'#6e6e73', marginBottom:16 }}>Research</p>
          <h1 className="t-hero" style={{ color:'#f5f5f7', maxWidth:560, marginBottom:20 }}>
            Publications<br/>& patents.
          </h1>
          <p className="t-sub" style={{ color:'#a1a1a6', maxWidth:480 }}>
            Lithium metal anodes, solid-electrolyte interphase engineering,
            and battery informatics.
          </p>
        </Reveal>
      </section>

      {/* Papers */}
      <section style={{ background:'var(--bg)', padding:'80px clamp(20px,5vw,56px)' }}>
        <div style={{ maxWidth:720, margin:'0 auto' }}>
          <Reveal>
            <p className="t-label" style={{ marginBottom:40 }}>Journal articles</p>
          </Reveal>
          {PAPERS.map((p, i) => (
            <Reveal key={i} delay={i*80}>
              <div style={{ paddingBottom:48,
                borderBottom: i < PAPERS.length-1 ? '1px solid var(--border)' : 'none',
                marginBottom: i < PAPERS.length-1 ? 48 : 0 }}>
                <p style={{ fontWeight:600, fontSize:18, color:'var(--ink)',
                  lineHeight:1.4, marginBottom:8 }}>{p.title}</p>
                <p style={{ fontSize:14, color:'var(--ink2)', marginBottom:4 }}>{p.authors}</p>
                <p style={{ fontSize:14, color:'var(--ink3)', marginBottom:16 }}>{p.journal}</p>
                <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:16 }}>
                  {p.tags.map(t => (
                    <span key={t} style={{ fontSize:12, fontWeight:500, padding:'4px 12px',
                      borderRadius:980, border:'1px solid var(--border)',
                      color:'var(--ink3)' }}>{t}</span>
                  ))}
                </div>
                <a href={p.doi} target="_blank" rel="noopener noreferrer"
                  style={{ fontSize:14, fontWeight:500, color:'var(--blue)',
                    textDecoration:'none' }}>
                  View paper →
                </a>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Patents */}
      <section style={{ background:'var(--bg-alt)', padding:'80px clamp(20px,5vw,56px)' }}>
        <div style={{ maxWidth:720, margin:'0 auto' }}>
          <Reveal>
            <p className="t-label" style={{ marginBottom:40 }}>Patents</p>
          </Reveal>
          {PATENTS.map((p, i) => (
            <Reveal key={i} delay={i*80}>
              <div style={{ paddingBottom:40,
                borderBottom: i < PATENTS.length-1 ? '1px solid var(--border)' : 'none',
                marginBottom: i < PATENTS.length-1 ? 40 : 0 }}>
                <p style={{ fontWeight:600, fontSize:18, color:'var(--ink)',
                  lineHeight:1.4, marginBottom:8 }}>{p.title}</p>
                <p style={{ fontSize:14, color:'var(--ink3)', marginBottom:4 }}>
                  {p.number} · {p.year}
                </p>
                <p style={{ fontSize:14, color:'var(--ink2)' }}>{p.note}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>
    </div>
  )
}
