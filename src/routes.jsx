import { lazy } from 'react'
import Layout   from './Layout'
import Home     from './pages/Home'
import About    from './pages/About'
import Projects from './pages/Projects'
import Research from './pages/Research'
import Contact  from './pages/Contact'

const ElectrochemModule = lazy(() => import('./modules/electrochemistry/ElectrochemModule'))
const EquilibriumModule = lazy(() => import('./modules/equilibrium/EquilibriumModule'))
const IBPModule         = lazy(() => import('./modules/ibp/IBPModule'))
const ComplexModule     = lazy(() => import('./modules/complex/ComplexModule'))
const BlenderModule     = lazy(() => import('./modules/blender/BlenderModule'))

// Every path listed here also needs an entry in scripts/generate-sitemap.js
// and, ideally, a useSEO() call inside its page component for title/description.
export const routes = [
  {
    path: '/',
    element: <Layout/>,
    children: [
      { index: true,                       element: <Home/> },
      { path: 'about',                     element: <About/> },
      { path: 'projects',                  element: <Projects/> },
      { path: 'projects/electrochemistry', element: <ElectrochemModule/> },
      { path: 'projects/equilibrium',      element: <EquilibriumModule/> },
      { path: 'projects/ibp',              element: <IBPModule/> },
      { path: 'projects/complex',          element: <ComplexModule/> },
      { path: 'projects/blender',          element: <BlenderModule/> },
      { path: 'research',                  element: <Research/> },
      { path: 'contact',                   element: <Contact/> },
    ],
  },
]
