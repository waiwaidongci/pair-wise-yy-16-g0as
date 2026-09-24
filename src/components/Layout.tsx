import { Outlet } from 'react-router-dom'
import Header, { ScrollToTop } from './Header'
import Lightbox from '../lightbox/Lightbox'

export default function Layout() {
  return (
    <div className="site-shell">
      <ScrollToTop />
      <Header />
      <main>
        <Outlet />
      </main>
      <footer className="site-footer">
        <div className="container site-footer-inner">
          <span>© {new Date().getFullYear()} 林晚摄影</span>
          <span>黑白肖像 · 高原风光 · 牧场记录</span>
        </div>
      </footer>
      <Lightbox />
    </div>
  )
}
