import { createContext, useContext } from 'react'
import type { ResumenTiendaModel } from '../aplicacion/ResumenTiendaModel'

export interface ModelosPanel {
  readonly resumen: ResumenTiendaModel
}

export const PanelTiendaContext = createContext<ModelosPanel | null>(null)

export function useModelosPanel(): ModelosPanel {
  const modelos = useContext(PanelTiendaContext)
  if (!modelos) throw new Error('useModelosPanel debe usarse dentro de <PanelTienda>')
  return modelos
}
