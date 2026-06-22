import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useSEO } from '../../components/useSEO'

/* ════════════════════════════════════════════════════════════════
   The ONE diagram for this module — a single interactive vessel.
   Drag the piston to change pressure. Click the temperature toggle.
   Everything (rate curves AND composition) lives in one SVG, no
   separate widgets, matching the rest of the diagram's frame.
   ════════════════════════════════════════════════════════════════ */

function EquilibriumDiagram() {
  const svgRef = useRef()
  const dragging = useRef(false)
  const [pistonX, setPistonX] = useState(300)
  const [highTemp, setHighTemp] = useState(false)

  const W = 520, H = 430
  const VESSEL_LEFT = 40, VESSEL_RIGHT = 480, VESSEL_TOP = 50, VESSEL_BOTTOM = 230
  const PISTON_MIN = 140, PISTON_MAX = 440

  const pressure = Math.max(0.5, ((VESSEL_RIGHT - pistonX) / (VESSEL_RIGHT - PISTON_MIN)) * 4.5 + 0.5)
  const kc       = highTemp ? 0.04 : 0.5
  const nhFrac   = Math.min(0.86, 0.14 * Math.pow(pressure, 1.15) * kc * 11)
  const nhPct    = Math.round(nhFrac * 100)

  function handleMove(clientX) {
    if (!dragging.current) return
    const el = svgRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = (clientX - rect.left) * (W / rect.width)
    setPistonX(Math.max(PISTON_MIN, Math.min(PISTON_MAX, x)))
  }

  // Deterministic molecule layout inside the vessel
  const molecules = []
  const count = Math.round(5 + pressure * 2.4)
  for (let i = 0; i < Math.min(count, 16); i++) {
    const col = i % 4, row = Math.floor(i / 4)
    const usableW = pistonX - VESSEL_LEFT - 30
    const mx = VESSEL_LEFT + 22 + col * (usableW / 4)
    const my = VESSEL_TOP + 36 + row * 42
    const isNH = (i / count) < nhFrac
    molecules.push({ x: mx, y: my, isNH })
  }

  const barW = Math.max(6, nhFrac * (VESSEL_RIGHT - VESSEL_LEFT))

  return (
    <div>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        style={{ display: 'block', userSelect: 'none', touchAction: 'none' }}
        onMouseDown={e => { if (e.target.dataset.drag) dragging.current = true }}
        onMouseMove={e => handleMove(e.clientX)}
        onMouseUp={() => { dragging.current = false }}
        onMouseLeave={() => { dragging.current = false }}
        onTouchStart={e => { if (e.target.dataset.drag) dragging.current = true }}
        onTouchMove={e => { e.preventDefault(); handleMove(e.touches[0].clientX) }}
        onTouchEnd={() => { dragging.current = false }}
      >
        {/* Vessel */}
        <rect x={VESSEL_LEFT} y={VESSEL_TOP} width={pistonX-VESSEL_LEFT} height={VESSEL_BOTTOM-VESSEL_TOP}
          fill="var(--bg)" stroke="var(--border)" strokeWidth="1.5" rx="4"/>
        <text x={(VESSEL_LEFT+pistonX)/2} y={VESSEL_TOP+20} textAnchor="middle" fontSize="12" fill="var(--ink3)" fontFamily="var(--font)">
          N₂(g) + 3H₂(g) ⇌ 2NH₃(g)
        </text>

        {/* Molecules */}
        {molecules.map((m, i) => (
          <g key={i}>
            <circle cx={m.x} cy={m.y} r={m.isNH ? 11 : 8}
              fill={m.isNH ? 'var(--green)' : 'var(--indigo)'} opacity="0.78"/>
            <text x={m.x} y={m.y+4} textAnchor="middle" fontSize="7.5"
              fill="#fff" fontFamily="var(--font)" fontWeight="600">
              {m.isNH ? 'NH₃' : (i % 2 === 0 ? 'N₂' : 'H₂')}
            </text>
          </g>
        ))}

        {/* Piston */}
        <rect x={pistonX-6} y={VESSEL_TOP-2} width={12} height={VESSEL_BOTTOM-VESSEL_TOP+4}
          fill="var(--ink2)" rx="3" opacity="0.85"
          data-drag="true" style={{ cursor: 'ew-resize' }}/>
        <text x={pistonX} y={VESSEL_BOTTOM+18} textAnchor="middle" fontSize="10" fill="var(--ink3)" fontFamily="var(--font)">
          ← drag piston →
        </text>

        {/* NH3 outlet pipe */}
        <line x1={pistonX+8} y1={VESSEL_TOP+60} x2={pistonX+56} y2={VESSEL_TOP+60}
          stroke="var(--green)" strokeWidth="2.5" strokeLinecap="round"/>
        <text x={pistonX+62} y={VESSEL_TOP+64} fontSize="11" fontWeight="600" fill="var(--green)" fontFamily="var(--font)">
          NH₃ →
        </text>

        {/* Temperature toggle — sits to the right of the vessel */}
        <rect x={VESSEL_RIGHT-100} y={VESSEL_TOP+8} width={96} height={28} rx={14}
          fill={highTemp ? 'rgba(239,68,68,0.14)' : 'rgba(0,113,227,0.12)'}
          stroke={highTemp ? '#ef4444' : 'var(--blue)'}
          strokeWidth="1" data-drag="false" style={{ cursor: 'pointer' }}
          onClick={() => setHighTemp(h => !h)}/>
        <circle cx={highTemp ? VESSEL_RIGHT-16 : VESSEL_RIGHT-88} cy={VESSEL_TOP+22} r={10}
          fill={highTemp ? '#ef4444' : 'var(--blue)'}
          style={{ cursor: 'pointer' }}
          onClick={() => setHighTemp(h => !h)}/>
        <text x={VESSEL_RIGHT-52} y={VESSEL_TOP+26} textAnchor="middle" fontSize="9.5"
          fill={highTemp ? '#ef4444' : 'var(--blue)'} fontFamily="var(--font)" fontWeight="600"
          style={{ pointerEvents: 'none' }}>
          {highTemp ? 'HIGH T' : 'LOW T'}
        </text>
        <text x={VESSEL_RIGHT-100} y={VESSEL_TOP+58} fontSize="10" fill="var(--ink2)" fontFamily="var(--font)">
          Pressure: {pressure.toFixed(1)}×
        </text>
        <text x={VESSEL_RIGHT-100} y={VESSEL_TOP+74} fontSize="10" fill="var(--ink2)" fontFamily="var(--font)">
          K: {kc}
        </text>

        {/* Composition bar */}
        <text x={VESSEL_LEFT} y={VESSEL_BOTTOM+50} fontSize="11" fontWeight="700" fill="var(--ink)" fontFamily="var(--font)">
          Equilibrium composition
        </text>
        <rect x={VESSEL_LEFT} y={VESSEL_BOTTOM+62} width={VESSEL_RIGHT-VESSEL_LEFT} height={18} rx="5" fill="var(--border)" opacity="0.4"/>
        <rect x={VESSEL_LEFT} y={VESSEL_BOTTOM+62} width={barW} height={18} rx="5" fill="var(--green)" opacity="0.85"/>
        {nhPct > 8 && (
          <text x={VESSEL_LEFT+barW/2} y={VESSEL_BOTTOM+75} textAnchor="middle" fontSize="10"
            fill="#fff" fontWeight="700" fontFamily="var(--font)">{nhPct}% NH₃</text>
        )}
        <text x={VESSEL_LEFT} y={VESSEL_BOTTOM+96} fontSize="10" fill="var(--ink3)" fontFamily="var(--font)">0%</text>
        <text x={VESSEL_RIGHT} y={VESSEL_BOTTOM+96} textAnchor="end" fontSize="10" fill="var(--ink3)" fontFamily="var(--font)">100% NH₃</text>

        {/* Dynamic-rate strip — rate fwd / rate rev always equal at the bottom */}
        <text x={VESSEL_LEFT} y={VESSEL_BOTTOM+128} fontSize="11" fontWeight="700" fill="var(--ink)" fontFamily="var(--font)">
          At equilibrium — rates equal, not zero
        </text>
        <g transform={`translate(${VESSEL_LEFT}, ${VESSEL_BOTTOM+140})`}>
          <line x1="0" y1="0" x2="180" y2="0" stroke="var(--border)" strokeWidth="1"/>
          <line x1="0" y1="22" x2="180" y2="22" stroke="var(--border)" strokeWidth="1"/>
          <circle cx="150" cy="0" r="4" fill="var(--blue)"/>
          <text x="160" y="4" fontSize="9.5" fill="var(--blue)" fontFamily="var(--font)">rate fwd</text>
          <circle cx="150" cy="22" r="4" fill="var(--orange)"/>
          <text x="160" y="26" fontSize="9.5" fill="var(--orange)" fontFamily="var(--font)">rate rev</text>
        </g>
      </svg>
    </div>
  )
}

