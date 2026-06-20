import { useState, useEffect, useRef, Suspense } from 'react'
import { Link } from 'react-router-dom'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, MeshTransmissionMaterial, Environment, Text } from '@react-three/drei'
import * as THREE from 'three'
import { calcEcell, calcQ, targetQ, TARGET_VOLTAGE, N_ELECTRONS, E_STANDARD } from './nernst'

/* ═══════════════════════════════════════════════════════
   ElectrochemModule — single continuous scroll
   Sections:
     1. Intro
     2. Daniell Cell 3D (the interactive figure)
     3. Electrons vs ions — misconceptions
     4. Nernst equation — derivation
     5. Nernst simulator — slider puzzle
     6. Li intercalation 3D
     7. Quiz
   ═══════════════════════════════════════════════════════ */

function lerp(a,b,t){return a+(b-a)*t}

/* ──────────────────────────────────────
   3D helpers (Daniell cell)
   ────────────────────────────────────── */
function wirePoint(t){
  function l([x1,y1],[x2,y2],s){return[x1+(x2-x1)*s,y1+(y2-y1)*s]}
  if(t<0.5){const s=t/0.5;if(s<0.35)return l([-1.6,1.45],[-1.6,1.85],s/0.35);if(s<0.7)return l([-1.6,1.85],[0,2.05],(s-.35)/.35);return[0,2.05]}
  else{const s=(t-.5)/.5;if(s<0.35)return l([0,2.05],[1.6,1.85],s/.35);if(s<0.7)return l([1.6,1.85],[1.6,1.45],(s-.35)/.35);return[1.6,1.45]}
}

