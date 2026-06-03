// src/components/AssetForm.jsx
import { useState, useEffect } from "react"
import ModalFirma from "./ModalFirma"
import { useToast } from "./Toast"
import { getAccesorios, getAccesoriosInicial } from "../utils/accesorios"

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
  const [accesorios, setAccesorios] = useState({})
  const [lineaNumero, setLineaNumero] = useState("")
  const [lineaPlan, setLineaPlan] = useState(false)
  const [asignarPropietario, setAsignarPropietario] = useState(false)
  const [nombreInput, setNombreInput] = useState("")
  const [idInput, setIdInput] = useState("")
  const [modalFirmaAbierto, setModalFirmaAbierto] = useState(false)
  const [guardando, setGuardando] = useState(false)

  // Al cambiar categoría, reiniciar accesorios al set correspondiente
  useEffect(() => {
    setAccesorios(getAccesoriosInicial(categoria))
    setLineaNumero("")
    setLineaPlan(false)
  }, [categoria])

  const toggleAccesorio = key =>
    setAccesorios(prev => ({ ...prev, [key]: !prev[key] }))

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
    const tieneLinea = getAccesorios(categoria).some(a => a.esLinea)
    if (tieneLinea && accesorios.linea && !lineaNumero) {
      showToast("Ingresa el número de la línea", "warning")
      return false
    }
    return true
  }

  const handleSubmit = async () => {
    if (guardando) return
    if (!validar()) return
    if (asignarPropietario) {
      setGuardando(true)
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

    const tieneLinea = getAccesorios(categoria).some(a => a.esLinea)
    const lineaData = tieneLinea && accesorios.linea
      ? { lineaNumero, lineaPlan }
      : {}

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
        accesorios: { ...accesorios, ...lineaData },
        propietarioActual,
      })
    } finally {
      setGuardando(false)
    }
  }

  const itemsAccesorios = getAccesorios(categoria)

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <div className="modal-header">
          <h5>Registrar nuevo activo</h5>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          {/* Información básica */}
          <div className="form-section">
            <div className="form-row">
              <input className="form-input" placeholder="Serial *" value={serial} onChange={e => setSerial(e.target.value)} />
              <input className="form-input" placeholder="IMEI (opcional)" value={imei} onChange={e => setImei(e.target.value)} />
            </div>
            <div className="form-row">
              <select className="form-input" value={categoria} onChange={e => setCategoria(e.target.value)}>
                <option value="">Categoría *</option>
                <optgroup label="Tecnología">
                  <option>Celular</option>
                  <option>Laptop</option>
                  <option>PC</option>
                  <option>Tablet</option>
                  <option>Monitor</option>
                </optgroup>
                <optgroup label="Herramientas">
                  <option>Taladro</option>
                  <option>Rotomartillo</option>
                  <option value="Herramienta eléctrica">Herramienta eléctrica</option>
                </optgroup>
                <option>Otro</option>
              </select>
              <input className="form-input" placeholder="Marca *" value={marca} onChange={e => setMarca(e.target.value)} />
            </div>
            {categoria === "Otro" && (
              <input className="form-input" placeholder="Especificar categoría *" value={otraCategoria} onChange={e => setOtraCategoria(e.target.value)} />
            )}
            <div className="form-row">
              <input className="form-input" placeholder="Modelo *" value={modelo} onChange={e => setModelo(e.target.value)} />
              <input className="form-input" placeholder="Precio" value={precio} onChange={e => setPrecio(e.target.value)} />
            </div>
            <select className="form-input" value={estado} onChange={e => setEstado(e.target.value)}>
              <option value="asignado">Asignado</option>
              <option value="en_bodega">En bodega</option>
              <option value="danado">Dañado</option>
              <option value="en_reparacion">En reparación</option>
              <option value="baja">Baja</option>
              <option value="reservado">Reservado</option>
            </select>
            <textarea className="form-input form-textarea" placeholder="Observaciones (opcional)" value={observaciones} onChange={e => setObservaciones(e.target.value)} />
          </div>

          {/* Accesorios dinámicos por categoría */}
          {itemsAccesorios.length > 0 && (
            <div className="form-section">
              <p className="section-label">Accesorios</p>
              <div className="accesorios-grid">
                {itemsAccesorios.map(({ key, label, esLinea }) => (
                  <div key={key} className={`accesorio-item${esLinea && accesorios[key] ? " accesorio-item--expanded" : ""}`}>
                    <label>
                      <input
                        type="checkbox"
                        checked={accesorios[key] ?? false}
                        onChange={() => toggleAccesorio(key)}
                      />
                      {label}
                    </label>
                    {esLinea && accesorios[key] && (
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
          )}

          {/* Propietario */}
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
                <input className="form-input" placeholder="Nombre del propietario *" value={nombreInput} onChange={e => setNombreInput(e.target.value)} />
                <input className="form-input" placeholder="ID (opcional)" value={idInput} onChange={e => setIdInput(e.target.value)} />
              </div>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>Cancelar</button>
          <button className="btn-primary" onClick={handleSubmit} disabled={guardando}>
            {asignarPropietario ? "Continuar con firma ✍️" : "Guardar activo"}
          </button>
        </div>
      </div>

      {modalFirmaAbierto && (
        <ModalFirma
          onClose={() => { setModalFirmaAbierto(false); setGuardando(false) }}
          onSave={guardar}
          precio={precio}
        />
      )}
    </div>
  )
}
