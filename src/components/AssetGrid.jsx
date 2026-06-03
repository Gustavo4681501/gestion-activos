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

export default function AssetGrid({ activos = [], loading, onEliminar, onLimpiarFiltros, hayFiltrosActivos }) {
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
