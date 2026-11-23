/**
 * useConfirmarPedido · ViewModel de ConfirmarPedidoView (B6, A9).
 * Suscrito a PedidoEnCursoModel (mensajes 50 y 54) y a DatosEntregaModel (mensaje 52).
 */

import { useSyncExternalStore } from 'react'
import { useModelosVenta } from '../ModelosVentaContext'

export function useConfirmarPedido() {
  const { modelos } = useModelosVenta()
  const pedido = useSyncExternalStore(modelos.pedidoEnCurso.suscribir, modelos.pedidoEnCurso.obtenerEstado)
  const entrega = useSyncExternalStore(modelos.datosEntrega.suscribir, modelos.datosEntrega.obtenerEstado)

  return {
    informacionPedido: pedido.informacionPedido,
    metodoPago: pedido.metodoPago,
    datosEntrega: entrega.datosEntrega,
    registrando: pedido.registrando,
    error: pedido.error,
  }
}
