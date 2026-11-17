import { describe, expect, it } from 'vitest'
import { PedidoAdminMapper } from './PedidoAdminMapper'
import { CRITERIOS_VACIOS } from '../../dominio/CriteriosBusquedaTs'
import type { PedidoResumenDTO } from '../dto/PedidoResumenDTO'

const resumenDTO: PedidoResumenDTO = {
  folio: 'FLY-0001',
  fecha_creacion: '2026-11-08T18:30:00Z',
  cliente_nombre: 'Ana López',
  cliente_telefono: '6441234567',
  total: 1250.5,
  metodo_pago: 'EFECTIVO',
  estado: 'APARTADO_PENDIENTE_PAGO',
  fecha_limite: '2026-11-10T12:30:00Z',
}

describe('PedidoAdminMapper · respuesta', () => {
  it('convierte el resumen de snake_case a camelCase con fechas Date', () => {
    const ts = PedidoAdminMapper.aResumenTs(resumenDTO)
    expect(ts.folio).toBe('FLY-0001')
    expect(ts.clienteNombre).toBe('Ana López')
    expect(ts.fechaCreacion).toBeInstanceOf(Date)
    expect(ts.fechaLimite?.toISOString()).toBe('2026-11-10T12:30:00.000Z')
    expect(ts.metodoPago).toBe('EFECTIVO')
    expect(ts.estado).toBe('APARTADO_PENDIENTE_PAGO')
  })

  it('convierte la página completa', () => {
    const pagina = PedidoAdminMapper.aPaginaTs({ pedidos: [resumenDTO], total_encontrado: 1 })
    expect(pagina.totalEncontrado).toBe(1)
    expect(pagina.pedidos).toHaveLength(1)
  })

  it('falla con un estado que el front no conoce', () => {
    expect(() => PedidoAdminMapper.aResumenTs({ ...resumenDTO, estado: 'OTRO' })).toThrow(/Estado de pedido desconocido/)
  })
})

describe('PedidoAdminMapper · petición', () => {
  it('omite los criterios vacíos en la búsqueda', () => {
    expect(PedidoAdminMapper.aPeticionBusqueda(CRITERIOS_VACIOS)).toEqual({ pagina: 1 })
  })

  it('manda texto, estado y método con los nombres del backend', () => {
    const peticion = PedidoAdminMapper.aPeticionBusqueda({
      ...CRITERIOS_VACIOS,
      texto: '  Ana ',
      estado: 'PAGO_EN_REVISION',
      metodoPago: 'TRANSFERENCIA',
      desde: new Date('2026-11-01T00:00:00Z'),
    })
    expect(peticion).toEqual({
      texto: 'Ana',
      estado: 'PAGO_EN_REVISION',
      metodo_pago: 'TRANSFERENCIA',
      desde: '2026-11-01',
      pagina: 1,
    })
  })

  it('arma la petición de estado según el tipo de envío', () => {
    expect(PedidoAdminMapper.aPeticionEstado('ENVIADO', { paqueteria: 'DHL', guia: 'ABC', entregaLocal: false })).toEqual({
      estado: 'ENVIADO',
      paqueteria: 'DHL',
      guia: 'ABC',
      entrega_local: false,
    })
    expect(PedidoAdminMapper.aPeticionEstado('ENVIADO', { paqueteria: '', guia: '', entregaLocal: true })).toEqual({
      estado: 'ENVIADO',
      paqueteria: null,
      guia: null,
      entrega_local: true,
    })
  })

  it('limpia el motivo y deja el mensaje opcional en null si viene vacío', () => {
    expect(PedidoAdminMapper.aPeticionRechazo(' no coincide el monto ', '   ')).toEqual({
      motivo: 'no coincide el monto',
      mensaje: null,
    })
  })
})