function Beaker({pos,liquid,opacity=0.55}){
  return(
    <group position={pos}>
      <mesh><cylinderGeometry args={[0.72,0.68,2.2,48,1,true]}/><MeshTransmissionMaterial transmission={0.96} thickness={0.04} roughness={0.03} ior={1.52} color="#d4eaf7" backside/></mesh>
      <mesh position={[0,-1.1,0]}><cylinderGeometry args={[0.68,0.68,0.06,48]}/><MeshTransmissionMaterial transmission={0.95} thickness={0.06} roughness={0.02} ior={1.52} color="#d4eaf7"/></mesh>
      <mesh position={[0,-0.28,0]}><cylinderGeometry args={[0.66,0.65,1.65,48]}/><meshStandardMaterial color={liquid} transparent opacity={opacity} roughness={0.05}/></mesh>
      <mesh position={[0,1.1,0]}><torusGeometry args={[0.72,0.022,16,64]}/><meshStandardMaterial color="#c8e0f0" roughness={0.1}/></mesh>
    </group>
  )
}
function Electrode({pos,color,w,metalness=0.85,roughness=0.22}){
  return(<mesh position={pos} castShadow><boxGeometry args={[w,2.0,0.12]}/><meshStandardMaterial color={color} metalness={metalness} roughness={roughness}/></mesh>)
}
function SaltBridge({closed,kShift,nShift}){
  return(
    <group position={[0,0.05,0.15]}>
      {[-0.62,0.62].map((x,i)=>(<mesh key={i} position={[x,0.55,0]}><cylinderGeometry args={[0.1,0.1,1.1,20,1,true]}/><MeshTransmissionMaterial transmission={0.88} thickness={0.03} roughness={0.04} ior={1.5} color="#e8f4fb"/></mesh>))}
      <mesh position={[0,0,0]} rotation={[0,0,Math.PI/2]}><torusGeometry args={[0.62,0.1,16,32,Math.PI]}/><MeshTransmissionMaterial transmission={0.88} thickness={0.03} roughness={0.04} ior={1.5} color="#e8f4fb"/></mesh>
      {[-0.62,0.62].map((x,i)=>(<mesh key={`g${i}`} position={[x,0.55,0]}><cylinderGeometry args={[0.08,0.08,1.08,16]}/><meshStandardMaterial color="#f5f0d8" transparent opacity={0.6} roughness={0.5}/></mesh>))}
      <mesh position={[0,0,0]} rotation={[0,0,Math.PI/2]}><torusGeometry args={[0.62,0.08,12,28,Math.PI]}/><meshStandardMaterial color="#f5f0d8" transparent opacity={0.6} roughness={0.5}/></mesh>
      {closed&&[{kx:0.3,ky:0.52},{kx:0.0,ky:0.3}].map((s,i)=>(<group key={`k${i}`} position={[s.kx+kShift*0.6,s.ky,0]}><mesh><sphereGeometry args={[0.065,12,12]}/><meshStandardMaterial color="#f59e0b"/></mesh><Text position={[0,0,0.09]} fontSize={0.055} color="#1a1a1a" anchorX="center">K+</Text></group>))}
      {closed&&[{kx:0.3,ky:0.52},{kx:0.0,ky:0.3}].map((s,i)=>(<group key={`n${i}`} position={[-s.kx+nShift*0.6,s.ky,0]}><mesh><sphereGeometry args={[0.065,12,12]}/><meshStandardMaterial color="#ef4444"/></mesh><Text position={[0,0,0.09]} fontSize={0.05} color="#fff" anchorX="center">NO3-</Text></group>))}
    </group>
  )
}
function Switch3D({closed,onClick,onHover}){
  const lv=useRef()
  useFrame(()=>{if(!lv.current)return;lv.current.rotation.z=lerp(lv.current.rotation.z,closed?0:-Math.PI/3.5,0.1)})
  return(
    <group position={[0,1.86,0]} onClick={onClick} onPointerOver={()=>onHover(true)} onPointerOut={()=>onHover(false)}>
      <mesh visible={false} position={[0,0.05,0]}><boxGeometry args={[0.6,0.5,0.3]}/></mesh>
      {[-.14,.14].map((x,i)=>(<mesh key={i} position={[x,0,0]}><sphereGeometry args={[0.042,16,16]}/><meshStandardMaterial color="#888" metalness={0.9} roughness={0.2}/></mesh>))}
      <group ref={lv} position={[-.14,0,0]}>
        <mesh position={[.14,.1,0]}><cylinderGeometry args={[0.024,0.024,0.3,10]}/><meshStandardMaterial color={closed?"#f5620f":"#9b9894"} emissive={closed?"#f5620f":"#000"} emissiveIntensity={closed?0.5:0} metalness={0.6} roughness={0.3}/></mesh>
      </group>
      {closed&&<pointLight position={[0,0.1,0]} color="#f5620f" intensity={1.2} distance={1.5}/>}
    </group>
  )
}
function ZnIon({pos}){const r=useRef();useFrame(s=>{if(r.current)r.current.position.y=pos[1]+Math.sin(s.clock.elapsedTime*1.1+pos[0]*5)*0.04});return(<group><mesh ref={r} position={pos}><sphereGeometry args={[0.11,20,20]}/><meshStandardMaterial color="#6366f1" roughness={0.2} metalness={0.1} emissive="#6366f1" emissiveIntensity={0.15}/></mesh><Text position={[pos[0],pos[1],pos[2]+0.13]} fontSize={0.065} color="white" anchorX="center">Zn2+</Text></group>)}
function CuIon({pos}){const r=useRef();useFrame(s=>{if(r.current)r.current.position.y=pos[1]+Math.sin(s.clock.elapsedTime*0.9+pos[0]*4)*0.04});return(<group><mesh ref={r} position={pos}><sphereGeometry args={[0.11,20,20]}/><meshStandardMaterial color="#008080" roughness={0.2} metalness={0.1} emissive="#008080" emissiveIntensity={0.15}/></mesh><Text position={[pos[0],pos[1],pos[2]+0.13]} fontSize={0.065} color="white" anchorX="center">Cu2+</Text></group>)}
function Electron({phase}){
  const r=useRef()
  useFrame(()=>{if(!r.current)return;const[x,y]=wirePoint(phase.current%1);r.current.position.set(x,y,0.05)})
  return(<mesh ref={r}><sphereGeometry args={[0.055,14,14]}/><meshStandardMaterial color="#f5620f" emissive="#f5620f" emissiveIntensity={2.5} roughness={0}/></mesh>)
}
function DaniellScene({closed,progress,onSwitch,onHover}){
  const ePhases=useRef([0,0.34,0.67])
  const p=progress
  const znW=lerp(0.22,0.07,p), cuW=lerp(0.22,0.38,p)
  const zn2Count=Math.min(Math.floor(p*6),6)
  const cu2Count=Math.max(0,5-Math.floor(p*5))
  useFrame((_,dt)=>{if(closed)ePhases.current=ePhases.current.map(ph=>(ph+dt/1.7)%1)})
  const zn2pos=[[-1.25,0.1,0.3],[-1.35,-0.35,0.25],[-1.1,0.45,0.35],[-1.5,-0.15,0.4],[-1.2,-0.55,0.3],[-1.0,0.25,0.45]]
  const cu2pos=[[1.25,0.1,0.3],[1.35,-0.35,0.25],[1.1,0.45,0.35],[1.5,-0.15,0.4],[1.2,-0.55,0.3]]
  return(
    <>
      <color attach="background" args={[getComputedStyle(document.documentElement).getPropertyValue('--mod-bg').trim()||'#f9f8f5']}/>
      <ambientLight intensity={0.8} color="#fffdf8"/><directionalLight position={[4,8,5]} intensity={1.6} castShadow color="#fffaf0"/><directionalLight position={[-4,3,-3]} intensity={0.5} color="#fde8d8"/>
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
        <Text position={[0,-0.04,0.05]} fontSize={0.085} color={closed?"#f5620f":"#b0ada6"} anchorX="center">{closed?`${(1.10+0.03*Math.sin(p*Math.PI)).toFixed(3)} V`:"– – –"}</Text>
      </group>
      {zn2pos.slice(0,zn2Count).map((pos,i)=><ZnIon key={i} pos={pos}/>)}
      {cu2pos.slice(0,cu2Count).map((pos,i)=><CuIon key={i} pos={pos}/>)}
      {closed&&ePhases.current.map((_,i)=><Electron key={i} phase={{current:ePhases.current[i]}}/>)}
      <Text position={[-1.6,-1.55,0.6]} fontSize={0.1} color="#6366f1" anchorX="center">Anode</Text>
      <Text position={[-1.6,-1.7,0.6]} fontSize={0.075} color="#b0ada6" anchorX="center">Zn to Zn2+ + 2e-</Text>
      <Text position={[ 1.6,-1.55,0.6]} fontSize={0.1} color="#008080" anchorX="center">Cathode</Text>
      <Text position={[ 1.6,-1.7,0.6]} fontSize={0.075} color="#b0ada6" anchorX="center">Cu2+ + 2e- to Cu</Text>
      <Text position={[-1.6,-0.6,0.8]} fontSize={0.075} color="#6366f1" anchorX="center">ZnSO4</Text>
      <Text position={[ 1.6,-0.6,0.8]} fontSize={0.075} color="#008080" anchorX="center">CuSO4</Text>
    </>
  )
}

/* ──────────────────────────────────────
   3D helpers (Li intercalation)
   ────────────────────────────────────── */
