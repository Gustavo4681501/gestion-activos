# Diseño: Autenticación Email/Password — Gestión de Activos Porceramica

## Resumen

Agregar autenticación con email y contraseña usando Firebase Auth. Todas las rutas de la app quedan protegidas. Los usuarios los crea el administrador desde la consola de Firebase. No hay roles — todos los usuarios autenticados tienen el mismo acceso.

## Arquitectura

### Archivos nuevos

| Archivo | Propósito |
|---|---|
| `src/context/AuthContext.jsx` | Provee `currentUser`, `login`, `logout` vía React context |
| `src/components/ProtectedRoute.jsx` | Redirige a `/login` si no hay sesión activa |
| `src/pages/login/LoginPage.jsx` | Formulario de email + contraseña |

### Archivos modificados

| Archivo | Cambio |
|---|---|
| `src/firebase/config.js` | Activar y exportar `auth` (`getAuth`) |
| `src/App.jsx` | Envolver en `AuthProvider`, agregar ruta `/login`, proteger rutas existentes con `ProtectedRoute` |
| `src/pages/home/Home.jsx` | Agregar botón "Cerrar sesión" en el navbar |

## Flujo de datos

1. Al iniciar la app, `AuthContext` llama a `onAuthStateChanged`. Mientras resuelve, muestra un spinner para evitar parpadeo hacia `/login`.
2. `ProtectedRoute` lee `currentUser` del context. Si es `null`, redirige a `/login`. Si hay sesión, renderiza la ruta normalmente.
3. El login llama a `signInWithEmailAndPassword`. Errores se muestran con el sistema Toast existente.
4. El botón de cerrar sesión llama a `signOut` y redirige automáticamente a `/login`.
5. Si un usuario autenticado entra a `/login`, se redirige a `/`.

## UI — LoginPage

- Página centrada
- Título: "Gestión de Activos · Porceramica"
- Campo email
- Campo contraseña con toggle mostrar/ocultar
- Botón "Iniciar sesión" (deshabilitado mientras carga)
- Errores vía Toast

## Decisiones

- Sin pantalla de registro — los usuarios se crean desde la consola de Firebase
- Sin roles por ahora — todos los autenticados tienen el mismo acceso
- `AuthContext` sigue el mismo patrón que `ToastProvider` ya existente en la app
