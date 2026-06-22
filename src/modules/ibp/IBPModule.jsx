import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useSEO } from '../../components/useSEO'

/* ════════════════════════════════════════════════════════════════
   The geometric area-proof diagram — the ONE diagram for this
   module. Drag the point along the curve and watch ∫u dv and
   ∫v du always sum to the rectangle uv.
   ════════════════════════════════════════════════════════════════ */

function AreaProofDiagram() {
  const [u, setU] = useState(0.62)
  const svgRef = useRef()
  const dragging = useRef(false)
  const W=360, H=300, PAD=40, PW=W-PAD-16, PH=H-PAD-16

  const sx = t => PAD + t*PW
  const sy = t => H-PAD - t*PH
  const cv = u => Math.pow(u, 0.72)

  const pts = Array.from({length:61},(_,i)=>{ const t=i/60; return [sx(t),sy(cv(t))] })
  const pD  = pts.map(([x,y],i)=>`${i?'L':'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ')

  const vv     = cv(u)
  const intVdu = (Math.pow(u,1.72)/1.72).toFixed(3)
  const uv     = (u*vv).toFixed(3)
  const intUdv = (u*vv - parseFloat(intVdu)).toFixed(3)

  function handleMove(clientX) {
    if (!dragging.current) return
    const r = svgRef.current.getBoundingClientRect()
    const frac = (clientX - r.left) / r.width
    setU(Math.max(0.1, Math.min(0.95, (frac * W - PAD) / PW)))
  }

  const clippedPts = pts.filter(([x]) => x <= sx(u) + 1)
  const belowD = `M${sx(0)} ${sy(0)} ${clippedPts.map(([x,y])=>`L${x} ${y}`).join(' ')} L${sx(u)} ${sy(0)} Z`
  const leftD  = `M${PAD} ${H-PAD} ${clippedPts.map(([x,y])=>`L${x} ${y}`).join(' ')} L${PAD} ${sy(vv)} Z`

  return (
    <div>
      <svg ref={svgRef} width="100%" viewBox={`0 0 ${W} ${H}`}
        style={{ display:'block', cursor:'ew-resize', userSelect:'none', touchAction:'none' }}
        onMouseDown={() => dragging.current=true}
        onMouseMove={e => handleMove(e.clientX)}
        onMouseUp={() => dragging.current=false}
        onMouseLeave={() => dragging.current=false}
        onTouchStart={() => dragging.current=true}
        onTouchMove={e => { e.preventDefault(); handleMove(e.touches[0].clientX) }}
        onTouchEnd={() => dragging.current=false}>
        <defs>
          <clipPath id="bl"><path d={belowD}/></clipPath>
          <clipPath id="lf"><path d={leftD}/></clipPath>
        </defs>
        {/* ∫v du — orange */}
        <rect x={PAD} y={sy(1)} width={PW} height={PH} fill="var(--orange)" opacity="0.12" clipPath="url(#bl)"/>
        {/* ∫u dv — teal */}
        <rect x={PAD} y={sy(1)} width={PW} height={PH} fill="var(--teal)" opacity="0.12" clipPath="url(#lf)"/>
        {/* Rectangle outline */}
        <rect x={sx(0)} y={sy(vv)} width={sx(u)-sx(0)} height={sy(0)-sy(vv)}
          fill="none" stroke="var(--border)" strokeWidth="1.5" strokeDasharray="5,4"/>
        {/* Curve */}
        <path d={pD} fill="none" stroke="var(--ink)" strokeWidth="2.5" strokeLinecap="round"/>
        {/* Axes */}
        <line x1={PAD} y1={H-PAD} x2={W-10} y2={H-PAD} stroke="var(--ink2)" strokeWidth="1.5"/>
        <line x1={PAD} y1={H-PAD} x2={PAD}  y2={12}    stroke="var(--ink2)" strokeWidth="1.5"/>
        <text x={W-8}   y={H-PAD+5} fontSize="16" fontFamily="var(--font)" fill="var(--ink2)" textAnchor="end">u</text>
        <text x={PAD-8} y={14}      fontSize="16" fontFamily="var(--font)" fill="var(--ink2)" textAnchor="end">v</text>
        {/* Area labels */}
        <text x={sx(u*0.3)} y={sy(vv*0.38)} textAnchor="middle" fontSize="15"
          fontFamily="var(--font)" fill="var(--teal)" fontWeight="700">∫u dv</text>
        <text x={sx(u*0.66)} y={sy(vv*0.12)} textAnchor="middle" fontSize="15"
          fontFamily="var(--font)" fill="var(--orange)" fontWeight="700">∫v du</text>
        <text x={sx(u)+10} y={sy(vv)-6} fontSize="13"
          fontFamily="var(--font)" fill="var(--ink3)">uv</text>
        <text x={sx(0.76)} y={sy(cv(0.76))-10} textAnchor="middle" fontSize="13"
          fontFamily="var(--font)" fill="var(--ink2)" fontStyle="italic">v = f(u)</text>
        {/* Draggable point */}
        <circle cx={sx(u)} cy={sy(vv)} r="9" fill="var(--ink)"/>
        <circle cx={sx(u)} cy={sy(vv)} r="4" fill="#fff"/>
        {/* Dashed guides */}
        <line x1={sx(u)} y1={sy(vv)} x2={sx(u)} y2={H-PAD} stroke="var(--ink3)" strokeWidth="1" strokeDasharray="3,3"/>
        <line x1={sx(u)} y1={sy(vv)} x2={PAD}   y2={sy(vv)} stroke="var(--ink3)" strokeWidth="1" strokeDasharray="3,3"/>
      </svg>

      {/* Inline live readout */}
      <div style={{ display:'flex', gap:32, justifyContent:'center', paddingTop:16, borderTop:'1px solid var(--border)' }}>
        {[['uv', uv, 'var(--ink)'], ['∫u dv', intUdv, 'var(--teal)'], ['∫v du', intVdu, 'var(--orange)']].map(([l,v,c]) => (
          <div key={l} style={{ textAlign:'center' }}>
            <div className="math" style={{ color:c, fontSize:13, marginBottom:4 }}>{l}</div>
            <div className="math" style={{ fontSize:22, fontWeight:700, color:c, fontVariantNumeric:'tabular-nums' }}>{v}</div>
          </div>
        ))}
      </div>
      <p style={{ textAlign:'center', marginTop:12, color:'var(--ink3)', fontSize:14 }}>
        Always: <span className="math">∫u dv + ∫v du = uv</span> — drag the point to check for yourself
      </p>
    </div>
  )
}

/* ════════════════════════════════════════════════════════════════
   Quiz
   ════════════════════════════════════════════════════════════════ */

const QS = [
  { q:'Integration by parts is derived from which differentiation rule?',
    opts:['The chain rule','The product rule','The quotient rule','L\'Hôpital\'s rule'], ans:1,
    fb:{ c:'Correct. d/dx[uv] = uv′ + vu′ rearranges directly into ∫u dv = uv − ∫v du.',
         w:'IBP comes from integrating both sides of the product rule: d/dx[uv] = uv′ + vu′.' }},
  { q:'For ∫ x ln x dx, which should be u according to LIATE?',
    opts:['u = x (Algebraic)','u = ln x (Logarithm)','Either works equally','Neither — IBP doesn\'t apply'], ans:1,
    fb:{ c:'Correct. L comes before A in LIATE, so u = ln x. Then du = (1/x)dx which simplifies the integral.',
         w:'LIATE says L comes before A. Choosing u = x would leave ∫ ln x dx — which needs IBP to solve!' }},
  { q:'You apply IBP to ∫eˣcos x dx and the original integral reappears. You should:',
    opts:['Start over with different u and dv','Treat the integral as an unknown and solve algebraically','Conclude it has no closed form','Switch u and dv in the second application'], ans:1,
    fb:{ c:'Correct. If I reappears, write I = ... − I, then 2I = ..., so I = .../2 + C.',
         w:'When the original integral reappears, collect I terms: 2I = expression, so I = expression/2 + C.' }},
  { q:'What is ∫ ln x dx?',
    opts:['1/x + C','x ln x + C','x ln x − x + C','ln(x²)/2 + C'], ans:2,
    fb:{ c:'Correct. u = ln x, dv = dx → du = (1/x)dx, v = x → x ln x − ∫ 1 dx = x ln x − x + C.',
         w:'Write ∫ ln x · 1 dx with u = ln x, dv = dx. Then x ln x − ∫ 1 dx = x ln x − x + C.' }},
  { q:'To evaluate ∫ x² eˣ dx, you need to apply IBP:',
    opts:['Once','Twice','Three times','It cannot be done with IBP'], ans:1,
    fb:{ c:'Correct. x² → 2x after the first, 2 after the second. The constant integrates directly.',
         w:'The power reduces by 1 each time: x² → 2x → 2. So exactly 2 applications.' }},
  { q:'Which integral CANNOT be solved by IBP alone?',
    opts:['∫ x sin x dx','∫ x² eˣ dx','∫ arctan x dx','∫ eˣ² dx'], ans:3,
    fb:{ c:'Correct. ∫ eˣ² dx has no elementary antiderivative — it\'s related to the error function.',
         w:'∫ eˣ² dx (e to the x-squared) has no closed form. The others can all be solved with IBP.' }},
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
        <p style={{ marginTop:12 }}>6 questions · Covers everything above.</p>
      </div>

      {done && (
        <div style={{display:'flex',flexDirection:'column',gap:20,padding:'24px 0',
          borderTop:'1px solid var(--border)',borderBottom:'1px solid var(--border)'}}>
          <div className="math" style={{ fontSize:'clamp(40px,8vw,56px)', fontWeight:700, color:'var(--ink)', lineHeight:1 }}>
            {score}<span style={{ fontSize:'0.5em', color:'var(--ink3)' }}>/{QS.length}</span>
          </div>
          <p>
            {score===6 ? 'Perfect. You understand IBP at every level.' :
             score>=4  ? 'Strong work. Review the questions you missed.' :
                         'Scroll back up — focus on the derivation and LIATE.'}
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

export default function IBPModule() {
  useSEO(
    'Integration by Parts',
    'An interactive geometric proof of integration by parts, derived from the product rule — drag a point on the curve and watch the LIATE rule and cyclic integrals come to life.',
    '/projects/ibp'
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
          <h1>Integration by Parts</h1>
          <p style={{ marginTop:16 }}>
            Most textbooks hand you <span className="math">∫ u dv = uv − ∫ v du</span> and say memorise it.
            It actually comes straight from the product rule — something you already know.
          </p>
        </div>

        {/* Origin derivation — condensed to static text */}
        <div style={{ display:'flex', flexDirection:'column', gap:0 }}>
          {[
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
          ].map(({label,math,note,highlight},i) => (
            <div key={i} style={{padding:'24px 0',borderBottom:'1px solid var(--border)'}}>
              <p style={{ color:'var(--ink3)', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', fontSize:13, marginBottom:14 }}>
                {label}
              </p>
              <div className="math" style={{
                fontSize:'clamp(18px, 3.5vw, 24px)', lineHeight:1.6,
                color:'var(--ink)', marginBottom:12,
                fontWeight: highlight ? 700 : 400,
              }}>
                {math}
              </div>
              <p>{note}</p>
            </div>
          ))}
        </div>

        {/* The ONE diagram — geometric area proof */}
        <div style={{ paddingTop:8 }}>
          <h2 style={{fontSize:'clamp(20px,3.5vw,26px)',fontWeight:700,color:'var(--ink)',marginBottom:8}}>
            The geometric proof
          </h2>
          <p style={{ marginBottom:24 }}>
            Plot v against u. The curve divides a rectangle into two regions — <span className="math" style={{ color:'var(--teal)' }}>∫u dv</span> (left) and <span className="math" style={{ color:'var(--orange)' }}>∫v du</span> (below). Together they fill the rectangle <span className="math">uv</span>.
          </p>
          <div className="math" style={{ fontSize:'clamp(16px, 3vw, 22px)', textAlign:'center', marginBottom:28, lineHeight:1.8 }}>
            <span style={{ color:'var(--teal)' }}>∫u dv</span> + <span style={{ color:'var(--orange)' }}>∫v du</span> = uv
            &nbsp;&nbsp;⟹&nbsp;&nbsp;
            <span style={{ color:'var(--teal)' }}>∫u dv</span> = uv − <span style={{ color:'var(--orange)' }}>∫v du</span>
          </div>
          <AreaProofDiagram/>
        </div>

        {/* LIATE — condensed to static text */}
        <div style={{ paddingTop:8, borderTop:'1px solid var(--border)' }}>
          <h2 style={{fontSize:'clamp(20px,3.5vw,26px)',fontWeight:700,color:'var(--ink)',marginBottom:8}}>
            LIATE — picking u and dv
          </h2>
          <p style={{ marginBottom:24 }}>
            Choose u from the highest category present. The function that is hardest to integrate becomes u — differentiate it away.
          </p>

          <div style={{ borderTop:'1px solid var(--border)', marginBottom:32 }}>
            {[
              { l:'L', name:'Logarithms',    ex:'ln x, log₂x' },
              { l:'I', name:'Inverse trig',  ex:'arcsin x, arctan x' },
              { l:'A', name:'Algebraic',     ex:'x², xⁿ, polynomials' },
              { l:'T', name:'Trig',          ex:'sin x, cos x' },
              { l:'E', name:'Exponential',   ex:'eˣ, e^(kx)' },
            ].map((row, i) => (
              <div key={row.l} style={{
                display:'flex', alignItems:'baseline', gap:20,
                padding:'16px 0', borderBottom:'1px solid var(--border)',
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

          <p style={{ marginBottom:8 }}>
            <strong style={{ color:'var(--ink)' }}>Worked example — ∫ x eˣ dx:</strong> x is Algebraic, eˣ is Exponential — A before E, so u = x.
          </p>
          <div className="math" style={{
            fontSize:'clamp(15px, 2.6vw, 19px)', lineHeight:1.9, whiteSpace:'pre-line',
            padding:'20px 0', borderTop:'1px solid var(--border)', borderBottom:'1px solid var(--border)',
          }}>
{`u = x        →    du = dx
dv = eˣ dx   →    v = eˣ

∫ x eˣ dx  =  x eˣ  −  ∫ eˣ dx
= x eˣ − eˣ + C  =  eˣ(x − 1) + C`}
          </div>

          <p style={{ marginTop:20, marginBottom:8 }}>
            <strong style={{ color:'var(--ink)' }}>∫ ln x dx:</strong> write it as ∫ ln x · 1 dx. L comes first, so u = ln x, dv = 1·dx.
          </p>
          <div className="math" style={{
            fontSize:'clamp(15px, 2.6vw, 19px)', lineHeight:1.9, whiteSpace:'pre-line',
            padding:'20px 0', borderBottom:'1px solid var(--border)',
          }}>
{`u = ln x   →   du = (1/x) dx
dv = dx    →   v = x

= x ln x  −  ∫ x · (1/x) dx  =  x ln x − x + C`}
          </div>
        </div>

        {/* Cyclic trick — condensed to static text */}
        <div style={{ paddingTop:8, borderTop:'1px solid var(--border)' }}>
          <h2 style={{fontSize:'clamp(20px,3.5vw,26px)',fontWeight:700,color:'var(--ink)',marginBottom:8}}>
            The cyclic trick
          </h2>
          <p style={{ marginBottom:24 }}>
            <span className="math">∫ eˣ sin x dx</span> can't be finished by IBP in the usual way.
            Apply it twice — the original integral returns, and you solve for it like an equation.
          </p>
          <div className="math" style={{
            fontSize:'clamp(15px, 2.8vw, 19px)', lineHeight:1.95, whiteSpace:'pre-line',
            padding:'24px 0', borderTop:'1px solid var(--border)', borderBottom:'1px solid var(--border)',
          }}>
{`Let I = ∫ eˣ sin x dx

IBP ×1 (u = sin x, dv = eˣ dx):
I = eˣ sin x − ∫ eˣ cos x dx

IBP ×2 (u = cos x, dv = eˣ dx):
∫ eˣ cos x dx = eˣ cos x + ∫ eˣ sin x dx

So:  I = eˣ sin x − eˣ cos x − I
     2I = eˣ(sin x − cos x)`}
          </div>
          <p style={{marginBottom:8}}>Don't panic when I reappears on both sides — that's the trick, not a mistake. Solve for I algebraically:</p>
          <div className="math" style={{
            fontSize:'clamp(16px, 3vw, 21px)', lineHeight:1.9, color:'var(--green)', fontWeight:700,
            padding:'16px 0',
          }}>
            ∫ eˣ sin x dx = eˣ(sin x − cos x) / 2 + C
          </div>
          <p>Always add +C. And never switch your u/dv choice between the two applications.</p>
        </div>

        {/* Quiz */}
        <div style={{ paddingTop:8, borderTop:'1px solid var(--border)' }}>
          <Quiz/>
        </div>

      </div>
    </div>
  )
}
