/**
 * Reglas para contraseñas nuevas (cambiar en Mi perfil o restablecer desde el correo).
 * El backend aplica las mismas: 8 a 72 caracteres, con letras y números.
 */

export const MINIMO_CONTRASENA = 8
export const MAXIMO_CONTRASENA = 72

export interface ErroresContrasena {
  readonly actual?: string
  readonly nueva?: string
  readonly confirmacion?: string
}

/** `actual` es null cuando no se pide (restablecer desde el enlace del correo). */
export function validarContrasena(actual: string | null, nueva: string, confirmacion: string): ErroresContrasena {
  const errores: { -readonly [K in keyof ErroresContrasena]: ErroresContrasena[K] } = {}
  if (actual !== null && !actual) errores.actual = 'Escribe tu contraseña actual'
  if (nueva.length < MINIMO_CONTRASENA) errores.nueva = `Usa al menos ${MINIMO_CONTRASENA} caracteres`
  else if (nueva.length > MAXIMO_CONTRASENA) errores.nueva = `Usa máximo ${MAXIMO_CONTRASENA} caracteres`
  else if (!/[A-Za-zÁÉÍÓÚÑáéíóúñ]/.test(nueva) || !/\d/.test(nueva)) errores.nueva = 'Combina letras y números'
  else if (actual && nueva === actual) errores.nueva = 'Debe ser distinta de la actual'
  if (!errores.nueva && confirmacion !== nueva) errores.confirmacion = 'Las contraseñas no coinciden'
  return errores
}
