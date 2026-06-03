// src/components/SearchBar.jsx
import { ESTADO_LABELS } from "../utils/estados"

const ESTADOS = [
  { value: "", label: "Todos los estados" },
  ...Object.entries(ESTADO_LABELS).map(([value, label]) => ({ value, label })),
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
  const hayFiltros = filtros.busqueda !== "" || filtros.estado !== "" || filtros.categoria !== ""

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
