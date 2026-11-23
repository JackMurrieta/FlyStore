/**
 * Puerto: servicio de pedidos para el administrador (CU04)
 * Implementado por PedidosAdminHttpService
 *
 * Habla en tipos Ts; el adaptador HTTP convierte DTO ↔ Ts.
 * Lanza ErrorApi ante respuestas 4xx/5xx del backend.
 */

import type { CriteriosBusquedaTs } from '../CriteriosBusquedaTs'
import type { PaginaPedidosTs } from '../PaginaPedidosTs'
import type { DetallePedidoAdminTs } from '../DetallePedidoAdminTs'
import type { ResultadoAccionTs } from '../ResultadoAccionTs'
import type { EstadoPedidoTs } from '../EstadoPedidoTs'
import type { DatosEnvioTs } from '../DatosEnvioTs'

export interface IPedidosAdminService {
  /** GET /api/admin/pedidos — lista (recientes primero) con búsqueda y filtros */
  listar(criterios: CriteriosBusquedaTs): Promise<PaginaPedidosTs>

  /** GET /api/admin/pedidos/{folio} */
  obtenerDetalle(folio: string): Promise<DetallePedidoAdminTs>

  /** POST /api/admin/pedidos/{folio}/pago-efectivo */
  registrarPagoEfectivo(folio: string, montoRecibido: number): Promise<ResultadoAccionTs>

  /** POST /api/admin/pedidos/{folio}/aprobar-pago — la transferencia pasa a En preparación */
  aprobarPago(folio: string): Promise<ResultadoAccionTs>

  /** POST /api/admin/pedidos/{folio}/rechazar-comprobante */
  rechazarComprobante(folio: string, motivo: string, mensaje: string | null): Promise<ResultadoAccionTs>

  /** PATCH /api/admin/pedidos/{folio}/estado */
  actualizarEstado(folio: string, estado: EstadoPedidoTs, envio: DatosEnvioTs | null): Promise<ResultadoAccionTs>
}
