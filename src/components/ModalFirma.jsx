import { useRef, useEffect, useState } from "react"

export default function ModalFirma({ onClose, onSave, precio }) {
  const canvasRef = useRef(null)
  const drawingRef = useRef(false)

  const [paso, setPaso] = useState(1)
  const [aceptaTerminos, setAceptaTerminos] = useState(false)
  const [hayFirma, setHayFirma] = useState(false)

  const isMobile = window.innerWidth < 768

  /* ================== CANVAS ================== */

  const getPos = (e) => {
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height

    if (e.touches && e.touches[0]) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      }
    }

    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    }
  }

  const start = (e) => {
    e.preventDefault()
    drawingRef.current = true
    const ctx = canvasRef.current.getContext("2d")
    const { x, y } = getPos(e)
    ctx.beginPath()
    ctx.moveTo(x, y)
  }

  const draw = (e) => {
    if (!drawingRef.current) return
    e.preventDefault()
    const ctx = canvasRef.current.getContext("2d")
    const { x, y } = getPos(e)
    ctx.lineTo(x, y)
    ctx.stroke()
    setHayFirma(true)
  }

  const stop = (e) => {
    e.preventDefault()
    drawingRef.current = false
  }

  const limpiarFirma = () => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    setHayFirma(false)
  }

  const guardar = () => {
    if (!hayFirma) {
      alert("Debe realizar la firma")
      return
    }
    const dataURL = canvasRef.current.toDataURL("image/png")
    onSave(dataURL)
  }

  useEffect(() => {
    if (paso !== 2) return
    const canvas = canvasRef.current

    if (isMobile) {
      canvas.width = window.innerWidth - 32
      canvas.height = 220
    } else {
      canvas.width = 700
      canvas.height = 260
    }

    const ctx = canvas.getContext("2d")
    ctx.lineWidth = 2.8
    ctx.strokeStyle = "#000"
    ctx.lineJoin = "round"
    ctx.lineCap = "round"
  }, [isMobile, paso])

  /* ================== UI ================== */

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>

        {/* ================= PASO 1 ================= */}
        {paso === 1 && (
          <>
            <h3 style={styles.title}>Términos y condiciones de entrega</h3>

            <div style={styles.terminosBox}>
              <p>
                Por medio del presente aviso, el colaborador acepta que el
                dispositivo electrónico entregado por <strong>Porceramica S.R.L. </strong> 
                es propiedad exclusiva de la empresa y será utilizado únicamente
                para fines laborales.
              </p>

              <ul>
                <li>El dispositivo deberá devolverse al finalizar la relación laboral con todos sus accesorios en buen estado.</li>
                <li>No se deben eliminar datos ni información empresarial almacenada en el equipo.</li>
                <li>El colaborador es responsable por cualquier daño, pérdida o mal uso del dispositivo. 
                  En caso de daño o pérdida por negligencia, se podrá cobrar un valor equivalente al costo actual del dispositivo: <strong>¢{precio || "0"}</strong>.</li>
                <li>La empresa podrá realizar revisiones de los dispositivos sin previo aviso para garantizar el correcto uso y mantenimiento.</li>
                <li>El equipo debe mantenerse con todos los accesorios: estuche, temperado, cargador, batería, cable y línea (si aplica).</li>
                <li>El dispositivo debe permanecer en la empresa o bajo custodia del colaborador según las indicaciones de la jefatura.</li>
                <li>Es obligatorio instalar las aplicaciones necesarias para el trabajo (WhatsApp Business, SAP Mobile u otras según función).</li>
              </ul>

              <p>
                Este acuerdo aplica para teléfonos, líneas, tablets, laptops y cualquier otro dispositivo asignado por la empresa. 
                La firma de este documento constituye aceptación de todos los puntos indicados.
              </p>

              <p style={{ fontSize: "0.85rem", color: "#555" }}>
                Porceramica S.R.L. – Cédula Jurídica 3-102-531466<br />
                Santa Ana, Pozos, Lindora<br />
                Tel: (506) 4036-8000 / 6332-2070
              </p>
            </div>

            <label style={styles.checkbox}>
              <input
                type="checkbox"
                checked={aceptaTerminos}
                onChange={(e) => setAceptaTerminos(e.target.checked)}
              />
              Acepto los términos y condiciones
            </label>

            <div style={styles.actions}>
              <button onClick={onClose} style={styles.btnSecondary}>
                Cancelar
              </button>
              <button
                disabled={!aceptaTerminos}
                onClick={() => setPaso(2)}
                style={{
                  ...styles.btnPrimary,
                  opacity: aceptaTerminos ? 1 : 0.5,
                }}
              >
                Continuar a la firma
              </button>
            </div>
          </>
        )}

        {/* ================= PASO 2 ================= */}
        {paso === 2 && (
          <>
            <h3 style={styles.title}>Firma del colaborador</h3>

            <canvas
              ref={canvasRef}
              style={styles.canvas}
              onMouseDown={start}
              onMouseMove={draw}
              onMouseUp={stop}
              onMouseLeave={stop}
              onTouchStart={start}
              onTouchMove={draw}
              onTouchEnd={stop}
            />

            <p style={styles.hint}>Firme en orientación horizontal</p>

            <div style={styles.actions}>
              <button onClick={() => setPaso(1)} style={styles.btnSecondary}>
                Volver
              </button>
              <button onClick={limpiarFirma} style={styles.btnWarning}>
                Limpiar
              </button>
              <button onClick={guardar} style={styles.btnPrimary}>
                Guardar firma
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

/* ================== STYLES ================== */

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.55)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
    padding: "12px",
  },
  modal: {
    background: "#fff",
    width: "100%",
    maxWidth: "780px",
    borderRadius: "16px",
    padding: "16px",
    maxHeight: "90vh",
    overflow: "auto",
  },
  title: {
    textAlign: "center",
    marginBottom: "10px",
    fontWeight: 600,
  },
  terminosBox: {
    border: "1px solid #ddd",
    borderRadius: "10px",
    padding: "16px",
    fontSize: "0.9rem",
    maxHeight: "40vh",
    overflowY: "auto",
    background: "#fafafa",
    lineHeight: 1.5,
  },
  checkbox: {
    display: "flex",
    gap: "8px",
    marginTop: "12px",
    alignItems: "center",
    fontWeight: 500,
  },
  canvas: {
    width: "100%",
    border: "2px dashed #aaa",
    borderRadius: "10px",
    background: "#fff",
    touchAction: "none",
  },
  hint: {
    fontSize: "0.85rem",
    color: "#666",
    textAlign: "center",
    marginTop: "6px",
  },
  actions: {
    display: "flex",
    gap: "10px",
    marginTop: "14px",
  },
  btnSecondary: {
    flex: 1,
    padding: "12px",
    borderRadius: "10px",
    border: "1px solid #ccc",
    background: "#f1f1f1",
    fontWeight: 500,
  },
  btnWarning: {
    flex: 1,
    padding: "12px",
    borderRadius: "10px",
    background: "#ffc107",
    border: "none",
    fontWeight: 500,
  },
  btnPrimary: {
    flex: 1,
    padding: "12px",
    borderRadius: "10px",
    background: "#198754",
    border: "none",
    color: "#fff",
    fontWeight: 600,
  },
}
