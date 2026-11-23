/**
 * Reglas del CU-02 que el front necesita para validar y para mostrar plazos.
 * El backend vuelve a validar todo; estas reglas solo evitan viajes inútiles.
 */

import { EstadoVenta } from './EstadoVenta'

/** Plazo para pagar o subir el comprobante; al vencer, el pedido queda CANCELADO_VENCIMIENTO (no se borra). */
export const HORAS_LIMITE_PAGO = 42

/**
 * El plazo de pago de un pedido registrado ya venció: el backend lo canceló por vencimiento, o
 * sigue esperando pago pero pasó su fecha límite (el proceso que lo cancela aún no corre).
 */
export function plazoPagoVencido(estadoVenta: string, fechaLimitePago: Date | null, ahora: Date): boolean {
  if (estadoVenta === EstadoVenta.CANCELADO_VENCIMIENTO) return true
  const esperaPago = estadoVenta === EstadoVenta.PENDIENTE_COMPROBANTE || estadoVenta === EstadoVenta.APARTADO_PENDIENTE_PAGO
  return esperaPago && fechaLimitePago !== null && fechaLimitePago.getTime() <= ahora.getTime()
}

/**
 * El cliente puede cancelar su pedido mientras está apartado (efectivo) o esperando su
 * comprobante (transferencia) y el plazo sigue vigente. Ya pagado, en revisión o vencido, no.
 * El personal nunca cancela pedidos.
 */
export function puedeCancelarPedido(estadoVenta: string, fechaLimitePago: Date | null, ahora: Date): boolean {
  const cancelable = estadoVenta === EstadoVenta.APARTADO_PENDIENTE_PAGO || estadoVenta === EstadoVenta.PENDIENTE_COMPROBANTE
  return cancelable && !plazoPagoVencido(estadoVenta, fechaLimitePago, ahora)
}

/** Largo máximo del motivo de cancelación (CancelarPedidoPeticionDTO del backend). */
export const MAX_MOTIVO_CANCELACION = 300

/** Formatos aceptados para el comprobante de transferencia. */
export const TIPOS_COMPROBANTE = ['image/jpeg', 'image/png', 'application/pdf'] as const
export const EXTENSIONES_COMPROBANTE = ['jpg', 'jpeg', 'png', 'pdf'] as const

/** Tamaño máximo del comprobante: 5 MB. */
export const TAMANO_MAXIMO_COMPROBANTE = 5 * 1024 * 1024

export const MENSAJE_COMPROBANTE_INVALIDO = 'Sube una imagen JPG o PNG, o un PDF, de máximo 5 MB.'

/** Devuelve el mensaje de error o null si el archivo cumple formato y tamaño. */
export function validarArchivoComprobante(archivo: File): string | null {
  const extension = archivo.name.split('.').pop()?.toLowerCase() ?? ''
  const tipoValido = (TIPOS_COMPROBANTE as readonly string[]).includes(archivo.type)
    || (EXTENSIONES_COMPROBANTE as readonly string[]).includes(extension)
  if (!tipoValido || archivo.size === 0 || archivo.size > TAMANO_MAXIMO_COMPROBANTE) {
    return MENSAJE_COMPROBANTE_INVALIDO
  }
  return null
}

/** Quita espacios, guiones y paréntesis de un teléfono. */
export function soloDigitos(valor: string): string {
  return valor.replace(/\D/g, '')
}

/** Teléfono de WhatsApp en México: exactamente 10 dígitos. */
export const DIGITOS_TELEFONO = 10
