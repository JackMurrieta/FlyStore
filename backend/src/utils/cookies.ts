/**
 * Utilidades para manejo de cookies HTTP-only
 */

const COOKIE_NAME = 'flystore_session'
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 // 7 días en segundos

export interface CookieOptions {
  maxAge?: number
  secure?: boolean
  sameSite?: 'Strict' | 'Lax' | 'None'
}

/**
 * Crea una cookie HTTP-only segura
 * IMPORTANTE: No usa flag Secure en desarrollo local para permitir HTTP
 */
export function createSessionCookie(
  accessToken: string,
  refreshToken: string,
  options: CookieOptions = {}
): string {
  // Detectar si estamos en desarrollo (localhost) o producción
  // En desarrollo NO usar Secure (permite HTTP)
  // En producción SÍ usar Secure (requiere HTTPS)
  const isProduction = typeof process !== 'undefined'
    ? process.env.NODE_ENV === 'production'
    : true // Por defecto asumir producción si no hay process

  const {
    maxAge = COOKIE_MAX_AGE,
    secure = false, // SIEMPRE false para permitir desarrollo local
    sameSite = 'Lax'
  } = options

  // Guardamos ambos tokens en formato JSON
  const sessionData = JSON.stringify({ accessToken, refreshToken })
  const encodedData = encodeURIComponent(sessionData)

  const cookieParts = [
    `${COOKIE_NAME}=${encodedData}`,
    `Max-Age=${maxAge}`,
    'HttpOnly',
    'Path=/',
    `SameSite=${sameSite}`
  ]

  // Solo agregar Secure si está explícitamente habilitado
  if (secure) {
    cookieParts.push('Secure')
  }

  return cookieParts.join('; ')
}

/**
 * Crea una cookie de eliminación (logout)
 */
export function clearSessionCookie(): string {
  return `${COOKIE_NAME}=; Max-Age=0; HttpOnly; Path=/; SameSite=Lax`
}

/**
 * Extrae los tokens de la cookie
 */
export function getSessionFromCookie(cookieHeader: string | undefined): {
  accessToken: string
  refreshToken: string
} | null {
  if (!cookieHeader) return null

  const match = cookieHeader.match(new RegExp(`${COOKIE_NAME}=([^;]+)`))
  if (!match) return null

  try {
    const decodedData = decodeURIComponent(match[1])
    const sessionData = JSON.parse(decodedData)

    if (sessionData.accessToken && sessionData.refreshToken) {
      return sessionData
    }
    return null
  } catch {
    return null
  }
}