function ocvGraphite(soc){if(soc<0.001)return 0.22;if(soc<0.15)return 0.22-0.04*(soc/0.15);if(soc<0.30)return 0.18-0.03*((soc-0.15)/0.15);if(soc<0.65)return 0.115+0.018*Math.sin(Math.PI*(soc-0.30)/0.35);return 0.09-0.05*((soc-0.65)/0.35)}
function ocvCathode(soc){const x=1-0.5*soc;return 3.90+0.40*(1-x)-0.08*Math.sin(Math.PI*(x-0.5)*2.5)}
function cellVoltage(soc){return Math.max(0,ocvCathode(soc)-ocvGraphite(soc))}
function getStage(soc){if(soc<0.15)return{n:4,label:'Stage 4'};if(soc<0.30)return{n:3,label:'Stage 3'};if(soc<0.65)return{n:2,label:'Stage 2'};return{n:1,label:'Stage 1'}}

function GrapheneLayer({y}){
  const a=0.28
  const hexes=[{cx:0,cz:0},{cx:a*3,cz:0},{cx:-a*3,cz:0},{cx:a*1.5,cz:a*Math.sqrt(3)},{cx:-a*1.5,cz:a*Math.sqrt(3)}]
  const atoms=[],bonds=[]
  hexes.forEach(({cx,cz})=>{for(let i=0;i<6;i++){const ang=(Math.PI/3)*i+Math.PI/6;const x=cx+a*Math.cos(ang),z=cz+a*Math.sin(ang);const key=`${Math.round(x*100)}_${Math.round(z*100)}`;if(!atoms.find(a=>a.key===key))atoms.push({key,x,z})}})
  atoms.forEach((a1,i)=>atoms.forEach((a2,j)=>{if(j<=i)return;const d=Math.sqrt((a1.x-a2.x)**2+(a1.z-a2.z)**2);if(d<a*1.15)bonds.push({a1,a2,key:`${i}-${j}`})}))
  return (
    <group>
      {bonds.map(({a1,a2,key}) => {
        const mx=(a1.x+a2.x)/2, mz=(a1.z+a2.z)/2
        const dx=a2.x-a1.x, dz=a2.z-a1.z
        const len=Math.sqrt(dx*dx+dz*dz), ang=Math.atan2(dx,dz)
        return (
          <mesh key={key} position={[mx,y,mz]} rotation={[ang,0,Math.PI/2]}>
            <cylinderGeometry args={[0.018,0.018,len,6]}/>
            <meshStandardMaterial color="#64748b" roughness={0.6}/>
          </mesh>
        )
      })}
      {atoms.map(({key,x,z}) => (
        <mesh key={key} position={[x,y,z]}>
          <sphereGeometry args={[0.08,16,16]}/>
          <meshStandardMaterial color="#64748b" roughness={0.6} emissive="#334155" emissiveIntensity={0.1}/>
        </mesh>
      ))}
    </group>
  )
}
function LiSphere({position,visible}){const r=useRef();useFrame(s=>{if(r.current&&visible)r.current.position.y=position[1]+Math.sin(s.clock.elapsedTime*1.6+position[0]*4)*0.012});if(!visible)return null;return(<mesh ref={r} position={position}><sphereGeometry args={[0.1,22,22]}/><meshStandardMaterial color="#16a34a" metalness={0.1} roughness={0.2} emissive="#16a34a" emissiveIntensity={0.4}/></mesh>)}
function CoAtom({pos}){return(<mesh position={pos}><sphereGeometry args={[0.12,20,20]}/><meshStandardMaterial color="#f5620f" metalness={0.3} roughness={0.3} emissive="#c44d0a" emissiveIntensity={0.2}/></mesh>)}
function OAtom({pos}){return(<mesh position={pos}><sphereGeometry args={[0.085,18,18]}/><meshStandardMaterial color="#ef4444" roughness={0.5}/></mesh>)}

