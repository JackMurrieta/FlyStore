import type { LineaTs, PrecioReferenciaTs, TipoPrecioTs } from './CatalogoTs'

export interface ElementoCatalogoTs {
  readonly id: number
  readonly nombre: string
}

export interface ImagenProductoTs {
  readonly url: string
  /** null = imagen general del producto (se muestra con cualquier color). */
  readonly idColor: number | null
  readonly orden: number
}

/** Variante elegible en la ficha. {@link id} es el varianteProductoId que usa «Agregar al carrito». */
export interface VarianteVentaTs {
  readonly id: number
  readonly sku: string
  readonly idColor: number | null
  readonly color: string
  readonly hex: string | null
  readonly idTalla: number | null
  readonly talla: string | null
  readonly tipoTalla: string | null
  readonly unidadMedida: string | null
  readonly existencia: number
  readonly disponible: boolean
}

export interface NivelPrecioTs {
  readonly tipoPrecio: TipoPrecioTs
  readonly etiqueta: string
  readonly minPiezas: number
  readonly precio: number
  /** Esquema del tipo de cliente (pastilla «Referencia» del Figma). */
  readonly referencia: boolean
}

export interface DetalleProductoTs {
  readonly id: number
  readonly clave: string
  readonly nombre: string
  readonly descripcion: string
  readonly linea: LineaTs
  readonly marca: ElementoCatalogoTs
  readonly subcategoria: ElementoCatalogoTs
  readonly imagenes: readonly ImagenProductoTs[]
  readonly variantes: readonly VarianteVentaTs[]
  /** Ordenados por mínimo de piezas. */
  readonly precios: readonly NivelPrecioTs[]
  readonly precioReferencia: PrecioReferenciaTs
  readonly cantidadInicial: number
  readonly existenciaTotal: number
  readonly disponible: boolean
}

/** Un color de la ficha (agrupa sus variantes). */
export interface ColorDetalleTs {
  readonly idColor: number | null
  readonly nombre: string
  readonly hex: string | null
  /** Alguna de sus tallas tiene existencia. */
  readonly disponible: boolean
}
