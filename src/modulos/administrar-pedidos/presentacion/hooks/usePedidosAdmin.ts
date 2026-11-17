/**
 * Hook (ViewModel) de la lista de pedidos del administrador
 * Se suscribe a PedidosAdminModel con useSyncExternalStore
 */

import { useEffect, useSyncExternalStore } from 'react'
import type { PedidosAdminModel } from '../../aplicacion/PedidosAdminModel'
import type { CriteriosBusquedaTs } from '../../dominio/CriteriosBusquedaTs'
import { hayCriterios } from '../../dominio/CriteriosBusquedaTs'
import { useNavegacionPedidos } from './useNavegacionPedidos'

export function usePedidosAdmin(model: PedidosAdminModel) {
  const estado = useSyncExternalStore(model.suscribir, model.obtenerEstado)
  const { irADetalle } = useNavegacionPedidos()

  // Carga inicial al montar la vista
  useEffect(() => {
    void model.cargarPedidos()
  }, [model])

  const buscar = (criterios: CriteriosBusquedaTs): Promise<void> => model.buscarPedidos(criterios)

  const limpiarFiltros = (): Promise<void> => model.limpiarFiltros()

  const limpiarAvisos = (): void => model.limpiarAvisos()

  return {
    pedidos: estado.pedidos,
    totalEncontrado: estado.totalEncontrado,
    criterios: estado.criterios,
    hayFiltros: hayCriterios(estado.criterios),
    cargando: estado.cargando,
    error: estado.error,
    mensaje: estado.mensaje,
    buscar,
    limpiarFiltros,
    limpiarAvisos,
    irADetalle,
  }
}
