

import { Link } from 'react-router-dom'
import useReveal from '../components/useReveal'

function Reveal({ children, delay=0 }) {
  const ref = useReveal()
  return <div ref={ref} className="reveal" style={{ animationDelay:`${delay}ms` }}>{children}</div>
}

const TIMELINE = [
  {
    year: '2025 →',
    title: 'PhD Candidate',
    place: 'Chungnam National University · Daejeon, Korea',
    body: 'Advanced energy materials. Research focus: lithium metal anodes, solid-electrolyte interphase engineering, and capacity-fade diagnostics.',
  },
  {
    year: '2023–25',
    title: 'MSc Energy Science & Technology',
    place: 'Chungnam National University · Daejeon, Korea',
    body: 'Graduated 25 Aug 2025. 2 peer-reviewed papers published. 2 patents filed on lithium metal anode technology.',
  },
  {
    year: '2021–23',
    title: 'Graduate Researcher',
    place: 'Hanbat National University · Daejeon, Korea',
    body: 'Began materials science research in South Korea. Continued online piano tutoring in parallel — the classroom never fully stopped.',
  },
  {
    year: '2018–21',
    title: 'Piano Tutor & Entrepreneur',
    place: 'Bulawayo & Harare, Zimbabwe → Online (2021–present)',
    body: 'Left a full-time teaching post to run a mobile piano tutoring business — visiting students at home with a keyboard, teaching by ear and by principle. Scaled to 20 students before relocating to Korea. This chapter taught branding, sales, design, and customer care more concretely than any course. Still teaching: three students from one family, online, today.',
  },
  {
    year: '2017–18',
    title: 'AS & A-Level Teacher — Mathematics & Chemistry',
    place: 'Littlerock International School · Harare  ·  then Hilbright Science College · Harare',
    body: 'Cambridge IGCSE, AS, and A-Level experience in both subjects. Deepened LaTeX for professional exam design. Began self-teaching web development — motivated by wanting a path beyond the classroom. At Hilbright, the gap between effort and financial reward crystallised the decision to pivot.',
  },
  {
    year: '2015–17',
    title: 'Teacher — Integrated Science & Chemistry',
    place: 'Bulawayo Adventist High School · Bulawayo',
    body: 'Forms 1–3 Integrated Science and A-Level Chemistry. In addition to teaching, directed the school choir and accompanied worship services on piano. LaTeX adopted here — professional exam typesetting felt like a minimum standard.',
  },
  {
    year: '2014–15',
    title: 'Teacher — O-Level Biology',
    place: 'Townsend Girls High School · Bulawayo',
    body: 'O- and A-Level Biology. A short but formative posting between the ZINWA attachment and a return to BAHS.',
  },
  {
    year: '2013–14',
    title: 'Industrial Attachment — ZINWA',
    place: 'Zimbabwe National Water Authority',
    body: 'Final-year engineering attachment in water resources and process engineering — required component of the BEng programme.',
  },
  {
    year: '2010–13',
    title: 'A-Level Chemistry & O-Level Science Teacher',
    place: 'Bulawayo Adventist High School · Bulawayo',
    body: 'Taught concurrently while completing a full engineering degree — not the conventional path, but an honest one. This is where the instinct for clear explanation was forged: teaching advanced chemistry to real students while still being a student myself.',
  },
  {
    year: '2007-2014',
    title: 'BEng (Hons) Chemical Engineering',
    place: 'National University of Science and Technology · Bulawayo, Zimbabwe',
    body: 'Built a strong foundation in thermodynamics, reaction engineering, materials science, process design, statistics, engineering mathematics, and process optimization, with extensive experience applying mathematical and scientific principles to analyze, model, and solve engineering challenges.',
  },
]

