import { ViteReactSSG } from 'vite-react-ssg'
import { routes } from './routes'
import './index.css'

export const createRoot = ViteReactSSG(
  { routes },
  ({ router, isClient }) => {
    // Runs once on every navigation, client-side only.
    // Scrolls to top on route change, like a normal multi-page site.
    if (isClient) {
      router.subscribe(() => window.scrollTo(0, 0))
    }
  }
)
