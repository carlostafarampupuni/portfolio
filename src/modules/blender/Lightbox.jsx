import { useEffect, useRef } from 'react'

export default function Lightbox({ figures, index, onClose, onPrev, onNext }) {
  const fig = figures[index]
  const touch = useRef({ x: 0 })

  // Keyboard nav + scroll lock while open
  useEffect(() => {
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    function onKey(e) {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') onPrev()
      if (e.key === 'ArrowRight') onNext()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [onClose, onPrev, onNext])

  function handleTouchStart(e) { touch.current.x = e.touches[0].clientX }
  function handleTouchEnd(e) {
    const dx = e.changedTouches[0].clientX - touch.current.x
    if (dx > 50) onPrev()
    else if (dx < -50) onNext()
  }

  if (!fig) return null

  return (
    <div
      className="blender-lightbox"
      onClick={onClose}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      role="dialog"
      aria-modal="true"
      aria-label={fig.title}
    >
      <button
        className="blender-lb-close"
        onClick={onClose}
        aria-label="Close"
      >✕</button>

      <p className="blender-lb-count">{index + 1} / {figures.length}</p>

      {figures.length > 1 && (
        <button
          className="blender-lb-nav blender-lb-prev"
          onClick={(e) => { e.stopPropagation(); onPrev() }}
          aria-label="Previous figure"
        >←</button>
      )}

      <figure
        className="blender-lb-figure"
        onClick={(e) => e.stopPropagation()}
      >
        <img key={fig.id} src={fig.src} alt={fig.title} className="blender-lb-img" />
        <figcaption className="blender-lb-caption">
          <span className="blender-lb-title">{fig.title}</span>
          <span className="blender-lb-cat">{fig.category}</span>
          {fig.caption && <span className="blender-lb-desc">{fig.caption}</span>}
        </figcaption>
      </figure>

      {figures.length > 1 && (
        <button
          className="blender-lb-nav blender-lb-next"
          onClick={(e) => { e.stopPropagation(); onNext() }}
          aria-label="Next figure"
        >→</button>
      )}
    </div>
  )
}
