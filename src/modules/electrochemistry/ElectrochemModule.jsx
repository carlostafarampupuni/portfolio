import { useState, useEffect, useRef, Suspense } from 'react'
import { Link } from 'react-router-dom'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, MeshTransmissionMaterial, Environment, Text } from '@react-three/drei'
import * as THREE from 'three'
import { calcEcell, calcQ } from './nernst'
import { useSEO } from '../../components/useSEO'

/* ════════════════════════════════════════════════════════════════
   3D Daniell Cell — the ONE diagram for this module.
   Click the switch to run the reaction. Drag the [Zn2+]/[Cu2+]
   sliders below it to watch the Nernst voltage shown on the
   voltmeter update live. Everything else on the page is static
   text plus the quiz at the bottom.
   ════════════════════════════════════════════════════════════════ */

function lerp(a,b,t){return a+(b-a)*t}

function wirePoint(t){
  function l([x1,y1],[x2,y2],s){return[x1+(x2-x1)*s,y1+(y2-y1)*s]}
  if(t<0.5){const s=t/0.5;if(s<0.35)return l([-1.6,1.45],[-1.6,1.85],s/0.35);if(s<0.7)return l([-1.6,1.85],[0,2.05],(s-.35)/.35);return[0,2.05]}
  else{const s=(t-.5)/.5;if(s<0.35)return l([0,2.05],[1.6,1.85],s/.35);if(s<0.7)return l([1.6,1.85],[1.6,1.45],(s-.35)/.35);return[1.6,1.45]}
}

function Beaker({pos,liquid,opacity=0.55}){
  return(
    <group position={pos}>
      <mesh>
        <cylinderGeometry args={[0.72,0.68,2.2,48,1,true]}/>
        <MeshTransmissionMaterial transmission={0.96} thickness={0.04} roughness={0.03} ior={1.52} color="#d4eaf7" backside/>
      </mesh>
      <mesh position={[0,-1.1,0]}>
        <cylinderGeometry args={[0.68,0.68,0.06,48]}/>
        <MeshTransmissionMaterial transmission={0.95} thickness={0.06} roughness={0.02} ior={1.52} color="#d4eaf7"/>
      </mesh>
      <mesh position={[0,-0.28,0]}>
        <cylinderGeometry args={[0.66,0.65,1.65,48]}/>
        <meshStandardMaterial color={liquid} transparent opacity={opacity} roughness={0.05}/>
      </mesh>
      <mesh position={[0,1.1,0]}>
        <torusGeometry args={[0.72,0.022,16,64]}/>
        <meshStandardMaterial color="#c8e0f0" roughness={0.1}/>
      </mesh>
    </group>
  )
}

function Electrode({pos,color,w,metalness=0.85,roughness=0.22}){
  return(
    <mesh position={pos} castShadow>
      <boxGeometry args={[w,2.0,0.12]}/>
      <meshStandardMaterial color={color} metalness={metalness} roughness={roughness}/>
    </mesh>
  )
}

