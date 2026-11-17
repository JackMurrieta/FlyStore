import { describe, expect, it, vi } from 'vitest'
import { PedidosAdminModel } from './PedidosAdminModel'
import type { IPedidosAdminService } from '../dominio/puertos/IPedidosAdminService'
import type { PedidoResumenTs } from '../dominio/PedidoResumenTs'
import type { DetallePedidoAdminTs } from '../dominio/DetallePedidoAdminTs'
import { ErrorApi } from '@infraestructura/http/ErrorApi'

const resumen: PedidoResumenTs = {
  folio: 'FLY-0001',
  fechaCreacion: new Date('2026-11-08T18:30:00Z'),
  clienteNombre: 'Ana López',
  clienteTelefono: '6441234567',
  total: 500,
  metodoPago: 'EFECTIVO',
  estado: 'APARTADO_PENDIENTE_PAGO',
  fechaLimite: new Date('2026-11-10T12:30:00Z'),
}

const detallePagado: DetallePedidoAdminTs = {
  folio: 'FLY-0001',
  estado: 'PAGADO',
  fechaCreacion: resumen.fechaCreacion,
  fechaLimite: null,
  cliente: { id: 1, nombre: 'Ana López', telefono: '6441234567' },
  datosEntrega: 'Calle 5 #10, Cd. Obregón',
  lineas: [],
  total: 500,
  metodoPago: 'EFECTIVO',
  comprobante: null,
  envio: null,
  historial: [],
}

function crearServicio(sobrescribir: Partial<IPedidosAdminService> = {}): IPedidosAdminService {
  return {
    listar: vi.fn().mockResolvedValue({ pedidos: [resumen], totalEncontrado: 1 }),
    obtenerDetalle: vi.fn().mockResolvedValue(detallePagado),
    registrarPagoEfectivo: vi.fn().mockResolvedValue({ pedido: detallePagado, notificacionEnviada: true }),
    aprobarPago: vi.fn().mockResolvedValue({ pedido: detallePagado, notificacionEnviada: false }),
    rechazarComprobante: vi.fn(),
    actualizarEstado: vi.fn(),
    cancelarPedido: vi.fn(),
    ...sobrescribir,
  }
}

describe('PedidosAdminModel', () => {
  it('carga la lista y notifica a los suscriptores', async () => {
    const servicio = crearServicio()
    const model = new PedidosAdminModel(servicio)
    const oyente = vi.fn()
    model.suscribir(oyente)

    await model.cargarPedidos()

    expect(servicio.listar).toHaveBeenCalledTimes(1)
    expect(model.obtenerEstado().pedidos).toHaveLength(1)
    expect(model.obtenerEstado().cargando).toBe(false)
    expect(oyente).toHaveBeenCalled()
  })

  it('al registrar el pago refleja el pedido en la lista y guarda el mensaje de éxito', async () => {
    const servicio = crearServicio()
    const model = new PedidosAdminModel(servicio)
    await model.cargarPedidos()

    const exitoso = await model.registrarPagoEfectivo('FLY-0001', 600)

    expect(exitoso).toBe(true)
    expect(servicio.registrarPagoEfectivo).toHaveBeenCalledWith('FLY-0001', 600)
    const estado = model.obtenerEstado()
    expect(estado.pedidos[0]?.estado).toBe('PAGADO')
    expect(estado.detalle?.folio).toBe('FLY-0001')
    expect(estado.mensaje).toMatch(/registrado/i)
    expect(estado.notificacionPendiente).toBe(false)
  })

  it('marca notificación pendiente cuando el backend no pudo avisar al cliente', async () => {
    const model = new PedidosAdminModel(crearServicio())

    await model.aprobarPago('FLY-0001')

    expect(model.obtenerEstado().notificacionPendiente).toBe(true)
  })

  it('convierte ErrorApi en ErrorTs y regresa false', async () => {
    const servicio = crearServicio({
      registrarPagoEfectivo: vi
        .fn()
        .mockRejectedValue(new ErrorApi('El apartado venció', 'NEGOCIO', 'APARTADO_VENCIDO', undefined, 409)),
    })
    const model = new PedidosAdminModel(servicio)

    const exitoso = await model.registrarPagoEfectivo('FLY-0001', 600)

    expect(exitoso).toBe(false)
    expect(model.obtenerEstado().error).toEqual({ mensaje: 'El apartado venció', tipo: 'negocio' })
    expect(model.obtenerEstado().cargando).toBe(false)
  })

  it('calcula el cambio con las reglas del dominio', () => {
    const model = new PedidosAdminModel(crearServicio())
    expect(model.calcularCambio(500, 700)).toEqual({ cambio: 200, faltante: 0, suficiente: true })
    expect(model.siguienteEstadoPermitido('PAGADO')).toBe('ENVIADO')
    expect(model.puedeCancelar('ENTREGADO')).toBe(false)
  })
})

