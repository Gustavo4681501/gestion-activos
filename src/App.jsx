// src/App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom"
import { ToastProvider } from "./components/Toast"
import ActivoDetallePage from "./pages/activoDetallePage/ActivoDetallePage"
import Home from "./pages/home/Home"

function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/activo/:id" element={<ActivoDetallePage />} />
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  )
}

export default App
