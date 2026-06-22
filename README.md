# Carlos Tafara Mpupuni — Learning Design Portfolio

Interactive learning modules built with React, Three.js, and Vite — now statically
pre-rendered with `vite-react-ssg` so search engines can actually see the content.

## Local development

```bash
npm install
npm run dev
```

Open the local URL it prints (usually `http://localhost:5173`). This is normal
client-side React — fast to iterate on, behaves exactly like before.

## Building for production (this is what deploys)

```bash
npm run build
npm run preview   # optional: serve the production build locally to sanity-check it
```

`npm run build` now does two things:
1. `vite-react-ssg build` — visits every route in `src/routes.jsx` in Node and
   writes real, complete HTML for each page into `dist/` (e.g. `dist/about/index.html`,
   `dist/research/index.html`). This is the fix for the site being invisible to Google —
   previously `dist/index.html` was just an empty `<div id="root">` for every route.
2. `node scripts/generate-sitemap.js` — writes `dist/sitemap.xml` listing every page.

**How to check it actually worked:** after `npm run build`, open
`dist/about/index.html` (or any page) in a plain text editor. You should see your
actual bio text sitting in the HTML — not just a `<div id="root"></div>`. If you
see real text, the fix worked.

## Deploy to Vercel (free)

1. Push this repo to GitHub
2. Go to vercel.com → New Project → Import your GitHub repo
3. Framework: Vite (auto-detected) — Vercel will run `npm run build` automatically,
   which now includes the static-generation step above. No extra config needed.
4. Click Deploy — done

## After deploying: tell Google the site exists

This is the step that actually gets you ranking for your own name — building
the site correctly only fixes half the problem.

1. Go to [Google Search Console](https://search.google.com/search-console),
   add your property (`carlosmpupuni.com`), verify ownership (Vercel/your
   registrar will show you how — usually a DNS TXT record).
2. Under "Sitemaps", submit `https://www.carlosmpupuni.com/sitemap.xml`.
3. Use "URL Inspection" on your homepage and click "Request Indexing".
4. Add `https://www.carlosmpupuni.com` as a link in your LinkedIn "Featured"
   section, GitHub profile, and Google Scholar profile — these are the
   backlinks that help Google trust the site is really yours.

Indexing can take anywhere from a few days to a few weeks. Search Console will
show you exactly which pages are indexed and any errors it finds.

## Custom domain (optional, ~$10–15/yr)

1. Buy domain on Namecheap or Cloudflare Registrar (cheapest)
2. In Vercel dashboard → your project → Settings → Domains → add your domain
3. Copy the DNS records Vercel gives you into your registrar's DNS settings
4. Vercel auto-provisions an SSL certificate (free)

## Adding your real details

- **About page:** `src/pages/About.jsx` — update timeline entries and personal note
- **Research page:** `src/pages/Research.jsx` — replace placeholder titles with real paper titles, DOIs, patent numbers
- **Contact page:** `src/pages/Contact.jsx` — replace placeholder email/GitHub/LinkedIn URLs
- **Your name in Nav:** `src/components/Nav.jsx` line 17
- **Page titles/descriptions (SEO):** each page calls `useSEO(title, description, path)`
  near the top of its component — edit the two text arguments to change what shows up
  in Google search results and link previews (Slack, iMessage, etc.)
- **Sitemap:** if you add a brand-new page/route, also add it to
  `scripts/generate-sitemap.js` so it's included in `sitemap.xml`

## Project structure

```
index.html                       ← base HTML shell (fallback title/meta; SSG fills in the rest per-page)
scripts/
└── generate-sitemap.js          ← writes dist/sitemap.xml after build
public/
└── robots.txt                   ← tells crawlers where the sitemap is
src/
├── routes.jsx                   ← the route table — single source of truth for vite-react-ssg
├── Layout.jsx                   ← shared shell: theme provider, nav, suspense fallback
├── main.jsx                     ← vite-react-ssg entry point (replaces old ReactDOM.createRoot)
├── theme.css                    ← shared design tokens (fonts, colours, spacing)
├── index.css                    ← body-level layout
├── components/
│   ├── Nav.jsx                  ← sticky top navigation
│   ├── ThemeContext.jsx         ← dark/light mode (SSR-safe)
│   ├── useReveal.js             ← scroll-reveal animation hook
│   └── useSEO.js                ← sets per-page <title>/<meta description> — used by every page/module
├── pages/
│   ├── Home.jsx                 ← landing page with module grid
│   ├── About.jsx                ← biography and timeline
│   ├── Projects.jsx             ← index of all modules
│   ├── Research.jsx             ← publications and patents
│   └── Contact.jsx              ← links and location
└── modules/                     ← each is a single self-contained, one-page-scroll component
    ├── electrochemistry/        ← Daniell cell (3D), Nernst, Li intercalation
    │   ├── ElectrochemModule.jsx
    │   └── nernst.js
    ├── equilibrium/              ← Le Chatelier, ICE tables, Kp vs Kc
    │   └── EquilibriumModule.jsx
    ├── ibp/                      ← Integration by Parts — geometric proof, LIATE, cyclic integrals
    │   └── IBPModule.jsx
    ├── complex/                  ← Complex numbers — Argand plane, polar form, De Moivre
    │   └── ComplexModule.jsx
    └── blender/                  ← Battery-cell schematic renders
        ├── BlenderModule.jsx
        ├── Lightbox.jsx
        └── figures.js
```

## Adding a blog later (SQLite)

You mentioned wanting a blog backed by SQLite down the line. Worth knowing now:
SQLite can't run directly in the browser the way this site currently works (everything
here is static files with no server). A blog with a real database needs a small backend
API (e.g. a few routes on a Node/Express server, or a serverless function on Vercel) that
the static site talks to. That's a separate, self-contained piece of work — happy to help
with it whenever you're ready; just say the word.

