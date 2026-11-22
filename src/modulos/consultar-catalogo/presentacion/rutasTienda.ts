/** Rutas de la tienda (CU-01). Un solo lugar para armarlas desde tarjetas, migas y el header. */

import { criteriosAParametros } from '../dominio/ReglasCatalogo'
import type { CriteriosBusquedaTs } from '../dominio/CriteriosBusquedaTs'

const conConsulta = (ruta: string, parametros: URLSearchParams): string => {
  const consulta = parametros.toString()
  return consulta ? `${ruta}?${consulta}` : ruta
}

export const rutasTienda = {
  /** B2 · Marcas de la línea. */
  linea: (ruta: string) => `/categoria/${encodeURIComponent(ruta)}`,
  /** B3 · Catálogo de la línea con criterios. */
  productosLinea: (ruta: string, criterios?: CriteriosBusquedaTs) =>
    conConsulta(`/categoria/${encodeURIComponent(ruta)}/productos`, criterios ? criteriosAParametros(criterios) : new URLSearchParams()),
  /** S1 · Búsqueda en toda la tienda (o acotada a una línea). */
  busqueda: (criterios: CriteriosBusquedaTs, linea?: string | null) => {
    const parametros = criteriosAParametros(criterios)
    if (linea) parametros.set('linea', linea)
    return conConsulta('/buscar', parametros)
  },
  /** S2 · Ficha; {@code idColor} abre con el color que se vio en la tarjeta. */
  producto: (id: number, idColor?: number | null, agregarPendiente = false) => {
    const parametros = new URLSearchParams()
    if (idColor) parametros.set('color', String(idColor))
    if (agregarPendiente) parametros.set('agregar', '1')
    return conConsulta(`/producto/${id}`, parametros)
  },
} as const