function LiScene({soc,charging}){
  const stage=getStage(soc)
  const layerYs=[-0.65,-0.22,0.21,0.64,1.07],gapYs=[-0.435,-0.005,0.425,0.855]
  const coYs=[-0.78,0.08,0.94],liYs=[-0.35,0.51]
  const coXs=[-0.55,-0.18,0.18,0.55],liXs=[-0.55,-0.18,0.18,0.55],liXsG=[-0.4,0.0,0.4]
  function isGapFilled(gi){if(stage.n===4)return gi===0&&soc>0.05;if(stage.n===3)return(gi===0||gi===3)&&soc>0.15;if(stage.n===2)return(gi%2===0)&&soc>0.30;return soc>0.65}
  const liInCathode=1-soc*0.5,totalCathodeSites=liYs.length*liXs.length,filledCathode=Math.round(liInCathode*totalCathodeSites)
  const travelRef=useRef(0)
  useFrame((_,dt)=>{travelRef.current=(travelRef.current+dt*0.5)%1})
  return(
    <>
      <color attach="background" args={[getComputedStyle(document.documentElement).getPropertyValue('--mod-bg').trim()||'#f9f8f5']}/>
      <ambientLight intensity={0.8} color="#fffdf8"/><directionalLight position={[5,8,4]} intensity={1.6} castShadow color="#fffaf0"/><directionalLight position={[-5,2,-3]} intensity={0.5} color="#fde8d8"/>
      <Environment preset="apartment"/>
      <group position={[-2.1,0,0]}>
        {layerYs.map((y,i)=><GrapheneLayer key={i} y={y}/>)}
        {gapYs.map((gy,gi)=>liXsG.map((lx,li)=>(<LiSphere key={`${gi}-${li}`} position={[lx,gy,0]} visible={isGapFilled(gi)}/>)))}
        <Text position={[0,-1.38,0]} fontSize={0.09} color="#6366f1" anchorX="center">GRAPHITE</Text>
        <Text position={[0,-1.52,0]} fontSize={0.07} color="#b0ada6" anchorX="center">anode</Text>
        <Text position={[1.2,0.2,0]} fontSize={0.07} color="#6b6962" anchorX="left">{stage.label}</Text>
      </group>
      <group position={[2.1,0,0]}>
        {coYs.map((cy,ci)=>(<group key={ci}><mesh position={[0,cy,0]}><boxGeometry args={[1.5,0.26,0.45]}/><meshStandardMaterial color="#f5620f" transparent opacity={0.06} roughness={0.8}/></mesh>{coXs.map((cx,xi)=>(<group key={xi}><CoAtom pos={[cx,cy,0]}/><OAtom pos={[cx,cy+0.16,0.16]}/><OAtom pos={[cx,cy-0.16,0.16]}/><OAtom pos={[cx,cy+0.16,-0.16]}/><OAtom pos={[cx,cy-0.16,-0.16]}/></group>))}</group>))}
        {liYs.map((ly,li)=>liXs.map((lx,xi)=>{const idx=li*liXs.length+xi;return<LiSphere key={`li-${li}-${xi}`} position={[lx,ly,0]} visible={idx<filledCathode}/>}))}
        <Text position={[0,-1.38,0]} fontSize={0.09} color="#f5620f" anchorX="center">LiCoO2</Text>
        <Text position={[0,-1.52,0]} fontSize={0.07} color="#b0ada6" anchorX="center">cathode</Text>
      </group>
      {[0,0.5].map((offset,i)=>{const t=(travelRef.current+offset)%1;const x=charging?2.1-t*4.2:-2.1+t*4.2;const yOff=Math.sin(t*Math.PI)*0.5;return(<group key={i} position={[x,0.4+yOff,0.3]}><mesh><sphereGeometry args={[0.085,14,14]}/><meshStandardMaterial color="#16a34a" emissive="#16a34a" emissiveIntensity={1.2} roughness={0.1}/></mesh><Text position={[0,0.14,0]} fontSize={0.07} color="#16a34a" anchorX="center">Li+</Text></group>)})}
    </>
  )
}

/* ──────────────────────────────────────
   OCV chart (Li)
   ────────────────────────────────────── */
function OcvChart({soc}){
  const W=560,H=180,PL=40,PR=12,PT=12,PB=28,pW=W-PL-PR,pH=H-PT-PB
  const minV=2.9,maxV=4.35
  const pts=Array.from({length:81},(_,i)=>i/80)
  const tx=s=>PL+s*pW,ty=v=>H-PB-((v-minV)/(maxV-minV))*pH
  const chargeD=pts.map((s,i)=>`${i?'L':'M'}${tx(s).toFixed(1)} ${ty(cellVoltage(s)).toFixed(1)}`).join(' ')
  const dischargeD=pts.map((s,i)=>`${i?'L':'M'}${tx(1-s).toFixed(1)} ${ty(cellVoltage(1-s)-0.025).toFixed(1)}`).join(' ')
  const cx=tx(soc),cy=ty(cellVoltage(soc))
  return(
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{display:'block'}}>
      {[3.2,3.5,3.8,4.1].map(v=>(<g key={v}><line x1={PL} y1={ty(v)} x2={W-PR} y2={ty(v)} stroke="var(--border)" strokeWidth="1"/><text x={PL-6} y={ty(v)+4} textAnchor="end" fontSize="10" fill="var(--ink3)" fontFamily="var(--head)">{v}</text></g>))}
      <line x1={PL} y1={PT} x2={PL} y2={H-PB} stroke="var(--border)" strokeWidth="1"/>
      <line x1={PL} y1={H-PB} x2={W-PR} y2={H-PB} stroke="var(--border)" strokeWidth="1"/>
      <path d={dischargeD} fill="none" stroke="#b0ada6" strokeWidth="1.5" strokeLinecap="round"/>
      <path d={chargeD} fill="none" stroke="var(--ink)" strokeWidth="2" strokeLinecap="round"/>
      <circle cx={cx} cy={cy} r="6" fill="var(--ink)"/>
      <text x={PL+8} y={PT+14} fontSize="10" fontFamily="var(--head)" fill="var(--ink)" fontWeight="700">Charge</text>
      <text x={PL+8} y={PT+28} fontSize="10" fontFamily="var(--head)" fill="var(--ink3)">Discharge</text>
      <text x={W/2} y={H} textAnchor="middle" fontSize="10" fill="var(--ink3)" fontFamily="var(--head)">State of charge →</text>
    </svg>
  )
}

/* ──────────────────────────────────────
   Quiz
   ────────────────────────────────────── */
