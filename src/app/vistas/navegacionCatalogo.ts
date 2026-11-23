import { EstadoProducto } from '@modulos/administrar-catalogo/dominio/EstadoProducto'
import type { ConsultaCatalogoTs } from '@modulos/administrar-catalogo'

/** Rutas del CU-03 dentro del panel «Administrar tienda». */
export const RUTAS_CATALOGO = {
  lista: '/admin/catalogo',
  nuevo: '/admin/catalogo/nuevo',
  editar: (idProducto: string) => `/admin/catalogo/${encodeURIComponent(idProducto)}/editar`,
} as const

/** Estado del historial entre el catálogo y el formulario: búsqueda a recuperar y aviso de éxito. */
export interface EstadoNavegacionCatalogo {
  consulta?: ConsultaCatalogoTs
  mensaje?: string
}

export function leerEstadoNavegacion(estado: unknown): EstadoNavegacionCatalogo {
  return typeof estado === 'object' && estado !== null ? estado as EstadoNavegacionCatalogo : {}
}

/** `?estado=BORRADOR` abre el catálogo filtrado (lo usan los pendientes del Inicio del panel). */
export function consultaDesdeUrl(parametros: URLSearchParams): ConsultaCatalogoTs | undefined {
  const estado = Object.values(EstadoProducto).find(valor => valor === parametros.get('estado'))
  return estado ? { pagina: 0, filtros: { texto: '', idCategoria: '', idSubcategoria: '', idMarca: '', estado } } : undefined
}
