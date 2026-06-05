import { useState, useCallback, useRef, useEffect } from "react"
import { FiCheckCircle, FiXCircle, FiAlertTriangle, FiTrash2 } from "react-icons/fi"
import { ToastContext } from "./useToast"
import "./Toast.css"

const ICONS = {
  success: <FiCheckCircle size={16} />,
  error: <FiXCircle size={16} />,
  warning: <FiAlertTriangle size={16} />,
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const resolversRef = useRef({})
  const timersRef = useRef({})

  const removeToast = useCallback((id) => {
    clearTimeout(timersRef.current[id])
    delete timersRef.current[id]
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const showToast = useCallback((message, type = "success") => {
    const id = Date.now() + Math.random()
    setToasts(prev => [...prev, { id, message, type }])
    timersRef.current[id] = setTimeout(() => removeToast(id), 4000)
  }, [removeToast])

  const showConfirm = useCallback((message) => {
    return new Promise(resolve => {
      const id = Date.now() + Math.random()
      resolversRef.current[id] = resolve
      setToasts(prev => [...prev, { id, message, type: "confirm" }])
    })
  }, [])

  const handleConfirm = useCallback((id, value) => {
    resolversRef.current[id]?.(value)
    delete resolversRef.current[id]
    removeToast(id)
  }, [removeToast])

  useEffect(() => {
    return () => {
      Object.values(resolversRef.current).forEach(resolve => resolve(false))
      resolversRef.current = {}
    }
  }, [])

  return (
    <ToastContext.Provider value={{ showToast, showConfirm }}>
      {children}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast toast-${t.type}`}>
            {t.type === "confirm" ? (
              <div className="toast-confirm-content">
                <span><FiTrash2 size={16} style={{ marginRight: 6 }} />{t.message}</span>
                <div className="toast-confirm-actions">
                  <button onClick={() => handleConfirm(t.id, true)}>Confirmar</button>
                  <button onClick={() => handleConfirm(t.id, false)}>Cancelar</button>
                </div>
              </div>
            ) : (
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}>{ICONS[t.type]} {t.message}</span>
            )}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export { useToast } from "./useToast"
