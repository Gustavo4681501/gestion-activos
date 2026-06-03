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
        <span className="nav-title">📦 Gestión de Activos · Porceramica</span>
        <button className="nav-btn-nuevo" onClick={() => setModalAbierto(true)}>
          + Nuevo activo
        </button>
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