# Carlos Tafara Mpupuni — Learning Portfolio: Build Reference

This file documents how the React portfolio app and its interactive learning
modules are built, so a new module can be requested by handing over **this
file alone** instead of the whole project zip.

---

## 1. Stack

- **React 18** + **react-router-dom v6** (client-side routes)
- **Vite** as the build tool
- **three.js** + **@react-three/fiber** + **@react-three/drei** — only used
  for modules that need a real 3D scene (currently: Electrochemistry)
- Plain **inline style objects** everywhere — no CSS framework, no
  styled-components, no Tailwind. Every visual choice is a JS object literal
  on the element (`style={{ ... }}`).
- A small set of **CSS custom properties** (defined once, globally) drive all
  colour/spacing decisions. Components never hardcode hex colours for
  ink/background — only for chemistry-specific accent colours where a fixed
  hue is meaningful (e.g. zinc indigo, copper teal).

---

## 2. Design language (do not deviate without being asked)

### 2.1 CSS variables in scope inside a module

These are assumed to exist on `:root` / `[data-theme]` already, from the
parent app's theme file. A module never redefines them — it only consumes
them.

| Variable | Meaning |
|---|---|
| `--bg` | Page background |
| `--bg-alt` | Secondary section background |
| `--ink` | Primary text colour |
| `--ink2` | Secondary text colour |
| `--ink3` | Tertiary / label / disabled text colour |
| `--border` | Hairline border colour |
| `--blue` | Primary accent / links / primary buttons |
| `--orange` | Module accent — used for "result" callouts, warnings |
| `--teal` | Module accent — used for one side of a two-colour contrast |
| `--indigo` | Module accent — used for the other side of a two-colour contrast |
| `--green` | Success / correct-answer colour |
| `--mod-bg` | Background specifically behind 3D canvases / diagram panels |
| `--mod-surface` | Background for quiz option buttons (idle state) |
| `--mod-ink` | Ink colour inside callout boxes (question boxes etc.) |
| `--font` | The global sans-serif font stack |

`.math` is a global class that switches to a serif font for mathematical
notation (`fontFamily: 'Georgia, serif'` equivalent) — always wrap inline
maths in `<span className="math">…</span>`.

### 2.2 Typographic & spacing conventions

