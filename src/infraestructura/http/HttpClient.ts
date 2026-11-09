/**
 * Cliente HTTP centralizado para todas las llamadas al backend
 *
 * Características:
 * - Cookies HttpOnly automáticas (credentials: 'include')
 * - Manejo centralizado de errores (ErrorDTO → ErrorApi)
 * - Refresh automático ante 401 (con candado para evitar múltiples refreshes)
 * - Timeout configurable
 * - No usa localStorage ni sessionStorage (sesión en cookies)
 */

import { ErrorApi } from './ErrorApi'
import type { ErrorDTO } from '@compartido/contratos/ErrorDTO'
import * as endpoints from './endpoints'

type MetodoHTTP = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

interface OpcionesHTTP extends Omit<RequestInit, 'method' | 'body'> {
  timeout?: number
}

export class HttpClient {
  private readonly timeout: number = 120000 // 2 minutos por defecto
  private refreshEnProceso: Promise<void> | null = null
  private alExpirarSesion: (() => void) | null = null

  /**
   * Configura el callback que se ejecuta cuando la sesión expira
   * (después de que el refresh también falle)
   */
  public configurarCallbackExpiracion(callback: () => void): void {
    this.alExpirarSesion = callback
  }

  /**
   * GET request
   */
  public async get<T>(url: string, opciones?: OpcionesHTTP): Promise<T> {
    return this.peticion<T>('GET', url, undefined, opciones)
  }

  /**
   * POST request
   */
  public async post<T>(url: string, body?: unknown, opciones?: OpcionesHTTP): Promise<T> {
    return this.peticion<T>('POST', url, body, opciones)
  }

  /**
   * PUT request
   */
  public async put<T>(url: string, body?: unknown, opciones?: OpcionesHTTP): Promise<T> {
    return this.peticion<T>('PUT', url, body, opciones)
  }

  /**
   * PATCH request
   */
  public async patch<T>(url: string, body?: unknown, opciones?: OpcionesHTTP): Promise<T> {
    return this.peticion<T>('PATCH', url, body, opciones)
  }

  /**
   * DELETE request
   */
  public async delete<T>(url: string, opciones?: OpcionesHTTP): Promise<T> {
    return this.peticion<T>('DELETE', url, undefined, opciones)
  }

  /**
   * POST multipart (para subir archivos)
   */
  public async postMultipart<T>(url: string, formData: FormData, opciones?: OpcionesHTTP): Promise<T> {
    // No establecer Content-Type; fetch lo hace automáticamente con boundary
    return this.peticion<T>('POST', url, formData, {
      ...opciones,
      headers: {
        ...opciones?.headers,
        // NO incluir Content-Type
      },
    })
  }

  /**
   * Método privado que realiza la petición HTTP
   */
  private async peticion<T>(
    metodo: MetodoHTTP,
    url: string,
    body?: unknown,
    opciones?: OpcionesHTTP
  ): Promise<T> {
    const timeoutMs = opciones?.timeout || this.timeout

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

    try {
      const esFormData = body instanceof FormData

      const config: RequestInit = {
        method: metodo,
        credentials: 'include', // CRÍTICO: enviar cookies HttpOnly automáticamente
        headers: {
          ...(!esFormData && { 'Content-Type': 'application/json' }),
          ...opciones?.headers,
        },
        body: esFormData ? body : body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
        ...opciones,
      }

      const respuesta = await fetch(url, config)

      clearTimeout(timeoutId)

      // Si es 401 y NO es una ruta de auth, intentar refresh
      if (respuesta.status === 401 && !url.includes('/api/auth/')) {
        const refrescoExitoso = await this.intentarRefresh()

        if (refrescoExitoso) {
          // Reintentar la petición original
          return this.peticion<T>(metodo, url, body, opciones)
        } else {
          // Refresh falló, sesión expirada
          this.notificarExpiracion()
          throw ErrorApi.desdeDTO(
            { mensaje: 'Tu sesión ha expirado', tipo: 'AUTENTICACION', codigo: 'SESION_EXPIRADA' },
            401
          )
        }
      }

      // Respuestas exitosas (2xx)
      if (respuesta.ok) {
        // 204 No Content
        if (respuesta.status === 204) {
          return undefined as unknown as T
        }

        // Intentar parsear JSON
        const texto = await respuesta.text()
        return (texto ? JSON.parse(texto) : undefined) as T
      }

      // Errores del backend (4xx, 5xx)
      await this.manejarErrorHTTP(respuesta)

      // Nunca debería llegar aquí (manejarErrorHTTP siempre lanza)
      throw ErrorApi.desconocido()
    } catch (error) {
      clearTimeout(timeoutId)

      // Si ya es ErrorApi, re-lanzarlo
      if (error instanceof ErrorApi) {
        throw error
      }

      // Error de timeout
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw ErrorApi.red('La petición tardó demasiado. Intenta de nuevo.')
      }

      // Error de red (sin conexión, DNS, etc.)
      if (error instanceof TypeError) {
        throw ErrorApi.red()
      }

      // Cualquier otro error
      throw ErrorApi.desconocido()
    }
  }

  /**
   * Intenta refrescar la sesión con el endpoint /api/auth/refresh
   * Usa un candado para evitar múltiples refreshes simultáneos
   */
  private async intentarRefresh(): Promise<boolean> {
    // Si ya hay un refresh en proceso, esperar a que termine
    if (this.refreshEnProceso) {
      await this.refreshEnProceso
      return true // Asumimos que fue exitoso si no lanzó error
    }

    this.refreshEnProceso = (async () => {
      try {
        const respuesta = await fetch(endpoints.auth.refresh(), {
          method: 'POST',
          credentials: 'include',
        })

        if (!respuesta.ok) {
          this.refreshEnProceso = null
          throw new Error('Refresh falló')
        }

        this.refreshEnProceso = null
      } catch {
        this.refreshEnProceso = null
        throw new Error('Refresh falló')
      }
    })()

    try {
      await this.refreshEnProceso
      return true
    } catch {
      return false
    }
  }

  /**
   * Maneja errores HTTP (4xx, 5xx) convirtiendo ErrorDTO en ErrorApi
   */
  private async manejarErrorHTTP(respuesta: Response): Promise<never> {
    let errorDTO: ErrorDTO

    try {
      const texto = await respuesta.text()
      errorDTO = texto ? JSON.parse(texto) : null
    } catch {
      // El backend no devolvió un JSON válido
      errorDTO = {
        mensaje: `Error ${respuesta.status}: ${respuesta.statusText}`,
        tipo: 'DESCONOCIDO',
      }
    }

    // Si el backend no devolvió ErrorDTO, crear uno genérico
    if (!errorDTO || !errorDTO.mensaje) {
      errorDTO = {
        mensaje: 'Ocurrió un error en el servidor',
        tipo: 'DESCONOCIDO',
        codigo: `HTTP_${respuesta.status}`,
      }
    }

    throw ErrorApi.desdeDTO(errorDTO, respuesta.status)
  }

  /**
   * Notifica que la sesión expiró (invoca callback si está configurado)
   */
  private notificarExpiracion(): void {
    if (this.alExpirarSesion) {
      this.alExpirarSesion()
    }
  }
}

// Exportar instancia singleton
export const httpClient = new HttpClient()
