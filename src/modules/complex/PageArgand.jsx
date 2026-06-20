import { useState, useRef, useCallback } from 'react'
import NavRow from './NavRow'

/* ─── The single interactive figure for the whole complex numbers module ─── */
function ArgandDiagram() {
  // angle in radians, magnitude
  const [angle, setAngle] = useState(0)
  const [mag,   setMag]   = useState(0.62)
  const [mode,  setMode]  = useState('rotate') // 'rotate' | 'scale' | 'powers'
  const [showEuler, setShowEuler] = useState(false)

  const svgRef  = useRef()
  const dragging = useRef(false)

  const W = 360, H = 340, CX = 180, CY = 170, R = 120

  // convert polar to svg coords
  const toSVG = (r, θ) => [CX + r * R * Math.cos(θ), CY - r * R * Math.sin(θ)]

  const [px, py] = toSVG(mag, angle)

  // i-rotated copies
  const rotations = [0, Math.PI/2, Math.PI, 3*Math.PI/2].map(dθ => ({
    a: angle + dθ,
    label: ['z', 'iz', 'i²z = −z', 'i³z'][Math.round(dθ / (Math.PI/2))],
    op: 0.9 - Math.round(dθ / (Math.PI/2)) * 0.18,
  }))

  function getAngleFromEvent(clientX, clientY) {
    const rect = svgRef.current.getBoundingClientRect()
    const sx = rect.width  / W
    const sy = rect.height / H
    const dx = (clientX - rect.left) / sx - CX
    const dy = CY - (clientY - rect.top) / sy
    const a  = Math.atan2(dy, dx)
    const r  = Math.min(0.98, Math.max(0.25, Math.sqrt(dx*dx + dy*dy) / R))
    return { a, r }
  }

  const onMove = useCallback((clientX, clientY) => {
    if (!dragging.current) return
    const { a, r } = getAngleFromEvent(clientX, clientY)
    setAngle(a)
    if (mode === 'scale') setMag(r)
  }, [mode])

  // Euler arc path
  const eulerArc = (() => {
    const steps = 60
    return Array.from({ length: steps + 1 }, (_, k) => {
      const θ = (angle * k) / steps
      const [ex, ey] = toSVG(1, θ)
      return `${k === 0 ? 'M' : 'L'}${ex.toFixed(1)} ${ey.toFixed(1)}`
    }).join(' ')
  })()

  const cosVal = Math.cos(angle).toFixed(3)
  const sinVal = Math.sin(angle).toFixed(3)
  const θDeg   = ((angle * 180) / Math.PI).toFixed(1)
  const magVal = mag.toFixed(2)

  const activePts = mode === 'powers' ? rotations : [{ a: angle, label:'z', op:1 }]

  return (
    <div>
      {/* Mode selector — same tab style as LIATE examples */}
      <div style={{ display:'flex', gap:24, borderBottom:'1px solid var(--border)', marginBottom:24 }}>
        {[
          { id:'rotate', label:'Rotation' },
          { id:'scale',  label:'Scale + Rotate' },
          { id:'powers', label:'Powers of i' },
        ].map(m => (
          <button key={m.id} onClick={() => { setMode(m.id); setShowEuler(false) }} style={{
            paddingBottom:10, fontSize:14, fontWeight:700,
            color: mode === m.id ? 'var(--ink)' : 'var(--ink3)',
            borderBottom: mode === m.id ? '2px solid var(--ink)' : '2px solid transparent',
            transition:'all 0.15s',
          }}>{m.label}</button>
        ))}
      </div>

      <svg ref={svgRef} width="100%" viewBox={`0 0 ${W} ${H}`}
        style={{ display:'block', cursor:'crosshair', userSelect:'none', touchAction:'none' }}
        onMouseDown={() => dragging.current = true}
        onMouseMove={e => onMove(e.clientX, e.clientY)}
        onMouseUp={() => dragging.current = false}
        onMouseLeave={() => dragging.current = false}
        onTouchStart={e => { dragging.current = true }}
        onTouchMove={e => { e.preventDefault(); onMove(e.touches[0].clientX, e.touches[0].clientY) }}
        onTouchEnd={() => dragging.current = false}
      >
        {/* Grid circles */}
        {[0.5, 1].map(r => (
          <circle key={r} cx={CX} cy={CY} r={r * R}
            fill="none" stroke="var(--border)" strokeWidth={r===1?1.5:1} strokeDasharray={r===1?'none':'4,4'}/>
        ))}

        {/* Axes */}
        <line x1={CX - R - 20} y1={CY} x2={CX + R + 20} y2={CY} stroke="var(--ink2)" strokeWidth="1.5"/>
        <line x1={CX} y1={CY + R + 20} x2={CX} y2={CY - R - 20} stroke="var(--ink2)" strokeWidth="1.5"/>
        <text x={CX + R + 24} y={CY + 5} fontSize="14" fontFamily="var(--math)" fill="var(--ink2)">Re</text>
        <text x={CX - 6} y={CY - R - 10} fontSize="14" fontFamily="var(--math)" fill="var(--ink2)" textAnchor="end">Im</text>

        {/* Axis labels: 1, i, −1, −i */}
        {[[1,0,'1'],[0,1,'i'],[-1,0,'−1'],[0,-1,'−i']].map(([rx,ry,lbl]) => {
          const [lx, ly] = toSVG(1, Math.atan2(ry, rx))
          return (
            <text key={lbl} x={lx + (rx===0?-18:rx*14)} y={ly + (ry===0?5:ry*-12)}
              fontSize="13" fontFamily="var(--math)" fill="var(--ink3)" textAnchor="middle">{lbl}</text>
          )
        })}

        {/* Euler arc (optional) */}
        {showEuler && (
          <path d={eulerArc} fill="none" stroke="var(--teal)" strokeWidth="2.5"
            strokeDasharray="none" opacity="0.7"/>
        )}

        {/* Angle arc */}
        {angle !== 0 && (() => {
          const arcR = 28
          const steps = 20
          const d = Array.from({ length: steps + 1 }, (_, k) => {
            const θ = (angle * k) / steps
            const [ax, ay] = [CX + arcR * Math.cos(θ), CY - arcR * Math.sin(θ)]
            return `${k === 0 ? 'M' : 'L'}${ax.toFixed(1)} ${ay.toFixed(1)}`
          }).join(' ')
          return <path d={d} fill="none" stroke="var(--orange)" strokeWidth="2" opacity="0.8"/>
        })()}

        {/* Powers of i: ghost vectors */}
        {mode === 'powers' && rotations.slice(1).map((rot, idx) => {
          const [rx, ry] = toSVG(mag, rot.a)
          return (
            <g key={idx} opacity={0.35 + idx * 0.05}>
              <line x1={CX} y1={CY} x2={rx} y2={ry}
                stroke="var(--ink)" strokeWidth="1.5" strokeDasharray="5,4"
                markerEnd="url(#arr-ghost)"/>
              <text x={rx + (rx > CX ? 8 : -8)} y={ry + (ry < CY ? -8 : 14)}
                fontSize="12" fontFamily="var(--math)" fill="var(--ink3)"
                textAnchor={rx > CX ? 'start' : 'end'}>{rot.label}</text>
            </g>
          )
        })}

        <defs>
          <marker id="arr-main" viewBox="0 0 10 10" refX="8" refY="5"
            markerWidth="5" markerHeight="5" orient="auto">
            <path d="M1 2L9 5L1 8" fill="none" stroke="var(--ink)" strokeWidth="1.8"/>
          </marker>
          <marker id="arr-ghost" viewBox="0 0 10 10" refX="8" refY="5"
            markerWidth="5" markerHeight="5" orient="auto">
            <path d="M1 2L9 5L1 8" fill="none" stroke="var(--ink3)" strokeWidth="1.8"/>
          </marker>
        </defs>

        {/* Main vector */}
        <line x1={CX} y1={CY} x2={px} y2={py}
          stroke="var(--ink)" strokeWidth="2.5" markerEnd="url(#arr-main)"/>

        {/* Projection lines (scale+rotate mode) */}
        {mode === 'scale' && (
          <>
            <line x1={px} y1={py} x2={px} y2={CY}
              stroke="var(--orange)" strokeWidth="1" strokeDasharray="4,3" opacity="0.7"/>
            <line x1={px} y1={py} x2={CX} y2={py}
              stroke="var(--teal)" strokeWidth="1" strokeDasharray="4,3" opacity="0.7"/>
            <text x={px} y={CY + 16} fontSize="11" fontFamily="var(--math)"
              fill="var(--orange)" textAnchor="middle">{cosVal}</text>
            <text x={CX - 12} y={py + 4} fontSize="11" fontFamily="var(--math)"
              fill="var(--teal)" textAnchor="end">{sinVal}</text>
          </>
        )}

        {/* Draggable point */}
        <circle cx={px} cy={py} r={9} fill="var(--ink)"/>
        <circle cx={px} cy={py} r={4} fill="#fff"/>

        {/* z label */}
        <text x={px + (px > CX ? 14 : -14)} y={py + (py < CY ? -10 : 14)}
          fontSize="14" fontFamily="var(--math)" fill="var(--ink)" fontWeight="700"
          textAnchor={px > CX ? 'start' : 'end'}>z</text>

        {/* Euler toggle hint */}
        <text x={CX} y={H - 8} textAnchor="middle" fontSize="11"
          fontFamily="var(--head)" fill="var(--ink3)" style={{ userSelect:'none' }}>
          drag the point  ·  click "Show arc" below
        </text>
      </svg>

      {/* Live readout — same style as IBP area proof */}
      <div style={{ display:'flex', gap:32, justifyContent:'center', paddingTop:16, borderTop:'1px solid var(--border)' }}>
        {[
          ['θ (deg)', θDeg + '°', 'var(--orange)'],
          ['cos θ',   cosVal,     'var(--teal)'],
          ['sin θ',   sinVal,     'var(--ink)'],
          ...(mode === 'scale' ? [['|z|', magVal, 'var(--ink2)']] : []),
        ].map(([l, v, c]) => (
          <div key={l} style={{ textAlign:'center' }}>
            <div className="math" style={{ color:c, fontSize:13, marginBottom:4 }}>{l}</div>
            <div className="math" style={{ fontSize:20, fontWeight:700, color:c, fontVariantNumeric:'tabular-nums' }}>{v}</div>
          </div>
        ))}
      </div>

      {/* Euler arc toggle */}
      <div style={{ textAlign:'center', marginTop:16 }}>
        <button onClick={() => setShowEuler(e => !e)} style={{
          border:'1px solid var(--border)', borderRadius:100,
          padding:'8px 20px', fontSize:13, fontWeight:700,
          color: showEuler ? 'var(--teal)' : 'var(--ink3)',
          background: showEuler ? '#e6f7f5' : 'var(--surface)',
          transition:'all 0.2s',
        }}>
          {showEuler ? '✓ ' : ''}Show e^(iθ) arc
        </button>
      </div>

      {mode === 'rotate' && (
        <p style={{ textAlign:'center', marginTop:12, color:'var(--ink3)', fontSize:14 }}>
          Each 90° step multiplies by <span className="math">i</span>. Four steps = 360° = back to start.
        </p>
      )}
      {mode === 'scale' && (
        <p style={{ textAlign:'center', marginTop:12, color:'var(--ink3)', fontSize:14 }}>
          Drag to any point: <span className="math">z = |z|(cos θ + i sin θ) = |z|e^(iθ)</span>
        </p>
      )}
      {mode === 'powers' && (
        <p style={{ textAlign:'center', marginTop:12, color:'var(--ink3)', fontSize:14 }}>
          Ghost vectors show <span className="math">iz, i²z, i³z</span> — each a 90° rotation.
        </p>
      )}
    </div>
  )
}

