import { createContext, useContext } from 'react'
import type { ModelosPerfil } from '../aplicacion/ModelosPerfil'

export interface ContextoPerfil {
  readonly modelos: ModelosPerfil
  /** Ruta donde está montado el módulo: «/perfil». */
  readonly rutaBase: string
}

export const ModelosPerfilContext = createContext<ContextoPerfil | null>(null)

/** Acceso a los modelos del perfil. Solo funciona dentro de <EditarPerfil>. */
export function useModelosPerfil(): ContextoPerfil {
  const contexto = useContext(ModelosPerfilContext)
  if (!contexto) throw new Error('useModelosPerfil debe usarse dentro de <EditarPerfil>')
  return contexto
}
