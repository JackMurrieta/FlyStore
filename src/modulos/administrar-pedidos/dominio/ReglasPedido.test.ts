import { describe, expect, it } from 'vitest'
import {
  MOTIVOS_RECHAZO,
  calcularCambio,
  contarPiezas,
  estaCancelado,
  estaVencido,
  puedeValidarPago,
  secuenciaEstados,
  siguienteEstadoPermitido,
  validarMotivo,
  validarTransicion,
} from './ReglasPedido'
import type { EstadoPedidoTs } from './EstadoPedidoTs'
import type { MetodoPagoTs } from './MetodoPagoTs'

describe('ReglasPedido · recorrido según la forma de pago', () => {
  it('en efectivo, de pagado se pasa directo a entregado', () => {
    expect(siguienteEstadoPermitido('PAGADO', 'EFECTIVO')).toBe('ENTREGADO')
    expect(siguienteEstadoPermitido('ENTREGADO', 'EFECTIVO')).toBeNull()
    expect(siguienteEstadoPermitido('APARTADO_PENDIENTE_PAGO', 'EFECTIVO')).toBeNull()
  })

  it('por transferencia, de en preparación a enviado y de enviado a entregado', () => {
    expect(siguienteEstadoPermitido('PREPARACION', 'TRANSFERENCIA')).toBe('ENVIADO')
    expect(siguienteEstadoPermitido('ENVIADO', 'TRANSFERENCIA')).toBe('ENTREGADO')
    expect(siguienteEstadoPermitido('ENTREGADO', 'TRANSFERENCIA')).toBeNull()
    expect(siguienteEstadoPermitido('PAGO_EN_REVISION', 'TRANSFERENCIA')).toBeNull()
  })

  it('los pedidos de la regla anterior también avanzan', () => {
    expect(siguienteEstadoPermitido('PAGADO', 'TRANSFERENCIA')).toBe('PREPARACION')
    expect(siguienteEstadoPermitido('ENVIADO', 'EFECTIVO')).toBe('ENTREGADO')
  })

  it('rechaza saltarse la secuencia', () => {
    const resultado = validarTransicion('PREPARACION', 'TRANSFERENCIA', 'ENTREGADO', null)
    expect(resultado.valido).toBe(false)
    expect(resultado.siguientePermitido).toBe('ENVIADO')
    expect(resultado.errores).toHaveLength(1)
    expect(validarTransicion('PAGADO', 'EFECTIVO', 'ENVIADO', null).errores[0]).toBe(
      'Desde «Pagado» solo se puede pasar a «Entregado».'
    )
  })

  it('enviado exige paquetería y guía o entrega local', () => {
    expect(validarTransicion('PREPARACION', 'TRANSFERENCIA', 'ENVIADO', null).valido).toBe(false)
    expect(
      validarTransicion('PREPARACION', 'TRANSFERENCIA', 'ENVIADO', { paqueteria: 'DHL', guia: '', entregaLocal: false }).valido
    ).toBe(false)
    expect(
      validarTransicion('PREPARACION', 'TRANSFERENCIA', 'ENVIADO', { paqueteria: 'DHL', guia: '123', entregaLocal: false }).valido
    ).toBe(true)
    expect(
      validarTransicion('PREPARACION', 'TRANSFERENCIA', 'ENVIADO', { paqueteria: '', guia: '', entregaLocal: true }).valido
    ).toBe(true)
  })
})

