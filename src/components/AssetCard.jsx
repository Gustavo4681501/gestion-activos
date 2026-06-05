import { useNavigate } from "react-router-dom"
import { FiBox, FiHash, FiUser, FiSmartphone } from "react-icons/fi"
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
        <span><FiBox size={13} style={{ marginRight: 4 }} />{activo.categoria}</span>
        <span><FiHash size={13} style={{ marginRight: 4 }} />{activo.serialNumber}</span>
        <span><FiUser size={13} style={{ marginRight: 4 }} />{activo.propietarioActual?.nombre ?? "Sin asignar"}</span>
        {activo.accesorios?.linea && (
          <span><FiSmartphone size={13} style={{ marginRight: 4 }} />{activo.accesorios.lineaNumero} {activo.accesorios.lineaPlan ? "(Con plan)" : "(Sin plan)"}</span>
        )}
      </div>
      <div className="asset-card-footer">
        <button
          className="btn-eliminar"
          onClick={e => { e.stopPropagation(); onEliminar(activo.id) }}
        >
          Eliminar
        </button>
      </div>
    </div>
  )
}
