/**
 * Utilidad de redirección de navegación
 * ÚNICO lugar que usa window.location (Variaciones protegidas - GRASP)
 *
 * Usado para el flujo de Google OAuth que requiere navegación completa
 */

/**
 * Redirige a una URL usando navegación completa (page reload)
 * Solo para flujos que lo requieren (OAuth)
 */
export function redirigirA(url: string): void {
  window.location.assign(url)
}

/**
 * Valida que una ruta de redirección sea segura (interna)
 * Previene Open Redirect vulnerabilities
 *
 * @example
 * rutaInternaSegura('/productos') // → '/productos'
 * rutaInternaSegura('//evil.com') // → null
 * rutaInternaSegura('https://evil.com') // → null
 */
export function rutaInternaSegura(ruta: string | null | undefined): string | null {
  if (!ruta) return null

  // Debe empezar con / pero NO con //
  if (!ruta.startsWith('/') || ruta.startsWith('//')) {
    return null
  }

  // No debe contener protocolo
  if (ruta.includes('://')) {
    return null
  }

  return ruta
}