describe('ReglasPedido · actualizar estado', () => {
  it.each<[MetodoPagoTs, EstadoPedidoTs]>([
    ['EFECTIVO', 'PAGADO'],
    ['EFECTIVO', 'ENVIADO'],
    ['TRANSFERENCIA', 'PREPARACION'],
    ['TRANSFERENCIA', 'PAGADO'],
  ])('los pasos del diálogo (%s desde %s) siguen la misma secuencia que siguienteEstadoPermitido', (metodo, actual) => {
    const pasos = secuenciaEstados(metodo, actual)
    expect(pasos).toContain(actual)
    pasos.slice(pasos.indexOf(actual)).forEach((estado, indice, resto) => {
      expect(siguienteEstadoPermitido(estado, metodo)).toBe(resto[indice + 1] ?? null)
    })
  })

  it('efectivo muestra dos pasos y transferencia tres', () => {
    expect(secuenciaEstados('EFECTIVO', 'PAGADO')).toEqual(['PAGADO', 'ENTREGADO'])
    expect(secuenciaEstados('TRANSFERENCIA', 'PREPARACION')).toEqual(['PREPARACION', 'ENVIADO', 'ENTREGADO'])
  })

  it('entregado no pide datos de envío', () => {
    expect(validarTransicion('ENVIADO', 'TRANSFERENCIA', 'ENTREGADO', null)).toEqual({
      valido: true,
      errores: [],
      siguientePermitido: 'ENTREGADO',
    })
  })

  it('reporta a la vez el estado fuera de secuencia y los datos de envío faltantes', () => {
    const resultado = validarTransicion('ENVIADO', 'TRANSFERENCIA', 'ENVIADO', { paqueteria: ' ', guia: '123', entregaLocal: false })
    expect(resultado.valido).toBe(false)
    expect(resultado.siguientePermitido).toBe('ENTREGADO')
    expect(resultado.errores).toHaveLength(2)
  })

  it('un pedido que no está pagado ni enviado no admite cambio de estado', () => {
    const resultado = validarTransicion('PAGO_EN_REVISION', 'TRANSFERENCIA', 'PREPARACION', null)
    expect(resultado.valido).toBe(false)
    expect(resultado.siguientePermitido).toBeNull()
    expect(resultado.errores[0]).toMatch(/no admite cambio de estado/)
  })
})

describe('ReglasPedido · validar pago', () => {
  it('solo se aprueba o rechaza un pedido en revisión', () => {
    expect(puedeValidarPago('PAGO_EN_REVISION')).toBe(true)
    expect(puedeValidarPago('PENDIENTE_COMPROBANTE')).toBe(false)
    expect(puedeValidarPago('PAGADO')).toBe(false)
  })

  it('el motivo no puede ir en blanco', () => {
    expect(validarMotivo('')).toBe(false)
    expect(validarMotivo('   ')).toBe(false)
    expect(validarMotivo('El monto no coincide')).toBe(true)
  })

  it('todos los motivos de rechazo que se ofrecen son válidos y distintos', () => {
    expect(MOTIVOS_RECHAZO.length).toBeGreaterThan(0)
    expect(MOTIVOS_RECHAZO.every(validarMotivo)).toBe(true)
    expect(new Set(MOTIVOS_RECHAZO).size).toBe(MOTIVOS_RECHAZO.length)
  })
})

describe('ReglasPedido · cancelación y plazos', () => {
  it('distingue los pedidos cancelados por el cliente o por vencimiento', () => {
    expect(estaCancelado('CANCELADO')).toBe(true)
    expect(estaCancelado('CANCELADO_VENCIMIENTO')).toBe(true)
    expect(estaCancelado('ENTREGADO')).toBe(false)
  })

  it('cuenta las piezas de todas las líneas', () => {
    const linea = { producto: 'Gorra', talla: null, precioUnitario: 100, subtotal: 100 }
    expect(contarPiezas([])).toBe(0)
    expect(contarPiezas([{ ...linea, cantidad: 6 }, { ...linea, cantidad: 3 }, { ...linea, cantidad: 2 }])).toBe(11)
  })

  it('detecta el apartado vencido', () => {
    const ahora = new Date('2026-11-09T12:00:00Z')
    expect(estaVencido(new Date('2026-11-09T11:59:00Z'), ahora)).toBe(true)
    expect(estaVencido(new Date('2026-11-10T12:00:00Z'), ahora)).toBe(false)
    expect(estaVencido(null, ahora)).toBe(false)
  })
})

describe('ReglasPedido · cambio en efectivo', () => {
  it('calcula el cambio cuando el monto alcanza', () => {
    expect(calcularCambio(500, 600)).toEqual({ cambio: 100, faltante: 0, suficiente: true })
    expect(calcularCambio(500, 500)).toEqual({ cambio: 0, faltante: 0, suficiente: true })
  })

  it('calcula lo que falta cuando el monto no alcanza', () => {
    expect(calcularCambio(500, 300)).toEqual({ cambio: 0, faltante: 200, suficiente: false })
  })

  it('redondea a centavos', () => {
    expect(calcularCambio(10.1, 20.3)).toEqual({ cambio: 10.2, faltante: 0, suficiente: true })
  })
})
