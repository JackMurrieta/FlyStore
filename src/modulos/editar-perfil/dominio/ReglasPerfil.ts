/**
 * Reglas del perfil que el front valida antes de llamar al backend (el backend vuelve a validar).
 */

import type { DatosPersonalesTs, ErroresDatosPersonales } from './PerfilTs'

export { validarContrasena, MINIMO_CONTRASENA, MAXIMO_CONTRASENA } from '@compartido/reglas/contrasena'
export type { ErroresContrasena } from '@compartido/reglas/contrasena'

export const LARGO_MAXIMO_NOMBRE = 80
export const LARGO_MAXIMO_APELLIDOS = 120

export const soloDigitos = (valor: string): string => valor.replace(/\D/g, '')

export function validarDatosPersonales(datos: DatosPersonalesTs): ErroresDatosPersonales {
  const errores: { -readonly [K in keyof ErroresDatosPersonales]: ErroresDatosPersonales[K] } = {}
  if (!datos.nombre.trim()) errores.nombre = 'Escribe tu nombre'
  else if (datos.nombre.trim().length > LARGO_MAXIMO_NOMBRE) errores.nombre = 'El nombre es muy largo'
  if (!datos.apellidos.trim()) errores.apellidos = 'Escribe tus apellidos'
  else if (datos.apellidos.trim().length > LARGO_MAXIMO_APELLIDOS) errores.apellidos = 'Los apellidos son muy largos'
  const telefono = soloDigitos(datos.telefono)
  if (telefono && telefono.length !== 10) errores.telefono = 'El teléfono debe tener 10 dígitos'
  return errores
}

const CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export function validarCorreo(correo: string, actual: string): string | null {
  const limpio = correo.trim().toLowerCase()
  if (!limpio) return 'Escribe tu nuevo correo'
  if (!CORREO.test(limpio)) return 'Revisa el correo; no es válido'
  if (limpio === actual.trim().toLowerCase()) return 'Ese ya es tu correo actual'
  return null
}

export const sinErrores = (errores: object): boolean => Object.values(errores).every((valor) => !valor)
