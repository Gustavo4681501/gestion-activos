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
