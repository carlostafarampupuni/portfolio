import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useSEO } from '../../components/useSEO'

/* ════════════════════════════════════════════════════════════════
   The ONE diagram for this module — the Argand plane.
   Drag the vector tip to set z. Click ×i to rotate 90°.
   ════════════════════════════════════════════════════════════════ */

function ArgandDiagram() {
  const svgRef = useRef()
  const dragging = useRef(false)
  const [angle, setAngle] = useState(0.6)

  const W = 400, H = 400, CX = 200, CY = 200, R = 140

  function getAngleFromEvent(clientX, clientY) {
    const r = svgRef.current.getBoundingClientRect()
    const sx = (clientX - r.left) * (W / r.width)
    const sy = (clientY - r.top) * (H / r.height)
    return Math.atan2(-(sy - CY), sx - CX)
  }

  function handleMove(clientX, clientY) {
    if (!dragging.current) return
    setAngle(getAngleFromEvent(clientX, clientY))
  }

  const vx = CX + Math.cos(angle) * R
  const vy = CY - Math.sin(angle) * R
  const re = Math.cos(angle)
  const im = Math.sin(angle)

  const pows = [
    { a: 0,            label: '1',      col: 'var(--blue)' },
    { a: Math.PI/2,    label: 'i',      col: 'var(--teal)' },
    { a: Math.PI,      label: 'i²=−1',  col: 'var(--orange)' },
    { a: 3*Math.PI/2,  label: 'i³=−i',  col: 'var(--indigo)' },
  ]

  return (
    <div>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        style={{ display: 'block', userSelect: 'none', touchAction: 'none' }}
        onMouseMove={e => handleMove(e.clientX, e.clientY)}
        onMouseUp={() => { dragging.current = false }}
        onMouseLeave={() => { dragging.current = false }}
        onTouchMove={e => { e.preventDefault(); handleMove(e.touches[0].clientX, e.touches[0].clientY) }}
        onTouchEnd={() => { dragging.current = false }}
      >
        {/* Axes */}
        <line x1="30" y1={CY} x2="370" y2={CY} stroke="var(--border)" strokeWidth="1"/>
        <line x1={CX} y1="30" x2={CX} y2="370" stroke="var(--border)" strokeWidth="1"/>
        <text x="364" y={CY+16} fontSize="13" fontFamily="var(--font)" fontStyle="italic" fill="var(--ink2)">Re</text>
        <text x={CX+8} y="26" fontSize="13" fontFamily="var(--font)" fontStyle="italic" fill="var(--ink2)">Im</text>

        {/* Unit circle */}
        <circle cx={CX} cy={CY} r={R} fill="none" stroke="var(--border)" strokeWidth="1" strokeDasharray="4,3"/>

        {/* Powers of i markers */}
        {pows.map(p => {
          const px = CX + Math.cos(p.a)*R, py = CY - Math.sin(p.a)*R
          return (
            <g key={p.label}>
              <circle cx={px} cy={py} r="6" fill={p.col} opacity="0.85"/>
              <text x={px} y={py - 14} textAnchor="middle" fontSize="12" fill={p.col} fontFamily="var(--font)" fontWeight="600">{p.label}</text>
            </g>
          )
        })}

        {/* User-controlled vector */}
        <line x1={CX} y1={CY} x2={vx} y2={vy} stroke="var(--indigo)" strokeWidth="2.5"/>
        <circle
          cx={vx} cy={vy} r="11" fill="var(--indigo)" opacity="0.9"
          style={{ cursor: 'grab' }}
          onMouseDown={() => { dragging.current = true }}
          onTouchStart={() => { dragging.current = true }}
        />
        <text x={CX + (vx-CX)*0.55 + 12} y={CY + (vy-CY)*0.55 - 8} fontSize="13"
          fontFamily="var(--font)" fontStyle="italic" fill="var(--indigo)">z</text>

        {/* ×i button */}
        <g
          style={{ cursor: 'pointer' }}
          onClick={() => setAngle(a => a + Math.PI/2)}
        >
          <rect x="300" y="350" width="76" height="32" rx="16" fill="var(--indigo)" opacity="0.9"/>
          <text x="338" y="371" textAnchor="middle" fontSize="14" fontWeight="700" fill="#fff" fontFamily="var(--font)" style={{ pointerEvents:'none' }}>×i</text>
        </g>
      </svg>

      {/* Live readout */}
      <div style={{
        marginTop: 12, textAlign: 'center', color: 'var(--ink2)', fontSize: 14,
        paddingTop: 16, borderTop: '1px solid var(--border)',
      }}>
        <span className="math">z = {re.toFixed(2)} {im >= 0 ? '+' : '−'} {Math.abs(im).toFixed(2)}i</span>
        {'  ·  '}
        <span className="math">|z| = 1</span>
        {'  ·  '}
        <span className="math">arg(z) = {(angle * 180 / Math.PI).toFixed(1)}°</span>
      </div>
      <p style={{ textAlign: 'center', marginTop: 10, color: 'var(--ink3)', fontSize: 13 }}>
        Drag the vector tip to rotate it · click ×i to rotate 90° anticlockwise
      </p>
    </div>
  )
}