- Page title: plain `<h1>` (styled by the global stylesheet, not inline).
- Section headers inside a module: inline style,
  `fontSize:'clamp(20px,3.5vw,26px)', fontWeight:700, color:'var(--ink)'`.
- Eyebrow / label text (e.g. "CHEMISTRY", "Question 3"):
  `fontSize:13, fontWeight:700, letterSpacing:'0.06em', textTransform:'uppercase', color:'var(--ink3)'`.
- Body paragraphs: no inline style needed — the global stylesheet handles
  `<p>` colour/line-height. Only override when a paragraph sits inside a
  coloured box.
- Section dividers: a top border on the **next** block,
  `borderTop:'1px solid var(--border)'`, with `paddingTop:8` or similar —
  never a literal `<hr>`.
- Standard vertical rhythm: the page is one big
  `<div style={{display:'flex', flexDirection:'column', gap:40}}>` and each
  "section" is one child of that flex column. 40px gap between major
  sections is the house style.

### 2.3 Callout box patterns

Three recurring box types, all built the same way (border-radius 12,
1px border, tinted background using `color-mix`):

**Question box** (posed before an explanation, Brilliant.org-style):
```jsx
<div style={{
  background: 'color-mix(in srgb, var(--blue) 8%, var(--bg))',
  border: '1px solid color-mix(in srgb, var(--blue) 25%, transparent)',
  borderRadius: 12, padding: '20px 24px',
}}>
  <p style={{ fontSize: 15, color: 'var(--mod-ink)', lineHeight: 1.7, margin: 0 }}>
    <strong>Before you read on:</strong> ...
  </p>
</div>
```

**Wrong-idea box** (names the misconception honestly before correcting it):
```jsx
<div style={{
  border: '1px solid color-mix(in srgb, #ef4444 30%, transparent)',
  background: 'color-mix(in srgb, #ef4444 6%, var(--bg))',
  borderRadius: 12, padding: '16px 20px',
}}>
  <p style={{ fontSize: 12, fontWeight: 700, color: '#ef4444', marginBottom: 8,
    textTransform: 'uppercase', letterSpacing: '0.06em' }}>
    Common mistake
  </p>
  <p style={{ fontSize: 15, color: 'var(--ink2)', margin: 0, lineHeight: 1.65 }}>
    "..." — why it's wrong, in plain language.
  </p>
</div>
```

**Key/derivation block** (a labelled step in a derivation):
```jsx
<div style={{ padding:'24px 0', borderBottom:'1px solid var(--border)' }}>
  <p style={{ color:'var(--ink3)', fontWeight:700, textTransform:'uppercase',
    letterSpacing:'0.06em', fontSize:13, marginBottom:14 }}>{label}</p>
  <div className="math" style={{ fontSize:'clamp(18px,3.5vw,24px)', lineHeight:1.6,
    color:'var(--ink)', marginBottom:12 }}>{math}</div>
  <p>{note}</p>
</div>
```

### 2.4 Buttons

- Primary (filled): `background:'var(--ink)', color:'#fff', padding:'12px 28px', borderRadius:100, fontWeight:700, border:'none', cursor:'pointer'`
- Ghost/back link: `color:'var(--ink3)', fontWeight:700, background:'none', border:'none', cursor:'pointer'`
- Buttons never use a CSS framework class — always inline style, always
  `borderRadius:100` (pill shape) for filled buttons.

---

## 3. App shell (outside the scope of "just give me the module")

```
src/
  routes.jsx               — route table (single source of truth for the router AND the static build)
  Layout.jsx                — shared shell: theme provider, nav, suspense fallback
  main.jsx                  — vite-react-ssg entry point
  theme.css / index.css     — global CSS variables, typography classes
  components/
    Nav.jsx                — top nav, light/dark toggle
    ThemeContext.jsx        — dark-mode-by-default theme provider
    useReveal.js             — scroll-reveal intersection-observer hook
    useSEO.js                 — per-page <title>/<meta description>, required in every module
  pages/
    Home.jsx, About.jsx, Projects.jsx, Research.jsx,
    Gallery.jsx, Blog.jsx, BlogPost.jsx, Contact.jsx
  modules/
    electrochemistry/
      ElectrochemModule.jsx   — the whole module, single file
      nernst.js               — pure-math helper functions (no React)
    ibp/
      IBPModule.jsx
    equilibrium/
      EquilibriumModule.jsx
    complex/
      ComplexModule.jsx
```

