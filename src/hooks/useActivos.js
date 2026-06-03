// src/hooks/useActivos.js
import { useState, useEffect, useCallback, useMemo } from "react"
import {
  obtenerActivos,
  crearActivo as crearActivoService,
  eliminarActivo as eliminarActivoService
} from "../services/activos.service"
import { useToast } from "../components/Toast"

export function useActivos() {
  const [activos, setActivos] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtros, setFiltrosState] = useState({ busqueda: "", estado: "", categoria: "" })
  const [debouncedBusqueda, setDebouncedBusqueda] = useState("")
  const { showToast, showConfirm } = useToast()

  const cargar = useCallback(async () => {
    setLoading(true)
    try {
      const data = await obtenerActivos()
      setActivos(data)
    } catch (e) {
      showToast(e.message, "error")
    } finally {
      setLoading(false)
    }
  }, [showToast])

  useEffect(() => { cargar() }, [cargar])

  // Debounce de 300ms sobre el texto de búsqueda
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedBusqueda(filtros.busqueda), 300)
    return () => clearTimeout(timer)
  }, [filtros.busqueda])

  const setFiltros = useCallback((parcial) => {
    setFiltrosState(prev => ({ ...prev, ...parcial }))
  }, [])

  const activosFiltrados = useMemo(() => {
    const q = debouncedBusqueda.toLowerCase()
    return activos.filter(a => {
      if (filtros.estado && a.estado !== filtros.estado) return false
      if (filtros.categoria && a.categoria !== filtros.categoria) return false
      if (q) {
        const campos = [a.serialNumber, a.marca, a.modelo, a.propietarioActual?.nombre]
        if (!campos.some(v => v?.toLowerCase().includes(q))) return false
      }
      return true
    })
  }, [activos, debouncedBusqueda, filtros.estado, filtros.categoria])

  const stats = useMemo(() => ({
    total: activos.length,
    asignados: activos.filter(a => a.estado === "asignado").length,
    enBodega: activos.filter(a => a.estado === "en_bodega").length,
    danados: activos.filter(a => ["danado", "en_reparacion"].includes(a.estado)).length,
  }), [activos])

  const crear = useCallback(async (datos) => {
    try {
      await crearActivoService(datos)
      await cargar()
      showToast("Activo registrado correctamente", "success")
      return true
    } catch (e) {
      showToast(e.message, "error")
      return false
    }
  }, [cargar, showToast])

  const eliminar = useCallback(async (id) => {
    const ok = await showConfirm("¿Eliminar este activo? Esta acción no se puede deshacer.")
    if (!ok) return
    try {
      await eliminarActivoService(id)
      await cargar()
      showToast("Activo eliminado", "success")
    } catch (e) {
      showToast(e.message, "error")
    }
  }, [cargar, showToast, showConfirm])

  return {
    activos,
    activosFiltrados,
    loading,
    stats,
    filtros,
    setFiltros,
    crear,
    eliminar,
    recargar: cargar,
  }
}
