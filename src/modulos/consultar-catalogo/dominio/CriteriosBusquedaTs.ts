import type { OrdenCatalogoTs } from './CatalogoTs'

/**
 * Búsqueda, filtros y orden del catálogo. Viven en la URL (?marca=1,2&color=3&orden=PRECIO_ASC) para que
 * «Regresar al catálogo» y compartir el enlace conserven todo (Figma S2).
 */
export interface CriteriosBusquedaTs {
  readonly texto: string
  readonly marcas: readonly number[]
  readonly subcategorias: readonly number[]
  readonly tallas: readonly number[]
  readonly colores: readonly number[]
  readonly unidadesMedida: readonly string[]
  readonly precioMin: number | null
  readonly precioMax: number | null
  readonly orden: OrdenCatalogoTs
}

/** Qué catálogo se consulta: una línea o la búsqueda en toda la tienda (opcionalmente acotada a una línea). */
export type DestinoCatalogoTs =
  | { readonly tipo: 'linea'; readonly ruta: string }
  | { readonly tipo: 'busqueda'; readonly linea: string | null }
