/**
 * Backend en memoria del CU-04 Administrar Pedidos (solo desarrollo).
 *
 * Responde las rutas de /api/admin/pedidos con el mismo contrato JSON que tendrá el backend real,
 * para poder recorrer las pantallas sin Spring Boot. No guarda nada: al recargar se reinicia.
 */

import type {
  DetallePedidoAdminDTO,
  HistorialEntradaDTO,
} from '@modulos/administrar-pedidos/aplicacion/dto/DetallePedidoAdminDTO'
import type { PedidoResumenDTO } from '@modulos/administrar-pedidos/aplicacion/dto/PedidoResumenDTO'
import type { PaginaPedidosDTO } from '@modulos/administrar-pedidos/aplicacion/dto/PaginaPedidosDTO'
import type { ResultadoAccionDTO } from '@modulos/administrar-pedidos/aplicacion/dto/ResultadoAccionDTO'

const RUTA = '/api/admin/pedidos'
const USUARIO = 'Administrador de prueba'
const HORA = 3600 * 1000
const SECUENCIA = ['PAGADO', 'ENVIADO', 'ENTREGADO']

export interface OpcionesBackendPedidosDemo {
  /** Si es false, las acciones responden notificacion_enviada = false (WhatsApp no disponible). */
  notificacionDisponible: boolean
  /** Milisegundos de espera simulada por petición. */
  retraso: number
}

const opciones: OpcionesBackendPedidosDemo = { notificacionDisponible: true, retraso: 300 }
let pedidos = new Map<string, DetallePedidoAdminDTO>()
let fetchOriginal: typeof window.fetch | null = null
let urlComprobante = ''

function desde(horas: number): string {
  return new Date(Date.now() + horas * HORA).toISOString()
}

function entrada(horas: number, usuario: string, anterior: string | null, nuevo: string, motivo: string | null = null): HistorialEntradaDTO {
  return { fecha_hora: desde(horas), usuario, estado_anterior: anterior, estado_nuevo: nuevo, motivo }
}

function comprobanteDe(nombre: string, monto: number, horas: number, estado: string) {
  return {
    url: urlComprobante,
    nombre_archivo: `comprobante_${nombre.toLowerCase().replace(/\s+/g, '_')}.jpg`,
    monto,
    fecha: desde(horas),
    concepto: nombre,
    estado,
  }
}

