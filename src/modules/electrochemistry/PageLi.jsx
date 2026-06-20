import { useState, useEffect, useRef, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Text, Environment } from '@react-three/drei'
import * as THREE from 'three'

function ocvGraphite(soc) {
  if (soc < 0.001) return 0.22
  if (soc < 0.15)  return 0.22 - 0.04*(soc/0.15)
  if (soc < 0.30)  return 0.18 - 0.03*((soc-0.15)/0.15)
  if (soc < 0.65)  return 0.115 + 0.018*Math.sin(Math.PI*(soc-0.30)/0.35)
  return 0.09 - 0.05*((soc-0.65)/0.35)
}
function ocvCathode(soc) {
  const x = 1 - 0.5*soc
  return 3.90 + 0.40*(1-x) - 0.08*Math.sin(Math.PI*(x-0.5)*2.5)
}
function cellVoltage(soc) { return Math.max(0, ocvCathode(soc) - ocvGraphite(soc)) }

function getStage(soc) {
  if (soc < 0.15) return {n:4, label:'Stage 4'}
  if (soc < 0.30) return {n:3, label:'Stage 3'}
  if (soc < 0.65) return {n:2, label:'Stage 2'}
  return {n:1, label:'Stage 1'}
}

function GrapheneLayer({y}) {
  const a = 0.28
  const hexes = [{cx:0,cz:0},{cx:a*3,cz:0},{cx:-a*3,cz:0},{cx:a*1.5,cz:a*Math.sqrt(3)},{cx:-a*1.5,cz:a*Math.sqrt(3)}]
  const atoms = [], bonds = []
  hexes.forEach(({cx,cz}) => {
    for(let i=0;i<6;i++){
      const ang=(Math.PI/3)*i+Math.PI/6
      const x=cx+a*Math.cos(ang), z=cz+a*Math.sin(ang)
      const key=`${Math.round(x*100)}_${Math.round(z*100)}`
      if(!atoms.find(a=>a.key===key)) atoms.push({key,x,z})
    }
  })
  atoms.forEach((a1,i)=>atoms.forEach((a2,j)=>{
    if(j<=i)return
    const d=Math.sqrt((a1.x-a2.x)**2+(a1.z-a2.z)**2)
    if(d<a*1.15) bonds.push({a1,a2,key:`${i}-${j}`})
  }))
  return (
    <group>
      {bonds.map(({a1,a2,key})=>{
        const mx=(a1.x+a2.x)/2,mz=(a1.z+a2.z)/2
        const dx=a2.x-a1.x,dz=a2.z-a1.z
        const len=Math.sqrt(dx*dx+dz*dz)
        const ang=Math.atan2(dx,dz)
        return(<mesh key={key} position={[mx,y,mz]} rotation={[ang,0,Math.PI/2]}>
          <cylinderGeometry args={[0.018,0.018,len,6]}/>
          <meshStandardMaterial color="#64748b" roughness={0.6}/>
        </mesh>)
      })}
      {atoms.map(({key,x,z})=>(
        <mesh key={key} position={[x,y,z]}>
          <sphereGeometry args={[0.08,16,16]}/>
          <meshStandardMaterial color="#64748b" roughness={0.6} emissive="#334155" emissiveIntensity={0.1}/>
        </mesh>
      ))}
    </group>
  )
}

function LiSphere({position,visible}) {
  const r=useRef()
  useFrame(s=>{if(r.current&&visible) r.current.position.y=position[1]+Math.sin(s.clock.elapsedTime*1.6+position[0]*4)*0.012})
  if(!visible) return null
  return(
    <mesh ref={r} position={position}>
      <sphereGeometry args={[0.1,22,22]}/>
      <meshStandardMaterial color="#16a34a" metalness={0.1} roughness={0.2} emissive="#16a34a" emissiveIntensity={0.4}/>
    </mesh>
  )
}

function CoAtom({pos}) {
  return(<mesh position={pos}>
    <sphereGeometry args={[0.12,20,20]}/>
    <meshStandardMaterial color="#f5620f" metalness={0.3} roughness={0.3} emissive="#c44d0a" emissiveIntensity={0.2}/>
  </mesh>)
}
function OAtom({pos}) {
  return(<mesh position={pos}>
    <sphereGeometry args={[0.085,18,18]}/>
    <meshStandardMaterial color="#ef4444" roughness={0.5}/>
  </mesh>)
}

