// Generates dist/sitemap.xml after the static build.
// Run automatically as part of `npm run build` (see package.json).
//
// To add a new page later: add its path to ROUTES below, then rebuild.
// This is the one place that needs a manual update when a new route
// is added — vite-react-ssg renders whatever's in src/routes.jsx, but
// the sitemap needs an explicit list so external pages we don't fully
// control (like the in-development Battery Analysis Dashboard) can be
// left out.

import { writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const SITE_URL = 'https://www.carlosmpupuni.com'

const ROUTES = [
  { path: '/',                          priority: '1.0', changefreq: 'monthly' },
  { path: '/about',                     priority: '0.8', changefreq: 'monthly' },
  { path: '/projects',                  priority: '0.9', changefreq: 'monthly' },
  { path: '/projects/electrochemistry', priority: '0.7', changefreq: 'yearly'  },
  { path: '/projects/equilibrium',      priority: '0.7', changefreq: 'yearly'  },
  { path: '/projects/ibp',              priority: '0.7', changefreq: 'yearly'  },
  { path: '/projects/complex',          priority: '0.7', changefreq: 'yearly'  },
  { path: '/projects/blender',          priority: '0.6', changefreq: 'yearly'  },
  { path: '/research',                  priority: '0.8', changefreq: 'monthly' },
  { path: '/contact',                   priority: '0.5', changefreq: 'yearly'  },
]

const today = new Date().toISOString().split('T')[0]

const body = ROUTES.map(({ path, priority, changefreq }) => `  <url>
    <loc>${SITE_URL}${path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`).join('\n')

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>
`

const outPath = resolve(__dirname, '../dist/sitemap.xml')
writeFileSync(outPath, xml)
console.log(`✓ sitemap.xml written to ${outPath} (${ROUTES.length} routes)`)