Routes for modules are registered in `src/routes.jsx` as lazy-loaded routes:

```jsx
const ElectrochemModule = lazy(() => import('./modules/electrochemistry/ElectrochemModule'))
...
{ path: 'projects/electrochemistry', element: <ElectrochemModule/> }
```

The site is statically pre-rendered (`vite-react-ssg`) so search engines can
read real content instead of an empty `<div id="root">`. This means
**every new route needs to be added in two places**, or it won't be
crawlable/indexed even though it'll still work fine for visitors clicking
around the live site:

1. `src/routes.jsx` — so the page renders at all (required for it to work)
2. `scripts/generate-sitemap.js` — so `sitemap.xml` lists it (required so
   Google discovers it; the page still works without this, it's just
   slower for search engines to find)

**This reference file is only about what goes inside one `modules/<name>/`
folder** — the page shell, nav, and routing don't need to change to add a
new module; only `routes.jsx`'s route table, `scripts/generate-sitemap.js`,
and `Projects.jsx`'s card list need one new entry each, plus the
`useSEO()` call inside the module itself (see §4).

---

## 4. The module contract — **single scroll, one diagram, quiz at the bottom**

This is the current, locked-in format. Every module is **one page, one
continuous scroll** — there is no internal pagination, no "next lesson"
button, no step-by-step wizard between sections. The whole module is one
component exported as default, structured like this:

```jsx
import { useSEO } from '../../components/useSEO'

export default function SomeModule() {
  // Required: sets the <title> and meta description that Google/link
  // previews see for this route. Without this call the page falls back
  // to the generic site-wide title, which hurts SEO for that module.
  useSEO(
    'Module Title',
    'One-sentence description of what the module teaches, ~150-160 chars.',
    '/projects/route-name'
  )
  return (
    <div style={{ maxWidth:640, margin:'0 auto', padding:'clamp(24px,5vw,56px) 16px 80px' }}>

      <Link to="/projects" style={{ color:'var(--ink3)', fontWeight:700, fontSize:14,
        textDecoration:'none', display:'inline-block', marginBottom:32 }}>
        ← Projects
      </Link>

      <div style={{ display:'flex', flexDirection:'column', gap:40 }}>

        {/* 1. Title block */}
        <div>
          <p style={{...eyebrow style...}}>Chemistry | Mathematics</p>
          <h1>Module Title</h1>
          <p style={{ marginTop:16 }}>One or two sentences framing the question.</p>
        </div>

        {/* 2. (Optional) a question box posed before any explanation */}

        {/* 3. (Optional) a wrong-idea box naming the misconception */}

        {/* 4. THE ONE DIAGRAM — see §5 below */}


        {/* 5. Explanatory text / derivations / worked examples,
               as many static sections as needed, each separated
               by a top border + 40px gap */}

        {/* 6. Quiz — see §6 below, always the LAST section */}

      </div>
    </div>
  )
}
```

Key rules:

- **Exactly one interactive diagram per module.** Everything else on the
  page is static text, derivations, tables, or worked examples — no second
  slider widget, no second canvas, no second draggable thing. If a previous
  version of a module had multiple small interactive widgets (e.g. a
  Nernst-equation slider on its own "page"), fold that interactivity into
  the single diagram instead (e.g. add the sliders underneath the one 3D
  scene, so the voltmeter inside the scene responds to them) — don't keep
  them as a separate floating widget elsewhere on the page.
- **No "Next lesson" navigation inside the module.** The whole thing is
  read top to bottom by scrolling. The only navigation element is the
  `← Projects` back-link at the top.
- **The quiz is always the final section**, introduced with an `<h2>Quiz</h2>`
  and using the shared quiz pattern in §6.
- A module file may define small private subcomponents above the default
  export (the diagram, the quiz) — these stay in the same file rather than
  being split into separate files, unless the file becomes unreasonably
  long (>500 lines), in which case split out the diagram only into a
  sibling file and import it.

