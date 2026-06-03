# Diseño: Mejora de App IT Assets — Porceramica

**Fecha:** 2026-06-03  
**Estado:** Aprobado  
**Alcance:** Mejoras de diseño, arquitectura, escalabilidad y UX/UI sobre la app existente + búsqueda y filtros

---

## Contexto

App React + Vite + Firebase Firestore para gestión de activos IT de Porceramica S.R.L. Actualmente tiene dos páginas: `Home` (registro + lista) y `ActivoDetallePage` (detalle + asignación de propietario). El código de `Home.jsx` mezcla lógica de datos, validación, estado del formulario y renderizado en un solo archivo de ~290 líneas.

**Constraints:**
- Desktop-first, con responsive para móvil
- Cientos de activos (no miles) — búsqueda client-side es suficiente
- Mejorar lo existente + agregar búsqueda y filtros
- Estilo visual: Corporativo azul (Bootstrap blue refinado)
- No agregar autenticación ni TypeScript en esta iteración

---

## Enfoque elegido

**Enfoque B — Componentes + búsqueda real**: refactorización limpia sin sobreingeniería. Extraer componentes con responsabilidad única, un custom hook para la lógica de datos, búsqueda/filtros client-side con debounce, y mejoras de UX concretas.

---

## Arquitectura de componentes

### Estructura de archivos

```
src/
├── pages/
│   ├── home/
│   │   └── Home.jsx          # Solo orquesta componentes, sin lógica propia
│   └── activoDetallePage/
│       └── ActivoDetallePage.jsx  # Limpiado, + botón volver
├── hooks/
│   └── useActivos.js         # Toda la lógica de datos y filtrado
├── components/
│   ├── StatsPanel.jsx         # 4 tarjetas de métricas
│   ├── SearchBar.jsx          # Input + 2 selects + botón limpiar
│   ├── AssetGrid.jsx          # Grid de cards + estado vacío
│   ├── AssetCard.jsx          # Card individual de activo
│   ├── AssetForm.jsx          # Formulario completo (extraído de Home)
│   ├── ModalFirma.jsx         # Sin cambios funcionales, mejora visual menor
│   └── Toast.jsx              # Notificaciones no bloqueantes
└── services/
    └── activos.service.js     # Existente + manejo de errores básico
```

### Hook `useActivos`

Expone:
- `activos` — array completo desde Firestore
- `activosFiltrados` — array filtrado según búsqueda y filtros activos
- `loading` — boolean de estado de carga
- `stats` — objeto `{ total, asignados, enBodega, danados }`
- `filtros` — objeto `{ busqueda, estado, categoria }`
- `setFiltros(parcial)` — actualiza filtros (merge, no reemplazo)
- `crearActivo(datos)` — crea en Firestore y recarga
- `eliminarActivo(id)` — elimina con confirmación via toast
- `recargar()` — fuerza recarga desde Firestore

**Lógica de filtrado:** se ejecuta client-side en memoria sobre `activos`. La búsqueda por texto usa debounce de 300ms y busca en `serialNumber`, `marca`, `modelo` y `propietarioActual.nombre`. Los filtros de estado y categoría son exactos.

---

## Layout — Página principal (Home)

### Desktop (≥768px)

1. **Navbar**: barra azul con título "IT Assets · Porceramica" y botón "+ Nuevo activo" (abre modal)
2. **StatsPanel**: 4 tarjetas en fila — Total (azul), Asignados (verde), En bodega (cyan), Dañados/Reparación (rojo). Cada tarjeta tiene borde superior de color, número grande y etiqueta.
3. **SearchBar**: barra blanca con input de búsqueda (flex:2), select Estado, select Categoría, botón "✕ Limpiar", contador de resultados.
4. **AssetGrid**: grid de 3 columnas. Cada `AssetCard` muestra: nombre del activo, badge de estado, categoría, serial, propietario. Click navega al detalle.

### Mobile (<768px)
- Stats: grilla 2×2
- SearchBar: input en fila, selects apilados debajo
- AssetGrid: 1 columna

