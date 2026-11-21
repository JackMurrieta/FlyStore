/**
 * usePedidoRegistrado · ViewModel de PedidoRegistradoView (B7).
 * Si el pedido de ese folio no está en memoria (la página se abrió por URL o se recargó),
 * lo pide al backend (generarComprobantePedidoVenta) en lugar de regresar al carrito.
 * El ticket se arma con esos datos y se imprime o guarda como PDF con window.print().
 */

import { useEffect, useSyncExternalStore } from 'react'
import { useModelosVenta } from '../ModelosVentaContext'

export function usePedidoRegistrado(folio: string) {
  const { modelos } = useModelosVenta()
  const modelo = modelos.pedidoEnCurso
  const pedido = useSyncExternalStore(modelo.suscribir, modelo.obtenerEstado)
  const entrega = useSyncExternalStore(modelos.datosEntrega.suscribir, modelos.datosEntrega.obtenerEstado)

  useEffect(() => {
    if (!folio) return
    const estado = modelo.obtenerEstado()
    if (estado.pedidoRegistrado?.folio === folio || estado.generandoComprobantePedido) return
    void modelo.generarComprobantePedidoVenta(folio)
  }, [folio, modelo])

  const registrado = pedido.pedidoRegistrado
  const coincide = Boolean(registrado) && (registrado?.folio ?? folio) === folio
  const datos = entrega.datosEntrega

  return {
    pedidoRegistrado: coincide ? registrado : null,
    cliente: registrado?.cliente ?? (datos ? { nombre: datos.nombreCompleto, telefono: datos.telefono } : null),
    cargando: !coincide && pedido.generandoComprobantePedido,
    error: coincide ? null : pedido.errorComprobantePedido,
    reintentar: () => modelo.generarComprobantePedidoVenta(folio),
    imprimirTicket: () => window.print(),
  }
}