function pedidosIniciales(): DetallePedidoAdminDTO[] {
  const gorra = { producto: '9FORTY LA Dodgers Negro', talla: 'Ajustable', cantidad: 6, precio_unitario: 210, subtotal: 1260 }
  const gorra2 = { producto: '59FIFTY NY Yankees Negro', talla: '7 3/8', cantidad: 3, precio_unitario: 260, subtotal: 780 }
  const perfume = { producto: 'Asad Eau de Parfum 100 ml', talla: null, cantidad: 1, precio_unitario: 520, subtotal: 520 }
  const tenis = { producto: 'Air Force 1 ’07 Negro', talla: '27 MX', cantidad: 1, precio_unitario: 1650, subtotal: 1650 }
  const playera = { producto: 'Playera Oversize FLY Negra', talla: 'M', cantidad: 2, precio_unitario: 390, subtotal: 780 }
  const entrega = 'Calle 5 de Febrero 1234, Col. Centro, C.P. 85000 · Ciudad Obregón, Sonora'
  const tienda = 'Recoge en tienda · Ciudad Obregón, Sonora'

  return [
    {
      folio: 'FLY-000128', estado: 'PAGO_EN_REVISION', fecha_creacion: desde(-3), fecha_limite: null,
      cliente: { id: 7, nombre: 'Ana Torres', telefono: '644 123 4567' }, datos_entrega: entrega,
      lineas: [gorra, gorra2, perfume, tenis], total: 4210, metodo_pago: 'TRANSFERENCIA',
      comprobante: comprobanteDe('Ana Torres', 4210, -3, 'EN_REVISION'), envio: null,
      historial: [entrada(-3, 'Ana Torres (cliente)', 'PENDIENTE_COMPROBANTE', 'PAGO_EN_REVISION')],
    },
    {
      folio: 'FLY-000131', estado: 'PAGO_EN_REVISION', fecha_creacion: desde(-1), fecha_limite: null,
      cliente: { id: 12, nombre: 'Carlos Méndez', telefono: '644 987 6543' }, datos_entrega: entrega,
      lineas: [tenis], total: 1650, metodo_pago: 'TRANSFERENCIA',
      comprobante: comprobanteDe('Carlos Méndez', 1560, -1, 'EN_REVISION'), envio: null,
      historial: [entrada(-1, 'Carlos Méndez (cliente)', 'PENDIENTE_COMPROBANTE', 'PAGO_EN_REVISION')],
    },
    {
      folio: 'FLY-000127', estado: 'APARTADO_PENDIENTE_PAGO', fecha_creacion: desde(-20), fecha_limite: desde(22),
      cliente: { id: 9, nombre: 'María López', telefono: '644 555 0101' }, datos_entrega: tienda,
      lineas: [playera], total: 780, metodo_pago: 'EFECTIVO', comprobante: null, envio: null,
      historial: [entrada(-20, 'María López (cliente)', null, 'APARTADO_PENDIENTE_PAGO')],
    },
    {
      folio: 'FLY-000120', estado: 'APARTADO_PENDIENTE_PAGO', fecha_creacion: desde(-50), fecha_limite: desde(-8),
      cliente: { id: 15, nombre: 'Jorge Ramírez', telefono: '644 222 3344' }, datos_entrega: tienda,
      lineas: [gorra2], total: 780, metodo_pago: 'EFECTIVO', comprobante: null, envio: null,
      historial: [entrada(-50, 'Jorge Ramírez (cliente)', null, 'APARTADO_PENDIENTE_PAGO')],
    },
    {
      folio: 'FLY-000119', estado: 'PAGADO', fecha_creacion: desde(-72), fecha_limite: null,
      cliente: { id: 4, nombre: 'Sofía Herrera', telefono: '644 333 7788' }, datos_entrega: entrega,
      lineas: [gorra, perfume], total: 1780, metodo_pago: 'TRANSFERENCIA',
      comprobante: comprobanteDe('Sofía Herrera', 1780, -70, 'COMPLETADO'), envio: null,
      historial: [
        entrada(-66, USUARIO, 'PAGO_EN_REVISION', 'PAGADO'),
        entrada(-70, 'Sofía Herrera (cliente)', 'PENDIENTE_COMPROBANTE', 'PAGO_EN_REVISION'),
      ],
    },
    {
      folio: 'FLY-000112', estado: 'ENVIADO', fecha_creacion: desde(-120), fecha_limite: null,
      cliente: { id: 21, nombre: 'Diego Castro', telefono: '644 444 1212' }, datos_entrega: entrega,
      lineas: [tenis, playera], total: 2430, metodo_pago: 'TRANSFERENCIA',
      comprobante: comprobanteDe('Diego Castro', 2430, -118, 'COMPLETADO'),
      envio: { paqueteria: 'Estafeta', guia: '7210 4455 0193', entrega_local: false },
      historial: [
        entrada(-90, USUARIO, 'PAGADO', 'ENVIADO'),
        entrada(-110, USUARIO, 'PAGO_EN_REVISION', 'PAGADO'),
        entrada(-118, 'Diego Castro (cliente)', 'PENDIENTE_COMPROBANTE', 'PAGO_EN_REVISION'),
      ],
    },
    {
      folio: 'FLY-000105', estado: 'ENTREGADO', fecha_creacion: desde(-200), fecha_limite: null,
      cliente: { id: 3, nombre: 'Valeria Ruiz', telefono: '644 777 9090' }, datos_entrega: tienda,
      lineas: [perfume], total: 520, metodo_pago: 'EFECTIVO', comprobante: null,
      envio: { paqueteria: null, guia: null, entrega_local: true },
      historial: [
        entrada(-170, USUARIO, 'ENVIADO', 'ENTREGADO'),
        entrada(-175, USUARIO, 'PAGADO', 'ENVIADO'),
        entrada(-180, USUARIO, 'APARTADO_PENDIENTE_PAGO', 'PAGADO', 'pago en efectivo'),
      ],
    },
    {
      folio: 'FLY-000101', estado: 'PENDIENTE_COMPROBANTE', fecha_creacion: desde(-10), fecha_limite: desde(32),
      cliente: { id: 18, nombre: 'Luis Navarro', telefono: '644 111 2233' }, datos_entrega: entrega,
      lineas: [gorra], total: 1260, metodo_pago: 'TRANSFERENCIA', comprobante: null, envio: null,
      historial: [entrada(-10, 'Luis Navarro (cliente)', null, 'PENDIENTE_COMPROBANTE')],
    },
    {
      folio: 'FLY-000098', estado: 'CANCELADO', fecha_creacion: desde(-240), fecha_limite: null,
      cliente: { id: 25, nombre: 'Paola Vega', telefono: null }, datos_entrega: entrega,
      lineas: [playera, gorra2], total: 1560, metodo_pago: 'TRANSFERENCIA', comprobante: null, envio: null,
      historial: [
        entrada(-230, USUARIO, 'PENDIENTE_COMPROBANTE', 'CANCELADO', 'La clienta pidió cancelar'),
        entrada(-240, 'Paola Vega (cliente)', null, 'PENDIENTE_COMPROBANTE'),
      ],
    },
  ]
}

