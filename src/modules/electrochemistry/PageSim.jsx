import { useState } from 'react'
import { calcEcell, calcQ, targetQ, TARGET_VOLTAGE, N_ELECTRONS } from './nernst'

const MIN=0.01, MAX=2.00, STEP=0.01

export default function PageSim({onBack, onNext}) {
  const [zn, setZn] = useState(1.0)
  const [cu, setCu] = useState(1.0)

  const Q    = calcQ(zn, cu)
  const E    = calcEcell(zn, cu)
  const logQ = Math.log10(Q)
  const corr = (0.0592 / N_ELECTRONS) * logQ
  const hit  = Math.abs(E - TARGET_VOLTAGE) < 0.01

  // svg scale helpers
  const W=560, H=220, PL=52, PR=16, PT=16, PB=36
  const pW=W-PL-PR, pH=H-PT-PB
  const tx = c => PL + ((c-MIN)/(MAX-MIN))*pW
  const znX = tx(zn), cuX = tx(cu)

  return (
    <div style={{display:'flex',flexDirection:'column',gap:40}}>

      <div>
        <h1>Live Simulator</h1>
        <p style={{marginTop:16}}>
          Drag the points to change concentrations.{' '}
          <strong style={{color:'var(--ink)',fontWeight:700}}>Target: reach exactly {TARGET_VOLTAGE} V.</strong>
        </p>
      </div>

      {/* Voltage readout — big and centered */}
      <div style={{textAlign:'center',paddingBottom:28,borderBottom:'1px solid var(--border)'}}>
        <div className="math" style={{
          fontSize:'clamp(40px,10vw,72px)',fontWeight:700,lineHeight:1,
          color: hit ? 'var(--green)' : 'var(--ink)',
          transition:'color 0.3s',
        }}>
          {E.toFixed(3)}<span style={{fontSize:'0.4em',color:'var(--ink3)',marginLeft:8}}>V</span>
        </div>
        <p style={{marginTop:8,fontSize:14,fontWeight:700}}>
          {hit ? '✓ Target reached' : `Target: ${TARGET_VOLTAGE} V`}
        </p>
      </div>

      {/* Interactive slider diagram */}
      <div>
        <p style={{color:'var(--ink3)',fontWeight:700,textTransform:'uppercase',
          letterSpacing:'0.06em',fontSize:13,marginBottom:20}}>Concentration sliders</p>

        {[
          {label:'[Zn²⁺]', val:zn, set:setZn, color:'var(--indigo)'},
          {label:'[Cu²⁺]', val:cu, set:setCu, color:'var(--teal)'},
        ].map(({label,val,set,color}) => (
          <div key={label} style={{marginBottom:24}}>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}>
              <span className="math" style={{fontWeight:700,color}}>{label}</span>
              <span className="math" style={{color:'var(--ink2)',fontVariantNumeric:'tabular-nums'}}>{val.toFixed(2)} M</span>
            </div>
            <input type="range" min={MIN} max={MAX} step={STEP} value={val}
              onChange={e=>set(parseFloat(e.target.value))}
              style={{accentColor:color}}/>
            <div style={{display:'flex',justifyContent:'space-between',
              fontSize:13,color:'var(--ink3)',marginTop:4}}>
              <span>0.01 M</span><span>2.00 M</span>
            </div>
          </div>
        ))}
      </div>

      {/* Live Nernst working */}
      <div style={{paddingTop:28,borderTop:'1px solid var(--border)'}}>
        <p style={{color:'var(--ink3)',fontWeight:700,textTransform:'uppercase',
          letterSpacing:'0.06em',fontSize:13,marginBottom:20}}>Live Nernst calculation</p>
        <div className="math" style={{fontSize:'clamp(14px,2.5vw,18px)',lineHeight:2,color:'var(--ink)'}}>
          E = 1.10 − (0.0592/2) × log₁₀({zn.toFixed(2)}/{cu.toFixed(2)})
        </div>
        <div className="math" style={{fontSize:'clamp(14px,2.5vw,18px)',lineHeight:2,color:'var(--ink)'}}>
          = 1.10 − {corr.toFixed(4)} = <strong style={{color: hit?'var(--green)':'var(--ink)'}}>{E.toFixed(4)} V</strong>
        </div>
        <p style={{marginTop:16,color: hit?'var(--green)':'var(--ink2)'}}>
          {hit
            ? 'Correct. Lowering Q makes log₁₀(Q) negative — the subtracted correction shrinks, raising E above E°.'
            : `Q = ${Q.toFixed(4)} · Target Q ≈ ${targetQ().toFixed(4)}`}
        </p>
      </div>

      <div style={{display:'flex',justifyContent:'space-between'}}>
        <button onClick={onBack} style={{color:'var(--ink3)',fontWeight:700}}>← Back</button>
        <button onClick={onNext} style={{
          background:'var(--ink)',color:'#fff',
          padding:'12px 28px',borderRadius:100,fontWeight:700,
        }}>Li Intercalation →</button>
      </div>

    </div>
  )
}