---

## 5. The "one diagram" pattern

The diagram is always:

- An `<svg viewBox="0 0 W H">` (for 2D) **or** an `<r3f Canvas>` (for 3D,
  only when genuinely 3D content adds value — currently only
  Electrochemistry, because a beaker/electrode/ion scene benefits from
  depth and orbit controls).
- **Self-contained drag/click interactivity lives inside the SVG/Canvas
  itself** — i.e. the person interacts directly with the picture (drag a
  point on a curve, drag a piston, click a switch, drag a vector tip),
  never via a separate `<input type="range">` floating below an inert
  picture, unless that range input is the most natural metaphor (e.g.
  state-of-charge slider) AND it's wired to live-update something rendered
  inside the same diagram block.
- Wrapped in a single function component named `<Thing>Diagram()`
  (e.g. `AreaProofDiagram`, `EquilibriumDiagram`, `ArgandDiagram`,
  `DaniellCellDiagram`), called once from the module body.
- Followed immediately by a small live-readout strip
  (`borderTop:'1px solid var(--border)'`, centered, small font, showing
  the current numeric state of the diagram) and/or a one-line interaction
  hint in `fontSize:13/14, color:'var(--ink3)'`.

### 5.1 SVG drag pattern (copy this exactly for new 2D diagrams)

```jsx
function SomeDiagram() {
  const svgRef = useRef()
  const dragging = useRef(false)
  const [state, setState] = useState(initialValue)

  function handleMove(clientX) {
    if (!dragging.current) return
    const r = svgRef.current.getBoundingClientRect()
    const frac = (clientX - r.left) / r.width
    setState(/* map frac to your domain, clamp it */)
  }

  return (
    <svg ref={svgRef} width="100%" viewBox="0 0 W H"
      style={{ display:'block', cursor:'ew-resize', userSelect:'none', touchAction:'none' }}
      onMouseDown={() => dragging.current = true}
      onMouseMove={e => handleMove(e.clientX)}
      onMouseUp={() => dragging.current = false}
      onMouseLeave={() => dragging.current = false}
      onTouchStart={() => dragging.current = true}
      onTouchMove={e => { e.preventDefault(); handleMove(e.touches[0].clientX) }}
      onTouchEnd={() => dragging.current = false}>
      {/* shapes driven by `state` */}
    </svg>
  )
}
```

For diagrams with **multiple drag targets** (e.g. a piston AND a toggle
button in the same SVG), gate the drag start with a `data-drag="true"`
attribute on only the draggable element(s), and check
`e.target.dataset.drag` in the `onMouseDown`/`onTouchStart` handler so
clicking a button elsewhere in the same SVG doesn't start a drag.

### 5.2 3D (react-three-fiber) pattern

Only reach for this when the content is genuinely spatial (a physical
apparatus, a crystal lattice, a 3D field). Structure:

```jsx
function SceneDiagram() {
  const [stateA, setStateA] = useState(...)
  return (
    <Suspense fallback={<LoadingBox/>}>
      <div style={{ height:420, borderRadius:12, overflow:'hidden', background:'var(--mod-bg)' }}>
        <Canvas shadows camera={{ position:[0,0.5,6.8], fov:42 }}
          gl={{ antialias:true, toneMapping:THREE.ACESFilmicToneMapping, toneMappingExposure:1.1 }}>
          <Scene .../>
          <OrbitControls enablePan={false} minDistance={4} maxDistance={10}
            minPolarAngle={Math.PI/6} maxPolarAngle={Math.PI/2} target={[0,0,0]}/>
        </Canvas>
      </div>
    </Suspense>
  )
}
```

Lighting recipe used throughout (keep consistent across modules):

```jsx
<color attach="background" args={[getComputedStyle(document.documentElement).getPropertyValue('--mod-bg').trim()||'#f9f8f5']}/>
<ambientLight intensity={0.8} color="#fffdf8"/>
<directionalLight position={[4,8,5]} intensity={1.6} castShadow color="#fffaf0"/>
<directionalLight position={[-4,3,-3]} intensity={0.5} color="#fde8d8"/>
<Environment preset="apartment"/>
```