export default function PageArgand({ onBack, onNext }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:40 }}>

      <div>
        <h1>Multiplication is rotation</h1>
        <p style={{ marginTop:16 }}>
          On the number line, multiplying by <span className="math">−1</span> flips a number — a 180° rotation. Multiplying by <span className="math">i</span> is a 90° rotation. That single idea explains everything: why <span className="math">i² = −1</span>, why powers of <span className="math">i</span> cycle, and why Euler's formula is true.
        </p>
      </div>

      <div style={{ borderTop:'1px solid var(--border)', borderBottom:'1px solid var(--border)', padding:'32px 0' }}>
        <ArgandDiagram/>
      </div>

      <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
        <p style={{ color:'var(--ink3)', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.04em', fontSize:13 }}>
          What you just saw
        </p>
        <div style={{ display:'flex', flexDirection:'column', gap:0, borderTop:'1px solid var(--border)' }}>
          {[
            ['Rotation tab',    'Drag z to any angle. Notice i × z is always 90° further anticlockwise.'],
            ['Scale + Rotate',  'Drag closer or further. The dotted lines show Re(z) = r cos θ and Im(z) = r sin θ — that is Euler\'s formula in coordinates.'],
            ['Powers of i',     'The ghost vectors show iz, i²z, i³z. Four 90° turns = 360° = back to z. So i⁴ = 1, not by definition but by geometry.'],
            ['e^(iθ) arc',      'Toggle the arc. It traces the unit circle as θ grows — exactly what e^(iθ) = cos θ + i sin θ predicts.'],
          ].map(([title, desc]) => (
            <div key={title} style={{ display:'flex', gap:20, padding:'16px 0', borderBottom:'1px solid var(--border)' }}>
              <div style={{ fontWeight:700, color:'var(--ink)', minWidth:120, flexShrink:0, fontSize:14 }}>{title}</div>
              <div style={{ color:'var(--ink2)', fontSize:14, lineHeight:1.6 }}>{desc}</div>
            </div>
          ))}
        </div>
      </div>

      <NavRow onBack={onBack} onNext={onNext} nextLabel="Polar Form & Euler →"/>
    </div>
  )
}
