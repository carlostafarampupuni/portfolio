import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { FIGURES } from './figures'
import Lightbox from './Lightbox'
import { useSEO } from '../../components/useSEO'

export default function BlenderModule() {
  useSEO(
    'Schematics',
    'Photorealistic 3D renders of electrochemical cell architectures — coin cell, pouch, and cylindrical formats — for publication and teaching.',
    '/projects/blender'
  )
  const categories = useMemo(
    () => ['All', ...new Set(FIGURES.map(f => f.category))],
    []
  )
  const [active, setActive]   = useState('All')
  const [openAt, setOpenAt]   = useState(null) // index into `filtered`, or null
  const gridRef               = useRef(null)

  const filtered = useMemo(
    () => active === 'All' ? FIGURES : FIGURES.filter(f => f.category === active),
    [active]
  )

  // Staggered scroll-reveal — observes whatever is currently in the grid
  useEffect(() => {
    const items = gridRef.current
      ? gridRef.current.querySelectorAll('.blender-item')
      : []
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('is-visible')
          io.unobserve(e.target)
        }
      })
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' })
    items.forEach((el, i) => {
      el.style.transitionDelay = `${(i % 6) * 45}ms`
      io.observe(el)
    })
    return () => io.disconnect()
  }, [filtered])

  function pick(cat) {
    setActive(cat)
    setOpenAt(null)
  }

  return (
    <div style={{ maxWidth: 1180, margin: '0 auto', padding: 'clamp(24px,5vw,56px) 16px 80px' }}>

      <Link to="/projects" style={{
        color: 'var(--ink3)', fontWeight: 700, fontSize: 14,
        textDecoration: 'none', display: 'inline-block', marginBottom: 32,
      }}>
        ← Projects
      </Link>

      <div style={{ marginBottom: 36 }}>
        <h1>Figure Gallery</h1>
        <p style={{ marginTop: 12, color: 'var(--ink2)' }}>
          {FIGURES.length} renders and diagrams from the lab — methods, mechanisms, and
          electrode architectures, built for papers and teaching.
        </p>
      </div>

      <div className="blender-filters">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => pick(cat)}
            className={`blender-pill${active === cat ? ' active' : ''}`}
          >
            {cat}
            {cat !== 'All' && (
              <span className="blender-pill-count">
                {FIGURES.filter(f => f.category === cat).length}
              </span>
            )}
          </button>
        ))}
      </div>

      <div ref={gridRef} className="blender-masonry">
        {filtered.map((fig, i) => (
          <button
            key={fig.id}
            className="blender-item"
            onClick={() => setOpenAt(i)}
          >
            <img src={fig.src} alt={fig.title} loading="lazy" decoding="async" />
            <span className="blender-item-overlay">
              <span className="blender-item-title">{fig.title}</span>
              <span className="blender-item-cat">{fig.category}</span>
            </span>
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <p style={{ color: 'var(--ink3)', textAlign: 'center', padding: '60px 0' }}>
          Nothing in this category yet.
        </p>
      )}

      {openAt !== null && (
        <Lightbox
          figures={filtered}
          index={openAt}
          onClose={() => setOpenAt(null)}
          onPrev={() => setOpenAt(i => (i - 1 + filtered.length) % filtered.length)}
          onNext={() => setOpenAt(i => (i + 1) % filtered.length)}
        />
      )}

      <style>{`
        .blender-filters {
          display: flex;
          gap: 8px;
          overflow-x: auto;
          padding-bottom: 4px;
          margin-bottom: 28px;
          scrollbar-width: none;
        }
        .blender-filters::-webkit-scrollbar { display: none; }

        .blender-pill {
          flex-shrink: 0;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          border-radius: 100px;
          border: 1px solid var(--border);
          background: transparent;
          color: var(--ink3);
          font-weight: 700;
          font-size: 13px;
          white-space: nowrap;
          cursor: pointer;
          transition: all 0.15s;
        }
        .blender-pill:hover { color: var(--ink2); border-color: var(--ink2); }
        .blender-pill.active {
          background: var(--ink);
          color: #fff;
          border-color: var(--ink);
        }
        .blender-pill-count {
          font-size: 11px;
          opacity: 0.65;
          font-weight: 700;
        }

        .blender-masonry {
          column-count: 1;
          column-gap: 18px;
        }
        @media (min-width: 540px)  { .blender-masonry { column-count: 2; } }
        @media (min-width: 860px)  { .blender-masonry { column-count: 3; } }
        @media (min-width: 1180px) { .blender-masonry { column-count: 4; } }

        .blender-item {
          display: block;
          width: 100%;
          break-inside: avoid;
          -webkit-column-break-inside: avoid;
          margin: 0 0 18px;
          padding: 0;
          position: relative;
          border-radius: 14px;
          overflow: hidden;
          border: 1px solid var(--border);
          background: var(--surface);
          cursor: zoom-in;
          text-align: left;
          opacity: 0;
          transform: translateY(18px);
          transition: opacity 0.5s ease, transform 0.5s ease, border-color 0.15s;
        }
        .blender-item.is-visible { opacity: 1; transform: translateY(0); }
        .blender-item:hover { border-color: var(--ink2); }
        .blender-item:focus-visible { outline: 2px solid var(--ink); outline-offset: 2px; }

        .blender-item img {
          display: block;
          width: 100%;
          height: auto;
          transition: transform 0.4s ease;
        }
        .blender-item:hover img { transform: scale(1.035); }

        .blender-item-overlay {
          position: absolute;
          left: 0; right: 0; bottom: 0;
          padding: 16px 16px 12px;
          background: linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.62) 100%);
          opacity: 0;
          transition: opacity 0.25s ease;
          display: flex;
          flex-direction: column;
        }
        .blender-item:hover .blender-item-overlay,
        .blender-item:focus-visible .blender-item-overlay { opacity: 1; }
        .blender-item-title { color: #fff; font-weight: 700; font-size: 14px; }
        .blender-item-cat {
          color: rgba(255,255,255,0.78);
          font-size: 11px; font-weight: 700;
          text-transform: uppercase; letter-spacing: 0.05em;
          margin-top: 2px;
        }

        /* Lightbox */
        .blender-lightbox {
          position: fixed; inset: 0; z-index: 1000;
          background: rgba(12,11,10,0.94);
          display: flex; align-items: center; justify-content: center;
          padding: clamp(16px, 5vw, 48px);
          animation: blenderFade 0.18s ease;
        }
        @keyframes blenderFade { from { opacity: 0; } to { opacity: 1; } }

        .blender-lb-close {
          position: absolute; top: 18px; right: 20px;
          width: 40px; height: 40px; border-radius: 100%;
          background: rgba(255,255,255,0.08);
          color: #fff; font-size: 16px;
          border: 1px solid rgba(255,255,255,0.18);
          cursor: pointer;
        }
        .blender-lb-count {
          position: absolute; top: 24px; left: 24px;
          color: rgba(255,255,255,0.6);
          font-size: 13px; font-weight: 700;
        }
        .blender-lb-nav {
          position: absolute; top: 50%; transform: translateY(-50%);
          width: 48px; height: 48px; border-radius: 100%;
          background: rgba(255,255,255,0.08);
          color: #fff; font-size: 20px;
          border: 1px solid rgba(255,255,255,0.18);
          cursor: pointer;
        }
        .blender-lb-prev { left: clamp(8px, 3vw, 28px); }
        .blender-lb-next { right: clamp(8px, 3vw, 28px); }
        @media (max-width: 560px) {
          .blender-lb-nav { width: 38px; height: 38px; font-size: 16px; }
        }

        .blender-lb-figure {
          max-width: min(92vw, 980px);
          max-height: 88vh;
          display: flex; flex-direction: column; align-items: center;
          margin: 0;
        }
        .blender-lb-img {
          max-width: 100%;
          max-height: 70vh;
          width: auto; height: auto;
          border-radius: 8px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.5);
          animation: blenderFade 0.2s ease;
        }
        .blender-lb-caption {
          margin-top: 18px;
          text-align: center;
          display: flex; flex-direction: column; gap: 4px;
        }
        .blender-lb-title { color: #fff; font-weight: 700; font-size: 16px; }
        .blender-lb-cat {
          color: rgba(255,255,255,0.55);
          font-size: 11px; font-weight: 700;
          text-transform: uppercase; letter-spacing: 0.06em;
        }
        .blender-lb-desc {
          color: rgba(255,255,255,0.78);
          font-size: 14px; line-height: 1.6;
          max-width: 520px;
          margin-top: 6px;
        }
      `}</style>
    </div>
  )
}
