# Autenticación Email/Password Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Proteger todas las rutas de la app con autenticación Firebase email/password; los usuarios los administra el dueño desde la consola de Firebase.

**Architecture:** Un `AuthContext` expone `currentUser`, `login` y `logout`. Un `ProtectedRoute` redirige a `/login` si no hay sesión. La `LoginPage` usa el Toast existente para mostrar errores.

**Tech Stack:** React 19, Firebase Auth (`firebase/auth`), React Router v7, sistema Toast existente.

---

## Mapa de archivos

| Archivo | Acción | Responsabilidad |
|---|---|---|
| `src/firebase/config.js` | Modificar | Exportar `auth` |
| `src/context/AuthContext.jsx` | Crear | Estado global de sesión |
| `src/components/ProtectedRoute.jsx` | Crear | Guard de rutas |
| `src/pages/login/LoginPage.jsx` | Crear | Formulario de login |
| `src/pages/login/LoginPage.css` | Crear | Estilos del login |
| `src/App.jsx` | Modificar | Rutas protegidas + AuthProvider |
| `src/pages/home/Home.jsx` | Modificar | Botón cerrar sesión |

---

### Task 1: Activar Firebase Auth

**Files:**
- Modify: `src/firebase/config.js`

- [ ] **Step 1: Reemplazar el contenido de `src/firebase/config.js`**

```js
import { initializeApp } from "firebase/app"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"
import { getAuth } from "firebase/auth"

const firebaseConfig = {
  apiKey: "AIzaSyDYCgjO5DIlrNWn4pWOOommYLU7-mMcIqw",
  authDomain: "porceramica-it-assets.firebaseapp.com",
  projectId: "porceramica-it-assets",
  storageBucket: "porceramica-it-assets.firebasestorage.app",
  messagingSenderId: "608311853786",
  appId: "1:608311853786:web:86daeaf71aa3df88509be3",
}

const app = initializeApp(firebaseConfig)

export const db = getFirestore(app)
export const storage = getStorage(app)
export const auth = getAuth(app)
```

- [ ] **Step 2: Verificar que no hay errores de compilación**

```bash
npm run build
```
Esperado: sin errores.

---

### Task 2: Crear AuthContext

**Files:**
- Create: `src/context/AuthContext.jsx`

- [ ] **Step 1: Crear el archivo `src/context/AuthContext.jsx`**

```jsx
import { createContext, useContext, useEffect, useState } from "react"
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth"
import { auth } from "../firebase/config"

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [loadingAuth, setLoadingAuth] = useState(true)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user)
      setLoadingAuth(false)
    })
    return unsub
  }, [])

  const login = (email, password) =>
    signInWithEmailAndPassword(auth, email, password)

  const logout = () => signOut(auth)

  return (
    <AuthContext.Provider value={{ currentUser, loadingAuth, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider")
  return ctx
}
```

- [ ] **Step 2: Verificar compilación**

```bash
npm run build
```
Esperado: sin errores.

---

### Task 3: Crear ProtectedRoute

**Files:**
- Create: `src/components/ProtectedRoute.jsx`

- [ ] **Step 1: Crear el archivo `src/components/ProtectedRoute.jsx`**

```jsx
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
```

- [ ] **Step 2: Verificar compilación**

```bash
npm run build
```
Esperado: sin errores.

---

### Task 4: Crear LoginPage

**Files:**
- Create: `src/pages/login/LoginPage.jsx`
- Create: `src/pages/login/LoginPage.css`

- [ ] **Step 1: Crear `src/pages/login/LoginPage.css`**

```css
.login-wrapper {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg, #f8f9fa);
  padding: 1rem;
}

.login-card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.10);
  padding: 2.5rem 2rem;
  width: 100%;
  max-width: 380px;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.login-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--color-text, #1a1a2e);
  text-align: center;
  margin: 0;
  line-height: 1.4;
}

.login-subtitle {
  font-size: 0.82rem;
  color: var(--color-muted, #6c757d);
  text-align: center;
  margin: -0.75rem 0 0;
}

.login-field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.login-field label {
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--color-muted, #6c757d);
}

.login-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.login-input-wrapper input {
  width: 100%;
  padding: 0.6rem 2.4rem 0.6rem 0.75rem;
  border: 1.5px solid #dee2e6;
  border-radius: 8px;
  font-size: 0.9rem;
  outline: none;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.login-input-wrapper input:focus {
  border-color: var(--color-primary, #3b82f6);
}

.login-toggle-password {
  position: absolute;
  right: 0.6rem;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  padding: 0;
  line-height: 1;
  color: var(--color-muted, #6c757d);
}

.login-btn {
  padding: 0.7rem;
  background: var(--color-primary, #3b82f6);
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
}

.login-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.login-btn:not(:disabled):hover {
  opacity: 0.88;
}
```