function SaltBridge({closed,kShift,nShift}){
  return(
    <group position={[0,0.05,0.15]}>
      {[-0.62,0.62].map((x,i)=>(
        <mesh key={i} position={[x,0.55,0]}>
          <cylinderGeometry args={[0.1,0.1,1.1,20,1,true]}/>
          <MeshTransmissionMaterial transmission={0.88} thickness={0.03} roughness={0.04} ior={1.5} color="#e8f4fb"/>
        </mesh>
      ))}
      <mesh position={[0,0,0]} rotation={[0,0,Math.PI/2]}>
        <torusGeometry args={[0.62,0.1,16,32,Math.PI]}/>
        <MeshTransmissionMaterial transmission={0.88} thickness={0.03} roughness={0.04} ior={1.5} color="#e8f4fb"/>
      </mesh>
      {[-0.62,0.62].map((x,i)=>(
        <mesh key={`g${i}`} position={[x,0.55,0]}>
          <cylinderGeometry args={[0.08,0.08,1.08,16]}/>
          <meshStandardMaterial color="#f5f0d8" transparent opacity={0.6} roughness={0.5}/>
        </mesh>
      ))}
      <mesh position={[0,0,0]} rotation={[0,0,Math.PI/2]}>
        <torusGeometry args={[0.62,0.08,12,28,Math.PI]}/>
        <meshStandardMaterial color="#f5f0d8" transparent opacity={0.6} roughness={0.5}/>
      </mesh>
      {closed && [
        {kx:0.3,ky:0.52},{kx:0.0,ky:0.3},
      ].map((s,i)=>(
        <group key={`k${i}`} position={[s.kx+kShift*0.6,s.ky,0]}>
          <mesh><sphereGeometry args={[0.065,12,12]}/><meshStandardMaterial color="#f59e0b"/></mesh>
          <Text position={[0,0,0.09]} fontSize={0.055} color="#1a1a1a" anchorX="center">K+</Text>
        </group>
      ))}
      {closed && [
        {kx:0.3,ky:0.52},{kx:0.0,ky:0.3},
      ].map((s,i)=>(
        <group key={`n${i}`} position={[-s.kx+nShift*0.6,s.ky,0]}>
          <mesh><sphereGeometry args={[0.065,12,12]}/><meshStandardMaterial color="#ef4444"/></mesh>
          <Text position={[0,0,0.09]} fontSize={0.05} color="#fff" anchorX="center">NO3-</Text>
        </group>
      ))}
    </group>
  )
}

function Switch3D({closed,onClick,onHover}){
  const lv=useRef()
  useFrame(()=>{
    if(!lv.current)return
    lv.current.rotation.z=lerp(lv.current.rotation.z,closed?0:-Math.PI/3.5,0.1)
  })
  return(
    <group position={[0,1.86,0]} onClick={onClick}
      onPointerOver={()=>onHover(true)} onPointerOut={()=>onHover(false)}>
      <mesh visible={false} position={[0,0.05,0]}>
        <boxGeometry args={[0.6,0.5,0.3]}/>
      </mesh>
      {[-.14,.14].map((x,i)=>(
        <mesh key={i} position={[x,0,0]}>
          <sphereGeometry args={[0.042,16,16]}/>
          <meshStandardMaterial color="#888" metalness={0.9} roughness={0.2}/>
        </mesh>
      ))}
      <group ref={lv} position={[-.14,0,0]}>
        <mesh position={[.14,.1,0]}>
          <cylinderGeometry args={[0.024,0.024,0.3,10]}/>
          <meshStandardMaterial
            color={closed?"#f5620f":"#9b9894"}
            emissive={closed?"#f5620f":"#000"}
            emissiveIntensity={closed?0.5:0}
            metalness={0.6} roughness={0.3}/>
        </mesh>
      </group>
      {closed&&<pointLight position={[0,0.1,0]} color="#f5620f" intensity={1.2} distance={1.5}/>}
    </group>
  )
}

function ZnIon({pos}){
  const r=useRef()
  useFrame(s=>{if(r.current)r.current.position.y=pos[1]+Math.sin(s.clock.elapsedTime*1.1+pos[0]*5)*0.04})
  return(
    <group>
      <mesh ref={r} position={pos}>
        <sphereGeometry args={[0.11,20,20]}/>
        <meshStandardMaterial color="#6366f1" roughness={0.2} metalness={0.1} emissive="#6366f1" emissiveIntensity={0.15}/>
      </mesh>
      <Text position={[pos[0],pos[1],pos[2]+0.13]} fontSize={0.065} color="white" anchorX="center">Zn2+</Text>
    </group>
  )
}

