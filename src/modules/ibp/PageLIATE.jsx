import { useState } from 'react'
import NavRow from './NavRow'

const LIATE = [
  { l:'L', name:'Logarithms',    ex:'ln x, log₂x',         c:'#1c1b18' },
  { l:'I', name:'Inverse trig',  ex:'arcsin x, arctan x',  c:'#1c1b18' },
  { l:'A', name:'Algebraic',     ex:'x², xⁿ, polynomials', c:'#1c1b18' },
  { l:'T', name:'Trig',          ex:'sin x, cos x',        c:'#1c1b18' },
  { l:'E', name:'Exponential',   ex:'eˣ, e^(kx)',          c:'#1c1b18' },
]

const EXAMPLES = [
  {
    title:'∫ x eˣ dx',
    pick:'x is Algebraic, eˣ is Exponential — A before E, so u = x',
    steps:[
      { t:'Choose',   m:'u = x        →    du = dx\ndv = eˣ dx   →    v = eˣ' },
      { t:'Apply',    m:'∫ x eˣ dx  =  x eˣ  −  ∫ eˣ dx' },
      { t:'Integrate',m:'= x eˣ − eˣ + C  =  eˣ(x − 1) + C' },
    ],
  },
  {
    title:'∫ ln x dx',
    pick:'Write ∫ ln x · 1 dx. L comes first, so u = ln x, dv = 1·dx',
    steps:[
      { t:'Choose',   m:'u = ln x   →   du = (1/x) dx\ndv = dx    →   v = x' },
      { t:'Apply',    m:'= x ln x  −  ∫ x · (1/x) dx\n= x ln x  −  ∫ 1 dx' },
      { t:'Answer',   m:'= x ln x − x + C' },
    ],
  },
  {
    title:'∫ x² sin x dx',
    pick:'x² is Algebraic, sin x is Trig — A before T, u = x². Needs two rounds.',
    steps:[
      { t:'IBP #1',   m:'u = x²,  du = 2x dx\ndv = sin x dx,  v = −cos x\n→  −x² cos x + 2∫ x cos x dx' },
      { t:'IBP #2',   m:'u = x,  du = dx\ndv = cos x dx,  v = sin x\n→  x sin x − ∫ sin x dx = x sin x + cos x' },
      { t:'Combine',  m:'= −x² cos x + 2x sin x + 2 cos x + C' },
    ],
  },
]

export default function PageLIATE({ onBack, onNext }) {
  const [exI,  setExI]  = useState(0)
  const [step, setStep] = useState(0)
  function pickEx(i) { setExI(i); setStep(0) }
  const ex = EXAMPLES[exI]

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:40 }}>

      <div>
        <h1>LIATE — picking u and dv</h1>
        <p style={{ marginTop:16 }}>
          Choose u from the highest category present. The function that is hardest to integrate becomes u — differentiate it away.
        </p>
      </div>

      {/* LIATE table — no colors, just typography hierarchy */}
      <div style={{ borderTop:'1px solid var(--border)' }}>
        {LIATE.map((row, i) => (
          <div key={row.l} style={{
            display:'flex', alignItems:'baseline', gap:20,
            padding:'18px 0',
            borderBottom:'1px solid var(--border)',
          }}>
            <div className="math" style={{ width:28, flexShrink:0, fontSize:22, fontWeight:700, color:'var(--ink)' }}>{row.l}</div>
            <div style={{ fontWeight:700, color:'var(--ink)', minWidth:120 }}>{row.name}</div>
            <div className="math" style={{ color:'var(--ink2)', fontSize:15 }}>{row.ex}</div>
            <div style={{ marginLeft:'auto', fontSize:13, color:'var(--ink3)', fontWeight:700 }}>
              {i < 3 ? 'u ↑' : 'dv ↓'}
            </div>
          </div>
        ))}
      </div>

      {/* Worked examples */}
      <div>
        {/* Example tabs — text only */}
        <div style={{ display:'flex', gap:24, borderBottom:'1px solid var(--border)', marginBottom:32 }}>
          {EXAMPLES.map((e, i) => (
            <button key={i} onClick={() => pickEx(i)} style={{
              paddingBottom:12, fontSize:15, fontWeight:700,
              color: exI===i ? 'var(--ink)' : 'var(--ink3)',
              borderBottom: exI===i ? '2px solid var(--ink)' : '2px solid transparent',
              transition:'all 0.15s',
            }}>
              <span className="math">{e.title}</span>
            </button>
          ))}
        </div>

        <p style={{ marginBottom:28, color:'var(--ink2)' }}>
          <strong style={{ color:'var(--ink)' }}>LIATE:</strong> {ex.pick}
        </p>

        {/* Step dots */}
        <div style={{ display:'flex', gap:8, marginBottom:24 }}>
          {ex.steps.map((_,i) => (
            <button key={i} onClick={() => setStep(i)} style={{
              width:32, height:32, borderRadius:'50%', fontWeight:700, fontSize:14,
              background: i===step ? 'var(--ink)' : i<step ? 'var(--border)' : 'transparent',
              color: i===step ? '#fff' : i<step ? 'var(--ink2)' : 'var(--ink3)',
              border: i===step ? 'none' : '1px solid var(--border)',
              transition:'all 0.2s',
            }}>{i+1}</button>
          ))}
        </div>

        <div key={`${exI}-${step}`} className="fade">
          <p style={{ color:'var(--ink3)', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', fontSize:13, marginBottom:16 }}>
            {ex.steps[step].t}
          </p>
          <div className="math" style={{
            fontSize:'clamp(17px, 3vw, 22px)', lineHeight:1.9,
            padding:'28px 0', whiteSpace:'pre-line',
            borderTop:'1px solid var(--border)', borderBottom:'1px solid var(--border)',
          }}>
            {ex.steps[step].m}
          </div>
        </div>

        <div style={{ display:'flex', justifyContent:'space-between', paddingTop:20 }}>
          <button disabled={step===0} onClick={() => setStep(s=>s-1)}
            style={{ color:'var(--ink3)', fontWeight:700, opacity:step===0?0.3:1 }}>← Back</button>
          {step < ex.steps.length-1
            ? <button onClick={() => setStep(s=>s+1)} style={{
                background:'var(--ink)', color:'#fff',
                padding:'10px 24px', borderRadius:100, fontWeight:700,
              }}>Next →</button>
            : <button onClick={() => pickEx((exI+1)%EXAMPLES.length)} style={{
                background:'var(--ink)', color:'#fff',
                padding:'10px 24px', borderRadius:100, fontWeight:700,
              }}>Next example →</button>
          }
        </div>
      </div>

      <NavRow onBack={onBack} onNext={onNext} nextLabel="The Cyclic Trick →"/>
    </div>
  )
}
