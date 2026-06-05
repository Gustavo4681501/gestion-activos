import { useState } from "react"
import { FiBox, FiLogOut, FiPlus, FiAlertTriangle } from "react-icons/fi"
import { useActivos } from "../../hooks/useActivos"
import { useAuth } from "../../context/AuthContext"
import StatsPanel from "../../components/StatsPanel"
import SearchBar from "../../components/SearchBar"
import AssetGrid from "../../components/AssetGrid"
import AssetForm from "../../components/AssetForm"
import "./Home.css"

export default function Home() {
  const [modalAbierto, setModalAbierto] = useState(false)
  const [confirmarEliminarId, setConfirmarEliminarId] = useState(null)
  const { activosFiltrados, loading, stats, filtros, setFiltros, crear, eliminar } = useActivos()
  const { logout } = useAuth()

  const hayFiltrosActivos = !!(filtros.busqueda || filtros.estado || filtros.categoria)

  const handleGuardar = async (datos) => {
    const ok = await crear(datos)
    if (ok) setModalAbierto(false)
  }

  const handleConfirmarEliminar = async () => {
    await eliminar(confirmarEliminarId)
    setConfirmarEliminarId(null)
  }

  return (
    <div className="home-wrapper">
      <nav className="home-nav">
        <span className="nav-title"><FiBox size={18} style={{ marginRight: 8 }} />Gestión de Activos · Porceramica</span>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <button className="nav-btn-nuevo" onClick={() => setModalAbierto(true)}>
            <FiPlus size={15} style={{ marginRight: 4 }} />Nuevo activo
          </button>
          <button
            className="nav-btn-nuevo"
            onClick={logout}
            style={{ background: "transparent", border: "1.5px solid rgba(255,255,255,0.5)", color: "#fff" }}
          >
            <FiLogOut size={15} style={{ marginRight: 4 }} />Cerrar sesión
          </button>
        </div>
      </nav>

      <main className="home-main">
        <StatsPanel stats={stats} />
        <SearchBar filtros={filtros} onFiltrosChange={setFiltros} total={activosFiltrados.length} />
        <AssetGrid
          activos={activosFiltrados}
          loading={loading}
          onEliminar={setConfirmarEliminarId}
          onLimpiarFiltros={() => setFiltros({ busqueda: "", estado: "", categoria: "" })}
          hayFiltrosActivos={hayFiltrosActivos}
        />
      </main>

      {modalAbierto && (
        <AssetForm onClose={() => setModalAbierto(false)} onGuardar={handleGuardar} />
      )}

      {confirmarEliminarId && (
        <div className="modal-overlay" onClick={() => setConfirmarEliminarId(null)}>
          <div className="modal-confirm" onClick={e => e.stopPropagation()}>
            <div className="modal-confirm-icon">
              <FiAlertTriangle size={32} color="#e53e3e" />
            </div>
            <h3>¿Eliminar activo?</h3>
            <p>Esta acción no se puede deshacer.</p>
            <div className="modal-confirm-actions">
              <button className="btn btn-secondary" onClick={() => setConfirmarEliminarId(null)}>Cancelar</button>
              <button className="btn btn-danger" onClick={handleConfirmarEliminar}>Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
