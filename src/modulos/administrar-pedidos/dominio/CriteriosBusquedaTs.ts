/**
 * Criterios de búsqueda y filtros de la lista de pedidos
 * texto: folio, nombre o teléfono del cliente
 */

import type { EstadoPedidoTs } from './EstadoPedidoTs'
import type { MetodoPagoTs } from './MetodoPagoTs'

export interface CriteriosBusquedaTs {
  readonly texto: string
  readonly estado: EstadoPedidoTs | null
  readonly metodoPago: MetodoPagoTs | null
  readonly desde: Date | null
  readonly hasta: Date | null
  readonly pagina: number
}

/** Pedidos por página: el mismo valor que CriteriosBusquedaPedidos.TAMANO_PAGINA del backend */
export const TAMANO_PAGINA = 50

export const CRITERIOS_VACIOS: CriteriosBusquedaTs = {
  texto: '',
  estado: null,
  metodoPago: null,
  desde: null,
  hasta: null,
  pagina: 1,
}

export function hayCriterios(criterios: CriteriosBusquedaTs): boolean {
  return (
    criterios.texto.trim() !== '' ||
    criterios.estado !== null ||
    criterios.metodoPago !== null ||
    criterios.desde !== null ||
    criterios.hasta !== null
  )
}