function LiScene({soc, charging}) {
  const stage = getStage(soc)
  const layerYs = [-0.65,-0.22,0.21,0.64,1.07]
  const gapYs   = [-0.435,-0.005,0.425,0.855]
  const coYs    = [-0.78,0.08,0.94]
  const liYs    = [-0.35,0.51]
  const coXs    = [-0.55,-0.18,0.18,0.55]
  const liXs    = [-0.55,-0.18,0.18,0.55]
  const liXsG   = [-0.4,0.0,0.4]

  function isGapFilled(gi) {
    if(stage.n===4) return gi===0&&soc>0.05
    if(stage.n===3) return (gi===0||gi===3)&&soc>0.15
    if(stage.n===2) return (gi%2===0)&&soc>0.30
    return soc>0.65
  }

  const liInCathode = 1 - soc*0.5
  const totalCathodeSites = liYs.length * liXs.length
  const filledCathode = Math.round(liInCathode * totalCathodeSites)
  const travelRef = useRef(0)
  useFrame((_,dt) => { travelRef.current = (travelRef.current + dt*0.5) % 1 })

  return (
    <>
      <color attach="background" args={[getComputedStyle(document.documentElement).getPropertyValue('--mod-bg').trim()||'#f9f8f5']}/>
      <ambientLight intensity={0.8} color="#fffdf8"/>
      <directionalLight position={[5,8,4]} intensity={1.6} castShadow color="#fffaf0"/>
      <directionalLight position={[-5,2,-3]} intensity={0.5} color="#fde8d8"/>
      <Environment preset="apartment"/>

      <group position={[-2.1,0,0]}>
        {layerYs.map((y,i) => <GrapheneLayer key={i} y={y}/>)}
        {gapYs.map((gy,gi) =>
          liXsG.map((lx,li)=>(
            <LiSphere key={`${gi}-${li}`} position={[lx,gy,0]} visible={isGapFilled(gi)}/>
          ))
        )}
        <Text position={[0,-1.38,0]} fontSize={0.09} color="#6366f1" anchorX="center">GRAPHITE</Text>
        <Text position={[0,-1.52,0]} fontSize={0.07} color="#b0ada6" anchorX="center">anode</Text>
        <Text position={[1.2,0.2,0]} fontSize={0.07} color="#6b6962" anchorX="left">{stage.label}</Text>
      </group>

      <group position={[2.1,0,0]}>
        {coYs.map((cy,ci)=>(
          <group key={ci}>
            <mesh position={[0,cy,0]}>
              <boxGeometry args={[1.5,0.26,0.45]}/>
              <meshStandardMaterial color="#f5620f" transparent opacity={0.06} roughness={0.8}/>
            </mesh>
            {coXs.map((cx,xi)=>(
              <group key={xi}>
                <CoAtom pos={[cx,cy,0]}/>
                <OAtom pos={[cx,cy+0.16,0.16]}/><OAtom pos={[cx,cy-0.16,0.16]}/>
                <OAtom pos={[cx,cy+0.16,-0.16]}/><OAtom pos={[cx,cy-0.16,-0.16]}/>
              </group>
            ))}
          </group>
        ))}
        {liYs.map((ly,li)=>
          liXs.map((lx,xi)=>{
            const idx=li*liXs.length+xi
            return <LiSphere key={`li-${li}-${xi}`} position={[lx,ly,0]} visible={idx<filledCathode}/>
          })
        )}
        <Text position={[0,-1.38,0]} fontSize={0.09} color="#f5620f" anchorX="center">LiCoO2</Text>
        <Text position={[0,-1.52,0]} fontSize={0.07} color="#b0ada6" anchorX="center">cathode</Text>
      </group>

      {[0,0.5].map((offset,i)=>{
        const t = (travelRef.current + offset) % 1
        const x = charging ? 2.1 - t*4.2 : -2.1 + t*4.2
        const yOff = Math.sin(t*Math.PI)*0.5
        return(
          <group key={i} position={[x, 0.4+yOff, 0.3]}>
            <mesh><sphereGeometry args={[0.085,14,14]}/><meshStandardMaterial color="#16a34a" emissive="#16a34a" emissiveIntensity={1.2} roughness={0.1}/></mesh>
            <Text position={[0,0.14,0]} fontSize={0.07} color="#16a34a" anchorX="center">Li+</Text>
          </group>
        )
      })}
    </>
  )
}

