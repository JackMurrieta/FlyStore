/**
 * Tipos del catálogo de la tienda (CU-01) que consumen las vistas. Ids numéricos como en el backend.
 */

/** Orden del catálogo (Figma S1 «Ordenar por»). */
export type OrdenCatalogoTs = 'RECIENTES' | 'PRECIO_ASC' | 'PRECIO_DESC' | 'NOMBRE_ASC' | 'MAS_VENDIDOS'

/** Esquemas de precio por volumen (enum TipoPrecio del backend). */
export type TipoPrecioTs = 'BASE' | 'EMPRENDEDOR' | 'MAYOREO' | 'DISTRIBUIDOR' | 'SOCIO_COMERCIAL'

export interface LineaTs {
  readonly id: number
  readonly nombre: string
  /** Segmento de la URL: /categoria/{ruta}. */
  readonly ruta: string
  readonly logoUrl: string | null
}

export interface PrecioReferenciaTs {
  readonly tipoPrecio: TipoPrecioTs
  /** «Base», «Mayoreo»… */
  readonly etiqueta: string
  readonly precio: number
  readonly minPiezas: number
}

/** Color con existencia de una tarjeta: su cuadrito cambia la foto de la tarjeta. */
export interface ColorTarjetaTs {
  readonly idColor: number
  readonly nombre: string
  readonly hex: string | null
  /** null: el color no tiene foto propia; la tarjeta pinta el cuadrito con su hex. */
  readonly imagenUrl: string | null
}

export interface ProductoTarjetaTs {
  readonly id: number
  readonly clave: string
  readonly nombre: string
  readonly marca: string
  readonly subcategoria: string
  readonly imagenUrl: string | null
  readonly precio: PrecioReferenciaTs | null
  readonly colores: readonly ColorTarjetaTs[]
}

export interface OpcionFiltroTs {
  readonly id: number
  readonly nombre: string
  readonly cantidad: number
}

export interface MarcaFiltroTs extends OpcionFiltroTs {
  readonly logoUrl: string | null
}

export interface ColorFiltroTs extends OpcionFiltroTs {
  readonly hex: string | null
}

export interface TipoTallaFiltroTs {
  readonly id: number
  readonly nombre: string
  readonly unidadMedida: string | null
  readonly tallas: readonly OpcionFiltroTs[]
}

export interface OrdenOpcionTs {
  readonly valor: OrdenCatalogoTs
  readonly etiqueta: string
}

/** Lo necesario para dibujar los filtros (calculado sobre la línea completa). */
export interface OpcionesFiltroTs {
  readonly marcas: readonly MarcaFiltroTs[]
  readonly subcategorias: readonly OpcionFiltroTs[]
  readonly colores: readonly ColorFiltroTs[]
  readonly tiposTalla: readonly TipoTallaFiltroTs[]
  readonly unidadesMedida: readonly string[]
  readonly precioMinimo: number | null
  readonly precioMaximo: number | null
  readonly ordenes: readonly OrdenOpcionTs[]
}

/** Resultados de la búsqueda por línea («12 coincidencias en Gorras»). */
export interface LineaConteoTs {
  readonly id: number
  readonly nombre: string
  readonly ruta: string
  readonly cantidad: number
}

/** Una página de productos ya convertida para las vistas. */
export interface PaginaCatalogoTs {
  readonly linea: LineaTs | null
  readonly productos: readonly ProductoTarjetaTs[]
  readonly opciones: OpcionesFiltroTs
  readonly pagina: number
  readonly tamanoPagina: number
  readonly total: number
  readonly hayMas: boolean
  readonly tipoPrecioReferencia: TipoPrecioTs
  readonly sugerencias: readonly ProductoTarjetaTs[]
  readonly lineas: readonly LineaConteoTs[]
}