- [ ] **Step 2: Crear `src/pages/login/LoginPage.jsx`**

```jsx
import { useState } from "react"
import { Navigate } from "react-router-dom"
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
        <h1 className="login-title">📦 Gestión de Activos</h1>
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
              {mostrarPassword ? "🙈" : "👁️"}
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
```

- [ ] **Step 3: Verificar compilación**

```bash
npm run build
```
Esperado: sin errores.

---

### Task 5: Actualizar App.jsx

**Files:**
- Modify: `src/App.jsx`

- [ ] **Step 1: Reemplazar el contenido de `src/App.jsx`**

```jsx
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
```

- [ ] **Step 2: Verificar compilación**

```bash
npm run build
```
Esperado: sin errores.

---

### Task 6: Agregar botón de cierre de sesión en Home

**Files:**
- Modify: `src/pages/home/Home.jsx`

- [ ] **Step 1: Actualizar `src/pages/home/Home.jsx`**

```jsx
import { useState } from "react"
import { useActivos } from "../../hooks/useActivos"
import { useAuth } from "../../context/AuthContext"
import StatsPanel from "../../components/StatsPanel"
import SearchBar from "../../components/SearchBar"
import AssetGrid from "../../components/AssetGrid"
import AssetForm from "../../components/AssetForm"
import "./Home.css"

export default function Home() {
  const [modalAbierto, setModalAbierto] = useState(false)
  const { activosFiltrados, loading, stats, filtros, setFiltros, crear, eliminar } = useActivos()
  const { logout } = useAuth()

  const hayFiltrosActivos = !!(filtros.busqueda || filtros.estado || filtros.categoria)

  const handleGuardar = async (datos) => {
    const ok = await crear(datos)
    if (ok) setModalAbierto(false)
  }

  return (
    <div className="home-wrapper">
      <nav className="home-nav">
        <span className="nav-title">📦 Gestión de Activos · Porceramica</span>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <button className="nav-btn-nuevo" onClick={() => setModalAbierto(true)}>
            + Nuevo activo
          </button>
          <button
            className="nav-btn-nuevo"
            onClick={logout}
            style={{ background: "transparent", border: "1.5px solid rgba(255,255,255,0.5)", color: "#fff" }}
          >
            Cerrar sesión
          </button>
        </div>
      </nav>

      <main className="home-main">
        <StatsPanel stats={stats} />
        <SearchBar filtros={filtros} onFiltrosChange={setFiltros} total={activosFiltrados.length} />
        <AssetGrid
          activos={activosFiltrados}
          loading={loading}
          onEliminar={eliminar}
          onLimpiarFiltros={() => setFiltros({ busqueda: "", estado: "", categoria: "" })}
          hayFiltrosActivos={hayFiltrosActivos}
        />
      </main>

      {modalAbierto && (
        <AssetForm onClose={() => setModalAbierto(false)} onGuardar={handleGuardar} />
      )}
    </div>
  )
}
```

- [ ] **Step 2: Verificar compilación final**

```bash
npm run build
```
Esperado: sin errores.

- [ ] **Step 3: Commit**

```bash
git add src/firebase/config.js src/context/AuthContext.jsx src/components/ProtectedRoute.jsx src/pages/login/LoginPage.jsx src/pages/login/LoginPage.css src/App.jsx src/pages/home/Home.jsx
git commit -m "feat: add email/password authentication with protected routes"
```

---

## Verificación manual

1. Abrir la app en el navegador → debe redirigir a `/login`
2. Ingresar credenciales incorrectas → debe aparecer Toast de error
3. Ingresar credenciales correctas → debe redirigir a `/`
4. Recargar la página en `/` → debe mantenerse la sesión
5. Presionar "Cerrar sesión" → debe redirigir a `/login`
6. Intentar entrar a `/activo/cualquier-id` sin sesión → debe redirigir a `/login`

## Nota: habilitar Firebase Auth

Antes de probar, asegúrate de tener habilitado el proveedor **Email/Password** en la consola de Firebase:
**Authentication → Sign-in method → Email/Password → Habilitar**
