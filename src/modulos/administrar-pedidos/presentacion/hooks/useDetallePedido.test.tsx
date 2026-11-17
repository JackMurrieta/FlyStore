import { act, renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { PedidosAdminModel } from '../../aplicacion/PedidosAdminModel'
import type { IPedidosAdminService } from '../../dominio/puertos/IPedidosAdminService'
import type { DetallePedidoAdminTs } from '../../dominio/DetallePedidoAdminTs'
import type { PedidoResumenTs } from '../../dominio/PedidoResumenTs'
import { useDetallePedido } from './useDetallePedido'

const FOLIO = 'FLY-000128'

const detalleEnRevision: DetallePedidoAdminTs = {
  folio: FOLIO,
  estado: 'PAGO_EN_REVISION',
  fechaCreacion: new Date('2026-10-23T18:41:00'),
  fechaLimite: null,
  cliente: { id: 7, nombre: 'Ana Torres', telefono: '644 123 4567' },
  datosEntrega: 'Calle 5 de Febrero 1234, Cd. Obregón',
  lineas: [{ producto: 'Gorra 9FORTY', talla: null, cantidad: 11, precioUnitario: 210, subtotal: 2310 }],
  total: 4210,
  metodoPago: 'TRANSFERENCIA',
  comprobante: null,
  envio: null,
  historial: [],
}

const detallePagado: DetallePedidoAdminTs = { ...detalleEnRevision, estado: 'PAGADO' }

const resumenEnRevision: PedidoResumenTs = {
  folio: FOLIO,
  fechaCreacion: detalleEnRevision.fechaCreacion,
  clienteNombre: 'Ana Torres',
  clienteTelefono: '644 123 4567',
  total: 4210,
  metodoPago: 'TRANSFERENCIA',
  estado: 'PAGO_EN_REVISION',
  fechaLimite: null,
}

function crearServicio(sobrescribir: Partial<IPedidosAdminService> = {}): IPedidosAdminService {
  return {
    listar: vi.fn().mockResolvedValue({ pedidos: [resumenEnRevision], totalEncontrado: 1 }),
    obtenerDetalle: vi.fn().mockResolvedValue(detalleEnRevision),
    registrarPagoEfectivo: vi.fn(),
    aprobarPago: vi.fn().mockResolvedValue({ pedido: detallePagado, notificacionEnviada: true }),
    rechazarComprobante: vi.fn().mockResolvedValue({
      pedido: { ...detalleEnRevision, estado: 'PENDIENTE_COMPROBANTE' },
      notificacionEnviada: true,
    }),
    actualizarEstado: vi.fn().mockResolvedValue({
      pedido: { ...detallePagado, estado: 'ENVIADO' },
      notificacionEnviada: true,
    }),
    cancelarPedido: vi.fn().mockResolvedValue({
      pedido: { ...detalleEnRevision, estado: 'CANCELADO' },
      notificacionEnviada: true,
    }),
    ...sobrescribir,
  }
}

async function montar(servicio: IPedidosAdminService, model = new PedidosAdminModel(servicio)) {
  const vista = renderHook(() => useDetallePedido(model, FOLIO))
  await waitFor(() => expect(vista.result.current.detalle).not.toBeNull())
  return { ...vista, model }
}

describe('useDetallePedido', () => {
  it('carga el detalle del folio y expone las reglas según su estado', async () => {
    const servicio = crearServicio({ obtenerDetalle: vi.fn().mockResolvedValue(detallePagado) })
    const { result } = await montar(servicio)

    expect(servicio.obtenerDetalle).toHaveBeenCalledWith(FOLIO)
    expect(result.current.siguienteEstadoPermitido()).toBe('ENVIADO')
    expect(result.current.puedeCancelar()).toBe(true)
    expect(result.current.validarTransicion('ENVIADO', null)?.valido).toBe(false)
    expect(result.current.estadoAnterior).toBeNull()
  })

  it('no rechaza el comprobante si el motivo va en blanco', async () => {
    const servicio = crearServicio()
    const { result } = await montar(servicio)

    let exitoso = true
    await act(async () => {
      exitoso = await result.current.rechazarComprobante('   ', 'Mensaje')
    })

    expect(exitoso).toBe(false)
    expect(servicio.rechazarComprobante).not.toHaveBeenCalled()
    expect(result.current.error).toBeNull()
    expect(result.current.detalle?.estado).toBe('PAGO_EN_REVISION')
  })

  it('rechaza el comprobante con motivo y mensaje', async () => {
    const servicio = crearServicio()
    const { result } = await montar(servicio)

    let exitoso = false
    await act(async () => {
      exitoso = await result.current.rechazarComprobante('El monto no coincide', 'Faltan $210')
    })

    expect(exitoso).toBe(true)
    expect(servicio.rechazarComprobante).toHaveBeenCalledWith(FOLIO, 'El monto no coincide', 'Faltan $210')
    expect(result.current.detalle?.estado).toBe('PENDIENTE_COMPROBANTE')
    expect(result.current.mensaje).toMatch(/rechazado/i)
  })

  it('no cancela el pedido si el motivo va en blanco', async () => {
    const servicio = crearServicio()
    const { result } = await montar(servicio)

    let exitoso = true
    await act(async () => {
      exitoso = await result.current.cancelarPedido('')
    })

    expect(exitoso).toBe(false)
    expect(servicio.cancelarPedido).not.toHaveBeenCalled()
  })

  it('aprueba el pago y, si no se pudo notificar, arma el enlace de WhatsApp', async () => {
    const servicio = crearServicio({
      aprobarPago: vi.fn().mockResolvedValue({ pedido: detallePagado, notificacionEnviada: false }),
    })
    const { result } = await montar(servicio)

    await act(async () => {
      await result.current.aprobarPago()
    })

    expect(servicio.aprobarPago).toHaveBeenCalledWith(FOLIO)
    expect(result.current.detalle?.estado).toBe('PAGADO')
    expect(result.current.notificacionPendiente).toBe(true)
    const enlace = result.current.enlaceWhatsApp()
    expect(enlace).toMatch(/^https:\/\/wa\.me\/526441234567\?text=/)
    expect(decodeURIComponent(enlace ?? '')).toContain('Confirmamos el pago de tu pedido FLY-000128')
  })

  it('no hay enlace de WhatsApp si el cliente no tiene teléfono', async () => {
    const sinTelefono = { ...detallePagado, cliente: { ...detallePagado.cliente, telefono: null } }
    const { result } = await montar(crearServicio({ obtenerDetalle: vi.fn().mockResolvedValue(sinTelefono) }))

    expect(result.current.enlaceWhatsApp()).toBeNull()
  })

  it('avisa cuando el detalle trae un estado distinto al que mostraba la lista', async () => {
    const cancelado: DetallePedidoAdminTs = { ...detalleEnRevision, estado: 'CANCELADO' }
    const servicio = crearServicio({ obtenerDetalle: vi.fn().mockResolvedValue(cancelado) })
    const model = new PedidosAdminModel(servicio)
    await model.cargarPedidos()

    const { result } = await montar(servicio, model)

    expect(result.current.estadoAnterior).toBe('PAGO_EN_REVISION')
    expect(result.current.siguienteEstadoPermitido()).toBeNull()
    expect(result.current.puedeCancelar()).toBe(false)
  })

  it('tras una acción propia la lista y el detalle coinciden y no hay aviso de cambio', async () => {
    const servicio = crearServicio()
    const model = new PedidosAdminModel(servicio)
    await model.cargarPedidos()
    const { result } = await montar(servicio, model)

    await act(async () => {
      await result.current.aprobarPago()
    })

    expect(result.current.detalle?.estado).toBe('PAGADO')
    expect(result.current.estadoAnterior).toBeNull()
  })

  it('cargar vuelve a pedir el detalle y limpia el error anterior', async () => {
    const obtenerDetalle = vi
      .fn()
      .mockResolvedValueOnce(detalleEnRevision)
      .mockResolvedValueOnce(detallePagado)
    const servicio = crearServicio({
      obtenerDetalle,
      aprobarPago: vi.fn().mockRejectedValue(new Error('sin conexión')),
    })
    const { result } = await montar(servicio)

    await act(async () => {
      await result.current.aprobarPago()
    })
    expect(result.current.error).not.toBeNull()

    await act(async () => {
      await result.current.cargar()
    })

    expect(obtenerDetalle).toHaveBeenCalledTimes(2)
    expect(result.current.error).toBeNull()
    expect(result.current.detalle?.estado).toBe('PAGADO')
  })
})
