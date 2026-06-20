import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { ThemeProvider } from './components/ThemeContext'
import Nav     from './components/Nav'
import Home     from './pages/Home'
import About    from './pages/About'
import Projects from './pages/Projects'
import Research from './pages/Research'
import Contact  from './pages/Contact'
import EquilibriumModule from "./modules/equilibrium/EquilibriumModule.jsx";


const ElectrochemModule = lazy(() => import('./modules/electrochemistry/ElectrochemModule'))
const IBPModule         = lazy(() => import('./modules/ibp/IBPModule'))
const ComplexModule     = lazy(() => import('./modules/complex/ComplexModule'))
const BlenderModule = lazy(() => import('./modules/blender/BlenderModule'))


function Loading() {
  return (
    <div style={{ height:'80vh', display:'flex', alignItems:'center',
      justifyContent:'center', color:'var(--ink3)', fontSize:14, fontWeight:500 }}>
      Loading…
    </div>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Nav/>
        <Suspense fallback={<Loading/>}>
          <Routes>
            <Route path="/"                          element={<Home/>}/>
            <Route path="/about"                     element={<About/>}/>
            <Route path="/projects"                  element={<Projects/>}/>
            <Route path="/projects/electrochemistry" element={<ElectrochemModule/>}/>
            <Route path="/projects/equilibrium" element={<EquilibriumModule/>}/>
            <Route path="/projects/ibp"              element={<IBPModule/>}/>
            <Route path="/projects/complex"           element={<ComplexModule/>}/>
            <Route path="/projects/blender" element={<BlenderModule/>}/>
            <Route path="/research"                  element={<Research/>}/>
            <Route path="/contact"                   element={<Contact/>}/>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ThemeProvider>
  )
}
