import { createContext, useContext } from 'react'
import type { ModelosVenta } from '../aplicacion/ModelosVenta'

export interface ContextoVenta {
  readonly modelos: ModelosVenta
  /** Ruta donde está montado el módulo: «/carrito» en la app, «/dev/gestionar-venta» en el demo. */
  readonly rutaBase: string
}

export const ModelosVentaContext = createContext<ContextoVenta | null>(null)

/** Acceso a los modelos del CU-02. Solo funciona dentro de <GestionarVenta>. */
export function useModelosVenta(): ContextoVenta {
  const contexto = useContext(ModelosVentaContext)
  if (!contexto) throw new Error('useModelosVenta debe usarse dentro de <GestionarVenta>')
  return contexto
}
