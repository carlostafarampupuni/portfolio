export default function NavRow({ onBack, onNext, nextLabel = 'Continue →', backLabel = '← Back' }) {
  return (
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', paddingTop:32 }}>
      {onBack
        ? <button onClick={onBack} style={{ color:'var(--ink3)', fontSize:'var(--sz-b)', fontWeight:700 }}>{backLabel}</button>
        : <span/>}
      {onNext && (
        <button onClick={onNext} style={{
          background:'var(--ink)', color:'#fff',
          padding:'12px 28px', borderRadius:100,
          fontSize:'var(--sz-b)', fontWeight:700,
          letterSpacing:'-0.01em',
        }}>{nextLabel}</button>
      )}
    </div>
  )
}
