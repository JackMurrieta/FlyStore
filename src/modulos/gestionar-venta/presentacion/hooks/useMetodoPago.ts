/**
 * useMetodoPago · ViewModel de MetodoPagoView (B3, B5, S3).
 * Suscrito a DatosBancariosModel (mensaje 34) y a PedidoEnCursoModel (mensajes 36 y Alt3/Alt4 · 4).
 * Crea el MetodoPagoDTO (mensaje 40) y lo entrega a PedidoEnCursoModel (mensaje 41).
 */

import { useState, useSyncExternalStore } from 'react'
import type { MetodoPagoTs } from '../../dominio/MetodoPagoTs'
import { TipoPago } from '../../dominio/TipoPago'
import type { MetodoPagoDTO } from '../../aplicacion/dto/MetodoPagoDTO'
import { useModelosVenta } from '../ModelosVentaContext'

/** Qué bloque se ve debajo de los datos para transferir. */
export type SeccionTransferencia = 'NINGUNA' | 'COMPROBANTE' | 'DESPUES'

export function useMetodoPago() {
  const { modelos } = useModelosVenta()
  const { pedidoEnCurso, datosBancarios } = modelos
  const bancarios = useSyncExternalStore(datosBancarios.suscribir, datosBancarios.obtenerEstado)
  const pedido = useSyncExternalStore(pedidoEnCurso.suscribir, pedidoEnCurso.obtenerEstado)

  // Si el cliente regresa desde la confirmación («Cambiar»), se muestra lo que ya eligió.
  const [opcion, setOpcion] = useState<TipoPago>(() => pedido.metodoPago?.tipoPago ?? TipoPago.TRANSFERENCIA)
  const [seccion, setSeccion] = useState<SeccionTransferencia>(() =>
    pedido.metodoPago?.modalidad === 'COMPROBANTE' ? 'COMPROBANTE'
      : pedido.metodoPago?.modalidad === 'COMPROBANTE_DESPUES' ? 'DESPUES' : 'NINGUNA'
  )

  /** Básico, mensaje 40 · Alt3 y Alt4, mensaje 2. */
  const crearMetodoPagoDTO = (tipoPago: TipoPago, comprobantePagoArchivo?: File): Promise<MetodoPagoTs | null> => {
    const datos = bancarios.datosBancarios
    if (!datos) return Promise.resolve(null)
    const dto: MetodoPagoDTO = { tipoPago, folio: datos.folio, comprobantePagoArchivo: comprobantePagoArchivo ?? null }
    return pedidoEnCurso.agregarMetodoPagoDTOaPedidoVentaDTO(dto)
  }

  const elegirTransferencia = () => {
    if (opcion === TipoPago.TRANSFERENCIA) return
    setOpcion(TipoPago.TRANSFERENCIA)
    setSeccion('NINGUNA')
    pedidoEnCurso.descartarMetodoPago()
  }

  /** Alt3, mensaje 1. */
  const elegirPagoEfectivo = () => {
    setOpcion(TipoPago.EFECTIVO)
    setSeccion('NINGUNA')
    return crearMetodoPagoDTO(TipoPago.EFECTIVO)
  }

  /** B3 → B4: «Ya transferí, subir comprobante». */
  const mostrarSubirComprobante = () => {
    setSeccion('COMPROBANTE')
    pedidoEnCurso.descartarMetodoPago()
  }

  /** Alt4, mensaje 1. */
  const subirComprobanteDespues = () => {
    setSeccion('DESPUES')
    return crearMetodoPagoDTO(TipoPago.TRANSFERENCIA)
  }

  const metodoPago = pedido.metodoPago
  const listoParaContinuar = Boolean(metodoPago) && (
    opcion === TipoPago.EFECTIVO
      ? metodoPago?.modalidad === 'EFECTIVO'
      : (seccion === 'COMPROBANTE' && metodoPago?.modalidad === 'COMPROBANTE')
        || (seccion === 'DESPUES' && metodoPago?.modalidad === 'COMPROBANTE_DESPUES')
  )

  return {
    datosBancarios: bancarios.datosBancarios,
    cargandoDatosBancarios: bancarios.cargando,
    errorDatosBancarios: bancarios.error,
    informacionPedido: pedido.informacionPedido,
    metodoPago,
    opcion,
    seccion,
    listoParaContinuar,
    crearMetodoPagoDTO,
    elegirTransferencia,
    elegirPagoEfectivo,
    mostrarSubirComprobante,
    subirComprobanteDespues,
    reintentarDatosBancarios: () => datosBancarios.obtenerDatosBancarios(),
  }
}