function OcvChart({soc}) {
  const W=560, H=180, PL=40, PR=12, PT=12, PB=28
  const pW=W-PL-PR, pH=H-PT-PB
  const minV=2.9, maxV=4.35
  const pts = Array.from({length:81},(_,i)=>i/80)
  const tx = s => PL + s*pW
  const ty = v => H-PB - ((v-minV)/(maxV-minV))*pH
  const chargeD    = pts.map((s,i)=>`${i?'L':'M'}${tx(s).toFixed(1)} ${ty(cellVoltage(s)).toFixed(1)}`).join(' ')
  const dischargeD = pts.map((s,i)=>`${i?'L':'M'}${tx(1-s).toFixed(1)} ${ty(cellVoltage(1-s)-0.025).toFixed(1)}`).join(' ')
  const cx=tx(soc), cy=ty(cellVoltage(soc))

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{display:'block'}}>
      {[3.2,3.5,3.8,4.1].map(v=>(
        <g key={v}>
          <line x1={PL} y1={ty(v)} x2={W-PR} y2={ty(v)} stroke="var(--border)" strokeWidth="1"/>
          <text x={PL-6} y={ty(v)+4} textAnchor="end" fontSize="10" fill="var(--ink3)" fontFamily="var(--head)">{v}</text>
        </g>
      ))}
      <line x1={PL} y1={PT} x2={PL} y2={H-PB} stroke="var(--border)" strokeWidth="1"/>
      <line x1={PL} y1={H-PB} x2={W-PR} y2={H-PB} stroke="var(--border)" strokeWidth="1"/>
      <path d={dischargeD} fill="none" stroke="#b0ada6" strokeWidth="1.5" strokeLinecap="round"/>
      <path d={chargeD}    fill="none" stroke="var(--ink)" strokeWidth="2" strokeLinecap="round"/>
      <circle cx={cx} cy={cy} r="6" fill="var(--ink)"/>
      <text x={PL+8} y={PT+14} fontSize="10" fontFamily="var(--head)" fill="var(--ink)" fontWeight="700">Charge</text>
      <text x={PL+8} y={PT+28} fontSize="10" fontFamily="var(--head)" fill="var(--ink3)">Discharge</text>
      <text x={W/2} y={H} textAnchor="middle" fontSize="10" fill="var(--ink3)" fontFamily="var(--head)">State of charge →</text>
    </svg>
  )
}

