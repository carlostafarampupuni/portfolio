import { useState, useRef, useCallback } from 'react'

/* ─────────────────────────────────────────────────────────────────
   SectionDynamic.jsx
   THE single interactive figure for the whole equilibrium module.
   Two panels share one draggable slider:
     Panel A — forward and reverse rate curves converging to Keq
     Panel B — [Reactants] and [Products] converging to fixed ratio
   ─────────────────────────────────────────────────────────────── */

const W = 540, H = 180
const PL = 44, PR = 12, PT = 14, PB = 32
const pW = W - PL - PR, pH = H - PT - PB

// Model: simple first-order approach to equilibrium
// Keq = kf/kr = 2  →  [P]eq / [R]eq = 2
const Kf = 0.8, Kr = 0.4
const Keq = Kf / Kr  // = 2

function simulate(r0, p0, steps = 80) {
  const pts = []
  let r = r0, p = p0
  for (let i = 0; i <= steps; i++) {
    const t = i / steps
    const rf = Kf * r   // forward rate
    const rr = Kr * p   // reverse rate
    pts.push({ t, r, p, rf, rr })
    const dt = 1 / steps * 3
    r = Math.max(0, r - (rf - rr) * dt)
    p = Math.max(0, p + (rf - rr) * dt)
  }
  return pts
}

function RatePanel({ pts, eqT }) {
  const maxRate = Math.max(...pts.map(d => Math.max(d.rf, d.rr))) * 1.15 || 1
  const tx = t => PL + t * pW
  const ty = r => H - PB - (r / maxRate) * pH

  const fwdD = pts.map((d, i) => `${i ? 'L' : 'M'}${tx(d.t).toFixed(1)} ${ty(d.rf).toFixed(1)}`).join(' ')
  const revD = pts.map((d, i) => `${i ? 'L' : 'M'}${tx(d.t).toFixed(1)} ${ty(d.rr).toFixed(1)}`).join(' ')

  // find crossing
  const eqPt = pts.find(d => Math.abs(d.rf - d.rr) < (maxRate * 0.04))
  const eqX  = eqPt ? tx(eqPt.t) : tx(eqT)
  const eqY  = eqPt ? ty(eqPt.rf) : ty(maxRate * 0.38)

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display:'block' }}>
      {/* grid */}
      <line x1={PL} y1={PT} x2={PL} y2={H-PB} stroke="var(--border)" strokeWidth="1"/>
      <line x1={PL} y1={H-PB} x2={W-PR} y2={H-PB} stroke="var(--border)" strokeWidth="1"/>

      {/* curves */}
      <path d={fwdD} fill="none" stroke="var(--teal)" strokeWidth="2.5" strokeLinecap="round"/>
      <path d={revD} fill="none" stroke="var(--orange)" strokeWidth="2.5" strokeLinecap="round"/>

      {/* equilibrium line */}
      <line x1={eqX} y1={PT} x2={eqX} y2={H-PB}
        stroke="var(--ink3)" strokeWidth="1" strokeDasharray="4,4"/>
      <text x={eqX+5} y={PT+12} fontSize="11" fontFamily="var(--head)"
        fill="var(--ink3)" fontWeight="700">Dynamic Equilibrium</text>

      {/* crossing dot */}
      <circle cx={eqX} cy={eqY} r="5" fill="var(--ink)"/>

      {/* labels */}
      <text x={PL+8} y={PT+14} fontSize="11" fontFamily="var(--head)"
        fill="var(--teal)" fontWeight="700">rate fwd</text>
      <text x={PL+8} y={PT+28} fontSize="11" fontFamily="var(--head)"
        fill="var(--orange)" fontWeight="700">rate rev</text>

      {/* axis labels */}
      <text x={W/2} y={H-2} textAnchor="middle" fontSize="11"
        fontFamily="var(--head)" fill="var(--ink3)">time →</text>
      <text x={8} y={H/2} textAnchor="middle" fontSize="11"
        fontFamily="var(--head)" fill="var(--ink3)"
        transform={`rotate(-90, 8, ${H/2})`}>Rate</text>

      {/* "rates equal (not zero!)" annotation */}
      <text x={eqX + 10} y={eqY + 18} fontSize="10" fontFamily="var(--head)"
        fill="var(--ink3)">rates equal</text>
      <text x={eqX + 10} y={eqY + 30} fontSize="10" fontFamily="var(--head)"
        fill="var(--ink3)" fontWeight="700">(not zero!)</text>
    </svg>
  )
}

