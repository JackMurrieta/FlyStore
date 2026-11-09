/**
 * Hook para la vista de registro
 * Patrón ViewModel (MVVM)
 */

import { useState } from 'react'
import type { IAutenticacionService } from '../../dominio/puertos/IAutenticacionService'
import type { SesionModel } from '../../aplicacion/SesionModel'
import type { RegistroTs } from '../../dominio/RegistroTs'
import type { ErrorApi } from '@infraestructura/http/ErrorApi'
import type { ErrorTs } from '@compartido/tipos/ErrorTs'

interface EstadoRegistro {
  readonly cargando: boolean
  readonly error: ErrorTs | null
  readonly exitoso: boolean
}

export function useRegistro(autenticacionService: IAutenticacionService, sesionModel: SesionModel) {
  const [estado, setEstado] = useState<EstadoRegistro>({
    cargando: false,
    error: null,
    exitoso: false,
  })

  /**
   * Registra un nuevo usuario
   */
  const registrar = async (datos: RegistroTs): Promise<boolean> => {
    setEstado({ cargando: true, error: null, exitoso: false })

    try {
      const acceso = await autenticacionService.registro(datos)
      sesionModel.establecerUsuarioAutenticado(acceso)
      setEstado({ cargando: false, error: null, exitoso: true })
      return true
    } catch (error) {
      const errorApi = error as ErrorApi
      setEstado({
        cargando: false,
        error: {
          mensaje: errorApi.message,
          tipo: errorApi.tipo.toLowerCase() as 'validacion' | 'negocio' | 'red' | 'desconocido',
        },
        exitoso: false,
      })
      return false
    }
  }

  /**
   * Registra con Google OAuth
   * Redirige al backend, no es async
   */
  const registrarConGoogle = (redirigir?: string): void => {
    sesionModel.iniciarConGoogle(redirigir)
  }

  /**
   * Limpia el error
   */
  const limpiarError = (): void => {
    setEstado((prev) => ({ ...prev, error: null }))
  }

  return {
    cargando: estado.cargando,
    error: estado.error,
    exitoso: estado.exitoso,
    registrar,
    registrarConGoogle,
    limpiarError,
  }
}