export default function PageLi({onBack, onNext}) {
  const [soc, setSoc]        = useState(0)
  const [animating, setAnim] = useState(false)
  const [dir, setDir]        = useState('charge')
  const intRef               = useRef(null)
  const V     = cellVoltage(soc)
  const stage = getStage(soc)

  function startAnim(direction) {
    if(animating) return
    setDir(direction); setAnim(true)
    intRef.current = setInterval(() => {
      setSoc(prev => {
        const next = direction==='charge' ? prev+0.01 : prev-0.01
        if(next>=1||next<=0){ clearInterval(intRef.current); setAnim(false); return Math.max(0,Math.min(1,next)) }
        return next
      })
    }, 60)
  }
  useEffect(() => () => clearInterval(intRef.current), [])

  return (
    <div style={{display:'flex',flexDirection:'column',gap:40}}>

      <div>
        <h1>Lithium Intercalation</h1>
        <p style={{marginTop:16}}>
          In a Li-ion cell, lithium ions shuttle between two host lattices — never forming metallic lithium.
          Drag the slider or click Charge to watch Li⁺ move between graphite layers and the LiCoO₂ cathode.
        </p>
      </div>

      {/* 3D scene */}
      <div>
        <Suspense fallback={
          <div style={{height:380,background:'var(--bg)',borderRadius:12,
            display:'flex',alignItems:'center',justifyContent:'center',color:'var(--ink3)'}}>Loading…</div>
        }>
          <div style={{height:380,borderRadius:12,overflow:'hidden',background:'#f9f8f5'}}>
            <Canvas shadows camera={{position:[0,1,7],fov:44}}
              gl={{antialias:true,toneMapping:THREE.ACESFilmicToneMapping,toneMappingExposure:1.15}}>
              <LiScene soc={soc} charging={dir==='charge'}/>
              <OrbitControls enablePan={false} minDistance={4} maxDistance={12}
                minPolarAngle={Math.PI/8} maxPolarAngle={Math.PI/1.8} target={[0,0,0]}/>
            </Canvas>
          </div>
        </Suspense>
        <p style={{marginTop:10,textAlign:'center',color:'var(--ink3)',fontSize:14,fontWeight:700}}>
          {stage.label} · {V.toFixed(3)} V · {Math.round(soc*100)}% · drag to rotate
        </p>
      </div>

      {/* Inline SOC control */}
      <div style={{paddingTop:20,borderTop:'1px solid var(--border)'}}>
        <div style={{display:'flex',justifyContent:'space-between',marginBottom:10}}>
          <span style={{fontWeight:700}}>State of charge</span>
          <span className="math" style={{color:'var(--ink2)',fontVariantNumeric:'tabular-nums'}}>{Math.round(soc*100)} %</span>
        </div>
        <input type="range" min={0} max={1} step={0.005} value={soc}
          onChange={e=>{const v=parseFloat(e.target.value);setDir(v>soc?'charge':'discharge');setSoc(v)}}/>
        <div style={{display:'flex',justifyContent:'space-between',fontSize:13,color:'var(--ink3)',marginTop:6,marginBottom:20}}>
          <span>0% discharged</span><span>100% charged</span>
        </div>
        <div style={{display:'flex',gap:24}}>
          <button disabled={animating||soc>=1} onClick={()=>startAnim('charge')} style={{
            fontWeight:700,color:animating||soc>=1?'var(--ink3)':'var(--ink)',
            opacity:animating||soc>=1?0.4:1,
          }}>Animate charge →</button>
          <button disabled={animating||soc<=0} onClick={()=>startAnim('discharge')} style={{
            fontWeight:700,color:animating||soc<=0?'var(--ink3)':'var(--ink)',
            opacity:animating||soc<=0?0.4:1,
          }}>← Discharge</button>
        </div>
      </div>

      {/* OCV chart */}
      <div style={{paddingTop:28,borderTop:'1px solid var(--border)'}}>
        <p style={{color:'var(--ink3)',fontWeight:700,textTransform:'uppercase',
          letterSpacing:'0.06em',fontSize:13,marginBottom:20}}>OCV curve</p>
        <OcvChart soc={soc}/>
      </div>

      {/* Staging table */}
      <div style={{borderTop:'1px solid var(--border)'}}>
        <p style={{color:'var(--ink3)',fontWeight:700,textTransform:'uppercase',
          letterSpacing:'0.06em',fontSize:13,paddingTop:28,marginBottom:4}}>Why graphite fills in stages</p>
        {[
          {n:4, soc:'0–15%',  v:'~0.20 V', d:'Li fills every 4th graphene gallery. Long-range electrostatic repulsion keeps layers apart.'},
          {n:3, soc:'15–30%', v:'~0.17 V', d:'Density increases. Li occupies every 3rd gallery — a new ordered phase forms.'},
          {n:2, soc:'30–65%', v:'~0.12 V', d:'Most stable phase. Li in every 2nd gallery, producing the longest flat plateau.'},
          {n:1, soc:'65–100%',v:'~0.07 V', d:'All galleries filling. Maximum capacity is LiC₆.'},
        ].map(({n,soc,v,d}) => (
          <div key={n} style={{display:'flex',gap:20,alignItems:'baseline',
            padding:'18px 0',borderBottom:'1px solid var(--border)'}}>
            <span className="math" style={{fontSize:20,fontWeight:700,minWidth:24,color:'var(--ink)'}}>S{n}</span>
            <div>
              <p style={{fontWeight:700,color:'var(--ink)',marginBottom:4}}>{soc} · plateau {v}</p>
              <p>{d}</p>
            </div>
          </div>
        ))}
        <p style={{marginTop:24}}>
          Each stage transition leaves a sharp feature in the dQ/dV plot.
          As a cell degrades, these features blur and disappear — making staging a key diagnostic fingerprint.
        </p>
      </div>

      <div style={{display:'flex',justifyContent:'space-between'}}>
        <button onClick={onBack} style={{color:'var(--ink3)',fontWeight:700}}>← Back</button>
        <button onClick={onNext} style={{
          background:'var(--ink)',color:'#fff',
          padding:'12px 28px',borderRadius:100,fontWeight:700,
        }}>Take the quiz →</button>
      </div>

    </div>
  )
}
