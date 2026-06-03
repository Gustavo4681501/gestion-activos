# Mejora App IT Assets — Porceramica Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactorizar Home.jsx en componentes con responsabilidad única, añadir búsqueda/filtros client-side con debounce, dashboard de estadísticas, toasts no bloqueantes y mejoras de UX en toda la app.

**Architecture:** Un hook central `useActivos` concentra toda la lógica de datos y filtrado. `Home.jsx` orquesta componentes atómicos (`StatsPanel`, `SearchBar`, `AssetGrid`, `AssetForm`). El formulario de registro pasa de estar embebido en la página a abrirse en un modal.

**Tech Stack:** React 19, Vite 7, Firebase Firestore, Bootstrap 5, React Router v7, CSS con variables custom.

---

## Mapa de archivos

| Archivo | Acción | Responsabilidad |
|---|---|---|
| `src/index.css` | Modificar | CSS variables globales |
| `src/utils/estados.js` | Crear | Labels y colores de estados |
| `src/components/Toast.jsx` | Crear | Notificaciones + confirmaciones no bloqueantes |
| `src/components/Toast.css` | Crear | Estilos del Toast |
| `src/App.jsx` | Modificar | Envolver con ToastProvider |
| `src/services/activos.service.js` | Modificar | Añadir try/catch con mensajes descriptivos |
| `src/hooks/useActivos.js` | Crear | Lógica de datos, filtros, stats, debounce |
| `src/components/StatsPanel.jsx` | Crear | 4 tarjetas de métricas |
| `src/components/SearchBar.jsx` | Crear | Input búsqueda + 2 selects + contador |
| `src/components/AssetCard.jsx` | Crear | Card individual de activo |
| `src/components/AssetGrid.jsx` | Crear | Grid + skeleton + estados vacíos |
| `src/components/AssetForm.jsx` | Crear | Formulario completo en modal |
| `src/styles/components.css` | Crear | CSS de todos los componentes nuevos |
| `src/pages/home/Home.jsx` | Modificar | Solo orquesta, sin lógica propia |
| `src/pages/home/Home.css` | Modificar | Solo layout de página, usa variables |
| `src/pages/activoDetallePage/ActivoDetallePage.jsx` | Modificar | Botón volver, breadcrumb, useToast, ESTADO_LABELS |

---

## Task 1: CSS variables globales

**Files:**
- Modify: `src/index.css`

- [ ] **Step 1: Reemplazar el contenido vacío de index.css con variables CSS**

```css
/* src/index.css */
:root {
  --color-primary: #0d6efd;
  --color-primary-dark: #0b5ed7;
  --color-success: #28a745;
  --color-info: #0dcaf0;
  --color-warning: #ffc107;
  --color-danger: #dc3545;
  --color-muted: #6c757d;
  --color-bg: #f8f9fa;
  --color-card: #ffffff;
  --color-border: #e9ecef;
  --shadow-card: 0 2px 6px rgba(0, 0, 0, 0.06);
  --shadow-card-hover: 0 6px 16px rgba(0, 0, 0, 0.1);
  --radius-card: 10px;
  --radius-input: 8px;
  --radius-btn: 8px;
}

* {
  box-sizing: border-box;
}

body {
  background: var(--color-bg);
  font-family: 'Segoe UI', sans-serif;
  margin: 0;
}
```

- [ ] **Step 2: Verificar que la app sigue funcionando**

Ejecuta: `npm run dev`
Abre http://localhost:5173 — debe verse igual que antes, sin errores en consola.

- [ ] **Step 3: Commit**

```bash
git add src/index.css
git commit -m "style: add CSS custom properties for design system"
```

---

## Task 2: Utilidad de estados

**Files:**
- Create: `src/utils/estados.js`

- [ ] **Step 1: Crear el archivo de utilidad**

```js
// src/utils/estados.js
export const ESTADO_LABELS = {
  asignado: "Asignado",
  en_bodega: "En bodega",
  danado: "Dañado",
  en_reparacion: "En reparación",
  baja: "Baja",
  reservado: "Reservado",
}

export const ESTADO_COLORS = {
  asignado: "#28a745",
  en_bodega: "#0dcaf0",
  danado: "#dc3545",
  en_reparacion: "#ffc107",
  baja: "#6c757d",
  reservado: "#17a2b8",
}
```

- [ ] **Step 2: Lint**

Ejecuta: `npm run lint`
Expected: sin errores.

- [ ] **Step 3: Commit**

```bash
git add src/utils/estados.js
git commit -m "feat: add estado labels and colors utility"
```

---

## Task 3: Componente Toast

**Files:**
- Create: `src/components/Toast.jsx`
- Create: `src/components/Toast.css`

- [ ] **Step 1: Crear Toast.css**

```css
/* src/components/Toast.css */
.toast-container {
  position: fixed;
  bottom: 24px;
  right: 24px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  z-index: 10000;
  max-width: 400px;
  width: calc(100vw - 48px);
}

.toast {
  padding: 12px 16px;
  border-radius: var(--radius-card);
  font-size: 0.875rem;
  font-weight: 500;
  display: flex;
  align-items: flex-start;
  gap: 10px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  animation: toast-in 0.2s ease;
}

@keyframes toast-in {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}

.toast-success { background: #d1e7dd; color: #0a3622; border-left: 4px solid #28a745; }
.toast-error   { background: #f8d7da; color: #58151c; border-left: 4px solid #dc3545; }
.toast-warning { background: #fff3cd; color: #664d03; border-left: 4px solid #ffc107; }
.toast-confirm { background: #ffffff; color: #1a1a2e; border-left: 4px solid #0d6efd; border: 1px solid #e9ecef; }

.toast-confirm-content {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
}

.toast-confirm-actions {
  display: flex;
  gap: 8px;
}

.toast-confirm-actions button {
  padding: 6px 14px;
  border-radius: var(--radius-btn);
  border: none;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
}

.toast-confirm-actions button:first-child {
  background: #dc3545;
  color: white;
}

.toast-confirm-actions button:last-child {
  background: var(--color-border);
  color: #495057;
}
```

- [ ] **Step 2: Crear Toast.jsx**

