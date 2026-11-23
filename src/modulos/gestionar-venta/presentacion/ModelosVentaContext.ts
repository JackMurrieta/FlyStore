import { createContext, useContext } from 'react'
import type { ModelosVenta } from '../aplicacion/ModelosVenta'

export interface ContextoVenta {
  readonly modelos: ModelosVenta
  /** Ruta donde está montado el checkout: «/carrito» en la app, «/dev/gestionar-venta» en el demo. */
  readonly rutaBase: string
  /** Ruta de «Mis pedidos» (S6): «/mis-pedidos» en la app. */
  readonly rutaMisPedidos: string
}

export const ModelosVentaContext = createContext<ContextoVenta | null>(null)

/** Acceso a los modelos del CU-02. Solo funciona dentro de <GestionarVenta> o <MisPedidos>. */
export function useModelosVenta(): ContextoVenta {
  const contexto = useContext(ModelosVentaContext)
  if (!contexto) throw new Error('useModelosVenta debe usarse dentro de <GestionarVenta> o <MisPedidos>')
  return contexto
}