### Modal "Nuevo activo"
El `AssetForm` se renderiza dentro de un modal centrado con overlay. Se abre con "+ Nuevo activo" y se cierra con ✕ o al guardar correctamente.

---

## Layout — Página de detalle (ActivoDetallePage)

- Botón "← Volver" prominente en la parte superior izquierda
- Breadcrumb: "Gestión de Activos / {marca} {modelo}"
- El resto de la estructura existente se mantiene, con mejora visual consistente al estilo corporativo azul
- Los valores de estado se muestran como texto legible (`en_reparacion` → "En reparación") en todos los lugares

---

## Nuevas funcionalidades

### Búsqueda y filtros
- Input de búsqueda: busca en `serialNumber`, `marca`, `modelo`, `propietarioActual.nombre`
- Debounce de 300ms para no filtrar en cada tecla
- Filtro Estado: "Todos" | asignado | en_bodega | danado | en_reparacion | baja | reservado
- Filtro Categoría: "Todas" | Celular | Laptop | PC | Tablet | Monitor | Otro
- Botón "✕ Limpiar" limpia búsqueda y ambos filtros
- Contador de resultados: "X resultados" actualizado en tiempo real

### Dashboard stats
- Se calculan en el hook desde el array `activos` en memoria (sin llamadas extra a Firestore)
- Se recalculan automáticamente al crear o eliminar un activo
- Métricas: `total`, `asignados` (estado=asignado), `enBodega` (estado=en_bodega), `danados` (estado=danado + estado=en_reparacion)

---

## Mejoras de UX

### Toast de notificaciones (`Toast.jsx`)
Reemplaza todos los `alert()` y `confirm()` del código actual. Aparece en la esquina inferior derecha. Tipos: `success` (verde), `error` (rojo), `warning` (amarillo). Auto-desaparece en 4 segundos. El confirm de eliminación aparece como toast con botones "Confirmar" / "Cancelar" en lugar de `window.confirm`.

### Estados de carga
- Mientras `loading === true`: se muestran 6 skeleton cards animadas (efecto shimmer) en lugar del spinner genérico o pantalla en blanco
- Estado vacío: si `activosFiltrados.length === 0` y no hay búsqueda activa → ícono 📭 + "No hay activos registrados"
- Estado sin resultados: si hay búsqueda activa y no hay coincidencias → "No se encontraron activos para esta búsqueda" + botón "Limpiar filtros"

### Manejo de errores en servicios
`activos.service.js` envuelve las operaciones en try/catch y lanza errores con mensajes descriptivos. El hook los captura y los muestra via Toast.

---

## Estilo visual

- **Paleta**: Bootstrap azul `#0d6efd` como color primario. Verde `#28a745`, cyan `#0dcaf0`, rojo `#dc3545`, amarillo `#ffc107` para estados.
- **Fondo**: `#f8f9fa` (gris muy claro)
- **Cards**: blancas, `border-radius: 10px`, `box-shadow: 0 2px 6px rgba(0,0,0,0.06)`, borde `#e9ecef`
- **Navbar**: fondo `#0d6efd`, texto blanco
- **Tipografía**: `'Segoe UI', sans-serif` (ya existente)
- **CSS**: consolidar en variables CSS (`--color-primary`, `--color-bg`, etc.) para consistencia y eliminar valores hardcodeados duplicados entre `Home.css` y `ActivoDetallePage.css`

---

## Lo que NO cambia

- Lógica de Firebase (Firestore) — sin cambios en la estructura de datos
- `ModalFirma.jsx` — solo mejora visual superficial, misma funcionalidad
- `activos.service.js` — se añade manejo de errores pero no se modifica la interfaz pública
- Rutas de React Router — mismas rutas, mismos paths
- Sin autenticación (la configuración comentada en `firebase/config.js` se deja como está)
- Sin paginación en Firestore (client-side es suficiente para cientos de activos)
- Sin TypeScript

---

## Fuera de alcance

- Autenticación / sistema de roles
- Paginación en Firestore
- TypeScript
- Exportar a PDF/Excel
- Notificaciones push
- Modo oscuro
