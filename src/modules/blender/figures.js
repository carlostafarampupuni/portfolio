// Add a new figure by dropping the image in /public/blender/ and adding one
// object here. That's the whole workflow — nothing else needs to change.
//
//   id        unique, kebab-case, also used as the React key
//   src       path under /public, so '/blender/whatever.png'
//   title     shown on hover and in the lightbox caption
//   category  groups it under a filter pill (reuse an existing string to
//             join an existing category, or write a new one to create one)
//   caption   optional, longer description shown only in the lightbox

export const FIGURES = [
  {
    id: 'vortex-mixing',
    src: '/blender/vortex-mixing.png',
    title: 'Vortex Mixing',
    category: 'Methods & Equipment',
    caption: 'Slurry homogenization before casting.',
  },
  {
    id: 'sample-measuring',
    src: '/blender/sample-measuring.png',
    title: 'Mass Measurement',
    category: 'Methods & Equipment',
    caption: 'Precision weighing of active material.',
  },
  {
    id: 'ball-milling',
    src: '/blender/ball-milling.png',
    title: 'Ball Milling',
    category: 'Methods & Equipment',
    caption: 'Mechanical mixing and particle size reduction.',
  },
  {
    id: 'roll-pressing',
    src: '/blender/roll-pressing.png',
    title: 'Roll Pressing',
    category: 'Methods & Equipment',
    caption: 'Calendering the cast electrode to target density.',
  },
  {
    id: 'coin-cell-exploded-stack',
    src: '/blender/coin-cell-exploded-stack.png',
    title: 'Coin Cell Assembly',
    category: 'Methods & Equipment',
    caption: 'Exploded-view stack of a CR2032 coin cell build.',
  },
  {
    id: 'doctor-blade-casting',
    src: '/blender/doctor-blade-casting.png',
    title: 'Doctor Blade Casting',
    category: 'Methods & Equipment',
    caption: 'Slurry cast to a controlled wet-film thickness.',
  },
  {
    id: 'vacuum-drying-oven',
    src: '/blender/vacuum-drying-oven.png',
    title: 'Vacuum Drying',
    category: 'Methods & Equipment',
    caption: 'Solvent removal under vacuum prior to cell assembly.',
  },
  {
    id: 'sei-failure-dendrites',
    src: '/blender/sei-failure-dendrites.png',
    title: 'Unstable SEI — Dendrite Growth',
    category: 'SEI & Interface Chemistry',
    caption: 'PF6− reduction forms a patchy LiF/LiOR SEI that fails to suppress dendrite growth on Li metal.',
  },
  {
    id: 'sei-suppressed-dendrites',
    src: '/blender/sei-suppressed-dendrites.png',
    title: 'Engineered SEI — Suppressed Dendrites',
    category: 'SEI & Interface Chemistry',
    caption: 'A LiNO3-derived Li3N / P–O bilayer SEI suppresses dendrite growth on Li metal.',
  },
  {
    id: 'anode-architecture',
    src: '/blender/anode-architecture.png',
    title: 'Anode Architecture',
    category: 'Electrode Architecture',
    caption: 'µ-cavity electrode geometry and a Si-alloy/SSE composite anode system.',
  },
]