```jsx
// src/components/Toast.jsx
import { useState, useCallback, createContext, useContext, useRef } from "react"
import "./Toast.css"

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const resolversRef = useRef({})

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const showToast = useCallback((message, type = "success") => {
    const id = Date.now() + Math.random()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => removeToast(id), 4000)
  }, [removeToast])

  const showConfirm = useCallback((message) => {
    return new Promise(resolve => {
      const id = Date.now() + Math.random()
      resolversRef.current[id] = resolve
      setToasts(prev => [...prev, { id, message, type: "confirm" }])
    })
  }, [])

  const handleConfirm = useCallback((id, value) => {
    resolversRef.current[id]?.(value)
    delete resolversRef.current[id]
    removeToast(id)
  }, [removeToast])

  const ICONS = { success: "✅", error: "❌", warning: "⚠️" }

  return (
    <ToastContext.Provider value={{ showToast, showConfirm }}>
      {children}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast toast-${t.type}`}>
            {t.type === "confirm" ? (
              <div className="toast-confirm-content">
                <span>🗑️ {t.message}</span>
                <div className="toast-confirm-actions">
                  <button onClick={() => handleConfirm(t.id, true)}>Confirmar</button>
                  <button onClick={() => handleConfirm(t.id, false)}>Cancelar</button>
                </div>
              </div>
            ) : (
              <span>{ICONS[t.type]} {t.message}</span>
            )}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error("useToast must be used inside ToastProvider")
  return ctx
}
```

- [ ] **Step 3: Lint**

Ejecuta: `npm run lint`
Expected: sin errores.

- [ ] **Step 4: Commit**

```bash
git add src/components/Toast.jsx src/components/Toast.css
git commit -m "feat: add Toast notification component with confirm support"
```

---

## Task 4: Envolver App con ToastProvider

**Files:**
- Modify: `src/App.jsx`

- [ ] **Step 1: Actualizar App.jsx**

```jsx
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
```

- [ ] **Step 2: Verificar que la app carga sin errores**

Ejecuta: `npm run dev`
Abre http://localhost:5173 — debe verse igual que antes. Revisa la consola del navegador: sin errores de React.

- [ ] **Step 3: Commit**

```bash
git add src/App.jsx
git commit -m "feat: wrap app with ToastProvider"
```

---

## Task 5: Manejo de errores en activos.service.js

**Files:**
- Modify: `src/services/activos.service.js`

- [ ] **Step 1: Reemplazar activos.service.js con versión con error handling**

```js
// src/services/activos.service.js
import {
  collection,
  addDoc,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  Timestamp
} from "firebase/firestore"
import { db } from "../firebase/config"

export const crearActivo = async data => {
  try {
    await addDoc(collection(db, "activos"), {
      ...data,
      creadoEn: Timestamp.now(),
      historial_propietarios: [data.propietarioActual],
    })
  } catch (e) {
    throw new Error("No se pudo registrar el activo")
  }
}

export const obtenerActivos = async () => {
  try {
    const snap = await getDocs(collection(db, "activos"))
    return snap.docs.map(d => ({ id: d.id, ...d.data() }))
  } catch (e) {
    throw new Error("No se pudieron cargar los activos")
  }
}

export const obtenerActivo = async id => {
  try {
    const snap = await getDoc(doc(db, "activos", id))
    if (!snap.exists()) throw new Error("Activo no encontrado")
    return { id: snap.id, ...snap.data() }
  } catch (e) {
    throw new Error(e.message || "No se pudo cargar el activo")
  }
}

export const agregarPropietario = async (activoId, propietarioData) => {
  try {
    const ref = doc(db, "activos", activoId)
    const snap = await getDoc(ref)
    const activo = snap.data()
    await updateDoc(ref, {
      propietarioActual: propietarioData,
      historial_propietarios: [
        ...(activo.historial_propietarios || []),
        propietarioData,
      ],
      ultimaActualizacion: Timestamp.now(),
    })
  } catch (e) {
    throw new Error("No se pudo asignar el propietario")
  }
}

export const actualizarActivo = async (activoId, datosActualizados) => {
  try {
    const ref = doc(db, "activos", activoId)
    await updateDoc(ref, {
      ...datosActualizados,
      ultimaActualizacion: Timestamp.now(),
    })
  } catch (e) {
    throw new Error("No se pudieron guardar los cambios")
  }
}

export const eliminarActivo = async id => {
  try {
    await deleteDoc(doc(db, "activos", id))
  } catch (e) {
    throw new Error("No se pudo eliminar el activo")
  }
}
```

- [ ] **Step 2: Lint**

Ejecuta: `npm run lint`
Expected: sin errores.

- [ ] **Step 3: Commit**

```bash
git add src/services/activos.service.js
git commit -m "refactor: add error handling to activos service"
```

---

## Task 6: Hook useActivos

**Files:**
- Create: `src/hooks/useActivos.js`

- [ ] **Step 1: Crear la carpeta y el hook**

```js
// src/hooks/useActivos.js
import { useState, useEffect, useCallback, useMemo } from "react"
import {
  obtenerActivos,
  crearActivo as crearActivoService,
  eliminarActivo as eliminarActivoService
} from "../services/activos.service"
import { useToast } from "../components/Toast"

export function useActivos() {
  const [activos, setActivos] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtros, setFiltrosState] = useState({ busqueda: "", estado: "", categoria: "" })
  const [debouncedBusqueda, setDebouncedBusqueda] = useState("")
  const { showToast, showConfirm } = useToast()

  const cargar = useCallback(async () => {
    setLoading(true)
    try {
      const data = await obtenerActivos()
      setActivos(data)
    } catch (e) {
      showToast(e.message, "error")
    } finally {
      setLoading(false)
    }
  }, [showToast])

  useEffect(() => { cargar() }, [cargar])

  // Debounce de 300ms sobre el texto de búsqueda
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedBusqueda(filtros.busqueda), 300)
    return () => clearTimeout(timer)
  }, [filtros.busqueda])

  const setFiltros = useCallback((parcial) => {
    setFiltrosState(prev => ({ ...prev, ...parcial }))
  }, [])

  const activosFiltrados = useMemo(() => {
    const q = debouncedBusqueda.toLowerCase()
    return activos.filter(a => {
      if (filtros.estado && a.estado !== filtros.estado) return false
      if (filtros.categoria && a.categoria !== filtros.categoria) return false
      if (q) {
        const campos = [a.serialNumber, a.marca, a.modelo, a.propietarioActual?.nombre]
        if (!campos.some(v => v?.toLowerCase().includes(q))) return false
      }
      return true
    })
  }, [activos, debouncedBusqueda, filtros.estado, filtros.categoria])

  const stats = useMemo(() => ({
    total: activos.length,
    asignados: activos.filter(a => a.estado === "asignado").length,
    enBodega: activos.filter(a => a.estado === "en_bodega").length,
    danados: activos.filter(a => ["danado", "en_reparacion"].includes(a.estado)).length,
  }), [activos])

  const crear = useCallback(async (datos) => {
    try {
      await crearActivoService(datos)
      await cargar()
      showToast("Activo registrado correctamente", "success")
      return true
    } catch (e) {
      showToast(e.message, "error")
      return false
    }
  }, [cargar, showToast])

  const eliminar = useCallback(async (id) => {
    const ok = await showConfirm("¿Eliminar este activo? Esta acción no se puede deshacer.")
    if (!ok) return
    try {
      await eliminarActivoService(id)
      await cargar()
      showToast("Activo eliminado", "success")
    } catch (e) {
      showToast(e.message, "error")
    }
  }, [cargar, showToast, showConfirm])

  return {
    activos,
    activosFiltrados,
    loading,
    stats,
    filtros,
    setFiltros,
    crear,
    eliminar,
    recargar: cargar,
  }
}
```

- [ ] **Step 2: Lint**

Ejecuta: `npm run lint`
Expected: sin errores.

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useActivos.js
git commit -m "feat: add useActivos hook with filtering, stats and debounce"
```

