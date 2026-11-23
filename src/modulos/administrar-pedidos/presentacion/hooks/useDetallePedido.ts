/**
 * Hook (ViewModel) del detalle de un pedido y sus acciones
 * (aprobar pago, rechazar comprobante, actualizar estado). El personal no cancela pedidos.
 */

import { useEffect, useSyncExternalStore } from 'react'
import type { PedidosAdminModel } from '../../aplicacion/PedidosAdminModel'
import type { EstadoPedidoTs } from '../../dominio/EstadoPedidoTs'
import type { DatosEnvioTs } from '../../dominio/DatosEnvioTs'
import type { ResultadoValidacionTs } from '../../dominio/ResultadoValidacionTs'
import * as reglas from '../../dominio/ReglasPedido'
import { construirEnlaceWhatsApp, mensajeParaCliente } from '../mensajes'

export function useDetallePedido(model: PedidosAdminModel, folio: string) {
  const estado = useSyncExternalStore(model.suscribir, model.obtenerEstado)

  useEffect(() => {
    void model.cargarDetalle(folio)
  }, [model, folio])

  // Solo exponemos el detalle si corresponde al folio de la ruta
  const detalle = estado.detalle && estado.detalle.folio === folio ? estado.detalle : null

  // Estado que mostraba la lista cuando ya no coincide con el del detalle
  // (otro usuario o el job de vencimiento movió el pedido mientras tanto)
  const estadoEnLista = estado.pedidos.find((p) => p.folio === folio)?.estado ?? null
  const estadoAnterior = detalle && estadoEnLista && estadoEnLista !== detalle.estado ? estadoEnLista : null

  /** Vuelve a pedir el detalle al backend (también es el «Reintentar» de la vista) */
  const cargar = (): Promise<void> => model.cargarDetalle(folio)

  const siguienteEstadoPermitido = (): EstadoPedidoTs | null =>
    detalle ? model.siguienteEstadoPermitido(detalle.estado, detalle.metodoPago) : null

  const validarMotivo = (motivo: string): boolean => reglas.validarMotivo(motivo)

  const validarTransicion = (nuevo: EstadoPedidoTs, envio: DatosEnvioTs | null): ResultadoValidacionTs | null =>
    detalle ? model.validarTransicion(detalle.estado, detalle.metodoPago, nuevo, envio) : null

  /** Enlace wa.me para notificar a mano cuando el backend no pudo hacerlo */
  const enlaceWhatsApp = (): string | null =>
    detalle ? construirEnlaceWhatsApp(detalle.cliente.telefono, mensajeParaCliente(detalle)) : null

  /** Sin motivo no se llama al modelo: el diálogo pide indicarlo */
  const rechazarComprobante = (motivo: string, mensaje: string | null): Promise<boolean> =>
    validarMotivo(motivo) ? model.rechazarComprobante(folio, motivo, mensaje) : Promise.resolve(false)

  /** El modelo valida la transición antes de llamar al backend */
  const actualizarEstado = (nuevo: EstadoPedidoTs, envio: DatosEnvioTs | null): Promise<boolean> =>
    model.actualizarEstado(folio, nuevo, envio)

  return {
    detalle,
    cargando: estado.cargando,
    error: estado.error,
    mensaje: estado.mensaje,
    notificacionPendiente: estado.notificacionPendiente,
    estadoAnterior,
    cargar,
    siguienteEstadoPermitido,
    validarMotivo,
    validarTransicion,
    enlaceWhatsApp,
    aprobarPago: (): Promise<boolean> => model.aprobarPago(folio),
    rechazarComprobante,
    actualizarEstado,
    limpiarAvisos: (): void => model.limpiarAvisos(),
  }
}
