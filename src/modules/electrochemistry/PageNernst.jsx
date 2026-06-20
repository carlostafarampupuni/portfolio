export default function PageNernst({onBack, onNext}) {
  return (
    <div style={{display:'flex',flexDirection:'column',gap:40}}>

      <div>
        <h1>The Nernst Equation</h1>
        <p style={{marginTop:16}}>
          Cell voltage depends on concentration. This follows from thermodynamics in three lines.
        </p>
      </div>

      {/* Derivation — three steps, then result */}
      <div style={{borderTop:'1px solid var(--border)'}}>
        {[
          { label:'Gibbs free energy',
            math:'ΔG = ΔG° + RT ln Q',
            note:'Spontaneity depends on how far the system is from equilibrium — captured by the reaction quotient Q.' },
          { label:'Link to voltage',
            math:'ΔG = −nFE',
            note:'Electrical work equals charge times voltage. n electrons × Faraday constant F × cell potential E.' },
          { label:'Combine and simplify',
            math:'E = E° − (RT / nF) ln Q',
            note:'Substitute and rearrange. At 25 °C, RT/F ≈ 0.0257 V, so the log₁₀ form uses 0.0592/n.' },
        ].map(({label,math,note},i) => (
          <div key={i} style={{padding:'28px 0',borderBottom:'1px solid var(--border)'}}>
            <p style={{color:'var(--ink3)',fontWeight:700,textTransform:'uppercase',
              letterSpacing:'0.06em',fontSize:13,marginBottom:16}}>{label}</p>
            <div className="math" style={{fontSize:'clamp(20px,4vw,28px)',lineHeight:1.6,
              color:'var(--ink)',marginBottom:16}}>
              {math}
            </div>
            <p>{note}</p>
          </div>
        ))}
      </div>

      {/* Result box */}
      <div style={{padding:'28px 0',borderBottom:'1px solid var(--border)'}}>
        <p style={{color:'var(--orange)',fontWeight:700,textTransform:'uppercase',
          letterSpacing:'0.06em',fontSize:13,marginBottom:16}}>Daniell cell  ·  n = 2  ·  E° = 1.10 V</p>
        <div className="math" style={{fontSize:'clamp(18px,3.5vw,24px)',lineHeight:1.9,color:'var(--ink)'}}>
          E = 1.10 − (0.0592/2) × log₁₀([Zn²⁺] / [Cu²⁺])
        </div>
        <p style={{marginTop:16}}>
          Raising [Cu²⁺] or lowering [Zn²⁺] makes Q smaller, so log₁₀(Q) becomes more negative —
          less is subtracted from E°, and the cell voltage rises above 1.10 V.
        </p>
      </div>

      {/* Variables — plain list */}
      <div style={{display:'flex',flexDirection:'column',gap:0}}>
        {[
          ['E°','standard potential (concentrations at 1 M)'],
          ['Q', '[Zn²⁺] / [Cu²⁺]  — the reaction quotient'],
          ['n', 'electrons transferred per formula unit (2)'],
          ['F', 'Faraday constant, 96 485 C mol⁻¹'],
          ['R', '8.314 J mol⁻¹ K⁻¹'],
          ['T', 'temperature in Kelvin (298 K at 25 °C)'],
        ].map(([sym,desc],i) => (
          <div key={sym} style={{display:'flex',gap:20,alignItems:'baseline',
            padding:'14px 0',borderBottom:'1px solid var(--border)'}}>
            <span className="math" style={{width:28,flexShrink:0,fontWeight:700,fontSize:20,color:'var(--ink)'}}>{sym}</span>
            <span style={{color:'var(--ink2)'}}>{desc}</span>
          </div>
        ))}
      </div>

      <div style={{display:'flex',justifyContent:'space-between'}}>
        <button onClick={onBack} style={{color:'var(--ink3)',fontWeight:700}}>← Back</button>
        <button onClick={onNext} style={{
          background:'var(--ink)',color:'#fff',
          padding:'12px 28px',borderRadius:100,fontWeight:700,
        }}>Live Simulator →</button>
      </div>

    </div>
  )
}