function ConcPanel({ pts, r0, p0 }) {
  const maxC = Math.max(r0, p0) * 1.15 || 1
  const tx = t => PL + t * pW
  const ty = c => H - PB - (c / maxC) * pH

  const rD = pts.map((d, i) => `${i ? 'L' : 'M'}${tx(d.t).toFixed(1)} ${ty(d.r).toFixed(1)}`).join(' ')
  const pD = pts.map((d, i) => `${i ? 'L' : 'M'}${tx(d.t).toFixed(1)} ${ty(d.p).toFixed(1)}`).join(' ')

  const last = pts[pts.length - 1]
  const rEq  = last.r.toFixed(2)
  const pEq  = last.p.toFixed(2)

  // gridlines
  const gridVals = [maxC * 0.25, maxC * 0.5, maxC * 0.75].map(v => parseFloat(v.toFixed(2)))

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display:'block' }}>
      {/* grid */}
      {gridVals.map(v => (
        <g key={v}>
          <line x1={PL} y1={ty(v)} x2={W-PR} y2={ty(v)}
            stroke="var(--border)" strokeWidth="1" strokeDasharray="3,3"/>
          <text x={PL-5} y={ty(v)+4} textAnchor="end" fontSize="10"
            fontFamily="var(--head)" fill="var(--ink3)">{v}</text>
        </g>
      ))}
      <line x1={PL} y1={PT} x2={PL} y2={H-PB} stroke="var(--border)" strokeWidth="1"/>
      <line x1={PL} y1={H-PB} x2={W-PR} y2={H-PB} stroke="var(--border)" strokeWidth="1"/>

      {/* curves */}
      <path d={rD} fill="none" stroke="var(--orange)" strokeWidth="2.5" strokeLinecap="round"/>
      <path d={pD} fill="none" stroke="var(--teal)" strokeWidth="2.5" strokeLinecap="round"/>

      {/* plateau annotations */}
      <text x={W-PR-4} y={ty(last.r)-6} textAnchor="end" fontSize="11"
        fontFamily="var(--math)" fill="var(--orange)">[R] = {rEq}</text>
      <text x={W-PR-4} y={ty(last.p)+14} textAnchor="end" fontSize="11"
        fontFamily="var(--math)" fill="var(--teal)">[P] = {pEq}</text>

      {/* "≠" annotation */}
      {Math.abs(last.r - last.p) > 0.05 && (
        <text x={W*0.78} y={(ty(last.r)+ty(last.p))/2+4}
          textAnchor="middle" fontSize="16" fontFamily="var(--math)"
          fill="var(--ink3)">≠</text>
      )}

      {/* labels */}
      <text x={PL+8} y={PT+14} fontSize="11" fontFamily="var(--head)"
        fill="var(--orange)" fontWeight="700">[Reactants]</text>
      <text x={PL+8} y={PT+28} fontSize="11" fontFamily="var(--head)"
        fill="var(--teal)" fontWeight="700">[Products]</text>

      <text x={W/2} y={H-2} textAnchor="middle" fontSize="11"
        fontFamily="var(--head)" fill="var(--ink3)">time →</text>
      <text x={8} y={H/2} textAnchor="middle" fontSize="11"
        fontFamily="var(--head)" fill="var(--ink3)"
        transform={`rotate(-90, 8, ${H/2})`}>Conc.</text>
    </svg>
  )
}

export default function SectionDynamic() {
  const [r0, setR0] = useState(1.0)  // initial [Reactants]
  const pts = simulate(r0, 0, 80)
  const last = pts[pts.length - 1]
  // approximate equilibrium time fraction
  const eqT = pts.findIndex(d => Math.abs(d.rf - d.rr) < 0.04) / pts.length

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:32 }}>

      <div>
        <h2 style={{ fontSize:'clamp(20px,4vw,26px)', fontWeight:700, color:'var(--ink)', marginBottom:16 }}>
          The reaction that never stops
        </h2>
        <p>
          At equilibrium the colour stops changing — but the reaction doesn't. Forward and reverse rates are
          equal, so concentrations stay constant. Drag the slider below to change the starting conditions
          and watch both panels update.
        </p>
      </div>

      {/* Slider */}
      <div style={{ paddingTop:20, borderTop:'1px solid var(--border)' }}>
        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
          <span style={{ fontWeight:700 }}>Initial [Reactants]</span>
          <span className="math" style={{ color:'var(--ink2)', fontVariantNumeric:'tabular-nums' }}>{r0.toFixed(2)} M</span>
        </div>
        <input type="range" min={0.2} max={2.0} step={0.05} value={r0}
          onChange={e => setR0(parseFloat(e.target.value))}/>
      </div>

      {/* Panel A */}
      <div>
        <p style={{ color:'var(--ink3)', fontWeight:700, textTransform:'uppercase',
          letterSpacing:'0.06em', fontSize:13, marginBottom:12 }}>Panel A — Reaction rates</p>
        <div style={{ borderTop:'1px solid var(--border)', borderBottom:'1px solid var(--border)', padding:'20px 0' }}>
          <RatePanel pts={pts} eqT={eqT}/>
        </div>
      </div>

      {/* Panel B */}
      <div>
        <p style={{ color:'var(--ink3)', fontWeight:700, textTransform:'uppercase',
          letterSpacing:'0.06em', fontSize:13, marginBottom:12 }}>Panel B — Concentrations</p>
        <div style={{ borderTop:'1px solid var(--border)', borderBottom:'1px solid var(--border)', padding:'20px 0' }}>
          <ConcPanel pts={pts} r0={r0} p0={0}/>
        </div>
      </div>

      {/* Live readout */}
      <div style={{ display:'flex', gap:32, justifyContent:'center',
        paddingTop:16, borderTop:'1px solid var(--border)' }}>
        {[
          ['[R] at eq.', last.r.toFixed(3), 'var(--orange)'],
          ['[P] at eq.', last.p.toFixed(3), 'var(--teal)'],
          ['K = [P]/[R]', (last.p / last.r).toFixed(2),  'var(--ink)'],
        ].map(([l, v, c]) => (
          <div key={l} style={{ textAlign:'center' }}>
            <div className="math" style={{ color:c, fontSize:13, marginBottom:4 }}>{l}</div>
            <div className="math" style={{ fontSize:22, fontWeight:700, color:c, fontVariantNumeric:'tabular-nums' }}>{v}</div>
          </div>
        ))}
      </div>

      <p style={{ textAlign:'center', color:'var(--ink3)', fontSize:14 }}>
        K stays at <span className="math">2.0</span> regardless of starting conditions.
        The <em>ratio</em> is fixed, not the absolute amounts.
      </p>

    </div>
  )
}
