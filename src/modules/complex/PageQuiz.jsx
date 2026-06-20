import { useState } from 'react'
import NavRow from './NavRow'

const QS = [
  {
    q: 'Why were complex numbers invented?',
    opts: [
      'To give mathematicians something to study',
      'Because certain polynomial equations had no real solutions',
      'To extend the number line to two dimensions for geometry',
      'Because i is a convenient shorthand for √(−1)',
    ],
    ans: 1,
    fb: {
      c: 'Correct. Equations like x² = −1 forced mathematicians to extend the number system — they had no choice if they wanted solutions.',
      w: 'Complex numbers were born from necessity: equations like x² = −1 have no real solutions, so mathematicians extended the number system rather than give up.',
    },
  },
  {
    q: 'What does multiplying a complex number by i do geometrically?',
    opts: [
      'Scales it by a factor of √2',
      'Reflects it across the real axis',
      'Rotates it 90° anticlockwise',
      'Moves it one unit to the right',
    ],
    ans: 2,
    fb: {
      c: 'Correct. Multiplying by i is a 90° anticlockwise rotation. Apply it twice (i²) and you get 180° — the same as multiplying by −1.',
      w: 'Multiplying by i rotates 90° anticlockwise. That is why i² = −1: two 90° rotations make 180°, which is the same as flipping the sign.',
    },
  },
  {
    q: 'What is |z| if z = 3 + 4i?',
    opts: ['3', '4', '5', '7'],
    ans: 2,
    fb: {
      c: 'Correct. |z| = √(3² + 4²) = √(9+16) = √25 = 5. This is the distance from the origin to the point (3, 4) in the Argand plane.',
      w: '|z| = √(Re² + Im²) = √(3² + 4²) = √25 = 5. The modulus is the distance from the origin — a direct application of Pythagoras.',
    },
  },
  {
    q: 'In polar form, multiplying z₁ = r₁e^(iθ₁) by z₂ = r₂e^(iθ₂) gives:',
    opts: [
      '(r₁ + r₂)e^(i(θ₁θ₂))',
      'r₁r₂ · e^(i(θ₁+θ₂))',
      '(r₁r₂)e^(i(θ₁−θ₂))',
      'r₁/r₂ · e^(i(θ₁+θ₂))',
    ],
    ans: 1,
    fb: {
      c: 'Correct. Magnitudes multiply, arguments add. That is the whole power of polar form — multiplication becomes trivial.',
      w: 'In polar form: magnitudes multiply (r₁ × r₂) and arguments add (θ₁ + θ₂). The result is r₁r₂ · e^(i(θ₁+θ₂)).',
    },
  },
  {
    q: 'Euler\'s identity e^(iπ) + 1 = 0 is remarkable because:',
    opts: [
      'It was chosen to look beautiful by Euler himself',
      'It is a coincidence involving five unrelated constants',
      'Rotating by π radians (180°) sends 1 to −1, making it geometrically obvious',
      'It only works for the specific value θ = π',
    ],
    ans: 2,
    fb: {
      c: 'Correct. e^(iπ) rotates the point 1 by 180°, landing at −1. The identity is beautiful because it is geometrically inevitable, not because someone arranged it.',
      w: 'The reason is geometric: e^(iθ) rotates by θ. At θ = π, rotating 1 by 180° gives −1. So e^(iπ) = −1, meaning e^(iπ) + 1 = 0. It\'s inevitable.',
    },
  },
  {
    q: 'Why does the Fourier transform use e^(iθ) rather than sin and cos separately?',
    opts: [
      'It is purely a notational convenience with no mathematical advantage',
      'e^(iθ) = cos θ + i sin θ lets one expression encode both components simultaneously',
      'Complex exponentials are easier to type',
      'The Fourier transform is only defined for complex-valued functions',
    ],
    ans: 1,
    fb: {
      c: 'Correct. e^(iθ) = cos θ + i sin θ packs both components into one expression and makes multiplication (i.e. rotation) algebraically trivial.',
      w: 'Because e^(iθ) = cos θ + i sin θ encodes both components at once and turns rotation into multiplication of exponentials — far cleaner than managing sin and cos separately.',
    },
  },
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

  const score = answers.filter((a, i) => a === QS[i].ans).length

  if (done) return (
    <div style={{ display:'flex', flexDirection:'column', gap:32 }}>
      <div>
        <div className="math" style={{ fontSize:'clamp(48px,10vw,72px)', fontWeight:700, color:'var(--ink)', lineHeight:1 }}>
          {score}<span style={{ fontSize:'0.5em', color:'var(--ink3)' }}>/{QS.length}</span>
        </div>
        <p style={{ marginTop:16 }}>
          {score === 6 ? 'Perfect. You see complex numbers the way mathematicians do — as rotation, not fiction.' :
           score >= 4  ? 'Strong. Review the questions you missed, especially the geometric ones.' :
                         'Go back through the lessons — focus on the rotation picture on the Argand diagram.'}
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
        <p style={{ marginTop:12 }}>6 questions · Covers all three lessons.</p>
      </div>

      <div style={{ display:'flex', flexDirection:'column', gap:40 }}>
        {QS.map((q, qi) => {
          const chosen = answers[qi]
          return (
            <div key={qi} style={{ borderTop:'1px solid var(--border)', paddingTop:28 }}>
              <p style={{ color:'var(--ink3)', fontWeight:700, fontSize:13, letterSpacing:'0.06em', textTransform:'uppercase', marginBottom:12 }}>
                Question {qi + 1}
              </p>
              <p style={{ fontWeight:700, color:'var(--ink)', marginBottom:20, fontSize:'var(--sz-b)' }}>{q.q}</p>
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {q.opts.map((opt, oi) => {
                  const state = chosen === null ? 'idle' : oi === q.ans ? 'correct' : oi === chosen ? 'wrong' : 'idle'
                  return (
                    <button key={oi} disabled={chosen !== null} onClick={() => answer(qi, oi)} style={{
                      padding:'12px 16px', borderRadius:10, textAlign:'left',
                      border:`1px solid ${state==='correct'?'var(--green)':state==='wrong'?'#dc2626':'var(--border)'}`,
                      background: state==='correct'?'#f0faf5':state==='wrong'?'#fff5f5':'var(--surface)',
                      color: state==='correct'?'var(--green)':state==='wrong'?'#dc2626':'var(--ink)',
                      cursor: chosen !== null ? 'default' : 'pointer',
                      fontWeight: state !== 'idle' ? 700 : 400,
                      transition:'all 0.15s',
                    }}>
                      {state==='correct'&&'✓ '}{state==='wrong'&&'✗ '}{opt}
                    </button>
                  )
                })}
              </div>
              {chosen !== null && (
                <p style={{ marginTop:14, color: chosen === q.ans ? 'var(--green)' : '#c00', lineHeight:1.7 }}>
                  {chosen === q.ans ? q.fb.c : q.fb.w}
                </p>
              )}
            </div>
          )
        })}
      </div>

      <NavRow onBack={onBack} backLabel="← Back to Euler's Formula"/>
    </div>
  )
}