/* ════════════════════════════════════════════════════════════════
   Quiz
   ════════════════════════════════════════════════════════════════ */

const QS = [
  { q:'At dynamic equilibrium, the rate of the forward reaction is:',
    opts:['Zero — both reactions have stopped','Greater than the reverse rate','Equal to the reverse rate (and not zero)','Unmeasurable'],
    ans:2, fb:{
      c:'Correct. rate_forward = rate_reverse, and neither is zero. Billions of molecules react every second.',
      w:'The defining feature of dynamic equilibrium is that forward and reverse rates are equal — and nonzero.' }},
  { q:'Increasing pressure on N₂(g) + 3H₂(g) ⇌ 2NH₃(g) shifts equilibrium:',
    opts:['Left, toward N₂ and H₂','Right, toward NH₃','No shift occurs','Depends on the catalyst'],
    ans:1, fb:{
      c:'Correct. 4 moles of gas → 2 moles. The side with fewer gas molecules is favoured under compression.',
      w:'The product side has fewer gas molecules (2 vs 4). Compression favours that side.' }},
  { q:'The Haber process is exothermic. Raising temperature:',
    opts:['Increases NH₃ yield at equilibrium','Decreases NH₃ yield at equilibrium','Has no effect on yield, only rate','Stops the reverse reaction'],
    ans:1, fb:{
      c:'Correct. For an exothermic forward reaction, higher temperature shifts equilibrium toward reactants — lower yield, despite a faster rate.',
      w:'Le Châtelier: raising T on an exothermic reaction favours the endothermic (reverse) direction — yield falls even though the reaction speeds up.' }},
  { q:'A catalyst added to a reaction at equilibrium:',
    opts:['Increases the equilibrium yield','Decreases the equilibrium yield','Speeds up reaching equilibrium but does not change yield','Shifts equilibrium toward products'],
    ans:2, fb:{
      c:'Correct. A catalyst lowers activation energy for both directions equally — it changes the rate, not the equilibrium constant K.',
      w:'Catalysts speed up forward and reverse rates equally. K is unchanged, so the equilibrium position does not move.' }},
  { q:'"The system wants to restore equilibrium" is best replaced with:',
    opts:['The system has a preference for balance','Molecules sense imbalance and correct it','The change in conditions makes forward and reverse rates unequal until a new balance point is reached','Equilibrium is a law that systems must obey'],
    ans:2, fb:{
      c:'Correct. There is no intention — a changed condition makes one rate temporarily exceed the other, and concentrations shift until rates re-equalise.',
      w:'No molecule "wants" anything. A condition change unbalances the rates; the system settles once they are equal again — pure kinetics.' }},
]