function json(cuerpo: unknown, status = 200): Response {
  return new Response(JSON.stringify(cuerpo), { status, headers: { 'Content-Type': 'application/json' } })
}

function error(status: number, mensaje: string, tipo: string, codigo: string): Response {
  return json({ mensaje, tipo, codigo }, status)
}

const conflicto = (mensaje: string) => error(409, mensaje, 'NEGOCIO', 'ESTADO_PEDIDO_INVALIDO')

function aResumen(p: DetallePedidoAdminDTO): PedidoResumenDTO {
  return {
    folio: p.folio, fecha_creacion: p.fecha_creacion, cliente_nombre: p.cliente.nombre, cliente_telefono: p.cliente.telefono,
    total: p.total, metodo_pago: p.metodo_pago, estado: p.estado, fecha_limite: p.fecha_limite,
  }
}

function soloDigitos(texto: string): string {
  return texto.replace(/\D/g, '')
}

function listar(consulta: URLSearchParams): PaginaPedidosDTO {
  const texto = (consulta.get('texto') ?? '').trim().toLowerCase()
  const estado = consulta.get('estado')
  const metodo = consulta.get('metodo_pago')
  const inicio = consulta.get('desde')
  const fin = consulta.get('hasta')
  const encontrados = [...pedidos.values()]
    .filter((p) => {
      if (estado && p.estado !== estado) return false
      if (metodo && p.metodo_pago !== metodo) return false
      const dia = p.fecha_creacion.slice(0, 10)
      if (inicio && dia < inicio.slice(0, 10)) return false
      if (fin && dia > fin.slice(0, 10)) return false
      if (texto === '') return true
      const digitos = soloDigitos(texto)
      return p.folio.toLowerCase().includes(texto)
        || p.cliente.nombre.toLowerCase().includes(texto)
        || (digitos !== '' && soloDigitos(p.cliente.telefono ?? '').includes(digitos))
    })
    .sort((a, b) => b.fecha_creacion.localeCompare(a.fecha_creacion))
  return { pedidos: encontrados.map(aResumen), total_encontrado: encontrados.length }
}

