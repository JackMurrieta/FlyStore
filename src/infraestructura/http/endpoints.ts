/**
 * Catálogo centralizado de endpoints del backend
 * ÚNICO lugar con URLs en el proyecto
 *
 * Refleja la estructura de endpoints del backend Spring Boot
 */

const API_BASE = import.meta.env.VITE_API_URL || ''

if (!API_BASE && import.meta.env.MODE === 'production') {
  throw new Error(
    'VITE_API_URL no está configurada. Define esta variable de entorno antes de desplegar.'
  )
}

/**
 * Endpoints de autenticación
 */
export const auth = {
  /**
   * POST /api/auth/login
   * Body: { correo, contrasena }
   * Response: UsuarioSesionDTO (+ cookie HttpOnly)
   */
  login: () => `${API_BASE}/api/auth/login`,

  /**
   * POST /api/auth/registro
   * Body: { nombre, correo, telefono, contrasena }
   * Response: RegistroRespuestaDTO (+ cookie si no requiere confirmación)
   */
  registro: () => `${API_BASE}/api/auth/registro`,

  /**
   * GET /api/auth/google?redirigir=/ruta
   * Navegación completa (no fetch)
   * Redirect: /auth/callback con cookie
   */
  google: (redirigir?: string) => {
    const params = redirigir ? `?redirigir=${encodeURIComponent(redirigir)}` : ''
    return `${API_BASE}/api/auth/google${params}`
  },

  /**
   * GET /api/auth/yo
   * Response: UsuarioSesionDTO
   * Error 401: sin sesión
   */
  yo: () => `${API_BASE}/api/auth/yo`,

  /**
   * POST /api/auth/refresh
   * Response: 204 (renueva cookie)
   */
  refresh: () => `${API_BASE}/api/auth/refresh`,

  /**
   * POST /api/auth/logout
   * Response: 204 (borra cookie)
   */
  logout: () => `${API_BASE}/api/auth/logout`,

  /**
   * POST /api/auth/reenviar-confirmacion
   * Body: { correo }
   * Response: 204
   */
  reenviarConfirmacion: () => `${API_BASE}/api/auth/reenviar-confirmacion`,
} as const

/**
 * Endpoints de usuarios
 */
export const usuarios = {
  /**
   * PUT /api/usuarios/yo/perfil
   * Body: { nombre, telefono }
   * Response: UsuarioSesionDTO
   */
  perfil: () => `${API_BASE}/api/usuarios/yo/perfil`,
} as const

/**
 * Endpoints de productos (CU-01)
 * // SUPUESTO: Rutas pendientes de confirmar con backend
 */
export const productos = {
  listar: (filtros?: string) => `${API_BASE}/api/productos${filtros || ''}`,
  obtener: (id: number) => `${API_BASE}/api/productos/${id}`,
} as const

/**
 * Endpoints de carrito y pedidos (CU-02)
 * // SUPUESTO: Rutas pendientes de confirmar con backend
 */
export const pedidos = {
  crear: () => `${API_BASE}/api/pedidos`,
  listar: () => `${API_BASE}/api/pedidos/yo`,
  obtener: (id: number) => `${API_BASE}/api/pedidos/${id}`,
} as const
