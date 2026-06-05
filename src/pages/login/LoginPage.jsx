import { useState } from "react"
import { Navigate } from "react-router-dom"
import { FiBox, FiEye, FiEyeOff } from "react-icons/fi"
import { useAuth } from "../../context/AuthContext"
import { useToast } from "../../components/useToast"
import "./LoginPage.css"

const AUTH_ERRORS = {
  "auth/invalid-credential": "Correo o contraseña incorrectos.",
  "auth/user-not-found": "No existe una cuenta con ese correo.",
  "auth/wrong-password": "Contraseña incorrecta.",
  "auth/too-many-requests": "Demasiados intentos. Intenta más tarde.",
  "auth/invalid-email": "El formato del correo no es válido.",
}

export default function LoginPage() {
  const { currentUser, login } = useAuth()
  const { showToast } = useToast()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [mostrarPassword, setMostrarPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  if (currentUser) return <Navigate to="/" replace />

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email.trim() || !password) return
    setLoading(true)
    try {
      await login(email.trim(), password)
    } catch (err) {
      const msg = AUTH_ERRORS[err.code] || "Error al iniciar sesión."
      showToast(msg, "error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-wrapper">
      <form className="login-card" onSubmit={handleSubmit}>
        <h1 className="login-title"><FiBox size={22} style={{ marginRight: 8, verticalAlign: "middle" }} />Gestión de Activos</h1>
        <p className="login-subtitle">Porceramica</p>

        <div className="login-field">
          <label htmlFor="email">Correo electrónico</label>
          <div className="login-input-wrapper">
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="usuario@porceramica.com"
              required
            />
          </div>
        </div>

        <div className="login-field">
          <label htmlFor="password">Contraseña</label>
          <div className="login-input-wrapper">
            <input
              id="password"
              type={mostrarPassword ? "text" : "password"}
              autoComplete="current-password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
            <button
              type="button"
              className="login-toggle-password"
              onClick={() => setMostrarPassword(v => !v)}
              aria-label={mostrarPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
              {mostrarPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
            </button>
          </div>
        </div>

        <button className="login-btn" type="submit" disabled={loading}>
          {loading ? "Ingresando..." : "Iniciar sesión"}
        </button>
      </form>
    </div>
  )
}