Clickable objects inside the scene (e.g. a switch) use an invisible
larger hitbox mesh plus `onPointerOver`/`onPointerOut` to flip the
cursor, exactly like `Switch3D` in the Electrochemistry module.

---

## 6. The quiz pattern (copy this exactly for new modules)

Always a private component called `Quiz()` defined in the same file,
rendered as the final section. Data shape:

```js
const QS = [
  { q: 'Question text?',
    opts: ['Option A', 'Option B', 'Option C', 'Option D'],
    ans: 1, // index of correct option
    fb: {
      c: 'Feedback shown when correct — reinforce *why*, not just "correct".',
      w: 'Feedback shown when wrong — correct the specific misconception, restate the right reasoning.',
    } },
  // 5–6 questions per module is the house standard
]
```

Behaviour:
- Each question is answered once (`disabled` after a click).
- Clicking an option immediately reveals correct/incorrect styling on
  *all* options for that question (correct = green, the wrong one picked =
  red, everything else stays neutral) plus the feedback paragraph below.
- Once every question has been answered, a score summary
  (`score / QS.length`, big serif/math-styled number) appears **above**
  the question list (it's prepended into the same scroll, not a separate
  screen) with a short verdict string and a "Try again" button that resets
  all answers.
- Colours: correct border/background `var(--green)` / `#f0faf5`; wrong
  border/background `#dc2626` / `#fff5f5`; idle uses `var(--border)` /
  `var(--mod-surface)`.

Full component to copy verbatim and adapt the `QS` array:

```jsx
function Quiz() {
  const [answers, setAnswers] = useState(new Array(QS.length).fill(null))
  const [done,    setDone]    = useState(false)

  function answer(qi, oi) {
    if (answers[qi] !== null) return
    const next = [...answers]; next[qi] = oi; setAnswers(next)
    if (next.every(a => a !== null)) setTimeout(() => setDone(true), 600)
  }
  function reset() { setAnswers(new Array(QS.length).fill(null)); setDone(false) }
  const score = answers.filter((a,i) => a === QS[i].ans).length

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:40 }}>
      <div>
        <h2 style={{fontSize:'clamp(22px,4vw,30px)',fontWeight:700,color:'var(--ink)'}}>Quiz</h2>
        <p style={{ marginTop:12 }}>{QS.length} questions · what they cover.</p>
      </div>

      {done && (
        <div style={{display:'flex',flexDirection:'column',gap:20,padding:'24px 0',
          borderTop:'1px solid var(--border)',borderBottom:'1px solid var(--border)'}}>
          <div className="math" style={{ fontSize:'clamp(40px,8vw,56px)', fontWeight:700, color:'var(--ink)', lineHeight:1 }}>
            {score}<span style={{ fontSize:'0.5em', color:'var(--ink3)' }}>/{QS.length}</span>
          </div>
          <p>{/* verdict string based on score */}</p>
          <button onClick={reset} style={{
            alignSelf:'flex-start', background:'var(--ink)', color:'#fff',
            padding:'12px 28px', borderRadius:100, fontWeight:700, border:'none', cursor:'pointer',
          }}>Try again</button>
        </div>
      )}

      <div style={{ display:'flex', flexDirection:'column', gap:40 }}>
        {QS.map((q, qi) => {
          const chosen = answers[qi]
          return (
            <div key={qi} style={{ borderTop:'1px solid var(--border)', paddingTop:28 }}>
              <p style={{ color:'var(--ink3)', fontWeight:700, fontSize:13, letterSpacing:'0.06em', textTransform:'uppercase', marginBottom:12 }}>
                Question {qi+1}
              </p>
              <p style={{ fontWeight:700, color:'var(--ink)', marginBottom:20, fontSize:17 }}>{q.q}</p>
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {q.opts.map((opt, oi) => {
                  const state = chosen===null ? 'idle' : oi===q.ans ? 'correct' : oi===chosen ? 'wrong' : 'idle'
                  return (
                    <button key={oi} disabled={chosen!==null} onClick={() => answer(qi,oi)} style={{
                      padding:'12px 16px', borderRadius:10, textAlign:'left',
                      border:`1px solid ${state==='correct'?'var(--green)':state==='wrong'?'#dc2626':'var(--border)'}`,
                      background: state==='correct'?'#f0faf5':state==='wrong'?'#fff5f5':'var(--mod-surface)',
                      color: state==='correct'?'var(--green)':state==='wrong'?'#dc2626':'var(--ink)',
                      cursor: chosen!==null ? 'default' : 'pointer',
                      fontWeight: state!=='idle' ? 700 : 400,
                      transition:'all 0.15s', fontFamily:'inherit', fontSize:15,
                    }}>
                      {state==='correct'&&'✓ '}{state==='wrong'&&'✗ '}{opt}
                    </button>
                  )
                })}
              </div>
              {chosen!==null && (
                <p style={{ marginTop:14, color: chosen===q.ans ? 'var(--green)' : '#c00', lineHeight:1.7 }}>
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
```