/** Aplica el cambio de estado, agrega la entrada al historial y arma la respuesta de la acción. */
function mover(
  p: DetallePedidoAdminDTO,
  estado: string,
  cambios: Partial<DetallePedidoAdminDTO> = {},
  motivo: string | null = null,
  notificar = opciones.notificacionDisponible,
): Response {
  const actualizado: DetallePedidoAdminDTO = {
    ...p,
    ...cambios,
    estado,
    historial: [entrada(0, USUARIO, p.estado, estado, motivo), ...p.historial],
  }
  pedidos.set(p.folio, actualizado)
  const resultado: ResultadoAccionDTO = { pedido: actualizado, notificacion_enviada: notificar }
  return json(resultado)
}

function ejecutarAccion(p: DetallePedidoAdminDTO, accion: string, cuerpo: Record<string, unknown>): Response {
  switch (accion) {
    case 'pago-efectivo': {
      const vencido = p.fecha_limite !== null && new Date(p.fecha_limite).getTime() < Date.now()
      if (p.estado !== 'APARTADO_PENDIENTE_PAGO' || vencido) {
        return conflicto('El apartado venció o el pedido cambió de estado. El cliente debe hacer un nuevo pedido.')
      }
      if (Number(cuerpo.monto_recibido) < p.total) {
        return error(400, 'El monto recibido es menor al total del pedido.', 'VALIDACION', 'MONTO_INSUFICIENTE')
      }
      // En efectivo no se notifica al cliente: pagó en la tienda.
      return mover(p, 'PAGADO', { fecha_limite: null }, 'pago en efectivo', false)
    }
    case 'aprobar-pago': {
      if (p.estado !== 'PAGO_EN_REVISION') return conflicto('El pedido ya no está en revisión de pago. Vuelve a cargarlo.')
      return mover(p, 'PAGADO', { comprobante: p.comprobante && { ...p.comprobante, estado: 'COMPLETADO' } })
    }
    case 'rechazar-comprobante': {
      if (p.estado !== 'PAGO_EN_REVISION') return conflicto('El pedido ya no está en revisión de pago. Vuelve a cargarlo.')
      return mover(p, 'PENDIENTE_COMPROBANTE', {
        fecha_limite: desde(42),
        comprobante: p.comprobante && { ...p.comprobante, estado: 'RECHAZADO' },
      }, String(cuerpo.motivo ?? ''))
    }
    case 'estado': {
      const nuevo = String(cuerpo.estado ?? '')
      const siguiente = SECUENCIA[SECUENCIA.indexOf(p.estado) + 1]
      if (SECUENCIA.indexOf(p.estado) === -1 || nuevo !== siguiente) {
        return error(400, siguiente ? `El siguiente estado permitido es ${siguiente}.` : 'Este pedido ya no admite cambios de estado.',
          'VALIDACION', 'TRANSICION_INVALIDA')
      }
      const local = cuerpo.entrega_local === true
      if (nuevo === 'ENVIADO' && !local && (!cuerpo.paqueteria || !cuerpo.guia)) {
        return error(400, 'Indica paquetería y número de guía, o marca entrega local.', 'VALIDACION', 'FALTAN_DATOS_ENVIO')
      }
      const envio = nuevo === 'ENVIADO'
        ? { paqueteria: local ? null : String(cuerpo.paqueteria), guia: local ? null : String(cuerpo.guia), entrega_local: local }
        : p.envio
      return mover(p, nuevo, { envio })
    }
    case 'cancelar': {
      if (p.estado === 'ENVIADO' || p.estado === 'ENTREGADO') return conflicto('El pedido ya salió de la tienda y no se puede cancelar.')
      if (p.estado.startsWith('CANCELADO')) return conflicto('El pedido ya está cancelado.')
      return mover(p, 'CANCELADO', { fecha_limite: null }, String(cuerpo.motivo ?? ''))
    }
    default:
      return error(404, 'Ruta no encontrada.', 'NEGOCIO', 'NO_ENCONTRADO')
  }
}

