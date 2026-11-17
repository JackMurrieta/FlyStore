import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { httpClient } from '@infraestructura/http/HttpClient'
import { ErrorApi } from '@infraestructura/http/ErrorApi'
import { PedidosAdminHttpService } from '@modulos/administrar-pedidos/infraestructura/PedidosAdminHttpService'
import type { CriteriosBusquedaTs } from '@modulos/administrar-pedidos/dominio/CriteriosBusquedaTs'
import {
  configurarBackendPedidosDemo,
  desinstalarBackendPedidosDemo,
  instalarBackendPedidosDemo,
  reiniciarBackendPedidosDemo,
} from './backendPedidosDemo'

const criterios = (cambios: Partial<CriteriosBusquedaTs> = {}): CriteriosBusquedaTs =>
  ({ texto: '', estado: null, metodoPago: null, desde: null, hasta: null, pagina: 1, ...cambios }) as CriteriosBusquedaTs

describe('Backend de prueba de Administrar pedidos', () => {
  const servicio = new PedidosAdminHttpService(httpClient)

  beforeEach(() => {
    instalarBackendPedidosDemo()
    reiniciarBackendPedidosDemo()
    configurarBackendPedidosDemo({ retraso: 0, notificacionDisponible: true })
  })
  afterEach(() => desinstalarBackendPedidosDemo())

  it('lista los pedidos del más reciente al más antiguo y filtra por estado, texto y teléfono', async () => {
    const todos = await servicio.listar(criterios())
    expect(todos.totalEncontrado).toBe(9)
    expect(todos.pedidos[0]?.folio).toBe('FLY-000131')

    const enRevision = await servicio.listar(criterios({ estado: 'PAGO_EN_REVISION' }))
    expect(enRevision.pedidos.map((p) => p.folio).sort()).toEqual(['FLY-000128', 'FLY-000131'])

    expect((await servicio.listar(criterios({ texto: 'ana torres' }))).pedidos.map((p) => p.folio)).toEqual(['FLY-000128'])
    expect((await servicio.listar(criterios({ texto: '6445550101' }))).pedidos.map((p) => p.folio)).toEqual(['FLY-000127'])
    expect((await servicio.listar(criterios({ texto: 'no existe' }))).totalEncontrado).toBe(0)
  })

  it('devuelve el detalle con comprobante e historial, y 404 si el folio no existe', async () => {
    const detalle = await servicio.obtenerDetalle('FLY-000128')
    expect(detalle.estado).toBe('PAGO_EN_REVISION')
    expect(detalle.comprobante?.monto).toBe(4210)
    expect(detalle.historial).toHaveLength(1)
    await expect(servicio.obtenerDetalle('FLY-999999')).rejects.toBeInstanceOf(ErrorApi)
  })

  it('aprueba un pago y rechaza un comprobante con nuevo plazo', async () => {
    const aprobado = await servicio.aprobarPago('FLY-000128')
    expect(aprobado.pedido.estado).toBe('PAGADO')
    expect(aprobado.notificacionEnviada).toBe(true)
    await expect(servicio.aprobarPago('FLY-000128')).rejects.toBeInstanceOf(ErrorApi)

    configurarBackendPedidosDemo({ notificacionDisponible: false })
    const rechazado = await servicio.rechazarComprobante('FLY-000131', 'El monto no coincide', null)
    expect(rechazado.pedido.estado).toBe('PENDIENTE_COMPROBANTE')
    expect(rechazado.pedido.fechaLimite).not.toBeNull()
    expect(rechazado.pedido.historial[0]?.motivo).toBe('El monto no coincide')
    expect(rechazado.notificacionEnviada).toBe(false)
  })

  it('registra pago en efectivo solo si el apartado está vigente', async () => {
    const pagado = await servicio.registrarPagoEfectivo('FLY-000127', 800)
    expect(pagado.pedido.estado).toBe('PAGADO')
    await expect(servicio.registrarPagoEfectivo('FLY-000120', 800)).rejects.toBeInstanceOf(ErrorApi)
  })

  it('respeta la secuencia de estados y no cancela lo que ya salió de la tienda', async () => {
    await expect(servicio.actualizarEstado('FLY-000119', 'ENTREGADO', null)).rejects.toBeInstanceOf(ErrorApi)
    const enviado = await servicio.actualizarEstado('FLY-000119', 'ENVIADO', { paqueteria: 'Estafeta', guia: '123', entregaLocal: false })
    expect(enviado.pedido.estado).toBe('ENVIADO')
    expect(enviado.pedido.envio?.guia).toBe('123')

    await expect(servicio.cancelarPedido('FLY-000112', 'ya no lo quiere')).rejects.toBeInstanceOf(ErrorApi)
    const cancelado = await servicio.cancelarPedido('FLY-000101', 'El cliente lo pidió')
    expect(cancelado.pedido.estado).toBe('CANCELADO')
  })
})