---

## 7. Pedagogical voice (content writing rules)

Every module follows a Brilliant.org-style "zigzag": pose a question →
name the wrong intuition honestly → show what's actually true → formalise
it → connect to a real application. Concretely:

1. **Open with a question, not a definition.** The title block's last
   paragraph and/or a question box should give the reader something to
   guess at before any explanation starts.
2. **Name the misconception in its own voice.** The wrong-idea box should
   state the wrong belief the way a student would actually say or write
   it (in quotes), not a strawman.
3. **Explain the correction in plain language first, formal notation
   second.** A sentence of intuition always precedes a block of `.math`.
4. **Derivations are shown as a sequence of small labelled steps**, each
   with: a short uppercase label, the math itself in a `.math` block, and
   one sentence of plain-language justification underneath. (See §2.3
   "Key/derivation block".)
5. **End content sections with a connection to why it matters** — a real
   device, a real industrial process, a real equation used elsewhere — not
   just "and that's the formula."
6. Keep prose dense but short. Paragraphs are 2–4 sentences. No filler
   ("Let's dive in!", "Pretty cool, right?").

---

## 8. How to ask for a new module

To request a new module using only this file, give:

1. **Topic + the one diagram concept.** What is the single interactive
   thing the reader manipulates? (e.g. "drag a slider that morphs a
   parabola into a hyperbola", "click atoms to build a Lewis structure")
2. **The 2–3 misconceptions** you want named-and-corrected (these become
   the wrong-idea boxes and quiz questions).
3. **Any key formulas/derivations** that should appear as labelled steps.
4. **5–6 quiz questions** (or "write the quiz yourself" — fine to delegate,
   but the correct/wrong feedback should always re-teach the concept, not
   just say "Correct!").
5. Confirmation of which kind of diagram: **SVG (2D, default)** or
   **react-three-fiber (3D)** — default to SVG unless the content is
   genuinely spatial.

Everything else — the file structure, the box styles, the quiz mechanics,
the page shell, the back-link, the colour variables — is already locked in
by this document and should be reused without re-explaining.

---

## 9. Known existing modules (for reference / consistency-checking)

| Module | Route | Diagram | # Quiz Qs |
|---|---|---|---|
| Electrochemistry | `/projects/electrochemistry` | 3D Daniell cell (click switch, drag concentration sliders, voltmeter updates live) | 6 |
| Integration by Parts | `/projects/ibp` | 2D draggable area-proof rectangle (∫u dv + ∫v du = uv) | 6 |
| Chemical Equilibrium | `/projects/equilibrium` | 2D Haber-process vessel (drag piston for pressure, click temperature toggle, composition bar updates live) | 5 |
| Complex Numbers | `/projects/complex` | 2D Argand plane (drag vector tip to rotate, click ×i button for 90° rotation) | 5 |

Each module's source lives at `src/modules/<name>/<Name>Module.jsx`
(plus an optional pure-math helper file like `nernst.js` for
Electrochemistry). All four are single files with no per-lesson
sub-pages — this was a deliberate simplification from an earlier
multi-page-per-module design.