/* ════════════════════════════════════════════════════════════════
   Quiz
   ════════════════════════════════════════════════════════════════ */

const QS = [
  { q:'Why does i² = −1?',
    opts:['It is an arbitrary definition with no deeper reason','Two 90° rotations equal one 180° rotation, which is the same as multiplying by −1','Complex numbers simply work differently from real numbers','It was chosen to make algebra easier'],
    ans:1, fb:{
      c:'Correct. If i means "rotate 90°", then i × i means "rotate 180°" — the same transformation as multiplying by −1.',
      w:'i² = −1 follows from geometry: applying a 90° rotation twice gives 180°, matching multiplication by −1.' }},
  { q:'Multiplying a complex number z = re^(iθ) by i:',
    opts:['Scales its magnitude by i','Rotates it 90° anticlockwise, leaving magnitude unchanged','Reflects it across the real axis','Doubles its argument'],
    ans:1, fb:{
      c:'Correct. Multiplying by i = e^(iπ/2) adds π/2 to the argument and leaves |z| unchanged.',
      w:'Multiplying by i rotates a complex number 90° anticlockwise about the origin. Magnitude is unaffected.' }},
  { q:'Euler\'s formula e^(iπ) + 1 = 0 follows from:',
    opts:['A coincidence involving five famous constants','Rotation by π radians sending the point 1 to the point −1 on the unit circle','A definition specifically chosen to make it true','An algebraic identity with no geometric meaning'],
    ans:1, fb:{
      c:'Correct. e^(iθ) traces the unit circle. At θ = π, you have rotated 180° from 1, landing exactly on −1.',
      w:'e^(iπ) = −1 is geometric: starting at the point 1 and rotating π radians (180°) lands you at −1.' }},
  { q:'In ℂ, multiplying z₁ · z₂ where z₁ = r₁e^(iθ₁) and z₂ = r₂e^(iθ₂) gives a result with:',
    opts:['Magnitude r₁+r₂, argument θ₁·θ₂','Magnitude r₁·r₂, argument θ₁+θ₂','Magnitude r₁·r₂, argument θ₁·θ₂','Magnitude r₁+r₂, argument θ₁+θ₂'],
    ans:1, fb:{
      c:'Correct. Magnitudes multiply, arguments add. This is why complex exponentials simplify Fourier transforms and AC phasors.',
      w:'z₁z₂ = r₁r₂ · e^(i(θ₁+θ₂)) — magnitudes multiply, arguments add.' }},
  { q:'In AC circuit analysis, the impedance Z = R + j(ωL − 1/ωC). The imaginary part represents:',
    opts:['A mathematical convenience with no physical meaning','Real reactance — actual opposition from capacitors and inductors','An error term to be ignored','The resistance of the wire'],
    ans:1, fb:{
      c:'Correct. The imaginary part is physically real reactance. Remove j and the description of the circuit breaks down.',
      w:'The j-term is not decorative — it represents the genuine phase-shifted opposition from inductors and capacitors.' }},
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
        <p style={{ marginTop:12 }}>5 questions · Rotation, Euler's formula, applications.</p>
      </div>

      {done && (
        <div style={{display:'flex',flexDirection:'column',gap:20,padding:'24px 0',
          borderTop:'1px solid var(--border)',borderBottom:'1px solid var(--border)'}}>
          <div className="math" style={{ fontSize:'clamp(40px,8vw,56px)', fontWeight:700, color:'var(--ink)', lineHeight:1 }}>
            {score}<span style={{ fontSize:'0.5em', color:'var(--ink3)' }}>/{QS.length}</span>
          </div>
          <p>
            {score===5 ? 'Perfect. i is a rotation, not a mystery, to you now.' :
             score>=3  ? 'Strong work. Review the questions you missed.' :
                         'Scroll back up — focus on why multiplying by i is a 90° rotation.'}
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

export default function ComplexModule() {
  useSEO(
    'Complex Numbers',
    'Rotate vectors on the Argand plane, see multiplication as rotation, and prove De Moivre\'s theorem visually — an interactive introduction to complex numbers.',
    '/projects/complex'
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
            Mathematics
          </p>
          <h1>Complex Numbers</h1>
          <p style={{ marginTop:16 }}>
            Solve x² = 4 and you get ±2. Solve x² = −1 and no real number works. Rather than declaring
            it impossible, define a number that does: <span className="math">i² = −1</span>. Drag the
            vector below to see what i actually does.
          </p>
        </div>

        {/* Question first */}
        <div style={{
          background: 'color-mix(in srgb, var(--blue) 8%, var(--bg))',
          border: '1px solid color-mix(in srgb, var(--blue) 25%, transparent)',
          borderRadius: 12, padding: '20px 24px',
        }}>
          <p style={{ fontSize: 15, color: 'var(--mod-ink)', lineHeight: 1.7, margin: 0 }}>
            <strong>Before you read on:</strong> on the real number line, multiplying by −1 is a 180°
            rotation. What single operation, applied twice, gives a 180° rotation?
          </p>
        </div>

        <p>
          A 90° rotation. If <span className="math">i</span> means "rotate 90° anticlockwise," then
          <span className="math"> i × i</span> means "rotate 90°, then another 90°" — a full 180° turn,
          identical to multiplying by −1. So <span className="math">i² = −1</span> is not an arbitrary
          rule. It follows from treating <span className="math">i</span> as a rotation.
        </p>

        {/* Wrong box */}
        <div style={{
          border: '1px solid color-mix(in srgb, #ef4444 30%, transparent)',
          background: 'color-mix(in srgb, #ef4444 6%, var(--bg))',
          borderRadius: 12, padding: '16px 20px',
        }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: '#ef4444', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Common mistake
          </p>
          <p style={{ fontSize: 15, color: 'var(--ink2)', margin: 0, lineHeight: 1.65 }}>
            "i is imaginary, so it isn't a real thing." The word "imaginary" was a historical insult, not
            a mathematical description. Complex numbers are exactly as real as negative numbers once were —
            unfamiliar at first, indispensable once understood.
          </p>
        </div>

        {/* The ONE diagram */}
        <div style={{ paddingTop: 8 }}>
          <h2 style={{fontSize:'clamp(20px,3.5vw,26px)',fontWeight:700,color:'var(--ink)',marginBottom:8}}>
            Multiplication is rotation
          </h2>
          <p style={{marginBottom:20}}>
            On the Argand plane, every complex number is a vector from the origin. Multiplying by i
            rotates that vector 90° anticlockwise — try it below.
          </p>
          <ArgandDiagram/>
        </div>

        {/* Polar form and Euler */}
        <div style={{ display:'flex', flexDirection:'column', gap:20, paddingTop:8, borderTop:'1px solid var(--border)' }}>
          <p>
            In ℝ, multiplying by 3 scales. Multiplying by −1 reflects. In ℂ, multiplying by{' '}
            <span className="math">z = re^(iθ)</span> does both at once: it scales by r and rotates by θ.
            This is why polar form exists — and why complex exponentials make the Fourier transform,
            AC circuit phasors, and quantum wavefunctions all work.
          </p>
          <div className="math" style={{ fontSize:'clamp(16px,3vw,21px)', textAlign:'center', padding:'12px 0', color:'var(--ink)' }}>
            z₁ · z₂ = r₁r₂ · e^(i(θ₁+θ₂))
          </div>
          <p>
            Magnitudes multiply. Arguments add. Two rotations applied in sequence equal a single
            rotation by the sum of their angles.
          </p>
        </div>

        {/* Euler's formula derivation */}
        <div style={{ paddingTop:8, borderTop:'1px solid var(--border)' }}>
          <h2 style={{fontSize:'clamp(20px,3.5vw,26px)',fontWeight:700,color:'var(--ink)',marginBottom:8}}>
            Euler's formula
          </h2>
          <p style={{marginBottom:20}}>
            If multiplying by i is a 90° rotation, multiplying by e^(iθ) should rotate by θ. Expand
            e^(iθ) as a Taylor series and group real and imaginary terms using i² = −1, i³ = −i, i⁴ = 1:
          </p>
          <div className="math" style={{
            fontSize:'clamp(14px, 2.6vw, 18px)', lineHeight:2.1, whiteSpace:'pre-line',
            padding:'20px 0', borderTop:'1px solid var(--border)', borderBottom:'1px solid var(--border)',
          }}>
{`e^(iθ) = 1 + iθ − θ²/2! − iθ³/3! + θ⁴/4! + ⋯

= (1 − θ²/2! + θ⁴/4! − ⋯) + i(θ − θ³/3! + θ⁵/5! − ⋯)

= cos θ + i sin θ`}
          </div>
          <p style={{marginTop:20, marginBottom:8}}>At θ = π, rotating from the point 1 by 180° lands on −1:</p>
          <div className="math" style={{
            fontSize:'clamp(18px, 3.5vw, 24px)', textAlign:'center', color:'var(--green)', fontWeight:700,
            padding:'16px 0',
          }}>
            e^(iπ) + 1 = 0
          </div>
          <p>
            This is not arranged to look beautiful — it is beautiful because rotation by π radians sends
            the point 1 to the point −1. Five of mathematics' most important constants, connected by one
            geometric fact.
          </p>
        </div>

        {/* Applications */}
        <div style={{ paddingTop:8, borderTop:'1px solid var(--border)' }}>
          <h2 style={{fontSize:'clamp(20px,3.5vw,26px)',fontWeight:700,color:'var(--ink)',marginBottom:8}}>
            Where i is not optional
          </h2>
          {[
            { t: 'AC circuits', m: 'Impedance: Z = R + j(ωL − 1/ωC)',
              d: 'The imaginary part is real reactance — genuine opposition from capacitors and inductors. Remove j and the equation falls apart.' },
            { t: 'Signal processing', m: 'Fourier transform: f̂(ξ) = ∫ f(t)·e^(−2πiξt) dt',
              d: 'The e^(iθ) term lets one equation decompose any signal into frequencies. Your phone uses this continuously.' },
            { t: 'Quantum mechanics', m: 'Schrödinger equation: iℏ ∂ψ/∂t = Ĥψ',
              d: 'i is not a convenience here. The wavefunction ψ is complex-valued by physical necessity.' },
          ].map(({t,m,d}, i) => (
            <div key={i} style={{ padding:'20px 0', borderBottom:'1px solid var(--border)' }}>
              <p style={{ fontWeight:700, color:'var(--ink)', marginBottom:8 }}>{t}</p>
              <div className="math" style={{ fontSize:15, color:'var(--ink)', marginBottom:8 }}>{m}</div>
              <p style={{ margin:0 }}>{d}</p>
            </div>
          ))}
        </div>

        {/* Quiz */}
        <div style={{ paddingTop:8, borderTop:'1px solid var(--border)' }}>
          <Quiz/>
        </div>

      </div>
    </div>
  )
}
