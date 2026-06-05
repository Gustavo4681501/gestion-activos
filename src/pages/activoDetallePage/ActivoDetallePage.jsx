// src/pages/activoDetallePage/ActivoDetallePage.jsx
import { useEffect, useState, useCallback } from "react"
import { useParams, useNavigate } from "react-router-dom"
import {
  FiArrowLeft, FiEdit2, FiUpload, FiDownload, FiCheckCircle,
  FiMonitor, FiSmartphone, FiPrinter, FiWifi, FiPackage,
  FiInfo, FiSettings, FiUser, FiClock, FiSave, FiX, FiUserPlus,
} from "react-icons/fi"
import { Timestamp } from "firebase/firestore"
import {
  obtenerActivo,
  actualizarActivo,
  agregarPropietario,
  registrarPrestamo,
  devolverPrestamo,
} from "../../services/activos.service"
import ModalFirma from "../../components/ModalFirma"
import { useToast } from "../../components/Toast"
import { ESTADO_LABELS } from "../../utils/estados"
import { getAccesorios } from "../../utils/accesorios"
import "./ActivoDetallePage.css"

// ── Status config ────────────────────────────────────────────────
const STATUS_CONFIG = {
  asignado:      { color: "#16a34a", bg: "#f0fdf4" },
  en_bodega:     { color: "#6366f1", bg: "#eef2ff" },
  danado:        { color: "#ef4444", bg: "#fef2f2" },
  en_reparacion: { color: "#f59e0b", bg: "#fffbeb" },
  baja:          { color: "#6b7280", bg: "#f9fafb" },
  reservado:     { color: "#8b5cf6", bg: "#f5f3ff" },
}

// ── Category icon ────────────────────────────────────────────────
function CategoryIcon({ categoria, size = 24 }) {
  const c = (categoria || "").toLowerCase()
  if (c.includes("laptop") || c.includes("computadora") || c.includes("pc") || c.includes("notebook")) return <FiMonitor size={size} />
  if (c.includes("celular") || c.includes("teléfono") || c.includes("telefono") || c.includes("smartphone")) return <FiSmartphone size={size} />
  if (c.includes("impresora") || c.includes("printer")) return <FiPrinter size={size} />
  if (c.includes("router") || c.includes("switch") || c.includes("red") || c.includes("wifi")) return <FiWifi size={size} />
  return <FiPackage size={size} />
}

// ── Tabs ─────────────────────────────────────────────────────────
const TABS = [
  { id: "info",        label: "Información", icon: FiInfo },
  { id: "accesorios",  label: "Accesorios",  icon: FiSettings },
  { id: "propietario", label: "Propietario", icon: FiUser },
  { id: "prestamos",   label: "Préstamos",   icon: FiClock },
]

