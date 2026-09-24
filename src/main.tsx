import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { LightboxProvider } from "./context/LightboxContext";
import { WorkFilterProvider } from "./context/WorkFilterContext";
import { Layout } from "./components/Layout";
import { Home } from "./pages/Home";
import { Work } from "./pages/Work";
import { Series } from "./pages/Series";
import { About } from "./pages/About";
import { Contact } from "./pages/Contact";
import "./styles.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <WorkFilterProvider>
      <LightboxProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="work" element={<Work />} />
              <Route path="work/:seriesId" element={<Series />} />
              <Route path="about" element={<About />} />
              <Route path="contact" element={<Contact />} />
              <Route path="*" element={<Home />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </LightboxProvider>
    </WorkFilterProvider>
  </StrictMode>
);
