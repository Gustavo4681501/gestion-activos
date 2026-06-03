// src/components/Toast.jsx
import { useState, useCallback, useRef } from "react"
import { ToastContext } from "./useToast"
import "./Toast.css"

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const resolversRef = useRef({})

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const showToast = useCallback((message, type = "success") => {
    const id = Date.now() + Math.random()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => removeToast(id), 4000)
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

  const ICONS = { success: "✅", error: "❌", warning: "⚠️" }

  return (
    <ToastContext.Provider value={{ showToast, showConfirm }}>
      {children}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast toast-${t.type}`}>
            {t.type === "confirm" ? (
              <div className="toast-confirm-content">
                <span>🗑️ {t.message}</span>
                <div className="toast-confirm-actions">
                  <button onClick={() => handleConfirm(t.id, true)}>Confirmar</button>
                  <button onClick={() => handleConfirm(t.id, false)}>Cancelar</button>
                </div>
              </div>
            ) : (
              <span>{ICONS[t.type]} {t.message}</span>
            )}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export { useToast } from "./useToast"
