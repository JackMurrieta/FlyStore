import { describe, expect, it, vi } from 'vitest'
import type { HttpClient } from '@infraestructura/http/HttpClient'
import { ErrorApi } from '@infraestructura/http/ErrorApi'
import * as endpoints from '@infraestructura/http/endpoints'
import { RespuestaValidacionComprobanteException } from '../dominio/RespuestaValidacionComprobanteException'
import type { PedidoVentaDTO } from '../aplicacion/dto/PedidoVentaDTO'
import { GestionarVentaHttpGateway } from './GestionarVentaHttpGateway'

function httpFalso() {
  return {
    get: vi.fn(), post: vi.fn(), put: vi.fn(), patch: vi.fn(), delete: vi.fn(), postMultipart: vi.fn(), getBlob: vi.fn(),
  }
}
const crear = (http: ReturnType<typeof httpFalso>) => new GestionarVentaHttpGateway(http as unknown as HttpClient)

describe('GestionarVentaHttpGateway', () => {
  it('no envía clienteId: la identidad sale de la cookie de sesión', async () => {
    const http = httpFalso()
    await crear(http).obtenerPedidoVentaEnCurso('42')
    expect(http.get).toHaveBeenCalledWith(endpoints.ventas.pedidoEnCurso())
  })

  it('une los datos de la cuenta con el folio que genera el backend', async () => {
    const http = httpFalso()
    http.get.mockResolvedValue({ banco: 'Mercado Pago W', titular: 'FLY Store', numeroCuenta: '1', clabe: '2' })
    http.post.mockResolvedValue({ folio: 'FLY-000128' })
    expect(await crear(http).obtenerDatosBancarios()).toEqual({ banco: 'Mercado Pago W', titular: 'FLY Store', numeroCuenta: '1', clabe: '2', folio: 'FLY-000128' })
    expect(http.post).toHaveBeenCalledWith(endpoints.ventas.folio())
  })

  it('sube el comprobante como multipart y convierte el rechazo en la excepción del Alt5', async () => {
    const http = httpFalso()
    const archivo = new File(['x'], 'c.png', { type: 'image/png' })
    http.postMultipart.mockResolvedValue({ comprobanteRuta: 'r', valido: true, mensaje: 'ok' })
    await crear(http).validarMetodoPagoDTO({ tipoPago: 'TRANSFERENCIA', folio: 'F', comprobantePagoArchivo: archivo })
    const datos = http.postMultipart.mock.calls[0]![1] as FormData
    expect(datos.get('tipoPago')).toBe('TRANSFERENCIA')
    expect(datos.get('folio')).toBe('F')
    expect((datos.get('archivo') as File).name).toBe('c.png')

    http.postMultipart.mockRejectedValueOnce(new ErrorApi('Formato no permitido', 'VALIDACION', 'COMPROBANTE_INVALIDO', undefined, 400))
    await expect(crear(http).validarMetodoPagoDTO({ tipoPago: 'TRANSFERENCIA', folio: 'F', comprobantePagoArchivo: archivo }))
      .rejects.toBeInstanceOf(RespuestaValidacionComprobanteException)
    http.postMultipart.mockRejectedValueOnce(ErrorApi.red())
    await expect(crear(http).validarMetodoPagoDTO({ tipoPago: 'TRANSFERENCIA', folio: 'F', comprobantePagoArchivo: archivo }))
      .rejects.toBeInstanceOf(ErrorApi)
  })

  it('registra el pedido sin el archivo y pide el ticket como JSON con HTML+CSS', async () => {
    const http = httpFalso()
    const dto = { id: 1, metodoPago: { tipoPago: 'TRANSFERENCIA', folio: 'F', comprobantePagoArchivo: new File(['x'], 'c.png'), comprobanteRuta: 'r' } } as unknown as PedidoVentaDTO
    await crear(http).registrarPedidoVenta(dto)
    expect(http.post).toHaveBeenCalledWith(endpoints.ventas.registrar(), {
      id: 1, metodoPago: { tipoPago: 'TRANSFERENCIA', folio: 'F', comprobanteRuta: 'r', comprobanteNombre: null },
    })
    await crear(http).generarComprobantePedidoVenta('FLY-000128')
    expect(http.get).toHaveBeenCalledWith(endpoints.ventas.comprobantePedido('FLY-000128'))
  })
})
