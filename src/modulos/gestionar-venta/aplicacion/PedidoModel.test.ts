import { describe, expect, it, vi } from 'vitest'
import { ErrorApi } from '@infraestructura/http/ErrorApi'
import { RespuestaValidacionComprobanteException } from '../dominio/RespuestaValidacionComprobanteException'
import { pedidoRegistrado } from '../pruebas/fixturesVenta'
import { crearModelosVenta } from './ModelosVenta'
import { gatewayFalso } from '../pruebas/fixturesVenta'

const AHORA = new Date('2026-10-23T18:37:00-07:00')
const png = () => new File(['imagen'], 'comprobante.png', { type: 'image/png' })

describe('PedidoModel (S6 Mis pedidos)', () => {
  it('lista los pedidos registrados y elige el folio pedido o el más reciente', async () => {
    const { pedidos } = crearModelosVenta(gatewayFalso(), () => AHORA)
    await pedidos.listarPedidosVenta()
    expect(pedidos.obtenerEstado().pedidos?.map((p) => p.folio)).toEqual(['FLY-000131', 'FLY-000128', 'FLY-000097'])
    expect(pedidos.obtenerEstado().folioSeleccionado).toBe('FLY-000131')

    await pedidos.listarPedidosVenta('FLY-000128')
    expect(pedidos.obtenerEstado().folioSeleccionado).toBe('FLY-000128')
    await pedidos.listarPedidosVenta('NO-EXISTE')
    expect(pedidos.obtenerEstado().folioSeleccionado).toBe('FLY-000128')
  })

  it('pide los datos para transferir solo para un pedido que espera comprobante, con su folio como concepto', async () => {
    const gateway = gatewayFalso()
    const { pedidos } = crearModelosVenta(gateway, () => AHORA)
    await pedidos.listarPedidosVenta()
    await vi.waitFor(() => expect(pedidos.obtenerEstado().datosBancarios).toMatchObject({ concepto: 'FLY-000131' }))
    expect(gateway.obtenerDatosBancariosPedidoVenta).toHaveBeenCalledWith('FLY-000131')
    expect(gateway.obtenerDatosBancarios).not.toHaveBeenCalled()

    pedidos.seleccionarPedido('FLY-000128')
    expect(pedidos.obtenerEstado().datosBancarios).toBeNull()
    expect(pedidos.horasRestantesPago(pedidos.obtenerPedidoSeleccionado()!)).toBeNull()
  })

  it('reconoce el plazo vencido aunque el backend aún no cancele el pedido', async () => {
    const { pedidos } = crearModelosVenta(gatewayFalso(), () => new Date('2026-10-26T00:00:00-07:00'))
    await pedidos.listarPedidosVenta()
    const pendiente = pedidos.obtenerEstado().pedidos![0]!
    expect(pedidos.plazoVencido(pendiente)).toBe(true)
    expect(pedidos.puedeSubirComprobante(pendiente)).toBe(false)
    expect(pedidos.estadoMostrado(pendiente)).toMatchObject({ etiqueta: 'Cancelado por vencimiento', tono: 'error' })
    expect(pedidos.obtenerEstado().datosBancarios).toBeNull()
  })

  it('sube el comprobante y reemplaza el pedido en la lista por el que responde el backend', async () => {
    const gateway = gatewayFalso()
    const { pedidos } = crearModelosVenta(gateway, () => AHORA)
    await pedidos.listarPedidosVenta()
    const actualizado = await pedidos.subirComprobantePedidoVenta('FLY-000131', png())
    expect(actualizado?.estado?.etiqueta).toBe('Pago en revisión')
    expect(pedidos.obtenerEstado()).toMatchObject({ comprobanteRecibido: 'FLY-000131', subiendoComprobante: false, errorComprobante: null })
    expect(pedidos.obtenerEstado().pedidos?.[0]?.estado?.valor).toBe('PAGO_EN_REVISION')
  })

  it('no sube archivos inválidos y deja el rechazo del backend o la falla de red', async () => {
    const gateway = gatewayFalso()
    const { pedidos } = crearModelosVenta(gateway, () => AHORA)
    await pedidos.listarPedidosVenta()
    const heic = new File(['x'], 'IMG.heic', { type: 'image/heic' })
    expect(await pedidos.subirComprobantePedidoVenta('FLY-000131', heic)).toBeNull()
    expect(gateway.subirComprobantePedidoVenta).not.toHaveBeenCalled()

    vi.mocked(gateway.subirComprobantePedidoVenta).mockRejectedValueOnce(
      new RespuestaValidacionComprobanteException('El plazo venció; escríbenos por WhatsApp.'))
    await pedidos.subirComprobantePedidoVenta('FLY-000131', png())
    expect(pedidos.obtenerEstado().errorComprobante).toEqual({ mensaje: 'El plazo venció; escríbenos por WhatsApp.', tipo: 'validacion' })

    vi.mocked(gateway.subirComprobantePedidoVenta).mockRejectedValueOnce(Object.assign(new Error('Sin conexión'), { tipo: 'RED' }))
    await pedidos.subirComprobantePedidoVenta('FLY-000131', png())
    expect(pedidos.obtenerEstado().errorComprobante).toEqual({ mensaje: 'Sin conexión', tipo: 'red' })
    expect(pedidos.obtenerEstado().pedidos?.[0]?.estado?.valor).toBe('PENDIENTE_COMPROBANTE')
  })

  it('solo un pedido apartado o esperando comprobante, sin vencer, se puede cancelar', async () => {
    const { pedidos } = crearModelosVenta(gatewayFalso(), () => AHORA)
    await pedidos.listarPedidosVenta()
    const [pendiente, enRevision, vencido] = pedidos.obtenerEstado().pedidos!
    expect(pedidos.puedeCancelar(pendiente!)).toBe(true)
    expect(pedidos.puedeCancelar(enRevision!)).toBe(false)
    expect(pedidos.puedeCancelar(vencido!)).toBe(false)

    const { pedidos: despues } = crearModelosVenta(gatewayFalso(), () => new Date('2026-10-26T00:00:00-07:00'))
    await despues.listarPedidosVenta()
    expect(despues.puedeCancelar(despues.obtenerEstado().pedidos![0]!)).toBe(false)
  })

  it('cancela el pedido con el motivo limpio (vacío = sin motivo) y lo reemplaza en la lista', async () => {
    const gateway = gatewayFalso()
    const { pedidos } = crearModelosVenta(gateway, () => AHORA)
    await pedidos.listarPedidosVenta()

    const cancelado = await pedidos.cancelarPedidoVenta('FLY-000131', '  Ya no lo necesito ')

    expect(gateway.cancelarPedidoVenta).toHaveBeenCalledWith('FLY-000131', 'Ya no lo necesito')
    expect(cancelado?.estado?.valor).toBe('CANCELADO')
    expect(pedidos.obtenerEstado()).toMatchObject({ pedidoCancelado: 'FLY-000131', cancelando: false, errorCancelacion: null, datosBancarios: null })
    expect(pedidos.obtenerEstado().pedidos?.[0]?.estado?.valor).toBe('CANCELADO')

    await pedidos.cancelarPedidoVenta('FLY-000131', '   ')
    expect(gateway.cancelarPedidoVenta).toHaveBeenLastCalledWith('FLY-000131', null)
  })

  it('si el backend ya no lo deja cancelar (409) recarga la lista y deja su mensaje', async () => {
    const gateway = gatewayFalso()
    const mensaje = 'Este pedido ya no se puede cancelar: solo se cancela mientras está apartado o esperando tu comprobante.'
    vi.mocked(gateway.cancelarPedidoVenta).mockRejectedValue(new ErrorApi(mensaje, 'NEGOCIO', 'CONFLICTO_DE_DATOS', undefined, 409))
    const { pedidos } = crearModelosVenta(gateway, () => AHORA)
    await pedidos.listarPedidosVenta()
    vi.mocked(gateway.listarPedidosVenta).mockResolvedValue([pedidoRegistrado('FLY-000131', 'PAGO_EN_REVISION')])

    expect(await pedidos.cancelarPedidoVenta('FLY-000131', '')).toBeNull()

    expect(gateway.listarPedidosVenta).toHaveBeenCalledTimes(2)
    expect(pedidos.obtenerEstado()).toMatchObject({ cancelando: false, pedidoCancelado: null, errorCancelacion: { mensaje, tipo: 'negocio' } })
    expect(pedidos.obtenerPedidoSeleccionado()?.estado?.valor).toBe('PAGO_EN_REVISION')
    expect(pedidos.puedeCancelar(pedidos.obtenerPedidoSeleccionado()!)).toBe(false)
  })

  it('una falla de conexión al cancelar no recarga la lista', async () => {
    const gateway = gatewayFalso()
    vi.mocked(gateway.cancelarPedidoVenta).mockRejectedValue(ErrorApi.red())
    const { pedidos } = crearModelosVenta(gateway, () => AHORA)
    await pedidos.listarPedidosVenta()

    expect(await pedidos.cancelarPedidoVenta('FLY-000131', 'x')).toBeNull()
    expect(gateway.listarPedidosVenta).toHaveBeenCalledTimes(1)
    expect(pedidos.obtenerEstado().errorCancelacion?.tipo).toBe('red')

    pedidos.limpiarErrorCancelacion()
    expect(pedidos.obtenerEstado().errorCancelacion).toBeNull()
  })

  it('se limpia al cerrar sesión', async () => {
    const modelos = crearModelosVenta(gatewayFalso(), () => AHORA)
    await modelos.pedidos.listarPedidosVenta()
    modelos.pedidos.reiniciar()
    expect(modelos.pedidos.obtenerEstado()).toMatchObject({ pedidos: null, folioSeleccionado: null, datosBancarios: null })
  })
})