describe('PedidosAdminModel · validar pago (Front 3)', () => {
  const detalleEnRevision: DetallePedidoAdminTs = { ...detallePagado, estado: 'PAGO_EN_REVISION', metodoPago: 'TRANSFERENCIA' }
  const detallePendiente: DetallePedidoAdminTs = {
    ...detalleEnRevision,
    estado: 'PENDIENTE_COMPROBANTE',
    fechaLimite: new Date('2026-11-12T12:00:00Z'),
  }

  it('al aprobar el pago deja el pedido como pagado en el detalle y en la lista', async () => {
    const servicio = crearServicio({
      listar: vi.fn().mockResolvedValue({ pedidos: [{ ...resumen, estado: 'PAGO_EN_REVISION' }], totalEncontrado: 1 }),
      obtenerDetalle: vi.fn().mockResolvedValue(detalleEnRevision),
      aprobarPago: vi.fn().mockResolvedValue({ pedido: detallePagado, notificacionEnviada: true }),
    })
    const model = new PedidosAdminModel(servicio)
    await model.cargarPedidos()
    await model.cargarDetalle('FLY-0001')

    const exitoso = await model.aprobarPago('FLY-0001')

    expect(exitoso).toBe(true)
    expect(servicio.aprobarPago).toHaveBeenCalledWith('FLY-0001')
    const estado = model.obtenerEstado()
    expect(estado.detalle?.estado).toBe('PAGADO')
    expect(estado.pedidos[0]?.estado).toBe('PAGADO')
    expect(estado.mensaje).toMatch(/aprobado/i)
    expect(estado.notificacionPendiente).toBe(false)
    expect(estado.error).toBeNull()
  })

  it('al rechazar el comprobante envía motivo y mensaje y refleja el nuevo plazo', async () => {
    const servicio = crearServicio({
      listar: vi.fn().mockResolvedValue({ pedidos: [{ ...resumen, estado: 'PAGO_EN_REVISION' }], totalEncontrado: 1 }),
      rechazarComprobante: vi.fn().mockResolvedValue({ pedido: detallePendiente, notificacionEnviada: false }),
    })
    const model = new PedidosAdminModel(servicio)
    await model.cargarPedidos()

    const exitoso = await model.rechazarComprobante('FLY-0001', 'El monto no coincide', 'Faltan $210')

    expect(exitoso).toBe(true)
    expect(servicio.rechazarComprobante).toHaveBeenCalledWith('FLY-0001', 'El monto no coincide', 'Faltan $210')
    const estado = model.obtenerEstado()
    expect(estado.detalle?.estado).toBe('PENDIENTE_COMPROBANTE')
    expect(estado.pedidos[0]?.estado).toBe('PENDIENTE_COMPROBANTE')
    expect(estado.pedidos[0]?.fechaLimite).toEqual(detallePendiente.fechaLimite)
    expect(estado.mensaje).toMatch(/rechazado/i)
    expect(estado.notificacionPendiente).toBe(true)
  })

  it('si el pedido ya no está en revisión (409) conserva el detalle y deja el error para la vista', async () => {
    const servicio = crearServicio({
      obtenerDetalle: vi.fn().mockResolvedValue(detalleEnRevision),
      aprobarPago: vi
        .fn()
        .mockRejectedValue(new ErrorApi('El pedido ya no está en revisión', 'NEGOCIO', 'ESTADO_CAMBIO', undefined, 409)),
    })
    const model = new PedidosAdminModel(servicio)
    await model.cargarDetalle('FLY-0001')

    const exitoso = await model.aprobarPago('FLY-0001')

    expect(exitoso).toBe(false)
    const estado = model.obtenerEstado()
    expect(estado.error).toEqual({ mensaje: 'El pedido ya no está en revisión', tipo: 'negocio' })
    expect(estado.detalle?.estado).toBe('PAGO_EN_REVISION')
    expect(estado.mensaje).toBeNull()
    expect(estado.notificacionPendiente).toBe(false)
    expect(estado.cargando).toBe(false)
  })
})

