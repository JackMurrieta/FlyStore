/**
 * Clase de error que representa errores HTTP del backend
 * Convierte ErrorDTO del backend en un error tipado
 */

import type { ErrorDTO } from '@compartido/contratos/ErrorDTO'

export type TipoErrorApi = 'VALIDACION' | 'NEGOCIO' | 'RED' | 'DESCONOCIDO'

export class ErrorApi extends Error {
  public readonly tipo: TipoErrorApi
  public readonly codigo?: string
  public readonly detalles?: Record<string, string>
  public readonly statusHTTP?: number

  constructor(
    mensaje: string,
    tipo: TipoErrorApi = 'DESCONOCIDO',
    codigo?: string,
    detalles?: Record<string, string>,
    statusHTTP?: number
  ) {
    super(mensaje)
    this.name = 'ErrorApi'
    this.tipo = tipo
    this.codigo = codigo
    this.detalles = detalles
    this.statusHTTP = statusHTTP

    // Mantener stack trace correcto
    Object.setPrototypeOf(this, ErrorApi.prototype)
  }

  /**
   * Crea un ErrorApi desde un ErrorDTO del backend
   */
  static desdeDTO(dto: ErrorDTO, statusHTTP: number): ErrorApi {
    return new ErrorApi(
      dto.mensaje,
      dto.tipo as TipoErrorApi,
      dto.codigo,
      dto.detalles,
      statusHTTP
    )
  }

  /**
   * Crea un ErrorApi para errores de red (sin conexión, timeout)
   */
  static red(mensaje: string = 'Error de conexión. Verifica tu internet.'): ErrorApi {
    return new ErrorApi(mensaje, 'RED', 'ERROR_RED')
  }

  /**
   * Crea un ErrorApi genérico
   */
  static desconocido(mensaje: string = 'Ocurrió un error inesperado. Intenta de nuevo.'): ErrorApi {
    return new ErrorApi(mensaje, 'DESCONOCIDO', 'ERROR_DESCONOCIDO')
  }
}
