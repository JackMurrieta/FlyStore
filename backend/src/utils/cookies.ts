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
 */
export function createSessionCookie(
  accessToken: string,
  refreshToken: string,
  options: CookieOptions = {}
): string {
  const {
    maxAge = COOKIE_MAX_AGE,
    secure = true,
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
