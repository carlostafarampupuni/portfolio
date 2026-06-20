import { useState } from 'react'
import { Link } from 'react-router-dom'
import PageOrigin   from './PageOrigin'
import PageAreaProof from './PageAreaProof'
import PageLIATE    from './PageLIATE'
import PageCyclic   from './PageCyclic'
import PageQuiz     from './PageQuiz'

const LESSONS = ['Origin', 'Area Proof', 'LIATE Rule', 'Cyclic IBP', 'Quiz']

export default function IBPModule() {
  const [page, setPage] = useState(0)
  const [key,  setKey]  = useState(0)
  function go(n) { setPage(n); setKey(k => k+1); window.scrollTo(0,0) }

  return (
    <div style={{ maxWidth:640, margin:'0 auto', padding:'clamp(24px,5vw,56px) 16px 80px' }}>

      <Link to="/projects" style={{ color:'var(--ink3)', fontWeight:700, fontSize:14,
        textDecoration:'none', display:'inline-block', marginBottom:32 }}>
        ← Projects
      </Link>

      <div style={{ marginBottom:40 }}>
        <div style={{ display:'flex', gap:4, marginBottom:12 }}>
          {LESSONS.map((_,i) => (
            <button key={i} onClick={() => go(i)} style={{
              flex:1, height:3, borderRadius:2, padding:0, border:'none',
              background: i <= page ? 'var(--ink)' : 'var(--border)',
              opacity: i < page ? 0.3 : 1,
              transition:'background 0.3s', cursor:'pointer',
            }}/>
          ))}
        </div>
        <p style={{ fontSize:13, color:'var(--ink3)', fontWeight:700,
          letterSpacing:'0.04em', textTransform:'uppercase' }}>
          {LESSONS[page]} — {page+1} of {LESSONS.length}
        </p>
      </div>

      <div key={key} className="fade">
        {page===0 && <PageOrigin    onNext={() => go(1)}/>}
        {page===1 && <PageAreaProof onBack={() => go(0)} onNext={() => go(2)}/>}
        {page===2 && <PageLIATE    onBack={() => go(1)} onNext={() => go(3)}/>}
        {page===3 && <PageCyclic   onBack={() => go(2)} onNext={() => go(4)}/>}
        {page===4 && <PageQuiz     onBack={() => go(3)}/>}
      </div>
    </div>
  )
}