const QS=[
  {q:'In the Daniell cell, where do electrons travel?',opts:['Through the solution','Through the salt bridge','Through the external wire','Both wire and solution'],ans:2,fb:{c:'Correct. Electrons travel only through the external wire — from the zinc anode to the copper cathode. The solution carries ions, not electrons.',w:'Electrons travel through the external wire (Zn → Cu). In solution, charge is carried by ions, not free electrons.'}},
  {q:'Why does removing the salt bridge stop the cell immediately?',opts:['Electrons can no longer flow','The circuit is broken','Charge imbalance builds up, creating a back-EMF that cancels the cell voltage','The temperature drops'],ans:2,fb:{c:'Correct. Without the salt bridge, Zn²⁺ accumulates in the left beaker and SO₄²⁻ builds up in the right. This charge imbalance creates a counter-voltage that halts the reaction.',w:'Without ion transport between half-cells, charge builds up in each beaker. The resulting electric field opposes further reaction — the cell stops.'}},
  {q:'You double [Cu²⁺] while keeping [Zn²⁺] constant. Cell voltage:',opts:['Decreases','Increases','Stays the same','Becomes negative'],ans:1,fb:{c:'Correct. Doubling [Cu²⁺] halves Q. The Nernst correction (0.0592/2 × log Q) shrinks, so less is subtracted from E° and voltage rises.',w:'Doubling [Cu²⁺] reduces Q = [Zn²⁺]/[Cu²⁺]. Since log Q decreases, less is subtracted from E°. Voltage rises.'}},
  {q:'E_cell is +1.10 V before connecting anything. After connecting the wire:',opts:['The voltage jumps to 1.10 V, created by the wire','The pre-existing energy difference drives electrons through the wire','The voltmeter generates the voltage','Voltage appears only once ions move'],ans:1,fb:{c:'Correct. The voltage exists before the circuit closes — it is the difference in electron-holding tendency between Zn and Cu. The wire merely provides a path for electrons to move down that gradient.',w:'Voltage is not created by the wire. It is a pre-existing difference in reduction potentials: E°(Cu²⁺/Cu) − E°(Zn²⁺/Zn) = +0.34 − (−0.76) = +1.10 V.'}},
  {q:'During CHARGING of a Li-ion battery, lithium ions move:',opts:['From anode to cathode through the electrolyte','From cathode to anode through the electrolyte','Li metal plates onto the anode','Only electrons move — Li stays fixed'],ans:1,fb:{c:'Correct. During charging, Li⁺ deintercalates from LiCoO₂ (cathode) and intercalates into graphite (anode) through the electrolyte.',w:'During charging, Li⁺ moves from cathode (LiCoO₂) to anode (graphite). This is the reverse of discharge.'}},
  {q:'Graphite fills with lithium in discrete stages (Stage 4 → 1) because:',opts:['The battery management system controls the order','Long-range electrostatic repulsion forces Li into ordered arrangements in every Nth gallery','Li is too large to fill all galleries at once','Graphite has only 4 layers'],ans:1,fb:{c:'Correct. Li⁺ ions repel each other. At low concentrations, they maximise separation by occupying every 4th gallery (Stage 4). As concentration rises, they progressively fill more densely ordered phases.',w:'Staging is driven by electrostatic repulsion between Li⁺ ions. They adopt ordered arrangements — every Nth layer — to minimise repulsion, forming discrete thermodynamic phases.'}},
]

function QuizSection(){
  const [answers,setAnswers]=useState(new Array(QS.length).fill(null))
  const [done,setDone]=useState(false)
  function answer(qi,oi){if(answers[qi]!==null)return;const next=[...answers];next[qi]=oi;setAnswers(next);if(next.every(a=>a!==null))setTimeout(()=>setDone(true),600)}
  function reset(){setAnswers(new Array(QS.length).fill(null));setDone(false)}
  const score=answers.filter((a,i)=>a===QS[i].ans).length
  if(done)return(
    <div style={{display:'flex',flexDirection:'column',gap:32}}>
      <div className="math" style={{fontSize:'clamp(48px,10vw,72px)',fontWeight:700,color:'var(--ink)',lineHeight:1}}>
        {score}<span style={{fontSize:'0.5em',color:'var(--ink3)'}}>/{QS.length}</span>
      </div>
      <p>{score===6?'Perfect. You understand the Daniell cell, Nernst equation, and Li intercalation at depth.':score>=4?'Strong. Review the questions you missed.':'Go back through the sections — focus on electron vs ion paths and the Nernst equation.'}</p>
      <button onClick={reset} style={{alignSelf:'flex-start',background:'var(--ink)',color:'#fff',padding:'12px 28px',borderRadius:100,fontWeight:700}}>Try again</button>
    </div>
  )
  return(
    <div style={{display:'flex',flexDirection:'column',gap:40}}>
      <div>
        <h2 style={{fontSize:'clamp(20px,4vw,26px)',fontWeight:700,color:'var(--ink)',marginBottom:8}}>Quiz</h2>
        <p>6 questions · Daniell cell, Nernst equation, Li intercalation.</p>
      </div>
      {QS.map((q,qi)=>{
        const chosen=answers[qi]
        return(
          <div key={qi} style={{borderTop:'1px solid var(--border)',paddingTop:28}}>
            <p style={{color:'var(--ink3)',fontWeight:700,fontSize:13,letterSpacing:'0.06em',textTransform:'uppercase',marginBottom:12}}>Question {qi+1}</p>
            <p style={{fontWeight:700,color:'var(--ink)',marginBottom:20,fontSize:'var(--sz-b)'}}>{q.q}</p>
            <div style={{display:'flex',flexDirection:'column',gap:8}}>
              {q.opts.map((opt,oi)=>{
                const state=chosen===null?'idle':oi===q.ans?'correct':oi===chosen?'wrong':'idle'
                return(<button key={oi} disabled={chosen!==null} onClick={()=>answer(qi,oi)} style={{padding:'12px 16px',borderRadius:10,textAlign:'left',border:`1px solid ${state==='correct'?'var(--green)':state==='wrong'?'#dc2626':'var(--border)'}`,background:state==='correct'?'#f0faf5':state==='wrong'?'#fff5f5':'var(--surface)',color:state==='correct'?'var(--green)':state==='wrong'?'#dc2626':'var(--ink)',cursor:chosen!==null?'default':'pointer',fontWeight:state!=='idle'?700:400,transition:'all 0.15s'}}>{state==='correct'&&'✓ '}{state==='wrong'&&'✗ '}{opt}</button>)
              })}
            </div>
            {chosen!==null&&(<p style={{marginTop:14,color:chosen===q.ans?'var(--green)':'#c00',lineHeight:1.7}}>{chosen===q.ans?q.fb.c:q.fb.w}</p>)}
          </div>
        )
      })}
    </div>
  )
}

