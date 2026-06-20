import { useState, useRef } from 'react'
import NavRow from './NavRow'

function RectDiagram() {
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
        <text x={W-8}   y={H-PAD+5} fontSize="16" fontFamily="var(--math)" fill="var(--ink2)" textAnchor="end">u</text>
        <text x={PAD-8} y={14}      fontSize="16" fontFamily="var(--math)" fill="var(--ink2)" textAnchor="end">v</text>
        {/* Area labels */}
        <text x={sx(u*0.3)} y={sy(vv*0.38)} textAnchor="middle" fontSize="15"
          fontFamily="var(--math)" fill="var(--teal)" fontWeight="700">∫u dv</text>
        <text x={sx(u*0.66)} y={sy(vv*0.12)} textAnchor="middle" fontSize="15"
          fontFamily="var(--math)" fill="var(--orange)" fontWeight="700">∫v du</text>
        <text x={sx(u)+10} y={sy(vv)-6} fontSize="13"
          fontFamily="var(--math)" fill="var(--ink3)">uv</text>
        <text x={sx(0.76)} y={sy(cv(0.76))-10} textAnchor="middle" fontSize="13"
          fontFamily="var(--math)" fill="var(--ink2)" fontStyle="italic">v = f(u)</text>
        {/* Draggable point */}
        <circle cx={sx(u)} cy={sy(vv)} r="9" fill="var(--ink)"/>
        <circle cx={sx(u)} cy={sy(vv)} r="4" fill="#fff"/>
        {/* Dashed guides */}
        <line x1={sx(u)} y1={sy(vv)} x2={sx(u)} y2={H-PAD} stroke="var(--ink3)" strokeWidth="1" strokeDasharray="3,3"/>
        <line x1={sx(u)} y1={sy(vv)} x2={PAD}   y2={sy(vv)} stroke="var(--ink3)" strokeWidth="1" strokeDasharray="3,3"/>
      </svg>

      {/* Inline live readout — no card chrome */}
      <div style={{ display:'flex', gap:32, justifyContent:'center', paddingTop:16, borderTop:'1px solid var(--border)' }}>
        {[['uv', uv, 'var(--ink)'], ['∫u dv', intUdv, 'var(--teal)'], ['∫v du', intVdu, 'var(--orange)']].map(([l,v,c]) => (
          <div key={l} style={{ textAlign:'center' }}>
            <div className="math" style={{ color:c, fontSize:13, marginBottom:4 }}>{l}</div>
            <div className="math" style={{ fontSize:22, fontWeight:700, color:c, fontVariantNumeric:'tabular-nums' }}>{v}</div>
          </div>
        ))}
      </div>
      <p style={{ textAlign:'center', marginTop:12, color:'var(--ink3)', fontSize:14 }}>
        Always: <span className="math">∫u dv + ∫v du = uv</span>
      </p>
    </div>
  )
}

export default function PageAreaProof({ onBack, onNext }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:40 }}>

      <div>
        <h1>The Geometric Proof</h1>
        <p style={{ marginTop:16 }}>
          Plot v against u. The curve divides a rectangle into two regions — <span className="math" style={{ color:'var(--teal)' }}>∫u dv</span> (left) and <span className="math" style={{ color:'var(--orange)' }}>∫v du</span> (below). Together they fill the rectangle <span className="math">uv</span>.
        </p>
      </div>

      <div style={{ borderTop:'1px solid var(--border)', borderBottom:'1px solid var(--border)', padding:'32px 0' }}>
        <div className="math" style={{ fontSize:'clamp(18px, 3.5vw, 26px)', textAlign:'center', marginBottom:32, lineHeight:2 }}>
          <span style={{ color:'var(--teal)' }}>∫u dv</span> + <span style={{ color:'var(--orange)' }}>∫v du</span> = uv
          &nbsp;&nbsp;⟹&nbsp;&nbsp;
          <span style={{ color:'var(--teal)' }}>∫u dv</span> = uv − <span style={{ color:'var(--orange)' }}>∫v du</span>
        </div>
        <RectDiagram/>
      </div>

      <NavRow onBack={onBack} onNext={onNext} nextLabel="LIATE & The Method →"/>
    </div>
  )
}
