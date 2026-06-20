import { useState, useEffect, useRef, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, MeshTransmissionMaterial, Environment, Text } from '@react-three/drei'
import * as THREE from 'three'

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

function Scene({closed,progress,onSwitch,onHover}){
  const ePhases=useRef([0,0.34,0.67])
  const p=progress
  const znW=lerp(0.22,0.07,p), cuW=lerp(0.22,0.38,p)
  const zn2Count=Math.min(Math.floor(p*6),6)
  const cu2Count=Math.max(0,5-Math.floor(p*5))
  useFrame((_,dt)=>{
    if(closed) ePhases.current=ePhases.current.map(ph=>(ph+dt/1.7)%1)
  })
  const zn2pos=[[-1.25,0.1,0.3],[-1.35,-0.35,0.25],[-1.1,0.45,0.35],[-1.5,-0.15,0.4],[-1.2,-0.55,0.3],[-1.0,0.25,0.45]]
  const cu2pos=[[1.25,0.1,0.3],[1.35,-0.35,0.25],[1.1,0.45,0.35],[1.5,-0.15,0.4],[1.2,-0.55,0.3]]

  return(
    <>
      <color attach="background" args={[getComputedStyle(document.documentElement).getPropertyValue('--mod-bg').trim()||'#f9f8f5']}/>
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
          {closed?`${(1.10+0.03*Math.sin(p*Math.PI)).toFixed(3)} V`:"– – –"}
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

export default function PageCell({onNext}) {
  const [closed,   setClosed]   = useState(false)
  const [progress, setProgress] = useState(0)
  const [hovered,  setHovered]  = useState(false)
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

  return (
    <div style={{display:'flex',flexDirection:'column',gap:40}}>

      <div>
        <h1>The Daniell Cell</h1>
        <p style={{marginTop:16}}>
          Zinc and copper half-cells joined by a wire and a salt bridge.
          Click the switch inside the scene to close the circuit and watch the reaction run.
        </p>
      </div>

      <div>
        <Suspense fallback={
          <div style={{height:420,background:'var(--bg)',borderRadius:12,display:'flex',
            alignItems:'center',justifyContent:'center',color:'var(--ink3)'}}>Loading…</div>
        }>
          <div style={{height:420,borderRadius:12,overflow:'hidden',
            background:'var(--mod-bg)',cursor:hovered?'pointer':'grab'}}>
            <Canvas shadows camera={{position:[0,0.5,6.8],fov:42}}
              gl={{antialias:true,toneMapping:THREE.ACESFilmicToneMapping,toneMappingExposure:1.1}}>
              <Scene closed={closed} progress={progress} onSwitch={toggleSwitch} onHover={setHovered}/>
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
      </div>

      <div style={{display:'flex',flexDirection:'column',gap:20,
        paddingTop:28,borderTop:'1px solid var(--border)'}}>
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
          This voltage shifts with concentration — that's the Nernst equation.
        </p>
      </div>

      <div style={{display:'flex',justifyContent:'flex-end'}}>
        <button onClick={onNext} style={{
          background:'var(--ink)',color:'#fff',
          padding:'12px 28px',borderRadius:100,
          fontSize:'var(--sz-b)',fontWeight:700,
        }}>The Nernst Equation →</button>
      </div>

    </div>
  )
}
