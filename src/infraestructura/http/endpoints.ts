/**
 * Catálogo centralizado de endpoints del backend
 * ÚNICO lugar con URLs en el proyecto
 *
 * Refleja la estructura de endpoints del backend Spring Boot
 */

const API_BASE = import.meta.env.VITE_API_URL || ''

if (!API_BASE) {
  console.error(
    '[FlyStore] VITE_API_URL no está configurada. Las peticiones al backend fallarán. ' +
    (import.meta.env.MODE === 'production'
      ? 'Configura esta variable en Cloudflare Workers → Settings → Build → Variables.'
      : 'Crea un archivo .env.local con: VITE_API_URL=http://localhost:8080')
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

/**
 * Endpoints de CU-02 Gestionar venta (GestionarVentaController, funciona como BFF).
 * La identidad del cliente sale de la cookie de sesión: el front nunca envía clienteId.
 * // SUPUESTO: Rutas pendientes de confirmar con backend
 */
export const ventas = {
  /** GET → PedidoVentaDTO (pedido en estado PENDIENTE = carrito) */
  pedidoEnCurso: () => `${API_BASE}/api/ventas/pedido-en-curso`,
  /** PATCH ActualizarCantidadPeticionDTO → PedidoVentaDTO */
  cantidad: () => `${API_BASE}/api/ventas/pedido-en-curso/cantidad`,
  /** POST AplicarCodigoPeticionDTO → PedidoVentaDTO */
  codigoDescuento: () => `${API_BASE}/api/ventas/pedido-en-curso/codigo-descuento`,
  /** GET → DatosEntregaDTO */
  datosEntrega: () => `${API_BASE}/api/ventas/datos-entrega`,
  /** GET → datos de la cuenta para transferir */
  datosBancarios: () => `${API_BASE}/api/ventas/datos-bancarios`,
  /** POST → FolioDTO (genera o devuelve el folio del pedido en curso) */
  folio: () => `${API_BASE}/api/ventas/pedido-en-curso/folio`,
  /** POST multipart (tipoPago, folio, archivo) → RespuestaValidacionComprobanteDTO */
  comprobantePago: () => `${API_BASE}/api/ventas/pedido-en-curso/comprobante`,
  /** POST PedidoVentaDTO → PedidoVentaDTO registrado */
  registrar: () => `${API_BASE}/api/ventas/pedido-en-curso/registrar`,
  /** GET → ComprobantePedidoDTO (JSON con HTML+CSS del ticket) */
  comprobantePedido: (folio: string) => `${API_BASE}/api/ventas/pedidos/${encodeURIComponent(folio)}/comprobante`,
} as const
