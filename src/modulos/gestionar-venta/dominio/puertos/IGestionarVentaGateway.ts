import type { PedidoVentaDTO } from '../../aplicacion/dto/PedidoVentaDTO'
import type { DatosEntregaDTO } from '../../aplicacion/dto/DatosEntregaDTO'
import type { DatosBancariosDTO } from '../../aplicacion/dto/DatosBancariosDTO'
import type { MetodoPagoDTO } from '../../aplicacion/dto/MetodoPagoDTO'
import type { RespuestaValidacionComprobanteDTO } from '../../aplicacion/dto/RespuestaValidacionComprobanteDTO'
import type { ActualizarCantidadPeticionDTO } from '../../aplicacion/dto/ActualizarCantidadPeticionDTO'
import type { AplicarCodigoPeticionDTO } from '../../aplicacion/dto/AplicarCodigoPeticionDTO'
import type { AgregarAlCarritoPeticionDTO } from '../../aplicacion/dto/AgregarAlCarritoPeticionDTO'

/**
 * Puerto único del CU-02 hacia el backend (los controllers del backend funcionan como BFF).
 * Firmas tomadas de los diagramas de secuencia de diseño. Contrato:
 * 2xx → DTO; 4xx/5xx → lanza error con el mensaje del backend. No valida ni transforma.
 */
export interface IGestionarVentaGateway {
  /** Básico, mensaje 4. */
  obtenerPedidoVentaEnCurso(clienteId: string): Promise<PedidoVentaDTO>
  /** Básico, mensaje 14. */
  obtenerDatosEntrega(clienteId: string): Promise<DatosEntregaDTO>
  /** Básico, mensaje 29. El backend genera el folio en esta llamada. */
  obtenerDatosBancarios(): Promise<DatosBancariosDTO>
  /** Básico, mensaje 42. Rechazo → RespuestaValidacionComprobanteException (Alt5). */
  validarMetodoPagoDTO(dto: MetodoPagoDTO): Promise<RespuestaValidacionComprobanteDTO>
  /** Básico, mensaje 61; Alt3 y Alt4, mensaje 20. */
  registrarPedidoVenta(dto: PedidoVentaDTO): Promise<PedidoVentaDTO>
  /**
   * Básico, mensaje 65. Datos del ticket: el pedido registrado tal como lo guarda el backend.
   * El front lo pinta con TicketPedido y el cliente lo imprime o guarda como PDF (window.print).
   */
  generarComprobantePedidoVenta(folio: string): Promise<PedidoVentaDTO>
  /**
   * Entrada desde el CU-01 (ficha del producto). Crea el pedido PENDIENTE si no existe y
   * responde el carrito actualizado. Solo clientes con sesión (401 sin sesión, 403 cuenta de personal).
   */
  agregarAlCarrito(dto: AgregarAlCarritoPeticionDTO): Promise<PedidoVentaDTO>
  /** Alt1, mensaje 4. */
  actualizarCantidad(dto: ActualizarCantidadPeticionDTO): Promise<PedidoVentaDTO>
  /** Alt2, mensaje 4. */
  aplicarCodigoDescuento(dto: AplicarCodigoPeticionDTO): Promise<PedidoVentaDTO>

  // ── S6 «Mis pedidos» (subir el comprobante después) ──
  /** Pedidos registrados del cliente, del más reciente al más antiguo. No incluye el carrito. */
  listarPedidosVenta(): Promise<PedidoVentaDTO[]>
  /** Cuenta para transferir con el folio de un pedido ya registrado (no genera folio nuevo). */
  obtenerDatosBancariosPedidoVenta(folio: string): Promise<DatosBancariosDTO>
  /** Sube el comprobante de un pedido PENDIENTE_COMPROBANTE; responde el pedido en PAGO_EN_REVISION. */
  subirComprobantePedidoVenta(folio: string, archivo: File): Promise<PedidoVentaDTO>
  /**
   * El cliente cancela su pedido mientras está APARTADO_PENDIENTE_PAGO o PENDIENTE_COMPROBANTE y no
   * ha vencido; el motivo es opcional. Responde el pedido en CANCELADO; 409 si ya no se puede cancelar.
   */
  cancelarPedidoVenta(folio: string, motivo: string | null): Promise<PedidoVentaDTO>
}