function CuIon({pos}){
  const r=useRef()
  useFrame(s=>{if(r.current)r.current.position.y=pos[1]+Math.sin(s.clock.elapsedTime*0.9+pos[0]*4)*0.04})
  return(
    <group>
      <mesh ref={r} position={pos}>
        <sphereGeometry args={[0.11,20,20]}/>
        <meshStandardMaterial color="#008080" roughness={0.2} metalness={0.1} emissive="#008080" emissiveIntensity={0.15}/>
      </mesh>
      <Text position={[pos[0],pos[1],pos[2]+0.13]} fontSize={0.065} color="white" anchorX="center">Cu2+</Text>
    </group>
  )
}

function Electron({phase}){
  const r=useRef()
  useFrame(()=>{
    if(!r.current)return
    const[x,y]=wirePoint(phase.current%1)
    r.current.position.set(x,y,0.05)
  })
  return(
    <mesh ref={r}>
      <sphereGeometry args={[0.055,14,14]}/>
      <meshStandardMaterial color="#f5620f" emissive="#f5620f" emissiveIntensity={2.5} roughness={0}/>
    </mesh>
  )
}

function Scene({closed,progress,znConc,cuConc,onSwitch,onHover}){
  const ePhases=useRef([0,0.34,0.67])
  const p=progress
  const znW=lerp(0.22,0.07,p), cuW=lerp(0.22,0.38,p)
  const zn2Count=Math.min(Math.floor(p*6),6)
  const cu2Count=Math.max(0,5-Math.floor(p*5))
  const E = calcEcell(znConc, cuConc)
  useFrame((_,dt)=>{
    if(closed) ePhases.current=ePhases.current.map(ph=>(ph+dt/1.7)%1)
  })
  const zn2pos=[[-1.25,0.1,0.3],[-1.35,-0.35,0.25],[-1.1,0.45,0.35],[-1.5,-0.15,0.4],[-1.2,-0.55,0.3],[-1.0,0.25,0.45]]
  const cu2pos=[[1.25,0.1,0.3],[1.35,-0.35,0.25],[1.1,0.45,0.35],[1.5,-0.15,0.4],[1.2,-0.55,0.3]]

  return(
    <>
      <color attach="background" args={[(typeof document!=='undefined' ? getComputedStyle(document.documentElement).getPropertyValue('--mod-bg').trim() : '')||'#f9f8f5']}/>
      <ambientLight intensity={0.8} color="#fffdf8"/>
      <directionalLight position={[4,8,5]} intensity={1.6} castShadow color="#fffaf0"/>
      <directionalLight position={[-4,3,-3]} intensity={0.5} color="#fde8d8"/>
      <Environment preset="apartment"/>

      <Beaker pos={[-1.6,-0.35,0]} liquid="#e8e8f5" opacity={0.4}/>
      <Beaker pos={[ 1.6,-0.35,0]} liquid="#1a4f9a" opacity={0.7}/>

      <Electrode pos={[-1.6,0.3,0]} color="#9ca3af" w={znW} metalness={0.72} roughness={0.38}/>
      <Electrode pos={[ 1.6,0.3,0]} color="#b87333" w={cuW} metalness={0.88} roughness={0.18}/>

      <SaltBridge closed={closed} kShift={-p*0.7} nShift={p*0.7}/>

      <mesh position={[-1.6,1.65,0]}><cylinderGeometry args={[0.025,0.025,0.42,8]}/><meshStandardMaterial color="#b87333" metalness={0.9} roughness={0.18}/></mesh>
      <mesh position={[-0.82,1.86,0]} rotation={[0,0,Math.PI/2]}><cylinderGeometry args={[0.025,0.025,1.6,8]}/><meshStandardMaterial color="#b87333" metalness={0.9} roughness={0.18}/></mesh>
      <mesh position={[0.82,1.86,0]} rotation={[0,0,Math.PI/2]}><cylinderGeometry args={[0.025,0.025,1.6,8]}/><meshStandardMaterial color="#b87333" metalness={0.9} roughness={0.18}/></mesh>
      <mesh position={[1.6,1.65,0]}><cylinderGeometry args={[0.025,0.025,0.42,8]}/><meshStandardMaterial color="#b87333" metalness={0.9} roughness={0.18}/></mesh>

      <Switch3D closed={closed} onClick={onSwitch} onHover={onHover}/>

      <group position={[0,2.06,-0.08]}>
        <mesh><boxGeometry args={[0.65,0.26,0.08]}/><meshStandardMaterial color="#fff" roughness={0.4}/></mesh>
        <Text position={[0,0.05,0.05]} fontSize={0.044} color="#b0ada6" anchorX="center">VOLTMETER</Text>
        <Text position={[0,-0.04,0.05]} fontSize={0.085} color={closed?"#f5620f":"#b0ada6"} anchorX="center">
          {closed?`${E.toFixed(3)} V`:"– – –"}
        </Text>
      </group>

      {zn2pos.slice(0,zn2Count).map((pos,i)=><ZnIon key={i} pos={pos}/>)}
      {cu2pos.slice(0,cu2Count).map((pos,i)=><CuIon key={i} pos={pos}/>)}
      {closed && ePhases.current.map((_,i)=><Electron key={i} phase={{current:ePhases.current[i]}}/>)}

      <Text position={[-1.6,-1.55,0.6]} fontSize={0.1} color="#6366f1" anchorX="center">Anode</Text>
      <Text position={[-1.6,-1.7,0.6]} fontSize={0.075} color="#b0ada6" anchorX="center">Zn to Zn2+ + 2e-</Text>
      <Text position={[ 1.6,-1.55,0.6]} fontSize={0.1} color="#008080" anchorX="center">Cathode</Text>
      <Text position={[ 1.6,-1.7,0.6]} fontSize={0.075} color="#b0ada6" anchorX="center">Cu2+ + 2e- to Cu</Text>
      <Text position={[-1.6,-0.6,0.8]} fontSize={0.075} color="#6366f1" anchorX="center">ZnSO4</Text>
      <Text position={[ 1.6,-0.6,0.8]} fontSize={0.075} color="#008080" anchorX="center">CuSO4</Text>
    </>
  )
}

