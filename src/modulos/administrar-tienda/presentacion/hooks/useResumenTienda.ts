import { useEffect, useSyncExternalStore } from 'react'
import type { ResumenTiendaModel } from '../../aplicacion/ResumenTiendaModel'

/** Si la última consulta tiene más de un minuto, al entrar se vuelve a pedir. */
const VIGENCIA_MS = 60_000

export function useResumenTienda(model: ResumenTiendaModel) {
  const estado = useSyncExternalStore(model.suscribir, model.obtenerEstado)
  useEffect(() => {
    const { actualizado, cargando } = model.obtenerEstado()
    if (!cargando && (!actualizado || Date.now() - actualizado.getTime() > VIGENCIA_MS)) void model.cargar()
  }, [model])
  return { ...estado, recargar: model.cargar }
}
