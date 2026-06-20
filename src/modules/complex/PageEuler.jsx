import { useState } from 'react'
import NavRow from './NavRow'

const STEPS = [
  {
    label: 'Polar form',
    math: 'z = r e^(iθ)  =  r (cos θ + i sin θ)\n\nr = |z|  (modulus)\nθ = arg(z)  (argument)',
    note: 'Every complex number can be written this way. The diagram you just used was showing you r and θ the whole time.',
  },
  {
    label: 'Why multiplication is clean',
    math: 'z₁ · z₂  =  r₁ e^(iθ₁) · r₂ e^(iθ₂)\n\n       =  r₁r₂ · e^(i(θ₁+θ₂))',
    note: 'Magnitudes multiply. Arguments add. That is why complex numbers make rotation algebra look like ordinary arithmetic.',
  },
  {
    label: 'Taylor series proof',
    math: 'e^(iθ) = 1 + iθ − θ²/2! − iθ³/3! + θ⁴/4! + …\n\nReal parts:  1 − θ²/2! + θ⁴/4! − … = cos θ\nImag parts:  θ − θ³/3! + θ⁵/5! − … = sin θ',
    note: 'Substitute iθ into the Taylor series for eˣ and sort terms by whether they contain i. The cos and sin series fall out exactly. No assumption was made — this is a theorem.',
  },
  {
    label: 'Euler\'s identity',
    math: 'At  θ = π:\n\ne^(iπ) = cos π + i sin π = −1 + 0i\n\ne^(iπ) + 1 = 0',
    note: 'This is not arranged to look beautiful. It is beautiful because a 180° rotation sends 1 to −1. The five constants appear because they are the five fixed points of the most important operations in mathematics.',
    highlight: true,
  },
]

const USES = [
  {
    title: 'AC circuits',
    math: 'Z = R + j(ωL − 1/ωC)',
    desc: 'Phase shifts in AC circuits become messy with trig. The imaginary part is real reactance — actual opposition from capacitors and inductors. Remove j and the equation falls apart.',
  },
  {
    title: 'Signal processing',
    math: 'f̂(ξ) = ∫ f(t) e^(−2πiξt) dt',
    desc: 'The Fourier transform. The e^(iθ) in the exponent lets one equation decompose any signal into frequencies. Your phone uses this continuously.',
  },
  {
    title: 'Quantum mechanics',
    math: 'iℏ ∂ψ/∂t = Ĥψ',
    desc: 'The Schrödinger equation. i is not a convenience here — the wave function is complex-valued by necessity. Remove i and quantum mechanics breaks.',
  },
]

export default function PageEuler({ onBack, onNext }) {
  const [step, setStep] = useState(0)
  const s = STEPS[step]

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:40 }}>

      <div>
        <h1>Euler's formula & why it matters</h1>
        <p style={{ marginTop:16 }}>
          Polar form makes multiplication trivial. Euler's formula makes rotation and oscillation the same thing. That is why complex numbers appear in every branch of physics.
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

      <div key={step} className="fade">
        <p style={{ color:'var(--ink3)', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', fontSize:13, marginBottom:16 }}>
          {s.label}
        </p>
        <div className="math" style={{
          fontSize:'clamp(16px, 2.8vw, 21px)',
          lineHeight:1.9, whiteSpace:'pre-line',
          padding:'28px 0',
          borderTop:'1px solid var(--border)',
          borderBottom:'1px solid var(--border)',
          fontWeight: s.highlight ? '700' : '400',
          color: s.highlight ? 'var(--ink)' : 'var(--ink)',
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
              padding:'12px 28px', borderRadius:100, fontWeight:700,
            }}>Next →</button>
          : null
        }
      </div>

      {/* Applications */}
      <div style={{ marginTop:8 }}>
        <p style={{ color:'var(--ink3)', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.04em', fontSize:13, marginBottom:20 }}>
          Why engineers actually use this
        </p>
        <div style={{ display:'flex', flexDirection:'column', gap:0, borderTop:'1px solid var(--border)' }}>
          {USES.map(u => (
            <div key={u.title} style={{ padding:'24px 0', borderBottom:'1px solid var(--border)' }}>
              <div style={{ display:'flex', alignItems:'baseline', gap:20, marginBottom:10 }}>
                <div style={{ fontWeight:700, color:'var(--ink)', minWidth:160 }}>{u.title}</div>
                <div className="math" style={{ color:'var(--ink2)', fontSize:15 }}>{u.math}</div>
              </div>
              <p style={{ color:'var(--ink2)', fontSize:14, lineHeight:1.7 }}>{u.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <NavRow onBack={onBack} onNext={onNext} nextLabel="Take the Quiz →"/>
    </div>
  )
}
