/**
 * Estado observable del módulo Administrar Pedidos
 * Inmutable: PedidosAdminModel lo reemplaza con actualizar()
 */

import type { ErrorTs } from '@compartido/tipos/ErrorTs'
import type { PedidoResumenTs } from './PedidoResumenTs'
import type { CriteriosBusquedaTs } from './CriteriosBusquedaTs'
import type { DetallePedidoAdminTs } from './DetallePedidoAdminTs'
import { CRITERIOS_VACIOS } from './CriteriosBusquedaTs'

export interface EstadoPedidosAdminTs {
  readonly pedidos: readonly PedidoResumenTs[]
  readonly totalEncontrado: number
  readonly criterios: CriteriosBusquedaTs
  readonly detalle: DetallePedidoAdminTs | null
  readonly cargando: boolean
  readonly error: ErrorTs | null
  readonly mensaje: string | null
  readonly notificacionPendiente: boolean
}

export const ESTADO_INICIAL_PEDIDOS_ADMIN: EstadoPedidosAdminTs = {
  pedidos: [],
  totalEncontrado: 0,
  criterios: CRITERIOS_VACIOS,
  detalle: null,
  cargando: false,
  error: null,
  mensaje: null,
  notificacionPendiente: false,
}
