/**
 * useDatosEntrega · ViewModel de DatosEntregaView (B2, A5).
 * Suscrito a DatosEntregaModel (mensaje 19) y a PedidoEnCursoModel (mensaje 24).
 */

import { useSyncExternalStore } from 'react'
import type { CampoDatosEntrega } from '../../dominio/DatosEntregaTs'
import { useModelosVenta } from '../ModelosVentaContext'

export function useDatosEntrega() {
  const { modelos } = useModelosVenta()
  const entrega = useSyncExternalStore(modelos.datosEntrega.suscribir, modelos.datosEntrega.obtenerEstado)
  const pedido = useSyncExternalStore(modelos.pedidoEnCurso.suscribir, modelos.pedidoEnCurso.obtenerEstado)

  return {
    datosEntrega: entrega.datosEntrega,
    erroresCampo: entrega.erroresCampo,
    cargando: entrega.cargando,
    error: entrega.error,
    informacionPedido: pedido.informacionPedido,
    actualizarCampo: (campo: CampoDatosEntrega, valor: string) =>
      modelos.datosEntrega.actualizarDatosEntrega({ [campo]: valor }),
    cambiarGuardarPredeterminada: (valor: boolean) =>
      modelos.datosEntrega.actualizarDatosEntrega({ guardarComoPredeterminada: valor }),
  }
}
