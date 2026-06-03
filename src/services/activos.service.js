// src/services/activos.service.js
import {
  collection,
  addDoc,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  Timestamp
} from "firebase/firestore"
import { db } from "../firebase/config"

export const crearActivo = async data => {
  try {
    await addDoc(collection(db, "activos"), {
      ...data,
      creadoEn: Timestamp.now(),
      historial_propietarios: [data.propietarioActual],
    })
  } catch {
    throw new Error("No se pudo registrar el activo")
  }
}

export const obtenerActivos = async () => {
  try {
    const snap = await getDocs(collection(db, "activos"))
    return snap.docs.map(d => ({ id: d.id, ...d.data() }))
  } catch {
    throw new Error("No se pudieron cargar los activos")
  }
}

export const obtenerActivo = async id => {
  try {
    const snap = await getDoc(doc(db, "activos", id))
    if (!snap.exists()) throw new Error("Activo no encontrado")
    return { id: snap.id, ...snap.data() }
  } catch (e) {
    throw new Error(e.message || "No se pudo cargar el activo")
  }
}

export const agregarPropietario = async (activoId, propietarioData) => {
  try {
    const ref = doc(db, "activos", activoId)
    const snap = await getDoc(ref)
    const activo = snap.data()
    await updateDoc(ref, {
      propietarioActual: propietarioData,
      historial_propietarios: [
        ...(activo.historial_propietarios || []),
        propietarioData,
      ],
      ultimaActualizacion: Timestamp.now(),
    })
  } catch {
    throw new Error("No se pudo asignar el propietario")
  }
}

export const actualizarActivo = async (activoId, datosActualizados) => {
  try {
    const ref = doc(db, "activos", activoId)
    await updateDoc(ref, {
      ...datosActualizados,
      ultimaActualizacion: Timestamp.now(),
    })
  } catch {
    throw new Error("No se pudieron guardar los cambios")
  }
}

export const eliminarActivo = async id => {
  try {
    await deleteDoc(doc(db, "activos", id))
  } catch {
    throw new Error("No se pudo eliminar el activo")
  }
}