function Quiz() {
  const [answers, setAnswers] = useState(new Array(QS.length).fill(null))
  const [done,    setDone]    = useState(false)

  function answer(qi, oi) {
    if (answers[qi] !== null) return
    const next = [...answers]; next[qi] = oi; setAnswers(next)
    if (next.every(a => a !== null)) setTimeout(() => setDone(true), 600)
  }
  function reset() { setAnswers(new Array(QS.length).fill(null)); setDone(false) }
  const score = answers.filter((a,i) => a === QS[i].ans).length

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:40 }}>
      <div>
        <h2 style={{fontSize:'clamp(22px,4vw,30px)',fontWeight:700,color:'var(--ink)'}}>Quiz</h2>
        <p style={{ marginTop:12 }}>5 questions · Dynamic equilibrium, Le Châtelier, the Haber process.</p>
      </div>

      {done && (
        <div style={{display:'flex',flexDirection:'column',gap:20,padding:'24px 0',
          borderTop:'1px solid var(--border)',borderBottom:'1px solid var(--border)'}}>
          <div className="math" style={{ fontSize:'clamp(40px,8vw,56px)', fontWeight:700, color:'var(--ink)', lineHeight:1 }}>
            {score}<span style={{ fontSize:'0.5em', color:'var(--ink3)' }}>/{QS.length}</span>
          </div>
          <p>
            {score===5 ? 'Perfect. Dynamic equilibrium and Le Châtelier are solid.' :
             score>=3  ? 'Strong work. Review the questions you missed.' :
                         'Scroll back up — focus on why rates equal ≠ amounts equal.'}
          </p>
          <button onClick={reset} style={{
            alignSelf:'flex-start', background:'var(--ink)', color:'#fff',
            padding:'12px 28px', borderRadius:100, fontWeight:700, border:'none', cursor:'pointer',
          }}>Try again</button>
        </div>
      )}

      <div style={{ display:'flex', flexDirection:'column', gap:40 }}>
        {QS.map((q, qi) => {
          const chosen = answers[qi]
          return (
            <div key={qi} style={{ borderTop:'1px solid var(--border)', paddingTop:28 }}>
              <p style={{ color:'var(--ink3)', fontWeight:700, fontSize:13, letterSpacing:'0.06em', textTransform:'uppercase', marginBottom:12 }}>
                Question {qi+1}
              </p>
              <p style={{ fontWeight:700, color:'var(--ink)', marginBottom:20, fontSize:17 }}>{q.q}</p>
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {q.opts.map((opt, oi) => {
                  const state = chosen===null ? 'idle' : oi===q.ans ? 'correct' : oi===chosen ? 'wrong' : 'idle'
                  return (
                    <button key={oi} disabled={chosen!==null} onClick={() => answer(qi,oi)} style={{
                      padding:'12px 16px', borderRadius:10, textAlign:'left',
                      border:`1px solid ${state==='correct'?'var(--green)':state==='wrong'?'#dc2626':'var(--border)'}`,
                      background: state==='correct'?'#f0faf5':state==='wrong'?'#fff5f5':'var(--mod-surface)',
                      color: state==='correct'?'var(--green)':state==='wrong'?'#dc2626':'var(--ink)',
                      cursor: chosen!==null ? 'default' : 'pointer',
                      fontWeight: state!=='idle' ? 700 : 400,
                      transition:'all 0.15s',
                      fontFamily:'inherit', fontSize:15,
                    }}>
                      {state==='correct'&&'✓ '}{state==='wrong'&&'✗ '}{opt}
                    </button>
                  )
                })}
              </div>
              {chosen!==null && (
                <p style={{ marginTop:14, color: chosen===q.ans ? 'var(--green)' : '#c00', lineHeight:1.7 }}>
                  {chosen===q.ans ? q.fb.c : q.fb.w}
                </p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ════════════════════════════════════════════════════════════════
   Page shell — single scroll, no pagination
   ════════════════════════════════════════════════════════════════ */

export default function EquilibriumModule() {
  useSEO(
    'Chemical Equilibria',
    'Le Chatelier\'s principle, ICE tables, and Kp vs Kc — drag concentrations and pressure to watch a reaction respond in real time and converge to equilibrium.',
    '/projects/equilibrium'
  )
  return (
    <div style={{ maxWidth:640, margin:'0 auto', padding:'clamp(24px,5vw,56px) 16px 80px' }}>

      <Link to="/projects" style={{ color:'var(--ink3)', fontWeight:700, fontSize:14,
        textDecoration:'none', display:'inline-block', marginBottom:32 }}>
        ← Projects
      </Link>

      <div style={{ display:'flex', flexDirection:'column', gap:40 }}>

        <div>
          <p style={{color:'var(--ink3)',fontWeight:700,fontSize:13,
            letterSpacing:'0.06em',textTransform:'uppercase',marginBottom:12}}>
            Chemistry
          </p>
          <h1>Chemical Equilibrium</h1>
          <p style={{ marginTop:16 }}>
            A sealed flask reaches a colour that doesn't change. Does that mean the reaction has stopped?
            Drag the piston in the diagram below to compress the Haber process vessel, and click the
            temperature toggle — watch the equilibrium composition shift.
          </p>
        </div>

        {/* Question first, Brilliant-style */}
        <div style={{
          background: 'color-mix(in srgb, var(--blue) 8%, var(--bg))',
          border: '1px solid color-mix(in srgb, var(--blue) 25%, transparent)',
          borderRadius: 12, padding: '20px 24px',
        }}>
          <p style={{ fontSize: 15, color: 'var(--mod-ink)', lineHeight: 1.7, margin: 0 }}>
            <strong>Before you read on:</strong> at equilibrium, how many molecules react each second?<br/>
            A — Zero &nbsp;·&nbsp; B — A few &nbsp;·&nbsp; C — Billions
          </p>
        </div>

        <p>
          The answer is <strong style={{ color:'var(--ink)' }}>C</strong>. The colour stops changing because
          the forward and reverse rates are equal — not because anything has stopped. Billions of molecules
          react every second; the system sits at a balance point, not at rest.
        </p>

        {/* Wrong box */}
        <div style={{
          border: '1px solid color-mix(in srgb, #ef4444 30%, transparent)',
          background: 'color-mix(in srgb, #ef4444 6%, var(--bg))',
          borderRadius: 12, padding: '16px 20px',
        }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: '#ef4444', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Most common mistake
          </p>
          <p style={{ fontSize: 15, color: 'var(--ink2)', margin: 0, lineHeight: 1.65 }}>
            "Once equilibrium is reached, the reaction stops." Students write this in exams. The rate of
            the forward reaction equals the rate of the reverse reaction — neither rate is zero.
          </p>
        </div>

        {/* The ONE diagram */}
        <div style={{ paddingTop: 8 }}>
          <h2 style={{fontSize:'clamp(20px,3.5vw,26px)',fontWeight:700,color:'var(--ink)',marginBottom:8}}>
            Le Châtelier's principle
          </h2>
          <p style={{marginBottom:20}}>
            N₂(g) + 3H₂(g) ⇌ 2NH₃(g), ΔH = −92 kJ/mol. You may change exactly one variable —
            drag the piston (pressure) or toggle the temperature. Which gives the most NH₃?
          </p>
          <EquilibriumDiagram/>
        </div>

        {/* Explanatory text below diagram */}
        <div style={{ display:'flex', flexDirection:'column', gap:20, paddingTop:8, borderTop:'1px solid var(--border)' }}>
          <p>
            Compressing the vessel increases collision frequency and favours the side with fewer gas
            molecules — 2 moles of NH₃ versus 4 moles of N₂ + H₂. The system shifts toward NH₃ not because
            it "wants" balance, but because that side relieves the imposed pressure more effectively.
            This is arithmetic, not intention.
          </p>
          <p>
            Raising temperature speeds up both the forward and reverse reactions — but for this exothermic
            reaction, it speeds up the reverse reaction more. Equilibrium shifts left, and yield falls even
            though the system reaches equilibrium faster. Industrial Haber plants run at 400–500 °C and
            150–300 atm: a compromise between yield and a workable reaction rate, with NH₃ continuously
            removed to pull the equilibrium forward.
          </p>
        </div>

        {/* Summary table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: '10px 12px', borderBottom: '2px solid var(--border)', color: 'var(--ink)', fontWeight: 700 }}>Change</th>
                <th style={{ textAlign: 'left', padding: '10px 12px', borderBottom: '2px solid var(--border)', color: 'var(--ink)', fontWeight: 700 }}>NH₃ yield</th>
                <th style={{ textAlign: 'left', padding: '10px 12px', borderBottom: '2px solid var(--border)', color: 'var(--ink)', fontWeight: 700 }}>Rate</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['↑ Pressure', '✓ Higher (fewer gas moles)', '✓ Faster'],
                ['↑ Temperature', '✗ Lower (exothermic)', '✓ Much faster'],
                ['Remove NH₃', '✓ Higher (Le Châtelier)', '— no effect'],
                ['Catalyst', '— no effect on K', '✓ Faster'],
              ].map(([c,y,r], i) => (
                <tr key={i}>
                  {[c,y,r].map((v,j) => (
                    <td key={j} style={{
                      padding: '10px 12px', borderBottom: '1px solid var(--border)',
                      color: v.startsWith('✓') ? 'var(--green)' : v.startsWith('✗') ? '#ef4444' : 'var(--ink2)',
                      fontWeight: v.startsWith('✓') || v.startsWith('✗') ? 700 : 400,
                    }}>{v}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Quiz */}
        <div style={{ paddingTop:8, borderTop:'1px solid var(--border)' }}>
          <Quiz/>
        </div>

      </div>
    </div>
  )
}
