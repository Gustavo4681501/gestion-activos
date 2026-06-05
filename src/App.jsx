import { BrowserRouter, Routes, Route } from "react-router-dom"
import { ToastProvider } from "./components/Toast"
import { AuthProvider } from "./context/AuthContext"
import ProtectedRoute from "./components/ProtectedRoute"
import ActivoDetallePage from "./pages/activoDetallePage/ActivoDetallePage"
import Home from "./pages/home/Home"
import LoginPage from "./pages/login/LoginPage"

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<Home />} />
              <Route path="/activo/:id" element={<ActivoDetallePage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ToastProvider>
  )
}

export default App
