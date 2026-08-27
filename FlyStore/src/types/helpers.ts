/**
 * Funciones helper para validación y utilidades de tipos
 */

import type { User } from './auth.types';

/**
 * Verifica si el perfil del usuario está completo
 * Un perfil está completo si tiene:
 * - nombre (obligatorio)
 * - telefono (obligatorio)
 * - direccion (obligatorio)
 *
 * Los usuarios que se registran con Google pueden no tener estos campos
 */
export function isProfileComplete(user: User | null): boolean {
  if (!user) return false;

  // Verificar que existan los campos requeridos y no estén vacíos
  const hasNombre = !!user.nombre && user.nombre.trim().length > 0;
  const hasTelefono = !!user.telefono && user.telefono.trim().length > 0;
  const hasDireccion = !!user.direccion && user.direccion.trim().length > 0;

  return hasNombre && hasTelefono && hasDireccion;
}

/**
 * Obtiene los campos faltantes del perfil
 * Retorna un array con los nombres de los campos que faltan
 */
export function getMissingProfileFields(user: User | null): string[] {
  if (!user) return ['nombre', 'telefono', 'direccion'];

  const missing: string[] = [];

  if (!user.nombre || user.nombre.trim().length === 0) {
    missing.push('nombre');
  }
  if (!user.telefono || user.telefono.trim().length === 0) {
    missing.push('telefono');
  }
  if (!user.direccion || user.direccion.trim().length === 0) {
    missing.push('direccion');
  }

  return missing;
}