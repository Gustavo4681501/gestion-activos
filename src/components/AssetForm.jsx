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
              <input className="form-input" placeholder="Serial *" value={serial} onChange={e => setSerial(e.target.value)} />
              <input className="form-input" placeholder="IMEI (opcional)" value={imei} onChange={e => setImei(e.target.value)} />
            </div>
            <div className="form-row">
              <select className="form-input" value={categoria} onChange={e => setCategoria(e.target.value)}>
                <option value="">Categoría *</option>
                <option>Celular</option><option>Laptop</option><option>PC</option>
                <option>Tablet</option><option>Monitor</option><option>Otro</option>
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

          <div className="form-section">
            <p className="section-label">Accesorios</p>
            <div className="accesorios-grid">
              {Object.keys(accesorios).map(a => (
                <div key={a} className="accesorio-item">
                  <label>
                    <input type="checkbox" checked={accesorios[a]} onChange={() => toggleAccesorio(a)} />
                    {ACCESORIO_LABELS[a]}
                  </label>
                  {a === "linea" && accesorios.linea && (
                    <div className="linea-extra">
                      <input className="form-input" placeholder="Número de línea" value={lineaNumero} onChange={e => setLineaNumero(e.target.value)} />
                      <label>
                        <input type="checkbox" checked={lineaPlan} onChange={e => setLineaPlan(e.target.checked)} />
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
              <input type="checkbox" checked={asignarPropietario} onChange={e => setAsignarPropietario(e.target.checked)} />
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
        <ModalFirma onClose={() => setModalFirmaAbierto(false)} onSave={guardar} precio={precio} />
      )}
    </div>
  )
}
