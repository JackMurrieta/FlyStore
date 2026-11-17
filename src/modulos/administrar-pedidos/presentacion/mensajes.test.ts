import { describe, expect, it } from 'vitest'
import {
  advertenciaCancelacion,
  construirEnlaceWhatsApp,
  descripcionCambioDeEstado,
  mensajeParaCliente,
  ultimoCambio,
} from './mensajes'
import { formatearFecha, formatearMoneda } from './formato'
import type { DetallePedidoAdminTs } from '../dominio/DetallePedidoAdminTs'

const linea = { producto: 'Gorra 9FORTY', talla: null, precioUnitario: 210, subtotal: 210 }

const detalle: DetallePedidoAdminTs = {
  folio: 'FLY-000128',
  estado: 'PAGADO',
  fechaCreacion: new Date('2026-10-23T18:41:00'),
  fechaLimite: null,
  cliente: { id: 7, nombre: 'Ana Torres', telefono: '644 123 4567' },
  datosEntrega: 'Calle 5 de Febrero 1234, Cd. Obregón',
  lineas: [
    { ...linea, cantidad: 6 },
    { ...linea, cantidad: 5 },
  ],
  total: 4210,
  metodoPago: 'TRANSFERENCIA',
  comprobante: null,
  envio: null,
  historial: [],
}

describe('mensajes · advertencia de cancelación', () => {
  it('si el pedido ya estaba pagado avisa de la devolución', () => {
    const texto = advertenciaCancelacion(detalle)
    expect(texto).toContain('Las 11 piezas regresarán al inventario')
    expect(texto).toContain(`deberás devolver ${formatearMoneda(4210)} a Ana Torres`)
  })

  it('si no se ha pagado solo avisa que se liberan las piezas', () => {
    const texto = advertenciaCancelacion({ ...detalle, estado: 'APARTADO_PENDIENTE_PAGO' })
    expect(texto).toBe('Las 11 piezas regresarán al inventario.')
  })

  it('usa el singular cuando es una sola pieza', () => {
    const unaPieza = { ...detalle, estado: 'PENDIENTE_COMPROBANTE' as const, lineas: [{ ...linea, cantidad: 1 }] }
    expect(advertenciaCancelacion(unaPieza)).toBe('La pieza regresará al inventario.')
  })
})

describe('mensajes · historial', () => {
  const antigua = {
    fechaHora: new Date('2026-10-23T18:41:00'),
    usuario: 'Ana Torres (cliente)',
    estadoAnterior: null,
    estadoNuevo: 'PAGO_EN_REVISION' as const,
    motivo: null,
  }
  const reciente = {
    fechaHora: new Date('2026-10-23T18:50:00'),
    usuario: 'Luis Castillo',
    estadoAnterior: 'PAGO_EN_REVISION' as const,
    estadoNuevo: 'CANCELADO' as const,
    motivo: 'El cliente lo solicitó',
  }

  it('toma la entrada más reciente sin importar el orden en que llegue', () => {
    expect(ultimoCambio({ ...detalle, historial: [antigua, reciente] })).toBe(reciente)
    expect(ultimoCambio({ ...detalle, historial: [reciente, antigua] })).toBe(reciente)
    expect(ultimoCambio(detalle)).toBeNull()
  })

  it('describe quién movió el pedido al estado actual', () => {
    const cancelado = { ...detalle, estado: 'CANCELADO' as const, historial: [antigua, reciente] }
    expect(descripcionCambioDeEstado(cancelado)).toBe(
      `Luis Castillo lo pasó a «Cancelado» el ${formatearFecha(reciente.fechaHora)}.`
    )
  })

  it('si el historial no explica el estado actual solo lo menciona', () => {
    expect(descripcionCambioDeEstado({ ...detalle, historial: [antigua] })).toBe('Ahora está en «Pagado».')
  })

  it('incluye el motivo de la cancelación en el mensaje al cliente', () => {
    const cancelado = { ...detalle, estado: 'CANCELADO' as const, historial: [antigua, reciente] }
    expect(mensajeParaCliente(cancelado)).toContain('Cancelamos tu pedido FLY-000128: El cliente lo solicitó.')
  })
})

describe('mensajes · mensaje para el cliente', () => {
  it('confirma el pago aprobado', () => {
    const texto = mensajeParaCliente(detalle)
    expect(texto).toContain('Hola Ana Torres')
    expect(texto).toContain('Confirmamos el pago de tu pedido FLY-000128')
  })

  it('tras un rechazo indica el motivo y la nueva fecha límite', () => {
    const fechaLimite = new Date('2026-10-25T12:41:00')
    const rechazado: DetallePedidoAdminTs = {
      ...detalle,
      estado: 'PENDIENTE_COMPROBANTE',
      fechaLimite,
      historial: [
        {
          fechaHora: new Date('2026-10-23T18:52:00'),
          usuario: 'Luis Castillo',
          estadoAnterior: 'PAGO_EN_REVISION',
          estadoNuevo: 'PENDIENTE_COMPROBANTE',
          motivo: 'El monto no coincide',
        },
      ],
    }
    const texto = mensajeParaCliente(rechazado)
    expect(texto).toContain('No pudimos validar el comprobante de tu pedido FLY-000128 (El monto no coincide).')
    expect(texto).toContain(`Sube uno nuevo antes del ${formatearFecha(fechaLimite)}`)
  })

  it('al enviar incluye paquetería y guía, o la entrega local', () => {
    const enviado = { ...detalle, estado: 'ENVIADO' as const }
    expect(
      mensajeParaCliente({ ...enviado, envio: { paqueteria: 'Estafeta', guia: '7210 4455 0193', entregaLocal: false } })
    ).toContain('por Estafeta, guía 7210 4455 0193')
    expect(mensajeParaCliente({ ...enviado, envio: { paqueteria: '', guia: '', entregaLocal: true } })).toContain(
      'de forma local'
    )
  })

  it('avisa de la entrega', () => {
    expect(mensajeParaCliente({ ...detalle, estado: 'ENTREGADO' })).toContain('Registramos la entrega de tu pedido')
  })
})

describe('mensajes · enlace de WhatsApp', () => {
  it('antepone la lada de México a los teléfonos de 10 dígitos y codifica el mensaje', () => {
    expect(construirEnlaceWhatsApp('644 123 4567', 'Hola Ana, ¿todo bien?')).toBe(
      'https://wa.me/526441234567?text=Hola%20Ana%2C%20%C2%BFtodo%20bien%3F'
    )
  })

  it('respeta un teléfono que ya trae lada', () => {
    expect(construirEnlaceWhatsApp('+52 644 123 4567', 'Hola')).toBe('https://wa.me/526441234567?text=Hola')
  })

  it('no hay enlace si el cliente no tiene teléfono', () => {
    expect(construirEnlaceWhatsApp(null, 'Hola')).toBeNull()
    expect(construirEnlaceWhatsApp(' - ', 'Hola')).toBeNull()
  })
})
