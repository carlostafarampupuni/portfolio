import { useState } from 'react'
import NavRow from './NavRow'

const STEPS = [
  { t:'Setup',   math:'I = ∫ eˣ sin x dx\n\nu = sin x → du = cos x dx\ndv = eˣ dx → v = eˣ' },
  { t:'IBP ×1',  math:'I  =  eˣ sin x  −  ∫ eˣ cos x dx' },
  { t:'IBP ×2',  math:'∫ eˣ cos x dx  =  eˣ cos x  +  ∫ eˣ sin x dx' },
  { t:'Spot it!',math:'I = eˣ sin x − [eˣ cos x + I]\nI + I = eˣ sin x − eˣ cos x\n⚠️ I appears on both sides.' },
  { t:'Solve',   math:'2I = eˣ(sin x − cos x)\n\n∫ eˣ sin x dx = eˣ(sin x − cos x) / 2 + C' },
]

const NODES = [
  { x:50,  y:35,  label:'I = ∫eˣsin x', edge:'IBP ×1' },
  { x:250, y:35,  label:'eˣsinx − ∫eˣcosx', edge:'IBP ×2' },
  { x:250, y:90,  label:'eˣsinx − eˣcosx − I', edge:'collect' },
  { x:50,  y:90,  label:'2I = eˣ(sinx − cosx)', edge:'÷ 2' },
]

export default function PageCyclic({ onBack, onNext }) {
  const [step, setStep] = useState(0)
  const s = STEPS[step]

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:40 }}>

      <div>
        <h1>The Cyclic Trick</h1>
        <p style={{ marginTop:16 }}>
          <span className="math">∫ eˣ sin x dx</span> can't be finished by IBP in the usual way. Apply it twice — the original integral returns, and you solve for it like an equation.
        </p>
      </div>

      {/* Loop diagram — this IS the content */}
      <div>
        <p style={{ color:'var(--ink3)', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', fontSize:13, marginBottom:16 }}>The cycle</p>
        <svg width="100%" viewBox="0 0 320 130" style={{ display:'block' }}>
          <defs>
            <marker id="arw" viewBox="0 0 8 8" refX="6" refY="4" markerWidth="4" markerHeight="4" orient="auto">
              <path d="M1 1L7 4L1 7" fill="none" stroke="var(--ink3)" strokeWidth="1.5"/>
            </marker>
          </defs>
          {NODES.map((n, i) => {
            const active = i <= step
            return (
              <g key={i} style={{ transition:'opacity 0.3s', opacity: active ? 1 : 0.2 }}>
                <rect x={n.x-44} y={n.y-14} width={88} height={26} rx={6}
                  fill={active ? 'var(--surface)' : 'transparent'}
                  stroke={active ? 'var(--ink)' : 'var(--border)'} strokeWidth="1.5"/>
                <text x={n.x} y={n.y+4} textAnchor="middle" fontSize="8"
                  fontFamily="var(--math)" fill={active ? 'var(--ink)' : 'var(--ink3)'}>
                  {n.label}
                </text>
              </g>
            )
          })}
          {/* Edges */}
          {[[0,1],[1,2],[2,3],[3,0]].map(([f,t], i) => {
            const ns = NODES
            const from = ns[f], to = ns[t]
            const active = i < step
            const x1 = f===0?94:f===1?206:f===2?206:94
            const y1 = f===0?35:f===1?49:f===2?90:90
            const x2 = t===0?6:t===1?206:t===2?206:94
            const y2 = t===0?90:t===1?21:t===2?77:90
            // simplified edge coords
            const ex1 = f===0?94:f===1?250:f===2?206:6
            const ey1 = f===0?35:f===1?49:f===2?90:90
            const ex2 = t===1?206:t===2?250:t===3?6:50
            const ey2 = t===1?21:t===2?77:t===3?90:21
            return (
              <g key={i} style={{ opacity: active?1:0.15, transition:'opacity 0.3s' }}>
                <line x1={[94,250,206,6][f]} y1={[35,49,90,90][f]}
                      x2={[206,250,6,50][t===0?3:t]} y2={[21,77,90,21][t===0?3:t]}
                  stroke="var(--ink3)" strokeWidth="1" markerEnd="url(#arw)"/>
                <text x={(NODES[f].x+NODES[t].x)/2} y={f===0||f===2?(NODES[f].y+NODES[t].y)/2-6:(NODES[f].y+NODES[t].y)/2+14}
                  textAnchor="middle" fontSize="9" fontFamily="var(--head)"
                  fill="var(--ink3)" fontWeight="700">{NODES[f].edge}</text>
              </g>
            )
          })}
        </svg>
      </div>

      {/* Step dots */}
      <div style={{ display:'flex', gap:8 }}>
        {STEPS.map((_,i) => (
          <button key={i} onClick={() => setStep(i)} style={{
            width:32, height:32, borderRadius:'50%', fontWeight:700, fontSize:14,
            background: i===step ? 'var(--ink)' : i<step ? 'var(--border)' : 'transparent',
            color: i===step ? '#fff' : i<step ? 'var(--ink2)' : 'var(--ink3)',
            border: i===step ? 'none' : '1px solid var(--border)',
            transition:'all 0.2s',
          }}>{i+1}</button>
        ))}
      </div>

      {/* Step math */}
      <div key={step} className="fade">
        <p style={{ color:'var(--ink3)', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', fontSize:13, marginBottom:16 }}>
          {s.t}
        </p>
        <div className="math" style={{
          fontSize:'clamp(16px, 2.8vw, 21px)', lineHeight:1.9, whiteSpace:'pre-line',
          padding:'28px 0', borderTop:'1px solid var(--border)', borderBottom:'1px solid var(--border)',
          color: step===3 ? 'var(--orange)' : step===4 ? 'var(--green)' : 'var(--ink)',
        }}>
          {s.math}
        </div>
        {step===3 && <p style={{ marginTop:16 }}>Don't panic — this is supposed to happen. It's the trick, not a mistake.</p>}
        {step===4 && <p style={{ marginTop:16 }}>Always add +C. And never switch your u/dv choice between applications.</p>}
      </div>

      <div style={{ display:'flex', justifyContent:'space-between' }}>
        <button disabled={step===0} onClick={() => setStep(s=>s-1)}
          style={{ color:'var(--ink3)', fontWeight:700, opacity:step===0?0.3:1 }}>← Prev</button>
        {step < STEPS.length-1
          ? <button onClick={() => setStep(s=>s+1)} style={{
              background:'var(--ink)', color:'#fff',
              padding:'12px 28px', borderRadius:100, fontWeight:700,
            }}>Next step →</button>
          : <button onClick={onNext} style={{
              background:'var(--green)', color:'#fff',
              padding:'12px 28px', borderRadius:100, fontWeight:700,
            }}>Take the quiz →</button>
        }
      </div>

      <NavRow onBack={onBack} onNext={onNext} nextLabel="Take the Quiz →"/>
    </div>
  )
}
