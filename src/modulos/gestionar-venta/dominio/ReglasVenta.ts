/**
 * Reglas del CU-02 que el front necesita para validar y para mostrar plazos.
 * El backend vuelve a validar todo; estas reglas solo evitan viajes inútiles.
 */

/** Plazo para pagar o subir el comprobante; al vencer, el pedido se elimina. */
export const HORAS_LIMITE_PAGO = 42

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