async function responder(url: URL, init?: RequestInit): Promise<Response> {
  if (opciones.retraso > 0) await new Promise((resolver) => setTimeout(resolver, opciones.retraso))
  const metodo = (init?.method ?? 'GET').toUpperCase()
  const partes = url.pathname.slice(RUTA.length).split('/').filter(Boolean)

  if (partes.length === 0) {
    return metodo === 'GET' ? json(listar(url.searchParams)) : error(404, 'Ruta no encontrada.', 'NEGOCIO', 'NO_ENCONTRADO')
  }
  const pedido = pedidos.get(decodeURIComponent(partes[0] ?? ''))
  if (!pedido) return error(404, 'No existe un pedido con ese folio.', 'NEGOCIO', 'PEDIDO_NO_ENCONTRADO')
  if (partes.length === 1 && metodo === 'GET') return json(pedido)

  const cuerpo = typeof init?.body === 'string' && init.body !== '' ? JSON.parse(init.body) as Record<string, unknown> : {}
  return ejecutarAccion(pedido, partes[1] ?? '', cuerpo)
}

function imagenComprobante(): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="420" height="560" font-family="Arial, sans-serif">
  <rect width="420" height="560" fill="#ffffff"/><rect width="420" height="70" fill="#1f2937"/>
  <text x="24" y="43" fill="#ffffff" font-size="20" font-weight="bold">Transferencia enviada</text>
  <text x="24" y="120" fill="#6b7280" font-size="13">Comprobante de ejemplo · modo de prueba</text>
  <text x="24" y="180" fill="#111827" font-size="15">Banco destino: Mercado Pago</text>
  <text x="24" y="215" fill="#111827" font-size="15">Beneficiario: FlyStore</text>
  <text x="24" y="250" fill="#111827" font-size="15">Concepto: nombre del cliente</text>
  <text x="24" y="300" fill="#6b7280" font-size="13">Compara monto, fecha y concepto con el depósito.</text>
  <rect x="24" y="340" width="372" height="1" fill="#e5e7eb"/>
  <text x="24" y="380" fill="#111827" font-size="13">Clave de rastreo: DEMO2026FLY0001</text></svg>`
  return URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }))
}

/** Ajusta el comportamiento del backend de prueba (por ejemplo, simular que WhatsApp no está disponible). */
export function configurarBackendPedidosDemo(cambios: Partial<OpcionesBackendPedidosDemo>): void {
  Object.assign(opciones, cambios)
}

/** Devuelve los datos al estado inicial. */
export function reiniciarBackendPedidosDemo(): void {
  pedidos = new Map(pedidosIniciales().map((p) => [p.folio, p]))
}

/**
 * Sustituye window.fetch para atender /api/admin/pedidos en memoria.
 * El resto de las peticiones sigue llegando al fetch original. Es idempotente.
 */
export function instalarBackendPedidosDemo(): void {
  if (fetchOriginal) return
  urlComprobante = typeof URL.createObjectURL === 'function' ? imagenComprobante() : ''
  reiniciarBackendPedidosDemo()
  const original = window.fetch.bind(window)
  fetchOriginal = original
  window.fetch = (entradaFetch: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const destino = entradaFetch instanceof Request ? entradaFetch.url : String(entradaFetch)
    const url = new URL(destino, window.location.origin)
    if (url.pathname === RUTA || url.pathname.startsWith(`${RUTA}/`)) return responder(url, init)
    return original(entradaFetch, init)
  }
}

/** Restaura el fetch original (lo usan las pruebas). */
export function desinstalarBackendPedidosDemo(): void {
  if (!fetchOriginal) return
  window.fetch = fetchOriginal
  fetchOriginal = null
  if (urlComprobante && typeof URL.revokeObjectURL === 'function') URL.revokeObjectURL(urlComprobante)
  urlComprobante = ''
}