---

## Task 7: Componentes CSS compartidos

**Files:**
- Create: `src/styles/components.css`

- [ ] **Step 1: Crear archivo de estilos de componentes**

```css
/* src/styles/components.css */

/* ===== STATS PANEL ===== */
.stats-panel {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}

.stat-card {
  background: var(--color-card);
  padding: 16px;
  border-radius: var(--radius-card);
  border-top: 3px solid transparent;
  box-shadow: var(--shadow-card);
}

.stat-label {
  display: block;
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--color-muted);
  margin-bottom: 6px;
}

.stat-value {
  font-size: 1.8rem;
  font-weight: 700;
  line-height: 1;
}

/* ===== SEARCH BAR ===== */
.search-bar {
  background: var(--color-card);
  padding: 12px 16px;
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-card);
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
}

.search-input {
  flex: 2;
  min-width: 200px;
  padding: 8px 12px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-input);
  font-size: 0.875rem;
  font-family: inherit;
  outline: none;
  transition: border-color 0.2s;
}

.search-input:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(13, 110, 253, 0.12);
}

.search-select {
  flex: 1;
  min-width: 140px;
  padding: 8px 10px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-input);
  font-size: 0.875rem;
  font-family: inherit;
  background: white;
  outline: none;
  cursor: pointer;
}

.btn-limpiar {
  padding: 8px 14px;
  background: var(--color-border);
  border: none;
  border-radius: var(--radius-btn);
  font-size: 0.82rem;
  color: #495057;
  cursor: pointer;
  font-family: inherit;
  white-space: nowrap;
}

.btn-limpiar:hover {
  background: #d3d8dd;
}

.search-count {
  font-size: 0.8rem;
  color: var(--color-muted);
  white-space: nowrap;
}

/* ===== ASSET GRID ===== */
.asset-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

/* ===== ASSET CARD ===== */
.asset-card {
  background: var(--color-card);
  border-radius: var(--radius-card);
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-card);
  cursor: pointer;
  transition: box-shadow 0.2s, transform 0.2s;
  display: flex;
  flex-direction: column;
}

.asset-card:hover {
  box-shadow: var(--shadow-card-hover);
  transform: translateY(-2px);
}

.asset-card-header {
  padding: 12px 14px 8px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
}

.asset-card-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: #1a1a2e;
  line-height: 1.3;
}

.estado-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 20px;
  font-size: 0.68rem;
  font-weight: 600;
  color: white;
  white-space: nowrap;
  flex-shrink: 0;
}

.asset-card-body {
  padding: 0 14px 10px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.asset-card-body span {
  font-size: 0.78rem;
  color: var(--color-muted);
}

.asset-card-footer {
  padding: 10px 14px;
  border-top: 1px solid var(--color-border);
  display: flex;
  justify-content: flex-end;
}

.btn-eliminar {
  padding: 5px 12px;
  background: transparent;
  border: 1px solid #dc3545;
  border-radius: var(--radius-btn);
  color: #dc3545;
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
  font-family: inherit;
}

.btn-eliminar:hover {
  background: #dc3545;
  color: white;
}

/* ===== SKELETON ===== */
.skeleton-card {
  background: var(--color-card);
  border-radius: var(--radius-card);
  border: 1px solid var(--color-border);
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.skeleton-line {
  border-radius: 4px;
  background: linear-gradient(90deg, #e9ecef 25%, #f4f5f6 50%, #e9ecef 75%);
  background-size: 200% 100%;
  animation: shimmer 1.4s infinite;
}

@keyframes shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* ===== EMPTY STATE ===== */
.empty-state {
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 60px 20px;
  text-align: center;
}

.empty-icon {
  font-size: 2.5rem;
}

.empty-state p {
  color: var(--color-muted);
  font-size: 0.9rem;
  margin: 0;
}

.btn-limpiar-empty {
  padding: 8px 20px;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: var(--radius-btn);
  font-size: 0.875rem;
  cursor: pointer;
  font-family: inherit;
}

/* ===== MODAL (AssetForm) ===== */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9000;
  padding: 16px;
}

.modal-box {
  background: var(--color-card);
  width: 100%;
  max-width: 640px;
  border-radius: 16px;
  max-height: 90vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid var(--color-border);
}

.modal-header h5 {
  margin: 0;
  font-weight: 700;
  font-size: 1rem;
}

.modal-close {
  background: none;
  border: none;
  font-size: 1.1rem;
  cursor: pointer;
  color: var(--color-muted);
  padding: 4px 8px;
  border-radius: 6px;
  line-height: 1;
}

.modal-close:hover {
  background: var(--color-border);
}

.modal-body {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.modal-footer {
  padding: 16px 20px;
  border-top: 1px solid var(--color-border);
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

/* ===== FORM ===== */
.form-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.form-input {
  width: 100%;
  padding: 9px 12px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-input);
  font-size: 0.875rem;
  font-family: inherit;
  outline: none;
  transition: border-color 0.2s;
  background: white;
}

.form-input:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(13, 110, 253, 0.12);
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

.section-label {
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--color-muted);
  margin: 0;
}

.accesorios-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.accesorio-item label {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 10px;
  background: var(--color-bg);
  border-radius: var(--radius-input);
  cursor: pointer;
  font-size: 0.82rem;
  font-weight: 500;
}

.accesorio-item label:hover {
  background: var(--color-border);
}

.linea-extra {
  margin-top: 8px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.linea-extra label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.82rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
}

/* ===== BUTTONS ===== */
.btn-primary {
  padding: 9px 20px;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: var(--radius-btn);
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.15s;
}

.btn-primary:hover:not(:disabled) {
  background: var(--color-primary-dark);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  padding: 9px 20px;
  background: var(--color-border);
  color: #495057;
  border: none;
  border-radius: var(--radius-btn);
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
}

.btn-secondary:hover {
  background: #d3d8dd;
}

/* ===== RESPONSIVE ===== */
@media (max-width: 768px) {
  .stats-panel {
    grid-template-columns: repeat(2, 1fr);
  }

  .asset-grid {
    grid-template-columns: 1fr;
  }

  .search-bar {
    flex-direction: column;
    align-items: stretch;
  }

  .search-input,
  .search-select {
    min-width: unset;
    width: 100%;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .accesorios-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
```

