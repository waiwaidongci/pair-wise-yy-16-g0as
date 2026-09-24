import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { FilterProvider } from './state/FilterContext'
import { LightboxProvider } from './lightbox/LightboxContext'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import WorkPage from './pages/WorkPage'
import SeriesPage from './pages/SeriesPage'
import AboutPage from './pages/AboutPage'
import ContactPage from './pages/ContactPage'
import NotFoundPage from './pages/NotFoundPage'

export default function App() {
  return (
    <FilterProvider>
      <LightboxProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/work" element={<WorkPage />} />
              <Route path="/work/:seriesId" element={<SeriesPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </LightboxProvider>
    </FilterProvider>
  )
}
