import { useState } from 'react'
import NavRow from './NavRow'

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

export default function PageQuiz({ onBack }) {
  const [answers, setAnswers] = useState(new Array(QS.length).fill(null))
  const [done,    setDone]    = useState(false)

  function answer(qi, oi) {
    if (answers[qi] !== null) return
    const next = [...answers]; next[qi] = oi; setAnswers(next)
    if (next.every(a => a !== null)) setTimeout(() => setDone(true), 600)
  }
  function reset() { setAnswers(new Array(QS.length).fill(null)); setDone(false) }

  const score = answers.filter((a,i) => a === QS[i].ans).length

  if (done) return (
    <div style={{ display:'flex', flexDirection:'column', gap:32 }}>
      <div>
        <div className="math" style={{ fontSize:'clamp(48px,10vw,72px)', fontWeight:700, color:'var(--ink)', lineHeight:1 }}>
          {score}<span style={{ fontSize:'0.5em', color:'var(--ink3)' }}>/{QS.length}</span>
        </div>
        <p style={{ marginTop:16 }}>
          {score===6 ? 'Perfect. You understand IBP at every level.' :
           score>=4  ? 'Strong work. Review the questions you missed.' :
                       'Go back through the lessons — focus on the derivation and LIATE.'}
        </p>
      </div>
      <div style={{ display:'flex', gap:16 }}>
        <button onClick={onBack} style={{ color:'var(--ink2)', fontWeight:700 }}>← Back to lessons</button>
        <button onClick={reset} style={{
          background:'var(--ink)', color:'#fff',
          padding:'12px 28px', borderRadius:100, fontWeight:700,
        }}>Try again</button>
      </div>
    </div>
  )

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:40 }}>

      <div>
        <h1>Quiz</h1>
        <p style={{ marginTop:12 }}>6 questions · Covers all four lessons.</p>
      </div>

      <div style={{ display:'flex', flexDirection:'column', gap:40 }}>
        {QS.map((q, qi) => {
          const chosen = answers[qi]
          return (
            <div key={qi} style={{ borderTop:'1px solid var(--border)', paddingTop:28 }}>
              <p style={{ color:'var(--ink3)', fontWeight:700, fontSize:13, letterSpacing:'0.06em', textTransform:'uppercase', marginBottom:12 }}>
                Question {qi+1}
              </p>
              <p style={{ fontWeight:700, color:'var(--ink)', marginBottom:20, fontSize:'var(--sz-b)' }}>{q.q}</p>
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {q.opts.map((opt, oi) => {
                  const state = chosen===null ? 'idle' : oi===q.ans ? 'correct' : oi===chosen ? 'wrong' : 'idle'
                  return (
                    <button key={oi} disabled={chosen!==null} onClick={() => answer(qi,oi)} style={{
                      padding:'12px 16px', borderRadius:10, textAlign:'left',
                      border:`1px solid ${state==='correct'?'var(--green)':state==='wrong'?'#dc2626':'var(--border)'}`,
                      background: state==='correct'?'#f0faf5':state==='wrong'?'#fff5f5':'var(--surface)',
                      color: state==='correct'?'var(--green)':state==='wrong'?'#dc2626':'var(--ink)',
                      cursor: chosen!==null ? 'default' : 'pointer',
                      fontWeight: state!=='idle' ? 700 : 400,
                      transition:'all 0.15s',
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

      <NavRow onBack={onBack} backLabel="← Back to Cyclic Trick"/>
    </div>
  )
}
