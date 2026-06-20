import { useState } from 'react'

const QS = [
  { q:'In the Daniell cell, which electrode undergoes oxidation?',
    opts:['The copper (Cu) electrode','The zinc (Zn) electrode','Both equally','The salt bridge'],
    ans:1, fb:{
      c:'Correct. Zn → Zn²⁺ + 2e⁻ at the anode. Oxidation is loss of electrons.',
      w:'Oxidation (loss of electrons) occurs at the zinc anode. Copper undergoes reduction.' }},
  { q:'In which direction do electrons flow through the external wire?',
    opts:['Cathode → Anode (Cu → Zn)','Anode → Cathode (Zn → Cu)','Through the salt bridge','Both directions'],
    ans:1, fb:{
      c:'Correct. Electrons are produced at the zinc anode and consumed at the copper cathode.',
      w:'Electrons flow from anode to cathode (Zn → Cu). Conventional current flows the opposite way.' }},
  { q:'You double [Cu²⁺] while keeping [Zn²⁺] constant. E_cell:',
    opts:['Decreases','Increases','Stays the same','Becomes negative'],
    ans:1, fb:{
      c:'Correct. Doubling [Cu²⁺] halves Q, making log₁₀(Q) more negative — less subtracted from E°.',
      w:'Doubling [Cu²⁺] reduces Q. The Nernst correction shrinks, so E_cell rises.' }},
  { q:'The purpose of the salt bridge is to:',
    opts:['Allow electron flow between half-cells','Maintain electrical neutrality by allowing ion migration','Speed up electrode reactions','Measure cell potential'],
    ans:1, fb:{
      c:'Correct. K⁺ and NO₃⁻ migrate to balance charge build-up — without it the reaction stops.',
      w:'Electrons travel through the external wire. The bridge allows ions to migrate, maintaining neutrality.' }},
  { q:'During CHARGING of a Li-ion battery, lithium ions move:',
    opts:['From anode to cathode through the electrolyte','From cathode to anode through the electrolyte','Li metal deposits on the anode','Only electrons move'],
    ans:1, fb:{
      c:'Correct. Li⁺ deintercalates from LiCoO₂ and intercalates into graphite through the electrolyte.',
      w:'During charging, Li⁺ moves from cathode (LiCoO₂) to anode (graphite) — this is intercalation.' }},
  { q:'"Intercalation" means:',
    opts:['Lithium metal plates onto the electrode','Li⁺ slots reversibly into the host crystal lattice','The electrode dissolves','Lithium reacts chemically with the electrode'],
    ans:1, fb:{
      c:'Correct. Li⁺ inserts reversibly into vacant lattice sites — no metallic lithium, no new phase.',
      w:'Intercalation is reversible insertion of Li⁺ into the host lattice without forming metallic lithium.' }},
]

export default function PageQuiz({onBack}) {
  const [answers, setAnswers] = useState(new Array(QS.length).fill(null))
  const [done,    setDone]    = useState(false)

  function answer(qi, oi) {
    if(answers[qi] !== null) return
    const next = [...answers]; next[qi] = oi; setAnswers(next)
    if(next.every(a => a !== null)) setTimeout(() => setDone(true), 600)
  }
  function reset() { setAnswers(new Array(QS.length).fill(null)); setDone(false) }
  const score = answers.filter((a,i) => a === QS[i].ans).length

  if(done) return (
    <div style={{display:'flex',flexDirection:'column',gap:32}}>
      <div>
        <div className="math" style={{fontSize:'clamp(48px,10vw,72px)',fontWeight:700,
          color:'var(--ink)',lineHeight:1}}>
          {score}<span style={{fontSize:'0.5em',color:'var(--ink3)'}}>/{QS.length}</span>
        </div>
        <p style={{marginTop:16}}>
          {score===6 ? 'Perfect. You understand electrochemistry and Li-ion batteries at depth.' :
           score>=4  ? 'Strong work. Review the questions you missed.' :
                       'Go back through the lessons — focus on the Nernst equation and intercalation mechanism.'}
        </p>
      </div>
      <div style={{display:'flex',gap:20}}>
        <button onClick={onBack} style={{color:'var(--ink3)',fontWeight:700}}>← Back to lessons</button>
        <button onClick={reset} style={{
          background:'var(--ink)',color:'#fff',
          padding:'12px 28px',borderRadius:100,fontWeight:700,
        }}>Try again</button>
      </div>
    </div>
  )

  return (
    <div style={{display:'flex',flexDirection:'column',gap:40}}>
      <div>
        <h1>Quiz</h1>
        <p style={{marginTop:12}}>6 questions · Daniell cell, Nernst equation, Li intercalation.</p>
      </div>

      <div style={{display:'flex',flexDirection:'column',gap:40}}>
        {QS.map((q, qi) => {
          const chosen = answers[qi]
          return (
            <div key={qi} style={{borderTop:'1px solid var(--border)',paddingTop:28}}>
              <p style={{color:'var(--ink3)',fontWeight:700,fontSize:13,
                letterSpacing:'0.06em',textTransform:'uppercase',marginBottom:12}}>
                Question {qi+1}
              </p>
              <p style={{fontWeight:700,color:'var(--ink)',marginBottom:20,fontSize:'var(--sz-b)'}}>{q.q}</p>
              <div style={{display:'flex',flexDirection:'column',gap:8}}>
                {q.opts.map((opt, oi) => {
                  const state = chosen===null ? 'idle' : oi===q.ans ? 'correct' : oi===chosen ? 'wrong' : 'idle'
                  return (
                    <button key={oi} disabled={chosen!==null} onClick={() => answer(qi,oi)} style={{
                      padding:'12px 16px',borderRadius:10,textAlign:'left',
                      border:`1px solid ${state==='correct'?'var(--green)':state==='wrong'?'#dc2626':'var(--border)'}`,
                      background: state==='correct'?'#f0faf5':state==='wrong'?'#fff5f5':'var(--surface)',
                      color: state==='correct'?'var(--green)':state==='wrong'?'#dc2626':'var(--ink)',
                      cursor: chosen!==null?'default':'pointer',
                      fontWeight: state!=='idle'?700:400,
                      transition:'all 0.15s',
                    }}>
                      {state==='correct'&&'✓ '}{state==='wrong'&&'✗ '}{opt}
                    </button>
                  )
                })}
              </div>
              {chosen!==null && (
                <p style={{marginTop:14,color:chosen===q.ans?'var(--green)':'#c00',lineHeight:1.7}}>
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
