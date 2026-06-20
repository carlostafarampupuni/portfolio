import { useState } from 'react'
import NavRow from './NavRow'

const STEPS = [
  { label:'Product rule',
    math:'d/dx [u·v] = u·v′ + v·u′',
    note:'You know this already. What if we integrated both sides?' },
  { label:'Rearrange',
    math:'u·v′ = d/dx [uv] − v·u′',
    note:'Isolate u·v′ — one term is now a derivative, trivial to integrate.' },
  { label:'Integrate both sides',
    math:'∫ u v′ dx = uv − ∫ v u′ dx',
    note:'Integrating d/dx[uv] just returns uv.' },
  { label:'The formula',
    math:'∫ u dv = uv − ∫ v du',
    note:'Rename v′dx = dv and u′dx = du. That\'s it — IBP is the product rule, read backwards.',
    highlight: true },
]

export default function PageOrigin({ onNext }) {
  const [step, setStep] = useState(0)
  const s = STEPS[step]

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:40 }}>

      <div>
        <h1>Where does the formula come from?</h1>
        <p style={{ marginTop:16 }}>
          Most textbooks hand you <span className="math">∫ u dv = uv − ∫ v du</span> and say memorise it. Let's derive it in four steps from the product rule — something you already know.
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
          fontSize:'clamp(20px, 4vw, 30px)',
          lineHeight:1.6,
          padding:'32px 0',
          borderTop:'1px solid var(--border)',
          borderBottom:'1px solid var(--border)',
          color: s.highlight ? 'var(--ink)' : 'var(--ink)',
          fontWeight: s.highlight ? '700' : '400',
        }}>
          {s.math}
        </div>
        <p style={{ marginTop:20 }}>{s.note}</p>
      </div>

      <div style={{ display:'flex', justifyContent:'space-between' }}>
        <button disabled={step === 0} onClick={() => setStep(s => s-1)}
          style={{ color:'var(--ink3)', fontWeight:700, opacity: step===0?0.3:1 }}>← Prev</button>
        {step < STEPS.length - 1
          ? <button onClick={() => setStep(s => s+1)} style={{
              background:'var(--ink)', color:'#fff',
              padding:'12px 28px', borderRadius:100,
              fontSize:'var(--sz-b)', fontWeight:700,
            }}>Next step →</button>
          : <button onClick={onNext} style={{
              background:'var(--orange)', color:'#fff',
              padding:'12px 28px', borderRadius:100,
              fontSize:'var(--sz-b)', fontWeight:700,
            }}>See the proof →</button>
        }
      </div>

      <NavRow onNext={step === STEPS.length - 1 ? onNext : undefined} nextLabel="Skip to Area Proof →"/>
    </div>
  )
}
