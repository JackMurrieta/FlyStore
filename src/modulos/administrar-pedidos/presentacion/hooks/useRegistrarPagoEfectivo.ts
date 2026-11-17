/**
 * Hook (ViewModel) del diálogo «Registrar pago en efectivo»
 * El cambio se calcula en el front; el backend vuelve a validar el monto.
 */

import { useState, useSyncExternalStore } from 'react'
import type { PedidosAdminModel } from '../../aplicacion/PedidosAdminModel'
import type { PedidoResumenTs } from '../../dominio/PedidoResumenTs'
import { estaVencido } from '../../dominio/ReglasPedido'

export function useRegistrarPagoEfectivo(model: PedidosAdminModel, pedido: PedidoResumenTs | null) {
  const estado = useSyncExternalStore(model.suscribir, model.obtenerEstado)
  const [monto, setMonto] = useState<number>(0)

  const vencido = pedido ? estaVencido(pedido.fechaLimite) : false
  const cambio = pedido ? model.calcularCambio(pedido.total, monto) : null

  const capturarMonto = (valor: number): void => {
    setMonto(Number.isFinite(valor) && valor >= 0 ? valor : 0)
  }

  /** Devuelve true si el backend registró el pago */
  const registrar = async (): Promise<boolean> => {
    if (!pedido || vencido || !cambio?.suficiente) return false
    return model.registrarPagoEfectivo(pedido.folio, monto)
  }

  return {
    monto,
    cambio,
    vencido,
    cargando: estado.cargando,
    error: estado.error,
    capturarMonto,
    registrar,
  }
}