export default function About() {
  return (
      <div>

        {/* Hero */}
        <section style={{ background:'var(--bg-dark-section)', minHeight:'55vh',
          display:'flex', alignItems:'flex-end',
          padding:'120px clamp(20px,5vw,56px) 64px' }}>
          <div style={{ maxWidth:680 }}>
            <Reveal>
              <p className="t-label" style={{ color:'#6e6e73', marginBottom:16 }}>About</p>
              <h1 className="t-hero" style={{ color:'#f5f5f7', marginBottom:20 }}>
                Researcher.<br/>Educator.<br/>Engineer.
              </h1>
              <p className="t-sub" style={{ color:'#a1a1a6' }}>
                Researcher and educator passionate about turning complex scientific
                concepts into clear insights through experiments, visualization, and computation.
              </p>
            </Reveal>
          </div>
        </section>

        {/* Timeline */}
        <section style={{ background:'var(--bg)', padding:'80px clamp(20px,5vw,56px)' }}>
          <div style={{ maxWidth:720, margin:'0 auto' }}>
            <Reveal>
              <p className="t-label" style={{ marginBottom:48 }}>Timeline</p>
            </Reveal>
            {TIMELINE.map(({ year, title, place, body }, i) => (
                <Reveal key={year} delay={i*80}>
                  <div style={{ display:'grid', gridTemplateColumns:'90px 1fr',
                    gap:32, paddingBottom:48,
                    borderBottom: i < TIMELINE.length-1 ? '1px solid var(--border)' : 'none',
                    marginBottom: i < TIMELINE.length-1 ? 48 : 0 }}>
                <span style={{ fontSize:13, fontWeight:500, color:'var(--ink3)',
                  paddingTop:4, lineHeight:1.4 }}>{year}</span>
                    <div>
                      <p style={{ fontWeight:600, fontSize:18, color:'var(--ink)', marginBottom:4 }}>{title}</p>
                      <p style={{ fontSize:14, color:'var(--ink3)', marginBottom:12 }}>{place}</p>
                      <p style={{ fontSize:16, color:'var(--ink2)', lineHeight:1.7 }}>{body}</p>
                    </div>
                  </div>
                </Reveal>
            ))}
          </div>
        </section>

        {/* Personal + Skills */}
        <section style={{ background:'var(--bg-alt)', padding:'80px clamp(20px,5vw,56px)' }}>
          <div style={{ maxWidth:720, margin:'0 auto',
            display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))', gap:48 }}>
            <Reveal>
              <p className="t-label" style={{ marginBottom:20 }}>Services</p>
              <p style={{ fontSize:17, color:'var(--ink2)', lineHeight:1.8, marginBottom:14 }}>
                Seventh-day Adventist. Husband. Father to a young son born in 2025.
              </p>
              <p style={{ fontSize:17, color:'var(--ink2)', lineHeight:1.8, marginBottom:14 }}>
                Online piano tutoring by ear
              </p>
              <p style={{ fontSize:17, color:'var(--ink2)', lineHeight:1.8, marginBottom:14 }}>
                Music production (Mixing and mastering)
              </p>
              <p style={{ fontSize:17, color:'var(--ink2)', lineHeight:1.8 }}>
                Maths & Chemistry (A-Level, IGCSE, Cambridge)
              </p>
              <p style={{ fontSize:17, color:'var(--ink2)', lineHeight:1.8 }}>
                Songwriting (Original composition and scoring in LilyPond)
              </p>
              <p style={{ fontSize:17, color:'var(--ink2)', lineHeight:1.8 }}>
                Preaching (Righteousness by faith and character development)
              </p>
            </Reveal>
            <Reveal delay={100}>
              <p className="t-label" style={{ marginBottom:20 }}>Tools & skills</p>
              <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                {[
                  ['Research', 'Lithium-metal batteries · Electrochemistry · EIS · GITT · Materials characterization · Scientific communication'],
                  ['Development', 'React · JavaScript · Vite · Three.js · Python · LaTeX · Git · Educational software'],
                  ['Education', 'A-Level Mathematics · Chemistry · Curriculum design · Assessment design · Learning experience design'],
                  ['Creative', 'Logic Pro · LilyPond · Piano · Composition · Blender · Affinity Suite · Video production'],
                ].map(([label, text]) => (
                    <div key={label} style={{ display:'flex', gap:16, alignItems:'baseline' }}>
                  <span style={{ fontSize:13, fontWeight:600, color:'var(--ink)',
                    minWidth:108, flexShrink:0 }}>{label}</span>
                      <span style={{ fontSize:14, color:'var(--ink2)' }}>{text}</span>
                    </div>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        {/* CTA */}
        <section style={{ background:'var(--bg)',
          padding:'80px clamp(20px,5vw,56px)', textAlign:'center' }}>
          <Reveal>
            <h2 className="t-section" style={{ marginBottom:24 }}>See the work.</h2>
            <Link to="/projects" className="btn-blue">Explore modules</Link>
          </Reveal>
        </section>

      </div>
  )
}