describe('PedidosAdminModel · actualizar estado y cancelar (Front 4)', () => {
  const envio = { paqueteria: 'Estafeta', guia: '7210 4455 0193', entregaLocal: false }
  const detalleEnviado: DetallePedidoAdminTs = { ...detallePagado, estado: 'ENVIADO', envio }
  const detalleCancelado: DetallePedidoAdminTs = { ...detallePagado, estado: 'CANCELADO' }

  it('marca como enviado un pedido pagado cuando la transición es válida', async () => {
    const servicio = crearServicio({
      actualizarEstado: vi.fn().mockResolvedValue({ pedido: detalleEnviado, notificacionEnviada: true }),
    })
    const model = new PedidosAdminModel(servicio)
    await model.cargarDetalle('FLY-0001')

    const exitoso = await model.actualizarEstado('FLY-0001', 'ENVIADO', envio)

    expect(exitoso).toBe(true)
    expect(servicio.actualizarEstado).toHaveBeenCalledWith('FLY-0001', 'ENVIADO', envio)
    expect(model.obtenerEstado().detalle?.estado).toBe('ENVIADO')
    expect(model.obtenerEstado().mensaje).toMatch(/actualizado/i)
  })

  it('no llama al backend si el estado está fuera de secuencia', async () => {
    const servicio = crearServicio()
    const model = new PedidosAdminModel(servicio)
    await model.cargarDetalle('FLY-0001')

    const exitoso = await model.actualizarEstado('FLY-0001', 'ENTREGADO', null)

    expect(exitoso).toBe(false)
    expect(servicio.actualizarEstado).not.toHaveBeenCalled()
    expect(model.obtenerEstado().detalle?.estado).toBe('PAGADO')
    expect(model.obtenerEstado().error).toBeNull()
  })

  it('no llama al backend si «Enviado» va sin datos de envío', async () => {
    const servicio = crearServicio()
    const model = new PedidosAdminModel(servicio)
    await model.cargarDetalle('FLY-0001')

    const sinEnvio = await model.actualizarEstado('FLY-0001', 'ENVIADO', null)
    const sinGuia = await model.actualizarEstado('FLY-0001', 'ENVIADO', { ...envio, guia: '' })

    expect(sinEnvio).toBe(false)
    expect(sinGuia).toBe(false)
    expect(servicio.actualizarEstado).not.toHaveBeenCalled()
  })

  it('deja la decisión al backend si el detalle de ese folio no está cargado', async () => {
    const servicio = crearServicio({
      actualizarEstado: vi.fn().mockResolvedValue({ pedido: detalleEnviado, notificacionEnviada: true }),
    })
    const model = new PedidosAdminModel(servicio)

    const exitoso = await model.actualizarEstado('FLY-0001', 'ENVIADO', envio)

    expect(exitoso).toBe(true)
    expect(servicio.actualizarEstado).toHaveBeenCalledTimes(1)
  })

  it('muestra el error del backend cuando rechaza la transición (400)', async () => {
    const servicio = crearServicio({
      actualizarEstado: vi
        .fn()
        .mockRejectedValue(new ErrorApi('Transición no válida', 'VALIDACION', 'TRANSICION_INVALIDA', undefined, 400)),
    })
    const model = new PedidosAdminModel(servicio)
    await model.cargarDetalle('FLY-0001')

    const exitoso = await model.actualizarEstado('FLY-0001', 'ENVIADO', envio)

    expect(exitoso).toBe(false)
    expect(model.obtenerEstado().error).toEqual({ mensaje: 'Transición no válida', tipo: 'validacion' })
    expect(model.obtenerEstado().detalle?.estado).toBe('PAGADO')
  })

  it('al cancelar envía el motivo y deja el pedido cancelado en el detalle y en la lista', async () => {
    const servicio = crearServicio({
      cancelarPedido: vi.fn().mockResolvedValue({ pedido: detalleCancelado, notificacionEnviada: false }),
    })
    const model = new PedidosAdminModel(servicio)
    await model.cargarPedidos()
    await model.cargarDetalle('FLY-0001')

    const exitoso = await model.cancelarPedido('FLY-0001', 'El cliente lo solicitó')

    expect(exitoso).toBe(true)
    expect(servicio.cancelarPedido).toHaveBeenCalledWith('FLY-0001', 'El cliente lo solicitó')
    const estado = model.obtenerEstado()
    expect(estado.detalle?.estado).toBe('CANCELADO')
    expect(estado.pedidos[0]?.estado).toBe('CANCELADO')
    expect(estado.mensaje).toMatch(/cancelado/i)
    expect(estado.notificacionPendiente).toBe(true)
  })

  it('limpiarAvisos quita el error, el mensaje y la notificación pendiente', async () => {
    const servicio = crearServicio({
      cancelarPedido: vi.fn().mockResolvedValue({ pedido: detalleCancelado, notificacionEnviada: false }),
    })
    const model = new PedidosAdminModel(servicio)
    await model.cancelarPedido('FLY-0001', 'El cliente lo solicitó')

    model.limpiarAvisos()

    const estado = model.obtenerEstado()
    expect(estado.mensaje).toBeNull()
    expect(estado.error).toBeNull()
    expect(estado.notificacionPendiente).toBe(false)
    expect(estado.detalle?.estado).toBe('CANCELADO')
  })
})