export default function ActivoDetallePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { showToast } = useToast()

  const [activo, setActivo]                     = useState(null)
  const [loading, setLoading]                   = useState(false)
  const [activeTab, setActiveTab]               = useState("info")
  const [modalFirmaAbierto, setModalFirmaAbierto] = useState(false)

  // Tab: Información
  const [editandoInfo, setEditandoInfo]         = useState(false)
  const [estado, setEstado]                     = useState("")
  const [precio, setPrecio]                     = useState("")
  const [observaciones, setObservaciones]       = useState("")

  // Tab: Accesorios
  const [editandoAcc, setEditandoAcc]           = useState(false)
  const [accesorios, setAccesorios]             = useState({})
  const [lineaNumero, setLineaNumero]           = useState("")
  const [lineaPlan, setLineaPlan]               = useState(false)

  // Tab: Propietario
  const [nombreInput, setNombreInput]           = useState("")
  const [idInput, setIdInput]                   = useState("")

  // Tab: Préstamos
  const [prestamoNombre, setPrestamoNombre]     = useState("")
  const [prestamoId, setPrestamoId]             = useState("")
  const [prestamoObs, setPrestamoObs]           = useState("")
  const [mostrarDevolucion, setMostrarDevolucion] = useState(false)
  const [notasDevolucion, setNotasDevolucion]   = useState("")

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

  const statusCfg = STATUS_CONFIG[estado] ?? { color: "#6366f1", bg: "#eef2ff" }

  // ── Guardar info ─────────────────────────────────────────────
  const guardarInfo = async () => {
    setLoading(true)
    try {
      await actualizarActivo(id, { estado, precio, observaciones })
      setEditandoInfo(false)
      showToast("Datos actualizados", "success")
      await cargarActivo()
    } catch (e) {
      showToast(e.message, "error")
    } finally { setLoading(false) }
  }

  // ── Guardar accesorios ───────────────────────────────────────
  const guardarAccesorios = async () => {
    setLoading(true)
    try {
      const tieneLinea = getAccesorios(activo.categoria).some(a => a.esLinea)
      const lineaData = tieneLinea && accesorios.linea ? { lineaNumero, lineaPlan } : {}
      await actualizarActivo(id, { accesorios: { ...accesorios, ...lineaData } })
      setEditandoAcc(false)
      showToast("Accesorios actualizados", "success")
      await cargarActivo()
    } catch (e) {
      showToast(e.message, "error")
    } finally { setLoading(false) }
  }

  // ── Propietario ──────────────────────────────────────────────
  const abrirFirma = () => {
    if (!nombreInput.trim()) { showToast("Ingresa el nombre del propietario", "warning"); return }
    setModalFirmaAbierto(true)
  }

  const guardarPropietario = async (firmaBase64) => {
    try {
      await agregarPropietario(id, {
        nombre: nombreInput.trim(),
        identificacion: idInput.trim() || "Sin ID",
        fechaAsignacion: Timestamp.now(),
        firmaBase64,
      })
      setModalFirmaAbierto(false)
      setNombreInput("")
      setIdInput("")
      showToast("Propietario asignado", "success")
      await cargarActivo()
    } catch (e) { showToast(e.message, "error") }
  }

  // ── Préstamos ────────────────────────────────────────────────
  const handleRegistrarPrestamo = async () => {
    if (!prestamoNombre.trim()) { showToast("Ingresa el nombre del prestatario", "warning"); return }
    setLoading(true)
    try {
      await registrarPrestamo(id, {
        nombre: prestamoNombre.trim(),
        identificacion: prestamoId.trim() || null,
        observaciones: prestamoObs.trim() || null,
      })
      setPrestamoNombre(""); setPrestamoId(""); setPrestamoObs("")
      showToast("Préstamo registrado", "success")
      await cargarActivo()
    } catch (e) { showToast(e.message, "error") }
    finally { setLoading(false) }
  }

  const handleDevolverPrestamo = async () => {
    setLoading(true)
    try {
      await devolverPrestamo(id, notasDevolucion.trim() || null)
      setMostrarDevolucion(false)
      setNotasDevolucion("")
      showToast("Devolución registrada", "success")
      await cargarActivo()
    } catch (e) { showToast(e.message, "error") }
    finally { setLoading(false) }
  }

  // ── Loading skeleton ─────────────────────────────────────────
  if (!activo) {
    return (
      <div style={{ minHeight: "100vh", background: "#eef1f6" }}>
        <div style={{ background: "#fff", borderBottom: "1px solid #e2e8f0", padding: "10px 24px" }}>
          <div style={{ width: 80, height: 30, borderRadius: 8, background: "#e2e8f0" }} />
        </div>
        <div className="detalle-loading">
          <div className="detalle-skeleton-header" />
          <div className="detalle-skeleton-tabs" />
          <div className="detalle-skeleton-body">
            <div className="skeleton-line" style={{ width: "60%", height: "16px" }} />
            <div className="skeleton-line" style={{ width: "40%", height: "14px" }} />
            <div className="skeleton-line" style={{ width: "55%", height: "14px" }} />
          </div>
        </div>
      </div>
    )
  }

  const prestamo = activo.prestamoActivo
  const histPropietarios = activo.historial_propietarios?.filter(Boolean) ?? []
  const histPrestamos = activo.historial_prestamos ?? []

  return (
    <div
      className="detalle-wrapper"
      style={{
        "--status-color": statusCfg.color,
        "--status-bg":    statusCfg.bg,
      }}
    >
      {/* BREADCRUMB */}
      <div className="detalle-breadcrumb">
        <button className="btn-volver" onClick={() => navigate(-1)}>
          <FiArrowLeft size={14} /> Volver
        </button>
        <span className="breadcrumb-text">
          Gestión de Activos / <strong>{activo.marca} {activo.modelo}</strong>
        </span>
      </div>

      <div className="detalle-contenedor">

        {/* HERO */}
        <div className="activo-hero">
          <div className="hero-top">
            <div className="hero-icon-wrap">
              <CategoryIcon categoria={activo.categoria} size={26} />
            </div>
            <div className="hero-title-block">
              <div className="hero-categoria">{activo.categoria}</div>
              <h1>{activo.marca} {activo.modelo}</h1>
            </div>
            <div className="hero-status-pill">
              <span className="hero-status-dot" />
              {ESTADO_LABELS[estado] ?? estado}
            </div>
          </div>

          <div className="hero-meta">
            <div className="hero-meta-item">
              <span className="hero-meta-label">Serial</span>
              <span className="hero-meta-value mono">{activo.serialNumber || "—"}</span>
            </div>
            {activo.imei1 && (
              <div className="hero-meta-item">
                <span className="hero-meta-label">IMEI</span>
                <span className="hero-meta-value mono">{activo.imei1}</span>
              </div>
            )}
            <div className="hero-meta-item">
              <span className="hero-meta-label">Precio</span>
              <span className="hero-meta-value price">
                ${Number(precio || 0).toLocaleString()}
              </span>
            </div>
            <div className="hero-meta-item">
              <span className="hero-meta-label">Registrado</span>
              <span className="hero-meta-value">{activo.creadoEn?.toDate().toLocaleDateString("es-CR", { day: "2-digit", month: "short", year: "numeric" })}</span>
            </div>
            {activo.propietarioActual && (
              <div className="hero-meta-item">
                <span className="hero-meta-label">Asignado a</span>
                <span className="hero-meta-value">{activo.propietarioActual.nombre}</span>
              </div>
            )}
          </div>
        </div>

        {/* TABS NAV */}
        <div className="detalle-tabs">
          {TABS.map(tab => {
            const Icon = tab.icon
            const badge =
              tab.id === "propietario" ? (histPropietarios.length || null) :
              tab.id === "prestamos"   ? (histPrestamos.length || null) :
              null
            return (
              <button
                key={tab.id}
                className={`tab-btn${activeTab === tab.id ? " active" : ""}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon size={15} />
                {tab.label}
                {badge ? <span className="tab-badge">{badge}</span> : null}
              </button>
            )
          })}
        </div>

        {/* ─── TAB: INFORMACIÓN ─────────────────────────────── */}
        {activeTab === "info" && (
          <div className="tab-panel">
            <div className="detalle-section">
              <div className="detalle-section-header">
                <p className="detalle-section-title">Datos del activo</p>
                {!editandoInfo && (
                  <button className="btn-edit" onClick={() => setEditandoInfo(true)}>
                    <FiEdit2 size={12} /> Editar
                  </button>
                )}
              </div>

              {editandoInfo ? (
                <div className="edit-form">
                  <div className="edit-form-row">
                    <div className="edit-form-group">
                      <label>Estado</label>
                      <select value={estado} onChange={e => setEstado(e.target.value)}>
                        <option value="asignado">Asignado</option>
                        <option value="en_bodega">En bodega</option>
                        <option value="danado">Dañado</option>
                        <option value="en_reparacion">En reparación</option>
                        <option value="baja">Baja</option>
                        <option value="reservado">Reservado</option>
                      </select>
                    </div>
                    <div className="edit-form-group">
                      <label>Precio</label>
                      <input
                        placeholder="0"
                        value={precio}
                        onChange={e => setPrecio(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="edit-form-group full-width">
                    <label>Observaciones</label>
                    <textarea
                      placeholder="Notas sobre el activo..."
                      value={observaciones}
                      onChange={e => setObservaciones(e.target.value)}
                    />
                  </div>
                  <div className="edit-form-actions">
                    <button className="btn-save" onClick={guardarInfo} disabled={loading}>
                      <FiSave size={14} /> Guardar
                    </button>
                    <button className="btn-cancel" onClick={() => setEditandoInfo(false)}>
                      <FiX size={14} /> Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="info-grid">
                  <div className="info-field">
                    <span className="info-field-label">Estado</span>
                    <span className="info-field-value" style={{ color: statusCfg.color, fontWeight: 700 }}>
                      {ESTADO_LABELS[estado] ?? estado}
                    </span>
                  </div>
                  <div className="info-field">
                    <span className="info-field-label">Precio</span>
                    <span className="info-field-value">${Number(precio || 0).toLocaleString()}</span>
                  </div>
                  <div className="info-field full-width">
                    <span className="info-field-label">Observaciones</span>
                    <span className={`info-field-value${!observaciones ? " empty" : ""}`}>
                      {observaciones || "Sin observaciones"}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <hr className="detalle-divider" />

            <div className="detalle-section">
              <p className="detalle-section-title">Datos técnicos</p>
              <div className="info-grid">
                <div className="info-field">
                  <span className="info-field-label">Marca</span>
                  <span className="info-field-value">{activo.marca || "—"}</span>
                </div>
                <div className="info-field">
                  <span className="info-field-label">Modelo</span>
                  <span className="info-field-value">{activo.modelo || "—"}</span>
                </div>
                <div className="info-field">
                  <span className="info-field-label">Serial</span>
                  <span className="info-field-value mono">{activo.serialNumber || "—"}</span>
                </div>
                <div className="info-field">
                  <span className="info-field-label">Categoría</span>
                  <span className="info-field-value">{activo.categoria || "—"}</span>
                </div>
                {activo.imei1 && (
                  <div className="info-field">
                    <span className="info-field-label">IMEI 1</span>
                    <span className="info-field-value mono">{activo.imei1}</span>
                  </div>
                )}
                {activo.imei2 && (
                  <div className="info-field">
                    <span className="info-field-label">IMEI 2</span>
                    <span className="info-field-value mono">{activo.imei2}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ─── TAB: ACCESORIOS ──────────────────────────────── */}
        {activeTab === "accesorios" && (
          <div className="tab-panel">
            <div className="detalle-section">
              <div className="detalle-section-header">
                <p className="detalle-section-title">Accesorios incluidos</p>
                {!editandoAcc && (
                  <button className="btn-edit" onClick={() => setEditandoAcc(true)}>
                    <FiEdit2 size={12} /> Editar
                  </button>
                )}
              </div>

              {editandoAcc ? (
                <>
                  <div className="accesorios-grid">
                    {getAccesorios(activo.categoria).map(({ key, label, esLinea }) => (
                      <div key={key} className={`accesorio-item${esLinea && accesorios[key] ? " accesorio-item--expanded" : ""}`}>
                        <label>
                          <input
                            type="checkbox"
                            checked={accesorios[key] ?? false}
                            onChange={() => setAccesorios(p => ({ ...p, [key]: !p[key] }))}
                          />
                          {label}
                        </label>
                        {esLinea && accesorios[key] && (
                          <div className="linea-extra">
                            <input
                              type="text"
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
                  <div className="edit-form-actions" style={{ marginTop: 12 }}>
                    <button className="btn-save" onClick={guardarAccesorios} disabled={loading}>
                      <FiSave size={14} /> Guardar
                    </button>
                    <button className="btn-cancel" onClick={() => setEditandoAcc(false)}>
                      <FiX size={14} /> Cancelar
                    </button>
                  </div>
                </>
              ) : (
                <div className="accesorios-chips">
                  {getAccesorios(activo.categoria).map(({ key, label }) => (
                    <span key={key} className={`chip ${accesorios[key] ? "on" : "off"}`}>
                      {label}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─── TAB: PROPIETARIO ─────────────────────────────── */}
        {activeTab === "propietario" && (
          <div className="tab-panel">

            {/* Propietario actual */}
            <div className="detalle-section">
              <p className="detalle-section-title">Propietario actual</p>
              {activo.propietarioActual ? (
                <div className="prop-actual-card">
                  <div className="prop-actual-info">
                    <span className="prop-actual-nombre">{activo.propietarioActual.nombre}</span>
                    <span className="prop-actual-id">{activo.propietarioActual.identificacion}</span>
                    <span className="prop-actual-fecha">
                      Desde {activo.propietarioActual.fechaAsignacion?.toDate().toLocaleDateString("es-CR", { day: "2-digit", month: "short", year: "numeric" })}
                    </span>
                  </div>
                  {activo.propietarioActual.firmaBase64 && (
                    <img src={activo.propietarioActual.firmaBase64} alt="firma" className="prop-actual-firma" />
                  )}
                </div>
              ) : (
                <p className="detalle-empty">Sin propietario asignado</p>
              )}
            </div>

            <hr className="detalle-divider" />

            {/* Asignar nuevo propietario */}
            <div className="detalle-section">
              <p className="detalle-section-title">Asignar propietario</p>
              <div className="asignar-form">
                <div className="asignar-form-row">
                  <input
                    placeholder="Nombre *"
                    value={nombreInput}
                    onChange={e => setNombreInput(e.target.value)}
                  />
                  <input
                    placeholder="Identificación (opcional)"
                    value={idInput}
                    onChange={e => setIdInput(e.target.value)}
                  />
                </div>
                <button className="btn-asignar" onClick={abrirFirma} disabled={loading}>
                  <FiUserPlus size={15} /> Firmar y asignar
                </button>
              </div>
            </div>

            <hr className="detalle-divider" />

            {/* Historial */}
            <div className="detalle-section">
              <p className="detalle-section-title">
                Historial de propietarios ({histPropietarios.length})
              </p>
              {histPropietarios.length > 0 ? (
                <div className="historial-grid">
                  {histPropietarios.map((p, i) => (
                    <div key={i} className="historial-card">
                      <div className="historial-card-avatar">
                        <FiUser size={15} />
                      </div>
                      <div className="historial-card-info">
                        <div className="historial-card-nombre">{p.nombre || "Sin nombre"}</div>
                        <div className="historial-card-id">{p.identificacion || "—"}</div>
                        <div className="historial-card-fecha">
                          {p.fechaAsignacion?.toDate().toLocaleString("es-CR")}
                        </div>
                      </div>
                      {p.firmaBase64 && (
                        <img src={p.firmaBase64} alt="firma" className="historial-card-firma" />
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="detalle-empty">No hay historial de propietarios</p>
              )}
            </div>
          </div>
        )}

        {/* ─── TAB: PRÉSTAMOS ───────────────────────────────── */}
        {activeTab === "prestamos" && (
          <div className="tab-panel">

            {prestamo ? (
              /* Préstamo activo */
              <div className="detalle-section">
                <div className="prestamo-activo-banner">
                  <div className="prestamo-activo-header">
                    <span className="prestamo-activo-badge">
                      <FiUpload size={12} /> Préstamo activo
                    </span>
                    {!mostrarDevolucion && (
                      <button className="btn-devolver" onClick={() => setMostrarDevolucion(true)} disabled={loading}>
                        <FiCheckCircle size={13} /> Registrar devolución
                      </button>
                    )}
                  </div>

                  <div className="prestamo-activo-datos">
                    <div className="prestamo-dato-item">
                      <span className="prestamo-dato-label">Prestatario</span>
                      <span className="prestamo-dato-value">{prestamo.nombre}</span>
                      {prestamo.identificacion && <span className="prestamo-dato-sub">{prestamo.identificacion}</span>}
                    </div>
                    <div className="prestamo-dato-item">
                      <span className="prestamo-dato-label">Fecha de préstamo</span>
                      <span className="prestamo-dato-value">
                        {prestamo.fechaPrestamo?.toDate().toLocaleDateString("es-CR", { day: "2-digit", month: "short", year: "numeric" })}
                      </span>
                    </div>
                    {prestamo.observaciones && (
                      <div className="prestamo-dato-item">
                        <span className="prestamo-dato-label">Observaciones</span>
                        <span className="prestamo-dato-sub">{prestamo.observaciones}</span>
                      </div>
                    )}
                  </div>

                  {mostrarDevolucion && (
                    <div className="devolucion-form">
                      <p className="devolucion-form-title">Confirmar devolución de {prestamo.nombre}</p>
                      <textarea
                        placeholder="Notas de devolución (estado del activo, observaciones...)"
                        value={notasDevolucion}
                        onChange={e => setNotasDevolucion(e.target.value)}
                      />
                      <div className="devolucion-form-actions">
                        <button className="btn-cancel" onClick={() => { setMostrarDevolucion(false); setNotasDevolucion("") }}>
                          <FiX size={13} /> Cancelar
                        </button>
                        <button className="btn-registrar-devolucion" onClick={handleDevolverPrestamo} disabled={loading}>
                          <FiCheckCircle size={13} /> Confirmar devolución
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Formulario nuevo préstamo */
              <div className="detalle-section">
                <p className="detalle-section-title">Registrar préstamo</p>
                <div className="nuevo-prestamo-form">
                  <div className="nuevo-prestamo-form-row">
                    <input
                      placeholder="Nombre del prestatario *"
                      value={prestamoNombre}
                      onChange={e => setPrestamoNombre(e.target.value)}
                    />
                    <input
                      placeholder="Identificación (opcional)"
                      value={prestamoId}
                      onChange={e => setPrestamoId(e.target.value)}
                    />
                  </div>
                  <textarea
                    placeholder="Observaciones (opcional)"
                    value={prestamoObs}
                    onChange={e => setPrestamoObs(e.target.value)}
                  />
                  <button className="btn-registrar-prestamo" onClick={handleRegistrarPrestamo} disabled={loading}>
                    <FiUpload size={14} /> Registrar préstamo
                  </button>
                </div>
              </div>
            )}

            {histPrestamos.length > 0 && (
              <>
                <hr className="detalle-divider" />
                <div className="detalle-section">
                  <p className="detalle-section-title">Historial de préstamos ({histPrestamos.length})</p>
                  <div className="historial-prestamos-list">
                    {histPrestamos.map((p, i) => {
                      const dias = p.fechaDevolucion && p.fechaPrestamo
                        ? Math.round((p.fechaDevolucion.toDate() - p.fechaPrestamo.toDate()) / 86400000)
                        : null
                      return (
                        <div key={i} className="historial-prestamo-item">
                          <div>
                            <div className="historial-prestamo-nombre">{p.nombre}</div>
                            {p.identificacion && <div className="historial-prestamo-id">{p.identificacion}</div>}
                            <div className="historial-prestamo-fechas">
                              <span><FiUpload size={11} style={{ marginRight: 3 }} />{p.fechaPrestamo?.toDate().toLocaleDateString("es-CR")}</span>
                              <span><FiDownload size={11} style={{ marginRight: 3 }} />{p.fechaDevolucion?.toDate().toLocaleDateString("es-CR")}</span>
                            </div>
                            {p.notasDevolucion && (
                              <div className="historial-prestamo-notas">"{p.notasDevolucion}"</div>
                            )}
                          </div>
                          {dias !== null && (
                            <span className="historial-prestamo-dias">
                              {dias === 0 ? "Mismo día" : `${dias}d`}
                            </span>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              </>
            )}

          </div>
        )}

      </div>

      {/* Modal firma */}
      {modalFirmaAbierto && (
        <ModalFirma
          titulo="Firma del propietario"
          onClose={() => setModalFirmaAbierto(false)}
          onSave={guardarPropietario}
        />
      )}
    </div>
  )
}
