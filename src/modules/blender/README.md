# Blender — figure gallery module

A responsive masonry gallery + lightbox, built to match the IBP/electrochemistry
module styling (same CSS vars, same pill/fade conventions, no new dependencies).

## 1. Drop in the files

```
src/modules/blender/BlenderModule.jsx   →  src/modules/blender/
src/modules/blender/Lightbox.jsx        →  src/modules/blender/
src/modules/blender/figures.js          →  src/modules/blender/
public/blender/*.png                    →  public/blender/
```

The 10 PNGs are real crops pulled from the panel sheet you sent (auto-detected
by whitespace gaps, so they're clean — no stray edges). Treat them as
placeholders/proof-of-concept; swap in your actual exports whenever you like,
same filenames or new ones, doesn't matter.

## 2. Wire the route

In whatever file holds your `<Routes>` (looked like `App.jsx`):

```jsx
import BlenderModule from './modules/blender/BlenderModule'
// ...
<Route path="/projects/gallery" element={<BlenderModule/>} />
```

Pick whatever path you like — `/projects/gallery`, `/projects/figures`, etc.

## 3. Link it from Projects.jsx

You've already got a stub entry that's a near-perfect fit — `'Cell Schematics
(Blender)'` at `/projects/schematics`, currently `live:false`. Either point
that `to` at the route you chose above and flip it to `live:true`, or add a
fresh entry alongside it:

```js
{ to:'/projects/gallery', live:true,
  title:'Figure Gallery', meta:'Methods · mechanisms · electrode architecture',
  body:'A growing collection of renders and diagrams from the lab, built for papers and teaching.' },
```

## 4. Adding new figures going forward

Open `figures.js`. Drop the image in `public/blender/`, add one object:

```js
{
  id: 'some-new-figure',
  src: '/blender/some-new-figure.png',
  title: 'Whatever it is',
  category: 'Methods & Equipment',   // reuse a category to join it, or invent a new one
  caption: 'One line for the lightbox.',
},
```

That's it — no component code to touch. New categories automatically get
their own filter pill; the masonry grid and lightbox just pick up the new
entry.

## How it behaves

- **Masonry grid**: CSS `column-count` (1 → 2 → 3 → 4 across breakpoints), so
  tall and wide figures sit naturally without empty gaps — no JS layout
  measuring, no library.
- **Filter pills**: built from whatever categories exist in `figures.js`, so
  they stay in sync automatically as you add more.
- **Lightbox**: click any figure to open full-screen. Arrow keys, on-screen
  arrows, and swipe (mobile) all move between figures within the *currently
  filtered* set; `Esc` or tap-outside closes.
- **Scroll-reveal**: each card fades/slides in the first time it enters the
  viewport, lightly staggered — `IntersectionObserver`, unobserves itself
  once triggered so it doesn't re-fire on scroll-back.

Everything uses your existing `--ink / --ink2 / --ink3 / --border / --surface`
vars, so it should drop in without fighting your theme.
