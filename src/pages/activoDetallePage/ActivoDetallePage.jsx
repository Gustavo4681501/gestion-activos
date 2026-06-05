// src/pages/activoDetallePage/ActivoDetallePage.jsx
import { useEffect, useState, useCallback } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { FiArrowLeft, FiEdit2, FiUpload, FiDownload, FiCheckCircle } from "react-icons/fi"
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

  // Préstamos
  const [prestamoNombre, setPrestamoNombre] = useState("")
  const [prestamoId, setPrestamoId] = useState("")
  const [prestamoObservaciones, setPrestamoObservaciones] = useState("")
  const [mostrarFormDevolucion, setMostrarFormDevolucion] = useState(false)
  const [notasDevolucion, setNotasDevolucion] = useState("")

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
      await cargarActivo()
    } catch (e) {
      showToast(e.message, "error")
    } finally {
      setLoading(false)
    }
  }

  const guardarAccesorios = async () => {
    setLoading(true)
    try {
      const tieneLinea = getAccesorios(activo.categoria).some(a => a.esLinea)
      const lineaData = tieneLinea && accesorios.linea ? { lineaNumero, lineaPlan } : {}
      await actualizarActivo(id, {
        accesorios: { ...accesorios, ...lineaData }
      })
      setEditandoAccesorios(false)
      showToast("Accesorios actualizados correctamente", "success")
      await cargarActivo()
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
      await cargarActivo()
    } catch (e) {
      showToast(e.message, "error")
    }
  }

  const handleRegistrarPrestamo = async () => {
    if (!prestamoNombre.trim()) {
      showToast("Ingresa el nombre del prestatario", "warning")
      return
    }
    setLoading(true)
    try {
      await registrarPrestamo(id, {
        nombre: prestamoNombre.trim(),
        identificacion: prestamoId.trim() || null,
        observaciones: prestamoObservaciones.trim() || null,
      })
      setPrestamoNombre("")
      setPrestamoId("")
      setPrestamoObservaciones("")
      showToast("Préstamo registrado correctamente", "success")
      await cargarActivo()
    } catch (e) {
      showToast(e.message, "error")
    } finally {
      setLoading(false)
    }
  }

  const handleDevolverPrestamo = async () => {
    setLoading(true)
    try {
      await devolverPrestamo(id, notasDevolucion.trim() || null)
      setMostrarFormDevolucion(false)
      setNotasDevolucion("")
      showToast("Devolución registrada correctamente", "success")
      await cargarActivo()
    } catch (e) {
      showToast(e.message, "error")
    } finally {
      setLoading(false)
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
      <div className="detalle-breadcrumb">
        <button className="btn-volver" onClick={() => navigate(-1)}><FiArrowLeft size={15} style={{ marginRight: 4 }} />Volver</button>
        <span className="breadcrumb-text">
          Gestión de Activos / <strong>{activo.marca} {activo.modelo}</strong>
        </span>
      </div>

      <div className="container" style={{ maxWidth: "1100px" }}>
        <div className="activo-header-pro">
          <div>
            <h1>{activo.marca} {activo.modelo}</h1>
            <span className="estado-pill">{ESTADO_LABELS[estado] ?? estado}</span>
          </div>
          <div className="serial-box">
            <small>Serial</small>
            <strong>{activo.serialNumber}</strong>
          </div>
        </div>

        <div className="resumen-grid">
          <div><small>Precio</small><h3>${Number(precio || 0).toLocaleString()}</h3></div>
          <div><small>IMEI</small><p>{activo.imei1 || "-"}</p></div>
          <div><small>Creado</small><p>{activo.creadoEn?.toDate().toLocaleDateString()}</p></div>
        </div>

        <div className="card-detalle">
          <div className="section-header">
            <h4>Datos del activo</h4>
            <button className="btn btn-outline-primary btn-sm" onClick={() => setEditandoDatos(!editandoDatos)}><FiEdit2 size={13} style={{ marginRight: 4 }} />Editar</button>
          </div>
          {editandoDatos ? (
            <>
              <select className="form-select mb-2" value={estado} onChange={e => setEstado(e.target.value)}>
                <option value="asignado">Asignado</option>
                <option value="en_bodega">En bodega</option>
                <option value="danado">Dañado</option>
                <option value="en_reparacion">En reparación</option>
                <option value="baja">Baja</option>
                <option value="reservado">Reservado</option>
              </select>
              <input className="form-control mb-2" placeholder="Precio" value={precio} onChange={e => setPrecio(e.target.value)} />
              <textarea className="form-control mb-3" placeholder="Observaciones" value={observaciones} onChange={e => setObservaciones(e.target.value)} />
              <button className="btn btn-success" onClick={guardarDatos} disabled={loading}>Guardar</button>
            </>
          ) : (
            <>
              <p><strong>Estado:</strong> {ESTADO_LABELS[estado] ?? estado}</p>
              <p><strong>Observaciones:</strong> {observaciones || "-"}</p>
            </>
          )}
        </div>

        <div className="card-detalle">
          <div className="section-header">
            <h4>Accesorios</h4>
            <button className="btn btn-outline-primary btn-sm" onClick={() => setEditandoAccesorios(!editandoAccesorios)}>✏️ Editar</button>
          </div>
          {editandoAccesorios ? (
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
              <button className="btn btn-success mt-3" onClick={guardarAccesorios} disabled={loading}>Guardar</button>
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

        <div className="card-form">
          <h5>Asignar propietario</h5>
          <input className="form-input" placeholder="Nombre *" value={nombreInput} onChange={e => setNombreInput(e.target.value)} />
          <input className="form-input" placeholder="Identificación (opcional)" value={idInput} onChange={e => setIdInput(e.target.value)} />
          <button onClick={abrirFirma} disabled={loading} className="btn btn-success">Firmar y asignar</button>
        </div>

        {modalAbierto && (
          <ModalFirma titulo="Firma del propietario" onClose={() => setModalAbierto(false)} onSave={guardarPropietario} />
        )}

        {activo.propietarioActual && (
          <div className="prop-card">
            <div>
              <strong>{activo.propietarioActual.nombre}</strong>
              <small>{activo.propietarioActual.identificacion}</small>
              <small>{activo.propietarioActual.fechaAsignacion?.toDate().toLocaleString()}</small>
            </div>
            {activo.propietarioActual.firmaBase64 && (
              <img src={activo.propietarioActual.firmaBase64} alt="firma" />
            )}
          </div>
        )}

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
                    {p.firmaBase64 && <img src={p.firmaBase64} alt="firma" />}
                  </div>
                ) : null
              )}
            </div>
          ) : (
            <p className="text-muted">No hay historial de propietarios</p>
          )}
        </div>

        {/* ===== PRÉSTAMOS ===== */}
        {(() => {
          const prestamo = activo.prestamoActivo
          return (
            <>
              {/* Banner préstamo activo */}
              {prestamo ? (
                <div className="prestamo-banner activo">
                  <div className="prestamo-banner-header">
                    <span className="prestamo-badge activo">
                      <FiUpload size={13} style={{ marginRight: 5 }} />Préstamo activo
                    </span>
                    {!mostrarFormDevolucion && (
                      <button
                        className="btn-devolver"
                        onClick={() => setMostrarFormDevolucion(true)}
                        disabled={loading}
                      >
                        <FiCheckCircle size={14} style={{ marginRight: 5 }} />Registrar devolución
                      </button>
                    )}
                  </div>

                  <div className="prestamo-banner-body">
                    <div className="prestamo-dato">
                      <small>Prestatario</small>
                      <strong>{prestamo.nombre}</strong>
                      {prestamo.identificacion && <span>{prestamo.identificacion}</span>}
                    </div>
                    <div className="prestamo-dato">
                      <small>Fecha de préstamo</small>
                      <span>{prestamo.fechaPrestamo?.toDate().toLocaleDateString("es-CR", { day: "2-digit", month: "short", year: "numeric" })}</span>
                    </div>
                    {prestamo.observaciones && (
                      <div className="prestamo-dato">
                        <small>Observaciones</small>
                        <span>{prestamo.observaciones}</span>
                      </div>
                    )}
                  </div>

                  {mostrarFormDevolucion && (
                    <div className="prestamo-devolucion-form">
                      <p style={{ margin: 0, fontWeight: 600, fontSize: "0.875rem" }}>
                        Confirmar devolución de {prestamo.nombre}
                      </p>
                      <textarea
                        className="form-input form-textarea"
                        placeholder="Notas de devolución (estado del activo, observaciones...)"
                        value={notasDevolucion}
                        onChange={e => setNotasDevolucion(e.target.value)}
                        style={{ minHeight: 70 }}
                      />
                      <div className="prestamo-devolucion-actions">
                        <button
                          className="btn-secondary"
                          onClick={() => { setMostrarFormDevolucion(false); setNotasDevolucion("") }}
                        >
                          Cancelar
                        </button>
                        <button
                          className="btn-devolver"
                          onClick={handleDevolverPrestamo}
                          disabled={loading}
                        >
                          Confirmar devolución
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Formulario para nuevo préstamo */
                <div className="card-detalle">
                  <h4 className="mb-3">Registrar préstamo</h4>
                  <div className="prestamo-nuevo-form">
                    <div className="form-row">
                      <input
                        className="form-input"
                        placeholder="Nombre del prestatario *"
                        value={prestamoNombre}
                        onChange={e => setPrestamoNombre(e.target.value)}
                      />
                      <input
                        className="form-input"
                        placeholder="Identificación (opcional)"
                        value={prestamoId}
                        onChange={e => setPrestamoId(e.target.value)}
                      />
                    </div>
                    <div className="form-row">
                      <textarea
                        className="form-input"
                        placeholder="Observaciones (opcional)"
                        value={prestamoObservaciones}
                        onChange={e => setPrestamoObservaciones(e.target.value)}
                        style={{ minHeight: 60, resize: "vertical" }}
                      />
                    </div>
                    <button
                      className="btn btn-primary"
                      onClick={handleRegistrarPrestamo}
                      disabled={loading}
                      style={{ alignSelf: "flex-start" }}
                    >
                      <FiUpload size={14} style={{ marginRight: 6 }} />Registrar préstamo
                    </button>
                  </div>
                </div>
              )}

              {/* Historial de préstamos */}
              {activo.historial_prestamos?.length > 0 && (
                <div className="card-detalle">
                  <h4 className="mb-3">Historial de préstamos</h4>
                  <div className="historial-prestamos-grid">
                    {activo.historial_prestamos.map((p, i) => {
                      const diasPrestado = p.fechaDevolucion && p.fechaPrestamo
                        ? Math.round((p.fechaDevolucion.toDate() - p.fechaPrestamo.toDate()) / 86400000)
                        : null
                      return (
                        <div key={i} className="historial-prestamo-card devuelto">
                          <div>
                            <div className="historial-prestamo-nombre">{p.nombre}</div>
                            {p.identificacion && (
                              <div className="historial-prestamo-id">{p.identificacion}</div>
                            )}
                            <div className="historial-prestamo-fechas">
                              <span><FiUpload size={12} style={{ marginRight: 4 }} />{p.fechaPrestamo?.toDate().toLocaleDateString("es-CR")}</span>
                              <span><FiDownload size={12} style={{ marginRight: 4 }} />{p.fechaDevolucion?.toDate().toLocaleDateString("es-CR")}</span>
                            </div>
                            {p.notasDevolucion && (
                              <div className="historial-prestamo-notas">"{p.notasDevolucion}"</div>
                            )}
                          </div>
                          {diasPrestado !== null && (
                            <div className="historial-prestamo-duracion">
                              {diasPrestado === 0 ? "Mismo día" : `${diasPrestado} día${diasPrestado !== 1 ? "s" : ""}`}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </>
          )
        })()}

      </div>
    </div>
  )
}
