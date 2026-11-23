/**
 * Ruta a la que volver después de crear la cuenta. El correo de confirmación abre /auth/confirmar sin
 * saber de dónde venía la persona; esta ruta (guardada al registrarse) la regresa a donde estaba, por
 * ejemplo a la ficha del producto que quería agregar al carrito. Solo rutas internas.
 *
 * Usa localStorage (y no sessionStorage) porque el enlace del correo suele abrir otra pestaña.
 * No es un token ni un dato personal: solo una ruta interna con vigencia de 24 h.
 */
/* eslint-disable no-restricted-globals -- se guarda una ruta interna, nunca un token */

const CLAVE = 'fly.rutaTrasCrearCuenta'
const VIGENCIA_MS = 24 * 60 * 60 * 1000

/** Solo rutas internas («/…», sin «//» ni «\»): evita redirigir a otro sitio. */
export function esRutaInterna(ruta: string | null | undefined): ruta is string {
  return Boolean(ruta && ruta.startsWith('/') && !ruta.startsWith('//') && !ruta.includes('\\'))
}

export function guardarRutaPendiente(ruta: string | null | undefined, ahora = Date.now()): void {
  if (!esRutaInterna(ruta)) return
  try {
    localStorage.setItem(CLAVE, JSON.stringify({ ruta, guardada: ahora }))
  } catch {
    /* sin almacenamiento: se vuelve al inicio */
  }
}

/** Ruta guardada si sigue vigente, sin borrarla. */
export function consultarRutaPendiente(ahora = Date.now()): string | null {
  try {
    const texto = localStorage.getItem(CLAVE)
    if (!texto) return null
    const { ruta, guardada } = JSON.parse(texto) as { ruta?: string; guardada?: number }
    return esRutaInterna(ruta) && typeof guardada === 'number' && ahora - guardada < VIGENCIA_MS ? ruta : null
  } catch {
    return null
  }
}

/** Devuelve la ruta guardada (si sigue vigente) y la borra. */
export function tomarRutaPendiente(ahora = Date.now()): string | null {
  const ruta = consultarRutaPendiente(ahora)
  try {
    localStorage.removeItem(CLAVE)
  } catch {
    /* nada que borrar */
  }
  return ruta
}
