import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useLightbox } from "../context/LightboxContext";
import { Lightbox } from "./Lightbox";

const NAV_ITEMS = [
  { to: "/", label: "首页", end: true },
  { to: "/work", label: "作品", end: false },
  { to: "/about", label: "关于", end: false },
  { to: "/contact", label: "联系", end: false },
];

export function Layout() {
  const { state, close, prev, next } = useLightbox();
  const [navOpen, setNavOpen] = useState(false);
  const location = useLocation();

  // 路由切换时收起移动端菜单、关闭灯箱
  useEffect(() => {
    setNavOpen(false);
    close();
  }, [location.pathname, close]);

  return (
    <div className="site-shell">
      <header className="site-header">
        <div className="site-header-inner">
          <NavLink to="/" className="site-logo">
            林澜<em>.</em>
          </NavLink>
          <button
            type="button"
            className="nav-toggle"
            aria-label="打开导航菜单"
            aria-expanded={navOpen}
            onClick={() => setNavOpen((v) => !v)}
          >
            <span />
            <span />
            <span />
          </button>
          <nav className={`site-nav${navOpen ? " open" : ""}`} aria-label="主导航">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main className="site-main">
        <Outlet />
      </main>

      <footer className="site-footer">© 2026 林澜摄影工作室 · 高原与凝视之间</footer>

      {state && (
        <Lightbox
          photos={state.photos}
          index={state.index}
          onClose={close}
          onPrev={prev}
          onNext={next}
        />
      )}
    </div>
  );
}
