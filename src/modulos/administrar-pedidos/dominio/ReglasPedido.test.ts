import { describe, expect, it } from 'vitest'
import {
  MOTIVOS_RECHAZO,
  SECUENCIA_ESTADOS,
  calcularCambio,
  contarPiezas,
  estaCancelado,
  estaVencido,
  puedeCancelar,
  puedeValidarPago,
  requiereDevolucion,
  siguienteEstadoPermitido,
  validarMotivo,
  validarTransicion,
} from './ReglasPedido'

describe('ReglasPedido · secuencia de estados', () => {
  it('de pagado se pasa a enviado y de enviado a entregado', () => {
    expect(siguienteEstadoPermitido('PAGADO')).toBe('ENVIADO')
    expect(siguienteEstadoPermitido('ENVIADO')).toBe('ENTREGADO')
    expect(siguienteEstadoPermitido('ENTREGADO')).toBeNull()
    expect(siguienteEstadoPermitido('PAGO_EN_REVISION')).toBeNull()
  })

  it('rechaza saltarse la secuencia', () => {
    const resultado = validarTransicion('PAGADO', 'ENTREGADO', null)
    expect(resultado.valido).toBe(false)
    expect(resultado.siguientePermitido).toBe('ENVIADO')
    expect(resultado.errores).toHaveLength(1)
  })

  it('enviado exige paquetería y guía o entrega local', () => {
    expect(validarTransicion('PAGADO', 'ENVIADO', null).valido).toBe(false)
    expect(validarTransicion('PAGADO', 'ENVIADO', { paqueteria: 'DHL', guia: '', entregaLocal: false }).valido).toBe(false)
    expect(validarTransicion('PAGADO', 'ENVIADO', { paqueteria: 'DHL', guia: '123', entregaLocal: false }).valido).toBe(true)
    expect(validarTransicion('PAGADO', 'ENVIADO', { paqueteria: '', guia: '', entregaLocal: true }).valido).toBe(true)
  })
})

describe('ReglasPedido · actualizar estado', () => {
  it('los pasos del diálogo siguen la misma secuencia que siguienteEstadoPermitido', () => {
    SECUENCIA_ESTADOS.forEach((estado, indice) => {
      expect(siguienteEstadoPermitido(estado)).toBe(SECUENCIA_ESTADOS[indice + 1] ?? null)
    })
  })

  it('entregado no pide datos de envío', () => {
    expect(validarTransicion('ENVIADO', 'ENTREGADO', null)).toEqual({
      valido: true,
      errores: [],
      siguientePermitido: 'ENTREGADO',
    })
  })

  it('reporta a la vez el estado fuera de secuencia y los datos de envío faltantes', () => {
    const resultado = validarTransicion('ENVIADO', 'ENVIADO', { paqueteria: ' ', guia: '123', entregaLocal: false })
    expect(resultado.valido).toBe(false)
    expect(resultado.siguientePermitido).toBe('ENTREGADO')
    expect(resultado.errores).toHaveLength(2)
  })

  it('un pedido que no está pagado ni enviado no admite cambio de estado', () => {
    const resultado = validarTransicion('PAGO_EN_REVISION', 'PAGADO', null)
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
  it('distingue los pedidos cancelados a mano o por vencimiento', () => {
    expect(estaCancelado('CANCELADO')).toBe(true)
    expect(estaCancelado('CANCELADO_VENCIMIENTO')).toBe(true)
    expect(estaCancelado('ENTREGADO')).toBe(false)
  })

  it('solo hay devolución cuando el pedido ya estaba pagado', () => {
    expect(requiereDevolucion('PAGADO')).toBe(true)
    expect(requiereDevolucion('APARTADO_PENDIENTE_PAGO')).toBe(false)
    expect(requiereDevolucion('PAGO_EN_REVISION')).toBe(false)
  })

  it('cuenta las piezas de todas las líneas', () => {
    const linea = { producto: 'Gorra', talla: null, precioUnitario: 100, subtotal: 100 }
    expect(contarPiezas([])).toBe(0)
    expect(contarPiezas([{ ...linea, cantidad: 6 }, { ...linea, cantidad: 3 }, { ...linea, cantidad: 2 }])).toBe(11)
  })

  it('no se cancela lo que ya salió de la tienda ni lo ya cancelado', () => {
    expect(puedeCancelar('ENVIADO')).toBe(false)
    expect(puedeCancelar('ENTREGADO')).toBe(false)
    expect(puedeCancelar('CANCELADO')).toBe(false)
    expect(puedeCancelar('PAGADO')).toBe(true)
    expect(puedeCancelar('APARTADO_PENDIENTE_PAGO')).toBe(true)
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
