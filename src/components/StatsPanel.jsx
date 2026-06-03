// src/components/StatsPanel.jsx

const ITEMS = [
  { key: "total",     label: "Total activos",       color: "var(--color-primary)" },
  { key: "asignados", label: "Asignados",            color: "var(--color-success)" },
  { key: "enBodega",  label: "En bodega",            color: "var(--color-info)"    },
  { key: "danados",   label: "Dañados / Reparación", color: "var(--color-danger)"  },
]

export default function StatsPanel({ stats }) {
  return (
    <div className="stats-panel">
      {ITEMS.map(({ key, label, color }) => (
        <div key={key} className="stat-card" style={{ borderTopColor: color }}>
          <span className="stat-label">{label}</span>
          <strong className="stat-value" style={{ color }}>{stats[key]}</strong>
        </div>
      ))}
    </div>
  )
}
