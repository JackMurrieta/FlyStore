/**
 * Hook para la vista de inicio de sesión
 * Patrón ViewModel (MVVM)
 */

import { useState } from 'react'
import type { IAutenticacionService } from '../../dominio/puertos/IAutenticacionService'
import type { SesionModel } from '../../aplicacion/SesionModel'
import type { LoginTs } from '../../dominio/LoginTs'
import type { ErrorApi } from '@infraestructura/http/ErrorApi'
import type { ErrorTs } from '@compartido/tipos/ErrorTs'

interface EstadoIniciarSesion {
  readonly cargando: boolean
  readonly error: ErrorTs | null
}

export function useIniciarSesion(
  autenticacionService: IAutenticacionService,
  sesionModel: SesionModel
) {
  const [estado, setEstado] = useState<EstadoIniciarSesion>({
    cargando: false,
    error: null,
  })

  /**
   * Inicia sesión con email y contraseña
   */
  const login = async (credenciales: LoginTs): Promise<boolean> => {
    setEstado({ cargando: true, error: null })

    try {
      const acceso = await autenticacionService.login(credenciales)
      sesionModel.establecerUsuarioAutenticado(acceso)
      setEstado({ cargando: false, error: null })
      return true
    } catch (error) {
      const errorApi = error as ErrorApi
      setEstado({
        cargando: false,
        error: {
          mensaje: errorApi.message,
          tipo: errorApi.tipo.toLowerCase() as 'validacion' | 'negocio' | 'red' | 'desconocido',
        },
      })
      return false
    }
  }

  /**
   * Inicia sesión con Google OAuth
   * Redirige al backend, no es async
   */
  const loginConGoogle = (redirigir?: string): void => {
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
    login,
    loginConGoogle,
    limpiarError,
  }
}
