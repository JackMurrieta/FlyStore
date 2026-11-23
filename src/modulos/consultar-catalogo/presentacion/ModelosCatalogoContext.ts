import { createContext, useContext } from 'react'
import type { ModelosCatalogo } from '../aplicacion/ModelosCatalogo'

export interface ContextoCatalogo {
  readonly modelos: ModelosCatalogo
}

export const ModelosCatalogoContext = createContext<ContextoCatalogo | null>(null)

/** Acceso a los modelos del catálogo. Solo funciona dentro de <CatalogoTienda>. */
export function useModelosCatalogo(): ContextoCatalogo {
  const contexto = useContext(ModelosCatalogoContext)
  if (!contexto) throw new Error('useModelosCatalogo debe usarse dentro de <CatalogoTienda>')
  return contexto
}
