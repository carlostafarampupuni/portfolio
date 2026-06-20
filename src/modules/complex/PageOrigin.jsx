import { useState } from 'react'
import NavRow from './NavRow'

const STEPS = [
  {
    label: 'The problem',
    math: 'x² = 4   →   x = ±2   ✓\n\nx² = −1   →   x = ?',
    note: 'The first equation is easy. The second has no real number solution — try every real number and its square is always ≥ 0. So what do we do?',
  },
  {
    label: 'Two choices',
    math: 'A.  Declare x² = −1 impossible.\n\nB.  Extend the number system.',
    note: 'In the 1500s, mathematicians kept running into equations whose solutions seemed to require √(−1). They chose B. That is how complex numbers were born — not for elegance, but out of necessity.',
  },
  {
    label: 'Name the solution',
    math: 'Define i  such that  i² = −1\n\ni is a number with a special job:\nit is the square root of −1.',
    note: 'The word "imaginary" is a historical accident — Descartes used it as a dismissal. Don\'t take it literally. i is no less real than −1 or √2.',
  },
  {
    label: 'Build from i',
    math: 'i⁰ = 1\ni¹ = i\ni² = −1\ni³ = −i\ni⁴ = 1   ← back to start',
    note: 'Powers of i cycle with period 4. This isn\'t a coincidence — it\'s what multiplication by i does geometrically. The next page shows why.',
    highlight: true,
  },
]

export default function PageOrigin({ onNext }) {
  const [step, setStep] = useState(0)
  const s = STEPS[step]

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:40 }}>

      <div>
        <h1>Where do complex numbers come from?</h1>
        <p style={{ marginTop:16 }}>
          Most courses define <span className="math">i² = −1</span> and move on. Let's ask the prior question: why would anyone invent <span className="math">i</span> at all?
        </p>
      </div>

      {/* Step dots */}
      <div style={{ display:'flex', gap:8 }}>
        {STEPS.map((_, i) => (
          <button key={i} onClick={() => setStep(i)} style={{
            width:32, height:32, borderRadius:'50%', fontWeight:700, fontSize:14,
            background: i === step ? 'var(--ink)' : i < step ? 'var(--border)' : 'transparent',
            color: i === step ? '#fff' : i < step ? 'var(--ink2)' : 'var(--ink3)',
            border: i === step ? 'none' : '1px solid var(--border)',
            transition:'all 0.2s',
          }}>{i + 1}</button>
        ))}
      </div>

      {/* Step block */}
      <div key={step} className="fade">
        <p style={{ color:'var(--ink3)', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', fontSize:13, marginBottom:16 }}>
          {s.label}
        </p>
        <div className="math" style={{
          fontSize:'clamp(18px, 3.5vw, 26px)',
          lineHeight:1.8,
          padding:'32px 0',
          whiteSpace:'pre-line',
          borderTop:'1px solid var(--border)',
          borderBottom:'1px solid var(--border)',
          fontWeight: s.highlight ? '700' : '400',
        }}>
          {s.math}
        </div>
        <p style={{ marginTop:20 }}>{s.note}</p>
      </div>

      <div style={{ display:'flex', justifyContent:'space-between' }}>
        <button disabled={step === 0} onClick={() => setStep(s => s - 1)}
          style={{ color:'var(--ink3)', fontWeight:700, opacity:step===0?0.3:1 }}>← Prev</button>
        {step < STEPS.length - 1
          ? <button onClick={() => setStep(s => s + 1)} style={{
              background:'var(--ink)', color:'#fff',
              padding:'12px 28px', borderRadius:100,
              fontSize:'var(--sz-b)', fontWeight:700,
            }}>Next step →</button>
          : <button onClick={onNext} style={{
              background:'var(--teal)', color:'#fff',
              padding:'12px 28px', borderRadius:100,
              fontSize:'var(--sz-b)', fontWeight:700,
            }}>See the geometry →</button>
        }
      </div>

      <NavRow onNext={step === STEPS.length - 1 ? onNext : undefined} nextLabel="Skip to geometry →"/>
    </div>
  )
}