function DaniellCellDiagram(){
  const [closed,   setClosed]   = useState(false)
  const [progress, setProgress] = useState(0)
  const [hovered,  setHovered]  = useState(false)
  const [zn, setZn] = useState(1.0)
  const [cu, setCu] = useState(1.0)
  const rafRef = useRef(null)
  const lastRef= useRef(null)
  const progRef= useRef(0)

  function toggleSwitch(){
    if(closed){
      setClosed(false); setProgress(0); progRef.current=0; lastRef.current=null
      cancelAnimationFrame(rafRef.current)
    } else setClosed(true)
  }

  useEffect(()=>{
    if(!closed){cancelAnimationFrame(rafRef.current);return}
    function tick(ts){
      if(!lastRef.current)lastRef.current=ts
      const dt=Math.min(ts-lastRef.current,50); lastRef.current=ts
      progRef.current=Math.min(progRef.current+dt/9000,1)
      setProgress(progRef.current)
      if(progRef.current<1)rafRef.current=requestAnimationFrame(tick)
    }
    rafRef.current=requestAnimationFrame(tick)
    return()=>cancelAnimationFrame(rafRef.current)
  },[closed])

  const E = calcEcell(zn, cu)

  return (
    <div>
      <Suspense fallback={
        <div style={{height:420,background:'var(--bg)',borderRadius:12,display:'flex',
          alignItems:'center',justifyContent:'center',color:'var(--ink3)'}}>Loading…</div>
      }>
        <div style={{height:420,borderRadius:12,overflow:'hidden',
          background:'var(--mod-bg)',cursor:hovered?'pointer':'grab'}}>
          <Canvas shadows camera={{position:[0,0.5,6.8],fov:42}}
            gl={{antialias:true,toneMapping:THREE.ACESFilmicToneMapping,toneMappingExposure:1.1}}>
            <Scene closed={closed} progress={progress} znConc={zn} cuConc={cu}
              onSwitch={toggleSwitch} onHover={setHovered}/>
            <OrbitControls enablePan={false} minDistance={4} maxDistance={10}
              minPolarAngle={Math.PI/6} maxPolarAngle={Math.PI/2} target={[0,0,0]}/>
          </Canvas>
        </div>
      </Suspense>
      <p style={{marginTop:10,textAlign:'center',color:'var(--ink3)',fontSize:14,fontWeight:700}}>
        {closed
          ? `${Math.round(progress*100)}% complete · click switch to reset`
          : 'Drag to rotate · click the switch to start'}
      </p>

      {/* Concentration sliders — drive the Nernst voltage shown on the voltmeter above */}
      <div style={{marginTop:28,paddingTop:24,borderTop:'1px solid var(--border)'}}>
        <p style={{color:'var(--ink3)',fontWeight:700,textTransform:'uppercase',
          letterSpacing:'0.06em',fontSize:13,marginBottom:20}}>
          Drag to change concentration · voltmeter updates live
        </p>
        {[
          {label:'[Zn²⁺]', val:zn, set:setZn, color:'var(--indigo)'},
          {label:'[Cu²⁺]', val:cu, set:setCu, color:'var(--teal)'},
        ].map(({label,val,set,color}) => (
          <div key={label} style={{marginBottom:20}}>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}>
              <span className="math" style={{fontWeight:700,color}}>{label}</span>
              <span className="math" style={{color:'var(--ink2)',fontVariantNumeric:'tabular-nums'}}>{val.toFixed(2)} M</span>
            </div>
            <input type="range" min={0.01} max={2.00} step={0.01} value={val}
              onChange={e=>set(parseFloat(e.target.value))}
              style={{width:'100%',accentColor:color}}/>
          </div>
        ))}
        <div className="math" style={{fontSize:'clamp(14px,2.5vw,17px)',lineHeight:1.8,color:'var(--ink)',marginTop:8}}>
          E = 1.10 − (0.0592/2) × log₁₀({zn.toFixed(2)}/{cu.toFixed(2)}) = <strong>{E.toFixed(3)} V</strong>
        </div>
      </div>
    </div>
  )
}

