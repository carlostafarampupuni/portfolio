import { useEffect } from 'react'

const SITE_NAME = 'Carlos Tafara Mpupuni'
const SITE_URL  = 'https://www.carlosmpupuni.com'

/**
 * Sets the document title and meta description for the current page.
 * Works in two places:
 *  - During the static build (vite-react-ssg renders each route in Node),
 *    `applyHead()` below runs synchronously so the generated HTML file
 *    already contains the correct <title>/<meta> tags — this is what
 *    Google actually indexes.
 *  - In the browser, the useEffect keeps tags in sync on client-side
 *    navigation (e.g. clicking a <Link> without a full page reload).
 *
 * @param {string} title       Page-specific title (site name is appended automatically)
 * @param {string} description Page-specific meta description (~150-160 chars ideal)
 * @param {string} path        Route path, e.g. '/about' — used to build the canonical URL
 */
export function useSEO(title, description, path = '') {
  const fullTitle = title ? `${title} — ${SITE_NAME}` : `${SITE_NAME} — Learning Design Portfolio`
  const canonical = `${SITE_URL}${path}`

  applyHead(fullTitle, description, canonical)

  useEffect(() => {
    applyHead(fullTitle, description, canonical)
  }, [fullTitle, description, canonical])
}

function applyHead(title, description, canonical) {
  if (typeof document === 'undefined') return

  document.title = title
  setMeta('description', description)
  setMeta('og:title', title, 'property')
  setMeta('og:description', description, 'property')
  setMeta('og:url', canonical, 'property')
  setMeta('og:type', 'website', 'property')
  setMeta('twitter:card', 'summary_large_image', 'name')
  setMeta('twitter:title', title, 'name')
  setMeta('twitter:description', description, 'name')
  setCanonical(canonical)
}

function setMeta(key, content, attr = 'name') {
  if (!content) return
  let tag = document.querySelector(`meta[${attr}="${key}"]`)
  if (!tag) {
    tag = document.createElement('meta')
    tag.setAttribute(attr, key)
    document.head.appendChild(tag)
  }
  tag.setAttribute('content', content)
}

function setCanonical(url) {
  let tag = document.querySelector('link[rel="canonical"]')
  if (!tag) {
    tag = document.createElement('link')
    tag.setAttribute('rel', 'canonical')
    document.head.appendChild(tag)
  }
  tag.setAttribute('href', url)
}
