/**
 * usePedidoRegistrado · ViewModel de PedidoRegistradoView (B7).
 * Recibe el ticket como JSON con HTML+CSS (mensaje 68) para mostrar en pantalla
 * y permitir descarga como PDF usando window.print().
 */

import { useSyncExternalStore } from 'react'
import { useModelosVenta } from '../ModelosVentaContext'

export function usePedidoRegistrado(folio: string) {
  const { modelos } = useModelosVenta()
  const modelo = modelos.pedidoEnCurso
  const pedido = useSyncExternalStore(modelo.suscribir, modelo.obtenerEstado)
  const entrega = useSyncExternalStore(modelos.datosEntrega.suscribir, modelos.datosEntrega.obtenerEstado)

  const comprobante = pedido.comprobantePedidoPDF

  const registrado = pedido.pedidoRegistrado
  const coincide = Boolean(registrado) && (registrado?.folio ?? folio) === folio
  const datos = entrega.datosEntrega

  return {
    pedidoRegistrado: coincide ? registrado : null,
    cliente: registrado?.cliente ?? (datos ? { nombre: datos.nombreCompleto, telefono: datos.telefono } : null),
    comprobante, // ComprobantePedidoDTO con { folio, fechaEmision, html, css }
    nombreTicket: `Pedido-${folio}.pdf`,
    generandoTicket: pedido.generandoComprobantePedido,
    errorTicket: pedido.errorComprobantePedido,
    reintentarTicket: () => modelo.generarComprobantePedidoVenta(folio),
  }
}