/* ════════════════════════════════════════════════════════════════
   Quiz — sits at the bottom of the single scroll
   ════════════════════════════════════════════════════════════════ */

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

function Quiz() {
  const [answers, setAnswers] = useState(new Array(QS.length).fill(null))
  const [done,    setDone]    = useState(false)

  function answer(qi, oi) {
    if(answers[qi] !== null) return
    const next = [...answers]; next[qi] = oi; setAnswers(next)
    if(next.every(a => a !== null)) setTimeout(() => setDone(true), 600)
  }
  function reset() { setAnswers(new Array(QS.length).fill(null)); setDone(false) }
  const score = answers.filter((a,i) => a === QS[i].ans).length

  return (
    <div style={{display:'flex',flexDirection:'column',gap:40}}>
      <div>
        <h2 style={{fontSize:'clamp(22px,4vw,30px)',fontWeight:700,color:'var(--ink)'}}>Quiz</h2>
        <p style={{marginTop:12}}>6 questions · Daniell cell, Nernst equation, Li intercalation.</p>
      </div>

      {done && (
        <div style={{display:'flex',flexDirection:'column',gap:20,padding:'24px 0',
          borderTop:'1px solid var(--border)',borderBottom:'1px solid var(--border)'}}>
          <div className="math" style={{fontSize:'clamp(40px,8vw,56px)',fontWeight:700,
            color:'var(--ink)',lineHeight:1}}>
            {score}<span style={{fontSize:'0.5em',color:'var(--ink3)'}}>/{QS.length}</span>
          </div>
          <p>
            {score===6 ? 'Perfect. You understand electrochemistry and Li-ion batteries at depth.' :
             score>=4  ? 'Strong work. Review the questions you missed.' :
                         'Scroll back through the module — focus on the Nernst equation and intercalation.'}
          </p>
          <button onClick={reset} style={{
            alignSelf:'flex-start',background:'var(--ink)',color:'#fff',
            padding:'12px 28px',borderRadius:100,fontWeight:700,border:'none',cursor:'pointer',
          }}>Try again</button>
        </div>
      )}

      <div style={{display:'flex',flexDirection:'column',gap:40}}>
        {QS.map((q, qi) => {
          const chosen = answers[qi]
          return (
            <div key={qi} style={{borderTop:'1px solid var(--border)',paddingTop:28}}>
              <p style={{color:'var(--ink3)',fontWeight:700,fontSize:13,
                letterSpacing:'0.06em',textTransform:'uppercase',marginBottom:12}}>
                Question {qi+1}
              </p>
              <p style={{fontWeight:700,color:'var(--ink)',marginBottom:20,fontSize:17}}>{q.q}</p>
              <div style={{display:'flex',flexDirection:'column',gap:8}}>
                {q.opts.map((opt, oi) => {
                  const state = chosen===null ? 'idle' : oi===q.ans ? 'correct' : oi===chosen ? 'wrong' : 'idle'
                  return (
                    <button key={oi} disabled={chosen!==null} onClick={() => answer(qi,oi)} style={{
                      padding:'12px 16px',borderRadius:10,textAlign:'left',
                      border:`1px solid ${state==='correct'?'var(--green)':state==='wrong'?'#dc2626':'var(--border)'}`,
                      background: state==='correct'?'#f0faf5':state==='wrong'?'#fff5f5':'var(--mod-surface)',
                      color: state==='correct'?'var(--green)':state==='wrong'?'#dc2626':'var(--ink)',
                      cursor: chosen!==null?'default':'pointer',
                      fontWeight: state!=='idle'?700:400,
                      transition:'all 0.15s',
                      fontFamily:'inherit', fontSize:15,
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

/* ════════════════════════════════════════════════════════════════
   Page shell — single scroll, no pagination
   ════════════════════════════════════════════════════════════════ */

export default function ElectrochemModule() {
  useSEO(
    'Electrochemistry',
    'An interactive 3D Daniell cell — run the reaction, drag concentrations to shift the Nernst voltage live, then watch lithium ions intercalate into graphite layer by layer.',
    '/projects/electrochemistry'
  )
  return (
    <div style={{ maxWidth:640, margin:'0 auto', padding:'clamp(24px,5vw,56px) 16px 80px' }}>

      <Link to="/projects" style={{ color:'var(--ink3)', fontWeight:700, fontSize:14,
        textDecoration:'none', display:'inline-block', marginBottom:32 }}>
        ← Projects
      </Link>

      <div style={{display:'flex',flexDirection:'column',gap:40}}>

        <div>
          <p style={{color:'var(--ink3)',fontWeight:700,fontSize:13,
            letterSpacing:'0.06em',textTransform:'uppercase',marginBottom:12}}>
            Chemistry
          </p>
          <h1>Electrochemistry</h1>
          <p style={{marginTop:16}}>
            Zinc and copper half-cells joined by a wire and a salt bridge.
            Click the switch inside the scene to close the circuit and watch the reaction run.
            Drag the concentration sliders below it to watch the Nernst voltage update live.
          </p>
        </div>

        <DaniellCellDiagram/>

        <div style={{display:'flex',flexDirection:'column',gap:20,
          paddingTop:8,borderTop:'1px solid var(--border)'}}>
          <p>
            Two reactions run simultaneously. At the zinc <em>anode</em>, atoms lose electrons and dissolve:
            {' '}<span className="math">Zn → Zn²⁺ + 2e⁻</span>. At the copper <em>cathode</em>, those electrons
            arrive through the wire and plate out as solid metal: <span className="math">Cu²⁺ + 2e⁻ → Cu</span>.
          </p>
          <p>
            The wire carries electrons but not ions. Without a path for ions, charge would build up
            in each beaker and the reaction would stall. The salt bridge — a KNO₃ gel tube — lets
            K⁺ drift toward the anode and NO₃⁻ toward the cathode, maintaining electrical neutrality.
          </p>
          <p>
            The standard cell potential is{' '}
            <span className="math">E° = +1.10 V</span>, the difference of the two standard
            half-cell potentials: <span className="math">+0.34 − (−0.76) = 1.10 V</span>.
          </p>
        </div>

        {/* Nernst derivation */}
        <div style={{paddingTop:8,borderTop:'1px solid var(--border)'}}>
          <h2 style={{fontSize:'clamp(20px,3.5vw,26px)',fontWeight:700,color:'var(--ink)',marginBottom:8}}>
            The Nernst equation
          </h2>
          <p style={{marginBottom:24}}>Cell voltage depends on concentration. This follows from thermodynamics in three lines.</p>

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
            <div key={i} style={{padding:'24px 0',borderBottom:'1px solid var(--border)'}}>
              <p style={{color:'var(--ink3)',fontWeight:700,textTransform:'uppercase',
                letterSpacing:'0.06em',fontSize:13,marginBottom:14}}>{label}</p>
              <div className="math" style={{fontSize:'clamp(18px,3.5vw,24px)',lineHeight:1.6,
                color:'var(--ink)',marginBottom:12}}>
                {math}
              </div>
              <p>{note}</p>
            </div>
          ))}

          <div style={{padding:'24px 0'}}>
            <p style={{color:'var(--orange)',fontWeight:700,textTransform:'uppercase',
              letterSpacing:'0.06em',fontSize:13,marginBottom:14}}>Daniell cell · n = 2 · E° = 1.10 V</p>
            <div className="math" style={{fontSize:'clamp(16px,3vw,20px)',lineHeight:1.8,color:'var(--ink)'}}>
              E = 1.10 − (0.0592/2) × log₁₀([Zn²⁺] / [Cu²⁺])
            </div>
            <p style={{marginTop:14}}>
              Raising [Cu²⁺] or lowering [Zn²⁺] makes Q smaller, so log₁₀(Q) becomes more negative —
              less is subtracted from E°, and the cell voltage rises above 1.10 V. Try it on the diagram above.
            </p>
          </div>
        </div>

        {/* Li intercalation — condensed into text */}
        <div style={{paddingTop:8,borderTop:'1px solid var(--border)'}}>
          <h2 style={{fontSize:'clamp(20px,3.5vw,26px)',fontWeight:700,color:'var(--ink)',marginBottom:8}}>
            Lithium intercalation
          </h2>
          <p style={{marginBottom:20}}>
            In a Li-ion cell, lithium ions shuttle between two host lattices — never forming metallic lithium.
            During charging, Li⁺ deintercalates from the LiCoO₂ cathode, crosses the electrolyte, and
            intercalates between graphite layers at the anode. This is reversible insertion into vacant
            lattice sites, not a chemical reaction or metal plating.
          </p>
          <p>
            Graphite fills in four distinct stages as lithium content increases — each stage a distinct
            ordered phase with its own voltage plateau. Stage 4 (0–15% SOC, ~0.20 V) has Li in every 4th
            graphene gallery; Stage 1 (65–100% SOC, ~0.07 V) has every gallery filled, giving the maximum
            capacity composition LiC₆. Each stage transition leaves a sharp feature in the dQ/dV plot —
            a key diagnostic fingerprint that blurs as a cell degrades.
          </p>
        </div>

        {/* Quiz */}
        <div style={{paddingTop:8,borderTop:'1px solid var(--border)'}}>
          <Quiz/>
        </div>

      </div>
    </div>
  )
}
