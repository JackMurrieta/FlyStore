/**
 * useSubirComprobante · ViewModel del bloque «Tu comprobante» de MetodoPagoView (B4, A6, A7).
 * Recibe la respuesta de validación (mensaje 45) o el mensaje de error del Alt5 (mensaje 7).
 */

import { useEffect, useMemo, useState, useSyncExternalStore } from 'react'
import { useModelosVenta } from '../ModelosVentaContext'

export function useSubirComprobante() {
  const { modelos } = useModelosVenta()
  const modelo = modelos.pedidoEnCurso
  const estado = useSyncExternalStore(modelo.suscribir, modelo.obtenerEstado)
  const [archivo, setArchivo] = useState<File | null>(null)
  const [errorArchivo, setErrorArchivo] = useState<string | null>(null)

  const vistaPreviaUrl = useMemo(
    () => (archivo && archivo.type.startsWith('image/') ? URL.createObjectURL(archivo) : null),
    [archivo]
  )
  useEffect(() => () => {
    if (vistaPreviaUrl) URL.revokeObjectURL(vistaPreviaUrl)
  }, [vistaPreviaUrl])

  /** El cliente elige (o cambia) el archivo: se valida en el front (A6) y se descarta la validación anterior. */
  const seleccionarArchivo = (nuevo: File | null) => {
    setArchivo(nuevo)
    setErrorArchivo(nuevo ? modelo.validarArchivoComprobante(nuevo) : null)
    modelo.descartarMetodoPago()
  }

  const errorServidor = estado.errorComprobante
  const comprobanteValido = Boolean(estado.respuestaValidacion?.valido) && estado.metodoPago?.modalidad === 'COMPROBANTE'

  return {
    archivo,
    vistaPreviaUrl,
    esPdf: Boolean(archivo && (archivo.type === 'application/pdf' || archivo.name.toLowerCase().endsWith('.pdf'))),
    validando: estado.validandoComprobante,
    respuestaValidacion: estado.respuestaValidacion,
    comprobanteValido,
    /** Mensaje para la vista: primero el del front (A6), luego el del backend (Alt5) o de conexión (A7). */
    mensajeError: errorArchivo ?? errorServidor?.mensaje ?? null,
    errorDeConexion: !errorArchivo && errorServidor?.tipo === 'red',
    archivoValidoLocal: Boolean(archivo) && !errorArchivo,
    seleccionarArchivo,
  }
}