/* ──────────────────────────────────────
   Main module — single scroll
   ────────────────────────────────────── */
const DIVIDER = <hr style={{border:'none',borderTop:'2px solid var(--border)',margin:'0 0 80px'}}/>

export default function ElectrochemModule() {
  /* Daniell cell state */
  const [closed,   setClosed]   = useState(false)
  const [progress, setProgress] = useState(0)
  const [hovered,  setHovered]  = useState(false)
  const rafRef=useRef(null), lastRef=useRef(null), progRef=useRef(0)

  function toggleSwitch(){
    if(closed){setClosed(false);setProgress(0);progRef.current=0;lastRef.current=null;cancelAnimationFrame(rafRef.current)}
    else setClosed(true)
  }
  useEffect(()=>{
    if(!closed){cancelAnimationFrame(rafRef.current);return}
    function tick(ts){if(!lastRef.current)lastRef.current=ts;const dt=Math.min(ts-lastRef.current,50);lastRef.current=ts;progRef.current=Math.min(progRef.current+dt/9000,1);setProgress(progRef.current);if(progRef.current<1)rafRef.current=requestAnimationFrame(tick)}
    rafRef.current=requestAnimationFrame(tick)
    return()=>cancelAnimationFrame(rafRef.current)
  },[closed])

  /* Li cell state */
  const [soc,setSoc]=useState(0),[animating,setAnim]=useState(false),[dir,setDir]=useState('charge')
  const intRef=useRef(null)
  const V=cellVoltage(soc),stage=getStage(soc)
  function startAnim(direction){if(animating)return;setDir(direction);setAnim(true);intRef.current=setInterval(()=>{setSoc(prev=>{const next=direction==='charge'?prev+0.01:prev-0.01;if(next>=1||next<=0){clearInterval(intRef.current);setAnim(false);return Math.max(0,Math.min(1,next))}return next})},60)}
  useEffect(()=>()=>clearInterval(intRef.current),[])

  /* Nernst sim state */
  const [zn,setZn]=useState(1.0),[cu,setCu]=useState(1.0)
  const Q=calcQ(zn,cu),E=calcEcell(zn,cu),logQ=Math.log10(Q),corr=(0.0592/N_ELECTRONS)*logQ,hit=Math.abs(E-TARGET_VOLTAGE)<0.01

  return (
    <div style={{maxWidth:640,margin:'0 auto',padding:'clamp(24px,5vw,56px) 16px 80px'}}>

      <Link to="/projects" style={{color:'var(--ink3)',fontWeight:700,fontSize:14,textDecoration:'none',display:'inline-block',marginBottom:48}}>
        ← Projects
      </Link>

      {/* ── Intro ── */}
      <section style={{marginBottom:80}}>
        <h1>Electrochemistry</h1>
        <p style={{marginTop:16}}>
          A zinc rod dissolves. A copper rod grows. Electrons flow through a wire. Ions drift through a salt bridge.
          The Daniell cell is one diagram that contains five of the most common misconceptions in electrochemistry —
          this module corrects each one as it appears.
        </p>
        <div style={{marginTop:32,padding:'24px 0',borderTop:'1px solid var(--border)',borderBottom:'1px solid var(--border)'}}>
          <div className="math" style={{fontSize:'clamp(17px,3vw,22px)',lineHeight:2,color:'var(--ink)'}}>
            E = E° − (0.0592 / n) × log₁₀ Q
          </div>
          <p style={{marginTop:12}}>Voltage changes with concentration. The Nernst equation is why.</p>
        </div>
      </section>

      {DIVIDER}

      {/* ── Daniell Cell 3D ── */}
      <section style={{marginBottom:80}}>
        <h2 style={{fontSize:'clamp(20px,4vw,26px)',fontWeight:700,color:'var(--ink)',marginBottom:16}}>The Daniell Cell</h2>
        <p>Zinc and copper half-cells joined by a wire and a salt bridge. Click the switch to close the circuit.</p>

        <div style={{marginTop:28}}>
          <Suspense fallback={<div style={{height:420,background:'var(--bg)',borderRadius:12,display:'flex',alignItems:'center',justifyContent:'center',color:'var(--ink3)'}}>Loading…</div>}>
            <div style={{height:420,borderRadius:12,overflow:'hidden',background:'var(--mod-bg)',cursor:hovered?'pointer':'grab'}}>
              <Canvas shadows camera={{position:[0,0.5,6.8],fov:42}} gl={{antialias:true,toneMapping:THREE.ACESFilmicToneMapping,toneMappingExposure:1.1}}>
                <DaniellScene closed={closed} progress={progress} onSwitch={toggleSwitch} onHover={setHovered}/>
                <OrbitControls enablePan={false} minDistance={4} maxDistance={10} minPolarAngle={Math.PI/6} maxPolarAngle={Math.PI/2} target={[0,0,0]}/>
              </Canvas>
            </div>
          </Suspense>
          <p style={{marginTop:10,textAlign:'center',color:'var(--ink3)',fontSize:14,fontWeight:700}}>
            {closed?`${Math.round(progress*100)}% complete · click switch to reset`:'Drag to rotate · click the switch to start'}
          </p>
        </div>

        {/* Misconceptions — inline after the diagram */}
        <div style={{display:'flex',flexDirection:'column',gap:0,marginTop:32,borderTop:'1px solid var(--border)'}}>
          {[
            {label:'The impossible electron',body:'Electrons leave the zinc anode and travel through the external wire to the copper cathode — that is the only route. In solution, charge is carried by ions. The salt bridge carries ions between beakers to maintain charge balance, not electrons.'},
            {label:'The missing salt bridge',body:'Without the salt bridge: Zn²⁺ accumulates in the left beaker, building positive charge. SO₄²⁻ is left behind in the right beaker, building negative charge. Within seconds a back-EMF exactly cancels the cell voltage. The reaction stops.'},
            {label:'Conventional current vs electron flow',body:'By historical convention (before electrons were discovered), current flows from (+) to (−) through the external circuit. Electrons flow the other way: anode (−) → cathode (+). Both descriptions are correct; they describe different things.'},
            {label:'Where voltage comes from',body:'Zinc holds its electrons more weakly than copper. That difference exists before anything is connected. E°(Cu²⁺/Cu) = +0.34 V, E°(Zn²⁺/Zn) = −0.76 V. The wire doesn\'t create the voltage — it provides a path for electrons to move down an energy gradient that already exists.'},
          ].map(({label,body})=>(
            <div key={label} style={{padding:'24px 0',borderBottom:'1px solid var(--border)'}}>
              <p style={{color:'var(--ink3)',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.04em',fontSize:13,marginBottom:10}}>{label}</p>
              <p>{body}</p>
            </div>
          ))}
        </div>
      </section>

      {DIVIDER}

      {/* ── Nernst Equation ── */}
      <section style={{marginBottom:80}}>
        <h2 style={{fontSize:'clamp(20px,4vw,26px)',fontWeight:700,color:'var(--ink)',marginBottom:16}}>The Nernst Equation</h2>
        <p>Cell voltage depends on concentration. This follows from thermodynamics in three lines.</p>

        <div style={{borderTop:'1px solid var(--border)',marginTop:28}}>
          {[
            {label:'Gibbs free energy',math:'ΔG = ΔG° + RT ln Q',note:'Spontaneity depends on how far the system is from equilibrium — captured by the reaction quotient Q.'},
            {label:'Link to voltage',math:'ΔG = −nFE',note:'Electrical work equals charge times voltage. n electrons × Faraday constant F × cell potential E.'},
            {label:'Combine and simplify',math:'E = E° − (RT / nF) ln Q',note:'Substitute and rearrange. At 25 °C, RT/F ≈ 0.0257 V, so the log₁₀ form uses 0.0592/n.'},
          ].map(({label,math,note},i)=>(
            <div key={i} style={{padding:'28px 0',borderBottom:'1px solid var(--border)'}}>
              <p style={{color:'var(--ink3)',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.06em',fontSize:13,marginBottom:16}}>{label}</p>
              <div className="math" style={{fontSize:'clamp(20px,4vw,28px)',lineHeight:1.6,color:'var(--ink)',marginBottom:16}}>{math}</div>
              <p>{note}</p>
            </div>
          ))}
        </div>

        <div style={{padding:'28px 0',borderBottom:'1px solid var(--border)'}}>
          <p style={{color:'var(--orange)',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.06em',fontSize:13,marginBottom:16}}>Daniell cell · n = 2 · E° = 1.10 V</p>
          <div className="math" style={{fontSize:'clamp(18px,3.5vw,24px)',lineHeight:1.9,color:'var(--ink)'}}>
            E = 1.10 − (0.0592/2) × log₁₀([Zn²⁺] / [Cu²⁺])
          </div>
          <p style={{marginTop:16}}>Raising [Cu²⁺] or lowering [Zn²⁺] makes Q smaller — less is subtracted from E°, and cell voltage rises above 1.10 V.</p>
        </div>

        {/* Nernst simulator inline */}
        <div style={{marginTop:40}}>
          <p style={{color:'var(--ink3)',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.06em',fontSize:13,marginBottom:20}}>Simulator — drag to change concentrations</p>
          <p style={{marginBottom:24}}><strong style={{color:'var(--ink)'}}>Challenge: reach exactly {TARGET_VOLTAGE} V.</strong></p>

          <div style={{textAlign:'center',paddingBottom:28,borderBottom:'1px solid var(--border)'}}>
            <div className="math" style={{fontSize:'clamp(40px,10vw,72px)',fontWeight:700,lineHeight:1,color:hit?'var(--green)':'var(--ink)',transition:'color 0.3s'}}>
              {E.toFixed(3)}<span style={{fontSize:'0.4em',color:'var(--ink3)',marginLeft:8}}>V</span>
            </div>
            <p style={{marginTop:8,fontSize:14,fontWeight:700}}>{hit?'✓ Target reached':`Target: ${TARGET_VOLTAGE} V`}</p>
          </div>

          <div style={{marginTop:28}}>
            {[{label:'[Zn²⁺]',val:zn,set:setZn,color:'var(--indigo)'},{label:'[Cu²⁺]',val:cu,set:setCu,color:'var(--teal)'}].map(({label,val,set,color})=>(
              <div key={label} style={{marginBottom:24}}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}>
                  <span className="math" style={{fontWeight:700,color}}>{label}</span>
                  <span className="math" style={{color:'var(--ink2)',fontVariantNumeric:'tabular-nums'}}>{val.toFixed(2)} M</span>
                </div>
                <input type="range" min={0.01} max={2.00} step={0.01} value={val} onChange={e=>set(parseFloat(e.target.value))} style={{accentColor:color}}/>
                <div style={{display:'flex',justifyContent:'space-between',fontSize:13,color:'var(--ink3)',marginTop:4}}><span>0.01 M</span><span>2.00 M</span></div>
              </div>
            ))}
          </div>

          <div style={{paddingTop:20,borderTop:'1px solid var(--border)'}}>
            <div className="math" style={{fontSize:'clamp(14px,2.5vw,18px)',lineHeight:2,color:'var(--ink)'}}>
              E = 1.10 − (0.0592/2) × log₁₀({zn.toFixed(2)}/{cu.toFixed(2)})
            </div>
            <div className="math" style={{fontSize:'clamp(14px,2.5vw,18px)',lineHeight:2,color:'var(--ink)'}}>
              = 1.10 − {corr.toFixed(4)} = <strong style={{color:hit?'var(--green)':'var(--ink)'}}>{E.toFixed(4)} V</strong>
            </div>
            <p style={{marginTop:12,color:hit?'var(--green)':'var(--ink2)'}}>
              {hit?'Correct. Lowering Q makes log₁₀(Q) negative — the subtracted correction shrinks, raising E above E°.':`Q = ${Q.toFixed(4)} · Target Q ≈ ${targetQ().toFixed(4)}`}
            </p>
          </div>
        </div>
      </section>

      {DIVIDER}

      {/* ── Li Intercalation ── */}
      <section style={{marginBottom:80}}>
        <h2 style={{fontSize:'clamp(20px,4vw,26px)',fontWeight:700,color:'var(--ink)',marginBottom:16}}>Lithium Intercalation</h2>
        <p>In a Li-ion cell, lithium ions shuttle between two host lattices — never forming metallic lithium. Drag the slider or click Charge to watch Li⁺ move between graphite layers and the LiCoO₂ cathode.</p>

        <div style={{marginTop:28}}>
          <Suspense fallback={<div style={{height:380,background:'var(--bg)',borderRadius:12,display:'flex',alignItems:'center',justifyContent:'center',color:'var(--ink3)'}}>Loading…</div>}>
            <div style={{height:380,borderRadius:12,overflow:'hidden',background:'#f9f8f5'}}>
              <Canvas shadows camera={{position:[0,1,7],fov:44}} gl={{antialias:true,toneMapping:THREE.ACESFilmicToneMapping,toneMappingExposure:1.15}}>
                <LiScene soc={soc} charging={dir==='charge'}/>
                <OrbitControls enablePan={false} minDistance={4} maxDistance={12} minPolarAngle={Math.PI/8} maxPolarAngle={Math.PI/1.8} target={[0,0,0]}/>
              </Canvas>
            </div>
          </Suspense>
          <p style={{marginTop:10,textAlign:'center',color:'var(--ink3)',fontSize:14,fontWeight:700}}>{stage.label} · {V.toFixed(3)} V · {Math.round(soc*100)}% · drag to rotate</p>
        </div>

        <div style={{paddingTop:20,borderTop:'1px solid var(--border)',marginTop:28}}>
          <div style={{display:'flex',justifyContent:'space-between',marginBottom:10}}>
            <span style={{fontWeight:700}}>State of charge</span>
            <span className="math" style={{color:'var(--ink2)',fontVariantNumeric:'tabular-nums'}}>{Math.round(soc*100)} %</span>
          </div>
          <input type="range" min={0} max={1} step={0.005} value={soc} onChange={e=>{const v=parseFloat(e.target.value);setDir(v>soc?'charge':'discharge');setSoc(v)}}/>
          <div style={{display:'flex',justifyContent:'space-between',fontSize:13,color:'var(--ink3)',marginTop:6,marginBottom:20}}><span>0% discharged</span><span>100% charged</span></div>
          <div style={{display:'flex',gap:24}}>
            <button disabled={animating||soc>=1} onClick={()=>startAnim('charge')} style={{fontWeight:700,color:animating||soc>=1?'var(--ink3)':'var(--ink)',opacity:animating||soc>=1?0.4:1}}>Animate charge →</button>
            <button disabled={animating||soc<=0} onClick={()=>startAnim('discharge')} style={{fontWeight:700,color:animating||soc<=0?'var(--ink3)':'var(--ink)',opacity:animating||soc<=0?0.4:1}}>← Discharge</button>
          </div>
        </div>

        <div style={{paddingTop:28,borderTop:'1px solid var(--border)',marginTop:28}}>
          <p style={{color:'var(--ink3)',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.06em',fontSize:13,marginBottom:20}}>OCV curve</p>
          <OcvChart soc={soc}/>
        </div>

        <div style={{borderTop:'1px solid var(--border)',marginTop:28}}>
          <p style={{color:'var(--ink3)',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.06em',fontSize:13,paddingTop:28,marginBottom:4}}>Why graphite fills in stages</p>
          {[
            {n:4,soc:'0–15%',v:'~0.20 V',d:'Li fills every 4th graphene gallery. Long-range electrostatic repulsion keeps layers apart.'},
            {n:3,soc:'15–30%',v:'~0.17 V',d:'Density increases. Li occupies every 3rd gallery — a new ordered phase forms.'},
            {n:2,soc:'30–65%',v:'~0.12 V',d:'Most stable phase. Li in every 2nd gallery, producing the longest flat plateau.'},
            {n:1,soc:'65–100%',v:'~0.07 V',d:'All galleries filling. Maximum capacity is LiC₆.'},
          ].map(({n,soc,v,d})=>(
            <div key={n} style={{display:'flex',gap:20,alignItems:'baseline',padding:'18px 0',borderBottom:'1px solid var(--border)'}}>
              <span className="math" style={{fontSize:20,fontWeight:700,minWidth:24,color:'var(--ink)'}}>S{n}</span>
              <div><p style={{fontWeight:700,color:'var(--ink)',marginBottom:4}}>{soc} · plateau {v}</p><p>{d}</p></div>
            </div>
          ))}
        </div>
      </section>

      {DIVIDER}

      {/* ── Quiz ── */}
      <section>
        <QuizSection/>
      </section>

    </div>
  )
}