- [ ] **Step 2: Importar en main.jsx**

Edita `src/main.jsx` para añadir la importación después de `import './index.css'`:

```jsx
// src/main.jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './styles/components.css'
import App from './App.jsx'
import "bootstrap/dist/css/bootstrap.min.css"

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

- [ ] **Step 3: Lint**

Ejecuta: `npm run lint`
Expected: sin errores.

- [ ] **Step 4: Commit**

```bash
git add src/styles/components.css src/main.jsx
git commit -m "style: add shared component CSS with responsive breakpoints"
```

---

## Task 8: Componente StatsPanel

**Files:**
- Create: `src/components/StatsPanel.jsx`

- [ ] **Step 1: Crear StatsPanel.jsx**

```jsx
// src/components/StatsPanel.jsx
const ITEMS = [
  { key: "total",     label: "Total activos",       color: "var(--color-primary)" },
  { key: "asignados", label: "Asignados",            color: "var(--color-success)" },
  { key: "enBodega",  label: "En bodega",            color: "var(--color-info)"    },
  { key: "danados",   label: "Dañados / Reparación", color: "var(--color-danger)"  },
]

export default function StatsPanel({ stats }) {
  return (
    <div className="stats-panel">
      {ITEMS.map(({ key, label, color }) => (
        <div key={key} className="stat-card" style={{ borderTopColor: color }}>
          <span className="stat-label">{label}</span>
          <strong className="stat-value" style={{ color }}>{stats[key]}</strong>
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Lint**

Ejecuta: `npm run lint`
Expected: sin errores.

- [ ] **Step 3: Commit**

```bash
git add src/components/StatsPanel.jsx
git commit -m "feat: add StatsPanel component"
```

---

## Task 9: Componente AssetCard

**Files:**
- Create: `src/components/AssetCard.jsx`

- [ ] **Step 1: Crear AssetCard.jsx**

```jsx
// src/components/AssetCard.jsx
import { useNavigate } from "react-router-dom"
import { ESTADO_LABELS, ESTADO_COLORS } from "../utils/estados"

export default function AssetCard({ activo, onEliminar }) {
  const navigate = useNavigate()

  return (
    <div className="asset-card" onClick={() => navigate(`/activo/${activo.id}`)}>
      <div className="asset-card-header">
        <strong className="asset-card-title">{activo.marca} {activo.modelo}</strong>
        <span
          className="estado-badge"
          style={{ background: ESTADO_COLORS[activo.estado] ?? "#6c757d" }}
        >
          {ESTADO_LABELS[activo.estado] ?? activo.estado}
        </span>
      </div>
      <div className="asset-card-body">
        <span>📦 {activo.categoria}</span>
        <span>🔢 {activo.serialNumber}</span>
        <span>👤 {activo.propietarioActual?.nombre ?? "Sin asignar"}</span>
        {activo.accesorios?.linea && (
          <span>📱 {activo.accesorios.lineaNumero} {activo.accesorios.lineaPlan ? "(Con plan)" : "(Sin plan)"}</span>
        )}
      </div>
      <div className="asset-card-footer" onClick={e => e.stopPropagation()}>
        <button className="btn-eliminar" onClick={() => onEliminar(activo.id)}>
          Eliminar
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Lint**

Ejecuta: `npm run lint`
Expected: sin errores.

- [ ] **Step 3: Commit**

```bash
git add src/components/AssetCard.jsx
git commit -m "feat: add AssetCard component"
```

---

## Task 10: Componente SearchBar

**Files:**
- Create: `src/components/SearchBar.jsx`

- [ ] **Step 1: Crear SearchBar.jsx**

```jsx
// src/components/SearchBar.jsx
const ESTADOS = [
  { value: "",              label: "Todos los estados" },
  { value: "asignado",      label: "Asignado" },
  { value: "en_bodega",     label: "En bodega" },
  { value: "danado",        label: "Dañado" },
  { value: "en_reparacion", label: "En reparación" },
  { value: "baja",          label: "Baja" },
  { value: "reservado",     label: "Reservado" },
]

const CATEGORIAS = [
  { value: "",         label: "Todas las categorías" },
  { value: "Celular",  label: "Celular" },
  { value: "Laptop",   label: "Laptop" },
  { value: "PC",       label: "PC" },
  { value: "Tablet",   label: "Tablet" },
  { value: "Monitor",  label: "Monitor" },
  { value: "Otro",     label: "Otro" },
]

export default function SearchBar({ filtros, onFiltrosChange, total }) {
  const hayFiltros = filtros.busqueda || filtros.estado || filtros.categoria

  return (
    <div className="search-bar">
      <input
        className="search-input"
        placeholder="🔍  Buscar por serial, marca, modelo o propietario..."
        value={filtros.busqueda}
        onChange={e => onFiltrosChange({ busqueda: e.target.value })}
      />
      <select
        className="search-select"
        value={filtros.estado}
        onChange={e => onFiltrosChange({ estado: e.target.value })}
      >
        {ESTADOS.map(({ value, label }) => (
          <option key={value} value={value}>{label}</option>
        ))}
      </select>
      <select
        className="search-select"
        value={filtros.categoria}
        onChange={e => onFiltrosChange({ categoria: e.target.value })}
      >
        {CATEGORIAS.map(({ value, label }) => (
          <option key={value} value={value}>{label}</option>
        ))}
      </select>
      {hayFiltros && (
        <button
          className="btn-limpiar"
          onClick={() => onFiltrosChange({ busqueda: "", estado: "", categoria: "" })}
        >
          ✕ Limpiar
        </button>
      )}
      <span className="search-count">{total} resultado{total !== 1 ? "s" : ""}</span>
    </div>
  )
}
```

- [ ] **Step 2: Lint**

Ejecuta: `npm run lint`
Expected: sin errores.

- [ ] **Step 3: Commit**

```bash
git add src/components/SearchBar.jsx
git commit -m "feat: add SearchBar component with estado and categoria filters"
```

---

## Task 11: Componente AssetGrid

**Files:**
- Create: `src/components/AssetGrid.jsx`

- [ ] **Step 1: Crear AssetGrid.jsx**

```jsx
// src/components/AssetGrid.jsx
import AssetCard from "./AssetCard"

function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <div className="skeleton-line" style={{ width: "65%", height: "16px" }} />
      <div className="skeleton-line" style={{ width: "45%", height: "12px" }} />
      <div className="skeleton-line" style={{ width: "55%", height: "12px" }} />
      <div className="skeleton-line" style={{ width: "40%", height: "12px" }} />
    </div>
  )
}

export default function AssetGrid({ activos, loading, onEliminar, onLimpiarFiltros, hayFiltrosActivos }) {
  if (loading) {
    return (
      <div className="asset-grid">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    )
  }

  if (activos.length === 0) {
    return (
      <div className="asset-grid">
        <div className="empty-state">
          <span className="empty-icon">📭</span>
          {hayFiltrosActivos ? (
            <>
              <p>No se encontraron activos para esta búsqueda</p>
              <button className="btn-limpiar-empty" onClick={onLimpiarFiltros}>
                Limpiar filtros
              </button>
            </>
          ) : (
            <p>No hay activos registrados. Crea el primero con el botón de arriba.</p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="asset-grid">
      {activos.map(a => (
        <AssetCard key={a.id} activo={a} onEliminar={onEliminar} />
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Lint**

Ejecuta: `npm run lint`
Expected: sin errores.

- [ ] **Step 3: Commit**

```bash
git add src/components/AssetGrid.jsx
git commit -m "feat: add AssetGrid with skeleton loader and empty states"
```

---

## Task 12: Componente AssetForm (modal)

**Files:**
- Create: `src/components/AssetForm.jsx`

- [ ] **Step 1: Crear AssetForm.jsx**

```jsx
// src/components/AssetForm.jsx
import { useState } from "react"
import ModalFirma from "./ModalFirma"
import { useToast } from "./Toast"

const ACCESORIOS_INICIAL = {
  estuche: false, bateria: false, cable: false,
  temperado: false, cargador: false, linea: false
}

const ACCESORIO_LABELS = {
  estuche: "Estuche", bateria: "Batería", cable: "Cable",
  temperado: "Templado", cargador: "Cargador", linea: "Línea"
}

export default function AssetForm({ onClose, onGuardar }) {
  const { showToast } = useToast()

  const [serial, setSerial] = useState("")
  const [imei, setImei] = useState("")
  const [categoria, setCategoria] = useState("")
  const [otraCategoria, setOtraCategoria] = useState("")
  const [marca, setMarca] = useState("")
  const [modelo, setModelo] = useState("")
  const [estado, setEstado] = useState("asignado")
  const [observaciones, setObservaciones] = useState("")
  const [precio, setPrecio] = useState("")
  const [accesorios, setAccesorios] = useState(ACCESORIOS_INICIAL)
  const [lineaNumero, setLineaNumero] = useState("")
  const [lineaPlan, setLineaPlan] = useState(false)
  const [asignarPropietario, setAsignarPropietario] = useState(false)
  const [nombreInput, setNombreInput] = useState("")
  const [idInput, setIdInput] = useState("")
  const [modalFirmaAbierto, setModalFirmaAbierto] = useState(false)
  const [guardando, setGuardando] = useState(false)

  const toggleAccesorio = name =>
    setAccesorios(prev => ({ ...prev, [name]: !prev[name] }))

  const validar = () => {
    const catFinal = categoria === "Otro" ? otraCategoria : categoria
    if (!serial || !catFinal || !marca || !modelo) {
      showToast("Completa los campos obligatorios: Serial, Categoría, Marca y Modelo", "warning")
      return false
    }
    if (!estado) {
      showToast("Selecciona un estado para el activo", "warning")
      return false
    }
    if (asignarPropietario && !nombreInput) {
      showToast("Ingresa el nombre del propietario", "warning")
      return false
    }
    if (accesorios.linea && !lineaNumero) {
      showToast("Ingresa el número de la línea", "warning")
      return false
    }
    return true
  }

  const handleSubmit = async () => {
    if (!validar()) return
    if (asignarPropietario) {
      setModalFirmaAbierto(true)
    } else {
      await guardar(null)
    }
  }

  const guardar = async (firmaBase64 = null) => {
    const catFinal = categoria === "Otro" ? otraCategoria : categoria
    const propietarioActual = asignarPropietario
      ? {
          nombre: nombreInput,
          identificacion: idInput || "No proporcionado",
          fechaAsignacion: new Date(),
          firmaBase64,
        }
      : null

    setGuardando(true)
    try {
      await onGuardar({
        serialNumber: serial,
        imei1: imei || null,
        categoria: catFinal,
        marca,
        modelo,
        estado,
        observaciones: observaciones || null,
        precio: precio || null,
        accesorios: {
          ...accesorios,
          lineaNumero: accesorios.linea ? lineaNumero : null,
          lineaPlan: accesorios.linea ? lineaPlan : null,
        },
        propietarioActual,
      })
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <div className="modal-header">
          <h5>Registrar nuevo activo</h5>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          <div className="form-section">
            <div className="form-row">
              <input
                className="form-input"
                placeholder="Serial *"
                value={serial}
                onChange={e => setSerial(e.target.value)}
              />
              <input
                className="form-input"
                placeholder="IMEI (opcional)"
                value={imei}
                onChange={e => setImei(e.target.value)}
              />
            </div>
            <div className="form-row">
              <select
                className="form-input"
                value={categoria}
                onChange={e => setCategoria(e.target.value)}
              >
                <option value="">Categoría *</option>
                <option>Celular</option>
                <option>Laptop</option>
                <option>PC</option>
                <option>Tablet</option>
                <option>Monitor</option>
                <option>Otro</option>
              </select>
              <input
                className="form-input"
                placeholder="Marca *"
                value={marca}
                onChange={e => setMarca(e.target.value)}
              />
            </div>
            {categoria === "Otro" && (
              <input
                className="form-input"
                placeholder="Especificar categoría *"
                value={otraCategoria}
                onChange={e => setOtraCategoria(e.target.value)}
              />
            )}
            <div className="form-row">
              <input
                className="form-input"
                placeholder="Modelo *"
                value={modelo}
                onChange={e => setModelo(e.target.value)}
              />
              <input
                className="form-input"
                placeholder="Precio"
                value={precio}
                onChange={e => setPrecio(e.target.value)}
              />
            </div>
            <select
              className="form-input"
              value={estado}
              onChange={e => setEstado(e.target.value)}
            >
              <option value="asignado">Asignado</option>
              <option value="en_bodega">En bodega</option>
              <option value="danado">Dañado</option>
              <option value="en_reparacion">En reparación</option>
              <option value="baja">Baja</option>
              <option value="reservado">Reservado</option>
            </select>
            <textarea
              className="form-input form-textarea"
              placeholder="Observaciones (opcional)"
              value={observaciones}
              onChange={e => setObservaciones(e.target.value)}
            />
          </div>

          <div className="form-section">
            <p className="section-label">Accesorios</p>
            <div className="accesorios-grid">
              {Object.keys(accesorios).map(a => (
                <div key={a} className="accesorio-item">
                  <label>
                    <input
                      type="checkbox"
                      checked={accesorios[a]}
                      onChange={() => toggleAccesorio(a)}
                    />
                    {ACCESORIO_LABELS[a]}
                  </label>
                  {a === "linea" && accesorios.linea && (
                    <div className="linea-extra">
                      <input
                        className="form-input"
                        placeholder="Número de línea"
                        value={lineaNumero}
                        onChange={e => setLineaNumero(e.target.value)}
                      />
                      <label>
                        <input
                          type="checkbox"
                          checked={lineaPlan}
                          onChange={e => setLineaPlan(e.target.checked)}
                        />
                        Con plan
                      </label>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="form-section">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={asignarPropietario}
                onChange={e => setAsignarPropietario(e.target.checked)}
              />
              Asignar propietario ahora
            </label>
            {asignarPropietario && (
              <div className="form-row">
                <input
                  className="form-input"
                  placeholder="Nombre del propietario *"
                  value={nombreInput}
                  onChange={e => setNombreInput(e.target.value)}
                />
                <input
                  className="form-input"
                  placeholder="ID (opcional)"
                  value={idInput}
                  onChange={e => setIdInput(e.target.value)}
                />
              </div>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>
            Cancelar
          </button>
          <button
            className="btn-primary"
            onClick={handleSubmit}
            disabled={guardando}
          >
            {asignarPropietario ? "Continuar con firma ✍️" : "Guardar activo"}
          </button>
        </div>
      </div>

      {modalFirmaAbierto && (
        <ModalFirma
          onClose={() => setModalFirmaAbierto(false)}
          onSave={guardar}
          precio={precio}
        />
      )}
    </div>
  )
}
```

- [ ] **Step 2: Lint**

Ejecuta: `npm run lint`
Expected: sin errores.

- [ ] **Step 3: Commit**

```bash
git add src/components/AssetForm.jsx
git commit -m "feat: add AssetForm modal component extracted from Home"
```

---

## Task 13: Refactorizar Home.jsx y Home.css

**Files:**
- Modify: `src/pages/home/Home.jsx`
- Modify: `src/pages/home/Home.css`

- [ ] **Step 1: Reemplazar Home.jsx**

```jsx
// src/pages/home/Home.jsx
import { useState } from "react"
import { useActivos } from "../../hooks/useActivos"
import StatsPanel from "../../components/StatsPanel"
import SearchBar from "../../components/SearchBar"
import AssetGrid from "../../components/AssetGrid"
import AssetForm from "../../components/AssetForm"
import "./Home.css"

export default function Home() {
  const [modalAbierto, setModalAbierto] = useState(false)
  const { activosFiltrados, loading, stats, filtros, setFiltros, crear, eliminar } = useActivos()

  const hayFiltrosActivos = !!(filtros.busqueda || filtros.estado || filtros.categoria)

  const handleGuardar = async (datos) => {
    const ok = await crear(datos)
    if (ok) setModalAbierto(false)
  }

  return (
    <div className="home-wrapper">
      <nav className="home-nav">
        <span className="nav-title">🖥️ IT Assets · Porceramica</span>
        <button className="nav-btn-nuevo" onClick={() => setModalAbierto(true)}>
          + Nuevo activo
        </button>
      </nav>

      <main className="home-main">
        <StatsPanel stats={stats} />
        <SearchBar
          filtros={filtros}
          onFiltrosChange={setFiltros}
          total={activosFiltrados.length}
        />
        <AssetGrid
          activos={activosFiltrados}
          loading={loading}
          onEliminar={eliminar}
          onLimpiarFiltros={() => setFiltros({ busqueda: "", estado: "", categoria: "" })}
          hayFiltrosActivos={hayFiltrosActivos}
        />
      </main>

      {modalAbierto && (
        <AssetForm
          onClose={() => setModalAbierto(false)}
          onGuardar={handleGuardar}
        />
      )}
    </div>
  )
}
```

- [ ] **Step 2: Reemplazar Home.css**

```css
/* src/pages/home/Home.css */
.home-wrapper {
  min-height: 100vh;
  background: var(--color-bg);
}

.home-nav {
  background: var(--color-primary);
  color: white;
  padding: 12px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 2px 8px rgba(13, 110, 253, 0.3);
}

.nav-title {
  font-weight: 700;
  font-size: 1rem;
}

.nav-btn-nuevo {
  background: white;
  color: var(--color-primary);
  border: none;
  padding: 7px 18px;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.15s;
  font-family: inherit;
}

.nav-btn-nuevo:hover {
  opacity: 0.9;
}

.home-main {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px 20px;
}

@media (max-width: 768px) {
  .home-nav {
    padding: 10px 16px;
  }

  .home-main {
    padding: 16px 12px;
  }
}
```

- [ ] **Step 3: Verificar en el navegador**

Ejecuta: `npm run dev`
Verifica en http://localhost:5173:
- Aparece el navbar azul con "IT Assets · Porceramica" y el botón "+ Nuevo activo"
- Las 4 tarjetas de stats aparecen debajo
- La SearchBar con input + 2 selects aparece
- Los activos se listan en el grid de 3 columnas
- Al presionar "+ Nuevo activo" se abre el modal del formulario
- Al guardar un activo el modal se cierra y aparece el toast verde
- Al presionar "Eliminar" aparece el toast de confirmación
- En móvil (<768px) el grid colapsa a 1 columna y los stats a 2×2

- [ ] **Step 4: Lint**

Ejecuta: `npm run lint`
Expected: sin errores.

- [ ] **Step 5: Commit**

```bash
git add src/pages/home/Home.jsx src/pages/home/Home.css
git commit -m "refactor: rewrite Home as orchestrator using component architecture"
```

---

## Task 14: Mejorar ActivoDetallePage

**Files:**
- Modify: `src/pages/activoDetallePage/ActivoDetallePage.jsx`
- Modify: `src/pages/activoDetallePage/ActivoDetallePage.css`

- [ ] **Step 1: Reemplazar ActivoDetallePage.jsx**

```jsx
// src/pages/activoDetallePage/ActivoDetallePage.jsx
import { useEffect, useState, useCallback } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Timestamp } from "firebase/firestore"
import {
  obtenerActivo,
  actualizarActivo,
  agregarPropietario
} from "../../services/activos.service"
import ModalFirma from "../../components/ModalFirma"
import { useToast } from "../../components/Toast"
import { ESTADO_LABELS, ESTADO_COLORS } from "../../utils/estados"
import "./ActivoDetallePage.css"

export default function ActivoDetallePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { showToast } = useToast()

  const [activo, setActivo] = useState(null)
  const [loading, setLoading] = useState(false)
  const [modalAbierto, setModalAbierto] = useState(false)

  const [editandoDatos, setEditandoDatos] = useState(false)
  const [editandoAccesorios, setEditandoAccesorios] = useState(false)

  const [estado, setEstado] = useState("")
  const [precio, setPrecio] = useState("")
  const [observaciones, setObservaciones] = useState("")

  const [accesorios, setAccesorios] = useState({})
  const [lineaNumero, setLineaNumero] = useState("")
  const [lineaPlan, setLineaPlan] = useState(false)

  const [nombreInput, setNombreInput] = useState("")
  const [idInput, setIdInput] = useState("")

  const cargarActivo = useCallback(async () => {
    try {
      const data = await obtenerActivo(id)
      setActivo(data)
      setEstado(data.estado || "")
      setPrecio(data.precio || "")
      setObservaciones(data.observaciones || "")
      setAccesorios(data.accesorios || {})
      setLineaNumero(data.accesorios?.lineaNumero || "")
      setLineaPlan(data.accesorios?.lineaPlan || false)
    } catch (e) {
      showToast(e.message, "error")
    }
  }, [id, showToast])

  useEffect(() => { cargarActivo() }, [cargarActivo])

  const guardarDatos = async () => {
    setLoading(true)
    try {
      await actualizarActivo(id, { estado, precio, observaciones })
      setEditandoDatos(false)
      showToast("Datos actualizados correctamente", "success")
      cargarActivo()
    } catch (e) {
      showToast(e.message, "error")
    } finally {
      setLoading(false)
    }
  }

  const guardarAccesorios = async () => {
    setLoading(true)
    try {
      await actualizarActivo(id, {
        accesorios: {
          ...accesorios,
          lineaNumero: accesorios.linea ? lineaNumero : null,
          lineaPlan: accesorios.linea ? lineaPlan : null,
        }
      })
      setEditandoAccesorios(false)
      showToast("Accesorios actualizados correctamente", "success")
      cargarActivo()
    } catch (e) {
      showToast(e.message, "error")
    } finally {
      setLoading(false)
    }
  }

  const abrirFirma = () => {
    if (!nombreInput) {
      showToast("Ingresa el nombre del propietario", "warning")
      return
    }
    setModalAbierto(true)
  }

  const guardarPropietario = async (firmaBase64) => {
    try {
      const propietarioData = {
        nombre: nombreInput || "Sin nombre",
        identificacion: idInput || "Sin ID",
        fechaAsignacion: Timestamp.now(),
        firmaBase64
      }
      await agregarPropietario(id, propietarioData)
      setModalAbierto(false)
      setNombreInput("")
      setIdInput("")
      showToast("Propietario asignado correctamente", "success")
      cargarActivo()
    } catch (e) {
      showToast(e.message, "error")
    }
  }

  if (!activo) {
    return (
      <div className="detalle-loading">
        <div className="detalle-skeleton-header" />
        <div className="detalle-skeleton-body">
          <div className="skeleton-line" style={{ width: "60%", height: "18px" }} />
          <div className="skeleton-line" style={{ width: "40%", height: "14px" }} />
          <div className="skeleton-line" style={{ width: "50%", height: "14px" }} />
        </div>
      </div>
    )
  }

  return (
    <div className="detalle-wrapper">

      {/* BREADCRUMB + VOLVER */}
      <div className="detalle-breadcrumb">
        <button className="btn-volver" onClick={() => navigate(-1)}>
          ← Volver
        </button>
        <span className="breadcrumb-text">
          Gestión de Activos / <strong>{activo.marca} {activo.modelo}</strong>
        </span>
      </div>

      <div className="container" style={{ maxWidth: "1100px" }}>

        {/* HEADER */}
        <div className="activo-header-pro">
          <div>
            <h1>{activo.marca} {activo.modelo}</h1>
            <span
              className="estado-pill"
              style={{ background: "rgba(255,255,255,0.25)" }}
            >
              {ESTADO_LABELS[estado] ?? estado}
            </span>
          </div>
          <div className="serial-box">
            <small>Serial</small>
            <strong>{activo.serialNumber}</strong>
          </div>
        </div>

        {/* RESUMEN */}
        <div className="resumen-grid">
          <div>
            <small>Precio</small>
            <h3>${Number(precio || 0).toLocaleString()}</h3>
          </div>
          <div>
            <small>IMEI</small>
            <p>{activo.imei1 || "-"}</p>
          </div>
          <div>
            <small>Creado</small>
            <p>{activo.creadoEn?.toDate().toLocaleDateString()}</p>
          </div>
        </div>

        {/* DATOS */}
        <div className="card-detalle">
          <div className="section-header">
            <h4>Datos del activo</h4>
            <button
              className="btn btn-outline-primary btn-sm"
              onClick={() => setEditandoDatos(!editandoDatos)}
            >
              ✏️ Editar
            </button>
          </div>
          {editandoDatos ? (
            <>
              <select
                className="form-select mb-2"
                value={estado}
                onChange={e => setEstado(e.target.value)}
              >
                <option value="asignado">Asignado</option>
                <option value="en_bodega">En bodega</option>
                <option value="danado">Dañado</option>
                <option value="en_reparacion">En reparación</option>
                <option value="baja">Baja</option>
                <option value="reservado">Reservado</option>
              </select>
              <input
                className="form-control mb-2"
                placeholder="Precio"
                value={precio}
                onChange={e => setPrecio(e.target.value)}
              />
              <textarea
                className="form-control mb-3"
                placeholder="Observaciones"
                value={observaciones}
                onChange={e => setObservaciones(e.target.value)}
              />
              <button
                className="btn btn-success"
                onClick={guardarDatos}
                disabled={loading}
              >
                Guardar
              </button>
            </>
          ) : (
            <>
              <p><strong>Estado:</strong> {ESTADO_LABELS[estado] ?? estado}</p>
              <p><strong>Observaciones:</strong> {observaciones || "-"}</p>
            </>
          )}
        </div>

        {/* ACCESORIOS */}
        <div className="card-detalle">
          <div className="section-header">
            <h4>Accesorios</h4>
            <button
              className="btn btn-outline-primary btn-sm"
              onClick={() => setEditandoAccesorios(!editandoAccesorios)}
            >
              ✏️ Editar
            </button>
          </div>
          {editandoAccesorios ? (
            <>
              <div className="accesorios-grid">
                {Object.keys(accesorios).map(a => (
                  <div key={a} style={{ display: "flex", flexDirection: "column" }}>
                    <label>
                      <input
                        type="checkbox"
                        checked={accesorios[a]}
                        onChange={() => setAccesorios(p => ({ ...p, [a]: !p[a] }))}
                      />
                      {a.toUpperCase()}
                    </label>
                    {a === "linea" && accesorios.linea && (
                      <div style={{ marginTop: "0.5rem" }}>
                        <input
                          type="text"
                          className="form-control mb-2"
                          placeholder="Número de línea"
                          value={lineaNumero}
                          onChange={e => setLineaNumero(e.target.value)}
                        />
                        <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                          <input
                            type="checkbox"
                            checked={lineaPlan}
                            onChange={e => setLineaPlan(e.target.checked)}
                          />
                          Con plan
                        </label>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <button
                className="btn btn-success mt-3"
                onClick={guardarAccesorios}
                disabled={loading}
              >
                Guardar
              </button>
            </>
          ) : (
            <div className="accesorios-chips">
              {Object.entries(accesorios).map(([k, v]) => (
                <span key={k} className={`chip ${v ? "on" : "off"}`}>
                  {k.toUpperCase()}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* ASIGNAR PROPIETARIO */}
        <div className="card-form">
          <h5>Asignar propietario</h5>
          <input
            className="form-input"
            placeholder="Nombre *"
            value={nombreInput}
            onChange={e => setNombreInput(e.target.value)}
          />
          <input
            className="form-input"
            placeholder="Identificación (opcional)"
            value={idInput}
            onChange={e => setIdInput(e.target.value)}
          />
          <button onClick={abrirFirma}>Firmar y asignar</button>
        </div>

        {modalAbierto && (
          <ModalFirma
            titulo="Firma del propietario"
            onClose={() => setModalAbierto(false)}
            onSave={guardarPropietario}
          />
        )}

        {/* PROPIETARIO ACTUAL */}
        {activo.propietarioActual && (
          <div className="prop-card">
            <div>
              <strong>{activo.propietarioActual.nombre}</strong>
              <small>{activo.propietarioActual.identificacion}</small>
              <small>
                {activo.propietarioActual.fechaAsignacion?.toDate().toLocaleString()}
              </small>
            </div>
            {activo.propietarioActual.firmaBase64 && (
              <img src={activo.propietarioActual.firmaBase64} alt="firma" />
            )}
          </div>
        )}

        {/* HISTORIAL */}
        <div className="card-detalle">
          <h4 className="mb-3">Historial de propietarios</h4>
          {activo.historial_propietarios?.length ? (
            <div className="historial-grid">
              {activo.historial_propietarios.map((p, i) =>
                p ? (
                  <div key={i} className="historial-card">
                    <div className="historial-head">
                      <strong>{p.nombre || "Sin nombre"}</strong>
                      <span>{p.identificacion || "Sin ID"}</span>
                    </div>
                    <small>{p.fechaAsignacion?.toDate().toLocaleString() || "-"}</small>
                    {p.firmaBase64 && (
                      <img src={p.firmaBase64} alt="firma" />
                    )}
                  </div>
                ) : null
              )}
            </div>
          ) : (
            <p className="text-muted">No hay historial de propietarios</p>
          )}
        </div>

      </div>
    </div>
  )
}
```

- [ ] **Step 2: Añadir estilos del breadcrumb y skeleton de detalle al final de ActivoDetallePage.css**

Agrega al final de `src/pages/activoDetallePage/ActivoDetallePage.css`:

```css
/* ===== BREADCRUMB ===== */
.detalle-breadcrumb {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 24px;
  background: white;
  border-bottom: 1px solid var(--color-border);
  position: sticky;
  top: 0;
  z-index: 50;
}

.btn-volver {
  padding: 6px 14px;
  background: var(--color-border);
  border: none;
  border-radius: var(--radius-btn);
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.15s;
  white-space: nowrap;
}

.btn-volver:hover {
  background: #d3d8dd;
}

.breadcrumb-text {
  font-size: 0.82rem;
  color: var(--color-muted);
}

.detalle-wrapper {
  min-height: 100vh;
  background: var(--color-bg);
}

/* ===== SKELETON DETALLE ===== */
.detalle-loading {
  max-width: 1100px;
  margin: 0 auto;
  padding: 24px 20px;
}

.detalle-skeleton-header {
  height: 100px;
  background: linear-gradient(90deg, #e9ecef 25%, #f4f5f6 50%, #e9ecef 75%);
  background-size: 200% 100%;
  animation: shimmer 1.4s infinite;
  border-radius: 20px;
  margin-bottom: 20px;
}

.detalle-skeleton-body {
  background: white;
  padding: 20px;
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}
```

- [ ] **Step 3: Verificar en el navegador**

Ejecuta: `npm run dev`
Navega a cualquier activo desde http://localhost:5173 y verifica:
- Aparece el breadcrumb "Gestión de Activos / {marca} {modelo}" en la parte superior
- El botón "← Volver" lleva de regreso a la lista
- Los estados se muestran como "En reparación", "En bodega", etc. (no `en_reparacion`)
- Guardar datos/accesorios muestra toast verde de confirmación
- Si falta el nombre al intentar asignar propietario, aparece toast naranja de advertencia

- [ ] **Step 4: Lint**

Ejecuta: `npm run lint`
Expected: sin errores.

- [ ] **Step 5: Commit**

```bash
git add src/pages/activoDetallePage/ActivoDetallePage.jsx src/pages/activoDetallePage/ActivoDetallePage.css
git commit -m "feat: improve ActivoDetallePage with back button, breadcrumb and toast notifications"
```

---

## Task 15: Build final y verificación

**Files:**
- No new files

- [ ] **Step 1: Ejecutar build de producción**

```bash
npm run build
```

Expected: salida como:
```
✓ built in X.XXs
dist/index.html          X kB
dist/assets/index-XXX.js   XXX kB
```
Sin errores de compilación.

- [ ] **Step 2: Verificar la build con preview**

```bash
npm run preview
```

Abre la URL que muestra (normalmente http://localhost:4173) y verifica el flujo completo:
1. La página carga con navbar, stats (en 0), search bar vacía
2. Los activos de Firestore aparecen en el grid con skeleton mientras cargan
3. Buscar "samsung" filtra los activos en tiempo real
4. Filtrar por estado "En bodega" muestra solo los correspondientes
5. "+ Nuevo activo" abre el modal → llena el form → guardar → aparece toast verde → activo en el grid
6. Click en activo → página de detalle → botón volver → regresa
7. En móvil (DevTools responsive) stats en 2×2, grid en 1 columna

- [ ] **Step 3: Commit final**

```bash
git add -A
git commit -m "chore: verify production build passes"
```

---

## Resumen de commits esperados

1. `style: add CSS custom properties for design system`
2. `feat: add estado labels and colors utility`
3. `feat: add Toast notification component with confirm support`
4. `feat: wrap app with ToastProvider`
5. `refactor: add error handling to activos service`
6. `feat: add useActivos hook with filtering, stats and debounce`
7. `style: add shared component CSS with responsive breakpoints`
8. `feat: add StatsPanel component`
9. `feat: add AssetCard component`
10. `feat: add SearchBar component with estado and categoria filters`
11. `feat: add AssetGrid with skeleton loader and empty states`
12. `feat: add AssetForm modal component extracted from Home`
13. `refactor: rewrite Home as orchestrator using component architecture`
14. `feat: improve ActivoDetallePage with back button, breadcrumb and toast notifications`
15. `chore: verify production build passes`
