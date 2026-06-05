import { Navigate, Outlet } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

export default function ProtectedRoute() {
  const { currentUser, loadingAuth } = useAuth()

  if (loadingAuth) {
    return (
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        fontSize: "1.2rem",
        color: "var(--color-muted, #6c757d)"
      }}>
        Cargando...
      </div>
    )
  }

  return currentUser ? <Outlet /> : <Navigate to="/login" replace />
}
