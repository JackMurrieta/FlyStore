/** Datos de prueba compartidos por las pruebas del módulo (no se usan en producción). */
import { vi } from 'vitest'
import type { IGestionarVentaGateway } from '../dominio/puertos/IGestionarVentaGateway'
import type { PedidoVentaDTO } from '../aplicacion/dto/PedidoVentaDTO'
import type { DetallePedidoDTO } from '../aplicacion/dto/DetallePedidoDTO'

// Datos del Figma (B1 y S7): 11 piezas a precio Mayoreo, total $4,210; con FLY10, $4,084.
export function detalle(id: number, nombre: string, cantidad: number, precioBase: number, precioUnitario: number, extra: Partial<DetallePedidoDTO> = {}): DetallePedidoDTO {
  return {
    id, varianteProductoId: 100 + id, productoNombre: nombre, marca: 'New Era', tipoTalla: 'Talla', talla: 'Ajustable',
    color: 'Negro', imagenUrl: null, cantidad, existencia: 18, tipoPrecio: 'MAYOREO', precioBase, precioUnitario,
    descuentoUnitario: 0, codigoDescuento: null, subtotal: precioUnitario * cantidad, ...extra,
  }
}

export function pedidoFigma(conCodigo = false): PedidoVentaDTO {
  const dodgers = conCodigo
    ? detalle(1, '9FORTY LA Dodgers Negro', 6, 250, 210, {
        descuentoUnitario: 21, subtotal: 1134, codigoDescuento: { codigo: 'FLY10', etiquetaValor: '10%', montoDescuento: 126 },
      })
    : detalle(1, '9FORTY LA Dodgers Negro', 6, 250, 210)
  return {
    id: 1, folio: null, estadoVenta: 'PENDIENTE',
    detalles: [
      dodgers,
      detalle(2, '59FIFTY NY Yankees Negro', 3, 300, 260),
      detalle(3, 'Asad Eau de Parfum 100 ml', 1, 600, 520, { marca: 'Lattafa', tipoTalla: 'Presentación', talla: '100 ml · Caballero', color: null }),
      detalle(4, 'Air Force 1 ’07 Negro', 1, 1900, 1650, { marca: 'Nike', talla: '27 MX' }),
    ],
    totalPiezas: 11, tipoPrecioAplicado: 'MAYOREO', siguienteTipoPrecio: 'DISTRIBUIDOR', piezasParaSiguienteNivel: 1,
    nivelesPrecio: [{ tipoPrecio: 'DISTRIBUIDOR', minPiezas: 12 }, { tipoPrecio: 'BASE', minPiezas: 1 }, { tipoPrecio: 'MAYOREO', minPiezas: 6 }],
    subtotalPrecioBase: 4900, ahorroPorTipoPrecio: 690, totalDescuentos: conCodigo ? 126 : 0, costoEnvio: 0, total: conCodigo ? 4084 : 4210,
    datosEntrega: null, metodoPago: null, fechaHoraPedido: null, fechaLimitePago: null, enlaceWhatsapp: null,
  }
}

/** Pedido ya registrado (lista de «Mis pedidos» y ticket de B7). */
export function pedidoRegistrado(folio: string, estadoVenta: string, extra: Partial<PedidoVentaDTO> = {}): PedidoVentaDTO {
  return {
    ...pedidoFigma(), id: Number(folio.slice(-3)), folio, estadoVenta, nivelesPrecio: [], siguienteTipoPrecio: null, piezasParaSiguienteNivel: null,
    datosEntrega: { nombreCompleto: 'Ana Torres', telefono: '6441234567', ciudad: 'Ciudad Obregón', estado: 'Sonora', direccion: 'Calle 5 de Febrero 1234', referencias: null, guardarComoPredeterminada: true },
    metodoPago: { tipoPago: 'TRANSFERENCIA', folio }, fechaHoraPedido: '2026-10-23T18:41:00-07:00',
    enlaceWhatsapp: `https://wa.me/526441234567?text=${folio}`, ...extra,
  }
}

export function gatewayFalso(): IGestionarVentaGateway {
  return {
    obtenerPedidoVentaEnCurso: vi.fn().mockResolvedValue(pedidoFigma()),
    obtenerDatosEntrega: vi.fn().mockResolvedValue({
      nombreCompleto: 'Ana Torres', telefono: '6441234567', ciudad: 'Ciudad Obregón', estado: 'Sonora',
      direccion: 'Calle 5 de Febrero 1234', referencias: null, guardarComoPredeterminada: true,
    }),
    obtenerDatosBancarios: vi.fn().mockResolvedValue({ banco: 'Mercado Pago W', titular: 'FLY Store', numeroCuenta: '1234', clabe: '7229', folio: 'FLY-000128' }),
    validarMetodoPagoDTO: vi.fn().mockResolvedValue({ comprobanteRuta: 'comprobantes/FLY-000128.png', valido: true, mensaje: 'ok' }),
    registrarPedidoVenta: vi.fn().mockImplementation(async (dto: PedidoVentaDTO) => ({
      ...dto, estadoVenta: 'PAGO_EN_REVISION', fechaHoraPedido: '2026-10-23T18:41:00-07:00',
    })),
    generarComprobantePedidoVenta: vi.fn().mockImplementation(async (folio: string) => pedidoRegistrado(folio, 'PAGO_EN_REVISION')),
    agregarAlCarrito: vi.fn().mockResolvedValue(pedidoFigma()),
    actualizarCantidad: vi.fn().mockResolvedValue(pedidoFigma()),
    aplicarCodigoDescuento: vi.fn().mockResolvedValue(pedidoFigma(true)),
    listarPedidosVenta: vi.fn().mockResolvedValue([
      pedidoRegistrado('FLY-000131', 'PENDIENTE_COMPROBANTE', { fechaLimitePago: '2026-10-25T12:37:00-07:00' }),
      pedidoRegistrado('FLY-000128', 'PAGO_EN_REVISION'),
      pedidoRegistrado('FLY-000097', 'CANCELADO_VENCIMIENTO', { fechaLimitePago: '2026-09-30T08:00:00-07:00' }),
    ]),
    obtenerDatosBancariosPedidoVenta: vi.fn().mockImplementation(async (folio: string) => (
      { banco: 'Mercado Pago W', titular: 'FLY Store', numeroCuenta: '1234', clabe: '722 969 0101 2345 6789', folio }
    )),
    subirComprobantePedidoVenta: vi.fn().mockImplementation(async (folio: string) => pedidoRegistrado(folio, 'PAGO_EN_REVISION')),
    cancelarPedidoVenta: vi.fn().mockImplementation(async (folio: string) => pedidoRegistrado(folio, 'CANCELADO')),
  }
}
